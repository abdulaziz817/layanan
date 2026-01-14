export function parseWhatsapp(text) {
  const t = (text || "").replace(/\r/g, "");

  const get = (regex) => {
    const m = t.match(regex);
    return m ? m[1].trim() : "";
  };

  // ambil "Harga: ..." atau "Total: ..."
  let hargaRaw =
    get(/(?:Harga|Total)\s*:\s*(?:Rp\s*)?([0-9][0-9\.\,kK ]+)/i);

  // kalau tidak ketemu label harga, cari angka rupiah pertama di teks
  if (!hargaRaw) {
    const m = t.match(/Rp\s*([0-9][0-9\.\,kK ]+)/i);
    hargaRaw = m ? m[1].trim() : "";
  }

  const toRupiahNumber = (s) => {
    if (!s) return 0;
    let x = String(s).toLowerCase().replace(/\s+/g, "");
    // dukung 14k / 14.5k
    if (x.endsWith("k")) {
      x = x.replace("k", "");
      const num = Number(x.replace(",", "."));
      return Number.isFinite(num) ? Math.round(num * 1000) : 0;
    }
    // buang semua selain digit
    const digits = x.replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  };

  return {
    nama: get(/Nama\s*:\s*(.+)/i),
    whatsapp: get(/Nomor\s*WhatsApp\s*:\s*(.+)/i),
    layanan: get(/Layanan\s*:\s*(.+)/i),
    durasi: get(/Durasi.*\s*:\s*(.+)/i),
    metode: get(/Metode\s*Pembayaran\s*:\s*(.+)/i),
    harga: toRupiahNumber(hargaRaw),
  };
}
