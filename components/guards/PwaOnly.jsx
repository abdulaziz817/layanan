'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { isPWA } from '../../utils/isPWA'


export default function PwaOnly({ children }) {
  const router = useRouter()

  useEffect(() => {
    if (!isPWA()) {
      router.replace('/') // ⛔ browser → home
    }
  }, [])

  return children
}
