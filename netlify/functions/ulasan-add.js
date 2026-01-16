exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const nama = String(body.nama || "").trim();
    const rating_produk = Number(body.rating_produk);
    const rating_toko = Number(body.rating_toko);
    const kritik_saran = String(body.kritik_saran || "").trim();

    // validasi simpel
    if (nama.length < 2) {
      return { statusCode: 400, body: JSON.stringify({ message: "Nama minimal 2 karakter" }) };
    }
    if (![1,2,3,4,5].includes(rating_produk) || ![1,2,3,4,5].includes(rating_toko)) {
      return { statusCode: 400, body: JSON.stringify({ message: "Rating harus 1-5" }) };
    }
    if (kritik_saran.length < 5) {
      return { statusCode: 400, body: JSON.stringify({ message: "Kritik & saran minimal 5 karakter" }) };
    }

    const payload = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      nama,
      rating_produk,
      rating_toko,
      kritik_saran,
      ip: event.headers["x-forwarded-for"] || "",
      ua: event.headers["user-agent"] || "",
    };

    // TODO: simpan ke Google Sheets / DB
    // await appendToSheet(payload);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ message: e.message || "Server error" }) };
  }
};
