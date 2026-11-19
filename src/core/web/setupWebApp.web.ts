const RELOAD_KEY = 'contaitscch.coi-reload';
/** Tiempo máximo para que el service worker quede activo antes de rendirse (iPhone lento o sin red). */
const READY_TIMEOUT_MS = 20_000;
/** Una recarga reciente cuenta como intento: evita un ciclo de recargas. */
const RELOAD_WINDOW_MS = 60_000;

/**
 * Versión web (spec 09), solo en el build de producción (`npm run build:web`). Corre antes de abrir
 * SQLite:
 * - Pide almacenamiento persistente para que Safari no borre SQLite ni la sesión (WebKit lo concede
 *   sobre todo a las apps agregadas a la pantalla de inicio).
 * - Registra el service worker (`/sw.js`, lo genera scripts/build-web.mjs): guarda la app para abrirla
 *   sin red y agrega los encabezados COOP/COEP que SQLite necesita (SharedArrayBuffer), así no
 *   dependemos de que el hosting los mande.
 * - Primera visita (aún sin service worker): recarga una vez para que la página quede aislada.
 * Nunca se queda esperando: si no logra el aislamiento, lanza un error con el diagnóstico y la
 * pantalla de error lo muestra (en la app de la pantalla de inicio de iPhone no hay consola).
 */
export async function setupWebApp(): Promise<void> {
  if (__DEV__ || typeof window === 'undefined') return;
  navigator.storage?.persist?.().catch(() => {});
  if (!('serviceWorker' in navigator)) {
    if (!window.crossOriginIsolated) throw new Error(diagnose('sin soporte de service worker'));
    return;
  }

  const registration = navigator.serviceWorker.register('/sw.js');
  if (window.crossOriginIsolated) {
    forgetReload();
    registration.catch(() => {});
    return;
  }

  let step = 'registro';
  try {
    await registration;
    step = 'activación';
    await withTimeout(navigator.serviceWorker.ready, READY_TIMEOUT_MS);
  } catch (error) {
    throw new Error(diagnose(`falló el service worker (${step}): ${describe(error)}`));
  }

  if (reloadedRecently()) {
    forgetReload();
    throw new Error(diagnose('la página no quedó aislada tras recargar'));
  }
  rememberReload();
  window.location.reload();
  await new Promise<never>(() => {});
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('tiempo agotado')), ms)),
  ]);
}

// localStorage y no sessionStorage: la app de la pantalla de inicio de iOS no siempre conserva
// sessionStorage al recargar, y entonces recargaría sin fin.
function reloadedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(RELOAD_KEY));
    return at > 0 && Date.now() - at < RELOAD_WINDOW_MS;
  } catch {
    return false;
  }
}

function rememberReload(): void {
  try {
    localStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Sin almacenamiento: recargar una vez de todos modos
  }
}

function forgetReload(): void {
  try {
    localStorage.removeItem(RELOAD_KEY);
  } catch {
    // Nada que limpiar
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function diagnose(reason: string): string {
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches;
  return [
    `No se pudo preparar la base de datos del navegador: ${reason}.`,
    `aislada=${window.crossOriginIsolated} sab=${typeof SharedArrayBuffer !== 'undefined'}`,
    `sw=${Boolean(navigator.serviceWorker?.controller)} inicio=${standalone}`,
  ].join(' ');
}
