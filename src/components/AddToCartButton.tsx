'use client'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'

type AddToCartButtonProps = {
  product: {
    id: string
    name: string
    slug: string
    price_cents: number
    image?: string
    weight_grams?: number | null
  }
  className?: string
}

export default function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price_cents / 100,
      image: product.image,
      weight: product.weight_grams ?? 0,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      onClick={handleAddToCart}
      className={`relative overflow-hidden transition-all duration-300 ${
        added
          ? 'bg-gold text-leather hover:bg-gold/90'
          : 'bg-leather text-ivory hover:bg-leather/90'
      } ${className}`}
    >
      {added ? (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Ajouté au panier
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Ajouter au panier
        </>
      )}
    </Button>
  )
}

