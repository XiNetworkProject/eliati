'use client'

import { useMemo, useState } from 'react'
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
    stock_status: string | null
    stock_quantity?: number | null
    preorder_limit?: number | null
    preorder_count?: number | null
    preorder_available_date?: string | null
    weight_grams?: number | null
  }
  categoryName?: string | null
  charmOptions: CharmOption[]
  primaryImage: string
  selectedColor?: string | null
  variantId?: string | null
  hasVariants?: boolean
}

export default function ProductConfigurator({
  product,
  categoryName,
  charmOptions,
  primaryImage,
  selectedColor,
  variantId,
  hasVariants = false,
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
  const discountPercent = onSale && product.compare_at_cents
    ? Math.round((1 - product.price_cents / product.compare_at_cents) * 100)
    : 0

  const toggleCharm = (option: CharmOption) => {
    const exists = selectedCharms.find((charm) => charm.label === option.label)
    if (exists) {
      setSelectedCharms((prev) => prev.filter((charm) => charm.label !== option.label))
      setCharmError('')
      return
    }

    if (selectedCharms.length >= 5) {
      setCharmError('Vous pouvez choisir jusqu\'à 5 charms par bijou.')
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
      {/* Category badge */}
      {categoryName && (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-champagne/30 text-leather text-sm font-medium border border-gold/20">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          {categoryName}
        </span>
      )}

      {/* Product name */}
      <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-leather leading-tight">
        {product.name}
      </h1>

      {/* Price section */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className={`text-3xl sm:text-4xl font-bold ${onSale ? 'text-mauve' : 'text-leather'}`}>
          {price} €
        </span>
        {comparePrice && onSale && (
          <>
            <span className="text-xl text-taupe/60 line-through">
              {comparePrice} €
            </span>
            <span className="badge-promo">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="prose prose-taupe max-w-none">
          <p className="text-taupe leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="divider-gold" />

      {/* Charms section */}
      {charmOptions.length > 0 && (
        <div className="space-y-4 p-6 rounded-3xl bg-gradient-to-br from-white to-champagne/10 border border-gold/20 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <h2 className="font-display text-xl text-leather">Personnalisez avec des charms</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-champagne/30 text-xs font-medium text-leather">
              {selectedCharms.length}/5
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {charmOptions.map((option) => {
              const isSelected = selectedCharms.some((charm) => charm.label === option.label)
              const charmPrice = option.price_cents / 100
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => toggleCharm(option)}
                  className={`group relative text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-gold bg-gradient-to-br from-gold/10 to-rose/5 shadow-lg shadow-gold/10'
                      : 'border-gold/20 bg-white hover:border-gold/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`font-medium ${isSelected ? 'text-leather' : 'text-taupe group-hover:text-leather'} transition-colors`}>
                      {option.label}
                    </span>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-gold' : 'text-leather'}`}>
                      {charmPrice > 0 ? `+${charmPrice.toFixed(2)} €` : 'Inclus'}
                    </span>
                  </div>
                  {/* Checkmark */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center shadow-lg animate-scale-in">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {selectedCharms.length > 0 && (
            <div className="p-4 rounded-2xl bg-champagne/20 border border-gold/20">
              <p className="text-sm font-medium text-leather mb-2 flex items-center gap-2">
                <span>🎀</span> Vos charms sélectionnés
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCharms.map((charm) => (
                  <span
                    key={charm.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-sm text-leather border border-gold/20 shadow-sm"
                  >
                    {charm.label}
                    {charm.price > 0 && (
                      <span className="text-gold text-xs">+{charm.price.toFixed(2)} €</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {charmError && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
              ⚠️ {charmError}
            </p>
          )}
        </div>
      )}

      {/* Stock status & Add to cart */}
      <div className="space-y-4">
        {product.stock_status === 'out_of_stock' ? (
          <div className="p-5 bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl text-center">
            <span className="text-3xl mb-2 block">😢</span>
            <p className="text-red-700 font-semibold text-lg">Rupture de stock</p>
            <p className="text-red-600 text-sm mt-1">Ce produit n&apos;est plus disponible pour le moment</p>
          </div>
        ) : product.stock_status === 'preorder' ? (
          <>
            <div className="p-5 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📅</span>
                <p className="text-leather font-semibold text-lg">Précommande - Édition limitée</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-taupe">Places restantes</span>
                <span className="font-bold text-leather">
                  {(product.preorder_limit || 0) - (product.preorder_count || 0)} / {product.preorder_limit}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-champagne/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gold to-gold/70 rounded-full transition-all duration-500"
                  style={{ width: `${((product.preorder_count || 0) / (product.preorder_limit || 1)) * 100}%` }}
                />
              </div>
              {product.preorder_available_date && (
                <p className="text-taupe text-xs mt-3">
                  📦 Expédition prévue le {new Date(product.preorder_available_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                selectedColor={selectedColor}
                variantId={variantId}
                onAdded={resetFields}
                className="w-full h-14 text-lg"
                disabled={false}
              />
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                <p className="text-red-700 font-medium">Précommandes complètes</p>
              </div>
            )}
          </>
        ) : (
          <>
            {product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity > 0 && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl ${
                product.stock_status === 'low_stock' 
                  ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200' 
                  : 'bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200'
              }`}>
                <span className="text-xl">
                  {product.stock_status === 'low_stock' ? '⚡' : '✓'}
                </span>
                <div>
                  <p className={`font-medium ${product.stock_status === 'low_stock' ? 'text-orange-700' : 'text-green-700'}`}>
                    {product.stock_status === 'low_stock' ? `Plus que ${product.stock_quantity} en stock !` : `${product.stock_quantity} en stock`}
                  </p>
                  {hasVariants && selectedColor && (
                    <p className="text-xs opacity-80">Coloris : {selectedColor}</p>
                  )}
                </div>
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
              selectedColor={selectedColor}
              variantId={variantId}
              onAdded={resetFields}
              className="w-full h-14 text-lg"
            />
          </>
        )}
      </div>

      {/* Total with options */}
      {(selectedCharms.length > 0 || selectedColor) && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-leather/5 to-leather/10 border border-leather/20">
          <div className="flex items-center justify-between text-lg">
            <span className="text-leather font-medium">Total avec options</span>
            <span className="font-display text-2xl text-leather">{totalPrice.toFixed(2)} €</span>
          </div>
          {selectedColor && (
            <p className="text-sm text-taupe mt-1">Coloris : {selectedColor}</p>
          )}
        </div>
      )}

      {/* Guarantees */}
      <div className="flex flex-wrap gap-3 text-sm text-taupe">
        <span className="flex items-center gap-1.5">
          <span className="text-green-600">✓</span> Livraison offerte dès 50€
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-green-600">✓</span> Retours gratuits 30 jours
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-green-600">✓</span> Garantie 2 ans
        </span>
      </div>
    </div>
  )
}
