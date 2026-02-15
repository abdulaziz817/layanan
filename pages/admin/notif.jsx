"use client";
import { useState } from "react";

export default function AdminNotif() {
  const [title, setTitle] = useState("Layanan Nusantara");
  const [body, setBody] = useState("Bulan Ramadhan sebentar lagi 🌙 Cek promo & reward terbaru!");
  const [url, setUrl] = useState("/");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");

  const send = async () => {
    setStatus("Mengirim...");
    try {
      const res = await fetch("/.netlify/functions/send-notif", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ title, body, url }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(`Gagal: ${res.status} ${data?.message || ""}`);
        return;
      }
      setStatus(`Sukses ✅ sent=${data.sent} failed=${data.failed} remaining=${data.remaining}`);
    } catch (e) {
      setStatus("Error saat mengirim.");
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Admin Notifikasi</h1>
      <p style={{ opacity: 0.7, marginBottom: 16 }}>
        Tulis pesan → kirim ke semua user yang sudah subscribe.
      </p>

      <label>Admin Token</label>
      <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="token rahasia"
        style={{ width: "100%", padding: 12, margin: "8px 0 16px" }} />

      <label>Judul</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: 12, margin: "8px 0 16px" }} />

      <label>Isi Pesan</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)}
        style={{ width: "100%", padding: 12, margin: "8px 0 16px", height: 120 }} />

      <label>Link saat diklik</label>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/"
        style={{ width: "100%", padding: 12, margin: "8px 0 16px" }} />

      <button onClick={send} style={{ width: "100%", padding: 14, fontWeight: 700 }}>
        Kirim Notifikasi
      </button>

      {status && <p style={{ marginTop: 14 }}>{status}</p>}
    </div>
  );
}
