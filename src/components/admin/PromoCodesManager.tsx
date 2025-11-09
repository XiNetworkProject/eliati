'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type PromoCode = {
  id: string
  code: string
  discount_percent: number | null
  discount_amount_cents: number | null
  min_order_cents: number | null
  max_uses: number | null
  used_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export default function PromoCodesManager() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPromoCodes()
  }, [])

  const loadPromoCodes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPromoCodes(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des codes promo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) return

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', codeId)

      if (error) throw error
      loadPromoCodes()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du code promo')
    }
  }

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId)

      if (error) throw error
      loadPromoCodes()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour du code promo')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-4"></div>
        <p className="text-taupe">Chargement des codes promo...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-leather">Codes promotionnels</h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-leather text-ivory hover:bg-leather/90"
        >
          + Créer un code promo
        </Button>
      </div>

      {/* Liste des codes promo */}
      <div className="grid gap-4">
        {promoCodes.map((code) => (
          <Card key={code.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose/30 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎫</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-leather">{code.code}</h3>
                  <p className="text-sm text-taupe">
                    {code.discount_percent 
                      ? `-${code.discount_percent}%` 
                      : `-${(code.discount_amount_cents || 0) / 100} €`
                    }
                    {code.min_order_cents && (
                      <span className="ml-2">
                        (min. {(code.min_order_cents / 100).toFixed(2)} €)
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge 
                      className={`${
                        code.is_active 
                          ? 'bg-gold text-leather' 
                          : 'bg-taupe text-ivory'
                      }`}
                    >
                      {code.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge className="bg-champagne text-leather">
                      {code.used_count}/{code.max_uses || '∞'} utilisations
                    </Badge>
                    {code.expires_at && (
                      <Badge className="bg-mauve text-ivory">
                        Expire le {new Date(code.expires_at).toLocaleDateString('fr-FR')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleCodeStatus(code.id, code.is_active)}
                >
                  {code.is_active ? 'Désactiver' : 'Activer'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingCode(code)}
                >
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteCode(code.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {promoCodes.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="font-display text-lg text-leather mb-2">Aucun code promo</h3>
          <p className="text-taupe mb-4">Créez votre premier code de réduction</p>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-leather text-ivory hover:bg-leather/90"
          >
            Créer un code promo
          </Button>
        </Card>
      )}

      {/* Formulaire de création/modification */}
      {showForm && (
        <PromoCodeForm
          code={editingCode}
          onClose={() => {
            setShowForm(false)
            setEditingCode(null)
          }}
          onSuccess={loadPromoCodes}
        />
      )}
    </div>
  )
}

// Formulaire de code promo
function PromoCodeForm({ 
  code, 
  onClose, 
  onSuccess 
}: { 
  code: PromoCode | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    code: code?.code || '',
    discount_percent: code?.discount_percent || null,
    discount_amount_cents: code?.discount_amount_cents || null,
    min_order_cents: code?.min_order_cents || null,
    max_uses: code?.max_uses || null,
    expires_at: code?.expires_at ? code.expires_at.split('T')[0] : '',
    is_active: code?.is_active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'Le code est requis'
    }

    if (!formData.discount_percent && !formData.discount_amount_cents) {
      newErrors.discount = 'Vous devez définir une réduction en pourcentage ou en montant'
    }

    if (formData.discount_percent && formData.discount_amount_cents) {
      newErrors.discount = 'Choisissez soit un pourcentage, soit un montant fixe'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const dataToSave = {
        ...formData,
        discount_percent: formData.discount_percent || null,
        discount_amount_cents: formData.discount_amount_cents ? Math.round(formData.discount_amount_cents * 100) : null,
        min_order_cents: formData.min_order_cents ? Math.round(formData.min_order_cents * 100) : null,
        expires_at: formData.expires_at || null,
      }

      if (code?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('promo_codes')
          .update(dataToSave)
          .eq('id', code.id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('promo_codes')
          .insert([dataToSave])

        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      const message = error?.message || error?.details || 'Erreur inconnue'
      alert(`Erreur lors de la sauvegarde du code promo : ${message}`)
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
              {code?.id ? 'Modifier le code promo' : 'Créer un code promo'}
            </h2>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Code promo *
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="Ex: ELIGOLD20"
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
              )}
            </div>

            {/* Type de réduction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-leather mb-2">
                  Réduction en %
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percent || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    discount_percent: e.target.value ? parseInt(e.target.value) : null,
                    discount_amount_cents: null
                  }))}
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-leather mb-2">
                  Réduction fixe (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_amount_cents || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    discount_amount_cents: e.target.value ? parseFloat(e.target.value) : null,
                    discount_percent: null
                  }))}
                  placeholder="5.00"
                />
              </div>
            </div>

            {errors.discount && (
              <p className="text-red-500 text-sm">{errors.discount}</p>
            )}

            {/* Montant minimum */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Montant minimum (€)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.min_order_cents || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  min_order_cents: e.target.value ? parseFloat(e.target.value) : null
                }))}
                placeholder="50.00"
              />
              <p className="text-xs text-taupe mt-1">
                Montant minimum de commande pour utiliser ce code
              </p>
            </div>

            {/* Limite d'utilisation */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Limite d&apos;utilisation
              </label>
              <Input
                type="number"
                min="1"
                value={formData.max_uses || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_uses: e.target.value ? parseInt(e.target.value) : null
                }))}
                placeholder="100"
              />
              <p className="text-xs text-taupe mt-1">
                Nombre maximum d&apos;utilisations (laissez vide pour illimité)
              </p>
            </div>

            {/* Date d'expiration */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Date d&apos;expiration
              </label>
              <Input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
              <p className="text-xs text-taupe mt-1">
                Laissez vide pour aucune expiration
              </p>
            </div>

            {/* Statut */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gold/30"
                />
                <span className="text-sm font-medium text-leather">Code actif</span>
              </label>
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
                {loading ? 'Sauvegarde...' : (code?.id ? 'Mettre à jour' : 'Créer le code')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
