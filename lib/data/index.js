// Picks the backend: Supabase when the project's URL and anon key are set at
// build time, otherwise the demo store that keeps everything in this browser.
// Both expose the same API, so components never need to know which is live.

import { createDemoStore } from './demo.js';

let store = null;

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export async function getStore() {
  if (store) return store;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const { createSupabaseStore } = await import('./supabase.js');
    store = createSupabaseStore({
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      redirectTo: `${window.location.origin}${BASE_PATH}/`,
    });
  } else {
    store = createDemoStore();
  }
  return store;
}
