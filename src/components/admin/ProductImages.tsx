'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

interface ProductImagesProps {
  productId: string
  images: Array<{ id: number; url: string; alt: string | null; position: number }>
  onUpdate: () => void
}

export default function ProductImages({ productId, images, onUpdate }: ProductImagesProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
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
        
        const { data: uploadData, error: uploadError } = await supabase.storage
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
            position: images.length + i
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

  const handleDeleteImage = async (imageId: number, imageUrl: string) => {
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
          disabled={uploading}
          className="bg-leather text-ivory hover:bg-leather/90"
        >
          {uploading ? 'Upload en cours...' : 'Sélectionner des images'}
        </Button>
        <p className="text-xs text-taupe mt-2">
          Formats acceptés: JPG, PNG, WebP (max 5MB par image)
        </p>
      </div>

      {/* Liste des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="p-2">
                  <p className="text-xs text-taupe truncate">
                    Position: {image.position + 1}
                  </p>
                </div>
              </Card>
            ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-taupe">
          <div className="text-4xl mb-2">🖼️</div>
          <p>Aucune image ajoutée</p>
          <p className="text-sm">Ajoutez des images pour votre produit</p>
        </div>
      )}
    </div>
  )
}
