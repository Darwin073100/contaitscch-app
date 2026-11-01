# 01 — Sistema de diseño y componentes reutilizables (`shared/ui`)

- **Estado:** implementado (componentes base). Componentes de feature: `learning` (spec 02), `levels`/`home` (spec 03), `onboarding` (spec 04) y `auth` (spec 05, maquetación) implementados; el resto pendiente (sección 6).
- **Fecha:** 1 de noviembre de 2026
- **Fuente:** capturas en `docs/design/`, `docs/ARCHITECTURE.md` (sección "Estilos con Tailwind") y `docs/USER_STORIES.md`.
- **Código:** `src/shared/ui/`, `src/shared/theme/colors.js`, `src/shared/utils/`.

## 1. Objetivo y alcance

Tener un único kit de componentes con el que se arman **todas** las pantallas de CONTAITSCCH, para que:

1. Ninguna pantalla ni feature escriba clases Tailwind ni colores (regla de `CLAUDE.md`: clases solo en `src/shared/ui`).
2. Los estados visuales (bloqueado, en curso, completado, error, seleccionado) sean **variantes** (`tailwind-variants`), no condicionales de estilo en las pantallas.
3. Un cambio de diseño (color, radio, tamaño) se haga en un solo lugar.

Dentro del alcance: tokens de color, primitivas de layout y tipografía, y los componentes que se repiten entre pantallas.
Fuera del alcance: pantallas, ViewModels y componentes propios de una feature (`LevelCard`, `TopicPath`, `Podium`…). La sección 6 define cómo se arman con este kit; se construyen en el spec de cada feature.

## 2. Análisis de las pantallas de `docs/design/`

> Aviso: `examen-pregunta.png` no muestra una pregunta de examen sino el **mapa del temario** (pestaña Aprender). **No hay captura de una pregunta de examen**; `ChoiceCard` es una propuesta con los mismos tokens.

| Captura                     | Pantalla / feature                | Elementos que se repiten                                                                                                                                                                                                                                                                        |
| --------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `menu-inicio-niveles.png`   | Home + Niveles (`home`, `levels`) | Encabezado con logo y píldoras (🔥 5, ⚡ 1,250, ♥ ∞, perfil). Saludo con logo verificado. 3 stat tiles. Tarjeta "Progreso de la Carrera" con barra. Encabezado de sección con enlace. Tarjetas de nivel en 3 estados (en curso / bloqueado). Fila "Introducción a la app". Barra de pestañas.   |
| `examen-pregunta.png`       | Mapa del temario (`learning`)     | Logo + marca. Tarjeta de módulo (overline con icono, badge "Básico", barra, "Tema 4 de 7", "57%"). Camino curvo SVG con nodos: completado ✓, completado ✓✓, activo (cian con halo), bloqueado 🔒, examen final. Globo "¡Toca para continuar! 2/3". Barra fija inferior "Continuar tema activo". |
| `desarrollo-del-tema.png`   | Sesión de tema (`learning`)       | Encabezado con "atrás" + título. "Paso 2 de 4" + barra. Badge "MÓDULO 1 • TEMA 4". Título grande, párrafo con negritas. **Cuenta T** (dos tarjetas DEBE/HABER con +/−). Callout "Regla de Oro". Pie fijo: botón cuadrado "<" + botón primario "Continuar al ejercicio →".                       |
| `introduccion.png`          | Acerca de (`onboarding`)          | Hero con logo grande, badge "v1.0", título, overline verde. 3 tiles icono+texto. Tarjeta con IconBox + título + párrafo + chips con icono. Sección "Objetivos" (filas en tarjeta: IconBox + título + descripción). "Equipo" (filas dentro de una tarjeta, una con overline). CTA final.         |
| `ranking.png`               | Ranking (`leaderboard`)           | Podio (avatares con medalla 1/2/3, corona, bloques de altura distinta). Encabezado de sección con contador. Filas: posición + avatar + nombre + badge de nivel + racha + XP. Fila "Tú" resaltada con borde verde. Barra fija "Tu posición" con botón "Subir".                                   |
| `registro-verificacion.png` | Registro paso 2 (`auth`)          | Badge "REGISTRO OFICIAL". Logo circular con insignia. Título y subtítulo centrados. Stepper "1 Tus Datos / 2 Verificación". Tarjeta con IconBox circular, OTP de 6 casillas, "Reenviar en 00:45", botón primario con icono, enlace "Corregir mis datos". Fila de 3 beneficios con separadores.  |

