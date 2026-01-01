'use client'
import Link from 'next/link'
import { useLegalTexts, useSiteConfig } from '@/hooks/useSiteSettings'

export default function PolitiqueRetourPage() {
  const { texts, loading } = useLegalTexts()
  const { config } = useSiteConfig()

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory via-champagne/10 to-ivory">
      {/* Header */}
      <div className="bg-gradient-to-r from-champagne/30 via-rose/20 to-champagne/30 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-sm text-taupe hover:text-leather transition-colors mb-4 inline-flex items-center gap-2">
            ← Retour à la boutique
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-leather mt-4">Politique de retour</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-4"></div>
            <p className="text-taupe">Chargement...</p>
          </div>
        ) : texts.politique_retour ? (
          <div className="prose prose-taupe max-w-none">
            <div className="whitespace-pre-line text-taupe leading-relaxed">
              {texts.politique_retour}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl p-8 border border-gold/20 space-y-8">
            <section>
              <h2 className="font-display text-xl text-leather mb-4">🔄 Délai de rétractation</h2>
              <p className="text-taupe">
                Vous disposez d&apos;un délai de <strong>14 jours</strong> à compter de la réception 
                de votre commande pour nous retourner un article qui ne vous conviendrait pas.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">⚠️ Exceptions</h2>
              <p className="text-taupe mb-4">
                Conformément à la législation, les produits suivants ne peuvent pas être retournés :
              </p>
              <ul className="list-disc list-inside text-taupe space-y-2">
                <li>Bijoux personnalisés avec gravure ou charm sur mesure</li>
                <li>Articles portés ou endommagés par le client</li>
                <li>Produits dont l&apos;emballage d&apos;origine a été ouvert</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">📦 Procédure de retour</h2>
              <ol className="list-decimal list-inside text-taupe space-y-2">
                <li>Contactez-nous à {config.contact_email || 'contact@eliati.fr'} pour nous informer de votre souhait de retour</li>
                <li>Nous vous enverrons les instructions de retour par email</li>
                <li>Renvoyez le produit dans son emballage d&apos;origine, non porté et en parfait état</li>
                <li>Le remboursement sera effectué sous 14 jours après réception du retour</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">💰 Remboursement</h2>
              <p className="text-taupe">
                Le remboursement sera effectué via le même moyen de paiement utilisé lors de l&apos;achat. 
                Les frais de retour sont à la charge du client, sauf en cas de produit défectueux ou d&apos;erreur de notre part.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">🔧 Échange</h2>
              <p className="text-taupe">
                Si vous souhaitez échanger un article contre une autre taille ou un autre modèle, 
                contactez-nous et nous ferons notre possible pour vous satisfaire.
              </p>
            </section>

            <p className="text-sm text-taupe/60 pt-4 border-t border-gold/20">
              Cette politique de retour par défaut peut être personnalisée dans l&apos;administration du site.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

