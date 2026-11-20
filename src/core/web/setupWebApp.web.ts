/**
 * Versión web (spec 09), solo en el build de producción (`npm run build:web`). Corre antes de abrir
 * SQLite:
 * - Pide almacenamiento persistente para que Safari no borre la base (IndexedDB) ni la sesión
 *   (WebKit lo concede sobre todo a las apps agregadas a la pantalla de inicio).
 * - Registra el service worker (`/sw.js`, lo genera scripts/build-web.mjs), que guarda la app para
 *   abrirla sin red. No se espera: la app arranca igual si el registro falla.
 */
export async function setupWebApp(): Promise<void> {
  if (__DEV__ || typeof window === 'undefined') return;
  navigator.storage?.persist?.().catch(() => {});
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}
