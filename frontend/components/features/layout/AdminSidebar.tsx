'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, MessageSquare,
  Shield, BarChart3, Settings, ChevronLeft, ChevronRight,
  ClipboardList, LogOut,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
  { href: '/admin/policies', label: 'Politiques', icon: BookOpen },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/contributions', label: 'Contributions', icon: MessageSquare },
  { href: '/admin/audit', label: 'Journal d\'audit', icon: ClipboardList },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser } = useUserStore();

  const isActive = (href: string) => pathname.startsWith(href);

  const handleLogout = () => {
    clearUser();
    router.push('/');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-shrink-0 flex-col border-r border-border bg-card h-full overflow-hidden"
      aria-label="Navigation administration"
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red rounded-md">
          <span className="text-civic-red text-xl font-black flex-shrink-0">X</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap text-sm"
              >
                amle Admin
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* User badge */}
      <div className={`border-b border-border p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-2 ${collapsed ? '' : 'rounded-lg bg-muted p-2'}`}>
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-civic-red flex items-center justify-center text-xs font-bold text-white" aria-hidden="true">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="truncate text-xs font-medium">{user?.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {MENU_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red ${
              isActive(href)
                ? 'bg-civic-red/10 text-civic-red'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? label : undefined}
            aria-current={isActive(href) ? 'page' : undefined}
          >
            <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-border p-2 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Voir le site' : undefined}
        >
          <BarChart3 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Voir le site
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-red"
        aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" aria-hidden="true" /> : <ChevronLeft className="h-3 w-3" aria-hidden="true" />}
      </button>
    </motion.aside>
  );
}
