import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-civic-black text-gray-400" role="contentinfo">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-white mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded-md">
              <span className="text-civic-red text-xl font-black">X</span>
              <span className="text-lg">amle Civic</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Plateforme citoyenne de transparence et suivi des politiques publiques sénégalaises.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Plateforme</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/policies', label: 'Politiques publiques' },
                { href: '/map', label: 'Carte interactive' },
                { href: '/dashboard/overview', label: 'Tableau de bord' },
                { href: '/dashboard/analytics', label: 'Analytiques' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Participer</h3>
            <ul className="space-y-2 text-sm">
                {[
                  { href: '/contribute', label: 'Contribuer' },
                  { href: '/auth/login', label: 'Se connecter' },
                ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Légal</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/legal/privacy', label: 'Politique de confidentialité' },
                { href: '/legal/terms', label: 'Conditions d\'utilisation' },
                { href: '/legal/rgpd', label: 'RGPD & Loi 2008-12' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs">
            © {new Date().getFullYear()} Xamle Civic. Données publiques — Conformité{' '}
            <span className="text-civic-red">RGPD</span> &{' '}
            <span className="text-civic-red">Loi sénégalaise n° 2008-12</span>
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://github.com/xamle-civic"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded"
              aria-label="GitHub (ouvre dans un nouvel onglet)"
            >
              GitHub
            </a>
            <span className="text-gray-600" aria-hidden="true">·</span>
            <a
              href="mailto:contact@xamle.sn"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded"
            >
              contact@xamle.sn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
