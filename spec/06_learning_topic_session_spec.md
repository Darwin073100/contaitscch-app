# 06 — Desarrollo de un tema: sesión por pasos (`learning`)

- **Estado:** implementado con datos de ejemplo (`PreviewLearningStore`). El flujo completo funciona en memoria: abrir tema → avanzar por subtemas → completar → el mapa se actualiza. Pendiente: SQLite, XP real y pantalla de tema completado (sección 9).
- **Fecha:** 1 de noviembre de 2026
- **Fuente:** `docs/design/desarrollo-del-tema.png`; historia "Desarrollo de un tema" de `docs/USER_STORIES.md`; `docs/ARCHITECTURE.md` (CompleteTopicUseCase, contenido JSON por bloques, Registry).
- **Depende de:** `spec/01_ui_components_spec.md` (kit `@/shared/ui`; recetas de `TAccountCard` y `SubtopicRenderer` en la sección 6) y `spec/02_learning_syllabus_map_spec.md` (mapa del temario, desde donde se abre la sesión).
- **Código:** `src/features/learning/`, ruta `src/app/tema/[topicId].tsx`, registro en `src/composition/container.ts`.

## 1. Objetivo y alcance

| Criterio de la historia                                 | Cómo se cumple                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Mostrar el contenido del tema de manera intuitiva       | Un subtema por paso; cada paso pinta sus bloques (párrafo, Cuenta T, regla, ejemplo) con `SubtopicRenderer`.                                |
| Marcar el tema como completado para actualizar la barra | "Completar tema" en el último paso → `CompleteTopicUseCase` → al regresar, el mapa (recarga en `useFocusEffect`) muestra el siguiente tema. |
| Gráficos atractivos                                     | `TAccountCard` (DEBE verde / HABER cian con iconos +/−) y `Callout` con icono para reglas y ejemplos.                                       |
| Mostrar el progreso sobre el tema                       | "Paso 2 de 4" + `ProgressBar` fijos arriba; píldora "+5 XP" con la recompensa en juego.                                                     |

Dentro del alcance: pantalla, ViewModel, componentes de bloques, casos de uso `GetTopicSession` y `CompleteTopic`, contenido de ejemplo del tema 104 y navegación desde el mapa.
Fuera del alcance: tablas SQLite, `UnitOfWork`, XP y actividad diaria reales, pantalla `TopicCompleted`, ejercicios dentro del tema.

## 2. Análisis de la captura

| #   | Elemento                                                                 | Componente                                                                                    |
| --- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 1   | Flecha atrás, título, vidas ∞                                            | `AppHeader title onBack` (vidas por defecto)                                                  |
| 2   | "Paso 2 de 4", píldora "5", barra verde                                  | `TopicStepProgress`: `AppText caption` + `StatPill lightning-bolt "+5 XP"` + `ProgressBar`    |
| 3   | Badge "🎓 MÓDULO 1 • TEMA 4: …"                                          | `Badge tone=info icon=school-outline uppercase`                                               |
| 4   | Título "¿Qué es una Cuenta T y cómo funciona?"                           | `AppText variant=title` (rol `header`)                                                        |
| 5   | Párrafo con **"Cuenta T"** en negrita                                    | Bloque `paragraph` → `RichText`                                                               |
| 6   | Dos tarjetas: ● DEBE / ● HABER, etiqueta del lado, movimientos con ⊕ / ⊖ | Bloque `t_account` → `TAccountCard` → 2 × `TAccountColumn` (`Card grow`)                      |
| 7   | Tarjeta "Regla de Oro de la Partida Doble" con icono de balanza          | Bloque `callout` → `Callout boxed tone=accent icon=scale-balance`                             |
| 8   | Pie fijo: botón cuadrado "<" + "Continuar al ejercicio →"                | `TopicStepFooter`: `IconButton rounded lg chevron-left` + `Button rightIcon` en `Column grow` |

## 3. Diferencias deliberadas con la captura

| Captura                                      | Implementación                                                                                  | Motivo                                                                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Título del encabezado "Sesion Quiz"          | Título del tema ("Cuentas T (Esquemas de Mayor)")                                               | Resto de otra pantalla (igual que en `introduccion.png`, spec 04).                                                                                    |
| Badge "MÓDULO 1 • TEMA 4: ESQUEMAS DE MAYOR" | "MÓDULO 1 • TEMA 4"                                                                             | El título del tema ya está en el encabezado; repetirlo truncaba el badge.                                                                             |
| Píldora "5" sin icono + segundo ♥ ∞          | `StatPill` ⚡ "+5 XP"; sin segundo corazón                                                      | El 5 coincide con la regla "+5 XP por tema"; las vidas ya están en el encabezado.                                                                     |
| "Continuar al ejercicio →"                   | "Continuar →"; en el último paso "Completar tema ✓" ("Terminar repaso" si ya estaba completado) | El modelo de contenido no tiene ejercicios dentro del tema: los pasos son subtemas. Si se agregan ejercicios, es un tipo de bloque nuevo (sección 6). |
| Botón "<" siempre visible                    | Oculto en el paso 1                                                                             | En el primer paso no hay paso anterior; para salir está la flecha del encabezado.                                                                     |

