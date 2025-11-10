import Header from '@/components/Header'
import Footer from '@/components/Footer'

const company = {
  name: 'Leniept Atlantis',
  siren: '933 348 914',
  siret: '933 348 914 00013',
  address: 'Rue de Dublin, 59760 Grande-Synthe, France',
  email: 'contateliati@gmail.com',
}

export const revalidate = 3600

const sections = [
  {
    title: 'Champ d’application',
    content:
      "Les présentes conditions générales de vente (CGV) régissent les commandes passées sur la boutique EliAti. Elles précisent les droits et obligations des parties dans le cadre de la vente de bijoux et accessoires proposés sur le site.",
  },
  {
    title: 'Produits',
    content:
      "Les descriptions, photos et vidéos sont fournies à titre indicatif. Chaque création est réalisée à la main et peut présenter de légères variations, sans incidence sur la qualité ou l’usage.",
  },
  {
    title: 'Prix et paiement',
    content:
      "Les prix sont exprimés en euros TTC. Le paiement s’effectue via PayPal et les moyens de paiement acceptés sur cette plateforme. La commande est validée après confirmation du règlement.",
  },
  {
    title: 'Livraison',
    content:
      "Les envois sont effectués via Colissimo. Les délais moyens communiqués sont indicatifs. Les frais de port et l’estimation du délai apparaissent avant la confirmation de la commande.",
  },
  {
    title: 'Rétractation et retours',
    content:
      "Conformément à la loi, l’acheteur dispose de 14 jours à réception pour se rétracter. Les bijoux personnalisés ne peuvent faire l’objet d’un retour. Contactez-nous à l’adresse ci-dessous pour organiser le renvoi.",
  },
  {
    title: 'Garanties et responsabilité',
    content:
      "EliAti garantit la conformité des produits. La responsabilité de la marque ne saurait être engagée en cas d’usage inapproprié. Pour toute question, un service client reste disponible par email.",
  },
  {
    title: 'Service client',
    content:
      "Pour toute demande d’information, SAV ou réclamation, écrivez à l’adresse : contateliati@gmail.com. Réponse sous 48h ouvrées.",
  },
]

export default function CgvPage() {
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-16">
        <section className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-gold/20 px-4 py-1 text-sm font-medium text-leather">
            Documents légaux
          </span>
          <h1 className="font-display text-4xl text-leather">Conditions Générales de Vente</h1>
          <p className="text-sm text-taupe">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          <p className="text-lg text-taupe leading-relaxed">
            Les présentes conditions encadrent la relation commerciale entre {company.name} et toute personne effectuant un achat sur la boutique EliAti.
          </p>
        </section>

        <section className="rounded-3xl border border-gold/20 bg-white/80 p-8 backdrop-blur-sm shadow-sm">
          <h2 className="font-display text-2xl text-leather mb-4">Éditeur</h2>
          <ul className="space-y-2 text-sm text-taupe">
            <li>
              <span className="font-medium text-leather">Entreprise&nbsp;:</span> {company.name}
            </li>
            <li>
              <span className="font-medium text-leather">SIREN&nbsp;:</span> {company.siren} – SIRET : {company.siret}
            </li>
            <li>
              <span className="font-medium text-leather">Adresse&nbsp;:</span> {company.address}
            </li>
            <li>
              <span className="font-medium text-leather">Contact&nbsp;:</span>{' '}
              <a href={`mailto:${company.email}`} className="text-leather underline">
                {company.email}
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-6">
          {sections.map((item) => (
            <article key={item.title} className="space-y-3 rounded-3xl border border-champagne/30 bg-champagne/20 p-8">
              <h2 className="font-display text-2xl text-leather">{item.title}</h2>
              <p className="text-sm text-taupe leading-relaxed">{item.content}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}
