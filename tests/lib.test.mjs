import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isEduEmail, campusFromEmail, normalizeEmail } from '../lib/edu.js';
import { expiresAt, isLive, timeLeftLabel, isEndingSoon, LISTING_TTL_HOURS } from '../lib/expiry.js';
import { milesBetween, withinCampus } from '../lib/geo.js';
import { CAMPUS, PICKUP_SPOTS } from '../lib/campus.js';
import { formatPrice, parsePrice } from '../lib/format.js';
import { fitWithin, MAX_SIDE } from '../lib/imageCompression.js';

test('.edu check accepts school emails and rejects look-alikes', () => {
  for (const ok of ['maya@berkeley.edu', ' Jon@EECS.Berkeley.EDU ', 'a.b+c@stanford.edu']) assert.ok(isEduEmail(ok), ok);
  for (const bad of ['maya@edu.com', 'x@berkeley.edu.evil.com', 'x@.edu', 'x@edu', 'berkeley.edu', 'x y@berkeley.edu', '', null]) assert.ok(!isEduEmail(bad), String(bad));
  assert.equal(normalizeEmail(' A@B.EDU '), 'a@b.edu');
  assert.equal(campusFromEmail('x@eecs.berkeley.edu'), 'berkeley');
  assert.equal(campusFromEmail('x@gmail.com'), null);
});

test('listings expire exactly 72 hours after posting', () => {
  const created = new Date('2026-05-10T12:00:00Z');
  assert.equal(LISTING_TTL_HOURS, 72);
  assert.equal(expiresAt(created).toISOString(), '2026-05-13T12:00:00.000Z');
  const l = { status: 'active', expires_at: expiresAt(created).toISOString() };
  assert.ok(isLive(l, Date.parse('2026-05-13T11:59:59Z')));
  assert.ok(!isLive(l, Date.parse('2026-05-13T12:00:00Z')));
  assert.ok(!isLive({ ...l, status: 'handed_off' }, Date.parse('2026-05-11T00:00:00Z')));
});

test('time-left labels read naturally', () => {
  const now = Date.parse('2026-05-10T12:00:00Z');
  const at = (h) => new Date(now + h * 3600e3).toISOString();
  assert.equal(timeLeftLabel(at(72), now), '3d 0h left');
  assert.equal(timeLeftLabel(at(71.5), now), '3d 0h left'); // rounds up, never "2d 24h"
  assert.equal(timeLeftLabel(at(70.9), now), '2d 23h left');
  assert.equal(timeLeftLabel(at(5.2), now), '6h left');
  assert.equal(timeLeftLabel(at(0.75), now), '45m left');
  assert.equal(timeLeftLabel(at(-1), now), 'Expired');
  assert.ok(isEndingSoon(at(5), now) && !isEndingSoon(at(7), now));
});

test('geofence: pickup spots are inside 2 miles, Oakland airport is not', () => {
  for (const s of PICKUP_SPOTS) assert.ok(withinCampus(s, CAMPUS), s.name);
  const oak = { lat: 37.7126, lng: -122.2197 };
  assert.ok(milesBetween(CAMPUS.center, oak) > 10);
  assert.ok(!withinCampus(oak, CAMPUS));
  assert.ok(Math.abs(milesBetween({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }) - 69.09) < 0.1);
});

test('prices: free, whole dollars, cents, and a $500 cap', () => {
  assert.equal(formatPrice(0), 'Free');
  assert.equal(formatPrice(2500), '$25');
  assert.equal(formatPrice(1250), '$12.50');
  assert.equal(parsePrice(''), 0);
  assert.equal(parsePrice('$20'), 2000);
  assert.equal(parsePrice('12.5'), 1250);
  assert.equal(parsePrice('-3'), null);
  assert.equal(parsePrice('abc'), null);
  assert.equal(parsePrice('501'), null);
});

test('photos shrink to fit 1280px without upscaling', () => {
  assert.equal(MAX_SIDE, 1280);
  assert.deepEqual(fitWithin(4032, 3024), { width: 1280, height: 960 });
  assert.deepEqual(fitWithin(3024, 4032), { width: 960, height: 1280 });
  assert.deepEqual(fitWithin(800, 600), { width: 800, height: 600 });
});
