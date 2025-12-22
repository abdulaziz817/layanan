export default async (request) => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405 }
    );
  }

  try {
    const { messages } = await request.json();

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
          model: "google/gemini-flash",
          messages: [
            {
              role: "system",
              content: `
Kamu adalah AI resmi bernama AI Nusantara.

Jawab seperti ChatGPT.
Jika ditanya layanan:

Layanan Nusantara:
- Desain Grafis
- Website
- Preset Foto
- Aplikasi Premium

Cara pesan:
1. Pilih layanan
2. Chat /order / WhatsApp
3. Konsultasi
4. Bayar
5. Pengerjaan
              `,
            },
            ...messages,
          ],
        }),
      }
    );

    const data = await response.json();

    return new Response(
      JSON.stringify({
        reply:
          data.choices?.[0]?.message?.content ||
          "Maaf, AI belum bisa menjawab 🙏",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("AI ERROR:", err);

    return new Response(
      JSON.stringify({ error: "AI error" }),
      { status: 500 }
    );
  }
};
