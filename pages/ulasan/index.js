import { useState } from "react";

export default function UlasanPage() {
  const [nama, setNama] = useState("");
  const [ratingProduk, setRatingProduk] = useState(5);
  const [ratingToko, setRatingToko] = useState(5);
  const [kritikSaran, setKritikSaran] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/ulasan-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          rating_produk: Number(ratingProduk),
          rating_toko: Number(ratingToko),
          kritik_saran: kritikSaran,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal kirim ulasan");

      setMsg("✅ Terima kasih! Ulasan kamu sudah terkirim.");
      setNama("");
      setRatingProduk(5);
      setRatingToko(5);
      setKritikSaran("");
    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Ulasan</h1>
      <p>Isi ulasan kamu ya 🙏</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Nama
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama kamu"
            required
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <label>
          Rating Produk
          <select
            value={ratingProduk}
            onChange={(e) => setRatingProduk(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          >
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <label>
          Rating Toko
          <select
            value={ratingToko}
            onChange={(e) => setRatingToko(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          >
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <label>
          Kritik & Saran
          <textarea
            value={kritikSaran}
            onChange={(e) => setKritikSaran(e.target.value)}
            placeholder="Tulis kritik & saran kamu..."
            required
            rows={5}
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <button disabled={loading} style={{ padding: 12 }}>
          {loading ? "Mengirim..." : "Kirim Ulasan"}
        </button>

        {msg && <div style={{ padding: 10 }}>{msg}</div>}
      </form>
    </div>
  );
}
