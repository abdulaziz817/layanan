import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toPng } from "html-to-image";

function formatRupiahDigitsOnly(input) {
  const digits = String(input || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return "Rp " + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function extractAfter(label, text) {
  const re = new RegExp(`\\*?${label}\\*?\\s*([^\\n]+)`, "i");
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

function extractMoney(text) {
  const m = text.match(/Rp\\s*([\\d.]+)/i);
  return m ? m[1].replace(/\\./g, "") : "";
}

function makeNoKwitansi() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KW-${y}${m}${day}-${rand}`;
}

function makeVerifyCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function KwitansiPage() {
  const router = useRouter();
  const kwitansiRef = useRef(null);

  const [waText, setWaText] = useState("");

  const [noKwitansi, setNoKwitansi] = useState("-");
  const [verifyCode, setVerifyCode] = useState("-");

  useEffect(() => {
    setNoKwitansi(makeNoKwitansi());
    setVerifyCode(makeVerifyCode());
  }, []);

  const [data, setData] = useState({
    tanggal: "",
    nama: "",
    wa: "",
    layananUtama: "",
    layananDetail: "",
    durasi: "",
    harga: "",
    budget: "",
    deadline: "",
    metode: "",
    pesan: "",
  });

  useEffect(() => {
    setData((d) => ({
      ...d,
      tanggal: d.tanggal || new Date().toISOString().slice(0, 10),
    }));
  }, []);

  const isPremium = useMemo(() => {
    const layanan = `${data.layananUtama} ${data.layananDetail}`.toLowerCase();
    return layanan.includes("aplikasi premium");
  }, [data.layananUtama, data.layananDetail]);

  const hargaView = useMemo(() => formatRupiahDigitsOnly(data.harga), [data.harga]);
  const budgetView = useMemo(() => formatRupiahDigitsOnly(data.budget), [data.budget]);

  function set(k, v) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function parseFromWhatsApp() {
    const t = waText || "";

    const nama = extractAfter("Nama:", t);
    const wa = extractAfter("Nomor WhatsApp:", t);

    const layananLine = extractAfter("Layanan:", t);
    let layananUtama = "";
    let layananDetail = "";

    if (layananLine) {
      const parts = layananLine.split(" - ").map((s) => s.trim());
      layananUtama = parts[0] || "";
      layananDetail = parts.slice(1).join(" - ") || "";
    }

    const metode = extractAfter("Metode Pembayaran:", t);
    const pesan = extractAfter("Pesan Tambahan:", t);

    const durasi = extractAfter("Durasi Langganan:", t);
    const harga = extractAfter("Harga:", t) || extractMoney(t);

    const budget = extractAfter("Budget:", t) || extractMoney(t);
    const deadline = extractAfter("Deadline:", t);

    setData((d) => ({
      ...d,
      nama: nama || d.nama,
      wa: wa || d.wa,
      layananUtama: layananUtama || d.layananUtama,
      layananDetail: layananDetail || d.layananDetail,
      durasi: durasi || d.durasi,
      harga: String(harga || "").replace(/[^\d]/g, "") || d.harga,
      budget: String(budget || "").replace(/[^\d]/g, "") || d.budget,
      deadline: deadline || d.deadline,
      metode: metode || d.metode,
      pesan: pesan || d.pesan,
    }));
  }

  async function downloadPng() {
    if (!kwitansiRef.current) return;

    const dataUrl = await toPng(kwitansiRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${noKwitansi === "-" ? "kwitansi" : noKwitansi}.png`;
    a.click();
  }

  async function logout() {
    try {
      await fetch("/api/kwitansi-logout", { method: "POST" });
    } finally {
      router.push("/kwitansi/login");
    }
  }

  const layananText = [data.layananUtama, data.layananDetail].filter(Boolean).join(" - ");

  return (
    <div className="page">
      <style>{`
        /* ====== OFFSET biar aman dari navbar fixed ======
           Kalau navbar kamu fixed dan tinggi beda, set aja:
           :root { --app-navbar-height: 64px; }
        */
        .page{
          max-width: 1100px;
          margin: 0 auto;
          padding: calc(var(--app-navbar-height, 72px) + 18px) 16px 30px;
        }
        @media (max-width: 640px){
          .page{ padding: calc(var(--app-navbar-height, 72px) + 14px) 12px 22px; }
        }

        .two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 1024px) { .two { grid-template-columns: 1fr; } }

        .card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; background: white; }
        .grid { display: grid; gap: 12px; }
        label { font-size: 14px; color: #111827; }
        input, textarea {
          width:100%;
          padding:10px;
          margin-top:6px;
          border:1px solid #d1d5db;
          border-radius:10px;
        }

        .btn { padding: 10px 14px; border-radius: 10px; border: 1px solid #111827; cursor:pointer; background: white; }
        .btnPrimary { background: rgb(79 70 229); border-color: rgb(79 70 229); color: white; }
        .btnGhost { border-color: rgba(229,231,235,1); color: #111827; background: white; }
        .btnPrimary:hover { filter: brightness(0.98); }
        .btnGhost:hover { background: rgba(249,250,251,1); }

        .muted { color:#6b7280; font-size: 13px; }
        .no-select { user-select: none; -webkit-user-select: none; -ms-user-select: none; }

        /* ====== HEADER (judul doang, responsif, logout aman) ====== */
        .topbar{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .titleWrap{
          min-width: 220px;
        }
        .pageTitle{
          margin: 0;
          font-size: 34px;
          line-height: 1.1;
          font-weight: 900;
          color:#111827;
          letter-spacing: -0.2px;
        }
        @media (max-width: 640px){
          .pageTitle{ font-size: 28px; }
          .topbar{ align-items: flex-start; }
          .logoutWrap{ width: 100%; display:flex; justify-content:flex-end; }
        }

        /* ====== KWITANSI STYLE (elegan, responsif) ====== */
        .kw-wrap {
          position: relative;
          overflow: hidden;
          padding: 18px 18px 16px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid #e5e7eb;
        }
        @media (max-width: 640px){
          .kw-wrap{ padding: 16px 14px 14px; border-radius: 14px; }
        }

        .kw-header {
          text-align: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #eef2f7;
        }
        .kw-title { font-size: 18px; font-weight: 900; letter-spacing: 0.6px; color:#111827; }
        .kw-sub { margin-top: 4px; font-size: 12px; color:#6b7280; }

        .kw-meta {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 11.5px;
          color:#6b7280;
          flex-wrap: wrap;
        }
        .kw-meta b { color:#111827; }

        .kv {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }
        .kv-row {
          display: grid;
          grid-template-columns: 130px 1fr;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px dashed #eef2f7;
          font-size: 13px;
        }
        @media (max-width: 480px){
          .kv-row{ grid-template-columns: 105px 1fr; font-size: 12.5px; }
        }
        .kv-key { color:#6b7280; }
        .kv-val { color:#111827; font-weight: 600; word-break: break-word; }

        .kw-note {
          margin-top: 12px;
          font-size: 12px;
          color:#111827;
          background: #f9fafb;
          border: 1px solid #eef2f7;
          border-radius: 12px;
          padding: 10px 12px;
        }
        .kw-note .muted { font-size: 11px; }

        .kw-sign {
          display:flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #eef2f7;
          flex-wrap: wrap;
        }
        .kw-sign .box { width: 48%; }
        @media (max-width: 520px){
          .kw-sign .box{ width: 100%; }
        }
        .kw-sign .label { font-size: 11px; color:#6b7280; }
        .kw-sign .name { margin-top: 18px; font-size: 13px; font-weight: 800; color:#111827; }

        .kw-watermark {
          position:absolute;
          inset:0;
          display:grid;
          place-items:center;
          pointer-events:none;
          opacity:0.06;
          transform: rotate(-18deg);
          font-weight: 900;
          letter-spacing: 2px;
          font-size: 34px;
          color:#111827;
          white-space: nowrap;
        }
       .kw-watermark-code{
  margin-top: 10px;
  font-size: 10px;
  color:#9ca3af;
  text-align: center;
  pointer-events: none;
}

      `}</style>

      {/* ====== JUDUL (mirip referensi: h2 doang, tanpa deskripsi) ====== */}
      <div className="topbar">
        <div className="titleWrap">
          <h1 className="pageTitle">🧾 Kwitansi</h1>
        </div>

        <div className="logoutWrap">
          <button className="btn btnGhost" onClick={logout} title="Keluar">
            Logout
          </button>
        </div>
      </div>

      <div className="two">
        {/* INPUT */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Paste Pesan WhatsApp (Opsional)</h3>
          <textarea
            rows={8}
            value={waText}
            onChange={(e) => setWaText(e.target.value)}
            placeholder="Paste pesan WA dari customer di sini..."
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btnPrimary" onClick={parseFromWhatsApp}>
              Auto Isi dari Pesan
            </button>
            <button className="btn btnGhost" onClick={() => setWaText("")}>
              Bersihkan
            </button>
          </div>

          <hr style={{ margin: "16px 0", border: 0, borderTop: "1px solid #eee" }} />

          <h3 style={{ marginTop: 0 }}>Input Manual</h3>
          <div className="grid">
            <label>
              Tanggal
              <input type="date" value={data.tanggal} onChange={(e) => set("tanggal", e.target.value)} />
            </label>

            <label>
              Nama
              <input value={data.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Nama customer" />
            </label>

            <label>
              WhatsApp
              <input value={data.wa} onChange={(e) => set("wa", e.target.value)} placeholder="08xxxxxxxxxx" />
            </label>

            <label>
              Layanan Utama
              <input
                value={data.layananUtama}
                onChange={(e) => set("layananUtama", e.target.value)}
                placeholder="Desain Grafis / Web Development / Preset Fotografi / Aplikasi Premium"
              />
            </label>

            <label>
              Detail Layanan
              <input
                value={data.layananDetail}
                onChange={(e) => set("layananDetail", e.target.value)}
                placeholder="Poster / Landing Page / Spotify / Lightroom Preset"
              />
            </label>

            {isPremium ? (
              <>
                <label>
                  Durasi Langganan
                  <input value={data.durasi} onChange={(e) => set("durasi", e.target.value)} />
                </label>

                <label>
                  Harga (angka)
                  <input value={data.harga} onChange={(e) => set("harga", e.target.value)} placeholder="37000" />
                  <div className="muted" style={{ marginTop: 6 }}>
                    Preview: {hargaView || "-"}
                  </div>
                </label>
              </>
            ) : (
              <>
                <label>
                  Budget (angka)
                  <input value={data.budget} onChange={(e) => set("budget", e.target.value)} placeholder="150000" />
                  <div className="muted" style={{ marginTop: 6 }}>
                    Preview: {budgetView || "-"}
                  </div>
                </label>

                <label>
                  Deadline
                  <input type="date" value={data.deadline} onChange={(e) => set("deadline", e.target.value)} />
                </label>
              </>
            )}

            <label>
              Metode Pembayaran
              <input
                value={data.metode}
                onChange={(e) => set("metode", e.target.value)}
                placeholder="GoPay / QRIS / BCA / PayPal"
              />
            </label>

            <label>
              Catatan
              <textarea rows={3} value={data.pesan} onChange={(e) => set("pesan", e.target.value)} />
            </label>

            <button className="btn btnPrimary" onClick={downloadPng}>
              Download Kwitansi (PNG)
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div ref={kwitansiRef} className="kw-wrap no-select">
          <div className="kw-watermark">LAYANAN NUSANTARA</div>
          <div className="kw-watermark-code">
            No: <b style={{ color: "#6b7280" }}>{noKwitansi}</b> • Kode:{" "}
            <b style={{ color: "#6b7280" }}>{verifyCode}</b>
          </div>

          <div className="kw-header">
            <div className="kw-title">LAYANAN NUSANTARA</div>
            <div className="kw-sub">Kwitansi Pembayaran</div>

            <div className="kw-meta">
              <div>
                <span>No: </span>
                <b>{noKwitansi}</b>
              </div>
              <div>
                <span>Tanggal: </span>
                <b>{data.tanggal || "-"}</b>
              </div>
            </div>
          </div>

          <div className="kv">
            <div className="kv-row">
              <div className="kv-key">Nama</div>
              <div className="kv-val">{data.nama || "-"}</div>
            </div>

            <div className="kv-row">
              <div className="kv-key">WhatsApp</div>
              <div className="kv-val">{data.wa || "-"}</div>
            </div>

            <div className="kv-row">
              <div className="kv-key">Layanan</div>
              <div className="kv-val">{layananText || "-"}</div>
            </div>

            {isPremium ? (
              <>
                <div className="kv-row">
                  <div className="kv-key">Durasi</div>
                  <div className="kv-val">{data.durasi || "-"}</div>
                </div>

                <div className="kv-row">
                  <div className="kv-key">Total</div>
                  <div className="kv-val">{hargaView || "-"}</div>
                </div>
              </>
            ) : (
              <>
                <div className="kv-row">
                  <div className="kv-key">Budget</div>
                  <div className="kv-val">{budgetView || "-"}</div>
                </div>

                <div className="kv-row">
                  <div className="kv-key">Deadline</div>
                  <div className="kv-val">{data.deadline || "-"}</div>
                </div>
              </>
            )}

            <div className="kv-row" style={{ borderBottom: "none" }}>
              <div className="kv-key">Pembayaran</div>
              <div className="kv-val">{data.metode || "-"}</div>
            </div>
          </div>

          {data.pesan ? (
            <div className="kw-note">
              <div style={{ fontWeight: 800, marginBottom: 4 }}>Catatan</div>
              <div style={{ fontWeight: 600 }}>{data.pesan}</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Kode verifikasi: <b style={{ color: "#111827" }}>{verifyCode}</b>
              </div>
            </div>
          ) : (
            <div className="kw-note">
              <div className="muted">
                Kode verifikasi: <b style={{ color: "#111827" }}>{verifyCode}</b>
              </div>
            </div>
          )}

          <div className="kw-sign">
            <div className="box">
              <div className="label">Penerima</div>
              <div className="name">{data.nama || "(Nama)"}</div>
            </div>
            <div className="box" style={{ textAlign: "right" }}>
              <div className="label">Hormat Kami</div>
              <div className="name">Layanan Nusantara</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
