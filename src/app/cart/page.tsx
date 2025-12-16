'use client'
import { useMemo, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
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
      <div className="min-h-screen gradient-hero">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-lg mx-auto text-center animate-fade-in-up">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-champagne/50 to-rose/30 border border-gold/30 flex items-center justify-center animate-float">
              <svg className="w-16 h-16 text-leather/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-leather mb-4">Votre panier est vide</h1>
            <p className="text-taupe text-lg mb-10">Découvrez nos créations uniques et trouvez le bijou qui vous ressemble</p>
            <Link href="/">
              <Button className="btn-premium bg-leather text-ivory hover:bg-leather/90 px-8 py-6 text-lg rounded-full shadow-lg shadow-leather/20">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Découvrir la collection
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl text-leather mb-2">Mon panier</h1>
          <p className="text-taupe">{items.length} article{items.length > 1 ? 's' : ''} dans votre panier</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="group card-elegant p-4 sm:p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Product image */}
                  <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-champagne/30 to-rose/20 border border-gold/20 overflow-hidden img-zoom">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.productId}`}>
                      <h3 className="font-display text-lg sm:text-xl text-leather hover:text-gold transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    
                    {/* Options */}
                    <div className="mt-2 space-y-1">
                      {item.color && (
                        <p className="text-sm text-leather">
                          <span className="text-taupe">Coloris :</span> {item.color}
                        </p>
                      )}
                      {item.charms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.charms.map((charm) => (
                            <span 
                              key={`${item.id}-${charm.label}`}
                              className="inline-flex items-center px-2 py-0.5 rounded-full bg-champagne/30 text-xs text-leather border border-gold/20"
                            >
                              ✨ {charm.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <p className="mt-2 text-sm text-taupe">
                      {item.price.toFixed(2)} € / unité
                    </p>

                    {/* Quantity & Remove - Mobile friendly */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center rounded-full border border-gold/30 bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-champagne/30 transition-colors"
                        >
                          <svg className="w-4 h-4 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-leather">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-champagne/30 transition-colors"
                        >
                          <svg className="w-4 h-4 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Line total - right aligned */}
                      <div className="ml-auto text-right">
                        <p className="text-xl font-semibold text-leather">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link href="/" className="inline-flex items-center gap-2 text-leather hover:text-gold transition-colors mt-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continuer mes achats
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card-elegant sticky top-24 overflow-hidden animate-fade-in-up stagger-2">
              {/* Header */}
              <div className="bg-gradient-to-br from-champagne/30 to-rose/10 p-6 border-b border-gold/20">
                <h2 className="font-display text-2xl text-leather">Résumé</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Promo code */}
                <div className="pb-6 border-b border-gold/20">
                  <label className="block text-sm font-medium text-leather mb-3">
                    Code promo
                  </label>
                  {promoCode ? (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎉</span>
                        <div>
                          <p className="font-bold text-green-800">{promoCode.code}</p>
                          <p className="text-xs text-green-600">
                            -{promoCode.discountType === 'percentage'
                              ? `${promoCode.discountValue}%`
                              : `${promoCode.discountValue.toFixed(2)} €`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="Votre code"
                        className="flex-1 rounded-xl border-gold/30 focus:border-gold focus:ring-gold/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <Button
                        onClick={handleApplyPromo}
                        disabled={loadingPromo || !promoCodeInput.trim()}
                        className="bg-leather text-ivory hover:bg-leather/90 rounded-xl px-5"
                      >
                        {loadingPromo ? '...' : 'OK'}
                      </Button>
                    </div>
                  )}
                  {promoMessage && (
                    <div className={`text-sm mt-3 p-3 rounded-xl ${
                      promoMessage.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {promoMessage.text}
                    </div>
                  )}
                </div>

                {/* Price details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-taupe">Sous-total</span>
                    <span className="text-leather font-medium">{subtotal.toFixed(2)} €</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                      <span className="text-green-700 font-medium">Réduction</span>
                      <span className="text-green-700 font-bold">-{discount.toFixed(2)} €</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-taupe">Livraison estimée</span>
                      <p className="text-xs text-taupe/70">{bestOption.label}</p>
                    </div>
                    <div className="text-right">
                      {estimatedShipping === 0 ? (
                        <span className="text-green-600 font-medium">Offerte !</span>
                      ) : (
                        <span className="text-leather font-medium">{estimatedShipping.toFixed(2)} €</span>
                      )}
                      {bestOption.freeAbove && estimatedShipping > 0 && (
                        <p className="text-xs text-green-600">
                          Offerte dès {bestOption.freeAbove} €
                        </p>
                      )}
                    </div>
                  </div>

                  {(totalWeight ?? 0) > 0 && (
                    <p className="text-xs text-taupe/70 text-right">
                      Poids : {(totalWeight / 1000).toFixed(2)} kg
                      {bestBracket.max !== Number.MAX_SAFE_INTEGER && ` (tranche ≤ ${(bestBracket.max / 1000).toFixed(1)} kg)`}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="pt-6 border-t-2 border-gold/30">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-display text-xl text-leather">Total</span>
                    <span className="font-display text-3xl text-leather">{(total + estimatedShipping).toFixed(2)} €</span>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full btn-premium bg-leather text-ivory hover:bg-leather/90 h-14 text-lg font-medium rounded-2xl shadow-lg shadow-leather/20">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Passer commande
                    </Button>
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="pt-4 space-y-2 text-xs text-taupe">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Paiement 100% sécurisé
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Satisfait ou remboursé 30 jours
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Livraison soignée
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

