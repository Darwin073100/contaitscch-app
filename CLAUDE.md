# CONTAITSCCH — Memoria del proyecto para Claude Code

App móvil (React Native + Expo) para aprender contabilidad desde cero, para el ITSCCH (Instituto
Tecnológico Superior de la Costa Chica): 6 niveles × 4 temas, cada tema en 4 pasos con su ejercicio,
un examen integrador final, glosario y ranking online. Sin XP, rachas ni vidas.
Proyecto escolar: priorizar soluciones gratuitas y simples.

## Stack

- Expo SDK 58 + TypeScript 6 estricto, Expo Router (pestañas: Niveles, Aprender, Glosario, Ranking, Perfil)
- Gestor de paquetes: **pnpm**. Instalar SIEMPRE con `npx expo install <pkg>` (dev: `-- --save-dev`); nunca `npm install` (crearía `package-lock.json`)
- Estilos: Tailwind v3 vía **NativeWind v4** (`className`) + `tailwind-variants` (`tv`). Colores solo como tokens en `src/shared/theme/colors.js` (modo claro y oscuro; `tailwind.config.js` los convierte en variables CSS). Fuera de `className` (iconos, SVG, pestañas) usar `useThemeColors()` de `@/shared/theme`
- BD local: `expo-sqlite` + Drizzle ORM (fuente de verdad del dispositivo, offline-first)
- Remoto: `@supabase/supabase-js` **solo con `supabase.rpc()` y `supabase.functions.invoke()`**. NO usar Supabase Auth ni `.from('tabla')`
- Formularios: React Hook Form + Zod. Conectividad: `@react-native-community/netinfo`
- Hash de contraseña en la app: PBKDF2-SHA256 con `@noble/hashes` + sal de `expo-crypto`
- Contenido del curso: JSON en `src/core/database/seed/content/*.json`, validado con Zod (`courseSchema.ts`)
- Verificación de correo **opcional y apagada** (`private.settings.email_verification_required`; register y login la avisan a la app; guard = `canEnterApp`). Correo: Edge Function `send-verification` (Gmail en la nube; Mailpit en local, http://127.0.0.1:54324). Tras editarla: `npx supabase stop && npx supabase start`
- Diseño de referencia: prototipo del cliente `spec/contaitscch-refactor/index.html` (las capturas de `docs/design/` son de la v1)
- Builds: EAS (`eas.json`), proyecto `@contaitscchs-team/contaitscch-app`, paquete `mx.edu.itscch.contaitscch`. Perfil `preview` = APK de prueba con canal `preview` de EAS Update (`runtimeVersion` = `version` de `app.json`: un cambio nativo exige subir `version` y un APK nuevo). Las variables `EXPO_PUBLIC_*` del build viven en EAS (`eas env:list --environment preview`), no en `.env.local`. Plan: `spec/08_produccion_supabase_y_apk_spec.md`

## Comandos

- `npm run start` — Expo dev server (no ejecutarlo tú: bloquea la terminal; pídeselo al usuario)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` / `npm run lint:fix`
- `npm test` — Jest; un archivo: `npx jest ruta/al/archivo.test.ts`
- `npm run content:validate` — valida los JSON de contenido
- `npm run db:generate` — genera migración Drizzle tras cambiar `src/core/database/schema/`
- `npm run format` — Prettier en todo el proyecto
- `npx expo install --check` — verifica versiones compatibles con el SDK
- `npx expo export --platform android` — compila el bundle sin dev server (verifica Babel/Metro/NativeWind)
- `npx supabase start` / `npx supabase db reset` / `npx supabase stop` — Supabase local (Docker). La CLI es devDependency fijada en la 2.x estable (no instalarla global). Guía: `supabase/README.md`
- `npx supabase test db` — pruebas pgTAP de RPC y permisos (`supabase/tests/*.test.sql`)
- `npm run build:apk` — APK de prueba en EAS Build (lo lanza el usuario: usa su cuota y su cuenta)
- `npm run update:preview -- --message "…"` — publica JS y contenido al canal `preview` de EAS Update (lo lanza el usuario)

Antes de decir que algo está terminado: `npm run typecheck && npm run lint && npm test`.

Notas del entorno:

- TS 6 no carga `@types/*` solo: si se agrega uno, añadirlo a `compilerOptions.types` en `tsconfig.json`.
- `react-native-css-interop` es dependencia directa a propósito (pnpm no lo expone); su versión debe ser la que pide `nativewind`.
- `babel-preset-expo` y `@babel/plugin-transform-react-jsx` son devDependencies directas a propósito: Babel resuelve por nombre desde la raíz del proyecto lo que piden `babel.config.js` y `react-native-css-interop/babel` (vía `nativewind/babel`), y con pnpm sin ellas el build de EAS falla en `createBundleReleaseJsAndAssets` (`Cannot find module …`). La versión de `babel-preset-expo`, la que pide `expo`. `eas.json` fija pnpm 12.15.0 (perfil `base`) para que EAS instale igual que en local.
- En local la caché de Metro oculta esos fallos. Para probar el bundle como EAS: `npx expo export:embed --platform android --dev false --reset-cache --entry-file node_modules/expo-router/entry.js --bundle-output <tmp>/index.android.bundle --assets-dest <tmp>/res`.
- ESLint se queda en v9 hasta que `eslint-plugin-react` (de `eslint-config-expo`) soporte v10.
- Variables públicas en `.env.local` (no la leas): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Rutas tipadas: `.expo/types/router.d.ts` lo regenera `npm run start`. Si el typecheck marca una ruta nueva como desconocida, hay que arrancar el servidor una vez.
- drizzle-kit pregunta en modo interactivo cuando detecta renombres de tablas o columnas: en ese caso generar con `--custom` y revisar a mano el SQL y el snapshot.
- pnpm 12 no instala versiones publicadas hace menos de un día (falla `expo install`). Esperar en lugar de agregar excepciones a `minimumReleaseAgeExclude` de `pnpm-workspace.yaml`.
- Supabase en la nube: la CLI queda desvinculada (`npx supabase unlink`). Para subir migraciones: `link`, `db push --dry-run`, `db push`, `unlink`. Nunca `db reset --linked` ni `config push` (ver spec 08).

## Arquitectura (features + Clean Architecture)

```
src/app/          SOLO rutas de Expo Router (cada archivo es pantalla): delgadas, componen pantallas de features
src/composition/  composition root: container.ts (DI), bootstrap, autoSync, providers/ (useContainer)
src/core/         infraestructura: database, network, connectivity, session, events, transaction, clock, result
src/shared/       ui (componentes con Tailwind), theme (tokens), hooks, utils
src/features/<feature>/{domain,data,presentation}/ + index.ts
```

Features: auth, onboarding, home, levels, learning, quizzes, glossary, leaderboard, profile.

Reglas de dependencias (OBLIGATORIAS):

- `domain` no importa React, SQLite, Supabase, `core/database`, `core/network`, `data` ni `presentation`. Los puertos que el dominio necesita de la infraestructura viven en `core/transaction`, `core/connectivity`, `core/events`, `core/clock`.
- `presentation` usa use cases inyectados; nunca SQL ni `supabase` directo.
- Una feature solo importa de otra vía su `index.ts`. Nunca rutas internas ajenas. En `domain`, solo tipos (`import type`).
- Las pantallas de pestaña reciben la barra superior como prop `header`; la ruta le pasa `<AppTopBar />` (feature `profile`).
- Escrituras que tocan varias tablas van dentro de `UnitOfWork.run(tx => ...)`.
- Errores esperados se devuelven como `Result<T, E>`; no lanzar excepciones de negocio.
- Fecha/hora siempre desde el `Clock` inyectado (nunca `new Date()` en dominio).

Patrones en uso: Repository, Use Case (`execute()`), DI, Unit of Work, Policy pura (`CourseProgressPolicy`,
`ProgressRules`, `QuizAccessPolicy`, `PodiumPolicy`), Observer (`DomainEventBus`), Outbox
(`quiz_progress` pendiente), Mapper/DTO con Zod, Facade (`SyncProgressUseCase`, `SyncAndFetchRankingUseCase`), MVVM.

## Reglas de negocio

- Cada tema se estudia en 4 pasos (objetivo + infografía, explicación, ejemplo resuelto, repaso) y termina con un ejercicio de opción múltiple. Aprobar = `aciertos >= pass_mark`; en temas, todas las preguntas (2/2).
- Desbloqueo **secuencial global** (N1-L1 … N6-L4): un tema se abre al aprobar el anterior, aunque sea de otro nivel. Un tema con intentos sin aprobar queda "por aprobar" y se vuelve a tomar la lección.
- Nivel completado = sus 4 temas aprobados; nivel abierto = su primer tema desbloqueado. Nivel actual = el del primer tema sin aprobar.
- Examen integrador (id 900): disponible con los 24 temas aprobados; se aprueba con 8 de 10.
- **Nunca se revela la opción correcta**: al comprobar solo se marca la elegida; la retroalimentación solo aparece al acertar; el examen no tiene retroalimentación.
- Avance guardado en `quiz_progress` (aprobado, mejor puntaje, intentos, `passed_at`). **Aprobar nunca se deshace**, salvo "Reiniciar mi avance".
- Desbloqueo, nivel actual, niveles completados, progreso y posición se CALCULAN; nunca se guardan como columna.
- Ranking: niveles completados DESC, temas aprobados DESC, `dense_rank`; solo correos verificados si la verificación está encendida; nunca expone correos.
- Sincronización (`sync_progress`): sube lo pendiente, fusiona (aprobado = OR, mayor puntaje e intentos, `passed_at` más antiguo) y devuelve el avance completo. Si la generación no coincide (teléfono nuevo o reinicio en otro teléfono) responde `replace`. Se dispara al terminar un ejercicio, al abrir la app, al volver a primer plano, al reconectar, al iniciar sesión, al entrar a Ranking y con "Sincronizar ahora".
- Fila pendiente = `synced_at IS NULL OR synced_at <> updated_at`; queda sincronizada cuando la nube tiene el mismo contenido (`reconcile`).
- "Reiniciar mi avance" requiere conexión: borra en la nube (sube `progress_generation`) y luego en el teléfono.

## Contenido JSON

- Ids inmutables: nivel 1..6 (4 temas cada uno); tema = nivel×100 + orden; ejercicio del tema = id del tema; examen integrador = 900; pregunta = ejercicio×100 + orden; opción = pregunta×10 + posición.
- Supabase guarda `quiz_id` (con un CHECK del catálogo): cambiar un id existente corrompe el avance de los usuarios.
- Solo opción múltiple (2 a 4 opciones, exactamente una correcta). Infografía por tema en `assets/images/lessons/` registrada en `lessonImages.ts`.
- Subir `manifest.version` cuando cambie el contenido.

## Seguridad

- Nunca leer ni escribir `.env*`. Secretos de Gmail/Supabase solo con `npx supabase secrets set`.
- La contraseña en texto plano nunca se guarda ni se loguea. Postgres guarda `digest(hash_app,'sha256')`.
- Funciones RPC: `security definer`, `set search_path = ''`, validan `id + api_token` con `private.is_owner`; RLS activo sin políticas. Las vistas con datos de varios usuarios viven en `private`.
- El MCP de Supabase apunta al proyecto de la nube (el de la beta, con usuarios de prueba) y en solo lectura. Desarrollo = Supabase local.

## Estilo de código

- Nombres de código en inglés; textos de UI y comentarios de negocio en español.
- Componentes funcionales; un componente por archivo; props tipadas con `type`.
- Clases Tailwind solo en `src/shared/ui` (con `tailwind-variants`); las pantallas usan esos componentes.
- ViewModels: hook `useXxxViewModel` + función pura `toXxxVm` (con prueba) que arma los textos.
- Tests junto al archivo: `Foo.ts` → `Foo.test.ts`. Dominio con repos en memoria; pantallas sobre `createTestContainer()`.

## Documentos de referencia

- Guía de Expo para agentes (generada por create-expo-app, versión del SDK del proyecto): @AGENTS.md
- Arquitectura completa: @docs/ARCHITECTURE.md
- Modelos de datos: @docs/database/sqlite.dbml y @docs/database/postgres.dbml
- Historias de usuario: @docs/USER_STORIES.md
- Plan de la refactorización v2 (decisiones D1–D8): `spec/contaitscch-refactor/PLAN.md`
