// Demo backend: the whole marketplace in this browser's localStorage.
// Used when no Supabase project is configured (the GitHub Pages demo), and in
// tests. It implements the same API as lib/data/supabase.js.

import { isEduEmail, normalizeEmail, campusFromEmail } from '../edu.js';
import { expiresAt, isLive, LISTING_TTL_HOURS } from '../expiry.js';
import { seedListings, SEED_USERS } from './seed.js';
import { parsePaymentLink, parseVenmo } from '../payments.js';
import { validateReview, REVIEW_MAX } from '../reviews.js';

const KEY = 'curb.demo.v2';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

function safeStorage() {
  try {
    const s = globalThis.localStorage;
    s.setItem('curb.probe', '1');
    s.removeItem('curb.probe');
    return s;
  } catch {
    return memoryStorage();
  }
}

let counter = 0;
const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function createDemoStore({ storage = safeStorage(), now = () => Date.now(), autoReplyMs = 1800 } = {}) {
  const listeners = new Set();
  const threadListeners = new Map();

  function load() {
    try {
      const raw = storage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* corrupted: reseed below */
    }
    const state = { session: null, users: Object.fromEntries(SEED_USERS.map((u) => [u.id, u])), listings: seedListings(now()), threads: [], messages: [], reviews: [] };
    storage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  let state = load();
  state.reviews ??= [];
  // The showcase listings never run out: every visit puts them back on a
  // fresh clock (unless someone marked one handed off), so the preview never
  // turns into an empty feed for a returning visitor.
  const fresh = new Map(seedListings(now()).map((l) => [l.id, l]));
  state.listings = state.listings.map((l) =>
    fresh.has(l.id) && l.status !== 'handed_off' ? { ...l, status: 'active', created_at: fresh.get(l.id).created_at, expires_at: fresh.get(l.id).expires_at } : l,
  );
  storage.setItem(KEY, JSON.stringify(state));
  const save = () => storage.setItem(KEY, JSON.stringify(state));
  const me = () => (state.session ? state.users[state.session] : null);
  const requireUser = () => {
    const u = me();
    if (!u) throw new Error('Sign in with your .edu email first.');
    return u;
  };
  const withSeller = (l) => ({ ...l, seller: state.users[l.seller_id] ?? null });
  const emitAuth = () => listeners.forEach((cb) => cb(me()));
  const emitThread = (id) => (threadListeners.get(id) || []).forEach((cb) => cb());

  const api = {
    mode: 'demo',

    async getUser() {
      return me();
    },

    onAuthChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },

    async signIn(rawEmail, name = '') {
      const email = normalizeEmail(rawEmail);
      if (!isEduEmail(email)) throw new Error('Curb is for students: use your .edu email.');
      let user = Object.values(state.users).find((u) => u.email === email);
      if (!user) {
        user = { id: uid('u'), email, name: name.trim() || email.split('@')[0], campus: campusFromEmail(email) };
        state.users[user.id] = user;
      }
      state.session = user.id;
      save();
      emitAuth();
      return { user, needsEmailConfirmation: false };
    },

    async signOut() {
      state.session = null;
      save();
      emitAuth();
    },

    async listListings({ category = 'all', freeOnly = false, q = '' } = {}) {
      const t = now();
      const needle = q.trim().toLowerCase();
      return state.listings
        .filter((l) => isLive(l, t))
        .filter((l) => category === 'all' || l.category === category)
        .filter((l) => !freeOnly || l.price_cents === 0)
        .filter((l) => !needle || `${l.title} ${l.description}`.toLowerCase().includes(needle))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(withSeller);
    },

    async getListing(id) {
      const l = state.listings.find((x) => x.id === id);
      return l ? withSeller(l) : null;
    },

    async createListing({ title, description = '', category, price_cents = 0, pickup_spot, photo_url = null, photos = [], payment_link = '', venmo = '' }) {
      const user = requireUser();
      if (!title?.trim()) throw new Error('Give your listing a title.');
      const venmoHandle = parseVenmo(venmo);
      if (venmoHandle === null) throw new Error('That Venmo username doesn\'t look right: use 5 to 30 letters, numbers, - or _.');
      const link = parsePaymentLink(payment_link);
      if (link === null) throw new Error('Payment links must be Stripe links that start with buy.stripe.com/.');
      const created = new Date(now());
      const listing = {
        id: uid('l'),
        seller_id: user.id,
        title: title.trim().slice(0, 80),
        description: description.trim().slice(0, 600),
        category,
        price_cents,
        pickup_spot,
        photo_url,
        photos: photos.slice(0, 5),
        payment_link: link || null,
        venmo: venmoHandle || null,
        status: 'active',
        created_at: created.toISOString(),
        expires_at: expiresAt(created).toISOString(),
      };
      state.listings.unshift(listing);
      save();
      return withSeller(listing);
    },

    async myListings() {
      const user = requireUser();
      return state.listings.filter((l) => l.seller_id === user.id).map(withSeller);
    },

    async setStatus(id, status) {
      const user = requireUser();
      const l = state.listings.find((x) => x.id === id && x.seller_id === user.id);
      if (!l) throw new Error('Listing not found.');
      l.status = status;
      save();
      return withSeller(l);
    },

    async setPayment(id, { payment_link = '', venmo = '' } = {}) {
      const user = requireUser();
      const l = state.listings.find((x) => x.id === id && x.seller_id === user.id);
      if (!l) throw new Error('Listing not found.');
      const link = parsePaymentLink(payment_link);
      if (link === null) throw new Error('Payment links must be Stripe links that start with buy.stripe.com/.');
      const venmoHandle = parseVenmo(venmo);
      if (venmoHandle === null) throw new Error('That Venmo username doesn\'t look right: use 5 to 30 letters, numbers, - or _.');
      l.payment_link = link || null;
      l.venmo = venmoHandle || null;
      save();
      return withSeller(l);
    },

    async setPaymentLink(id, payment_link) {
      const l = state.listings.find((x) => x.id === id);
      return api.setPayment(id, { payment_link, venmo: l?.venmo ?? '' });
    },

    // Reviews of a seller, newest first, with the reviewer's first name.
    async listReviews(sellerId) {
      return state.reviews
        .filter((r) => r.seller_id === sellerId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((r) => ({ ...r, author_name: state.users[r.author_id]?.name ?? 'A buyer' }));
    },

    // Who may review this listing's seller: someone who messaged them about it.
    async canReview(listingId) {
      const user = me();
      if (!user) return { ok: false, reason: 'signin' };
      const l = state.listings.find((x) => x.id === listingId);
      if (!l || l.seller_id === user.id) return { ok: false, reason: 'own' };
      if (state.reviews.some((r) => r.listing_id === listingId && r.author_id === user.id)) return { ok: false, reason: 'done' };
      if (!state.threads.some((t) => t.listing_id === listingId && t.buyer_id === user.id)) return { ok: false, reason: 'message' };
      return { ok: true };
    },

    async addReview({ listing_id, rating, body = '' }) {
      const user = requireUser();
      const problem = validateReview({ rating, body });
      if (problem) throw new Error(problem);
      const check = await api.canReview(listing_id);
      if (!check.ok) {
        throw new Error(
          { own: "You can't review your own listing.", done: 'You already reviewed this one.', message: 'Message the seller about this item first, then you can review them.' }[check.reason] ??
            'Sign in first.',
        );
      }
      const l = state.listings.find((x) => x.id === listing_id);
      const review = {
        id: uid('r'),
        listing_id,
        listing_title: l.title,
        seller_id: l.seller_id,
        author_id: user.id,
        rating: Number(rating),
        body: String(body).trim().slice(0, REVIEW_MAX),
        created_at: new Date(now()).toISOString(),
      };
      state.reviews.push(review);
      save();
      return { ...review, author_name: user.name };
    },

    // Put an expired (not handed-off) listing back up for another 72 hours.
    async relist(id) {
      const user = requireUser();
      const l = state.listings.find((x) => x.id === id && x.seller_id === user.id);
      if (!l || l.status === 'handed_off') throw new Error('Only unclaimed listings can be relisted.');
      l.status = 'active';
      l.expires_at = new Date(now() + LISTING_TTL_HOURS * 3600 * 1000).toISOString();
      save();
      return withSeller(l);
    },

    async openThread(listingId) {
      const user = requireUser();
      const l = state.listings.find((x) => x.id === listingId);
      if (!l) throw new Error('Listing not found.');
      if (l.seller_id === user.id) throw new Error("That's your own listing.");
      let t = state.threads.find((x) => x.listing_id === listingId && x.buyer_id === user.id);
      if (!t) {
        t = { id: uid('t'), listing_id: listingId, buyer_id: user.id, seller_id: l.seller_id, created_at: new Date(now()).toISOString() };
        state.threads.push(t);
        save();
      }
      return t;
    },

    async listThreads() {
      const user = requireUser();
      return state.threads
        .filter((t) => t.buyer_id === user.id || t.seller_id === user.id)
        .map((t) => {
          const msgs = state.messages.filter((m) => m.thread_id === t.id);
          const otherId = t.buyer_id === user.id ? t.seller_id : t.buyer_id;
          return {
            ...t,
            listing: state.listings.find((l) => l.id === t.listing_id) ?? null,
            other: state.users[otherId] ?? null,
            last: msgs[msgs.length - 1] ?? null,
          };
        })
        .sort((a, b) => new Date(b.last?.created_at ?? b.created_at) - new Date(a.last?.created_at ?? a.created_at));
    },

    async getThread(id) {
      const user = requireUser();
      const t = state.threads.find((x) => x.id === id && (x.buyer_id === user.id || x.seller_id === user.id));
      if (!t) return null;
      return {
        thread: t,
        listing: state.listings.find((l) => l.id === t.listing_id) ?? null,
        other: state.users[t.buyer_id === user.id ? t.seller_id : t.buyer_id] ?? null,
        messages: state.messages.filter((m) => m.thread_id === id),
      };
    },

    async sendMessage(threadId, body) {
      const user = requireUser();
      const text = String(body ?? '').trim().slice(0, 1000);
      if (!text) return null;
      const t = state.threads.find((x) => x.id === threadId);
      if (!t || (t.buyer_id !== user.id && t.seller_id !== user.id)) throw new Error('Conversation not found.');
      const msg = { id: uid('m'), thread_id: threadId, sender_id: user.id, body: text, created_at: new Date(now()).toISOString() };
      state.messages.push(msg);
      save();
      emitThread(threadId);
      // Sample sellers answer the first message, so the demo feels like the real thing.
      const seller = state.users[t.seller_id];
      const isFirst = state.messages.filter((m) => m.thread_id === threadId).length === 1;
      if (seller?.demo && isFirst && autoReplyMs >= 0) {
        const listing = state.listings.find((l) => l.id === t.listing_id);
        setTimeout(() => {
          state.messages.push({
            id: uid('m'),
            thread_id: threadId,
            sender_id: seller.id,
            body: `Hi! Yes, it's still available. I can hand it off at ${listing?.pickup_spot ?? 'my building'} today after 5. Does that work?`,
            created_at: new Date(now()).toISOString(),
          });
          save();
          emitThread(threadId);
        }, autoReplyMs);
      }
      return msg;
    },

    subscribeThread(threadId, cb) {
      const list = threadListeners.get(threadId) || [];
      list.push(cb);
      threadListeners.set(threadId, list);
      return () => threadListeners.set(threadId, (threadListeners.get(threadId) || []).filter((f) => f !== cb));
    },

    async uploadPhoto(dataUrl) {
      return dataUrl; // demo keeps the compressed image inline
    },

    async resetDemo() {
      storage.removeItem(KEY);
      state = load();
      emitAuth();
    },
  };
  return api;
}
