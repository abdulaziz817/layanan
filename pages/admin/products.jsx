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

/* =======================
   Rupiah helpers
======================= */
function digitsOnly(s) {
  return String(s || "").replace(/[^\d]/g, "");
}

function formatRupiahFromDigits(digits) {
  const n = digitsOnly(digits);
  if (!n) return "";
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function toNumberFromRupiah(textOrDigits) {
  const n = digitsOnly(textOrDigits);
  return n ? Number(n) : 0;
}

function rupiahFromNumber(n) {
  const num = Number(n || 0);
  return "Rp " + num.toLocaleString("id-ID");
}

/* =======================
   Labels / bool
======================= */
function labelType(t) {
  if (t === "premium_app") return "Aplikasi Premium";
  if (t === "design") return "Desain";
  if (t === "web_dev") return "Web Developer";
  if (String(t).toUpperCase() === "ALL") return "Semua";
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

  // ✅ auto edit dari query: /admin/products?edit=prd-xxx
  useEffect(() => {
    const id = router.query?.edit;
    if (!id) return;
    if (!data?.length) return;

    const p = data.find((x) => x.id === id);
    if (p) editRow(p);

    // bersihin query biar ga kebuka terus
    router.replace("/admin/products", undefined, { shallow: true });
    // eslint-disable-next-line
  }, [router.query?.edit, data]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function resetForm() {
    setForm(() => ({
      ...empty,
      supplier_type:
        String(me?.user?.supplier_type || "").toUpperCase() === "ALL"
          ? "premium_app"
          : me?.user?.supplier_type || "premium_app",
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

      // ✅ kirim angka murni
      price_normal: toNumberFromRupiah(form.price_normal),
      price_promo: form.price_promo === "" ? "" : toNumberFromRupiah(form.price_promo),

      promo_active: !!form.promo_active,
      stock_available: Math.max(0, Number(form.stock_available || 0)),
      stock_sold: Math.max(0, Number(form.stock_sold || 0)),
      code: form.code.trim(),
      desc: form.desc.trim(),
      best_seller: !!form.best_seller,
      active: !!form.active,
    };

    // validasi harga biar ga 0 semua
    if (payload.price_normal <= 0) {
      return setErr("Harga normal wajib lebih dari 0.");
    }

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

  try {
    const r = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include", // ✅ penting biar cookie login ikut
    });

    const text = await r.text(); // ✅ baca mentah dulu
    let j = {};
    try { j = JSON.parse(text); } catch {}

    if (!r.ok) {
      alert(
        `Gagal hapus!\n\nStatus: ${r.status}\nResponse: ${
          j?.error || text || "(kosong)"
        }`
      );
      return;
    }

    alert("Berhasil hapus (disembunyikan).");
    await load();
  } catch (e) {
    alert("Error client: " + e.message);
  }
}



  function editRow(p) {
    setMode("edit");
    setForm({
      id: p.id,
      supplier_id: p.supplier_id || "",
      supplier_type: p.supplier_type || "premium_app",
      title: p.title || "",

      // ✅ simpan digit saja
      price_normal: digitsOnly(String(p.price_normal ?? "")),
      price_promo: p.price_promo === "" ? "" : digitsOnly(String(p.price_promo ?? "")),

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
    <div className="page">
      {/* Header */}
      <div className="header">
        <div className="headerLeft">
          <div className="title">Dashboard Produk</div>
          <div className="sub">
            Login sebagai: <b>{me?.user?.role || "-"}</b> • Tipe:{" "}
            <b>{labelType(me?.user?.supplier_type)}</b>
          </div>
        </div>

        <div className="headerActions">
          <button className="btn" onClick={() => router.push("/admin/promo")}>
            Buat Promo
          </button>
          <button className="btnOutline" onClick={logout}>
            Keluar
          </button>
        </div>
      </div>

      {/* Error */}
      {err && <div className="errorBox">{err}</div>}

      {/* Form */}
      <div className="card">
        <div className="cardHead">
          <div>
            <div className="cardTitle">
              {mode === "create" ? "Tambah Produk" : "Edit Produk"}
            </div>
            <div className="cardHint">
              Ketik angka aja (contoh: 3000) nanti otomatis jadi Rp 3.000
            </div>
          </div>

          {mode === "edit" && (
            <button className="btnOutline" onClick={resetForm} type="button">
              Batal Edit
            </button>
          )}
        </div>

        <form className="formGrid" onSubmit={submit}>
          {/* Kolom kiri */}
          <div className="formCol">
            <Field label="Nama Produk">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Contoh: NETFLIX SHARING 1 BULAN 2U"
                className="input"
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                value={form.desc}
                onChange={(e) => set("desc", e.target.value)}
                placeholder="Contoh: GARANSI JIKA MENGIKUTI SNK"
                rows={3}
                className="textarea"
              />
            </Field>

            <div className="grid2">
              <Field label="Kode Produk">
                <input
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  placeholder="Contoh: net2u1b"
                  className="input"
                />
              </Field>

              <Field label="Supplier ID (opsional)">
                <input
                  value={form.supplier_id}
                  onChange={(e) => set("supplier_id", e.target.value)}
                  placeholder="Contoh: sup-001"
                  className="input"
                />
              </Field>
            </div>
          </div>

          {/* Kolom kanan */}
          <div className="formCol">
            <Field label="Kategori Supplier">
              <select
                value={form.supplier_type}
                onChange={(e) => set("supplier_type", e.target.value)}
                disabled={!isAdmin}
                className="input"
              >
                <option value="premium_app">Aplikasi Premium</option>
                <option value="design">Desain</option>
                <option value="web_dev">Web Developer</option>
              </select>

              {!isAdmin && (
                <div className="note">*Kategori otomatis sesuai role kamu.</div>
              )}
            </Field>

            <div className="grid2">
              <Field label="Harga Normal">
                <input
                  inputMode="numeric"
                  type="text"
                  value={formatRupiahFromDigits(form.price_normal)}
                  onChange={(e) => set("price_normal", digitsOnly(e.target.value))}
                  placeholder="Rp 19.000"
                  className="input"
                />
              </Field>

              <Field label="Harga Promo (opsional)">
                <input
                  inputMode="numeric"
                  type="text"
                  value={
                    form.price_promo === "" ? "" : formatRupiahFromDigits(form.price_promo)
                  }
                  onChange={(e) => set("price_promo", digitsOnly(e.target.value))}
                  placeholder="Rp 14.000"
                  className="input"
                />
              </Field>
            </div>

            <div className="grid2">
              <Field label="Stok Tersedia">
                <input
                  min={0}
                  inputMode="numeric"
                  type="number"
                  value={form.stock_available}
                  onChange={(e) => set("stock_available", e.target.value)}
                  placeholder="Contoh: 3"
                  className="input"
                />
              </Field>

              <Field label="Stok Terjual">
                <input
                  min={0}
                  inputMode="numeric"
                  type="number"
                  value={form.stock_sold}
                  onChange={(e) => set("stock_sold", e.target.value)}
                  placeholder="Contoh: 10"
                  className="input"
                />
              </Field>
            </div>

            <div className="checkWrap">
              <Checkbox
                checked={form.promo_active}
                onChange={(v) => set("promo_active", v)}
                label="Promo aktif (pakai harga promo)"
              />
              <Checkbox
                checked={form.best_seller}
                onChange={(v) => set("best_seller", v)}
                label="Best seller"
              />
              <Checkbox
                checked={form.active}
                onChange={(v) => set("active", v)}
                label="Aktif (tampil di promo)"
              />
            </div>

            <button className="btnPrimary" disabled={loading} type="submit">
              {loading
                ? "Menyimpan..."
                : mode === "create"
                ? "Simpan Produk"
                : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="listHead">
        <div className="listTitle">Daftar Produk</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama/kode/deskripsi..."
          className="input search"
        />
      </div>

      {/* Desktop table */}
      <div className="tableWrap desktopOnly">
        <div className="scrollX">
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Normal</th>
                <th>Promo</th>
                <th>Promo Aktif</th>
                <th>Stok</th>
                <th>Kode</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const total =
                  Number(p.stock_available || 0) + Number(p.stock_sold || 0);
                return (
                  <tr key={p.id} className={idx % 2 === 0 ? "row" : "row alt"}>
                    <td>
                      <div className="pTitle">{p.title}</div>
                      <div className="pDesc">{p.desc || "-"}</div>
                    </td>
                    <td>{labelType(p.supplier_type)}</td>
                    <td>{rupiahFromNumber(p.price_normal)}</td>
                    <td>
                      {p.price_promo === "" ? "-" : rupiahFromNumber(p.price_promo)}
                    </td>
                    <td>{toBool(p.promo_active) ? "Ya" : "Tidak"}</td>
                    <td>
                      <div>Tersedia: {p.stock_available}</div>
                      <div>Terjual: {p.stock_sold}</div>
                      <div className="muted">Total: {total}</div>
                    </td>
                    <td>
                      <code className="code">{p.code || "-"}</code>
                    </td>
                    <td>
                      <div className="rowActions">
                        <button
                          className="btnSmall"
                          onClick={() => editRow(p)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="btnSmallDanger"
                          onClick={() => remove(p.id)}
                          type="button"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="mobileOnly">
        {filtered.map((p) => {
          const total = Number(p.stock_available || 0) + Number(p.stock_sold || 0);
          return (
            <div key={p.id} className="pCard">
              <div className="pCardTop">
                <div>
                  <div className="pTitle">{p.title}</div>
                  <div className="pDesc">{p.desc || "-"}</div>
                </div>
                <div className="badge">{labelType(p.supplier_type)}</div>
              </div>

              <div className="pGrid">
                <div className="kv">
                  <div className="k">Harga Normal</div>
                  <div className="v">{rupiahFromNumber(p.price_normal)}</div>
                </div>
                <div className="kv">
                  <div className="k">Harga Promo</div>
                  <div className="v">
                    {p.price_promo === "" ? "-" : rupiahFromNumber(p.price_promo)}
                  </div>
                </div>
                <div className="kv">
                  <div className="k">Promo Aktif</div>
                  <div className="v">{toBool(p.promo_active) ? "Ya" : "Tidak"}</div>
                </div>
                <div className="kv">
                  <div className="k">Kode</div>
                  <div className="v">
                    <code className="code">{p.code || "-"}</code>
                  </div>
                </div>
                <div className="kv">
                  <div className="k">Stok</div>
                  <div className="v">
                    Tersedia: {p.stock_available} • Terjual: {p.stock_sold} •{" "}
                    <span className="muted">Total: {total}</span>
                  </div>
                </div>
              </div>

              <div className="pCardActions">
                <button className="btnSmall" onClick={() => editRow(p)} type="button">
                  Edit
                </button>
                <button
                  className="btnSmallDanger"
                  onClick={() => remove(p.id)}
                  type="button"
                >
                  Hapus
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && <div className="emptyCard">Tidak ada data.</div>}
      </div>

      <div style={{ height: 30 }} />

      <style jsx>{`
        .page {
          max-width: 1100px;
          margin: 24px auto;
          padding: 0 12px;
          font-family: system-ui, Arial;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }
        .title {
          font-size: 22px;
          font-weight: 800;
        }
        .sub {
          opacity: 0.75;
          font-size: 13px;
          margin-top: 4px;
        }
        .headerActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .errorBox {
          margin-top: 12px;
          padding: 12px;
          border-radius: 10px;
          background: #fff4f4;
          border: 1px solid #ffd0d0;
          color: #8a1f1f;
        }

        .card {
          margin-top: 16px;
          background: white;
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 16px;
          box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
        }
        .cardHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cardTitle {
          font-size: 16px;
          font-weight: 800;
        }
        .cardHint {
          font-size: 13px;
          opacity: 0.7;
          margin-top: 4px;
        }

        .formGrid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 14px;
        }
        .formCol {
          display: grid;
          gap: 10px;
        }
        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .label {
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 6px;
          opacity: 0.85;
        }

        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e6e6e6;
          border-radius: 10px;
          outline: none;
          font-size: 14px;
          background: #fff;
        }
        .textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e6e6e6;
          border-radius: 10px;
          outline: none;
          font-size: 14px;
          resize: vertical;
        }
        .note {
          font-size: 12px;
          opacity: 0.65;
          margin-top: 6px;
        }

        .checkWrap {
          display: grid;
          gap: 8px;
          margin-top: 4px;
        }

        .btn {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e6e6e6;
          background: white;
          cursor: pointer;
          font-weight: 700;
        }
        .btnOutline {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e6e6e6;
          background: white;
          cursor: pointer;
          font-weight: 700;
        }
        .btnPrimary {
          padding: 11px 12px;
          border-radius: 10px;
          border: none;
          background: #111;
          color: white;
          cursor: pointer;
          font-weight: 800;
          margin-top: 6px;
          width: 100%;
        }

        .listHead {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .listTitle {
          font-size: 16px;
          font-weight: 800;
        }
        .search {
          max-width: 320px;
        }

        .tableWrap {
          margin-top: 10px;
          background: white;
          border: 1px solid #eee;
          border-radius: 14px;
          overflow: hidden;
        }
        .scrollX {
          overflow-x: auto;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 900px;
        }
        th {
          text-align: left;
          padding: 10px 12px;
          font-size: 12px;
          opacity: 0.75;
          background: #fafafa;
          border-bottom: 1px solid #eee;
        }
        td {
          padding: 10px 12px;
          vertical-align: top;
          border-bottom: 1px solid #f0f0f0;
        }
        .row.alt {
          background: #fcfcfc;
        }
        .pTitle {
          font-weight: 800;
        }
        .pDesc {
          opacity: 0.75;
          font-size: 12px;
          margin-top: 2px;
        }
        .muted {
          opacity: 0.7;
        }
        .code {
          background: #f6f6f6;
          padding: 2px 6px;
          border-radius: 6px;
        }
        .rowActions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btnSmall {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #e6e6e6;
          background: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }
        .btnSmallDanger {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #ffd0d0;
          background: #fff4f4;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }
        .empty {
          padding: 16px;
          text-align: center;
          opacity: 0.7;
        }

        /* Mobile cards */
        .pCard {
          margin-top: 10px;
          background: white;
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
        }
        .pCardTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
        }
        .badge {
          font-size: 12px;
          font-weight: 800;
          padding: 6px 10px;
          border-radius: 999px;
          background: #f6f6f6;
          border: 1px solid #eee;
          white-space: nowrap;
        }
        .pGrid {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }
        .kv .k {
          font-size: 12px;
          font-weight: 800;
          opacity: 0.8;
        }
        .kv .v {
          font-size: 13px;
          margin-top: 3px;
        }
        .pCardActions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .emptyCard {
          margin-top: 10px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid #eee;
          background: white;
          text-align: center;
          opacity: 0.75;
        }

        .desktopOnly {
          display: block;
        }
        .mobileOnly {
          display: none;
        }

        /* ✅ Responsive breakpoints */
        @media (max-width: 900px) {
          .header {
            flex-direction: column;
            align-items: flex-start;
          }
          .headerActions {
            width: 100%;
          }
          .headerActions button {
            flex: 1;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }
          .grid2 {
            grid-template-columns: 1fr;
          }
          .search {
            max-width: 100%;
            width: 100%;
          }

          .desktopOnly {
            display: none;
          }
          .mobileOnly {
            display: block;
          }
        }

        @media (max-width: 420px) {
          .page {
            padding: 0 10px;
          }
          .btn,
          .btnOutline {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Field({ label, children }) {
  return (
    <div>
      <div className="label">{label}</div>
      {children}
      <style jsx>{`
        .label {
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 6px;
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label
      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span style={{ fontSize: 13 }}>{label}</span>
    </label>
  );
}
