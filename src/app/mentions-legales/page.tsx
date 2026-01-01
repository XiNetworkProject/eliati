'use client'
import Link from 'next/link'
import { useLegalTexts, useSiteConfig } from '@/hooks/useSiteSettings'

export default function MentionsLegalesPage() {
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
          <h1 className="font-display text-3xl md:text-4xl text-leather mt-4">Mentions légales</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-4"></div>
            <p className="text-taupe">Chargement...</p>
          </div>
        ) : texts.mentions_legales ? (
          <div className="prose prose-taupe max-w-none">
            <div className="whitespace-pre-line text-taupe leading-relaxed">
              {texts.mentions_legales}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl p-8 border border-gold/20">
            <h2 className="font-display text-xl text-leather mb-4">Éditeur du site</h2>
            <p className="text-taupe mb-6">
              <strong>{config.site_name || 'EliAti'}</strong><br />
              {config.address && <>{config.address}<br /></>}
              {config.postal_code && config.city && <>{config.postal_code} {config.city}<br /></>}
              {config.country && <>{config.country}<br /></>}
              {config.contact_email && <>Email : {config.contact_email}<br /></>}
              {config.contact_phone && <>Téléphone : {config.contact_phone}</>}
            </p>

            <h2 className="font-display text-xl text-leather mb-4 mt-8">Hébergement</h2>
            <p className="text-taupe mb-6">
              Ce site est hébergé par Vercel Inc.<br />
              440 N Barranca Ave #4133<br />
              Covina, CA 91723<br />
              États-Unis
            </p>

            <h2 className="font-display text-xl text-leather mb-4 mt-8">Propriété intellectuelle</h2>
            <p className="text-taupe">
              L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos) est protégé par le droit d&apos;auteur. 
              Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>

            <p className="text-sm text-taupe/60 mt-8 pt-4 border-t border-gold/20">
              Ces mentions légales par défaut peuvent être personnalisées dans l&apos;administration du site.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
