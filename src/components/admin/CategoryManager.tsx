'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

type Props = {
  categories: Category[]
  onUpdate: () => void | Promise<void>
  protectedSlugs?: string[]
}

export default function CategoryManager({ 
  categories, 
  onUpdate,
  protectedSlugs = [],
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const normalizedProtectedSlugs = protectedSlugs.map((slug) => slug.toLowerCase())

  const isProtected = (slug: string) => normalizedProtectedSlugs.includes(slug.toLowerCase())

  const handleDelete = async (category: Category) => {
    if (isProtected(category.slug)) {
      alert('Cette catégorie est obligatoire pour la navigation et ne peut pas être supprimée.')
      return
    }

    if (!confirm('Supprimer cette catégorie ? Les produits ne seront pas supprimés.')) return

    try {
      // Supprimer de la base de données
      await supabase.from('categories').delete().eq('id', category.id)

      // Supprimer l'image du storage si elle existe
      if (category.image_url && category.image_url.includes('supabase')) {
        const fileName = category.image_url.split('/').pop()
        if (fileName) {
          await supabase.storage.from('categories').remove([fileName])
        }
      }

      await Promise.resolve(onUpdate())
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-leather">Gestion des catégories</h2>
        <Button 
          className="bg-leather text-ivory hover:bg-leather/90"
          onClick={() => {
            setEditingCategory(null)
            setShowForm(true)
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une catégorie
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => {
          const categoryProtected = isProtected(category.slug)
          return (
          <Card key={category.id} className="overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20 hover:shadow-md transition-all">
            <div className="p-5 flex items-center gap-5">
              {/* Image de la catégorie */}
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/40 to-gold/20" />
                )}
              </div>

              {/* Infos */}
              <div className="flex-1">
                <h3 className="font-display text-lg text-leather mb-1">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-taupe mb-2">{category.description}</p>
                )}
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge className="bg-champagne/20 text-leather border border-gold/20">
                    /{category.slug}
                  </Badge>
                  {categoryProtected && (
                    <Badge className="bg-gold text-leather border border-gold/60">
                      Catégorie système
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-leather/20 hover:bg-leather hover:text-ivory transition-all"
                  onClick={() => {
                    setEditingCategory(category)
                    setShowForm(true)
                  }}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDelete(category)}
                  disabled={categoryProtected}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        )})}
      </div>

      {categories.length === 0 && (
        <Card className="p-12 text-center bg-white/60 backdrop-blur-sm border-gold/20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="font-display text-xl text-leather mb-2">Aucune catégorie</h3>
          <p className="text-taupe text-sm">Créez votre première catégorie</p>
        </Card>
      )}

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowForm(false)
            setEditingCategory(null)
          }}
          onSuccess={onUpdate}
          protectedSlugs={normalizedProtectedSlugs}
        />
      )}
    </div>
  )
}

// Formulaire de catégorie
function CategoryForm({ 
  category, 
  onClose, 
  onSuccess,
  protectedSlugs = [],
}: { 
  category: Category | null
  onClose: () => void
  onSuccess: () => void | Promise<void>
  protectedSlugs?: string[]
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image_url || null)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const normalizedProtectedSlugs = protectedSlugs.map((slug) => slug.toLowerCase())
  const isProtected = category ? normalizedProtectedSlugs.includes(category.slug.toLowerCase()) : false

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    if (!formData.slug.trim()) newErrors.slug = 'Le slug est requis'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setUploading(true)

    try {
      let imageUrl = category?.image_url || null

      // Upload de la nouvelle image si elle existe
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `category-${formData.slug}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('categories')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('categories')
          .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl

        // Supprimer l'ancienne image si elle existe
        if (category?.image_url && category.image_url.includes('supabase')) {
          const oldFileName = category.image_url.split('/').pop()
          if (oldFileName) {
            await supabase.storage.from('categories').remove([oldFileName])
          }
        }
      }

      const categoryData = {
        ...formData,
        image_url: imageUrl,
      }

      if (category?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('categories')
          .insert([categoryData])

        if (error) throw error
      }

      await Promise.resolve(onSuccess())
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde de la catégorie')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-leather">
              {category ? 'Modifier' : 'Ajouter'} une catégorie
            </h2>
            <Button variant="outline" onClick={onClose}>✕</Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload image */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Image de la catégorie
              </label>
              <div className="border-2 border-dashed border-gold/30 rounded-xl p-6 text-center hover:border-gold/50 transition-colors">
                {imagePreview ? (
                  <div className="relative aspect-[4/5] max-w-xs mx-auto rounded-lg overflow-hidden mb-4">
                    <Image
                      src={imagePreview}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="py-8">
                    <svg className="w-12 h-12 text-taupe mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-taupe mb-2">Cliquez pour sélectionner une image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="category-image"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('category-image')?.click()}
                  className="border-leather/20"
                >
                  {imagePreview ? 'Changer l\'image' : 'Sélectionner une image'}
                </Button>
                <p className="text-xs text-taupe mt-2">Recommandé: format portrait (ex: 600x800px)</p>
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Nom de la catégorie *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Colliers"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Slug (URL) *
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="colliers"
                className={errors.slug ? 'border-red-500' : ''}
                disabled={isProtected}
              />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
              <p className="text-xs text-taupe mt-1">URL: /category/{formData.slug}</p>
              {isProtected && (
                <p className="text-xs text-leather/80 mt-1">Cette catégorie est protégée. Le slug ne peut pas être modifié.</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Colliers délicats et élégants..."
                className="w-full p-3 border border-gold/30 rounded-lg resize-none h-24"
              />
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gold/30">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-leather text-ivory hover:bg-leather/90"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  category ? 'Mettre à jour' : 'Créer la catégorie'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