Patrones comunes detectados:

- **Fondo azul noche + tarjetas un tono más claro + elementos internos otro tono más claro.** Tres niveles de superficie → tokens `bg`, `card`, `surface`.
- **Verde = acción / progreso / completado; cian = activo / informativo; ámbar = racha y oro.** El color comunica estado, por eso los componentes reciben `tone`, no colores.
- **Iconos dentro de fondos redondeados** en casi todas las tarjetas → `IconBox`.
- **"Icono + título + descripción (+ algo a la derecha)"** aparece en objetivos, equipo, intro y ranking → `ListItem`.
- **Barras fijas abajo** en 4 pantallas → `Screen` con `footer`.
- **Texto con negritas** dentro del contenido del curso (`**Cuenta T**`) → `RichText`.

## 3. Tokens de diseño

### 3.1 Colores (`src/shared/theme/colors.js`)

Fuente única: los consume `tailwind.config.js` (clases `bg-card`, `text-primary`, `bg-primary/15`) y el código SVG vía `colors` de `@/shared/theme`.

| Token          | Valor     | Uso                                                         | Nuevo |
| -------------- | --------- | ----------------------------------------------------------- | ----- |
| `bg`           | `#0A1628` | Fondo de pantalla; texto sobre botones verdes               |       |
| `card`         | `#14213A` | Tarjetas                                                    |       |
| `surface`      | `#1E2D4A` | Elementos dentro de tarjetas: pills, OTP, chips, stat tiles | ✔     |
| `border`       | `#26385A` | Bordes y separadores                                        | ✔     |
| `primary`      | `#00E676` | Botón principal, progreso, completado                       |       |
| `primary-soft` | `#69F0AE` | Avatar del usuario ("TÚ"), botón "Subir"                    | ✔     |
| `accent`       | `#4DD0E1` | Tema activo, HABER, enlaces                                 |       |
| `info`         | `#1D4ED8` | Paso activo del stepper, icono del correo                   | ✔     |
| `streak`       | `#FBBF24` | Racha, oro del podio, examen final                          |       |
| `silver`       | `#CBD5E1` | Plata del podio                                             | ✔     |
| `bronze`       | `#C2410C` | Bronce del podio                                            | ✔     |
| `muted`        | `#8A9BB5` | Texto secundario                                            |       |
| `danger`       | `#F87171` | Errores, respuesta incorrecta, corazón de vidas             |       |
| `white`        | `#FFFFFF` | Texto principal                                             |       |

Transparencias: se usan con el modificador de Tailwind (`bg-primary/15`) para fondos "suaves" de badges e IconBox; no se crean tokens extra para cada opacidad.

### 3.2 Tipografía

Plus Jakarta Sans (cargada en `src/app/_layout.tsx`): `font-sans` 400, `font-medium` 500, `font-semibold` 600, `font-display` 700, `font-extrabold` 800.

| Variante de `AppText` | Estilo                 | Ejemplo en el diseño                    |
| --------------------- | ---------------------- | --------------------------------------- |
| `display`             | 800, 36 px             | "CONTAITSCCH" del hero                  |
| `title`               | 700, 30 px             | "¿Qué es una Cuenta T y cómo funciona?" |
| `heading`             | 700, 20 px             | "Nivel Básico", "Niveles Formativos"    |
| `subtitle`            | 600, 18 px             | "Confirma tu Correo"                    |
| `body`                | 400, 16 px             | Párrafos                                |
| `caption`             | 400, 14 px, `muted`    | "Fundamentos y Cuentas"                 |
| `overline`            | 700, 12 px, mayúsculas | "PORTAL ACADÉMICO ITSSCH", "MÓDULO 1"   |
| `stat`                | 800, 24 px             | "1,250", "65%"                          |