## 4. Arquitectura

```text
src/features/learning/
├── domain/
│   ├── entities/TopicSession.ts               # ContentBlock, Subtopic, TopicSessionSource, TopicSession, TopicCompletion
│   ├── repositories/TopicSessionReader.ts     # findSession(topicId)
│   ├── repositories/TopicProgressRepository.ts# isCompleted(topicId), markCompleted(topicId)
│   └── usecases/GetTopicSessionUseCase.ts     # (+ .test.ts)
│       usecases/CompleteTopicUseCase.ts       # (+ .test.ts)
├── data/
│   ├── preview/PreviewLearningStore.ts        # TEMPORAL: progreso en memoria compartido con el mapa
│   ├── preview/previewTopicContent.ts         # TEMPORAL: tema 104 en formato JSON del curso (+ .test.ts)
│   ├── repositories/PreviewSyllabusRepository.ts  # ahora lee del store
│   └── repositories/PreviewTopicRepository.ts     # implementa TopicSessionReader + TopicProgressRepository
├── presentation/
│   ├── components/  SubtopicRenderer, TAccountCard, TAccountColumn, TopicStepProgress, TopicStepFooter,
│   │                tAccountItem.ts (+ .test.ts), contentIcons.ts
│   ├── viewmodels/  topicSessionVm.ts (+ .test.ts), useTopicSessionViewModel.ts
│   └── screens/     TopicSessionScreen.tsx (+ .test.tsx)
└── index.ts         # + TopicSessionScreen
```

Flujo: mapa (`TopicNode` / `ContinueTopicBar`) → `router.push({ pathname: '/tema/[topicId]', params })` → `TopicSessionScreen topicId` → `useTopicSessionViewModel` → `container.learning.getTopicSession` / `completeTopic` (DI vía `useContainer`) → `toTopicStepVm` (textos listos) → componentes.

- La ruta `src/app/tema/[topicId].tsx` solo convierte el parámetro a número; un id inválido llega como `NaN` y la pantalla muestra "sin contenido".
- Es pantalla completa fuera de las pestañas (`safeBottom`), en el stack raíz.
- `XP_REWARD` (`gamification/domain/policies/XpRewardPolicy.ts`, exportado por su `index.ts`) es la fuente única de "+5 XP por tema / +100 por examen".

## 5. Dominio

### 5.1 Entidades

`ContentBlock` es el espejo en el dominio de `BlockSchema` (Zod, `core/database/seed/contentSchema.ts`): el dominio no puede importar `core/database` (regla de ESLint). `PreviewLearningStore.session()` asigna `Block[]` a `ContentBlock[]`, así que si los dos tipos se separan **deja de compilar**. El repositorio SQLite debe conservar esa asignación directa.

```ts
type TopicSession = {
  level: { id; name; sortOrder };
  topic: { id; title; sortOrder };
  subtopics: Subtopic[]; // ordenados; cada uno es un paso
  completed: boolean;
  startStep: number; // índice donde se retoma
  xpReward: number; // XP_REWARD.topic, o 0 si es repaso
};
type TopicCompletion = { topicId: number; firstTime: boolean };
```

### 5.2 Reglas

| Regla       | Definición                                                                                               | Dónde                    |
| ----------- | -------------------------------------------------------------------------------------------------------- | ------------------------ |
| Pasos       | Subtemas del tema ordenados por `sortOrder`. Sin subtemas = `TOPIC_NOT_FOUND`.                           | `GetTopicSessionUseCase` |
| Retomar     | Completado → paso 1 (repaso). Si no, `min(viewedSubtopics, total − 1)`: el primer subtema sin ver.       | `GetTopicSessionUseCase` |
| XP en juego | `XP_REWARD.topic` (5) si no está completado; 0 en repaso.                                                | `GetTopicSessionUseCase` |
| Completar   | Idempotente: si ya estaba completado devuelve `firstTime: false` y no escribe. Tema inexistente = error. | `CompleteTopicUseCase`   |

No se valida aquí que el tema esté desbloqueado: el mapa no deja abrir temas bloqueados. Si se agregan enlaces profundos, usar `TopicLockPolicy` en `GetTopicSession` (pendiente 5).

