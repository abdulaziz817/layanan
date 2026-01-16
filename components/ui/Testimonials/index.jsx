import { useEffect, useMemo, useState } from "react";
import RatingStars from "../RatingStars";

export default function UlasanPage() {
  const [nama, setNama] = useState("");
  const [ratingProduk, setRatingProduk] = useState(5);
  const [ratingToko, setRatingToko] = useState(5);
  const [kritikSaran, setKritikSaran] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // {type:'ok'|'err', text:''}

  // simple responsive detector (tanpa tailwind, tetap inline style)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const canSubmit = useMemo(() => {
    return (
      !loading &&
      nama.trim().length >= 2 &&
      kritikSaran.trim().length >= 5 &&
      [1, 2, 3, 4, 5].includes(Number(ratingProduk)) &&
      [1, 2, 3, 4, 5].includes(Number(ratingToko))
    );
  }, [loading, nama, kritikSaran, ratingProduk, ratingToko]);

  async function submit(e) {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/ulasan-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          rating_produk: Number(ratingProduk),
          rating_toko: Number(ratingToko),
          kritik_saran: kritikSaran.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || "Gagal kirim ulasan");

      setToast({ type: "ok", text: "Terima kasih! Ulasan kamu sudah terkirim ✅" });
      setNama("");
      setRatingProduk(5);
      setRatingToko(5);
      setKritikSaran("");
    } catch (err) {
      setToast({ type: "err", text: err.message || "Terjadi kesalahan" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.shell}>
        {/* ====== HEADER (referensi: Apa Kata Mereka) ====== */}
        <div style={s.header}>
          <h2 style={s.title}>Tulis Ulasan</h2>
          <p style={s.desc}>
            Layanan Nusantara selalu berusaha memberikan layanan terbaik. Ceritakan pengalaman kamu—kritik & saran
            singkat juga sangat membantu.
          </p>
        </div>

        {/* ====== CONTENT GRID ====== */}
        <div
          style={{
            ...s.grid,
            gridTemplateColumns: isMobile ? "1fr" : "1.35fr 0.65fr",
          }}
        >
          {/* FORM */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <div>
                <div style={s.cardTitle}>Isi ulasan kamu ya 🙏</div>
                <div style={s.cardSub}>Ulasan ini private. Hanya founder yang bisa lihat.</div>
              </div>

              <div style={s.privacyBadge}>
                <div style={{ fontWeight: 900, color: "#0F172A" }}>Privasi</div>
                <div style={{ color: "#64748B", fontSize: 12 }}>Founder only</div>
              </div>
            </div>

            <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 12 }}>
              <div style={s.field}>
                <label style={s.label}>Nama</label>
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama kamu"
                  style={s.input}
                />
                <div style={s.hint}>Minimal 2 karakter.</div>
              </div>

              <div
                style={{
                  ...s.twoCol,
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                }}
              >
                <div style={s.miniCard}>
                  <RatingStars label="Rating Produk" value={ratingProduk} onChange={setRatingProduk} />
                </div>
                <div style={s.miniCard}>
                  <RatingStars label="Rating Toko" value={ratingToko} onChange={setRatingToko} />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Kritik & Saran</label>
                <textarea
                  value={kritikSaran}
                  onChange={(e) => setKritikSaran(e.target.value)}
                  placeholder="Tulis kritik & saran kamu..."
                  rows={isMobile ? 5 : 6}
                  style={s.textarea}
                />
                <div style={s.hint}>Minimal 5 karakter.</div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  ...s.button,
                  opacity: canSubmit ? 1 : 0.55,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                }}
              >
                {loading ? "Mengirim..." : "Kirim Ulasan"}
              </button>

              {toast && (
                <div
                  style={{
                    ...s.toast,
                    borderColor:
                      toast.type === "ok" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)",
                    background:
                      toast.type === "ok" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                    color: toast.type === "ok" ? "#065F46" : "#991B1B",
                  }}
                >
                  {toast.text}
                </div>
              )}
            </form>
          </div>

          {/* SIDE */}
          <div style={{ display: "grid", gap: 14 }}>
            <div style={s.sideCard}>
              <div style={s.sideTitle}>Yang paling membantu</div>
              <div style={s.sideText}>
                • Apa yang harus kami perbaiki?
                <br />• Bagian mana yang bikin bingung?
                <br />• Kalau ada saran fitur, tulis aja.
              </div>
            </div>

            <div style={s.sideCard}>
              <div style={s.sideTitle}>Catatan</div>
              <div style={s.sideText}>
                Ulasan langsung tersimpan ke sistem (Google Sheets). Tidak ditampilkan publik.
              </div>
            </div>
          </div>
        </div>

        {/* spacing bawah biar enak di HP */}
        <div style={{ height: isMobile ? 24 : 10 }} />
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "calc(100vh - 80px)",
    padding: "56px 16px",
    background:
      "radial-gradient(900px 520px at 15% 0%, rgba(15,23,42,0.10), transparent 60%), radial-gradient(900px 520px at 85% 0%, rgba(99,102,241,0.12), transparent 60%), linear-gradient(180deg, #fff 0%, #F8FAFC 100%)",
  },

  shell: { maxWidth: 1120, margin: "0 auto" },

  /* header referensi */
  header: { textAlign: "center", marginBottom: 28 },
  title: {
    margin: 0,
    fontSize: 40,
    fontWeight: 800,
    color: "#1F2937",
    letterSpacing: "-0.04em",
  },
  desc: {
    marginTop: 12,
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: 620,
    fontSize: 18,
    lineHeight: 1.7,
    color: "#4B5563",
  },

  grid: { display: "grid", gap: 16, alignItems: "start" },

  card: {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 18px 50px rgba(2,6,23,0.08)",
    padding: 18,
    backdropFilter: "blur(10px)",
  },

  cardHead: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  cardTitle: { fontSize: 16, fontWeight: 950, color: "#0F172A" },
  cardSub: { marginTop: 4, color: "#64748B", fontSize: 13, lineHeight: 1.6 },

  privacyBadge: {
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(248,250,252,0.75)",
    padding: "10px 12px",
    minWidth: 160,
    boxShadow: "0 10px 30px rgba(2,6,23,0.06)",
  },

  field: { display: "grid", gap: 8 },
  label: { fontSize: 12, color: "#0F172A", fontWeight: 900, letterSpacing: "0.02em" },
  hint: { fontSize: 12, color: "#94A3B8" },

  input: {
    width: "100%",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    background: "rgba(255,255,255,0.95)",
  },

  textarea: {
    width: "100%",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    background: "rgba(255,255,255,0.95)",
    resize: "vertical",
  },

  twoCol: { display: "grid", gap: 12 },

  miniCard: {
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(248,250,252,0.75)",
    padding: 14,
  },

  button: {
    marginTop: 2,
    borderRadius: 16,
    padding: "13px 14px",
    border: "1px solid #0F172A",
    background: "#0F172A",
    color: "#fff",
    fontWeight: 950,
    letterSpacing: "0.01em",
  },

  toast: {
    borderRadius: 16,
    border: "1px solid",
    padding: "12px 14px",
    fontWeight: 800,
    lineHeight: 1.5,
  },

  sideCard: {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.86)",
    boxShadow: "0 12px 40px rgba(2,6,23,0.06)",
    padding: 16,
  },
  sideTitle: { fontWeight: 950, color: "#0F172A", marginBottom: 8 },
  sideText: { color: "#64748B", lineHeight: 1.75, fontSize: 14 },
};
