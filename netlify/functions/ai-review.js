exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          ok: false,
          error: "Method tidak diizinkan",
        }),
      };
    }

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY tidak ditemukan");
    }

    const body = JSON.parse(event.body || "{}");
    const imageBase64 = body.imageBase64;
    const mimeType = body.mimeType || "image/jpeg";
    const materi = body.materi || {};

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          error: "imageBase64 wajib diisi",
        }),
      };
    }

    const model =
      process.env.GROQ_VISION_MODEL ||
      "meta-llama/llama-4-scout-17b-16e-instruct";

    const prompt = `
Kamu adalah reviewer materi pembelajaran visual.

Tugas kamu:
1. Analisis gambar yang dikirim user.
2. Gambar bisa berupa foto, desain PNG, poster, layout, artwork, editing, atau karya visual lain.
3. Review berdasarkan konteks materi berikut:
- Judul: ${materi.judul || "-"}
- Deskripsi: ${materi.deskripsi || "-"}
- Fokus: ${materi.fokus || "-"}
- Intro: ${materi.intro || "-"}
- Highlight: ${materi.highlight || "-"}
- Section 1: ${materi.section1_title || ""} - ${materi.section1_content || ""}
- Section 2: ${materi.section2_title || ""} - ${materi.section2_content || ""}
- Section 3: ${materi.section3_title || ""} - ${materi.section3_content || ""}

Balas HANYA dalam JSON valid dengan format:
{
  "detected_type": "foto/desain/poster/layout/editing/ilustrasi/dll",
  "score": 0-100,
  "summary": "ringkasan review singkat",
  "strengths": ["kelebihan 1", "kelebihan 2", "kelebihan 3"],
  "improvements": ["saran 1", "saran 2", "saran 3"],
  "relevant_to_material": true
}

Aturan:
- Kalau gambar tidak relevan dengan materi, tetap review dan set relevant_to_material false.
- Jangan kasih markdown.
- Jangan kasih teks lain selain JSON.
`.trim();

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          ok: false,
          error: data?.error?.message || "Gagal meminta review AI",
          details: data,
        }),
      };
    }

    const content = data?.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        detected_type: "unknown",
        score: 0,
        summary: content,
        strengths: [],
        improvements: [],
        relevant_to_material: false,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: parsed,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message,
      }),
    };
  }
};