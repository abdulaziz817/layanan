'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation' // <- next/navigation buat app dir
import { isPWA } from '../../utils/isPWA' // pastikan path ini benar

export default function PwaOnly({ children }) {
  const router = useRouter()

  useEffect(() => {
    if (!isPWA()) {
      router.replace('/') // ⛔ browser → home
    }
  }, [router])

  return children
}
