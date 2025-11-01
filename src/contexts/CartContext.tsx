'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

// Types
export type CartItem = {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  quantity: number
  image?: string
}

export type PromoCode = {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minAmount?: number
}

type CartContextType = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  discount: number
  total: number
  promoCode: PromoCode | null
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>
  removePromoCode: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null)

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('eliati-cart')
    const savedPromo = localStorage.getItem('eliati-promo')
    
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
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
  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.productId === newItem.productId)
      
      if (existingItem) {
        // Augmenter la quantité
        return prev.map((item) =>
          item.productId === newItem.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Ajouter nouveau produit
        return [...prev, { ...newItem, quantity: 1 }]
      }
    })
  }

  // Supprimer un article
  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  // Mettre à jour la quantité
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
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
        .select('*')
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

      // Vérifier le montant minimum
      if (data.min_amount_cents && subtotal < data.min_amount_cents / 100) {
        return {
          success: false,
          message: `Montant minimum de ${(data.min_amount_cents / 100).toFixed(2)} € requis`,
        }
      }

      // Appliquer le code promo
      setPromoCode({
        code: data.code,
        discountType: data.discount_type === 'percentage' ? 'percentage' : 'fixed',
        discountValue:
          data.discount_type === 'percentage'
            ? data.discount_value
            : data.discount_value / 100,
        minAmount: data.min_amount_cents ? data.min_amount_cents / 100 : undefined,
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

