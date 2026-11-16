# CONTAITSCCH

App móvil del ITSCCH (Instituto Tecnológico Superior de la Costa Chica) para aprender contabilidad desde
cero: 6 niveles × 4 temas, cada tema en 4 pasos con su ejercicio, un examen integrador, glosario y ranking.
Expo SDK 58 + TypeScript + NativeWind + SQLite (offline-first) + Supabase (cuenta, avance sincronizado y ranking).

- Arquitectura: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Historias de usuario: [docs/USER_STORIES.md](docs/USER_STORIES.md)
- Plan de la versión 2: [spec/contaitscch-refactor/PLAN.md](spec/contaitscch-refactor/PLAN.md)
- Trabajo con Claude Code: [GUIA-CLAUDE-CODE.md](GUIA-CLAUDE-CODE.md)

## Requisitos

- Node.js 20 o superior y **pnpm** (`npm install -g pnpm`)
- Expo Go en el teléfono (todas las librerías del proyecto funcionan en Expo Go)
- Opcional, para el backend local: Docker y la [CLI de Supabase](https://supabase.com/docs/guides/local-development/cli/getting-started)

## Empezar

```bash
pnpm install
```

Crea `.env.local` en la raíz (no se sube a git) con los datos públicos del proyecto de
**desarrollo** de Supabase (Project Settings → API):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable o anon key>
```

```bash
npm run start   # escanea el QR con Expo Go
```

## Comandos

| Comando                      | Qué hace                                                  |
| ---------------------------- | --------------------------------------------------------- |
| `npm run typecheck`          | Revisa tipos con TypeScript                               |
| `npm run lint` / `lint:fix`  | ESLint, incluidas las fronteras entre capas               |
| `npm test`                   | Pruebas con Jest                                          |
| `npm run format`             | Formatea con Prettier                                     |
| `npm run content:validate`   | Valida los JSON del curso                                 |
| `npm run db:generate`        | Genera la migración de Drizzle tras cambiar el esquema    |
| `npx supabase test db`       | Pruebas pgTAP de las RPC (con Supabase local encendido)   |
| `npx expo install <paquete>` | Instala dependencias con versiones compatibles con el SDK |

Antes de subir cambios: `npm run typecheck && npm run lint && npm test`.

> Usa siempre `npx expo install` (o `pnpm add`) para instalar. `npm install` crearía un
> `package-lock.json` que choca con `pnpm-lock.yaml`.
