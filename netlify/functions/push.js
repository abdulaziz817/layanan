const webpush = require("web-push");

let SUBSCRIBERS = []; // ⚠️ sementara. Untuk production pakai DB.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  // auth biar aman
  const token = event.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const VAPID_PUBLIC = process.env.VAPID_PUBLIC;
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE;

  webpush.setVapidDetails(
    "mailto:admin@layanannusantara.store",
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );

  // payload notif
  const payload = JSON.stringify({
    title: "Ramadhan sebentar lagi 🌙",
    body: "Udah persiapan belum? Ada reward spesial dari Layanan Nusantara.",
    icon: "/notification-icon.png",
    badge: "/notification-badge.png",
    url: "/", // klik notif buka home
    tag: "ramadhan-2026",
  });

  let sent = 0;

  await Promise.all(
    SUBSCRIBERS.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (err) {
        // endpoint mati → buang
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          SUBSCRIBERS = SUBSCRIBERS.filter((s) => s.endpoint !== sub.endpoint);
        }
      }
    })
  );

  return { statusCode: 200, body: JSON.stringify({ ok: true, sent, total: SUBSCRIBERS.length }) };
};
