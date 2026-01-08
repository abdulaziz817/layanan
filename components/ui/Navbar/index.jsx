'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingAnchor, setPendingAnchor] = useState(null)
  const [isApp, setIsApp] = useState(false)

  // 🔥 Detect APP (PWA / Standalone)
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    setIsApp(isStandalone)
  }, [])

  // 🔥 Navigation
  const navigation = [
    { title: "Tentang", path: "/#cta" },
    { title: "Software", path: "/#toolkit" },
    { title: "Testimoni", path: "/#testimonials" },

    // 👉 HANYA MUNCUL DI APLIKASI
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
      const y =
        element.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-4 items-center">
          {navigation.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item.path)}
              className="text-gray-700 hover:text-blue-600 transition px-3 py-2 rounded-md"
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

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-3 rounded-md text-gray-700"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 md:hidden ${
          menuOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMenuOpen(false)}
        />

        <aside className="absolute right-0 top-0 h-full w-72 bg-white p-6 space-y-6">
          <nav className="flex flex-col space-y-4">
            {navigation.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.path)}
                className="text-left hover:text-blue-600"
              >
                {item.title}
              </button>
            ))}
          </nav>

          <Link
            href="/order"
            onClick={() => setMenuOpen(false)}
            className="block text-center bg-gray-800 text-white py-3 rounded-lg"
          >
            Pesan Sekarang
          </Link>
        </aside>
      </div>
    </header>
  )
}
