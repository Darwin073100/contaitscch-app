# 02 — Pestaña Aprender: mapa del temario (`learning`)

- **Estado:** maquetación implementada con datos de ejemplo (`PreviewSyllabusRepository`). Pendiente: datos reales de SQLite y navegación (sección 10).
- **Fecha:** 1 de noviembre de 2026
- **Fuente:** `docs/design/examen-pregunta.png` (es el mapa del temario, no una pregunta de examen; ver spec 01, decisión 3), historia "Temario del nivel" de `docs/USER_STORIES.md`, `docs/ARCHITECTURE.md`.
- **Depende de:** `spec/01_ui_components_spec.md` (kit `@/shared/ui`, sección 6: recetas de `ModuleHeaderCard`, `TopicNode`, `TopicPath`, `ExamNode`, `ContinueTopicBar`).
- **Código:** `src/features/learning/`, ruta `src/app/(tabs)/index.tsx`, registro en `src/composition/container.ts`.

## 1. Objetivo y alcance

Historia de usuario **"Temario del nivel"**:

| Criterio                                          | Cómo se cumple                                                                                     |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Mostrar los temas del nivel                       | `TopicPath` pinta cada tema como nodo sobre un camino curvo, en orden de `sortOrder`.              |
| Bloquear un tema si el anterior no está concluido | `TopicLockPolicy.resolveTopicStatuses` (dominio, probado); el nodo bloqueado no responde al toque. |
| Barra de progreso del avance                      | `ModuleHeaderCard`: temas completados / total, con porcentaje.                                     |

Dentro del alcance: pantalla, ViewModel, componentes de la feature, caso de uso `GetSyllabus` con sus policies y un repositorio temporal con los datos de la captura.
Fuera del alcance (próximos specs): `SqliteSyllabusRepository`, sesión de tema (`TopicSession`), examen (`ExamIntro`), nivel actual desde `levels`, animaciones.

## 2. Análisis de la captura

De arriba a abajo:

| #   | Elemento                                                                                                    | Componente                                  |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | Logo + "CONTAITSCCH" (sin píldoras de racha/XP)                                                             | `AppHeader showLives={false}`               |
| 2   | Tarjeta: "MÓDULO 1" con birrete, badge "Básico", título, subtítulo, barra, "Tema 4 de 7 completados", "57%" | `ModuleHeaderCard`                          |
| 3   | Camino: verde sólido entre temas completados, punteado gris hacia los pendientes                            | `TopicPath` (`react-native-svg`)            |
| 4   | Nodos completados (círculo verde con ✓), activo (cian, más grande, con halo), bloqueados (gris con 🔒)      | `TopicNode` × n                             |
| 5   | Globo "▷ ¡Toca para continuar! 2/3" sobre el tema activo                                                    | `Badge accent solid` dentro de `TopicNode`  |
| 6   | Etiquetas "1. Conceptos Básicos", truncadas con "…" si no caben ("5. Balanza…")                             | `Badge size=md` (solid / soft si bloqueado) |
| 7   | Cuadro del examen con candado en la esquina, "Examen Final Básico" (ámbar), "Certificado de Nivel"          | `ExamNode`                                  |
| 8   | Barra fija: icono ▶ cian, "Continuar tema activo", título truncado, botón "Aprender →"                      | `ContinueTopicBar` en `Screen footer`       |
| 9   | Pestañas con iconos de camino, capas, barras y engrane                                                      | `src/app/(tabs)/_layout.tsx` con `Icon`     |

## 3. Diferencias deliberadas con la captura

| Captura                                                                   | Implementación                                | Motivo                                                                                                         |
| ------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| "Tema 4 de 7 completados · 57%" con solo 3 temas completados y 6 visibles | "3 de 6 temas completados · 50%"              | Regla "Progreso del nivel = completados / total" (ARCHITECTURE.md). La captura es inconsistente.               |
| Tema 3 con doble palomita (✓✓), 1 y 2 con una                             | Todos los completados con `check`             | No hay regla que distinga los dos estados. **Pregunta abierta** (sección 11).                                  |
| El punteado termina en el tema 5                                          | El camino une todos los nodos hasta el examen | Consistencia visual; el examen es parte del recorrido.                                                         |
| Etiqueta corta "4. Cuentas T (Mayor)" y barra "Esquemas de May…"          | Se usa el `title` del tema en ambos, truncado | El JSON tiene un solo título por tema. Si se quieren títulos cortos, agregar `shortTitle` opcional al esquema. |
| Punteado gris oscuro                                                      | `colors.border` (spec 01 sugería `surface`)   | `surface` casi no contrasta con `bg` en trazos delgados.                                                       |
| Barra de pestañas con línea verde sobre la pestaña activa                 | Solo color en icono y texto                   | Requiere un `tabBar` personalizado; queda como pendiente de pulido.                                            |

