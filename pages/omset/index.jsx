import { useEffect, useMemo, useState } from "react";
import { parseWhatsapp } from "../../utils/parseWhatsapp";

/**
 * Netlify Identity widget kadang bikin tombol "Login" tidak jalan kalau di-import langsung
 * di Next.js (SSR/hydration). Jadi kita require hanya di client.
 */
function getIdentity() {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line global-require
  const mod = require("netlify-identity-widget");
  return mod?.default || mod; // aman kalau export default
}

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

/** ---------- UI TOKENS (biar konsisten & minimalis) ---------- */
const ui = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  softBorder: "#edf2f7",
  shadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  shadowHover: "0 6px 18px rgba(15, 23, 42, 0.08)",
  radius: 16,
  radiusSm: 12,
  focusRing: "0 0 0 4px rgba(15, 23, 42, 0.08)",
};

function Alert({ type = "info", children, onClose }) {
  const map = {
    info: {
      border: "rgba(59,130,246,0.35)",
      bg: "rgba(59,130,246,0.08)",
      text: "#1d4ed8",
      icon: "ℹ️",
      label: "Info",
    },
    success: {
      border: "rgba(34,197,94,0.35)",
      bg: "rgba(34,197,94,0.10)",
      text: "#166534",
      icon: "✅",
      label: "Berhasil",
    },
    warning: {
      border: "rgba(245,158,11,0.35)",
      bg: "rgba(245,158,11,0.10)",
      text: "#92400e",
      icon: "⚠️",
      label: "Peringatan",
    },
    error: {
      border: "rgba(239,68,68,0.35)",
      bg: "rgba(239,68,68,0.08)",
      text: "#b91c1c",
      icon: "⛔",
      label: "Error",
    },
  };

  const t = map[type] || map.info;

  return (
    <div
      role="status"
      style={{
        border: `1px solid ${t.border}`,
        background: t.bg,
        color: t.text,
        padding: 12,
        borderRadius: 14,
        marginBottom: 12,
        fontSize: 13,
        boxShadow: ui.shadow,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 16, lineHeight: 1.2, marginTop: 1 }}>{t.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 4, opacity: 0.9 }}>
          {t.label}
        </div>
        <div style={{ fontWeight: 700, lineHeight: 1.4, wordBreak: "break-word" }}>
          {children}
        </div>
      </div>

      {onClose ? (
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: t.text,
            opacity: 0.8,
            fontSize: 18,
            lineHeight: 1,
            padding: 2,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.8)}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

function IconEye({ off = false, size = 18 }) {
  if (off) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.6 10.6a2.5 2.5 0 003.3 3.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M9.8 5.2A10.8 10.8 0 0112 4.75C18.2 4.75 22 12 22 12a18.7 18.7 0 01-3 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6.2 6.2A18.7 18.7 0 002 12s3.8 7.25 10 7.25c1.3 0 2.5-.2 3.6-.55"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.8-7.25 10-7.25S22 12 22 12s-3.8 7.25-10 7.25S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 15.25a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: "none",
        background: "transparent",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: ui.text,
        cursor: "pointer",
        transition: "background 120ms ease, transform 120ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(15,23,42,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

function Button({ children, onClick, variant = "ghost", disabled = false }) {
  const base = {
    borderRadius: 12,
    padding: "10px 12px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 800,
    fontSize: 13,
    transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
    userSelect: "none",
  };

  const styles =
    variant === "primary"
      ? {
          border: "1px solid #0f172a",
          background: disabled ? "#94a3b8" : "#0f172a",
          color: "white",
          boxShadow: ui.shadow,
        }
      : {
          border: `1px solid ${ui.border}`,
          background: ui.cardBg,
          color: ui.text,
          boxShadow: ui.shadow,
        };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...styles }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.99)";
      }}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onFocus={(e) => (e.currentTarget.style.boxShadow = `${ui.shadow}, ${ui.focusRing}`)}
      onBlur={(e) => (e.currentTarget.style.boxShadow = ui.shadow)}
    >
      {children}
    </button>
  );
}

function Card({ title, value, sub }) {
  return (
    <div
      style={{
        border: `1px solid ${ui.border}`,
        borderRadius: ui.radius,
        padding: 14,
        background: ui.cardBg,
        boxShadow: ui.shadow,
      }}
    >
      <div style={{ color: ui.muted, fontSize: 12, marginBottom: 6, fontWeight: 800 }}>{title}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: ui.text,
          lineHeight: 1.15,
          wordBreak: "break-word",
          letterSpacing: -0.2,
        }}
      >
        {value}
      </div>
      {sub ? <div style={{ color: ui.muted, fontSize: 12, marginTop: 8 }}>{sub}</div> : null}
    </div>
  );
}

