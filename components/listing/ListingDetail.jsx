'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCurb } from '../Providers.jsx';
import ItemArt from '../ItemArt.jsx';
import { categoryLabel } from '../../lib/campus.js';
import { formatPrice, timeAgo, firstName } from '../../lib/format.js';
import { isLive, timeLeftLabel } from '../../lib/expiry.js';

export default function ListingDetail() {
  const params = useSearchParams();
  const id = params.get('id');
  const posted = params.get('posted') === '1';
  const router = useRouter();
  const { store, user, ready } = useCurb();
  const [listing, setListing] = useState(undefined);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!store || !id) return;
    store.getListing(id).then(setListing, (e) => setError(e.message));
  }, [store, id]);

  if (!ready || listing === undefined) return <p className="muted">Loading…</p>;
  if (!listing) {
    return (
      <section className="card narrow">
        <h1>Listing not found</h1>
        <p className="muted">It may have been handed off or expired.</p>
        <Link href="/">Back to browsing</Link>
      </section>
    );
  }

  const mine = user && user.id === listing.seller_id;
  const live = isLive(listing);

  async function want() {
    if (!user) return router.push(`/sign-in?next=${encodeURIComponent(`/listing?id=${listing.id}`)}`);
    setBusy(true);
    try {
      const thread = await store.openThread(listing.id);
      router.push(`/messages?t=${encodeURIComponent(thread.id)}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  async function handedOff() {
    setListing(await store.setStatus(listing.id, 'handed_off'));
  }

  return (
    <div className="detail">
      {posted && <p className="notice">Posted. It's live for 72 hours: students will message you here.</p>}
      <div className="detail-media">
        {listing.photo_url ? <img src={listing.photo_url} alt={listing.title} /> : <ItemArt id={listing.id} category={listing.category} fixedRatio={0.85} />}
      </div>
      <div className="detail-body">
        <p className="muted small">{categoryLabel(listing.category)}</p>
        <h1>{listing.title}</h1>
        <p className="big-price">{formatPrice(listing.price_cents)}</p>
        <span className="expiry-line">
          {listing.status === 'handed_off' ? 'Handed off' : live ? timeLeftLabel(listing.expires_at) : 'Expired'}
        </span>
        <dl className="facts">
          <dt>Pickup</dt>
          <dd>{listing.pickup_spot}</dd>
          <dt>From</dt>
          <dd>{firstName(listing.seller?.name)}</dd>
          <dt>Posted</dt>
          <dd>{timeAgo(listing.created_at)}</dd>
        </dl>
        {listing.description && <p>{listing.description}</p>}
        {error && <p className="error">{error}</p>}
        {mine ? (
          listing.status === 'active' ? (
            <button type="button" className="primary" onClick={handedOff}>
              Mark handed off
            </button>
          ) : (
            <p className="ok">{listing.status === 'handed_off' ? 'Handed off. Thanks for keeping it out of the landfill.' : 'This listing has ended.'}</p>
          )
        ) : live ? (
          <button type="button" className="primary" onClick={want} disabled={busy}>
            {user ? 'I want this' : 'Sign in to ask for it'}
          </button>
        ) : (
          <p className="muted">This one's no longer available.</p>
        )}
      </div>
    </div>
  );
}
