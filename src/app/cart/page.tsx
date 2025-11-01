'use client'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CartPage() {
  const {
    items,
    subtotal,
    discount,
    total,
    promoCode,
    updateQuantity,
    removeItem,
    applyPromoCode,
    removePromoCode,
  } = useCart()

  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loadingPromo, setLoadingPromo] = useState(false)

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return

    setLoadingPromo(true)
    const result = await applyPromoCode(promoCodeInput)
    setPromoMessage({ type: result.success ? 'success' : 'error', text: result.message })
    
    if (result.success) {
      setPromoCodeInput('')
    }
    
    setLoadingPromo(false)
    setTimeout(() => setPromoMessage(null), 5000)
  }

  if (items.length === 0) {
    return (
      <div>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-16">
          <Card className="p-12 text-center bg-white/60 backdrop-blur-sm border-gold/20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="font-display text-3xl text-leather mb-4">Votre panier est vide</h1>
            <p className="text-taupe mb-8">Découvrez nos bijoux et ajoutez-les à votre panier</p>
            <Link href="/">
              <Button className="bg-leather text-ivory hover:bg-leather/90">
                Découvrir la collection
              </Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl text-leather mb-8">Mon panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-5 bg-white/80 backdrop-blur-sm border-gold/20">
                <div className="flex gap-5">
                  {/* Image produit */}
                  <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center overflow-hidden">
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

                  {/* Informations produit */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`}>
                      <h3 className="font-display text-lg text-leather hover:text-gold transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-leather font-medium mt-1">{item.price.toFixed(2)} €</p>

                    <div className="flex items-center gap-3 mt-3">
                      {/* Sélecteur de quantité */}
                      <div className="flex items-center border border-gold/30 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-champagne/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="px-4 py-1.5 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-champagne/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Bouton supprimer */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Prix total de la ligne */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-leather">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-gold/20 sticky top-4">
              <h2 className="font-display text-xl text-leather mb-6">Résumé</h2>

              {/* Code promo */}
              <div className="mb-6 pb-6 border-b border-gold/20">
                <label className="block text-sm font-medium text-leather mb-2">
                  Code promo
                </label>
                {promoCode ? (
                  <div className="flex items-center justify-between p-3 bg-gold/10 border border-gold/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-leather">{promoCode.code}</p>
                      <p className="text-xs text-taupe">
                        -{promoCode.discountType === 'percentage'
                          ? `${promoCode.discountValue}%`
                          : `${promoCode.discountValue.toFixed(2)} €`}
                      </p>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-red-600 hover:text-red-700"
                      title="Retirer le code"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      placeholder="ELIGOLD20"
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    />
                    <Button
                      onClick={handleApplyPromo}
                      disabled={loadingPromo || !promoCodeInput.trim()}
                      variant="outline"
                      className="border-leather/20"
                    >
                      {loadingPromo ? '...' : 'Appliquer'}
                    </Button>
                  </div>
                )}
                {promoMessage && (
                  <p className={`text-xs mt-2 ${promoMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Détail des prix */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-taupe">Sous-total</span>
                  <span className="text-leather font-medium">{subtotal.toFixed(2)} €</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span className="font-medium">-{discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-taupe">Livraison</span>
                  <span className="text-leather font-medium">Calculée à l&apos;étape suivante</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gold/30 mb-6">
                <span className="font-display text-lg text-leather">Total</span>
                <span className="font-display text-2xl text-leather">{total.toFixed(2)} €</span>
              </div>

              {/* Bouton commander */}
              <Link href="/checkout">
                <Button className="w-full bg-leather text-ivory hover:bg-leather/90 h-12">
                  Procéder au paiement
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" className="w-full mt-3 border-leather/20">
                  Continuer mes achats
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

