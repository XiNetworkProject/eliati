'use client'
import { useState, useEffect } from 'react'
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
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header 
        className={cn(
          'sticky top-0 z-40 transition-all duration-500',
          isScrolled 
            ? 'bg-ivory/95 backdrop-blur-lg shadow-lg shadow-leather/5 border-b border-gold/20' 
            : 'bg-transparent border-b border-gold/10'
        )}
      >
        <div className="mx-auto max-w-6xl px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover-scale">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-full',
                  'animate-fade-in',
                  pathname === item.href
                    ? 'text-leather'
                    : 'text-taupe hover:text-leather'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.label}
                {/* Active indicator */}
                <span className={cn(
                  'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gold rounded-full transition-all duration-300',
                  pathname === item.href ? 'w-6' : 'w-0'
                )} />
              </Link>
            ))}

            {/* Divider */}
            <div className="w-px h-6 bg-gold/30 mx-2" />

            {/* CTA Buttons */}
            <Link
              href="/info/charms-personnalises"
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 animate-fade-in',
                pathname === '/info/charms-personnalises'
                  ? 'bg-gold text-white border-gold shadow-lg shadow-gold/30'
                  : 'border-gold/40 text-leather hover:border-gold hover:bg-gold/10'
              )}
              style={{ animationDelay: '0.4s' }}
            >
              ✨ Charms
            </Link>

            <Link
              href="/new"
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 animate-fade-in btn-premium',
                pathname === '/new'
                  ? 'bg-leather text-ivory shadow-lg shadow-leather/30'
                  : 'bg-gradient-to-r from-leather to-leather/90 text-ivory hover:shadow-lg hover:shadow-leather/20'
              )}
              style={{ animationDelay: '0.5s' }}
            >
              Nouveautés
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl border border-gold/20 text-leather hover:bg-champagne/20 transition-all duration-300"
              aria-label="Menu"
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={cn(
                  'w-full h-0.5 bg-leather rounded-full transition-all duration-300 origin-left',
                  isMenuOpen && 'rotate-45 translate-y-0.5'
                )} />
                <span className={cn(
                  'w-full h-0.5 bg-leather rounded-full transition-all duration-300',
                  isMenuOpen && 'opacity-0'
                )} />
                <span className={cn(
                  'w-full h-0.5 bg-leather rounded-full transition-all duration-300 origin-left',
                  isMenuOpen && '-rotate-45 -translate-y-0.5'
                )} />
              </div>
            </button>

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative w-12 h-12 flex items-center justify-center rounded-xl hover:bg-champagne/20 transition-all duration-300 border border-transparent hover:border-gold/30"
              aria-label="Panier"
            >
              <svg 
                className="w-6 h-6 text-leather transition-transform duration-300 group-hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
              </svg>
              
              {/* Cart badge */}
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[24px] h-6 px-1.5 bg-gradient-to-br from-gold to-gold/80 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-gold/30 border-2 border-ivory animate-scale-in">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-leather/40 backdrop-blur-sm transition-all duration-500 lg:hidden',
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-full max-w-sm bg-ivory shadow-2xl z-40 flex flex-col transition-transform duration-500 ease-out lg:hidden',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <Logo />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gold/20 hover:bg-champagne/20 transition-all duration-300"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-3">
          {NAV.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                'block px-5 py-4 rounded-2xl text-base font-medium transition-all duration-300',
                pathname === item.href
                  ? 'bg-leather text-ivory shadow-lg shadow-leather/20'
                  : 'bg-white text-leather border border-gold/20 hover:border-gold/40 hover:shadow-md'
              )}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: isMenuOpen ? 'slideInLeft 0.4s ease-out forwards' : 'none'
              }}
            >
              {item.label}
            </Link>
          ))}

          <div className="divider-gold my-6" />

          <Link
            href="/info/charms-personnalises"
            onClick={() => setIsMenuOpen(false)}
            className={cn(
              'block px-5 py-4 rounded-2xl text-base font-semibold text-center transition-all duration-300 border-2',
              pathname === '/info/charms-personnalises'
                ? 'bg-gold text-white border-gold shadow-lg shadow-gold/30'
                : 'bg-white text-leather border-gold/30 hover:border-gold hover:bg-gold/10'
            )}
          >
            ✨ Charms personnalisés
          </Link>

          <Link
            href="/new"
            onClick={() => setIsMenuOpen(false)}
            className={cn(
              'block px-5 py-4 rounded-2xl text-base font-semibold text-center transition-all duration-300',
              pathname === '/new'
                ? 'bg-leather text-ivory shadow-lg shadow-leather/30'
                : 'bg-gradient-to-r from-leather to-leather/90 text-ivory hover:shadow-lg hover:shadow-leather/20'
            )}
          >
            🌟 Nouveautés
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gold/20 bg-champagne/10">
          <p className="text-sm text-taupe text-center">
            Bijoux pensés à quatre mains, faits pour durer.
          </p>
        </div>
      </aside>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
