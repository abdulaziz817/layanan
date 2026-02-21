import crypto from "crypto";
import { readRange } from "../../../../lib/googleSheets";
import { setAuthCookie } from "../../../../lib/auth";

/**
 * Sheet users kamu:
 * A user_id
 * B email
 * C phone
 * D name
 * E password_hash
 * F avatar_url
 * G profile_completed
 */

function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

/**
 * Karena di sheet kamu password_hash bentuknya:
 * "sha256:SALT:HASH"
 * contoh: sha256:980256c7-9dea-...:c1631ff7...
 *
 * Maka verify-nya harus sesuai:
 * HASH = sha256( SALT + password )
 */
function sha256Hex(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

function verifyPassword(password, stored) {
  const s = String(stored || "");
  // format: sha256:salt:hash
  if (s.startsWith("sha256:")) {
    const parts = s.split(":");
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const hash = parts[2];
    const calc = sha256Hex(salt + String(password));
    return calc === hash;
  }

  // fallback kalau ternyata ada user lama nyimpan plain sha256(password)
  const calc2 = sha256Hex(password);
  return calc2 === s;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, password } = req.body || {};
  if (!phone || !password) {
    return res.status(400).json({ error: "Nomor WA dan password wajib." });
  }

  const phone62 = normalizePhone(phone);

  // Ambil semua users
  const rows = await readRange("users!A2:G"); // cukup A..G

  // Karena phone ada di kolom C => index 2
  const found = rows.find((r) => normalizePhone(r?.[2]) === phone62);

  if (!found) {
    return res.status(401).json({ error: "Akun tidak ditemukan. Silakan daftar." });
  }

  const user_id = String(found?.[0] || "");
  const db_phone = normalizePhone(found?.[2] || "");
  const db_name = String(found?.[3] || "");
  const db_hash = String(found?.[4] || "");
  const profile_completed = String(found?.[6] || "").toLowerCase() === "true";

  const ok = verifyPassword(password, db_hash);
  if (!ok) {
    return res.status(401).json({ error: "Password salah." });
  }

  // Set cookie auth
  setAuthCookie(res, {
    type: "user",
    user_id,
    phone: db_phone,
    name: db_name,
    profile_completed,
  });

  return res.json({ ok: true, user_id, profile_completed });
}
