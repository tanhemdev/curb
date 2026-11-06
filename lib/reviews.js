// Seller reviews. Only someone who messaged the seller about a listing can
// review it (the same rule is enforced in the database), one review per
// person per listing, and never your own.

export const REVIEW_MAX = 400;

export function validateReview({ rating, body = '' }) {
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) return 'Pick 1 to 5 stars.';
  if (String(body).trim().length > REVIEW_MAX) return `Keep it under ${REVIEW_MAX} characters.`;
  return '';
}

export function summarize(reviews = []) {
  if (!reviews.length) return { count: 0, average: 0 };
  const total = reviews.reduce((s, r) => s + r.rating, 0);
  return { count: reviews.length, average: Math.round((total / reviews.length) * 10) / 10 };
}
