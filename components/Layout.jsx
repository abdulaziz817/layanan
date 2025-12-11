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
                {/* TITLE SEO */}
                <title>Layanan Nusantara – Jasa Desain & Website Profesional</title>

                {/* META DESCRIPTION */}
                <meta
                    name="description"
                    content="Layanan Nusantara menyediakan jasa desain grafis, pembuatan website profesional, preset fotografi, serta aplikasi premium dengan harga terbaik."
                />

                <meta name="viewport" content="width=device-width, initial-scale=1" />
           <link rel="icon" href="/favicon/favicon-32x32.png" />




                {/* OG SITE NAME – Biar Google munculin nama website */}
                <meta property="og:site_name" content="Layanan Nusantara" />

                {/* OPEN GRAPH (WA / IG / FB) */}
                <meta property="og:title" content="Layanan Nusantara – Jasa Desain & Website Profesional" />
                <meta
                    property="og:description"
                    content="Solusi lengkap jasa desain grafis, website profesional, preset fotografi, dan aplikasi premium dengan kualitas terbaik."
                />
                <meta property="og:image" content="https://layanannusantara.store/cta-image.jpg" />
                <meta property="og:url" content="https://layanannusantara.store/" />
                <meta property="og:type" content="website" />

                {/* JSON-LD ORGANIZATION – Biar Google tampilkan seperti 'Nusantara Kemenhub' */}
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
