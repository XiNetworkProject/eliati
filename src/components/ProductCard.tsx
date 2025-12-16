'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type Product = {
  id: string
  name: string
  slug: string
  price_cents: number
  compare_at_cents?: number | null
  image?: string | null
  is_new?: boolean
}

// Mini composant pour les étoiles
function MiniStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'text-gold fill-gold' : 'text-gold/30'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        </svg>
      ))}
    </div>
  )
}

export default function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null)
  
  const price = (p.price_cents / 100).toFixed(2).replace('.', ',')
  const compare = p.compare_at_cents
    ? (p.compare_at_cents / 100).toFixed(2).replace('.', ',')
    : null
  
  const hasPromo = compare && p.compare_at_cents && p.compare_at_cents > p.price_cents
  const discount = hasPromo 
    ? Math.round((1 - p.price_cents / (p.compare_at_cents || 1)) * 100)
    : 0

  // Charger la note moyenne
  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', p.id)
        .eq('is_approved', true)

      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
        setRating({ average: avg, count: data.length })
      }
    }
    fetchRating()
  }, [p.id])

  return (
    <Link
      href={`/product/${p.id}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-elegant hover-lift">
        {/* Image container */}
        <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-champagne/20 to-rose/10">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {p.is_new && (
              <span className="badge-new animate-fade-in">
                Nouveau
              </span>
            )}
            {hasPromo && (
              <span className="badge-promo animate-fade-in">
                -{discount}%
              </span>
            )}
          </div>

          {/* Image */}
          <Image
            src={p.image ?? '/placeholder.jpg'}
            alt={p.name}
            fill
            className={`object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-shimmer" />
          )}

          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-leather/60 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Quick view button */}
          <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <span className="block w-full py-2.5 px-4 bg-ivory/95 backdrop-blur-sm text-leather text-sm font-semibold text-center rounded-xl shadow-lg border border-gold/20">
              Voir le produit
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-display text-lg text-leather line-clamp-2 group-hover:text-gold transition-colors duration-300">
            {p.name}
          </h3>

          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-1.5">
              <MiniStars rating={Math.round(rating.average)} />
              <span className="text-xs text-taupe">({rating.count})</span>
            </div>
          )}
          
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-semibold ${hasPromo ? 'text-mauve' : 'text-leather'}`}>
              {price} €
            </span>
            {compare && hasPromo && (
              <span className="text-sm text-taupe/70 line-through">
                {compare} €
              </span>
            )}
          </div>

          {/* Decorative line */}
          <div className={`h-0.5 bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0 transition-all duration-500 ${
            isHovered ? 'w-full' : 'w-0'
          }`} />
        </div>
      </div>
    </Link>
  )
}
