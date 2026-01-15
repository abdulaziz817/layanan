const { google } = require("googleapis");

function requireAdmin(context) {
  const user = context && context.clientContext && context.clientContext.user;

  if (!user) {
    return {
      ok: false,
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized: login dulu" }),
    };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.email;

  if (!adminEmail) {
    return {
      ok: false,
      statusCode: 500,
      body: JSON.stringify({ error: "Server misconfig: ADMIN_EMAIL belum di-set" }),
    };
  }

  if (!userEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    return {
      ok: false,
      statusCode: 403,
      body: JSON.stringify({ error: "Forbidden: bukan admin" }),
    };
  }

  return { ok: true, user };
}

exports.handler = async (event, context) => {
  // 🔒 Guard admin
  const authz = requireAdmin(context);
  if (!authz.ok) return authz;

  // Hanya POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // ✅ Validasi basic
    const tanggal = String(body.tanggal || "").trim();
    const nama = String(body.nama || "").trim();
    const layanan = String(body.layanan || "").trim();
    const metode = String(body.metode || "").trim();

    // pemasukan: angka
    const pemasukanNum = Number(body.pemasukan);

    if (!tanggal || !nama || !layanan || !metode) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Field wajib: tanggal, nama, layanan, metode",
        }),
      };
    }

    if (!Number.isFinite(pemasukanNum) || pemasukanNum < 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "pemasukan harus angka >= 0",
        }),
      };
    }

    const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY || "";
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GSHEET_ID,
      range: "Omset!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[tanggal, nama, layanan, metode, pemasukanNum]],
      },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
