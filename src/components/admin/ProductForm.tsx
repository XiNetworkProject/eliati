'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

type Product = {
  id?: string
  name: string
  slug: string
  description: string | null
  price_cents: number
  compare_at_cents: number | null
  status: 'active' | 'draft'
  category_id: string | null
  created_at?: string
  weight_grams?: number | null
  stock_quantity?: number | null
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
  low_stock_threshold?: number
  preorder_limit?: number | null
  preorder_count?: number
  preorder_available_date?: string | null
  updated_at?: string
  charms_options?: Array<{ label: string; price_cents: number }> | null
}

type Category = {
  id: string
  name: string
  slug: string
}

const parseCharmsOptions = (raw: Product['charms_options'] | string | null | undefined) => {
  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw
      .map((option) => ({
        label: typeof option?.label === 'string' ? option.label : '',
        price_cents: typeof option?.price_cents === 'number' ? option.price_cents : 0,
      }))
      .filter((option) => option.label)
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
          .map((option: any) => ({
            label: typeof option?.label === 'string' ? option.label : '',
            price_cents: typeof option?.price_cents === 'number' ? option.price_cents : 0,
          }))
          .filter((option) => option.label)
      }
    } catch (error) {
      // legacy format fallback handled below
    }

    return raw
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

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  onClose: () => void
  onSuccess: (savedProduct: Product) => void | Promise<void>
}

