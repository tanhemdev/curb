# 🪑 Curb

**Perfectly good furniture shouldn't die at the dumpster.**

---

During Berkeley move-out last May, I watched couches, desks, mini-fridges, and lamps pile up on the curb  -  perfectly good stuff, headed straight to the landfill. Two months later at Target, I watched the exact same class of freshmen buy the exact same stuff brand new.

And I couldn't help but wonder: **if this happens at Berkeley, what does this look like across all 4,000 colleges in the US?**

So I looked it up. US colleges generate **230+ tons of move-out waste every May**. Nationally, 12.1 million tons of furniture hit the waste stream each year  -  and only **0.3%** gets recycled. That's the lowest recycling rate of any durable goods category. At some campuses, 600 mattresses get thrown out in a single move-out week. Ohio State alone produces 18,500 tons of campus waste per year. Back-to-college spending hit **$86.6 billion** last year, with **$12.2 billion on dorm furnishings** alone  -  most of which existed perfectly fine on someone else's curb three months earlier.

It's not a lack of caring. It's a logistics problem. There's no easy way to hand stuff off when everyone's moving at the same time.

Curb is a hyperlocal peer-to-peer marketplace that connects outgoing college students with incoming ones. List it, match it, hand it off  -  all within the 48-hour move-out window where this stuff actually changes hands.

---

## The Cycle

Every year, the same thing happens:

```
May:   Senior moves out -> perfectly good desk hits the curb -> landfill
August: Freshman moves in -> buys the same desk at Target -> $89 gone
```

The numbers are wild:
- The average college student generates **640 lbs of trash per year**
- Back-to-college spending hit **$86.6B** last year, with **$12.2B on dorm furnishings** alone
- Only **0.3%** of discarded furniture actually gets recycled

It's not a lack of caring  -  it's a logistics problem. There's no easy way to hand stuff off when everyone's moving at the same time.

---

## How It Works

### 1. List It (30 seconds)
Snap a photo, drop a pin, set your price (or free). That's it. No long descriptions, no shipping logistics. Your listing auto-expires in **72 hours** because this stuff moves fast or it doesn't move at all.

### 2. Match
Incoming students browse a Pinterest-style feed filtered to their campus. Geo-fenced to a 2-mile radius around campus so everything is walkable/bikeable.

### 3. Hand Off
In-app chat to coordinate pickup. Show up, grab your desk, done. No shipping, no middlemen, no platform fees.

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | React + Tailwind CSS | Fast iteration, mobile-first utility classes |
| Backend | Node.js + Express | Lightweight API layer |
| Database | Cloud Firestore | Real-time sync, offline support, scales without ops |
| Auth | Firebase Auth (.edu) | Email link auth with .edu domain validation |
| Storage | Firebase Storage | Image uploads with automatic compression |
| Hosting | Firebase Hosting | PWA with service worker, instant deploys |
| Maps | Google Maps API | Geo-fencing, pin drops, campus boundaries |

Mobile-first PWA  -  no app store friction, works on any phone browser.

---

## Project Structure

```
curb/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── service-worker.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── EduEmailGate.jsx
│   │   │   │   └── OnboardingFlow.jsx
│   │   │   ├── feed/
│   │   │   │   ├── ListingCard.jsx
│   │   │   │   ├── MasonryFeed.jsx
│   │   │   │   └── CategoryFilter.jsx
│   │   │   ├── listing/
│   │   │   │   ├── CreateListing.jsx
│   │   │   │   ├── PhotoUpload.jsx
│   │   │   │   ├── PinDrop.jsx
│   │   │   │   └── ExpiryBadge.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatThread.jsx
│   │   │   │   └── HandoffConfirm.jsx
│   │   │   └── common/
│   │   │       ├── Navbar.jsx
│   │   │       ├── CampusMap.jsx
│   │   │       └── LoadingSkeleton.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useListings.js
│   │   │   ├── useGeofence.js
│   │   │   └── useChat.js
│   │   ├── utils/
│   │   │   ├── imageCompression.js
│   │   │   ├── geofence.js
│   │   │   └── expiry.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── functions/
│   │   ├── auth/
│   │   │   └── validateEdu.js
│   │   ├── listings/
│   │   │   ├── autoExpire.js
│   │   │   └── matchNotify.js
│   │   ├── images/
│   │   │   └── optimize.js
│   │   └── index.js
│   └── package.json
├── firestore.rules
├── firebase.json
├── docs/
│   ├── PRD.md
│   ├── USER_RESEARCH.md
│   ├── ARCHITECTURE.md
│   ├── SPRINT_LOG.md
│   └── METRICS.md
└── README.md
```

---

## Quick Start

```bash
# Clone
git clone https://github.com/tanhemdev/curb.git
cd curb

# Install dependencies
cd client && npm install
cd ../server && npm install

# Set up Firebase
cp .env.example .env
# Add your Firebase config keys

# Run locally
npm run dev
```

Requires Node 18+, a Firebase project, and a Google Maps API key.

---

## Pilot Results

First pilot at UC Berkeley, May 2024:

- **800+ items** diverted from landfills
- **~2,400 lbs** of waste prevented
- **4.2 min** average time-to-match
- **73%** listing conversion rate

Full breakdown -> [METRICS.md](docs/METRICS.md)

---

## Docs

| Doc | What's in it |
|-----|-------------|
| [PRD.md](docs/PRD.md) | Product requirements, personas, market sizing |
| [USER_RESEARCH.md](docs/USER_RESEARCH.md) | Interviews, survey data, key insights |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, Firebase schema, geo-fencing |
| [SPRINT_LOG.md](docs/SPRINT_LOG.md) | 4-week build log from idea to pilot |
| [METRICS.md](docs/METRICS.md) | Pilot results and impact numbers |

---

## Why This Matters

800 items is a start. There are **20 million college students** in the US, and this cycle repeats at every single campus, every single year. If we can make the handoff as easy as the throwaway, we can put a real dent in the 9.8 million tons of furniture that hits landfills annually.

---

Built by [Tanya Hemdev](https://github.com/tanhemdev) · UC Berkeley · 2024
