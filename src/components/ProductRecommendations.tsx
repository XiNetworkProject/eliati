'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type RecommendedProduct = {
  id: string
  name: string
  slug: string
  price_cents: number
  compare_at_cents: number | null
  image_url: string | null
  average_rating: number | null
  review_count: number | null
}

type ProductRecommendationsProps = {
  productId: string
  categoryId?: string | null
  categoryName?: string | null
  categorySlug?: string | null
}

export default function ProductRecommendations({
  productId,
  categoryId,
  categoryName,
  categorySlug,
}: ProductRecommendationsProps) {
  const [sameCategory, setSameCategory] = useState<RecommendedProduct[]>([])
  const [topRated, setTopRated] = useState<RecommendedProduct[]>([])
  const [randomPicks, setRandomPicks] = useState<RecommendedProduct[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Sauvegarder dans l'historique
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const key = 'recently_viewed'
    const stored = localStorage.getItem(key)
    let history: string[] = stored ? JSON.parse(stored) : []
    
    // Retirer le produit actuel s'il existe déjà
    history = history.filter((id) => id !== productId)
    // Ajouter en premier
    history.unshift(productId)
    // Limiter à 10
    history = history.slice(0, 10)
    
    localStorage.setItem(key, JSON.stringify(history))
  }, [productId])

  // Charger les produits récemment vus
  const loadRecentlyViewed = useCallback(async () => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem('recently_viewed')
    if (!stored) return []
    
    const history: string[] = JSON.parse(stored)
    // Exclure le produit actuel, prendre les 4 premiers
    const otherIds = history.filter((id) => id !== productId).slice(0, 4)
    
    if (otherIds.length === 0) return []
    
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price_cents, compare_at_cents, average_rating, review_count, product_images(url)')
      .in('id', otherIds)
      .eq('status', 'active')
    
    if (!data) return []
    
    // Réordonner selon l'ordre de l'historique
    return otherIds
      .map((id) => data.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({
        id: p!.id,
        name: p!.name,
        slug: p!.slug,
        price_cents: p!.price_cents,
        compare_at_cents: p!.compare_at_cents,
        image_url: p!.product_images?.[0]?.url || null,
        average_rating: p!.average_rating,
        review_count: p!.review_count,
      }))
  }, [productId])

  // Charger les recommandations
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true)
      
      try {
        // Produits de la même catégorie
        if (categoryId) {
          const { data: catProducts } = await supabase
            .from('products')
            .select('id, name, slug, price_cents, compare_at_cents, average_rating, review_count, product_images(url)')
            .eq('category_id', categoryId)
            .neq('id', productId)
            .eq('status', 'active')
            .limit(4)
          
          if (catProducts) {
            setSameCategory(
              catProducts.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price_cents: p.price_cents,
                compare_at_cents: p.compare_at_cents,
                image_url: p.product_images?.[0]?.url || null,
                average_rating: p.average_rating,
                review_count: p.review_count,
              }))
            )
          }
        }
        
        // Produits les mieux notés
        const { data: ratedProducts } = await supabase
          .from('products')
          .select('id, name, slug, price_cents, compare_at_cents, average_rating, review_count, product_images(url)')
          .neq('id', productId)
          .eq('status', 'active')
          .gt('average_rating', 0)
          .order('average_rating', { ascending: false })
          .limit(4)
        
        if (ratedProducts) {
          setTopRated(
            ratedProducts.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price_cents: p.price_cents,
              compare_at_cents: p.compare_at_cents,
              image_url: p.product_images?.[0]?.url || null,
              average_rating: p.average_rating,
              review_count: p.review_count,
            }))
          )
        }

        // Produits aléatoires - on récupère plus et on mélange côté client
        const { data: allProducts } = await supabase
          .from('products')
          .select('id, name, slug, price_cents, compare_at_cents, average_rating, review_count, product_images(url)')
          .neq('id', productId)
          .eq('status', 'active')
          .limit(20)
        
        if (allProducts && allProducts.length > 0) {
          // Mélanger avec Fisher-Yates
          const shuffled = [...allProducts]
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
          }
          
          setRandomPicks(
            shuffled.slice(0, 4).map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price_cents: p.price_cents,
              compare_at_cents: p.compare_at_cents,
              image_url: p.product_images?.[0]?.url || null,
              average_rating: p.average_rating,
              review_count: p.review_count,
            }))
          )
        }
        
        // Produits récemment vus
        const viewed = await loadRecentlyViewed()
        setRecentlyViewed(viewed)
        
      } catch (error) {
        console.error('Erreur chargement recommandations:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadRecommendations()
  }, [productId, categoryId, loadRecentlyViewed])

  const renderStars = (rating: number | null) => {
    const stars = rating ? Math.round(rating) : 0
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${i < stars ? 'text-gold' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const ProductCard = ({ product }: { product: RecommendedProduct }) => {
    const hasDiscount = product.compare_at_cents && product.compare_at_cents > product.price_cents
    const discountPercent = hasDiscount
      ? Math.round(((product.compare_at_cents! - product.price_cents) / product.compare_at_cents!) * 100)
      : 0

    return (
      <Link
        href={`/product/${product.id}`}
        className="group block bg-white rounded-2xl border border-gold/10 overflow-hidden hover:border-gold/30 hover:shadow-lg transition-all duration-300"
      >
        <div className="relative aspect-square bg-champagne/20 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">💎</div>
          )}
          
          {hasDiscount && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-rose text-white text-xs font-medium rounded-full">
              -{discountPercent}%
            </span>
          )}
        </div>
        
        <div className="p-3">
          <h4 className="font-medium text-leather text-sm line-clamp-1 group-hover:text-gold transition-colors">
            {product.name}
          </h4>
          
          {product.average_rating && product.average_rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {renderStars(product.average_rating)}
              <span className="text-xs text-taupe">({product.review_count})</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold text-leather">
              {(product.price_cents / 100).toFixed(2)} €
            </span>
            {hasDiscount && (
              <span className="text-xs text-taupe line-through">
                {(product.compare_at_cents! / 100).toFixed(2)} €
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  const RecommendationSection = ({
    title,
    subtitle,
    icon,
    products,
    viewAllLink,
    viewAllText,
  }: {
    title: string
    subtitle: string
    icon: string
    products: RecommendedProduct[]
    viewAllLink?: string
    viewAllText?: string
  }) => {
    if (products.length === 0) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="font-display text-xl text-leather">{title}</h3>
              <p className="text-sm text-taupe">{subtitle}</p>
            </div>
          </div>
          
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-sm text-gold hover:text-leather transition-colors flex items-center gap-1"
            >
              {viewAllText || 'Voir tout'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 bg-champagne/30 rounded w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="aspect-square bg-champagne/30 rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const hasAnyRecommendations = sameCategory.length > 0 || topRated.length > 0 || randomPicks.length > 0 || recentlyViewed.length > 0

  if (!hasAnyRecommendations) {
    return null
  }

  return (
    <div className="space-y-12">
      {/* Produits de la même catégorie */}
      {categoryName && sameCategory.length > 0 && (
        <RecommendationSection
          title={`Plus de ${categoryName}`}
          subtitle="Découvrez d'autres pièces de cette collection"
          icon="✨"
          products={sameCategory}
          viewAllLink={categorySlug ? `/category/${categorySlug}` : undefined}
          viewAllText="Voir la collection"
        />
      )}

      {/* Produits les mieux notés */}
      {topRated.length > 0 && (
        <RecommendationSection
          title="Les plus appréciés"
          subtitle="Les bijoux préférés de nos clientes"
          icon="⭐"
          products={topRated}
        />
      )}

      {/* Sélection aléatoire */}
      {randomPicks.length > 0 && (
        <RecommendationSection
          title="Vous pourriez aimer"
          subtitle="Une sélection rien que pour vous"
          icon="🎲"
          products={randomPicks}
        />
      )}

      {/* Produits récemment vus */}
      {recentlyViewed.length > 0 && (
        <RecommendationSection
          title="Vus récemment"
          subtitle="Reprenez où vous en étiez"
          icon="👁️"
          products={recentlyViewed}
        />
      )}
    </div>
  )
}

