export default function Footer() {
  return (
    <footer className="border-t border-gold/30 bg-champagne/20 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-lg mb-3">À propos</h3>
            <p className="text-sm text-taupe">
              Bijoux pensés à quatre mains, faits pour durer. Des colliers
              délicats aux bagues fines, chaque pièce est assemblée avec soin.
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg mb-3">Liens</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/new" className="text-taupe hover:text-leather">
                  Nouveautés
                </a>
              </li>
              <li>
                <a href="/sale" className="text-taupe hover:text-leather">
                  Promos
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg mb-3">Contact</h3>
            <p className="text-sm text-taupe">contact@eliatis.fr</p>
          </div>
        </div>
        <div className="border-t border-gold/20 mt-8 pt-6 text-center text-sm text-taupe">
          <p>© {new Date().getFullYear()} EliAtis. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

