export default function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="font-display text-2xl mb-4 border-b border-gold/30 pb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

