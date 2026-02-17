import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

const empty = {
  id: "",
  supplier_id: "",
  supplier_type: "premium_app",
  title: "",
  price_normal: "",
  price_promo: "",
  promo_active: false,
  stock_available: "",
  stock_sold: "",
  code: "",
  desc: "",
  best_seller: false,
  active: true,
};

function labelType(t) {
  if (t === "premium_app") return "Aplikasi Premium";
  if (t === "design") return "Desain";
  if (t === "web_dev") return "Web Developer";
  return t || "-";
}

function toBool(v) {
  return String(v).toUpperCase() === "TRUE";
}

export default function Products() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [data, setData] = useState([]);
  const [form, setForm] = useState(empty);
  const [mode, setMode] = useState("create"); // create | edit
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = useMemo(
    () => String(me?.user?.supplier_type || "").toUpperCase() === "ALL",
    [me]
  );

  async function load() {
    setErr("");
    setLoading(true);

    const rMe = await fetch("/api/auth/me");
    const jMe = await rMe.json();
    if (!jMe.loggedIn) return router.replace("/admin/login");
    setMe(jMe);

    // default supplier_type sesuai role
    const st = jMe.user?.supplier_type;
    if (st && String(st).toUpperCase() !== "ALL") {
      setForm((f) => ({ ...f, supplier_type: st }));
    }

    const r = await fetch("/api/products");
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error || "Gagal memuat produk");
      setLoading(false);
      return;
    }
    setData(j.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function resetForm() {
    setForm((f) => ({
      ...empty,
      supplier_type:
        String(me?.user?.supplier_type || "").toUpperCase() === "ALL"
          ? "premium_app"
          : (me?.user?.supplier_type || "premium_app"),
    }));
    setMode("create");
  }

  async function logout() {
    await fetch("/api/auth/logout");
    router.replace("/admin/login");
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) return setErr("Nama produk wajib diisi.");

    const payload = {
      supplier_id: form.supplier_id || "",
      supplier_type: form.supplier_type,
      title: form.title.trim(),
      price_normal: Number(form.price_normal || 0),
      price_promo: form.price_promo === "" ? "" : Number(form.price_promo),
      promo_active: !!form.promo_active,
      stock_available: Number(form.stock_available || 0),
      stock_sold: Number(form.stock_sold || 0),
      code: form.code.trim(),
      desc: form.desc.trim(),
      best_seller: !!form.best_seller,
      active: !!form.active,
    };

    try {
      setLoading(true);

      if (mode === "create") {
        const r = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Gagal tambah produk");
      } else {
        const r = await fetch(`/api/products/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // untuk PUT, kita kirim format sheet-friendly
            supplier_id: payload.supplier_id,
            supplier_type: payload.supplier_type,
            title: payload.title,
            price_normal: payload.price_normal,
            price_promo: payload.price_promo,
            promo_active: payload.promo_active ? "TRUE" : "FALSE",
            stock_available: payload.stock_available,
            stock_sold: payload.stock_sold,
            code: payload.code,
            desc: payload.desc,
            best_seller: payload.best_seller ? "TRUE" : "FALSE",
            active: payload.active ? "TRUE" : "FALSE",
          }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Gagal edit produk");
      }

      resetForm();
      await load();
    } catch (e2) {
      setErr(e2.message);
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!confirm("Yakin hapus produk ini? (Produk akan disembunyikan)")) return;
    const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return alert(j.error || "Gagal hapus");
    load();
  }

  function editRow(p) {
    setMode("edit");
    setForm({
      id: p.id,
      supplier_id: p.supplier_id || "",
      supplier_type: p.supplier_type || "premium_app",
      title: p.title || "",
      price_normal: String(p.price_normal ?? ""),
      price_promo: p.price_promo === "" ? "" : String(p.price_promo ?? ""),
      promo_active: toBool(p.promo_active),
      stock_available: String(p.stock_available ?? ""),
      stock_sold: String(p.stock_sold ?? ""),
      code: p.code || "",
      desc: p.desc || "",
      best_seller: toBool(p.best_seller),
      active: toBool(p.active),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p) => {
      return (
        (p.title || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q) ||
        (p.desc || "").toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 12px", fontFamily: "system-ui, Arial" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 0", borderBottom: "1px solid #eee"
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Dashboard Produk</div>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Login sebagai: <b>{me?.user?.role || "-"}</b> • Tipe: <b>{labelType(me?.user?.supplier_type)}</b>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => router.push("/admin/promo")} style={btn()}>
            Buat Promo
          </button>
          <button onClick={logout} style={btnOutline()}>
            Keluar
          </button>
        </div>
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

      {/* Form Card */}
      <div style={{
        marginTop: 16, background: "white", border: "1px solid #eee",
        borderRadius: 14, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {mode === "create" ? "Tambah Produk" : "Edit Produk"}
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              Isi seperlunya. Angka tanpa titik/koma (contoh: 14000).
            </div>
          </div>
          {mode === "edit" && (
            <button onClick={resetForm} style={btnOutline()}>
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={submit} style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>
          {/* kiri */}
          <div style={{ display: "grid", gap: 10 }}>
            <Field label="Nama Produk">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Contoh: NETFLIX SHARING 1 BULAN 2U"
                style={input()}
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                value={form.desc}
                onChange={(e) => set("desc", e.target.value)}
                placeholder="Contoh: GARANSI JIKA MENGIKUTI SNK"
                rows={3}
                style={textarea()}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Kode Produk">
                <input
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  placeholder="Contoh: net2u1b"
                  style={input()}
                />
              </Field>

              <Field label="Supplier ID (opsional)">
                <input
                  value={form.supplier_id}
                  onChange={(e) => set("supplier_id", e.target.value)}
                  placeholder="Contoh: sup-001"
                  style={input()}
                />
              </Field>
            </div>
          </div>

          {/* kanan */}
          <div style={{ display: "grid", gap: 10 }}>
            <Field label="Kategori Supplier">
              <select
                value={form.supplier_type}
                onChange={(e) => set("supplier_type", e.target.value)}
                disabled={!isAdmin}
                style={input()}
              >
                <option value="premium_app">Aplikasi Premium</option>
                <option value="design">Desain</option>
                <option value="web_dev">Web Developer</option>
              </select>
              {!isAdmin && (
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
                  *Kategori otomatis sesuai role kamu.
                </div>
              )}
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Harga Normal">
                <input
                  type="number"
                  value={form.price_normal}
                  onChange={(e) => set("price_normal", e.target.value)}
                  placeholder="Contoh: 19000"
                  style={input()}
                />
              </Field>

              <Field label="Harga Promo (opsional)">
                <input
                  type="number"
                  value={form.price_promo}
                  onChange={(e) => set("price_promo", e.target.value)}
                  placeholder="Contoh: 14000"
                  style={input()}
                />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Stok Tersedia">
                <input
                  type="number"
                  value={form.stock_available}
                  onChange={(e) => set("stock_available", e.target.value)}
                  placeholder="Contoh: 3"
                  style={input()}
                />
              </Field>
              <Field label="Stok Terjual">
                <input
                  type="number"
                  value={form.stock_sold}
                  onChange={(e) => set("stock_sold", e.target.value)}
                  placeholder="Contoh: 10"
                  style={input()}
                />
              </Field>
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
              <Checkbox checked={form.promo_active} onChange={(v) => set("promo_active", v)} label="Promo aktif (pakai harga promo)" />
              <Checkbox checked={form.best_seller} onChange={(v) => set("best_seller", v)} label="Best seller" />
              <Checkbox checked={form.active} onChange={(v) => set("active", v)} label="Aktif (tampil di promo)" />
            </div>

            <button disabled={loading} type="submit" style={btnPrimary()}>
              {loading ? "Menyimpan..." : mode === "create" ? "Simpan Produk" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Daftar Produk</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama/kode/deskripsi..."
          style={{ ...input(), maxWidth: 320 }}
        />
      </div>

      <div style={{
        marginTop: 10, background: "white", border: "1px solid #eee",
        borderRadius: 14, overflow: "hidden"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
                <Th>Nama</Th>
                <Th>Kategori</Th>
                <Th>Normal</Th>
                <Th>Promo</Th>
                <Th>Promo Aktif</Th>
                <Th>Stok</Th>
                <Th>Kode</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const total = Number(p.stock_available || 0) + Number(p.stock_sold || 0);
                const rowBg = idx % 2 === 0 ? "white" : "#fcfcfc";
                return (
                  <tr key={p.id} style={{ background: rowBg, borderBottom: "1px solid #f0f0f0" }}>
                    <Td>
                      <div style={{ fontWeight: 700 }}>{p.title}</div>
                      <div style={{ opacity: 0.7, fontSize: 12, marginTop: 2 }}>
                        {p.desc || "-"}
                      </div>
                    </Td>
                    <Td>{labelType(p.supplier_type)}</Td>
                    <Td>{p.price_normal}</Td>
                    <Td>{p.price_promo === "" ? "-" : p.price_promo}</Td>
                    <Td>{toBool(p.promo_active) ? "Ya" : "Tidak"}</Td>
                    <Td>
                      <div>Tersedia: {p.stock_available}</div>
                      <div>Terjual: {p.stock_sold}</div>
                      <div style={{ opacity: 0.7 }}>Total: {total}</div>
                    </Td>
                    <Td><code style={{ background:"#f6f6f6", padding:"2px 6px", borderRadius:6 }}>{p.code || "-"}</code></Td>
                    <Td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => editRow(p)} style={btnSmall()}>Edit</button>
                        <button onClick={() => remove(p.id)} style={btnSmallDanger()}>Hapus</button>
                      </div>
                    </Td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 16, textAlign: "center", opacity: 0.7 }}>
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 30 }} />
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, opacity: 0.8 }}>{label}</div>
      {children}
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span style={{ fontSize: 13 }}>{label}</span>
    </label>
  );
}

function Th({ children }) {
  return <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, opacity: 0.75 }}>{children}</th>;
}
function Td({ children }) {
  return <td style={{ padding: "10px 12px", verticalAlign: "top" }}>{children}</td>;
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
function textarea() {
  return {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e6e6e6",
    borderRadius: 10,
    outline: "none",
    resize: "vertical",
  };
}

function btn() {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "white",
    cursor: "pointer",
  };
}
function btnOutline() {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "white",
    cursor: "pointer",
  };
}
function btnPrimary() {
  return {
    padding: "11px 12px",
    borderRadius: 10,
    border: "none",
    background: "#111",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    marginTop: 6,
  };
}
function btnSmall() {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    background: "white",
    cursor: "pointer",
    fontSize: 12,
  };
}
function btnSmallDanger() {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ffd0d0",
    background: "#fff4f4",
    cursor: "pointer",
    fontSize: 12,
  };
}
