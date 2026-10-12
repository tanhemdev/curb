// Live backend on Supabase (Postgres + Auth + Storage + Realtime).
// Same API as lib/data/demo.js. Security lives in the database: the
// row-level-security policies in supabase/migrations decide who can read and
// write what, so this client can't bypass them even if modified.

import { createClient } from '@supabase/supabase-js';
import { isEduEmail, normalizeEmail } from '../edu.js';
import { LISTING_TTL_HOURS } from '../expiry.js';

const LISTING_FIELDS = 'id, seller_id, title, description, category, price_cents, pickup_spot, photo_url, status, created_at, expires_at, seller:profiles(id, name, campus)';

export function createSupabaseStore({ url, anonKey, redirectTo }) {
  const sb = createClient(url, anonKey, { auth: { persistSession: true, detectSessionInUrl: true } });

  async function currentUser() {
    const { data } = await sb.auth.getUser();
    if (!data?.user) return null;
    const { data: profile } = await sb.from('profiles').select('id, email, name, campus').eq('id', data.user.id).maybeSingle();
    return profile ?? { id: data.user.id, email: data.user.email, name: data.user.email.split('@')[0] };
  }

  async function requireUser() {
    const u = await currentUser();
    if (!u) throw new Error('Sign in with your .edu email first.');
    return u;
  }

  const unwrap = ({ data, error }) => {
    if (error) throw new Error(error.message);
    return data;
  };

  return {
    mode: 'live',

    getUser: currentUser,

    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange(async () => cb(await currentUser()));
      return () => data.subscription.unsubscribe();
    },

    // Sends a one-time sign-in link. The profile row (with the name) is
    // created by a database trigger when the account is first confirmed.
    async signIn(rawEmail, name = '') {
      const email = normalizeEmail(rawEmail);
      if (!isEduEmail(email)) throw new Error('Curb is for students: use your .edu email.');
      unwrap(await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, data: { name: name.trim() } } }));
      return { user: null, needsEmailConfirmation: true };
    },

    async signOut() {
      await sb.auth.signOut();
    },

    async listListings({ category = 'all', freeOnly = false, q = '' } = {}) {
      let query = sb
        .from('listings')
        .select(LISTING_FIELDS)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(200);
      if (category !== 'all') query = query.eq('category', category);
      if (freeOnly) query = query.eq('price_cents', 0);
      if (q.trim()) query = query.ilike('title', `%${q.trim().replace(/[%_]/g, '')}%`);
      return unwrap(await query);
    },

    async getListing(id) {
      return unwrap(await sb.from('listings').select(LISTING_FIELDS).eq('id', id).maybeSingle());
    },

    async createListing({ title, description = '', category, price_cents = 0, pickup_spot, photo_url = null }) {
      const user = await requireUser();
      return unwrap(
        await sb
          .from('listings')
          .insert({ seller_id: user.id, title: title.trim(), description: description.trim(), category, price_cents, pickup_spot, photo_url })
          .select(LISTING_FIELDS)
          .single(),
      );
    },

    async myListings() {
      const user = await requireUser();
      return unwrap(await sb.from('listings').select(LISTING_FIELDS).eq('seller_id', user.id).order('created_at', { ascending: false }));
    },

    async setStatus(id, status) {
      return unwrap(await sb.from('listings').update({ status }).eq('id', id).select(LISTING_FIELDS).single());
    },

    async relist(id) {
      const expires_at = new Date(Date.now() + LISTING_TTL_HOURS * 3600 * 1000).toISOString();
      return unwrap(await sb.from('listings').update({ status: 'active', expires_at }).eq('id', id).neq('status', 'handed_off').select(LISTING_FIELDS).single());
    },

    async openThread(listingId) {
      const user = await requireUser();
      const listing = unwrap(await sb.from('listings').select('id, seller_id').eq('id', listingId).single());
      if (listing.seller_id === user.id) throw new Error("That's your own listing.");
      const existing = unwrap(await sb.from('threads').select('*').eq('listing_id', listingId).eq('buyer_id', user.id).maybeSingle());
      if (existing) return existing;
      return unwrap(await sb.from('threads').insert({ listing_id: listingId, buyer_id: user.id, seller_id: listing.seller_id }).select('*').single());
    },

    async listThreads() {
      const user = await requireUser();
      const threads = unwrap(
        await sb
          .from('threads')
          .select('*, listing:listings(id, title, price_cents, category, photo_url, status), buyer:profiles!threads_buyer_id_fkey(id, name), seller:profiles!threads_seller_id_fkey(id, name), messages(id, body, sender_id, created_at)')
          .order('created_at', { ascending: false }),
      );
      return threads.map((t) => {
        const msgs = [...(t.messages ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return { ...t, other: t.buyer_id === user.id ? t.seller : t.buyer, last: msgs[msgs.length - 1] ?? null };
      });
    },

    async getThread(id) {
      const user = await requireUser();
      const t = unwrap(
        await sb
          .from('threads')
          .select('*, listing:listings(*), buyer:profiles!threads_buyer_id_fkey(id, name), seller:profiles!threads_seller_id_fkey(id, name)')
          .eq('id', id)
          .maybeSingle(),
      );
      if (!t) return null;
      const messages = unwrap(await sb.from('messages').select('*').eq('thread_id', id).order('created_at'));
      return { thread: t, listing: t.listing, other: t.buyer_id === user.id ? t.seller : t.buyer, messages };
    },

    async sendMessage(threadId, body) {
      const user = await requireUser();
      const text = String(body ?? '').trim().slice(0, 1000);
      if (!text) return null;
      return unwrap(await sb.from('messages').insert({ thread_id: threadId, sender_id: user.id, body: text }).select('*').single());
    },

    subscribeThread(threadId, cb) {
      const channel = sb
        .channel(`thread:${threadId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` }, () => cb())
        .subscribe();
      return () => sb.removeChannel(channel);
    },

    // Photos are compressed in the browser first (lib/imageCompression.js).
    async uploadPhoto(dataUrl) {
      const user = await requireUser();
      const blob = await (await fetch(dataUrl)).blob();
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      unwrap(await sb.storage.from('listing-photos').upload(path, blob, { contentType: 'image/jpeg', upsert: false }));
      return sb.storage.from('listing-photos').getPublicUrl(path).data.publicUrl;
    },
  };
}
