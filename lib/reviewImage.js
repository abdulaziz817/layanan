import { compressImage } from "./compressImage";

export async function reviewImageWithAI(file, materi = {}, mode = "fast") {
  const { base64, mimeType } = await compressImage(file, 768, 0.6);

  const response = await fetch("/.netlify/functions/ai-review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType,
      materi,
      mode,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Gagal review AI");
  }

  return result.data;
}