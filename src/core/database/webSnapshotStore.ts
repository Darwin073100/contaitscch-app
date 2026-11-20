/**
 * Copia de la base SQLite del navegador en IndexedDB (versión web, spec 09). Solo la usa
 * client.web.ts: la base vive en memoria (sql.js) y aquí se guarda y se recupera completa.
 */
const DB_NAME = 'contaitscch';
const STORE = 'sqlite';
const KEY = 'main';

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB no disponible'));
  });
}

export async function loadSnapshot(): Promise<Uint8Array | null> {
  const idb = await openIdb();
  try {
    return await new Promise((resolve, reject) => {
      const request = idb.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      request.onsuccess = () =>
        resolve(request.result instanceof Uint8Array ? request.result : null);
      request.onerror = () => reject(request.error ?? new Error('No se pudo leer la base'));
    });
  } finally {
    idb.close();
  }
}

export async function saveSnapshot(data: Uint8Array): Promise<void> {
  const idb = await openIdb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(data, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('No se pudo guardar la base'));
    });
  } finally {
    idb.close();
  }
}
