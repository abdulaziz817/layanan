import { useEffect, useMemo, useRef, useState } from "react";
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
  // aman untuk boolean / string
  if (typeof v === "boolean") return v;
  return String(v).toUpperCase() === "TRUE";
}

/* =======================
   PARSER: Paste WA → products[]
======================= */
function parseWaTextToProducts(text, defaultSupplierType) {
  const raw = String(text || "").replace(/\r/g, "");
  if (!raw.trim()) return [];

  const lines = raw.split("\n").map((l) => l.trim());
  const products = [];
  let cur = null;

  function cleanTitle(s) {
    return String(s || "")
      .replace(/BEST\s*SELLER/gi, "")
      .replace(/[🔥]/g, "")
      .replace(/^[-–—\s]+|[-–—\s]+$/g, "")
      .trim();
  }

  function stripPrefix(line) {
    return String(line || "").replace(/^[┊│┃•·\-\|\:\*` ]+/g, "").trim();
  }

  function pushCur() {
    if (!cur) return;

    if (!cur.price_normal && cur.price_promo) {
      cur.price_normal = cur.price_promo;
      cur.price_promo = "";
      cur.promo_active = false;
    }

    if (cur.title && cur.code) products.push(cur);
    cur = null;
  }

  function startNewProduct(titleRaw) {
    pushCur();
    cur = {
      supplier_id: "",
      supplier_type: defaultSupplierType || "premium_app",
      title: cleanTitle(titleRaw),
      price_normal: 0,
      price_promo: "",
      promo_active: false,
      stock_available: 0,
      stock_sold: 0,
      code: "",
      desc: "",
      best_seller: /BEST\s*SELLER/i.test(titleRaw),
      active: true,
    };
  }

  for (let i = 0; i < lines.length; i++) {
    const original = lines[i];
    const line = stripPrefix(original);
    if (!line) continue;

    // Judul produk: 〔 〕
    let m = original.match(/〔\s*(.+?)\s*〕/);
    if (m && m[1]) {
      startNewProduct(m[1]);
      continue;
    }

    // Judul produk: { }
    m = original.match(/\{\s*(.+?)\s*\}/);
    if (m && m[1]) {
      startNewProduct(m[1]);
      continue;
    }

    // Judul produk: [ ]
    m = original.match(/\[\s*(.+?)\s*\]/);
    if (m && m[1]) {
      startNewProduct(m[1]);
      continue;
    }

    if (!cur) continue;

    // Harga Promo
    m = line.match(/Harga\s*Promo\s*:\s*(.+)$/i);
    if (m) {
      const val = toNumberFromRupiah(m[1]);
      cur.price_promo = val;
      cur.promo_active = true;
      continue;
    }

    // Harga Normal
    m = line.match(/Harga\s*Normal\s*:\s*(.+)$/i);
    if (m) {
      cur.price_normal = toNumberFromRupiah(m[1]);
      continue;
    }

    // Harga: (umum)
    m = line.match(/Harga\s*:\s*(.+)$/i);
    if (m) {
      cur.price_normal = toNumberFromRupiah(m[1]);
      continue;
    }

    // Stok Tersedia
    m = line.match(/Stok\s*Tersedia\s*:\s*([0-9]+)/i);
    if (m) {
      cur.stock_available = Number(m[1] || 0);
      continue;
    }

    // Stok Terjual
    m = line.match(/Stok\s*Terjual\s*:\s*([0-9]+)/i);
    if (m) {
      cur.stock_sold = Number(m[1] || 0);
      continue;
    }

    // Total Stok
    m = line.match(/Total\s*Stok\s*:\s*([0-9]+)/i);
    if (m) {
      const total = Number(m[1] || 0);
      if (!cur.stock_available && cur.stock_sold) {
        cur.stock_available = Math.max(0, total - cur.stock_sold);
      }
      continue;
    }

    // Kode
    m = line.match(/Kode\s*:\s*([a-z0-9_-]+)/i);
    if (m) {
      cur.code = String(m[1] || "").trim();
      continue;
    }

    // Desk / Desc
    m = line.match(/Des(k|c)\s*:\s*(.+)$/i);
    if (m) {
      cur.desc = String(m[2] || "").trim();
      continue;
    }
  }

  pushCur();
  return products;
}

export default function Products() {
    // ===== WA Queue / Step-by-step =====
  const [waFlowOn, setWaFlowOn] = useState(false);      // lagi mode antrian?
  const [waFlowIndex, setWaFlowIndex] = useState(-1);   // index item yang lagi di-form
  const [waDoneCodes, setWaDoneCodes] = useState([]);   // list code yg sudah disimpan (buat skip)

  // ===== UX edit biar admin "engeh" =====
  const formCardRef = useRef(null);
  const titleInputRef = useRef(null);
  const router = useRouter();

  const [editingName, setEditingName] = useState("");
  const [flashForm, setFlashForm] = useState(false);

  const [me, setMe] = useState(null);
  const [data, setData] = useState([]);
  const [form, setForm] = useState(empty);
  const [mode, setMode] = useState("create"); // create | edit
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // textarea paste WA
  const [waText, setWaText] = useState("");
  const [waParsed, setWaParsed] = useState([]);
  const [waAutoDetect, setWaAutoDetect] = useState(true); // ✅ ini "mode auto paste/deteksi"
  const [waActiveIndex, setWaActiveIndex] = useState(0);
  const [waShowPreview, setWaShowPreview] = useState(true);

  const isAdmin = useMemo(
    () => String(me?.user?.supplier_type || "").toUpperCase() === "ALL",
    [me]
  );

  async function load() {
    setErr("");
    setLoading(true);

    try {
      const rMe = await fetch("/api/auth/me", { credentials: "include" });
      const jMe = await rMe.json();
      if (!jMe.loggedIn) {
        setLoading(false);
        return router.replace("/admin/login");
      }
      setMe(jMe);

      // default supplier_type sesuai role
      const st = jMe.user?.supplier_type;
      if (st && String(st).toUpperCase() !== "ALL") {
        setForm((f) => ({ ...f, supplier_type: st }));
      }

      const r = await fetch("/api/products", { credentials: "include" });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.error || "Gagal memuat produk");
        setLoading(false);
        return;
      }

      setData(j.data || []);
      setLoading(false);
    } catch (e) {
      setErr("Gagal memuat data (client error)");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  function normCode(s) {
    return String(s || "").trim().toLowerCase();
  }

  function markDone(code) {
    const c = normCode(code);
    if (!c) return;
    setWaDoneCodes((prev) => (prev.includes(c) ? prev : [...prev, c]));
  }

  function getNextIndex(fromIndex) {
    if (!waParsed.length) return -1;
    for (let i = fromIndex + 1; i < waParsed.length; i++) {
      const c = normCode(waParsed[i]?.code);
      if (!c) continue;
      if (!waDoneCodes.includes(c)) return i;
    }
    return -1;
  }



  // auto edit dari query: /admin/products?edit=prd-xxx
  useEffect(() => {
    const id = router.query?.edit;
    if (!id) return;
    if (!data?.length) return;

    const p = data.find((x) => x.id === id);
    if (p) editRow(p);

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
    setEditingName("");
    setFlashForm(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { credentials: "include" });
    router.replace("/admin/login");
  }

   async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) return setErr("Nama produk wajib diisi.");
    if (!form.code.trim()) return setErr("Kode produk wajib diisi.");

    const payload = {
      supplier_id: form.supplier_id || "",
      supplier_type: form.supplier_type,
      title: form.title.trim(),

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

    if (payload.price_normal <= 0 && payload.price_promo === "") {
      return setErr("Minimal isi Harga Normal atau Harga Promo.");
    }

    // ✅ CEGAH DUPLIKAT KODE
    const normalizedCode = payload.code.trim().toLowerCase();
    const existing = data.find((x) => String(x.code || "").trim().toLowerCase() === normalizedCode);

    if (mode === "create" && existing) {
      setErr(`Kode "${payload.code}" sudah ada. Klik Edit pada produk itu, atau ganti kode.`);
      requestAnimationFrame(() => formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }

    if (mode === "edit" && existing && existing.id !== form.id) {
      setErr(`Kode "${payload.code}" sudah dipakai produk lain. Harus unik.`);
      requestAnimationFrame(() => formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }

    // simpan info antrian sebelum request (biar gak kebawa state yg berubah)
    const wasFlow = waFlowOn && mode === "create" && waFlowIndex >= 0;
    const savedIndex = waFlowIndex;
    const savedCode = payload.code;

    try {
      setLoading(true);

      if (mode === "create") {
        const r = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Gagal tambah produk");
      } else {
        const r = await fetch(`/api/products/${encodeURIComponent(form.id)}`, {
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
          credentials: "include",
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Gagal edit produk");
      }

      // refresh data
      await load();

      // ✅ MODE ANTRIAN: setelah sukses simpan, lanjut item berikutnya
      if (wasFlow) {
        markDone(savedCode);

        // cari next index (skip yg udah done)
        const next = getNextIndex(savedIndex);

        if (next >= 0) {
          // isi form next
          fillFormFromParsedIndex(next, { enableFlow: true });
          setLoading(false);
          return; // penting: jangan reset form
        }

        // kalau habis:
        setWaFlowOn(false);
        setWaFlowIndex(-1);
        setWaActiveIndex(0);
        // optional: kasih notif selesai
        // alert("Semua item WA sudah diproses ✅");
      }

      // default behavior normal
      resetForm();
      setLoading(false);
    } catch (e2) {
      setErr(e2.message);
      setLoading(false);
    }
  }

  // Hapus = soft delete (active FALSE)
  async function remove(id) {
    if (!confirm("Yakin hapus produk ini? (Produk akan disembunyikan)")) return;

    try {
      const r = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      const text = await r.text();
      let j = {};
      try {
        j = JSON.parse(text);
      } catch {}

      if (!r.ok) {
        alert(`Gagal hapus!\nStatus: ${r.status}\n${j?.error || text || "(kosong)"}`);
        return;
      }

      await load();
      alert("Berhasil hapus (disembunyikan).");
    } catch (e) {
      alert("Error client: " + e.message);
    }
  }

  function editRow(p) {
    setMode("edit");
    setEditingName(p.title || "Produk");

    setForm({
      id: p.id,
      supplier_id: p.supplier_id || "",
      supplier_type: p.supplier_type || "premium_app",
      title: p.title || "",

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

    requestAnimationFrame(() => {
      if (formCardRef.current) {
        formCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      setFlashForm(true);
      setTimeout(() => setFlashForm(false), 900);

      setTimeout(() => {
        if (titleInputRef.current) titleInputRef.current.focus();
      }, 250);
    });
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

  // ====== FITUR WA ======
  function defaultSupplierTypeForWA() {
    return String(me?.user?.supplier_type || "").toUpperCase() === "ALL"
      ? form.supplier_type
      : me?.user?.supplier_type || "premium_app";
  }

    function handleParseWA({ silent = false } = {}) {
    const items = parseWaTextToProducts(waText, defaultSupplierTypeForWA());
    setWaParsed(items);
    setWaDoneCodes([]);      // reset done saat parse baru
    setWaFlowOn(false);
    setWaFlowIndex(-1);
    setWaActiveIndex(0);

    if (!silent) {
      if (!items.length) return alert("Tidak ada produk yang terdeteksi dari teks.");
      alert(`Terdeteksi ${items.length} produk dari teks.`);
    }

    // ✅ auto isi item pertama biar gak “kosong” dan admin langsung engeh
    if (items.length) {
      // tunggu state ke-set dulu
      setTimeout(() => fillFormFromParsedIndex(0, { enableFlow: true }), 0);
    }
  }


  // ✅ MODE AUTO DETEKSI (yang kamu maksud "auto paste")
  useEffect(() => {
    if (!waAutoDetect) return;
    const t = setTimeout(() => {
      handleParseWA({ silent: true });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [waText, waAutoDetect, me, form.supplier_type]);

   function fillFormFromParsedIndex(index, { enableFlow = true } = {}) {
    if (!waParsed.length) return;

    const safeIndex = Math.max(0, Math.min(index, waParsed.length - 1));
    const p = waParsed[safeIndex];
    if (!p) return;

    setMode("create");
    setEditingName("");

    // nyalakan mode antrian
    if (enableFlow) {
      setWaFlowOn(true);
      setWaFlowIndex(safeIndex);
      setWaActiveIndex(safeIndex);
    }

    setForm((f) => ({
      ...f,
      supplier_type: p.supplier_type || f.supplier_type,
      title: p.title || "",
      code: p.code || "",
      desc: p.desc || "",
      stock_available: String(p.stock_available ?? 0),
      stock_sold: String(p.stock_sold ?? 0),
      best_seller: !!p.best_seller,
      active: true,

      price_normal: p.price_normal ? digitsOnly(String(p.price_normal)) : f.price_normal,
      price_promo: p.price_promo === "" ? "" : digitsOnly(String(p.price_promo)),
      promo_active: !!p.promo_active,
    }));

    requestAnimationFrame(() => {
      if (formCardRef.current) formCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setFlashForm(true);
      setTimeout(() => setFlashForm(false), 900);
      setTimeout(() => titleInputRef.current?.focus(), 250);
    });
  }


  function handleAutoFillFirst() {
    if (!waParsed.length) return alert("Parse dulu ya (deteksi).");
    fillFormFromParsedIndex(0);
  }

  async function handleImportAll() {
  if (!waParsed.length) return alert("Tidak ada produk hasil deteksi.");

  // === DEDUPE by code (last wins) ===
  const map = new Map(); // key = codeLower, value = item
  const dupCodes = new Set();

  for (const it of waParsed) {
    const code = String(it.code || "").trim();
    if (!code) continue;
    const key = code.toLowerCase();
    if (map.has(key)) dupCodes.add(code);
    map.set(key, it);
  }

  const itemsUnique = Array.from(map.values());

  if (dupCodes.size) {
    const list = Array.from(dupCodes).slice(0, 5).join(", ");
    const more = dupCodes.size > 5 ? ` (+${dupCodes.size - 5} lagi)` : "";
    const ok = confirm(
      `Ada kode duplikat di hasil deteksi: ${list}${more}.\n` +
      `Yang dipakai adalah data TERAKHIR untuk tiap kode.\n\n` +
      `Lanjut import ${itemsUnique.length} item unik?`
    );
    if (!ok) return;
  } else {
    if (!confirm(`Import ${itemsUnique.length} produk ke Google Sheet? (kode sama = update)`)) return;
  }

  try {
    setLoading(true);
    const r = await fetch("/api/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: itemsUnique }),
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      alert(j.error || "Gagal import bulk");
      setLoading(false);
      return;
    }

    alert(`SUKSES!\nInserted: ${j.inserted}\nUpdated: ${j.updated}\nSkipped: ${j.skipped}`);

    setWaText("");
    setWaParsed([]);
    setLoading(false);
    await load();
  } catch (e) {
    setLoading(false);
    alert("Error: " + e.message);
  }
}


  const waActiveItem = waParsed[waActiveIndex] || null;

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div className="headerLeft">
          <div className="title">Dashboard Produk</div>
          <div className="sub">
            Login sebagai: <span className="subStrong">{me?.user?.role || "-"}</span> • Tipe:{" "}
            <span className="subStrong">{labelType(me?.user?.supplier_type)}</span>
          </div>
        </div>

        <div className="headerActions">
          <button className="btnOutline" onClick={() => router.push("/admin/promo")} type="button">
            Buat Promo
          </button>
          <button className="btnOutline" onClick={logout} type="button">
            Keluar
          </button>
        </div>
      </div>

      {err && <div className="errorBox">{err}</div>}

      {/* ===== Edit bar (biar engeh) ===== */}
      {mode === "edit" && (
        <div className="editBar">
          <div className="editLeft">
            <span className="editTag">Mode Edit</span>
            <span className="editName">{editingName || "Produk"}</span>
          </div>

          <div className="editRight">
            <button
              className="btnOutline"
              type="button"
              onClick={() => {
                if (formCardRef.current) {
                  formCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Lihat Form
            </button>

            <button className="btnOutline" type="button" onClick={resetForm}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* ===== Paste WA Card (MINIMAL + AUTO DETEKSI + PREVIEW) ===== */}
      <div className="card waCard">
        <div className="waHead">
          <div className="waHeadLeft">
            <div className="waTitle">Import dari WhatsApp</div>
            <div className="waHint">Tempel pesan. Judul: {"{ }"} / {"[ ]"} / {"〔 〕"}.</div>
          </div>

          <div className="waHeadRight">
            <span className="waCount">{waParsed.length} produk</span>
          </div>
        </div>

        <div className="waControls">
          <TogglePill
            checked={waAutoDetect}
            onChange={setWaAutoDetect}
            label="Auto deteksi"
          />

          <div className="waBtns">
            <button className="btnGhost" type="button" onClick={() => handleParseWA({ silent: false })}>
              Deteksi
            </button>
            <button className="btnGhost" type="button" onClick={handleAutoFillFirst} disabled={!waParsed.length}>
              Auto isi
            </button>
            <button className="btnPrimarySmall" type="button" onClick={handleImportAll} disabled={loading || !waParsed.length}>
              {loading ? "Mengimport..." : "Import"}
            </button>
          </div>
        </div>

        <textarea
          className="waTextarea"
          rows={6}
          value={waText}
          onChange={(e) => setWaText(e.target.value)}
          placeholder="Tempel pesan WhatsApp di sini…"
        />

        {/* Preview (biar engeh kalau sudah ada hasil paste) */}
        {waParsed.length > 0 && (
          <div className="waPreview">
            <div className="waPreviewTop">
              <button
                className="btnLink"
                type="button"
                onClick={() => setWaShowPreview((v) => !v)}
              >
                {waShowPreview ? "Sembunyikan preview" : "Tampilkan preview"}
              </button>

              <div className="waMini">
                <span className="waMiniDot" />
                <span className="waMiniText">
                  Klik salah satu item untuk isi form (tanpa mengubah sistem).
                </span>
              </div>
            </div>

            {waShowPreview && (
              <div className="waPreviewGrid">
                <div className="waList">
                 {waParsed.slice(0, 12).map((p, idx) => {
  const active = idx === waActiveIndex;

  const codeKey = normCode(p.code);     // ← tambahin ini
  const done = waDoneCodes.includes(codeKey); // ← tambahin ini

  return (
    <button
      key={`${p.code}-${idx}`}
      type="button"
      className={`waItem ${active ? "on" : ""} ${done ? "done" : ""}`}
      onClick={() => {
        setWaActiveIndex(idx);
        fillFormFromParsedIndex(idx);
      }}
    >

                        <div className="waItemTop">
                          <div className="waItemTitle">{p.title || "-"}</div>
                          <div className="waItemCode">{p.code || "-"}</div>
                        </div>
                        <div className="waItemSub">
                          <span className="waItemTag">{labelType(p.supplier_type)}</span>
                          {p.promo_active ? <span className="waItemTag dark">Promo</span> : null}
                          {p.best_seller ? <span className="waItemTag">Best</span> : null}
                        </div>
                      </button>
                    );
                  })}

                  {waParsed.length > 12 && (
                    <div className="waMore">+{waParsed.length - 12} item lainnya (tetap akan ikut saat Import)</div>
                  )}
                </div>

                <div className="waDetail">
                  <div className="waDetailCard">
                    <div className="waDetailTitle">{waActiveItem?.title || "-"}</div>
                    <div className="waDetailDesc">{waActiveItem?.desc || "—"}</div>

                    <div className="waDetailRow">
                      <span className="waDetailKey">Harga</span>
                      <span className="waDetailVal">
                        {waActiveItem?.promo_active && waActiveItem?.price_promo
                          ? rupiahFromNumber(waActiveItem.price_promo)
                          : rupiahFromNumber(waActiveItem?.price_normal || 0)}
                      </span>
                    </div>

                    <div className="waDetailRow">
                      <span className="waDetailKey">Kode</span>
                      <span className="waDetailVal">
                        <code className="code">{waActiveItem?.code || "-"}</code>
                      </span>
                    </div>

                    <div className="waDetailRow">
                      <span className="waDetailKey">Stok</span>
                      <span className="waDetailVal">
                        {Number(waActiveItem?.stock_available || 0)} tersedia •{" "}
                        {Number(waActiveItem?.stock_sold || 0)} terjual
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btnPrimary"
                      onClick={() => fillFormFromParsedIndex(waActiveIndex)}
                    >
                      Isi ke Form
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Form ===== */}
      <div ref={formCardRef} className={`card ${flashForm ? "flash" : ""}`}>
        <div className="cardHead">
          <div>
            <div className="cardTitle">{mode === "create" ? "Tambah Produk" : "Edit Produk"}</div>
            <div className="cardHint">Ketik angka saja (contoh: 3000) akan jadi Rp 3.000</div>
          </div>

          {mode === "edit" && (
            <button className="btnOutline" onClick={resetForm} type="button">
              Batal Edit
            </button>
          )}
        </div>

        <form className="formGrid" onSubmit={submit}>
          <div className="formCol">
            <Field label="Nama Produk">
              <input
                ref={titleInputRef}
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

              {!isAdmin && <div className="note">Kategori otomatis sesuai role kamu.</div>}
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
                  value={form.price_promo === "" ? "" : formatRupiahFromDigits(form.price_promo)}
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
              <Toggle checked={form.promo_active} onChange={(v) => set("promo_active", v)} label="Promo aktif" hint="Pakai harga promo" />
              <Toggle checked={form.best_seller} onChange={(v) => set("best_seller", v)} label="Best seller" hint="Produk unggulan" />
              <Toggle checked={form.active} onChange={(v) => set("active", v)} label="Aktif" hint="Ditampilkan" />
            </div>

          <button className="btnPrimary" disabled={loading || !me} type="submit">

              {loading ? "Menyimpan..." : mode === "create" ? "Simpan Produk" : "Simpan Perubahan"}
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
                const total = Number(p.stock_available || 0) + Number(p.stock_sold || 0);
                return (
                  <tr key={p.id} className={idx % 2 === 0 ? "row" : "row alt"}>
                    <td>
                      <div className="tTitle">{p.title}</div>
                      <div className="tDesc">{p.desc || "-"}</div>
                    </td>
                    <td>{labelType(p.supplier_type)}</td>
                    <td>{rupiahFromNumber(p.price_normal)}</td>
                    <td>{p.price_promo === "" ? "-" : rupiahFromNumber(p.price_promo)}</td>
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
                        <button className="btnSmall" onClick={() => editRow(p)} type="button">
                          Edit
                        </button>
                        <button className="btnSmallDanger" onClick={() => remove(p.id)} type="button">
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

          const promoActive = toBool(p.promo_active);
          const hasPromo = p.price_promo !== "" && Number(p.price_promo || 0) > 0;
          const showPromo = promoActive && hasPromo;

          const priceMain = showPromo ? rupiahFromNumber(p.price_promo) : rupiahFromNumber(p.price_normal);
          const priceNormal = rupiahFromNumber(p.price_normal);

          return (
            <div key={p.id} className="mCard">
              <div className="mTop">
                <div className="mTitle">{p.title}</div>

                <div className="mChips">
                  <span className="mChip">{labelType(p.supplier_type)}</span>
                  {toBool(p.active) ? (
                    <span className="mChip">Aktif</span>
                  ) : (
                    <span className="mChip mutedChip">Nonaktif</span>
                  )}
                  {showPromo ? <span className="mChip promoChip">Promo</span> : null}
                  {toBool(p.best_seller) ? <span className="mChip">Best</span> : null}
                </div>

                <div className="mDesc">{p.desc || "-"}</div>
              </div>

              <div className="mPriceBox">
                <div className="mPriceMain">{priceMain}</div>
                {showPromo ? (
                  <div className="mPriceRight">
                    <div className="mStrike">{priceNormal}</div>
                    <span className="mChip promoChip">Promo</span>
                  </div>
                ) : (
                  <div className="mPriceRight">
                    <span className="mSubtle">Harga normal</span>
                  </div>
                )}
              </div>

              <div className="mRows">
                <div className="mRow">
                  <span className="mKey">Kode</span>
                  <code className="mCode">{p.code || "-"}</code>
                </div>

                <div className="mRow">
                  <span className="mKey">Stok</span>
                  <span className="mVal">
                    {p.stock_available} tersedia • {p.stock_sold} terjual • <span className="mMuted">total {total}</span>
                  </span>
                </div>
              </div>

              <div className="mActions">
                <button className="mBtn" onClick={() => editRow(p)} type="button">
                  Edit
                </button>
                <button className="mBtnDanger" onClick={() => remove(p.id)} type="button">
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
        :global(body) {
          background: #fff;
        }

        .page {
          max-width: 1100px;
          margin: 28px auto;
          padding: 0 14px;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
          color: #111;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 10px 0 16px;
          border-bottom: 1px solid #eee;
        }
        .title {
          font-size: 20px;
          font-weight: 650;
          letter-spacing: -0.2px;
        }
        .sub {
          opacity: 0.7;
          font-size: 13px;
          margin-top: 6px;
          line-height: 1.25;
        }
        .subStrong {
          font-weight: 600;
          opacity: 1;
        }
        .headerActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* Error */
        .errorBox {
          margin-top: 12px;
          padding: 12px;
          border-radius: 12px;
          background: #fff4f4;
          border: 1px solid #ffd0d0;
          color: #8a1f1f;
          font-size: 13px;
        }

        /* Edit bar */
        .editBar {
          position: sticky;
          top: 10px;
          z-index: 50;
          margin-top: 12px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;

          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid #eee;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(10px);
        }
        .editLeft {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .editTag {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid #eee;
          background: #fafafa;
        }
        .editName {
          font-size: 13px;
          font-weight: 600;
          opacity: 0.85;
          max-width: 520px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .editRight {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* Cards */
        .card {
          margin-top: 16px;
          background: white;
          border: 1px solid #eee;
          border-radius: 16px;
          padding: 16px;
        }
        .card.flash {
          border-color: #d8d8d8;
          box-shadow: 0 0 0 4px rgba(17, 17, 17, 0.06);
        }
        .cardHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .cardTitle {
          font-size: 14px;
          font-weight: 650;
        }
        .cardHint {
          font-size: 13px;
          opacity: 0.65;
          margin-top: 4px;
          line-height: 1.35;
        }

        /* WA card */
        .waCard {
          padding: 16px;
        }
        .waHead {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }
        .waTitle {
          font-size: 14px;
          font-weight: 650;
        }
        .waHint {
          font-size: 13px;
          opacity: 0.65;
          margin-top: 4px;
          line-height: 1.35;
        }
        .waCount {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid #eee;
          background: #fafafa;
          white-space: nowrap;
        }

        .waControls {
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .waBtns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .waTextarea {
          margin-top: 12px;
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          outline: none;
          font-size: 14px;
          resize: vertical;
          background: #fff;
          font-weight: 400;
        }

        .waPreview {
          margin-top: 12px;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }
        .waPreviewTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btnLink {
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          opacity: 0.75;
        }
        .btnLink:hover {
          opacity: 1;
        }
        .waMini {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          opacity: 0.7;
        }
        .waMiniDot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #111;
          opacity: 0.2;
        }

        .waPreviewGrid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 12px;
        }
        .waList {
          display: grid;
          gap: 10px;
        }
        .waItem {
          text-align: left;
          border: 1px solid #eee;
          background: #fff;
          border-radius: 14px;
          padding: 12px;
          cursor: pointer;
        }
          .waItem.done {
  opacity: 0.55;
  border-style: dashed;
}

        .waItem.on {
          border-color: #d8d8d8;
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.05);
        }
        .waItemTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: baseline;
        }
        .waItemTitle {
          font-size: 13px;
          font-weight: 650;
          line-height: 1.25;
        }
        .waItemCode {
          font-size: 12px;
          opacity: 0.7;
          white-space: nowrap;
        }
        .waItemSub {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .waItemTag {
          font-size: 12px;
          font-weight: 550;
          padding: 5px 9px;
          border-radius: 999px;
          border: 1px solid #eee;
          background: #fafafa;
        }
        .waItemTag.dark {
          border-color: #111;
          background: #111;
          color: #fff;
        }
        .waMore {
          font-size: 12px;
          opacity: 0.65;
          padding: 6px 2px 0;
        }

        .waDetailCard {
          border: 1px solid #eee;
          border-radius: 16px;
          background: #fff;
          padding: 14px;
        }
        .waDetailTitle {
          font-size: 14px;
          font-weight: 650;
          letter-spacing: -0.1px;
        }
        .waDetailDesc {
          margin-top: 6px;
          font-size: 13px;
          opacity: 0.65;
          line-height: 1.4;
        }
        .waDetailRow {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid #eee;
          background: #fafafa;
        }
        .waDetailKey {
          font-size: 12px;
          font-weight: 600;
          opacity: 0.7;
        }
        .waDetailVal {
          font-size: 13px;
          font-weight: 600;
        }

        /* Form */
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

        .input {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          outline: none;
          font-size: 14px;
          background: #fff;
          font-weight: 400;
        }
        .textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          outline: none;
          font-size: 14px;
          resize: vertical;
          background: #fff;
          font-weight: 400;
        }
        .note {
          font-size: 12px;
          opacity: 0.65;
          margin-top: 6px;
        }

        .checkWrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 6px;
        }

        /* Buttons */
        .btnOutline {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #e6e6e6;
          background: #fff;
          cursor: pointer;
          font-weight: 550;
          font-size: 13px;
        }
        .btnOutline:hover {
          border-color: #dcdcdc;
        }

        .btnGhost {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #eee;
          background: #fafafa;
          cursor: pointer;
          font-weight: 550;
          font-size: 13px;
        }
        .btnGhost:hover {
          border-color: #dcdcdc;
          background: #f6f6f6;
        }

        .btnPrimary {
          padding: 12px 12px;
          border-radius: 12px;
          border: none;
          background: #111;
          color: white;
          cursor: pointer;
          font-weight: 650;
          margin-top: 10px;
          width: 100%;
          font-size: 13px;
        }
        .btnPrimarySmall {
          padding: 10px 12px;
          border-radius: 12px;
          border: none;
          background: #111;
          color: white;
          cursor: pointer;
          font-weight: 650;
          font-size: 13px;
        }
        .btnPrimarySmall:disabled,
        .btnPrimary:disabled,
        .btnGhost:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* List */
        .listHead {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .listTitle {
          font-size: 14px;
          font-weight: 650;
        }
        .search {
          max-width: 340px;
        }

        /* Desktop table */
        .tableWrap {
          margin-top: 10px;
          background: white;
          border: 1px solid #eee;
          border-radius: 16px;
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
          padding: 12px 12px;
          font-size: 12px;
          opacity: 0.7;
          background: #fafafa;
          border-bottom: 1px solid #eee;
          font-weight: 650;
        }
        td {
          padding: 12px 12px;
          vertical-align: top;
          border-bottom: 1px solid #f0f0f0;
        }
        .row.alt {
          background: #fcfcfc;
        }
        .tTitle {
          font-weight: 650;
        }
        .tDesc {
          opacity: 0.65;
          font-size: 12px;
          margin-top: 4px;
          line-height: 1.35;
        }
        .muted {
          opacity: 0.65;
        }
        .code {
          background: #fafafa;
          border: 1px solid #eee;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 12px;
        }
        .rowActions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btnSmall {
          padding: 9px 10px;
          border-radius: 12px;
          border: 1px solid #e6e6e6;
          background: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 550;
        }
        .btnSmallDanger {
          padding: 9px 10px;
          border-radius: 12px;
          border: 1px solid #ffd0d0;
          background: #fff4f4;
          cursor: pointer;
          font-size: 12px;
          font-weight: 550;
        }
        .empty {
          padding: 16px;
          text-align: center;
          opacity: 0.7;
        }

        /* Mobile */
        .mCard {
          margin-top: 12px;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        .mTop {
          display: grid;
          gap: 8px;
        }
        .mTitle {
          font-size: 15px;
          font-weight: 650;
          letter-spacing: -0.1px;
          line-height: 1.25;
        }
        .mDesc {
          font-size: 12.5px;
          font-weight: 400;
          opacity: 0.65;
          line-height: 1.4;
        }
        .mChips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .mChip {
          font-size: 12px;
          font-weight: 550;
          padding: 6px 10px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid #e9e9e9;
          color: #111;
        }
        .mutedChip {
          opacity: 0.6;
        }
        .promoChip {
          border-color: #111;
        }
        .mPriceBox {
          margin-top: 12px;
          border: 1px solid #eee;
          background: #fafafa;
          border-radius: 16px;
          padding: 14px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
        }
        .mPriceMain {
          font-size: 20px;
          font-weight: 750;
          letter-spacing: -0.2px;
        }
        .mPriceRight {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .mStrike {
          font-size: 12px;
          font-weight: 400;
          opacity: 0.6;
          text-decoration: line-through;
          white-space: nowrap;
        }
        .mSubtle {
          font-size: 12px;
          font-weight: 400;
          opacity: 0.6;
          white-space: nowrap;
        }
        .mRows {
          margin-top: 10px;
          display: grid;
          gap: 10px;
        }
        .mRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid #eee;
          border-radius: 14px;
          background: #fff;
        }
        .mKey {
          font-size: 12px;
          font-weight: 550;
          opacity: 0.65;
        }
        .mVal {
          font-size: 13px;
          font-weight: 550;
          opacity: 0.9;
          text-align: right;
        }
        .mMuted {
          opacity: 0.65;
        }
        .mCode {
          font-size: 12px;
          font-weight: 550;
          border: 1px solid #eee;
          background: #fafafa;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .mActions {
          margin-top: 12px;
          display: flex;
          gap: 10px;
        }
        .mBtn {
          flex: 1;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid #eee;
          background: #fff;
          cursor: pointer;
          font-weight: 650;
          font-size: 13px;
        }
        .mBtnDanger {
          flex: 1;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid #ffd0d0;
          background: #fff4f4;
          cursor: pointer;
          font-weight: 650;
          font-size: 13px;
        }
        .emptyCard {
          margin-top: 10px;
          padding: 14px;
          border-radius: 16px;
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

          .waPreviewGrid {
            grid-template-columns: 1fr;
          }

          .desktopOnly {
            display: none;
          }
          .mobileOnly {
            display: block;
          }

          .checkWrap {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .editBar {
            flex-direction: column;
            align-items: stretch;
          }
          .editRight button {
            width: 100%;
          }
        }

        @media (max-width: 420px) {
          .page {
            padding: 0 12px;
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
          font-weight: 600;
          margin-bottom: 6px;
          opacity: 0.75;
        }
      `}</style>
    </div>
  );
}

/* Toggle minimalist */
function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />

      <span className="track" aria-hidden="true">
        <span className="thumb" />
      </span>

      <span className="texts">
        <span className="tLabel">{label}</span>
        {hint ? <span className="tHint">{hint}</span> : null}
      </span>

      <style jsx>{`
        .toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          padding: 10px 12px;
          border: 1px solid #eee;
          border-radius: 14px;
          background: #fff;
        }

        input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .track {
          width: 44px;
          height: 26px;
          border-radius: 999px;
          background: #efefef;
          border: 1px solid #e6e6e6;
          position: relative;
          flex: 0 0 auto;
          transition: 0.2s ease;
        }

        .thumb {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: #fff;
          position: absolute;
          top: 50%;
          left: 2px;
          transform: translateY(-50%);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: 0.2s ease;
        }

        input:checked + .track {
          background: #111;
          border-color: #111;
        }
        input:checked + .track .thumb {
          left: 20px;
        }

        .texts {
          display: grid;
          gap: 2px;
          line-height: 1.15;
        }

        .tLabel {
          font-size: 13px;
          font-weight: 600;
        }

        .tHint {
          font-size: 12px;
          opacity: 0.65;
          font-weight: 400;
        }

        .toggle:has(input:focus-visible) {
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.12);
          border-color: #ddd;
        }
      `}</style>
    </label>
  );
}

/* Toggle kecil bentuk pill khusus buat WA */
function TogglePill({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`pill ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`dot ${checked ? "on" : ""}`} />
      <span className="txt">{label}</span>

      <style jsx>{`
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid #eee;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          opacity: 0.85;
        }
        .pill.on {
          border-color: #d8d8d8;
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.05);
          opacity: 1;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #111;
          opacity: 0.2;
        }
        .dot.on {
          opacity: 0.9;
        }
        .txt {
          line-height: 1;
        }
      `}</style>
    </button>
  );
}
