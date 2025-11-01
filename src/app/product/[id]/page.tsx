import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import AddToCartButton from '@/components/AddToCartButton'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: product } = await supabase
    .from('products')
    .select('*,product_images(url,alt),categories(name)')
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

            {/* Gestion stock et précommande */}
            {product.stock_status === 'out_of_stock' ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-red-700 font-medium">Rupture de stock</p>
                <p className="text-red-600 text-sm mt-1">Ce produit n&apos;est plus disponible pour le moment</p>
              </div>
            ) : product.stock_status === 'preorder' ? (
              <>
                <div className="p-4 bg-gold/10 border border-gold/30 rounded-xl mb-4">
                  <p className="text-leather font-medium mb-1">📅 Précommande - Édition limitée</p>
                  <p className="text-taupe text-sm">
                    Plus que {(product.preorder_limit || 0) - (product.preorder_count || 0)} places disponibles sur {product.preorder_limit} !
                  </p>
                  {product.preorder_available_date && (
                    <p className="text-taupe text-xs mt-2">
                      Disponible le {new Date(product.preorder_available_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                {(product.preorder_count || 0) < (product.preorder_limit || 0) ? (
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
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                    <p className="text-red-700 font-medium">Précommandes complètes</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {product.stock_quantity !== null && product.stock_quantity !== undefined && (
                  <div className={`p-3 rounded-xl mb-3 ${product.stock_status === 'low_stock' ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
                    <p className={`text-sm font-medium ${product.stock_status === 'low_stock' ? 'text-orange-700' : 'text-green-700'}`}>
                      {product.stock_status === 'low_stock' ? '⚠️ Plus que' : '✓'} {product.stock_quantity} en stock
                    </p>
                  </div>
                )}
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
              </>
            )}

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

