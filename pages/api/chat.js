import OpenAI from "openai";

export const config = {
  runtime: "nodejs", // ⬅️ WAJIB
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Kamu adalah AI resmi bernama AI Nusantara.

Jawab semua pertanyaan dengan bebas seperti ChatGPT.
Jika pengguna bertanya soal layanan atau pemesanan:

Layanan Nusantara:
- Desain Grafis Profesional
- Pembuatan Website Modern
- Preset Fotografi Eksklusif
- Aplikasi Premium Harga Terbaik

Cara Pemesanan:
1. Pilih layanan
2. Kunjungi halaman /order atau chat WhatsApp
3. Konsultasi
4. Pembayaran
5. Pengerjaan
`
        },
        ...messages,
      ],
    });

    res.status(200).json({
      reply: response.output_text,
    });

  } catch (error) {
    console.error("OPENAI ERROR:", error);
    res.status(500).json({ error: "AI error" });
  }
}
