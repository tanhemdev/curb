'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCurb } from '../Providers.jsx';
import PhotoUpload from './PhotoUpload.jsx';
import { CAMPUS, CATEGORIES, PICKUP_SPOTS } from '../../lib/campus.js';
import { parsePrice } from '../../lib/format.js';
import { withinCampus, milesBetween } from '../../lib/geo.js';
import { LISTING_TTL_HOURS } from '../../lib/expiry.js';

export default function CreateListing() {
  const { store, user, ready } = useCurb();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('furniture');
  const [free, setFree] = useState(false);
  const [price, setPrice] = useState('');
  const [spot, setSpot] = useState(PICKUP_SPOTS[0].name);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [geo, setGeo] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) {
    return (
      <section className="card narrow">
        <h1>Post an item</h1>
        <p className="muted">Curb is students only, so posting needs your .edu email first.</p>
        <Link href="/sign-in?next=/new" className="pill">
          Sign in to post
        </Link>
      </section>
    );
  }

  function checkLocation() {
    if (!navigator.geolocation) return setGeo({ ok: false, text: "Your browser can't share location. Pick the closest pickup spot instead." });
    setGeo({ ok: null, text: 'Checking…' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const miles = milesBetween(here, CAMPUS.center).toFixed(1);
        setGeo(
          withinCampus(here, CAMPUS)
            ? { ok: true, text: `You're ${miles} miles from campus: inside Curb's ${CAMPUS.radiusMiles}-mile area.` }
            : { ok: false, text: `You're ${miles} miles from campus. Curb only covers ${CAMPUS.radiusMiles} miles around ${CAMPUS.name}, so pick a pickup spot near campus.` },
        );
      },
      () => setGeo({ ok: false, text: 'Location was blocked. That is fine: just pick a pickup spot.' }),
      { timeout: 8000 },
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const cents = free ? 0 : parsePrice(price);
    if (!title.trim()) return setError('Give your listing a title.');
    if (cents === null) return setError('Enter a price like 20 or 12.50 (up to $500), or mark it free.');
    setSaving(true);
    try {
      const photo_url = photo ? await store.uploadPhoto(photo) : null;
      const listing = await store.createListing({ title, description, category, price_cents: cents, pickup_spot: spot, photo_url });
      router.push(`/listing?id=${encodeURIComponent(listing.id)}&posted=1`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <section className="card narrow">
      <h1>Post an item</h1>
      <p className="muted">About 30 seconds. It stays up for {LISTING_TTL_HOURS} hours, and you can relist anything that doesn't go.</p>
      <form className="form" onSubmit={submit}>
        <PhotoUpload value={photo} onChange={setPhoto} />
        <label>
          What is it?
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="White desk, 47 inch" required />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Price</legend>
          <label className="inline">
            <input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} /> Free
          </label>
          {!free && (
            <label className="inline">
              $ <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="20" aria-label="Price in dollars" size={6} />
            </label>
          )}
        </fieldset>
        <label>
          Pickup spot
          <select value={spot} onChange={(e) => setSpot(e.target.value)}>
            {PICKUP_SPOTS.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
        </label>
        <p className="geo">
          <button type="button" className="link-btn" onClick={checkLocation}>
            Check I'm near campus
          </button>{' '}
          {geo && <span className={geo.ok ? 'ok' : geo.ok === false ? 'warn' : 'muted'}>{geo.text}</span>}
        </p>
        <label>
          Details (optional)
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} rows={3} placeholder="Condition, size, when you can hand it off" />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Posting…' : 'Post it'}
        </button>
      </form>
    </section>
  );
}
