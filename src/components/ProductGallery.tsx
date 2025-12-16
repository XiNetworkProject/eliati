'use client'

import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'

export type ProductGalleryImage = {
  url: string
  alt?: string | null
  sort_order?: number | null
  color_name?: string | null
}

type ProductVariant = {
  id: string
  color_name: string
  stock_quantity: number
  is_active: boolean
}

type ProductGalleryProps = {
  productName: string
  images?: ProductGalleryImage[] | null
  onColorChange?: (colorName: string | null) => void
  variants?: ProductVariant[]
}

const PLACEHOLDER = '/placeholder.jpg'
const ZOOM_LEVEL = 2.5

export default function ProductGallery({ productName, images, onColorChange, variants = [] }: ProductGalleryProps) {
  const orderedImages = useMemo(() => {
    if (!images || images.length === 0) {
      return [{ url: PLACEHOLDER, alt: productName, sort_order: 0, color_name: null }]
    }

    return [...images]
      .filter((img) => Boolean(img?.url))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }, [images, productName])

  // Extraire les coloris uniques (non-null)
  const colorOptions = useMemo(() => {
    const colors = orderedImages
      .map((img) => img.color_name)
      .filter((color): color is string => Boolean(color))
    return [...new Set(colors)]
  }, [orderedImages])

  const hasColors = colorOptions.length > 0

  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(
    hasColors ? colorOptions[0] : null
  )
  const activeImage = orderedImages[activeIndex] || orderedImages[0]

  // Notifier le parent du coloris sélectionné
  useEffect(() => {
    if (onColorChange) {
      onColorChange(selectedColor)
    }
  }, [selectedColor, onColorChange])

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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    // Trouver la première image avec ce coloris
    const colorIndex = orderedImages.findIndex((img) => img.color_name === color)
    if (colorIndex !== -1) {
      setActiveIndex(colorIndex)
    }
  }

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
    // Si l'image a un coloris, le sélectionner
    const img = orderedImages[index]
    if (img?.color_name) {
      setSelectedColor(img.color_name)
    }
  }

  return (
    <div className="space-y-4">
      {/* Sélecteur de coloris */}
      {hasColors && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-leather">
            Coloris : <span className="text-gold">{selectedColor}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {colorOptions.map((color) => {
              const colorImage = orderedImages.find((img) => img.color_name === color)
              const variant = variants.find((v) => v.color_name === color)
              const isOutOfStock = variant && variant.stock_quantity <= 0
              const isInactive = variant && !variant.is_active

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => !isInactive && handleColorSelect(color)}
                  disabled={isInactive}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                    isInactive
                      ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-300'
                      : selectedColor === color
                        ? 'border-leather bg-leather/10 ring-2 ring-leather/30'
                        : isOutOfStock
                          ? 'border-red-200 bg-red-50/50 hover:border-red-300'
                          : 'border-gold/30 hover:border-leather/50 bg-champagne/20'
                  }`}
                >
                  {/* Mini aperçu de l'image */}
                  {colorImage && (
                    <div className={`w-6 h-6 rounded-full overflow-hidden border flex-shrink-0 ${isOutOfStock ? 'border-red-300' : 'border-gold/30'}`}>
                      <Image
                        src={colorImage.url}
                        alt={color}
                        width={24}
                        height={24}
                        className={`object-cover w-full h-full ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                      />
                    </div>
                  )}
                  <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-leather'}`}>
                    {color}
                  </span>
                  {/* Badge stock */}
                  {variant && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isOutOfStock
                        ? 'bg-red-100 text-red-700'
                        : variant.stock_quantity <= 5
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {isOutOfStock ? 'Rupture' : `${variant.stock_quantity} dispo`}
                    </span>
                  )}
                  {selectedColor === color && !isOutOfStock && (
                    <span className="text-leather">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

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

        {/* Badge coloris sur l'image */}
        {activeImage?.color_name && (
          <div className="absolute top-3 left-3 bg-noir/70 text-champagne text-xs px-2 py-1 rounded-lg">
            {activeImage.color_name}
          </div>
        )}

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

      {/* Miniatures */}
      {orderedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {orderedImages.map((img, index) => (
            <button
              key={img.url + index}
              type="button"
              onClick={() => handleThumbnailClick(index)}
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
              {/* Indicateur de coloris sur la miniature */}
              {img.color_name && (
                <div className="absolute bottom-0 left-0 right-0 bg-noir/70 text-champagne text-[10px] px-1 py-0.5 text-center truncate">
                  {img.color_name}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
