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

  // validasi ketat (tanpa bocorin password)
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
    // kalau user mulai ngetik, hilangin error server pelan-pelan
    if (err) setErr("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ role: true, password: true });
    setErr("");

    // kalau invalid, kasih shake halus
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
          background: "white",
          display: "grid",
          placeItems: "center",
          padding: 16,
        }}
      >
        <motion.div
          key={shakeKey}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <motion.div
            animate={err ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
              background: "white",
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.05))",
                    display: "grid",
                    placeItems: "center",
                    border: "1px solid rgba(99,102,241,0.22)",
                  }}
                >
                  <span style={{ fontSize: 18 }}>🧾</span>
                </div>
                <div>
                  <h1 style={{ fontSize: 22, margin: 0, color: "#111827" }}>
                    Login Kwitansi
                  </h1>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
                    Akses khusus untuk halaman /kwitansi
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
              {/* ROLE */}
              <Field
                label="Role"
                value={role}
                onChange={(v) => setRole(v)}
               placeholder="Masukkan role"
                autoComplete="username"
                onBlur={() => setTouched((t) => ({ ...t, role: true }))}
                error={roleErr}
              />

              {/* PASSWORD */}
              <div>
                <label style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>
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
                      padding: "11px 44px 11px 12px",
                      borderRadius: 12,
                      border: `1px solid ${
                        pwErr ? "rgba(220,38,38,0.45)" : "rgba(209,213,219,1)"
                      }`,
                      outline: "none",
                      fontSize: 14,
                      background: "white",
                      transition: "box-shadow .15s ease, border-color .15s ease",
                      boxShadow: pwErr
                        ? "0 0 0 4px rgba(220,38,38,0.08)"
                        : "0 0 0 0 rgba(0,0,0,0)",
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
                      border: "1px solid rgba(229,231,235,1)",
                      background: "white",
                      padding: "6px 10px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#111827",
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
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#dc2626",
                      }}
                    >
                      {pwErr}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* ERROR SERVER */}
              <AnimatePresence initial={false}>
                {err ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      background: "rgba(220,38,38,0.06)",
                      border: "1px solid rgba(220,38,38,0.25)",
                      color: "#b91c1c",
                      padding: "10px 12px",
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                  >
                    {err}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* BUTTON */}
              <button
                disabled={!canSubmit}
                type="submit"
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(99,102,241,1)",
                  background: "rgb(79 70 229)", // indigo-600
                  color: "white",
                  fontWeight: 700,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  opacity: canSubmit ? 1 : 0.6,
                  transition: "transform .12s ease, box-shadow .12s ease, opacity .12s ease",
                  boxShadow: canSubmit
                    ? "0 10px 22px rgba(79,70,229,0.22)"
                    : "none",
                }}
                onMouseDown={(e) => {
                  // efek press halus
                  e.currentTarget.style.transform = "translateY(1px)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                }}
              >
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>
          </motion.div>

          <div style={{ marginTop: 12, textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
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
      <label style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>
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
          padding: "11px 12px",
          marginTop: 6,
          borderRadius: 12,
          border: `1px solid ${
            error ? "rgba(220,38,38,0.45)" : "rgba(209,213,219,1)"
          }`,
          outline: "none",
          fontSize: 14,
          background: "white",
          transition: "box-shadow .15s ease, border-color .15s ease",
          boxShadow: error
            ? "0 0 0 4px rgba(220,38,38,0.08)"
            : "0 0 0 0 rgba(0,0,0,0)",
        }}
      />
      <AnimatePresence initial={false}>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}
          >
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
