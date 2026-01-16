import { requireAdmin } from "./_auth";

export async function handler(event, context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth;

  try {
    const SHEET_ID = process.env.ULASAN_SHEET_ID;
    const SHEET_NAME = process.env.ULASAN_SHEET_NAME || "ulasan";

    if (!SHEET_ID) {
      return { statusCode: 500, body: JSON.stringify({ error: "ULASAN_SHEET_ID belum di set" }) };
    }

    const query = encodeURIComponent(`select A,B,C,D,E where B is not null order by A desc`);
    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
      `tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&tq=${query}`;

    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));

    const rows = json?.table?.rows || [];
    const items = rows.map((r, idx) => {
      const c = r.c || [];
      const created_at = c[0]?.v || null;
      return {
        id: `${created_at || "row"}-${idx}`,
        created_at,
        nama: c[1]?.v || "",
        rating_produk: Number(c[2]?.v || 0),
        rating_toko: Number(c[3]?.v || 0),
        kritik_saran: c[4]?.v || "",
      };
    });

    return { statusCode: 200, body: JSON.stringify({ items }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "Gagal ambil ulasan" }) };
  }
}
