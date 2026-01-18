import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MainCarousel from '@/components/MainCarousel'
import CategoryTiles from '@/components/CategoryTiles'
import Section from '@/components/Section'
import ProductGrid from '@/components/ProductGrid'
import { supabase } from '@/lib/supabase'
import { getSiteConfig } from '@/lib/site-settings'
import Link from 'next/link'

export default async function Home() {
  const siteConfig = await getSiteConfig()
  const { data: products } = await supabase
    .from('products')
    .select('id,name,slug,price_cents,compare_at_cents,product_images(url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  const mapped = (products ?? []).map((p, index) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price_cents: p.price_cents,
    compare_at_cents: p.compare_at_cents,
    image: p.product_images?.[0]?.url ?? null,
    is_new: index < 4,
  }))

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative gradient-hero overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gold/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-rose/20 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-champagne/30 blur-3xl" />
          
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gold/30 mb-8 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-sm text-leather font-medium">Nouvelle collection disponible</span>
              </div>
              
              {/* Title */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-leather mb-6 animate-fade-in-up stagger-1">
                Bijoux pensés à<br />
                <span className="text-gradient">quatre mains</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-taupe max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2">
                Des colliers délicats aux bagues fines, chaque pièce est assemblée avec soin 
                dans des tonalités ivory, champagne et or rose.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
                <Link 
                  href="/new" 
                  className="btn-premium px-8 py-4 bg-leather text-ivory rounded-full font-semibold text-lg shadow-lg shadow-leather/20 hover:shadow-xl hover:shadow-leather/30 transition-all duration-300"
                >
                  Découvrir la collection
                </Link>
                <Link 
                  href="/info/charms-personnalises" 
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-leather rounded-full font-semibold text-lg border-2 border-gold/30 hover:border-gold hover:bg-gold/10 transition-all duration-300"
                >
                  ✨ Personnaliser
                </Link>
              </div>
            </div>
          </div>
          
          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ivory to-transparent" />
        </section>

        {/* Carousel Section */}
        <section className="py-8 sm:py-12 bg-ivory">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <MainCarousel />
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-ivory via-champagne/5 to-ivory">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1 rounded-full bg-gold/10 text-gold text-sm font-semibold mb-4">
                Explorer
              </span>
              <h2 className="font-display text-4xl sm:text-5xl text-leather mb-4">
                Nos catégories
              </h2>
              <p className="text-taupe max-w-xl mx-auto">
                Parcourez nos collections et trouvez le bijou qui vous ressemble
              </p>
            </div>
            <CategoryTiles />
          </div>
        </section>

        {/* New Products Section */}
        <section className="py-16 sm:py-20 bg-ivory">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <span className="inline-block px-4 py-1 rounded-full bg-rose/20 text-mauve text-sm font-semibold mb-4">
                  Nouveautés
                </span>
                <h2 className="font-display text-4xl sm:text-5xl text-leather">
                  Dernières créations
                </h2>
              </div>
              <Link 
                href="/new" 
                className="group inline-flex items-center gap-2 text-leather font-medium hover:text-gold transition-colors"
              >
                Voir tout
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <ProductGrid items={mapped} />
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-champagne/30 via-rose/10 to-champagne/20 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-rose/20 blur-3xl" />
          
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-1 rounded-full bg-white/80 text-leather text-sm font-semibold mb-6">
                  Notre histoire
                </span>
                <h2 className="font-script text-4xl sm:text-5xl text-leather mb-6">
                  Bijoux pensés à quatre mains, faits pour durer.
                </h2>
                <p className="text-taupe text-lg leading-relaxed mb-8 whitespace-pre-line">
                  {siteConfig.description ||
                    `Chez ${siteConfig.site_name}, deux sœurs transforment les souvenirs
en parures. Des colliers délicats aux bagues fines, chaque pièce est
assemblée avec soin, dans des tonalités ivory, champagne et or rose.
Un style doux, intemporel, qui accompagne chaque moment.`}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gold/20">
                    <span className="text-2xl">💎</span>
                    <span className="text-sm font-medium text-leather">Acier 316L</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gold/20">
                    <span className="text-2xl">🌿</span>
                    <span className="text-sm font-medium text-leather">Hypoallergénique</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gold/20">
                    <span className="text-2xl">✨</span>
                    <span className="text-sm font-medium text-leather">Fait main</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-champagne to-rose/50 shadow-2xl shadow-leather/10 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="font-script text-6xl text-leather/20 mb-4">EliAti</div>
                      <p className="text-taupe text-sm">Créations uniques depuis 2024</p>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 px-6 py-3 bg-white rounded-2xl shadow-xl border border-gold/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-xs text-taupe">Créatrices</p>
                      <p className="text-sm font-semibold text-leather">Sœurs passionnées</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-12 bg-ivory border-y border-gold/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: '🚚', title: 'Livraison offerte', subtitle: 'Dès 50€ d\'achat' },
                { icon: '↩️', title: 'Retours gratuits', subtitle: 'Sous 30 jours' },
                { icon: '🛡️', title: 'Garantie 2 ans', subtitle: 'Sur tous nos bijoux' },
                { icon: '💳', title: 'Paiement sécurisé', subtitle: 'PayPal & CB' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-medium text-leather text-sm">{item.title}</h3>
                  <p className="text-xs text-taupe">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
