// netlify/functions/materi-list.js
export default function Page() {
  return <div>netlify/functions/materi-list.js</div>;
}
const { google } = require("googleapis");

exports.handler = async function (event) {
  try {
    const kelas_slug = event.queryStringParameters.kelas_slug;

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

    const data = rows
      .map((row) => ({
        id: row[0],
        kelas_slug: row[1],
        judul: row[2],
        deskripsi: row[3],
        content: row[4],
        pdf_url: row[5],
      }))
      .filter((m) => m.kelas_slug === kelas_slug);

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