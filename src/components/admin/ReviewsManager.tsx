'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

type Review = {
  id: string
  product_id: string
  customer_name: string
  customer_email: string
  rating: number
  title: string | null
  comment: string | null
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  product?: {
    name: string
    product_images?: { url: string }[]
  }
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-gold fill-gold' : 'text-gold/30'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*, product:products(name, product_images(url))')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading reviews:', error)
    } else {
      setReviews(data || [])
    }
    setLoading(false)
  }

  const approveReview = async (reviewId: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId)

    if (!error) {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, is_approved: true } : r))
      )
    }
  }

  const rejectReview = async (reviewId: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: false })
      .eq('id', reviewId)

    if (!error) {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, is_approved: false } : r))
      )
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Supprimer définitivement cet avis ?')) return

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setSelectedReview(null)
    }
  }

  const toggleVerified = async (reviewId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_verified_purchase: !currentValue })
      .eq('id', reviewId)

    if (!error) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, is_verified_purchase: !currentValue } : r
        )
      )
    }
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'pending') return !r.is_approved
    if (filter === 'approved') return r.is_approved
    return true
  })

  const pendingCount = reviews.filter((r) => !r.is_approved).length
  const approvedCount = reviews.filter((r) => r.is_approved).length

  // Stats
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-leather">Gestion des avis</h2>
          <p className="text-sm text-taupe mt-1">
            {reviews.length} avis au total • Note moyenne : {averageRating} ⭐
          </p>
        </div>
        <Button onClick={loadReviews} variant="outline" className="border-gold/30">
          🔄 Actualiser
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('pending')}
          className={`p-4 rounded-xl border text-center transition-all ${
            filter === 'pending'
              ? 'bg-orange-50 border-orange-200'
              : 'bg-white border-gold/20 hover:border-gold/40'
          }`}
        >
          <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          <p className="text-xs text-taupe">En attente</p>
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`p-4 rounded-xl border text-center transition-all ${
            filter === 'approved'
              ? 'bg-green-50 border-green-200'
              : 'bg-white border-gold/20 hover:border-gold/40'
          }`}
        >
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-xs text-taupe">Approuvés</p>
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border text-center transition-all ${
            filter === 'all'
              ? 'bg-leather/10 border-leather/30'
              : 'bg-white border-gold/20 hover:border-gold/40'
          }`}
        >
          <p className="text-2xl font-bold text-leather">{reviews.length}</p>
          <p className="text-xs text-taupe">Tous</p>
        </button>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white rounded-xl animate-pulse">
              <div className="h-4 bg-champagne/30 rounded w-1/3 mb-3" />
              <div className="h-3 bg-champagne/20 rounded w-full mb-2" />
              <div className="h-3 bg-champagne/20 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gold/20">
          <span className="text-5xl mb-4 block">💬</span>
          <p className="text-taupe">
            {filter === 'pending'
              ? 'Aucun avis en attente de modération'
              : filter === 'approved'
              ? 'Aucun avis approuvé'
              : 'Aucun avis pour le moment'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`p-5 bg-white rounded-xl border transition-all hover:shadow-md ${
                review.is_approved ? 'border-green-200' : 'border-orange-200'
              }`}
            >
              <div className="flex gap-4">
                {/* Product image */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-champagne/30 to-rose/20 overflow-hidden flex-shrink-0">
                  {review.product?.product_images?.[0]?.url ? (
                    <Image
                      src={review.product.product_images[0].url}
                      alt={review.product.name || ''}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl">💎</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-leather">{review.customer_name}</p>
                      <p className="text-xs text-taupe">{review.customer_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={review.rating} />
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        review.is_approved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {review.is_approved ? 'Approuvé' : 'En attente'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-taupe mt-1">
                    Produit : <strong>{review.product?.name || 'Inconnu'}</strong>
                    {' • '}
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </p>

                  {review.title && (
                    <p className="font-medium text-leather mt-2">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-taupe mt-1 line-clamp-2">{review.comment}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gold/10">
                    {!review.is_approved ? (
                      <Button
                        size="sm"
                        onClick={() => approveReview(review.id)}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        ✓ Approuver
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectReview(review.id)}
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        Retirer l&apos;approbation
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVerified(review.id, review.is_verified_purchase)}
                      className={review.is_verified_purchase ? 'border-green-300 text-green-600' : ''}
                    >
                      {review.is_verified_purchase ? '✓ Achat vérifié' : 'Marquer comme vérifié'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReview(review)}
                      className="ml-auto"
                    >
                      Détails
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteReview(review.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-leather/50 backdrop-blur-sm">
          <div className="bg-ivory rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gold/20">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-leather">Détail de l&apos;avis</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2 hover:bg-champagne/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-taupe uppercase tracking-wide mb-1">Client</p>
                <p className="font-medium text-leather">{selectedReview.customer_name}</p>
                <p className="text-sm text-taupe">{selectedReview.customer_email}</p>
              </div>
              <div>
                <p className="text-xs text-taupe uppercase tracking-wide mb-1">Produit</p>
                <p className="font-medium text-leather">{selectedReview.product?.name}</p>
              </div>
              <div>
                <p className="text-xs text-taupe uppercase tracking-wide mb-1">Note</p>
                <StarDisplay rating={selectedReview.rating} />
              </div>
              {selectedReview.title && (
                <div>
                  <p className="text-xs text-taupe uppercase tracking-wide mb-1">Titre</p>
                  <p className="font-medium text-leather">{selectedReview.title}</p>
                </div>
              )}
              {selectedReview.comment && (
                <div>
                  <p className="text-xs text-taupe uppercase tracking-wide mb-1">Commentaire</p>
                  <p className="text-taupe whitespace-pre-line">{selectedReview.comment}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-taupe uppercase tracking-wide mb-1">Date</p>
                <p className="text-leather">
                  {new Date(selectedReview.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                {!selectedReview.is_approved ? (
                  <Button
                    onClick={() => {
                      approveReview(selectedReview.id)
                      setSelectedReview(null)
                    }}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    ✓ Approuver
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      rejectReview(selectedReview.id)
                      setSelectedReview(null)
                    }}
                    variant="outline"
                    className="flex-1 border-orange-300 text-orange-600"
                  >
                    Retirer
                  </Button>
                )}
                <Button
                  onClick={() => deleteReview(selectedReview.id)}
                  variant="outline"
                  className="border-red-200 text-red-600"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

