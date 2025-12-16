'use client'

import { useCompare } from '@/contexts/CompareContext'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function CompareBar() {
  const { items, removeFromCompare, clearCompare } = useCompare()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-ivory/95 backdrop-blur-lg border-t border-gold/30 shadow-2xl shadow-leather/10 animate-fade-in-up">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Title */}
          <div className="flex-shrink-0">
            <p className="text-sm font-medium text-leather">Comparer</p>
            <p className="text-xs text-taupe">{items.length}/3 produits</p>
          </div>

          {/* Products */}
          <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative flex-shrink-0 group"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-champagne/30 to-rose/20 border border-gold/20 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl">💎</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFromCompare(item.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 3 - items.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-gold/30 flex items-center justify-center flex-shrink-0"
              >
                <span className="text-xs text-taupe/50">+</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clearCompare}
              className="px-3 py-2 text-sm text-taupe hover:text-red-600 transition-colors"
            >
              Effacer
            </button>
            <Link
              href="/compare"
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                items.length >= 2
                  ? 'bg-leather text-ivory hover:bg-leather/90 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
              onClick={(e) => items.length < 2 && e.preventDefault()}
            >
              Comparer ({items.length})
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

