import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseServer } from '@/lib/supabase-server'
import ProductPageClient from '@/components/ProductPageClient'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Charger le produit avec images et catégorie
  const { data: product, error } = await supabaseServer
    .from('products')
    .select('*,product_images(id,url,alt,sort_order,color_name),categories(id,name,slug)')
    .eq('id', id)
    .single()

  // Charger les variantes du produit
  const { data: variantsData } = await supabaseServer
    .from('product_variants')
    .select('id, color_name, stock_quantity, low_stock_threshold, price_cents, is_active')
    .eq('product_id', id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Log pour debug
  if (error) {
    console.error('Erreur chargement produit:', error)
  }

  if (!product) {
    return (
      <div className="min-h-screen gradient-hero">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center animate-fade-in-up">
          <div className="card-elegant p-12">
            <span className="text-6xl mb-6 block">💎</span>
            <h1 className="font-display text-4xl text-leather mb-4">Produit introuvable</h1>
            <p className="text-taupe mb-8 max-w-md mx-auto">
              Ce produit n&apos;existe pas ou a été retiré de notre collection.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-leather text-ivory rounded-full hover:bg-leather/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la boutique
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const recommendedSelect =
    'id, name, slug, price_cents, compare_at_cents, average_rating, review_count, product_images(url)'
  const mapRecommended = (p: {
    id: string
    name: string
    slug: string
    price_cents: number
    compare_at_cents: number | null
    average_rating: number | null
    review_count: number | null
    product_images?: Array<{ url?: string | null }> | null
  }) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price_cents: p.price_cents,
    compare_at_cents: p.compare_at_cents,
    image_url: p.product_images?.[0]?.url || null,
    average_rating: p.average_rating,
    review_count: p.review_count,
  })

  const { data: sameCategoryData } = product.categories?.id
    ? await supabaseServer
        .from('products')
        .select(recommendedSelect)
        .eq('category_id', product.categories.id)
        .neq('id', product.id)
        .eq('status', 'active')
        .limit(4)
    : { data: [] }

  const { data: topRatedData } = await supabaseServer
    .from('products')
    .select(recommendedSelect)
    .neq('id', product.id)
    .eq('status', 'active')
    .gt('average_rating', 0)
    .order('average_rating', { ascending: false })
    .limit(4)

  const { data: randomPool } = await supabaseServer
    .from('products')
    .select(recommendedSelect)
    .neq('id', product.id)
    .eq('status', 'active')
    .limit(20)

  const shuffledRandom = (randomPool || []).slice()
  for (let i = shuffledRandom.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledRandom[i], shuffledRandom[j]] = [shuffledRandom[j], shuffledRandom[i]]
  }

  const { data: newArrivalsData } = await supabaseServer
    .from('products')
    .select(recommendedSelect)
    .neq('id', product.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4)

  const sortedImages = Array.isArray(product.product_images)
    ? [...product.product_images].sort(
        (a: { sort_order?: number | null }, b: { sort_order?: number | null }) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0)
      )
    : []

  const primaryImage = sortedImages[0]?.url ?? product.product_images?.[0]?.url ?? '/placeholder.jpg'

  const parseCharmOptions = (): Array<{ label: string; price_cents: number }> => {
    const raw = product.charms_options
    if (!raw) return []

    if (Array.isArray(raw)) {
      return raw
        .map((option) => ({
          label: typeof option?.label === 'string' ? option.label : '',
          price_cents: typeof option?.price_cents === 'number' ? option.price_cents : 0,
        }))
        .filter((option) => option.label)
    }

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          return parsed
            .map((option) => {
              if (option && typeof (option as { label?: unknown }).label === 'string') {
                return {
                  label: (option as { label: string }).label,
                  price_cents: typeof (option as { price_cents?: unknown }).price_cents === 'number'
                    ? (option as { price_cents: number }).price_cents
                    : 0,
                }
              }
              return null
            })
            .filter((option): option is { label: string; price_cents: number } => Boolean(option && option.label))
        }
      } catch {
        // ignore JSON error, fallback to legacy format
      }

      return raw
        .split(/\r?\n|,/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          const [label, pricePart] = line.split('|').map((part) => part.trim())
          const price = pricePart ? parseFloat(pricePart.replace(',', '.')) : 0
          return {
            label,
            price_cents: Number.isFinite(price) ? Math.round(price * 100) : 0,
          }
        })
    }

    return []
  }

  const charmOptions = parseCharmOptions()

  // Transformer les images pour le composant client
  const galleryImages = sortedImages.map((img: { url: string; alt?: string | null; sort_order?: number | null; color_name?: string | null }) => ({
    url: img.url,
    alt: img.alt ?? null,
    sort_order: img.sort_order ?? null,
    color_name: img.color_name ?? null,
  }))

  // Transformer les variantes pour le composant client
  const variants = (variantsData || []).map((v) => ({
    id: v.id,
    color_name: v.color_name,
    stock_quantity: v.stock_quantity,
    low_stock_threshold: v.low_stock_threshold,
    price_cents: v.price_cents,
    is_active: v.is_active,
  }))

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        <ProductPageClient
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price_cents: product.price_cents,
            compare_at_cents: product.compare_at_cents,
            stock_status: product.stock_status,
            stock_quantity: product.stock_quantity,
            preorder_limit: product.preorder_limit,
            preorder_count: product.preorder_count,
            preorder_available_date: product.preorder_available_date,
            weight_grams: product.weight_grams,
          }}
          categoryId={product.categories?.id ?? null}
          categoryName={product.categories?.name ?? null}
          categorySlug={product.categories?.slug ?? null}
          charmOptions={charmOptions}
          images={galleryImages}
          primaryImage={primaryImage}
          variants={variants}
          recommendations={{
            sameCategory: (sameCategoryData || []).map(mapRecommended),
            topRated: (topRatedData || []).map(mapRecommended),
            randomPicks: shuffledRandom.slice(0, 4).map(mapRecommended),
            newArrivals: (newArrivalsData || []).map(mapRecommended),
          }}
        />
      </main>
      <Footer />
    </div>
  )
}
