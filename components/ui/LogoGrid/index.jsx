'use client'

import { motion } from 'framer-motion'
import { Brush, Code, Camera, Star, Video } from 'lucide-react'

const layanan = [
  {
    icon: Brush,
    title: 'Desain Grafis',
    desc: 'Visual kreatif untuk kebutuhan branding dan konten digital.',
  },
  {
    icon: Code,
    title: 'Web Development',
    desc: 'Website modern, responsif, dan siap digunakan untuk bisnis.',
  },
  {
    icon: Video,
    title: 'Digital Video Editing',
    desc: 'Editing video untuk konten, promosi, dan kebutuhan branding.',
  },
  {
    icon: Camera,
    title: 'Preset Fotografi',
    desc: 'Preset dan editing foto dengan tone yang konsisten dan estetik.',
  },
  {
    icon: Star,
    title: 'Aplikasi Premium',
    desc: 'Akses aplikasi premium untuk hiburan dan produktivitas digital.',
  },
]

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
}

const IconGrid = () => {
  return (
    <section className="mt-20 py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-gray-800 mb-14"
        >
          Kenapa Harus Pilih Layanan Ini?
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8"
        >
          {layanan.map((item, index) => {
            const isLastRowCentered = index === 3 || index === 4

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className={[
                  'group relative bg-white border border-gray-200 rounded-[28px] p-8 text-center',
                  'transition-all duration-500 shadow-md hover:shadow-xl hover:border-indigo-200',
                  'min-h-[250px] flex flex-col justify-start',
                  index < 3 ? 'lg:col-span-2' : '',
                  isLastRowCentered && index === 3 ? 'lg:col-start-2 lg:col-span-2' : '',
                  isLastRowCentered && index === 4 ? 'lg:col-start-4 lg:col-span-2' : '',
                ].join(' ')}
              >
                <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-indigo-50 transition duration-300 shadow-sm">
                    <item.icon className="w-8 h-8 text-gray-700 group-hover:text-indigo-600 transition-colors duration-300" />
                  </div>
                </div>

               <h3 className="text-xl font-semibold text-gray-800 mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-[15px] leading-8">
                  {item.desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default IconGrid