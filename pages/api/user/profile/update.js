// pages/api/user/profile/update.js
import { getAuthFromReq } from "../../../../lib/auth";
import { readRange, updateRow } from "../../../../lib/googleSheets";

function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

function isValidAvatarUrl(url) {
  const u = String(url || "").trim();
  if (!u) return true; // boleh kosong
  // minimal harus http(s)
  return /^https?:\/\/.+/i.test(u);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const session = getAuthFromReq(req);
    if (!session || session.type !== "user") {
      return res.status(401).json({ ok: false, error: "Not logged in" });
    }

    const { name, avatar_url } = req.body || {};
    const newName = String(name || "").trim();
    const newAvatar = String(avatar_url || "").trim();

    if (!newName) {
      return res.status(400).json({ ok: false, error: "Nama wajib diisi." });
    }

    if (!isValidAvatarUrl(newAvatar)) {
      return res.status(400).json({ ok: false, error: "avatar_url tidak valid (harus http/https)." });
    }

    const user_id = String(session.user_id || "");
    const phone62 = normalizePhone(session.phone || "");

    // Ambil semua users A..G
    const rows = await readRange("users!A2:G");

    const idx = rows.findIndex((r) => {
      const rid = String(r?.[0] || "");
      const rphone = normalizePhone(r?.[2] || "");
      return (user_id && rid === user_id) || (phone62 && rphone === phone62);
    });

    if (idx < 0) {
      return res.status(404).json({ ok: false, error: "User tidak ditemukan di sheet." });
    }

    const row = rows[idx];

    // Mapping A..G:
    // A user_id
    // B email
    // C phone
    // D name
    // E password_hash
    // F avatar_url
    // G profile_completed
    const updated = [...row];

    // Pastikan panjang minimal 7 kolom biar updateRow nulis A..G aman
    while (updated.length < 7) updated.push("");

    updated[3] = newName;       // D name
    updated[5] = newAvatar;     // F avatar_url
    updated[6] = "TRUE";        // G profile_completed

    // rowIndex di sheet = idx + 2 (karena data mulai dari A2)
    const rowIndex1Based = idx + 2;

    await updateRow("users", rowIndex1Based, updated);

    return res.status(200).json({
      ok: true,
      user: {
        type: "user",
        user_id: String(updated[0] || user_id),
        email: String(updated[1] || ""),
        phone: normalizePhone(updated[2] || phone62),
        name: String(updated[3] || ""),
        avatar_url: String(updated[5] || ""),
        profile_completed: true,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}