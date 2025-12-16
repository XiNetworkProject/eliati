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
    const colorIndex = orderedImages.findIndex((img) => img.color_name === color)
    if (colorIndex !== -1) {
      setActiveIndex(colorIndex)
    }
  }

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
    const img = orderedImages[index]
    if (img?.color_name) {
      setSelectedColor(img.color_name)
    }
  }

  return (
    <div className="space-y-5">
      {/* Sélecteur de coloris */}
      {hasColors && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-leather flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-gold to-gold/50" />
            Coloris : <span className="text-gold font-semibold">{selectedColor}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {colorOptions.map((color) => {
              const colorImage = orderedImages.find((img) => img.color_name === color)
              const variant = variants.find((v) => v.color_name === color)
              const isOutOfStock = variant && variant.stock_quantity <= 0
              const isInactive = variant && !variant.is_active
              const isSelected = selectedColor === color

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => !isInactive && handleColorSelect(color)}
                  disabled={isInactive}
                  className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 transition-all duration-300 ${
                    isInactive
                      ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-300'
                      : isSelected
                        ? 'border-leather bg-gradient-to-br from-champagne/50 to-rose/30 shadow-lg shadow-gold/20'
                        : isOutOfStock
                          ? 'border-red-200 bg-red-50/50 hover:border-red-300'
                          : 'border-gold/20 hover:border-gold/50 bg-white hover:shadow-md'
                  }`}
                >
                  {/* Mini aperçu de l'image */}
                  {colorImage && (
                    <div className={`w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0 transition-transform duration-300 ${
                      isSelected ? 'border-leather scale-110' : isOutOfStock ? 'border-red-300' : 'border-gold/30 group-hover:scale-105'
                    }`}>
                      <Image
                        src={colorImage.url}
                        alt={color}
                        width={32}
                        height={32}
                        className={`object-cover w-full h-full ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-leather'}`}>
                      {color}
                    </span>
                    {/* Badge stock */}
                    {variant && (
                      <span className={`text-[10px] ${
                        isOutOfStock
                          ? 'text-red-500'
                          : variant.stock_quantity <= 5
                            ? 'text-orange-600'
                            : 'text-green-600'
                      }`}>
                        {isOutOfStock ? 'Épuisé' : variant.stock_quantity <= 5 ? `Plus que ${variant.stock_quantity}` : 'En stock'}
                      </span>
                    )}
                  </div>
                  {/* Checkmark */}
                  {isSelected && !isOutOfStock && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-leather flex items-center justify-center shadow-md animate-scale-in">
                      <svg className="w-3 h-3 text-ivory" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
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
        className="aspect-square rounded-3xl overflow-hidden border border-gold/20 relative cursor-zoom-in group bg-gradient-to-br from-champagne/20 to-rose/10 shadow-lg"
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
          className={`object-cover transition-all duration-300 ${
            isZooming ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
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
          <div className="absolute top-4 left-4 bg-leather/90 backdrop-blur-sm text-ivory text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
            ✨ {activeImage.color_name}
          </div>
        )}

        {/* Indicateur de zoom */}
        <div
          className={`absolute bottom-4 right-4 bg-leather/90 backdrop-blur-sm text-ivory text-xs px-3 py-2 rounded-full hidden md:flex items-center gap-2 transition-all duration-300 shadow-lg ${
            isZooming ? 'opacity-0 translate-y-2' : 'opacity-0 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Survoler pour zoomer
        </div>

        {/* Navigation arrows */}
        {orderedImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActiveIndex((prev) => (prev === 0 ? orderedImages.length - 1 : prev - 1))
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-leather flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActiveIndex((prev) => (prev === orderedImages.length - 1 ? 0 : prev + 1))
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-leather flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        {orderedImages.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-leather/90 backdrop-blur-sm text-ivory text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
            {activeIndex + 1} / {orderedImages.length}
          </div>
        )}
      </div>

      {/* Miniatures */}
      {orderedImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {orderedImages.map((img, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={img.url + index}
                type="button"
                onClick={() => handleThumbnailClick(index)}
                className={`group relative flex-shrink-0 aspect-square w-20 sm:w-24 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isActive
                    ? 'border-leather ring-2 ring-leather/30 ring-offset-2 shadow-lg'
                    : 'border-gold/20 hover:border-gold/50 hover:shadow-md'
                }`}
              >
                <Image
                  src={img.url || PLACEHOLDER}
                  alt={img.alt || productName}
                  fill
                  className={`object-cover transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}
                  sizes="96px"
                />
                {/* Overlay on hover */}
                {!isActive && (
                  <div className="absolute inset-0 bg-leather/0 group-hover:bg-leather/10 transition-colors duration-300" />
                )}
                {/* Indicateur de coloris sur la miniature */}
                {img.color_name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-leather/80 to-transparent text-ivory text-[10px] font-medium px-2 py-1.5 text-center truncate">
                    {img.color_name}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
