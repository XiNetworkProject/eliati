'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ProductForm from '@/components/admin/ProductForm'
import ProductImages from '@/components/admin/ProductImages'
import ProductVariants from '@/components/admin/ProductVariants'
import PromoCodesManager from '@/components/admin/PromoCodesManager'
import ReviewsManager from '@/components/admin/ReviewsManager'
import PayPalSettings from '@/components/admin/PayPalSettings'
import CarouselManager from '@/components/admin/CarouselManager'
import CategoryManager from '@/components/admin/CategoryManager'
import AdminGuard from '@/components/admin/AdminGuard'

type CharmOption = {
  label: string
  price_cents: number
}

function parseCharmOptions(raw: unknown): CharmOption[] {
  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw
      .map((option) => {
        if (option && typeof (option as { label?: unknown }).label === 'string') {
          const price = typeof (option as { price_cents?: unknown }).price_cents === 'number'
            ? (option as { price_cents: number }).price_cents
            : 0
          return {
            label: (option as { label: string }).label,
            price_cents: price,
          }
        }
        return null
      })
      .filter((option): option is CharmOption => Boolean(option && option.label))
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed || trimmed === '[]') return []

    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parseCharmOptions(parsed)
      }
    } catch {
      // legacy fallback handled below
    }

    return trimmed
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

const PROTECTED_CATEGORIES = [
  {
    name: 'Colliers',
    slug: 'colliers',
    description: 'Colliers délicats et élégants',
  },
  {
    name: "Boucles d'oreille",
    slug: 'boucles',
    description: 'Boucles d\'oreille fines et raffinées',
  },
  {
    name: 'Bagues',
    slug: 'bagues',
    description: 'Bagues intemporelles et sophistiquées',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Bracelets délicats et modernes',
  },
]

const PROTECTED_CATEGORY_SLUGS = PROTECTED_CATEGORIES.map((c) => c.slug.toLowerCase())

// Types pour l'administration
type ProductImage = {
  id: string
  url: string
  alt: string | null
  sort_order: number | null
}

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price_cents: number
  compare_at_cents: number | null
  status: 'active' | 'draft'
  category_id: string | null
  created_at: string
  weight_grams?: number | null
  stock_quantity?: number | null
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
  low_stock_threshold?: number
  preorder_limit?: number | null
  preorder_count?: number
  preorder_available_date?: string | null
  charms_options?: unknown
  product_images?: ProductImage[]
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

type EditableProduct = Product & { charms_options?: CharmOption[] | null }

const SHIPPING_METHODS: Record<string, { label: string; description?: string; delay?: string }> = {
  colissimo: {
    label: 'Colissimo Suivi',
    description: 'Livraison à domicile avec suivi et assurance incluse',
    delay: '48h ouvrées',
  },
  mondial_relay_point: {
    label: 'Mondial Relay – Point Relais',
    description: 'Retrait en point relais partenaire',
    delay: '3 à 5 jours ouvrés',
  },
  mondial_relay_locker: {
    label: 'Mondial Relay – Locker',
    description: 'Retrait en consigne automatique',
    delay: '3 à 5 jours ouvrés',
  },
  mondial_relay_home: {
    label: 'Mondial Relay – Domicile',
    description: 'Livraison à domicile avec signature',
    delay: '2 à 4 jours ouvrés',
  },
}

