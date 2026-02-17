import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

function roleLabel(role) {
  if (role === "admin") return "Admin (Akses Semua)";
  if (role === "premium") return "Supplier Aplikasi Premium";
  if (role === "desain") return "Supplier Desain";
  if (role === "webdev") return "Supplier Web Developer";
  return role;
}

export default function Login() {
  const router = useRouter();

  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const roleDesc = useMemo(() => {
    if (role === "admin") return "Bisa lihat & kelola semua produk, semua kategori.";
    if (role === "premium") return "Hanya bisa kelola kategori: Aplikasi Premium.";
    if (role === "desain") return "Hanya bisa kelola kategori: Desain.";
    if (role === "webdev") return "Hanya bisa kelola kategori: Web Developer.";
    return "";
  }, [role]);

  useEffect(() => {
    // kalau sudah login, langsung masuk dashboard
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.loggedIn) router.replace("/admin/products");
      })
      .catch(() => {});
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, password }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Login gagal");

      router.push("/admin/products");
    } catch (e2) {
      setErr(e2.message);
      setLoading(false);
    }
  }

  return (
    <div style={page()}>
      <div style={card()}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Login Admin</div>
          <div style={{ opacity: 0.75, fontSize: 13, marginTop: 6 }}>
            Layanan Nusantara • Dashboard Produk & Promo
          </div>
        </div>

        {/* Error */}
        {err && (
          <div style={errorBox()}>
            {err}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} style={{ marginTop: 14 }}>
          <div style={label()}>Pilih Role</div>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={input()}>
            <option value="admin">{roleLabel("admin")}</option>
            <option value="premium">{roleLabel("premium")}</option>
            <option value="desain">{roleLabel("desain")}</option>
            <option value="webdev">{roleLabel("webdev")}</option>
          </select>

          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            {roleDesc}
          </div>

          <div style={{ height: 12 }} />

          <div style={label()}>Password</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password role"
              style={input()}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={btnOutline()}
              title="Tampilkan / sembunyikan password"
            >
              {showPw ? "Sembunyikan" : "Lihat"}
            </button>
          </div>

          <button type="submit" disabled={loading} style={btnPrimary()}>
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
            Password diambil dari sheet <b>roles</b>. Kalau password salah, cek kolom <b>password</b> di sheet itu.
          </div>
        </form>
      </div>
    </div>
  );
}

/* styles */
function page() {
  return {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(1200px 600px at 20% 20%, #f3f3ff 0%, rgba(243,243,255,0) 60%), radial-gradient(1200px 600px at 80% 30%, #f6fff7 0%, rgba(246,255,247,0) 60%), #ffffff",
    fontFamily: "system-ui, Arial",
    padding: 16,
  };
}

function card() {
  return {
    width: "100%",
    maxWidth: 420,
    background: "white",
    border: "1px solid #eee",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  };
}

function label() {
  return { fontSize: 12, fontWeight: 800, marginBottom: 6, opacity: 0.8 };
}

function input() {
  return {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e6e6e6",
    borderRadius: 10,
    outline: "none",
    fontSize: 14,
  };
}

function btnPrimary() {
  return {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 10,
    border: "none",
    background: "#111",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
    marginTop: 14,
  };
}

function btnOutline() {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "white",
    cursor: "pointer",
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
}

function errorBox() {
  return {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    background: "#fff4f4",
    border: "1px solid #ffd0d0",
    color: "#8a1f1f",
    fontSize: 13,
  };
}
