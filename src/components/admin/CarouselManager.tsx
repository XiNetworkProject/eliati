'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

type CarouselSlide = {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  link_url: string | null
  button_text: string | null
  sort_order: number
  is_active: boolean
}

export default function CarouselManager() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)

  useEffect(() => {
    loadSlides()
  }, [])

  const loadSlides = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('carousel_slides')
      .select('*')
      .order('sort_order', { ascending: true })
    setSlides(data || [])
    setLoading(false)
  }

  const deleteSlide = async (id: string, imageUrl: string) => {
    if (!confirm('Supprimer cette slide ?')) return

    try {
      // Supprimer de la base de données
      await supabase.from('carousel_slides').delete().eq('id', id)

      // Supprimer l'image du storage si elle est hébergée sur Supabase
      if (imageUrl.includes('supabase')) {
        const fileName = imageUrl.split('/').pop()
        if (fileName) {
          await supabase.storage.from('carousel').remove([fileName])
        }
      }

      loadSlides()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la slide')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-leather">Gestion du carousel</h2>
        <Button 
          className="bg-leather text-ivory hover:bg-leather/90"
          onClick={() => {
            setEditingSlide(null)
            setShowForm(true)
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une slide
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-gold/20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-3"></div>
          <p className="text-taupe text-sm">Chargement...</p>
        </Card>
      ) : slides.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-gold/20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-champagne/30 to-champagne/10 border border-gold/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-display text-xl text-leather mb-2">Aucune slide</h3>
          <p className="text-taupe text-sm">Ajoutez votre première slide pour le carousel</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <Card key={slide.id} className="group overflow-hidden bg-white/80 backdrop-blur-sm border-gold/20 hover:shadow-md transition-all">
              <div className="aspect-video relative bg-gradient-to-br from-champagne/20 to-rose/10">
                <Image
                  src={slide.image_url}
                  alt={slide.title || 'Slide carousel'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-leather">Position {slide.sort_order + 1}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${slide.is_active ? 'bg-gold/10 text-leather border border-gold/30' : 'bg-taupe/10 text-taupe'}`}>
                    {slide.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {slide.title && <p className="text-sm text-taupe mb-2">{slide.title}</p>}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-leather/20"
                    onClick={() => {
                      setEditingSlide(slide)
                      setShowForm(true)
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => deleteSlide(slide.id, slide.image_url)}
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
      )}

      {showForm && (
        <SlideForm
          slide={editingSlide}
          onClose={() => {
            setShowForm(false)
            setEditingSlide(null)
          }}
          onSuccess={loadSlides}
          nextOrder={slides.length}
        />
      )}
    </div>
  )
}

// Formulaire de slide
function SlideForm({ 
  slide, 
  onClose, 
  onSuccess,
  nextOrder 
}: { 
  slide: CarouselSlide | null
  onClose: () => void
  onSuccess: () => void
  nextOrder: number
}) {
  const [formData, setFormData] = useState({
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    link_url: slide?.link_url || '',
    button_text: slide?.button_text || 'Découvrir',
    is_active: slide?.is_active ?? true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(slide?.image_url || null)
  const [uploading, setUploading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = slide?.image_url || ''

      // Upload de la nouvelle image si elle existe
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `carousel-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('carousel')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('carousel')
          .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl
      }

      if (!imageUrl) {
        alert('Veuillez sélectionner une image')
        setUploading(false)
        return
      }

      const slideData = {
        ...formData,
        image_url: imageUrl,
        sort_order: slide?.sort_order ?? nextOrder,
      }

      if (slide?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('carousel_slides')
          .update(slideData)
          .eq('id', slide.id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('carousel_slides')
          .insert([slideData])

        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde de la slide')
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
              {slide ? 'Modifier' : 'Ajouter'} une slide
            </h2>
            <Button variant="outline" onClick={onClose}>✕</Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload image */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Image du carousel *
              </label>
              <div className="border-2 border-dashed border-gold/30 rounded-xl p-6 text-center hover:border-gold/50 transition-colors">
                {imagePreview ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
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
                  id="carousel-image"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('carousel-image')?.click()}
                  className="border-leather/20"
                >
                  {imagePreview ? 'Changer l\'image' : 'Sélectionner une image'}
                </Button>
                <p className="text-xs text-taupe mt-2">Recommandé: 1920x600px (format paysage)</p>
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Titre
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nouveautés 2025"
              />
            </div>

            {/* Sous-titre */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Sous-titre
              </label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Découvrez nos dernières créations"
              />
            </div>

            {/* Lien */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Lien de destination
              </label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="/new"
              />
              <p className="text-xs text-taupe mt-1">Lien vers une page (ex: /new, /sale, /category/colliers)</p>
            </div>

            {/* Texte du bouton */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Texte du bouton
              </label>
              <Input
                value={formData.button_text}
                onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                placeholder="Découvrir"
              />
            </div>

            {/* Active */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gold/30"
                />
                <span className="text-sm font-medium text-leather">Slide active (visible sur le site)</span>
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
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Upload...
                  </>
                ) : (
                  slide ? 'Mettre à jour' : 'Créer la slide'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

