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

test('feed shows live sample listings, filtered by category, free and search', async () => {
  const { store } = makeStore();
  const all = await store.listListings();
  assert.equal(all.length, 18);
  assert.ok(all.every((l) => l.seller?.demo));
  assert.ok((await store.listListings({ category: 'appliances' })).every((l) => l.category === 'appliances'));
  assert.ok((await store.listListings({ freeOnly: true })).every((l) => l.price_cents === 0));
  assert.deepEqual((await store.listListings({ q: 'bike' })).map((l) => l.title), ['Road bike, 54 cm']);
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
  const [desk] = await store.listListings({ q: 'desk' });
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
  const [desk] = await store.listListings({ q: 'desk' });
  const t = await store.openThread(desk.id);
  await store.sendMessage(t.id, 'Hi!');
  await store.signOut();
  await store.signIn('someone@berkeley.edu', 'Someone');
  assert.equal(await store.getThread(t.id), null);
  assert.deepEqual(await store.listThreads(), []);
  await assert.rejects(store.sendMessage(t.id, 'sneaky'), /not found/);
});
