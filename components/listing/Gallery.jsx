'use client';

import { useState } from 'react';
import ItemArt from '../ItemArt.jsx';

export default function Gallery({ listing }) {
  const photos = [listing.photo_url, ...(listing.photos ?? [])].filter(Boolean);
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  if (!photos.length) return <ItemArt id={listing.id} category={listing.category} fixedRatio={0.85} />;
  const go = (d) => setI((x) => (x + d + photos.length) % photos.length);
  return (
    <div className="gallery">
      <div className="gallery-main">
        <button type="button" className="gallery-img" onClick={() => setZoom(true)} aria-label="Open photo full size">
          <img key={photos[i]} src={photos[i]} alt={`${listing.title}, photo ${i + 1} of ${photos.length}`} />
        </button>
        {photos.length > 1 && (
          <>
            <button type="button" className="g-nav prev" onClick={() => go(-1)} aria-label="Previous photo">
              ‹
            </button>
            <button type="button" className="g-nav next" onClick={() => go(1)} aria-label="Next photo">
              ›
            </button>
            <span className="g-count">
              {i + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="thumbs">
          {photos.map((p, n) => (
            <button key={p} type="button" className={n === i ? 'on' : ''} onClick={() => setI(n)} aria-label={`Show photo ${n + 1}`}>
              <img src={p} alt="" />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo" onClick={() => setZoom(false)} onKeyDown={(e) => e.key === 'Escape' && setZoom(false)}>
          <img src={photos[i]} alt={listing.title} />
          <button type="button" className="lb-close" onClick={() => setZoom(false)} autoFocus>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
