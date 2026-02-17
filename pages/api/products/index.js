import { readRange, appendRow } from "../../../lib/googleSheets";
import { requireAuth } from "../../../lib/auth";
import crypto from "crypto";

const SHEET = "products";

// helper bikin id tanpa uuid package
function makeId() {
  return "prd_" + crypto.randomBytes(6).toString("hex");
}

function toBool(v) {
  return String(v || "").toUpperCase() === "TRUE";
}

export default async function handler(req, res) {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    // =========================
    // GET
    // =========================
    if (req.method === "GET") {
      const values = await readRange(`${SHEET}!A1:N`);
      const rows = values.slice(1); // skip header

      const data = rows
        .filter((r) => r && r.length)
        .map((r) => ({
          id: r[0] ?? "",
          supplier_id: r[1] ?? "",
          supplier_type: r[2] ?? "",
          title: r[3] ?? "",
          price_normal: r[4] ?? 0,
          price_promo: r[5] ?? "",
          promo_active: r[6] ?? "FALSE",
          stock_available: r[7] ?? 0,
          stock_sold: r[8] ?? 0,
          code: r[9] ?? "",
          desc: r[10] ?? "",
          best_seller: r[11] ?? "FALSE",
          active: r[12] ?? "TRUE",
          updated_at: r[13] ?? "",
        }));

      // ✅ role filter: non-admin hanya lihat kategori dia
      const isAdmin = String(user.supplier_type || "").toUpperCase() === "ALL";
      let filtered = data;

      if (!isAdmin) {
        filtered = filtered.filter((p) => String(p.supplier_type) === String(user.supplier_type));
      }

      // ✅ INI YANG BIKIN “HAPUS” BENERAN HILANG DI UI
    filtered = filtered.filter((p) => {
  const val = String(p.active || "").toUpperCase().trim();
  // anggap kosong sebagai TRUE (biar data lama tetap muncul)
  if (!val) return true;
  return val === "TRUE";
});


      return res.json({ ok: true, data: filtered });
    }

    // =========================
    // POST (CREATE)
    // =========================
    if (req.method === "POST") {
      const b = req.body || {};
      const now = new Date().toISOString().slice(0, 10);

      const isAdmin = String(user.supplier_type || "").toUpperCase() === "ALL";
      const supplierType = String(b.supplier_type || "").trim() || "premium_app";

      // non-admin tidak boleh bikin kategori lain
      if (!isAdmin) {
        if (supplierType !== String(user.supplier_type || "")) {
          return res.status(403).json({ ok: false, error: "Tidak boleh buat produk kategori lain." });
        }
      }

      const row = [
        makeId(),
        b.supplier_id ?? "",
        supplierType,
        b.title ?? "",
        b.price_normal ?? 0,
        b.price_promo ?? "",
        b.promo_active ?? "FALSE",
        b.stock_available ?? 0,
        b.stock_sold ?? 0,
        b.code ?? "",
        b.desc ?? "",
        b.best_seller ?? "FALSE",
        b.active ?? "TRUE",
        now,
      ];

      await appendRow(SHEET, row);
      return res.json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Server error" });
  }
}
