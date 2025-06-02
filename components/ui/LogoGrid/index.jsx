'use client'

import { motion } from 'framer-motion'
import { Brush, Code, Camera } from 'lucide-react'

const layanan = [
  {
    icon: Brush,
    title: "Desain Grafis",
    desc: "Visual kreatif untuk branding dan digital.",
  },
  {
    icon: Code,
    title: "Web Development",
    desc: "Website modern dan responsif.",
  },
  {
    icon: Camera,
    title: "Preset Fotografi",
    desc: "Foto berkualitas dengan editing menarik.",
  },
]

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

const IconGrid = () => {
  return (
    <section className="mt-20 py-16 px-4 max-w-6xl mx-auto">
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
        className="grid grid-cols-1 md:grid-cols-3 gap-10"
      >
        {layanan.map((item, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ scale: 1.03 }}
            className="group relative bg-white border border-gray-200 rounded-3xl p-8 text-center transition-all duration-700 ease-in-out shadow-lg hover:shadow-[0_10px_40px_rgba(99,102,241,0.5)]"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 transition-colors duration-500 shadow-md">
                <item.icon className="w-9 h-9 text-black" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-wide transition-colors duration-500">
              {item.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed transition-colors duration-500">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

export default IconGrid
