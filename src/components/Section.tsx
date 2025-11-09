export default function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h2 className="font-display text-2xl sm:text-3xl mb-4 sm:mb-6 border-b border-gold/30 pb-2 sm:pb-3 text-center sm:text-left">
        {title}
      </h2>
      <div className="space-y-6 sm:space-y-8">
        {children}
      </div>
    </section>
  )
}

