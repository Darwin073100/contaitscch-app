# CONTAITSCCH — Plan de refactorización v2 (cambios del cliente)

Fecha: 10 de noviembre de 2026 · Rama base: `development` · Rama de trabajo sugerida: `refactor/cliente-v2`

Fuente de los cambios: `spec/contaitscch-refactor/index.html` (prototipo funcional), `supabase-schema.sql`
(esquema de referencia del cliente) y `assets/` (logo + 24 infografías).

Revisión 2: incorpora las decisiones confirmadas (§1). Cambio principal frente a la revisión 1: **se guarda el
estado del avance por tema, no un historial de intentos**, y la app muestra si el avance está sincronizado.

---

## 0. Resumen ejecutivo

| Antes (v1)                                             | Ahora (v2, cliente)                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 3 niveles (Básico, Intermedio, Avanzado)               | **6 niveles × 4 temas = 24 temas**                                                                                     |
| Tema = N subtemas con bloques; se "completa" al leerlo | Tema = **4 pasos fijos** (Objetivo + infografía → Explicación → Ejemplo resuelto → Repaso) + **ejercicio**             |
| Examen por nivel (desbloquea el siguiente nivel)       | **Ejercicio de 2 preguntas por tema** (aprobar = 2/2) + **un examen integrador final** (10 preguntas, 8/10)            |
| Opción múltiple y complementarias                      | **Solo opción múltiple**                                                                                               |
| Desbloqueo: nivel N con examen N-1 aprobado            | Desbloqueo **secuencial global**: el tema i se abre al aprobar el ejercicio del tema i-1                               |
| XP (+5 tema, +100 examen), racha diaria, vidas         | **Eliminados**. Métricas: temas aprobados, niveles completados, estado del examen final                                |
| Nube: libro append-only de XP y días activos           | Nube: **estado del avance** por tema y del examen final (aprobado, mejor puntaje, intentos), fusionado entre teléfonos |
| Ranking por XP                                         | Ranking por **niveles completados**, desempate por **temas aprobados** (`dense_rank`)                                  |
| Sin indicador de sincronización                        | **Indicador visible**: sincronizado / pendiente / sincronizando / sin conexión / error, con "hace X"                   |
| Paleta oscura (verde neón `#00E676`, azul noche)       | Paleta **navy `#0f2a44` + verde azulado `#0e7c7b` + ámbar `#f2a900`**, **modo claro y oscuro**                         |
| 4 pestañas: Aprender, Niveles, Ranking, Ajustes        | **5 pestañas: Niveles, Aprender, Glosario, Ranking, Perfil**                                                           |
| —                                                      | Nuevo: **glosario** (33 términos), **tips** en inicio, **reiniciar mi avance**, nunca revelar la respuesta correcta    |

Lo que **no** cambia: arquitectura por features + Clean Architecture, offline-first con SQLite como fuente
de verdad, autenticación propia por RPC, ids inmutables.

---

## 1. Decisiones

| #   | Decisión                | Estado         | Resultado                                                                                                                                                                                                                                          |
| --- | ----------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Autenticación           | **Confirmada** | Se queda la auth propia por RPC (`register`, `login`, `verify_email`, `api_token`). No se usa Supabase Auth ni `.from()`; el modelo del cliente se traduce a RPC                                                                                   |
| D2  | Qué se guarda           | **Confirmada** | **Estado del avance**, no intentos: una fila por usuario y ejercicio con `passed`, `best_score`, `attempts`, `passed_at`. Otro teléfono que inicie sesión continúa desde el último avance sincronizado. La app muestra el estado de sincronización |
| D3  | Examen final en la nube | Asumida        | Sí, en la misma tabla de avance (`quiz_id = 900`); si no, se perdería al cambiar de teléfono. No afecta el ranking                                                                                                                                 |
| D4  | Momento de sincronizar  | **Confirmada** | Se sube el **avance** (no intentos) al terminar cada ejercicio o examen si hay red, sin bloquear la pantalla. También al abrir la app, al entrar a Ranking, al iniciar sesión y con "Sincronizar ahora" en Perfil                                  |
| D5  | Modo claro/oscuro       | Asumida        | Ambos, sigue al sistema (`userInterfaceStyle: "automatic"`)                                                                                                                                                                                        |
| D6  | "Reiniciar mi avance"   | Asumida        | Requiere conexión: borra en Supabase y luego en SQLite, y sube la "generación" del avance para que otro teléfono no lo resucite (§5.3)                                                                                                             |
| D7  | Tipos de pregunta       | **Confirmada** | **Solo opción múltiple**. Se elimina la columna `type`, las complementarias, el `QuestionTypeRegistry` y la skill `add-question-type`                                                                                                              |
| D8  | Ids de tema             | Asumida        | Numéricos (`101`…`604`); el código `N1-L1` se deriva donde haga falta                                                                                                                                                                              |
| —   | Datos existentes        | **Confirmada** | No hay usuarios en producción: las migraciones pueden borrar el avance de desarrollo                                                                                                                                                               |

---

## 2. Reglas de negocio nuevas (reemplazan las de `CLAUDE.md`)

1. **Avance de un ejercicio** (`quiz_progress`): por usuario y ejercicio se guarda `passed`, `best_score`, `attempts`,
   `passed_at`. Cada vez que se termina un ejercicio: `attempts + 1`, `best_score = max`, `passed = passed OR aprobó`,
   `passed_at` = la primera vez que aprobó. **Aprobar nunca se deshace** (salvo "Reiniciar mi avance").
2. **Aprobar**: `aciertos >= pass_mark`. Ejercicio de tema: `pass_mark` = número de preguntas (2/2). Examen final: 8 de 10.
3. **Tema desbloqueado**: es el primero del curso, o el tema anterior **en el orden global** (N1-L1 … N6-L4) está
   aprobado. Cruza niveles: N2-L1 se abre al aprobar N1-L4.
4. **Tema "por aprobar" (retry)**: `attempts > 0` y `passed = false`. Se muestra en rojo y se vuelve a tomar la lección.
5. **Nivel completado**: sus 4 temas aprobados. **Nivel desbloqueado**: su primer tema está desbloqueado.
   **Nivel actual**: el del primer tema no aprobado (si todos están aprobados, el último).
6. **Examen integrador**: disponible con los 24 temas aprobados; estado `Bloqueado | Disponible | Por aprobar | Aprobado`.
7. **Ranking**: `niveles_completados DESC, temas_aprobados DESC`, `dense_rank`. Solo perfiles con correo verificado. Nunca
   expone correos.
8. **Nunca se revela la opción correcta**: al comprobar solo se marca si la elegida fue correcta. El `feedback` solo
   aparece al acertar. En el examen no hay retroalimentación.
9. **Fusión entre teléfonos** (misma regla en la app y en Postgres): `passed = a OR b`, `best_score = max`,
   `attempts = max`, `passed_at = la más antigua`, `updated_at = la más reciente`. Es conmutativa e idempotente: subir
   dos veces o en distinto orden da el mismo resultado y nunca se pierde un tema aprobado. `attempts` es el mayor visto
   en un teléfono, no la suma (aceptado: solo se muestra como "Intento N").
