// Versión web (spec 09): exporta la app a dist/ y genera el service worker que la guarda para
// abrirla sin red. Uso: `npm run build:web` y después `npm run deploy:web`.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Windows: con la unidad en minúscula ("c:\…") Metro no resuelve las rutas de Expo Router
const root = resolve(fileURLToPath(new URL('..', import.meta.url))).replace(/^[a-z]:/, (drive) =>
  drive.toUpperCase(),
);
const dist = join(root, 'dist');

const exported = spawnSync('npx expo export --platform web --output-dir dist', {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});
if (exported.status !== 0) process.exit(exported.status ?? 1);

// Ícono de "Agregar a inicio" (RGB sin transparencia, 1024 px)
copyFileSync(join(root, 'assets', 'images', 'icon.png'), join(dist, 'apple-touch-icon.png'));

// Archivos que el hosting no sirve como parte de la app
const SKIP = new Set(['sw.js', '_headers', '_redirects', 'metadata.json', 'index.html']);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(dist)
  .map((path) => relative(dist, path).split(sep).join('/'))
  .filter((path) => !SKIP.has(path))
  .sort();

// La versión cambia si cambia cualquier archivo: así el navegador instala el service worker nuevo
const hash = createHash('sha256');
for (const path of [...files, 'index.html']) hash.update(path).update(readFileSync(join(dist, path)));
const version = hash.digest('hex').slice(0, 12);

// "/" es la app (index.html); el resto, con su ruta tal cual (los corchetes de las rutas dinámicas
// no se codifican: el navegador los pide literales)
const precache = ['/', ...files.map((path) => `/${path}`)];

const sw = `// Generado por scripts/build-web.mjs. No editar.
const CACHE = 'contaitscch-${version}';
const PRECACHE = ${JSON.stringify(precache)};

// Archivo por archivo y sin fallar: si uno no se guarda (cuota, red, error de Safari), el service
// worker se activa igual y ese archivo se pide a la red.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(PRECACHE.map((path) => cache.add(path))))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith('contaitscch-') && key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Se arma una respuesta nueva: Safari rechaza respuestas con redirecciones en una navegación.
function plain(response) {
  if (!response || response.type === 'opaque') return response;
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  // HEAD (la prueba de red de NetInfo), POST y Supabase van siempre a la red
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // App de una sola página: cualquier ruta abre index.html guardado
    event.respondWith(
      caches.match('/', { cacheName: CACHE }).then((cached) => cached || fetch(request)).then(plain),
    );
    return;
  }
  event.respondWith(
    caches.match(request, { cacheName: CACHE, ignoreSearch: true }).then((cached) => cached || fetch(request)),
  );
});
`;
writeFileSync(join(dist, 'sw.js'), sw);

const size = files.reduce((total, path) => total + statSync(join(dist, path)).size, 0);
console.log(`\nService worker ${version}: ${precache.length} archivos (${(size / 1048576).toFixed(1)} MB) para abrir sin red.`);
