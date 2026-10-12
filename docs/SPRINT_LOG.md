# Curb: Build Log

## The idea

During Berkeley move-out, couches, desks, mini-fridges and lamps piled up on the curb. Two months later at Target, the next class bought the same things new. Curb started there.

## First pilot

A move-out pilot at Berkeley where students listed **127 items**.

## August 2026: concept on GitHub

The README and planning docs went up, with a plan built on Firebase.

## October 2026: v1 as working code

This repository is the product built for real.

**Decisions**
- **Supabase instead of Firebase.** Listings, threads and messages are relational, and Postgres row-level security keeps the security rules next to the data.
- **Static export.** The whole app is static files, so the demo runs free on GitHub Pages and the live version can run on any static host.
- **Demo mode as a first-class backend.** Anyone can try the full flow (browse, sign in, chat, post, hand off) without an account, and the same store powers the tests.

**Built**
- .edu magic-link sign-in, checked in the app and by a database hook.
- 72-hour listings with relisting, enforced by the database.
- Masonry feed with search, category and free-only filters.
- 30-second listing flow with in-browser photo compression and campus pickup spots.
- Buyer-seller chat with live updates.
- My listings: status, mark handed off, relist, remove.

**Quality**
- 11 unit tests on the rules that carry the product's promises, a full production build in CI, and the demo deployed to GitHub Pages automatically.

## Next

1. Run the next Berkeley move-out on this app, opening listings a few days before leases end.
2. Push notifications when someone wants your item.
3. A second campus.
