# Curb  -  Product Requirements Document

**Author:** Tanya Hemdev
**Last updated:** April 2024
**Status:** Pilot complete

---

## problem statement

every May, college students throw out perfectly good furniture during move-out. every August, incoming students buy the same stuff brand new. US colleges generate 230+ tons of move-out waste annually. 12.1 million tons of furniture hit the waste stream each year with only 0.3% recycled.

there's no easy way to hand stuff off when everyone's moving at the same time. existing solutions (Facebook Marketplace, Craigslist) aren't built for the 48-hour move-out window where this stuff actually changes hands.

---

## target users

### primary
- **outgoing students** (juniors/seniors moving out)  -  want to get rid of stuff fast, don't want to deal with shipping or complex listings
- **incoming students** (freshmen/transfers moving in)  -  want affordable furniture, prefer local pickup

### secondary
- **campus sustainability offices**  -  want to reduce move-out waste metrics
- **student housing coordinators**  -  want cleaner move-out process

---

## user personas

### Sarah, 21  -  "The Graduating Senior"
Moving to SF for her first job. Has a desk, mini-fridge, and futon she can't take. Doesn't want to deal with Craigslist weirdos. Would rather give it away than carry it to the dumpster.

**needs:** list it in 30 seconds, hand it off in person, done.

### Marcus, 18  -  "The Incoming Freshman"
Moving from LA to Berkeley. Parents don't want to buy a bunch of furniture that'll get trashed in 4 years. Would love a desk for $20 instead of $89 at Target.

**needs:** browse what's available near campus, message seller, pick it up.

---

## success metrics

| metric | target | actual (pilot) |
|--------|--------|----------------|
| items listed | 500+ | **1,247** |
| items diverted from landfill | 400+ | **800+** |
| listing conversion rate | 50% | **73%** |
| average time-to-match | <10 min | **4.2 min** |
| waste prevented (lbs) | 1,500+ | **~2,400** |

---

## feature requirements

### P0  -  must ship

| feature | description | status |
|---------|-------------|--------|
| 30-second listing | photo + pin + price, auto-expires in 72h | shipped |
| campus geo-fence | 2-mile radius around campus, .edu email required | shipped |
| Pinterest-style feed | masonry layout filtered by category | shipped |
| in-app chat | coordinate pickup without sharing phone numbers | shipped |
| .edu auth | email link auth with .edu domain validation | shipped |

### P1  -  next

| feature | description | status |
|---------|-------------|--------|
| multi-campus | expand beyond Berkeley | spec'd |
| price suggestions | ML-based pricing from photo | researching |
| pickup scheduling | calendar integration for handoff coordination | spec'd |

---

## market sizing

- **20 million** college students in the US
- **$86.6 billion** back-to-college spending (2023)
- **$12.2 billion** on dorm furnishings alone
- average student generates **640 lbs** of waste per year
- **9.8 million tons** of furniture hits US landfills annually

---

## out of scope

- shipping/delivery (hyperlocal only  -  walkable/bikeable)
- payment processing (cash/Venmo between users)
- commercial sellers (students only, .edu enforced)
- non-furniture items (keeping scope tight for pilot)
