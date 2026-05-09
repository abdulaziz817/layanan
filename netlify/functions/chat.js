const products = require("./products.json");

// ===================== RUNTIME FETCH (SAFE) =====================
let _fetch = global.fetch;
async function ensureFetch() {
  if (typeof _fetch === "function") return _fetch;
  // fallback kalau runtime lama
  const mod = await import("node-fetch");
  _fetch = mod.default;
  return _fetch;
}

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

const pickLastDetectedProductFromHistory = (history = []) => {
  // cari di assistant messages yang pernah menyebut nama produk
  for (const h of [...history].reverse()) {
    if (h?.role !== "assistant") continue;
    const txt = normalize(h.content);
    for (const key in products) {
      const p = products[key];
      if (!p?.name) continue;
      if (txt.includes(normalize(p.name))) return p;
    }
  }
  return null;
};

// ✅ IMPORTANT: sanitasi history -> hanya role valid + content
const sanitizeHistory = (history = [], max = 12) => {
  if (!Array.isArray(history)) return [];
  return history
    .filter((h) => h && typeof h === "object" && h.role && h.content)
    .map((h) => ({
      role: ["system", "user", "assistant"].includes(String(h.role)) ? String(h.role) : "user",
      content: String(h.content),
    }))
    .slice(-max);
};

// ✅ Response helper biar konsisten
function json(statusCode, obj, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
    body: JSON.stringify(obj),
  };
}

