# 03 — Pestaña Niveles: menú de inicio y niveles (`home`, `levels`, `gamification`)

- **Estado:** maquetación implementada con datos de ejemplo (`Preview*Repository`). Pendiente: datos reales de SQLite, sesión y navegación (sección 9).
- **Fecha:** 1 de noviembre de 2026
- **Fuente:** `docs/design/menu-inicio-niveles.png`; historias "Menú de inicio" y "Niveles de contabilidad" de `docs/USER_STORIES.md`; `docs/ARCHITECTURE.md` ("Niveles → Home/LevelsList", reglas de negocio).
- **Depende de:** `spec/01_ui_components_spec.md` (kit `@/shared/ui`; receta de `LevelCard` en la sección 6). Sin cambios en `shared/ui`: todo se armó con componentes existentes.
- **Código:** `src/features/{home,levels,gamification}/`, ruta `src/app/(tabs)/niveles.tsx`, registro en `src/composition/container.ts`.

## 1. Objetivo y alcance

| Historia / criterio                                      | Cómo se cumple                                                                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Menú: mostrar el logotipo                                | `GreetingHeader` (`Logo verified`) y `AppHeader` (logo + marca).                                                     |
| Menú: opción para ir a los niveles                       | Sección "Niveles Formativos" con una `LevelCard` por nivel.                                                          |
| Menú: opción para ver participantes                      | Pestaña Ranking (barra inferior).                                                                                    |
| Menú: opción de configuraciones                          | Botón de perfil del `AppHeader` → pestaña Ajustes; también la pestaña Ajustes.                                       |
| Niveles: Básico, Intermedio y Avanzado                   | `GetLevelsOverviewUseCase` devuelve todos los niveles ordenados.                                                     |
| Niveles: no avanzar sin aprobar                          | `LevelUnlockPolicy`: el nivel N se abre al aprobar el examen N-1; el botón de un nivel bloqueado está deshabilitado. |
| Niveles: barra de progreso; completado si aprobó el test | `levelProgress`: completados / total, 100% con examen aprobado (estado `completed`).                                 |

Fuera del alcance: pantalla Acerca de (`onboarding`), abrir un nivel concreto en Aprender, datos reales.

## 2. Análisis de la captura

| #   | Elemento                                                                                                                    | Composición                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Logo, "CONTAITSCCH", píldoras 🔥 5 · ⚡ 1,250 · ♥ ∞, perfil                                                                 | `AppHeader streak xp onProfilePress` (vidas por defecto)                                         |
| 2   | Logo verificado + "PORTAL ACADÉMICO ITSSCH", "¡Hola, Contador! 👋", "Listo para tu lección de hoy"                          | `GreetingHeader` (home)                                                                          |
| 3   | 5 Racha · 1,250 XP · 🎓 Básico Nivel                                                                                        | `StatsCard` → `Card padding=sm` + 3 × `StatTile`                                                 |
| 4   | "Progreso de la Carrera", "Plan Semestral de Contaduría", 65%, barra, "Módulos completados: 12/18", "+150 XP hoy"           | `CareerProgressCard` → `IconBox primarySoft`, `AppText stat primary`, `ProgressBar lg`, captions |
| 5   | "Niveles Formativos" · "3 Bloques"                                                                                          | `SectionHeader actionLabel` (informativo)                                                        |
| 6   | Tarjeta Básico: EN CURSO, "• 6/8 Temas", ✓ decagrama, descripción, "Progreso del Nivel 75% Completado", "Continuar Nivel ▷" | `LevelCard` estado `inProgress`                                                                  |
| 7   | Tarjeta Intermedio: BLOQUEADO, candado, aviso cian ⓘ "Requiere aprobar el Test de Nivel Básico…", botón "Bloqueado"         | `LevelCard` `locked` + aviso `next`                                                              |
| 8   | Tarjeta Avanzado: igual, aviso tenue en caja "Desbloquea completando satisfactoriamente el Nivel Intermedio."               | `LevelCard` `locked` + aviso `later`                                                             |
| 9   | "Conoce CONTAITSCCH" · "Acerca de"                                                                                          | `SectionHeader onActionPress`                                                                    |
| 10  | "Introducción a la app" + badge ITSSCH + descripción + chevron                                                              | `ListItem boxed` con `IconBox accentSoft`, `Badge` en `meta`, `IconButton chevron-right`         |

## 3. Diferencias deliberadas con la captura

| Captura                                         | Implementación                           | Motivo                                                                                                                                                       |
| ----------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Básico "6/8 Temas · 75%", carrera "12/18 · 65%" | Básico "3/6 · 50%", carrera "3/18 · 17%" | Los datos de ejemplo coinciden con los de Aprender (spec 02), y los porcentajes salen de las reglas. La captura no es coherente consigo misma (12/18 = 67%). |
| 1,250 XP y "+150 XP hoy"                        | 15 XP y "+5 XP hoy"                      | Con las reglas (5 XP por tema), 3 temas dan 15 XP. Los números de la captura no se pueden lograr con el temario de ejemplo.                                  |
| "Módulos completados"                           | "Temas completados"                      | El avance de la carrera cuenta temas, igual que el de cada nivel.                                                                                            |
| Icono del 3.er stat a la izquierda del valor    | Icono encima del valor (`StatTile`)      | Así es el diseño de `StatTile`; no vale la pena una variante solo por esto.                                                                                  |
| Barra con degradado cian → verde                | Color sólido                             | Decisión 1 de spec 01.                                                                                                                                       |
| Línea verde sobre la pestaña activa             | Solo el color                            | Mismo pendiente que spec 02.                                                                                                                                 |

