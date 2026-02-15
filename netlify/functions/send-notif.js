// netlify/functions/send-notif.js
const webpush = require("web-push");
const fs = require("fs");
const path = require("path");

// ⚠️ Netlify deploy folder sering read-only.
// Pakai /tmp supaya writeSubs tidak error.
const SUBS_PATH = path.join("/tmp", "_subs.json");

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function readSubs() {
  try {
    if (!fs.existsSync(SUBS_PATH)) return [];
    const raw = fs.readFileSync(SUBS_PATH, "utf8");
    const data = safeJsonParse(raw, []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeSubs(subs) {
  try {
    fs.writeFileSync(SUBS_PATH, JSON.stringify(subs, null, 2), "utf8");
  } catch {
    // jangan bikin function crash
  }
}

function getHeader(headers, name) {
  if (!headers) return "";
  const lower = name.toLowerCase();
  // netlify headers bisa lowercase semua
  for (const k of Object.keys(headers)) {
    if (String(k).toLowerCase() === lower) return headers[k];
  }
  return "";
}

function getProvidedToken(headers) {
  const xToken = String(getHeader(headers, "x-admin-token") || "").trim();

  const auth = String(getHeader(headers, "authorization") || "").trim();
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";

  return bearer || xToken || "";
}

function getEnvToken() {
  return String(process.env.ADMIN_TOKEN || "").trim();
}

function getVapidPublic() {
  return (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC ||
    process.env.VAPID_PUBLIC ||
    process.env.VAPID_PUBLIC_KEY ||
    ""
  ).toString().trim();
}

function getVapidPrivate() {
  return (
    process.env.VAPID_PRIVATE ||
    process.env.VAPID_PRIVATE_KEY ||
    process.env.VAPID_PRIVATEKEY ||
    ""
  ).toString().trim();
}

exports.handler = async (event) => {
  // ✅ CORS (opsional tapi aman)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "ok" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  // 🔒 AUTH super aman (case-insensitive + trim)
  const expected = getEnvToken();
  const provided = getProvidedToken(event.headers);

  if (!expected) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: "ADMIN_TOKEN belum diset di Netlify Environment Variables.",
    };
  }

  if (!provided || provided !== expected) {
    return { statusCode: 401, headers: corsHeaders, body: "Unauthorized" };
  }

  // ✅ parse body aman
  const bodyObj = safeJsonParse(event.body || "{}", {});
  const {
    title,
    body,
    url,
    icon,
    badge,
    image,
    tag,
  } = bodyObj || {};

  // ✅ VAPID aman
  const vapidPublic = getVapidPublic();
  const vapidPrivate = getVapidPrivate();

  if (!vapidPublic || !vapidPrivate) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: "VAPID key belum lengkap. Set NEXT_PUBLIC_VAPID_PUBLIC dan VAPID_PRIVATE (atau VAPID_PRIVATE_KEY).",
    };
  }

  webpush.setVapidDetails(
    "mailto:admin@layanannusantara.store",
    vapidPublic,
    vapidPrivate
  );

  const payload = JSON.stringify({
    title: title || "Layanan Nusantara",
    body: body || "Ada promo terbaru!",
    url: url || "/",
    icon: icon || "/icon-192.png",
    badge: badge || "/icon-192.png",
    image: image || "/cta-image.jpg",
    tag: tag || "ln-broadcast",
  });

  let subs = readSubs();

  // kalau subs kosong, tetap balikin response bagus (biar ga bingung)
  if (!Array.isArray(subs) || subs.length === 0) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ sent: 0, failed: 0, remaining: 0, note: "Belum ada subscriber (_subs.json kosong)." }),
    };
  }

  let ok = 0;
  let fail = 0;

  const keep = [];
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
      ok++;
      keep.push(sub);
    } catch (e) {
      fail++;
      const code = e?.statusCode;

      // 410/404 = subscription mati → buang
      if (code !== 410 && code !== 404) {
        keep.push(sub);
      }
    }
  }

  writeSubs(keep);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ sent: ok, failed: fail, remaining: keep.length }),
  };
};
