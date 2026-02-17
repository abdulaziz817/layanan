import { readRange, appendRow } from "../../../lib/googleSheets";
import { requireAuth } from "../../../lib/auth";
import { v4 as uuidv4 } from "uuid";

const SHEET = "products";

function mapRow(r) {
  return {
    id: r[0],
    supplier_id: r[1],
    supplier_type: r[2],
    title: r[3],
    price_normal: Number(r[4] || 0),
    price_promo: r[5] === "" || r[5] == null ? "" : Number(r[5]),
    promo_active: String(r[6] ?? "FALSE"),
    stock_available: Number(r[7] || 0),
    stock_sold: Number(r[8] || 0),
    code: r[9] || "",
    desc: r[10] || "",
    best_seller: String(r[11] ?? "FALSE"),
    active: String(r[12] ?? "TRUE"),
    updated_at: r[13] || "",
  };
}

export default async function handler(req, res) {
  const user = requireAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // ========= GET =========
  if (req.method === "GET") {
    const rows = await readRange(`${SHEET}!A2:N`);
    let data = rows.map(mapRow);

    // filter by role
    if (String(user.supplier_type).toUpperCase() !== "ALL") {
      data = data.filter((p) => p.supplier_type === user.supplier_type);
    }

    return res.json({ data });
  }

  // ========= POST (CREATE) =========
  if (req.method === "POST") {
    const b = req.body || {};
    if (!b.title || !b.supplier_type) {
      return res.status(400).json({ error: "title & supplier_type required" });
    }

    // role restriction
    if (String(user.supplier_type).toUpperCase() !== "ALL" && b.supplier_type !== user.supplier_type) {
      return res.status(403).json({ error: "Forbidden supplier_type" });
    }

    const id = `prd-${uuidv4().slice(0, 10)}`;
    const now = new Date().toISOString();

    await appendRow(`${SHEET}!A:N`, [
      id,
      b.supplier_id || "",
      b.supplier_type,
      b.title,
      Number(b.price_normal || 0),
      b.price_promo === "" || b.price_promo == null ? "" : Number(b.price_promo),
      b.promo_active ? "TRUE" : "FALSE",
      Number(b.stock_available || 0),
      Number(b.stock_sold || 0),
      b.code || "",
      b.desc || "",
      b.best_seller ? "TRUE" : "FALSE",
      b.active === false ? "FALSE" : "TRUE",
      now,
    ]);

    return res.json({ ok: true, id });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
