const products = require("./products.json");

// ===================== UTIL =====================
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const normalize = (t = "") =>
  String(t)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const safeParse = (s, fallback) => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

const includesAny = (text, arr) => {
  const t = normalize(text);
  return arr.some((w) => t.includes(normalize(w)));
};

const pickLastUserFromHistory = (history = []) =>
  [...history].reverse().find((h) => h?.role === "user")?.content || "";

// ✅ IMPORTANT: sanitasi history -> hanya role+content
const sanitizeHistory = (history = [], max = 12) => {
  if (!Array.isArray(history)) return [];
  return history
    .filter((h) => h && typeof h === "object" && h.role && h.content)
    .map((h) => ({ role: String(h.role), content: String(h.content) }))
    .slice(-max);
};

// fetch dengan timeout
async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// ===================== FOLLOW UP INTENTS =====================
const followUpIntents = ["iya", "ya", "mau", "beli", "pesan", "lanjut", "oke", "ok", "siap"];
const followUpClues = ["berapa", "itu", "emangnya", "yang mana", "yang ini"];

// ===================== SIMPLE FUZZY MATCH =====================
function levenshtein(a = "", b = "") {
  a = normalize(a);
  b = normalize(b);
  if (!a || !b) return Math.max(a.length, b.length);

  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function similarity(a, b) {
  a = normalize(a);
  b = normalize(b);
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length) || 1;
  return 1 - dist / maxLen; // 0..1
}

// ===================== PRODUCT DETECTION =====================
function detectProduct(text) {
  const msg = normalize(text);
  let best = null;
  let bestScore = 0;

  for (const key in products) {
    const p = products[key];
    if (!p?.keywords?.length) continue;

    // exact includes
    for (const kw of p.keywords) {
      const nkw = normalize(kw);
      if (nkw && msg.includes(nkw)) return p;
    }

    // fuzzy fallback
    for (const kw of p.keywords) {
      const s = similarity(msg, kw);
      if (s > bestScore) {
        bestScore = s;
        best = p;
      }
    }
  }

  return bestScore >= 0.62 ? best : null;
}

// ===================== FETCH WEBSITE (CACHE) =====================
const siteCache = new Map(); // url -> { text, ts }
const CACHE_TTL = 1000 * 60 * 10; // 10 menit

async function fetchCleanText(url) {
  const now = Date.now();
  const cached = siteCache.get(url);
  if (cached && now - cached.ts < CACHE_TTL) return cached.text;

  const res = await fetchWithTimeout(url, { method: "GET" }, 9000);
  if (!res.ok) throw new Error(`Fetch failed ${url}: ${res.status}`);

  const html = await res.text();

  const clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 7000); // ✅ limit lebih ketat biar aman token

  siteCache.set(url, { text: clean, ts: now });
  return clean;
}

// ===================== PROMPTS =====================
function systemPrompt() {
  return `
Kamu adalah Nusantara AI 🤖, asisten untuk layanan Layanan Nusantara.

ATURAN WAJIB:
- Jika produk terdeteksi: anggap produk AKTIF dan gunakan data produk (nama + paket + harga).
- Jika user follow-up seperti: "iya/ya/mau/beli/pesan/lanjut/ok/oke/siap":
  → jangan tanya ulang produk
  → langsung kirim langkah pemesanan.
- Jangan pernah bilang "tidak menemukan informasi".
- Jawab profesional, jelas, singkat, dan enak dibaca.
- Jika pertanyaan kurang jelas, ajukan 1 pertanyaan klarifikasi paling penting.
`.trim();
}

function orderSteps() {
  return `
🛒 Cara Melakukan Pemesanan
1) Klik tombol *Pesan Layanan* di halaman utama
2) Isi form pemesanan dengan data yang sesuai
3) Pilih jenis layanan:
   • Aplikasi Premium → harga & durasi otomatis
   • Desain Grafis / Preset Foto / Web Development → isi budget & deadline
4) Pilih metode pembayaran dan lakukan transfer
5) Klik *Kirim Pesanan via WhatsApp*
6) Admin verifikasi → pesanan diproses
`.trim();
}