function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<Array<{ id: string; url: string; alt: string | null; sort_order: number; color_name?: string | null }>>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem('eliati-admin-auth')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.email) {
        setAdminEmail(parsed.email)
      }
    } catch (error) {
      console.error('Impossible de lire la session admin:', error)
    }
  }, [])

  // Charger les données au montage
  useEffect(() => {
    loadData()
  }, [])

  // Charger les images du produit sélectionné
  useEffect(() => {
    const loadImages = async () => {
      if (!selectedProduct) {
        setProductImages([])
        return
      }
      const { data } = await supabase
        .from('product_images')
        .select('id,url,alt,sort_order,color_name')
        .eq('product_id', selectedProduct.id)
        .order('sort_order', { ascending: true })

      setProductImages(data || [])
    }

    loadImages()
  }, [selectedProduct])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les produits avec leurs images
      const { data: productsData } = await supabase
        .from('products')
        .select('*, product_images(id, url, alt, sort_order)')
        .order('created_at', { ascending: false })
      
      // Charger les catégories
      let { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url')
        .order('name')
      const existingSlugs = new Set((categoriesData || []).map((c) => c.slug?.toLowerCase() ?? ''))
      const missingCategories = PROTECTED_CATEGORIES.filter(
        (cat) => !existingSlugs.has(cat.slug.toLowerCase())
      )

      if (missingCategories.length > 0) {
        const { error: insertError } = await supabase.from('categories').insert(
          missingCategories.map((cat) => ({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image_url: null,
          }))
        )

        if (insertError) {
          console.error('Erreur lors de la création des catégories protégées:', insertError)
        } else {
          const { data: refreshedCategories } = await supabase
            .from('categories')
            .select('id, name, slug, description, image_url')
            .order('name')
          categoriesData = refreshedCategories || categoriesData
        }
      }
      
      setProducts(productsData || [])
      setCategories(categoriesData || [])
      
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('eliati-admin-auth')
    }
    setAdminEmail(null)
    router.replace('/admin/login')
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      // Supprimer les images associées
      const { error: imagesError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId)

      if (imagesError) throw imagesError

      // Supprimer le produit
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (productError) throw productError

      loadData()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du produit')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Vue d&apos;ensemble' },
    { id: 'products', label: 'Produits' },
    { id: 'categories', label: 'Catégories' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'promos', label: 'Codes Promo' },
    { id: 'reviews', label: 'Avis' },
    { id: 'orders', label: 'Commandes' },
    { id: 'analytics', label: 'Statistiques' },
    { id: 'settings', label: 'Paramètres' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leather mx-auto mb-4"></div>
          <p className="text-taupe">Chargement de l&apos;administration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-champagne/10 to-rose/5">
      {/* Header Admin */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-gold/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Image 
                src="/logoeliatitransparent.png" 
                alt="EliAti Admin" 
                width={100}
                height={35}
                className="h-8 w-auto"
                priority
              />
            </div>
            <div className="h-6 w-px bg-gold/30" />
            <h1 className="font-display text-xl text-leather tracking-tight">Administration</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 mx-auto sm:mx-0">
              <span className="text-xs font-medium text-leather tracking-wide">ADMIN</span>
            </div>
            {adminEmail && (
              <div className="mx-auto sm:mx-0 px-3 py-1.5 rounded-full bg-white/70 border border-gold/30 text-xs sm:text-sm text-taupe">
                {adminEmail}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="border-leather/20 text-leather hover:bg-leather hover:text-ivory transition-all w-full sm:w-auto"
              onClick={() => window.open('/', '_blank')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Voir le site
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 transition-all w-full sm:w-auto"
              onClick={handleLogout}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <nav className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto bg-white/60 backdrop-blur-sm p-1.5 rounded-xl border border-gold/20 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] sm:min-w-0 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-leather text-ivory shadow-md'
                    : 'text-taupe hover:text-leather hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {activeTab === 'overview' && <OverviewTab products={products} categories={categories} />}
          {activeTab === 'products' && (
            <ProductsTab 
              products={products} 
              categories={categories} 
              onEdit={(product) => {
                setEditingProduct({
                  ...product,
                  charms_options: parseCharmOptions(product.charms_options),
                })
                setShowProductForm(true)
              }}
              onDelete={handleDeleteProduct}
              onManageImages={(product) => setSelectedProduct(product)}
            />
          )}
          {activeTab === 'categories' && (
            <CategoryManager 
              categories={categories} 
              onUpdate={loadData} 
              protectedSlugs={PROTECTED_CATEGORY_SLUGS}
            />
          )}
          {activeTab === 'carousel' && <CarouselManager />}
          {activeTab === 'promos' && <PromoCodesManager />}
          {activeTab === 'reviews' && <ReviewsManager />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && <PayPalSettings />}
        </div>
      </div>

      {/* Formulaire de produit */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
          onSuccess={async (savedProduct) => {
            const wasEditing = Boolean(editingProduct?.id)
            await loadData()

            if (!wasEditing && savedProduct.id) {
              setSelectedProduct(savedProduct as unknown as Product)
            }
          }}
        />
      )}

      {/* Gestion des images */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl text-leather">
                  Images de &quot;{selectedProduct.name}&quot;
                </h2>
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  ✕
                </Button>
              </div>
              <ProductImages
                productId={selectedProduct.id}
                images={productImages.map(img => ({
                  id: img.id,
                  url: img.url,
                  alt: img.alt,
                  position: typeof img.sort_order === 'number' ? img.sort_order : 0,
                  color_name: img.color_name,
                }))}
                onUpdate={async () => {
                  const { data } = await supabase
                    .from('product_images')
                    .select('id,url,alt,sort_order,color_name')
                    .eq('product_id', selectedProduct.id)
                    .order('sort_order', { ascending: true })
                  setProductImages(data || [])
                }}
              />

              {/* Séparateur */}
              <div className="border-t border-gold/20 my-6"></div>

              {/* Gestion des variantes (coloris & stock) */}
              <ProductVariants
                productId={selectedProduct.id}
                productPriceCents={selectedProduct.price_cents}
                onUpdate={loadData}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Composant Vue d'ensemble
function OverviewTab({ products, categories }: { products: Product[], categories: Category[] }) {
  const [stats, setStats] = useState({ todayOrders: 0, totalRevenue: 0, paidOrders: 0 })
  const activeProducts = products.filter(p => p.status === 'active').length
  
  useEffect(() => {
    const loadStats = async () => {
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_cents, status, created_at')
      
      if (allOrders) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayOrders = allOrders.filter(o => new Date(o.created_at) >= today).length
        const totalRevenue = allOrders
          .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
          .reduce((sum, o) => sum + o.total_cents, 0) / 100
        const paidOrders = allOrders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered').length
        
        setStats({ todayOrders, totalRevenue, paidOrders })
      }
    }
    loadStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20 hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-champagne/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-taupe/80 mb-2">Produits actifs</p>
              <p className="text-3xl font-semibold text-leather">{activeProducts}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/20">
              <svg className="w-5 h-5 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20 hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-rose/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-taupe/80 mb-2">Catégories</p>
              <p className="text-3xl font-semibold text-leather">{categories.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose/30 to-rose/10 border border-gold/20">
              <svg className="w-5 h-5 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20 hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-mauve/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-taupe/80 mb-2">Revenus totaux</p>
              <p className="text-3xl font-semibold text-leather">{stats.totalRevenue.toFixed(2)} €</p>
              <p className="text-xs text-taupe mt-1">{stats.paidOrders} commandes payées</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-mauve/30 to-mauve/10 border border-gold/20">
              <svg className="w-5 h-5 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20 hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-taupe/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-taupe/80 mb-2">Commandes aujourd&apos;hui</p>
              <p className="text-3xl font-semibold text-leather">{stats.todayOrders}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-taupe/30 to-taupe/10 border border-gold/20">
              <svg className="w-5 h-5 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Composant Gestion des produits
function ProductsTab({ 
  products, 
  categories, 
  onEdit, 
  onDelete, 
  onManageImages 
}: { 
  products: Product[]
  categories: Category[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onManageImages: (product: Product) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="font-display text-2xl text-leather">Gestion des produits</h2>
        <Button 
          className="bg-leather text-ivory hover:bg-leather/90 w-full sm:w-auto"
          onClick={() => onEdit({} as Product)}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un produit
        </Button>
      </div>

      {/* Liste des produits */}
      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="group overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20 hover:shadow-md transition-all duration-200">
            <div className="p-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 text-center sm:text-left">
                <div className="w-16 h-16 mx-auto sm:mx-0 rounded-xl bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                  {(() => {
                    const sortedImages = (product.product_images || [])
                      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    const primaryImage = sortedImages[0]
                    if (primaryImage?.url) {
                      return (
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.alt || product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )
                    }
                    return <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/40 to-gold/20" />
                  })()}
                </div>
                <div>
                  <h3 className="font-display text-lg text-leather mb-1">{product.name}</h3>
                  <p className="text-sm text-taupe mb-2">
                    <span className="font-medium text-leather">{(product.price_cents / 100).toFixed(2)} €</span>
                    {product.compare_at_cents && (
                      <span className="ml-2 line-through opacity-60">
                        {(product.compare_at_cents / 100).toFixed(2)} €
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-taupe uppercase tracking-wide">
                    Poids : {product.weight_grams ? `${product.weight_grams} g` : 'Non renseigné'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        product.status === 'active' 
                          ? 'bg-gold/10 text-leather border-gold/30' 
                          : 'bg-taupe/10 text-taupe border-taupe/30'
                      }`}
                    >
                      {product.status === 'active' ? 'Actif' : 'Brouillon'}
                    </span>
                    {product.category_id && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-champagne/20 text-leather border border-gold/20">
                        {categories.find(c => c.id === product.category_id)?.name || 'Catégorie'}
                      </span>
                    )}
                    {parseCharmOptions(product.charms_options).length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/20 text-leather border border-gold/30">
                        Charms disponibles
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-leather/20 hover:bg-leather hover:text-ivory transition-all w-full sm:w-auto"
                  onClick={() => onManageImages(product)}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Images
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-leather/20 hover:bg-leather hover:text-ivory transition-all w-full sm:w-auto"
                  onClick={() => onEdit(product)}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all w-full sm:w-auto"
                  onClick={() => onDelete(product.id)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="p-12 text-center bg-white/60 backdrop-blur-sm border-gold/20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="font-display text-xl text-leather mb-2">Aucun produit</h3>
          <p className="text-taupe text-sm">Commencez par ajouter votre premier produit</p>
        </Card>
      )}
    </div>
  )
}

// Composant Gestion des commandes
type ShippingMethodDetails = {
  id: string
  label: string
  price?: number
  delay?: string
  description?: string
  pricing?: {
    base?: number | null
    reduced?: number | null
    reducedAbove?: number | null
    freeAbove?: number | null
    extraItemThreshold?: number | null
    extraItemFee?: number | null
  }
}

type ShippingAddress = {
  address: string
  addressComplement?: string
  postalCode: string
  city: string
  country: string
  method?: ShippingMethodDetails
}

function OrdersTab() {
  const [orders, setOrders] = useState<Array<{
    id: string
    customer_email: string
    customer_name: string | null
    customer_phone: string | null
    shipping_address: ShippingAddress
    total_cents: number
    subtotal_cents: number
    discount_cents: number
    shipping_cents: number
    shipping_weight_grams: number | null
    status: string
    shipping_method?: string | null
    paypal_order_id: string | null
    notes: string | null
    created_at: string
  }>>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<Array<{ product_name: string; quantity: number; product_price_cents: number; charms: Array<{ label: string; price_cents: number }>; color?: string | null }>>([])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoadingOrders(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoadingOrders(false)
  }

  const loadOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('product_name, quantity, product_price_cents, charms, color')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
    setOrderItems(
      (data || []).map((item) => ({
        product_name: item.product_name,
        quantity: item.quantity,
        product_price_cents: item.product_price_cents,
        charms: normalizeOrderItemCharms(item.charms),
        color: item.color || null,
      }))
    )
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    loadOrders()
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      shipped: 'bg-blue-100 text-blue-800 border-blue-300',
      delivered: 'bg-purple-100 text-purple-800 border-purple-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    }
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl text-leather">Commandes clients</h2>
        <Button onClick={loadOrders} variant="outline" className="border-leather/20 w-full sm:w-auto">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </Button>
      </div>

      {loadingOrders ? (
        <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-gold/20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-3"></div>
          <p className="text-taupe text-sm">Chargement des commandes...</p>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-gold/20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="font-display text-xl text-leather mb-2">Aucune commande</h3>
          <p className="text-taupe text-sm">Les commandes apparaîtront ici</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20 hover:shadow-lg transition-all">
              <div className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-lg text-leather">{order.customer_name}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-taupe mb-1">{order.customer_email}</p>
                    <p className="text-sm text-taupe mb-1">{order.customer_phone}</p>
                    <p className="text-xs text-taupe">
                      Commande #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="font-display text-2xl text-leather mb-1">{(order.total_cents / 100).toFixed(2)} €</p>
                    <p className="text-xs text-taupe">
                      {order.paypal_order_id && (
                        <span className="block">PayPal: {order.paypal_order_id.slice(0, 12)}...</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Adresse */}
                {order.shipping_address && (
                  <div className="p-3 bg-champagne/10 rounded-lg mb-4 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-taupe">Adresse de livraison</p>
                    <p className="text-sm text-leather">
                      {order.shipping_address.address}
                      {order.shipping_address.addressComplement && `, ${order.shipping_address.addressComplement}`}
                    </p>
                    <p className="text-sm text-leather">
                      {order.shipping_address.postalCode} {order.shipping_address.city}, {order.shipping_address.country}
                    </p>
                  {(order.shipping_address.method || order.shipping_method) && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-gold/30 bg-white/70 p-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-taupe">Mode d&apos;envoi</p>
                        <p className="text-sm font-medium text-leather">
                          {order.shipping_address.method?.label || SHIPPING_METHODS[order.shipping_method ?? '']?.label || 'Colissimo'}
                        </p>
                        {order.shipping_address.method?.description && (
                          <p className="text-xs text-taupe mt-1">{order.shipping_address.method.description}</p>
                        )}
                        {order.shipping_address.method?.pricing?.freeAbove && (
                          <p className="text-xs text-green-700 mt-1">Livraison offerte dès {order.shipping_address.method?.pricing?.freeAbove?.toFixed(0)} €</p>
                        )}
                      </div>
                      <div className="text-xs text-taupe sm:text-right">
                        <p>
                          {(order.shipping_cents / 100).toFixed(2)} €
                        </p>
                        <p>
                          {order.shipping_address.method?.delay || SHIPPING_METHODS[order.shipping_method ?? '']?.delay || '48h ouvrées'}
                        </p>
                        {order.shipping_address.method?.pricing?.extraItemThreshold !== undefined && (
                          <p className="mt-1">
                            +{(order.shipping_address.method?.pricing?.extraItemFee ?? 0).toFixed(2)} € / article au-delà de {order.shipping_address.method?.pricing?.extraItemThreshold}
                          </p>
                        )}
                        {(order.shipping_weight_grams ?? 0) > 0 && (
                          <p className="mt-1 text-taupe/80">
                            Poids total : {((order.shipping_weight_grams ?? 0) / 1000).toFixed(2)} kg
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="p-3 bg-rose/10 rounded-lg mb-4">
                    <p className="text-xs uppercase tracking-wide text-taupe mb-1">Notes du client</p>
                    <p className="text-sm text-leather italic">{order.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gold/20">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (selectedOrder === order.id) {
                          setSelectedOrder(null)
                          setOrderItems([])
                        } else {
                          setSelectedOrder(order.id)
                          loadOrderItems(order.id)
                        }
                      }}
                      className="border-leather/20 w-full sm:w-auto"
                    >
                      {selectedOrder === order.id ? 'Masquer' : 'Voir'} les articles
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {order.status === 'paid' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto"
                      >
                        Marquer comme expédiée
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="bg-purple-600 text-white hover:bg-purple-700 w-full sm:w-auto"
                      >
                        Marquer comme livrée
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="border-red-300 text-red-600 hover:bg-red-50 w-full sm:w-auto"
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </div>

                {/* Détails des articles */}
                {selectedOrder === order.id && orderItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gold/20">
                    <p className="text-xs uppercase tracking-wide text-taupe mb-3">Articles commandés</p>
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={`${item.product_name}-${item.quantity}-${item.product_price_cents}`} className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-gold/20">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-leather">{item.product_name}</p>
                              <p className="text-xs text-taupe">Quantité: {item.quantity}</p>
                              {item.color && (
                                <p className="text-xs text-leather font-medium">Coloris: {item.color}</p>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-leather">
                              {((item.product_price_cents * item.quantity) / 100).toFixed(2)} €
                            </p>
                          </div>
                          {item.charms.length > 0 && (
                            <div className="text-xs text-taupe space-y-1">
                              {item.charms.map((charm) => (
                                <p key={`${item.product_name}-${item.quantity}-${item.product_price_cents}-${charm.label}`}>
                                  Charm : {charm.label}
                                  {charm.price_cents > 0 && ` (+${(charm.price_cents / 100).toFixed(2)} €)`}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-gradient-to-br from-champagne/20 to-rose/10 rounded-lg">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-taupe">Sous-total</span>
                        <span className="text-leather">{(order.subtotal_cents / 100).toFixed(2)} €</span>
                      </div>
                      {order.discount_cents > 0 && (
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-700">Réduction</span>
                          <span className="text-green-700">-{(order.discount_cents / 100).toFixed(2)} €</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-taupe">Livraison</span>
                        <span className="text-leather">{(order.shipping_cents / 100).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-2 border-t border-gold/30">
                        <span className="text-leather">Total</span>
                        <span className="text-leather">{(order.total_cents / 100).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Composant Statistiques
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-leather mb-6">Statistiques et revenus</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg text-leather">Revenus mensuels</h3>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30">
                <svg className="w-5 h-5 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-leather mb-2">0,00 €</p>
              <p className="text-sm text-taupe">Ce mois-ci</p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg text-leather">Produits populaires</h3>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-rose/20 to-rose/10 border border-gold/30">
                <svg className="w-5 h-5 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="text-center py-8">
              <p className="text-taupe mb-2">Aucune donnée disponible</p>
              <p className="text-sm text-taupe/60">Les statistiques apparaîtront avec les ventes</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

const normalizeOrderItemCharms = (raw: unknown): Array<{ label: string; price_cents: number }> => {
  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw
      .map((charm) => {
        if (charm && typeof (charm as { label?: unknown }).label === 'string') {
          return {
            label: (charm as { label: string }).label,
            price_cents: typeof (charm as { price_cents?: unknown }).price_cents === 'number'
              ? (charm as { price_cents: number }).price_cents
              : 0,
          }
        }
        return null
      })
      .filter((charm): charm is { label: string; price_cents: number } => Boolean(charm && charm.label))
  }

  return []
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  )
}

