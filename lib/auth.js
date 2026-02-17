import crypto from "crypto";
import { serialize } from "cookie";

const COOKIE_NAME = "ln_auth";

function sign(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET belum diset.");
  const data = JSON.stringify(payload);
  const sig = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return Buffer.from(data).toString("base64") + "." + sig;
}

function verify(token) {
  if (!token || !token.includes(".")) return null;
  const [b64, sig] = token.split(".");
  const data = Buffer.from(b64, "base64").toString("utf-8");

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const expected = crypto.createHmac("sha256", secret).update(data).digest("hex");
  if (expected !== sig) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setAuthCookie(res, payload) {
  const token = sign(payload);
  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    })
  );
}

export function clearAuthCookie(res) {
  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    })
  );
}

export function getAuthFromReq(req) {
  const raw = req.headers.cookie || "";
  const token = raw
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE_NAME + "="))
    ?.split("=")[1];

  return verify(token || "");
}

export function requireAuth(req, res) {
  const user = getAuthFromReq(req);
  if (!user) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return null;
  }
  return user;
}
