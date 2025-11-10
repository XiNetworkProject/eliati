import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import ProductGallery from '@/components/ProductGallery'
import ProductConfigurator from '@/components/ProductConfigurator'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: product } = await supabase
    .from('products')
    .select('*,product_images(url,alt,sort_order),categories(name)')
    .eq('id', id)
    .single()

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
        .map((option: any) => ({
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
            .map((option: any) => ({
              label: typeof option?.label === 'string' ? option.label : '',
              price_cents: typeof option?.price_cents === 'number' ? option.price_cents : 0,
            }))
            .filter((option) => option.label)
        }
      } catch (error) {
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

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Galerie d'images */}
          <ProductGallery
            productName={product.name}
            images={sortedImages}
          />

          {/* Informations produit + personnalisation */}
          <ProductConfigurator
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
            categoryName={product.categories?.name}
            charmOptions={charmOptions}
            primaryImage={primaryImage}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

