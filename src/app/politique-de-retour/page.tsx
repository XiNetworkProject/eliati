import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getLegalTexts } from '@/lib/site-settings'

export const revalidate = 3600

export default async function PolitiqueRetourPage() {
  const { politique_retour } = await getLegalTexts()

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-16">
        <section className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-gold/20 px-4 py-1 text-sm font-medium text-leather">
            Documents légaux
          </span>
          <h1 className="font-display text-4xl text-leather">Politique de retour</h1>
          <p className="text-sm text-taupe">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          <p className="text-lg text-taupe leading-relaxed">
            La politique de retour est configurable depuis l&apos;espace d&apos;administration.
          </p>
        </section>

        <section className="rounded-3xl border border-gold/20 bg-white/80 p-8 backdrop-blur-sm shadow-sm">
          <div className="whitespace-pre-line text-sm text-taupe leading-relaxed">{politique_retour}</div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
