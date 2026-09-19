const SCHEMA_VERSION = 1

interface Envelope<T> {
  schemaVersion: number
  data: T
}

/**
 * Loads a JSON-persisted value from localStorage, merged over `fallback` so
 * new fields introduced later still get a sane default. Silently falls back
 * on missing/corrupt data or a schema version bump -- persistence is a
 * convenience, never a hard dependency for the app to function.
 */
export function loadPersisted<T extends object>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Envelope<Partial<T>>
    if (parsed.schemaVersion !== SCHEMA_VERSION || !parsed.data) return fallback
    return { ...fallback, ...parsed.data }
  } catch {
    return fallback
  }
}

export function savePersisted<T>(key: string, data: T): void {
  if (typeof localStorage === 'undefined') return
  try {
    const envelope: Envelope<T> = { schemaVersion: SCHEMA_VERSION, data }
    localStorage.setItem(key, JSON.stringify(envelope))
  } catch {
    // Storage disabled or quota exceeded -- in-memory state still works this session.
  }
}

export const PERSISTENCE_KEYS = {
  settings: 'bridge-master:settings',
  stats: 'bridge-master:stats',
  tutorial: 'bridge-master:tutorial-progress'
} as const