### 5.3 Casos de uso

- `GetTopicSessionUseCase.execute({ topicId }): Promise<Result<TopicSession, 'TOPIC_NOT_FOUND'>>`. Solo lectura.
- `CompleteTopicUseCase.execute({ topicId }): Promise<Result<TopicCompletion, 'TOPIC_NOT_FOUND'>>`. Hoy solo marca `topic_progress`; ver pendiente 1 para la versión de ARCHITECTURE.md.

## 6. Presentación

### 6.1 ViewModel

`toTopicStepVm(session, step)` (función pura, probada) arma todo lo que se pinta; recorta `step` al rango válido.

| Campo                          | Valor                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `headerTitle`                  | `topic.title`                                                                                   |
| `badge`                        | `Módulo {level.sortOrder} • Tema {topic.sortOrder}`                                             |
| `stepLabel` / `progress`       | `Paso {i+1} de {n}` / `(i+1)/n`                                                                 |
| `rewardLabel`                  | `+{xpReward} XP`, o `null` en repaso                                                            |
| `canGoBack`                    | `i > 0`                                                                                         |
| `primaryLabel` / `primaryIcon` | `Continuar` + `arrow-right`; último paso: `Completar tema` (o `Terminar repaso`) + `check-bold` |

`useTopicSessionViewModel(topicId)`: carga la sesión al montar y arranca en `startStep`. `next()` avanza o, en el último paso, llama `completeTopic` (botón con `loading`) y regresa (`router.back()`, o `router.replace('/')` sin historial). Un error al guardar muestra el estado `error`. `previous()` retrocede sin bajar de 0.

Estados de pantalla: `loading` ("Cargando tema…"), `error` (`Callout danger` + "Volver al temario"), `ready`. Al cambiar de paso el contenido vuelve arriba (`Screen scrollResetKey`).

### 6.2 Registry de bloques (`SubtopicRenderer`)

| `block.type` | Componente                                                                           |
| ------------ | ------------------------------------------------------------------------------------ |
| `paragraph`  | `RichText` (negritas `**así**`)                                                      |
| `t_account`  | `TAccountCard`                                                                       |
| `callout`    | `Callout boxed tone=accent`, icono vía `contentIcon(block.icon)`                     |
| `example`    | `Callout boxed tone=primary icon=lightbulb-on-outline`, título por defecto "Ejemplo" |

El registro es un objeto tipado `{ [T in BlockType]: … }`: agregar un tipo al dominio sin su componente **no compila**. Bloque nuevo = esquema Zod en `contentSchema.ts` + variante en `ContentBlock` + entrada aquí (spec 01, Open/Closed).

Iconos del contenido (`contentIcons.ts`): los JSON usan nombres cortos (`scale`, `lightbulb`, `info`, `warning`, `book`) que se traducen al set de la app; uno desconocido usa `information-outline`.

### 6.3 Cuenta T

`TAccountCard` → `Row align=stretch` con dos `TAccountColumn` (`Card grow`: mismo ancho y misma altura). Cada movimiento pasa por `parseTAccountItem`: `+` = aumento (`plus-circle-outline`), `−`/`-`/`–` = disminución (`minus-circle-outline`, gris), sin signo = sin icono. El texto se muestra tal cual viene del JSON.

| Lado     | Título y punto   | Aumentos (+)         | Disminuciones (−) |
| -------- | ---------------- | -------------------- | ----------------- |
| `debit`  | "DEBE" `primary` | texto e icono verde  | `muted`           |
| `credit` | "HABER" `accent` | texto e icono blanco | `muted`           |

## 7. Datos de ejemplo

- `PreviewLearningStore` (una instancia por contenedor) guarda el progreso de los 6 temas del nivel Básico y lo comparten `PreviewSyllabusRepository` y `PreviewTopicRepository`. Completar el tema 104 lo marca en el mapa y vuelve activo el 105. Se reinicia al recargar la app.
- El tema 104 quedó con `viewedSubtopics: 1` y 4 subtemas: la sesión abre en el **paso 2 de 4**, el de la captura (el globo del mapa ahora dice "1/4").
- `previewTopicContent.ts`: el tema 104 completo en el formato de los JSON del curso (`TopicContent`), validado por su prueba con `TopicSchema` y la convención de ids. Subtemas: 10401 "¿Qué es una cuenta contable?", 10402 la captura, 10403 "El saldo de una cuenta", 10404 "Registra tu primera operación" (compra de mobiliario en efectivo).
- Solo el tema 104 tiene contenido: los demás muestran "Este tema todavía no tiene contenido disponible." hasta que exista `basico.json`.

