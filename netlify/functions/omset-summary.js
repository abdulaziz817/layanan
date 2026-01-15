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

    const rows = res.data.values || [];
    const data = rows.slice(1);

    const todayStr = new Date().toISOString().slice(0, 10);
    const monthStr = todayStr.slice(0, 7);
    const yearStr = todayStr.slice(0, 4);

    let today = 0,
      month = 0,
      year = 0;
    let transaksi_today = 0,
      transaksi_month = 0,
      transaksi_year = 0,
      transaksi_total = data.length;

    data.forEach((r) => {
      const tanggal = String(r[0] || "").trim();
      const pemasukan = Number(r[4] || 0);

      if (tanggal === todayStr) {
        today += pemasukan;
        transaksi_today++;
      }
      if (tanggal.startsWith(monthStr)) {
        month += pemasukan;
        transaksi_month++;
      }
      if (tanggal.startsWith(yearStr)) {
        year += pemasukan;
        transaksi_year++;
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        today,
        month,
        year,
        transaksi_today,
        transaksi_month,
        transaksi_year,
        transaksi_total,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
