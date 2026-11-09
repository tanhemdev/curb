'use client';

import Link from 'next/link';
import ItemArt from '../ItemArt.jsx';
import { formatPrice } from '../../lib/format.js';
import { timeLeftLabel, isEndingSoon } from '../../lib/expiry.js';

export function Heart({ on }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
        fill={on ? '#e60023' : 'none'}
        stroke={on ? '#e60023' : '#1d1d1f'}
        strokeWidth="2"
      />
    </svg>
  );
}

export default function ListingCard({ listing, now, saved, onToggleSave, index = 0 }) {
  const free = !listing.price_cents;
  const photoCount = (listing.photo_url ? 1 : 0) + (listing.photos?.length ?? 0);
  return (
    <article className="pin" style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}>
      <div className="pin-media">
        <Link href={`/listing?id=${encodeURIComponent(listing.id)}`} className="pin-link" aria-label={`${listing.title}, ${formatPrice(listing.price_cents)}`}>
          {listing.photo_url ? <img src={listing.photo_url} alt="" loading="lazy" /> : <ItemArt id={listing.id} category={listing.category} />}
          <span className={`price-tag ${free ? 'free' : ''}`}>{formatPrice(listing.price_cents)}</span>
          <span className={`expiry ${!listing.pinned && isEndingSoon(listing.expires_at, now) ? 'soon' : ''}`}>{listing.pinned ? 'Pinned' : timeLeftLabel(listing.expires_at, now)}</span>
          {photoCount > 1 && <span className="photo-count">{photoCount} photos</span>}
          <span className="pin-hover" aria-hidden="true">
            View
          </span>
        </Link>
        <button type="button" className={`save-btn ${saved ? 'on' : ''}`} aria-pressed={saved} aria-label={saved ? `Unsave ${listing.title}` : `Save ${listing.title}`} onClick={() => onToggleSave?.(listing.id)}>
          <Heart on={saved} />
        </button>
      </div>
      <div className="pin-body">
        <h3>{listing.title}</h3>
        <p className="pin-meta">
          {listing.pickup_spot}
          {listing.payment_link && <span className="pay-badge">Apple Pay · Link</span>}
        </p>
      </div>
    </article>
  );
}
