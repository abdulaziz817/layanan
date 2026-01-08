'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function BlogDetail() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState(null)

  useEffect(() => {
    fetch('/data/blogData.json')
      .then(res => res.json())
      .then(data => {
        const found = data.find(b => b.id == params.id)
        setBlog(found)
      })
  }, [params.id])

  if (!blog) return <p className="pt-24 text-center">Loading blog...</p>

  return (
    <main className="max-w-4xl mx-auto px-6 py-24">
      <button
        onClick={() => router.push('/blog')}
        className="mb-6 text-sm text-gray-600 hover:underline"
      >
        ← Kembali
      </button>

      <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
      <p className="text-sm text-gray-500 mt-2">{blog.date}</p>

      <span className="inline-block mt-3 text-xs bg-gray-300 px-3 py-1 rounded">
        {blog.category}
      </span>

      <article className="mt-8 text-gray-800 leading-relaxed space-y-4">
        {blog.content}
      </article>
    </main>
  )
}
