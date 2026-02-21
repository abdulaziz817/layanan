// pages/api/user/auth/me.js
import { getAuthFromReq } from "../../../../lib/auth";
import { readRange } from "../../../../lib/googleSheets";

function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const session = getAuthFromReq(req);
    if (!session || session.type !== "user") {
      return res.status(200).json({ ok: false, error: "Not logged in" });
    }

    const user_id = String(session.user_id || "");
    const phone62 = normalizePhone(session.phone || "");

    // Ambil user terbaru dari sheet
    const rows = await readRange("users!A2:G");
    const foundIndex = rows.findIndex((r) => {
      const rid = String(r?.[0] || "");
      const rphone = normalizePhone(r?.[2] || "");
      return (user_id && rid === user_id) || (phone62 && rphone === phone62);
    });

    if (foundIndex < 0) {
      return res.status(200).json({ ok: false, error: "User not found" });
    }

    const r = rows[foundIndex];

    const user = {
      type: "user",
      user_id: String(r?.[0] || user_id),
      email: String(r?.[1] || ""),
      phone: normalizePhone(r?.[2] || phone62),
      name: String(r?.[3] || ""),
      avatar_url: String(r?.[5] || ""), // kolom F
      profile_completed: String(r?.[6] || "").toLowerCase() === "true", // kolom G
    };

    // ✅ fallback avatar kalau kosong
    if (!user.avatar_url) {
      user.avatar_url = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
        user.phone || user.user_id
      )}`;
    }

    return res.status(200).json({ ok: true, user });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}