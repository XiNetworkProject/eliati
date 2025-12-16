import Link from 'next/link'

const LINKS = {
  shop: [
    { href: '/new', label: 'Nouveautés' },
    { href: '/category/colliers', label: 'Colliers' },
    { href: '/category/boucles', label: "Boucles d'oreille" },
    { href: '/category/bagues', label: 'Bagues' },
    { href: '/category/bracelets', label: 'Bracelets' },
    { href: '/sale', label: 'Promos' },
  ],
  info: [
    { href: '/info/charms-personnalises', label: 'Charms personnalisés' },
    { href: '/info/acier-inoxydable', label: 'Acier inoxydable' },
  ],
  legal: [
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/cgv', label: 'CGV' },
    { href: '/politique-de-confidentialite', label: 'Confidentialité' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
      
      {/* Main footer */}
      <div className="bg-gradient-to-b from-champagne/30 to-champagne/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="font-script text-4xl text-leather mb-4">EliAti</div>
              <p className="text-sm text-taupe leading-relaxed mb-6">
                Bijoux pensés à quatre mains, faits pour durer. 
                Des créations uniques qui accompagnent vos plus beaux moments.
              </p>
              
              {/* Social links */}
              <div className="flex gap-3">
                <a 
                  href="https://www.facebook.com/profile.php?id=61583076211318"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 flex items-center justify-center rounded-xl bg-white hover:bg-leather border border-gold/30 hover:border-leather transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 text-leather group-hover:text-ivory transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://www.instagram.com/eliati_creations/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 flex items-center justify-center rounded-xl bg-white hover:bg-leather border border-gold/30 hover:border-leather transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-leather group-hover:text-ivory transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                <a 
                  href="https://www.tiktok.com/@eliati_creations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 flex items-center justify-center rounded-xl bg-white hover:bg-leather border border-gold/30 hover:border-leather transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5 text-leather group-hover:text-ivory transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop links */}
            <div>
              <h3 className="font-display text-lg text-leather mb-5">Boutique</h3>
              <ul className="space-y-3">
                {LINKS.shop.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-taupe hover:text-leather hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info & Legal */}
            <div>
              <h3 className="font-display text-lg text-leather mb-5">Informations</h3>
              <ul className="space-y-3 mb-8">
                {LINKS.info.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-taupe hover:text-leather transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <h4 className="font-medium text-leather text-sm mb-3">Légal</h4>
              <ul className="space-y-2">
                {LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-xs text-taupe/80 hover:text-leather transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h3 className="font-display text-lg text-leather mb-5">Contact</h3>
              <a 
                href="mailto:Contacteliati@gmail.com"
                className="inline-flex items-center gap-2 text-sm text-taupe hover:text-leather transition-colors mb-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contacteliati@gmail.com
              </a>
              
              {/* Trust badges */}
              <div className="space-y-3 pt-4 border-t border-gold/20">
                <div className="flex items-center gap-2 text-xs text-taupe">
                  <span className="text-base">🔒</span>
                  Paiement 100% sécurisé
                </div>
                <div className="flex items-center gap-2 text-xs text-taupe">
                  <span className="text-base">🇫🇷</span>
                  Créé en France
                </div>
                <div className="flex items-center gap-2 text-xs text-taupe">
                  <span className="text-base">💎</span>
                  Acier inoxydable 316L
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gold/20 bg-champagne/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-taupe">
                © {new Date().getFullYear()} EliAti. Tous droits réservés.
              </p>
              
              {/* Payment methods */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-taupe">Paiements acceptés :</span>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-6 bg-white rounded border border-gold/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-600">PayPal</span>
                  </div>
                  <div className="w-10 h-6 bg-white rounded border border-gold/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-leather">CB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
