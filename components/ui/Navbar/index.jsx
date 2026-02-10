'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { isPWA } from '../../../utils/isPWA'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [menuOpen, setMenuOpen] = useState(false)
  const [pwa, setPwa] = useState(false)

  useEffect(() => {
    setPwa(isPWA())
  }, [])

  const navigation = [
    { title: 'Tentang', path: '/#cta' },
    { title: 'Software', path: '/#toolkit' },
    { title: 'Testimoni', path: '/#testimonials' },
    ...(pwa
      ? [
          { title: 'Blog', path: '/blog' },
          { title: 'Reward', path: '/reward' },
        ]
      : []),
  ]

  const scrollToAnchor = (id) => {
    const el = document.getElementById(id)
    if (!el) return

    const yOffset = -80
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const handleNavClick = (path) => {
    setMenuOpen(false)

    // ✅ kalau anchor, selalu push dengan hash-nya
    if (path.startsWith('/#')) {
      router.push(path) // <-- penting: jangan push('/')
      return
    }

    if (pathname !== path) router.push(path)
  }

  // ✅ setiap route berubah, kalau ada hash -> scroll
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const id = hash.replace('#', '')

    // tunggu DOM section di halaman home kebentuk dulu
    requestAnimationFrame(() => {
      // kadang butuh 2 frame kalau home render agak berat
      requestAnimationFrame(() => scrollToAnchor(id))
    })
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 select-none">
          Layanan Nusantara
        </h1>

        <nav className="hidden md:flex items-center space-x-4">
          {navigation.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item.path)}
              className="px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 transition"
            >
              {item.title}
            </button>
          ))}

          <Link
            href="/order"
            className="bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Pesan Sekarang
          </Link>
        </nav>

        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Toggle menu"
          className="md:hidden p-3 rounded-md text-gray-700 hover:text-black transition"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 md:hidden transition ${
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
            <span className="text-lg font-semibold text-gray-800">Menu</span>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-2 px-5 pt-4 font-medium text-gray-700">
            {navigation.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.path)}
                className="w-full text-center py-2.5 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition"
              >
                {item.title}
              </button>
            ))}
          </nav>

          <div className="px-5 pt-4 pb-6">
            <Link
              href="/order"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center bg-gray-800 text-white py-3 rounded-xl shadow hover:bg-gray-700 hover:scale-[1.02] transition-transform"
            >
              Pesan Sekarang
            </Link>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        [id] {
          scroll-margin-top: 80px;
        }
      `}</style>
    </header>
  )
}
