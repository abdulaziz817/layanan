'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingAnchor, setPendingAnchor] = useState(null)
  const [isApp, setIsApp] = useState(false)

  // 🔒 DETEKSI APLIKASI (PWA / Standalone)
  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    setIsApp(standalone)
  }, [])

  const navigation = [
    { title: "Tentang", path: "/#cta" },
    { title: "Software", path: "/#toolkit" },
    { title: "Testimoni", path: "/#testimonials" },

    // 🔥 BLOG & REWARD HANYA DI APLIKASI
    ...(isApp
      ? [
          { title: "Blog", path: "/blog" },
          { title: "Reward", path: "/reward" },
        ]
      : []),
  ]

  const scrollToAnchor = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
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

    if (window.location.pathname === path) return
    router.push(path)
  }

  useEffect(() => {
    if (pendingAnchor && window.location.pathname === '/') {
      scrollToAnchor(pendingAnchor)
      setPendingAnchor(null)
    }
  }, [pendingAnchor])

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 select-none">
          Layanan Nusantara
        </h1>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex space-x-4 items-center">
          {navigation.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item.path)}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300 px-3 py-2 rounded-md cursor-pointer select-none"
            >
              {item.title}
            </button>
          ))}

          <Link
            href="/order"
            className="bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition duration-300"
          >
            Pesan Sekarang
          </Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-3 rounded-md text-gray-700 transition-transform duration-300 ${
            menuOpen ? 'rotate-90' : ''
          }`}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-72 bg-white px-6 py-8 space-y-6 shadow-2xl transform transition-transform duration-500 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <nav className="flex flex-col space-y-5 text-gray-700 font-medium mt-6">
            {navigation.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.path)}
                className="text-left hover:text-blue-600 transition"
              >
                {item.title}
              </button>
            ))}
          </nav>

          <Link
            href="/order"
            onClick={() => setMenuOpen(false)}
            className="block text-center bg-gray-800 text-white px-5 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Pesan Sekarang
          </Link>
        </aside>
      </div>
    </header>
  )
}
