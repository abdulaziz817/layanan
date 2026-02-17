import { getAuthFromReq } from "../../../lib/auth";

export default function handler(req, res) {
  const user = getAuthFromReq(req);
  if (!user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user });
}
