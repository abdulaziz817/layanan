self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title || "Layanan Nusantara", {
      body: data.body || "Ada promo terbaru!",
      icon: data.icon || "/notification-icon.png",
      badge: data.badge || "/notification-badge.png",
      data: { url: data.url || "/" },
      tag: data.tag || "promo",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification?.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const c of clientsArr) {
        if (c.url === urlToOpen && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});
