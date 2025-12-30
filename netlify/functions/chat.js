const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    /* ===================== KHUSUS LAYANAN NUSANTARA ===================== */
    if (message.toLowerCase().includes("layanan nusantara")) {
      const response = await fetch("https://layanannusantara.store/");
      const html = await response.text();

      const cleanText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 1200);

      // 🔥 biar rapi → lempar ke Groq
      const summary = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah Nusantara AI. Ringkas dan jelaskan informasi website secara rapi, profesional, dan mudah dipahami dalam bahasa Indonesia.",
          },
          {
            role: "user",
            content:
              "Berikut isi website Layanan Nusantara:\n\n" +
              cleanText +
              "\n\nJawab pertanyaan user dengan rapi.",
          },
        ],
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          content: summary.choices[0].message.content,
        }),
      };
    }

    /* ===================== AI BEBAS ===================== */
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah Nusantara AI, asisten ramah berbahasa Indonesia. Jawab dengan jelas, sopan, dan natural seperti chatbot profesional.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: completion.choices[0].message.content,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        content: "Terjadi kesalahan pada server.",
      }),
    };
  }
};
