// netlify/functions/subscribe.js
const { google } = require("googleapis");

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

async function findRowByEndpoint(sheets, spreadsheetId, tabName, endpoint) {
  // baca kolom A (endpoint)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:A`,
  });

  const values = res.data.values || [];
  // values[0] biasanya header. data mulai dari index 1.
  for (let i = 1; i < values.length; i++) {
    const cell = values[i]?.[0];
    if (cell === endpoint) {
      return i + 1; // karena sheet row dimulai dari 1
    }
  }
  return null;
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

    const sub = safeJsonParse(event.body || "{}", null);

    // validasi minimal push subscription
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          ok: false,
          error: "Subscription tidak valid (butuh endpoint + keys.p256dh + keys.auth)",
        }),
      };
    }

    const spreadsheetId = mustEnv("GSHEET_ID");
    const tabName = mustEnv("GOOGLE_SHEET_TAB"); // "subs"

    const sheets = await getSheetsClient();

    // Pastikan header ada (kalau sheet masih kosong)
    // Header: endpoint | subscription_json | created_at | updated_at | status
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A1:E1`,
    });

    const headerRow = (headerCheck.data.values && headerCheck.data.values[0]) || [];
    if (headerRow.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tabName}!A1:E1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [["endpoint", "subscription_json", "created_at", "updated_at", "status"]],
        },
      });
    }

    const endpoint = sub.endpoint;
    const subJson = JSON.stringify(sub);
    const timeNow = nowISO();

    const existingRow = await findRowByEndpoint(sheets, spreadsheetId, tabName, endpoint);

    if (existingRow) {
      // update row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tabName}!A${existingRow}:E${existingRow}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[endpoint, subJson, "", timeNow, "active"]],
        },
      });

      // kalau created_at kosong, biarin. (opsional: kamu bisa baca row dulu kalau mau rapih)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, added: false, updated: true }),
      };
    }

    // append baru
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A:E`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[endpoint, subJson, timeNow, timeNow, "active"]],
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, added: true, updated: false }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: String(err?.message || err),
      }),
    };
  }
};
