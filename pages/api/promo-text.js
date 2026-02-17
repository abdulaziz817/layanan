import { readRange } from "../../lib/googleSheets";

function rupiah(n) {
  const x = Number(n || 0);
  return "Rp. " + x.toLocaleString("id-ID");
}

export default async function handler(req, res) {
  const rows = await readRange("products!A2:N");

  const products = rows.map((r) => ({
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
  }));

  const active = products.filter(p => String(p.active).toUpperCase() !== "FALSE");

  const text = [
    "Promo Ramadhan",
    "",
    ...active.map((p) => {
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

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(text);
}
