import Link from 'next/link';
import ItemArt from '../ItemArt.jsx';
import { formatPrice } from '../../lib/format.js';
import { timeLeftLabel, isEndingSoon } from '../../lib/expiry.js';

export default function ListingCard({ listing, now }) {
  const free = !listing.price_cents;
  return (
    <article className="pin">
      <Link href={`/listing?id=${encodeURIComponent(listing.id)}`} className="pin-link" aria-label={`${listing.title}, ${formatPrice(listing.price_cents)}`}>
        {listing.photo_url ? <img src={listing.photo_url} alt="" loading="lazy" /> : <ItemArt id={listing.id} category={listing.category} />}
        <span className={`price-tag ${free ? 'free' : ''}`}>{formatPrice(listing.price_cents)}</span>
        <span className={`expiry ${isEndingSoon(listing.expires_at, now) ? 'soon' : ''}`}>{timeLeftLabel(listing.expires_at, now)}</span>
      </Link>
      <div className="pin-body">
        <h3>{listing.title}</h3>
        <p className="pin-meta">{listing.pickup_spot}</p>
      </div>
    </article>
  );
}
