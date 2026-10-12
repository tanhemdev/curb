export function formatPrice(cents) {
  if (!cents) return 'Free';
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

// "$25" or "25" or "" -> cents. Free is 0. Anything invalid returns null.
export function parsePrice(input) {
  const s = String(input ?? '').trim().replace(/^\$/, '');
  if (s === '') return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const cents = Math.round(Number(s) * 100);
  return cents <= 50000 ? cents : null; // $500 cap: this is move-out stuff
}

export function timeAgo(date, now = Date.now()) {
  const min = Math.floor((now - new Date(date).getTime()) / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function firstName(name) {
  return String(name ?? '').trim().split(/\s+/)[0] || 'Someone';
}
