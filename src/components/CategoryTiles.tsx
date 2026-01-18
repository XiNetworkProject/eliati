'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
}

export type CategoryProduct = {
  id: string
  name: string
  image_url: string | null
}

export type CategoryWithProducts = Category & {
  products: CategoryProduct[]
}

const TRANSITION_INTERVAL = 4000 // 4 secondes entre chaque image

type CategoryTilesProps = {
  initialCategories?: CategoryWithProducts[]
}

export default function CategoryTiles({ initialCategories = [] }: CategoryTilesProps) {
  const [categories, setCategories] = useState<CategoryWithProducts[]>(initialCategories)
  const [loading, setLoading] = useState(initialCategories.length === 0)
  const [activeIndexes, setActiveIndexes] = useState<Record<string, number>>({})

  useEffect(() => {
    if (initialCategories.length > 0) {
      const initialIndexes: Record<string, number> = {}
      initialCategories.forEach((cat) => {
        initialIndexes[cat.id] = 0
      })
      setActiveIndexes(initialIndexes)
      return
    }
    const loadCategoriesWithProducts = async () => {
      // Charger les catégories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, slug, image_url')
        .order('name')

      if (!categoriesData) {
        setLoading(false)
        return
      }

      // Charger les produits pour chaque catégorie
      const categoriesWithProducts: CategoryWithProducts[] = await Promise.all(
        categoriesData.map(async (cat) => {
          const { data: products } = await supabase
            .from('products')
            .select('id, name, product_images(url)')
            .eq('category_id', cat.id)
            .eq('status', 'active')
            .limit(5)

          const productImages: CategoryProduct[] = (products || [])
            .filter((p) => p.product_images && p.product_images.length > 0)
            .map((p) => ({
              id: p.id,
              name: p.name,
              image_url: p.product_images?.[0]?.url || null,
            }))

          return {
            ...cat,
            products: productImages,
          }
        })
      )

      // Initialiser les index actifs
      const initialIndexes: Record<string, number> = {}
      categoriesWithProducts.forEach((cat) => {
        initialIndexes[cat.id] = 0
      })
      setActiveIndexes(initialIndexes)
      setCategories(categoriesWithProducts)
      setLoading(false)
    }

    loadCategoriesWithProducts()
  }, [initialCategories])

  // Rotation automatique des images
  const rotateImages = useCallback(() => {
    setActiveIndexes((prev) => {
      const newIndexes = { ...prev }
      categories.forEach((cat) => {
        if (cat.products.length > 1) {
          newIndexes[cat.id] = (prev[cat.id] + 1) % cat.products.length
        }
      })
      return newIndexes
    })
  }, [categories])

  useEffect(() => {
    if (categories.length === 0) return

    const interval = setInterval(rotateImages, TRANSITION_INTERVAL)
    return () => clearInterval(interval)
  }, [categories, rotateImages])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-champagne/30 to-rose/20 border border-gold/20 animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {categories.map((cat) => {
        const activeIndex = activeIndexes[cat.id] || 0
        const hasProducts = cat.products.length > 0
        const activeProduct = hasProducts ? cat.products[activeIndex] : null

        return (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative overflow-hidden rounded-3xl border border-gold/20 hover:border-gold/50 shadow-lg hover:shadow-xl transition-all duration-500 hover-lift"
          >
            {/* Images container */}
            <div className="aspect-[4/5] relative bg-gradient-to-br from-champagne/30 to-rose/20 overflow-hidden">
              {/* Image de fond (catégorie ou première image produit) */}
              {hasProducts ? (
                <>
                  {/* Toutes les images en position absolue pour le crossfade */}
                  {cat.products.map((product, idx) => (
                    <div
                      key={product.id}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                        idx === activeIndex 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-0 scale-105'
                      }`}
                    >
                      {product.image_url && (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Indicateurs de pagination (si plusieurs images) */}
                  {cat.products.length > 1 && (
                    <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {cat.products.map((_, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            idx === activeIndex 
                              ? 'bg-white w-4' 
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl">💎</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-leather/60 via-leather/10 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />
            </div>

            {/* Category name */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-xl sm:text-2xl text-ivory drop-shadow-lg">
                    {cat.name}
                  </p>
                  {hasProducts && (
                    <p className="text-xs text-ivory/70 mt-0.5">
                      {cat.products.length} produit{cat.products.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                {/* Arrow */}
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <svg className="w-5 h-5 text-ivory" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>

            {/* Badge du produit actif */}
            {activeProduct && (
              <div className="absolute top-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs text-leather font-medium shadow-lg max-w-full">
                  <span className="truncate">{activeProduct.name}</span>
                </div>
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
