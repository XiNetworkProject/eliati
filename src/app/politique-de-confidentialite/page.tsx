'use client'
import Link from 'next/link'
import { useLegalTexts, useSiteConfig } from '@/hooks/useSiteSettings'

export default function PolitiqueConfidentialitePage() {
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
          <h1 className="font-display text-3xl md:text-4xl text-leather mt-4">Politique de confidentialité</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-4"></div>
            <p className="text-taupe">Chargement...</p>
          </div>
        ) : texts.politique_confidentialite ? (
          <div className="prose prose-taupe max-w-none">
            <div className="whitespace-pre-line text-taupe leading-relaxed">
              {texts.politique_confidentialite}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl p-8 border border-gold/20 space-y-8">
            <section>
              <h2 className="font-display text-xl text-leather mb-4">Collecte des données</h2>
              <p className="text-taupe">
                Nous collectons les informations que vous nous fournissez lors de votre commande : 
                nom, prénom, adresse email, adresse postale et numéro de téléphone. 
                Ces données sont nécessaires au traitement et à la livraison de votre commande.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">Utilisation des données</h2>
              <p className="text-taupe">
                Vos données personnelles sont utilisées uniquement pour :
              </p>
              <ul className="list-disc list-inside text-taupe mt-2 space-y-1">
                <li>Traiter et expédier vos commandes</li>
                <li>Vous contacter concernant votre commande</li>
                <li>Vous envoyer des communications marketing (si vous y avez consenti)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">Protection des données</h2>
              <p className="text-taupe">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données 
                personnelles contre tout accès, modification ou divulgation non autorisés.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">Vos droits</h2>
              <p className="text-taupe">
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, 
                de suppression et de portabilité de vos données personnelles. 
                Pour exercer ces droits, contactez-nous à : {config.contact_email || 'contact@eliati.fr'}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-leather mb-4">Cookies</h2>
              <p className="text-taupe">
                Notre site utilise des cookies essentiels au fonctionnement du panier d&apos;achat 
                et à la mémorisation de vos préférences. Aucun cookie publicitaire n&apos;est utilisé 
                sans votre consentement.
              </p>
            </section>

            <p className="text-sm text-taupe/60 pt-4 border-t border-gold/20">
              Cette politique de confidentialité par défaut peut être personnalisée dans l&apos;administration du site.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
