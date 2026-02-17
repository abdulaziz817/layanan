import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

function labelType(t) {
  if (t === "premium_app") return "Aplikasi Premium";
  if (t === "design") return "Desain";
  if (t === "web_dev") return "Web Developer";
  return t || "-";
}

export default function Promo() {
  const router = useRouter();
  const [me, setMe] = useState(null);

  const [judul, setJudul] = useState("Promo Ramadhan");
  const [kategori, setKategori] = useState("");
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const isAdmin = useMemo(
    () => String(me?.user?.supplier_type || "").toUpperCase() === "ALL",
    [me]
  );

  useEffect(() => {
    async function init() {
      const r = await fetch("/api/auth/me");
      const j = await r.json();
      if (!j.loggedIn) return router.replace("/admin/login");

      setMe(j);

      const st = j.user?.supplier_type;
      if (String(st).toUpperCase() !== "ALL") {
        setKategori(st);
      }
    }
    init();
  }, [router]);

  async function generate() {
    setErr("");
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (judul) qs.set("title", judul);
      if (kategori) qs.set("type", kategori);

      const r = await fetch(`/api/promo?${qs.toString()}`);
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Gagal generate");

      setText(j.text || "");
      setCount(j.count || 0);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(text || "");
    alert("Berhasil di-copy!");
  }

  function downloadTxt() {
    const blob = new Blob([text || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${judul.replaceAll(" ", "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div>
          <div className="title">Generator Promo</div>
          <div className="sub">
            Buat teks promo otomatis dari Google Sheets • Total produk: <b>{count}</b>
          </div>
        </div>

        <button className="btnOutline" onClick={() => router.push("/admin/products")}>
          Kembali
        </button>
      </div>

      {err && <div className="errorBox">{err}</div>}

      {/* Card */}
      <div className="card">
        <div className="grid2">
          <div>
            <div className="label">Judul Promo</div>
            <input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="input"
              placeholder="Contoh: Promo Ramadhan"
            />
          </div>

          <div>
            <div className="label">Kategori</div>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              disabled={!isAdmin}
              className="input"
            >
              <option value="">{isAdmin ? "Semua Kategori" : labelType(kategori)}</option>
              <option value="premium_app">Aplikasi Premium</option>
              <option value="design">Desain</option>
              <option value="web_dev">Web Developer</option>
            </select>

            {!isAdmin && (
              <div className="note">
                *Kategori dikunci sesuai role kamu.
              </div>
            )}
          </div>
        </div>

        <div className="btnRow">
          <button className="btnPrimary" onClick={generate} disabled={loading}>
            {loading ? "Memproses..." : "Generate Promo"}
          </button>
          <button className="btn" onClick={copy} disabled={!text}>
            Copy
          </button>
          <button className="btn" onClick={downloadTxt} disabled={!text}>
            Download .txt
          </button>
        </div>
      </div>

      {/* Result */}
      <div className="card">
        <div className="resultHead">
          <div className="labelBig">Hasil Promo</div>
          <div className="muted">Tips: klik Generate dulu, lalu Copy</div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="textarea"
          rows={18}
          placeholder="Klik Generate Promo..."
        />
      </div>

      <style jsx>{`
        .page {
          max-width: 1000px;
          margin: 24px auto;
          padding: 0 14px;
          font-family: system-ui, Arial;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          border-bottom: 1px solid #eee;
          padding-bottom: 12px;
        }

        .title {
          font-size: 22px;
          font-weight: 800;
        }

        .sub {
          font-size: 13px;
          opacity: 0.75;
          margin-top: 4px;
        }

        .card {
          margin-top: 16px;
          background: white;
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 16px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.04);
        }

        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .label {
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .labelBig {
          font-size: 15px;
          font-weight: 800;
        }

        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e6e6e6;
          border-radius: 10px;
          font-size: 14px;
        }

        .textarea {
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #e6e6e6;
          font-family: monospace;
          resize: vertical;
        }

        .btnRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .btn {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #e6e6e6;
          background: white;
          cursor: pointer;
          font-weight: 600;
        }

        .btnOutline {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #e6e6e6;
          background: white;
          cursor: pointer;
        }

        .btnPrimary {
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: #111;
          color: white;
          cursor: pointer;
          font-weight: 700;
        }

        .resultHead {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .note {
          font-size: 12px;
          opacity: 0.6;
          margin-top: 6px;
        }

        .muted {
          font-size: 12px;
          opacity: 0.7;
        }

        .errorBox {
          margin-top: 12px;
          padding: 12px;
          border-radius: 10px;
          background: #fff4f4;
          border: 1px solid #ffd0d0;
          color: #8a1f1f;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .grid2 {
            grid-template-columns: 1fr;
          }

          .btnRow button {
            width: 100%;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
