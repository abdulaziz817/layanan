import { readRange } from "../../../lib/googleSheets";
import { setAuthCookie } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { role, password } = req.body || {};
  if (!role || !password) return res.status(400).json({ error: "role & password required" });

  const rows = await readRange("roles!A2:C"); // role, password, supplier_type
  const found = rows.find((r) => String(r[0]).toLowerCase() === String(role).toLowerCase());

  if (!found) return res.status(401).json({ error: "Role tidak ditemukan" });

  const sheetPass = String(found[1] || "");
  const supplier_type = String(found[2] || "");

  if (sheetPass !== String(password)) return res.status(401).json({ error: "Password salah" });

  setAuthCookie(res, { role: String(role), supplier_type, t: Date.now() });
  return res.json({ ok: true, role, supplier_type });
}
