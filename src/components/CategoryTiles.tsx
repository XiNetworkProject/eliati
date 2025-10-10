import Link from 'next/link'
import Image from 'next/image'

const items = [
  {
    slug: 'colliers',
    label: 'Colliers',
    img: '/cat/colliers.jpg',
    color: 'bg-champagne',
  },
  {
    slug: 'boucles',
    label: "Boucles d'oreille",
    img: '/cat/boucles.jpg',
    color: 'bg-rose',
  },
  {
    slug: 'bagues',
    label: 'Bagues',
    img: '/cat/bagues.jpg',
    color: 'bg-mauve',
  },
  {
    slug: 'bracelets',
    label: 'Bracelets',
    img: '/cat/bracelets.jpg',
    color: 'bg-taupe',
  },
]

export default function CategoryTiles() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((i) => (
        <Link
          key={i.slug}
          href={`/category/${i.slug}`}
          className="group relative overflow-hidden rounded-2xl border border-gold/30"
        >
          <div className="aspect-[4/5] relative">
            <Image
              src={i.img}
              alt={i.label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          <div
            className={`absolute inset-0 ${i.color} opacity-20 group-hover:opacity-30 transition`}
          />
          <div className="absolute inset-x-0 bottom-0 p-3 text-ivory bg-leather/40 backdrop-blur-sm">
            <p className="font-display tracking-wide">{i.label}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

