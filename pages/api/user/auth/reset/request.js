import crypto from "crypto";
import { readRange, appendRow } from "../../../../../lib/googleSheets";

/**
 * Endpoint:
 *  - POST /api/user/auth/reset/request
 * Body JSON:
 *  { "phone": "08xxxx" }
 */

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

function nowISO() {
  return new Date().toISOString();
}

export default async function handler(req, res) {
  // Biar gampang test di browser:
  // GET /api/user/auth/reset/request  -> kasih petunjuk
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Use POST with JSON body: { phone: '08xxxxxxxxxx' }",
      example_curl:
        "curl -X POST http://localhost:3000/api/user/auth/reset/request -H \"Content-Type: application/json\" -d \"{\\\"phone\\\":\\\"0878xxxx\\\"}\"",
    });
  }

  if (req.method === "GET") {
  return res.status(200).json({
    ok: true,
    message: "Use POST with JSON body: { phone: '08xxxxxxxxxx' }",
  });
}

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Pastikan content-type json (biar req.body kebaca bener)
    // Next.js biasanya sudah parse otomatis, tapi ini buat jaga-jaga.
    const body = req.body || {};
    const phone = body.phone;

    const phone62 = normalizePhone(phone);
    if (!phone62) {
      return res.status(400).json({ ok: false, error: "Nomor WhatsApp wajib." });
    }

    // Sheet users kamu: A..G
    // A user_id
    // B email
    // C phone
    // D name
    // E password_hash
    // F avatar_url
    // G profile_completed
    const users = await readRange("users!A2:G");

    const found = users.find((r) => normalizePhone(r?.[2]) === phone62);

    // Kalau mau “lebih aman”, jangan bocorin nomor ada/tidak:
    // return res.status(200).json({ ok: true, message: "Jika nomor terdaftar, token akan dibuat." });
    // Tapi untuk dev kita kasih jelas dulu:
    if (!found) {
      return res.status(200).json({ ok: false, error: "Akun tidak ditemukan." });
    }

    const user_id = String(found?.[0] || "");
    if (!user_id) {
      return res.status(500).json({ ok: false, error: "DB user_id kosong." });
    }

    // Token 6 digit
    const token = String(Math.floor(100000 + Math.random() * 900000));

    // Simpan hash token (token asli jangan disimpan)
    const token_hash = sha256Hex(token);

    // Expired 15 menit
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const reset_id = "r_" + crypto.randomBytes(12).toString("hex");

    // password_resets header:
    // A reset_id
    // B user_id
    // C token_hash
    // D expires_at
    // E used
    // F created_at
    await appendRow("password_resets", [
      reset_id,
      user_id,
      token_hash,
      expires_at,
      "FALSE",
      nowISO(),
    ]);

    // Karena kamu mau reset via sheet (tanpa SMS/email), token dikasih ke user.
    return res.status(200).json({
      ok: true,
      reset_id,
      token, // tampil sekali
      expires_at,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: String(err?.message || err) });
  }
}