## 4. Arquitectura

```text
src/features/learning/
├── domain/
│   ├── entities/Syllabus.ts                 # TopicStatus, ExamStatus, TopicProgress, SyllabusSource, Syllabus
│   ├── policies/TopicLockPolicy.ts          # resolveTopicStatuses, resolveExamStatus (+ .test.ts)
│   ├── repositories/SyllabusRepository.ts   # interfaz: findByLevel(levelId)
│   └── usecases/GetSyllabusUseCase.ts       # (+ .test.ts con repo en memoria)
├── data/
│   └── repositories/PreviewSyllabusRepository.ts   # TEMPORAL: datos de la captura
├── presentation/
│   ├── components/  ModuleHeaderCard, TopicPath, TopicNode (+ .test.tsx), ExamNode, ContinueTopicBar
│   ├── viewmodels/  syllabusMapVm.ts (+ .test.ts), useSyllabusMapViewModel.ts
│   └── screens/     SyllabusMapScreen.tsx
└── index.ts         # SyllabusMapScreen, GetSyllabusUseCase, tipos del temario
```

Flujo: `SyllabusMapScreen` → `useSyllabusMapViewModel(levelId)` → `container.learning.getSyllabus` (DI vía `useContainer`) → `SyllabusRepository` → policies → `toSyllabusMapVm` (textos listos) → componentes.

- La ruta `src/app/(tabs)/index.tsx` solo importa `SyllabusMapScreen` desde `@/features/learning`.
- `container.ts` importa las clases internas de la feature (composition root). No importa el `index.ts` de `learning`, para evitar el ciclo `container → index → screen → viewmodel → AppProviders → container`.
- El ViewModel recarga en cada `useFocusEffect`: al volver de un tema completado el mapa se actualiza sin esperar eventos.

## 5. Dominio

### 5.1 Entidades

```ts
type TopicStatus = 'completed' | 'active' | 'locked';
type ExamStatus = 'locked' | 'available' | 'passed';

type TopicProgress = {
  id;
  title;
  sortOrder;
  completed: boolean;
  viewedSubtopics: number; // "2/3" del globo
  totalSubtopics: number;
};
type SyllabusSource = { level: SyllabusLevel; topics: TopicProgress[]; examPassed: boolean };
type Syllabus = {
  level;
  topics: SyllabusTopic[]; // ordenados, con status
  completedTopics;
  totalTopics;
  activeTopic: SyllabusTopic | null; // primer tema abierto sin completar
  examStatus: ExamStatus;
};
```

`SyllabusLevel` agrega `title` ("Introducción a la Contabilidad") y `description` al nivel; hoy no existen en `contentSchema.ts` (sección 10).

### 5.2 Reglas (`TopicLockPolicy`)

| Regla                 | Definición                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Tema completado       | `completed = true` (existe en `topic_progress`).                                                                  |
| Tema activo (abierto) | No completado y (`sortOrder = 1` o el tema con `sortOrder - 1` está completado).                                  |
| Tema bloqueado        | Cualquier otro caso.                                                                                              |
| Examen                | `passed` si ya se aprobó; `available` si todos los temas están completados (y hay al menos uno); si no, `locked`. |

Con progreso restaurado fuera de orden puede haber más de un tema `active`; `activeTopic` es el primero. Cuando exista la feature `levels`, la disponibilidad del examen debe coincidir con su `LevelUnlockPolicy` ("Examen disponible").

### 5.3 Caso de uso

`GetSyllabusUseCase.execute({ levelId }): Promise<Result<Syllabus, 'LEVEL_NOT_FOUND'>>`. Solo lectura, sin `UnitOfWork`.

## 6. ViewModel

`toSyllabusMapVm(syllabus)` (función pura, probada) produce todos los textos; los componentes no calculan nada.

