import { readRange } from "../../lib/googleSheets";
import { requireAuth } from "../../lib/auth";

function toBool(v) {
  return String(v).toUpperCase() === "TRUE";
}

function rupiah(num) {
  const n = Number(num || 0);
  return "Rp. " + n.toLocaleString("id-ID");
}

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const title = String(req.query.title || "Promo");
  let type = String(req.query.type || "");

  // kalau bukan admin, kunci type
  if (String(user.supplier_type).toUpperCase() !== "ALL") {
    type = user.supplier_type;
  }

  const values = await readRange("products!A1:N");
  const rows = values.slice(1).map((r) => ({
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
  }));

  const list = rows.filter((p) => {
    if (!toBool(p.active)) return false;
    if (!toBool(p.promo_active)) return false;
    if (type && p.supplier_type !== type) return false;
    return true;
  });

  const blocks = list.map((p) => {
    const total = Number(p.stock_available || 0) + Number(p.stock_sold || 0);
    const best = toBool(p.best_seller) ? " `BEST SELLER`🔥" : "";

    return (
`*╭────〔 ${p.title}${best} 〕─*
*┊・Harga Promo:* ${rupiah(p.price_promo === "" ? p.price_normal : p.price_promo)}
*┊・Harga Normal:* ${rupiah(p.price_normal)}
*┊・Stok Tersedia:* ${p.stock_available}
*┊・Stok Terjual:* ${p.stock_sold}
*┊・Total Stok:* ${total}
*┊・Kode:* ${p.code}
*┊・Desk:* ${p.desc}
*╰┈┈┈┈┈┈┈┈*`
    );
  });

  const text = `${title}\n\n${blocks.join("\n")}`;
  res.json({ ok: true, count: list.length, text });
}
