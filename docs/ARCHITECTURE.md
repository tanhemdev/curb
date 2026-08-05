# Curb  -  System Architecture

---

## overview

Curb is a mobile-first PWA built on Firebase. No native app  -  works in any phone browser, no app store friction.

## tech stack

| layer | tech | why |
|-------|------|-----|
| frontend | React + Tailwind CSS | fast iteration, mobile-first utility classes |
| backend | Node.js + Express (Firebase Functions) | lightweight, serverless |
| database | Cloud Firestore | real-time sync, offline support, scales without ops |
| auth | Firebase Auth | .edu email link auth |
| storage | Firebase Storage | image uploads with auto compression |
| hosting | Firebase Hosting | PWA with service worker |
| maps | Google Maps API | geo-fencing, pin drops, campus boundaries |

## core flows

### listing creation

1. user taps "List Item"
2. camera opens -> snap photo -> auto-compress to <500KB
3. drop pin on map (defaults to current location)
4. set price (or free) + select category
5. listing goes live with 72h auto-expiry
6. stored in Firestore with geo-hash for spatial queries

### discovery + matching

1. buyer opens feed  -  filtered to 2-mile radius via geo-hash query
2. masonry layout (Pinterest-style) sorted by recency
3. category filters: furniture, electronics, kitchen, misc
4. tap listing -> see photo, price, distance, seller rating
5. tap "I want this" -> opens chat thread

### geo-fencing

we use geo-hashes (6-character precision = ~1.2km cells) stored on each listing document. feed queries filter by adjacent geo-hash cells within the 2-mile campus radius. this keeps Firestore reads efficient  -  no full-collection scans.

campus boundary defined as a GeoJSON polygon. listings outside the boundary are rejected at creation time.

## Firestore schema

```
listings/
  {listingId}/
    title: string
    photo_url: string
    price: number
    category: string
    location: GeoPoint
    geo_hash: string
    seller_id: string
    created_at: timestamp
    expires_at: timestamp
    status: 'active' | 'claimed' | 'expired'

users/
  {userId}/
    email: string
    display_name: string
    campus: string
    rating: number
    listings_count: number

chats/
  {chatId}/
    listing_id: string
    buyer_id: string
    seller_id: string
    messages/
      {messageId}/
        sender_id: string
        text: string
        sent_at: timestamp
```

## PWA features

- service worker for offline browsing of previously loaded listings
- add-to-homescreen prompt after 2nd visit
- push notifications for new messages and listing matches
- lighthouse score: 94 performance, 100 PWA
