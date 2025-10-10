import Link from 'next/link'
import Image from 'next/image'

export type Product = {
  id: string
  name: string
  slug: string
  price_cents: number
  compare_at_cents?: number | null
  image?: string | null
}

export default function ProductCard({ p }: { p: Product }) {
  const price = (p.price_cents / 100).toFixed(2).replace('.', ',')
  const compare = p.compare_at_cents
    ? (p.compare_at_cents / 100).toFixed(2).replace('.', ',')
    : null

  return (
    <Link
      href={`/product/${p.id}`}
      className="group rounded-2xl border border-gold/30 overflow-hidden bg-white transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square bg-champagne/30 relative">
        <Image
          src={p.image ?? '/placeholder.jpg'}
          alt={p.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>
      <div className="p-3">
        <h3 className="font-display text-lg line-clamp-2">{p.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold">{price} €</span>
          {compare && (
            <span className="text-sm text-taupe line-through">
              {compare} €
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