Modificadores combinables: `tone` (default, muted, primary, accent, streak, danger, silver, bronze, inverse), `weight`, `align`.

### 3.3 Forma y espaciado

- Radios: tarjetas `rounded-3xl`; botones, IconBox, casillas `rounded-2xl`/`rounded-xl`; pills, badges y avatares `rounded-full`.
- Separación: `Row`/`Column` con `gap` `xs`(4) `sm`(8) `md`(12) `lg`(16) `xl`(24). Secciones de una pantalla con scroll: 24 px (lo pone `Screen`). Margen lateral: 16 px.
- Alturas táctiles: botones 40/48/56 px; `IconButton` 36/44/56 px (usar 44 cuando se pueda).

### 3.4 Iconos

Un solo set: **MaterialCommunityIcons** (`@expo/vector-icons`) vía `<Icon>`, para que el trazo sea uniforme. Equivalencias usadas en el diseño:

| Concepto               | Nombre                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| Racha / XP / Vidas     | `fire` / `lightning-bolt` / `heart-outline`                          |
| Perfil / atrás / ir    | `account-outline` / `arrow-left` / `chevron-right`, `arrow-right`    |
| Bloqueado / completado | `lock-outline` / `check`, `check-all`, `check-decagram-outline`      |
| Niveles                | `bank-outline`, `calculator-variant-outline`, `receipt-text-outline` |
| Tema / módulo          | `book-open-variant`, `school-outline`                                |
| Regla de oro           | `scale-balance`                                                      |
| Info / correo / reloj  | `information-outline` / `email-check-outline` / `clock-outline`      |
| Ranking                | `trophy-outline`, `crown`, `medal-outline`, `trending-up`            |

Las pestañas (`src/app/(tabs)/_layout.tsx`) también usan `Icon`.

## 4. Inventario de componentes (`src/shared/ui`)

Todo se importa desde `@/shared/ui`. Ningún componente acepta colores hex: los colores llegan como `ColorToken` o como `tone`.

### 4.1 Layout y tipografía

| Componente | Props clave                                                                                  | Notas                                                                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Screen`   | `header?`, `footer?`, `scroll?`, `safeBottom?`, `keyboardAvoiding?`, `align?: top \| center` | Fondo, safe area superior, header fijo, contenido con scroll (gap 24) y barra fija inferior. `safeBottom` solo en pantallas completas fuera de las pestañas (TopicSession, ExamSession, registro). `keyboardAvoiding` en formularios (registro). |
| `Row`      | `gap`, `align` (por defecto `center`), `justify`, `grow`, `wrap` + `ViewProps`               | Fila horizontal. Es la forma en que las features hacen layout sin `className`.                                                                                                                                                                   |
| `Column`   | igual que `Row`                                                                              | Columna vertical.                                                                                                                                                                                                                                |
| `Divider`  | `orientation?: horizontal \| vertical`                                                       | Separadores de la fila de beneficios del registro.                                                                                                                                                                                               |
| `AppText`  | `variant`, `tone`, `weight`, `align` + `TextProps`                                           | Ver 3.2.                                                                                                                                                                                                                                         |
| `RichText` | `text`, `emphasisTone?` + props de `AppText`                                                 | Convierte `**negrita**` (formato de los JSON) en texto en negrita. Usa `parseEmphasis()` (probada).                                                                                                                                              |

### 4.2 Iconografía e identidad

| Componente | Props clave                                                                                                                                                                      | Notas                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Icon`     | `name: IconName`, `color?: ColorToken`, `size?: xs \| sm \| md \| lg \| xl \| 2xl`                                                                                               | Decorativo: oculto a lectores de pantalla.                                                                               |
| `IconBox`  | `icon`, `tone` (`primary`, `primarySoft`, `accent`, `accentSoft`, `info`, `infoSoft`, `streakSoft`, `neutral`), `size` (`sm`–`xl`), `shape` (`rounded`, `circle`), `cornerIcon?` | Icono sobre fondo. El color del icono se deriva del tono. También sirve como **nodo del temario** (`xl` + `circle`).     |
| `Avatar`   | `label?` (iniciales o número), `icon?`, `tone` (`primary`, `soft`, `neutral`, `gold`, `silver`, `bronze`), `size` (`xs`–`xl`), `ring?`                                           | Usuarios del ranking y **medallas 1/2/3** del podio (`size="xs"` + `gold/silver/bronze`). Iniciales con `getInitials()`. |
| `Logo`     | `size` (`sm` 32, `md` 64, `lg` 112 px), `ring?`, `verified?`                                                                                                                     | Logotipo oficial circular (`assets/images/logo.png`, recortado de `LogoCircle.png`). `ring` agrega aro `surface`.        |

