// public/sw-custom.js

const DEFAULTS = {
  title: "Layanan Nusantara",
  body: "Bulan Ramadhan sebentar lagi 🌙 Cek promo & reward terbaru!",
  url: "/",
  icon: "/notification-icon.png",
  badge: "/notification-badge.png",
  image: "/cta-image.jpg", // optional (hapus kalau nggak mau)
  tag: "ln-promo-ramadhan",
};

self.addEventListener("push", (event) => {
  let payload = {};

  // ✅ Aman untuk payload JSON / text
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    try {
      payload = { body: event.data ? event.data.text() : DEFAULTS.body };
    } catch (err) {
      payload = {};
    }
  }

  const title = payload.title || DEFAULTS.title;

  const options = {
    body: payload.body || DEFAULTS.body,
    icon: payload.icon || DEFAULTS.icon,
    badge: payload.badge || DEFAULTS.badge,

    // ✅ Link tujuan saat diklik (default: home)
    data: {
      url: payload.url || DEFAULTS.url,
    },

    // ✅ Biar notif “update” bukan numpuk
    tag: payload.tag || DEFAULTS.tag,
    renotify: true,

    // ✅ Optional: gambar besar di notifikasi (Android biasanya tampil)
    ...(payload.image ? { image: payload.image } : { image: DEFAULTS.image }),

    // ✅ Optional: tombol aksi
    actions: [
      { action: "open", title: "Buka" },
      { action: "dismiss", title: "Tutup" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // kalau user klik tombol
  if (event.action === "dismiss") return;

  const urlToOpen = new URL(
    event.notification?.data?.url || DEFAULTS.url,
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      // ✅ kalau sudah ada tabnya, fokus ke situ
      for (const client of clientsArr) {
        if (client.url === urlToOpen && "focus" in client) return client.focus();
      }
      // ✅ kalau belum ada, buka baru
      return self.clients.openWindow(urlToOpen);
    })
  );
});
