'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import ProductGallery, { ProductGalleryImage } from '@/components/ProductGallery'
import ProductConfigurator from '@/components/ProductConfigurator'
import ProductReviews from '@/components/ProductReviews'
import ProductRecommendations, { RecommendedProduct } from '@/components/ProductRecommendations'

type ProductData = {
  id: string
  name: string
  slug: string
  description: string | null
  price_cents: number
  compare_at_cents: number | null
  stock_status: string | null
  stock_quantity: number | null
  preorder_limit: number | null
  preorder_count: number | null
  preorder_available_date: string | null
  weight_grams: number | null
}

type ProductVariant = {
  id: string
  color_name: string
  stock_quantity: number
  low_stock_threshold: number
  price_cents: number | null
  is_active: boolean
}

type ProductPageClientProps = {
  product: ProductData
  categoryId: string | null
  categoryName: string | null
  categorySlug: string | null
  charmOptions: Array<{ label: string; price_cents: number }>
  images: ProductGalleryImage[]
  primaryImage: string
  variants?: ProductVariant[]
  recommendations?: {
    sameCategory: RecommendedProduct[]
    topRated: RecommendedProduct[]
    randomPicks: RecommendedProduct[]
    newArrivals: RecommendedProduct[]
  }
}

export default function ProductPageClient({
  product,
  categoryId,
  categoryName,
  categorySlug,
  charmOptions,
  images,
  primaryImage,
  variants = [],
  recommendations,
}: ProductPageClientProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(() => {
    const firstActive = variants.find((v) => v.is_active && v.stock_quantity > 0)
    return firstActive?.color_name || variants[0]?.color_name || null
  })

  const handleColorChange = useCallback((color: string | null) => {
    setSelectedColor(color)
  }, [])

  const selectedVariant = useMemo(() => {
    if (!selectedColor || variants.length === 0) return null
    return variants.find((v) => v.color_name === selectedColor) || null
  }, [selectedColor, variants])

  const variantStock = useMemo(() => {
    if (!selectedVariant) {
      return {
        quantity: product.stock_quantity,
        status: product.stock_status,
        hasVariants: false,
        variantId: null,
        priceCents: product.price_cents,
      }
    }

    let status: string | null = 'in_stock'
    if (selectedVariant.stock_quantity <= 0) {
      status = 'out_of_stock'
    } else if (selectedVariant.stock_quantity <= selectedVariant.low_stock_threshold) {
      status = 'low_stock'
    }

    return {
      quantity: selectedVariant.stock_quantity,
      status,
      hasVariants: true,
      variantId: selectedVariant.id,
      priceCents: selectedVariant.price_cents ?? product.price_cents,
    }
  }, [selectedVariant, product.stock_quantity, product.stock_status, product.price_cents])

  const currentImage = selectedColor
    ? images.find((img) => img.color_name === selectedColor)?.url || primaryImage
    : primaryImage

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm animate-fade-in">
        <Link href="/" className="text-taupe hover:text-leather transition-colors">
          Accueil
        </Link>
        <span className="text-gold">/</span>
        {categoryName && (
          <>
            <Link 
              href={categorySlug ? `/category/${categorySlug}` : '#'} 
              className="text-taupe hover:text-leather transition-colors"
            >
              {categoryName}
            </Link>
            <span className="text-gold">/</span>
          </>
        )}
        <span className="text-leather font-medium">{product.name}</span>
      </nav>

      {/* Main content */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="animate-fade-in-up">
          <ProductGallery
            productName={product.name}
            images={images}
            onColorChange={handleColorChange}
            variants={variants}
          />
        </div>

        {/* Product info */}
        <div className="animate-fade-in-up stagger-2">
          <ProductConfigurator
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description,
              price_cents: variantStock.priceCents,
              compare_at_cents: product.compare_at_cents,
              stock_status: variantStock.status,
              stock_quantity: variantStock.quantity,
              preorder_limit: product.preorder_limit,
              preorder_count: product.preorder_count,
              preorder_available_date: product.preorder_available_date,
              weight_grams: product.weight_grams,
            }}
            categoryName={categoryName}
            charmOptions={charmOptions}
            primaryImage={currentImage}
            selectedColor={selectedColor}
            variantId={variantStock.variantId}
            hasVariants={variantStock.hasVariants}
          />
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gold/20 animate-fade-in-up stagger-3">
        {[
          { icon: '🚚', title: 'Livraison offerte', subtitle: 'Dès 50€' },
          { icon: '↩️', title: 'Retours gratuits', subtitle: '30 jours' },
          { icon: '🛡️', title: 'Garantie 2 ans', subtitle: 'Qualité premium' },
          { icon: '💎', title: 'Acier 316L', subtitle: 'Hypoallergénique' },
        ].map((badge, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 border border-gold/10 hover:border-gold/30 transition-all duration-300"
          >
            <span className="text-2xl">{badge.icon}</span>
            <div>
              <p className="text-sm font-medium text-leather">{badge.title}</p>
              <p className="text-xs text-taupe">{badge.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews section */}
      <div className="pt-12 border-t border-gold/20">
        <ProductReviews productId={product.id} productName={product.name} />
      </div>

      {/* Recommendations section */}
      <div className="pt-12 border-t border-gold/20">
        <ProductRecommendations
          productId={product.id}
          categoryId={categoryId}
          categoryName={categoryName}
          categorySlug={categorySlug}
          initialSameCategory={recommendations?.sameCategory}
          initialTopRated={recommendations?.topRated}
          initialRandomPicks={recommendations?.randomPicks}
          initialNewArrivals={recommendations?.newArrivals}
        />
      </div>
    </div>
  )
}
