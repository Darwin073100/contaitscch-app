# 10 — Versión web (Safari en iPhone y navegadores) sin afectar Android

- **Estado:** 19 de noviembre de 2026. Funciona en Chrome de Android, Chrome y Edge de computadora y en
  WebKit (motor de Safari) en pruebas automáticas. En iPhone real ya se registra, inicia sesión y abre
  temas; **falta confirmar en iPhone la versión con sql.js** (sección 7, casos W1–W10).
- **Commits:** `ae67a49` (versión web inicial), `33d0303` (imágenes y errores visibles), `4d3b54b`
  (sql.js para Safari).
- **Antecedentes:** `spec/09_ios_iphone_spec.md` (por qué web y no app nativa: la nativa exige el Apple
  Developer Program, 99 USD/año) y `spec/08_produccion_supabase_y_apk_spec.md` (APK y EAS Update).
- **Para quién:** cualquiera que cambie la app después. La sección 5 son las reglas para no romper
  Android al tocar la web, ni la web al tocar Android.

## 1. Qué es

La misma app de Expo exportada como página web de una sola pantalla (SPA) en
`https://contaitscch.expo.app` (Expo Hosting, gratis). En iPhone se abre en Safari y se agrega con
_Compartir → Agregar a inicio_. Es el mismo código offline-first: base SQLite local, avance pendiente y
sincronización con Supabase.

**Principio:** Android no cambia de comportamiento. Todo lo exclusivo de web vive en archivos `.web.ts`
(Metro los elige solo al armar el bundle web) o fuera de `src/` (`public/`, `scripts/build-web.mjs`).
Comprobado: el bundle de Android (`export:embed`) no incluye `sql.js`, `webSnapshotStore` ni el
service worker.

## 2. Cómo funciona en el navegador

| Pieza               | Android (sin cambios)                   | Web                                                                                                                     |
| ------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Base local          | `expo-sqlite` (`client.ts`, WAL)        | **sql.js** en memoria, copia completa en IndexedDB (`client.web.ts` + `webSnapshotStore.ts`)                            |
| Cuándo se guarda    | Cada escritura va directo al archivo    | 300 ms después de una escritura (nunca a media transacción) y al pasar a segundo plano (`visibilitychange`, `pagehide`) |
| Sesión              | SecureStore (Keystore cifrado)          | `localStorage` (`secureStorage.web.ts`): solo `user_id` + `api_token`, nunca la contraseña                              |
| Abrir sin red       | La app está instalada                   | Service worker `dist/sw.js` (lo genera `scripts/build-web.mjs`): guarda los ~8 MB de la app en la primera visita        |
| Arranque            | `setupWebApp.ts` vacío                  | `setupWebApp.web.ts`: pide almacenamiento persistente y registra el service worker sin esperarlo                        |
| Red                 | NetInfo nativo                          | NetInfo con `navigator.onLine` y un `HEAD /` que el service worker deja pasar a la red                                  |
| Contenido del curso | `ContentSeeder` desde los JSON          | Igual, sobre la base de sql.js                                                                                          |
| Migraciones         | `drizzle-orm/expo-sqlite/migrator`      | El mismo migrador: solo usa `db.dialect` y `db.session`, que sql.js también tiene                                       |
| Publicar            | `npm run update:preview` (solo Android) | `npm run build:web` + `npm run deploy:web`                                                                              |

Drizzle trabaja igual con los dos drivers (`drizzle-orm/expo-sqlite` y `drizzle-orm/sql-js`): ambos son
SQLite síncrono. `client.web.ts` convierte la base de sql.js al tipo `AppDatabase`, así los
repositorios, el `SqliteUnitOfWork` y las pruebas no cambian.

## 3. Decisiones

