'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'

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
  const [paypalLoaded, setPaypalLoaded] = useState(false)

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

  const handlePayPalPayment = async () => {
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    setLoading(true)

    try {
      // Créer la commande dans Supabase
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
          },
          subtotal_cents: Math.round(subtotal * 100),
          discount_cents: Math.round(discount * 100),
          total_cents: Math.round(total * 100),
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

      // Initialiser PayPal (simulation pour l'instant)
      // TODO: Intégrer le vrai SDK PayPal
      alert('🎉 Commande créée ! Intégration PayPal en cours de développement.')
      
      // Vider le panier et rediriger
      clearCart()
      router.push(`/order-confirmation?id=${order.id}`)

    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error)
      alert('Erreur lors de la création de la commande. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

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
                    <span className="text-leather font-medium">5,00 €</span>
                  </div>
                </div>

                {/* Total final */}
                <div className="pt-4 border-t-2 border-gold/30">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-display text-xl text-leather">Total</span>
                    <span className="font-display text-3xl text-leather">{(total + 5).toFixed(2)} €</span>
                  </div>

                  {/* Bouton PayPal */}
                  <Button
                    onClick={handlePayPalPayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#0070ba] to-[#003087] text-white hover:from-[#005ea6] hover:to-[#00264d] h-14 text-base font-semibold shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.806.806 0 01-.795.68H8.803c-.397 0-.687-.356-.593-.736l1.864-11.808a.959.959 0 01.946-.814h2.743c4.037 0 6.778 1.564 7.304 4.188z" />
                        </svg>
                        Payer avec PayPal
                      </>
                    )}
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-taupe">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Paiement 100% sécurisé</span>
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

