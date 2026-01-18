import Image from 'next/image'

type LogoProps = {
  logoUrl?: string | null
  siteName?: string
}

export default function Logo({ logoUrl, siteName = 'EliAti' }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={logoUrl || '/logoeliati.png'}
        alt={siteName}
        width={120}
        height={120}
        className="h-12 w-auto"
        priority
      />
    </div>
  )
}

