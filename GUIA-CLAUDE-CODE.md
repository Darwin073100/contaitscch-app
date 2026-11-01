# Guía: configurar Claude Code en CONTAITSCCH

Esta carpeta contiene todo lo que Claude Code necesita para trabajar bien en el proyecto.
Cópiala completa en la raíz de tu proyecto de React Native (donde está `package.json`).

## 1. Qué hay en cada archivo

```text
CLAUDE.md                         Memoria del proyecto: stack, comandos, arquitectura y reglas. Claude la lee siempre.
.mcp.json                         Servidor MCP de Supabase (proyecto de desarrollo, solo lectura).
.claude/
├── settings.json                 Permisos (qué puede hacer sin preguntar) y hooks.
├── hooks/
│   ├── protect-files.sh          Bloquea editar .env, lockfiles y migraciones ya creadas.
│   ├── format-and-lint.sh        Prettier + ESLint en cada archivo que Claude edita.
│   └── validate-content.sh       Valida los JSON del curso cada vez que cambian.
├── agents/                       Subagentes especialistas (cada uno con su propio contexto).
│   ├── architecture-reviewer.md  Revisa capas, fronteras entre features y SOLID. Solo lectura.
│   ├── sqlite-expert.md          Esquema Drizzle, migraciones, consultas de XP/racha.
│   ├── supabase-expert.md        RPC, pgcrypto, Edge Functions, envío con Gmail.
│   ├── rn-ui-builder.md          Pantallas con NativeWind según el diseño.
│   ├── test-writer.md            Pruebas Jest y casos borde de racha/XP/sync.
│   └── content-author.md         Temas y preguntas en JSON con ids correctos.
└── skills/                       Comandos reutilizables que invocas con "/".
    ├── new-feature/              /new-feature <nombre>
    ├── new-usecase/              /new-usecase <feature> <Nombre>
    ├── add-question-type/        /add-question-type <tipo>
    ├── new-rpc/                  /new-rpc <nombre_funcion>
    └── pre-commit-check/         /pre-commit-check (solo cuando tú lo llamas)
docs/
├── ARCHITECTURE.md               Arquitectura completa (exportada del documento).
├── USER_STORIES.md               Historias de usuario.
├── database/sqlite.dbml          Modelo local.
├── database/postgres.dbml        Modelo de Supabase.
└── design/*.png                  Capturas del diseño, para que el agente de UI las vea.
```

## 2. Instalación paso a paso

1. **Instala Claude Code** (requiere Node.js 18 o superior) y entra al proyecto:
   ```bash
   npm install -g @anthropic-ai/claude-code
   cd contaitscch
   claude
   ```
2. **Copia esta carpeta** a la raíz y da permiso de ejecución a los hooks:
   ```bash
   chmod +x .claude/hooks/*.sh
   ```
   Los hooks usan `jq`. Instálalo si no lo tienes (`brew install jq`, `sudo apt install jq` o `winget install jqlang.jq`).
   En Windows usa Git Bash o WSL para que los `.sh` funcionen.
3. **Agrega a `.gitignore`**:
   ```gitignore
   .env
   .env.*
   .claude/settings.local.json
   ```
   Todo lo demás de `.claude/` sí se sube a git para que tu equipo comparta la misma configuración.
4. **Agrega los scripts** que usan los hooks y los agentes a `package.json`:
   ```json
   {
     "scripts": {
       "start": "expo start",
       "typecheck": "tsc --noEmit",
       "lint": "eslint \"src/**/*.{ts,tsx}\" --max-warnings=0",
       "lint:fix": "eslint \"src/**/*.{ts,tsx}\" --fix",
       "test": "jest",
       "content:validate": "tsx scripts/validate-content.ts",
       "db:generate": "drizzle-kit generate"
     }
   }
   ```
5. **Conecta el MCP de Supabase** (usa tu proyecto de DESARROLLO, nunca el de producción):
   ```bash
   # El "Project ID" está en Supabase → Project Settings → General
   export SUPABASE_PROJECT_REF=abcdefghijklmnop
   claude
   ```
   Dentro de Claude Code escribe `/mcp`, elige `supabase` → **Authenticate** e inicia sesión en el navegador.
   Queda en modo solo lectura: Claude puede ver tablas, logs y advisors, pero los cambios se hacen con migraciones.
6. **Verifica** dentro de Claude Code:
   - `/memory` muestra `CLAUDE.md` cargado.
   - `/hooks` muestra los 3 hooks.
   - `/permissions` muestra las reglas de allow/ask/deny.
   - `/agents` o pregunta "¿qué subagentes tienes?" para ver los 6.
   - Escribe `/` y verás las skills `new-feature`, `new-usecase`, etc.

## 3. Reglas de ESLint que hacen cumplir la arquitectura

