import { useEffect, useMemo, useRef, useState } from "react";
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

/** ---------- FORMATTER ---------- */
const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

/** ---------- UI TOKENS (clean, putih, ga norak) ---------- */
const ui = {
  pageBg: "#ffffff",
  canvasBg: "#ffffff",
  surface: "#ffffff",
  surface2: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  subtle: "#94a3b8",
  border: "#e2e8f0",
  border2: "#eef2f7",
  shadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  shadowMd: "0 10px 30px rgba(15, 23, 42, 0.08)",
  radius: 18,
  radiusSm: 12,
  focusRing: "0 0 0 4px rgba(15, 23, 42, 0.10)",
  danger: "#b91c1c",
  info: "#1d4ed8",
  success: "#166534",
  warning: "#92400e",
};

/** ---------- VALIDATION / HELPERS ---------- */
const LIMITS = {
  rawMax: 8000,
  nameMax: 80,
  layananMax: 80,
  metodeMax: 30,
  minHarga: 1000,
  maxHarga: 250_000_000,
};

function isNonEmptyStr(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function clampStr(v, maxLen) {
  const s = String(v ?? "");
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function normalizeSpaces(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

function sanitizeTextInput(s, maxLen) {
  // keep it simple: trim + collapse spaces + limit length
  return clampStr(normalizeSpaces(s), maxLen);
}

function sanitizeRaw(s) {
  const raw = String(s ?? "");
  const trimmed = raw.length > LIMITS.rawMax ? raw.slice(0, LIMITS.rawMax) : raw;
  return trimmed.replace(/\u0000/g, ""); // remove null chars
}

function parseMoneyToNumber(input) {
  // accept: "Rp 10.000", "10000", "10,000", etc
  const s = String(input ?? "");
  const digits = s.replace(/[^\d]/g, "");
  const n = Number(digits || 0);
  return Number.isFinite(n) ? n : 0;
}

function validateData(d) {
  const errors = {};

  const nama = sanitizeTextInput(d.nama, LIMITS.nameMax);
  const layanan = sanitizeTextInput(d.layanan, LIMITS.layananMax);
  const metode = sanitizeTextInput(d.metode, LIMITS.metodeMax);
  const harga = Number(d.harga || 0);

  // Ketat tapi tetap realistis
  const hasIdentity = isNonEmptyStr(nama) || isNonEmptyStr(layanan);

  if (!hasIdentity) errors.identity = "Isi minimal Nama atau Layanan.";
  if (isNonEmptyStr(nama) && nama.length < 2) errors.nama = "Nama terlalu pendek (min 2 karakter).";
  if (isNonEmptyStr(layanan) && layanan.length < 2) errors.layanan = "Layanan terlalu pendek (min 2 karakter).";

  if (!Number.isFinite(harga) || harga <= 0) errors.harga = "Harga wajib diisi (angka).";
  if (Number.isFinite(harga) && harga > 0 && harga < LIMITS.minHarga)
    errors.harga = `Harga terlalu kecil (min ${rupiah(LIMITS.minHarga)}).`;
  if (Number.isFinite(harga) && harga > LIMITS.maxHarga)
    errors.harga = `Harga terlalu besar (maks ${rupiah(LIMITS.maxHarga)}).`;

  // metode optional, tapi kalau diisi harus masuk akal
  if (isNonEmptyStr(metode) && metode.length < 2) errors.metode = "Metode terlalu pendek.";

  return { ok: Object.keys(errors).length === 0, errors };
}

function safeLower(s) {
  return String(s ?? "").toLowerCase();
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/** ---------- COMPONENTS ---------- */
function Divider({ style }) {
  return <div style={{ height: 1, background: ui.border2, ...style }} />;
}

function Badge({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: "#f1f5f9", text: "#334155", border: ui.border2 },
    info: { bg: "rgba(59,130,246,0.10)", text: ui.info, border: "rgba(59,130,246,0.25)" },
    success: { bg: "rgba(34,197,94,0.10)", text: ui.success, border: "rgba(34,197,94,0.22)" },
    warning: { bg: "rgba(245,158,11,0.12)", text: ui.warning, border: "rgba(245,158,11,0.25)" },
    danger: { bg: "rgba(239,68,68,0.10)", text: ui.danger, border: "rgba(239,68,68,0.20)" },
  };
  const t = map[tone] || map.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
        color: t.text,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 999,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Alert({ type = "info", children, onClose, title }) {
  const map = {
    info: {
      border: "rgba(59,130,246,0.35)",
      bg: "rgba(59,130,246,0.08)",
      text: ui.info,
      icon: "ℹ️",
      label: title || "Info",
    },
    success: {
      border: "rgba(34,197,94,0.30)",
      bg: "rgba(34,197,94,0.10)",
      text: ui.success,
      icon: "✅",
      label: title || "Berhasil",
    },
    warning: {
      border: "rgba(245,158,11,0.30)",
      bg: "rgba(245,158,11,0.10)",
      text: ui.warning,
      icon: "⚠️",
      label: title || "Peringatan",
    },
    error: {
      border: "rgba(239,68,68,0.30)",
      bg: "rgba(239,68,68,0.08)",
      text: ui.danger,
      icon: "⛔",
      label: title || "Error",
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
        <div style={{ fontWeight: 950, fontSize: 12, marginBottom: 4, opacity: 0.95 }}>{t.label}</div>
        <div style={{ fontWeight: 750, lineHeight: 1.45, wordBreak: "break-word", color: ui.text }}>
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
            color: ui.text,
            opacity: 0.7,
            fontSize: 18,
            lineHeight: 1,
            padding: 2,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
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
        <path
          d="M10.6 10.6a2.5 2.5 0 003.3 3.3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
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

function IconButton({ onClick, label, children, disabled = false }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: `1px solid ${ui.border2}`,
        background: ui.surface,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: ui.text,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 140ms ease, transform 120ms ease, box-shadow 140ms ease",
        boxShadow: ui.shadow,
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "#f8fafc";
        e.currentTarget.style.boxShadow = ui.shadowMd;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = ui.surface;
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = ui.shadow;
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onFocus={(e) => (e.currentTarget.style.boxShadow = `${ui.shadow}, ${ui.focusRing}`)}
      onBlur={(e) => (e.currentTarget.style.boxShadow = ui.shadow)}
    >
      {children}
    </button>
  );
}

function Button({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  leftIcon,
  type = "button",
}) {
  const base = {
    borderRadius: 12,
    padding: "10px 12px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 900,
    fontSize: 13,
    transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, background 120ms ease",
    userSelect: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  const styles =
    variant === "primary"
      ? {
          border: "1px solid #0f172a",
          background: disabled ? "#94a3b8" : "#0f172a",
          color: "white",
          boxShadow: ui.shadow,
        }
      : variant === "ghost"
      ? {
          border: `1px solid transparent`,
          background: "transparent",
          color: ui.text,
        }
      : {
          border: `1px solid ${ui.border}`,
          background: ui.surface,
          color: ui.text,
          boxShadow: ui.shadow,
        };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...styles, opacity: disabled ? 0.7 : 1 }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.99)";
      }}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onFocus={(e) => {
        if (variant !== "ghost") e.currentTarget.style.boxShadow = `${ui.shadow}, ${ui.focusRing}`;
      }}
      onBlur={(e) => {
        if (variant !== "ghost") e.currentTarget.style.boxShadow = ui.shadow;
      }}
    >
      {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      {children}
    </button>
  );
}

function TextInput({ label, value, onChange, placeholder, error, hint, inputMode = "text" }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 950, fontSize: 12, color: ui.text }}>{label}</div>
        {hint ? <div style={{ fontSize: 12, color: ui.muted }}>{hint}</div> : null}
      </div>

      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        style={{
          width: "100%",
          borderRadius: 14,
          border: `1px solid ${error ? "rgba(239,68,68,0.35)" : ui.border}`,
          padding: "12px 12px",
          outline: "none",
          fontSize: 13,
          color: ui.text,
          background: ui.surface,
          boxShadow: ui.shadow,
        }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = `${ui.shadow}, ${ui.focusRing}`)}
        onBlur={(e) => (e.currentTarget.style.boxShadow = ui.shadow)}
        aria-invalid={!!error}
      />

      {error ? (
        <div style={{ fontSize: 12, color: ui.danger, fontWeight: 800 }}>{error}</div>
      ) : null}
    </div>
  );
}