export default function OmsetPage() {
  const [raw, setRaw] = useState("");
  const [data, setData] = useState({
    nama: "",
    whatsapp: "",
    layanan: "",
    durasi: "",
    metode: "",
    harga: 0,
  });

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [hideAmount, setHideAmount] = useState(false);
  const [user, setUser] = useState(null);

  const maskMoney = (n) => (hideAmount ? "••••••" : rupiah(n));
  const canSave = useMemo(() => (data?.harga || 0) > 0 && !!(data?.nama || data?.layanan), [data]);

  // ✅ localhost pakai /api, netlify pakai /.netlify/functions
  const API_BASE = process.env.NODE_ENV === "production" ? "/.netlify/functions" : "/api";

  async function safeJson(res) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }

  function openLogin() {
    const identity = getIdentity();
    if (!identity) {
      setErr("Netlify Identity belum siap. Coba refresh.");
      return;
    }

    try {
      identity.init();
      identity.open("login"); // paksa mode login
    } catch (e) {
      setErr(e?.message || "Gagal buka login.");
    }
  }

  async function authFetch(path, options = {}) {
    const identity = getIdentity();
    if (!identity) throw new Error("Identity belum siap");

    identity.init();

    const u = identity.currentUser();
    if (!u) {
      throw new Error("Silakan login dulu (Netlify Identity).");
    }

    const token = await u.jwt(true);

    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadAll() {
    setErr("");
    try {
      const [s, l] = await Promise.all([authFetch("/omset-summary"), authFetch("/omset-list")]);

      const sj = await safeJson(s);
      const lj = await safeJson(l);

      if (!s.ok) throw new Error(sj?.error || sj?.message || "Gagal load summary");
      if (!l.ok) throw new Error(lj?.error || lj?.message || "Gagal load list");

      setSummary(sj);
      setRows(lj?.rows || []);
    } catch (e) {
      setErr(e?.message || "Error");
    }
  }

  useEffect(() => {
    const identity = getIdentity();
    if (!identity) return;

    identity.init();
    setUser(identity.currentUser() || null);

    const onLogin = (u2) => {
      setUser(u2);
      identity.close();
      loadAll();
    };

    const onLogout = () => {
      setUser(null);
      setSummary(null);
      setRows([]);
      setErr("Kamu sudah logout. Silakan login lagi untuk melihat omset.");
    };

    identity.on("login", onLogin);
    identity.on("logout", onLogout);

    loadAll();

    return () => {
      try {
        identity.off("login", onLogin);
        identity.off("logout", onLogout);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleParse() {
    const parsed = parseWhatsapp(raw);
    setData({
      nama: parsed.nama || "",
      whatsapp: parsed.whatsapp || "",
      layanan: parsed.layanan || "",
      durasi: parsed.durasi || "",
      metode: parsed.metode || "",
      harga: parsed.harga || 0,
    });
  }

  async function handleSave() {
    setSaving(true);
    setErr("");

    try {
      const res = await authFetch("/omset-add", {
        method: "POST",
        body: JSON.stringify({
          tanggal: new Date().toISOString().slice(0, 10),
          nama: data.nama || "",
          layanan: data.layanan || "",
          metode: data.metode || "",
          pemasukan: data.harga || 0,
        }),
      });

      const out = await safeJson(res);
      if (!res.ok) throw new Error(out?.error || out?.message || "Gagal simpan");

      setRaw("");
      setData({ nama: "", whatsapp: "", layanan: "", durasi: "", metode: "", harga: 0 });
      await loadAll();
    } catch (e) {
      setErr(e?.message || "Error simpan");
    } finally {
      setSaving(false);
    }
  }

  // info vs error biar gak merah untuk logout/login
  const alertType = useMemo(() => {
    const msg = String(err || "").toLowerCase();
    if (!msg) return null;
    if (msg.includes("logout") || msg.includes("silakan login")) return "info";
    return "error";
  }, [err]);

  return (
    <div style={{ background: ui.pageBg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 16px 28px" }}>
        {/* HEADER */}
<div
  style={{
    marginTop: 80,
    marginBottom: 64,
    textAlign: "center",
  }}
>
  <h1
    style={{
      margin: 0,
      fontSize: 36,
      fontWeight: 700,
      color: "#1f2937",
      letterSpacing: -0.5,
    }}
  >
    Dashboard Omset
  </h1>

  <p
    style={{
      marginTop: 16,
      marginLeft: "auto",
      marginRight: "auto",
      maxWidth: 520,
      fontSize: 18,
      lineHeight: 1.6,
      color: "#4b5563",
    }}
  >
    Rekap otomatis dari Google Sheets (harian, bulanan, hingga tahunan)
  </p>

  {/* BUTTON AREA */}
  <div
    style={{
      marginTop: 28,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    }}
  >
    <IconButton
      onClick={() => setHideAmount((v) => !v)}
      label={hideAmount ? "Tampilkan angka" : "Sembunyikan angka"}
    >
      <IconEye off={hideAmount} />
    </IconButton>

    {!user ? (
      <Button variant="primary" onClick={openLogin}>
        Login
      </Button>
    ) : (
      <Button
        onClick={() => {
          const identity = getIdentity();
          if (!identity) return;
          identity.logout();
        }}
      >
        Logout
      </Button>
    )}
  </div>
</div>

        {/* ALERT */}
        {err ? (
          <Alert type={alertType || "info"} onClose={() => setErr("")}>
            {err}
          </Alert>
        ) : null}

        {/* SUMMARY CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Card
            title="Omset hari ini"
            value={summary ? maskMoney(summary.today) : "…"}
            sub={summary ? `${summary.transaksi_today} transaksi` : ""}
          />
          <Card
            title="Omset bulan ini"
            value={summary ? maskMoney(summary.month) : "…"}
            sub={summary ? `${summary.transaksi_month} transaksi` : ""}
          />
          <Card
            title="Omset tahun ini"
            value={summary ? maskMoney(summary.year) : "…"}
            sub={summary ? `${summary.transaksi_year} transaksi` : ""}
          />
          <Card title="Total transaksi" value={summary ? String(summary.transaksi_total) : "…"} sub="Semua data" />
        </div>

        {/* INPUT + TABLE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
            alignItems: "start",
          }}
        >
          {/* INPUT */}
          <div
            style={{
              border: `1px solid ${ui.border}`,
              borderRadius: ui.radius,
              padding: 14,
              background: ui.cardBg,
              boxShadow: ui.shadow,
            }}
          >
            <div style={{ fontWeight: 950, color: ui.text, marginBottom: 10 }}>Input dari WhatsApp</div>

            <textarea
              rows={8}
              placeholder="Paste pesan WhatsApp di sini… (yang ada Nama, WhatsApp, Layanan, Metode, Harga)"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              style={{
                width: "100%",
                borderRadius: 14,
                border: `1px solid ${ui.border}`,
                padding: 12,
                outline: "none",
                fontSize: 13,
                color: ui.text,
                resize: "vertical",
                background: "#fff",
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = ui.focusRing)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <Button variant="primary" onClick={handleParse}>
                Auto isi
              </Button>

              <Button
                onClick={() => {
                  setRaw("");
                  setData({ nama: "", whatsapp: "", layanan: "", durasi: "", metode: "", harga: 0 });
                }}
              >
                Bersihkan
              </Button>
            </div>

            {/* PREVIEW */}
            <div style={{ marginTop: 12, borderTop: `1px solid ${ui.softBorder}`, paddingTop: 12 }}>
              <div style={{ fontWeight: 950, marginBottom: 8, color: ui.text }}>Preview</div>

              <div style={{ display: "grid", gap: 8, fontSize: 13, color: ui.text }}>
                <div>
                  <b>Nama:</b> {data.nama || "-"}
                </div>
                <div>
                  <b>WhatsApp:</b> {data.whatsapp || "-"}
                </div>
                <div>
                  <b>Layanan:</b> {data.layanan || "-"}
                </div>
                <div>
                  <b>Metode:</b> {data.metode || "-"}
                </div>
                <div>
                  <b>Harga:</b> {hideAmount ? "••••••" : rupiah(data.harga || 0)}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <Button variant="primary" disabled={!canSave || saving} onClick={handleSave}>
                  {saving ? "Menyimpan..." : "Simpan Omset"}
                </Button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: ui.muted }}>
                Catatan: Pastikan pesan WA ada baris <b>Harga:</b> atau ada tulisan <b>Rp ...</b>.
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div
            style={{
              border: `1px solid ${ui.border}`,
              borderRadius: ui.radius,
              padding: 14,
              background: ui.cardBg,
              boxShadow: ui.shadow,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <div style={{ fontWeight: 950, color: ui.text }}>Riwayat Omset</div>
              <div style={{ fontSize: 12, color: ui.muted }}>Terbaru di atas</div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
                <thead>
                  <tr style={{ color: ui.muted, textAlign: "left" }}>
                    <th style={{ padding: "10px 8px", borderBottom: `1px solid ${ui.softBorder}` }}>Tanggal</th>
                    <th style={{ padding: "10px 8px", borderBottom: `1px solid ${ui.softBorder}` }}>Nama</th>
                    <th style={{ padding: "10px 8px", borderBottom: `1px solid ${ui.softBorder}` }}>Layanan</th>
                    <th style={{ padding: "10px 8px", borderBottom: `1px solid ${ui.softBorder}` }}>Metode</th>
                    <th style={{ padding: "10px 8px", borderBottom: `1px solid ${ui.softBorder}`, textAlign: "right" }}>
                      Pemasukan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(rows || []).slice(0, 20).map((r) => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${ui.softBorder}` }}>
                      <td style={{ padding: "10px 8px", color: ui.text, whiteSpace: "nowrap" }}>{r.tanggal}</td>
                      <td style={{ padding: "10px 8px", color: ui.text }}>{r.nama}</td>
                      <td style={{ padding: "10px 8px", color: ui.text }}>{r.layanan}</td>
                      <td style={{ padding: "10px 8px", color: ui.text }}>{r.metode}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 950, color: ui.text }}>
                        {hideAmount ? "••••••" : rupiah(r.pemasukan)}
                      </td>
                    </tr>
                  ))}

                  {!rows || rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 12, color: ui.muted, textAlign: "center" }}>
                        Belum ada data omset.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: ui.muted }}>Menampilkan 20 data terbaru.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
