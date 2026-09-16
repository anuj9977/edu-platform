import { createContext, useContext, useEffect, useState } from 'react';

// The backend does not expose GET endpoints for some entities (class-subject
// assignments, exams, parents list...). To make the admin flows usable end to
// end, we persist the IDs of entities created in the admin's session so later
// steps (exams, marks, attendance, linking) can reference them.
const STORE_KEY = 'edu_session_entities';
const EMPTY = { parents: [], assignments: [], exams: [], examSubjects: [], invoices: [], sessions: [] };

function loadStore() {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') };
  } catch {
    return { ...EMPTY };
  }
}

const SessionStoreContext = createContext(null);

export function SessionStoreProvider({ children }) {
  const [store, setStore] = useState(loadStore);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }, [store]);

  const push = (key, item) =>
    setStore((s) => ({ ...s, [key]: [item, ...(s[key] || [])] }));

  const reset = () => {
    localStorage.removeItem(STORE_KEY);
    setStore({ ...EMPTY });
  };

  return (
    <SessionStoreContext.Provider value={{ store, push, reset, setStore }}>
      {children}
    </SessionStoreContext.Provider>
  );
}

export const useSessionStore = () => useContext(SessionStoreContext);