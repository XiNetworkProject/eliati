'use client'
import { useMemo, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SHIPPING_OPTIONS, findWeightBracket, calculateShippingPrice } from '@/lib/shipping'

function estimateCheapestShipping(subtotal: number, totalWeightGrams: number) {
  return SHIPPING_OPTIONS.reduce(
    (best, option) => {
      const price = calculateShippingPrice(option, subtotal, totalWeightGrams)
      return price < best.price ? { option, price } : best
    },
    { option: SHIPPING_OPTIONS[0], price: calculateShippingPrice(SHIPPING_OPTIONS[0], subtotal, totalWeightGrams) }
  )
}

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
    totalWeight,
  } = useCart()

  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loadingPromo, setLoadingPromo] = useState(false)

  const { option: bestOption, price: estimatedShipping } = useMemo(
    () => estimateCheapestShipping(subtotal, totalWeight),
    [subtotal, totalWeight]
  )
  const bestBracket = useMemo(
    () => findWeightBracket(bestOption, totalWeight),
    [bestOption, totalWeight]
  )

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
      <div className="min-h-screen bg-gradient-to-br from-ivory via-champagne/10 to-rose/5">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-16">
          <Card className="p-16 text-center bg-white/80 backdrop-blur-sm border-gold/20 shadow-lg">
            <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/30 flex items-center justify-center">
              <svg className="w-16 h-16 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="font-display text-4xl text-leather mb-4">Votre panier est vide</h1>
            <p className="text-taupe mb-10 text-lg">Découvrez nos créations et ajoutez-les à votre panier</p>
            <Link href="/">
              <Button className="bg-leather text-ivory hover:bg-leather/90 px-8 py-6 text-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
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
    <div className="min-h-screen bg-gradient-to-br from-ivory via-champagne/10 to-rose/5">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="font-display text-4xl text-leather mb-10">Mon panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="group overflow-hidden bg-white/90 backdrop-blur-sm border-gold/20 hover:shadow-lg transition-all duration-300">
                <div className="p-6 flex gap-6">
                  {/* Image produit */}
                  <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/40 to-gold/20" />
                      )}
                    </div>
                  </Link>

                  {/* Informations produit */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="font-display text-xl text-leather hover:text-gold transition-colors mb-2">
                          {item.name}
                        </h3>
                      </Link>
                      {item.charms.length > 0 && (
                        <div className="text-xs text-taupe space-y-1 mb-3">
                          {item.charms.map((charm) => (
                            <p key={`${item.id}-${charm.label}`}>
                              Charm : {charm.label}
                              {charm.price > 0 && ` (+${charm.price.toFixed(2)} €)`}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-taupe text-sm mb-1">Prix unitaire : {item.price.toFixed(2)} €</p>
                      {item.charms.length > 0 && (
                        <p className="text-xs text-taupe">Dont charm(s) : +{item.charms.reduce((sum, charm) => sum + charm.price, 0).toFixed(2)} €</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Sélecteur de quantité élégant */}
                      <div className="flex items-center bg-champagne/10 border border-gold/30 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-4 py-2.5 hover:bg-champagne/30 transition-colors"
                        >
                          <svg className="w-4 h-4 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="px-6 py-2.5 text-sm font-semibold text-leather min-w-[3rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-4 py-2.5 hover:bg-champagne/30 transition-colors"
                        >
                          <svg className="w-4 h-4 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Bouton supprimer */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Prix total de la ligne */}
                  <div className="flex flex-col justify-between items-end">
                    <p className="text-2xl font-semibold text-leather">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-gold/20 sticky top-4 shadow-lg">
              <div className="bg-gradient-to-br from-champagne/20 to-rose/10 p-6 border-b border-gold/20">
                <h2 className="font-display text-2xl text-leather">Résumé</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Code promo */}
                <div className="pb-6 border-b border-gold/20">
                  <label className="block text-sm font-medium text-leather mb-3 uppercase tracking-wide">
                    Code promo
                  </label>
                  {promoCode ? (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-leather tracking-wide">{promoCode.code}</p>
                        <p className="text-xs text-taupe mt-1">
                          -{promoCode.discountType === 'percentage'
                            ? `${promoCode.discountValue}%`
                            : `${promoCode.discountValue.toFixed(2)} €`}
                        </p>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                        className="flex-1 border-gold/30"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <Button
                        onClick={handleApplyPromo}
                        disabled={loadingPromo || !promoCodeInput.trim()}
                        className="bg-leather text-ivory hover:bg-leather/90 px-6"
                      >
                        {loadingPromo ? '...' : 'OK'}
                      </Button>
                    </div>
                  )}
                  {promoMessage && (
                    <div className={`text-xs mt-3 p-2 rounded-lg ${promoMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {promoMessage.text}
                    </div>
                  )}
                </div>

                {/* Détail des prix */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-taupe">Sous-total</span>
                    <span className="text-leather font-semibold text-lg">{subtotal.toFixed(2)} €</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-green-700 font-medium">Réduction</span>
                      <span className="text-green-700 font-bold text-lg">-{discount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-taupe">Livraison</span>
                    <span className="text-right text-taupe">
                      {bestOption.label}
                      <span className="block text-leather font-medium text-base">{estimatedShipping.toFixed(2)} €</span>
                      <span className="block text-xs italic">{bestOption.description}</span>
                      {bestOption.freeAbove && (
                        <span className="block text-xs text-green-700 mt-1">
                          Livraison offerte dès {bestOption.freeAbove.toFixed(0)} €
                        </span>
                      )}
                      {(totalWeight ?? 0) > 0 && (
                        <span className="block text-xs text-taupe/80 mt-1">
                          Poids estimé : {(totalWeight / 1000).toFixed(2)} kg • Tranche ≤ {(bestBracket.max === Number.MAX_SAFE_INTEGER ? '30 kg' : `${(bestBracket.max / 1000).toFixed(bestBracket.max >= 1000 ? 1 : 3)} kg`)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-6 border-t-2 border-gold/30">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-display text-xl text-leather">Total</span>
                    <span className="font-display text-3xl text-leather">{total.toFixed(2)} €</span>
                  </div>

                  {/* Boutons */}
                  <div className="space-y-3">
                    <Link href="/checkout">
                      <Button className="w-full bg-leather text-ivory hover:bg-leather/90 h-14 text-lg font-medium">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Procéder au paiement
                      </Button>
                    </Link>

                    <Link href="/">
                      <Button variant="outline" className="w-full border-leather/20 h-12">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Continuer mes achats
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

