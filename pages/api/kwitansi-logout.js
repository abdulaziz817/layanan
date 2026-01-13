// pages/api/kwitansi-logout.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const isProd = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", [
    `kwitansi_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${isProd ? "Secure;" : ""}`,
  ]);

  return res.status(200).json({ ok: true });
}
