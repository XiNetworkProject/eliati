'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import CartDrawer from './CartDrawer'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/category/colliers', label: 'Colliers' },
  { href: '/category/boucles', label: "Boucles d'oreille" },
  { href: '/category/bagues', label: 'Bagues' },
  { href: '/category/bracelets', label: 'Bracelets' },
]

export default function Header() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gold/30 bg-ivory/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4 md:gap-8">
            <button
              className="md:hidden p-2 rounded-lg border border-gold/20 text-leather hover:bg-champagne/20 transition"
              aria-label="Menu"
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <nav className="hidden md:flex gap-6 items-center">
              {NAV.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className={cn(
                    'text-sm tracking-wide transition-colors',
                    pathname === i.href
                      ? 'text-leather font-semibold'
                      : 'text-taupe hover:text-leather'
                  )}
                >
                  {i.label}
                </Link>
              ))}

              <Link
                href="/new"
                className={cn(
                  'ml-4 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border',
                  pathname === '/new'
                    ? 'bg-leather text-ivory border-leather shadow-lg shadow-leather/30'
                    : 'bg-gradient-to-r from-gold/20 to-rose/20 text-leather border-gold/40 hover:from-gold/40 hover:to-rose/40 hover:shadow-lg hover:shadow-gold/20'
                )}
              >
                Nouveautés
              </Link>
            </nav>

            {/* Bouton panier élégant */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative p-3 hover:bg-champagne/20 rounded-xl transition-all duration-200 border border-transparent hover:border-gold/30"
              aria-label="Panier"
            >
              <svg className="w-7 h-7 text-leather group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-leather to-leather/90 text-ivory text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-ivory animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      {/* Menu mobile */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity md:hidden',
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={() => setIsMenuOpen(false)}
      />
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-full max-w-xs bg-ivory shadow-2xl z-40 p-6 flex flex-col gap-6 transition-transform md:hidden',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg border border-gold/20 hover:bg-champagne/20 transition"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          {NAV.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                'px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200',
                pathname === i.href
                  ? 'bg-leather text-ivory border-leather shadow-md'
                  : 'bg-white border-gold/30 text-leather hover:bg-champagne/20'
              )}
            >
              {i.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/new"
          onClick={() => setIsMenuOpen(false)}
          className={cn(
            'px-4 py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 border',
            pathname === '/new'
              ? 'bg-leather text-ivory border-leather shadow-lg shadow-leather/30'
              : 'bg-gradient-to-r from-gold/20 to-rose/20 text-leather border-gold/40 hover:from-gold/40 hover:to-rose/40 hover:shadow-lg hover:shadow-gold/20'
          )}
        >
          Nouveautés
        </Link>

        <div className="mt-auto pt-6 border-t border-gold/20 text-xs text-taupe">
          <p>Découvrez toutes nos collections et nouveautés.</p>
        </div>
      </aside>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

