const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

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
        body: JSON.stringify({ content: "Silakan ketik pertanyaan Anda." }),
      };
    }

    // ===== KHUSUS LAYANAN NUSANTARA =====
    if (message.toLowerCase().includes("layanan nusantara")) {
      const response = await fetch("https://layanannusantara.store/");
      const html = await response.text();

      const cleanText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 1000);

      return {
        statusCode: 200,
        body: JSON.stringify({
          content:
            "Berikut informasi resmi dari website Layanan Nusantara:\n\n" +
            cleanText,
        }),
      };
    }

    // ===== AI BEBAS =====
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah Nusantara AI. Jawab dengan rapi, natural, dan mudah dipahami.",
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
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        content: "Terjadi kesalahan pada server.",
      }),
    };
  }
};