El hook `format-and-lint.sh` corre ESLint en cada edición. Con estas reglas, si Claude rompe una
frontera entre capas, recibe el error al instante y lo corrige solo:

```js
// eslint.config.js (fragmento, ESLint 9 flat config)
const otherFeatureInternals = {
  group: ['@/features/*/*'],
  message: 'Importa otra feature solo por su index.ts (@/features/<nombre>). Dentro de la misma feature usa rutas relativas.',
};

export default [
  // ...tu configuración base (expo, typescript, prettier)
  {
    files: ['src/features/*/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [
        { group: ['react', 'react-native', 'expo-*', '@supabase/*', 'drizzle-orm', 'drizzle-orm/*'],
          message: 'domain debe ser TypeScript puro.' },
        { group: ['../data/*', '../../data/*', '../presentation/*', '../../presentation/*'],
          message: 'domain no depende de data ni de presentation.' },
        otherFeatureInternals,
      ] }],
    },
  },
  {
    files: ['src/features/*/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [
        { group: ['@supabase/*', 'expo-sqlite', 'drizzle-orm', 'drizzle-orm/*', '../data/*', '../../data/*'],
          message: 'presentation usa use cases inyectados, no datos directos.' },
        otherFeatureInternals,
      ] }],
    },
  },
  {
    files: ['src/features/*/data/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [
        { group: ['../presentation/*', '../../presentation/*'], message: 'data no conoce la UI.' },
        otherFeatureInternals,
      ] }],
    },
  },
];
```

## 4. Cómo trabajar con Claude Code en este proyecto

**Flujo recomendado para cada historia de usuario:**

1. **Plan primero.** Presiona `Shift+Tab` hasta "plan mode" y pide:
   > Lee docs/USER_STORIES.md (historia "Temario del nivel") y docs/ARCHITECTURE.md. Propón un plan para implementarla en la feature learning.

   Revisa el plan, corrígelo y solo entonces deja que escriba código.
2. **Implementa por capas**, de adentro hacia afuera: dominio + tests → datos → UI.
   > Implementa el plan. Empieza por domain y sus pruebas con el subagente test-writer.
3. **Delega a especialistas** cuando el tema lo pida:
   > Usa el subagente sqlite-expert para la consulta de progreso por nivel.
   > Usa el subagente rn-ui-builder para la pantalla SyllabusMap; el diseño está en docs/design/menu-inicio-niveles.png.
4. **Revisa y cierra** con `/pre-commit-check`.
5. **Limpia el contexto** con `/clear` al cambiar de historia. Así cada tarea empieza sin ruido de la anterior.

**Ejemplos de prompts útiles:**

| Quiero… | Escribe |
| --- | --- |
| Crear la feature de ranking | `/new-feature leaderboard Ranking online con podio y "Tu posición"` |
| Agregar una acción de negocio | `/new-usecase exams SubmitExam califica, guarda intento y otorga 100 XP si aprueba` |
| Nuevo formato de pregunta | `/add-question-type t_account_drag arrastrar montos al DEBE o HABER` |
| Función en Supabase | `/new-rpc get_leaderboard top 50 con XP, racha y nivel, más la posición del usuario` |
| Contenido del curso | `Usa content-author para escribir el tema 5 "Balanza de comprobación" del nivel Básico con 4 subtemas` |
| Revisar seguridad del backend | `Usa supabase-expert para revisar permisos de todas las funciones en supabase/migrations` |
| Construir desde una captura | `Construye ExamSessionScreen igual a docs/design/examen-pregunta.png` |

**Buenas prácticas:**

- Sé específico: menciona la feature, el archivo y el criterio de aceptación de la historia.
- Si Claude repite un error, agrega la regla a `CLAUDE.md` (o pídele "agrega esto a CLAUDE.md").
- Mantén `CLAUDE.md` corto: lo detallado va en `docs/` o en una skill, que solo se carga cuando se usa.
- `npm run start` no lo ejecutes desde Claude (se queda corriendo). Tenlo abierto en otra terminal con Expo Go.
- Las acciones que tocan Supabase remoto (`db push`, `functions deploy`, `secrets`) siempre piden tu confirmación.

## 5. Configuración personal opcional

En `~/.claude/settings.json` (solo tu máquina, no se sube a git) puedes poner preferencias propias,
por ejemplo un sonido o notificación del sistema cuando Claude termina, o tu modelo preferido.
Lo del equipo vive en `.claude/settings.json`; lo personal del proyecto en `.claude/settings.local.json`.

## Referencias

- Subagentes: https://code.claude.com/docs/en/sub-agents
- Skills: https://code.claude.com/docs/en/skills
- Hooks: https://docs.claude.com/en/docs/claude-code/hooks
- Permisos y settings: https://code.claude.com/docs/en/settings
- MCP de Supabase: https://supabase.com/docs/guides/getting-started/mcp
