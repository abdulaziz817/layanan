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

    const hasShown = localStorage.getItem("splashShown")
    if (hasShown) {
      setShowSplash(false)
    } else {
      setShowSplash(true)
      localStorage.setItem("splashShown", "true")
    }

    // 🔥 register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
    }

  }, [])

  // 🔥 PUSH FUNCTION
  async function enablePush() {
    if (!("serviceWorker" in navigator)) {
      alert("Browser tidak support notifikasi.")
      return
    }

    const reg = await navigator.serviceWorker.ready

    const perm = await Notification.requestPermission()
    if (perm !== "granted") {
      alert("Izin notifikasi ditolak.")
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    await fetch("/.netlify/functions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    })

    alert("Notifikasi aktif ✅")
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/")
    const raw = atob(base64)
    const out = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
    return out
  }

  return (
    <>
      <Head>
        <title>Layanan Nusantara</title>
        <meta name="description" content="Layanan Nusantara menyediakan jasa desain grafis, website profesional, preset fotografi, dan aplikasi premium dengan harga terbaik." />
  <meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
/>
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Navbar />

      {/* 🔥 Tombol aktifkan notif */}
      <div className="text-center py-4">
        <button
          onClick={enablePush}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Aktifkan Notifikasi Promo 🔔
        </button>
      </div>

      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

export default Layout
