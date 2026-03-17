export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          message: "Method not allowed",
        }),
      };
    }

    const body = JSON.parse(event.body || "{}");

    const webhook = process.env.APPS_SCRIPT_URL;
    const token = process.env.APPS_SCRIPT_TOKEN;

    if (!webhook || !token) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "ENV webhook/token belum diset",
          debug: {
            APPS_SCRIPT_URL: !!process.env.APPS_SCRIPT_URL,
            APPS_SCRIPT_TOKEN: !!process.env.APPS_SCRIPT_TOKEN,
          },
        }),
      };
    }

    if (
      !body.nama ||
      String(body.nama).trim().length < 2 ||
      ![1, 2, 3, 4, 5].includes(Number(body.rating_produk)) ||
      ![1, 2, 3, 4, 5].includes(Number(body.rating_toko)) ||
      !body.kritik_saran ||
      String(body.kritik_saran).trim().length < 5
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Data ulasan tidak valid",
        }),
      };
    }

    const payload = {
      token,
      nama: String(body.nama).trim(),
      rating_produk: Number(body.rating_produk),
      rating_toko: Number(body.rating_toko),
      kritik_saran: String(body.kritik_saran).trim(),
    };

    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (!res.ok || text.toLowerCase().includes("unauthorized")) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Webhook gagal",
          detail: text,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        detail: text,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: e.message || "Server error",
      }),
    };
  }
}