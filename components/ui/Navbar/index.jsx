'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isPWA } from '../../../utils/isPWA'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [menuOpen, setMenuOpen] = useState(false)
  const [pwa, setPwa] = useState(false)

  // ✅ PROMO: Diskon aktif hanya di tanggal ini
  const [isDiskonEvent, setIsDiskonEvent] = useState(false)

  useEffect(() => {
    setPwa(isPWA())
  }, [])

  // ✅ Auto update status promo
  useEffect(() => {
    const check = () => {
      const now = new Date()
      const start = new Date('2026-03-20T00:00:00')
      const end = new Date('2026-03-22T23:59:59')

      setIsDiskonEvent(now >= start && now <= end)
    }

    check()

    const timer = setInterval(check, 30_000)

    return () => clearInterval(timer)
  }, [])

  const navigation = [
    { title: 'Tentang', path: '/#cta' },
    { title: 'Software', path: '/#toolkit' },
    { title: 'Testimoni', path: '/#testimonials' },
    { title: 'Kelas Nusantara', path: '/kelas-nusantara' },
    { title: 'Blog', path: '/blog' },

    ...(pwa && isDiskonEvent
      ? [{ title: 'Diskon', path: '/order/diskon' }]
      : []),

    ...(pwa ? [{ title: 'Reward', path: '/reward' }] : []),
  ]

  const scrollToAnchor = (id) => {
    const el = document.getElementById(id)
    if (!el) return

    const yOffset = -80
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    })
  }

  const handleNavClick = (path) => {
    setMenuOpen(false)

    const pwaOnlyPaths = [
      '/order',
      '/order/diskon',
      '/reward',
      '/login',
      '/register',
      '/reset-password',
      '/profil',
    ]

    if (!pwa && pwaOnlyPaths.includes(path)) {
      router.push('/#cta')
      return
    }

    if (path.startsWith('/#')) {
      router.push(path)
      return
    }

    if (pathname !== path) {
      router.push(path)
    }
  }

  const handleCTA = () => {
    setMenuOpen(false)
    router.push('/order')
  }

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const id = hash.replace('#', '')

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToAnchor(id)
      })
    })
  }, [pathname])

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white z-[9999] shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 select-none">
            Layanan Nusantara
          </h1>

          {/* DESKTOP NAVBAR */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.path)}
                className="px-3 py-2 rounded-md text-gray-700 hover:text-black transition"
              >
                {item.title}
              </button>
            ))}

            <button
              type="button"
              onClick={handleCTA}
              className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Pesan Sekarang
            </button>
          </nav>

          {/* MOBILE BUTTON - MUNCUL DI BROWSER, HILANG DI PWA */}
          {!pwa && (
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Toggle menu"
              className="md:hidden p-3 rounded-md text-gray-700 hover:text-black transition"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* MOBILE DRAWER - KHUSUS MOBILE BROWSER */}
        {!pwa && (
          <div
            className={`fixed inset-0 z-[9998] md:hidden transition ${
              menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <div
              onClick={() => setMenuOpen(false)}
              className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
                menuOpen ? 'opacity-100' : 'opacity-0'
              }`}
            />

            <aside
              className={`absolute right-0 top-0 h-full w-[280px] bg-white rounded-l-2xl shadow-2xl transform transition-transform duration-500 ${
                menuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
                <span className="text-lg font-semibold text-gray-800">
                  Menu
                </span>

                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-2 px-5 pt-4 font-medium text-gray-700">
                {navigation.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavClick(item.path)}
                    className="w-full text-center py-2.5 rounded-lg hover:bg-gray-100 hover:text-black transition"
                  >
                    {item.title}
                  </button>
                ))}
              </nav>

              <div className="px-5 pt-4 pb-6">
                <button
                  type="button"
                  onClick={handleCTA}
                  className="block w-full text-center bg-black text-white py-3 rounded-xl shadow hover:bg-gray-800 active:scale-[0.98] transition"
                >
                  Pesan Sekarang
                </button>
              </div>
            </aside>
          </div>
        )}

        <style jsx global>{`
          [id] {
            scroll-margin-top: 80px;
          }

          body {
            padding-bottom: ${pwa ? '100px' : '0'};
          }
        `}</style>
      </header>

      {/* PWA BOTTOM NAVBAR - KHUSUS APK / PWA */}
      {pwa && (
        <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] md:hidden w-[92%] max-w-[430px] bg-white/95 backdrop-blur-xl rounded-[30px] border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.12)] px-6 py-3 flex items-center justify-between">
          {/* HOME */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex flex-col items-center gap-1 text-black active:scale-95 transition"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
            </svg>

            <span className="text-[11px] font-semibold">
              Home
            </span>
          </button>

          {/* KELAS NUSANTARA */}
          <button
            onClick={() => handleNavClick('/kelas-nusantara')}
            className="flex flex-col items-center gap-1 text-gray-400 active:scale-95 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M12 6 3 10l9 4 9-4-9-4Z" />
              <path d="M3 10v4l9 4 9-4v-4" />
            </svg>

            <span className="text-[11px] font-medium">
              Kelas
            </span>
          </button>

          {/* TOMBOL TENGAH PESAN */}
          <button
            onClick={handleCTA}
            aria-label="Pesan Sekarang"
            className="absolute left-1/2 -translate-x-1/2 -top-8 w-[78px] h-[78px] rounded-full bg-black text-white flex flex-col items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.35)] border-[7px] border-white active:scale-95 transition-all"
          >
            <span className="text-[28px] leading-none">
              ✦
            </span>

            <span className="text-[10px] font-semibold mt-1">
              Pesan
            </span>
          </button>

          {/* BLOG */}
          <button
            onClick={() => handleNavClick('/blog')}
            className="flex flex-col items-center gap-1 text-gray-400 active:scale-95 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M5 5h14v14H5z" />
              <path d="M8 9h8M8 13h5" />
            </svg>

            <span className="text-[11px] font-medium">
              Blog
            </span>
          </button>

          {/* REWARD */}
          <button
            onClick={() => handleNavClick('/reward')}
            className="flex flex-col items-center gap-1 text-gray-400 active:scale-95 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M12 17l-5 3 1-6-4-4 6-.9L12 3l2 5.1 6 .9-4 4 1 6z" />
            </svg>

            <span className="text-[11px] font-medium">
              Reward
            </span>
          </button>
        </nav>
      )}
    </>
  )
}