// Every listing lives for 72 hours: move-out moves fast, and a feed full of
// stale listings is worse than a short one. The database hides expired rows
// too (see the listings policy in supabase/migrations/0002_policies.sql).

export const LISTING_TTL_HOURS = 72;
const HOUR = 3600 * 1000;

export function expiresAt(createdAt) {
  return new Date(new Date(createdAt).getTime() + LISTING_TTL_HOURS * HOUR);
}

export function isLive(listing, now = Date.now()) {
  return listing.status === 'active' && new Date(listing.expires_at).getTime() > now;
}

// "45m left", "5h left", "2d 23h left", or "Expired"
export function timeLeftLabel(expires, now = Date.now()) {
  const ms = new Date(expires).getTime() - now;
  if (ms <= 0) return 'Expired';
  if (ms < HOUR) return `${Math.max(1, Math.ceil(ms / 60000))}m left`;
  const h = Math.ceil(ms / HOUR - 1e-9);
  if (h < 24) return `${h}h left`;
  return `${Math.floor(h / 24)}d ${h % 24}h left`;
}

export function isEndingSoon(expires, now = Date.now()) {
  const ms = new Date(expires).getTime() - now;
  return ms > 0 && ms <= 6 * HOUR;
}
