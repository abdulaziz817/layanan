// netlify/functions/send-notif.js
// ✅ Broadcast Web Push ke semua subscriber dari Google Sheet (tab: subs)
// ✅ Auth pakai ADMIN_TOKEN (header: x-admin-token / Authorization: Bearer ...)
// ✅ Auto hapus subscription mati (410/404) dari sheet
// ✅ CORS aman
// ✅ Handle GOOGLE_PRIVATE_KEY yang pakai \n

const webpush = require("web-push");
const { google } = require("googleapis");

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getEnv(name, fallback = "") {
  return (process.env[name] || fallback).toString();
}

function getHeader(headers, name) {
  if (!headers) return "";
  const target = name.toLowerCase();
  for (const k of Object.keys(headers)) {
    if (String(k).toLowerCase() === target) return headers[k];
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

function getExpectedToken() {
  return String(process.env.ADMIN_TOKEN || process.env.ADMIN_TOKEN?.trim?.() || "").trim();
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

function getPrivateKey() {
  const raw = getEnv("GOOGLE_PRIVATE_KEY", "");
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

async function getSheetsClient() {
  const clientEmail =
    getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL") || getEnv("GOOGLE_CLIENT_EMAIL");
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    throw new Error("ENV Google Service Account belum lengkap (email/private key).");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function readSubsFromSheet(sheets, spreadsheetId, tabName) {
  // Ambil A:B => [endpoint, subscription_json]
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:B`,
  });

  const rows = res.data.values || [];

  // skip header "endpoint" kalau ada
  const data = rows.filter((r, idx) => {
    if (idx === 0 && (r?.[0] || "").toLowerCase() === "endpoint") return false;
    return true;
  });

  // Map jadi object: { endpoint, sub, rawRow }
  const list = [];
  for (const r of data) {
    const endpoint = r?.[0] || "";
    const subJson = r?.[1] || "";
    if (!endpoint || !subJson) continue;

    const sub = safeJsonParse(subJson, null);
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) continue;

    list.push({ endpoint, sub, subJson });
  }

  return list;
}

async function rewriteSubsSheet(sheets, spreadsheetId, tabName, subsList) {
  // Bersihin tab, lalu tulis ulang header + rows keep
  // (Cara paling gampang & aman untuk "hapus yang mati")
  const values = [
    ["endpoint", "subscription_json"],
    ...subsList.map((x) => [x.endpoint, x.subJson]),
  ];

  // Update mulai A1, overwrite cukup panjang
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  // (Opsional) kalau sheet sebelumnya lebih panjang, sisa bawahnya masih ada.
  // Cara paling rapi: clear range besar dulu.
  // Tapi clear butuh range fix; kita clear BANYAK baris biar aman:
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${tabName}!A${values.length + 1}:B9999`,
  });
}

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true }) };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "Method Not Allowed" }),
    };
  }

  // 🔒 AUTH
  const expected = getExpectedToken();
  const provided = getProvidedToken(event.headers);

  if (!expected) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "ADMIN_TOKEN belum diset di Netlify." }),
    };
  }
  if (!provided || provided !== expected) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "Unauthorized" }),
    };
  }

  // ✅ VAPID
  const vapidPublic = getVapidPublic();
  const vapidPrivate = getVapidPrivate();
  if (!vapidPublic || !vapidPrivate) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error:
          "VAPID key belum lengkap. Isi NEXT_PUBLIC_VAPID_PUBLIC dan VAPID_PRIVATE (atau VAPID_PRIVATE_KEY).",
      }),
    };
  }

  webpush.setVapidDetails("mailto:admin@layanannusantara.store", vapidPublic, vapidPrivate);

  // ✅ Payload
  const bodyObj = safeJsonParse(event.body || "{}", {});
  const { title, body, url, icon, badge, image, tag } = bodyObj || {};

  const payload = JSON.stringify({
    title: title || "Layanan Nusantara",
    body: body || "Ada promo terbaru!",
    url: url || "/",
    icon: icon || "/icon-192.png",
    badge: badge || "/icon-192.png",
    image: image || "/cta-image.jpg",
    tag: tag || "ln-broadcast",
  });

  // ✅ Sheet config
  const SPREADSHEET_ID = getEnv("GSHEET_ID");
  const TAB_NAME = getEnv("GOOGLE_SHEET_TAB", "subs");

  if (!SPREADSHEET_ID) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "ENV GSHEET_ID belum diisi." }),
    };
  }

  try {
    const sheets = await getSheetsClient();
    const subs = await readSubsFromSheet(sheets, SPREADSHEET_ID, TAB_NAME);

    if (!subs.length) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: true,
          sent: 0,
          failed: 0,
          remaining: 0,
          note: "Belum ada subscriber di Google Sheet (tab subs masih kosong).",
        }),
      };
    }

    let ok = 0;
    let fail = 0;

    const keep = [];
    const removed = [];

    for (const item of subs) {
      try {
        await webpush.sendNotification(item.sub, payload);
        ok++;
        keep.push(item);
      } catch (e) {
        fail++;
        const code = e?.statusCode;

        // 410/404 = subscription mati → buang dari sheet
        if (code === 410 || code === 404) {
          removed.push({ endpoint: item.endpoint, code });
        } else {
          // selain itu: simpan lagi (mungkin temporary error)
          keep.push(item);
        }
      }
    }

    // rewrite sheet hanya kalau ada perubahan (ada yang mati)
    if (removed.length > 0) {
      await rewriteSubsSheet(sheets, SPREADSHEET_ID, TAB_NAME, keep);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        sent: ok,
        failed: fail,
        remaining: keep.length,
        removed: removed.length,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: "Gagal kirim notifikasi",
        detail: String(err?.message || err),
      }),
    };
  }
};
