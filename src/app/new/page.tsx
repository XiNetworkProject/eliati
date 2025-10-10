import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import ProductGrid from '@/components/ProductGrid'
import { supabase } from '@/lib/supabase'

export default async function NewPage() {
  const { data: products } = await supabase
    .from('products')
    .select('id,name,slug,price_cents,compare_at_cents,product_images(url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(16)

  const items = (products ?? []).map((p) => ({
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
      <Section title="Nouveautés">
        <p className="text-taupe mb-6">
          Découvrez nos dernières créations, ajoutées récemment à la collection.
        </p>
        <ProductGrid items={items} />
      </Section>
      <Footer />
    </div>
  )
}

