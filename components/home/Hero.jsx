'use client';

import Link from 'next/link';
import { useState } from 'react';

// "Kick it to the curb": a sneaker kicks a box onto a red curb, a couch, a
// lamp and a mini fridge drop in beside it, and a FREE tag pops up. Plays
// once on load; "Kick again" replays it. Motion is off for people who ask
// their system for reduced motion.
function CurbScene() {
  return (
    <svg className="scene" viewBox="0 24 800 276" role="img" aria-label="Illustration: a sneaker kicks a box onto a red curb next to a couch, a lamp and a mini fridge with a FREE tag">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6e6" />
          <stop offset="1" stopColor="#fdebd3" />
        </linearGradient>
      </defs>
      <rect width="800" height="300" fill="url(#sky)" />
      {/* backdrop: a Berkeley street */}
      <g opacity="0.9">
        <rect x="10" y="60" width="230" height="148" rx="4" fill="#efe1cc" />
        <path d="M0 64 L125 10 L250 64 Z" fill="#e3cfb2" />
        <rect x="40" y="95" width="40" height="40" rx="3" fill="#fff" opacity="0.7" />
        <rect x="100" y="95" width="40" height="40" rx="3" fill="#fff" opacity="0.7" />
        <rect x="165" y="140" width="38" height="68" rx="3" fill="#c9ad86" />
        <rect x="575" y="40" width="215" height="168" rx="4" fill="#e6ecef" />
        <rect x="600" y="62" width="34" height="30" rx="2" fill="#fff" opacity="0.8" />
        <rect x="650" y="62" width="34" height="30" rx="2" fill="#fff" opacity="0.8" />
        <rect x="700" y="62" width="34" height="30" rx="2" fill="#fff" opacity="0.8" />
        <circle cx="275" cy="120" r="38" fill="#cfe3c5" />
        <circle cx="300" cy="100" r="30" fill="#bcd8b0" />
        <rect x="282" y="140" width="8" height="68" fill="#a6875f" />
      </g>
      {/* sidewalk, red curb, street */}
      <rect y="208" width="800" height="18" fill="#ddd7cb" />
      <rect y="226" width="800" height="5" fill="#ff5a6e" />
      <rect y="231" width="800" height="21" fill="#e60023" />
      <rect y="252" width="800" height="48" fill="#2c2c2e" />
      {[30, 170, 310, 450, 590, 730].map((x) => (
        <rect key={x} x={x} y="274" width="60" height="5" rx="2.5" fill="#f5c400" />
      ))}

      {/* a bike rolls past on the street, forever */}
      <g className="k-bike">
        <g transform="translate(0 262)" stroke="#f7f3ea" strokeWidth="3" fill="none" strokeLinecap="round">
          <circle cx="0" cy="16" r="13" />
          <circle cx="48" cy="16" r="13" />
          <path d="M0 16 L18 -4 L40 -4 L48 16 M18 -4 L26 16 L40 -4 M14 -10 h10 M40 -4 l-2 -8 h7" />
        </g>
      </g>

      {/* mini fridge */}
      <g className="k-drop k-d3">
        <rect x="640" y="122" width="74" height="86" rx="8" fill="#eef3f6" stroke="#1d1d1f" strokeWidth="3" />
        <path d="M640 150 H714" stroke="#1d1d1f" strokeWidth="3" />
        <rect x="650" y="130" width="4" height="12" rx="2" fill="#1d1d1f" />
        <rect x="650" y="160" width="4" height="20" rx="2" fill="#1d1d1f" />
      </g>

      {/* lamp */}
      <g className="k-drop k-d2">
        <ellipse cx="590" cy="205" rx="20" ry="5" fill="#1d1d1f" />
        <path d="M590 205 V112" stroke="#1d1d1f" strokeWidth="4" />
        <path d="M562 112 H618 L604 76 H576 Z" fill="#f5c400" stroke="#1d1d1f" strokeWidth="3" strokeLinejoin="round" />
      </g>

      {/* couch */}
      <g className="k-drop k-d1">
        <rect x="330" y="118" width="196" height="58" rx="16" fill="#f7f3ea" stroke="#1d1d1f" strokeWidth="3" />
        <rect x="320" y="160" width="216" height="40" rx="12" fill="#f7f3ea" stroke="#1d1d1f" strokeWidth="3" />
        <path d="M428 162 V198" stroke="#1d1d1f" strokeWidth="2.5" />
        <rect x="312" y="140" width="30" height="62" rx="12" fill="#efe8da" stroke="#1d1d1f" strokeWidth="3" />
        <rect x="514" y="140" width="30" height="62" rx="12" fill="#efe8da" stroke="#1d1d1f" strokeWidth="3" />
        <rect x="350" y="126" width="44" height="40" rx="10" fill="#fffdf7" stroke="#1d1d1f" strokeWidth="2.5" transform="rotate(-10 372 146)" />
        <path d="M330 202 v6 M526 202 v6" stroke="#1d1d1f" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="k-dust" fill="#c9c2b4">
        <circle cx="318" cy="206" r="7" />
        <circle cx="306" cy="200" r="4" />
        <circle cx="540" cy="206" r="7" />
        <circle cx="552" cy="200" r="4" />
      </g>

      {/* FREE tag swinging from the couch arm */}
      <g className="k-tag">
        <path d="M528 142 L548 120" stroke="#1d1d1f" strokeWidth="2" />
        <g transform="rotate(12 572 112)">
          <rect x="540" y="96" width="70" height="32" rx="7" fill="#00a551" stroke="#1d1d1f" strokeWidth="2.5" />
          <text x="575" y="118" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff" fontFamily="Inter, system-ui, sans-serif">FREE</text>
        </g>
      </g>

      {/* the kicked box: x and y animate separately to make an arc */}
      <g className="k-box-x">
        <g className="k-box-y">
          <g className="k-box-r">
            <rect x="172" y="150" width="78" height="58" rx="3" fill="#cf9b5c" stroke="#1d1d1f" strokeWidth="3" />
            <path d="M172 150 l-12 -14 M250 150 l12 -14" stroke="#1d1d1f" strokeWidth="3" strokeLinecap="round" />
            <path d="M211 150 v16" stroke="#1d1d1f" strokeWidth="3" />
            <path d="M184 190 h26" stroke="#8a5a26" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* the kicking sneaker */}
      <g className="k-shoe">
        <rect x="60" y="96" width="26" height="86" rx="6" fill="#3d5a80" />
        <path d="M56 180 V170 Q70 162 92 170 L132 188 Q142 192 142 200 H56 Z" fill="#fff" stroke="#1d1d1f" strokeWidth="3" strokeLinejoin="round" />
        <path d="M56 200 H142 V206 Q142 210 138 210 H60 Q56 210 56 206 Z" fill="#e60023" stroke="#1d1d1f" strokeWidth="3" />
        <path d="M78 176 l8 4 M88 172 l8 4" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function Hero({ count }) {
  const [take, setTake] = useState(0);
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Berkeley move-out marketplace</p>
        <h1>
          Kick it to the <span className="curb-word">curb</span>.
          <br />
          Someone nearby wants it.
        </h1>
        <p className="lede">
          Snap a photo, set a price or mark it free, and hand it off a few blocks away. Buyers pay you directly with Apple Pay, Link or a card through
          Stripe, or cash at pickup.
        </p>
        <div className="hero-ctas">
          <a href="#feed" className="pill big">
            Browse {count ? `${count} ${count === 1 ? 'item' : 'items'}` : 'the curb'}
          </a>
          <Link href="/new" className="pill big ghost">
            List an item
          </Link>
        </div>
        <ul className="trust">
          <li>
            <Icon d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /> Listings last 72 hours
          </li>
          <li>
            <Icon d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /> Payments through Stripe
          </li>
          <li>
            <Icon d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /> Reviews from real buyers
          </li>
        </ul>
      </div>
      <div className="hero-art">
        <div key={take} className="scene-wrap">
          <CurbScene />
        </div>
        <button type="button" className="replay" onClick={() => setTake((t) => t + 1)}>
          ↻ Kick again
        </button>
      </div>
    </section>
  );
}
