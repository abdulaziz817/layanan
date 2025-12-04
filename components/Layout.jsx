"use client"
import { useEffect } from "react"
import Head from "next/head"
import Footer from "./ui/Footer"
import Navbar from "./ui/Navbar"
import AOS from "aos"
import "aos/dist/aos.css"
import "swiper/css"

const Layout = ({ children }) => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true })
    }, [])

    return (
        <>
<Head>
    <title>
        Layanan Nusantara - Jasa Desain, Website & Preset Fotografi | Aplikasi Premium Harga Terbaik
    </title>

    <meta 
        name="description" 
        content="Layanan Nusantara menyediakan jasa desain grafis, pembuatan website profesional, preset fotografi, serta aplikasi premium harga terbaik. Kualitas tinggi dengan harga terjangkau!"
    />

    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" />

    {/* SEO Open Graph untuk sosial media */}
    <meta property="og:title" content="Layanan Nusantara - Jasa Desain, Website & Preset | Aplikasi Premium Harga Terbaik" />
    <meta property="og:description" content="Jasa desain, pembuatan website, preset fotografi, dan aplikasi premium harga terbaik. Pesan sekarang!" />
    <meta property="og:image" content="https://layanannusantara.store/cta-image.jpg" />
    <meta property="og:url" content="https://layanannusantara.store/" />
    <meta property="og:type" content="website" />

    {/* Verifikasi Google */}
    <meta name="google-site-verification" content="m75bMloU2miNejb-JdXZcuRjL2mv5nQDc4q_ZKJ0xsE" />
</Head>


            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </>
    )
}

export default Layout
