import crypto from "crypto";
import { readRange, appendRow, updateRow } from "../../../../../lib/googleSheets";

function sha256Hex(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

function makePasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = sha256Hex(salt + String(password));
  return `sha256:${salt}:${hash}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { reset_id, token, new_password } = req.body || {};

    // ✅ VALIDASI INPUT
    if (!reset_id || !token || !new_password) {
      return res.status(400).json({
        ok: false,
        error: "reset_id, token, new_password wajib diisi.",
      });
    }

    if (String(new_password).length < 6) {
      return res.status(400).json({
        ok: false,
        error: "Password baru minimal 6 karakter.",
      });
    }

    const token_hash = sha256Hex(String(token).trim());

    // Sheet password_resets:
    // A reset_id
    // B user_id
    // C token_hash
    // D expires_at
    // E used
    // F created_at
    const resets = await readRange("password_resets!A2:F");

    const idx = resets.findIndex((r) => String(r?.[0] || "") === String(reset_id));
    if (idx === -1) {
      return res.status(400).json({ ok: false, error: "Reset ID tidak ditemukan." });
    }

    const row = resets[idx];

    const user_id = String(row?.[1] || "");
    const db_token_hash = String(row?.[2] || "");
    const expires_at = String(row?.[3] || "");
    const used = String(row?.[4] || "").toLowerCase() === "true";

    if (used) {
      return res.status(400).json({ ok: false, error: "Token sudah digunakan." });
    }

    // cek expire
    if (expires_at && Date.now() > new Date(expires_at).getTime()) {
      return res.status(400).json({ ok: false, error: "Token sudah expired. Request ulang." });
    }

    // cek token cocok
    if (token_hash !== db_token_hash) {
      return res.status(400).json({ ok: false, error: "Token salah." });
    }

    // ===== update password di users sheet =====
    // users columns:
    // A user_id
    // B email
    // C phone
    // D name
    // E password_hash  <-- update ini
    // F avatar_url
    // G profile_completed
    const users = await readRange("users!A2:G");
    const userIndex0 = users.findIndex((r) => String(r?.[0] || "") === user_id);

    if (userIndex0 === -1) {
      return res.status(500).json({ ok: false, error: "User tidak ditemukan di sheet users." });
    }

    const userRow = users[userIndex0];
    const newHash = makePasswordHash(new_password);

    const updatedUserRow = [...userRow];
    while (updatedUserRow.length < 7) updatedUserRow.push("");
    updatedUserRow[4] = newHash; // kolom E (index 4)

    // baris users di sheet: A2 berarti index0 => row 2
    const usersRowIndex1Based = userIndex0 + 2;
    await updateRow("users", usersRowIndex1Based, updatedUserRow);

    // ===== tandai reset used =====
    const resetRowIndex1Based = idx + 2; // karena A2
    const updatedResetRow = [...row];
    while (updatedResetRow.length < 6) updatedResetRow.push("");
    updatedResetRow[4] = "TRUE"; // kolom E used

    await updateRow("password_resets", resetRowIndex1Based, updatedResetRow);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}