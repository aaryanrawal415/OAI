/** localStorage helpers that never throw (storage can be blocked or full). */
export function readJson<T>(key: string, fallback: T, session = false): T {
  try {
    const store = session ? window.sessionStorage : window.localStorage;
    const raw = store.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown, session = false): void {
  try {
    const store = session ? window.sessionStorage : window.localStorage;
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the app still works for this session */
  }
}

export function removeKey(key: string, session = false): void {
  try {
    (session ? window.sessionStorage : window.localStorage).removeItem(key);
  } catch {
    /* ignore */
  }
}
