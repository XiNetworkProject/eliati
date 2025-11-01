'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
}

const colors = ['bg-champagne', 'bg-rose', 'bg-mauve', 'bg-taupe']

export default function CategoryTiles() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, image_url')
        .order('name')
      
      setCategories(data || [])
      setLoading(false)
    }
    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-champagne/20 to-rose/10 border border-gold/30 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((cat, idx) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className="group relative overflow-hidden rounded-2xl border border-gold/30 hover:shadow-lg transition-all duration-300"
        >
          <div className="aspect-[4/5] relative bg-gradient-to-br from-champagne/30 to-champagne/10">
            {cat.image_url ? (
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/40 to-gold/20" />
              </div>
            )}
          </div>
          <div
            className={`absolute inset-0 ${colors[idx % colors.length]} opacity-20 group-hover:opacity-30 transition`}
          />
          <div className="absolute inset-x-0 bottom-0 p-3 text-ivory bg-leather/40 backdrop-blur-sm">
            <p className="font-display tracking-wide">{cat.name}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

