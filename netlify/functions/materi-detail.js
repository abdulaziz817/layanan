const { google } = require("googleapis");

exports.handler = async function (event) {
  try {
    const id = event.queryStringParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          error: "Parameter id wajib diisi",
        }),
      };
    }

    // ✅ pakai private key biasa (bukan base64)
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
      range: "materi!A2:AE",
    });

    const rows = response.data.values || [];

    const data = rows.map((row) => ({
      id: row[0] || "",
      kelas_slug: row[1] || "",
      judul: row[2] || "",
      deskripsi: row[3] || "",
      cover_image: row[4] || "",
      badge: row[5] || "",
      level: row[6] || "",
      durasi: row[7] || "",
      fokus: row[8] || "",
      intro: row[9] || "",
      highlight: row[10] || "",
      section1_title: row[11] || "",
      section1_content: row[12] || "",
      section2_title: row[13] || "",
      section2_content: row[14] || "",
      section3_title: row[15] || "",
      section3_content: row[16] || "",
      image1: row[17] || "",
      card1_title: row[18] || "",
      card1_desc: row[19] || "",
      card2_title: row[20] || "",
      card2_desc: row[21] || "",
      card3_title: row[22] || "",
      card3_desc: row[23] || "",
      card4_title: row[24] || "",
      card4_desc: row[25] || "",
      summary1: row[26] || "",
      summary2: row[27] || "",
      summary3: row[28] || "",
      summary4: row[29] || "",
      pdf_url: row[30] || "",
    }));

    const materi = data.find((item) => String(item.id) === String(id));

    if (!materi) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          ok: false,
          error: "Materi tidak ditemukan",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: materi,
      }),
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