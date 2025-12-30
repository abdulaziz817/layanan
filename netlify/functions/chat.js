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

    /* ===================== AMBIL DATA WEBSITE JIKA PERLU ===================== */
    let websiteContext = "";

    if (message.toLowerCase().includes("layanan nusantara")) {
      const response = await fetch("https://layanannusantara.store/");
      const html = await response.text();

      websiteContext = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 1500);
    }

    /* ===================== AI BEBAS + KONTEXT WEBSITE ===================== */
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah Nusantara AI. Jawab dengan bahasa Indonesia yang rapi, profesional, dan mudah dipahami. Jika ada informasi website, gunakan itu sebagai sumber utama dan rangkum dengan baik. Jangan tampilkan teks mentah website.",
        },
        ...(websiteContext
          ? [
              {
                role: "system",
                content:
                  "Informasi resmi dari website Layanan Nusantara:\n" +
                  websiteContext,
              },
            ]
          : []),
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
    return {
      statusCode: 500,
      body: JSON.stringify({
        content: "Terjadi kesalahan pada server.",
      }),
    };
  }
};
