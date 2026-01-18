import { google } from "googleapis";

export async function handler(event, context) {
  try {
    // hanya POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    // wajib login identity (karena frontend kamu pakai jwt)
    const user = context.clientContext?.user;
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized (login dulu)" }),
      };
    }

    // body
    const { id } = JSON.parse(event.body || "{}");
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "id wajib" }) };
    }

    // env
    const spreadsheetId = process.env.GSHEET_ID; // dari URL sheets /d/<ID>/
    const sheetName = process.env.GSHEET_TAB || "ulasan"; // nama tab bawah
    const sheetIdNum = Number(process.env.GSHEET_SHEET_ID); // angka gid

    const clientEmail = process.env.GSERVICE_CLIENT_EMAIL;
    let privateKey = process.env.GSERVICE_PRIVATE_KEY;

    if (!spreadsheetId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GSHEET_ID belum diset" }),
      };
    }
    if (!Number.isFinite(sheetIdNum)) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GSHEET_SHEET_ID belum benar (harus angka gid)" }),
      };
    }
    if (!clientEmail || !privateKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Service account env belum lengkap" }),
      };
    }

    // Netlify env sering menyimpan newline jadi \n, harus direplace
    privateKey = privateKey.replace(/\\n/g, "\n");

    // auth service account
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // baca data sheet: asumsi kolom A adalah id, baris 1 header
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const values = readRes.data.values || [];

    // kalau cuma header / kosong
    if (values.length <= 1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Sheet kosong atau hanya header" }),
      };
    }

    // cari row yang kolom A == id (mulai index 1 karena 0 header)
    let foundRowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      const row = values[i] || [];
      if (String(row[0] || "") === String(id)) {
        foundRowIndex = i; // 0-based index
        break;
      }
    }

    if (foundRowIndex === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "ID tidak ditemukan di spreadsheet" }),
      };
    }

    // hapus baris di sheet (deleteDimension pakai index 0-based)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetIdNum,
                dimension: "ROWS",
                startIndex: foundRowIndex,
                endIndex: foundRowIndex + 1,
              },
            },
          },
        ],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("ulasan-delete error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", detail: err.message }),
    };
  }
}