## 4. Arquitectura

```text
src/features/levels/
├── domain/entities/Level.ts                     # LevelStatus, LevelProgress, LevelOverviewItem, LevelsOverview
├── domain/policies/LevelUnlockPolicy.ts         # resolveLevelStatuses, levelProgress, careerProgress (+ test)
├── domain/repositories/LevelRepository.ts       # getProgress()
├── domain/usecases/GetLevelsOverviewUseCase.ts  # (+ test)
├── data/repositories/PreviewLevelRepository.ts  # TEMPORAL
├── presentation/viewmodels/levelCardVm.ts       # toLevelCardVm (+ test)
├── presentation/components/LevelCard.tsx        # (+ test)
└── index.ts                                     # LevelCard, toLevelCardVm, GetLevelsOverviewUseCase, tipos

src/features/gamification/
├── domain/entities/UserStats.ts                 # xpTotal, xpToday, streak
├── domain/policies/StreakCalculator.ts          # calculateStreak, shiftDay (+ test)
├── domain/repositories/StatsReaders.ts          # XpReader, ActivityReader (solo lectura)
├── domain/usecases/GetUserStatsUseCase.ts       # usa Clock.todayLocal() (+ test)
├── data/repositories/PreviewStatsRepository.ts  # TEMPORAL
└── index.ts

src/features/home/                               # solo presentation (no tiene repositorio propio)
├── presentation/viewmodels/homeVm.ts            # toHomeVm (+ test)
├── presentation/viewmodels/useHomeViewModel.ts
├── presentation/components/  GreetingHeader, StatsCard, CareerProgressCard
├── presentation/screens/HomeScreen.tsx
└── index.ts
```

- `home` importa `LevelCard`, `toLevelCardVm` y los tipos desde `@/features/levels`, y `UserStats` desde `@/features/gamification`. Nunca rutas internas.
- `useHomeViewModel` pide en paralelo `container.levels.getLevelsOverview` y `container.gamification.getUserStats` en cada `useFocusEffect`.
- Navegación: perfil → `/ajustes`; "Continuar Nivel" → `/` (Aprender); Acerca de → pendiente.

## 5. Reglas de dominio

| Regla                  | Definición                                                                             | Dónde                      |
| ---------------------- | -------------------------------------------------------------------------------------- | -------------------------- |
| Nivel desbloqueado     | `sortOrder = 1`, o el nivel con `sortOrder - 1` tiene el examen aprobado.              | `resolveLevelStatuses`     |
| Estado                 | `completed` si aprobó su examen; `inProgress` si está abierto; si no, `locked`.        | `resolveLevelStatuses`     |
| Progreso del nivel     | Temas completados / total; 1 si aprobó el examen; 0 si no tiene temas.                 | `levelProgress`            |
| Progreso de la carrera | Σ temas hechos (todos los del nivel si aprobó el examen) / Σ temas.                    | `careerProgress`           |
| Nivel actual           | El más alto que no está bloqueado. Sin niveles → `NO_LEVELS`.                          | `GetLevelsOverviewUseCase` |
| Racha                  | Días consecutivos de `daily_activity` que terminan hoy o ayer (día local del `Clock`). | `calculateStreak`          |
| XP de hoy              | Suma de `xp_event` cuyo día local es hoy.                                              | `XpReader.getEarnedOn`     |

Completar todos los temas **no** desbloquea el siguiente nivel: hace falta aprobar el examen (probado).

## 6. `LevelCard`

Props: `level: LevelCardVm`, `onPress`. `toLevelCardVm(level, previous?)` arma los textos:

| Campo         | Valor                                                                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `Nivel {name}`                                                                                                                                                                                                              |
| `icon`        | Por `sortOrder`: 1 `bank-outline`, 2 `calculator-variant-outline`, 3 `receipt-text-outline`; otro `school-outline`                                                                                                          |
| `topicsLabel` | `{completados}/{total} Temas`                                                                                                                                                                                               |
| `actionLabel` | `Continuar Nivel` (con avance) · `Empezar Nivel` (sin avance) · `Repasar Nivel` (completado) · `Bloqueado`                                                                                                                  |
| `unlockHint`  | Solo bloqueado: `next` = "Requiere aprobar el Test de Nivel {anterior} para desbloquear." si el anterior está abierto; `later` = "Desbloquea completando satisfactoriamente el Nivel {anterior}." si también está bloqueado |

Mapa estado → props del kit (sin condicionales de estilo):

