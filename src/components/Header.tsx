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
  { href: '/new', label: 'Nouveautés' },
  { href: '/sale', label: 'Promos' },
]

export default function Header() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gold/30 bg-ivory/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="hidden md:flex gap-6">
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
          </nav>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-champagne/20 rounded-lg transition-colors"
            aria-label="Panier"
          >
            <svg className="w-6 h-6 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-leather text-ivory text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

