import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import AddToCartButton from '@/components/AddToCartButton'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: product } = await supabase
    .from('products')
    .select('*,product_images(url,alt),categories(name)')
    .eq('id', params.id)
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

  const price = (product.price_cents / 100).toFixed(2).replace('.', ',')
  const comparePrice = product.compare_at_cents
    ? (product.compare_at_cents / 100).toFixed(2).replace('.', ',')
    : null

  const onSale =
    product.compare_at_cents &&
    product.compare_at_cents > product.price_cents

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Galerie d'images */}
          <div className="space-y-4">
            <div className="aspect-square bg-champagne/30 rounded-2xl overflow-hidden border border-gold/30 relative">
              <Image
                src={product.product_images?.[0]?.url ?? '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {product.product_images && product.product_images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.product_images.slice(1).map((img: { url: string; alt: string | null }, i: number) => (
                  <div
                    key={i}
                    className="aspect-square bg-champagne/30 rounded-lg overflow-hidden border border-gold/30 relative"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt ?? ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations produit */}
          <div className="space-y-6">
            {product.categories && (
              <Badge className="bg-champagne text-leather">
                {product.categories.name}
              </Badge>
            )}

            <h1 className="font-display text-4xl text-leather">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-taupe leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-leather">
                {price} €
              </span>
              {comparePrice && onSale && (
                <>
                  <span className="text-xl text-taupe line-through">
                    {comparePrice} €
                  </span>
                  <Badge className="bg-rose text-leather">Promo</Badge>
                </>
              )}
            </div>

            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price_cents: product.price_cents,
                image: product.product_images?.[0]?.url,
              }}
              className="w-full"
            />

            <div className="border-t border-gold/30 pt-6 space-y-2 text-sm text-taupe">
              <p>✓ Livraison offerte dès 50€</p>
              <p>✓ Retours gratuits sous 30 jours</p>
              <p>✓ Garantie 2 ans</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

