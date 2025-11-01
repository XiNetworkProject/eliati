'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import ProductForm from '@/components/admin/ProductForm'
import ProductImages from '@/components/admin/ProductImages'
import PromoCodesManager from '@/components/admin/PromoCodesManager'
import PayPalSettings from '@/components/admin/PayPalSettings'

// Types pour l'administration
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
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
}


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<Array<{ id: string; url: string; alt: string | null; sort_order: number }>>([])

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
        .select('id,url,alt,sort_order')
        .eq('product_id', selectedProduct.id)
        .order('sort_order', { ascending: true })

      setProductImages(data || [])
    }

    loadImages()
  }, [selectedProduct])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les produits
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Charger les catégories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      setProducts(productsData || [])
      setCategories(categoriesData || [])
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
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
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30">
              <span className="text-xs font-medium text-leather tracking-wide">ADMIN</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-leather/20 text-leather hover:bg-leather hover:text-ivory transition-all"
              onClick={() => window.open('/', '_blank')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Voir le site
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white/60 backdrop-blur-sm p-1.5 rounded-xl border border-gold/20 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
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
                setEditingProduct(product)
                setShowProductForm(true)
              }}
              onDelete={handleDeleteProduct}
              onManageImages={(product) => setSelectedProduct(product)}
            />
          )}
          {activeTab === 'categories' && <CategoriesTab categories={categories} onUpdate={loadData} />}
          {activeTab === 'carousel' && <CarouselTab />}
          {activeTab === 'promos' && <PromoCodesManager />}
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
          onSuccess={loadData}
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
                images={productImages.map(img => ({ id: 0, url: img.url, alt: img.alt, position: img.sort_order }))}
                onUpdate={async () => {
                  const { data } = await supabase
                    .from('product_images')
                    .select('id,url,alt,sort_order')
                    .eq('product_id', selectedProduct.id)
                    .order('sort_order', { ascending: true })
                  setProductImages(data || [])
                }}
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
  const activeProducts = products.filter(p => p.status === 'active').length
  const totalRevenue = products.reduce((sum, p) => sum + p.price_cents, 0) / 100

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
              <p className="text-xs uppercase tracking-wider text-taupe/80 mb-2">Valeur catalogue</p>
              <p className="text-3xl font-semibold text-leather">{totalRevenue.toFixed(2)} €</p>
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
              <p className="text-3xl font-semibold text-leather">0</p>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl text-leather">Gestion des produits</h2>
        <Button 
          className="bg-leather text-ivory hover:bg-leather/90"
          onClick={() => onEdit(null as any)}
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
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/40 to-gold/20" />
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
                  <div className="flex gap-2">
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
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-leather/20 hover:bg-leather hover:text-ivory transition-all"
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
                  className="border-leather/20 hover:bg-leather hover:text-ivory transition-all"
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
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
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

// Composant Gestion des catégories
function CategoriesTab({ categories, onUpdate }: { 
  categories: Category[]
  onUpdate: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-leather">Gestion des catégories</h2>
        <Button 
          className="bg-leather text-ivory hover:bg-leather/90"
          onClick={async () => {
            const name = prompt('Nom de la catégorie')
            if (!name) return
            const slug = name
              .toLowerCase()
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')

            await supabase.from('categories').insert({ name, slug })
            await onUpdate()
          }}
        >
          + Ajouter une catégorie
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-leather">{category.name}</h3>
                <p className="text-sm text-taupe">{category.description}</p>
                <Badge className="mt-1 bg-champagne text-leather">
                  {category.slug}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    const name = prompt('Nouveau nom', category.name)
                    if (!name) return
                    const slug = name
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/\p{Diacritic}/gu, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '')
                    await supabase.from('categories').update({ name, slug }).eq('id', category.id)
                    await onUpdate()
                  }}
                >
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={async () => {
                    if (!confirm('Supprimer cette catégorie ?')) return
                    await supabase.from('categories').delete().eq('id', category.id)
                    await onUpdate()
                  }}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Composant Gestion du carousel
function CarouselTab() {
  const [slides, setSlides] = useState<Array<{ id: string; title: string | null; subtitle: string | null; image_url: string; link_url: string | null; button_text: string | null; sort_order: number; is_active: boolean }>>([])
  const [loadingSlides, setLoadingSlides] = useState(true)

  useEffect(() => {
    const loadSlides = async () => {
      setLoadingSlides(true)
      const { data } = await supabase
        .from('carousel_slides')
        .select('*')
        .order('sort_order', { ascending: true })
      setSlides(data || [])
      setLoadingSlides(false)
    }
    loadSlides()
  }, [])

  const addSlide = async () => {
    const image = prompt('URL de l\'image (hébergée dans /public/hero ou URL publique)')
    if (!image) return
    await supabase.from('carousel_slides').insert({ image_url: image, sort_order: slides.length })
    const { data } = await supabase
      .from('carousel_slides')
      .select('*')
      .order('sort_order', { ascending: true })
    setSlides(data || [])
  }

  const removeSlide = async (id: string) => {
    if (!confirm('Supprimer cette slide ?')) return
    await supabase.from('carousel_slides').delete().eq('id', id)
    const { data } = await supabase
      .from('carousel_slides')
      .select('*')
      .order('sort_order', { ascending: true })
    setSlides(data || [])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-leather">Gestion du carousel</h2>
        <Button className="bg-leather text-ivory hover:bg-leather/90" onClick={addSlide}>
          + Ajouter une slide
        </Button>
      </div>

      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20">
        {loadingSlides ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-3"></div>
            <p className="text-taupe text-sm">Chargement des slides...</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-display text-xl text-leather mb-2">Aucune slide configurée</h3>
            <p className="text-taupe text-sm">Ajoutez votre première slide pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {slides.map((s) => (
              <Card key={s.id} className="group overflow-hidden bg-white border-gold/20 hover:shadow-md transition-all">
                <div className="aspect-video bg-gradient-to-br from-champagne/20 to-rose/10 border-b border-gold/20 flex items-center justify-center p-4">
                  <span className="text-taupe text-xs truncate px-2">{s.image_url}</span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-leather text-sm font-medium">Position {s.sort_order + 1}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${s.is_active ? 'bg-gold/10 text-leather border border-gold/30' : 'bg-taupe/10 text-taupe border border-taupe/30'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => removeSlide(s.id)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// Composant Gestion des commandes
function OrdersTab() {
  const [orders, setOrders] = useState<Array<{ id: string; customer_email: string; customer_name: string | null; total_cents: number; status: string; created_at: string }>>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      setLoadingOrders(true)
      const { data } = await supabase
        .from('orders')
        .select('id,customer_email,customer_name,total_cents,status,created_at')
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoadingOrders(false)
    }
    loadOrders()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-leather">Commandes clients</h2>
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20">
        {loadingOrders ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-3"></div>
            <p className="text-taupe text-sm">Chargement des commandes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-display text-xl text-leather mb-2">Aucune commande pour le moment</h3>
            <p className="text-taupe text-sm">Les commandes apparaîtront ici une fois PayPal configuré</p>
          </div>
        ) : (
          <div className="divide-y divide-gold/10">
            {orders.map((o) => (
              <div key={o.id} className="p-5 hover:bg-champagne/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-leather font-medium mb-1">{o.customer_name || o.customer_email}</p>
                    <p className="text-taupe text-sm">{new Date(o.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-leather font-semibold text-lg mb-1">{(o.total_cents / 100).toFixed(2)} €</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-leather border border-gold/30">
                      {o.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
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

