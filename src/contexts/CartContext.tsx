'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

// Types
export type CartItem = {
  id: string
  productId: string
  name: string
  slug: string
  basePrice: number
  price: number
  quantity: number
  image?: string
  weight?: number
  charms: Array<{ label: string; price: number }>
  color?: string
  variantId?: string
  optionsKey: string
}

export type PromoCode = {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minAmount?: number
  maxUses?: number | null
  usedCount?: number
  expiresAt?: string | null
}

type CartItemInput = {
  productId: string
  name: string
  slug: string
  basePrice: number
  image?: string
  weight?: number
  charms?: Array<{ label: string; price: number }>
  color?: string
  variantId?: string
}

type CartContextType = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  discount: number
  total: number
  totalWeight: number
  promoCode: PromoCode | null
  addItem: (item: CartItemInput) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>
  removePromoCode: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null)

  const createOptionsKey = (item: CartItemInput) => {
    const sortedCharms = (item.charms || [])
      .map(({ label }) => label.trim())
      .filter((label) => label.length > 0)
      .sort()
      .join('|')
    const colorPart = item.color ? `__color:${item.color}` : ''
    const variantPart = item.variantId ? `__variant:${item.variantId}` : ''
    return `${item.productId}__${sortedCharms}${colorPart}${variantPart}`
  }

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('eliati-cart')
    const savedPromo = localStorage.getItem('eliati-promo')
    
    if (savedCart) {
      try {
        const parsed: CartItem[] = JSON.parse(savedCart)
        setItems(
          parsed.map((item) => {
            const normalizedCharms = Array.isArray(item.charms)
              ? item.charms.map((charm) => ({
                  label: typeof charm?.label === 'string' ? charm.label : '',
                  price: typeof charm?.price === 'number' ? charm.price : 0,
                })).filter((charm) => charm.label)
              : []
            const extras = normalizedCharms.reduce((sum, charm) => sum + charm.price, 0)
            const basePrice = typeof item.basePrice === 'number'
              ? item.basePrice
              : Math.max(0, item.price ?? 0 - extras)
            const unitPrice = Math.max(0, basePrice + extras)
            const optionsKey = createOptionsKey({
              productId: item.productId,
              name: item.name,
              slug: item.slug,
              basePrice,
              image: item.image,
              weight: item.weight,
              charms: normalizedCharms,
            })

            return {
              ...item,
              basePrice,
              price: unitPrice,
              charms: normalizedCharms,
              weight: item.weight ?? 0,
              optionsKey: item.optionsKey || optionsKey,
            }
          })
        )
      } catch (e) {
        console.error('Erreur lors du chargement du panier:', e)
      }
    }

    if (savedPromo) {
      try {
        setPromoCode(JSON.parse(savedPromo))
      } catch (e) {
        console.error('Erreur lors du chargement du code promo:', e)
      }
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('eliati-cart', JSON.stringify(items))
  }, [items])

  // Sauvegarder le code promo dans localStorage
  useEffect(() => {
    if (promoCode) {
      localStorage.setItem('eliati-promo', JSON.stringify(promoCode))
    } else {
      localStorage.removeItem('eliati-promo')
    }
  }, [promoCode])

  // Calculs
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 0) * item.quantity, 0)
  
  let discount = 0
  if (promoCode) {
    // Vérifier le montant minimum
    if (!promoCode.minAmount || subtotal >= promoCode.minAmount) {
      if (promoCode.discountType === 'percentage') {
        discount = (subtotal * promoCode.discountValue) / 100
      } else {
        discount = promoCode.discountValue
      }
    }
  }
  
  const total = Math.max(0, subtotal - discount)

  // Ajouter un article
  const addItem = (newItem: CartItemInput) => {
    setItems((prev) => {
      const optionsKey = createOptionsKey(newItem)
      const existingItem = prev.find((item) => item.optionsKey === optionsKey)
      
      if (existingItem) {
        // Augmenter la quantité
        return prev.map((item) =>
          item.optionsKey === optionsKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Ajouter nouveau produit
        const charms: Array<{ label: string; price: number }> = (newItem.charms || [])
          .filter((charm) => charm && typeof charm.label === 'string')
          .slice(0, 5)
          .map((charm) => ({
            label: charm.label.trim(),
            price: typeof charm.price === 'number' && Number.isFinite(charm.price) ? Math.max(0, charm.price) : 0,
          }))
          .filter((charm) => charm.label.length > 0)
        const extras = charms.reduce((sum, charm) => sum + charm.price, 0)
        const unitPrice = newItem.basePrice + extras
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            ...newItem,
            price: unitPrice,
            basePrice: newItem.basePrice,
            charms,
            quantity: 1,
            weight: newItem.weight ?? 0,
            optionsKey,
          },
        ]
      }
    })
  }

  // Supprimer un article
  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  // Mettre à jour la quantité
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      )
    }
  }

  // Vider le panier
  const clearCart = () => {
    setItems([])
    setPromoCode(null)
  }

  // Appliquer un code promo
  const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('code, discount_percent, discount_amount_cents, min_order_cents, max_uses, used_count, expires_at, is_active')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return { success: false, message: 'Code promo invalide ou expiré' }
      }

      // Vérifier l'expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { success: false, message: 'Ce code promo a expiré' }
      }

      // Vérifier le nombre d'utilisations
      if (typeof data.max_uses === 'number' && typeof data.used_count === 'number' && data.max_uses > 0 && data.used_count >= data.max_uses) {
        return { success: false, message: 'Ce code promo a atteint son nombre d’utilisations maximum' }
      }

      const minAmountCents = typeof data.min_order_cents === 'number' ? data.min_order_cents : null
      const discountPercent = typeof data.discount_percent === 'number' ? data.discount_percent : null
      const discountAmountCents = typeof data.discount_amount_cents === 'number' ? data.discount_amount_cents : null

      if (!discountPercent && !discountAmountCents) {
        return { success: false, message: 'Ce code promo n’est pas correctement configuré' }
      }

      // Vérifier le montant minimum
      if (minAmountCents && subtotal < minAmountCents / 100) {
        return {
          success: false,
          message: `Montant minimum de ${(minAmountCents / 100).toFixed(2)} € requis`,
        }
      }

      // Appliquer le code promo
      const discountType = discountPercent ? 'percentage' : 'fixed'
      const discountValue = discountType === 'percentage'
        ? discountPercent!
        : (discountAmountCents ?? 0) / 100

      setPromoCode({
        code: data.code,
        discountType,
        discountValue,
        minAmount: minAmountCents ? minAmountCents / 100 : undefined,
        maxUses: typeof data.max_uses === 'number' ? data.max_uses : null,
        usedCount: typeof data.used_count === 'number' ? data.used_count : undefined,
        expiresAt: data.expires_at ?? null,
      })

      return { success: true, message: 'Code promo appliqué avec succès !' }
    } catch (error) {
      console.error('Erreur lors de la validation du code promo:', error)
      return { success: false, message: 'Erreur lors de la validation du code' }
    }
  }

  // Retirer le code promo
  const removePromoCode = () => {
    setPromoCode(null)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        total,
        totalWeight,
        promoCode,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart doit être utilisé dans un CartProvider')
  }
  return context
}

