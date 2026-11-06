'use client';

import { useCurb } from './Providers.jsx';

export default function DemoBanner() {
  const { store } = useCurb();
  if (!store || store.mode !== 'demo') return null;
  return (
    <div className="demo-banner" role="note">
      <span>
        <b>Preview mode:</b> these are real listings, but posts, messages and reviews you add are saved in this browser only until the shared database is switched on.
      </span>
      <button
        type="button"
        className="link-btn"
        onClick={async () => {
          await store.resetDemo();
          window.location.reload();
        }}
      >
        Reset
      </button>
    </div>
  );
}
