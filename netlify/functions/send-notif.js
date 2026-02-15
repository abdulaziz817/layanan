const webpush = require("web-push");
const fs = require("fs");
const path = require("path");

const SUBS_PATH = path.join(__dirname, "_subs.json");

function readSubs() {
  try {
    return JSON.parse(fs.readFileSync(SUBS_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeSubs(subs) {
  fs.writeFileSync(SUBS_PATH, JSON.stringify(subs, null, 2));
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // 🔒 simple auth pake token (biar orang lain nggak spam)
  const token = event.headers["x-admin-token"];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const { title, body, url, icon, badge, image, tag } = JSON.parse(event.body || "{}");

  webpush.setVapidDetails(
    "mailto:admin@layanannusantara.store",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC,
    process.env.VAPID_PRIVATE
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
  let ok = 0;
  let fail = 0;

  // kirim satu-satu, yang invalid dihapus
  const keep = [];
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
      ok++;
      keep.push(sub);
    } catch (e) {
      fail++;
      // 410/404 artinya subscription mati → buang
      if (e?.statusCode !== 410 && e?.statusCode !== 404) {
        keep.push(sub);
      }
    }
  }

  writeSubs(keep);

  return {
    statusCode: 200,
    body: JSON.stringify({ sent: ok, failed: fail, remaining: keep.length }),
  };
};
