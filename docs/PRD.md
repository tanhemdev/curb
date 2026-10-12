# Curb: Product Requirements

**Author:** Tanya Hemdev
**Status:** v1 (October 2026): working app with a live demo; the live backend is written and needs a Supabase project to run.

## Problem

Every move-out, students put perfectly good furniture on the curb. A few months later, the next class buys the same things new. Nationally, 12.1 million tons of furniture and furnishings were thrown out in 2018, about 80% of it landfilled and roughly 0.3% recycled ([EPA](https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/durable-goods-product-specific-data)).

It isn't a lack of caring. It's logistics: everyone is moving at the same time, general marketplaces aren't built for a few frantic days, and nobody wants to coordinate with strangers mid-move.

## Users

| | Who | Needs |
|---|---|---|
| Primary | Students moving out | Get rid of things in seconds, hand off nearby, no strangers |
| Primary | Students moving in | Cheap or free basics close to campus, from people they can trust |
| Secondary | Campus sustainability and housing staff | Less move-out waste without running it themselves |

### Personas

- **The graduating senior.** Moving to a first job, with a desk, a mini-fridge and a futon that won't fit. Would rather give them away than haul them to a dumpster. Needs: list in 30 seconds, hand off in person, done.
- **The incoming freshman.** Arriving from out of town with no local network. Needs: browse what's near campus, message the seller, pick it up.

## v1 scope

| Priority | Requirement | Status |
|---|---|---|
| P0 | Students only: sign in with a .edu email (magic link, no password) | Built, enforced in the app and by a database hook |
| P0 | List in about 30 seconds: photo, title, price or free, pickup spot | Built; photos shrink in the browser before upload |
| P0 | Listings expire after 72 hours; relist anything that didn't go | Built, enforced by the database too |
| P0 | Browse a feed with category, free-only and search filters | Built (Pinterest-style masonry) |
| P0 | Everything within 2 miles of campus | Built: campus pickup spots, plus an optional location check |
| P0 | Chat with the seller, one conversation per buyer per listing | Built, live updates via Supabase Realtime |
| P0 | Mark handed off; My listings with status | Built |
| P1 | A demo anyone can try without an account | Built (demo mode in the browser) |
| P1 | Installable on a phone home screen | Manifest and icon (PWA basics) |
| P2 | Push notification when someone wants your item | Next |
| P2 | A second campus | Next (campus config is one file) |

### Non-goals

Payments in the app, shipping, and anything off campus.

## Success metrics

The first move-out pilot at Berkeley had **127 items listed**. That is the only measured number so far. For the next move-out on this app (targets, not results):

| Metric | Why | Target |
|---|---|---|
| Items listed | Supply | More than the 127 in the first pilot |
| Share of listings handed off | The real outcome: things that didn't go to the curb | 50%+ |
| Median time from listing to first message | Is demand there in time? | Under 1 hour |
| Listings relisted after expiring | Is 72 hours the right window? | Watch |
| Reports of no-shows | Trust between students | Under 1 in 10 handoffs |

## Risks

| Risk | Mitigation |
|---|---|
| No-shows at pickup | Chat stays attached to the listing; next: reminders before the handoff |
| Supply arrives after demand peaks | Open listings a few days before leases end |
| Non-students | .edu only, checked in the app and again in the database |
| Someone reads another person's messages | Row-level security: only the buyer and seller can read a thread |
| Stale listings | 72-hour expiry, hidden by the database once expired |
