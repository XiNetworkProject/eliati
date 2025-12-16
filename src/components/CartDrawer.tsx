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
  const { items, itemCount, total, subtotal, discount, updateQuantity, removeItem } = useCart()

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-leather/40 backdrop-blur-sm z-50 transition-all duration-500 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-ivory shadow-2xl z-50 flex flex-col transition-all duration-500 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold/20 bg-gradient-to-r from-champagne/20 to-rose/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-leather/10 border border-leather/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-2xl text-leather">Mon panier</h2>
              <p className="text-xs text-taupe">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-leather/10 rounded-xl transition-all duration-300"
          >
            <svg className="w-6 h-6 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-28 h-28 mb-6 rounded-full bg-gradient-to-br from-champagne/40 to-rose/30 border border-gold/20 flex items-center justify-center animate-float">
              <svg className="w-14 h-14 text-leather/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-leather mb-2">Votre panier est vide</h3>
            <p className="text-taupe text-sm mb-8 max-w-xs">
              Explorez notre collection et trouvez le bijou parfait pour vous
            </p>
            <Button 
              onClick={onClose} 
              className="btn-premium bg-leather text-ivory hover:bg-leather/90 px-8 py-5 rounded-full"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Découvrir la collection
            </Button>
          </div>
        ) : (
          <>
            {/* Liste des produits */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="group bg-white rounded-2xl p-4 border border-gold/10 hover:border-gold/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    <Link href={`/product/${item.productId}`} onClick={onClose} className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-champagne/30 to-rose/20 border border-gold/20 overflow-hidden img-zoom">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold/10" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`} onClick={onClose}>
                        <h3 className="font-medium text-sm text-leather hover:text-gold transition-colors line-clamp-1 mb-1">
                          {item.name}
                        </h3>
                      </Link>
                      
                      {/* Coloris */}
                      {item.color && (
                        <p className="text-xs text-taupe mb-1">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gold/50" />
                            {item.color}
                          </span>
                        </p>
                      )}

                      {/* Charms */}
                      {item.charms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {item.charms.slice(0, 2).map((charm) => (
                            <span 
                              key={`${item.id}-${charm.label}`}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-champagne/30 text-[10px] text-leather"
                            >
                              ✨ {charm.label}
                            </span>
                          ))}
                          {item.charms.length > 2 && (
                            <span className="text-[10px] text-taupe">+{item.charms.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Quantité + Prix */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center rounded-lg border border-gold/20 bg-champagne/10 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-champagne/30 transition-colors"
                          >
                            <svg className="w-3 h-3 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-leather">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-champagne/30 transition-colors"
                          >
                            <svg className="w-3 h-3 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <span className="font-semibold text-leather">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
            <div className="border-t border-gold/20 p-5 space-y-4 bg-gradient-to-t from-champagne/10 to-transparent">
              {/* Résumé */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-taupe">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Réduction</span>
                    <span>-{discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-taupe">
                  <span>Livraison</span>
                  <span>Calculée au checkout</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 px-4 bg-leather/5 rounded-2xl border border-leather/10">
                <span className="font-display text-lg text-leather">Total</span>
                <span className="font-display text-2xl text-leather">{total.toFixed(2)} €</span>
              </div>

              {/* Boutons */}
              <div className="space-y-2">
                <Link href="/checkout" onClick={onClose} className="block">
                  <Button className="w-full btn-premium bg-leather text-ivory hover:bg-leather/90 h-12 text-sm font-medium rounded-xl shadow-lg shadow-leather/20">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Passer commande
                  </Button>
                </Link>

                <Link href="/cart" onClick={onClose} className="block">
                  <Button variant="outline" className="w-full h-10 text-sm rounded-xl border-leather/20 text-leather hover:bg-leather/5">
                    Voir le panier détaillé
                  </Button>
                </Link>
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-taupe">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Paiement sécurisé
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Livraison offerte dès 50€
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
