"use client";
import { useState } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function EnablePushButton() {
  const [loading, setLoading] = useState(false);

  async function enablePush() {
    try {
      setLoading(true);

      if (!("serviceWorker" in navigator)) {
        alert("Browser tidak support notifikasi.");
        return;
      }

      // pastikan SW ready
      const reg = await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        alert("Izin notifikasi ditolak.");
        return;
      }

      // ambil VAPID public dari env NEXT_PUBLIC (frontend)
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        alert("NEXT_PUBLIC_VAPID_PUBLIC_KEY belum ada di ENV (frontend).");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // simpan ke backend (Google Sheet)
      const r = await fetch("/.netlify/functions/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      const txt = await r.text();
      if (!r.ok) {
        console.error("subscribe error:", r.status, txt);
        alert("Gagal subscribe: " + txt);
        return;
      }

      console.log("subscribe ok:", txt);
      alert("Notifikasi aktif ✅ (subscriber tersimpan)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={enablePush}
      disabled={loading}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: "#111827",
        color: "white",
      }}
    >
      {loading ? "Memproses..." : "Aktifkan Notifikasi"}
    </button>
  );
}
