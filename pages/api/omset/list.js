import { google } from "googleapis";

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const sheets = getSheets();

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "omset!A:E",
    });

    const values = resp.data.values || [];
    if (values.length <= 1) return res.status(200).json({ rows: [] });

    // buang header
    const rows = values.slice(1);

    const data = rows
      .filter((r) => r && r.length)
      .map((r, idx) => ({
        id: idx + 1,
        tanggal: r[0] || "",
        nama: r[1] || "",
        layanan: r[2] || "",
        metode: r[3] || "",
        pemasukan: Number(String(r[4] || "0").replace(/[^\d]/g, "")) || 0,
      }))
      .reverse(); // terbaru di atas

    return res.status(200).json({ rows: data });
  } catch (err) {
    console.error("LIST ERROR:", err);
    return res.status(500).json({ message: err.message || "Gagal ambil data" });
  }
}
