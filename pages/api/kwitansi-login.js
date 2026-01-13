// pages/api/kwitansi-login.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const { role, password } = req.body || {};

  // Kredensial sesuai permintaan kamu
  const ROLE_OK = role === "founder";
  const PASS_OK = password === "Penjarasuci_01";

  if (!ROLE_OK || !PASS_OK) {
    return res.status(401).json({ ok: false, message: "Role / password salah" });
  }

  // Set cookie httpOnly
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", [
    `kwitansi_auth=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 12}; ${isProd ? "Secure;" : ""}`,
  ]);

  return res.status(200).json({ ok: true });
}
