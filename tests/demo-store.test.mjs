// The demo marketplace runs the same API as the live Supabase backend, so
// these tests cover the product rules end to end without a server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemoStore } from '../lib/data/demo.js';

function memory() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

function makeStore(start = Date.parse('2026-05-10T12:00:00Z')) {
  const clock = { t: start };
  const store = createDemoStore({ storage: memory(), now: () => clock.t, autoReplyMs: -1 });
  return { store, clock };
}

test('feed shows the real listings with photos, filtered by category, free and search', async () => {
  const { store } = makeStore();
  const all = await store.listListings();
  assert.equal(all.length, 4);
  assert.ok(all.every((l) => l.photo_url?.startsWith('/listings/')), 'every seed listing has a real photo');
  assert.ok((await store.listListings({ category: 'furniture' })).every((l) => l.category === 'furniture'));
  assert.ok((await store.listListings({ freeOnly: true })).every((l) => l.price_cents === 0));
  assert.deepEqual((await store.listListings({ q: 'mahjong' })).map((l) => l.price_cents), [80000]);
  const [sofa] = await store.listListings({ q: 'sofa' });
  assert.equal(sofa.photos.length, 1, 'sofa has a second photo');
});

test('posting and messaging require a .edu sign-in', async () => {
  const { store } = makeStore();
  await assert.rejects(store.createListing({ title: 'Lamp', category: 'decor', pickup_spot: 'Foothill' }), /Sign in/);
  await assert.rejects(store.signIn('me@gmail.com', 'Me'), /\.edu/);
  const { user } = await store.signIn('Tanya@Berkeley.edu', 'Tanya');
  assert.equal(user.email, 'tanya@berkeley.edu');
  assert.equal(user.campus, 'berkeley');
});

test('listings expire after 72 hours and can be relisted, unless handed off', async () => {
  const { store, clock } = makeStore();
  await store.signIn('tanya@berkeley.edu', 'Tanya');
  const lamp = await store.createListing({ title: 'Lamp', category: 'decor', pickup_spot: 'Foothill', price_cents: 500 });
  assert.ok((await store.listListings()).some((l) => l.id === lamp.id));
  clock.t += 72 * 3600e3;
  assert.ok(!(await store.listListings()).some((l) => l.id === lamp.id), 'expired listing left the feed');
  await store.relist(lamp.id);
  assert.ok((await store.listListings()).some((l) => l.id === lamp.id), 'relisted');
  await store.setStatus(lamp.id, 'handed_off');
  await assert.rejects(store.relist(lamp.id), /Only unclaimed/);
  assert.ok(!(await store.listListings()).some((l) => l.id === lamp.id), 'handed-off items leave the feed');
});

test('one conversation per buyer per listing, and none with yourself', async () => {
  const { store } = makeStore();
  await store.signIn('tanya@berkeley.edu', 'Tanya');
  const [desk] = await store.listListings({ q: 'cameras' });
  const t1 = await store.openThread(desk.id);
  const t2 = await store.openThread(desk.id);
  assert.equal(t1.id, t2.id);
  await store.sendMessage(t1.id, 'Is it still available?');
  const threads = await store.listThreads();
  assert.equal(threads.length, 1);
  assert.equal(threads[0].last.body, 'Is it still available?');
  const mine = await store.createListing({ title: 'Chair', category: 'furniture', pickup_spot: 'Foothill' });
  await assert.rejects(store.openThread(mine.id), /your own listing/);
});

test("nobody can read or post in someone else's conversation", async () => {
  const { store } = makeStore();
  await store.signIn('tanya@berkeley.edu', 'Tanya');
  const [desk] = await store.listListings({ q: 'cameras' });
  const t = await store.openThread(desk.id);
  await store.sendMessage(t.id, 'Hi!');
  await store.signOut();
  await store.signIn('someone@berkeley.edu', 'Someone');
  assert.equal(await store.getThread(t.id), null);
  assert.deepEqual(await store.listThreads(), []);
  await assert.rejects(store.sendMessage(t.id, 'sneaky'), /not found/);
});

test('payment links: only buy.stripe.com, set when posting or later', async () => {
  const { store } = makeStore();
  await store.signIn('tanya@berkeley.edu', 'Tanya');
  await assert.rejects(
    store.createListing({ title: 'Desk', category: 'furniture', pickup_spot: 'Foothill', price_cents: 2000, payment_link: 'https://stripe-pay.example.com/x' }),
    /buy\.stripe\.com/,
  );
  const desk = await store.createListing({ title: 'Desk', category: 'furniture', pickup_spot: 'Foothill', price_cents: 2000, payment_link: 'buy.stripe.com/test_abc123' });
  assert.equal(desk.payment_link, 'https://buy.stripe.com/test_abc123');
  assert.equal((await store.setPaymentLink(desk.id, '')).payment_link, null);
});

test('reviews: only after messaging the seller, once per listing, never your own', async () => {
  const { store } = makeStore();
  await store.signIn('friend@berkeley.edu', 'Priya S');
  const [cams] = await store.listListings({ q: 'cameras' });
  assert.deepEqual(await store.canReview(cams.id), { ok: false, reason: 'message' });
  await assert.rejects(store.addReview({ listing_id: cams.id, rating: 5, body: 'Great' }), /Message the seller/);
  await store.openThread(cams.id);
  await assert.rejects(store.addReview({ listing_id: cams.id, rating: 9 }), /1 to 5/);
  const r = await store.addReview({ listing_id: cams.id, rating: 5, body: 'Smooth handoff, cameras work great.' });
  assert.equal(r.author_name, 'Priya S');
  await assert.rejects(store.addReview({ listing_id: cams.id, rating: 4 }), /already reviewed/);
  const list = await store.listReviews(cams.seller_id);
  assert.equal(list.length, 1);
  assert.equal(list[0].listing_title, cams.title);
  const mine = await store.createListing({ title: 'Chair', category: 'furniture', pickup_spot: 'Foothill' });
  assert.equal((await store.canReview(mine.id)).reason, 'own');
});

test('showcase listings come back on a fresh clock for returning visitors', async () => {
  const m = memory();
  let t = Date.parse('2026-05-10T12:00:00Z');
  createDemoStore({ storage: m, now: () => t, autoReplyMs: -1 });
  t += 30 * 24 * 3600e3; // a month later
  const again = createDemoStore({ storage: m, now: () => t, autoReplyMs: -1 });
  assert.equal((await again.listListings()).length, 4);
});
