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
}

type Category = {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  onClose: () => void
  onSuccess: () => void
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
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      if (product?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('products')
          .insert([formData])

        if (error) throw error
      }

      onSuccess()
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
