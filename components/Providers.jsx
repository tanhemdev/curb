'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getStore } from '../lib/data/index.js';

const CurbContext = createContext({ store: null, user: null, ready: false });

export function Providers({ children }) {
  const [store, setStore] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;
    (async () => {
      const s = await getStore();
      if (cancelled) return;
      setStore(s);
      setUser(await s.getUser());
      unsub = s.onAuthChange((u) => setUser(u));
      setReady(true);
    })();
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return <CurbContext.Provider value={{ store, user, ready }}>{children}</CurbContext.Provider>;
}

export function useCurb() {
  return useContext(CurbContext);
}
