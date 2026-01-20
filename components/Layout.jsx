"use client"
import { useEffect, useState } from "react"
import Head from "next/head"
import Footer from "./ui/Footer"
import Navbar from "./ui/Navbar"
import AOS from "aos"
import "aos/dist/aos.css"
import "swiper/css"
import SplashScreen from "./SplashScreen"

const Layout = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    AOS.init({ duration: 1000, once: true })

    // splash hanya tampil sekali per browser
    const hasShown = localStorage.getItem("splashShown")

    if (hasShown) {
      setShowSplash(false) // ✅ ini yang kurang di kode kamu
    } else {
      setShowSplash(true)
      localStorage.setItem("splashShown", "true")
    }
  }, [])

  return (
    <>
      <Head>
        <title>Layanan Nusantara</title>
        <meta
          name="description"
          content="Layanan Nusantara menyediakan jasa desain grafis, website profesional, preset fotografi, dan aplikasi premium dengan harga terbaik."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* ✅ Favicon utama (root public/favicon.ico) */}
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* ✅ Favicon tambahan (folder public/favicon/) */}
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />

        <meta property="og:site_name" content="Layanan Nusantara" />
        <meta property="og:title" content="Layanan Nusantara" />
        <meta
          property="og:description"
          content="Solusi jasa desain grafis, website profesional, preset fotografi, dan aplikasi premium."
        />
        <meta property="og:image" content="https://layanannusantara.store/cta-image.jpg" />
        <meta property="og:url" content="https://layanannusantara.store/" />
        <meta property="og:type" content="website" />
      </Head>

      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

export default Layout
