import { google } from "googleapis";

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthISO() {
  return todayISO().slice(0, 7); // YYYY-MM
}

function yearISO() {
  return todayISO().slice(0, 4); // YYYY
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
    if (values.length <= 1) {
      return res.status(200).json({
        today: 0, month: 0, year: 0, transaksi_today: 0, transaksi_month: 0, transaksi_year: 0, transaksi_total: 0,
      });
    }

    const rows = values.slice(1);

    const t = todayISO();
    const m = monthISO();
    const y = yearISO();

    let today = 0, month = 0, year = 0;
    let transaksi_today = 0, transaksi_month = 0, transaksi_year = 0, transaksi_total = 0;

    for (const r of rows) {
      const tanggal = (r?.[0] || "").trim();
      const pemasukan = Number(String(r?.[4] || "0").replace(/[^\d]/g, "")) || 0;

      if (!tanggal) continue;
      transaksi_total += 1;

      if (tanggal === t) {
        today += pemasukan;
        transaksi_today += 1;
      }
      if (tanggal.slice(0, 7) === m) {
        month += pemasukan;
        transaksi_month += 1;
      }
      if (tanggal.slice(0, 4) === y) {
        year += pemasukan;
        transaksi_year += 1;
      }
    }

    return res.status(200).json({
      today, month, year,
      transaksi_today, transaksi_month, transaksi_year, transaksi_total
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    return res.status(500).json({ message: err.message || "Gagal hitung summary" });
  }
}