10. **Pendiente de sincronizar**: una fila local cuyo `synced_at` es `NULL` o distinto de su `updated_at`.
11. **Calculado, no guardado**: desbloqueo, nivel actual, niveles completados, progreso del curso y posición.
12. Se eliminan: XP, racha, `daily_activity`, `xp_event`, vidas, examen por nivel y la regla "append-only".

---

## 3. Contenido del curso (JSON)

### 3.1 Archivos

```text
src/core/database/seed/content/
├── manifest.json        { "version": 3, "levels": ["nivel-1.json", …, "nivel-6.json"],
│                          "finalExam": "examen-final.json", "glossary": "glosario.json" }
├── nivel-1.json … nivel-6.json
├── examen-final.json
└── glosario.json
```

Se borran `basico.json`, `intermedio.json`, `avanzado.json`. `manifest.version` sube a **3** (fuerza la resiembra).

### 3.2 Forma de un nivel

```json
{
  "level": {
    "id": 1,
    "title": "Fundamentos: qué es la contabilidad y para qué sirve",
    "goal": "Al terminar este nivel el alumno explica con sus palabras qué es la contabilidad…"
  },
  "topics": [
    {
      "id": 101,
      "sortOrder": 1,
      "title": "¿Qué es la contabilidad?",
      "objective": "Definir la contabilidad y explicar por qué se le llama el lenguaje de los negocios.",
      "explanation": [
        "La contabilidad es la técnica que…",
        "Por eso se dice…",
        "Para que ese lenguaje…"
      ],
      "example": { "title": "La papelería de Ana", "steps": ["Lunes: Ana compra…", "…"] },
      "keyIdea": "Contabilidad = registrar + clasificar + resumir + interpretar…",
      "commonError": "Confundir contabilidad con solo guardar facturas…",
      "activity": "Durante un día, anota…",
      "quiz": {
        "questions": [
          {
            "id": 10101,
            "sortOrder": 1,
            "statement": "¿Qué hace la contabilidad con las operaciones de un negocio?",
            "options": [
              { "id": 101011, "text": "Las guarda en una caja sin orden", "isCorrect": false },
              {
                "id": 101012,
                "text": "Las registra, clasifica, resume e interpreta en términos de dinero",
                "isCorrect": true
              },
              { "id": 101013, "text": "Las publica en redes sociales", "isCorrect": false },
              { "id": 101014, "text": "Las convierte en publicidad", "isCorrect": false }
            ],
            "feedback": "La contabilidad trabaja en cuatro pasos: registrar, clasificar, resumir e interpretar."
          }
        ]
      }
    }
  ]
}
```

Sin campo `type`: todas las preguntas son de opción múltiple (D7).
`examen-final.json`: `{ "id": 900, "passMark": 8, "questions": [ …10 preguntas sin feedback… ] }`.
`glosario.json`: `[{ "term": "Activo", "definition": "Bienes y derechos que posee un negocio." }, …]`.

### 3.3 Ids inmutables

| Entidad                    | Regla                             | Ejemplo          |
| -------------------------- | --------------------------------- | ---------------- |
| Nivel                      | `1..6`                            | `2`              |
| Tema                       | `nivel×100 + orden`               | N2-L3 → `203`    |
| Ejercicio de tema (`quiz`) | `= id del tema`                   | `203`            |
| Examen final (`quiz`)      | `900` (constante `FINAL_EXAM_ID`) | `900`            |
| Pregunta                   | `quiz×100 + orden`                | `20302`, `90010` |
| Opción                     | `pregunta×10 + orden`             | `203024`         |
| Término del glosario       | llave natural `term`              | `"Activo"`       |

Supabase guarda `quiz_id`: cambiar un id existente corrompe el avance de los usuarios.

### 3.4 Validación Zod (`contentSchema.ts`, reescrito)

- 6 niveles con ids `1..6`; cada nivel con **exactamente 4 temas** (Postgres valida `quiz_id % 100 between 1 and 4` y el
  ranking cuenta 4 por nivel); ids según §3.3.
- Pregunta: 2–4 opciones, **exactamente una correcta**, ids de opción únicos.
- Ejercicio de tema: ≥ 1 pregunta; `passMark` opcional (por omisión = número de preguntas).
- Examen final: `id = 900`, `1 <= passMark <= questions.length`.
- Glosario: términos únicos sin distinguir mayúsculas ni acentos.
- `validateCourse`: unicidad global de ids de pregunta y opción.

### 3.5 Importación del contenido (una sola vez)

`scripts/import-prototype-content.ts` (con `tsx`): lee la constante `CONTENT` de `spec/contaitscch-refactor/index.html`,
asigna ids, convierte `correct: <índice>` en `isCorrect` y escribe los 8 JSON; luego `npm run content:validate`. Evita
copiar a mano 24 lecciones, 58 preguntas y 33 términos. Los **18 tips** del inicio van a
`src/features/home/presentation/content/tips.ts` (mismo criterio que `onboarding/.../aboutContent.ts`).

### 3.6 Imágenes

- `assets/n{N}l{L}.webp` → `assets/images/lessons/` (≈1.6 MB); `logo.webp` y `logo-icon.webp` → `assets/images/`.
  Ícono y splash de `app.json`: exportar PNG 1024×1024 desde `logo-icon.webp`.
- `src/features/learning/presentation/content/lessonImages.ts`: mapa estático `Record<topicId, require(...)>`. Un test
  verifica que hay imagen para los 24 temas.

---

## 4. Base de datos local (SQLite + Drizzle)

### 4.1 Cambios por tabla

| Tabla                           | Acción          | Motivo                                                                                          |
| ------------------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| `user`                          | **Se queda**    | Sin cambios                                                                                     |
| `content_meta`                  | **Se queda**    | Se vacía en la migración para forzar la resiembra                                               |
| `level`                         | **Se recrea**   | Quedan `id, sort_order, title, goal`                                                            |
| `topic`                         | **Se recrea**   | Agrega `objective` y `content` (JSON: explicación, ejemplo, idea clave, error común, actividad) |
| `subtopic`, `subtopic_progress` | **Se eliminan** | Los 4 pasos son fijos (presentación); el tema siempre abre en el paso 1                         |
| `topic_progress`                | **Se elimina**  | Lo reemplaza `quiz_progress`                                                                    |
| `exam`, `exam_attempt`          | **Se eliminan** | Lo reemplazan `quiz` y `quiz_progress`                                                          |
| `question`                      | **Se recrea**   | `exam_id` → `quiz_id`; sin `type`                                                               |
| `question_option`               | **Se recrea**   | Agrega `sort_order` (letras A–D estables)                                                       |
| `xp_event`, `daily_activity`    | **Se eliminan** | Sin XP ni racha                                                                                 |
| `quiz`                          | **Nueva**       | 24 ejercicios de tema + examen final                                                            |
| `quiz_progress`                 | **Nueva**       | Estado del avance por ejercicio; es también la cola de lo pendiente por subir                   |
| `sync_state`                    | **Nueva**       | Última sincronización, último error y generación del avance (para el indicador y el reinicio)   |
| `glossary_term`                 | **Nueva**       | Glosario sembrado desde JSON                                                                    |
| `leaderboard_cache`             | **Nueva**       | Último ranking para mostrar sin red                                                             |

