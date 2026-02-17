import { requireAuth } from "../../../lib/auth";

export default function handler(req, res) {
  const user = requireAuth(req);
  if (!user) return res.status(401).json({ loggedIn: false });
  res.json({ loggedIn: true, user });
}
