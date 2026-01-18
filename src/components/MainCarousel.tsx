'use client'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export type CarouselSlide = {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  link_url: string | null
  button_text: string | null
  sort_order: number
  is_active: boolean
}

type MainCarouselProps = {
  initialSlides?: CarouselSlide[]
}

export default function MainCarousel({ initialSlides = [] }: MainCarouselProps) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true })
  const [slides, setSlides] = useState<CarouselSlide[]>(initialSlides)
  const [loading, setLoading] = useState(initialSlides.length === 0)

  useEffect(() => {
    if (initialSlides.length > 0) return
    const loadSlides = async () => {
      const { data } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      
      setSlides(data || [])
      setLoading(false)
    }
    loadSlides()
  }, [initialSlides.length])

  useEffect(() => {
    if (!embla) return
    const id = setInterval(() => embla.scrollNext(), 5000)
    return () => clearInterval(id)
  }, [embla])

  if (loading) {
    return (
      <div className="rounded-2xl border border-gold/40 h-[360px] bg-gradient-to-br from-champagne/20 to-rose/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-3"></div>
          <p className="text-taupe text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="rounded-2xl border border-gold/40 h-[360px] bg-gradient-to-br from-champagne/20 to-rose/10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-taupe">Aucune slide configurée</p>
          <p className="text-taupe text-sm mt-1">Configurez le carousel dans l&apos;administration</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gold/40"
      ref={emblaRef}
    >
      <div className="flex">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="relative min-w-0 shrink-0 grow-0 basis-full h-[360px]"
          >
            <Image
              src={slide.image_url}
              alt={slide.title || 'Slide carousel'}
              fill
              className="object-cover"
              sizes="100vw"
              priority={idx === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-leather/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-ivory max-w-lg">
              {slide.title && (
                <h3 className="font-display text-4xl mb-2">{slide.title}</h3>
              )}
              {slide.subtitle && (
                <p className="text-lg opacity-90 mb-4">{slide.subtitle}</p>
              )}
              {slide.link_url && slide.button_text && (
                <Link href={slide.link_url}>
                  <button className="bg-ivory text-leather px-6 py-3 rounded-lg font-medium hover:bg-ivory/90 transition-colors">
                    {slide.button_text}
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