function StatCard({ title, value, sub, loading = false }) {
  return (
    <div
      style={{
        border: `1px solid ${ui.border}`,
        borderRadius: ui.radius,
        padding: 14,
        background: ui.surface,
        boxShadow: ui.shadow,
        minHeight: 92,
      }}
    >
      <div style={{ color: ui.muted, fontSize: 12, marginBottom: 8, fontWeight: 900 }}>{title}</div>

      {loading ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ height: 20, width: "60%", background: ui.border2, borderRadius: 10 }} />
          <div style={{ height: 12, width: "40%", background: ui.border2, borderRadius: 10 }} />
        </div>
      ) : (
        <>
          <div
            style={{
              fontSize: 22,
              fontWeight: 950,
              color: ui.text,
              lineHeight: 1.1,
              wordBreak: "break-word",
              letterSpacing: -0.2,
            }}
          >
            {value}
          </div>
          {sub ? <div style={{ color: ui.muted, fontSize: 12, marginTop: 10 }}>{sub}</div> : null}
        </>
      )}
    </div>
  );
}

function Panel({ title, right, children, subtitle }) {
  return (
    <div
      style={{
        border: `1px solid ${ui.border}`,
        borderRadius: ui.radius,
        padding: 16,
        background: ui.surface,
        boxShadow: ui.shadow,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 950, color: ui.text, fontSize: 14 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 12, color: ui.muted, marginTop: 4 }}>{subtitle}</div> : null}
        </div>
        {right ? <div style={{ flexShrink: 0 }}>{right}</div> : null}
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {children}
    </div>
  );
}

