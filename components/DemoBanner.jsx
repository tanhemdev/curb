'use client';

import { useCurb } from './Providers.jsx';

export default function DemoBanner() {
  const { store } = useCurb();
  if (!store || store.mode !== 'demo') return null;
  return (
    <div className="demo-banner" role="note">
      <span>
        <b>Demo mode:</b> sample listings from made-up students. Anything you post or send stays in your browser.
      </span>
      <button
        type="button"
        className="link-btn"
        onClick={async () => {
          await store.resetDemo();
          window.location.reload();
        }}
      >
        Reset demo
      </button>
    </div>
  );
}
