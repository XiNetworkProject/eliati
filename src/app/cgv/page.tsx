'use client'
import Link from 'next/link'
import { useLegalTexts } from '@/hooks/useSiteSettings'

export default function CGVPage() {
  const { texts, loading } = useLegalTexts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory via-champagne/10 to-ivory">
      {/* Header */}
      <div className="bg-gradient-to-r from-champagne/30 via-rose/20 to-champagne/30 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-sm text-taupe hover:text-leather transition-colors mb-4 inline-flex items-center gap-2">
            ← Retour à la boutique
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-leather mt-4">Conditions Générales de Vente</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-4"></div>
            <p className="text-taupe">Chargement...</p>
          </div>
        ) : texts.cgv ? (
          <div className="prose prose-taupe max-w-none">
            <div className="whitespace-pre-line text-taupe leading-relaxed">
              {texts.cgv}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl p-8 border border-gold/20 space-y-8">
            <section>
              <h2 className="font-display text-xl text-leather mb-4">Article 1 - Objet</h2>
              <p className="text-taupe">
                Les présentes conditions générales de vente régissent les relations contractuelles entre 
                EliAti et ses clients dans le cadre de la vente de bijoux artisanaux.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">Article 2 - Produits</h2>
              <p className="text-taupe">
                Les bijoux proposés à la vente sont des créations artisanales faites main. 
                Chaque pièce est unique et peut présenter de légères variations par rapport aux photos.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">Article 3 - Prix</h2>
              <p className="text-taupe">
                Les prix sont indiqués en euros TTC. Ils sont susceptibles de modification à tout moment. 
                Le prix applicable est celui affiché au moment de la validation de la commande.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">Article 4 - Commande</h2>
              <p className="text-taupe">
                La validation de votre commande implique l&apos;acceptation des présentes CGV. 
                Un email de confirmation vous sera envoyé après validation du paiement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">Article 5 - Livraison</h2>
              <p className="text-taupe">
                Les délais de livraison sont donnés à titre indicatif. 
                Le vendeur ne pourra être tenu responsable des retards de livraison imputables au transporteur.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">Article 6 - Droit de rétractation</h2>
              <p className="text-taupe">
                Conformément à la législation en vigueur, vous disposez d&apos;un délai de 14 jours à compter 
                de la réception de votre commande pour exercer votre droit de rétractation, 
                sauf pour les produits personnalisés.
              </p>
            </section>

            <p className="text-sm text-taupe/60 pt-4 border-t border-gold/20">
              Ces CGV par défaut peuvent être personnalisées dans l&apos;administration du site.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
