// Saved (hearted) listings live in this browser only, like a Pinterest board
// you haven't signed in to. Storage can be blocked, so every access is guarded.

const KEY = 'curb.saved.v1';
const listeners = new Set();

export function getSaved() {
  try {
    return new Set(JSON.parse(globalThis.localStorage?.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function toggleSaved(id) {
  const saved = getSaved();
  if (saved.has(id)) saved.delete(id);
  else saved.add(id);
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify([...saved]));
  } catch {
    /* storage blocked: the heart still flips for this page view */
  }
  listeners.forEach((cb) => cb(saved));
  return saved.has(id);
}

export function onSavedChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
