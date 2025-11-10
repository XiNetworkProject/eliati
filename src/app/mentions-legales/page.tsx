import Header from '@/components/Header'
import Footer from '@/components/Footer'

const legalInfo = {
  companyName: 'Leniept Atlantis',
  legalForm: 'Entrepreneur individuel',
  siren: '933 348 914',
  siret: '933 348 914 00013',
  vat: 'FR37933348914',
  naf: '8121Z (Nettoyage courant des bâtiments)',
  registrationDate: '01/09/2024',
  address: 'Rue de Dublin, 59760 Grande-Synthe, France',
  email: 'contateliati@gmail.com',
}

const hostInfo = {
  name: 'Vercel Inc.',
  address: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  website: 'https://vercel.com',
}

const supabaseInfo = {
  name: 'Supabase Inc.',
  address: '970 Toa Payoh North, #07-04, Singapore 318992',
  website: 'https://supabase.com',
}

export const revalidate = 3600

export default function LegalNoticePage() {
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-16">
        <section className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-gold/20 px-4 py-1 text-sm font-medium text-leather">
            Informations légales
          </span>
          <h1 className="font-display text-4xl text-leather">Mentions légales</h1>
          <p className="text-lg text-taupe leading-relaxed">
            Conformément aux dispositions des articles 6-III et 19 de la Loi n°2004-575 du 21 juin 2004 pour la confiance
            dans l&apos;économie numérique, nous vous informons des éléments suivants concernant l&apos;édition et
            l&apos;hébergement du site EliAti.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gold/20 bg-white/80 p-8 backdrop-blur-sm shadow-sm">
          <h2 className="font-display text-2xl text-leather">Éditeur du site</h2>
          <ul className="space-y-2 text-sm text-taupe">
            <li>
              <span className="font-medium text-leather">Raison sociale&nbsp;:</span> {legalInfo.companyName}
            </li>
            <li>
              <span className="font-medium text-leather">Forme juridique&nbsp;:</span> {legalInfo.legalForm}
            </li>
            <li>
              <span className="font-medium text-leather">SIREN&nbsp;:</span> {legalInfo.siren}
            </li>
            <li>
              <span className="font-medium text-leather">SIRET&nbsp;:</span> {legalInfo.siret}
            </li>
            <li>
              <span className="font-medium text-leather">Numéro de TVA intracommunautaire&nbsp;:</span> {legalInfo.vat}
            </li>
            <li>
              <span className="font-medium text-leather">Code NAF / APE&nbsp;:</span> {legalInfo.naf}
            </li>
            <li>
              <span className="font-medium text-leather">Date d&apos;immatriculation&nbsp;:</span> {legalInfo.registrationDate}
            </li>
            <li>
              <span className="font-medium text-leather">Adresse du siège&nbsp;:</span> {legalInfo.address}
            </li>
            <li>
              <span className="font-medium text-leather">Contact&nbsp;:</span>{' '}
              <a href={`mailto:${legalInfo.email}`} className="text-leather underline">
                {legalInfo.email}
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-champagne/30 bg-champagne/20 p-8">
          <h2 className="font-display text-2xl text-leather">Hébergement</h2>
          <ul className="space-y-2 text-sm text-taupe">
            <li>
              <span className="font-medium text-leather">Hébergeur&nbsp;:</span> {hostInfo.name}
            </li>
            <li>
              <span className="font-medium text-leather">Adresse&nbsp;:</span> {hostInfo.address}
            </li>
            <li>
              <span className="font-medium text-leather">Site web&nbsp;:</span>{' '}
              <a href={hostInfo.website} className="text-leather underline" rel="noopener noreferrer" target="_blank">
                {hostInfo.website}
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-rose/30 bg-rose/10 p-8">
          <h2 className="font-display text-2xl text-leather">Prestataire base de données & stockage</h2>
          <ul className="space-y-2 text-sm text-taupe">
            <li>
              <span className="font-medium text-leather">Service&nbsp;:</span> {supabaseInfo.name}
            </li>
            <li>
              <span className="font-medium text-leather">Adresse&nbsp;:</span> {supabaseInfo.address}
            </li>
            <li>
              <span className="font-medium text-leather">Site web&nbsp;:</span>{' '}
              <a href={supabaseInfo.website} className="text-leather underline" rel="noopener noreferrer" target="_blank">
                {supabaseInfo.website}
              </a>
            </li>
            <li>
              Supabase est utilisé pour l&apos;authentification, la base de données, le stockage des médias et la gestion
              des formulaires. Les données collectées sont hébergées sur leurs serveurs sécurisés.
            </li>
          </ul>
        </section>

        <section className="space-y-3 rounded-3xl border border-rose/20 bg-rose/10 p-8 text-sm text-taupe leading-relaxed">
          <h2 className="font-display text-2xl text-leather">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu présent sur ce site (textes, images, graphismes, logo, icônes, vidéos, etc.) est la
            propriété exclusive de {legalInfo.companyName}, sauf mention contraire. Toute reproduction, représentation,
            modification ou adaptation, même partielle, est interdite sans accord préalable.
          </p>
          <p>
            Les marques et logos cités demeurent la propriété de leurs détenteurs respectifs. L&apos;utilisation de ces
            éléments sans autorisation est susceptible de constituer une contrefaçon engageant la responsabilité civile et
            pénale de son auteur.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-gold/30 bg-white/70 p-8 text-sm text-taupe leading-relaxed">
          <h2 className="font-display text-2xl text-leather">Responsabilité</h2>
          <p>
            Les informations diffusées sur ce site sont fournies à titre indicatif. {legalInfo.companyName} met tout en
            œuvre pour assurer l&apos;exactitude des contenus mais ne peut garantir l&apos;absence totale d&apos;erreurs. En cas de
            doute, n&apos;hésitez pas à nous contacter à l&apos;adresse mentionnée ci-dessus.
          </p>
          <p>
            Le site peut contenir des liens vers des sites externes. {legalInfo.companyName} ne peut être tenue
            responsable du contenu de ces sites tiers, sur lesquels elle n&apos;exerce aucun contrôle.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
