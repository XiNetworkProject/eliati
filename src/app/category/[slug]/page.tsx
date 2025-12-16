import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CategoryClient from '@/components/CategoryClient'
import CompareBar from '@/components/CompareBar'
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
    .select('id,name,slug,price_cents,compare_at_cents,created_at,product_images(url)')
    .eq('category_id', cat?.id ?? null)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const items = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price_cents: p.price_cents,
    compare_at_cents: p.compare_at_cents,
    image: p.product_images?.[0]?.url ?? null,
    created_at: p.created_at,
  }))

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <CategoryClient 
          products={items} 
          categoryName={cat?.name ?? 'Catégorie'}
          categoryDescription={cat?.description}
        />
      </main>
      <Footer />
      <CompareBar />
    </div>
  )
}
