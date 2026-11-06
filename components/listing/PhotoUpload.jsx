'use client';

import { useState } from 'react';
import { compressImage, MAX_SIDE } from '../../lib/imageCompression.js';

export const MAX_PHOTOS = 5;

// Picks up to 5 photos and shrinks each in the browser before anything is
// uploaded. The first photo is the cover in the feed.
export default function PhotoUpload({ value = [], onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pick(e) {
    const files = [...(e.target.files ?? [])].slice(0, MAX_PHOTOS - value.length);
    e.target.value = '';
    if (!files.length) return;
    if (files.some((f) => !f.type.startsWith('image/'))) return setError("One of those files isn't a photo.");
    setBusy(true);
    setError('');
    try {
      const shrunk = [];
      for (const f of files) shrunk.push(await compressImage(f));
      onChange([...value, ...shrunk]);
    } catch {
      setError("Couldn't read that photo. Try a JPEG or PNG.");
    } finally {
      setBusy(false);
    }
  }

  const remove = (i) => onChange(value.filter((_, n) => n !== i));
  const makeCover = (i) => onChange([value[i], ...value.filter((_, n) => n !== i)]);

  return (
    <div className="photo-upload">
      {value.length > 0 && (
        <div className="photo-grid">
          {value.map((src, i) => (
            <figure key={i} className={i === 0 ? 'cover' : ''}>
              <img src={src} alt={`Photo ${i + 1}`} />
              <figcaption>
                {i === 0 ? (
                  <span className="cover-tag">Cover</span>
                ) : (
                  <button type="button" className="link-btn" onClick={() => makeCover(i)}>
                    Make cover
                  </button>
                )}
                <button type="button" className="link-btn" onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`}>
                  Remove
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {value.length < MAX_PHOTOS && (
        <label className="drop">
          <input type="file" accept="image/*" multiple onChange={pick} />
          <b>{busy ? 'Shrinking your photos…' : value.length ? '+ Add more photos' : 'Add photos'}</b>
          <small>
            Up to {MAX_PHOTOS}. Real photos sell faster. Each is resized to {MAX_SIDE}px in your browser before upload.
          </small>
        </label>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
