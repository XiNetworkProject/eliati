'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

type SearchResult = {
  id: string
  name: string
  slug: string
  price_cents: number
  image_url: string | null
  category_name: string | null
}

type SearchBarProps = {
  onClose?: () => void
  autoFocus?: boolean
  variant?: 'header' | 'page'
}

export default function SearchBar({ onClose, autoFocus = false, variant = 'header' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounced search
  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price_cents, product_images(url), categories(name)')
        .eq('status', 'active')
        .ilike('name', `%${searchQuery}%`)
        .limit(6)

      const mapped: SearchResult[] = (data || []).map((p) => {
        // categories peut être un objet ou un tableau selon la relation
        const category = Array.isArray(p.categories) ? p.categories[0] : p.categories
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price_cents: p.price_cents,
          image_url: p.product_images?.[0]?.url || null,
          category_name: category?.name || null,
        }
      })

      setResults(mapped)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchProducts])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/product/${results[selectedIndex].id}`)
        setIsOpen(false)
        onClose?.()
      } else if (query.length >= 2) {
        router.push(`/search?q=${encodeURIComponent(query)}`)
        setIsOpen(false)
        onClose?.()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      onClose?.()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
      onClose?.()
    }
  }

  const isPageVariant = variant === 'page'

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un bijou..."
            autoFocus={autoFocus}
            className={`w-full pl-12 pr-4 bg-white border border-gold/20 text-leather placeholder:text-taupe/60 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all ${
              isPageVariant 
                ? 'py-4 text-lg rounded-2xl shadow-lg' 
                : 'py-3 text-sm rounded-xl'
            }`}
          />
          <svg
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-taupe ${isPageVariant ? 'w-6 h-6' : 'w-5 h-5'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          )}
        </div>
      </form>

      {/* Results dropdown */}
      {isOpen && query.length >= 2 && (
        <div className={`absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gold/20 overflow-hidden z-50 ${
          isPageVariant ? 'top-full' : ''
        }`}>
          {results.length > 0 ? (
            <>
              <ul className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <li key={result.id}>
                    <Link
                      href={`/product/${result.id}`}
                      onClick={() => {
                        setIsOpen(false)
                        onClose?.()
                      }}
                      className={`flex items-center gap-4 p-4 transition-colors ${
                        index === selectedIndex
                          ? 'bg-champagne/30'
                          : 'hover:bg-champagne/20'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-champagne/30 to-rose/20 border border-gold/20 overflow-hidden flex-shrink-0">
                        {result.image_url ? (
                          <Image
                            src={result.image_url}
                            alt={result.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xl">💎</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-leather truncate">
                          {result.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {result.category_name && (
                            <span className="text-xs text-taupe">
                              {result.category_name}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-gold">
                            {(result.price_cents / 100).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => {
                  setIsOpen(false)
                  onClose?.()
                }}
                className="block p-4 text-center text-sm font-medium text-leather bg-champagne/10 hover:bg-champagne/20 transition-colors border-t border-gold/20"
              >
                Voir tous les résultats pour &quot;{query}&quot;
              </Link>
            </>
          ) : !isLoading ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-3 block">🔍</span>
              <p className="text-taupe">
                Aucun résultat pour &quot;{query}&quot;
              </p>
              <p className="text-xs text-taupe/70 mt-1">
                Essayez avec d&apos;autres mots-clés
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
