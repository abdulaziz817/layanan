import { readRange, updateRange } from "../../../lib/googleSheets";
import { requireAuth } from "../../../lib/auth";

const SHEET = "products";

async function findRowById(id) {
  const rows = await readRange(`${SHEET}!A2:N`);
  const idx = rows.findIndex((r) => r[0] === id);
  if (idx === -1) return null;
  return { sheetRowNumber: idx + 2, row: rows[idx] };
}

export default async function handler(req, res) {
  const user = requireAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;

  // ===== PUT (UPDATE) =====
  if (req.method === "PUT") {
    const found = await findRowById(id);
    if (!found) return res.status(404).json({ error: "Not found" });

    const old = found.row;
    const oldSupplierType = old[2];

    // role restriction
    if (String(user.supplier_type).toUpperCase() !== "ALL" && oldSupplierType !== user.supplier_type) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const b = req.body || {};
    const now = new Date().toISOString();

    const newRow = [
      id,
      b.supplier_id ?? old[1],
      b.supplier_type ?? old[2],
      b.title ?? old[3],
      b.price_normal ?? old[4],
      b.price_promo ?? old[5],
      b.promo_active ?? old[6],
      b.stock_available ?? old[7],
      b.stock_sold ?? old[8],
      b.code ?? old[9],
      b.desc ?? old[10],
      b.best_seller ?? old[11],
      b.active ?? old[12],
      now,
    ];

    await updateRange(`${SHEET}!A${found.sheetRowNumber}:N${found.sheetRowNumber}`, newRow);
    return res.json({ ok: true });
  }

  // ===== DELETE (SOFT DELETE) =====
  if (req.method === "DELETE") {
    const found = await findRowById(id);
    if (!found) return res.status(404).json({ error: "Not found" });

    const old = found.row;
    const oldSupplierType = old[2];

    if (String(user.supplier_type).toUpperCase() !== "ALL" && oldSupplierType !== user.supplier_type) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const now = new Date().toISOString();
    const newRow = [...old];
    newRow[12] = "FALSE"; // active
    newRow[13] = now;     // updated_at

    await updateRange(`${SHEET}!A${found.sheetRowNumber}:N${found.sheetRowNumber}`, newRow);
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
