// netlify/functions/send-notif.js
const { google } = require("googleapis");
const webpush = require("web-push");

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`ENV ${name} belum diset di Netlify`);
  return v;
}

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getHeader(headers, name) {
  if (!headers) return "";
  const target = name.toLowerCase();
  for (const k of Object.keys(headers)) {
    if (String(k).toLowerCase() === target) return headers[k];
  }
  return "";
}

function getProvidedToken(headers) {
  const xToken = String(getHeader(headers, "x-admin-token") || "").trim();

  const auth = String(getHeader(headers, "authorization") || "").trim();
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";

  return bearer || xToken || "";
}

function getGoogleAuth() {
  const email = mustEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const key = mustEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheetsClient() {
  const auth = getGoogleAuth();
  await auth.authorize();
  return google.sheets({ version: "v4", auth });
}

function nowISO() {
  return new Date().toISOString();
}

function getVapidPublic() {
  return String(process.env.VAPID_PUBLIC_KEY || "").trim();
}

function getVapidPrivate() {
  return String(process.env.VAPID_PRIVATE_KEY || "").trim();
}

exports.handler = async (event) => {
  const headers = cors();

  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ ok: false, error: "Method Not Allowed" }),
      };
    }

    // AUTH
    const expected = String(process.env.ADMIN_TOKEN || "").trim();
    const provided = getProvidedToken(event.headers);

    if (!expected) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: "ADMIN_TOKEN belum diset di Netlify" }),
      };
    }
    if (!provided || provided !== expected) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ ok: false, error: "Unauthorized" }),
      };
    }

    // VAPID
    const vapidPublic = getVapidPublic();
    const vapidPrivate = getVapidPrivate();

    if (!vapidPublic || !vapidPrivate) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          ok: false,
          error: "VAPID key belum lengkap. Isi VAPID_PUBLIC_KEY dan VAPID_PRIVATE_KEY di Netlify.",
        }),
      };
    }

    webpush.setVapidDetails(
      "mailto:admin@layanannusantara.store",
      vapidPublic,
      vapidPrivate
    );

    // body request
    const bodyObj = safeJsonParse(event.body || "{}", {});
    const title = bodyObj.title || "Layanan Nusantara";
    const msg = bodyObj.body || "Ada promo terbaru!";
    const url = bodyObj.url || "/";
    const icon = bodyObj.icon || "/icon-192.png";
    const badge = bodyObj.badge || "/icon-192.png";
    const image = bodyObj.image || "/cta-image.jpg";
    const tag = bodyObj.tag || "ln-broadcast";

    const payload = JSON.stringify({ title, body: msg, url, icon, badge, image, tag });

    // Read subs from sheet
    const spreadsheetId = mustEnv("GSHEET_ID");
    const tabName = mustEnv("GOOGLE_SHEET_TAB"); // subs

    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A2:E`,
    });

    const rows = res.data.values || [];
    if (rows.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, sent: 0, failed: 0, remaining: 0, note: "Belum ada subscriber di sheet." }),
      };
    }

    let sent = 0;
    let failed = 0;

    // kita catat row mana yang mati, lalu update statusnya di sheet
    const deadRowUpdates = [];

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const endpoint = row?.[0];
      const subJson = row?.[1];
      const status = String(row?.[4] || "").toLowerCase();

      // skip yang dead
      if (status === "dead") continue;
      if (!endpoint || !subJson) continue;

      const sub = safeJsonParse(subJson, null);
      if (!sub?.endpoint) continue;

      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e) {
        failed++;
        const code = e?.statusCode;

        // 410/404 = subscription mati → tandai dead di sheet
        if (code === 410 || code === 404) {
          const rowNumber = idx + 2; // karena mulai dari A2
          deadRowUpdates.push(rowNumber);
        }
      }
    }

    // update dead rows (set updated_at + status=dead)
    if (deadRowUpdates.length > 0) {
      const t = nowISO();
      for (const rowNumber of deadRowUpdates) {
        // kolom D (updated_at) dan E (status)
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${tabName}!D${rowNumber}:E${rowNumber}`,
          valueInputOption: "RAW",
          requestBody: { values: [[t, "dead"]] },
        });
      }
    }

    // hitung remaining (aktif)
    const afterRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!E2:E`,
    });
    const statuses = afterRes.data.values || [];
    const remaining = statuses.filter((s) => String(s?.[0] || "").toLowerCase() !== "dead").length;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, sent, failed, remaining }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: String(err?.message || err) }),
    };
  }
};
