const { google } = require("googleapis");

exports.handler = async function (event) {
  try {
    const id = event.queryStringParameters.id;

    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID_KELAS,
      range: "materi!A2:F",
    });

    const rows = res.data.values || [];

    const materi = rows
      .map((row) => ({
        id: row[0],
        kelas_slug: row[1],
        judul: row[2],
        deskripsi: row[3],
        content: row[4],
        pdf_url: row[5],
      }))
      .find((m) => String(m.id) === String(id));

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data: materi }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};