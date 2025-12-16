'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export type CompareProduct = {
  id: string
  name: string
  slug: string
  price_cents: number
  compare_at_cents: number | null
  image: string | null
  description?: string | null
  category_name?: string | null
}

type CompareContextType = {
  items: CompareProduct[]
  addToCompare: (product: CompareProduct) => boolean
  removeFromCompare: (productId: string) => void
  clearCompare: () => void
  isInCompare: (productId: string) => boolean
  canAddMore: boolean
}

const MAX_COMPARE_ITEMS = 3

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareProduct[]>([])

  const addToCompare = useCallback((product: CompareProduct): boolean => {
    if (items.length >= MAX_COMPARE_ITEMS) {
      return false
    }
    if (items.some((item) => item.id === product.id)) {
      return false
    }
    setItems((prev) => [...prev, product])
    return true
  }, [items])

  const removeFromCompare = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const clearCompare = useCallback(() => {
    setItems([])
  }, [])

  const isInCompare = useCallback((productId: string) => {
    return items.some((item) => item.id === productId)
  }, [items])

  const canAddMore = items.length < MAX_COMPARE_ITEMS

  return (
    <CompareContext.Provider value={{
      items,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAddMore,
    }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}

