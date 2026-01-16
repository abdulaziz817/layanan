import { useEffect, useMemo, useState } from "react";
import RatingStars from "../../components/ui/RatingStars";
import netlifyIdentity from "netlify-identity-widget";

/** kecil & simpel untuk responsif */
function useIsMobile(breakpoint = 820) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

export default function UlasanAdminPage() {
  const isMobile = useIsMobile(860);

  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [me, setMe] = useState(null);

  async function getJwt() {
    const user = netlifyIdentity.currentUser();
    if (!user) return null;
    return await user.jwt();
  }

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const user = netlifyIdentity.currentUser();
      setMe(user || null);

      const token = await getJwt();
      const res = await fetch("/.netlify/functions/ulasan-list", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || "Unauthorized");

      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      setItems([]);
      setErr(e.message || "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    netlifyIdentity.init();
    setMe(netlifyIdentity.currentUser() || null);
    load();

    const onLogin = () => {
      netlifyIdentity.close();
      setMe(netlifyIdentity.currentUser() || null);
      load();
    };

    const onLogout = () => {
      setMe(null);
      setItems([]);
      setErr("Unauthorized: login dulu");
    };

    netlifyIdentity.on("login", onLogin);
    netlifyIdentity.on("logout", onLogout);

    return () => {
      netlifyIdentity.off("login", onLogin);
      netlifyIdentity.off("logout", onLogout);
    };
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((it) => {
      const nama = (it.nama || "").toLowerCase();
      const ks = (it.kritik_saran || "").toLowerCase();
      return nama.includes(qq) || ks.includes(qq);
    });
  }, [items, q]);

  const stats = useMemo(() => {
    const n = items.length || 1;
    const avgP = items.reduce((a, b) => a + (Number(b.rating_produk) || 0), 0) / n;
    const avgT = items.reduce((a, b) => a + (Number(b.rating_toko) || 0), 0) / n;
    return {
      total: items.length,
      avgProduk: Math.round(avgP * 10) / 10,
      avgToko: Math.round(avgT * 10) / 10,
    };
  }, [items]);

  const meLabel =
    me?.user_metadata?.full_name ||
    me?.user_metadata?.name ||
    me?.email ||
    null;

  const headerTitle = "Kelola Ulasan";
  const headerDesc = "Pantau, cari, dan review masukan pelanggan.";

