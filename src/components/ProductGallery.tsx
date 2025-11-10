'use client'

import { useMemo, useState } from 'react'
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

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-champagne/30 rounded-2xl overflow-hidden border border-gold/30 relative">
        <Image
          key={activeImage?.url}
          src={activeImage?.url || PLACEHOLDER}
          alt={activeImage?.alt || productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
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
