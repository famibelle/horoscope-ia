'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const TABS = [
  { id: 'accueil',   href: '/',          icon: '🌿', label: 'Accueil'   },
  { id: 'signe',     href: '/horoscope', icon: '♊', label: 'Mon signe' },
  { id: 'contes',    href: '/#articles', icon: '📜', label: 'Contes'    },
  { id: 'a-propos',  href: '/a-propos',  icon: '✦',  label: 'À propos'  },
] as const;

export default function TabBar() {
  const pathname = usePathname();
  const [lastSign, setLastSign] = useState<string>('lion');

  useEffect(() => {
    const match = pathname.match(/^\/horoscope\/([^/]+)/);
    if (match) {
      setLastSign(match[1]);
      localStorage.setItem('lastSign', match[1]);
    } else {
      const stored = localStorage.getItem('lastSign');
      if (stored) setLastSign(stored);
    }
  }, [pathname]);

  function getHref(tab: (typeof TABS)[number]) {
    if (tab.id === 'signe') return `/horoscope/${lastSign}`;
    return tab.href;
  }

  function isActive(tab: (typeof TABS)[number]) {
    if (tab.id === 'accueil') return pathname === '/';
    if (tab.id === 'signe')   return pathname.startsWith('/horoscope');
    if (tab.id === 'contes')   return pathname.startsWith('/articles');
    if (tab.id === 'a-propos') return pathname === '/a-propos';
    return false;
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'var(--color-bg)',
        borderTop: '0.5px solid rgba(var(--tw-cream) / 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.id}
            href={getHref(tab)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              minWidth: '56px',
              position: 'relative',
              padding: '8px 4px',
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
            <span
              className="font-ui"
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.03em',
                color: active ? 'var(--color-gold)' : 'var(--color-text-muted)',
                transition: 'color 0.2s',
              }}
            >
              {tab.label}
            </span>
            {active && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#D4AF50',
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