return (
  <div
    style={{
      ...a.page,

      /* OFFSET NAVBAR */
      paddingTop: isMobile ? "110px" : "130px",
      paddingLeft: isMobile ? "14px" : "16px",
      paddingRight: isMobile ? "14px" : "16px",
      paddingBottom: isMobile ? "36px" : a.page.padding,
    }}
  >
    <div style={a.shell}>
      {/* ===== HEADER (kaya referensi) ===== */}
      <div
        style={{
          ...a.header,
          marginBottom: isMobile ? 16 : 24,

          /* penting: jangan 2 kolom lagi */
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 12,
        }}
      >
        {/* TOP TEXT */}
        <div
          style={{
            ...a.headerLeft,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 8,
          }}
        >
          <div style={a.kicker}>Admin • Founder only</div>

          <h2
            style={{
              fontSize: isMobile ? 22 : 30,
              fontWeight: 700,
              color: "#0F172A",
              margin: 0,
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            Kelola Ulasan
          </h2>

          <p
            style={{
              fontSize: isMobile ? 13 : 14,
              color: "#64748B",
              lineHeight: 1.7,
              maxWidth: 520,
              margin: 0,
              textAlign: "center",
            }}
          >
            Pantau dan kelola semua ulasan pelanggan di sini.
          </p>

          {/* STATUS PILL */}
          {meLabel ? (
            <div
              style={{
                ...a.mePill,
                marginTop: 6,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Login sebagai: <b>{meLabel}</b>
            </div>
          ) : (
            <div
              style={{
                ...a.mePillMuted,
                marginTop: 6,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Belum login
            </div>
          )}
        </div>

        {/* ACTION BUTTONS (CENTER, RESPONSIVE) */}
        <div
          style={{
            ...a.headerActions,
            justifyContent: "center",
            width: "100%",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          <button
            onClick={() => netlifyIdentity.open()}
            style={{
              ...a.btn,
              ...a.btnPrimary,
              width: isMobile ? "100%" : "auto",
              minWidth: isMobile ? "100%" : 120,
            }}
          >
            Login
          </button>

          <button
            onClick={() => netlifyIdentity.logout()}
            style={{
              ...a.btn,
              width: isMobile ? "100%" : "auto",
              minWidth: isMobile ? "100%" : 120,
            }}
          >
            Logout
          </button>

          <button
            onClick={load}
            disabled={loading}
            style={{
              ...a.btn,
              opacity: loading ? 0.6 : 1,
              width: isMobile ? "100%" : "auto",
              minWidth: isMobile ? "100%" : 120,
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {err && (
        <div style={a.alert}>
          <div style={{ fontWeight: 900 }}>Akses ditolak / error</div>
          <div style={{ marginTop: 6 }}>{err}</div>
          <div style={{ marginTop: 8, color: "#64748B" }}>
            Perlu akses khusus untuk masuk ke halaman ini.
          </div>
        </div>
      )}

        {!err && (
          <>
            {/* ===== STATS ===== */}
            <div
              style={{
                ...a.stats,
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              }}
            >
              <div style={a.statCard}>
                <div style={a.statLabel}>Total Ulasan</div>
                <div style={a.statValue}>{stats.total}</div>
              </div>

              <div style={a.statCard}>
                <div style={a.statLabel}>Rata-rata Produk</div>
                <div style={a.statValue}>{stats.avgProduk}</div>
              </div>

              <div style={a.statCard}>
                <div style={a.statLabel}>Rata-rata Toko</div>
                <div style={a.statValue}>{stats.avgToko}</div>
              </div>
            </div>

            {/* ===== TOOLBAR ===== */}
            <div
              style={{
                ...a.toolbar,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "stretch" : "center",
              }}
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama atau isi ulasan…"
                style={{ ...a.search, width: "100%" }}
              />
              <div style={{ ...a.count, alignSelf: isMobile ? "flex-end" : "center" }}>
                {filtered.length} tampil
              </div>
            </div>

            {/* ===== LIST ===== */}
            <div style={a.list}>
              {loading && <div style={a.muted}>Mengambil data…</div>}
              {!loading && filtered.length === 0 && (
                <div style={a.muted}>Belum ada ulasan.</div>
              )}

              {!loading &&
                filtered.map((it) => (
                  <div key={it.id} style={a.item}>
                    <div
                      style={{
                        ...a.itemHead,
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "stretch" : "flex-start",
                      }}
                    >
                      <div>
                        <div style={a.name}>{it.nama || "-"}</div>
                        <div style={a.time}>
                          {it.created_at
                            ? new Date(it.created_at).toLocaleString()
                            : "-"}
                        </div>
                      </div>

                      <div
                        style={{
                          ...a.ratingWrap,
                          width: isMobile ? "100%" : "auto",
                          justifyContent: isMobile ? "space-between" : "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            ...a.ratingBox,
                            minWidth: isMobile ? "100%" : 170,
                          }}
                        >
                          <div style={a.rLabel}>Produk</div>
                          <RatingStars value={it.rating_produk} readOnly size={18} />
                        </div>

                        <div
                          style={{
                            ...a.ratingBox,
                            minWidth: isMobile ? "100%" : 170,
                          }}
                        >
                          <div style={a.rLabel}>Toko</div>
                          <RatingStars value={it.rating_toko} readOnly size={18} />
                        </div>
                      </div>
                    </div>

                    <div style={a.msg}>{it.kritik_saran || ""}</div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const a = {
  page: {
    minHeight: "calc(100vh - 80px)",
    padding: "52px 16px",
    background:
      "radial-gradient(900px 500px at 10% 0%, rgba(15,23,42,0.08), transparent 60%), linear-gradient(180deg, #fff 0%, #F8FAFC 100%)",
  },
  shell: { maxWidth: 1100, margin: "0 auto" },

  /* ===== HEADER (mirip referensi) ===== */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    flexWrap: "wrap",
  },
  headerLeft: { maxWidth: 640 },
  headerActions: { display: "flex", gap: 10, flexWrap: "wrap" },

  kicker: {
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#64748B",
    fontWeight: 900,
  },
  h2: {
    margin: "8px 0 8px",
    fontSize: 32,
    letterSpacing: "-0.04em",
    color: "#0F172A",
    lineHeight: 1.15,
  },
  p: { margin: 0, color: "#64748B", lineHeight: 1.7 },

  mePill: {
    marginTop: 10,
    display: "inline-block",
    fontSize: 12,
    color: "#0F172A",
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.85)",
    padding: "8px 12px",
    borderRadius: 999,
  },
  mePillMuted: {
    marginTop: 10,
    display: "inline-block",
    fontSize: 12,
    color: "#64748B",
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.85)",
    padding: "8px 12px",
    borderRadius: 999,
  },

  btn: {
    borderRadius: 14,
    padding: "12px 14px",
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.85)",
    boxShadow: "0 12px 40px rgba(2,6,23,0.06)",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnPrimary: {
    borderColor: "#0F172A",
    background: "#0F172A",
    color: "#fff",
  },

  alert: {
    borderRadius: 18,
    border: "1px solid rgba(239,68,68,0.25)",
    background: "rgba(239,68,68,0.08)",
    padding: 14,
    color: "#991B1B",
    marginTop: 10,
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    margin: "12px 0 12px",
  },
  statCard: {
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.85)",
    boxShadow: "0 12px 40px rgba(2,6,23,0.06)",
    padding: 14,
  },
  statLabel: { fontSize: 12, color: "#64748B", fontWeight: 900 },
  statValue: { marginTop: 6, fontSize: 24, fontWeight: 1000, color: "#0F172A" },

  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "10px 0 12px",
  },
  search: {
    flex: 1,
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "12px 14px",
    outline: "none",
    background: "rgba(255,255,255,0.9)",
  },
  count: {
    fontSize: 12,
    color: "#64748B",
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.8)",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
  },

  list: { display: "grid", gap: 12 },
  item: {
    borderRadius: 20,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 14px 50px rgba(2,6,23,0.07)",
    padding: 14,
  },
  itemHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  name: { fontWeight: 1000, color: "#0F172A", fontSize: 16 },
  time: { marginTop: 4, fontSize: 12, color: "#94A3B8" },

  ratingWrap: { display: "flex", gap: 12, alignItems: "center" },
  ratingBox: {
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(248,250,252,0.75)",
    padding: "10px 12px",
    minWidth: 170,
  },
  rLabel: { fontSize: 12, color: "#64748B", fontWeight: 900, marginBottom: 6 },

  msg: {
    marginTop: 10,
    whiteSpace: "pre-wrap",
    color: "#0F172A",
    lineHeight: 1.7,
  },
  muted: {
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.85)",
    padding: 14,
    color: "#64748B",
  },
};
