const RELOAD_FLAG = 'contaitscch.coi-reload';

/**
 * Versión web (spec 09), solo en el build de producción (`npm run build:web`). Corre antes de abrir
 * SQLite:
 * - Pide almacenamiento persistente para que Safari no borre SQLite ni la sesión (WebKit lo concede
 *   sobre todo a las apps agregadas a la pantalla de inicio).
 * - Registra el service worker (`/sw.js`, lo genera scripts/build-web.mjs): guarda la app para abrirla
 *   sin red y agrega los encabezados COOP/COEP que SQLite necesita (SharedArrayBuffer), así no
 *   dependemos de que el hosting los mande.
 * - Primera visita (aún sin service worker): recarga una vez para que la página quede aislada.
 */
export async function setupWebApp(): Promise<void> {
  if (__DEV__ || typeof window === 'undefined') return;
  navigator.storage?.persist?.().catch(() => {});
  if (!('serviceWorker' in navigator)) return;

  const registration = navigator.serviceWorker.register('/sw.js');
  if (window.crossOriginIsolated) {
    sessionStorage.removeItem(RELOAD_FLAG);
    registration.catch(() => {});
    return;
  }
  try {
    await registration;
    await navigator.serviceWorker.ready;
  } catch {
    return;
  }
  // Evita un ciclo de recargas si aun con el service worker no se logra el aislamiento
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, '1');
  window.location.reload();
  await new Promise<never>(() => {});
}
