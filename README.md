# Curb

> Free peer-to-peer marketplace for UC Berkeley students

<p align="center">
  <img src="https://img.shields.io/static/v1?style=for-the-badge&label=status&message=active&color=10b981" alt="Active" />
  <img src="https://img.shields.io/static/v1?style=for-the-badge&label=type&message=marketplace&color=6366f1" alt="Marketplace" />
  <img src="https://img.shields.io/static/v1?style=for-the-badge&label=stack&message=react%20%7C%20node%20%7C%20firebase&color=f59e0b" alt="React Node Firebase" />
</p>

---

<table>
  <tr>
    <td align="center"><b>.edu-only</b><br /><sub>authentication</sub></td>
    <td align="center"><b>72hr</b><br /><sub>auto-expiring listings</sub></td>
    <td align="center"><b>Pinterest-style</b><br /><sub>discovery feed</sub></td>
    <td align="center"><b>$0</b><br /><sub>platform fees</sub></td>
  </tr>
</table>

---

## Problem

Berkeley students buy and sell textbooks, furniture, electronics, and dorm supplies every semester — but existing platforms (Facebook Marketplace, Craigslist) have no identity verification, stale listings, and zero campus trust infrastructure. Students deal with no-shows, scams, and listings from non-students.

## Solution

Curb is a campus-only marketplace where every user is verified through their **.edu email**. Listings auto-expire after 72 hours to keep inventory fresh. The interface uses a Pinterest-style visual feed for discovery instead of the text-heavy list format of older platforms.

**What I built:**

- **Authentication layer** — .edu email verification ensures only current students can buy/sell
- **Auto-expiring listings** — 72-hour TTL keeps the marketplace current, no stale posts
- **Visual discovery feed** — Pinterest-style card layout with image-first browsing
- **Trust system** — verified student identities replace anonymous marketplace interactions
- **Zero fees** — no platform cut, built for students by students

## Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React, responsive design, image-first card UI |
| **Backend** | Node.js, RESTful API |
| **Database** | Firebase / Firestore |
| **Auth** | .edu email verification, session management |
| **Storage** | Cloud image storage with compression |

## Key Design Decisions

- **72-hour expiry** — analyzed listing lifecycle data from campus buy/sell groups; most sales happen within 48 hours or never. Auto-expiry eliminates the "is this still available?" problem
- **.edu gate** — campus-only trust is the core differentiator. No verification = no account
- **Image-first feed** — students browse visually. Text-heavy listings from Craigslist-era platforms have lower engagement

---

<sub>Built by <a href="https://github.com/tanhemdev">Tanya Hemdev</a> · UC Berkeley · Cognitive Science + Data Science</sub>
