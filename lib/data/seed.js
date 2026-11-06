// Listings for the demo feed. These are real items Tanya is moving out, with
// her own photos (public/listings/). Nothing here is a made-up person, and
// there are no seeded reviews: every review on Curb is written by a real
// buyer.

import { expiresAt } from '../expiry.js';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const photo = (name) => `${BASE}/listings/${name}`;

export const SEED_USERS = [{ id: 'seller_tanya', email: 'tanyahemdev@berkeley.edu', name: 'Tanya H.', campus: 'berkeley' }];

const ITEMS = [
  {
    title: '3 cameras: Canon, Panasonic and JVC',
    category: 'electronics',
    dollars: 95,
    hoursAgo: 5,
    pickup: 'Northside (Euclid & Hearst)',
    photos: ['cameras.jpg'],
    description:
      'All three for $95: Canon PowerShot A400, Panasonic Lumix with 16x zoom (25mm wide) and a JVC Everio 20GB HDD camcorder with lens cap. Great for that early-2000s digicam look.',
  },
  {
    title: 'Cloud-style deep-seated sofa, white linen',
    category: 'furniture',
    dollars: 0,
    hoursAgo: 14,
    pickup: 'Albany',
    photos: ['sofa-1.jpg', 'sofa-2.jpg'],
    description:
      'FREE (was listed at $400). Living Spaces cloud-style deep-seated sofa in white linen with four big pillows. Super comfy, some light marks on the fabric. You pick up: it needs two people and a van or SUV.',
  },
  {
    title: 'New automatic mahjong table',
    category: 'furniture',
    dollars: 800,
    hoursAgo: 26,
    pickup: 'Central Berkeley',
    photos: ['mahjong-1.jpg', 'mahjong-2.jpg'],
    description:
      'Brand-new fully automatic mahjong table: shuffles and deals for you. White top with a folding base, still in the original boxes (second photo).',
  },
  {
    title: "Rare Trader Joe's bags",
    category: 'other',
    dollars: 0,
    hoursAgo: 2,
    pickup: 'Southside',
    photos: ['tj-bags.jpg'],
    description: "Free: two collectible Trader Joe's reusable bags, the yellow whole-kernel-corn can and the orange I-heart-TJ's city print.",
  },
];

export function seedListings(nowMs) {
  return ITEMS.map((item, i) => {
    const created = new Date(nowMs - item.hoursAgo * 3600 * 1000);
    const [first, ...rest] = item.photos.map(photo);
    return {
      id: `seed_${i + 1}`,
      seller_id: 'seller_tanya',
      title: item.title,
      description: item.description,
      category: item.category,
      price_cents: item.dollars * 100,
      pickup_spot: item.pickup,
      photo_url: first,
      photos: rest,
      payment_link: null,
      status: 'active',
      created_at: created.toISOString(),
      expires_at: expiresAt(created).toISOString(),
    };
  });
}
