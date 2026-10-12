'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCurb } from '../Providers.jsx';
import CategoryFilter from './CategoryFilter.jsx';
import ListingCard from './ListingCard.jsx';

export default function Feed() {
  const { store, ready } = useCurb();
  const [category, setCategory] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [q, setQ] = useState('');
  const [listings, setListings] = useState(null);
  const [error, setError] = useState('');

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
  return (
    <>
      <section className="hero">
        <h1>Move-out stuff, a few blocks away</h1>
        <p>Desks, lamps, mini-fridges and bikes from students moving out, for students moving in. Everything is within 2 miles of campus and gone in 72 hours.</p>
      </section>

      <div className="toolbar">
        <input type="search" placeholder="Search desks, lamps, mini fridges…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search listings" />
        <label className="toggle">
          <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
          Free only
        </label>
      </div>
      <CategoryFilter value={category} onChange={setCategory} />

      {error && <p className="error">{error}</p>}
      {!ready || listings === null ? (
        <p className="muted empty">Loading listings…</p>
      ) : listings.length === 0 ? (
        <div className="empty">
          <p className="muted">Nothing matches yet. Try another category, or be the first to post.</p>
        </div>
      ) : (
        <div className="masonry">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} now={now} />
          ))}
        </div>
      )}

      <Link href="/new" className="fab">
        + List an item
      </Link>
    </>
  );
}
