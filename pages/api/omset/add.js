import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      tanggal,
      nama,
      layanan,
      metode,
      pemasukan,
    } = req.body;

    // 🔎 Debug env (lihat di terminal)
    console.log("SHEETS_ID:", process.env.GOOGLE_SHEETS_ID);
    console.log("EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log("KEY EXISTS:", !!process.env.GOOGLE_PRIVATE_KEY);

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "omset!A:E", // ⬅️ PASTIKAN TAB NAMANYA "omset"
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          tanggal,
          nama,
          layanan,
          metode,
          pemasukan,
        ]],
      },
    });

    return res.status(200).json({ message: "Omset tersimpan" });
  } catch (err) {
    console.error("ERROR ADD OMSET:", err);
    return res.status(500).json({
      message: err.message || "Gagal simpan omset",
    });
  }
}
