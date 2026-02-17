import { readRange } from "../../../lib/googleSheets";
import { setAuthCookie } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { role, password } = req.body || {};
  if (!role || !password) return res.status(400).json({ error: "Role/password wajib." });

  const rows = await readRange("roles!A2:C");
  const found = rows.find((r) => String(r[0] || "").trim() === String(role).trim());

  if (!found) return res.status(401).json({ error: "Role tidak ditemukan." });

  const pw = String(found[1] || "");
  const supplier_type = String(found[2] || "");

  if (String(password) !== pw) return res.status(401).json({ error: "Password salah." });

  setAuthCookie(res, { role, supplier_type });
  res.json({ ok: true });
}
