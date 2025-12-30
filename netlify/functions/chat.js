exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ content: "Method not allowed" }),
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

    // ===== KHUSUS LAYANAN NUSANTARA =====
    if (message.toLowerCase().includes("layanan nusantara")) {
      const res = await fetch("https://layanannusantara.store/");
      const html = await res.text();

      const cleanText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 1000);

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
            messages: [
              {
                role: "system",
                content:
                  "Kamu adalah Nusantara AI. Jelaskan dengan rapi, profesional, dan mudah dipahami.",
              },
              {
                role: "user",
                content: cleanText,
              },
            ],
          }),
        }
      );

      const data = await groqRes.json();

      return {
        statusCode: 200,
        body: JSON.stringify({
          content: data.choices?.[0]?.message?.content || "Tidak ada jawaban.",
        }),
      };
    }

    // ===== AI BEBAS =====
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
          messages: [
            {
              role: "system",
              content:
                "Kamu adalah Nusantara AI, chatbot ramah berbahasa Indonesia.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await groqRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: data.choices?.[0]?.message?.content || "Tidak ada jawaban.",
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        content: "Terjadi kesalahan pada server.",
      }),
    };
  }
};
