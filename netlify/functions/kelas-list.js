const { google } = require("googleapis");

exports.handler = async function () {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID_KELAS,
      range: "kelas!A2:C",
    });

    const rows = res.data.values || [];

    const data = rows.map((row) => ({
      slug: row[0],
      nama_kelas: row[1],
      status_buka: row[2] === "true",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};