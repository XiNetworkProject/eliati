'use client'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect } from 'react'
import Image from 'next/image'

const slides = [
  {
    src: '/hero/slide1.jpg',
    title: 'Nouvelle collection',
    caption: 'Or rose & perles',
  },
  {
    src: '/hero/slide2.jpg',
    title: 'Gravure offerte',
    caption: 'Sur une sélection',
  },
  {
    src: '/hero/slide3.jpg',
    title: '-20% cette semaine',
    caption: 'Code ELIGOLD',
  },
]

export default function MainCarousel() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true })

  useEffect(() => {
    if (!embla) return
    const id = setInterval(() => embla.scrollNext(), 5000)
    return () => clearInterval(id)
  }, [embla])

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gold/40"
      ref={emblaRef}
    >
      <div className="flex">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className="relative min-w-0 shrink-0 grow-0 basis-full h-[360px]"
          >
            <Image
              src={s.src}
              alt={s.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={idx === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-leather/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-ivory">
              <h3 className="font-display text-3xl">{s.title}</h3>
              <p className="opacity-90">{s.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

