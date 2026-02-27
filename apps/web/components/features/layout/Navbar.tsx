'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { Button, Badge } from '@xamle/ui';
import {
  Menu, X, Search, Globe, LogOut, User, Settings,
  BarChart3, MapPin, BookOpen, PlusCircle, Home,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/policies', label: 'Politiques', icon: BookOpen },
  { href: '/map', label: 'Carte', icon: MapPin },
  { href: '/dashboard/overview', label: 'Tableau de bord', icon: BarChart3 },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser, isAuthenticated } = useUserStore();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/policies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    clearUser();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-civic-black/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded-md px-1"
          aria-label="Xamle Civic — Retour à l'accueil"
        >
          <span className="text-civic-red text-xl font-black">X</span>
          <span className="hidden sm:inline text-lg">amle Civic</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red ${
                isActive(href)
                  ? 'bg-civic-red/10 text-civic-red'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="rounded-md p-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red"
            aria-label="Ouvrir la recherche"
            aria-expanded={searchOpen}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          {isAuthenticated() ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/contribute">
                <Button size="sm" className="gap-1.5">
                  <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Contribuer
                </Button>
              </Link>
              <div className="relative group">
                <button
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red"
                  aria-label="Menu utilisateur"
                >
                  <span className="h-6 w-6 rounded-full bg-civic-red flex items-center justify-center text-xs font-bold" aria-hidden="true">
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  <span className="hidden lg:block max-w-24 truncate">{user?.name}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-card p-1 shadow-lg opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                  <Link href="/me" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
                    <User className="h-4 w-4" aria-hidden="true" />Mon profil
                  </Link>
                  {['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user?.role ?? '') && (
                    <Link href="/admin/policies" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
                      <Settings className="h-4 w-4" aria-hidden="true" />Administration
                    </Link>
                  )}
                  <hr className="my-1 border-border" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />Déconnexion
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login">
                <Button size="sm" className="text-white bg-civic-red hover:bg-civic-red/90">
                  Connexion
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-md p-2 text-gray-300 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-civic-black overflow-hidden"
          >
            <div className="container py-3">
              <form onSubmit={handleSearch} role="search">
                <label htmlFor="global-search" className="sr-only">
                  Rechercher une politique publique
                </label>
                <div className="flex gap-2">
                  <input
                    id="global-search"
                    type="search"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-civic-red"
                    placeholder="Rechercher une politique publique..."
                  />
                  <Button type="submit" size="sm">Rechercher</Button>
                  <Button type="button" variant="ghost" size="sm" className="text-gray-300" onClick={() => setSearchOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/10 bg-civic-black overflow-hidden"
            aria-label="Navigation mobile"
          >
            <div className="container py-4 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(href)
                      ? 'bg-civic-red/10 text-civic-red'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                  aria-current={isActive(href) ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              ))}

              <div className="border-t border-white/10 pt-3 mt-3">
                {isAuthenticated() ? (
                  <>
                    <Link href="/contribute" onClick={() => setOpen(false)}>
                      <Button className="w-full mb-2" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Contribuer
                      </Button>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                      <Button className="w-full" size="sm">Connexion</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
