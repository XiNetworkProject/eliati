'use client'

import { useCompare } from '@/contexts/CompareContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ScrollReveal from '@/components/ScrollReveal'

export default function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompare()

  const formatPrice = (cents: number) => (cents / 100).toFixed(2).replace('.', ',')

  const getDiscount = (price: number, compare: number | null) => {
    if (!compare || compare <= price) return null
    return Math.round((1 - price / compare) * 100)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-16">
          <ScrollReveal animation="scale-in">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-champagne/30 to-rose/20 flex items-center justify-center animate-float">
                <svg className="w-16 h-16 text-leather/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="font-display text-4xl text-leather mb-4">Aucun produit à comparer</h1>
              <p className="text-taupe mb-8 max-w-md mx-auto">
                Ajoutez des produits à comparer depuis les pages catégories en cliquant sur l&apos;icône de comparaison.
              </p>
              <Link href="/">
                <Button className="bg-leather text-ivory hover:bg-leather/90 px-8">
                  Découvrir nos bijoux
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Header */}
        <ScrollReveal animation="fade-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-leather">Comparateur</h1>
              <p className="text-taupe mt-2">{items.length} produit{items.length > 1 ? 's' : ''} sélectionné{items.length > 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={clearCompare}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Tout effacer
            </button>
          </div>
        </ScrollReveal>

        {/* Comparison table */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Products row */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
                {items.map((item, index) => (
                  <div key={item.id} className="card-elegant p-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Image */}
                    <Link href={`/product/${item.id}`}>
                      <div className="aspect-square rounded-2xl bg-gradient-to-br from-champagne/30 to-rose/20 overflow-hidden mb-4 img-zoom">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl">💎</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Name */}
                    <Link href={`/product/${item.id}`}>
                      <h3 className="font-display text-xl text-leather hover:text-gold transition-colors line-clamp-2 mb-2">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Category */}
                    {item.category_name && (
                      <p className="text-xs text-taupe mb-3">{item.category_name}</p>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className={`text-2xl font-bold ${getDiscount(item.price_cents, item.compare_at_cents) ? 'text-mauve' : 'text-leather'}`}>
                        {formatPrice(item.price_cents)} €
                      </span>
                      {item.compare_at_cents && item.compare_at_cents > item.price_cents && (
                        <>
                          <span className="text-sm text-taupe/60 line-through">
                            {formatPrice(item.compare_at_cents)} €
                          </span>
                          <span className="badge-promo">
                            -{getDiscount(item.price_cents, item.compare_at_cents)}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* CTA */}
                    <Link href={`/product/${item.id}`}>
                      <Button className="w-full bg-leather text-ivory hover:bg-leather/90">
                        Voir le produit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Comparison details */}
              <div className="mt-8 space-y-4">
                {/* Price comparison */}
                <div className="p-6 bg-white/50 rounded-2xl border border-gold/20">
                  <h3 className="font-display text-xl text-leather mb-4">💰 Comparaison des prix</h3>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
                    {items.map((item) => {
                      const cheapest = Math.min(...items.map((i) => i.price_cents))
                      const isCheapest = item.price_cents === cheapest
                      const diff = item.price_cents - cheapest

                      return (
                        <div key={item.id} className="text-center">
                          <p className={`text-lg font-bold ${isCheapest ? 'text-green-600' : 'text-leather'}`}>
                            {formatPrice(item.price_cents)} €
                          </p>
                          {isCheapest ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                              <span>✓</span> Le moins cher
                            </span>
                          ) : (
                            <span className="text-xs text-taupe mt-1">
                              +{formatPrice(diff)} €
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Promo comparison */}
                <div className="p-6 bg-white/50 rounded-2xl border border-gold/20">
                  <h3 className="font-display text-xl text-leather mb-4">🏷️ Promotions</h3>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
                    {items.map((item) => {
                      const discount = getDiscount(item.price_cents, item.compare_at_cents)
                      return (
                        <div key={item.id} className="text-center">
                          {discount ? (
                            <p className="text-lg font-bold text-mauve">-{discount}%</p>
                          ) : (
                            <p className="text-sm text-taupe">Pas de promo</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Add more products hint */}
        {items.length < 3 && (
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="mt-8 p-6 bg-champagne/10 rounded-2xl border border-gold/20 text-center">
              <p className="text-taupe">
                Vous pouvez ajouter jusqu&apos;à <strong className="text-leather">{3 - items.length}</strong> produit{3 - items.length > 1 ? 's' : ''} de plus pour comparer.
              </p>
              <Link href="/" className="inline-flex items-center gap-2 text-leather font-medium mt-2 hover:text-gold transition-colors">
                Parcourir les produits
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        )}
      </main>
      <Footer />
    </div>
  )
}