| #   | Decisión                                                            | Por qué                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Versión web en lugar de app nativa de iOS                           | Gratis. La nativa exige el Apple Developer Program. La ruta nativa queda en la spec 09                                                                                                                                                                                                               |
| D2  | `web.output: "single"` en `app.json`                                | La salida `server` no exportaba (renderizado en servidor) y la app no lo necesita                                                                                                                                                                                                                    |
| D3  | **sql.js en web, no expo-sqlite**                                   | expo-sqlite web guarda en OPFS con archivos de acceso exclusivo. Una pestaña congelada de Safari en iPhone nunca los suelta: "The object is in an invalid state". Además, expo-sqlite no tiene forma de liberarlos. sql.js no bloquea nada, no necesita `SharedArrayBuffer` ni encabezados COOP/COEP |
| D4  | sql.js con el wasm dentro del JS (`sql.js/dist/sql-wasm-inline.js`) | No hay que servir un `.wasm` aparte. El service worker lo guarda con el resto del bundle                                                                                                                                                                                                             |
| D5  | Copia completa de la base en IndexedDB                              | La base es chica (contenido + avance). Una sola llave (`contaitscch` → `sqlite` → `main`). Con dos pestañas abiertas gana la última que guarde; el avance igual se sincroniza con la nube                                                                                                            |
| D6  | Service worker propio (sin librerías)                               | Lo genera `build-web.mjs` con la lista de archivos de `dist/` y una versión (hash) que cambia con cualquier archivo. Guarda archivo por archivo y **nunca falla la instalación** si uno no se guarda                                                                                                 |
| D7  | Sin COOP/COEP                                                       | Solo los pedía expo-sqlite web (D3). Se quitaron de `metro.config.js`, `public/_headers` y del service worker                                                                                                                                                                                        |
| D8  | Sesión en `localStorage`                                            | El navegador no tiene Llavero ni Keystore. Solo se guardan `user_id` y `api_token`                                                                                                                                                                                                                   |
| D9  | Sesión sin su usuario en SQLite = se cierra (`dropOrphanSession`)   | Si la base local se perdió (datos borrados, cambio de almacenamiento, o el Llavero de iOS que sobrevive a desinstalar), se pide iniciar sesión y se restauran perfil y avance desde la nube                                                                                                          |
| D10 | Errores visibles en pantalla                                        | En la app de inicio del iPhone no hay consola. `StartupError` (arranque) y `unexpectedErrorMessage` (registro e inicio de sesión) muestran el detalle técnico                                                                                                                                        |

## 4. Archivos

**Solo web** (Android no los ve):

| Archivo                                 | Qué hace                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/core/database/client.web.ts`       | Abre sql.js, carga la copia de IndexedDB, activa `foreign_keys` y guarda tras cada escritura                       |
| `src/core/database/sqlJsDatabase.ts`    | Conecta sql.js con Drizzle (`foreign_keys` y esquema); la usan `client.web.ts` y su prueba                         |
| `src/core/database/webSnapshotStore.ts` | Lee y escribe la copia de la base en IndexedDB (solo lo importa `client.web.ts`)                                   |
| `src/core/database/sqlJsInline.d.ts`    | Tipos para `sql.js/dist/sql-wasm-inline.js`                                                                        |
| `src/core/session/secureStorage.web.ts` | Sesión en `localStorage`                                                                                           |
| `src/core/web/setupWebApp.web.ts`       | `navigator.storage.persist()` y registro de `/sw.js` (solo en producción)                                          |
| `public/index.html`                     | Plantilla: idioma, `viewport-fit=cover`, metas de app web de Apple, `theme-color`, ícono y manifiesto              |
| `public/manifest.webmanifest`           | `display: standalone`, colores e ícono                                                                             |
| `public/_headers`, `public/_redirects`  | Para hostings tipo Netlify/Cloudflare: `sw.js` sin caché y todas las rutas a `index.html`. Expo Hosting no los usa |
| `scripts/build-web.mjs`                 | `expo export --platform web`, copia el ícono y genera `dist/sw.js`. Corrige la unidad `c:` en minúscula de Windows |

**Compartidos** (cambiaron para la web; en Android dan el mismo resultado):

| Archivo                                | Cambio                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/core/database/client.ts`          | `openAppDatabase()` es `async` (en Android sigue con `openDatabaseSync` + WAL)                                                |
| `src/core/web/setupWebApp.ts`          | Función vacía: en Android no hace nada                                                                                        |
| `src/composition/bootstrap.ts`         | Llama `setupWebApp()`, espera `openAppDatabase()`, cierra sesiones sin usuario (D9) y permite reintentar si el arranque falla |
| `src/app/_layout.tsx`                  | `ErrorBoundary` con `StartupError`. "Reintentar" recarga la página en web y vuelve a arrancar en Android                      |
| `src/shared/ui/StartupError.tsx`       | Pantalla "No se pudo abrir CONTAITSCCH" con el detalle técnico                                                                |
| `src/shared/ui/Logo.tsx`               | Tamaño en números (`style`): en web `Image` ignora el tamaño de `className`                                                   |
| `src/shared/ui/Figure.tsx`             | `Image.resolveAssetSource` no existe en web: se usa si existe y se corrige con `onLoad`                                       |
| `features/auth/.../unexpectedError.ts` | Registro e inicio de sesión muestran "Algo falló en este dispositivo… Detalle: …" en vez de quedarse callados                 |
| `metro.config.js`                      | `wasm` en `assetExts` (expo-sqlite trae un `.wasm` que Metro debe resolver aunque la web ya no lo use)                        |
| `app.json`                             | `web.output: "single"`                                                                                                        |
| `package.json`                         | `sql.js` 1.16.0, `@types/sql.js` 1.4.11 (dev), scripts `build:web` y `deploy:web`                                             |

