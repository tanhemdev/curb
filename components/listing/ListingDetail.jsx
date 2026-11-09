'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCurb } from '../Providers.jsx';
import Gallery from './Gallery.jsx';
import Reviews, { Stars } from './Reviews.jsx';
import { Heart } from '../feed/ListingCard.jsx';
import { categoryLabel } from '../../lib/campus.js';
import { formatPrice, timeAgo, firstName } from '../../lib/format.js';
import { isLive, timeLeftLabel } from '../../lib/expiry.js';
import { getSaved, toggleSaved } from '../../lib/saved.js';

export default function ListingDetail() {
  const params = useSearchParams();
  const id = params.get('id');
  const posted = params.get('posted') === '1';
  const paid = params.get('paid') === '1';
  const router = useRouter();
  const { store, user, ready } = useCurb();
  const [listing, setListing] = useState(undefined);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState('');
  const [rating, setRating] = useState({ count: 0, average: 0 });

  useEffect(() => {
    if (!store || !id) return;
    store.getListing(id).then(setListing, (e) => setError(e.message));
    setSaved(getSaved().has(id));
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
  const seller = firstName(listing.seller?.name);

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

  async function share() {
    const url = window.location.href.replace(/[?&](posted|paid)=1/g, '');
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, text: `${listing.title}, ${formatPrice(listing.price_cents)} on Curb`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared('Link copied');
    } catch {
      setShared('');
    }
    setTimeout(() => setShared(''), 2000);
  }

  async function handedOff() {
    setListing(await store.setStatus(listing.id, 'handed_off'));
  }

  return (
    <>
      <p className="crumbs">
        <Link href="/">← Back to the curb</Link>
      </p>
      <div className="detail">
        {posted && <p className="notice">Posted. It's live for 72 hours: students will message you here.</p>}
        {paid && (
          <p className="notice">
            Thanks! If your payment went through, Stripe emails you a receipt. Message {seller} to set up pickup, then come back and leave a review.
          </p>
        )}
        <div className="detail-media">
          <Gallery listing={listing} />
        </div>
        <div className="detail-body">
          <p className="muted small">
            {categoryLabel(listing.category)} · posted {timeAgo(listing.created_at)}
          </p>
          <h1>{listing.title}</h1>
          <div className="price-row">
            <p className={`big-price ${listing.price_cents ? '' : 'free'}`}>{formatPrice(listing.price_cents)}</p>
            <span className="expiry-line">{listing.status === 'handed_off' ? 'Handed off' : live ? (listing.pinned ? 'Pinned' : timeLeftLabel(listing.expires_at)) : 'Expired'}</span>
          </div>

          <div className="seller-row">
            <span className="avatar big" aria-hidden="true">
              {seller.charAt(0)}
            </span>
            <div>
              <b>{seller}</b>
              <div className="small muted">
                {rating.count ? (
                  <>
                    <Stars value={rating.average} size={13} /> {rating.average.toFixed(1)} · {rating.count} review{rating.count > 1 ? 's' : ''}
                  </>
                ) : (
                  'No reviews yet'
                )}{' '}
                · Pickup: {listing.pickup_spot}
              </div>
            </div>
          </div>

          {listing.description && <p className="desc">{listing.description}</p>}
          {error && <p className="error">{error}</p>}

          {mine ? (
            <div className="actions-col">
              {listing.status === 'active' ? (
                <button type="button" className="primary" onClick={handedOff}>
                  Mark handed off
                </button>
              ) : (
                <p className="ok">{listing.status === 'handed_off' ? 'Handed off. Thanks for keeping it out of the landfill.' : 'This listing has ended.'}</p>
              )}
              {!listing.payment_link && listing.price_cents > 0 && (
                <p className="muted small">
                  Want buyers to pay with Apple Pay or Link? <Link href="/me">Add a Stripe payment link</Link>.
                </p>
              )}
            </div>
          ) : live ? (
            <div className="buy-box">
              {listing.payment_link && listing.price_cents > 0 && (
                <a className="pay-btn" href={listing.payment_link} target="_blank" rel="noopener noreferrer">
                  <span>Buy now · {formatPrice(listing.price_cents)}</span>
                  <small>Apple Pay · Link · Card</small>
                </a>
              )}
              <button type="button" className={listing.payment_link && listing.price_cents > 0 ? 'secondary' : 'primary'} onClick={want} disabled={busy}>
                {user ? (listing.price_cents ? `Message ${seller}` : 'I want this') : 'Sign in to ask for it'}
              </button>
              <div className="pay-note">
                {listing.price_cents === 0 ? (
                  <p>
                    <b>It's free.</b> Message {seller}, agree on a time, and pick it up at {listing.pickup_spot}.
                  </p>
                ) : listing.payment_link ? (
                  <p>
                    <b>Secure checkout by Stripe.</b> Your payment goes straight to {seller}'s Stripe account and you get a receipt by email. Curb never sees your
                    card. Only buy.stripe.com links are allowed on Curb.
                  </p>
                ) : (
                  <p>
                    <b>Pay at pickup.</b> Settle up with {seller} in person however you agree (cash, Venmo…). Check the item before you pay.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="muted">This one's no longer available.</p>
          )}

          <div className="detail-tools">
            <button
              type="button"
              className={`tool ${saved ? 'on' : ''}`}
              aria-pressed={saved}
              onClick={() => setSaved(toggleSaved(listing.id))}
            >
              <Heart on={saved} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button type="button" className="tool" onClick={share}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" />
              </svg>
              {shared || 'Share'}
            </button>
          </div>
        </div>
      </div>
      <div className="detail-reviews">
        <Reviews listing={listing} onSummary={setRating} />
      </div>
    </>
  );
}