// ✅ CORS headers
function corsHeaders(origin) {
  // kalau kamu mau strict, ganti jadi domain kamu saja
  const allowOrigin = origin || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// fetch dengan timeout
async function fetchWithTimeout(url, opts = {}, timeoutMs = 12000) {
  const fetchFn = await ensureFetch();
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn(url, { ...opts, signal: controller.signal });
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
    .slice(0, 7000);

  siteCache.set(url, { text: clean, ts: now });
  return clean;
}

// ===================== PROMPTS =====================
function systemPrompt() {
  return `
Kamu adalah Nusantara AI, asisten AI yang ramah, cerdas, natural, dan adaptif.

IDENTITAS:
- Kamu berbicara seperti asisten yang hangat, cepat paham konteks, dan enak diajak ngobrol.
- Gaya bicaramu natural, tidak kaku, tidak terlalu formal, dan tidak terdengar seperti bot FAQ.
- Kamu menjawab dengan percaya diri, jelas, ringkas saat perlu, dan detail saat dibutuhkan.

PERAN UTAMA:
1. Menjadi AI assistant umum untuk membantu user dalam berbagai topik:
   - tanya jawab umum
   - belajar
   - brainstorming ide
   - menulis
   - coding
   - bisnis
   - teknologi
   - produktivitas
   - dan obrolan sehari-hari

2. Jika user membahas Layanan Nusantara, produk, pemesanan, pembayaran, atau Abdul Aziz,
   kamu berperan sebagai asisten resmi Layanan Nusantara yang informatif, sopan, dan membantu.

3. Jika user hanya ngobrol santai, balas dengan santai, natural, dan tetap sopan.

PRINSIP UTAMA:
- Pahami dulu maksud user, jangan buru-buru jawab template.
- Utamakan membantu, bukan sekadar merespons.
- Jangan memaksa konteks bisnis jika user sedang membahas topik umum.
- Jangan terlalu sering mengarahkan ke layanan jika itu tidak relevan.
- Selalu sesuaikan gaya jawaban dengan konteks dan cara bicara user.
- Jika user singkat, pahami konteks dari pesan sebelumnya.
- Jika user follow-up seperti "iya", "lanjut", "gas", "mau beli", "boleh", dan konteks sebelumnya sudah jelas, langsung lanjut tanpa mengulang pertanyaan yang sama.

ATURAN MENJAWAB:
- Untuk pertanyaan umum:
  jawab seperti AI assistant yang pintar, helpful, dan natural.
- Untuk pertanyaan teknis atau butuh penjelasan:
  jelaskan dengan runtut, jelas, dan mudah dipahami.
- Untuk pertanyaan kreatif:
  berikan jawaban yang fleksibel, ide yang hidup, dan tidak generik.
- Untuk pertanyaan produk/layanan:
  jawab sebagai representasi resmi Layanan Nusantara, gunakan informasi produk jika tersedia.
- Untuk pertanyaan santai:
  balas santai, hangat, dan tidak berlebihan.

GAYA BAHASA:
- Gunakan bahasa Indonesia yang natural, enak dibaca, dan tidak kaku.
- Hindari bahasa robotik, terlalu baku, atau terlalu promosi.
- Jangan terdengar seperti customer service template.
- Jangan terlalu banyak bullet point kecuali memang membantu.
- Boleh singkat, tapi tetap terasa pintar dan nyambung.
- Kalau cocok, gunakan wording yang terasa modern dan luwes, tapi tetap sopan.

CARA BERPIKIR:
- Selalu cek: user sedang butuh jawaban cepat, penjelasan detail, ide, atau arahan?
- Jika pertanyaan ambigu, minta klarifikasi singkat dan spesifik.
- Jika informasi kurang, jujur bilang belum cukup info, lalu tanyakan hal minimum yang dibutuhkan.
- Jika ada konteks sebelumnya, prioritaskan kesinambungan konteks.
- Jangan mengulang informasi yang sudah jelas dari percakapan sebelumnya.

PRIORITAS RESPONS:
1. Relevan dengan maksud user
2. Jelas dan mudah dipahami
3. Natural dan tidak kaku
4. Membantu secara nyata
5. Ringkas bila cukup, detail bila diperlukan

ATURAN KHUSUS LAYANAN NUSANTARA:
- Jika user bertanya soal layanan, produk, harga, pemesanan, pembayaran, atau Abdul Aziz, jawab sebagai asisten resmi.
- Jika data produk tersedia, gunakan data tersebut sebagai acuan utama.
- Jika user menunjukkan minat beli, bantu arahkan prosesnya dengan halus dan jelas.
- Jika konteks pembelian sudah jelas, jangan ulang dari awal.
- Jika ada informasi yang belum tersedia, jawab jujur tanpa mengarang.

LARANGAN:
- Jangan terdengar seperti bot FAQ.
- Jangan memaksa promosi.
- Jangan terlalu sering bilang "silakan hubungi admin" jika sebenarnya kamu masih bisa membantu.
- Jangan memberi jawaban generik kalau bisa dibuat lebih relevan.
- Jangan mengarang data produk, harga, atau kebijakan jika tidak ada informasinya.

TARGET AKHIR:
Setiap jawaban harus terasa seperti ditulis oleh asisten yang pintar, nyambung, natural, paham konteks, dan benar-benar membantu user.
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
Kamu adalah asisten resmi Layanan Nusantara.

Sumber:
${cleanSource}

ATURAN WAJIB:
- Jangan gunakan frasa: "tidak menemukan", "tidak ada informasi", "saya tidak menemukan", "mohon maaf tidak menemukan".
- Jangan mengarang.
- Jika pertanyaan menanyakan perusahaan tertentu dan tidak disebut di sumber:
  katakan: "Di profil yang tersedia, perusahaan itu tidak disebutkan."
  lalu tampilkan pengalaman yang memang tertulis di sumber.

Mode: ${mode}

Pertanyaan user:
${userMessage}

Format jawaban:
- 1 kalimat pembuka
- Bullet list poin-poin utama
- Jika butuh klarifikasi, tanya 1 pertanyaan paling penting
`.trim();
}

// ===================== HANDLER =====================
exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "*";
  const CORS = corsHeaders(origin);

  // ✅ OPTIONS (preflight) biar aman
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: { ...CORS },
      body: "",
    };
  }

  try {
    if (event.httpMethod !== "POST") {
      return json(405, { content: "Method not allowed" }, CORS);
    }

    // ✅ cek key
   if (!process.env.GEMINI_API_KEY) {
  return json(500, { content: "API KEY GEMINI tidak ada" }, CORS);
}

    const body = safeParse(event.body || "{}", {});
    const message = body?.message;
    const historyRaw = body?.history || [];

    if (!message || !String(message).trim()) {
      return json(200, { content: "Silakan ketik pertanyaan 🙂" }, CORS);
    }

    // ✅ history aman
    const history = sanitizeHistory(historyRaw, 12);
    const lastUser = pickLastUserFromHistory(history);

    const isFollowUp =
      includesAny(message, followUpIntents) ||
      (includesAny(message, followUpClues) && !!lastUser);

    const combinedMessage = isFollowUp && lastUser ? lastUser : message;

    const product = detectProduct(combinedMessage);
    let detectedProduct = product;
if (!detectedProduct && isFollowUp) {
  detectedProduct = pickLastDetectedProductFromHistory(history);
}

    const talkedAboutAzizBefore = history.some(
  (h) => h.role === "assistant" && includesAny(h.content, ["abdul aziz", "abdul", "aziz"])
);

    let userPrompt = String(message);

// ====== LOGIKA PROFIL AZIZ ======
const askAboutAziz = includesAny(message, [
  "abdul aziz","aziz","abdul",
  "owner","pemilik","founder","pendiri","ceo",
  "instagram","ig","wa","whatsapp","nomor","kontak","alamat","pengalaman",
  "karier","kerja","riwayat"
]);

// intent pengalaman (biar kalau tanya PT/perusahaan langsung ambil zizzz)
const askAzizExperience = askAboutAziz && includesAny(message, [
  "pt","perusahaan","kerja","pengalaman","karier","jabatan","timeline","riwayat"
]);

if (askAboutAziz) {
  try {
    // prioritas: kalau nanya pengalaman kerja -> ambil zizzz (lebih lengkap)
    const url = askAzizExperience
      ? "https://zizzz.netlify.app/"
      : "https://layanannusantara.store/tentang/aziz"; // sumber resmi kamu

    const clean = await fetchCleanText(url);

    userPrompt = buildAzizPrompt(clean, message, askAzizExperience ? "lebih lengkap" : "ringkas");
  } catch {
    // fallback ke sumber lain
    try {
      const url2 = talkedAboutAzizBefore
        ? "https://zizzz.netlify.app/"
        : "https://abdulaziznusantara.netlify.app/";
      const clean2 = await fetchCleanText(url2);
      userPrompt = buildAzizPrompt(clean2, message, talkedAboutAzizBefore ? "lebih lengkap" : "ringkas");
    } catch {
      userPrompt = `Jawab pertanyaan tentang Abdul Aziz secara profesional dan jangan mengarang.\nPertanyaan user: ${message}`;
    }
  }
}

// ====== LOGIKA PRODUK ======
// ✅ produk hanya jalan kalau BUKAN pertanyaan Abdul Aziz
if (!askAboutAziz && detectedProduct) {
  userPrompt = buildProductPrompt(detectedProduct, message, isFollowUp);
}

// ====== LOGIKA UMUM ======
// ✅ umum hanya jalan kalau bukan Aziz dan bukan produk
if (!askAboutAziz && !detectedProduct && includesAny(message, ["layanan nusantara"])) {
  try {
    const clean = await fetchCleanText("https://layanannusantara.store/");
    userPrompt = buildGeneralPrompt(clean, message);
  } catch {
    userPrompt = `Jawab pertanyaan user tentang Layanan Nusantara secara ringkas dan jelas.\nPertanyaan user: ${message}`;
  }
}
    // ====== KIRIM KE GROQ ======
 const geminiRes = await fetchWithTimeout(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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
              text: `
${systemPrompt()}

${history.map((h) => `${h.role}: ${h.content}`).join("\n")}

user: ${userPrompt}
              `,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 700,
      },
    }),
  },
  12000
);

const rawText = await geminiRes.text();
const data = safeParse(rawText, null);

if (!geminiRes.ok) {
  const detail =
    data?.error?.message ||
    rawText?.slice(0, 300) ||
    `Gemini error: HTTP ${geminiRes.status}`;

  return json(
    502,
    { content: `⚠️ Server AI sedang bermasalah.\nDetail: ${detail}` },
    CORS
  );
}

const reply =
  data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  "Baik, ada yang bisa saya bantu?";

    await delay(50);

    return json(200, { content: reply }, CORS);
  } catch (err) {
    console.error("ERROR DETAIL:", err);
    return json(500, { content: "Server error" }, CORS);
  }
};
