const { google } = require("googleapis");

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body);

    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID_KELAS,
      range: "progress!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            body.user_id,
            body.kelas_slug,
            body.materi_id,
            body.status,
          ],
        ],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};