'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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

  // Charger les données au montage
  useEffect(() => {
    loadData()
  }, [])

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
    { id: 'overview', label: '📊 Vue d&apos;ensemble', icon: '📊' },
    { id: 'products', label: '🛍️ Produits', icon: '🛍️' },
    { id: 'categories', label: '📂 Catégories', icon: '📂' },
    { id: 'carousel', label: '🎠 Carousel', icon: '🎠' },
    { id: 'promos', label: '🎫 Codes Promo', icon: '🎫' },
    { id: 'orders', label: '📦 Commandes', icon: '📦' },
    { id: 'analytics', label: '📈 Statistiques', icon: '📈' },
    { id: 'settings', label: '⚙️ Paramètres', icon: '⚙️' },
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
    <div className="min-h-screen bg-ivory">
      {/* Header Admin */}
      <header className="bg-leather text-ivory p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logoeliatitransparent.png" 
              alt="EliAti Admin" 
              width={80}
              height={30}
              className="h-6 w-auto"
            />
            <h1 className="font-display text-xl">Administration EliAti</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gold text-leather">Admin</Badge>
            <Button 
              variant="outline" 
              className="border-ivory text-ivory hover:bg-ivory hover:text-leather"
              onClick={() => window.open('/', '_blank')}
            >
              Voir le site
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gold/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-leather border-b-2 border-leather'
                    : 'text-taupe hover:text-leather'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
          {activeTab === 'categories' && <CategoriesTab categories={categories} />}
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
                images={[]} // TODO: Charger les vraies images
                onUpdate={() => {
                  // TODO: Recharger les images
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
      <Card className="p-6 bg-champagne/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-taupe">Produits actifs</p>
            <p className="text-2xl font-bold text-leather">{activeProducts}</p>
          </div>
          <div className="text-3xl">🛍️</div>
        </div>
      </Card>

      <Card className="p-6 bg-rose/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-taupe">Catégories</p>
            <p className="text-2xl font-bold text-leather">{categories.length}</p>
          </div>
          <div className="text-3xl">📂</div>
        </div>
      </Card>

      <Card className="p-6 bg-mauve/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-taupe">Valeur catalogue</p>
            <p className="text-2xl font-bold text-leather">{totalRevenue.toFixed(2)} €</p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
      </Card>

      <Card className="p-6 bg-taupe/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-taupe">Commandes aujourd&apos;hui</p>
            <p className="text-2xl font-bold text-leather">0</p>
          </div>
          <div className="text-3xl">📦</div>
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
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-leather">Gestion des produits</h2>
      </div>

      {/* Liste des produits */}
      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-champagne/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-leather">{product.name}</h3>
                  <p className="text-sm text-taupe">
                    {(product.price_cents / 100).toFixed(2)} €
                    {product.compare_at_cents && (
                      <span className="ml-2 line-through">
                        {(product.compare_at_cents / 100).toFixed(2)} €
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge 
                      className={`${
                        product.status === 'active' 
                          ? 'bg-gold text-leather' 
                          : 'bg-taupe text-ivory'
                      }`}
                    >
                      {product.status === 'active' ? 'Actif' : 'Brouillon'}
                    </Badge>
                    {product.category_id && (
                      <Badge className="bg-champagne text-leather">
                        {categories.find(c => c.id === product.category_id)?.name || 'Catégorie'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onManageImages(product)}
                >
                  Images
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(product)}
                >
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => onDelete(product.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">🛍️</div>
          <h3 className="font-display text-lg text-leather mb-2">Aucun produit</h3>
          <p className="text-taupe">Commencez par ajouter votre premier produit</p>
        </Card>
      )}
    </div>
  )
}

// Composant Gestion des catégories
function CategoriesTab({ categories }: { 
  categories: Category[]
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-leather">Gestion des catégories</h2>
        <Button className="bg-leather text-ivory hover:bg-leather/90">
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
                <Button variant="outline" size="sm">Modifier</Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-leather">Gestion du carousel</h2>
        <Button className="bg-leather text-ivory hover:bg-leather/90">
          + Ajouter une slide
        </Button>
      </div>

      <Card className="p-6">
        <p className="text-taupe mb-4">
          Gérez les slides du carousel principal de votre site. 
          Vous pouvez ajouter jusqu&apos;à 5 slides maximum.
        </p>
        <div className="text-center py-8 text-taupe">
          <div className="text-4xl mb-2">🎠</div>
          <p>Aucune slide configurée</p>
          <p className="text-sm">Ajoutez votre première slide pour commencer</p>
        </div>
      </Card>
    </div>
  )
}

// Composant Gestion des commandes
function OrdersTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-leather">Commandes clients</h2>
      
      <Card className="p-6">
        <p className="text-taupe mb-4">
          Gérez les commandes de vos clients. 
          Vous verrez ici toutes les commandes passées avec les détails de paiement PayPal.
        </p>
        <div className="text-center py-8 text-taupe">
          <div className="text-4xl mb-2">📦</div>
          <p>Aucune commande pour le moment</p>
          <p className="text-sm">Les commandes apparaîtront ici une fois PayPal configuré</p>
        </div>
      </Card>
    </div>
  )
}

// Composant Statistiques
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-leather">Statistiques et revenus</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display text-lg mb-4">Revenus mensuels</h3>
          <div className="text-center py-8 text-taupe">
            <div className="text-4xl mb-2">📈</div>
            <p>0,00 €</p>
            <p className="text-sm">Ce mois-ci</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg mb-4">Produits les plus vendus</h3>
          <div className="text-center py-8 text-taupe">
            <div className="text-4xl mb-2">🏆</div>
            <p>Aucune donnée disponible</p>
            <p className="text-sm">Les statistiques apparaîtront avec les ventes</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

