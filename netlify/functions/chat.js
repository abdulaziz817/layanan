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
        body: JSON.stringify({
          content: "⚠️ API KEY GROQ tidak terdeteksi.",
        }),
      };
    }

    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          content: "Silakan ketik pertanyaan Anda 🙂",
        }),
      };
    }

    // ================= SYSTEM PROMPT GLOBAL =================
    const systemPrompt = `
Kamu adalah Nusantara AI 🤖

Aturan WAJIB:
- Tanpa tanda ** atau markdown
- Jawaban sedang, tidak bertele-tele
- Emoji secukupnya
- Gunakan jarak antar paragraf
- Judul pakai HURUF KAPITAL
- Bahasa santai, sopan, profesional
`;

    // ================= KHUSUS LAYANAN NUSANTARA =================
    if (message.toLowerCase().includes("layanan nusantara")) {
      const res = await fetch("https://layanannusantara.store/");
      const html = await res.text();

      const cleanText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 900);

      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            temperature: 0.6,
            max_tokens: 260,
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Jelaskan secara ringkas dan rapi tentang Layanan Nusantara:\n\n${cleanText}`,
              },
            ],
          }),
        }
      );

      const data = await groqRes.json();

      // ⏳ DELAY BIAR KELIHATAN MIKIR
      await delay(1000);


      return {
        statusCode: 200,
        body: JSON.stringify({
          content:
            data?.choices?.[0]?.message?.content || "Tidak ada jawaban.",
        }),
      };
    }

    // ================= AI BEBAS =================
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          temperature: 0.6,
          max_tokens: 240,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await groqRes.json();

    // ⏳ DELAY BIAR HUMAN-LIKE
await delay(1000);


    return {
      statusCode: 200,
      body: JSON.stringify({
        content:
          data?.choices?.[0]?.message?.content || "Tidak ada jawaban.",
      }),
    };
  } catch (err) {
    console.error("CHAT FUNCTION ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        content: "⚠️ Terjadi kesalahan pada server.",
      }),
    };
  }
};
