import type { KeyValueStorage } from '../SecureSessionStore';

/** Reemplazo de SecureStore para pruebas: guarda en un Map. */
export function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: KeyValueStorage = {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => void data.set(key, value),
    deleteItem: async (key) => void data.delete(key),
  };
  return { storage, data };
}
