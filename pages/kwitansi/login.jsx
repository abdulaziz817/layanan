// pages/kwitansi/login.jsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KwitansiLogin() {
  const router = useRouter();
  const nextPath =
    (router.query.next && String(router.query.next)) || "/kwitansi";

  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [touched, setTouched] = useState({ role: false, password: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  const roleErr = useMemo(() => {
    const r = role.trim();
    if (!touched.role) return "";
    if (!r) return "Role wajib diisi.";
    if (r.length < 3) return "Role minimal 3 karakter.";
    if (!/^[a-z0-9_]+$/i.test(r)) return "Role hanya boleh huruf/angka/underscore.";
    return "";
  }, [role, touched.role]);

  const pwErr = useMemo(() => {
    const p = password;
    if (!touched.password) return "";
    if (!p) return "Password wajib diisi.";
    if (p.length < 8) return "Password minimal 8 karakter.";
    return "";
  }, [password, touched.password]);

  const canSubmit = useMemo(() => {
    return (
      role.trim().length >= 3 &&
      password.length >= 8 &&
      !roleErr &&
      !pwErr &&
      !loading
    );
  }, [role, password, roleErr, pwErr, loading]);

  useEffect(() => {
    if (err) setErr("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ role: true, password: true });
    setErr("");

    if (role.trim().length < 3 || password.length < 8 || roleErr || pwErr) {
      setShakeKey((k) => k + 1);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/kwitansi-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.message || "Login gagal. Coba lagi.");
        setLoading(false);
        setShakeKey((k) => k + 1);
        return;
      }

      router.push(nextPath);
    } catch (e2) {
      setErr("Terjadi error jaringan. Coba lagi.");
      setLoading(false);
      setShakeKey((k) => k + 1);
    }
  }

  return (
    <>
      <Head>
        <title>Login Kwitansi</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

<div
  style={{
    minHeight: "100vh",
    background: "#ffffff",
    display: "grid",
    placeItems: "center",
    padding: 16,
  }}
>

        <motion.div
          key={shakeKey}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 420, position: "relative" }}
        >
          <motion.div
            animate={err ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.36 }}
           style={{
  borderRadius: 12,
  padding: 24,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
}}

          >
            {/* HEADER CENTER */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  margin: "0 auto 10px",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(79,70,229,0.18), rgba(79,70,229,0.06))",
                  border: "1px solid rgba(79,70,229,0.22)",
                  boxShadow: "0 10px 22px rgba(79,70,229,0.10)",
                }}
              >
                <span style={{ fontSize: 22 }}>🧾</span>
              </div>

              {/* ini yang kamu minta: Login di tengah box dan bold */}
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  color: "#0f172a",
                }}
              >
                Login
              </h1>
              <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
                Akses khusus untuk halaman kwitansi
              </p>
            </div>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
              <Field
                label="Role"
                value={role}
                onChange={(v) => setRole(v)}
                placeholder="Masukkan role"
                autoComplete="username"
                onBlur={() => setTouched((t) => ({ ...t, role: true }))}
                error={roleErr}
              />

              <div>
                <label style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>
                  Password
                </label>

                <div style={{ position: "relative", marginTop: 6 }}>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    placeholder="••••••••••"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      padding: "12px 46px 12px 12px",
                      borderRadius: 14,
                      border: `1px solid ${
                        pwErr ? "rgba(239,68,68,0.55)" : "rgba(148,163,184,0.55)"
                      }`,
                      outline: "none",
                      fontSize: 14,
                      background: "rgba(255,255,255,0.85)",
                      transition: "box-shadow .15s ease, border-color .15s ease, transform .08s ease",
                      boxShadow: pwErr
                        ? "0 0 0 5px rgba(239,68,68,0.10)"
                        : "0 0 0 0 rgba(0,0,0,0)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = pwErr
                        ? "0 0 0 5px rgba(239,68,68,0.10)"
                        : "0 0 0 6px rgba(79,70,229,0.10)";
                      e.currentTarget.style.borderColor = pwErr
                        ? "rgba(239,68,68,0.55)"
                        : "rgba(79,70,229,0.45)";
                    }}
                    onBlurCapture={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow = pwErr
                        ? "0 0 0 5px rgba(239,68,68,0.10)"
                        : "0 0 0 0 rgba(0,0,0,0)";
                      e.currentTarget.style.borderColor = pwErr
                        ? "rgba(239,68,68,0.55)"
                        : "rgba(148,163,184,0.55)";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "1px solid rgba(226,232,240,1)",
                      background: "rgba(255,255,255,0.9)",
                      padding: "7px 10px",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {pwErr ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      style={{ marginTop: 6, fontSize: 12, color: "#ef4444" }}
                    >
                      {pwErr}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <AnimatePresence initial={false}>
                {err ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.28)",
                      color: "#b91c1c",
                      padding: "10px 12px",
                      borderRadius: 14,
                      fontSize: 13,
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span aria-hidden style={{ marginTop: 1 }}>
                      ⚠️
                    </span>
                    <span>{err}</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <button
                disabled={!canSubmit}
                type="submit"
                style={{
                  marginTop: 2,
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(79,70,229,0.45)",
                  background:
                    "linear-gradient(135deg, rgba(79,70,229,1) 0%, rgba(99,102,241,1) 55%, rgba(79,70,229,1) 100%)",
                  color: "white",
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  opacity: canSubmit ? 1 : 0.55,
                  transition: "transform .12s ease, box-shadow .12s ease, opacity .12s ease",
                  boxShadow: canSubmit
                    ? "0 14px 30px rgba(79,70,229,0.22)"
                    : "none",
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(1px)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                }}
              >
                {loading ? "Memproses..." : "Login"}
              </button>

              {/* small hint */}
              <div style={{ marginTop: 2, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
                Pastikan role & password benar.
              </div>
            </form>
          </motion.div>

          <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
            © {new Date().getFullYear()} Layanan Nusantara
          </div>
        </motion.div>
      </div>
    </>
  );
}

function Field({ label, value, onChange, placeholder, autoComplete, onBlur, error }) {
  return (
    <div>
      <label style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "12px 12px",
          marginTop: 6,
          borderRadius: 14,
          border: `1px solid ${
            error ? "rgba(239,68,68,0.55)" : "rgba(148,163,184,0.55)"
          }`,
          outline: "none",
          fontSize: 14,
          background: "#ffffff",
          transition: "box-shadow .15s ease, border-color .15s ease, transform .08s ease",
          boxShadow: error ? "0 0 0 5px rgba(239,68,68,0.10)" : "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = error
            ? "0 0 0 5px rgba(239,68,68,0.10)"
            : "0 0 0 6px rgba(79,70,229,0.10)";
          e.currentTarget.style.borderColor = error
            ? "rgba(239,68,68,0.55)"
            : "rgba(79,70,229,0.45)";
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.transform = "translateY(0px)";
          e.currentTarget.style.boxShadow = error
            ? "0 0 0 5px rgba(239,68,68,0.10)"
            : "0 0 0 0 rgba(0,0,0,0)";
          e.currentTarget.style.borderColor = error
            ? "rgba(239,68,68,0.55)"
            : "rgba(148,163,184,0.55)";
        }}
      />
      <AnimatePresence initial={false}>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ marginTop: 6, fontSize: 12, color: "#ef4444" }}
          >
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
