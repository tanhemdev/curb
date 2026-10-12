// Demo backend: the whole marketplace in this browser's localStorage.
// Used when no Supabase project is configured (the GitHub Pages demo), and in
// tests. It implements the same API as lib/data/supabase.js.

import { isEduEmail, normalizeEmail, campusFromEmail } from '../edu.js';
import { expiresAt, isLive, LISTING_TTL_HOURS } from '../expiry.js';
import { seedListings, SEED_USERS } from './seed.js';

const KEY = 'curb.demo.v1';

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
    const state = { session: null, users: Object.fromEntries(SEED_USERS.map((u) => [u.id, u])), listings: seedListings(now()), threads: [], messages: [] };
    storage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  let state = load();
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

    async createListing({ title, description = '', category, price_cents = 0, pickup_spot, photo_url = null }) {
      const user = requireUser();
      if (!title?.trim()) throw new Error('Give your listing a title.');
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
