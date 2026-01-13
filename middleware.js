import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Hanya proteksi route /kwitansi
  if (!pathname.startsWith("/kwitansi")) {
    return NextResponse.next();
  }

  // Halaman login tetap boleh diakses tanpa auth
  if (pathname.startsWith("/kwitansi/login")) {
    return NextResponse.next();
  }

  // Cek cookie auth
  const auth = request.cookies.get("kwitansi_auth")?.value;

  // Kalau belum login, lempar ke /kwitansi/login
  if (auth !== "1") {
    const url = request.nextUrl.clone();
    url.pathname = "/kwitansi/login";
    url.searchParams.set("next", pathname); // biar setelah login balik ke halaman yg diminta
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kwitansi/:path*"],
};
