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
    const testimonials = [
        {
            id: 1,
            name: "Sinta Rahmadani",
            role: "Customer",
            stars: 4.5,
            service: "Desain logo usaha kopi",
            comment:
                "Desainnya kece dan sesuai selera, usaha aku jadi makin dikenal orang. Worth it banget!",
            time: "2 minggu lalu",
            budget: "Rp 400.000",
        },
        {
            id: 2,
            name: "Rizky Fadillah",
            role: "Customer",
            stars: 5,
            service: "Pembuatan website portfolio",
            comment:
                "Webnya cepat, responsif, dan tampilannya keren abis! Bener-bener bikin karir aku naik kelas.",
            time: "1 bulan lalu",
            budget: "Rp 150.000",
        },
        {
            id: 3,
            name: "Nadira Putri",
            role: "Customer",
            stars: 4,
            service: "Preset fotografi outdoor",
            comment:
                "Presetnya pas banget buat foto-foto aku, bikin feed IG jadi makin estetik dan menarik.",
            time: "4 hari lalu",
            budget: "Rp 80.000",
        },
        {
            id: 4,
            name: "Andi Maulana",
            role: "Customer",
            stars: 5,
            service: "Desain banner promosi",
            comment:
                "Banner detailnya keren, bikin banyak orang langsung tertarik sama produk aku.",
            time: "3 minggu lalu",
            budget: "Rp 40.000",
        },
        {
            id: 5,
            name: "Dewi Lestari",
            role: "Customer",
            stars: 4.5,
            service: "Desain kartu nama & branding",
            comment:
                "Kartu nama aku jadi profesional dan elegan banget, makin percaya diri waktu networking.",
            time: "1 bulan lalu",
            budget: "Rp 15.000",
        },
    ]

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
                    {testimonials.map((item, i) => (
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