/** ---------- PAGE ---------- */
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
  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState("");
  const [notice, setNotice] = useState(""); // untuk info non-error
  const [hideAmount, setHideAmount] = useState(false);
  const [user, setUser] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [q, setQ] = useState("");
  const textareaRef = useRef(null);

  const maskMoney = (n) => (hideAmount ? "••••••" : rupiah(n));

  const API_BASE = process.env.NODE_ENV === "production" ? "/.netlify/functions" : "/api";

  function openLogin() {
    setErr("");
    setNotice("");
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
    setNotice("");
    setLoading(true);

    try {
      const [s, l] = await Promise.all([authFetch("/omset-summary"), authFetch("/omset-list")]);

      const sj = await safeJson(s);
      const lj = await safeJson(l);

      if (!s.ok) throw new Error(sj?.error || sj?.message || "Gagal load summary");
      if (!l.ok) throw new Error(lj?.error || lj?.message || "Gagal load list");

      setSummary(sj);
      setRows(Array.isArray(lj?.rows) ? lj.rows : []);
    } catch (e) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
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
      setNotice("Login berhasil. Data omset dimuat.");
      loadAll();
    };

    const onLogout = () => {
      setUser(null);
      setSummary(null);
      setRows([]);
      setErr("");
      setNotice("Kamu sudah logout. Silakan login lagi untuk melihat omset.");
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

  function applyParsed(parsed) {
    const next = {
      nama: sanitizeTextInput(parsed?.nama || "", LIMITS.nameMax),
      whatsapp: sanitizeTextInput(parsed?.whatsapp || "", 40),
      layanan: sanitizeTextInput(parsed?.layanan || "", LIMITS.layananMax),
      durasi: sanitizeTextInput(parsed?.durasi || "", 40),
      metode: sanitizeTextInput(parsed?.metode || "", LIMITS.metodeMax),
      harga: Number(parsed?.harga || 0),
    };

    setData(next);

    const v = validateData(next);
    setFieldErrors(v.errors || {});
    if (!v.ok) setNotice("Terbaca, tapi masih ada yang perlu diperbaiki di preview.");
    else setNotice("Preview sudah lengkap & siap disimpan.");
  }

  function handleParse() {
    setErr("");
    setNotice("");

    const clean = sanitizeRaw(raw);
    if (!clean.trim()) {
      setErr("Paste dulu pesan WhatsApp-nya ya.");
      textareaRef.current?.focus?.();
      return;
    }
    if (clean.length >= LIMITS.rawMax) {
      setNotice(`Teks terlalu panjang, dipotong sampai ${LIMITS.rawMax} karakter.`);
    }

    const parsed = parseWhatsapp(clean);
    applyParsed(parsed);
  }

  function handleClearAll() {
    setErr("");
    setNotice("");
    setRaw("");
    setData({ nama: "", whatsapp: "", layanan: "", durasi: "", metode: "", harga: 0 });
    setFieldErrors({});
    textareaRef.current?.focus?.();
  }

  function handleManualChange(key, value) {
    setErr("");
    setNotice("");

    const next = { ...data, [key]: value };
    // sanitize on change (biar ketat & konsisten)
    if (key === "nama") next.nama = sanitizeTextInput(value, LIMITS.nameMax);
    if (key === "layanan") next.layanan = sanitizeTextInput(value, LIMITS.layananMax);
    if (key === "metode") next.metode = sanitizeTextInput(value, LIMITS.metodeMax);
    if (key === "whatsapp") next.whatsapp = sanitizeTextInput(value, 40);
    if (key === "durasi") next.durasi = sanitizeTextInput(value, 40);
    if (key === "harga") next.harga = parseMoneyToNumber(value);

    setData(next);

    const v = validateData(next);
    setFieldErrors(v.errors || {});
  }

  const canSave = useMemo(() => {
    const v = validateData(data);
    return v.ok && user && !saving;
  }, [data, saving, user]);

  async function handleSave() {
    setSaving(true);
    setErr("");
    setNotice("");

    const v = validateData(data);
    setFieldErrors(v.errors || {});
    if (!v.ok) {
      setSaving(false);
      setErr("Periksa lagi input kamu. Masih ada yang belum valid.");
      return;
    }

    try {
      const payload = {
        tanggal: new Date().toISOString().slice(0, 10),
        nama: sanitizeTextInput(data.nama || "", LIMITS.nameMax),
        layanan: sanitizeTextInput(data.layanan || "", LIMITS.layananMax),
        metode: sanitizeTextInput(data.metode || "", LIMITS.metodeMax),
        pemasukan: Number(data.harga || 0),
      };

      const res = await authFetch("/omset-add", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const out = await safeJson(res);
      if (!res.ok) throw new Error(out?.error || out?.message || "Gagal simpan");

      setNotice("Berhasil disimpan. Data diperbarui.");
      setRaw("");
      setData({ nama: "", whatsapp: "", layanan: "", durasi: "", metode: "", harga: 0 });
      setFieldErrors({});
      await loadAll();
    } catch (e) {
      setErr(e?.message || "Error simpan");
    } finally {
      setSaving(false);
    }
  }

  function doLogout() {
    setErr("");
    setNotice("");
    const identity = getIdentity();
    if (!identity) {
      setErr("Identity belum siap.");
      return;
    }
    try {
      identity.logout();
    } catch {
      setErr("Gagal logout.");
    }
  }

  const alertType = useMemo(() => {
    const msg = safeLower(err);
    if (!msg) return null;
    if (msg.includes("login")) return "info";
    return "error";
  }, [err]);

  const filteredRows = useMemo(() => {
    const query = normalizeSpaces(q);
    if (!query) return rows || [];
    const qq = query.toLowerCase();
    return (rows || []).filter((r) => {
      const blob = `${r.tanggal} ${r.nama} ${r.layanan} ${r.metode} ${r.pemasukan}`.toLowerCase();
      return blob.includes(qq);
    });
  }, [rows, q]);

  function copyRingkas() {
    const s = [
      `Nama: ${data.nama || "-"}`,
      `WA: ${data.whatsapp || "-"}`,
      `Layanan: ${data.layanan || "-"}`,
      `Metode: ${data.metode || "-"}`,
      `Harga: ${rupiah(data.harga || 0)}`,
    ].join("\n");

    try {
      navigator.clipboard?.writeText?.(s);
      setNotice("Ringkasan preview dicopy.");
    } catch {
      setNotice("Gagal copy (browser tidak mengizinkan).");
    }
  }

  return (
    <div style={{ background: ui.pageBg, minHeight: "100vh" }}>
      {/* CANVAS */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 16px 40px" }}>
        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 4px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              aria-hidden="true"
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                border: `1px solid ${ui.border}`,
                background: ui.surface2,
                boxShadow: ui.shadow,
                display: "grid",
                placeItems: "center",
                fontWeight: 950,
                color: ui.text,
              }}
            >
              ₨
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 950, color: ui.text, letterSpacing: -0.2 }}>
                Dashboard Omset
              </div>
              <div style={{ fontSize: 12, color: ui.muted }}>
                Rekap Google Sheets • Harian / Bulanan / Tahunan
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <IconButton
              onClick={() => setHideAmount((v) => !v)}
              label={hideAmount ? "Tampilkan angka" : "Sembunyikan angka"}
            >
              <IconEye off={hideAmount} />
            </IconButton>

            <Button variant="secondary" onClick={loadAll} disabled={!user || loading} leftIcon="↻">
              Refresh
            </Button>

            {!user ? (
              <Button variant="primary" onClick={openLogin} leftIcon="🔐">
                Login
              </Button>
            ) : (
              <Button variant="secondary" onClick={doLogout} leftIcon="🚪">
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* STATUS */}
        <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
          {notice ? (
            <Alert type="info" onClose={() => setNotice("")} title="Status">
              {notice}
            </Alert>
          ) : null}

          {err ? (
            <Alert type={alertType || "error"} onClose={() => setErr("")}>
              {err}
            </Alert>
          ) : null}

          {!user ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Badge tone="warning">Butuh login untuk load data</Badge>
              <div style={{ fontSize: 12, color: ui.muted }}>
                Klik <b>Login</b> untuk akses summary dan riwayat.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Badge tone="success">Login aktif</Badge>
              <div style={{ fontSize: 12, color: ui.muted }}>
                Data ditampilkan sesuai Google Sheets / backend.
              </div>
            </div>
          )}
        </div>

        {/* SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <StatCard
            title="Omset hari ini"
            value={summary ? maskMoney(summary.today) : "—"}
            sub={summary ? `${summary.transaksi_today} transaksi` : ""}
            loading={loading && !summary}
          />
          <StatCard
            title="Omset bulan ini"
            value={summary ? maskMoney(summary.month) : "—"}
            sub={summary ? `${summary.transaksi_month} transaksi` : ""}
            loading={loading && !summary}
          />
          <StatCard
            title="Omset tahun ini"
            value={summary ? maskMoney(summary.year) : "—"}
            sub={summary ? `${summary.transaksi_year} transaksi` : ""}
            loading={loading && !summary}
          />
          <StatCard
            title="Total transaksi"
            value={summary ? String(summary.transaksi_total) : "—"}
            sub="Semua data"
            loading={loading && !summary}
          />
        </div>

        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 14,
            alignItems: "start",
          }}
        >
          {/* INPUT PANEL */}
          <Panel
            title="Input dari WhatsApp"
            subtitle="Paste pesan WA → klik Auto isi → cek preview → simpan."
            right={<Badge tone="neutral">Auto-parse</Badge>}
          >
            <textarea
              ref={textareaRef}
              rows={9}
              placeholder="Paste pesan WhatsApp di sini… (Nama, WhatsApp, Layanan, Metode, Harga/Rp...)"
              value={raw}
              onChange={(e) => setRaw(sanitizeRaw(e.target.value))}
              style={{
                width: "100%",
                borderRadius: 14,
                border: `1px solid ${ui.border}`,
                padding: 12,
                outline: "none",
                fontSize: 13,
                color: ui.text,
                resize: "vertical",
                background: ui.surface,
                boxShadow: ui.shadow,
                lineHeight: 1.5,
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = `${ui.shadow}, ${ui.focusRing}`)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = ui.shadow)}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <Button variant="primary" onClick={handleParse} leftIcon="✨">
                Auto isi
              </Button>

              <Button variant="secondary" onClick={handleClearAll} leftIcon="🧹">
                Bersihkan
              </Button>

              <Button variant="secondary" onClick={copyRingkas} leftIcon="📋" disabled={!data?.nama && !data?.layanan && !data?.harga}>
                Copy ringkas
              </Button>
            </div>

            <Divider style={{ margin: "14px 0 12px" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 950, color: ui.text }}>Preview & Input Manual</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {fieldErrors?.identity || fieldErrors?.harga ? <Badge tone="danger">Belum valid</Badge> : <Badge tone="success">OK</Badge>}
                <Badge tone="neutral">{hideAmount ? "Angka disembunyikan" : "Angka terlihat"}</Badge>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <TextInput
                label="Nama"
                value={data.nama}
                onChange={(e) => handleManualChange("nama", e.target.value)}
                placeholder="contoh: Budi"
                error={fieldErrors.nama}
                hint={`${(data.nama || "").length}/${LIMITS.nameMax}`}
              />

              <TextInput
                label="WhatsApp"
                value={data.whatsapp}
                onChange={(e) => handleManualChange("whatsapp", e.target.value)}
                placeholder="contoh: 08xxxxxxxxxx"
                error={fieldErrors.whatsapp}
              />

              <TextInput
                label="Layanan"
                value={data.layanan}
                onChange={(e) => handleManualChange("layanan", e.target.value)}
                placeholder="contoh: Konsultasi"
                error={fieldErrors.layanan || fieldErrors.identity}
                hint={`${(data.layanan || "").length}/${LIMITS.layananMax}`}
              />

              <TextInput
                label="Metode"
                value={data.metode}
                onChange={(e) => handleManualChange("metode", e.target.value)}
                placeholder="contoh: Transfer / Cash"
                error={fieldErrors.metode}
                hint={`${(data.metode || "").length}/${LIMITS.metodeMax}`}
              />

              <TextInput
                label="Harga"
                value={hideAmount ? "••••••" : String(data.harga || "")}
                onChange={(e) => handleManualChange("harga", e.target.value)}
                placeholder="contoh: Rp 150.000"
                error={fieldErrors.harga}
                inputMode="numeric"
                hint={data.harga ? rupiah(data.harga) : "Masukkan angka / Rp"}
              />

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <Button variant="primary" disabled={!canSave} onClick={handleSave} leftIcon="💾">
                  {saving ? "Menyimpan..." : "Simpan Omset"}
                </Button>

                {!user ? (
                  <div style={{ fontSize: 12, color: ui.muted }}>
                    Kamu belum login — tombol simpan akan aktif setelah login.
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: ui.muted }}>
                    Validasi ketat aktif: minimal Nama/Layanan + Harga wajar.
                  </div>
                )}
              </div>

              <div style={{ fontSize: 12, color: ui.muted, lineHeight: 1.5 }}>
                Catatan: Pastikan pesan WA ada baris <b>Harga:</b> atau ada tulisan <b>Rp ...</b>.
              </div>
            </div>
          </Panel>

          {/* TABLE PANEL */}
          <Panel
            title="Riwayat Omset"
            subtitle="Cari cepat, lihat 20 data terbaru (terbaru di atas)."
            right={
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Badge tone="neutral">{filteredRows.length} baris</Badge>
              </div>
            }
          >
            <div style={{ display: "grid", gap: 10 }}>
              <TextInput
                label="Search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / layanan / metode / tanggal…"
                hint="Filter lokal"
              />

              <div style={{ overflowX: "auto", borderRadius: 14, border: `1px solid ${ui.border2}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
                  <thead>
                    <tr style={{ color: ui.muted, textAlign: "left", background: ui.surface2 }}>
                      <th style={{ padding: "12px 10px", borderBottom: `1px solid ${ui.border2}`, fontWeight: 950 }}>
                        Tanggal
                      </th>
                      <th style={{ padding: "12px 10px", borderBottom: `1px solid ${ui.border2}`, fontWeight: 950 }}>
                        Nama
                      </th>
                      <th style={{ padding: "12px 10px", borderBottom: `1px solid ${ui.border2}`, fontWeight: 950 }}>
                        Layanan
                      </th>
                      <th style={{ padding: "12px 10px", borderBottom: `1px solid ${ui.border2}`, fontWeight: 950 }}>
                        Metode
                      </th>
                      <th
                        style={{
                          padding: "12px 10px",
                          borderBottom: `1px solid ${ui.border2}`,
                          textAlign: "right",
                          fontWeight: 950,
                        }}
                      >
                        Pemasukan
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      [...Array(6)].map((_, idx) => (
                        <tr key={`sk-${idx}`} style={{ borderBottom: `1px solid ${ui.border2}` }}>
                          <td style={{ padding: "12px 10px" }}>
                            <div style={{ height: 10, width: 90, background: ui.border2, borderRadius: 10 }} />
                          </td>
                          <td style={{ padding: "12px 10px" }}>
                            <div style={{ height: 10, width: 140, background: ui.border2, borderRadius: 10 }} />
                          </td>
                          <td style={{ padding: "12px 10px" }}>
                            <div style={{ height: 10, width: 140, background: ui.border2, borderRadius: 10 }} />
                          </td>
                          <td style={{ padding: "12px 10px" }}>
                            <div style={{ height: 10, width: 110, background: ui.border2, borderRadius: 10 }} />
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "right" }}>
                            <div style={{ height: 10, width: 120, background: ui.border2, borderRadius: 10, marginLeft: "auto" }} />
                          </td>
                        </tr>
                      ))
                    ) : (filteredRows || []).slice(0, 20).length > 0 ? (
                      (filteredRows || []).slice(0, 20).map((r, idx) => (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: `1px solid ${ui.border2}`,
                            background: idx % 2 === 0 ? "#ffffff" : "#fbfdff",
                            transition: "background 120ms ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#ffffff" : "#fbfdff")}
                        >
                          <td style={{ padding: "12px 10px", color: ui.text, whiteSpace: "nowrap", fontWeight: 800 }}>
                            {r.tanggal}
                          </td>
                          <td style={{ padding: "12px 10px", color: ui.text, fontWeight: 800 }}>{r.nama}</td>
                          <td style={{ padding: "12px 10px", color: ui.text }}>{r.layanan}</td>
                          <td style={{ padding: "12px 10px", color: ui.text }}>
                            {r.metode ? <Badge tone="neutral">{r.metode}</Badge> : <span style={{ color: ui.subtle }}>—</span>}
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 950, color: ui.text }}>
                            {hideAmount ? "••••••" : rupiah(r.pemasukan)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: 14, color: ui.muted, textAlign: "center" }}>
                          Belum ada data (atau hasil filter kosong).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: ui.muted }}>
                  Menampilkan <b>20</b> data terbaru (setelah filter).
                </div>
                <div style={{ fontSize: 12, color: ui.muted }}>
                  Tips: pakai search untuk cari nama/layanan.
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 18, padding: "10px 4px", color: ui.muted, fontSize: 12, lineHeight: 1.5 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone="neutral">UI clean</Badge>
            <Badge tone="neutral">Tanpa gradient</Badge>
            <Badge tone="neutral">Validasi ketat</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
