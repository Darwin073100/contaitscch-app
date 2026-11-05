# CONTAITSCCH — Memoria del proyecto para Claude Code

App móvil (React Native + Expo) para aprender contabilidad básica con gamificación:
niveles, temas, subtemas, exámenes, XP, rachas y ranking online.
Proyecto escolar: priorizar soluciones gratuitas y simples.

## Stack

- Expo SDK 58 + TypeScript 6 estricto, Expo Router (tabs: Aprender, Niveles, Ranking, Ajustes)
- Gestor de paquetes: **pnpm**. Instalar SIEMPRE con `npx expo install <pkg>` (dev: `-- --save-dev`); nunca `npm install` (crearía `package-lock.json`)
- Estilos: Tailwind v3 vía **NativeWind v4** (`className`) + `tailwind-variants` (`tv`). Colores solo como tokens en `src/shared/theme/colors.js` (los consume `tailwind.config.js`; en SVG usar `colors` de `@/shared/theme`)
- BD local: `expo-sqlite` + Drizzle ORM (fuente de verdad del dispositivo, offline-first)
- Remoto: `@supabase/supabase-js` **solo con `supabase.rpc()` y `supabase.functions.invoke()`**. NO usar Supabase Auth ni `.from('tabla')`
- Estado: Zustand (UI) + TanStack Query (leaderboard). Formularios: React Hook Form + Zod
- Hash de contraseña en la app: PBKDF2-SHA256 con `@noble/hashes` + sal de `expo-crypto`
- Contenido del curso: JSON en `src/core/database/seed/content/*.json`, validado con Zod
- Correo de verificación: Edge Function `send-verification` + API de Gmail (HTTPS)

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

Antes de decir que algo está terminado: `npm run typecheck && npm run lint && npm test`.

Notas del entorno:

- TS 6 no carga `@types/*` solo: si se agrega uno, añadirlo a `compilerOptions.types` en `tsconfig.json`.
- `react-native-css-interop` es dependencia directa a propósito (pnpm no lo expone); su versión debe ser la que pide `nativewind`.
- ESLint se queda en v9 hasta que `eslint-plugin-react` (de `eslint-config-expo`) soporte v10.
- Variables públicas en `.env.local` (no la leas): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Arquitectura (features + Clean Architecture)

```
src/app/          SOLO rutas de Expo Router (cada archivo es pantalla): delgadas, importan de features/<x>
src/composition/  composition root: container.ts (DI), bootstrap, providers/ (useContainer)
src/core/         infraestructura: database, network (RpcClient), sync, session, events, clock, result
src/shared/       ui (componentes con Tailwind), theme (tokens), hooks
src/features/<feature>/{domain,data,presentation}/ + index.ts
```

Features: auth, onboarding, home, levels, learning, exams, gamification, leaderboard, settings.

Reglas de dependencias (OBLIGATORIAS):

- `domain` no importa React, SQLite, Supabase, `data` ni `presentation`.
- `presentation` usa use cases inyectados; nunca SQL ni `supabase` directo.
- Una feature solo importa de otra vía su `index.ts`. Nunca rutas internas ajenas.
- Escrituras que tocan varias tablas van dentro de `UnitOfWork.run(tx => ...)`.
- Errores esperados se devuelven como `Result<T, E>`; no lanzar excepciones de negocio.
- Fecha/hora siempre desde el `Clock` inyectado (nunca `new Date()` en dominio).

Patrones en uso: Repository, Use Case (`execute()`), DI, Unit of Work, Strategy
(`QuestionGrader`, `StreakCalculator`), Registry (`QuestionTypeRegistry`, bloques de contenido),
Observer (`DomainEventBus`), Outbox (`synced_at IS NULL`), Mapper, Facade (`SyncEngine`).

## Reglas de negocio

- Tema completado: +5 XP una sola vez. Examen aprobado (`score >= passing_score`): +100 XP una sola vez.
- XP total = `SUM(xp_event.points)`. Racha = días consecutivos en `daily_activity` que terminan hoy o ayer.
- `daily_activity.activity_date` = día LOCAL del usuario (`YYYY-MM-DD`), nunca `CURRENT_TIMESTAMP`.
- Tema bloqueado si el anterior (`sort_order - 1`) no está completado. Nivel N se desbloquea con el examen N-1 aprobado.
- XP, racha, nivel y progreso se CALCULAN; nunca se guardan como columna.
- `xp_event` y `daily_activity` son append-only: no UPDATE ni DELETE (salvo `synced_at`).
- Sincronización: solo al entrar a Ranking → subir pendientes → marcar `synced_at` → pedir leaderboard.

## Contenido JSON

- Ids inmutables: tema = nivel×100 + orden; subtema = tema×100 + orden; pregunta = examen×1000 + orden.
- Supabase guarda `topic_id`/`exam_id`: cambiar un id existente corrompe el XP de los usuarios.
- Subir `manifest.version` cuando cambie el contenido.

## Seguridad

- Nunca leer ni escribir `.env*`. Secretos de Gmail/Supabase solo con `npx supabase secrets set`.
- La contraseña en texto plano nunca se guarda ni se loguea. Postgres guarda `digest(hash_app,'sha256')`.
- Funciones RPC: `security definer`, validan `id + api_token`; RLS activo sin políticas.
- El MCP de Supabase apunta al proyecto de DESARROLLO y en solo lectura.

## Estilo de código

- Nombres de código en inglés; textos de UI y comentarios de negocio en español.
- Componentes funcionales; un componente por archivo; props tipadas con `type`.
- Clases Tailwind solo en `src/shared/ui` (con `tailwind-variants`); las pantallas usan esos componentes.
- Tests junto al archivo: `Foo.ts` → `Foo.test.ts`. Dominio con repos en memoria.

## Documentos de referencia

- Guía de Expo para agentes (generada por create-expo-app, versión del SDK del proyecto): @AGENTS.md
- Arquitectura completa: @docs/ARCHITECTURE.md
- Modelos de datos: @docs/database/sqlite.dbml y @docs/database/postgres.dbml
- Historias de usuario: @docs/USER_STORIES.md
