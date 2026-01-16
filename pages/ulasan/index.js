import { useEffect, useMemo, useState } from "react";
import RatingStars from "../../components/ui/RatingStars";

function useBreakpoints() {
  const [w, setW] = useState(1200);

  useEffect(() => {
    const onResize = () => setW(window.innerWidth || 1200);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = w < 640;   // HP
  const isTablet = w >= 640 && w < 1024; // Tablet
  const isDesktop = w >= 1024;

  return { w, isMobile, isTablet, isDesktop };
}

export default function UlasanPage() {
  const { isMobile, isTablet } = useBreakpoints();

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

  // ====== RESPONSIVE LAYOUT TOKENS ======
  const containerPadX = isMobile ? 16 : 24;
  const sectionPadY = isMobile ? 44 : isTablet ? 64 : 80;

  const gridCols = isMobile ? "1fr" : "1.35fr 0.65fr";
  const gridGap = isMobile ? 14 : 16;

  const titleSize = isMobile ? 28 : isTablet ? 34 : 40;
  const descSize = isMobile ? 15 : 18;

  const cardPad = isMobile ? 16 : 18;
  const inputPad = isMobile ? "12px 12px" : "12px 14px";

  const ratingCols = isMobile ? "1fr" : "1fr 1fr";

  return (
<div style={s.page}>
  <div
    style={{
      ...s.shell,
      paddingLeft: containerPadX,
      paddingRight: containerPadX,

      /* OFFSET NAVBAR */
      paddingTop: `calc(${sectionPadY}px + clamp(70px, 8vw, 100px))`,
      paddingBottom: sectionPadY,
    }}
  >
    {/* ===== HEADER (sesuai referensi) ===== */}
    <div style={{ ...s.header, marginBottom: isMobile ? 18 : 28 }}>
      <h2 style={{ ...s.h2, fontSize: titleSize }}>
        Ulasan
      </h2>

      <p style={{ ...s.p, fontSize: descSize }}>
        Bagikan pengalaman Anda tentang layanan kami.
      </p>
    </div>

        {/* ===== CONTENT ===== */}
        <div style={{ ...s.grid, gridTemplateColumns: gridCols, gap: gridGap }}>
          {/* FORM */}
          <div style={{ ...s.card, padding: cardPad }}>
            <div style={s.cardTop}>
              <div>
                <div style={s.cardTitle}>Tulis Ulasan</div>
                <div style={s.cardSub}>
                  Isi ulasan dengan jujur—singkat aja gak apa.
                </div>
              </div>

             
            </div>

            <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 14 }}>
              <div style={s.field}>
                <label style={s.label}>Nama</label>
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama kamu"
                  style={{ ...s.input, padding: inputPad }}
                />
                <div style={s.hint}>Minimal 2 karakter.</div>
              </div>

              <div style={{ ...s.twoCol, gridTemplateColumns: ratingCols }}>
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
                  rows={isMobile ? 5 : 7}
                  style={{ ...s.textarea, padding: inputPad }}
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
                      toast.type === "ok"
                        ? "rgba(16,185,129,0.30)"
                        : "rgba(239,68,68,0.30)",
                    background:
                      toast.type === "ok"
                        ? "rgba(16,185,129,0.08)"
                        : "rgba(239,68,68,0.08)",
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
            <div style={{ ...s.sideCard, padding: cardPad }}>
              <div style={s.sideTitle}>Ceritakan pengalaman kamu</div>
              <div style={s.sideText}>
                • Ceritakan pengalaman kamu
                <br />• Sebutkan hal yang perlu diperbaiki
                <br />• Kalau ada saran fitur, tulis aja.
              </div>
            </div>

            <div style={{ ...s.sideCard, padding: cardPad }}>
              <div style={s.sideTitle}>Catatan</div>
              <div style={s.sideText}>
                Ulasan langsung tersimpan ke sistem. Tidak ditampilkan publik.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  // background putih doang (sesuai permintaan)
  page: {
    minHeight: "calc(100vh - 80px)",
    background: "#FFFFFF",
  },

  // container mirip max-w-7xl mx-auto px-6
  shell: {
    maxWidth: 1280,
    margin: "0 auto",
  },

  // header referensi "text-center mb-14"
  header: {
    textAlign: "center",
  },

  // h2 text-4xl font-bold text-gray-800
  h2: {
    margin: 0,
    fontWeight: 800,
    color: "#1F2937",
    letterSpacing: "-0.02em",
  },

  // p text-lg text-gray-600 mt-4 max-w-xl mx-auto
  p: {
    marginTop: 12,
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: 620,
    lineHeight: 1.75,
    color: "#4B5563",
  },

  grid: {
    display: "grid",
    alignItems: "start",
  },

  card: {
    borderRadius: 18,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    boxShadow: "0 10px 30px rgba(17,24,39,0.06)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: "#111827",
  },

  cardSub: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 1.6,
  },

  privacy: {
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    padding: "10px 12px",
    boxShadow: "0 10px 20px rgba(17,24,39,0.05)",
  },

  field: { display: "grid", gap: 8 },

  label: {
    fontSize: 13,
    color: "#111827",
    fontWeight: 800,
  },

  hint: { fontSize: 12, color: "#9CA3AF" },

  input: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    fontSize: 14,
    outline: "none",
    background: "#FFFFFF",
  },

  textarea: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    fontSize: 14,
    outline: "none",
    background: "#FFFFFF",
    resize: "vertical",
  },

  twoCol: {
    display: "grid",
    gap: 12,
  },

  miniCard: {
    borderRadius: 16,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    padding: 14,
  },

  button: {
    marginTop: 4,
    borderRadius: 14,
    padding: "13px 14px",
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    fontWeight: 900,
    letterSpacing: "0.01em",
  },

  toast: {
    borderRadius: 14,
    border: "1px solid",
    padding: "12px 14px",
    fontWeight: 800,
    lineHeight: 1.5,
  },

  sideCard: {
    borderRadius: 18,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    boxShadow: "0 10px 30px rgba(17,24,39,0.06)",
  },

  sideTitle: { fontWeight: 900, color: "#111827", marginBottom: 8 },

  sideText: { color: "#6B7280", lineHeight: 1.75, fontSize: 14 },
};
