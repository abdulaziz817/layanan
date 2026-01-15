// netlify/functions/omset-series.js
const { google } = require("googleapis");

function requireAdmin(context) {
  const user = context && context.clientContext && context.clientContext.user;

  if (!user) {
    return {
      ok: false,
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized: login dulu" }),
    };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.email;

  if (!adminEmail) {
    return {
      ok: false,
      statusCode: 500,
      body: JSON.stringify({ error: "Server misconfig: ADMIN_EMAIL belum di-set" }),
    };
  }

  if (!userEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    return {
      ok: false,
      statusCode: 403,
      body: JSON.stringify({ error: "Forbidden: bukan admin" }),
    };
  }

  return { ok: true, user };
}

exports.handler = async (event, context) => {
  // 🔒 Guard admin
  const authz = requireAdmin(context);
  if (!authz.ok) {
    return {
      statusCode: authz.statusCode,
      headers: { "Content-Type": "application/json" },
      body: authz.body,
    };
  }

  try {
    // (opsional) batasi hanya GET
    if (event.httpMethod && event.httpMethod !== "GET") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY || "";
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GSHEET_ID,
      range: "Omset!A:E",
    });

    const all = res.data.values || [];
    const rows = all.slice(1); // skip header

    // kumpulin total per tanggal
    const map = new Map(); // tanggal => total
    for (const r of rows) {
      const tanggal = String(r[0] || "").trim();
      const pemasukan = Number(r[4] || 0);
      if (!tanggal) continue;
      map.set(tanggal, (map.get(tanggal) || 0) + (Number.isFinite(pemasukan) ? pemasukan : 0));
    }

    // sort by tanggal asc
    const out = Array.from(map.entries())
      .map(([tanggal, total]) => ({ tanggal, total }))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    // ambil 30 data terakhir
    const last30 = out.slice(-30);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: last30 }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
