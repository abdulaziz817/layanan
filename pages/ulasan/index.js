import { useMemo, useState } from "react";
import RatingStars from "../../components/ui/RatingStars";

export default function UlasanPage() {
  const [nama, setNama] = useState("");
  const [ratingProduk, setRatingProduk] = useState(5);
  const [ratingToko, setRatingToko] = useState(5);
  const [kritikSaran, setKritikSaran] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: nama.trim(),
          rating_produk: Number(ratingProduk),
          rating_toko: Number(ratingToko),
          kritik_saran: kritikSaran.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Gagal mengirim ulasan"
        );
      }

      setToast({
        type: "ok",
        text: "Terima kasih! Ulasan kamu sudah terkirim.",
      });

      setNama("");
      setRatingProduk(5);
      setRatingToko(5);
      setKritikSaran("");
    } catch (err) {
      setToast({
        type: "err",
        text: err?.message || "Terjadi kesalahan saat mengirim ulasan.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ulasan-page">
      <div className="ulasan-shell">
        <div className="ulasan-header">
          <h1 className="ulasan-title">Ulasan</h1>
          <p className="ulasan-desc">
            Bagikan pengalaman Anda tentang layanan kami.
          </p>
        </div>

        <div className="ulasan-grid">
          <div className="card card-pad">
            <div className="card-top">
              <div>
                <div className="card-title">Tulis Ulasan</div>
                <div className="card-sub">
                  Isi ulasan dengan jujur. Singkat juga tidak apa-apa.
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="form">
              <div className="field">
                <label htmlFor="nama" className="label">
                  Nama
                </label>
                <input
                  id="nama"
                  type="text"
                  className="input"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama kamu"
                  autoComplete="name"
                />
                <div className="hint">Minimal 2 karakter.</div>
              </div>

              <div className="rating-grid">
                <div className="mini-card">
                  <RatingStars
                    label="Rating Produk"
                    value={ratingProduk}
                    onChange={setRatingProduk}
                  />
                </div>

                <div className="mini-card">
                  <RatingStars
                    label="Rating Toko"
                    value={ratingToko}
                    onChange={setRatingToko}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="kritikSaran" className="label">
                  Kritik dan Saran
                </label>
                <textarea
                  id="kritikSaran"
                  className="textarea"
                  value={kritikSaran}
                  onChange={(e) => setKritikSaran(e.target.value)}
                  placeholder="Tulis kritik dan saran kamu di sini..."
                  rows={6}
                />
                <div className="hint">Minimal 5 karakter.</div>
              </div>

              <button
                type="submit"
                className="btn"
                disabled={!canSubmit}
              >
                {loading ? "Mengirim..." : "Kirim Ulasan"}
              </button>

              {toast && (
                <div className={`toast ${toast.type === "ok" ? "ok" : "err"}`}>
                  {toast.text}
                </div>
              )}
            </form>
          </div>

          <div className="side-wrap">
            <div className="card card-pad">
              <div className="side-title">Ceritakan pengalaman kamu</div>
              <div className="side-text">
                • Ceritakan pengalaman kamu.
                <br />
                • Sebutkan hal yang perlu diperbaiki.
                <br />
                • Kalau ada saran fitur, tulis saja.
              </div>
            </div>

            <div className="card card-pad">
              <div className="side-title">Catatan</div>
              <div className="side-text">
                Ulasan yang masuk akan langsung ditampilkan di halaman utama.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ulasan-page,
        .ulasan-page * {
          box-sizing: border-box;
        }

        .ulasan-page {
          background: #ffffff;
          min-height: 100vh;
        }

        .ulasan-shell {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding-left: max(16px, env(safe-area-inset-left));
          padding-right: max(16px, env(safe-area-inset-right));
          padding-top: calc(var(--sectionY) + var(--navbarOffset));
          padding-bottom: var(--sectionY);
          --sectionY: 80px;
          --navbarOffset: clamp(70px, 8vw, 100px);
        }

        @media (max-width: 1023.98px) {
          .ulasan-shell {
            --sectionY: 64px;
          }
        }

        @media (max-width: 639.98px) {
          .ulasan-shell {
            --sectionY: 44px;
          }
        }

        .ulasan-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .ulasan-title {
          margin: 0;
          font-weight: 800;
          color: #1f2937;
          letter-spacing: -0.02em;
          font-size: 40px;
          line-height: 1.15;
        }

        .ulasan-desc {
          margin: 12px auto 0;
          max-width: 620px;
          line-height: 1.75;
          color: #4b5563;
          font-size: 18px;
        }

        @media (max-width: 1023.98px) {
          .ulasan-title {
            font-size: 34px;
          }

          .ulasan-desc {
            font-size: 17px;
          }

          .ulasan-header {
            margin-bottom: 24px;
          }
        }

        @media (max-width: 639.98px) {
          .ulasan-title {
            font-size: 28px;
          }

          .ulasan-desc {
            font-size: 15px;
          }

          .ulasan-header {
            margin-bottom: 18px;
          }
        }

        .ulasan-grid {
          display: grid;
          align-items: start;
          gap: 16px;
          grid-template-columns: 1.35fr 0.65fr;
        }

        @media (max-width: 1023.98px) {
          .ulasan-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }

        .card {
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(17, 24, 39, 0.06);
        }

        .card-pad {
          padding: 18px;
        }

        @media (max-width: 639.98px) {
          .card-pad {
            padding: 16px;
          }
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }

        .card-title {
          font-size: 18px;
          font-weight: 900;
          color: #111827;
          margin: 0;
        }

        .card-sub {
          margin-top: 6px;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
        }

        .form {
          display: grid;
          gap: 14px;
          margin-top: 14px;
        }

        .field {
          display: grid;
          gap: 8px;
          min-width: 0;
        }

        .label {
          font-size: 13px;
          color: #111827;
          font-weight: 800;
        }

        .hint {
          font-size: 12px;
          color: #9ca3af;
        }

        .input,
        .textarea {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          padding: 12px 14px;
          min-width: 0;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        @media (max-width: 639.98px) {
          .input,
          .textarea {
            padding: 12px 12px;
          }
        }

        .input:focus,
        .textarea:focus {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }

        .textarea {
          resize: vertical;
        }

        .rating-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 639.98px) {
          .rating-grid {
            grid-template-columns: 1fr;
          }
        }

        .mini-card {
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          padding: 14px;
          min-width: 0;
        }

        .btn {
          margin-top: 4px;
          border-radius: 14px;
          padding: 13px 14px;
          border: 1px solid #111827;
          background: #111827;
          color: #ffffff;
          font-weight: 900;
          letter-spacing: 0.01em;
          width: 100%;
          transition: opacity 0.2s ease;
        }

        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .btn:not(:disabled) {
          cursor: pointer;
        }

        .btn:not(:disabled):hover {
          opacity: 0.95;
        }

        .toast {
          border-radius: 14px;
          border: 1px solid;
          padding: 12px 14px;
          font-weight: 800;
          line-height: 1.5;
        }

        .ok {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.08);
          color: #065f46;
        }

        .err {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.08);
          color: #991b1b;
        }

        .side-wrap {
          display: grid;
          gap: 14px;
        }

        @media (min-width: 640px) and (max-width: 1023.98px) {
          .side-wrap {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 639.98px) {
          .side-wrap {
            grid-template-columns: 1fr;
          }
        }

        .side-title {
          font-weight: 900;
          color: #111827;
          margin-bottom: 8px;
        }

        .side-text {
          color: #6b7280;
          line-height: 1.75;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}