// netlify/functions/subscribe.js
// ✅ Simpan subscription ke Google Sheet (tab: subs)
// ✅ Anti dobel (cek endpoint)
// ✅ CORS aman
// ✅ Format GOOGLE_PRIVATE_KEY auto handle \n

const { google } = require("googleapis");

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function getPrivateKey() {
  const raw = getEnv("GOOGLE_PRIVATE_KEY", "");
  // Netlify biasanya nyimpan newline sebagai \n
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

async function getSheetsClient() {
  const clientEmail =
    getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL") || getEnv("GOOGLE_CLIENT_EMAIL"); // jaga-jaga nama env beda
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    throw new Error("ENV Google Service Account belum lengkap (email/private key).");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function readAllSubs(sheets, spreadsheetId, tabName) {
  // Ambil kolom A:B -> [endpoint, subscription_json]
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:B`,
  });

  const rows = res.data.values || [];
  // skip header kalau ada
  const data = rows.filter((r, idx) => {
    if (idx === 0 && (r?.[0] || "").toLowerCase() === "endpoint") return false;
    return true;
  });

  return data; // array of [endpoint, jsonString]
}

async function appendSub(sheets, spreadsheetId, tabName, endpoint, subJson) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A:B`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[endpoint, subJson]],
    },
  });
}

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Preflight
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

  const sub = safeJsonParse(event.body || "{}", null);

  // Validasi minimal subscription Web Push
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: "Bad Request: subscription tidak valid (butuh endpoint + keys.p256dh + keys.auth)",
      }),
    };
  }

  const SPREADSHEET_ID = getEnv("GSHEET_ID"); // kamu sudah punya ini
  const TAB_NAME = getEnv("GOOGLE_SHEET_TAB", "subs"); // default subs

  if (!SPREADSHEET_ID) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "ENV GSHEET_ID belum diisi." }),
    };
  }

  try {
    const sheets = await getSheetsClient();

    // cek sudah ada belum (anti dobel)
    const rows = await readAllSubs(sheets, SPREADSHEET_ID, TAB_NAME);
    const exists = rows.some((r) => r?.[0] === sub.endpoint);

    if (exists) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true, added: false, note: "Sudah subscribe (endpoint sudah ada)." }),
      };
    }

    await appendSub(sheets, SPREADSHEET_ID, TAB_NAME, sub.endpoint, JSON.stringify(sub));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ok: true, added: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: "Gagal simpan subscriber ke Google Sheet",
        detail: String(err?.message || err),
      }),
    };
  }
};