### 4.2 Esquema destino (SQL equivalente a lo que debe generar Drizzle)

```sql
CREATE TABLE level (
  id          INTEGER PRIMARY KEY,                 -- 1..6
  sort_order  INTEGER NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  goal        TEXT    NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE topic (
  id          INTEGER PRIMARY KEY,                 -- nivel×100 + orden
  level_id    INTEGER NOT NULL REFERENCES level(id),
  sort_order  INTEGER NOT NULL,                    -- 1..4
  title       TEXT    NOT NULL,
  objective   TEXT    NOT NULL,
  content     TEXT    NOT NULL,                    -- JSON {explanation[], example{title,steps[]}, keyIdea, commonError, activity}
  created_at  …, updated_at …,
  UNIQUE (level_id, sort_order)
);

CREATE TABLE quiz (
  id          INTEGER PRIMARY KEY,                 -- = topic.id, o 900 (examen final)
  kind        TEXT    NOT NULL CHECK (kind IN ('topic','final')),
  topic_id    INTEGER UNIQUE REFERENCES topic(id),
  pass_mark   INTEGER NOT NULL CHECK (pass_mark > 0),
  created_at  …, updated_at …,
  CHECK ((kind = 'topic') = (topic_id IS NOT NULL))
);

CREATE TABLE question (
  id          INTEGER PRIMARY KEY,                 -- quiz×100 + orden
  quiz_id     INTEGER NOT NULL REFERENCES quiz(id),
  sort_order  INTEGER NOT NULL,
  statement   TEXT    NOT NULL,
  feedback    TEXT,
  created_at  …, updated_at …,
  UNIQUE (quiz_id, sort_order)
);

CREATE TABLE question_option (
  id          INTEGER PRIMARY KEY,                 -- pregunta×10 + orden
  question_id INTEGER NOT NULL REFERENCES question(id),
  sort_order  INTEGER NOT NULL,
  text        TEXT    NOT NULL,
  is_correct  INTEGER NOT NULL DEFAULT 0,
  created_at  …, updated_at …,
  UNIQUE (question_id, sort_order)
);

-- Estado del avance por ejercicio. Se actualiza con la regla de fusión (§2.9).
CREATE TABLE quiz_progress (
  user_id     TEXT    NOT NULL REFERENCES user(id),
  quiz_id     INTEGER NOT NULL REFERENCES quiz(id),
  passed      INTEGER NOT NULL DEFAULT 0,
  best_score  INTEGER NOT NULL DEFAULT 0 CHECK (best_score >= 0),
  attempts    INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  passed_at   TEXT,                                -- primera vez que aprobó
  synced_at   TEXT,                                -- = updated_at cuando la nube ya tiene esta versión
  created_at  …,
  updated_at  TEXT NOT NULL,                       -- Clock.nowIso() en cada cambio
  PRIMARY KEY (user_id, quiz_id),
  CHECK (passed = 0 OR (passed_at IS NOT NULL AND attempts > 0))
);
CREATE INDEX quiz_progress_pending_idx ON quiz_progress (user_id)
  WHERE synced_at IS NULL OR synced_at <> updated_at;

-- Una fila por usuario: lo que pinta el indicador de sincronización.
CREATE TABLE sync_state (
  user_id         TEXT PRIMARY KEY REFERENCES user(id),
  generation      INTEGER,                         -- generación del avance en la nube (NULL = nunca sincronizado)
  last_synced_at  TEXT,
  last_error      TEXT,                            -- 'offline' | 'network' | 'invalid_token' | NULL
  created_at …, updated_at …
);

CREATE TABLE glossary_term (
  term        TEXT PRIMARY KEY,
  definition  TEXT NOT NULL,
  created_at …, updated_at …
);

CREATE TABLE leaderboard_cache (
  user_id     TEXT PRIMARY KEY REFERENCES user(id),
  payload     TEXT NOT NULL,                       -- JSON de get_ranking
  fetched_at  TEXT NOT NULL,
  created_at …, updated_at …
);
```

Por qué `synced_at = updated_at` y no un booleano: si el alumno termina otro ejercicio mientras la subida va en camino,
al marcar solo se toca la fila cuyo `updated_at` sigue siendo el que se envió
(`UPDATE … SET synced_at = :sent WHERE … AND updated_at = :sent`); el cambio nuevo queda pendiente y no se pierde.

### 4.3 Consultas base (`learning/data/queries/progressSql.ts`, reescrito)

```sql
-- Estado de cada tema en orden global (alimenta ruta, niveles, inicio y perfil)
SELECT t.id, t.level_id, t.sort_order, t.title,
       COALESCE(p.passed, 0)     AS passed,
       COALESCE(p.attempts, 0)   AS attempts,
       COALESCE(p.best_score, 0) AS best_score
FROM topic t
JOIN level l ON l.id = t.level_id
JOIN quiz q  ON q.topic_id = t.id
LEFT JOIN quiz_progress p ON p.quiz_id = q.id AND p.user_id = :userId
ORDER BY l.sort_order, t.sort_order;

-- Examen final
SELECT passed, attempts, best_score FROM quiz_progress WHERE user_id = :userId AND quiz_id = 900;

-- Indicador: cuántos cambios faltan por subir
SELECT COUNT(*) FROM quiz_progress
WHERE user_id = :userId AND (synced_at IS NULL OR synced_at <> updated_at);
```

Desbloqueo, nivel actual, nivel completado y examen disponible los calcula una policy pura (§6.2).

### 4.4 Migración `0002_cliente_v2`

1. Esquema Drizzle: borrar `dailyActivity.ts`, `xpEvent.ts`, `exam.ts`, `examAttempt.ts`, `subtopic.ts`,
   `subtopicProgress.ts`, `topicProgress.ts`; reescribir `level.ts`, `topic.ts`, `question.ts`, `questionOption.ts`;
   crear `quiz.ts`, `quizProgress.ts`, `syncState.ts`, `glossaryTerm.ts`, `leaderboardCache.ts`; actualizar `index.ts`.
2. `npm run db:generate` y **revisar a mano** el SQL. drizzle-kit recrea tablas copiando filas, lo que falla con columnas
   `NOT NULL` nuevas. Como el contenido se resiembra y el avance de desarrollo se puede perder, el archivo debe:
   - Borrar hijas antes que padres (con `PRAGMA foreign_keys = ON` un `DROP` de una tabla referenciada falla):
     `question_option → question → exam_attempt → exam → xp_event → daily_activity → subtopic_progress → subtopic →
topic_progress → topic → level`.
   - Crear las tablas nuevas.
   - `DELETE FROM content_meta;` para que `ContentSeeder` vuelva a sembrar.
