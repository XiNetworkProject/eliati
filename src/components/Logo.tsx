import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image 
        src="/logoeliatitransparent.png" 
        alt="EliAti" 
        width={120}
        height={40}
        className="h-8 w-auto"
        priority
      />
    </div>
  );
}

