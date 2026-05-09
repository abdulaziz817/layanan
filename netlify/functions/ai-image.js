let _fetch = global.fetch;

async function ensureFetch() {
  if (typeof _fetch === "function") return _fetch;
  const mod = await import("node-fetch");
  _fetch = mod.default;
  return _fetch;
}

function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(obj),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(204, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    if (!process.env.GEMINI_API_KEY) {
      return json(500, { error: "GEMINI_API_KEY belum ada" });
    }

    const body = JSON.parse(event.body || "{}");
    const prompt = body.message || "";

    if (!prompt.trim()) {
      return json(400, { error: "Prompt gambar kosong" });
    }

    const fetchFn = await ensureFetch();

    const res = await fetchFn(
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Buat gambar berkualitas tinggi berdasarkan prompt ini:\n${prompt}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const raw = await res.text();
    const data = JSON.parse(raw || "{}");

    if (!res.ok) {
      return json(502, {
        error: data?.error?.message || raw.slice(0, 300) || "Gemini image error",
      });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData?.data);
    const textPart = parts.find((p) => p.text);

    if (!imgPart) {
      return json(200, {
        content: textPart?.text || "Model tidak mengirim gambar. Coba prompt lebih jelas.",
      });
    }

    const mime = imgPart.inlineData.mimeType || "image/png";

    return json(200, {
      content: textPart?.text || "Gambar berhasil dibuat.",
      image: `data:${mime};base64,${imgPart.inlineData.data}`,
    });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Server image error" });
  }
};