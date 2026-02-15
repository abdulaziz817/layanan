// netlify/functions/subscribe.js
const fs = require("fs");
const path = require("path");

// ⚠️ NOTE: /tmp di Netlify itu sementara (bisa reset kapan aja).
// Tapi ini cukup untuk testing & jalanin flow end-to-end.
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
    // jangan crash
  }
}

function sameSub(a, b) {
  return a?.endpoint && b?.endpoint && a.endpoint === b.endpoint;
}

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ ok: false, error: "Method Not Allowed" }) };
  }

  const sub = safeJsonParse(event.body || "{}", null);

  // validasi minimal subscription
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: "Bad Request: subscription tidak valid (butuh endpoint + keys.p256dh + keys.auth)",
      }),
    };
  }

  const subs = readSubs();

  // jangan dobel
  const exists = subs.some((s) => sameSub(s, sub));
  const next = exists ? subs : [sub, ...subs];

  writeSubs(next);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ ok: true, total: next.length, added: !exists }),
  };
};
