import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import ProductPageClient from '@/components/ProductPageClient'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Charger le produit avec images et catégorie
  const { data: product, error } = await supabase
    .from('products')
    .select('*,product_images(id,url,alt,sort_order,color_name),categories(name)')
    .eq('id', id)
    .single()

  // Charger les variantes du produit
  const { data: variantsData } = await supabase
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
      <div>
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl mb-4">Produit introuvable</h1>
          <p className="text-taupe">
            Ce produit n&apos;existe pas ou a été retiré.
          </p>
        </div>
        <Footer />
      </div>
    )
  }

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
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
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
          categoryName={product.categories?.name ?? null}
          charmOptions={charmOptions}
          images={galleryImages}
          primaryImage={primaryImage}
          variants={variants}
        />
      </main>
      <Footer />
    </div>
  )
}
