'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isPWA } from '../../../utils/isPWA'

export default function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingAnchor, setPendingAnchor] = useState(null)
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
    const element = document.getElementById(id)
    if (!element) return
    const yOffset = -80
    const y =
      element.getBoundingClientRect().top +
      window.pageYOffset +
      yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const handleNavClick = (path) => {
    setMenuOpen(false)

    if (path.startsWith('/#')) {
      const id = path.replace('/#', '')
      if (window.location.pathname === '/') {
        scrollToAnchor(id)
      } else {
        setPendingAnchor(id)
        router.push('/')
      }
      return
    }

    if (window.location.pathname !== path) {
      router.push(path)
    }
  }

  useEffect(() => {
    if (pendingAnchor && window.location.pathname === '/') {
      scrollToAnchor(pendingAnchor)
      setPendingAnchor(null)
    }
  }, [pendingAnchor])

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-md">
      {/* ===== TOP BAR ===== */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 select-none">
          Layanan Nusantara
        </h1>

        {/* ===== DESKTOP NAV ===== */}
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

        {/* ===== MOBILE TOGGLE ===== */}
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
      </div>

      {/* ===== MOBILE OVERLAY ===== */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* ===== MOBILE SIDEBAR ===== */}
        <aside
          className={`absolute right-0 top-0 h-full w-[280px] bg-white rounded-l-2xl shadow-2xl transform transition-transform duration-500 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
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

          {/* Menu */}
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

          {/* CTA */}
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

      {/* ===== OFFSET ANCHOR ===== */}
      <style jsx global>{`
        [id] {
          scroll-margin-top: 80px;
        }
      `}</style>
    </header>
  )
}
