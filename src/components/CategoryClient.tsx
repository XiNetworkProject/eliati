'use client'

import { useState, useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import { useCompare, CompareProduct } from '@/contexts/CompareContext'
import ScrollReveal from '@/components/ScrollReveal'

type Product = {
  id: string
  name: string
  slug: string
  price_cents: number
  compare_at_cents: number | null
  image: string | null
  created_at?: string
}

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'name' | 'promo'

type CategoryClientProps = {
  products: Product[]
  categoryName: string
  categoryDescription?: string | null
}

export default function CategoryClient({ products, categoryName, categoryDescription }: CategoryClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showPromoOnly, setShowPromoOnly] = useState(false)
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare()

  const sortedProducts = useMemo(() => {
    let filtered = [...products]

    // Filtrer les promos uniquement
    if (showPromoOnly) {
      filtered = filtered.filter(
        (p) => p.compare_at_cents && p.compare_at_cents > p.price_cents
      )
    }

    // Trier
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price_cents - b.price_cents)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price_cents - a.price_cents)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'promo':
        filtered.sort((a, b) => {
          const aPromo = a.compare_at_cents && a.compare_at_cents > a.price_cents ? 1 : 0
          const bPromo = b.compare_at_cents && b.compare_at_cents > b.price_cents ? 1 : 0
          return bPromo - aPromo
        })
        break
      case 'recent':
      default:
        // Déjà triés par date
        break
    }

    return filtered
  }, [products, sortBy, showPromoOnly])

  const promoCount = useMemo(() => {
    return products.filter(
      (p) => p.compare_at_cents && p.compare_at_cents > p.price_cents
    ).length
  }, [products])

  const handleCompareToggle = (product: Product) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id)
    } else {
      const compareProduct: CompareProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price_cents: product.price_cents,
        compare_at_cents: product.compare_at_cents,
        image: product.image,
        category_name: categoryName,
      }
      addToCompare(compareProduct)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal animation="fade-down">
        <div className="text-center">
          <h1 className="font-display text-4xl sm:text-5xl text-leather mb-4">{categoryName}</h1>
          {categoryDescription && (
            <p className="text-taupe max-w-2xl mx-auto">{categoryDescription}</p>
          )}
        </div>
      </ScrollReveal>

      {/* Filters & Sort */}
      <ScrollReveal animation="fade-up" delay={100}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gold/20">
          {/* Results count */}
          <p className="text-sm text-taupe">
            <span className="font-semibold text-leather">{sortedProducts.length}</span> produit{sortedProducts.length > 1 ? 's' : ''}
            {showPromoOnly && ' en promotion'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {/* Promo filter */}
            {promoCount > 0 && (
              <button
                onClick={() => setShowPromoOnly(!showPromoOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  showPromoOnly
                    ? 'bg-mauve text-white shadow-lg'
                    : 'bg-white border border-gold/30 text-leather hover:border-gold'
                }`}
              >
                <span className="text-base">🏷️</span>
                Promos ({promoCount})
              </button>
            )}

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 rounded-xl border border-gold/20 bg-white text-leather text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 cursor-pointer"
            >
              <option value="recent">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
              <option value="promo">Promotions d&apos;abord</option>
            </select>
          </div>
        </div>
      </ScrollReveal>

      {/* Products grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((product, index) => (
            <ScrollReveal key={product.id} animation="fade-up" delay={index * 50}>
              <div className="relative group">
                <ProductCard p={product} index={index} />
                
                {/* Compare button overlay */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCompareToggle(product)
                  }}
                  disabled={!isInCompare(product.id) && !canAddMore}
                  className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isInCompare(product.id)
                      ? 'bg-leather text-ivory shadow-lg'
                      : 'bg-white/90 backdrop-blur-sm text-leather border border-gold/30 opacity-0 group-hover:opacity-100 hover:bg-gold/20'
                  } ${!isInCompare(product.id) && !canAddMore ? 'cursor-not-allowed opacity-50' : ''}`}
                  title={isInCompare(product.id) ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal animation="scale-in">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-champagne/30 to-rose/20 flex items-center justify-center">
              <span className="text-5xl">🔍</span>
            </div>
            <h2 className="font-display text-2xl text-leather mb-3">
              Aucun produit trouvé
            </h2>
            <p className="text-taupe max-w-md mx-auto">
              {showPromoOnly 
                ? 'Aucun produit en promotion dans cette catégorie pour le moment.'
                : 'Cette catégorie ne contient pas encore de produits.'}
            </p>
            {showPromoOnly && (
              <button
                onClick={() => setShowPromoOnly(false)}
                className="mt-4 px-6 py-2 rounded-full bg-leather text-ivory hover:bg-leather/90 transition-colors"
              >
                Voir tous les produits
              </button>
            )}
          </div>
        </ScrollReveal>
      )}
    </div>
  )
}

