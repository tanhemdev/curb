'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCurb } from '../Providers.jsx';
import { formatPrice } from '../../lib/format.js';
import { isLive, timeLeftLabel } from '../../lib/expiry.js';

function statusOf(l, now) {
  if (l.status === 'handed_off') return { text: 'Handed off', cls: 'ok' };
  if (l.status === 'removed') return { text: 'Removed', cls: 'muted' };
  if (isLive(l, now)) return { text: timeLeftLabel(l.expires_at, now), cls: '' };
  return { text: 'Expired', cls: 'warn' };
}

export default function MyListings() {
  const { store, user, ready } = useCurb();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = () => store.myListings().then(setRows, (e) => setError(e.message));
  useEffect(() => {
    if (store && user) load();
  }, [store, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) {
    return (
      <section className="card narrow">
        <h1>My listings</h1>
        <p className="muted">Sign in to see what you've posted.</p>
        <Link href="/sign-in?next=/me" className="pill">
          Sign in
        </Link>
      </section>
    );
  }

  const act = (fn) => async () => {
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const now = Date.now();
  const handedOff = rows?.filter((r) => r.status === 'handed_off').length ?? 0;
  return (
    <section className="card wide">
      <h1>My listings</h1>
      {rows && rows.length > 0 && (
        <p className="muted">
          {rows.length} posted · {handedOff} handed off
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {rows === null ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">
          Nothing posted yet. <Link href="/new">Post your first item</Link>: it takes about 30 seconds.
        </p>
      ) : (
        <ul className="mine">
          {rows.map((l) => {
            const s = statusOf(l, now);
            const live = isLive(l, now);
            return (
              <li key={l.id}>
                <Link href={`/listing?id=${encodeURIComponent(l.id)}`}>
                  <b>{l.title}</b>
                </Link>
                <span className="muted">{formatPrice(l.price_cents)}</span>
                <span className={s.cls}>{s.text}</span>
                <span className="actions">
                  {live && (
                    <button type="button" className="link-btn" onClick={act(() => store.setStatus(l.id, 'handed_off'))}>
                      Mark handed off
                    </button>
                  )}
                  {!live && l.status !== 'handed_off' && (
                    <button type="button" className="link-btn" onClick={act(() => store.relist(l.id))}>
                      Relist for 72 hours
                    </button>
                  )}
                  {l.status === 'active' && (
                    <button type="button" className="link-btn" onClick={act(() => store.setStatus(l.id, 'removed'))}>
                      Remove
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
