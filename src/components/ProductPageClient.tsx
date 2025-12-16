'use client'

import { useState, useCallback, useMemo } from 'react'
import ProductGallery, { ProductGalleryImage } from '@/components/ProductGallery'
import ProductConfigurator from '@/components/ProductConfigurator'

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
  categoryName: string | null
  charmOptions: Array<{ label: string; price_cents: number }>
  images: ProductGalleryImage[]
  primaryImage: string
  variants?: ProductVariant[]
}

export default function ProductPageClient({
  product,
  categoryName,
  charmOptions,
  images,
  primaryImage,
  variants = [],
}: ProductPageClientProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(() => {
    // Sélectionner la première variante active par défaut
    const firstActive = variants.find((v) => v.is_active && v.stock_quantity > 0)
    return firstActive?.color_name || variants[0]?.color_name || null
  })

  const handleColorChange = useCallback((color: string | null) => {
    setSelectedColor(color)
  }, [])

  // Trouver la variante sélectionnée
  const selectedVariant = useMemo(() => {
    if (!selectedColor || variants.length === 0) return null
    return variants.find((v) => v.color_name === selectedColor) || null
  }, [selectedColor, variants])

  // Déterminer le stock et statut basé sur la variante
  const variantStock = useMemo(() => {
    if (!selectedVariant) {
      // Pas de variantes = utiliser le stock du produit global
      return {
        quantity: product.stock_quantity,
        status: product.stock_status,
        hasVariants: false,
        variantId: null,
        priceCents: product.price_cents,
      }
    }

    // Avec variante
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

  // Trouver l'image correspondant au coloris sélectionné pour le panier
  const currentImage = selectedColor
    ? images.find((img) => img.color_name === selectedColor)?.url || primaryImage
    : primaryImage

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Galerie d'images avec sélecteur de coloris */}
      <ProductGallery
        productName={product.name}
        images={images}
        onColorChange={handleColorChange}
        variants={variants}
      />

      {/* Informations produit + personnalisation */}
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
  )
}
