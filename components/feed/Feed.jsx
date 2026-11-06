'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCurb } from '../Providers.jsx';
import CategoryFilter from './CategoryFilter.jsx';
import ListingCard from './ListingCard.jsx';
import Hero from '../home/Hero.jsx';
import HowItWorks from '../home/HowItWorks.jsx';
import { getSaved, toggleSaved, onSavedChange } from '../../lib/saved.js';

export default function Feed() {
  const { store, ready } = useCurb();
  const [category, setCategory] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [q, setQ] = useState('');
  const [listings, setListings] = useState(null);
  const [total, setTotal] = useState(0);
  const [saved, setSaved] = useState(() => new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    setSaved(getSaved());
    return onSavedChange((s) => setSaved(new Set(s)));
  }, []);

  useEffect(() => {
    if (!store) return;
    store.listListings().then((rows) => setTotal(rows.length), () => {});
  }, [store]);

  useEffect(() => {
    if (!store) return undefined;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const rows = await store.listListings({ category, freeOnly, q });
        if (!cancelled) {
          setListings(rows);
          setError('');
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [store, category, freeOnly, q]);

  const now = Date.now();
  const shown = listings && savedOnly ? listings.filter((l) => saved.has(l.id)) : listings;
  return (
    <>
      <Hero count={total} />
      <HowItWorks />

      <section id="feed" className="feed-head">
        <h2>On the curb right now</h2>
        <div className="toolbar">
          <input type="search" placeholder="Search sofas, cameras, lamps…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search listings" />
          <label className="toggle">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
            Free only
          </label>
          <label className="toggle">
            <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} />
            Saved ({saved.size})
          </label>
        </div>
        <CategoryFilter value={category} onChange={setCategory} />
      </section>

      {error && <p className="error">{error}</p>}
      {!ready || shown === null ? (
        <div className="masonry" aria-busy="true">
          {[320, 240, 380, 280, 300].map((h, i) => (
            <div key={i} className="pin skeleton" style={{ height: h }} />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="empty">
          <p className="muted">{savedOnly ? 'Nothing saved yet. Tap the heart on anything you like.' : 'Nothing matches yet. Try another category, or be the first to post.'}</p>
        </div>
      ) : (
        <div className="masonry" style={shown.length < 5 ? { columnCount: shown.length, maxWidth: shown.length * 300, marginInline: 'auto' } : undefined}>
          {shown.map((l, i) => (
            <ListingCard key={l.id} listing={l} now={now} index={i} saved={saved.has(l.id)} onToggleSave={toggleSaved} />
          ))}
        </div>
      )}

      <Link href="/new" className="fab">
        + List an item
      </Link>
    </>
  );
}
