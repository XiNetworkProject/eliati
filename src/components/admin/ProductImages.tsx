'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

const MAX_IMAGES = 3

interface ProductImageItem {
  id: string | number
  url: string
  alt: string | null
  position: number
  color_name?: string | null
}

interface ProductImagesProps {
  productId: string
  images: ProductImageItem[]
  onUpdate: () => void
}

export default function ProductImages({ productId, images, onUpdate }: ProductImagesProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [editingColorId, setEditingColorId] = useState<string | number | null>(null)
  const [colorInput, setColorInput] = useState('')

  const remainingSlots = MAX_IMAGES - images.length

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    if (remainingSlots <= 0) {
      alert(`Vous ne pouvez ajouter que ${MAX_IMAGES} images par produit.`)
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    setUploading(true)
    try {
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i]
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          alert(`Le fichier ${file.name} n'est pas une image`)
          continue
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Le fichier ${file.name} est trop volumineux (max 5MB)`)
          continue
        }

        // Upload vers Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${productId}-${Date.now()}-${i}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Erreur upload:', uploadError)
          continue
        }

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)

        // Ajouter l'image à la base de données
        const { error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            url: urlData.publicUrl,
            alt: file.name.split('.')[0],
            sort_order: images.length + i,
            color_name: null
          })

        if (dbError) {
          console.error('Erreur DB:', dbError)
        }
      }

      onUpdate()
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      alert('Erreur lors de l\'upload des images')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string | number, imageUrl: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return

    try {
      // Supprimer de la base de données
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (dbError) throw dbError

      // Supprimer du storage
      const fileName = imageUrl.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('products')
          .remove([fileName])
      }

      onUpdate()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'image')
    }
  }

  const handleEditColor = (image: ProductImageItem) => {
    setEditingColorId(image.id)
    setColorInput(image.color_name || '')
  }

  const handleSaveColor = async (imageId: string | number) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .update({ color_name: colorInput.trim() || null })
        .eq('id', imageId)

      if (error) throw error

      setEditingColorId(null)
      setColorInput('')
      onUpdate()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du coloris:', error)
      alert('Erreur lors de la sauvegarde du coloris')
    }
  }

  const handleCancelEdit = () => {
    setEditingColorId(null)
    setColorInput('')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg text-leather">Images du produit</h3>
      
      {/* Zone d'upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-gold bg-gold/10' 
            : 'border-gold/30 bg-champagne/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-4">📸</div>
        <p className="text-leather font-medium mb-2">
          Glissez-déposez vos images ici
        </p>
        <p className="text-sm text-taupe mb-4">
          ou cliquez pour sélectionner des fichiers
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          id="image-upload"
        />
        <Button
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={uploading || remainingSlots <= 0}
          className="bg-leather text-ivory hover:bg-leather/90"
        >
          {uploading
            ? 'Upload en cours...'
            : remainingSlots > 0
              ? `Sélectionner des images (${MAX_IMAGES - remainingSlots}/${MAX_IMAGES})`
              : 'Limite atteinte'}
        </Button>
        <p className="text-xs text-taupe mt-2">
          Formats acceptés: JPG, PNG, WebP (max 5MB par image) • {MAX_IMAGES} images max
        </p>
        {remainingSlots <= 0 && (
          <p className="text-xs text-red-600 mt-1">
            Limite atteinte : supprimez une image avant d&apos;en ajouter une nouvelle.
          </p>
        )}
      </div>

      {/* Liste des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images
            .sort((a, b) => a.position - b.position)
            .map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={image.url}
                    alt={image.alt || 'Image produit'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id, image.url)}
                      className="h-8 w-8 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                  {image.position === 0 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-gold text-leather text-xs px-2 py-1 rounded">
                        Image principale
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs text-taupe">
                    Position: {image.position + 1}
                  </p>
                  
                  {/* Édition du coloris */}
                  {editingColorId === image.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        placeholder="Ex: Or, Argent, Or rose..."
                        className="w-full px-2 py-1 text-sm border border-gold/30 rounded focus:ring-2 focus:ring-gold/50 focus:border-gold"
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleSaveColor(image.id)}
                          className="flex-1 bg-leather text-ivory hover:bg-leather/90 text-xs h-7"
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex-1 text-xs h-7"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-champagne/50 rounded p-1 -m-1 transition-colors"
                      onClick={() => handleEditColor(image)}
                    >
                      <span className="text-xs text-leather">
                        {image.color_name ? (
                          <>
                            <span className="font-medium">Coloris:</span> {image.color_name}
                          </>
                        ) : (
                          <span className="text-taupe italic">+ Ajouter un coloris</span>
                        )}
                      </span>
                      <span className="text-taupe text-xs">✏️</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-taupe">
          <div className="text-4xl mb-2">🖼️</div>
          <p>Aucune image ajoutée</p>
          <p className="text-sm">Ajoutez jusqu&apos;à {MAX_IMAGES} images pour votre produit</p>
        </div>
      )}

      {/* Info coloris */}
      {images.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">💡 Astuce coloris</p>
          <p>
            Ajoutez un nom de coloris à chaque image pour permettre à vos clients de choisir 
            leur variante préférée. Les images avec un coloris seront affichées comme options 
            sélectionnables sur la page produit.
          </p>
        </div>
      )}
    </div>
  )
}
