'use client'

import BlogUI from '../components/ui/blog/Blog'
import PwaOnly from '../components/guards/PwaOnly'

export default function BlogPage() {
  return (
    <PwaOnly>
      <BlogUI />
    </PwaOnly>
  )
}
