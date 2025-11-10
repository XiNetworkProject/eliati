'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import AddToCartButton from '@/components/AddToCartButton'

type CharmOption = {
  label: string
  price_cents: number
}

type SelectedCharm = {
  label: string
  price: number
}

export type ProductConfiguratorProps = {
  product: {
    id: string
    name: string
    slug: string
    description: string | null
    price_cents: number
    compare_at_cents: number | null
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
    stock_quantity?: number | null
    preorder_limit?: number | null
    preorder_count?: number | null
    preorder_available_date?: string | null
    weight_grams?: number | null
  }
  categoryName?: string | null
  charmOptions: CharmOption[]
  primaryImage: string
}

export default function ProductConfigurator({
  product,
  categoryName,
  charmOptions,
  primaryImage,
}: ProductConfiguratorProps) {
  const [selectedCharms, setSelectedCharms] = useState<SelectedCharm[]>([])
  const [charmError, setCharmError] = useState('')

  const basePrice = useMemo(() => product.price_cents / 100, [product.price_cents])
  const extrasTotal = useMemo(
    () => selectedCharms.reduce((sum, charm) => sum + charm.price, 0),
    [selectedCharms]
  )
  const totalPrice = useMemo(() => basePrice + extrasTotal, [basePrice, extrasTotal])

  const price = useMemo(() => basePrice.toFixed(2).replace('.', ','), [basePrice])
  const comparePrice = useMemo(
    () =>
      product.compare_at_cents
        ? (product.compare_at_cents / 100).toFixed(2).replace('.', ',')
        : null,
    [product.compare_at_cents]
  )

  const onSale = Boolean(product.compare_at_cents && product.compare_at_cents > product.price_cents)

  const toggleCharm = (option: CharmOption) => {
    const exists = selectedCharms.find((charm) => charm.label === option.label)
    if (exists) {
      setSelectedCharms((prev) => prev.filter((charm) => charm.label !== option.label))
      setCharmError('')
      return
    }

    if (selectedCharms.length >= 5) {
      setCharmError('Vous pouvez choisir jusqu’à 5 charms par bijou.')
      return
    }

    setCharmError('')
    setSelectedCharms((prev) => [
      ...prev,
      {
        label: option.label,
        price: option.price_cents / 100,
      },
    ])
  }

  const resetFields = () => {
    setSelectedCharms([])
    setCharmError('')
  }

  return (
    <div className="space-y-6">
      {categoryName && (
        <Badge className="bg-champagne text-leather">
          {categoryName}
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

      {charmOptions.length > 0 && (
        <div className="space-y-4 p-5 rounded-2xl bg-white/70 border border-gold/20">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl text-leather">Choisissez vos charms</h2>
            <span className="text-xs text-taupe">Jusqu’à 5 charms par bijou</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {charmOptions.map((option) => {
              const isSelected = selectedCharms.some((charm) => charm.label === option.label)
              const price = option.price_cents / 100
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => toggleCharm(option)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-leather bg-gradient-to-br from-gold/20 to-rose/10 shadow-md'
                      : 'border-gold/30 bg-white hover:border-leather/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-leather">{option.label}</span>
                    <span className="text-sm text-leather">
                      {price > 0 ? `+${price.toFixed(2)} €` : 'Inclus'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedCharms.length > 0 && (
            <div className="p-3 rounded-xl bg-champagne/20 border border-gold/20 text-sm text-taupe">
              <p className="font-medium text-leather mb-1">Charms sélectionnés :</p>
              <ul className="list-disc pl-5 space-y-1">
                {selectedCharms.map((charm) => (
                  <li key={charm.label}>
                    {charm.label}
                    {charm.price > 0 && ` (+${charm.price.toFixed(2)} €)`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {charmError && <p className="text-xs text-red-600">{charmError}</p>}
        </div>
      )}

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
                image: primaryImage,
                weight_grams: product.weight_grams ?? 0,
              }}
              selectedCharms={selectedCharms}
              onAdded={resetFields}
              className="w-full"
              disabled={false}
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
              image: primaryImage,
              weight_grams: product.weight_grams ?? 0,
            }}
            selectedCharms={selectedCharms}
            onAdded={resetFields}
            className="w-full"
          />
        </>
      )}

      <div className="border-t border-gold/30 pt-6 space-y-2 text-sm text-taupe">
        <div className="flex items-center justify-between text-leather font-medium">
          <span>Total avec options</span>
          <span>{totalPrice.toFixed(2)} €</span>
        </div>
        <p>✓ Livraison offerte dès 50€</p>
        <p>✓ Retours gratuits sous 30 jours</p>
        <p>✓ Garantie 2 ans</p>
      </div>
    </div>
  )
}
