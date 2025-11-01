'use client'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, itemCount, total, removeItem } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <h2 className="font-display text-xl text-leather">
            Panier ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-champagne/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-display text-lg text-leather mb-2">Votre panier est vide</h3>
            <p className="text-taupe text-sm mb-6">Ajoutez des produits pour commencer</p>
            <Button onClick={onClose} className="bg-leather text-ivory hover:bg-leather/90">
              Continuer mes achats
            </Button>
          </div>
        ) : (
          <>
            {/* Liste des produits */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gold/10 last:border-0">
                  <Link href={`/product/${item.slug}`} onClick={onClose} className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/40 to-gold/20" />
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} onClick={onClose}>
                      <h3 className="font-display text-sm text-leather hover:text-gold transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-taupe mt-1">Quantité: {item.quantity}</p>
                    <p className="text-sm font-medium text-leather mt-1">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors h-fit"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer avec total */}
            <div className="border-t border-gold/20 p-6 space-y-4 bg-champagne/10">
              <div className="flex justify-between items-center">
                <span className="font-display text-lg text-leather">Total</span>
                <span className="font-display text-2xl text-leather">{total.toFixed(2)} €</span>
              </div>

              <Link href="/cart" onClick={onClose}>
                <Button className="w-full bg-leather text-ivory hover:bg-leather/90 h-12">
                  Voir le panier
                </Button>
              </Link>

              <Link href="/checkout" onClick={onClose}>
                <Button variant="outline" className="w-full border-leather/20 h-12">
                  Procéder au paiement
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}