### 4.3 Acciones

| Componente   | Props clave                                                                                                                              | Notas                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Button`     | `label`, `variant` (`primary`, `soft`, `secondary`, `ghost`, `locked`), `size` (`sm`, `md`, `lg`), `leftIcon?`, `rightIcon?`, `loading?` | `locked` siempre está deshabilitado. `loading` muestra spinner y bloquea toques (PBKDF2 tarda ~1 s).  |
| `IconButton` | `icon`, `accessibilityLabel` (obligatorio), `variant` (`surface`, `ghost`, `soft`), `size`, `shape`                                      | Atrás, perfil, chevron, "paso anterior".                                                              |
| `Tappable`   | `onPress`, `disabled`, `accessibilityLabel`, `children`                                                                                  | Área táctil sin estilo para composiciones que no son `Card` ni `Button` (nodos del temario, spec 02). |
| `ChoiceCard` | `label`, `marker` ("A"), `state` (`idle`, `selected`, `correct`, `incorrect`), `onPress`, `disabled`                                     | Opción de examen de opción múltiple (propuesta, sin captura). `accessibilityRole="radio"`.            |

### 4.4 Contenedores y composición

| Componente      | Props clave                                                                                                                                  | Notas                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Card`          | `tone` (`default`, `raised`, `outline`, `highlight`), `padding` (`none`–`lg`), `locked?`, `onPress?`                                         | Con `onPress` es un botón accesible. `locked` baja la opacidad (niveles bloqueados).                                                 |
| `ListItem`      | `title`, `subtitle?`, `overline?`, `leading?`, `trailing?`, `meta?`, `variant` (`plain`, `boxed`, `highlight`), `onPress?`, `subtitleLines?` | Patrón "icono + título + descripción + algo a la derecha". `meta` = contenido bajo el título (badge de nivel + racha en el ranking). |
| `SectionHeader` | `title`, `icon?`, `actionLabel?`, `onActionPress?`                                                                                           | Con `onActionPress` la acción es enlace cian; sin él, texto informativo ("38 Estudiantes Registrados").                              |
| `Callout`       | `text` (admite `**negrita**`), `title?`, `icon?`, `variant` (`boxed`, `plain`), `tone` (`accent`, `primary`, `muted`, `danger`)              | `boxed` = Regla de Oro; `plain` = "Requiere aprobar el Test de Nivel Básico…". También para errores de formulario/red.               |
| `AppHeader`     | `title?`, `onBack?`, `streak?`, `xp?`, `showLives?` (true), `onProfilePress?`                                                                | Sin `onBack`: logo + "CONTAITSCCH". Con `onBack`: flecha + título. Las vidas son solo visuales (observación 3 de ARCHITECTURE.md).   |

### 4.5 Indicadores

