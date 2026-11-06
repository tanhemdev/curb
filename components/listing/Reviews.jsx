'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCurb } from '../Providers.jsx';
import { summarize, REVIEW_MAX } from '../../lib/reviews.js';
import { firstName, timeAgo } from '../../lib/format.js';

export function Stars({ value, size = 16 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? 'on' : ''} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

export default function Reviews({ listing, onSummary }) {
  const { store, user } = useCurb();
  const [reviews, setReviews] = useState(null);
  const [can, setCan] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const rows = await store.listReviews(listing.seller_id);
    setReviews(rows);
    onSummary?.(summarize(rows));
    setCan(await store.canReview(listing.id));
  }

  useEffect(() => {
    if (store) load().catch((e) => setError(e.message));
  }, [store, user, listing.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await store.addReview({ listing_id: listing.id, rating, body });
      setBody('');
      setRating(0);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const sum = summarize(reviews ?? []);
  const seller = firstName(listing.seller?.name);
  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <div className="reviews-head">
        <h2 id="reviews-title">Reviews of {seller}</h2>
        {sum.count > 0 && (
          <span className="reviews-sum">
            <Stars value={sum.average} /> <b>{sum.average.toFixed(1)}</b> <span className="muted">({sum.count})</span>
          </span>
        )}
      </div>

      {reviews === null ? (
        <p className="muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="muted">No reviews yet. Bought or picked up something from {seller}? You can be the first.</p>
      ) : (
        <ul className="review-list">
          {reviews.map((r) => (
            <li key={r.id}>
              <div className="review-top">
                <span className="avatar" aria-hidden="true">
                  {firstName(r.author_name).charAt(0).toUpperCase()}
                </span>
                <b>{firstName(r.author_name)}</b>
                <Stars value={r.rating} size={14} />
                <span className="muted small">{timeAgo(r.created_at)}</span>
              </div>
              {r.body && <p>{r.body}</p>}
              {r.listing_title && <p className="muted small">On: {r.listing_title}</p>}
            </li>
          ))}
        </ul>
      )}

      {can?.ok ? (
        <form className="review-form" onSubmit={submit}>
          <p className="small">
            <b>Leave a review</b>
          </p>
          <div className="star-pick" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                className={n <= (hover || rating) ? 'on' : ''}
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={REVIEW_MAX} rows={3} placeholder={`How was the handoff with ${seller}?`} />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primary" disabled={!rating || saving}>
            {saving ? 'Posting…' : 'Post review'}
          </button>
        </form>
      ) : can?.reason === 'signin' ? (
        <p className="muted small">
          <Link href={`/sign-in?next=${encodeURIComponent(`/listing?id=${listing.id}`)}`}>Sign in</Link> and message {seller} about this item to leave a review.
        </p>
      ) : can?.reason === 'message' ? (
        <p className="muted small">Message {seller} about this item first (tap "I want this"), then you can leave a review. That keeps every review from a real buyer.</p>
      ) : can?.reason === 'done' ? (
        <p className="ok small">Thanks for your review.</p>
      ) : null}
      {error && !can?.ok && <p className="error">{error}</p>}
    </section>
  );
}
