'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingAnchor, setPendingAnchor] = useState(null)

  const navigation = [
    { title: "Tentang", path: "/#cta" },
    { title: "Software", path: "/#toolkit" },
    { title: "Testimoni", path: "/#testimonials" },
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
        <h1 className="text-2xl font-bold text-gray-900 select-none">Layanan Nusantara</h1>

        {/* Desktop Nav */}
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

          {/* Tombol Pesan */}
          <Link
            href="/order"
            className="bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition duration-300"
          >
            Pesan Sekarang
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className={`md:hidden p-3 rounded-md text-gray-700 hover:text-black transition-transform duration-300
            ${menuOpen ? 'rotate-90' : 'rotate-0'}`}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden flex justify-end pointer-events-none ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out
            ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMenuOpen(false)}
        ></div>

        <aside
          className={`relative w-fit min-w-[260px] max-w-sm bg-white rounded-l-xl shadow-2xl px-6 py-8 space-y-6
            transform transition-transform duration-500 ease-in-out
            ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-300 p-1"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <nav className="flex flex-col space-y-5 text-gray-700 font-medium mt-6">
            {navigation.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.path)}
                className="block hover:text-blue-600 transition duration-300 leading-none cursor-pointer select-none"
              >
                {item.title}
              </button>
            ))}
          </nav>

          {/* Tombol Pesan - mobile */}
          <Link
            href="/order"
            onClick={() => setMenuOpen(false)}
            className="block text-center bg-gray-800 text-white px-5 py-3 rounded-lg shadow hover:bg-gray-700 hover:scale-105 transition-transform duration-300"
          >
            Pesan Sekarang
          </Link>
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
