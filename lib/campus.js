// The one campus Curb runs on today. Adding a campus means adding an entry
// here and its pickup spots; nothing else in the app is Berkeley-specific.

export const CAMPUS = {
  id: 'berkeley',
  name: 'UC Berkeley',
  center: { lat: 37.8719, lng: -122.2585 },
  radiusMiles: 2,
};

// Public, well-lit places students already know.
export const PICKUP_SPOTS = [
  { name: 'Unit 1 (Channing & Durant)', lat: 37.8676, lng: -122.2551 },
  { name: 'Unit 2 (Haste & College)', lat: 37.8661, lng: -122.2537 },
  { name: 'Unit 3 (Durant & Dwight)', lat: 37.8673, lng: -122.2602 },
  { name: 'Blackwell Hall', lat: 37.8665, lng: -122.2604 },
  { name: 'Clark Kerr Campus', lat: 37.8636, lng: -122.2496 },
  { name: 'Foothill', lat: 37.8755, lng: -122.2559 },
  { name: 'Northside (Euclid & Hearst)', lat: 37.8754, lng: -122.2601 },
  { name: 'MLK Student Union', lat: 37.8690, lng: -122.2596 },
];

export const CATEGORIES = [
  { id: 'furniture', label: 'Furniture' },
  { id: 'appliances', label: 'Appliances' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'decor', label: 'Decor' },
  { id: 'books', label: 'Books' },
  { id: 'bikes', label: 'Bikes' },
  { id: 'other', label: 'Other' },
];

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? 'Other';