| Estado       | `IconBox`     | `Badge`                  | Icono de estado                | Contenido                          | `Button`                                |
| ------------ | ------------- | ------------------------ | ------------------------------ | ---------------------------------- | --------------------------------------- |
| `inProgress` | `primary`     | EN CURSO primary soft    | `check-decagram-outline` verde | "• n/m Temas", descripción, barra  | `primary`, `play-outline` a la derecha  |
| `completed`  | `primarySoft` | COMPLETADO primary solid | `check-decagram` verde         | igual                              | `secondary`, `refresh`                  |
| `locked`     | `neutral`     | BLOQUEADO neutral        | `lock-outline` gris            | aviso de desbloqueo; `Card locked` | `locked`, `lock-outline` a la izquierda |

Aviso: `next` → `Callout plain accent information-outline`; `later` → `Callout boxed muted lock-clock`.

## 7. Textos de Home (`toHomeVm`)

- Saludo fijo "¡Hola, Contador! 👋" hasta tener la sesión (sección 9).
- Carrera: `{round(progreso×100)}%`, `Temas completados: x/y`, `+{xpHoy} XP hoy` o "Aún sin XP hoy" (nunca "+0").
- "Niveles Formativos": `{n} Bloques`.
- Estados de pantalla: `loading` ("Cargando…"), `error` (`Callout danger`: "Aún no hay niveles disponibles."), `ready`. Mientras carga, el `AppHeader` se muestra sin píldoras de racha/XP.

## 8. Accesibilidad

- `StatTile` se lee como una frase ("Racha: 5"); `ProgressBar` con etiqueta ("Progreso del Nivel Básico").
- El botón de la tarjeta lleva `accessibilityHint` con nombre, estado y porcentaje del nivel; si está bloqueado se anuncia deshabilitado.
- Títulos de tarjeta y saludo con `accessibilityRole="header"`; chevron con `accessibilityLabel`.

## 9. Pendientes

| #   | Pendiente                        | Detalle                                                                                                                                                                                                  |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `SqliteLevelRepository`          | `getProgress()` con la consulta "Nivel desbloqueado" de ARCHITECTURE.md (`level`, `topic`, `topic_progress`, `xp_event` del examen). Reemplaza a `PreviewLevelRepository` en el contenedor.              |
| 2   | Repositorios SQLite de XP/racha  | `XpReader` sobre `xp_event` (`SUM(points)`; hoy = `earned_at` convertido a día local) y `ActivityReader` sobre `daily_activity`. Reemplazan a `PreviewStatsRepository`.                                  |
| 3   | Textos del nivel en el contenido | `subtitle` y `description` (aquí) y `title` del módulo (spec 02) no existen en `contentSchema.ts`. Propuesta: `level: { id, name, sortOrder, title, subtitle, description }` y subir `manifest.version`. |
| 4   | Usuario de la sesión             | Los repositorios no reciben `userId`; el saludo usa "Contador". Conectar con `SessionStore` (feature `auth`).                                                                                            |
| 5   | Abrir un nivel concreto          | "Continuar/Repasar Nivel" lleva a Aprender, que siempre muestra el nivel 1 (`CURRENT_LEVEL_ID` en spec 02). Pasar `levelId` a la ruta `/` o usar `overview.currentLevel`.                                |
| 6   | Acerca de                        | "Acerca de" e "Introducción a la app" no navegan todavía; dependen de la feature `onboarding`.                                                                                                           |
| 7   | `levelTone`                      | Spec 01 sugiere un mapa de tono por nivel para badges del ranking; se creará en `levels` cuando `leaderboard` lo necesite.                                                                               |

## 10. Pruebas

| Archivo                                                    | Qué cubre                                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `levels/domain/policies/LevelUnlockPolicy.test.ts`         | Usuario nuevo, temas completos sin examen, examen aprobado, orden, progresos |
| `levels/domain/usecases/GetLevelsOverviewUseCase.test.ts`  | Nivel actual, carrera, `NO_LEVELS`                                           |
| `levels/presentation/viewmodels/levelCardVm.test.ts`       | Etiquetas por estado y avisos `next` / `later`                               |
| `levels/presentation/components/LevelCard.test.tsx`        | En curso: barra y toque; bloqueado: aviso, sin barra, botón deshabilitado    |
| `gamification/domain/policies/StreakCalculator.test.ts`    | Racha hoy/ayer/anteayer, huecos, cambio de mes y año                         |
| `gamification/domain/usecases/GetUserStatsUseCase.test.ts` | XP total, XP de hoy y racha con `Clock` falso                                |
| `home/presentation/viewmodels/homeVm.test.ts`              | Estadísticas, carrera, "Bloques", avisos por nivel, sin "+0 XP"              |

Verificación manual en Expo (pestaña Niveles): píldoras 🔥 5 · ⚡ 15 · ♥ ∞; Básico en curso 3/6 (50%) con "Continuar Nivel" que lleva a Aprender; Intermedio con aviso cian; Avanzado con aviso tenue; ambos con botón "Bloqueado"; perfil abre Ajustes.
