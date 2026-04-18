const { google } = require("googleapis");

exports.handler = async function (event) {
  try {
    const id = event.queryStringParameters?.id;

    const privateKey = Buffer.from(
      process.env.GOOGLE_PRIVATE_KEY_BASE64,
      "base64"
    ).toString("utf8");

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    await auth.authorize();

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID_KELAS,
      range: "materi!A2:F",
    });

    const rows = response.data.values || [];

    const materi = rows
      .map((row) => ({
        id: row[0] || "",
        kelas_slug: row[1] || "",
        judul: row[2] || "",
        deskripsi: row[3] || "",
        content: row[4] || "",
        pdf_url: row[5] || "",
      }))
      .find((item) => String(item.id) === String(id));

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data: materi || null }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message,
        details: err.response?.data || null,
      }),
    };
  }
};