'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCurb } from '../Providers.jsx';
import { formatPrice, firstName } from '../../lib/format.js';

const clock = (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function Messages() {
  const { store, user, ready } = useCurb();
  const params = useSearchParams();
  const router = useRouter();
  const activeId = params.get('t');
  const [threads, setThreads] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (!store || !user) return;
    store.listThreads().then(setThreads, (e) => setError(e.message));
  }, [store, user, thread]);

  useEffect(() => {
    if (!store || !user || !activeId) {
      setThread(null);
      return undefined;
    }
    const load = () => store.getThread(activeId).then(setThread, (e) => setError(e.message));
    load();
    return store.subscribeThread(activeId, load);
  }, [store, user, activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages?.length]);

  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) {
    return (
      <section className="card narrow">
        <h1>Messages</h1>
        <p className="muted">Sign in with your .edu email to message sellers.</p>
        <Link href="/sign-in?next=/messages" className="pill">
          Sign in
        </Link>
      </section>
    );
  }

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await store.sendMessage(activeId, text);
      setText('');
      setThread(await store.getThread(activeId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={`inbox ${activeId ? 'has-active' : ''}`}>
      <section className="threads">
        <h1>Messages</h1>
        {threads === null ? (
          <p className="muted">Loading…</p>
        ) : threads.length === 0 ? (
          <p className="muted">
            No conversations yet. Find something on the <Link href="/">feed</Link> and tap "I want this".
          </p>
        ) : (
          <ul>
            {threads.map((t) => (
              <li key={t.id}>
                <button type="button" className={t.id === activeId ? 'on' : ''} onClick={() => router.push(`/messages?t=${encodeURIComponent(t.id)}`)}>
                  <b>{t.listing?.title ?? 'Listing'}</b>
                  <span className="muted small">
                    with {firstName(t.other?.name)} · {formatPrice(t.listing?.price_cents)}
                  </span>
                  <span className="preview">{t.last ? t.last.body : 'No messages yet'}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="thread" aria-live="polite">
        {!activeId || !thread ? (
          <p className="pick muted">{activeId ? 'Loading…' : 'Pick a conversation.'}</p>
        ) : (
          <>
            <div className="thread-head">
              <button type="button" className="link-btn" onClick={() => router.push('/messages')} aria-label="Back to conversations">
                ←
              </button>{' '}
              {firstName(thread.other?.name)} ·{' '}
              <Link href={`/listing?id=${encodeURIComponent(thread.thread.listing_id)}`}>{thread.listing?.title}</Link>
            </div>
            <div className="bubbles">
              {thread.messages.length === 0 && <p className="muted small">Say hi and suggest a time to meet at the pickup spot.</p>}
              {thread.messages.map((m) => (
                <div key={m.id} className={`bubble ${m.sender_id === user.id ? 'me' : 'them'}`}>
                  <p>{m.body}</p>
                  <time dateTime={m.created_at}>{clock(m.created_at)}</time>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form className="send" onSubmit={send}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Is it still available?" aria-label="Message" maxLength={1000} />
              <button type="submit" className="primary">
                Send
              </button>
            </form>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </div>
  );
}