export default function ProductForm({ product, categories, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price_cents: product?.price_cents || 0,
    compare_at_cents: product?.compare_at_cents || null,
    status: product?.status || 'draft',
    category_id: product?.category_id || null,
    weight_grams: product?.weight_grams ?? 0,
    stock_quantity: product?.stock_quantity ?? null,
    stock_status: product?.stock_status || 'in_stock',
    low_stock_threshold: product?.low_stock_threshold || 5,
    preorder_limit: product?.preorder_limit || null,
    preorder_count: product?.preorder_count || 0,
    preorder_available_date: product?.preorder_available_date || null,
    charms_options: parseCharmsOptions(product?.charms_options),
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [charms, setCharms] = useState<Array<{ id: string; label: string; price: number }>>(
    (parseCharmsOptions(product?.charms_options) || []).map((option) => ({
      id: crypto.randomUUID(),
      label: option.label,
      price: option.price_cents / 100,
    }))
  )

  // Générer le slug automatiquement à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du produit est requis'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est requis'
    }

    if (formData.price_cents <= 0) {
      newErrors.price_cents = 'Le prix doit être supérieur à 0'
    }

    if (formData.compare_at_cents && formData.compare_at_cents <= formData.price_cents) {
      newErrors.compare_at_cents = 'Le prix barré doit être supérieur au prix normal'
    }

    if (formData.weight_grams !== null && formData.weight_grams !== undefined && formData.weight_grams < 0) {
      newErrors.weight_grams = 'Le poids doit être positif'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const charmOptionsPayload = charms
        .filter((field) => field.label.trim().length > 0)
        .map((field) => ({
          label: field.label.trim(),
          price_cents: Math.max(0, Math.round((field.price || 0) * 100)),
        }))

      const updatePayload = {
        ...formData,
        description: formData.description || null,
        charms_options: charmOptionsPayload.length > 0 ? charmOptionsPayload : null,
      }

      let savedProduct: Product | null = null

      if (product?.id) {
        // Mise à jour
        const { data, error } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', product.id)
          .select('*')
          .single()

        if (error) throw error
        savedProduct = data as Product
      } else {
        // Création
        const { data, error } = await supabase
          .from('products')
          .insert([updatePayload])
          .select('*')
          .single()

        if (error) throw error
        savedProduct = data as Product
      }

      if (savedProduct) {
        await Promise.resolve(onSuccess(savedProduct))
      }

      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du produit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-leather">
              {product?.id ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du produit */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Nom du produit *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Collier Initiale Or Rose"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Slug (URL) *
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="Ex: collier-initiale-or-rose"
                className={errors.slug ? 'border-red-500' : ''}
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
              )}
              <p className="text-xs text-taupe mt-1">
                URL: /product/{formData.slug}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre produit..."
                className="w-full p-3 border border-gold/30 rounded-lg resize-none h-24"
              />
            </div>

            {/* Charms */}
            <div className="space-y-3 p-4 border border-gold/20 rounded-2xl bg-champagne/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-leather">Charms disponibles</p>
                  <p className="text-xs text-taupe">Ajoutez jusqu’à 5 charms (prix en euros, optionnel).</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (charms.length >= 5) return
                    setCharms((prev) => [...prev, { id: crypto.randomUUID(), label: '', price: 0 }])
                  }}
                  disabled={charms.length >= 5}
                >
                  + Ajouter
                </Button>
              </div>

              {charms.length === 0 && (
                <p className="text-xs text-taupe">Aucun charm configuré. Laissez vide si le produit n’en propose pas.</p>
              )}

              <div className="space-y-3">
                {charms.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-center bg-white/80 p-3 rounded-xl border border-gold/20">
                    <Input
                      value={field.label}
                      placeholder="Ex : Cœur doré"
                      onChange={(e) => {
                        const value = e.target.value
                        setCharms((prev) => prev.map((charm) => charm.id === field.id ? { ...charm, label: value } : charm))
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.price === 0 ? '' : field.price}
                        placeholder="Supplément (€)"
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          setCharms((prev) => prev.map((charm) => charm.id === field.id ? { ...charm, price: Number.isFinite(value) ? value : 0 } : charm))
                        }}
                        className="w-32"
                      />
                      <span className="text-xs text-taupe">€</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => setCharms((prev) => prev.filter((charm) => charm.id !== field.id))}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Catégorie
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value || null }))}
                className="w-full p-3 border border-gold/30 rounded-lg"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-leather mb-2">
                  Prix (€) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_cents / 100}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                  }))}
                  placeholder="34.90"
                  className={errors.price_cents ? 'border-red-500' : ''}
                />
                {errors.price_cents && (
                  <p className="text-red-500 text-sm mt-1">{errors.price_cents}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-leather mb-2">
                  Prix barré (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compare_at_cents ? formData.compare_at_cents / 100 : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    compare_at_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null
                  }))}
                  placeholder="39.90"
                  className={errors.compare_at_cents ? 'border-red-500' : ''}
                />
                {errors.compare_at_cents && (
                  <p className="text-red-500 text-sm mt-1">{errors.compare_at_cents}</p>
                )}
                <p className="text-xs text-taupe mt-1">
                  Prix original (pour les promos)
                </p>
              </div>
            </div>

            {/* Poids */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Poids (grammes)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.weight_grams ?? 0}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  weight_grams: e.target.value === '' ? 0 : Math.max(0, Math.round(Number(e.target.value)))
                }))}
                placeholder="Ex: 120"
                className={errors.weight_grams ? 'border-red-500' : ''}
              />
              {errors.weight_grams && (
                <p className="text-red-500 text-sm mt-1">{errors.weight_grams}</p>
              )}
              <p className="text-xs text-taupe mt-1">
                Poids total du bijou + emballage (en grammes) pour calculer la livraison.
              </p>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value as 'active' | 'draft' 
                }))}
                className="w-full p-3 border border-gold/30 rounded-lg"
              >
                <option value="draft">Brouillon (non visible)</option>
                <option value="active">Actif (visible sur le site)</option>
              </select>
            </div>

            {/* Gestion du stock */}
            <div className="pt-6 border-t border-gold/30">
              <h3 className="font-display text-lg text-leather mb-4">Gestion du stock</h3>
              
              {/* Type de gestion */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-leather mb-2">
                  Type de gestion
                </label>
                <select
                  value={formData.stock_status}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    stock_status: e.target.value as Product['stock_status']
                  }))}
                  className="w-full p-3 border border-gold/30 rounded-lg"
                >
                  <option value="in_stock">Stock normal</option>
                  <option value="preorder">Précommande (édition limitée)</option>
                </select>
              </div>

              {formData.stock_status === 'preorder' ? (
                <>
                  {/* Précommande */}
                  <div className="p-4 bg-rose/10 border border-rose/30 rounded-lg space-y-4">
                    <p className="text-sm text-leather font-medium">Mode précommande activé</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-leather mb-2">
                          Limite de précommandes *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.preorder_limit || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            preorder_limit: e.target.value ? parseInt(e.target.value) : null
                          }))}
                          placeholder="50"
                        />
                        <p className="text-xs text-taupe mt-1">Nombre max de précommandes</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-leather mb-2">
                          Disponible le
                        </label>
                        <Input
                          type="date"
                          value={formData.preorder_available_date?.split('T')[0] || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            preorder_available_date: e.target.value ? new Date(e.target.value).toISOString() : null
                          }))}
                        />
                        <p className="text-xs text-taupe mt-1">Date de livraison estimée</p>
                      </div>
                    </div>
                    <p className="text-xs text-taupe">
                      En mode précommande, les clients peuvent commander même si le produit n&apos;est pas encore disponible.
                      Cela crée de l&apos;engouement et permet de tester la demande.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Stock normal */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-leather mb-2">
                        Quantité en stock
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.stock_quantity ?? ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          stock_quantity: e.target.value ? parseInt(e.target.value) : null
                        }))}
                        placeholder="Illimité"
                      />
                      <p className="text-xs text-taupe mt-1">
                        Laissez vide pour un stock illimité
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-leather mb-2">
                        Seuil de stock bas
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.low_stock_threshold}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          low_stock_threshold: parseInt(e.target.value) || 5
                        }))}
                        placeholder="5"
                      />
                      <p className="text-xs text-taupe mt-1">
                        Alerte stock bas à partir de ce nombre
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gold/30">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-leather text-ivory hover:bg-leather/90"
                disabled={loading}
              >
                {loading ? 'Sauvegarde...' : (product?.id ? 'Mettre à jour' : 'Créer le produit')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
