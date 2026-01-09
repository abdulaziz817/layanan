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
    // ⛔ Blog & Reward hanya muncul kalau PWA
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
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
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
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 select-none">
          Layanan Nusantara
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {navigation.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item.path)}
              className="px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 transition-colors duration-300 select-none"
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

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className={`md:hidden p-3 rounded-md text-gray-700 hover:text-black transition-transform duration-300 ${
            menuOpen ? 'rotate-90' : 'rotate-0'
          }`}
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

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden flex justify-end transition ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Mobile Sidebar */}
        <aside
          className={`relative min-w-[260px] bg-white rounded-l-xl shadow-2xl px-6 py-8 space-y-6 transform transition-transform duration-500 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
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

          <nav className="flex flex-col space-y-5 mt-6 font-medium text-gray-700">
            {navigation.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.path)}
                className="text-left hover:text-blue-600 transition select-none"
              >
                {item.title}
              </button>
            ))}
          </nav>

          <Link
            href="/order"
            onClick={() => setMenuOpen(false)}
            className="block text-center bg-gray-800 text-white px-5 py-3 rounded-lg shadow hover:bg-gray-700 hover:scale-105 transition-transform"
          >
            Pesan Sekarang
          </Link>
        </aside>
      </div>

      {/* Offset anchor */}
      <style jsx global>{`
        [id] {
          scroll-margin-top: 80px;
        }
      `}</style>
    </header>
  )
}
