'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCurb } from './Providers.jsx';
import { firstName } from '../lib/format.js';

const LINKS = [
  { href: '/', label: 'Browse' },
  { href: '/new', label: 'Post' },
  { href: '/messages', label: 'Messages' },
  { href: '/me', label: 'My listings' },
];

export default function Navbar() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { store, user } = useCurb();
  const clean = pathname.replace(/\/$/, '') || '/';
  const isOn = (href) => (href === '/' ? clean === '/' || clean.startsWith('/listing') : clean === href || clean.startsWith(`${href}/`));

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="Curb home">
          <span className="logo" aria-hidden="true">c</span>
          <span className="brand-name">curb</span>
        </Link>
        <nav className="nav" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isOn(l.href) ? 'on' : ''} aria-current={isOn(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="who">
          {user ? (
            <>
              <span className="who-name" title={user.email}>
                Hi, {firstName(user.name)}
              </span>
              <button
                type="button"
                className="link-btn"
                onClick={async () => {
                  await store.signOut();
                  router.push('/');
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/sign-in" className="pill">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
