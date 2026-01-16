import { useMemo, useState } from "react";
import RatingStars from "../../components/ui/RatingStars";

export default function UlasanPage() {
  const [nama, setNama] = useState("");
  const [ratingProduk, setRatingProduk] = useState(5);
  const [ratingToko, setRatingToko] = useState(5);
  const [kritikSaran, setKritikSaran] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // {type:'ok'|'err', text:''}

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
        <div style={s.hero}>
          <div>
            <div style={s.kicker}>Layanan Nusantara</div>
            <h1 style={s.h1}>Tulis Ulasan</h1>
            <p style={s.sub}>
              Bantu kami makin rapi dan cepat. Isi ulasan dengan jujur—singkat aja gak apa.
            </p>
          </div>

          <div style={s.pill}>
            <div style={{ fontWeight: 800, color: "#0F172A" }}>Privasi</div>
            <div style={{ color: "#64748B", fontSize: 13 }}>
              Hanya founder yang bisa lihat ulasan.
            </div>
          </div>
        </div>

        <div style={s.grid}>
          {/* FORM */}
          <div style={s.card}>
            <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
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

              <div style={s.twoCol}>
                <div style={s.miniCard}>
                  <RatingStars
                    label="Rating Produk"
                    value={ratingProduk}
                    onChange={setRatingProduk}
                  />
                </div>
                <div style={s.miniCard}>
                  <RatingStars
                    label="Rating Toko"
                    value={ratingToko}
                    onChange={setRatingToko}
                  />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Kritik & Saran</label>
                <textarea
                  value={kritikSaran}
                  onChange={(e) => setKritikSaran(e.target.value)}
                  placeholder="Tulis kritik & saran kamu..."
                  rows={6}
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
                    borderColor: toast.type === "ok" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)",
                    background: toast.type === "ok" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
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
                • Apa yang harus kami perbaiki?<br />
                • Bagian mana yang bikin bingung?<br />
                • Kalau ada saran fitur, tulis aja.
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
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "calc(100vh - 80px)",
    padding: "52px 16px",
    background:
      "radial-gradient(900px 500px at 15% 0%, rgba(15,23,42,0.10), transparent 60%), radial-gradient(900px 500px at 85% 0%, rgba(99,102,241,0.12), transparent 60%), linear-gradient(180deg, #fff 0%, #F8FAFC 100%)",
  },
  shell: { maxWidth: 1040, margin: "0 auto" },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-end",
    marginBottom: 18,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#64748B",
    fontWeight: 800,
  },
  h1: {
    margin: "8px 0 8px",
    fontSize: 40,
    letterSpacing: "-0.04em",
    color: "#0F172A",
    lineHeight: 1.05,
  },
  sub: { margin: 0, color: "#64748B", lineHeight: 1.7, maxWidth: 640 },

  pill: {
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.8)",
    padding: "12px 14px",
    boxShadow: "0 10px 30px rgba(2,6,23,0.06)",
    minWidth: 220,
  },

  grid: { display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 14 },
  card: {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.85)",
    boxShadow: "0 18px 50px rgba(2,6,23,0.08)",
    padding: 18,
    backdropFilter: "blur(10px)",
  },

  field: { display: "grid", gap: 8 },
  label: { fontSize: 12, color: "#0F172A", fontWeight: 800 },
  hint: { fontSize: 12, color: "#94A3B8" },

  input: {
    width: "100%",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    background: "rgba(255,255,255,0.9)",
  },
  textarea: {
    width: "100%",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    background: "rgba(255,255,255,0.9)",
    resize: "vertical",
  },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  miniCard: {
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(248,250,252,0.75)",
    padding: 14,
  },

  button: {
    marginTop: 4,
    borderRadius: 16,
    padding: "13px 14px",
    border: "1px solid #0F172A",
    background: "#0F172A",
    color: "#fff",
    fontWeight: 900,
    letterSpacing: "0.01em",
  },

  toast: {
    borderRadius: 16,
    border: "1px solid",
    padding: "12px 14px",
    fontWeight: 700,
  },

  sideCard: {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.8)",
    boxShadow: "0 12px 40px rgba(2,6,23,0.06)",
    padding: 16,
  },
  sideTitle: { fontWeight: 900, color: "#0F172A", marginBottom: 8 },
  sideText: { color: "#64748B", lineHeight: 1.75, fontSize: 14 },

  // responsive fallback (biar gak pecah)
  "@media": {},
};
