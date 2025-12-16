'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export type Product = {
  id: string
  name: string
  slug: string
  price_cents: number
  compare_at_cents?: number | null
  image?: string | null
  is_new?: boolean
}

export default function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const price = (p.price_cents / 100).toFixed(2).replace('.', ',')
  const compare = p.compare_at_cents
    ? (p.compare_at_cents / 100).toFixed(2).replace('.', ',')
    : null
  
  const hasPromo = compare && p.compare_at_cents && p.compare_at_cents > p.price_cents
  const discount = hasPromo 
    ? Math.round((1 - p.price_cents / (p.compare_at_cents || 1)) * 100)
    : 0

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