function buildProductPrompt(product, userMessage, isFollowUp) {
  return `
Produk AKTIF di Layanan Nusantara:

Nama: ${product.name}
Paket & Harga:
${Array.isArray(product.packages) ? product.packages.join("\n") : "-"}

${isFollowUp ? `User ingin membeli/lanjut.\n\n${orderSteps()}` : ""}

Jawab pertanyaan user dengan mengutamakan data produk di atas.
Pertanyaan user: ${userMessage}
`.trim();
}

function buildAzizPrompt(cleanSource, userMessage, mode = "ringkas") {
  return `
User ingin mengetahui informasi ${mode.toUpperCase()} tentang Abdul Aziz.

Sumber:
${cleanSource}

Jawab berdasarkan sumber di atas dengan ringkas, rapi, dan relevan.
Pertanyaan user: ${userMessage}
`.trim();
}

function buildGeneralPrompt(cleanSource, userMessage) {
  return `
Gunakan informasi berikut untuk menjawab pertanyaan user dengan ringkas:
${cleanSource}

Pertanyaan user: ${userMessage}
`.trim();
}

// ===================== HANDLER =====================
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

    const body = safeParse(event.body || "{}", {});
    const message = body?.message;
    const historyRaw = body?.history || [];

    if (!message || !String(message).trim()) {
      return {
        statusCode: 200,
        body: JSON.stringify({ content: "Silakan ketik pertanyaan 🙂" }),
      };
    }

    // ✅ aman walau UI kirim object tambahan
    const history = sanitizeHistory(historyRaw, 12);
    const lastUser = pickLastUserFromHistory(history);

    const isFollowUp =
      includesAny(message, followUpIntents) ||
      (includesAny(message, followUpClues) && !!lastUser);

    const combinedMessage = isFollowUp && lastUser ? lastUser : message;

    const product = detectProduct(combinedMessage);

    const talkedAboutAzizBefore = history.some(
      (h) => h.role === "assistant" && normalize(h.content).includes("abdul aziz")
    );

    let userPrompt = String(message);

    // ====== LOGIKA PROFIL AZIZ ======
    const askAboutAziz = includesAny(message, ["aziz", "abdul", "pembuat", "owner"]);
    if (askAboutAziz) {
      try {
        if (talkedAboutAzizBefore) {
          const clean = await fetchCleanText("https://abdulaziznusantara.netlify.app/");
          userPrompt = buildAzizPrompt(clean, message, "lebih lengkap");
        } else {
          const clean = await fetchCleanText("https://layanannusantara.store/");
          userPrompt = buildAzizPrompt(clean, message, "ringkas");
        }
      } catch {
        // fallback kalau fetch web gagal
        userPrompt = `Jawab pertanyaan tentang Abdul Aziz secara ringkas dan profesional.\nPertanyaan user: ${message}`;
      }
    }

    // ====== LOGIKA PRODUK ======
    if (product) {
      userPrompt = buildProductPrompt(product, message, isFollowUp);
    }

    // ====== LOGIKA UMUM TENTANG LAYANAN NUSANTARA ======
    if (includesAny(message, ["layanan nusantara"]) && !product && !askAboutAziz) {
      try {
        const clean = await fetchCleanText("https://layanannusantara.store/");
        userPrompt = buildGeneralPrompt(clean, message);
      } catch {
        userPrompt = `Jawab pertanyaan user tentang Layanan Nusantara secara ringkas dan jelas.\nPertanyaan user: ${message}`;
      }
    }

    // ====== KIRIM KE GROQ ======
    const groqRes = await fetchWithTimeout(
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
          max_tokens: 520,
          messages: [{ role: "system", content: systemPrompt() }, ...history, { role: "user", content: userPrompt }],
        }),
      },
      12000
    );

    const rawText = await groqRes.text();
    const data = safeParse(rawText, null);

    // ✅ Kalau Groq error, kasih pesan jelas (biar UI tidak bingung)
    if (!groqRes.ok) {
      const detail =
        data?.error?.message ||
        data?.message ||
        rawText ||
        `Groq error: HTTP ${groqRes.status}`;
      return {
        statusCode: 200,
        body: JSON.stringify({ content: `⚠️ Server AI sedang bermasalah.\nDetail: ${detail}` }),
      };
    }

    const reply = data?.choices?.[0]?.message?.content || "Baik, ada yang bisa saya bantu?";

    await delay(80);

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