3. `migrate.test.ts`: lista de tablas esperadas. No se tocan `0000_init` ni `0001_level_texts`.

### 4.5 `ContentSeeder`

Siembra `level`, `topic`, `quiz` (24 + 1), `question`, `question_option` (reemplazo completo por pregunta) y
`glossary_term` (reemplazo completo). `loadCourse.ts` carga niveles + examen + glosario y corre `validateCourse`.
Pruebas: idempotente, resiembra al subir versión, nunca toca `quiz_progress` ni `sync_state`.

---

## 5. Supabase (PostgreSQL)

### 5.1 Antes → después

| Objeto                                                                              | Acción                                                                                       |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `profile`                                                                           | Se queda. Se elimina `timezone`; se agrega `progress_generation integer not null default 0`  |
| `email_verification`, `private.app_secret`, `private.is_owner`                      | Sin cambios                                                                                  |
| `register`, `get_login_params`, `login`, `create_verification_code`, `verify_email` | Sin cambios                                                                                  |
| `xp_event`, `daily_activity`                                                        | **Se eliminan**                                                                              |
| `quiz_progress`                                                                     | **Nueva**: estado del avance (equivale a `lesson_progress` del cliente, más el examen final) |
| `private.ranking`                                                                   | **Nueva vista** con la regla del cliente                                                     |
| `sync_progress`, `get_ranking`, `reset_progress`                                    | **Nuevas RPC**                                                                               |

### 5.2 Migraciones nuevas

**`supabase/migrations/20261110000100_remove_gamification.sql`**

```sql
drop table if exists public.xp_event;
drop table if exists public.daily_activity;
alter table public.profile drop column if exists timezone;
alter table public.profile add column progress_generation integer not null default 0;

comment on table public.profile is
  'Un participante. Temas aprobados, niveles completados y posición se calculan desde quiz_progress.';
comment on column public.profile.progress_generation is
  'Sube en cada "Reiniciar mi avance": un teléfono con una generación vieja no puede volver a subir el avance borrado.';
```

**`supabase/migrations/20261110000200_quiz_progress.sql`**

```sql
-- Avance por alumno y ejercicio. quiz_id = id del tema (101..604) o 900 (examen integrador).
-- Solo se escribe con sync_progress, que fusiona: nunca se pierde un tema aprobado.
create table public.quiz_progress (
  user_id     uuid        not null references public.profile (id) on delete cascade,
  quiz_id     smallint    not null,
  passed      boolean     not null default false,
  best_score  smallint    not null default 0,
  attempts    integer     not null default 0,
  passed_at   timestamptz,
  updated_at  timestamptz not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, quiz_id),
  constraint quiz_progress_quiz_id check (
    quiz_id = 900 or (quiz_id / 100 between 1 and 6 and quiz_id % 100 between 1 and 4)
  ),
  constraint quiz_progress_counts check (best_score between 0 and 20 and attempts >= 0),
  constraint quiz_progress_passed check (not passed or (passed_at is not null and attempts > 0))
);

alter table public.quiz_progress enable row level security;
revoke all on public.quiz_progress from anon, authenticated;
```

**`supabase/migrations/20261110000300_ranking_view.sql`**

```sql
-- Más niveles completados primero; si empatan, más temas aprobados. Un nivel cuenta como
-- completado con sus 4 temas aprobados. Vive en private: solo la lee get_ranking. Nunca expone correos.
create view private.ranking as
with por_nivel as (
  select user_id, quiz_id / 100 as level_num, count(*) filter (where passed) as aprobados
  from public.quiz_progress
  where quiz_id <> 900
  group by user_id, quiz_id / 100
), totales as (
  select p.id as user_id, p.first_name, p.last_name, p.city, p.state, p.country,
         coalesce(sum(n.aprobados), 0)::int           as topics_passed,
         count(*) filter (where n.aprobados = 4)::int as levels_completed
  from public.profile p
  left join por_nivel n on n.user_id = p.id
  where p.email_verified
  group by p.id
)
select dense_rank() over (order by levels_completed desc, topics_passed desc)::int as position, t.*
from totales t;
```

**`supabase/migrations/20261110000400_progress_rpc.sql`** — todas `security definer`, `set search_path = ''`, validan
`private.is_owner`, responden `{ "status": … }` sin lanzar excepciones, `revoke` de `public, anon, authenticated` y
`grant execute … to anon` (mismo patrón que `register`/`login`).