| Componente    | Props clave                                                                                                                                 | Notas                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProgressBar` | `value` (0–1, se recorta), `tone` (`primary`, `accent`, `streak`, `danger`), `size`, `accessibilityLabel?`                                  | `accessibilityRole="progressbar"` con porcentaje.                                                                                                               |
| `Badge`       | `label`, `tone` (`primary`, `accent`, `info`, `streak`, `danger`, `neutral`), `appearance` (`soft`, `solid`), `size`, `uppercase?`, `icon?` | EN CURSO, BLOQUEADO, Básico/Intermedio/Avanzado, chips de temas, "v1.0", globo "¡Toca para continuar!" (`accent` + `solid`). Siempre una línea: trunca con "…". |
| `StatPill`    | `icon`, `iconColor?`, `value` (número se formatea "1,250"), `accessibilityLabel`                                                            | Píldoras del encabezado.                                                                                                                                        |
| `StatTile`    | `label`, `value?`, `icon?`, `iconColor?`                                                                                                    | Ocupa `flex-1`: se ponen 3 en un `Row gap="sm"`.                                                                                                                |
| `Stepper`     | `steps: string[]`, `current` (índice desde 0)                                                                                               | Pasos completados muestran ✓ en verde.                                                                                                                          |

### 4.6 Formularios

| Componente  | Props clave                                                             | Notas                                                                                                                                                                     |
| ----------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TextField` | `label`, `error?`, `hint?`, `leftIcon?`, `ref?` + `TextInputProps`      | Compatible con React Hook Form (`Controller`: `value`, `onChangeText`, `onBlur`, `error={fieldState.error?.message}`). Con `secureTextEntry` agrega el botón ver/ocultar. |
| `OtpInput`  | `value`, `onChange`, `length?` (6), `error?`, `autoFocus?`, `editable?` | Un `TextInput` invisible sobre las casillas: pegar y autocompletar el código funcionan. Filtra todo lo que no sea dígito.                                                 |

### 4.7 Utilidades (`src/shared/utils`)

- `formatNumber(1250)` → `"1,250"` (locale `es-MX`).
- `getInitials('Carlos Méndez')` → `"CM"`.
- `useCountdown(45)` y `formatCountdown(45)` → `"00:45"` (`src/shared/hooks`): reenvío del código de verificación.

## 5. Mapa pantalla → componentes

| Elemento del diseño                       | Composición                                                                                                                                                                                                                             |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Encabezado de cualquier pestaña           | `<Screen header={<AppHeader streak xp onProfilePress />} scroll>`                                                                                                                                                                       |
| Saludo "¡Hola, Contador!"                 | `Row` → `Logo verified` + `Column` (`AppText overline tone=primary`, `heading`, `caption`)                                                                                                                                              |
| 5 Racha · 1,250 XP · Básico Nivel         | `Card` → `Row gap="sm"` → 3 × `StatTile`                                                                                                                                                                                                |
| Progreso de la Carrera                    | `Card` → `Row` (`IconBox primarySoft`, títulos, `AppText stat tone=primary`) + `ProgressBar` + `Row justify=between` de captions                                                                                                        |
| "Niveles Formativos · 3 Bloques"          | `SectionHeader actionLabel`                                                                                                                                                                                                             |
| Introducción a la app                     | `ListItem variant=boxed leading={IconBox} trailing={IconButton chevron-right}` + `Badge` en `meta`                                                                                                                                      |
| "Paso 2 de 4" + barra                     | `Column` → `Row justify=between` (`AppText caption`, `StatPill`) + `ProgressBar`                                                                                                                                                        |
| Regla de Oro                              | `Callout variant=boxed tone=accent icon=scale-balance title text`                                                                                                                                                                       |
| Pie "< Continuar al ejercicio →"          | `Screen footer` → `Row gap=md` → `IconButton shape=rounded size=lg` + `Button rightIcon=arrow-right` (en `Column grow`)                                                                                                                 |
| Objetivos del Proyecto                    | `SectionHeader icon=flag-outline` + `ListItem variant=boxed leading={IconBox}`                                                                                                                                                          |
| Equipo y Colaboradores                    | `Card` → varios `ListItem variant=plain` (el primero con `overline`)                                                                                                                                                                    |
| Chips "Partida Doble", "Cuentas T"        | `Row wrap gap=sm` → `Badge size=md icon`                                                                                                                                                                                                |
| Stepper del registro                      | `Stepper steps={['Tus Datos','Verificación']} current={1}`                                                                                                                                                                              |
| Tarjeta "Confirma tu Correo"              | `Card padding=lg` → `Column align=center gap=lg` → `IconBox info circle lg`, textos, `OtpInput`, `Badge icon=clock-outline` ("Reenviar en 00:45"), `Button leftIcon=check-decagram-outline`, `Button variant=ghost leftIcon=arrow-left` |
| Beneficios (Certificado · Ligas · Seguro) | `Card` → `Row` → `Column align=center` (`Icon` + `AppText caption`) separados por `Divider vertical`                                                                                                                                    |

