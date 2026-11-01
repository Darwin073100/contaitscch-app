# 04 — Acerca de: introducción a la app (`onboarding`)

- **Estado:** implementado. Pantalla **estática** (sin datos del usuario ni red).
- **Fecha:** 1 de noviembre de 2026
- **Fuente:** `docs/design/introduccion.png`; historia "Introducción a la app" de `docs/USER_STORIES.md`; equipo proporcionado por el responsable del proyecto.
- **Depende de:** `spec/01_ui_components_spec.md` (kit `@/shared/ui`). Sin cambios en `shared/ui`.
- **Código:** `src/features/onboarding/`, ruta `src/app/acerca-de.tsx`; se abre desde Home (`spec/03`).

## 1. Objetivo y alcance

| Criterio de la historia                     | Cómo se cumple                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| Breve descripción de la app                 | Hero (nombre, versión, lema, 3 pilares) + tarjeta "¿Qué es CONTAITSCCH?".      |
| Objetivos de la app                         | Sección "Objetivos del Proyecto" (3 objetivos).                                |
| Equipo: alumnos, profesores, asesores, etc. | Sección "Equipo y Colaboradores": institución, docencia, alumnos y desarrollo. |

Navegación pedida: tocar **"Introducción a la app"** (o el enlace **"Acerca de"**) en la pestaña Niveles abre esta pantalla (`router.push('/acerca-de')`).

## 2. Decisión: pantalla estática sin dominio

El contenido no depende del usuario, del progreso ni de la red, y no cambia en tiempo de ejecución. Por eso:

- **No hay** use case, repositorio ni registro en `container.ts`. El `GetAppInfo` de ARCHITECTURE.md se omite a propósito: sería una capa que solo devolvería una constante.
- Los textos viven en `presentation/content/aboutContent.ts` (son textos de UI). Para cambiar el equipo o los objetivos se edita **solo ese archivo**.
- La versión se toma de `app.json` (`Constants.expoConfig.version`, "1.0.0" → "v1.0"): al publicar una versión nueva el badge se actualiza solo.
- Si en el futuro el contenido se descarga de Supabase o cambia por usuario, se agrega `GetAppInfoUseCase` + repositorio y el ViewModel deja de importar la constante. La pantalla no cambia.

## 3. Análisis de la captura y composición

| #   | Elemento de la captura                                                                   | Composición                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Flecha atrás, logo, título, vidas, perfil                                                | `AppHeader title="Acerca de" onBack showLives={false}`                                                                         |
| 2   | Logo grande, badge "✓ v1.0", "CONTAITSCCH", "PLATAFORMA ACADÉMICA GAMIFICADA"            | `AboutHero`: `Card outline lg` → `Logo lg`, `Badge primary icon=check-decagram-outline`, `AppText display`, `overline primary` |
| 3   | 3 tiles: Rachas Diarias · XP Puntos Progreso · Vidas Ilimitadas                          | `Row` de 3 × `StatTile` (solo icono + etiqueta): `fire` ámbar, `lightning-bolt` verde, `infinity` rojo                         |
| 4   | "¿Qué es CONTAITSCCH?" + párrafo + chips Partida Doble · Cuentas T · Estados Financieros | `AboutIntroCard`: `IconBox infoSoft school-outline` + `heading`, `AppText muted`, `Row wrap` de `Badge solid md icon`          |
| 5   | "Objetivos del Proyecto" + 3 filas                                                       | `SectionHeader icon=flag-outline` + 3 × `ListItem boxed` con `IconBox` (`primarySoft`, `accentSoft`, `infoSoft`)               |
| 6   | "Equipo y Colaboradores": institución resaltada + roles                                  | `SectionHeader icon=account-group-outline` + `TeamCard` (sección 4)                                                            |
| 7   | "♡ Desarrollado con orgullo para la comunidad estudiantil de Contaduría"                 | `Card` → `Row` (`Icon heart-outline primary` + `AppText caption semibold`)                                                     |
| 8   | Botón "¡Comenzar a Aprender! 🚀"                                                         | `Button primary rightIcon=rocket-launch-outline` → pestaña Aprender (`/`)                                                      |

## 4. Equipo y Colaboradores

`TeamCard`: `Card` → institución en `Card raised` (`ListItem` con `overline`, `IconBox primary circle domain`), luego un grupo por rol: `AppText overline accent` con el rol y un `ListItem` por persona con `Avatar` de iniciales (`getInitials`). Los grupos se separan con `Divider`.