| RPC                                                                     | Entrada                                                                                                                                                        | Respuesta                                                                                                                                                                 |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sync_progress(p_user_id, p_token, p_generation int, p_progress jsonb)` | Filas locales pendientes `[{quiz_id, passed, best_score, attempts, passed_at, updated_at}]` (máx. 25); `p_generation` NULL en un teléfono que nunca sincronizó | `{status: ok, generation, synced_at, progress: [todas las filas del usuario en la nube]}` · `{status: replace, generation, progress}` · `invalid_token` · `invalid_input` |
| `get_ranking(p_user_id, p_token, p_limit int default 100)`              | —                                                                                                                                                              | `{status: ok, total, entries: [{position, first_name, last_name, city, state, country, levels_completed, topics_passed, is_me}], me}` · `invalid_token`                   |
| `reset_progress(p_user_id, p_token)`                                    | —                                                                                                                                                              | `{status: ok, generation}` · `invalid_token`                                                                                                                              |

`sync_progress` es **una sola llamada de ida y vuelta**: sube lo pendiente, fusiona y devuelve el avance completo del
usuario. Así sirve para todo: subir, restaurar al iniciar sesión (con arreglo vacío) y traer lo que avanzó otro teléfono.

```sql
create function public.sync_progress(p_user_id uuid, p_token uuid, p_generation integer, p_progress jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_generation integer;
  v_rows       jsonb;
begin
  if not private.is_owner(p_user_id, p_token) then
    return jsonb_build_object('status', 'invalid_token');
  end if;

  select progress_generation into v_generation from public.profile where id = p_user_id for update;

  -- Teléfono nuevo o con avance de antes de un reinicio: no se sube nada, se reemplaza lo local
  if p_generation is distinct from v_generation then
    select coalesce(jsonb_agg(to_jsonb(q) - 'user_id' - 'created_at'), '[]') into v_rows
      from public.quiz_progress q where q.user_id = p_user_id;
    return jsonb_build_object('status', 'replace', 'generation', v_generation, 'progress', v_rows);
  end if;

  if jsonb_typeof(p_progress) is distinct from 'array' or jsonb_array_length(p_progress) > 25 then
    return jsonb_build_object('status', 'invalid_input');
  end if;

  begin
    insert into public.quiz_progress as cur (user_id, quiz_id, passed, best_score, attempts, passed_at, updated_at)
    select p_user_id, (r ->> 'quiz_id')::smallint, (r ->> 'passed')::boolean, (r ->> 'best_score')::smallint,
           (r ->> 'attempts')::integer, (r ->> 'passed_at')::timestamptz,
           least((r ->> 'updated_at')::timestamptz, now())     -- un reloj adelantado no gana para siempre
    from jsonb_array_elements(p_progress) r
    on conflict (user_id, quiz_id) do update set
      passed     = cur.passed or excluded.passed,
      best_score = greatest(cur.best_score, excluded.best_score),
      attempts   = greatest(cur.attempts, excluded.attempts),
      passed_at  = least(cur.passed_at, excluded.passed_at),   -- least() ignora NULL
      updated_at = greatest(cur.updated_at, excluded.updated_at);
  exception
    when check_violation or not_null_violation or unique_violation or invalid_text_representation
         or invalid_datetime_format or datetime_field_overflow or numeric_value_out_of_range then
      return jsonb_build_object('status', 'invalid_input');   -- el bloque deshace lo insertado
  end;

  select coalesce(jsonb_agg(to_jsonb(q) - 'user_id' - 'created_at'), '[]') into v_rows
    from public.quiz_progress q where q.user_id = p_user_id;
  return jsonb_build_object('status', 'ok', 'generation', v_generation, 'synced_at', now(), 'progress', v_rows);
end $$;
```

`unique_violation` cubre un lote con el mismo `quiz_id` dos veces (`on conflict` no puede tocar la misma fila dos veces
en un `insert`); la app nunca lo manda porque la llave local es la misma.

### 5.3 Reinicio de avance entre teléfonos (D6)

1. Teléfono A pide "Reiniciar mi avance" → `reset_progress` borra las filas y sube `progress_generation` (0 → 1).
2. A borra su `quiz_progress` local y guarda `generation = 1` en `sync_state`.
3. Teléfono B, que tenía `generation = 0` y avance viejo, sincroniza → recibe `replace`: borra su avance local, adopta
   lo de la nube (vacío) y `generation = 1`. Su avance viejo **no** se sube.

### 5.4 Pruebas pgTAP nuevas

- `supabase/tests/sync_progress.test.sql`: permisos (anon no lee `quiz_progress` ni `private`); fusión (aprobado nunca
  vuelve a `false`, `best_score`/`attempts` toman el mayor, `passed_at` el más antiguo); subir el mismo lote dos veces
  da el mismo resultado; orden distinto de dos teléfonos da el mismo resultado; `quiz_id` fuera de catálogo,
  `passed` sin `passed_at`, lote > 25 → `invalid_input` sin escribir nada; token ajeno → `invalid_token`; generación
  distinta o NULL → `replace` sin escribir; `updated_at` futuro se recorta a `now()`.
- `supabase/tests/ranking.test.sql`: orden niveles → temas, empates comparten posición, excluye correos no verificados,
  el examen final no cuenta como tema, `is_me`, `me` presente aunque quede fuera del límite, ningún campo `email`.
- `supabase/tests/reset_progress.test.sql`: borra solo lo del dueño, sube la generación, el ranking lo refleja.
- Revisar que `register/login/email_verification.test.sql` no dependan de `timezone`.

### 5.5 Despliegue

`npx supabase db reset` → `npx supabase test db` → `npx supabase db push` al proyecto de desarrollo (los datos de
`xp_event`/`daily_activity` se pierden; confirmado que es aceptable). El MCP de Supabase es solo lectura: sirve para
verificar después.

---

## 6. Sincronización y su indicador

### 6.1 Cuándo se sincroniza

| Disparador                                                 | Bloquea la pantalla            | Nota                                                                                                      |
| ---------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Al terminar un ejercicio o el examen (D4)                  | No                             | Primero se guarda en SQLite; la subida va en segundo plano                                                |
| Al abrir la app / volver a primer plano, si hay pendientes | No                             |                                                                                                           |
| Al iniciar sesión                                          | Sí (forma parte del login)     | `sync_progress` con arreglo vacío y `generation = NULL` → `replace` → el teléfono continúa donde se quedó |
| Al entrar a Ranking                                        | Sí (antes de pedir el ranking) | Así el alumno se ve con su avance real                                                                    |
| "Sincronizar ahora" en Perfil                              | Sí                             | Manual                                                                                                    |
| Al recuperar la conexión con pendientes                    | No                             | `@react-native-community/netinfo`                                                                         |

### 6.2 Flujo del `SyncEngine` (Facade, con candado para no correr dos veces en paralelo)

1. Sin red → `sync_state.last_error = 'offline'`, termina.
2. Lee las filas pendientes y la `generation` de `sync_state`.
3. `sync_progress(…)`.
4. `ok` → en `UnitOfWork`: fusiona las filas que devolvió la nube con las locales (misma función pura `mergeProgress`),
   marca `synced_at = updated_at` solo en las filas enviadas que no cambiaron, guarda `generation` y
   `last_synced_at`, limpia `last_error`.
5. `replace` → en `UnitOfWork`: reemplaza todo el `quiz_progress` local por lo de la nube (marcado como sincronizado) y
   guarda la nueva `generation`.
6. Error de red → `last_error = 'network'`, nada se marca; se reintenta en el siguiente disparador.
7. `invalid_token` → la sesión ya no es válida: cerrar sesión. `invalid_input` → registrar el error; no debería ocurrir
   porque la app valida con el mismo esquema Zod antes de enviar.
8. Publica `SyncStateChanged` y, si cambió el avance, `ProgressChanged` (refresca Niveles, Aprender y Perfil).

### 6.3 Indicador (D2)

Estado derivado de `sync_state` + conteo de pendientes + `ConnectivityService`:

| Estado    | Ícono                  | Texto                                               |
| --------- | ---------------------- | --------------------------------------------------- |
| `synced`  | `cloud_done` (accent)  | "Avance sincronizado · hace 5 min"                  |
| `pending` | `cloud_upload` (ámbar) | "3 cambios por sincronizar"                         |
| `syncing` | `sync` animado         | "Sincronizando…"                                    |
| `offline` | `cloud_off` (dim)      | "Sin conexión · tu avance se guarda en el teléfono" |
| `error`   | `error` (err)          | "No se pudo sincronizar · Reintentar"               |
| `never`   | `cloud_off`            | "Aún no se ha sincronizado"                         |

Dónde se ve: ícono pequeño en el topbar junto al avatar (toca → Perfil), tarjeta "Sincronización" en Perfil con
"Sincronizar ahora", y aviso en Ranking cuando se muestra el caché ("Actualizado hace X"). Estado de UI en un store de
Zustand (`useSyncStatusStore`) alimentado por `SyncStateChanged`.

---

## 7. Código: features y capas

### 7.1 Mapa de features

| Feature            | Acción                     | Contenido                                                                               |
| ------------------ | -------------------------- | --------------------------------------------------------------------------------------- |
| `gamification`     | **Eliminar completa**      | `StreakCalculator`, `XpRewardPolicy`, `GetUserStats`, `SqliteStatsRepository` y pruebas |
| `settings`         | **Renombrar → `profile`**  | Pestaña Perfil, reinicio de avance, sincronizar ahora                                   |
| `exams` (planeada) | **Reemplazar → `quizzes`** | Motor común de ejercicio y examen, solo opción múltiple                                 |
| `glossary`         | **Nueva**                  | Glosario con búsqueda                                                                   |
| `learning`         | Reescribir parcial         | Ruta por nivel, lección de 4 pasos, policy de progreso del curso                        |
| `levels`           | Reescribir parcial         | Tarjetas de nivel con la nueva regla                                                    |
| `home`             | Reescribir                 | Pestaña Niveles (inicio)                                                                |
| `leaderboard`      | Construir                  | Ranking con caché                                                                       |
| `auth`             | Ajustes                    | Pantalla de login, restaurar avance al iniciar sesión, textos sin XP/racha              |
| `onboarding`       | Ajustes                    | "Conoce CONTAITSCCH" con los textos nuevos                                              |

### 7.2 Dominio

**`learning/domain`**

- `entities/CourseProgress.ts`: `LessonRecord { topicId, levelId, order, title, passed, attempts, bestScore }`.
- `policies/CourseProgressPolicy.ts` (pura, reemplaza `TopicLockPolicy`): `isUnlocked(i)`, `lessonState(i)` →
  `done | current | retry | locked`, `nextLesson()`, `currentLevel()`, `levelState(levelId)`, `levelPassedCount()`,
  `passedCount()`, `isFinalExamUnlocked()`. Pruebas: cruce entre niveles, retry, todo/nada aprobado.
- `usecases/GetCourseProgressUseCase` (Niveles, Aprender, Perfil, barra "Tema actual").
- `usecases/GetLessonUseCase` (reemplaza `GetTopicSession`): contenido, `isRetake`, `requiredCorrect`, número de
  preguntas; `LESSON_LOCKED` si no está desbloqueado.
- Se borran `CompleteTopicUseCase` y `TopicProgressRepository.markCompleted`.

**`quizzes/domain`** (nueva)

- `entities/Quiz.ts`, `Question.ts`, `QuizProgress.ts`.
- `policies/mergeProgress.ts` (pura; la misma regla que el SQL de §5.2) y `policies/applyResult.ts`
  (`attempts + 1`, `best = max`, `passed ||= score >= passMark`, `passedAt` la primera vez). Pruebas de
  conmutatividad e idempotencia.
- `usecases/StartQuizUseCase(quizId)`: preguntas y opciones ordenadas; la opción correcta **no** sale a presentación
  (el VM llama `checkAnswer(questionId, optionId) → boolean`).
- `usecases/SubmitQuizUseCase({ quizId, answers })`: califica (`option.isCorrect`, sin registry), aplica el resultado
  a `quiz_progress` con `updated_at = Clock.nowIso()`, devuelve `passedNow`, `wasPassed`, `attemptNumber`,
  `levelJustCompleted`, `finalExamUnlocked`; publica `ProgressChanged` y dispara la sincronización en segundo plano.
- `usecases/GetFinalExamStatusUseCase` → `locked | available | pending | passed` + mejor resultado.
- Se elimina `QuestionTypeRegistry`/`QuestionGrader` (D7).

**`glossary/domain`**: `GetGlossaryUseCase(query)` — filtra en memoria sin mayúsculas ni acentos y agrupa por letra.

**`leaderboard/domain`**: `SyncAndFetchRankingUseCase` (sincroniza, luego `get_ranking`; sin red usa
`leaderboard_cache`), `podiumGap` (temas que faltan para el 3.er lugar).

**`profile/domain`**: `GetProfileUseCase`, `ResetProgressUseCase` (§5.3), `SyncNowUseCase`, `GetSyncStatusUseCase`.

**`auth/domain`**: `LoginUseCase` llama a la sincronización al final (restaura el avance). Quitar el comentario
pendiente sobre `xp_event`.

**`core/`**

- `core/sync/SyncEngine.ts` (§6.2) y `core/sync/SyncableSource.ts` (una sola fuente: `quiz_progress`).
- `core/network/ConnectivityService.ts` (netinfo).
- `core/events/DomainEventBus.ts`: `ProgressChanged`, `LevelCompleted`, `FinalExamPassed`, `ProgressReset`,
  `SyncStateChanged`.
- `Clock`: quitar la mención a la racha.

### 7.3 Datos

| Archivo                                                                                                 | Acción                                                             |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `learning/data/repositories/SqliteCourseProgressRepository.ts`                                          | Nuevo (§4.3)                                                       |
| `learning/data/repositories/SqliteLessonRepository.ts`                                                  | Reemplaza `SqliteTopicRepository` (parsea `topic.content` con Zod) |
| `learning/data/mappers/blocksMapper.ts`                                                                 | Se reemplaza por `lessonContentMapper.ts`                          |
| `levels/data/repositories/SqliteLevelRepository.ts`                                                     | Quita `xp_event`; lee el avance de `quiz_progress`                 |
| `quizzes/data/SqliteQuizRepository.ts`, `SqliteQuizProgressRepository.ts` (implementa `SyncableSource`) | Nuevos                                                             |
| `quizzes/data/SupabaseProgressRemoteDataSource.ts`                                                      | `sync_progress`, `reset_progress`                                  |
| `core/sync/SqliteSyncStateRepository.ts`                                                                | Nuevo                                                              |
| `leaderboard/data/SupabaseRankingRemoteDataSource.ts`, `SqliteLeaderboardCache.ts`                      | Nuevos                                                             |
| `glossary/data/SqliteGlossaryRepository.ts`                                                             | Nuevo                                                              |

---

## 8. Paleta y UI compartida

### 8.1 Tokens nuevos (`src/shared/theme/colors.js`)

| Token                                | Claro                                         | Oscuro                                        | Uso                                                  |
| ------------------------------------ | --------------------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `bg`                                 | `#f6f7f9`                                     | `#0b1520`                                     | Fondo                                                |
| `surface`                            | `#ffffff`                                     | `#122334`                                     | Tarjetas                                             |
| `surface-alt`                        | `#eef2f5`                                     | `#1a2f45`                                     | Pills, barras vacías, candados                       |
| `surface-sunk`                       | `#ffffff`                                     | `#0e1b2a`                                     | Inputs, casillas OTP                                 |
| `line`                               | `#dde3e9`                                     | `#24405a`                                     | Bordes                                               |
| `text`                               | `#1a1a1a`                                     | `#eef3f7`                                     | Texto                                                |
| `title`                              | `#0f2a44`                                     | `#eef3f7`                                     | Títulos                                              |
| `dim`                                | `#5b6b7a`                                     | `#9db0c0`                                     | Secundario                                           |
| `faint`                              | `#8d9aa6`                                     | `#6f879c`                                     | Placeholder, bloqueado                               |
| `accent` / `-ink` / `-rim` / `-soft` | `#0e7c7b` / `#fff` / `#095756` / `#7fd1d0`    | `#2ba8a7` / `#062423` / `#1b7372` / `#7fd1d0` | Avanzar, aprobado, progreso                          |
| `navy` / `-ink` / `-rim`             | `#0f2a44` / `#fff` / `#071a2c`                | `#0a1e33` / `#eef3f7` / `#06121f`             | Marca, topbar, tarjetas destacadas                   |
| `amber` / `-ink` / `-rim` / `-text`  | `#f2a900` / `#0f2a44` / `#b97f00` / `#8a5d00` | `#f2a900` / `#0b1520` / `#a87400` / `#f2c14e` | Tema actual, examen, podio, pendiente de sincronizar |
| `ok` / `-ink`                        | `#2e7d32` / `#fff`                            | `#66bb6a` / `#0b1520`                         | Respuesta correcta                                   |
| `err` / `-ink`                       | `#c62828` / `#fff`                            | `#ef5350` / `#0b1520`                         | Incorrecta, retry, error de sincronización           |
| `bronze`                             | `#a8581c`                                     | `#e39a62`                                     | 3.er lugar                                           |

Los `*-tint` del prototipo se escriben con opacidad de Tailwind (`bg-accent/10`). Se eliminan `primary`,
`primary-soft`, `card`, `border`, `info`, `streak`, `silver`, `muted`, `danger`, `white`. Mapeo:
`primary→accent`, `card→surface`, `border→line`, `streak→amber`, `muted→dim`, `danger→err`.

### 8.2 Claro/oscuro con NativeWind v4

- `colors.js` exporta `{ light: {…}, dark: {…} }`.
- `global.css` define variables como canales RGB y su versión oscura; `tailwind.config.js` mapea cada token a
  `rgb(var(--color-x) / <alpha-value>)`. **Verificar en la documentación de NativeWind v4 (Themes / CSS variables)**
  cómo se declara la variante oscura; alternativa: `vars()` en la raíz según `useColorScheme()`.
- `shared/theme/useThemeColors()` para lo que no usa `className`: `Icon`, SVG de la ruta, barra de pestañas, `StatusBar`.
- `app.json`: `userInterfaceStyle: "automatic"`, splash navy, ícono nuevo.

### 8.3 Componentes de `src/shared/ui`

| Componente                    | Cambio                                                                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                      | Variantes `primary`, `navy`, `amber`, `danger`, `ghost`, `disabled`; tamaños `md` (56) / `sm` (44) / `square`; borde inferior "rim" de 4 px que se reduce al presionar |
| `AppHeader`                   | Topbar navy: logo + nombre + eslogan ámbar + **indicador de sincronización** + avatar ámbar. Sin `streak`/`xp`                                                         |
| `StatPill`                    | **Eliminar**                                                                                                                                                           |
| `StatTile`                    | Ícono + valor + etiqueta                                                                                                                                               |
| `Badge` → `Chip`              | Tonos `neutral`, `accent`, `navy`                                                                                                                                      |
| `IconBox`                     | Tonos `accent`, `amber`, `navy`, `solid`, `locked`, `err`; tamaño `big`                                                                                                |
| `ProgressBar`                 | `accent` / `amber`, `thin`                                                                                                                                             |
| `Card`                        | `default`, `flat`, `navy`, `alt`, `callout-key`, `callout-warn`, `task`                                                                                                |
| `ChoiceCard` → `OptionButton` | Letra A–D + `idle`, `selected`, `right`, `wrong`, `faded`                                                                                                              |
| `Avatar`                      | `amber`, `neutral`, `me`                                                                                                                                               |
| `Icon`                        | Cambiar a **MaterialIcons** (equivalentes de Material Symbols del prototipo); comprobar cada nombre en el glyph map                                                    |
| Nuevos                        | `SyncIndicator`, `Topbar` con progreso, `FeedbackBanner`, `ResultSeal`, `PodiumCard`, `RankRow`, `LevelTabs`, `Lightbox`, `SearchField`, `MenuList`                    |

---

## 9. Navegación y pantallas

```text
RootNavigator (guard sin cambios: user_id + api_token + email_verified)
├── (auth)   registro (paso 1 datos · paso 2 verificación) · login (pantalla nueva)
└── (app)
    ├── (tabs)   Niveles · Aprender · Glosario · Ranking · Perfil
    ├── tema/[topicId]        4 pasos, pantalla completa
    ├── ejercicio/[topicId]   quiz del tema + resultado
    ├── examen                quiz final + resultado
    └── acerca-de             modal "Conoce CONTAITSCCH"
```

| Pantalla           | Feature           | Contenido según el prototipo                                                                                                                                                                                                               |
| ------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Niveles (inicio)   | `home` + `levels` | Saludo, 3 stats (temas aprobados, nivel actual, examen final), "Tu siguiente tema" / "Vuelve a tomar este tema", progreso del curso (x/24), 6 tarjetas de nivel, tarjeta del examen integrador, tip con "otra frase", "Conoce CONTAITSCCH" |
| Aprender           | `learning`        | Chips de nivel, tarjeta navy del nivel, ruta en zigzag (SVG), nodos `done/current/retry/locked` con burbuja, meta "Fin del Nivel N" o "Examen integrador final", barra fija "Tema actual · Estudiar/Retomar"                               |
| Tema               | `learning`        | "Nivel N · Tema M · Paso x de 4"; objetivo + infografía ampliable + "Cómo se aprueba"; explicación; caso práctico; idea clave / error común / actividad; aviso de "retomando"; "Ir al ejercicio"                                           |
| Ejercicio / Examen | `quizzes`         | "x de N", opciones A–D, "Comprobar", banner Correcto/Incorrecto sin revelar la correcta, "Siguiente pregunta"/"Ver resultado". Salir del ejercicio → paso 4 del tema; salir del examen → inicio                                            |
| Resultado          | `quizzes`         | Sello, aciertos · para aprobar · intento, "Nivel N aprobado / Se desbloqueó el Nivel N+1", siguiente tema / examen final / volver a tomar la lección / volver a la ruta                                                                    |
| Glosario           | `glossary`        | Buscador fijo, grupos por letra, estado vacío                                                                                                                                                                                              |
| Ranking            | `leaderboard`     | Podio top 3, regla, lista de participantes, fila propia resaltada, barra "#pos · X temas para el podio · Estudiar", aviso de caché sin red                                                                                                 |
| Perfil             | `profile`         | Tarjeta navy, **tarjeta de sincronización con "Sincronizar ahora"**, avance por nivel, estado del examen, menú (Conoce, Glosario, Reiniciar mi avance con confirmación, Cerrar sesión), nota de temas fiscales                             |
| Registro / Login   | `auth`            | Banda navy con logo, stepper, campos agrupados, país y estado (lista fija si es México), tira "6 niveles · 24 temas…". Sin el aviso "Versión de demostración: tu código es…" del prototipo. Al iniciar sesión: "Recuperando tu avance…"    |
| Conoce             | `onboarding`      | Hero navy, "¿Qué es?", "Cómo funciona", equipo y colaboradores                                                                                                                                                                             |

Cerrar sesión con cambios pendientes: avisar "Tienes N cambios sin sincronizar" y ofrecer sincronizar antes de salir.

---

## 10. Fases de ejecución

Rama `refactor/cliente-v2` desde `development`, **un commit por fase**, cada fase termina en verde
(`npm run typecheck && npm run lint && npm test`).

| Fase                       | Alcance                                                                                                                                    | Tamaño | Verificación                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------- |
| **F0**                     | Rama, copiar `assets/` a `assets/images/…`                                                                                                 | S      | —                                                                                                              |
| **F1** Quitar gamificación | Borrar `gamification`; quitar XP/racha/vidas de `home`, `learning`, `AppHeader`, `StatPill`, `aboutContent`, `RegisterHero` y pruebas      | M      | typecheck/lint/test                                                                                            |
| **F2** Contenido v3        | `contentSchema.ts`, script de importación, 8 JSON, `loadCourse`, `manifest.version = 3`, prueba de imágenes                                | M      | `npm run content:validate` + tests                                                                             |
| **F3** SQLite              | Esquema Drizzle, migración `0002` revisada a mano, `ContentSeeder`, helpers de BD de prueba, `migrate.test.ts`                             | L      | tests de seeder y migración                                                                                    |
| **F4** Dominio             | `CourseProgressPolicy`, `mergeProgress`/`applyResult`, repos de `learning`/`levels`/`quizzes`/`glossary`, `DomainEventBus`, `container.ts` | L      | tests de policies y use cases con repos en memoria + repos SQLite                                              |
| **F5** Supabase            | 4 migraciones, 3 RPC, 3 archivos pgTAP, `docs/database/postgres.dbml`                                                                      | M      | `npx supabase db reset && npx supabase test db`                                                                |
| **F6** Sincronización      | `SyncEngine`, `ConnectivityService`, `sync_state`, data source remoto, restaurar en login, reinicio, ranking + caché, store del indicador  | M      | tests con `RemoteClient` falso: `ok`, `replace`, sin red, error a media subida, cambio local durante la subida |
| **F7** Tema visual         | Tokens claro/oscuro, NativeWind con variables, `useThemeColors`, `Icon`, `shared/ui`, `app.json`                                           | L      | tests de `shared/ui` + `npx expo export --platform android`                                                    |
| **F8** Pantallas           | 5 pestañas, topbar con indicador, todas las pantallas de §9                                                                                | XL     | tests de VMs y pantallas (RNTL)                                                                                |
| **F9** Documentación       | Ver §11                                                                                                                                    | M      | —                                                                                                              |
| **F10** Cierre             | `architecture-reviewer`, prueba manual en dos teléfonos (claro y oscuro), `npx expo install --check`                                       | S      | checklist §12                                                                                                  |

F5 puede ir en paralelo a F3/F4. F7 puede empezar al terminar F1.

---

## 11. Documentación y herramientas a actualizar

- `CLAUDE.md`: reglas de negocio (§2), features, pestañas, convención de ids (§3.3), tokens de color, regla de
  sincronización (§6.1); quitar XP/racha, "append-only", `QuestionGrader`/`QuestionTypeRegistry` de los patrones.
- `docs/ARCHITECTURE.md`: reglas, contenido JSON, sincronización (`quiz_progress` + fusión + generación), estilos,
  navegación, features, patrones (sin Registry de preguntas) y observaciones que ya no aplican (#3, #5, #6, #8).
- `docs/database/sqlite.dbml` y `docs/database/postgres.dbml`: regenerar.
- `docs/USER_STORIES.md`: "Niveles" (6 niveles), "Examen de cada módulo" (ejercicio por tema + examen integrador,
  solo opción múltiple), "Usuarios" (niveles y temas en vez de XP y racha), nuevas historias "Glosario",
  "Reiniciar avance" y "Estado de sincronización". Validar con el cliente.
- `.claude/agents/content-author.md` (formato de lección), `sqlite-expert.md`, `supabase-expert.md`, `test-writer.md`;
  borrar `.claude/skills/add-question-type`; actualizar ejemplos de `new-rpc`.
- `.claude/hooks/validate-content.sh`: confirmar que valida los archivos nuevos.
- `supabase/README.md`: nuevas RPC.

---

## 12. Criterios de aceptación

- [ ] No queda referencia a XP, racha, vidas, `xp_event`, `daily_activity` ni preguntas complementarias.
- [ ] 6 niveles y 24 temas sembrados; las 24 infografías se ven y se amplían.
- [ ] Aprobar N1-L4 abre N2-L1 y marca el Nivel 1 como aprobado; reprobar deja el tema "Vuelve a tomarla".
- [ ] El ejercicio nunca muestra cuál era la opción correcta.
- [ ] El examen final solo aparece con 24/24 y se aprueba con 8/10.
- [ ] Sin red: todo el estudio funciona, el indicador muestra "Sin conexión" y luego "N cambios por sincronizar".
- [ ] Con red: al terminar un ejercicio el indicador pasa a "Sincronizado" sin bloquear la pantalla.
- [ ] Teléfono B inicia sesión y continúa exactamente donde quedó el avance sincronizado del teléfono A.
- [ ] Avanzar en A y en B sin red y luego sincronizar ambos: ningún tema aprobado se pierde.
- [ ] "Reiniciar mi avance" sin red muestra aviso; con red borra local y remoto, y B no resucita el avance viejo.
- [ ] Claro y oscuro siguen al sistema con contraste legible.
- [ ] `npm run typecheck && npm run lint && npm test`, `npm run content:validate`, `npx supabase test db` y
      `npx expo export --platform android` pasan.

---

## 13. Riesgos

| Riesgo                                                           | Mitigación                                                                                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Un cambio local mientras se sube queda marcado como sincronizado | Marcar solo filas cuyo `updated_at` siga siendo el enviado (§4.2)                                                    |
| Reloj del teléfono adelantado                                    | `updated_at` se recorta a `now()` en el servidor; la fusión no depende del reloj salvo para `updated_at`/`passed_at` |
| `attempts` no es la suma exacta entre teléfonos                  | Aceptado: se toma el mayor (§2.9); solo se usa para "Intento N"                                                      |
| Lote inválido bloquea la cola                                    | Validar con Zod antes de guardar; ante `invalid_input` registrar el error en `sync_state.last_error`                 |
| `PASS_RATIO = 1` con 2 preguntas es estricto                     | Regla del cliente; `pass_mark` está en datos                                                                         |
| Variables CSS de NativeWind en oscuro                            | Verificar en documentación antes de F7; alternativa `vars()`                                                         |
| Íconos de Material Symbols sin equivalente                       | Tabla de equivalencias en `Icon.tsx` con prueba                                                                      |
| Contenido fiscal (IVA 16 %, ISR)                                 | Nota en Perfil; revisión de un contador antes de uso oficial                                                         |
| Las respuestas viajan en el bundle                               | Aceptado desde v1 (proyecto escolar, funciona sin internet)                                                          |