## 6. Componentes de feature (siguiente paso)

Se crean en `src/features/<feature>/presentation/components/` **componiendo solo `@/shared/ui`** (sin `className`). Si alguno necesita un estilo que el kit no tiene, se agrega una variante al componente de `shared/ui`, no clases en la feature.

| Componente (feature)                            | Props propuestas                                                                                                                                            | Receta                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LevelCard` (`levels`)                          | `name`, `subtitle`, `description`, `icon`, `status: 'inProgress' \| 'completed' \| 'locked'`, `completedTopics`, `totalTopics`, `unlockHint?`, `onContinue` | `Card locked={status==='locked'}`; header `Row` con `IconBox` (`primary` si activo, `neutral` si bloqueado) + `Badge` (EN CURSO `primary` / COMPLETADO / BLOQUEADO `neutral`, `uppercase`) + `Icon` de estado; `ProgressBar`; `Callout variant=plain` con `unlockHint`; `Button` (`primary` "Continuar Nivel" o `locked` "Bloqueado" con `lock-outline`). Un mapa `status → props` reemplaza los `if` de estilo. |
| `ModuleHeaderCard` (`learning`)                 | `moduleNumber`, `title`, `subtitle`, `levelName`, `completed`, `total`                                                                                      | `Card` → `Row justify=between` (`AppText overline` con `Icon school-outline`, `Badge`) + títulos + `ProgressBar` + `Row justify=between` ("Tema 4 de 7 completados" / "57%").                                                                                                                                                                                                                                    |
| `TopicNode` (`learning`)                        | `title`, `order`, `status: 'completed' \| 'active' \| 'locked'`, `progressLabel?` ("2/3"), `onPress`                                                        | `Column align=center` → `Badge accent solid icon=play` (solo activo) + `IconBox xl circle` (`primary`+`check` / `accent`+`book-open-variant` / `neutral`+`lock-outline`) + `Badge neutral size=md` con el título. Bloqueado: sin `onPress`.                                                                                                                                                                      |
| `TopicPath` (`learning`)                        | `nodes: TopicNodeVm[]`                                                                                                                                      | `react-native-svg`: `Path` curvo continuo (`colors.primary`) hasta el último completado y punteado (`strokeDasharray`, `colors.surface`) después; los `TopicNode` se posicionan alternando izquierda/derecha. Halo del activo: `Circle` con `colors.accent` y `opacity` 0.2.                                                                                                                                     |
| `ExamNode` (`learning`)                         | `levelName`, `locked`                                                                                                                                       | `Card tone=raised` cuadrada + `Icon` + `AppText tone=streak` "Examen Final Básico" + caption.                                                                                                                                                                                                                                                                                                                    |
| `ContinueTopicBar` (`learning`)                 | `topicTitle`, `onPress`                                                                                                                                     | Para `Screen footer`: `Card tone=raised padding=sm` → `Row` (`IconBox accent` `play-circle-outline`, `Column grow` con caption + `AppText heading numberOfLines=1`, `Button size=sm rightIcon=arrow-right`).                                                                                                                                                                                                     |
| `TAccountCard` (`learning`, bloque `t_account`) | `debit`, `credit` (`{ label, items[] }`)                                                                                                                    | `Row gap=sm align=stretch` → 2 × `Card grow` con título (punto + "DEBE" `primary` / "HABER" `accent`), caption del lado, items con `Icon plus-circle-outline`/`minus-circle-outline` según el prefijo `+`/`−` del texto.                                                                                                                                                                                         |
| `SubtopicRenderer` (`learning`)                 | `blocks: Block[]`                                                                                                                                           | Registry por `block.type`: `paragraph` → `RichText`; `t_account` → `TAccountCard`; `callout` → `Callout boxed`; `example` → `Callout boxed tone=primary`. Bloque nuevo = esquema Zod + entrada en el registro.                                                                                                                                                                                                   |
| `QuestionView` (`exams`)                        | según `QuestionTypeRegistry`                                                                                                                                | Opción múltiple: `Column gap=sm` de `ChoiceCard`. Complementaria: `TextField`. Progreso "7/10": `AppText` + `ProgressBar`.                                                                                                                                                                                                                                                                                       |
| `Podium` (`leaderboard`)                        | `top3: LeaderboardEntryVm[]`                                                                                                                                | `Card` → `Row align=end` de 3 `PodiumSpot` (orden 2-1-3). `PodiumSpot`: `Icon crown streak` (solo 1.º), `Avatar xl/lg` con `Avatar xs gold/silver/bronze` superpuesto, nombre, XP `primary`, racha; base `Card tone=raised` con altura por posición (`style={{ height }}`, único estilo en línea permitido: es dato, no diseño).                                                                                 |
| `LeaderboardRow` (`leaderboard`)                | `position`, `fullName`, `levelName`, `streak`, `xp`, `isMe`                                                                                                 | `ListItem variant={isMe ? 'highlight' : 'boxed'}`; `leading` = `Row` (`AppText stat` con tono `streak`/`silver`/`bronze` en el top 3) + `Avatar label={getInitials(name)} tone={isMe ? 'soft' : position===1 ? 'primary' : 'neutral'}`; `meta` = `Row` (`Badge` de nivel + `Icon fire` + racha); `trailing` = XP. Lista con `FlatList`.                                                                          |
| `MyPositionBar` (`leaderboard`)                 | `position`, `xp`, `xpToPodium`, `onPress`                                                                                                                   | Para `Screen footer`: `Card tone=raised padding=sm` → `Row` (`Avatar soft "#5"`, textos, `Button variant=soft size=sm rightIcon=arrow-up` "Subir").                                                                                                                                                                                                                                                              |
| `RegisterHero` (`auth`)                         | —                                                                                                                                                           | `Badge primary uppercase` "REGISTRO OFICIAL" + `Logo lg ring verified` + `AppText title align=center` + `caption`.                                                                                                                                                                                                                                                                                               |

Tonos por nivel (para `Badge` y `LevelCard`): Básico → `neutral`, Intermedio → `info`, Avanzado → `primary`. Conviene un mapa único `levelTone` en `levels/presentation` exportado por su `index.ts`, para que `leaderboard` no lo duplique.

## 7. Reglas de uso

1. **Pantallas y features no usan `className`** ni importan `tailwind-variants`. Componen `@/shared/ui`.
2. **Estados = variantes.** Un estado nuevo (p. ej. `completed` en `LevelCard`) se mapea a props existentes; si no alcanza, se agrega una variante en `shared/ui` con su caso en el spec.
3. **Colores solo por token.** En SVG: `colors.primary` de `@/shared/theme`. Prohibido `#hex` fuera de `colors.js`.
4. **Un componente por archivo**, props con `type`, exportado en `src/shared/ui/index.ts`.
5. **Nada de lógica de negocio en `shared/ui`:** reciben números y textos ya calculados (XP, racha, progreso los calcula el dominio).
6. **Textos de UI** en español; los componentes no traen textos fijos salvo etiquetas de accesibilidad genéricas ("Regresar", "Perfil", "Mostrar contraseña").

