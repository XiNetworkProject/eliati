'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ScrollReveal from '@/components/ScrollReveal'

type Review = {
  id: string
  customer_name: string
  rating: number
  title: string | null
  comment: string | null
  is_verified_purchase: boolean
  created_at: string
}

type ProductReviewsProps = {
  productId: string
  productName: string
}

// Composant étoiles
function StarRating({ rating, size = 'md', interactive = false, onChange }: {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (interactive ? (hoverRating || rating) : rating)
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <svg
              className={`${sizeClasses[size]} ${isFilled ? 'text-gold fill-gold' : 'text-gold/30'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                fill={isFilled ? 'currentColor' : 'none'}
              />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    comment: '',
  })

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('id, customer_name, rating, title, comment, is_verified_purchase, created_at')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    setReviews(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const { error: insertError } = await supabase.from('reviews').insert({
        product_id: productId,
        customer_name: formData.name,
        customer_email: formData.email,
        rating: formData.rating,
        title: formData.title || null,
        comment: formData.comment || null,
        is_approved: false, // Doit être approuvé par l'admin
      })

      if (insertError) throw insertError

      setSubmitted(true)
      setFormData({ name: '', email: '', rating: 5, title: '', comment: '' })
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Calcul des stats
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0
  
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
      : 0,
  }))

  return (
    <div className="space-y-8">
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-leather">Avis clients</h2>
            <p className="text-taupe mt-1">
              {reviews.length} avis pour {productName}
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-leather text-ivory hover:bg-leather/90"
          >
            ✍️ Donner mon avis
          </Button>
        </div>
      </ScrollReveal>

      {/* Stats */}
      {reviews.length > 0 && (
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="grid md:grid-cols-2 gap-6 p-6 bg-white/50 rounded-2xl border border-gold/20">
            {/* Average rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="font-display text-5xl text-leather">
                  {averageRating.toFixed(1)}
                </span>
                <div>
                  <StarRating rating={Math.round(averageRating)} size="lg" />
                  <p className="text-sm text-taupe mt-1">{reviews.length} avis</p>
                </div>
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="space-y-2">
              {ratingCounts.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-taupe w-12">{rating} ★</span>
                  <div className="flex-1 h-2 bg-champagne/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-taupe w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Review form */}
      {showForm && (
        <ScrollReveal animation="scale-in">
          <div className="p-6 bg-gradient-to-br from-champagne/20 to-rose/10 rounded-2xl border border-gold/20">
            {submitted ? (
              <div className="text-center py-8">
                <span className="text-5xl mb-4 block">🎉</span>
                <h3 className="font-display text-2xl text-leather mb-2">Merci pour votre avis !</h3>
                <p className="text-taupe">
                  Votre avis sera publié après validation par notre équipe.
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false)
                    setShowForm(false)
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Fermer
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-display text-xl text-leather">Votre avis compte !</h3>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Votre note *
                  </label>
                  <StarRating
                    rating={formData.rating}
                    size="lg"
                    interactive
                    onChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
                  />
                </div>

                {/* Name & Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-leather mb-2">
                      Votre prénom *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Marie"
                      required
                      className="border-gold/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-leather mb-2">
                      Votre email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="marie@exemple.com"
                      required
                      className="border-gold/20"
                    />
                    <p className="text-xs text-taupe mt-1">Ne sera pas affiché publiquement</p>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Titre de votre avis
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Magnifique bijou !"
                    className="border-gold/20"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-leather mb-2">
                    Votre commentaire
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                    placeholder="Décrivez votre expérience avec ce produit..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-leather text-ivory hover:bg-leather/90"
                  >
                    {submitting ? 'Envoi...' : 'Publier mon avis'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white/50 rounded-2xl animate-pulse">
              <div className="h-4 bg-champagne/30 rounded w-1/3 mb-3" />
              <div className="h-3 bg-champagne/20 rounded w-1/4 mb-4" />
              <div className="h-3 bg-champagne/20 rounded w-full mb-2" />
              <div className="h-3 bg-champagne/20 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <ScrollReveal key={review.id} animation="fade-up" delay={index * 50}>
              <div className="p-6 bg-white rounded-2xl border border-gold/10 hover:border-gold/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-champagne to-rose flex items-center justify-center text-white font-semibold">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-leather">{review.customer_name}</p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size="sm" />
                          {review.is_verified_purchase && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Achat vérifié
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-taupe">
                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-leather mt-4">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="text-taupe mt-2 leading-relaxed">{review.comment}</p>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal animation="scale-in">
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-gold/20">
            <span className="text-5xl mb-4 block">💬</span>
            <h3 className="font-display text-xl text-leather mb-2">Aucun avis pour le moment</h3>
            <p className="text-taupe mb-4">Soyez le premier à donner votre avis !</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-leather text-ivory hover:bg-leather/90"
            >
              ✍️ Donner mon avis
            </Button>
          </div>
        </ScrollReveal>
      )}
    </div>
  )
}

// Composant exporté pour afficher juste les étoiles avec la note moyenne
export function ProductRatingBadge({ productId }: { productId: string }) {
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null)

  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true)

      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
        setRating({ average: avg, count: data.length })
      }
    }
    fetchRating()
  }, [productId])

  if (!rating) return null

  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={Math.round(rating.average)} size="sm" />
      <span className="text-xs text-taupe">({rating.count})</span>
    </div>
  )
}

