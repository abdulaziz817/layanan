import { useEffect, useMemo, useState } from "react";
import RatingStars from "../../components/ui/RatingStars";
import netlifyIdentity from "netlify-identity-widget";

export default function UlasanAdminPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [me, setMe] = useState(null); // buat nampilin status login

  async function getJwt() {
    const user = netlifyIdentity.currentUser();
    if (!user) return null;
    // netlify-identity-widget: jwt() return Promise<string>
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
    // init kalau belum
    netlifyIdentity.init();

    // set status user awal
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
    const avgP =
      items.reduce((a, b) => a + (Number(b.rating_produk) || 0), 0) / n;
    const avgT =
      items.reduce((a, b) => a + (Number(b.rating_toko) || 0), 0) / n;
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

  return (
    <div style={a.page}>
      <div style={a.shell}>
        <div style={a.top}>
          <div>
            <div style={a.kicker}>Admin • Founder only</div>
            <h1 style={a.h1}>Ulasan</h1>
            <p style={a.sub}>Semua ulasan dari tab “ulasan” di spreadsheet kamu.</p>
            {meLabel ? (
              <div style={a.mePill}>Logged in as: <b>{meLabel}</b></div>
            ) : (
              <div style={a.mePillMuted}>Belum login</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => netlifyIdentity.open()}
              style={{
                ...a.btn,
                borderColor: "#0F172A",
                background: "#0F172A",
                color: "#fff",
              }}
            >
              Login Admin
            </button>

            <button onClick={() => netlifyIdentity.logout()} style={a.btn}>
              Logout
            </button>

            <button
              onClick={load}
              disabled={loading}
              style={{ ...a.btn, opacity: loading ? 0.6 : 1 }}
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
              Kalau sudah login tapi masih 403, biasanya email kamu tidak sama dengan <b>ADMIN_EMAIL</b> di Netlify.
            </div>
          </div>
        )}

        {!err && (
          <>
            <div style={a.stats}>
              <div style={a.statCard}>
                <div style={a.statLabel}>Total</div>
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

            <div style={a.toolbar}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / kata di kritik-saran…"
                style={a.search}
              />
              <div style={a.count}>{filtered.length} tampil</div>
            </div>

            <div style={a.list}>
              {loading && <div style={a.muted}>Mengambil data…</div>}
              {!loading && filtered.length === 0 && (
                <div style={a.muted}>Belum ada ulasan.</div>
              )}

              {!loading &&
                filtered.map((it) => (
                  <div key={it.id} style={a.item}>
                    <div style={a.itemHead}>
                      <div>
                        <div style={a.name}>{it.nama || "-"}</div>
                        <div style={a.time}>
                          {it.created_at
                            ? new Date(it.created_at).toLocaleString()
                            : "-"}
                        </div>
                      </div>

                      <div style={a.ratingWrap}>
                        <div style={a.ratingBox}>
                          <div style={a.rLabel}>Produk</div>
                          <RatingStars value={it.rating_produk} readOnly size={18} />
                        </div>
                        <div style={a.ratingBox}>
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
  kicker: {
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#64748B",
    fontWeight: 900,
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 18,
  },
  h1: { margin: "8px 0 8px", fontSize: 34, letterSpacing: "-0.04em", color: "#0F172A" },
  sub: { margin: 0, color: "#64748B", lineHeight: 1.7 },

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

  alert: {
    borderRadius: 18,
    border: "1px solid rgba(239,68,68,0.25)",
    background: "rgba(239,68,68,0.08)",
    padding: 14,
    color: "#991B1B",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 12,
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