## 8. Accesibilidad

- Botones solo-icono exigen `accessibilityLabel` por tipo (`IconButton`).
- `Card`/`ListItem` con `onPress` se anuncian como botón; `ChoiceCard` como `radio` con `selected`.
- `ProgressBar` expone `progressbar` + porcentaje; `Stepper` anuncia "Paso N de M: nombre"; `StatPill`/`StatTile` se leen como una sola frase ("Racha de 5 días").
- Iconos decorativos ocultos a lectores de pantalla.
- Objetivo táctil mínimo 44 px (`IconButton size="sm"` agrega `hitSlop`).
- Errores de `TextField` con `accessibilityLiveRegion="polite"`.

## 9. Pruebas

| Archivo                           | Qué cubre                                                      |
| --------------------------------- | -------------------------------------------------------------- |
| `shared/ui/Button.test.tsx`       | Toque, `loading` deshabilita, `locked` siempre deshabilitado   |
| `shared/ui/OtpInput.test.tsx`     | Un dígito por casilla; filtra no dígitos y respeta la longitud |
| `shared/ui/ProgressBar.test.tsx`  | Valor accesible y recorte fuera de 0..1                        |
| `shared/ui/TextField.test.tsx`    | Mensaje de error; ver/ocultar contraseña                       |
| `shared/ui/Stepper.test.tsx`      | Anuncio del paso y paso completado                             |
| `shared/ui/parseEmphasis.test.ts` | Segmentos en negrita y marcas incompletas                      |
| `shared/utils/*.test.ts`          | `getInitials`, `formatNumber`                                  |

