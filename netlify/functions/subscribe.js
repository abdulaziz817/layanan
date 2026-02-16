// netlify/functions/subscribe.js
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

function getGoogleAuth() {
  const clientEmail =
    getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL") ||
    getEnv("GOOGLE_CLIENT_EMAIL") ||
    getEnv("GOOGLE_SERVICE_ACCOUNT") ||
    "";

  const privateKeyRaw =
    getEnv("GOOGLE_PRIVATE_KEY") ||
    getEnv("GOOGLE_PRIVATEKEY") ||
    "";

  // penting: Netlify biasanya simpan newline sebagai \n
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

async function ensureHeaderRow(sheets, spreadsheetId, tab) {
  // Pastikan header ada (kalau sheet masih kosong)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A1:E1`,
  });

  const row = res.data.values?.[0] || [];
  const want = ["endpoint", "subscription_json", "created_at", "updated_at", "status"];

  const same =
    row.length >= want.length && want.every((h, i) => String(row[i] || "").trim() === h);

  if (!same) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab}!A1:E1`,
      valueInputOption: "RAW",
      requestBody: { values: [want] },
    });
  }
}

async function findRowByEndpoint(sheets, spreadsheetId, tab, endpoint) {
  // ambil semua endpoint kolom A
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A:A`,
  });

  const values = res.data.values || [];
  // values[0] adalah header
  for (let i = 1; i < values.length; i++) {
    if (values[i]?.[0] === endpoint) {
      // row index di sheet (1-based)
      return i + 1;
    }
  }
  return null;
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

  const spreadsheetId = getEnv("GSHEET_ID");
  const tab = getEnv("GOOGLE_SHEET_TAB", "subs");

  if (!spreadsheetId) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "GSHEET_ID belum diset di Netlify." }),
    };
  }

  const sub = safeJsonParse(event.body || "{}", null);

  // validasi minimal
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: "Subscription tidak valid (butuh endpoint + keys.p256dh + keys.auth).",
      }),
    };
  }

  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    await ensureHeaderRow(sheets, spreadsheetId, tab);

    const endpoint = sub.endpoint;
    const now = new Date().toISOString();
    const subJson = JSON.stringify(sub);

    const foundRow = await findRowByEndpoint(sheets, spreadsheetId, tab, endpoint);

    if (foundRow) {
      // update existing
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tab}!B${foundRow}:E${foundRow}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[subJson, "", now, "active"]], // B=subjson, C=created_at (biarin kosong), D=updated_at, E=status
        },
      });

      // kalau created_at kosong, isi sekali
      const createdRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${tab}!C${foundRow}:C${foundRow}`,
      });
      const createdVal = createdRes.data.values?.[0]?.[0] || "";
      if (!createdVal) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${tab}!C${foundRow}:C${foundRow}`,
          valueInputOption: "RAW",
          requestBody: { values: [[now]] },
        });
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true, added: false, updated: true }),
      };
    }

    // insert new (append)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tab}!A:E`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[endpoint, subJson, now, now, "active"]],
      },
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ok: true, added: true, updated: false }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: "Gagal simpan subscribe ke Google Sheet",
        detail: String(err?.message || err),
      }),
    };
  }
};
