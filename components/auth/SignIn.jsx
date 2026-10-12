'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useCurb } from '../Providers.jsx';
import { isEduEmail } from '../../lib/edu.js';

// Only same-site paths are allowed as a redirect target after sign-in.
const safeNext = (n) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/');

export default function SignIn() {
  const { store, user, ready } = useCurb();
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!ready) return <p className="muted">Loading…</p>;
  if (user) {
    return (
      <section className="card narrow">
        <h1>You're signed in</h1>
        <p className="muted">as {user.email}</p>
        <button type="button" className="primary" onClick={() => router.push(next)}>
          Continue
        </button>
      </section>
    );
  }

  const looksWrong = email.includes('@') && email.split('@')[1]?.includes('.') && !isEduEmail(email);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await store.signIn(email, name);
      if (res.needsEmailConfirmation) setSent(true);
      else router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <section className="card narrow">
        <h1>Check your email</h1>
        <p>We sent a sign-in link to {email}. Open it on this device to finish signing in.</p>
      </section>
    );
  }

  return (
    <section className="card narrow">
      <h1>Sign in</h1>
      <p className="muted">
        Curb is students only. Use your school email: no password, just a one-time link.
        {store?.mode === 'demo' && ' (In demo mode you are signed in right away.)'}
      </p>
      <form className="form" onSubmit={submit}>
        <label>
          Your name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tanya" maxLength={60} autoComplete="given-name" />
        </label>
        <label>
          School email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@berkeley.edu" required autoComplete="email" />
        </label>
        {looksWrong && <p className="warn">That doesn't look like a .edu address. Curb only works with school emails.</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Signing in…' : 'Continue'}
        </button>
      </form>
    </section>
  );
}
