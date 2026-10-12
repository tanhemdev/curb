// Placeholder art for listings without a photo: a category icon on a soft
// color, with a height that varies by listing so the masonry grid looks
// like a real feed.

const PALETTE = ['#f6e3d4', '#dfe9f3', '#e5efe1', '#f3e1ea', '#efe9d8', '#e3e0f3', '#f4ecd2', '#dceeee'];

const ICONS = {
  furniture: <path d="M6 30h36M10 30v10M38 30v10M10 30V16a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v14M14 22h20" />,
  appliances: <path d="M14 6h20a2 2 0 0 1 2 2v34a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM12 18h24M17 11v3M17 23v6" />,
  electronics: <path d="M7 10h34a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2zM18 42h12M24 34v8" />,
  kitchen: <path d="M8 22h28v12a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8V22zM36 26h4a3 3 0 0 1 0 6h-4M16 8c0 4 4 4 4 8M24 8c0 4 4 4 4 8" />,
  decor: <path d="M24 6v8M14 14h20l-4 14H18zM24 28v12M16 42h16" />,
  books: <path d="M8 8h12a4 4 0 0 1 4 4v30a3 3 0 0 0-3-3H8zM40 8H28a4 4 0 0 0-4 4v30a3 3 0 0 1 3-3h13z" />,
  bikes: <path d="M12 38a7 7 0 1 0 0-.01zM36 38a7 7 0 1 0 0-.01zM12 38l8-16h12l4 16M20 22l-3-6h-5M30 14h4l2 8" />,
  other: <path d="M8 16l16-8 16 8v18l-16 8-16-8zM8 16l16 8 16-8M24 24v18" />,
};

function hash(s) {
  let h = 0;
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export default function ItemArt({ id, category, fixedRatio }) {
  const h = hash(id);
  const ratio = fixedRatio ?? [1, 1.25, 0.8, 1.4, 1.1][h % 5];
  return (
    <div className="art" style={{ background: PALETTE[h % PALETTE.length], aspectRatio: `1 / ${ratio}` }} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" stroke="#3b3b3b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[category] ?? ICONS.other}
      </svg>
    </div>
  );
}
