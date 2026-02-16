// netlify/functions/send-notif.js
const webpush = require("web-push");
const { google } = require("googleapis");

function getHeader(headers, name) {
  if (!headers) return "";
  const target = name.toLowerCase();
  for (const k of Object.keys(headers)) {
    if (String(k).toLowerCase() === target) return headers[k];
  }
  return "";
}

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getEnv(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
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
  const clientEmail =
    getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL") ||
    getEnv("GOOGLE_CLIENT_EMAIL") ||
    "";

  const privateKeyRaw = getEnv("GOOGLE_PRIVATE_KEY") || "";
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Google service account env belum lengkap.");
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
  );
}

function getVapidPrivate() {
  return (
    getEnv("VAPID_PRIVATE_KEY") ||
    getEnv("VAPID_PRIVATE") ||
    ""
  );
}

async function loadActiveSubs(sheets, spreadsheetId, tab) {
  // Ambil semua data A:E
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A:E`,
  });

  const rows = res.data.values || [];
  // rows[0] = header
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const [endpoint, subJson, createdAt, updatedAt, status] = rows[i] || [];
    if (!endpoint || !subJson) continue;
    if (String(status || "").toLowerCase() === "dead") continue;

    const sub = safeJsonParse(subJson, null);
    if (!sub?.endpoint) continue;

    out.push({
      rowIndex: i + 1, // 1-based
      endpoint,
      sub,
      status: status || "active",
    });
  }
  return out;
}

async function markDead(sheets, spreadsheetId, tab, rowIndex) {
  const now = new Date().toISOString();
  // D=updated_at, E=status
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!D${rowIndex}:E${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [[now, "dead"]] },
  });
}

async function touchActive(sheets, spreadsheetId, tab, rowIndex) {
  const now = new Date().toISOString();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!D${rowIndex}:E${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [[now, "active"]] },
  });
}

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true }) };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "Method Not Allowed" }),
    };
  }

  // AUTH
  const expected = getEnv("ADMIN_TOKEN");
  const provided = getProvidedToken(event.headers);

  if (!expected) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "ADMIN_TOKEN belum diset di Netlify." }),
    };
  }
  if (!provided || provided !== expected) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "Unauthorized" }),
    };
  }

  const spreadsheetId = getEnv("GSHEET_ID");
  const tab = getEnv("GOOGLE_SHEET_TAB", "subs");

  if (!spreadsheetId) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "GSHEET_ID belum diset di Netlify." }),
    };
  }

  // VAPID
  const vapidPublic = getVapidPublic();
  const vapidPrivate = getVapidPrivate();

  if (!vapidPublic || !vapidPrivate) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: "VAPID belum lengkap. Set VAPID_PUBLIC_KEY dan VAPID_PRIVATE_KEY di Netlify.",
      }),
    };
  }

  webpush.setVapidDetails(
    "mailto:admin@layanannusantara.store",
    vapidPublic,
    vapidPrivate
  );

  // Body notif
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

  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const subs = await loadActiveSubs(sheets, spreadsheetId, tab);

    if (subs.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: true,
          sent: 0,
          failed: 0,
          remaining: 0,
          note: "Belum ada subscriber aktif di sheet subs. Pastikan user sudah klik 'Aktifkan Notifikasi'.",
        }),
      };
    }

    let ok = 0;
    let fail = 0;
    let dead = 0;

    for (const item of subs) {
      try {
        await webpush.sendNotification(item.sub, payload);
        ok++;
        await touchActive(sheets, spreadsheetId, tab, item.rowIndex);
      } catch (e) {
        fail++;
        const code = e?.statusCode;

        // 410/404 = subscription mati
        if (code === 410 || code === 404) {
          dead++;
          await markDead(sheets, spreadsheetId, tab, item.rowIndex);
        }
      }
    }

    // remaining = jumlah aktif setelah update
    const subsAfter = await loadActiveSubs(sheets, spreadsheetId, tab);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        sent: ok,
        failed: fail,
        dead,
        remaining: subsAfter.length,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: "Gagal kirim notif",
        detail: String(err?.message || err),
      }),
    };
  }
};