| Campo                        | Valor                                                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header.overline`            | `Módulo {level.sortOrder}`                                                                                                                                     |
| `header.progressLabel`       | `{completados} de {total} temas completados`                                                                                                                   |
| `header.percentLabel`        | `round(completados / total × 100)%`                                                                                                                            |
| `nodes[].label`              | `{sortOrder}. {title}`                                                                                                                                         |
| `nodes[].hint`               | Solo el activo: `¡Toca para continuar! {vistos}/{total}` o `¡Toca para empezar!` si no ha visto subtemas                                                       |
| `nodes[].accessibilityLabel` | `Tema 4: Cuentas T (Esquemas de Mayor). En curso, 2 de 3 pasos vistos`                                                                                         |
| `exam`                       | `Examen Final {nivel}`, "Certificado de Nivel", estado                                                                                                         |
| `continueAction`             | Tema activo → "Continuar tema activo" / "Siguiente tema" + "Aprender"; sin tema activo y examen disponible → "Presentar"; examen aprobado → `null` (sin barra) |

Estados de pantalla: `loading` (caption "Cargando temario…"), `error` (`Callout tone=danger`), `ready`.

## 7. Componentes de la feature

Todos componen `@/shared/ui`, sin `className`.

| Componente         | Props                                                                                        | Composición                                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ModuleHeaderCard` | `overline`, `levelName`, `title`, `description`, `progress`, `progressLabel`, `percentLabel` | `Card padding=lg` → `Column gap=md`: `Row between` (`Icon school-outline` + `AppText overline primary`, `Badge solid`), `heading` + `caption`, `ProgressBar lg`, `Row between` (caption primary / accent).    |
| `TopicNode`        | `label`, `status`, `hint?`, `accessibilityLabel`, `onPress?`                                 | `Tappable` (deshabilitado si `locked`) → `Column gap=sm`: `Badge accent solid md icon=play` (hint), `IconBox circle` según estado, `Badge md` (solid; soft si bloqueado). Cada pieza en `Row justify=center`. |
| `ExamNode`         | `title`, `caption`, `status`, `accessibilityLabel`, `onPress?`                               | `Tappable` → `IconBox xl certificate-outline` (`streakSoft`; `primarySoft` si aprobado) con `cornerIcon` `lock`/`check`, `AppText bold streak` + `caption` centrados.                                         |
| `TopicPath`        | `nodes`, `exam`, `onOpenTopic(id)`, `onOpenExam()`                                           | Ver sección 8.                                                                                                                                                                                                |
| `ContinueTopicBar` | `caption`, `title`, `actionLabel`, `onPress`                                                 | `Card padding=sm` → `Row gap=md`: `IconBox accent play-circle-outline`, `Column grow` (caption blanco semibold, `subtitle bold` en 1 línea), `Button sm rightIcon=arrow-right`.                               |

Mapa de estado del nodo (reemplaza condicionales de estilo):

| Estado      | `IconBox`                                          | Etiqueta              | Toque        |
| ----------- | -------------------------------------------------- | --------------------- | ------------ |
| `completed` | `primary`, `lg` (56 px), `check`                   | `Badge solid`         | Sí (repasar) |
| `active`    | `accent`, `xl` (80 px), `book-open-variant` + halo | `Badge solid` + globo | Sí           |
| `locked`    | `neutral`, `lg`, `lock-outline`                    | `Badge soft`          | No           |

## 8. Geometría de `TopicPath`

- Ancho medido con `onLayout`; antes de medirlo solo se reserva la altura (no depende del ancho).
- Centro del icono del tema `i`: `x = ancho/2 ± 0.18 × ancho` (alterna izquierda/derecha, empieza a la izquierda), `y = y0 + i × 160`. `y0 = 8 + ancla del primer nodo`.
- Examen: centrado, una fila después del último tema; se reservan 112 px debajo para sus textos.
- Tramos: curva cúbica en "S" entre centros consecutivos (`C x1 ym, x2 ym`). Sólido `colors.primary` si el destino está completado (o el examen aprobado); si no, punteado `colors.border` (`strokeDasharray 10 18`, extremos redondos, grosor 8). Los sólidos se dibujan encima.
- Halo del tema activo: `Circle r=64`, `colors.accent`, `opacity 0.15`.
- Cada nodo va en un `View` absoluto: `top = y − ancla`, ancho `min(200, 2 × distancia al borde)`, para que la etiqueta no se salga en pantallas angostas. El **ancla** (borde superior → centro del icono) la exporta `TopicNode` (`topicNodeAnchor`: globo 32 + 8 si hay hint, más la mitad del icono) y `ExamNode` (`EXAM_NODE_ANCHOR = 40`). Si cambian las alturas de `Badge`/`IconBox` en `shared/ui`, actualizar esas constantes.
- Los estilos en línea de este archivo son **posiciones calculadas** (dato, no diseño), la misma excepción que la altura del podio en spec 01.

