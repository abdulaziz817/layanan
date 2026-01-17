export async function handler(event) {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) }
    }

    const SHEET_ID = process.env.ULASAN_SHEET_ID
    const SHEET_NAME = process.env.ULASAN_SHEET_NAME || "ulasan"

    if (!SHEET_ID) {
      return { statusCode: 500, body: JSON.stringify({ error: "ULASAN_SHEET_ID belum di set" }) }
    }

    // Ambil A,B,C,D,E (created_at,nama,rating_produk,rating_toko,kritik_saran)
    const query = encodeURIComponent(`select A,B,C,D,E where B is not null order by A desc`)
    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
      `tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&tq=${query}`

    const res = await fetch(url)
    const text = await res.text()

    // Kalau sheet tidak publik/akses ditolak, gviz biasanya balikin HTML, bukan JSON
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end === -1) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error:
            "Gagal baca Google Sheet. Pastikan Sheet bisa diakses (publish / share as anyone with link).",
          detail: text.slice(0, 200),
        }),
      }
    }

    const json = JSON.parse(text.substring(start, end + 1))

    const rows = json?.table?.rows || []
    const items = rows
      .map((r, idx) => {
        const c = r.c || []
        const created_at = c[0]?.v || null
        return {
          id: `${created_at || "row"}-${idx}`,
          created_at,
          nama: c[1]?.v || "",
          rating_produk: Number(c[2]?.v || 0),
          rating_toko: Number(c[3]?.v || 0),
          kritik_saran: c[4]?.v || "",
        }
      })
      // ✅ buang "Dammi" dari public testimoni
      .filter((it) => String(it.nama || "").trim().toLowerCase() !== "dammi")
      // ✅ buang yang komentar kosong
      .filter((it) => String(it.kritik_saran || "").trim().length > 0)

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // kalau frontend beda domain, bisa perlu CORS:
        // "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ items }),
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "Gagal ambil ulasan" }) }
  }
}
