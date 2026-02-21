import crypto from "crypto";
import { readRange, appendRow } from "../../../../lib/googleSheets";

function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

function sha256Hex(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

function makePasswordHash(password) {
  const salt = crypto.randomUUID(); // contoh salt
  const hash = sha256Hex(salt + String(password));
  return `sha256:${salt}:${hash}`;
}

function uid() {
  return "u_" + crypto.randomBytes(10).toString("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, name, password } = req.body || {};
  if (!phone || !name || !password) {
    return res.status(400).json({ error: "Nomor, nama, password wajib." });
  }

  const phone62 = normalizePhone(phone);

  // Cek exist: phone ada di kolom C => index 2
  const rows = await readRange("users!A2:G");
  const exists = rows.some((r) => normalizePhone(r?.[2]) === phone62);

  if (exists) {
    return res.status(409).json({ error: "Nomor sudah terdaftar. Silakan login." });
  }

  const user_id = uid();
  const password_hash = makePasswordHash(password);

  // Sheet kamu: A user_id | B email | C phone | D name | E password_hash | F avatar_url | G profile_completed
  await appendRow("users", [
    user_id,
    "",        // email (kosong dulu)
    phone62,   // phone
    String(name).trim(),
    password_hash,
    "",        // avatar_url
    false,     // profile_completed
  ]);

  return res.json({ ok: true });
}
