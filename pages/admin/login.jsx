import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/router";

function roleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "premium") return "Supplier Aplikasi Premium";
  if (role === "desain") return "Supplier Desain";
  if (role === "webdev") return "Supplier Web Developer";
  return role;
}

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {open ? (
      <>
        <path
          d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ) : (
      <>
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M10.6 10.6A2.5 2.5 0 0 0 14 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6.7 6.7C4.3 8.3 2.5 12 2.5 12s3.5 7 9.5 7c1.7 0 3.2-.4 4.6-1.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9.7 5.3A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-3 4.3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    )}
  </svg>
);

export default function Login() {
  const router = useRouter();

  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [touched, setTouched] = useState({ role: false, password: false });
  const [shake, setShake] = useState(false);

  const pwRef = useRef(null);

  const roleDesc = useMemo(() => {
    if (role === "admin") return "Akses penuh untuk mengelola data.";
    if (role === "premium") return "Akses untuk kategori Aplikasi Premium.";
    if (role === "desain") return "Akses untuk kategori Desain.";
    if (role === "webdev") return "Akses untuk kategori Web Developer.";
    return "";
  }, [role]);

  const roleError = useMemo(() => {
    if (!touched.role) return "";
    if (!role) return "Role wajib dipilih.";
    return "";
  }, [role, touched.role]);

  const pwError = useMemo(() => {
    if (!touched.password) return "";
    const v = password.trim();
    if (!v) return "Password wajib diisi.";
    if (v.length < 4) return "Password minimal 4 karakter.";
    return "";
  }, [password, touched.password]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.loggedIn) router.replace("/admin/products");
      })
      .catch(() => {});
  }, [router]);

  function triggerError(message) {
    setErr(message);
    setShake(true);
    window.clearTimeout(triggerError._t);
    triggerError._t = window.setTimeout(() => setShake(false), 300);
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setTouched({ role: true, password: true });

    if (!role) {
      triggerError("Pilih role terlebih dahulu.");
      return;
    }
    const v = password.trim();
    if (!v) {
      triggerError("Password wajib diisi.");
      pwRef.current?.focus?.();
      return;
    }
    if (v.length < 4) {
      triggerError("Password minimal 4 karakter.");
      pwRef.current?.focus?.();
      return;
    }

    setLoading(true);

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, password: v }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Login gagal. Coba lagi.");

      router.push("/admin/products");
    } catch (e2) {
      triggerError(e2.message);
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={{ ...s.card, ...(shake ? s.cardShake : {}) }}>
        {/* Title center */}
        <div style={s.titleWrap}>
          <div style={s.title}>Login Admin</div>
          <div style={s.subtitle}>Silakan pilih role dan masukkan password</div>
        </div>

        {err && (
          <div style={s.errorBox} role="alert" aria-live="polite">
            {err}
          </div>
        )}

        <form onSubmit={submit} style={{ marginTop: 14 }}>
          <div style={s.field}>
            <div style={s.label}>Role</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, role: true }))}
              style={{ ...s.input, ...(roleError ? s.inputError : {}) }}
              aria-invalid={!!roleError}
            >
              <option value="admin">{roleLabel("admin")}</option>
              <option value="premium">{roleLabel("premium")}</option>
              <option value="desain">{roleLabel("desain")}</option>
              <option value="webdev">{roleLabel("webdev")}</option>
            </select>
            <div style={s.helper}>{roleDesc}</div>
            {!!roleError && <div style={s.fieldError}>{roleError}</div>}
          </div>

          <div style={s.field}>
            <div style={s.label}>Password</div>
            <div style={s.pwWrap}>
              <input
                ref={pwRef}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Masukkan password"
                style={{ ...s.input, paddingRight: 44, ...(pwError ? s.inputError : {}) }}
                aria-invalid={!!pwError}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={s.iconBtn}
                aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                title={showPw ? "Sembunyikan" : "Lihat"}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
            {!!pwError && <div style={s.fieldError}>{pwError}</div>}
          </div>

          <button type="submit" disabled={loading} style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}>
            {loading ? "Memproses..." : "Masuk"}
          </button>

          {/* NOTE: sengaja tidak ada info soal sheet/db */}
          <div style={s.foot}>
            Jika mengalami kendala login, hubungi admin sistem.
          </div>
        </form>
      </div>

      <style>{css}</style>
    </div>
  );
}

/* ============ styles: simple, centered, professional ============ */
const s = {
  page: {
    height: "100dvh",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "#ffffff", // ← putih polos
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    border: "1px solid rgba(0,0,0,.08)",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)", // soft banget
    
  },
  cardShake: { animation: "shake .3s ease-in-out" },

  titleWrap: { textAlign: "center" },
  title: { fontSize: 18, fontWeight: 600, letterSpacing: -0.2 },
  subtitle: { marginTop: 6, fontSize: 12.5, opacity: 0.7 },

  errorBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    background: "#fff5f5",
    border: "1px solid rgba(255,0,0,.18)",
    color: "#7a1f1f",
    fontSize: 13,
    lineHeight: 1.4,
  },

  field: { marginTop: 14 },
  label: { fontSize: 12, fontWeight: 600, marginBottom: 8, opacity: 0.85 },

  input: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid rgba(0,0,0,.12)",
    borderRadius: 10,
    outline: "none",
    fontSize: 14,
    background: "#fff",
    transition: "border-color .15s ease, box-shadow .15s ease",
  },
  inputError: {
    borderColor: "rgba(255,0,0,.35)",
    boxShadow: "0 0 0 4px rgba(255,0,0,.08)",
  },

  helper: { marginTop: 8, fontSize: 12, opacity: 0.65, lineHeight: 1.35 },
  fieldError: { marginTop: 8, fontSize: 12, color: "#7a1f1f" },

  pwWrap: { position: "relative" },
  iconBtn: {
    position: "absolute",
    right: 6,
    top: "50%",
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: 9,
    border: "1px solid rgba(0,0,0,.10)",
    background: "#fff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "rgba(0,0,0,.65)",
    transition: "background .15s ease, transform .08s ease",
  },

  btn: {
    width: "100%",
    marginTop: 16,
    padding: "12px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.10)",
    background: "#111",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "filter .15s ease, transform .08s ease",
  },
  btnDisabled: { opacity: 0.8, cursor: "not-allowed" },

  foot: { marginTop: 12, fontSize: 12, opacity: 0.65, textAlign: "center" },
};

const css = `
input:focus, select:focus{
  border-color: rgba(0,0,0,.25);
  box-shadow: 0 0 0 4px rgba(0,0,0,.08);
}
button[type="submit"]:hover{ filter: brightness(1.06); }
button[type="submit"]:active{ transform: scale(.99); }
button[type="button"]:active{ transform: translateY(-50%) scale(.98); }

@keyframes shake{
  0%,100%{ transform: translateX(0); }
  25%{ transform: translateX(-4px); }
  50%{ transform: translateX(4px); }
  75%{ transform: translateX(-3px); }
}
`;
