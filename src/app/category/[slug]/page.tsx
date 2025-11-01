import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import ProductGrid from '@/components/ProductGrid'
import { supabase } from '@/lib/supabase'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { data: cat } = await supabase
    .from('categories')
    .select('id,name,description')
    .eq('slug', slug)
    .single()

  const { data: products } = await supabase
    .from('products')
    .select('id,name,slug,price_cents,compare_at_cents,product_images(url)')
    .eq('category_id', cat?.id ?? null)
    .eq('status', 'active')

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
      <Section title={cat?.name ?? 'Catégorie'}>
        {cat?.description && (
          <p className="text-taupe mb-4">{cat.description}</p>
        )}
        <ProductGrid items={items} />
      </Section>
      <Footer />
    </div>
  )
}

