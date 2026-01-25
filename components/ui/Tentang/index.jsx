"use client"

import { motion } from "framer-motion"

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

export default function Tentang() {
  const layanan = [
    {
      title: "Desain Grafis & Branding",
      desc:
        "Layanan desain visual profesional untuk membangun identitas brand yang kuat, konsisten, dan menarik di semua media digital maupun cetak.",
      points: [
        "Desain logo, logo animasi & identitas visual brand.",
        "Konten sosial media (feed, story, carousel, highlight).",
        "Materi promosi (poster, banner, brosur, flyer, X-Banner).",
        "Desain produk (kemasan, label, mockup).",
        "Dokumen kreatif (CV kreatif, sertifikat, kartu nama).",
        "Desain khusus (thumbnail YouTube, menu makanan, template presentasi).",
      ],
    },

    {
      title: "Pembuatan Website Profesional",
      desc:
        "Pengembangan website modern, responsif, dan fungsional untuk kebutuhan bisnis, personal branding, dan sistem digital.",
      points: [
        "Landing page & company profile profesional.",
        "Website UMKM, toko online & e-commerce.",
        "Portfolio, blog pribadi & website sekolah.",
        "Dashboard admin & web app interaktif.",
        "Sistem digital (absensi, booking online, formulir, layanan jasa).",
        "Optimasi tampilan mobile dan struktur konten.",
      ],
    },

    {
      title: "Preset Fotografi",
      desc:
        "Preset dan layanan editing foto untuk menghasilkan tone warna yang konsisten, estetik, dan profesional.",
      points: [
        "Preset Lightroom & preset mobile siap pakai.",
        "Preset khusus (moody, cinematic, cerah, indoor, outdoor).",
        "Preset konten Instagram & kebutuhan branding visual.",
        "Preset potret, makanan, produk & travel.",
        "Preset tema gelap, hitam putih & minimalis.",
        "Editing foto custom sesuai kebutuhan klien.",
      ],
    },

    {
      title: "Solusi Digital & Aplikasi Premium",
      desc:
        "Menyediakan layanan aplikasi premium populer seperti Netflix Premium, YouTube Premium, Spotify Premium, Canva Pro, CapCut Pro, serta berbagai platform AI untuk kebutuhan hiburan, desain, dan produktivitas digital.",
      points: [
        "Streaming film & video premium (Netflix, YouTube, Disney+).",
        "Musik premium tanpa iklan (Spotify, Apple Music).",
        "Tools desain & editing profesional (Canva Pro, CapCut Pro).",
        "Akses AI premium (ChatGPT, Gemini, Perplexity).",
      ]

    },
  ]

  const alur = [
    {
      title: "Buka Website Layanan Nusantara",
      desc: "Kunjungi website resmi untuk melihat layanan yang tersedia dan memilih kebutuhan kamu.",
    },
    {
      title: "Klik “Pesan Layanan”",
      desc: "Pilih layanan yang kamu butuhkan, lalu lanjutkan ke form pemesanan.",
    },
    {
      title: "Isi Form Pemesanan",
      desc: "Isi data lengkap: nama, WhatsApp aktif, layanan, budget, deadline, dan catatan detail.",
    },
    {
      title: "Lakukan Pembayaran Terlebih Dahulu",
      desc: "Lakukan pembayaran sesuai metode yang dipilih pada form.",
    },
    {
      title: "Kirim via WhatsApp + Bukti Pembayaran",
      desc: "Klik tombol kirim WhatsApp, sertakan detail pesanan dan bukti pembayaran untuk verifikasi.",
    },
    {
      title: "Tunggu Admin Memproses",
      desc: "Setelah dikonfirmasi, admin akan memproses layanan dan menghubungi untuk info pengerjaan.",
    },
  ]

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-24">

        {/* HERO (center) */}
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" />
            Profil & Layanan
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 leading-tight text-center">
            Tentang
            <br />
            <span className="text-indigo-600 underline underline-offset-4">
              Layanan Nusantara
            </span>
          </h1>




          {/* highlights (center & sejajar) */}

        </motion.header>

        {/* Divider */}
        <div className="mt-12 sm:mt-16 h-px w-full bg-gray-200" />

        {/* SIAPA KAMI (lebih enak baca) */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="mt-12 sm:mt-16"
        >
          <div className="mx-auto max-w-3xl">
            <div className="mt-5 space-y-4 text-gray-700 leading-relaxed">
              <p className="text-justify" style={{ textIndent: "2rem" }}>
                <span className="font-semibold text-indigo-600">Layanan Nusantara</span>{" "}
                berdiri pada tahun <span className="font-semibold">2025</span> sebagai jasa kreatif yang fokus pada
                desain grafis, pembuatan website, preset fotografi, dan solusi digital.
                Tujuan kami: membantu klien tampil lebih profesional di ranah online melalui visual yang rapi,
                struktur konten yang jelas, dan pengalaman pengguna yang nyaman.
              </p>

              <p className="text-justify" style={{ textIndent: "2rem" }}>
                Kami percaya desain yang baik bukan hanya “bagus”, tetapi juga <span className="font-medium text-gray-900">jelas</span>,
                <span className="font-medium text-gray-900"> konsisten</span>, dan <span className="font-medium text-gray-900">terarah</span>.
                Karena itu, proses kerja kami mengutamakan komunikasi yang rapi sejak awal: kebutuhan, timeline, revisi,
                hingga output akhir.
              </p>
            </div>
          </div>
        </motion.section>

        {/* LAYANAN (minimal card, smooth) */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Layanan Kami
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Pilih layanan sesuai kebutuhan. Setiap layanan dikerjakan dengan standar profesional,
              revisi yang jelas, dan hasil akhir yang siap digunakan.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {layanan.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
                className="rounded-2xl border border-gray-200 p-6 sm:p-8
                           hover:border-indigo-200 hover:ring-2 hover:ring-indigo-100
                           transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Layanan
                  </span>
                </div>

                <p className="mt-3 text-gray-600 leading-relaxed">
                  {item.desc}
                </p>

                <div className="mt-5 border-l-4 border-indigo-200 pl-4">
                  <ul className="space-y-2 text-gray-700">
                    {item.points.map((p, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        <span className="text-sm sm:text-base leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ALUR PEMESANAN (stepper, mobile friendly) */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Alur Pemesanan
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Pesanan akan diproses setelah bukti pembayaran diterima dan dikonfirmasi admin.
            </p>
          </div>

          <div className="mt-8 mx-auto max-w-3xl">
            <ol className="space-y-4">
              {alur.map((step, i) => (
                <li
                  key={i}
                  className="group rounded-2xl border border-gray-200 p-5 sm:p-6
                             hover:border-indigo-200 hover:ring-2 hover:ring-indigo-100 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-9 w-9 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                      {i !== alur.length - 1 && (
                        <div className="mt-3 h-full w-px bg-gray-200 group-hover:bg-indigo-200 transition" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-900">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm sm:text-base text-gray-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-5 sm:p-6">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-900">Catatan:</span>{" "}
                Setelah mengisi form dan melakukan pembayaran, kirim pesanan via WhatsApp
                beserta <span className="font-medium">bukti pembayaran</span>. Admin akan
                memverifikasi dan memproses layanan kamu.
              </p>
            </div>
          </div>
        </motion.section>

        {/* FOUNDER (ringkas) */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-20"
        >
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-gray-200 p-6 sm:p-8
                            hover:border-indigo-200 hover:ring-2 hover:ring-indigo-100 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-500">
                    Founder
                  </p>
                  <h2 className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">
                    Layanan Nusantara
                  </h2>
                </div>

                <span className="inline-flex shrink-0 items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Creative Lead
                </span>
              </div>


              <p className="mt-4 text-gray-600 leading-relaxed">
                <span className="font-semibold text-indigo-600">Abdul Aziz</span> adalah Desainer Grafis dan Web Developer
                dengan pengalaman lebih dari <strong>8 tahun</strong>. Berfokus membantu brand dan bisnis membangun identitas
                visual dan website profesional melalui desain kreatif serta solusi digital modern yang berorientasi pada kualitas dan hasil.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </section>
  )
}
