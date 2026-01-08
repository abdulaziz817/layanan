import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // route yang DIKUNCI
  const protectedRoutes = ['/blog', '/reward']

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const isApp =
      request.headers.get('sec-ch-ua-platform') ||
      request.headers.get('x-requested-with')

    // ❌ jika BUKAN aplikasi
    if (!isApp) {
      return NextResponse.redirect(
        new URL('/app-only', request.url)
      )
    }
  }

  return NextResponse.next()
}

// 🔥 WAJIB ADA (biar tidak global)
export const config = {
  matcher: ['/blog/:path*', '/reward/:path*'],
}