## 5. Reglas para no romper Android (ni la web)

1. **Lo exclusivo de web va en `.web.ts`** con su gemelo `.ts` para Android e iOS. Nunca importar
   `sql.js`, `indexedDB`, `window`, `document` ni `navigator.serviceWorker` desde un archivo compartido.
   Si un archivo compartido necesita algo del navegador, usar `Platform.OS === 'web'` y no tocar `window`
   fuera de esa rama.
2. **APIs de React Native que no existen o no hacen nada en web** (react-native-web): `Image.resolveAssetSource`,
   `Image.getSize` con `require`, `Alert.alert` (no muestra nada), `BackHandler`, `Vibration`, `ToastAndroid`.
   Si se necesitan, dar alternativa en web o un `.web.tsx`. En web, `Image` necesita `width`/`height`
   numéricos en `style`.
3. **No usar el valor de retorno de `.run()` de Drizzle** (`changes`, `lastInsertRowId`): en expo-sqlite
   es `SQLiteRunResult` y en sql.js es `void`. Para saber si cambió algo, consultar después.
4. **Base de datos:** las migraciones de `src/core/database/migrations/` y la siembra corren en las dos
   plataformas; no hace falta nada extra en web. Evitar funciones o pragmas que sql.js no tenga (por
   ejemplo `journal_mode = WAL`, que solo está en `client.ts`). Transacciones solo con `UnitOfWork`
   (BEGIN/COMMIT en la misma conexión): `client.web.ts` no guarda a media transacción.
5. **Dependencias nuevas con código nativo:** revisar que tengan soporte web o dar un `.web.ts`. Si no,
   el bundle web falla o la pantalla truena en el navegador.
6. **Publicar es independiente:** `npm run update:preview` publica solo Android (`--platform android`);
   `npm run deploy:web` publica solo la web. Un cambio de JS compartido hay que publicarlo en las dos.
   Un cambio nativo exige APK nuevo (spec 08) y no afecta la web.
7. **Variables:** la web se compila con `.env.local`; el APK con las variables de EAS
   (`eas env:list --environment preview`). `EXPO_PUBLIC_SUPABASE_URL` va **sin** `/rest/v1/` (con esa ruta,
   la web llamaba a `…/rest/v1/rest/v1/rpc/…`, recibía 404 y mostraba "Necesitas conexión").
8. **Versiones fijas:** `sql.js` 1.16.0 y `@types/sql.js` 1.4.11 (no había tipos más nuevos con más de un
   día). Al subirlas, repetir la verificación de la sección 6.

