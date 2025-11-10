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

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-ivory via-champagne/10 to-rose/5 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-leather">
              Panier <span className="text-taupe">({itemCount})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-champagne/20 rounded-xl transition-all"
          >
            <svg className="w-6 h-6 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-24 h-24 mb-6 rounded-2xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-leather mb-3">Votre panier est vide</h3>
            <p className="text-taupe text-sm mb-8">Ajoutez des bijoux à votre collection</p>
            <Button onClick={onClose} className="bg-leather text-ivory hover:bg-leather/90 px-8">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continuer mes achats
            </Button>
          </div>
        ) : (
          <>
            {/* Liste des produits */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gold/20 hover:shadow-md transition-all duration-200">
                  <div className="flex gap-4">
                    <Link href={`/product/${item.slug}`} onClick={onClose} className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/40 to-gold/20" />
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link href={`/product/${item.slug}`} onClick={onClose}>
                          <h3 className="font-display text-base text-leather hover:text-gold transition-colors line-clamp-2 mb-1">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-taupe">Qté : {item.quantity}</p>
                        {item.charms.length > 0 && (
                          <div className="text-xs text-taupe mt-1 space-y-1">
                            {item.charms.map((charm) => (
                              <p key={`${item.id}-${charm.label}`}>
                                Charm : {charm.label}
                                {charm.price > 0 && ` (+${charm.price.toFixed(2)} €)`}
                              </p>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-taupe mt-2">Prix unitaire : {item.price.toFixed(2)} €</p>
                        <p className="text-base font-semibold text-leather">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all h-fit"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer avec total */}
            <div className="border-t border-gold/20 p-6 space-y-4 bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-center p-4 bg-gradient-to-br from-champagne/20 to-rose/10 rounded-xl border border-gold/30">
                <span className="font-display text-xl text-leather">Total</span>
                <span className="font-display text-3xl text-leather">{total.toFixed(2)} €</span>
              </div>

              <Link href="/cart" onClick={onClose}>
                <Button className="w-full bg-leather text-ivory hover:bg-leather/90 h-14 text-base font-medium shadow-lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Voir le panier complet
                </Button>
              </Link>

              <Link href="/checkout" onClick={onClose}>
                <Button className="w-full bg-gradient-to-r from-gold to-gold/80 text-leather hover:from-gold/90 hover:to-gold/70 h-14 text-base font-semibold shadow-lg border border-gold/30">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
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

