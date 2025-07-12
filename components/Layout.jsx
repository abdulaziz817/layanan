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
        AOS.init({ duration: 1000, once: true }) // once=true biar animasi hanya sekali
    }, [])

    return (
        <>
            <Head>
                <title>Layanan Nusantara</title>
                <meta name='description' content='' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </>
    )
}

export default Layout
