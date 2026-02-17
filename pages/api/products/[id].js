import { readRange, updateRow } from "../../../lib/googleSheets";
import { requireAuth } from "../../../lib/auth";

const SHEET = "products";

function findRowIndexById(values, id) {
  // values include header in row 0
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0] || "").trim() === String(id).trim()) {
      return i + 1; // ✅ 1-based for Sheets (baris sheet)
    }
  }
  return -1;
}

function ensureLen(row, len) {
  const r = Array.isArray(row) ? [...row] : [];
  while (r.length < len) r.push("");
  return r.slice(0, len);
}

export default async function handler(req, res) {
  try {
    // ✅ PENTING: requireAuth biasanya async → harus await
    const user = await requireAuth(req, res);
    if (!user) return;

    const id = String(req.query?.id || "").trim();
    if (!id) return res.status(400).json({ ok: false, error: "ID kosong." });

    // ambil semua data (A1:N = 14 kolom)
    const values = await readRange(`${SHEET}!A1:N`);
    if (!values?.length) {
      return res.status(500).json({
        ok: false,
        error: "Sheet kosong / tidak terbaca.",
      });
    }

    const rowIndex = findRowIndexById(values, id);
    if (rowIndex === -1) {
      return res.status(404).json({ ok: false, error: "Produk tidak ditemukan." });
    }

    // row lama (ingat: rowIndex itu 1-based, values itu 0-based)
    const oldRow = ensureLen(values[rowIndex - 1] || [], 14);
    const oldType = String(oldRow[2] || "").trim(); // kolom C = supplier_type

    // ✅ role filter: user non-admin cuma boleh akses supplier_type sendiri
    if (String(user.supplier_type || "").toUpperCase() !== "ALL") {
      if (oldType !== String(user.supplier_type || "").trim()) {
        return res.status(403).json({
          ok: false,
          error: "Tidak boleh akses produk kategori lain.",
        });
      }
    }

    // =========================
    // PUT (EDIT)
    // =========================
    if (req.method === "PUT") {
      const b = req.body || {};
      const now = new Date().toISOString().slice(0, 10);

      // row lengkap 14 kolom (A-N)
      const newRow = ensureLen(
        [
          id,
          b.supplier_id ?? oldRow[1] ?? "",
          b.supplier_type ?? oldRow[2] ?? "",
          b.title ?? oldRow[3] ?? "",
          b.price_normal ?? oldRow[4] ?? 0,
          b.price_promo ?? oldRow[5] ?? "",
          b.promo_active ?? oldRow[6] ?? "FALSE",
          b.stock_available ?? oldRow[7] ?? 0,
          b.stock_sold ?? oldRow[8] ?? 0,
          b.code ?? oldRow[9] ?? "",
          b.desc ?? oldRow[10] ?? "",
          b.best_seller ?? oldRow[11] ?? "FALSE",
          b.active ?? oldRow[12] ?? "TRUE",
          now,
        ],
        14
      );

      // ✅ user non-admin tidak boleh ganti kategori
      if (String(user.supplier_type || "").toUpperCase() !== "ALL") {
        if (String(newRow[2] || "").trim() !== String(user.supplier_type || "").trim()) {
          return res.status(403).json({
            ok: false,
            error: "Tidak boleh pindah kategori.",
          });
        }
      }

      // ✅ update ke baris rowIndex (1-based) dan range A:N (14 kolom)
      await updateRow(SHEET, rowIndex, newRow);
      return res.json({ ok: true });
    }

    // =========================
    // DELETE (SOFT DELETE)
    // =========================
    if (req.method === "DELETE") {
      const now = new Date().toISOString().slice(0, 10);

      const newRow = ensureLen(oldRow, 14);

      // kolom M (index 12) = active
      newRow[12] = "FALSE";

      // kolom N (index 13) = updated_at
      newRow[13] = now;

      await updateRow(SHEET, rowIndex, newRow);
      return res.json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Server error" });
  }
}
