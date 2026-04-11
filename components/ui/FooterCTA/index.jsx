import { useEffect, useMemo, useState } from "react"
import Head from "next/head"
import SectionWrapper from "../../SectionWrapper"
import NavLink from "../NavLink"

const FooterCTA = () => {
    const waNumber = "6287860592111"
    const waMessage = encodeURIComponent(
        "Halo, saya tertarik dengan layanan Anda. Saya ingin konsultasi lebih lanjut."
    )
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`

    return (
        <>
            <Head>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                />
            </Head>

            <SectionWrapper>
                <div className="custom-screen">
                    <div className="relative overflow-hidden rounded-[28px] border border-white bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                        <div className="grid items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:px-14 lg:py-14">
                            <div className="max-w-xl">
                                <span className="inline-flex items-center rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-sm font-medium text-indigo-600 shadow-sm">
                                    Solusi untuk seluruh Indonesia
                                </span>

                                <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[48px]">
                                    Hadir lebih dekat untuk bisnis Anda
                                </h2>

                                <p className="mt-4 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">
                                    Solusi kreatif dan digital yang cepat, rapi, dan
                                    terpercaya untuk menjangkau lebih luas.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <NavLink
                                        href={waLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-xl border border-indigo-600 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-indigo-700 hover:bg-indigo-700"
                                    >
                                        Chat Sekarang
                                    </NavLink>

                                    <div className="inline-flex items-center justify-center rounded-xl border border-white bg-white px-6 py-3 text-sm font-medium text-slate-600 shadow-sm">
                                        Respon cepat & mudah
                                    </div>
                                </div>

                                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                                        <p className="text-2xl font-semibold text-slate-900">
                                            100%
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            Disesuaikan
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                                        <p className="text-2xl font-semibold text-slate-900">
                                            Cepat
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            Komunikasi jelas
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                                        <p className="text-2xl font-semibold text-slate-900">
                                            Luas
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            Sabang sampai Merauke
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <IndonesiaMap />
                            </div>
                        </div>
                    </div>
                </div>
            </SectionWrapper>

            <style jsx global>{`
                .leaflet-container {
                    height: 100%;
                    width: 100%;
                    font-family: inherit;
                    background: #eef2ff;
                }

                .leaflet-control-zoom {
                    border: none !important;
                    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08) !important;
                    border-radius: 16px !important;
                    overflow: hidden;
                }

                .leaflet-control-zoom a {
                    width: 40px !important;
                    height: 40px !important;
                    line-height: 40px !important;
                    text-align: center;
                    background: #ffffff !important;
                    color: #4f46e5 !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    text-decoration: none !important;
                    font-size: 20px !important;
                }

                .leaflet-control-zoom a:last-child {
                    border-bottom: none !important;
                }

                .leaflet-control-attribution {
    display: none !important;
}

                .leaflet-control-attribution a {
                    color: #4f46e5 !important;
                    text-decoration: none !important;
                }

                .leaflet-popup-content-wrapper {
                    border-radius: 14px;
                    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
                }

                .leaflet-popup-content {
                    margin: 10px 14px;
                    font-family: inherit;
                    color: #0f172a;
                    font-size: 14px;
                }

                .custom-map-marker {
                    width: 16px;
                    height: 16px;
                    border-radius: 9999px;
                    background: #4f46e5;
                    border: 3px solid #ffffff;
                    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.28);
                }
            `}</style>
        </>
    )
}

const IndonesiaMap = () => {
    const [mapLib, setMapLib] = useState(null)

    useEffect(() => {
        let active = true

        const load = async () => {
            const L = await import("leaflet")
            const RL = await import("react-leaflet")

            const markerIcon = L.divIcon({
                className: "",
                html: `<div class="custom-map-marker"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            })

            if (active) {
                setMapLib({
                    MapContainer: RL.MapContainer,
                    TileLayer: RL.TileLayer,
                    Marker: RL.Marker,
                    Popup: RL.Popup,
                    icon: markerIcon,
                })
            }
        }

        load()

        return () => {
            active = false
        }
    }, [])

    const markers = useMemo(
        () => [
            { name: "Banda Aceh", position: [5.5483, 95.3238] },
            { name: "Medan", position: [3.5952, 98.6722] },
            { name: "Padang", position: [-0.9471, 100.4172] },
            { name: "Palembang", position: [-2.9761, 104.7754] },
            { name: "Jakarta", position: [-6.2088, 106.8456] },
            { name: "Bandung", position: [-6.9175, 107.6191] },
            { name: "Semarang", position: [-6.9667, 110.4167] },
            { name: "Yogyakarta", position: [-7.7956, 110.3695] },
            { name: "Surabaya", position: [-7.2575, 112.7521] },
            { name: "Denpasar", position: [-8.6705, 115.2126] },
            { name: "Mataram", position: [-8.5833, 116.1167] },
            { name: "Kupang", position: [-10.1772, 123.607] },
            { name: "Pontianak", position: [-0.0263, 109.3425] },
            { name: "Banjarmasin", position: [-3.3194, 114.5908] },
            { name: "Balikpapan", position: [-1.2379, 116.8529] },
            { name: "Samarinda", position: [-0.5022, 117.1537] },
            { name: "Makassar", position: [-5.1477, 119.4327] },
            { name: "Manado", position: [1.4748, 124.8421] },
            { name: "Palu", position: [-0.8917, 119.8707] },
            { name: "Kendari", position: [-3.9985, 122.512] },
            { name: "Ambon", position: [-3.6954, 128.1814] },
            { name: "Ternate", position: [0.7907, 127.3842] },
            { name: "Sorong", position: [-0.8762, 131.2558] },
            { name: "Manokwari", position: [-0.8615, 134.078] },
            { name: "Jayapura", position: [-2.5916, 140.669] },
            { name: "Merauke", position: [-8.4932, 140.4018] },
        ],
        []
    )

    if (!mapLib) {
        return (
            <div className="relative mx-auto flex min-h-[360px] w-full max-w-[660px] items-center justify-center overflow-hidden rounded-[28px] border border-white bg-white/80 shadow-[0_12px_40px_rgba(79,70,229,0.08)]">
                <div className="text-sm font-medium text-slate-500">
                    Memuat peta Indonesia...
                </div>
            </div>
        )
    }

    const { MapContainer, TileLayer, Marker, Popup, icon } = mapLib

    return (
        <div className="relative mx-auto w-full max-w-[660px] overflow-hidden rounded-[28px] border border-white bg-white/80 shadow-[0_12px_40px_rgba(79,70,229,0.08)]">
            <div className="absolute right-5 top-5 z-[1000] rounded-full border border-white bg-white/95 px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm backdrop-blur-sm">
                Peta Indonesia
            </div>

            <div className="absolute bottom-5 left-5 z-[1000] rounded-full border border-white bg-white/95 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm">
                Sabang sampai Merauke
            </div>

            <div className="h-[360px] w-full">
                <MapContainer
                    center={[-2.5, 118]}
                    zoom={5}
                    minZoom={4}
                    maxZoom={18}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    zoomControl={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {markers.map((item) => (
                        <Marker
                            key={item.name}
                            position={item.position}
                            icon={icon}
                        >
                            <Popup>{item.name}</Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    )
}

export default FooterCTA