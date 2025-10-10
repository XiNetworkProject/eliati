import ProductCard, { Product } from './ProductCard'

export default function ProductGrid({ items }: { items: Product[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-taupe">
        <p>Aucun produit disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  )
}

