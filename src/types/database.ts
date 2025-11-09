// Types pour la base de données Supabase

export type ProductStatus = 'active' | 'draft'

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export type ProductImage = {
  id: number
  product_id: string
  url: string
  alt: string | null
  position: number
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price_cents: number
  compare_at_cents: number | null
  status: ProductStatus
  category_id: string | null
  weight_grams: number | null
  created_at: string
  updated_at: string
}

export type ProductWithImages = Product & {
  product_images: ProductImage[]
}

export type ProductWithCategory = Product & {
  product_images: ProductImage[]
  categories: Category | null
}

