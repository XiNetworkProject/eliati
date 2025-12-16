'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type Variant = {
  id: string
  color_name: string
  stock_quantity: number
  low_stock_threshold: number
  price_cents: number | null
  is_active: boolean
  sort_order: number
}

type ProductVariantsProps = {
  productId: string
  productPriceCents: number
  onUpdate: () => void
}

export default function ProductVariants({ productId, productPriceCents, onUpdate }: ProductVariantsProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Formulaire nouvelle variante
  const [newColorName, setNewColorName] = useState('')
  const [newStock, setNewStock] = useState(10)
  const [newLowThreshold, setNewLowThreshold] = useState(5)
  const [newCustomPrice, setNewCustomPrice] = useState<string>('')
  
  // Édition
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    stock_quantity: number
    low_stock_threshold: number
    price_cents: string
    is_active: boolean
  }>({ stock_quantity: 0, low_stock_threshold: 5, price_cents: '', is_active: true })

  useEffect(() => {
    loadVariants()
  }, [productId])

  const loadVariants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Erreur chargement variantes:', error)
    } else {
      setVariants(data || [])
    }
    setLoading(false)
  }

  const handleAddVariant = async () => {
    if (!newColorName.trim()) {
      alert('Veuillez entrer un nom de coloris')
      return
    }

    setSaving(true)
    try {
      const priceCents = newCustomPrice.trim() 
        ? Math.round(parseFloat(newCustomPrice.replace(',', '.')) * 100)
        : null

      const { error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          color_name: newColorName.trim(),
          stock_quantity: newStock,
          low_stock_threshold: newLowThreshold,
          price_cents: priceCents,
          sort_order: variants.length,
        })

      if (error) {
        if (error.code === '23505') {
          alert('Ce coloris existe déjà pour ce produit')
        } else {
          throw error
        }
      } else {
        setNewColorName('')
        setNewStock(10)
        setNewLowThreshold(5)
        setNewCustomPrice('')
        loadVariants()
        onUpdate()
      }
    } catch (error) {
      console.error('Erreur ajout variante:', error)
      alert('Erreur lors de l\'ajout de la variante')
    } finally {
      setSaving(false)
    }
  }

  const handleStartEdit = (variant: Variant) => {
    setEditingId(variant.id)
    setEditForm({
      stock_quantity: variant.stock_quantity,
      low_stock_threshold: variant.low_stock_threshold,
      price_cents: variant.price_cents ? (variant.price_cents / 100).toFixed(2) : '',
      is_active: variant.is_active,
    })
  }

  const handleSaveEdit = async (variantId: string) => {
    setSaving(true)
    try {
      const priceCents = editForm.price_cents.trim()
        ? Math.round(parseFloat(editForm.price_cents.replace(',', '.')) * 100)
        : null

      const { error } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: editForm.stock_quantity,
          low_stock_threshold: editForm.low_stock_threshold,
          price_cents: priceCents,
          is_active: editForm.is_active,
        })
        .eq('id', variantId)

      if (error) throw error

      setEditingId(null)
      loadVariants()
      onUpdate()
    } catch (error) {
      console.error('Erreur mise à jour variante:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (variantId: string, colorName: string) => {
    if (!confirm(`Supprimer la variante "${colorName}" ?`)) return

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)

      if (error) throw error

      loadVariants()
      onUpdate()
    } catch (error) {
      console.error('Erreur suppression variante:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock <= 0) return { label: 'Rupture', class: 'bg-red-100 text-red-700 border-red-300' }
    if (stock <= threshold) return { label: 'Stock faible', class: 'bg-orange-100 text-orange-700 border-orange-300' }
    return { label: 'En stock', class: 'bg-green-100 text-green-700 border-green-300' }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-taupe">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-2"></div>
        Chargement des variantes...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-leather">Variantes (Coloris & Stock)</h3>
        <span className="text-xs text-taupe">{variants.length} variante(s)</span>
      </div>

      {/* Formulaire ajout */}
      <Card className="p-4 bg-champagne/10 border-gold/20">
        <p className="text-sm font-medium text-leather mb-3">Ajouter une variante</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-taupe mb-1 block">Coloris *</label>
            <Input
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Ex: Or, Argent..."
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs text-taupe mb-1 block">Stock initial</label>
            <Input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs text-taupe mb-1 block">Seuil alerte</label>
            <Input
              type="number"
              min={0}
              value={newLowThreshold}
              onChange={(e) => setNewLowThreshold(parseInt(e.target.value) || 0)}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs text-taupe mb-1 block">Prix custom (€)</label>
            <Input
              value={newCustomPrice}
              onChange={(e) => setNewCustomPrice(e.target.value)}
              placeholder={(productPriceCents / 100).toFixed(2)}
              className="h-9"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAddVariant}
              disabled={saving || !newColorName.trim()}
              className="w-full h-9 bg-leather text-ivory hover:bg-leather/90"
            >
              {saving ? '...' : '+ Ajouter'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-taupe mt-2">
          💡 Laissez le prix vide pour utiliser le prix du produit ({(productPriceCents / 100).toFixed(2)} €)
        </p>
      </Card>

      {/* Liste des variantes */}
      {variants.length > 0 ? (
        <div className="space-y-3">
          {variants.map((variant) => {
            const status = getStockStatus(variant.stock_quantity, variant.low_stock_threshold)
            const displayPrice = variant.price_cents ?? productPriceCents
            const isEditing = editingId === variant.id

            return (
              <Card key={variant.id} className={`p-4 ${!variant.is_active ? 'opacity-60' : ''}`}>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-leather">{variant.color_name}</span>
                      <span className="text-xs text-taupe">(édition)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-taupe mb-1 block">Stock</label>
                        <Input
                          type="number"
                          min={0}
                          value={editForm.stock_quantity}
                          onChange={(e) => setEditForm({ ...editForm, stock_quantity: parseInt(e.target.value) || 0 })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-taupe mb-1 block">Seuil alerte</label>
                        <Input
                          type="number"
                          min={0}
                          value={editForm.low_stock_threshold}
                          onChange={(e) => setEditForm({ ...editForm, low_stock_threshold: parseInt(e.target.value) || 0 })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-taupe mb-1 block">Prix (€)</label>
                        <Input
                          value={editForm.price_cents}
                          onChange={(e) => setEditForm({ ...editForm, price_cents: e.target.value })}
                          placeholder={(productPriceCents / 100).toFixed(2)}
                          className="h-9"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <label className="flex items-center gap-2 text-xs text-taupe">
                          <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                            className="rounded"
                          />
                          Actif
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(variant.id)}
                        disabled={saving}
                        className="bg-leather text-ivory hover:bg-leather/90"
                      >
                        {saving ? '...' : 'Sauvegarder'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-leather">{variant.color_name}</p>
                        <p className="text-xs text-taupe">
                          {(displayPrice / 100).toFixed(2)} €
                          {variant.price_cents && (
                            <span className="ml-1 text-gold">(prix custom)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.class}`}>
                          {status.label}
                        </span>
                        <span className="text-sm text-leather font-semibold">
                          {variant.stock_quantity} pcs
                        </span>
                      </div>
                      {!variant.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-300">
                          Désactivé
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(variant)}
                        className="border-leather/20 hover:bg-leather hover:text-ivory"
                      >
                        ✏️ Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(variant.id, variant.color_name)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-8 text-center bg-white/60 border-gold/20">
          <div className="text-4xl mb-3">🎨</div>
          <p className="text-leather font-medium mb-1">Aucune variante</p>
          <p className="text-sm text-taupe">
            Ajoutez des coloris pour gérer le stock par variante
          </p>
        </Card>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 Comment ça marche</p>
        <ul className="text-xs space-y-1">
          <li>• Chaque variante a son propre stock indépendant</li>
          <li>• Le stock est décrémenté automatiquement lors des commandes</li>
          <li>• Vous pouvez définir un prix différent par coloris</li>
          <li>• Les coloris désactivés ne sont plus visibles pour les clients</li>
        </ul>
      </div>
    </div>
  )
}

