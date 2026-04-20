exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return json(405, {
        ok: false,
        error: "Method tidak diizinkan",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY tidak ditemukan");
    }

    const body = JSON.parse(event.body || "{}");
    const imageBase64 = body.imageBase64;
    const mimeType = body.mimeType || "image/jpeg";
    const materi = body.materi || {};

    if (!imageBase64) {
      return json(400, {
        ok: false,
        error: "imageBase64 wajib diisi",
      });
    }

    const model =
      process.env.GROQ_VISION_MODEL ||
      "meta-llama/llama-4-scout-17b-16e-instruct";

    const prompt = `
Kamu adalah reviewer karya visual yang ramah, natural, detail, suportif, dan adil.

Kamu sedang menilai karya siswa berdasarkan materi berikut:
- Judul: ${safe(materi.judul)}
- Deskripsi: ${safe(materi.deskripsi)}
- Fokus: ${safe(materi.fokus)}
- Intro: ${safe(materi.intro)}
- Highlight: ${safe(materi.highlight)}
- Section 1: ${safe(materi.section1_title)} - ${safe(materi.section1_content)}
- Section 2: ${safe(materi.section2_title)} - ${safe(materi.section2_content)}
- Section 3: ${safe(materi.section3_title)} - ${safe(materi.section3_content)}

Aturan penilaian:
1. Analisis gambar yang dikirim dengan teliti.
2. Tulis hasil review yang lengkap, hangat, dan enak dibaca.
3. Jangan terlalu pelit skor.
4. Jika gambar masih cukup sesuai dengan konteks materi, set relevant_to_material = true.
5. Jangan terlalu mudah mengatakan tidak relevan jika masih ada hubungan visual yang masuk akal.
6. Jika kualitas file turun karena kompres atau upload, tetap fokus pada isi visual utama.
7. Summary harus 3 sampai 5 kalimat, bukan 1 kalimat pendek.
8. Strengths harus spesifik dan jelas.
9. Improvements harus spesifik, sopan, dan membangun.
10. Nilai score dari 0 sampai 100.

Balas HANYA dalam JSON valid dengan format persis seperti ini:
{
  "detected_type": "foto/desain/poster/layout/editing/ilustrasi/dll",
  "score": 0,
  "summary": "review lengkap 3 sampai 5 kalimat",
  "strengths": [
    "kelebihan pertama yang spesifik",
    "kelebihan kedua yang spesifik",
    "kelebihan ketiga yang spesifik"
  ],
  "improvements": [
    "saran pertama yang spesifik",
    "saran kedua yang spesifik",
    "saran ketiga yang spesifik"
  ],
  "relevant_to_material": true
}

Penting:
- Jangan pakai markdown.
- Jangan tambahkan teks di luar JSON.
- Jangan ringkas berlebihan.
- Jangan isi strengths atau improvements dengan 1 kata saja.
`.trim();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: "json_object" },
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
    });

    const data = await response.json();

    if (!response.ok) {
      return json(response.status, {
        ok: false,
        error: data?.error?.message || "Gagal meminta review AI",
        details: data,
      });
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return json(500, {
        ok: false,
        error: "AI tidak mengembalikan konten review",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      return json(500, {
        ok: false,
        error: "Respons AI bukan JSON valid",
        raw: content,
      });
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json(500, {
        ok: false,
        error: "Format respons AI tidak valid",
        raw: content,
      });
    }

    return json(200, {
      ok: true,
      data: {
        detected_type: String(parsed.detected_type || "karya visual"),
        score: Number.isFinite(Number(parsed.score))
          ? Math.max(0, Math.min(100, Math.round(Number(parsed.score))))
          : 0,
        summary: String(parsed.summary || ""),
        strengths: Array.isArray(parsed.strengths)
          ? parsed.strengths.map((item) => String(item))
          : [],
        improvements: Array.isArray(parsed.improvements)
          ? parsed.improvements.map((item) => String(item))
          : [],
        relevant_to_material:
          typeof parsed.relevant_to_material === "boolean"
            ? parsed.relevant_to_material
            : false,
      },
    });
  } catch (err) {
    return json(500, {
      ok: false,
      error: err.message || "Internal server error",
    });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  };
}

function safe(value) {
  return String(value || "-").replace(/\s+/g, " ").trim();
}