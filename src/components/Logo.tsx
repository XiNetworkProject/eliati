import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logoeliati.png"
        alt="EliAti"
        width={120}
        height={120}
        className="h-12 w-auto"
        priority
      />
    </div>
  )
}