`jest.setup.js` reemplaza `@expo/vector-icons/MaterialCommunityIcons` por un nodo vacío (la fuente no se puede cargar en Jest).

## 10. Decisiones y pendientes

| #   | Tema                                       | Decisión / pendiente                                                                                                                            |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Degradado cian→verde de las barras         | Se usa color sólido. Si se quiere el degradado, agregar `expo-linear-gradient` (`npx expo install`) y una variante `gradient` en `ProgressBar`. |
| 2   | Logotipo oficial                           | **Resuelto:** `LogoCircle.png` recortado en círculo → `logo.png` (componente y splash), iconos de iOS/Android/web regenerados (sección 11).     |
| 3   | Captura de pregunta de examen              | No existe; `ChoiceCard` es propuesta y se ajusta cuando llegue la captura. Sugerido: renombrar `examen-pregunta.png` → `mapa-temario.png`.      |
| 4   | "+150 XP hoy", corazones/vidas             | Solo visual hasta confirmar con el cliente (observación 3 de ARCHITECTURE.md). `AppHeader` muestra vidas ∞ por defecto (`showLives`).           |
| 5   | Animaciones (halo del tema activo, barras) | Fuera de este spec. Hacerlas con Reanimated en los componentes de feature, manteniendo las mismas props.                                        |
| 6   | Iconos de las pestañas                     | **Resuelto en spec 02:** migrados a `Icon` (`map-marker-path`, `layers-outline`, `chart-bar`, `cog-outline`).                                   |
| 7   | Modo claro                                 | No contemplado: la app es solo oscura (`StatusBar style="light"`).                                                                              |

## 11. Logotipo e iconos de la app

Fuente única: `assets/images/LogoCircle.png` (1440 px, círculo de 840 px sobre fondo gris claro). Los derivados se generan recortando el círculo con borde suavizado y fondo transparente:

| Archivo                       | Tamaño | Contenido                                                                          | Lo usa                                   |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| `logo.png`                    | 512    | Círculo, fondo transparente                                                        | Componente `Logo`                        |
| `icon.png`                    | 1024   | Círculo al 80 % sobre `bg` opaco (iOS no admite transparencia y aplica su máscara) | `expo.icon` (iOS y por defecto)          |
| `android-icon-foreground.png` | 1024   | Círculo de 600 px dentro de la zona segura del icono adaptativo (66/108)           | `android.adaptiveIcon` + fondo `#0A1628` |
| `android-icon-monochrome.png` | 1024   | Silueta blanca del círculo con el glifo calado (iconos temáticos de Android 13+)   | `android.adaptiveIcon.monochromeImage`   |
| `splash-icon.png`             | 512    | Igual que `logo.png`                                                               | `expo-splash-screen` (`imageWidth` 140)  |
| `favicon.png`                 | 48     | Círculo, fondo transparente                                                        | Web                                      |

Se eliminaron el icono de Expo para iOS (`assets/expo.icon`, formato Icon Composer) y `android-icon-background.png` (el fondo ahora es el color sólido `#0A1628`). Si cambia el logotipo, reemplazar `LogoCircle.png` y regenerar estos archivos con el mismo recorte. Los iconos nativos solo se ven en un build (`npx expo prebuild` / EAS); en Expo Go se muestra el icono de Expo Go.
