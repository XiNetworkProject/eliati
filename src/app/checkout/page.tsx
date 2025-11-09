'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import PayPalButton from '@/components/PayPalButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type CheckoutForm = {
  // Informations personnelles
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Adresse de livraison
  address: string
  addressComplement: string
  city: string
  postalCode: string
  country: string
  
  // Notes
  notes: string
}

type ShippingOption = {
  id: string
  label: string
  description: string
  delay: string
  basePrice: number
  insurance?: string
  reducedPrice?: number
  reducedAbove?: number
  freeAbove?: number
  extraItemThreshold?: number
  extraItemFee?: number
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'colissimo',
    label: 'Colissimo Suivi',
    description: 'Livraison à domicile avec suivi et assurance incluse.',
    delay: '48h ouvrées',
    basePrice: 7.9,
    reducedPrice: 4.5,
    reducedAbove: 60,
    freeAbove: 100,
    extraItemThreshold: 4,
    extraItemFee: 1.5,
    insurance: "Assurance incluse jusqu'à 200 €",
  },
]

function calculateShippingPrice(option: ShippingOption, subtotal: number, itemCount: number) {
  if (!option) return 0

  // Livraison offerte au-delà d'un certain montant
  if (option.freeAbove !== undefined && subtotal >= option.freeAbove) {
    return 0
  }

  // Tarif réduit à partir d'un seuil
  if (
    option.reducedAbove !== undefined &&
    option.reducedPrice !== undefined &&
    subtotal >= option.reducedAbove
  ) {
    return option.reducedPrice
  }

  let price = option.basePrice

  // Surcharge si beaucoup d'articles (ex: bijoux volumineux à emballer séparément)
  if (
    option.extraItemThreshold !== undefined &&
    option.extraItemFee !== undefined &&
    itemCount > option.extraItemThreshold
  ) {
    price += (itemCount - option.extraItemThreshold) * option.extraItemFee
  }

  return Number(price.toFixed(2))
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, discount, total, promoCode, clearCart } = useCart()
  
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    addressComplement: '',
    city: '',
    postalCode: '',
    country: 'France',
    notes: '',
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({})
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderCreated, setOrderCreated] = useState(false)
  const [shippingOption, setShippingOption] = useState<ShippingOption>(SHIPPING_OPTIONS[0])

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const shippingCost = useMemo(
    () => calculateShippingPrice(shippingOption, total, itemCount),
    [shippingOption, total, itemCount]
  )

  // Rediriger si panier vide
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-champagne/10 to-rose/5">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-16">
          <Card className="p-16 text-center bg-white/80 backdrop-blur-sm border-gold/20">
            <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/30 flex items-center justify-center">
              <svg className="w-16 h-16 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="font-display text-4xl text-leather mb-4">Votre panier est vide</h1>
            <p className="text-taupe mb-10 text-lg">Ajoutez des produits avant de passer commande</p>
            <Link href="/">
              <Button className="bg-leather text-ivory hover:bg-leather/90 px-8 py-6 text-lg">
                Découvrir la collection
              </Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutForm, string>> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis'
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis'
    if (!formData.email.trim()) newErrors.email = 'Email requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis'
    if (!formData.address.trim()) newErrors.address = 'Adresse requise'
    if (!formData.city.trim()) newErrors.city = 'Ville requise'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Code postal requis'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createOrder = async () => {
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    setLoading(true)

    try {
      // Créer la commande dans Supabase
      const shippingAmountCents = Math.round(shippingCost * 100)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_email: formData.email,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_phone: formData.phone,
          shipping_address: {
            address: formData.address,
            addressComplement: formData.addressComplement,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            method: {
              id: shippingOption.id,
              label: shippingOption.label,
              price: shippingCost,
              delay: shippingOption.delay,
              pricing: {
                base: shippingOption.basePrice,
                reduced: shippingOption.reducedPrice ?? null,
                reducedAbove: shippingOption.reducedAbove ?? null,
                freeAbove: shippingOption.freeAbove ?? null,
                extraItemThreshold: shippingOption.extraItemThreshold ?? null,
                extraItemFee: shippingOption.extraItemFee ?? null,
                cartValue: total,
                itemCount,
              },
            },
          },
          subtotal_cents: Math.round(subtotal * 100),
          discount_cents: Math.round(discount * 100),
          shipping_cents: shippingAmountCents,
          shipping_method: shippingOption.id,
          total_cents: Math.round((total + shippingCost) * 100),
          status: 'pending',
          notes: formData.notes,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Ajouter les articles de la commande
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_price_cents: Math.round(item.price * 100),
        quantity: item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      setOrderId(order.id)
      setOrderCreated(true)
      return order.id

    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error)
      alert('Erreur lors de la création de la commande. Veuillez réessayer.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const handlePayPalSuccess = () => {
    clearCart()
    router.push(`/order-confirmation?id=${orderId}`)
  }

  const handlePayPalError = (error: Error) => {
    console.error('Erreur PayPal:', error)
    alert('Erreur lors du paiement PayPal. Veuillez réessayer.')
  }

  const finalTotal = useMemo(() => Math.max(0, total + shippingCost), [total, shippingCost])

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-champagne/10 to-rose/5">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="font-display text-4xl text-leather mb-10">Paiement</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-gold/20">
              <h2 className="font-display text-2xl text-leather mb-6">Informations personnelles</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Prénom *
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={errors.firstName ? 'border-red-500' : 'border-gold/30'}
                    placeholder="Élise"
                  />
                  {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Nom *
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={errors.lastName ? 'border-red-500' : 'border-gold/30'}
                    placeholder="Dupont"
                  />
                  {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? 'border-red-500' : 'border-gold/30'}
                    placeholder="elise@example.com"
                  />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Téléphone *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={errors.phone ? 'border-red-500' : 'border-gold/30'}
                    placeholder="+33 6 12 34 56 78"
                  />
                  {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </Card>

            {/* Adresse de livraison */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-gold/20">
              <h2 className="font-display text-2xl text-leather mb-6">Adresse de livraison</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Adresse *
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className={errors.address ? 'border-red-500' : 'border-gold/30'}
                    placeholder="12 rue de la Paix"
                  />
                  {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Complément d&apos;adresse
                  </label>
                  <Input
                    value={formData.addressComplement}
                    onChange={(e) => setFormData(prev => ({ ...prev, addressComplement: e.target.value }))}
                    className="border-gold/30"
                    placeholder="Appartement 3B, Bâtiment A..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-leather mb-2">
                      Code postal *
                    </label>
                    <Input
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      className={errors.postalCode ? 'border-red-500' : 'border-gold/30'}
                      placeholder="75001"
                    />
                    {errors.postalCode && <p className="text-red-600 text-xs mt-1">{errors.postalCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-leather mb-2">
                      Ville *
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className={errors.city ? 'border-red-500' : 'border-gold/30'}
                      placeholder="Paris"
                    />
                    {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Pays *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full p-3 border border-gold/30 rounded-lg bg-white"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Notes de commande */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-gold/20">
              <h2 className="font-display text-2xl text-leather mb-6">Notes de commande (optionnel)</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-4 border border-gold/30 rounded-lg resize-none h-32"
                placeholder="Instructions spéciales, préférences de livraison..."
              />
            </Card>

            {/* Mode d'expédition */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-gold/20">
              <h2 className="font-display text-2xl text-leather mb-6">Mode d&apos;envoi</h2>
              <div className="grid gap-4">
                {SHIPPING_OPTIONS.map((option) => {
                  const selected = option.id === shippingOption.id
                  const computedPrice = calculateShippingPrice(option, total, itemCount)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setShippingOption(option)}
                      className={cn(
                        'w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4',
                        selected
                          ? 'border-leather bg-gradient-to-br from-champagne/30 to-rose/20 shadow-lg'
                          : 'border-gold/30 bg-white hover:border-leather/40 hover:shadow-md'
                      )}
                    >
                      <div className={cn(
                        'mt-1 h-4 w-4 rounded-full border-2',
                        selected ? 'border-leather bg-leather' : 'border-gold/40'
                      )} />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-display text-lg text-leather">{option.label}</p>
                            <p className="text-sm text-taupe">{option.description}</p>
                            <p className="mt-2 text-xs text-taupe/80">
                              {option.freeAbove !== undefined && option.reducedPrice !== undefined ? (
                                <>Offerte dès {option.freeAbove.toFixed(0)} € • {option.reducedPrice.toFixed(2)} € entre {option.reducedAbove?.toFixed(0)} € et {option.freeAbove.toFixed(0)} €</>
                              ) : option.freeAbove !== undefined ? (
                                <>Offerte dès {option.freeAbove.toFixed(0)} €</>
                              ) : null}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-leather font-semibold text-lg">{computedPrice.toFixed(2)} €</p>
                            <p className="text-xs text-taupe">{option.delay}</p>
                          </div>
                        </div>
                        {option.extraItemThreshold !== undefined && option.extraItemFee !== undefined && (
                          <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                            Supplément de {option.extraItemFee.toFixed(2)} € par article au-delà de {option.extraItemThreshold}
                          </p>
                        )}
                        {option.insurance && (
                          <p className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 inline-block">
                            {option.insurance}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-gold/20 sticky top-4 shadow-lg">
              <div className="bg-gradient-to-br from-champagne/20 to-rose/10 p-6 border-b border-gold/20">
                <h2 className="font-display text-2xl text-leather">Votre commande</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Produits */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-gold/10 last:border-0">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold/40 to-gold/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm text-leather line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-taupe mt-1">Qté: {item.quantity}</p>
                        <p className="text-sm font-semibold text-leather mt-1">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Code promo */}
                {promoCode && (
                  <div className="p-3 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl">
                    <p className="text-xs text-taupe mb-1">Code promo appliqué</p>
                    <p className="text-sm font-bold text-leather">{promoCode.code}</p>
                  </div>
                )}

                {/* Totaux */}
                <div className="space-y-3 pt-4 border-t border-gold/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-taupe">Sous-total</span>
                    <span className="text-leather font-medium">{subtotal.toFixed(2)} €</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Réduction</span>
                      <span className="text-green-700 font-medium">-{discount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-taupe">Livraison</span>
                    <span className="text-leather font-medium">
                      {shippingOption.label} · {shippingCost.toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Total final */}
                <div className="pt-4 border-t-2 border-gold/30">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-display text-xl text-leather">Total</span>
                    <span className="font-display text-3xl text-leather">{finalTotal.toFixed(2)} €</span>
                  </div>

                  {/* Bouton créer la commande */}
                  {!orderCreated ? (
                    <Button
                      onClick={createOrder}
                      disabled={loading}
                      className="w-full bg-leather text-ivory hover:bg-leather/90 h-14 text-base font-semibold shadow-lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Création de la commande...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Valider et passer au paiement
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      {/* Boutons PayPal */}
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                          <p className="text-sm text-green-700 font-medium">✓ Commande créée avec succès</p>
                          <p className="text-xs text-green-600 mt-1">Procédez au paiement ci-dessous</p>
                        </div>
                        
                        {orderId && (
                          <PayPalButton
                            amount={finalTotal}
                            orderId={orderId}
                            onSuccess={handlePayPalSuccess}
                            onError={handlePayPalError}
                          />
                        )}
                      </div>
                    </>
                  )}

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-taupe">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Paiement 100% sécurisé via PayPal</span>
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

