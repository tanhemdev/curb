// Curb is for students, so sign-in requires a school email. The database
// enforces the same rule (supabase/migrations/0003_edu_signup_hook.sql);
// this check gives a friendly message before a request is ever sent.

export function normalizeEmail(raw) {
  return String(raw ?? '').trim().toLowerCase();
}

// true for name@berkeley.edu or name@cs.berkeley.edu, but not for look-alikes
// such as name@edu.com, name@berkeley.edu.evil.com or name@.edu
export function isEduEmail(raw) {
  const email = normalizeEmail(raw);
  const m = email.match(/^[^\s@]+@([a-z0-9-]+(?:\.[a-z0-9-]+)*)$/);
  if (!m) return false;
  const labels = m[1].split('.');
  return labels.length >= 2 && labels[labels.length - 1] === 'edu' && labels.every((l) => l.length > 0 && !l.startsWith('-') && !l.endsWith('-'));
}

// "maya@berkeley.edu" -> "berkeley"; "x@eecs.berkeley.edu" -> "berkeley"
export function campusFromEmail(raw) {
  if (!isEduEmail(raw)) return null;
  const labels = normalizeEmail(raw).split('@')[1].split('.');
  return labels[labels.length - 2];
}
