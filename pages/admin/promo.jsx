import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

function labelType(t) {
  if (t === "premium_app") return "Aplikasi Premium";
  if (t === "design") return "Desain";
  if (t === "web_dev") return "Web Developer";
  if (!t) return "Semua";
  return t;
}

export default function Promo() {
  const router = useRouter();
  const [me, setMe] = useState(null);

  const [judul, setJudul] = useState("Promo Ramadhan");
  const [kategori, setKategori] = useState(""); // kosong = semua
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const isAdmin = useMemo(
    () => String(me?.user?.supplier_type || "").toUpperCase() === "ALL",
    [me]
  );

  async function loadMe() {
    const rMe = await fetch("/api/auth/me");
    const jMe = await rMe.json();
    if (!jMe.loggedIn) return router.replace("/admin/login");
    setMe(jMe);

    // kalau bukan admin, kategori otomatis sesuai role
    const st = jMe.user?.supplier_type;
    if (String(st).toUpperCase() !== "ALL") {
      setKategori(st);
    }
  }

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line
  }, []);

  async function generate() {
    setErr("");
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (judul) qs.set("title", judul);
      // kategori hanya dipakai admin (atau role spesifik sudah fixed)
      if (kategori) qs.set("type", kategori);

      const r = await fetch(`/api/promo?${qs.toString()}`);
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Gagal generate promo");

      setText(j.text || "");
      setCount(j.count || 0);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      alert("Berhasil di-copy!");
    } catch {
      alert("Gagal copy (browser tidak support).");
    }
  }

  function downloadTxt() {
    const blob = new Blob([text || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(judul || "promo").replaceAll(" ", "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 12px", fontFamily: "system-ui, Arial" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 0", borderBottom: "1px solid #eee"
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Generator Promo</div>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Buat teks promo otomatis dari Google Sheets • Total produk terpilih: <b>{count}</b>
          </div>
        </div>
        <button onClick={() => router.push("/admin/products")} style={btnOutline()}>
          Kembali
        </button>
      </div>

      {/* Error */}
      {err && (
        <div style={{
          marginTop: 12, padding: 12, borderRadius: 10,
          background: "#fff4f4", border: "1px solid #ffd0d0", color: "#8a1f1f"
        }}>
          {err}
        </div>
      )}

      {/* Controls */}
      <div style={{
        marginTop: 16, background: "white", border: "1px solid #eee",
        borderRadius: 14, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 12 }}>
          <div>
            <div style={label()}>Judul Promo</div>
            <input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Promo Ramadhan"
              style={input()}
            />
          </div>

          <div>
            <div style={label()}>Kategori</div>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              disabled={!isAdmin}
              style={input()}
            >
              <option value="">{isAdmin ? "Semua Kategori" : labelType(kategori)}</option>
              <option value="premium_app">Aplikasi Premium</option>
              <option value="design">Desain</option>
              <option value="web_dev">Web Developer</option>
            </select>
            {!isAdmin && (
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
                *Kategori dikunci sesuai role kamu.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button onClick={generate} disabled={loading} style={btnPrimary()}>
            {loading ? "Memproses..." : "Generate Promo"}
          </button>
          <button onClick={copy} disabled={!text} style={btn()}>
            Copy
          </button>
          <button onClick={downloadTxt} disabled={!text} style={btn()}>
            Download .txt
          </button>
        </div>
      </div>

      {/* Text area */}
      <div style={{
        marginTop: 14, background: "white", border: "1px solid #eee",
        borderRadius: 14, overflow: "hidden"
      }}>
        <div style={{
          padding: "10px 12px", borderBottom: "1px solid #eee",
          background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ fontWeight: 700 }}>Hasil Promo</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Tips: klik Generate dulu, lalu Copy
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Klik tombol 'Generate Promo' untuk membuat teks..."
          rows={22}
          style={{
            width: "100%",
            padding: 14,
            border: "none",
            outline: "none",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 13,
            lineHeight: 1.5,
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ height: 30 }} />
    </div>
  );
}

/* styles */
function label() {
  return { fontSize: 12, fontWeight: 700, marginBottom: 6, opacity: 0.8 };
}
function input() {
  return {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e6e6e6",
    borderRadius: 10,
    outline: "none",
  };
}
function btnPrimary() {
  return {
    padding: "11px 14px",
    borderRadius: 10,
    border: "none",
    background: "#111",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  };
}
function btn() {
  return {
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
  };
}
function btnOutline() {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
  };
}
