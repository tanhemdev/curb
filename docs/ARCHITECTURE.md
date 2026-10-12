# Curb: Architecture

```
browser: Next.js app, exported as static files
   │  components/  (feed, listing, chat, my listings, sign-in)
   │  lib/data/index.js picks a backend with the same API
   ├── demo:  lib/data/demo.js     → localStorage            (GitHub Pages demo, tests)
   └── live:  lib/data/supabase.js → Supabase
                                      ├─ Auth: .edu magic links (+ before-user-created hook)
                                      ├─ Postgres + row-level security
                                      ├─ Storage: listing photos
                                      └─ Realtime: new chat messages
```

## Why this shape

- **Static export.** `next build` produces plain HTML, CSS and JS (`output: 'export'`), so the app can be hosted anywhere, including GitHub Pages. Listing and chat pages use query parameters (`/listing?id=…`, `/messages?t=…`) instead of dynamic routes so they export as static files.
- **Security in the database, not the client.** The browser holds only the public anon key. Row-level-security policies decide who can read and write each row, so a modified client still can't read someone else's messages or edit someone else's listing.
- **One API, two backends.** The demo store and the Supabase store expose the same functions (`listListings`, `createListing`, `openThread`, `sendMessage`, …). Components never know which one is running, and the demo store doubles as a test harness for the product rules.

## Data model (`supabase/migrations/0001_schema.sql`)

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | id (= auth user), email, name, campus | Created by a trigger when someone first signs in |
| `listings` | seller_id, title, category, price_cents, pickup_spot, photo_url, status, expires_at | `expires_at` defaults to now + 72 hours; status is active, handed_off or removed |
| `threads` | listing_id, buyer_id, seller_id | Unique per (listing, buyer); buyer can't be the seller |
| `messages` | thread_id, sender_id, body | Streamed to participants with Realtime |

## Rules and where they're enforced

| Rule | App | Database |
|---|---|---|
| Students only | `lib/edu.js` checks the address before sending a link | `0003_edu_signup_hook.sql` rejects non-.edu sign-ups before the account exists |
| 72-hour listings | `lib/expiry.js` labels and filters | Default `expires_at`; the public read policy hides expired rows; inserts and updates can't push expiry past 72 hours |
| Only the buyer and seller see a chat | Inbox lists your own threads | `0002_policies.sql`: threads and messages are readable only by participants |
| You can only post or edit as yourself | Forms use the signed-in user | Insert and update policies check `auth.uid()` |
| Photos stay small | `lib/imageCompression.js` resizes to 1280px in the browser | Storage policy: each user writes only to their own folder |
| Near campus | Pickup spots inside 2 miles; optional location check (`lib/geo.js`) | n/a |

## Testing

- `tests/lib.test.mjs`: .edu validation (including look-alikes like `edu.com`), exact 72-hour expiry and labels, geofence distances, prices, photo sizing.
- `tests/demo-store.test.mjs`: the marketplace rules through the store API: feed filters, the sign-in gate, expiry and relisting, handoffs, one thread per buyer, and that nobody can read someone else's conversation.
- CI also runs a full `next build` on every push.