## 9. Cambios en `shared/ui` (actualizados en spec 01)

| Componente | Cambio                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tappable` | **Nuevo.** Área táctil sin estilo (`active:opacity-80`, `role=button`, `disabled` accesible) para nodos que no son `Card` ni `Button`.       |
| `IconBox`  | Prop `cornerIcon?`: insignia circular en la esquina superior derecha (candado del examen).                                                   |
| `Badge`    | Una sola línea con "…" (`numberOfLines=1`, `shrink`, `max-w-full`). El alto es fijo, así que ningún uso anterior cambia.                     |
| Pestañas   | Iconos migrados a `Icon` (MaterialCommunityIcons): `map-marker-path`, `layers-outline`, `chart-bar`, `cog-outline` (pendiente 6 de spec 01). |

## 10. Pendientes para datos reales

| #   | Pendiente                           | Detalle                                                                                                                                                                                        |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `SqliteSyllabusRepository`          | Implementa `SyllabusRepository` con `level`, `topic`, `subtopic`, `topic_progress` y `xp_event` (examen aprobado). Reemplaza a `PreviewSyllabusRepository` en `container.ts`; la UI no cambia. |
| 2   | Usuario de la sesión                | `findByLevel(levelId)` aún no recibe `userId`. Agregarlo cuando exista `SessionStore` (`session.requireUserId()` en el use case).                                                              |
| 3   | `title` y `description` del nivel   | Agregar a `level` en `contentSchema.ts` (y subir `manifest.version`), o tomarlos de otro lugar. Hoy solo vienen del repositorio de ejemplo.                                                    |
| 4   | Subtemas vistos (`viewedSubtopics`) | Observación 5 de ARCHITECTURE.md: falta `subtopic_progress` (o `app_state`). Sin ella, el globo dirá siempre "¡Toca para empezar!".                                                            |
| 5   | Nivel actual                        | `CURRENT_LEVEL_ID = 1` en la pantalla. Debe venir de `levels` (nivel más alto desbloqueado) o de un parámetro al llegar desde Niveles.                                                         |
| 6   | Navegación                          | `openTopic` / `openExam` están vacíos: conectar con `TopicSession` y `ExamIntro` cuando existan sus rutas.                                                                                     |

## 11. Preguntas abiertas y pulido

1. ¿Qué significa la doble palomita (✓✓) del tema 3? Opciones: "completado hoy", "completado con todos los ejercicios". Si se define, es un `status` nuevo en el dominio y una entrada en el mapa de la sección 7.
2. ¿Títulos cortos para el mapa (`shortTitle`)?
3. Animaciones con Reanimated (halo que respira, barra que se llena), sin cambiar props.
4. Desplazar automáticamente el scroll hasta el tema activo cuando el temario sea largo.
5. Línea verde sobre la pestaña activa (`tabBar` personalizado).

## 12. Pruebas

| Archivo                                         | Qué cubre                                                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `domain/policies/TopicLockPolicy.test.ts`       | Usuario nuevo, avance secuencial, orden, progreso restaurado fuera de orden, estados del examen |
| `domain/usecases/GetSyllabusUseCase.test.ts`    | Conteos, tema activo, todos completados, `LEVEL_NOT_FOUND` (repo en memoria)                    |
| `presentation/viewmodels/syllabusMapVm.test.ts` | Textos de la tarjeta, globo, destino de la barra (tema / examen / sin barra)                    |
| `presentation/components/TopicNode.test.tsx`    | Activo responde al toque y muestra el globo; bloqueado deshabilitado                            |

Verificación manual en Expo (pestaña Aprender): tarjeta con 50%, temas 1–3 verdes, tema 4 cian con halo y globo "2/3", 5–6 con candado, examen con candado, barra inferior sobre las pestañas, etiquetas largas truncadas.
