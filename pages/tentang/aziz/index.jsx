// pages/tentang/aziz/index.jsx
import AzizPage from "../../../components/ui/Tentang/aziz";

const SOURCES = {
  a: "https://abdulaziznusantara.netlify.app/",
  b: "https://zizzz.netlify.app/",
};

// fetch tahan banting + retry
async function fetchWithTimeout(url, ms = 15000, retries = 2) {
  let lastErr = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        // penting: beberapa runtime “aneh” kalau cache
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html,*/*",
        },
      });

      if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
      return await res.text();
    } catch (e) {
      lastErr = e;
      // retry kecil
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    } finally {
      clearTimeout(id);
    }
  }

  throw lastErr || new Error(`Fetch failed for ${url}`);
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(str, regex) {
  const m = String(str || "").match(regex);
  return m?.[0] || "";
}

function pickSentence(text, maxLen = 240) {
  const t = (text || "").trim();
  if (!t) return "";
  if (t.length <= maxLen) return t;

  const cut = t.slice(0, maxLen);
  const idx = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("!"), cut.lastIndexOf("?"));
  return (idx > 80 ? cut.slice(0, idx + 1) : cut + "…").trim();
}

function uniqueNonEmpty(arr) {
  return [...new Set((arr || []).map((x) => (x || "").trim()).filter(Boolean))];
}

// parsing pengalaman berdasarkan isi zizzz (yang memang punya section pengalaman lengkap) :contentReference[oaicite:1]{index=1}
function parseExperienceFromZizzz(cleanText) {
  const raw = String(cleanText || "");

  const companies = [
    "PT. Es Mamang Kreasi Cemerlang",
    "BBPVP Bekasi (Kemnaker RI)",
    "PT. Batamindo Green Farm",
    "GEMA Foundation",
    "Layanan Nusantara",
  ].filter((c) => raw.includes(c));

  return companies
    .map((company) => {
      const i = raw.indexOf(company);
      const window = raw.slice(i, i + 900);

      const date =
        firstMatch(
          window,
          /\b(?:Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s?\d{4}\s?-\s?(?:Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s?\d{4}\b/i
        ) ||
        firstMatch(window, /\b\d{4}\s?-\s?\d{4}\b/) ||
        firstMatch(window, /\b\d{4}\b/);

      // title = teks di antara company dan date (ambil beberapa kata biar rapih)
      const beforeDate = date ? (window.split(date)[0] || "") : window;
      let title = beforeDate.replace(company, "").trim().split(" ").slice(0, 10).join(" ").trim();
      if (!title) title = "Peran";

      const desc = pickSentence(
        window.replace(company, "").replace(title, "").replace(date || "", "").trim(),
        240
      );

      return { company, title, date: date || "", desc: desc || "" };
    })
    .filter((x) => x.company);
}

export async function getStaticProps() {
  try {
    const [htmlA, htmlB] = await Promise.all([
      fetchWithTimeout(SOURCES.a),
      fetchWithTimeout(SOURCES.b),
    ]);

    const cleanA = stripHtml(htmlA);
    const cleanB = stripHtml(htmlB);

    // email & phone (di abdulaziznusantara ada nomor & email) :contentReference[oaicite:2]{index=2}
    const email =
      firstMatch(htmlA, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i) ||
      firstMatch(htmlB, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);

    const phone =
      firstMatch(cleanA, /\b0\d{9,13}\b/) || // contoh: 0878...
      firstMatch(cleanB, /\b0\d{9,13}\b/);

    // IG & WA link (di abdulaziznusantara ada instagram + wa.me) :contentReference[oaicite:3]{index=3}
    const waLink =
      firstMatch(htmlA, /https?:\/\/wa\.me\/[0-9]+/i) ||
      firstMatch(htmlA, /https?:\/\/api\.whatsapp\.com\/send\?phone=[0-9]+/i) ||
      firstMatch(htmlB, /https?:\/\/wa\.me\/[0-9]+/i) ||
      "";

    const igLink =
      firstMatch(htmlA, /https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+/i) ||
      firstMatch(htmlB, /https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+/i) ||
      "";

    // aboutA: paragraf “Saya antusias…” (ada di abdulaziznusantara) :contentReference[oaicite:4]{index=4}
    const aboutA = pickSentence(
      (() => {
        const idx = cleanA.indexOf("Saya antusias");
        return idx >= 0 ? cleanA.slice(idx, idx + 520) : cleanA.slice(0, 520);
      })(),
      260
    );

    // aboutB: paragraf “Saya membantu brand…” (ada di zizzz) :contentReference[oaicite:5]{index=5}
    const aboutB = pickSentence(
      (() => {
        const idx = cleanB.indexOf("Saya membantu brand");
        return idx >= 0 ? cleanB.slice(idx, idx + 520) : cleanB.slice(0, 520);
      })(),
      260
    );

    const roleHighlight = cleanB.includes("Founder & Digital Creative Lead")
      ? "Founder & Digital Creative Lead"
      : cleanB.includes("Founder")
      ? "Founder"
      : "Owner / Founder";

    const skills = uniqueNonEmpty([
      cleanA.includes("Desain Grafis") ? "Desain Grafis" : "",
      cleanA.includes("Web Development") ? "Web Development" : "",
      cleanA.includes("Fotografi") ? "Fotografi" : "",
      cleanA.includes("UI/UX") ? "UI/UX" : "",
    ]);

    const experience = parseExperienceFromZizzz(cleanB);

    return {
      props: {
        data: {
          name: "Abdul Aziz",
          roleLine: `${roleHighlight} • Layanan Nusantara`,
          aboutA,
          aboutB,
          email,
          phone,
          waLink,
          igLink,
          skills,
          experience,
          sourceA: SOURCES.a,
          sourceB: SOURCES.b,
          // debug off by default
          error: "",
        },
      },
      revalidate: 1800, // 30 menit
    };
  } catch (e) {
    return {
      props: {
        data: {
          name: "Abdul Aziz",
          roleLine: "Owner / Founder • Layanan Nusantara",
          aboutA: "Profil sedang dimuat. Silakan refresh beberapa saat lagi.",
          aboutB: "",
          email: "",
          phone: "",
          waLink: "",
          igLink: "",
          skills: ["Desain Grafis", "Web Development", "Fotografi"],
          experience: [],
          sourceA: SOURCES.a,
          sourceB: SOURCES.b,
          // ✅ tampilkan error supaya kamu tahu kenapa fetch gagal
          error: String(e?.message || e),
        },
      },
      revalidate: 120, // kalau error, coba refresh lebih sering
    };
  }
}

export default function Page({ data }) {
  return <AzizPage data={data} />;
}