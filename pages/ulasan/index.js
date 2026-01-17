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
    <div className="ulasan-page">
      {/* CSS RESPONSIVE (GLOBAL DI KOMPONEN INI) */}
      <style>{`
        /* ===== Base reset kecil biar layout stabil di semua device ===== */
        .ulasan-page, .ulasan-page * { box-sizing: border-box; }
        .ulasan-page { background:#fff; min-height: 100vh; }

        /* ===== Container utama ===== */
        .ulasan-shell{
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          /* aman untuk notch & nav gesture */
          padding-left: max(16px, env(safe-area-inset-left));
          padding-right: max(16px, env(safe-area-inset-right));

          /* OFFSET NAVBAR: gunakan variable biar gampang */
          padding-top: calc(var(--sectionY) + var(--navbarOffset));
          padding-bottom: var(--sectionY);
        }

        /* default: desktop */
        .ulasan-shell{
          --sectionY: 80px;
          --navbarOffset: clamp(70px, 8vw, 100px);
        }

        /* tablet */
        @media (max-width: 1023.98px){
          .ulasan-shell{
            --sectionY: 64px;
          }
        }

        /* mobile */
        @media (max-width: 639.98px){
          .ulasan-shell{
            --sectionY: 44px;
          }
        }

        /* ===== Header ===== */
        .ulasan-header{
          text-align: center;
          margin-bottom: 28px;
        }

        .ulasan-title{
          margin: 0;
          font-weight: 800;
          color: #1F2937;
          letter-spacing: -0.02em;
          font-size: 40px; /* desktop */
          line-height: 1.15;
        }

        .ulasan-desc{
          margin: 12px auto 0;
          max-width: 620px;
          line-height: 1.75;
          color: #4B5563;
          font-size: 18px; /* desktop */
        }

        @media (max-width: 1023.98px){
          .ulasan-title{ font-size: 34px; }
          .ulasan-desc{ font-size: 17px; }
          .ulasan-header{ margin-bottom: 24px; }
        }

        @media (max-width: 639.98px){
          .ulasan-title{ font-size: 28px; }
          .ulasan-desc{ font-size: 15px; }
          .ulasan-header{ margin-bottom: 18px; }
        }

        /* ===== Layout grid utama ===== */
        .ulasan-grid{
          display: grid;
          align-items: start;
          gap: 16px;
          grid-template-columns: 1.35fr 0.65fr; /* desktop */
        }

        /* tablet & mobile: jadi 1 kolom biar aman */
        @media (max-width: 1023.98px){
          .ulasan-grid{
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }

        /* ===== Card umum ===== */
        .card{
          border-radius: 18px;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          box-shadow: 0 10px 30px rgba(17,24,39,0.06);
        }

        .card-pad{
          padding: 18px; /* desktop */
        }
        @media (max-width: 639.98px){
          .card-pad{ padding: 16px; }
        }

        /* ===== Card header form ===== */
        .card-top{
          display:flex;
          justify-content: space-between;
          align-items:flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }

        .card-title{
          font-size: 18px;
          font-weight: 900;
          color: #111827;
          margin: 0;
        }

        .card-sub{
          margin-top: 6px;
          font-size: 14px;
          color: #6B7280;
          line-height: 1.6;
        }

        /* ===== Form ===== */
        .form{
          display: grid;
          gap: 14px;
          margin-top: 14px;
        }

        .field{
          display: grid;
          gap: 8px;
          min-width: 0; /* penting biar input gak overflow */
        }

        .label{
          font-size: 13px;
          color: #111827;
          font-weight: 800;
        }

        .hint{
          font-size: 12px;
          color: #9CA3AF;
        }

        .input, .textarea{
          width: 100%;
          border-radius: 14px;
          border: 1px solid #E5E7EB;
          font-size: 14px;
          outline: none;
          background: #FFFFFF;
          padding: 12px 14px; /* desktop */
          min-width: 0;
        }

        @media (max-width: 639.98px){
          .input, .textarea{
            padding: 12px 12px;
          }
        }

        .textarea{
          resize: vertical;
        }

        /* ===== Rating area ===== */
        .rating-grid{
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr 1fr; /* desktop & tablet */
        }

        /* mobile: stack */
        @media (max-width: 639.98px){
          .rating-grid{
            grid-template-columns: 1fr;
          }
        }

        .mini-card{
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          padding: 14px;
          min-width: 0;
        }

        /* ===== Button ===== */
        .btn{
          margin-top: 4px;
          border-radius: 14px;
          padding: 13px 14px;
          border: 1px solid #111827;
          background: #111827;
          color: #fff;
          font-weight: 900;
          letter-spacing: 0.01em;
          width: 100%;
        }

        .btn:disabled{
          opacity: 0.55;
          cursor: not-allowed;
        }
        .btn:not(:disabled){
          cursor: pointer;
        }

        /* ===== Toast ===== */
        .toast{
          border-radius: 14px;
          border: 1px solid;
          padding: 12px 14px;
          font-weight: 800;
          line-height: 1.5;
        }

        .toast.ok{
          border-color: rgba(16,185,129,0.30);
          background: rgba(16,185,129,0.08);
          color: #065F46;
        }
        .toast.err{
          border-color: rgba(239,68,68,0.30);
          background: rgba(239,68,68,0.08);
          color: #991B1B;
        }

        /* ===== Side area ===== */
        .side-wrap{
          display: grid;
          gap: 14px;
        }

        /* tablet: side cards jadi 2 kolom biar enak (opsional & rapi) */
        @media (min-width: 640px) and (max-width: 1023.98px){
          .side-wrap{
            grid-template-columns: 1fr 1fr;
          }
        }

        /* mobile: tetap 1 kolom */
        @media (max-width: 639.98px){
          .side-wrap{
            grid-template-columns: 1fr;
          }
        }

        .side-title{
          font-weight: 900;
          color: #111827;
          margin-bottom: 8px;
        }

        .side-text{
          color: #6B7280;
          line-height: 1.75;
          font-size: 14px;
        }
      `}</style>

      <div className="ulasan-shell">
        {/* HEADER */}
        <div className="ulasan-header">
          <h2 className="ulasan-title">Ulasan</h2>
          <p className="ulasan-desc">Bagikan pengalaman Anda tentang layanan kami.</p>
        </div>

        {/* CONTENT */}
        <div className="ulasan-grid">
          {/* FORM */}
          <div className="card card-pad">
            <div className="card-top">
              <div>
                <div className="card-title">Tulis Ulasan</div>
                <div className="card-sub">Isi ulasan dengan jujur—singkat aja gak apa.</div>
              </div>
            </div>

            <form onSubmit={submit} className="form">
              <div className="field">
                <label className="label">Nama</label>
                <input
                  className="input"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama kamu"
                />
                <div className="hint">Minimal 2 karakter.</div>
              </div>

              <div className="rating-grid">
                <div className="mini-card">
                  <RatingStars label="Rating Produk" value={ratingProduk} onChange={setRatingProduk} />
                </div>
                <div className="mini-card">
                  <RatingStars label="Rating Toko" value={ratingToko} onChange={setRatingToko} />
                </div>
              </div>

              <div className="field">
                <label className="label">Kritik &amp; Saran</label>
                <textarea
                  className="textarea"
                  value={kritikSaran}
                  onChange={(e) => setKritikSaran(e.target.value)}
                  placeholder="Tulis kritik & saran kamu..."
                  rows={6}
                />
                <div className="hint">Minimal 5 karakter.</div>
              </div>

              <button type="submit" className="btn" disabled={!canSubmit}>
                {loading ? "Mengirim..." : "Kirim Ulasan"}
              </button>

              {toast && (
                <div className={`toast ${toast.type === "ok" ? "ok" : "err"}`}>{toast.text}</div>
              )}
            </form>
          </div>

          {/* SIDE */}
          <div className="side-wrap">
            <div className="card card-pad">
              <div className="side-title">Ceritakan pengalaman kamu</div>
              <div className="side-text">
                • Ceritakan pengalaman kamu
                <br />• Sebutkan hal yang perlu diperbaiki
                <br />• Kalau ada saran fitur, tulis aja.
              </div>
            </div>

            <div className="card card-pad">
              <div className="side-title">Catatan</div>
              <div className="side-text">Ulasan langsung akan di tempilkan di halaman Utama</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
