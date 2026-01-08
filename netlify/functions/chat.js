const products = require("./products.json");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const normalize = (t = "") =>
  t.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

// ====== INTENT LANJUTAN / BELI ======
const followUpIntents = [
  "iya",
  "ya",
  "mau",
  "beli",
  "pesan",
  "lanjut",
  "oke",
  "ok",
  "siap",
];

// ====== CARI PRODUK (TYPO FRIENDLY) ======
function detectProduct(text) {
  const msg = normalize(text);

  for (const key in products) {
    const product = products[key];
    for (const kw of product.keywords) {
      if (msg.includes(normalize(kw))) {
        return product;
      }
    }
  }
  return null;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method not allowed" };
    }

    if (!process.env.GROQ_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ content: "API KEY GROQ tidak ada" }),
      };
    }

    const { message, history = [] } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 200,
        body: JSON.stringify({ content: "Silakan ketik pertanyaan 🙂" }),
      };
    }

    // ====== AMBIL PESAN USER TERAKHIR DARI HISTORY ======
    const lastUser = [...history]
      .reverse()
      .find((h) => h.role === "user")?.content;

    const isFollowUp = followUpIntents.some((w) =>
      normalize(message).includes(w)
    );

    // ====== GABUNG KONTEKS CHAT ======
    const combinedMessage =
      (isFollowUp ||
        ["berapa", "itu", "emangnya"].some((w) =>
          normalize(message).includes(w)
        )) && lastUser
        ? lastUser
        : message;

    // ====== CEK PRODUK ======
    const product = detectProduct(combinedMessage);

    // ====== CEK APAKAH SEBELUMNYA SUDAH MEMBAHAS PROFIL AZIZ ======
    const talkedAboutAzizBefore = [...history].some(
      (h) =>
        h.role === "assistant" &&
        normalize(h.content).includes("abdul aziz")
    );

    const systemPrompt = `
Kamu adalah Nusantara AI 🤖

ATURAN WAJIB:
- Jika produk sudah terdeteksi, ANGGAP produk AKTIF
- Jika user bilang "iya", "mau beli", "pesan", "lanjut"
  → JANGAN tanya ulang produk
  → LANGSUNG kirim cara pemesanan
- Jika data produk ada, WAJIB digunakan
- DILARANG bilang "tidak menemukan informasi"
- Jawab profesional, jelas, tidak bertele-tele
`;

    let userPrompt = message;

    // ====== LOGIKA PROFIL SESUAI ALUR YANG LU MINTA ======
    if (
      normalize(message).includes("aziz") ||
      normalize(message).includes("abdul") ||
      normalize(message).includes("pembuat") ||
      normalize(message).includes("owner")
    ) {

      // Jika user SUDAH nanya lagi tentang Aziz → pakai SUMBER LEBIH LENGKAP
      if (talkedAboutAzizBefore) {
        const res = await fetch("https://abdulaziznusantara.netlify.app/");
        const html = await res.text();

        const clean = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ");

        userPrompt = `
User ingin mengetahui informasi LEBIH LENGKAP tentang Abdul Aziz.

Data sumber:

${clean}

Pertanyaan user:
${message}
`;
      }

      // Jika baru pertanyaan awal SEKILAS tentang Aziz → pakai sumber ringkas
      else {
        const res = await fetch("https://layanannusantara.store/");
        const html = await res.text();

        const clean = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ");

        userPrompt = `
Gunakan informasi RINGKAS berikut untuk menjawab tentang Abdul Aziz:

${clean}

Pertanyaan user:
${message}
`;
      }
    }

    // ====== JIKA PRODUK TERDETEKSI ======
    if (product) {
      userPrompt = `
Produk AKTIF di Layanan Nusantara (JANGAN DIABAIKAN):

Nama Produk:
${product.name}

Daftar Paket & Harga:
${product.packages.join("\n")}

Jika user menyatakan ingin membeli,
WAJIB kirim langkah pemesanan berikut:

🛒 Cara Melakukan Pemesanan
🔘 Klik tombol Pesan Layanan di halaman utama
🖥️ Isi form pemesanan dengan data yang sesuai
📦 Pilih jenis layanan:
• Aplikasi Premium → harga & durasi otomatis
• Desain Grafis / Preset Foto / Web Development → isi budget & deadline
💳 Pilih metode pembayaran dan lakukan transfer
💬 Klik Kirim Pesanan via WhatsApp
📱 Admin akan memverifikasi dan pesanan diproses

Pertanyaan user:
${message}
`;
    }

    // ====== JIKA NANYA UMUM TENTANG LAYANAN NUSANTARA ======
    if (
      message.toLowerCase().includes("layanan nusantara") &&
      !product
    ) {
      const res = await fetch("https://layanannusantara.store/");
      const html = await res.text();

      const clean = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ");

      userPrompt = `
Gunakan informasi berikut untuk menjawab:
${clean}

Pertanyaan:
${message}
`;
    }

    // ====== KIRIM KE GROQ API ======
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
          temperature: 0.4,
          max_tokens: 500,
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    const data = await groqRes.json();
    const reply =
      data?.choices?.[0]?.message?.content || "Tidak ada jawaban";

    await delay(200);

    return {
      statusCode: 200,
      body: JSON.stringify({ content: reply }),
    };
  } catch (err) {
    console.error("ERROR DETAIL:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ content: "Server error" }),
    };
  }
};
