'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import SearchBar from '@/components/SearchBar'
import ScrollReveal from '@/components/ScrollReveal'

type SearchResult = {
  id: string
  name: string
  slug: string
  price_cents: number
  compare_at_cents: number | null
  image: string | null
  is_new: boolean
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent')

  useEffect(() => {
    const searchProducts = async () => {
      if (!query || query.length < 2) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const { data } = await supabase
          .from('products')
          .select('id, name, slug, price_cents, compare_at_cents, created_at, product_images(url)')
          .eq('status', 'active')
          .ilike('name', `%${query}%`)
          .order('created_at', { ascending: false })

        const mapped: SearchResult[] = (data || []).map((p, index) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price_cents: p.price_cents,
          compare_at_cents: p.compare_at_cents,
          image: p.product_images?.[0]?.url || null,
          is_new: index < 4,
        }))

        // Tri
        if (sortBy === 'price-asc') {
          mapped.sort((a, b) => a.price_cents - b.price_cents)
        } else if (sortBy === 'price-desc') {
          mapped.sort((a, b) => b.price_cents - a.price_cents)
        }

        setResults(mapped)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchProducts()
  }, [query, sortBy])

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Search header */}
        <ScrollReveal animation="fade-down">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl sm:text-5xl text-leather mb-6">
              Recherche
            </h1>
            <div className="max-w-xl mx-auto">
              <SearchBar variant="page" autoFocus />
            </div>
          </div>
        </ScrollReveal>

        {/* Results */}
        {query && query.length >= 2 && (
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-taupe">
                  {isLoading ? (
                    'Recherche en cours...'
                  ) : (
                    <>
                      <span className="font-semibold text-leather">{results.length}</span>
                      {' '}résultat{results.length > 1 ? 's' : ''} pour{' '}
                      <span className="font-semibold text-leather">&quot;{query}&quot;</span>
                    </>
                  )}
                </p>

                {/* Sort */}
                {results.length > 1 && (
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 rounded-xl border border-gold/20 bg-white text-leather text-sm focus:outline-none focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                  </select>
                )}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-champagne/20 to-rose/10 animate-pulse" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {results.map((product, index) => (
              <ScrollReveal key={product.id} animation="fade-up" delay={index * 50}>
                <ProductCard p={product} index={index} />
              </ScrollReveal>
            ))}
          </div>
        ) : query && query.length >= 2 ? (
          <ScrollReveal animation="scale-in">
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-champagne/30 to-rose/20 flex items-center justify-center">
                <span className="text-5xl">🔍</span>
              </div>
              <h2 className="font-display text-2xl text-leather mb-3">
                Aucun résultat
              </h2>
              <p className="text-taupe max-w-md mx-auto mb-8">
                Nous n&apos;avons pas trouvé de bijou correspondant à &quot;{query}&quot;. 
                Essayez avec d&apos;autres mots-clés.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Collier', 'Bague', 'Bracelet', 'Boucles'].map((suggestion) => (
                  <a
                    key={suggestion}
                    href={`/search?q=${suggestion}`}
                    className="px-4 py-2 rounded-full bg-champagne/20 text-leather hover:bg-champagne/30 transition-colors text-sm"
                  >
                    {suggestion}
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal animation="scale-in">
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-champagne/30 to-rose/20 flex items-center justify-center animate-float">
                <span className="text-5xl">✨</span>
              </div>
              <h2 className="font-display text-2xl text-leather mb-3">
                Que recherchez-vous ?
              </h2>
              <p className="text-taupe max-w-md mx-auto mb-8">
                Tapez le nom d&apos;un bijou pour commencer votre recherche
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Collier doré', 'Bague fine', 'Bracelet charm', 'Boucles perles'].map((suggestion) => (
                  <a
                    key={suggestion}
                    href={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="px-4 py-2 rounded-full bg-champagne/20 text-leather hover:bg-champagne/30 transition-colors text-sm"
                  >
                    {suggestion}
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
