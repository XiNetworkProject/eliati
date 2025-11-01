import Link from 'next/link'
import Image from 'next/image'

const items = [
  {
    slug: 'colliers',
    label: 'Colliers',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop&q=80',
    color: 'bg-champagne',
  },
  {
    slug: 'boucles',
    label: "Boucles d'oreille",
    img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=500&fit=crop&q=80',
    color: 'bg-rose',
  },
  {
    slug: 'bagues',
    label: 'Bagues',
    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=500&fit=crop&q=80',
    color: 'bg-mauve',
  },
  {
    slug: 'bracelets',
    label: 'Bracelets',
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=500&fit=crop&q=80',
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

