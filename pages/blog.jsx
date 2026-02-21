'use client'

import { motion } from 'framer-motion'
import BlogUI from '../components/ui/blog/Blog'

export default function BlogPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <BlogUI />
    </motion.div>
  )
}