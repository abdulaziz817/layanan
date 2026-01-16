import { useEffect, useState } from "react";

export default function UlasanAdminPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/ulasan-list");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Tidak bisa akses admin");
      }

      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 16 }}>
      <h1>Admin Ulasan</h1>

      {loading && <p>Loading...</p>}
      {err && (
        <div style={{ padding: 12, background: "#ffecec" }}>
          <b>Gagal:</b> {err}
          <div style={{ marginTop: 8 }}>
            Kalau ini admin-only, pastikan kamu sudah login dulu.
          </div>
        </div>
      )}

      {!loading && !err && (
        <div style={{ marginTop: 16 }}>
          <button onClick={load} style={{ padding: 10 }}>Refresh</button>
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {items.map((it) => (
              <div key={it.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <b>{it.nama}</b>
                  <small>{new Date(it.created_at).toLocaleString()}</small>
                </div>
                <div style={{ marginTop: 6 }}>
                  Rating Produk: <b>{it.rating_produk}</b> | Rating Toko: <b>{it.rating_toko}</b>
                </div>
                <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                  {it.kritik_saran}
                </div>
              </div>
            ))}
            {items.length === 0 && <p>Belum ada ulasan.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
