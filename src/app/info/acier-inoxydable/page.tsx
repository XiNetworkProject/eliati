import Header from '@/components/Header'
import Footer from '@/components/Footer'

const points = [
  {
    title: 'Résistance au quotidien',
    description:
      "L'acier inoxydable 316L résiste à l'eau, à la transpiration et au parfum. Il ne rouille pas et ne ternit pas, même porté tous les jours.",
  },
  {
    title: 'Hypoallergénique',
    description:
      "Les bijoux en acier inoxydable conviennent à la plupart des peaux sensibles. Il est sans nickel et limite les réactions cutanées.",
  },
  {
    title: 'Entretien facile',
    description:
      "Un simple chiffon doux ou un peu d'eau savonneuse suffit pour lui redonner son éclat. Aucun produit spécifique n'est nécessaire.",
  },
]

export const revalidate = 3600

export default function StainlessSteelPage() {
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-16">
        <section className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-gold/20 px-4 py-1 text-sm font-medium text-leather">
            Matériaux EliAti
          </span>
          <h1 className="font-display text-4xl text-leather">Pourquoi l&apos;acier inoxydable&nbsp;?</h1>
          <p className="text-lg text-taupe leading-relaxed">
            Chez EliAti, nous avons choisi l&apos;acier inoxydable 316L pour la majorité de nos créations. Ce matériau
            combine élégance et durabilité, pour que vos bijoux vous accompagnent longtemps sans perdre leur éclat.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {points.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-gold/30 bg-white/80 p-6 backdrop-blur-sm shadow-sm"
            >
              <h2 className="font-display text-xl text-leather mb-3">{item.title}</h2>
              <p className="text-sm text-taupe leading-relaxed">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-gold/20 bg-champagne/20 p-8 space-y-4">
          <h2 className="font-display text-2xl text-leather">Comment entretenir vos bijoux</h2>
          <ul className="list-disc pl-6 space-y-2 text-sm text-taupe">
            <li>Séchez-les après un contact prolongé avec l&apos;eau pour conserver leur brillance.</li>
            <li>Rangez-les dans leur pochon pour éviter les rayures avec d&apos;autres bijoux.</li>
            <li>Évitez les produits abrasifs : un chiffon doux suffit pour les polir.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-rose/20 bg-rose/10 p-8 space-y-4">
          <h2 className="font-display text-2xl text-leather">Un choix responsable</h2>
          <p className="text-sm text-taupe leading-relaxed">
            L&apos;acier inoxydable est recyclable et ne nécessite aucun placage supplémentaire. C&apos;est un alliage durable
            qui réduit l&apos;impact environnemental par rapport aux bijoux plaqués susceptibles de s&apos;user rapidement.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
