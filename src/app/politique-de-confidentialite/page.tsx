import Header from '@/components/Header'
import Footer from '@/components/Footer'

const contactEmail = 'contateliati@gmail.com'

const dataUses = [
  {
    title: 'Commandes et paiement',
    description:
      "Nous collectons vos coordonnées (nom, email, adresse) pour préparer les commandes et vous tenir informés de l'avancement. Le paiement est assuré via PayPal ; aucune donnée bancaire n'est stockée sur nos serveurs.",
  },
  {
    title: 'Gestion du compte client',
    description:
      "Lorsque vous créez un compte ou passez une commande, vos informations sont gérées sur notre espace Supabase sécurisé. Vous pouvez à tout moment demander leur suppression ou rectification.",
  },
  {
    title: 'Communication',
    description:
      "Votre adresse e-mail est utilisée pour vous envoyer les confirmations, les notifications liées à votre commande et répondre à vos demandes. Aucun message promotionnel n'est envoyé sans votre consentement explicite.",
  },
]

const processors = [
  {
    name: 'Supabase Inc.',
    role: 'Base de données, authentification, stockage de fichiers (images produits, documents)',
    address: '970 Toa Payoh North, #07-04, Singapore 318992',
    website: 'https://supabase.com',
  },
  {
    name: 'Vercel Inc.',
    role: 'Hébergement et diffusion du site web',
    address: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
    website: 'https://vercel.com',
  },
  {
    name: 'PayPal (Europe) S.à.r.l. et Cie, S.C.A.',
    role: 'Traitement des paiements',
    address: '22-24 Boulevard Royal, L-2449 Luxembourg',
    website: 'https://www.paypal.com',
  },
]

export const revalidate = 3600

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-16">
        <section className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-gold/20 px-4 py-1 text-sm font-medium text-leather">
            Documents légaux
          </span>
          <h1 className="font-display text-4xl text-leather">Politique de confidentialité</h1>
          <p className="text-sm text-taupe">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          <p className="text-lg text-taupe leading-relaxed">
            Cette politique décrit la manière dont EliAti collecte, utilise et protège les données personnelles lors de votre navigation et de vos achats sur notre boutique en ligne.
          </p>
        </section>

        <section className="space-y-6">
          {dataUses.map((item) => (
            <article key={item.title} className="space-y-3 rounded-3xl border border-champagne/30 bg-champagne/20 p-8">
              <h2 className="font-display text-2xl text-leather">{item.title}</h2>
              <p className="text-sm text-taupe leading-relaxed">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-gold/20 bg-white/80 p-8 backdrop-blur-sm shadow-sm space-y-4">
          <h2 className="font-display text-2xl text-leather">Prestataires et sous-traitants</h2>
          <p className="text-sm text-taupe leading-relaxed">
            Nous partageons uniquement les données nécessaires avec des services tiers indispensables au fonctionnement du site.
          </p>
          <ul className="space-y-4">
            {processors.map((processor) => (
              <li key={processor.name} className="rounded-2xl border border-gold/20 bg-white/70 p-6">
                <p className="font-display text-lg text-leather">{processor.name}</p>
                <p className="text-sm text-taupe leading-relaxed">{processor.role}</p>
                <p className="text-xs text-taupe mt-2">
                  Adresse : {processor.address}
                  <br />
                  Site :{' '}
                  <a href={processor.website} className="text-leather underline" target="_blank" rel="noopener noreferrer">
                    {processor.website}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-rose/20 bg-rose/10 p-8 space-y-4 text-sm text-taupe leading-relaxed">
          <h2 className="font-display text-2xl text-leather">Vos droits</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, d&apos;opposition et de portabilité concernant vos données. Pour exercer ces droits, écrivez-nous à{' '}
            <a href={`mailto:${contactEmail}`} className="text-leather underline">
              {contactEmail}
            </a>.
          </p>
          <p>
            Nous répondons à toute demande sous 30 jours. Vous pouvez également déposer une plainte auprès de la CNIL si vous estimez que vos droits ne sont pas respectés.
          </p>
        </section>

        <section className="rounded-3xl border border-gold/30 bg-white/70 p-8 space-y-3 text-sm text-taupe leading-relaxed">
          <h2 className="font-display text-2xl text-leather">Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques (chiffrement HTTPS, accès restreints) et organisationnelles pour protéger vos données. Malgré tout, aucun système n&apos;est totalement sécurisé ; restez vigilants et contactez-nous en cas de suspicion d&apos;usage frauduleux.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
