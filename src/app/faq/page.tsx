'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLegalTexts, useSiteConfig } from '@/hooks/useSiteSettings'

const DEFAULT_FAQ = [
  {
    question: "Quels sont les délais de livraison ?",
    answer: "Les commandes sont préparées sous 1-2 jours ouvrés. La livraison prend ensuite 2-4 jours selon le transporteur choisi."
  },
  {
    question: "Puis-je retourner mon bijou ?",
    answer: "Oui, vous disposez de 14 jours pour retourner votre bijou non personnalisé. Les bijoux personnalisés (gravure, charms) ne peuvent pas être retournés."
  },
  {
    question: "Les bijoux sont-ils hypoallergéniques ?",
    answer: "Oui, tous nos bijoux sont en acier inoxydable 316L, un matériau hypoallergénique qui ne contient pas de nickel libre."
  },
  {
    question: "Comment entretenir mes bijoux ?",
    answer: "L'acier inoxydable est très résistant. Évitez le contact prolongé avec l'eau chlorée ou salée. Nettoyez avec un chiffon doux."
  },
  {
    question: "Proposez-vous des emballages cadeaux ?",
    answer: "Oui, tous nos bijoux sont livrés dans un écrin élégant, prêt à offrir."
  },
  {
    question: "Quels modes de paiement acceptez-vous ?",
    answer: "Nous acceptons PayPal et les cartes bancaires (Visa, Mastercard) via PayPal."
  },
]

export default function FAQPage() {
  const { texts, loading } = useLegalTexts()
  const { config } = useSiteConfig()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory via-champagne/10 to-ivory">
      {/* Header */}
      <div className="bg-gradient-to-r from-champagne/30 via-rose/20 to-champagne/30 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-sm text-taupe hover:text-leather transition-colors mb-4 inline-flex items-center gap-2">
            ← Retour à la boutique
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-leather mt-4">Questions fréquentes</h1>
          <p className="text-taupe mt-2">Tout ce que vous devez savoir sur nos bijoux et services</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-4"></div>
            <p className="text-taupe">Chargement...</p>
          </div>
        ) : texts.faq ? (
          <div className="prose prose-taupe max-w-none">
            <div className="whitespace-pre-line text-taupe leading-relaxed bg-white/80 rounded-2xl p-8 border border-gold/20">
              {texts.faq}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {DEFAULT_FAQ.map((faq, index) => (
              <div 
                key={index}
                className="bg-white/80 rounded-xl border border-gold/20 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-champagne/10 transition-colors"
                >
                  <span className="font-medium text-leather">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-taupe transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-4 text-taupe">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-champagne/40 to-rose/30 rounded-2xl p-8 text-center">
          <h2 className="font-display text-xl text-leather mb-2">Vous avez une autre question ?</h2>
          <p className="text-taupe mb-6">Notre équipe est là pour vous aider</p>
          <a 
            href={`mailto:${config.contact_email || 'contact@eliati.fr'}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-leather text-ivory rounded-xl hover:bg-leather/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  )
}