| Rol (overline)               | Persona                           | Detalle                                                   |
| ---------------------------- | --------------------------------- | --------------------------------------------------------- |
| Institución de respaldo      | ITSSCH                            | División de Contaduría Pública                            |
| Docencia y Asesoría Contable | Doc. Maribel Domínguez Vargas     | Profesora de la asignatura que dio origen al proyecto     |
| Alumnos                      | Fátima Amada Ponce Martínez       | —                                                         |
|                              | Benelly Jolette Caballero Morales | —                                                         |
|                              | Diego Cervantes Santana           | —                                                         |
| Desarrollo y Diseño UI/UX    | Ing. Edwin Garcia Quiterio        | Arquitectura móvil, gamificación y experiencia de usuario |

Para agregar a alguien (asesores, otros docentes): añadir un objeto a `team` en `aboutContent.ts` (`{ role, members: [{ name, detail? }] }`).

## 5. Diferencias deliberadas con la captura

| Captura                                                          | Implementación                                                            | Motivo                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Encabezado "Sesion Quiz" con vidas y perfil                      | "Acerca de", sin vidas ni perfil                                          | El título de la captura es un resto de otra pantalla; aquí no aplican las estadísticas. |
| Roles genéricos (Docencia, Desarrollo, Diseño UI/UX) sin nombres | Roles con las personas reales; Desarrollo y Diseño UI/UX en un solo grupo | Los dos roles los tiene la misma persona; se agregó el grupo de Alumnos.                |
| Iconos por rol (pizarrón, `<>`, paleta)                          | `Avatar` con iniciales por persona                                        | Con nombres reales, las iniciales identifican mejor; el rol ya está en el overline.     |
| Badge de versión superpuesto al logo                             | Badge debajo del logo                                                     | Evita posicionamiento absoluto; mismo contenido.                                        |
| Iconos de los tiles en fila con el texto en dos líneas           | `StatTile` (icono arriba, etiqueta en 2 líneas)                           | Reutiliza el componente existente.                                                      |

## 6. Navegación

| Desde                                                                     | Acción                                                                          | Destino                                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Niveles: fila "Introducción a la app", su chevron y el enlace "Acerca de" | `openAbout` → `router.push('/acerca-de')`                                       | Esta pantalla (stack raíz, fuera de las pestañas, con `safeBottom`) |
| Flecha atrás                                                              | `router.back()`; sin historial (enlace profundo) → `router.replace('/niveles')` | Niveles                                                             |
| "¡Comenzar a Aprender!"                                                   | `router.navigate('/')`                                                          | Pestaña Aprender                                                    |

Nota de entorno: `.expo/types/router.d.ts` (rutas tipadas, generado por `expo start` e ignorado por git) se actualizó a mano con `/acerca-de` para que `npm run typecheck` pase sin levantar el servidor; `expo start` lo regenera igual.

## 7. Accesibilidad

- Títulos (`CONTAITSCCH`, "¿Qué es…?", secciones y roles) con `accessibilityRole="header"`.
- Cada tile se lee como una frase ("Rachas Diarias"); los iconos son decorativos.
- Flecha atrás con etiqueta "Regresar" (de `AppHeader`); botón final con texto visible.

## 8. Pendientes

| #   | Pendiente                        | Detalle                                                                                                   |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Nombre oficial de la institución | Se muestra "ITSSCH"; falta el nombre completo (la captura lo trunca: "Instituto Tecnológico Superior …"). |
| 2   | Área académica                   | "División de Contaduría Pública" viene de la captura; confirmar el nombre exacto.                         |
| 3   | Grado de la docente              | Se usa "Doc." tal como se proporcionó; si es doctora, la abreviatura usual es "Dra.".                     |
| 4   | Logotipo oficial                 | Decisión 2 de spec 01 (hoy usa el icono de la app).                                                       |
| 5   | Primera vez en la app            | La historia sugiere mostrarla antes de confiar en la app; cuando exista `auth`, enlazarla desde Welcome.  |

## 9. Pruebas

| Archivo                                                | Qué cubre                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `onboarding/presentation/screens/AboutScreen.test.tsx` | Se muestran los 5 integrantes; CTA navega a `/`; atrás sin historial va a `/niveles` |

Verificación manual en Expo: en Niveles tocar "Introducción a la app" → se abre Acerca de; la flecha regresa a Niveles; "¡Comenzar a Aprender!" abre la pestaña Aprender.
