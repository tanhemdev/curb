// Payments go straight from buyer to seller through a Stripe Payment Link
// the seller creates in their own Stripe account. Stripe's hosted checkout
// offers Apple Pay, Google Pay, Link and cards on its own, and Curb never
// sees card details. Only links on buy.stripe.com are accepted, so a listing
// can't send buyers to a look-alike payment page.

const STRIPE_HOST = 'buy.stripe.com';

export function normalizePaymentLink(input) {
  const s = String(input ?? '').trim();
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

// '' means "no link" (pay in person). Returns null when the link isn't allowed.
export function parsePaymentLink(input) {
  const s = normalizePaymentLink(input);
  if (!s) return '';
  let url;
  try {
    url = new URL(s);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.hostname !== STRIPE_HOST || url.username || url.password) return null;
  if (!/^\/[A-Za-z0-9_/-]+$/.test(url.pathname) || url.pathname.length < 4) return null;
  return `https://${STRIPE_HOST}${url.pathname}`;
}

export const PAYMENT_HELP = 'Paste a Stripe Payment Link (it starts with buy.stripe.com/). Buyers pay you directly with Apple Pay, Link or a card.';

// Venmo: free person-to-person payments. Sellers enter their Venmo username;
// the buyer's "Pay with Venmo" button opens Venmo with the amount and a note
// already filled in. '' means none; null means the username isn't valid.
export function parseVenmo(input) {
  const s = String(input ?? '').trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?venmo\.com\/(u\/)?/i, '').replace(/\/$/, '');
  if (!s) return '';
  return /^[A-Za-z0-9_-]{5,30}$/.test(s) ? s : null;
}

export function venmoPayUrl(handle, cents, title) {
  const params = new URLSearchParams({ txn: 'pay', audience: 'private', recipients: handle, amount: (cents / 100).toFixed(2), note: `Curb: ${title}`.slice(0, 280) });
  return `https://venmo.com/?${params.toString()}`;
}
