import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const steps = [
  {
    title: 'Sélectionnez votre bijou',
    description:
      'Choisissez la base (collier, bracelet, boucle d’oreille ou bague) qui servira d’écrin à vos charms personnalisés.',
  },
  {
    title: 'Composez vos charms',
    description:
      'Ajoutez jusqu’à cinq charms par bijou : lettres initiales, symboles porte-bonheur, pierres colorées… Chaque option affiche son supplément éventuel.',
  },
  {
    title: 'Validez et laissez-nous créer',
    description:
      'Nous assemblons votre bijou dans notre atelier dès validation du paiement. Un contrôle qualité est effectué avant l’expédition Colissimo.',
  },
]

const ideas = [
  'Initiales de vos proches ou partenaires',
  'Dates importantes (anniversaire, mariage, naissance)',
  'Symboles porte-bonheur ou astrologiques',
  'Charms thématiques saisonniers (été, fêtes, etc.)',
]

export const revalidate = 3600

export default function CustomCharmsPage() {
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-16 space-y-16">
        <section className="text-center space-y-6">
          <span className="inline-flex items-center rounded-full bg-rose/20 px-4 py-1 text-sm font-medium text-leather">
            Charms personnalisés EliAti
          </span>
          <h1 className="font-display text-4xl text-leather">Créez votre composition unique</h1>
          <p className="text-lg text-taupe leading-relaxed max-w-3xl mx-auto">
            Mixez lettres, symboles et pierres pour donner du sens à votre bijou. Chaque charm s’ajoute en un clic depuis la fiche produit, avec un supplément affiché instantanément dans le panier.
          </p>
          <Link href="/category/bracelets">
            <Button className="px-10 py-6 bg-leather text-ivory hover:bg-leather/90 text-base font-semibold shadow-lg">
              Explorer les bijoux personnalisables
            </Button>
          </Link>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.title} className="rounded-3xl border border-gold/20 bg-white/80 p-6 backdrop-blur-sm shadow-sm">
              <h2 className="font-display text-xl text-leather mb-3">{step.title}</h2>
              <p className="text-sm text-taupe leading-relaxed">{step.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-gold/20 bg-gradient-to-br from-champagne/20 to-rose/10 p-8 space-y-4">
          <h2 className="font-display text-2xl text-leather">Idées de personnalisation</h2>
          <ul className="list-disc pl-6 space-y-2 text-sm text-taupe">
            {ideas.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-leather/20 bg-white/90 p-6 space-y-3 shadow-sm">
            <h3 className="font-display text-xl text-leather">Transparence sur les tarifs</h3>
            <p className="text-sm text-taupe leading-relaxed">
              Chaque charm indique son supplément éventuel. Le total du bijou est recalculé automatiquement dans le panier et au checkout. Aucun frais caché : vous visualisez immédiatement le prix final.
            </p>
          </div>
          <div className="rounded-3xl border border-rose/20 bg-rose/10 p-6 space-y-3 shadow-sm">
            <h3 className="font-display text-xl text-leather">Fabrication rapide</h3>
            <p className="text-sm text-taupe leading-relaxed">
              Toutes les compositions sont montées à la main sous 48h ouvrées. L’envoi se fait via Colissimo suivi avec assurance incluse jusqu’à 200 €.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-gold/20 bg-white/80 p-8 text-sm text-taupe leading-relaxed">
          <p>
            Besoin d’une demande spéciale (plus de cinq charms, longueur spécifique, packaging cadeau) ? Écrivez-nous à{' '}
            <a href="mailto:contateliati@gmail.com" className="text-leather underline">contateliati@gmail.com</a> et nous reviendrons vers vous sous 24h ouvrées.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
