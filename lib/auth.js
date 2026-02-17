import crypto from "crypto";
import { serialize } from "cookie";

function sign(payload) {
  const secret = process.env.JWT_SECRET || "dev";
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token) {
  const secret = process.env.JWT_SECRET || "dev";
  const [body, sig] = (token || "").split(".");
  if (!body || !sig) return null;

  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (expected !== sig) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function setAuthCookie(res, payload) {
  const token = sign(payload);
  res.setHeader(
    "Set-Cookie",
    serialize("ln_auth", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    })
  );
}

export function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", serialize("ln_auth", "", { path: "/", maxAge: 0 }));
}

export function requireAuth(req) {
  const cookie = req.headers.cookie || "";
  const token = cookie.split("ln_auth=")[1]?.split(";")[0];
  return verify(token);
}
