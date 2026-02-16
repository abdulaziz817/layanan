// netlify/functions/subscribe.js
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

function getGoogleAuth() {
  const clientEmail =
    getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL") || getEnv("GOOGLE_CLIENT_EMAIL");

  // Netlify biasanya nyimpen newline sebagai \n, jadi kita balikin ke newline asli
  const privateKeyRaw =
    getEnv("GOOGLE_PRIVATE_KEY") || getEnv("GOOGLE_PRIVATEKEY");
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

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
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

  const sub = safeJsonParse(event.body || "{}", null);

  // validasi minimal subscription
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "Bad Request: subscription tidak valid (butuh endpoint + keys.p256dh + keys.auth)",
      }),
    };
  }

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

    const now = new Date().toISOString();
    const endpoint = sub.endpoint;
    const subJson = JSON.stringify(sub);

    // Ambil semua endpoint yang sudah ada (kolom A)
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tab}!A2:A`,
    });

    const rows = readRes.data.values || [];
    let foundRowIndex = -1; // index row di "values" (mulai 0 untuk A2)

    for (let i = 0; i < rows.length; i++) {
      if ((rows[i]?.[0] || "").trim() === endpoint) {
        foundRowIndex = i;
        break;
      }
    }

    if (foundRowIndex >= 0) {
      // Update row existing: B, D, E
      const sheetRowNumber = foundRowIndex + 2; // karena mulai dari A2
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tab}!B${sheetRowNumber}:E${sheetRowNumber}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[subJson, "", now, "active"]], // C (created_at) kita biarin kosong biar tidak nimpah (opsional)
        },
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, added: false, updated: true }),
      };
    }

    // Append row baru
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
      headers,
      body: JSON.stringify({ ok: true, added: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "Gagal simpan subscription ke Google Sheet",
        detail: String(err?.message || err),
      }),
    };
  }
};