9. **Contenido del curso (agregar preguntas):** funciona igual en Android y en web; al subir
   `manifest.version`, `ContentSeeder` actualiza la base en los dos. Agrega o actualiza preguntas por id
   y **nunca las borra**: solo agregar al final con ids nuevos (`pregunta = ejercicio×100 + orden`) y no
   quitar ni renumerar las existentes. Supabase acepta `best_score` de 0 a 20: máximo 20 preguntas por
   ejercicio, o hay que migrar esa restricción. Lo prueba `src/core/database/sqlJsDatabase.test.ts`.

## 6. Verificación antes de publicar

Siempre: `npm run typecheck && npm run lint && npm test`.

Si se tocó algo compartido, comprobar que Android no cambió (bundle como en EAS):

```bash
npx expo export:embed --platform android --dev false --reset-cache \
  --entry-file node_modules/expo-router/entry.js \
  --bundle-output <tmp>/index.android.bundle --assets-dest <tmp>/res
grep -c "initSqlJs\|webSnapshotStore\|sql-wasm" <tmp>/index.android.bundle   # debe dar 0
```

Si se tocó algo de web: `npm run build:web` y abrir `dist/` con un servidor local. Para no crear usuarios
basura en la nube, compilar contra Supabase local exportando antes `EXPO_PUBLIC_SUPABASE_URL` y
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con los valores de `npx supabase status -o json` (`API_URL`,
`PUBLISHABLE_KEY`); las variables del entorno ganan sobre `.env.local`. Recorrer: registro, Niveles,
Aprender, Glosario, Ranking, Perfil, una lección con su infografía, un ejercicio, recargar, dos pestañas
y abrir con el servidor apagado.

**Herramientas de prueba sin teléfono y sus límites:**

| Herramienta                                 | Sirve para                                                            | Límite conocido                                                                               |
| ------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Edge sin ventana (`--headless=new`) por CDP | Flujo completo, service worker y abrir sin red                        | —                                                                                             |
| Chrome 157 sin ventana                      | —                                                                     | Su Cache API falla ("Entry already exists") hasta en una página vacía: no usarlo              |
| WebKit de Playwright (Windows)              | Lo más parecido a Safari: registro, ejercicio, recargas, dos pestañas | No tiene OPFS; con perfil persistente su caché queda vacía, así que no prueba el modo sin red |

Ninguna sustituye la prueba en un iPhone real (sección 7).

## 7. Prueba en iPhone (iOS 16.4 o superior)

| #   | Caso                                                       | Esperado                                                                       |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| W1  | Abrir el enlace en Safari                                  | Muestra el registro (sin recargas)                                             |
| W2  | _Compartir → Agregar a inicio_ y abrir desde el ícono      | Pantalla completa, ícono y nombre CONTAITSCCH; la isla no tapa la barra        |
| W3  | Registrarse o iniciar sesión **dentro del ícono**          | Entra a Niveles (el ícono no comparte datos con la pestaña de Safari)          |
| W4  | Abrir una lección y ampliar la infografía                  | Se ve completa, sin distorsión                                                 |
| W5  | Aprobar un ejercicio, cerrar la app por completo y abrirla | Sigue la sesión y el tema aprobado                                             |
| W6  | Modo avión, cerrar y abrir la app                          | Abre sin red con la sesión y el avance                                         |
| W7  | Con modo avión, aprobar un tema; luego quitarlo y volver   | "Sin conexión · 1 cambio" y después "Avance sincronizado"; Android lo recupera |
| W8  | La app abierta en dos pestañas de Safari                   | Las dos abren (antes salía "The object is in an invalid state")                |
| W9  | Formularios con el teclado abierto, modo oscuro            | Se ve y se usa bien                                                            |
| W10 | Publicar una corrección y abrir la app dos veces           | Aparece el cambio                                                              |

Si algo falla, la pantalla muestra el detalle técnico. Con una Mac se puede ver la consola del iPhone
conectado por cable: Safari → Desarrollo → nombre del iPhone.

## 8. Publicar (usuario)

