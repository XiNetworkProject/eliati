'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
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
  return (
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
      </div>
    </header>
  )
}

