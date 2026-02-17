import { readRange } from "../../lib/googleSheets";
import { requireAuth } from "../../lib/auth";

function rupiah(n) {
  const x = Number(n || 0);
  return "Rp. " + x.toLocaleString("id-ID");
}

function mapRow(r) {
  return {
    id: r[0],
    supplier_id: r[1],
    supplier_type: r[2],
    title: r[3],
    price_normal: r[4],
    price_promo: r[5],
    promo_active: r[6],
    stock_available: r[7],
    stock_sold: r[8],
    code: r[9],
    desc: r[10],
    best_seller: r[11],
    active: r[12],
  };
}

export default async function handler(req, res) {
  const user = requireAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { type, title } = req.query;

  const rows = await readRange("products!A2:N");
  let data = rows.map(mapRow).filter(p => String(p.active).toUpperCase() !== "FALSE");

  // role filter
  if (String(user.supplier_type).toUpperCase() !== "ALL") {
    data = data.filter(p => p.supplier_type === user.supplier_type);
  }

  // optional type filter (admin)
  if (type) data = data.filter(p => p.supplier_type === type);

  const header = title ? String(title) : "Promo Ramadhan";

  const text = [
    header,
    "",
    ...data.map((p) => {
      const best = String(p.best_seller).toUpperCase() === "TRUE";
      const total = Number(p.stock_available || 0) + Number(p.stock_sold || 0);

      const promoOn = String(p.promo_active).toUpperCase() === "TRUE";
      const promoPrice = p.price_promo ? Number(p.price_promo) : null;
      const normalPrice = Number(p.price_normal || 0);

      const lines = [];
      lines.push(`*╭────〔 ${p.title}${best ? " `BEST SELLER`🔥" : ""} 〕─*`);

      if (promoOn && promoPrice != null && promoPrice > 0) {
        lines.push(`*┊・Harga Promo:* ${rupiah(promoPrice)}`);
        lines.push(`*┊・Harga Normal:* ${rupiah(normalPrice)}`);
      } else {
        lines.push(`*┊・Harga:* ${rupiah(normalPrice)}`);
      }

      lines.push(`*┊・Stok Tersedia:* ${p.stock_available ?? 0}`);
      lines.push(`*┊・Stok Terjual:* ${p.stock_sold ?? 0}`);
      lines.push(`*┊・Total Stok:* ${total}`);
      lines.push(`*┊・Kode:* ${p.code || "-"}`);
      lines.push(`*┊・Desk:* ${p.desc || "-"}`);
      lines.push(`*╰┈┈┈┈┈┈┈┈*`);
      return lines.join("\n");
    }),
  ].join("\n");

  res.json({ ok: true, count: data.length, text });
}
