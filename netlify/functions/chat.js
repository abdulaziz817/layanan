export default async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://layanannusantara.store",
          "X-Title": "AI Nusantara",
        },
        body: JSON.stringify({
          model: "google/gemini-flash", // GRATIS
          messages: [
            {
              role: "system",
              content: `
Kamu adalah AI resmi bernama AI Nusantara.

Jawab semua pertanyaan dengan bebas seperti ChatGPT.
Jika pengguna bertanya soal layanan atau pemesanan:

Layanan Nusantara:
- Desain Grafis Profesional
- Pembuatan Website Modern
- Preset Fotografi Eksklusif
- Aplikasi Premium Harga Terbaik

Cara Pemesanan:
1. Pilih layanan
2. Kunjungi halaman /order atau chat WhatsApp
3. Konsultasi
4. Pembayaran
5. Pengerjaan
              `,
            },
            ...messages,
          ],
        }),
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply:
          data.choices?.[0]?.message?.content ||
          "Maaf, AI belum bisa menjawab 🙏",
      }),
    };
  } catch (error) {
    console.error("AI ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI error" }),
    };
  }
}
