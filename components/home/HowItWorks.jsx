const STEPS = [
  {
    n: '1',
    title: 'Snap it, list it',
    text: 'One photo (or five), a price or "free", and a pickup spot. About 30 seconds. It stays up for 72 hours.',
    icon: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
  {
    n: '2',
    title: 'Match and chat',
    text: 'Students browse the feed, save what they like and tap "I want this" to message you. No phone numbers needed.',
    icon: 'M4 5h16v11H9l-5 4zM8 10h8M8 13h5',
  },
  {
    n: '3',
    title: 'Pay and hand off',
    text: 'Buyers pay you through your Stripe link (Apple Pay, Link or card) or in person, pick it up, and leave you a review.',
    icon: 'M3 7h18v11H3zM3 11h18M7 15h4',
  },
];

export default function HowItWorks() {
  return (
    <section className="how" aria-labelledby="how-title">
      <h2 id="how-title" className="sr-only">
        How Curb works
      </h2>
      {STEPS.map((s) => (
        <div key={s.n} className="how-step">
          <span className="how-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={s.icon} />
            </svg>
          </span>
          <div>
            <h3>
              <span className="how-n">{s.n}</span> {s.title}
            </h3>
            <p>{s.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
