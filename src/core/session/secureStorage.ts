import * as SecureStore from 'expo-secure-store';

import type { KeyValueStorage } from './SecureSessionStore';

/** SecureStore cifra con Keychain (iOS) o Keystore (Android). */
export const secureStorage: KeyValueStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItem: (key) => SecureStore.deleteItemAsync(key),
};
