import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MainCarousel from '@/components/MainCarousel'
import CategoryTiles from '@/components/CategoryTiles'
import Section from '@/components/Section'
import ProductGrid from '@/components/ProductGrid'
import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: products } = await supabase
    .from('products')
    .select('id,name,slug,price_cents,compare_at_cents,product_images(url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  const mapped = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price_cents: p.price_cents,
    compare_at_cents: p.compare_at_cents,
    image: p.product_images?.[0]?.url ?? null,
  }))

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">
        <MainCarousel />
        <Section title="Catégories">
          <CategoryTiles />
        </Section>
        <Section title="Nouveautés">
          <ProductGrid items={mapped} />
        </Section>
        <section className="bg-champagne/30 rounded-2xl p-8 text-center">
          <h2 className="font-script text-4xl mb-4 text-leather">
            Bijoux pensés à quatre mains, faits pour durer.
          </h2>
          <p className="text-taupe max-w-2xl mx-auto">
            Chez <strong>EliAtis</strong>, deux sœurs transforment les souvenirs
            en parures. Des colliers délicats aux bagues fines, chaque pièce est
            assemblée avec soin, dans des tonalités ivory, champagne et or rose.
            Un style doux, intemporel, qui accompagne chaque moment.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
