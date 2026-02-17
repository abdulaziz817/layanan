import { readRange } from "../../lib/googleSheets";

export default async function handler(req, res) {
  try {
    const v = await readRange("products!A1:N2");
    res.json({ ok: true, sample: v });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
