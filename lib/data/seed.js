// Sample listings for the demo. Every person here is fictional and marked
// demo: true; the demo banner tells visitors the listings are samples.

import { expiresAt } from '../expiry.js';

export const SEED_USERS = [
  { id: 'demo_maya', email: 'maya@berkeley.edu', name: 'Maya R.', campus: 'berkeley', demo: true },
  { id: 'demo_jon', email: 'jon@berkeley.edu', name: 'Jon P.', campus: 'berkeley', demo: true },
  { id: 'demo_aisha', email: 'aisha@berkeley.edu', name: 'Aisha K.', campus: 'berkeley', demo: true },
  { id: 'demo_leo', email: 'leo@berkeley.edu', name: 'Leo M.', campus: 'berkeley', demo: true },
];

// [title, category, price in dollars, hours since posting, seller, pickup, description]
const ITEMS = [
  ['White desk, 47 inch', 'furniture', 25, 3, 'demo_maya', 'Unit 2 (Haste & College)', 'Sturdy, a few scratches on one leg. Fits a laptop and a monitor.'],
  ['Mini fridge, 3.1 cu ft', 'appliances', 40, 7, 'demo_jon', 'Blackwell Hall', 'Works great, cleaned and defrosted. Freezer shelf included.'],
  ['Desk lamp with USB port', 'decor', 0, 1, 'demo_aisha', 'Unit 1 (Channing & Durant)', 'Free, just want it gone before Friday.'],
  ['Area rug, 5x7, grey', 'decor', 15, 20, 'demo_leo', 'Northside (Euclid & Hearst)', 'Vacuumed. Rolled up and ready to carry.'],
  ['Microwave, 700W', 'appliances', 20, 30, 'demo_maya', 'Unit 2 (Haste & College)', 'Turntable included. Small and dorm-friendly.'],
  ['Bookshelf, 5 shelves', 'furniture', 10, 44, 'demo_jon', 'Clark Kerr Campus', 'Easy to take apart if you need to move it.'],
  ['Chem 1A textbook', 'books', 15, 12, 'demo_aisha', 'MLK Student Union', 'Some highlighting in chapters 3 to 5.'],
  ['Road bike, 54 cm', 'bikes', 80, 5, 'demo_leo', 'Foothill', 'Rides well. Rear tube needs replacing (about $8).'],
  ['Full-length mirror', 'decor', 0, 58, 'demo_maya', 'Unit 3 (Durant & Dwight)', 'Free. Over-the-door hooks included.'],
  ['Rice cooker, 3 cup', 'kitchen', 0, 9, 'demo_jon', 'Blackwell Hall', 'Free, works perfectly.'],
  ['Storage bins, set of 4', 'other', 0, 2, 'demo_aisha', 'Unit 1 (Channing & Durant)', 'Clear plastic with lids. Great for under the bed.'],
  ['Box fan', 'appliances', 8, 66, 'demo_leo', 'Northside (Euclid & Hearst)', 'Three speeds. Your dorm in August will thank you.'],
  ['Office chair', 'furniture', 20, 16, 'demo_maya', 'Unit 2 (Haste & College)', 'Adjustable height, mesh back.'],
  ['24-inch monitor, 1080p', 'electronics', 45, 26, 'demo_jon', 'Clark Kerr Campus', 'HDMI cable included.'],
  ['Pots and pans set', 'kitchen', 0, 37, 'demo_aisha', 'Unit 3 (Durant & Dwight)', 'Free: 2 pots, 1 pan, lids. Moving across the country.'],
  ['Bean bag chair', 'furniture', 0, 4, 'demo_leo', 'Foothill', 'Free. Very comfy, slightly faded.'],
  ['Monstera plant', 'decor', 5, 21, 'demo_maya', 'Northside (Euclid & Hearst)', 'Healthy and growing. Pot included.'],
  ['Twin XL sheets, 2 sets', 'other', 0, 50, 'demo_jon', 'Blackwell Hall', 'Washed. Grey and navy.'],
];

export function seedListings(nowMs) {
  return ITEMS.map(([title, category, dollars, hoursAgo, seller, pickup, description], i) => {
    const created = new Date(nowMs - hoursAgo * 3600 * 1000);
    return {
      id: `seed_${i + 1}`,
      seller_id: seller,
      title,
      description,
      category,
      price_cents: dollars * 100,
      pickup_spot: pickup,
      photo_url: null,
      status: 'active',
      created_at: created.toISOString(),
      expires_at: expiresAt(created).toISOString(),
    };
  });
}
