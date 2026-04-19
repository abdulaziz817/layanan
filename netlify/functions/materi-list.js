const { google } = require("googleapis");

exports.handler = async function (event) {
  try {
    const kelas_slug = event.queryStringParameters?.kelas_slug;

    if (!kelas_slug) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          error: "kelas_slug wajib diisi",
        }),
      };
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!privateKey) {
      throw new Error("GOOGLE_PRIVATE_KEY tidak ditemukan");
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL tidak ditemukan");
    }

    if (!process.env.GOOGLE_SHEETS_ID_KELAS) {
      throw new Error("GOOGLE_SHEETS_ID_KELAS tidak ditemukan");
    }

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

    const data = rows
      .map((row) => ({
        id: row[0] || "",
        kelas_slug: row[1] || "",
        judul: row[2] || "",
        deskripsi: row[3] || "",
        content: row[4] || "",
        pdf_url: row[5] || "",
      }))
      .filter((item) => item.kelas_slug === kelas_slug);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data }),
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