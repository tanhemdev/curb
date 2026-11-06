<p align="center"><img src="public/icon.svg" width="88" alt="Curb logo: a couch and a box on a red-painted curb" /></p>

<h1 align="center">Curb</h1>

<p align="center"><b>Kick it to the curb. Someone nearby wants it.</b></p>

<p align="center"><img src="docs/screenshots/kick.gif" width="640" alt="Animation: a sneaker kicks a box onto a red curb, then a couch, lamp and mini fridge drop in and a FREE tag pops up" /></p>

A peer-to-peer marketplace for students moving out and moving in: list it, match it, hand it off a few blocks away. Every listing expires after 72 hours, because move-out moves fast.

**[Open Curb](https://tanhemdev.github.io/curb/)**: real listings with real photos, saved items, seller reviews, and checkout with Apple Pay or Link through Stripe.

[![CI](https://github.com/tanhemdev/curb/actions/workflows/ci.yml/badge.svg)](https://github.com/tanhemdev/curb/actions/workflows/ci.yml)
[![Deploy](https://github.com/tanhemdev/curb/actions/workflows/pages.yml/badge.svg)](https://github.com/tanhemdev/curb/actions/workflows/pages.yml)

| Home | Feed | Listing |
|---|---|---|
| <img src="docs/screenshots/home.png" alt="Curb home page with the kick-it-to-the-curb hero" /> | <img src="docs/screenshots/feed.png" alt="Pinterest-style feed of real listings: Trader Joe's bags, three cameras, a white sofa and a mahjong table" /> | <img src="docs/screenshots/listing.png" alt="Listing page for a mahjong table with a photo gallery and a Buy now button for Apple Pay, Link or card" /> |

## Why I built this

During Berkeley move-out, I watched couches, desks, mini-fridges and lamps pile up on the curb: perfectly good stuff, headed straight to the landfill. Two months later at Target, I watched the next class of freshmen buy the exact same stuff brand new.

It isn't a lack of caring. It's a logistics problem: there's no easy way to hand things off when everyone is moving at the same time. Nationally, 12.1 million tons of furniture and furnishings were thrown out in 2018, about 80% of it landfilled and roughly 0.3% recycled ([EPA](https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/durable-goods-product-specific-data)).

In an earlier move-out pilot at Berkeley, students listed **127 items**. This repository is the product rebuilt as a working app.

## How it works

1. **List it (about 30 seconds).** Snap a photo (it's shrunk in your browser before upload), pick a pickup spot, set a price or mark it free.
2. **Match.** Students browse a Pinterest-style feed filtered by category, price or search. Everything is within 2 miles of campus.
3. **Pay and hand off.** Tap "I want this" to chat with the seller. Pay with Apple Pay, Link or a card through the seller's Stripe Payment Link, or in person at pickup. The seller marks it handed off.
4. **Review.** Buyers who messaged a seller about an item can leave them a 1 to 5 star review, shown on every one of that seller's listings.

Listings disappear after 72 hours, and sellers can relist anything that didn't go.

## What's in the code

| Feature | Where |
|---|---|
| .edu-only sign-in (magic link) | `lib/edu.js`, `components/auth/SignIn.jsx`, enforced again in the database: `supabase/migrations/0002_policies.sql` and the auth hook in `0003_edu_signup_hook.sql` |
| 72-hour expiry and relisting | `lib/expiry.js`, the `expires_at` column, and an RLS policy that hides expired rows |
| Masonry feed with filters and search | `components/feed/` |
| Listing with in-browser photo compression | `components/listing/CreateListing.jsx`, `lib/imageCompression.js` |
| Campus geofence (2 miles of UC Berkeley) | `lib/geo.js`, `lib/campus.js` |
| Buyer-seller chat, live via Supabase Realtime | `components/chat/Messages.jsx`, `lib/data/supabase.js` |
| "Mark handed off" and My listings | `components/listing/ListingDetail.jsx`, `components/me/MyListings.jsx` |
| Payments: Stripe Payment Links (Apple Pay, Link, cards), only `buy.stripe.com` allowed | `lib/payments.js`, checked again in the database (`0004_reviews_and_payments.sql`) |
| Seller reviews, only from people who messaged the seller | `lib/reviews.js`, `components/listing/Reviews.jsx`, RLS in `0004_reviews_and_payments.sql` |
| Photo gallery (up to 5 photos), lightbox, save and share | `components/listing/Gallery.jsx`, `lib/saved.js` |
| Logo and "kick it to the curb" animation | `components/Logo.jsx`, `components/home/Hero.jsx` |
| Preview mode (the whole marketplace in localStorage) | `lib/data/demo.js`, `lib/data/seed.js` |

## Stack

| Layer | Tech | Why |
|---|---|---|
| App | Next.js 14 (App Router), React | Static export: the app is plain HTML and JS that can be hosted anywhere |
| Database | Supabase Postgres | Relational data (listings, threads, messages) with row-level security |
| Auth | Supabase Auth, email magic links | No passwords to forget during a stressful move; .edu enforced by a before-user-created hook |
| Storage | Supabase Storage | Listing photos, each user writes only to their own folder |
| Realtime | Supabase Realtime | New chat messages appear without refreshing |
| Hosting | GitHub Pages (demo), any static host (live) | |

```
browser (Next.js static app)
   │  lib/data/index.js picks a backend
   ├── demo:  lib/data/demo.js  ── localStorage (GitHub Pages demo)
   └── live:  lib/data/supabase.js ── Supabase: Postgres + RLS, Auth, Storage, Realtime
```

Security lives in the database. Row-level-security policies decide who can read and write each row, so a modified client still can't read someone else's messages or edit someone else's listing. Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Run it

```bash
npm install
npm run dev          # demo mode at http://localhost:3000
npm test             # unit tests
npm run build        # static export to out/
```

**Go live with Supabase:**

1. Create a Supabase project and run the four files in `supabase/migrations/` in order (SQL editor or `supabase db push`).
2. In Authentication → Hooks, turn on "Before User Created" with `public.hook_require_edu_email`. In Authentication → URL Configuration, add `https://tanhemdev.github.io/curb/` as a redirect URL.
3. In the GitHub repo, Settings → Secrets and variables → Actions, add `SUPABASE_URL` and `SUPABASE_ANON_KEY` (the anon key is meant to be public; RLS is what protects the data). The next deploy switches the site from preview mode to the shared database.
4. Locally: copy `.env.example` to `.env.local` with the same two values.

**Take payments:** each seller makes a free [Stripe Payment Link](https://dashboard.stripe.com/payment-links) for their item and pastes it when posting (or later, from My listings). Stripe's checkout shows Apple Pay, Link and card automatically and pays out to the seller's bank. Set the link's "After payment" redirect to the listing URL plus `&paid=1` so buyers land back on Curb.

## Tests

`npm test` runs 15 tests on the parts that carry the product's promises: the .edu check (including look-alikes like `edu.com`), Stripe-only payment links (including look-alikes like `buy.stripe.com.evil.io`), reviews (only after messaging, once per listing, never your own), the exact 72-hour expiry, the geofence, prices, photo sizing, and the demo marketplace (feed filters, sign-in gate, expiry and relisting, handoffs, one thread per buyer, and that nobody can read someone else's thread). CI runs the tests and a full production build on every push.

## Status

- v1.0 (October 2026): working app, live demo, tested logic, database schema with security policies.
- v1.1 (November 2026): real listings and photos, new logo and animated home page, photo galleries, saved items, seller reviews, Apple Pay and Link checkout through Stripe Payment Links.
- The shared Supabase backend is written and switches on when the two repo secrets are added; until then the site runs in preview mode.
- Next: push notifications when someone wants your item, and a second campus.

## Docs

[PRD](docs/PRD.md) · [User research](docs/USER_RESEARCH.md) · [Architecture](docs/ARCHITECTURE.md) · [Build log](docs/SPRINT_LOG.md) · [Metrics](docs/METRICS.md)

---

Built by [Tanya Hemdev](https://tanyahemdev.com), UC Berkeley.
