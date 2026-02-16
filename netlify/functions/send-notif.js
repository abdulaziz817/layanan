// netlify/functions/send-notif.js
const webpush = require("web-push");
const { google } = require("googleapis");

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getEnv(name, fallback = "") {
  return (process.env[name] || fallback || "").toString().trim();
}

function getHeader(headers, name) {
  if (!headers) return "";
  const lower = name.toLowerCase();
  for (const k of Object.keys(headers)) {
    if (String(k).toLowerCase() === lower) return headers[k];
  }
  return "";
}

function getProvidedToken(headers) {
  const xToken = String(getHeader(headers, "x-admin-token") || "").trim();
  const auth = String(getHeader(headers, "authorization") || "").trim();
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  return bearer || xToken || "";
}

function getGoogleAuth() {
  const clientEmail =
    getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL") || getEnv("GOOGLE_CLIENT_EMAIL");

  const privateKeyRaw = getEnv("GOOGLE_PRIVATE_KEY");
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKeyRaw) {
    throw new Error("Google ENV belum lengkap: GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY");
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getVapidPublic() {
  return (
    getEnv("VAPID_PUBLIC_KEY") ||
    getEnv("NEXT_PUBLIC_VAPID_PUBLIC") ||
    getEnv("VAPID_PUBLIC") ||
    ""
  ).trim();
}

function getVapidPrivate() {
  return (
    getEnv("VAPID_PRIVATE_KEY") ||
    getEnv("VAPID_PRIVATE") ||
    getEnv("VAPID_PRIVATEKEY") ||
    ""
  ).trim();
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

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
  const expected = getEnv("ADMIN_TOKEN");
  const provided = getProvidedToken(event.headers);

  if (!expected) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: "ENV ADMIN_TOKEN belum diset di Netlify." }),
    };
  }
  if (!provided || provided !== expected) {
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Unauthorized" }) };
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
        error: "VAPID key belum lengkap. Set VAPID_PUBLIC_KEY dan VAPID_PRIVATE_KEY.",
      }),
    };
  }

  webpush.setVapidDetails("mailto:admin@layanannusantara.store", vapidPublic, vapidPrivate);

  // Payload
  const bodyObj = safeJsonParse(event.body || "{}", {});
  const {
    title = "Layanan Nusantara",
    body = "Ada promo terbaru!",
    url = "/",
    icon = "/icon-192.png",
    badge = "/icon-192.png",
    image = "/cta-image.jpg",
    tag = "ln-broadcast",
  } = bodyObj || {};

  const payload = JSON.stringify({ title, body, url, icon, badge, image, tag });

  // Google Sheet ambil semua subscription_json
  const spreadsheetId = getEnv("GSHEET_ID") || getEnv("GOOGLE_SHEET_ID");
  const tab = getEnv("GOOGLE_SHEET_TAB", "subs");

  if (!spreadsheetId) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: "ENV GSHEET_ID belum diset." }),
    };
  }

  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Ambil endpoint+sub_json+status
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tab}!A2:E`,
    });

    const rows = res.data.values || [];
    if (!rows.length) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, sent: 0, failed: 0, note: "Belum ada subscriber di sheet." }),
      };
    }

    let sent = 0;
    let failed = 0;
    const deadRowNumbers = []; // row number sheet yang subscription mati (410/404)

    for (let i = 0; i < rows.length; i++) {
      const endpoint = (rows[i]?.[0] || "").trim();
      const subJson = rows[i]?.[1] || "";
      const status = (rows[i]?.[4] || "active").trim();

      if (!endpoint || !subJson) continue;
      if (status && status.toLowerCase() === "dead") continue;

      const sub = safeJsonParse(subJson, null);
      if (!sub?.endpoint) continue;

      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e) {
        failed++;
        const code = e?.statusCode;

        // 410/404 = subscription mati → tandai dead
        if (code === 410 || code === 404) {
          const sheetRowNumber = i + 2; // karena mulai dari row2
          deadRowNumbers.push(sheetRowNumber);
        }
      }
    }

    // Tandai yang dead di kolom E (status) biar gak dipake lagi
    if (deadRowNumbers.length) {
      const now = new Date().toISOString();
      // Update per row (simple tapi aman)
      for (const r of deadRowNumbers) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${tab}!D${r}:E${r}`,
          valueInputOption: "RAW",
          requestBody: { values: [[now, "dead"]] },
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        sent,
        failed,
        totalRows: rows.length,
        deadMarked: deadRowNumbers.length,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "Gagal kirim notif (send-notif)",
        detail: String(err?.message || err),
      }),
    };
  }
};