## 8. Cambios en `shared` y otras features

| Archivo                                          | Cambio                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `shared/ui/Card.tsx`                             | Variante `grow` (`flex-1`): columnas DEBE/HABER de igual ancho y altura.                 |
| `shared/ui/Screen.tsx`                           | Prop `scrollResetKey`: al cambiar, el `ScrollView` vuelve arriba (cambio de paso).       |
| `gamification/domain/policies/XpRewardPolicy.ts` | **Nuevo:** `XP_REWARD = { topic: 5, exam: 100 }`, exportado por `gamification/index.ts`. |
| `core/database/seed/contentSchema.ts`            | Exporta el tipo `TopicContent`.                                                          |
| `learning/.../useSyllabusMapViewModel.ts`        | `openTopic` navega a `/tema/[topicId]` (pendiente 6 de spec 02).                         |
| `composition/container.ts`                       | Un `PreviewLearningStore` compartido; registra `getTopicSession` y `completeTopic`.      |

## 9. Pendientes

| #   | Pendiente                   | Detalle                                                                                                                                                                                                                     |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `CompleteTopic` completo    | Con SQLite: `UnitOfWork.run(tx => …)` con `markCompleted` + `AwardXp` (+5, `synced_at NULL`) + `RecordDailyActivity`, y publicar `TopicCompleted` (ARCHITECTURE.md). Hoy solo marca el progreso en memoria; **no suma XP**. |
| 2   | `SqliteTopicRepository`     | Implementa `TopicSessionReader` (`topic`, `subtopic.content` con `JSON.parse` → `ContentBlock[]`) y `TopicProgressRepository` (`topic_progress`). Reemplaza a `PreviewTopicRepository` y al store en `container.ts`.        |
| 3   | Subtemas vistos             | Guardar el paso al avanzar (`subtopic_progress` o `app_state`, observación 5 de ARCHITECTURE.md). Hoy `viewedSubtopics` solo se lee; al salir a medio tema no se recuerda el avance.                                        |
| 4   | Pantalla "Tema completado"  | `TopicCompleted` (+5 XP, racha) de ARCHITECTURE.md; no hay captura. Hoy se regresa directo al mapa.                                                                                                                         |
| 5   | Temas bloqueados por enlace | Validar con `TopicLockPolicy` si se abre `/tema/<id>` directo.                                                                                                                                                              |
| 6   | Contenido real              | Mover el tema 104 a `basico.json` y escribir los demás temas (agente `content-author`); borrar `previewTopicContent.ts`.                                                                                                    |
| 7   | Usuario de la sesión        | Los repositorios no reciben `userId` todavía (igual que spec 02, pendiente 2).                                                                                                                                              |
| 8   | Animaciones                 | Transición entre pasos y barra que se llena (Reanimated), sin cambiar props.                                                                                                                                                |

## 10. Accesibilidad

- Título del paso con `accessibilityRole="header"`; la barra anuncia "Avance del tema: Paso 2 de 4".
- La píldora de XP se lee como "Completa el tema para ganar 5 XP".
- "<" tiene la etiqueta "Paso anterior"; la flecha del encabezado, "Regresar" (de `AppHeader`).
- Los iconos +/− son decorativos: el texto del movimiento ya incluye el signo.

## 11. Pruebas

| Archivo                                            | Qué cubre                                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `domain/usecases/GetTopicSessionUseCase.test.ts`   | Orden de subtemas, XP en juego, retomar (y tope), repaso sin XP, `TOPIC_NOT_FOUND`                               |
| `domain/usecases/CompleteTopicUseCase.test.ts`     | Marca la primera vez, idempotente después, tema inexistente                                                      |
| `data/preview/previewTopicContent.test.ts`         | El contenido de ejemplo cumple `TopicSchema` y la convención de ids                                              |
| `presentation/components/tAccountItem.test.ts`     | Signos `+`, `−`, `-`, `–` y sin signo                                                                            |
| `presentation/viewmodels/topicSessionVm.test.ts`   | Textos del paso 2 de 4, primer paso sin "<", último paso, repaso, recorte de rango                               |
| `presentation/screens/TopicSessionScreen.test.tsx` | Abre en el paso 2 con Cuenta T y Regla de Oro; avanzar/regresar; completar actualiza el mapa; tema sin contenido |

Verificación manual en Expo: en Aprender tocar el tema 4 (o "Aprender" en la barra inferior) → se abre en "Paso 2 de 4" con la Cuenta T; "<" lleva al paso 1; avanzar hasta el 4 y tocar "Completar tema" → regresa al mapa con el tema 4 completado y el 5 activo.
