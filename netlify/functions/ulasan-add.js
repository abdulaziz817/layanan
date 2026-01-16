export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const webhook = process.env.ULASAN_WEBHOOK_URL;
    const token = process.env.ULASAN_WEBHOOK_TOKEN;

    if (!webhook || !token) {
      return { statusCode: 500, body: JSON.stringify({ message: "ENV webhook/token belum diset" }) };
    }

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        nama: body.nama,
        rating_produk: body.rating_produk,
        rating_toko: body.rating_toko,
        kritik_saran: body.kritik_saran,
      }),
    });

    const text = await res.text();

    // Kalau Apps Script balas Unauthorized / error lain, kelihatan di sini
    if (!res.ok || text.toLowerCase().includes("unauthorized")) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Webhook gagal", detail: text }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, detail: text }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ message: e.message || "Server error" }) };
  }
}
