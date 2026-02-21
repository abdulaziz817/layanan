// lib/userAuthCookie.js

export function setUserSessionCookie(res, sessionToken) {
  const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 hari

  const cookie =
    `ln_user_session=${encodeURIComponent(sessionToken)}; ` +
    `Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax` +
    (process.env.NODE_ENV === "production" ? "; Secure" : "");

  res.setHeader("Set-Cookie", cookie);
}

export function clearUserSessionCookie(res) {
  const cookie =
    `ln_user_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax` +
    (process.env.NODE_ENV === "production" ? "; Secure" : "");

  res.setHeader("Set-Cookie", cookie);
}

export function getUserSessionFromReq(req) {
  const header = req.headers.cookie || "";
  const parts = header.split(";").map((x) => x.trim());
  const found = parts.find((p) => p.startsWith("ln_user_session="));
  if (!found) return "";
  return decodeURIComponent(found.split("=").slice(1).join("="));
}
