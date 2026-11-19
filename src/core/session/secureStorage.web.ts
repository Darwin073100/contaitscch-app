import type { KeyValueStorage } from './SecureSessionStore';

/**
 * Versión web (spec 09): el navegador no tiene Llavero ni Keystore, así que la sesión
 * (`user_id` + `api_token`, nunca la contraseña) se guarda en localStorage del origen.
 * Metro usa este archivo solo en el bundle web; Android e iOS siguen con SecureStore.
 */
export const secureStorage: KeyValueStorage = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  deleteItem: async (key) => localStorage.removeItem(key),
};
