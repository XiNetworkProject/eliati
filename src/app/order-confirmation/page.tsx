'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

type Order = {
  id: string
  customer_name: string
  customer_email: string
  total_cents: number
  status: string
  created_at: string
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return

      const { data } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, total_cents, status, created_at')
        .eq('id', orderId)
        .single()

      if (data) setOrder(data)
      setLoading(false)
    }

    loadOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-champagne/10 to-rose/5">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leather mx-auto mb-4"></div>
          <p className="text-taupe">Chargement de votre commande...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-champagne/10 to-rose/5">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-16">
          <Card className="p-16 text-center bg-white/80 backdrop-blur-sm border-gold/20">
            <h1 className="font-display text-3xl text-leather mb-4">Commande introuvable</h1>
            <p className="text-taupe mb-8">Impossible de trouver cette commande</p>
            <Link href="/">
              <Button className="bg-leather text-ivory hover:bg-leather/90">
                Retour à l&apos;accueil
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
      <main className="mx-auto max-w-4xl px-4 py-16">
        <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-gold/20 shadow-2xl">
          {/* Header avec animation */}
          <div className="bg-gradient-to-br from-gold/20 via-champagne/30 to-rose/20 p-12 text-center border-b border-gold/20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/40 to-gold/20 border-2 border-gold/40 flex items-center justify-center animate-bounce">
              <svg className="w-12 h-12 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-4xl text-leather mb-4">Commande confirmée !</h1>
            <p className="text-taupe text-lg mb-2">Merci pour votre commande {order.customer_name}</p>
            <p className="text-taupe text-sm">
              Un email de confirmation a été envoyé à <span className="font-medium text-leather">{order.customer_email}</span>
            </p>
          </div>

          {/* Détails de la commande */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-champagne/10 rounded-xl border border-gold/20">
                <p className="text-xs uppercase tracking-wider text-taupe mb-2">Numéro de commande</p>
                <p className="font-mono text-sm text-leather font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>

              <div className="p-4 bg-champagne/10 rounded-xl border border-gold/20">
                <p className="text-xs uppercase tracking-wider text-taupe mb-2">Date</p>
                <p className="text-sm text-leather font-semibold">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="p-4 bg-champagne/10 rounded-xl border border-gold/20">
                <p className="text-xs uppercase tracking-wider text-taupe mb-2">Statut</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gold/20 text-leather border border-gold/40">
                  {order.status === 'pending' ? 'En attente' : order.status}
                </span>
              </div>

              <div className="p-4 bg-champagne/10 rounded-xl border border-gold/20">
                <p className="text-xs uppercase tracking-wider text-taupe mb-2">Montant total</p>
                <p className="font-display text-2xl text-leather">{(order.total_cents / 100).toFixed(2)} €</p>
              </div>
            </div>

            {/* Prochaines étapes */}
            <div className="p-6 bg-gradient-to-br from-champagne/10 to-rose/5 rounded-2xl border border-gold/20">
              <h3 className="font-display text-lg text-leather mb-4">Prochaines étapes</h3>
              <ul className="space-y-3 text-sm text-taupe">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Vous recevrez un email de confirmation avec tous les détails</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Votre commande sera préparée avec soin dans les 24-48h</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Vous recevrez un numéro de suivi dès l&apos;expédition</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Livraison estimée : 3-5 jours ouvrés</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="p-6 bg-white border border-gold/20 rounded-2xl text-center">
              <p className="text-sm text-taupe mb-3">Une question sur votre commande ?</p>
              <a 
                href="mailto:Contacteliati@gmail.com" 
                className="text-leather font-medium hover:text-gold transition-colors"
              >
                Contacteliati@gmail.com
              </a>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-leather text-ivory hover:bg-leather/90 h-12">
                  Retour à l&apos;accueil
                </Button>
              </Link>
              <Link href="/new" className="flex-1">
                <Button variant="outline" className="w-full border-leather/20 h-12">
                  Voir les nouveautés
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

