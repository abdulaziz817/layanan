const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event) => {
  try {
    // ================= METHOD CHECK =================
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ content: "Method not allowed" }),
      };
    }

    // ================= API KEY CHECK =================
    if (!process.env.GROQ_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ content: "⚠️ API KEY GROQ tidak terdeteksi." }),
      };
    }

    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 200,
        body: JSON.stringify({ content: "Silakan ketik pertanyaan Anda 🙂" }),
      };
    }

    // ================= SYSTEM PROMPT =================
    const systemPrompt = `
Kamu adalah Nusantara AI 🤖
Aturan WAJIB:
- Jawaban jelas, relevan, dan sesuai pertanyaan
- Ambil jawaban langsung dari info website
- Tanpa tanda ** atau markdown
- Bahasa santai tapi profesional
- Gunakan paragraf untuk pemisahan jawaban
- Judul pakai HURUF KAPITAL jika perlu
- Emoji boleh digunakan secukupnya
`;

    // ================= AMBIL KONTEN WEBSITE =================
    const res = await fetch("https://layanannusantara.store/");
    const html = await res.text();

    // Bersihkan HTML
    const cleanText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ");

    // ================= SIAPKAN MESSAGE UNTUK AI =================
    const groqMessages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Berikut adalah konten website Layanan Nusantara:\n${cleanText}\nJawab pertanyaan berikut hanya berdasarkan info tersebut: ${message}`,
      },
    ];

    // ================= PANGGIL AI =================
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.6,
        max_tokens: 400,
        messages: groqMessages,
      }),
    });

    const data = await groqRes.json();
    await delay(500); // optional, bisa dihapus

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: data?.choices?.[0]?.message?.content || "Tidak ada jawaban.",
      }),
    };
  } catch (err) {
    console.error("CHAT FUNCTION ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ content: "⚠️ Terjadi kesalahan pada server." }),
    };
  }
};
