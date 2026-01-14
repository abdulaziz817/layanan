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

    const rows = (res.data.values || []).slice(1).reverse().slice(0, 20);

    const mapped = rows.map((r, i) => ({
      id: i + 1,
      tanggal: r[0],
      nama: r[1],
      layanan: r[2],
      metode: r[3],
      pemasukan: Number(r[4] || 0),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ rows: mapped }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
