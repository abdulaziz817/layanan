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
    {/* TITLE SINGKAT */}
    <title>Layanan Nusantara</title>

    {/* META DESCRIPTION */}
    <meta
        name="description"
        content="Layanan Nusantara menyediakan jasa desain grafis, website profesional, preset fotografi, dan aplikasi premium dengan harga terbaik."
    />

    <meta name="viewport" content="width=device-width, initial-scale=1" />

    {/* FAVICON */}
    <link rel="icon" href="/favicon/favicon.ico" />
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png" />
    <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />

    {/* OG */}
    <meta property="og:site_name" content="Layanan Nusantara" />
    <meta property="og:title" content="Layanan Nusantara" />
    <meta
        property="og:description"
        content="Solusi jasa desain grafis, website profesional, preset fotografi, dan aplikasi premium."
    />
    <meta property="og:image" content="https://layanannusantara.store/cta-image.jpg" />
    <meta property="og:url" content="https://layanannusantara.store/" />
    <meta property="og:type" content="website" />

    {/* JSON-LD BRANDING / LOGO */}
<script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
        __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Layanan Nusantara",
            url: "https://layanannusantara.store",
            logo: "https://layanannusantara.store/image/nusantaralogo.png"
        })
    }}
/>


    {/* GOOGLE VERIFICATION */}
    <meta
        name="google-site-verification"
        content="m75bMloU2miNejb-JdXZcuRjL2mv5nQDc4q_ZKJ0xsE"
    />
</Head>


            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </>
    )
}

export default Layout
