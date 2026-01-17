"use client"
import SectionWrapper from "../../SectionWrapper"
import {
    FaStar,
    FaStarHalfAlt,
    FaRegStar,
    FaUserCircle,
    FaCheckCircle,
    FaHeart,
} from "react-icons/fa"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import { useEffect, useState } from "react"
import clsx from "clsx"

const Testimonials = () => {
    // ✅ Data sekarang dari API, bukan hardcode
    const [testimonials, setTestimonials] = useState([])
    const [loading, setLoading] = useState(true)

    // State untuk menyimpan liked testimonial dan animasi trigger
    const [liked, setLiked] = useState({})
    const [animating, setAnimating] = useState({})

    // Load liked dari localStorage
    useEffect(() => {
        const storedLikes = localStorage.getItem("testimonialLikes")
        if (storedLikes) {
            setLiked(JSON.parse(storedLikes))
        }
    }, [])

    // ✅ Ambil ulasan dari Netlify function: /.netlify/functions/ulasan-list
    useEffect(() => {
        let alive = true

        const loadTestimonials = async () => {
            setLoading(true)
            try {
               const res = await fetch("/.netlify/functions/ulasan-list-public", {
  method: "GET",
  headers: { "Content-Type": "application/json" },
})

                const data = await res.json().catch(() => ({}))

                if (!res.ok) {
                    // kalau butuh admin auth, kemungkinan error di sini
                    if (alive) setTestimonials([])
                    return
                }

                const items = Array.isArray(data?.items) ? data.items : []

                const mapped = items
                    .map((u, idx) => {
                        const ratingProduk = Number(u.rating_produk || 0)
                        const ratingToko = Number(u.rating_toko || 0)

                        // gabung jadi 1 nilai bintang (0.5 step)
                        const avg = (ratingProduk + ratingToko) / 2
                        const stars = Math.round(avg * 2) / 2 || 5

                        // bikin "time" sederhana dari created_at kalau ada
                        // (kalau created_at kosong, tetep aman)
                        const time = u.created_at ? String(u.created_at) : "Baru saja"

                        return {
                            id: u.id || `${u.created_at || "row"}-${idx}`,
                            name: u.nama || "Anonim",
                            role: "Customer",
                            stars,
                            service: "Ulasan Pelanggan",
                            comment: u.kritik_saran || "",
                            time,
                            budget: u.budget, // tetap ada seperti UI awal (walau undefined)
                        }
                    })
                    // ✅ HILANGKAN testimoni dari "Dammi"
                    .filter((t) => String(t.name || "").trim().toLowerCase() !== "dammi")
                    // ✅ buang yang komentar kosong biar rapi
                    .filter((t) => String(t.comment || "").trim().length > 0)

                if (alive) setTestimonials(mapped)
            } catch (e) {
                if (alive) setTestimonials([])
            } finally {
                if (alive) setLoading(false)
            }
        }

        loadTestimonials()

        return () => {
            alive = false
        }
    }, [])

    // Handle klik like
    const handleLike = (id) => {
        const newLikes = { ...liked, [id]: !liked[id] }
        setLiked(newLikes)
        localStorage.setItem("testimonialLikes", JSON.stringify(newLikes))

        // Trigger animasi
        setAnimating((prev) => ({ ...prev, [id]: true }))

        // Hapus animasi setelah 600ms supaya bisa trigger ulang
        setTimeout(() => {
            setAnimating((prev) => ({ ...prev, [id]: false }))
        }, 600)
    }

    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const halfStar = rating % 1 !== 0

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />)
        }

        if (halfStar) {
            stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />)
        }

        while (stars.length < 5) {
            stars.push(
                <FaRegStar
                    key={`empty-${stars.length}`}
                    className="text-gray-300"
                />
            )
        }

        return <div className="flex gap-0.5">{stars}</div>
    }

    return (
        <SectionWrapper className="bg-white">
            <div id="testimonials" className="max-w-7xl mx-auto px-6 py-20 bg-white">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold text-gray-800">
                        Apa Kata Mereka
                    </h2>
                    <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
                        Layanan Nusantara selalu berusaha memberikan layanan terbaik. Berikut adalah beberapa testimoni dari klien kami yang puas dengan hasil kerja kami.
                    </p>
                </div>

                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={30}
                    slidesPerView={1}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    breakpoints={{
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {(testimonials || []).map((item, i) => (
                        <SwiperSlide key={i}>
                            <div className="relative h-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
                                {/* Tombol like di pojok kanan atas */}
                                <button
                                    onClick={() => handleLike(item.id)}
                                    className={clsx(
                                        "absolute top-4 right-4 text-2xl transition-colors duration-300 ease-in-out",
                                        liked[item.id] ? "text-red-500" : "text-gray-400 hover:text-red-400",
                                        animating[item.id] && "animate-like"
                                    )}
                                    aria-label={liked[item.id] ? "Unlike" : "Like"}
                                >
                                    <FaHeart />
                                </button>

                                <div>
                                    <div className="flex items-center gap-4 mb-5">
                                        <FaUserCircle className="text-gray-400 w-12 h-12" />
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-lg flex items-center gap-1">
                                                {item.name}
                                                <FaCheckCircle className="text-green-500 text-xs" />
                                            </h4>
                                            <p className="text-sm text-gray-500">{item.role}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 italic leading-relaxed text-base mb-6 line-clamp-4">
                                        “{item.comment}”
                                    </p>
                                </div>

                                <div className="flex justify-between items-center text-sm mt-4">
                                    <div>
                                        {renderStars(item.stars)}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {item.service}
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        <p>{item.time}</p>
                                        <p className="mt-1 font-semibold text-purple-600">
                                            {item.budget}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </SwiperSlide>
                    ))}

                    {/* Kalau kosong, biar tidak blank total (UI tetap rapi) */}
                    {(!loading && (!testimonials || testimonials.length === 0)) && (
                        <SwiperSlide>
                            <div className="relative h-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center min-h-[380px]">
                                <div className="text-center text-gray-600">
                                    Belum ada testimoni yang ditampilkan.
                                </div>
                            </div>
                        </SwiperSlide>
                    )}
                </Swiper>
            </div>

            {/* Animasi like heartbeat mirip Instagram */}
            <style jsx>{`
                @keyframes likePulse {
                    0% {
                        transform: scale(1);
                    }
                    25% {
                        transform: scale(1.4);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    75% {
                        transform: scale(1.4);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                .animate-like {
                    animation: likePulse 0.6s ease forwards;
                }
            `}</style>
        </SectionWrapper>
    )
}

export default Testimonials
