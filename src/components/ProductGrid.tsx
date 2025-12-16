import ProductCard, { Product } from './ProductCard'

export default function ProductGrid({ items }: { items: Product[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-champagne/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-taupe text-lg">Aucun produit disponible pour le moment.</p>
        <p className="text-taupe/70 text-sm mt-2">Revenez bientôt pour découvrir nos nouveautés !</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.map((p, index) => (
        <ProductCard key={p.id} p={p} index={index} />
      ))}
    </div>
  )
}