1. Revisar `.env.local`: Supabase en la nube y la URL sin `/rest/v1/` (regla 7).
2. `npm run build:web`. En Windows, si la terminal abrió el proyecto como `c:\…`, el script lo corrige.
3. `npm run deploy:web`.
4. Los teléfonos toman la versión nueva al segundo arranque (el service worker se actualiza en segundo
   plano). Si no aparece, cerrar las pestañas de la app o borrar el ícono y volver a agregarlo.

Instrucción para alumnos: agregar a inicio, iniciar sesión ahí y usar solo ese ícono. Si borran los datos
de Safari se pierde lo no sincronizado; lo sincronizado vuelve al iniciar sesión.

## 9. Problemas encontrados y cómo se resolvieron

| Síntoma                                                                 | Causa                                                                                                  | Solución                                                                            |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `Unable to resolve "c:\C:\…"` al exportar                               | Terminal de Windows con la unidad en minúscula                                                         | `build-web.mjs` normaliza la ruta                                                   |
| `Unable to resolve ./wa-sqlite/wa-sqlite.wasm`                          | Metro no conocía la extensión `.wasm`                                                                  | `wasm` en `assetExts`                                                               |
| Falla el export con salida `server`                                     | Renderizado en servidor de rutas que usan APIs del cliente                                             | `web.output: "single"`                                                              |
| "The SQLite web worker has not finished loading"                        | `openDatabaseSync` antes de que cargara el worker                                                      | `openAppDatabase()` async (hoy la web ya no usa expo-sqlite)                        |
| Logo gigante en web                                                     | `Image` en web ignora el tamaño de `className`                                                         | Tamaño numérico en `style`                                                          |
| "Necesitas conexión" al iniciar sesión en web                           | `EXPO_PUBLIC_SUPABASE_URL` con `/rest/v1/` → 404                                                       | Quitar la ruta en `.env.local`                                                      |
| Registro sin avanzar; el inicio de sesión se queda cargando             | Excepción de la base local que nadie mostraba                                                          | `unexpectedErrorMessage` muestra el detalle                                         |
| App de inicio del iPhone trabada en azul                                | El arranque esperaba al service worker sin límite; si un archivo no se guardaba, esperaba para siempre | El service worker ya no falla al instalar; el arranque no lo espera; `StartupError` |
| `o.default.resolveAssetSource is not a function` (iPhone y Android web) | `Figure` usaba una API que react-native-web no tiene                                                   | Usarla solo si existe y corregir con `onLoad`                                       |
| Pantallas alternando entre bien y error al recargar                     | OPFS: la página anterior (caché atrás/adelante) seguía con la base abierta                             | Resuelto de raíz con sql.js (D3)                                                    |
| "The object is in an invalid state" solo en iPhone (Safari y Chrome)    | OPFS exclusivo y pestañas congeladas de iOS que nunca lo sueltan                                       | sql.js + IndexedDB (D3, D5)                                                         |

## 10. Riesgos y pendientes

| Tema                                       | Situación                                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prueba en iPhone real de la versión sql.js | Pendiente (sección 7)                                                                                                                                  |
| Dos pestañas abiertas a la vez             | Gana la última que guarde. Lo aprobado no se pierde en la nube, pero un cambio pendiente de la otra pestaña podría perderse antes de sincronizar       |
| Safari borra datos de sitios sin uso       | Safari puede borrar los datos de un sitio tras 7 días sin abrirlo; las apps agregadas a inicio quedan fuera. Por eso: usar el ícono                    |
| Datos de la versión anterior (OPFS)        | Quedaron sin uso en el navegador. Al abrir la versión nueva se pide iniciar sesión (D9) y el avance sincronizado regresa; lo no sincronizado se perdió |
| Sesión en `localStorage`                   | No está cifrada como en SecureStore. Solo contiene `user_id` y `api_token`                                                                             |
| Tamaño y rendimiento                       | sql.js corre en el hilo principal y el bundle web pesa ~8 MB (sql.js aporta ~1 MB). Con la base actual las consultas son instantáneas                  |
| Ruta nativa de iOS                         | Sigue en la spec 09 (fase 1: cerrar la sesión huérfana tras reinstalar, ya cubierta por D9 en el código compartido)                                    |
