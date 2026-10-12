'use client';

import { useState } from 'react';
import { compressImage, MAX_SIDE } from '../../lib/imageCompression.js';

// Picks a photo and shrinks it in the browser before anything is uploaded.
export default function PhotoUpload({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('That file isn\'t a photo.');
    setBusy(true);
    setError('');
    try {
      onChange(await compressImage(file));
    } catch {
      setError('Couldn\'t read that photo. Try a JPEG or PNG.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-upload">
      {value ? (
        <div className="photo-preview">
          <img src={value} alt="Your photo" />
          <button type="button" className="link-btn" onClick={() => onChange(null)}>
            Remove photo
          </button>
        </div>
      ) : (
        <label className="drop">
          <input type="file" accept="image/*" capture="environment" onChange={pick} />
          <b>{busy ? 'Shrinking your photo…' : 'Add a photo'}</b>
          <small>Optional. It's resized to {MAX_SIDE}px in your browser before upload.</small>
        </label>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
