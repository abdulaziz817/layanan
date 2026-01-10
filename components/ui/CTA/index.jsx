"use client"

import SectionWrapper from "../../SectionWrapper"
import NavLink from "../NavLink"
import { motion } from "framer-motion"

const CTA = () => {
    return (
        <SectionWrapper id="cta" className="bg-white py-16">
            <div className="custom-screen">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Tentang <span className="text-indigo-600 underline underline-offset-4">Layanan Kami</span>
                        </h2>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="w-24 h-1 bg-indigo-600 mx-auto mt-4 origin-left rounded-full"
                        />
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-12 gap-12 items-start">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            className="md:col-span-7 space-y-6"
                        >
                            <div className="space-y-4 text-gray-700 text-base leading-loose" style={{ wordSpacing: '0.12em' }}>
<p className="text-justify" style={{ textIndent: '2rem' }}>
  <span className="font-semibold text-indigo-600">Layanan Nusantara</span> didirikan pada tahun <span className="underline decoration-indigo-500">2025</span> sebagai jasa kreatif yang menyediakan <strong>desain grafis</strong>, <strong>pembuatan website</strong>, <strong>preset fotografi</strong>, dan <strong>aplikasi premium dengan harga terbaik</strong>, dirancang untuk memenuhi kebutuhan individu maupun bisnis. Kami berkomitmen menghadirkan solusi visual yang tidak hanya menarik secara estetika, tetapi juga meningkatkan citra profesional klien. Dikelola langsung oleh <span className="font-semibold text-indigo-600">Abdul Aziz</span>, seorang desainer berpengalaman lebih dari <strong>8 tahun</strong>, Layanan Nusantara hadir sebagai mitra terpercaya dalam membangun identitas visual yang kuat dan berkesan.
</p>


                            </div>


                            {/* CTA Button */}

                            <div className="pt-4">
                                <motion.div
                                    whileHover="hover"
                                    variants={{
                                        hover: { scale: 1.05 },
                                    }}
                                    className="inline-block"
                                >
                                    <NavLink
                                        href="https://abdulaziznusantara.netlify.app/"
                                        className="px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-full shadow-lg transition duration-300 ease-in-out"
                                    >
                                        Lihat Portofolio Kami
                                    </NavLink>
                                </motion.div>
                            </div>
                        </motion.div>


                        {/* Right Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true }}
                            className="md:col-span-5 space-y-10"
                        >
                            {/* Visi */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-indigo-500 pl-4">Visi</h3>
                                <p className="text-gray-700 text-base leading-relaxed text-justify" style={{ textIndent: '2rem' }}>
                                    Menjadi <span className="underline decoration-indigo-500">layanan digital pilihan utama</span> yang mampu <span className="text-indigo-600 font-medium">menginspirasi</span> dan <span className="text-indigo-600 font-medium">meningkatkan kualitas visual</span> masyarakat.
                                </p>
                            </div>

                            {/* Misi */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-indigo-500 pl-4">Misi</h3>
                                <ul className="list-disc pl-6 space-y-3 text-gray-700 text-base leading-relaxed">
                                    <li>Menciptakan desain yang <span className="underline decoration-indigo-500">estetis dan fungsional</span>.</li>
                                    <li>Menyediakan <span className="text-indigo-600 font-medium">solusi digital yang efisien</span> dan user-friendly.</li>
                                    <li>Mendukung <u>personal branding</u> dan pertumbuhan bisnis dengan visual yang konsisten.</li>
                                </ul>
                            </div>

                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </SectionWrapper>
    )
}

export default CTA
