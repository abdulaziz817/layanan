const { google } = require("googleapis");

exports.handler = async () => {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
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
      const tanggal = r[0];
      const pemasukan = Number(r[4] || 0);

      if (tanggal === todayStr) {
        today += pemasukan;
        transaksi_today++;
      }
      if (tanggal?.startsWith(monthStr)) {
        month += pemasukan;
        transaksi_month++;
      }
      if (tanggal?.startsWith(yearStr)) {
        year += pemasukan;
        transaksi_year++;
      }
    });

    return {
      statusCode: 200,
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
      body: JSON.stringify({ error: e.message }),
    };
  }
};
