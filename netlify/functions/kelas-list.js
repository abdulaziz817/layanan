const { google } = require("googleapis");

exports.handler = async function () {
  try {
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
      range: "kelas!A2:C",
    });

    const rows = response.data.values || [];

    const data = rows.map((row) => ({
      slug: row[0] || "",
      nama_kelas: row[1] || "",
      status_buka: String(row[2] || "").toLowerCase() === "true",
    }));

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