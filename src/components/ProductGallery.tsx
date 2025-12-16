'use client'

import { useMemo, useState, useRef, useCallback } from 'react'
import Image from 'next/image'

export type ProductGalleryImage = {
  url: string
  alt?: string | null
  sort_order?: number | null
}

type ProductGalleryProps = {
  productName: string
  images?: ProductGalleryImage[] | null
}

const PLACEHOLDER = '/placeholder.jpg'
const ZOOM_LEVEL = 2.5

export default function ProductGallery({ productName, images }: ProductGalleryProps) {
  const orderedImages = useMemo(() => {
    if (!images || images.length === 0) {
      return [{ url: PLACEHOLDER, alt: productName, sort_order: 0 }]
    }

    return [...images]
      .filter((img) => Boolean(img?.url))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }, [images, productName])

  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = orderedImages[activeIndex] || orderedImages[0]

  // Zoom state
  const [isZooming, setIsZooming] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomPosition({ x, y })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsZooming(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false)
  }, [])

  return (
    <div className="space-y-4">
      {/* Image principale avec zoom */}
      <div
        ref={containerRef}
        className="aspect-square bg-champagne/30 rounded-2xl overflow-hidden border border-gold/30 relative cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image normale */}
        <Image
          key={activeImage?.url}
          src={activeImage?.url || PLACEHOLDER}
          alt={activeImage?.alt || productName}
          fill
          className={`object-cover transition-opacity duration-200 ${
            isZooming ? 'opacity-0' : 'opacity-100'
          }`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Image zoomée (visible au survol sur PC) */}
        <div
          className={`absolute inset-0 hidden md:block transition-opacity duration-200 ${
            isZooming ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            backgroundImage: `url(${activeImage?.url || PLACEHOLDER})`,
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundSize: `${ZOOM_LEVEL * 100}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Indicateur de zoom (visible au survol) */}
        <div
          className={`absolute bottom-3 right-3 bg-noir/70 text-champagne text-xs px-2 py-1 rounded-lg hidden md:flex items-center gap-1.5 transition-opacity duration-200 ${
            isZooming ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
          Survoler pour zoomer
        </div>
      </div>

      {orderedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {orderedImages.map((img, index) => (
            <button
              key={img.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative flex-shrink-0 aspect-square w-20 rounded-xl border ${
                index === activeIndex
                  ? 'border-leather ring-2 ring-leather/40'
                  : 'border-gold/30 hover:border-leather/50'
              } overflow-hidden transition-all duration-200`}
            >
              <Image
                src={img.url || PLACEHOLDER}
                alt={img.alt || productName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
