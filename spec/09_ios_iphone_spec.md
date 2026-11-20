# 09 — Versión para iPhone (iOS) sin afectar Android

- **Estado:** 18 de noviembre de 2026. **Ruta elegida: versión web** que se agrega a la pantalla de
  inicio (sección 0), gratuita. La app nativa de iOS (secciones 1 a 6) queda para cuando haya cuenta
  de Apple (I1). La corrección de sesión de la fase 1 ya está en el código compartido (spec 10, D9).
- **Antecedentes:** `spec/08_produccion_supabase_y_apk_spec.md` (APK, EAS Build y EAS Update ya funcionando).

## 0. Versión web para iPhone (elegida)

Instalar una app nativa en iPhones ajenos exige el Apple Developer Program (99 USD/año). La alternativa
gratuita es la versión web de la misma app, que el alumno agrega a la pantalla de inicio desde Safari.

Todo lo de la versión web (cómo funciona, archivos, reglas para no afectar Android, pruebas, publicación
y problemas resueltos) está en **`spec/10_version_web_safari_spec.md`**. El primer diseño descrito aquí
(expo-sqlite con OPFS y encabezados COOP/COEP) se reemplazó por sql.js + IndexedDB: OPFS no funcionaba
en iPhone.

## 1. Objetivo

1. La misma app (mismo código, mismo Supabase, mismo contenido) instalada en iPhone para probarla con
   usuarios reales.
2. **Android no cambia.** El APK repartido sigue funcionando y no hay que reinstalarlo. Los cambios de JS
   que pida iOS le llegan por EAS Update solo si también son correctos en Android (pruebas + regresión).
3. Desde ahí, una sola publicación de EAS Update corrige las dos plataformas.

Fuera de alcance: publicar en la App Store (se deja anotado lo que pediría), iPad y la versión web.

## 2. Situación actual

El código ya es multiplataforma (React Native + Expo). La revisión encontró:

| Tema                          | Hoy                                                                                 | Para iOS                                                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependencias nativas          | Todas son de Expo o tienen soporte iOS (SQLite, SecureStore, Crypto, NetInfo, SVG…) | Nada que cambiar. **No se agrega ninguna dependencia nativa.**                                                                              |
| `app.json`                    | Solo bloque `android`                                                               | Agregar bloque `ios` (identificador, export de cifrado, sin iPad). Android lo ignora.                                                       |
| `eas.json`                    | Perfiles `preview` (APK) y `production`                                             | Agregar perfil `testflight` y su `submit`. Los perfiles de Android no se tocan.                                                             |
| Ícono                         | `icon.png` 1024×1024 **RGB sin transparencia**                                      | Válido para iOS tal cual (Apple rechaza íconos con transparencia).                                                                          |
| Splash                        | Plugin `expo-splash-screen` con modo oscuro                                         | Funciona igual en iOS.                                                                                                                      |
| Teclado en formularios        | `Screen` ya usa `KeyboardAvoidingView` con `padding` en iOS                         | Solo verificar en un iPhone real.                                                                                                           |
| Zonas seguras (notch, isla)   | `Screen`, `Figure` y las pestañas usan `useSafeAreaInsets`                          | Solo verificar.                                                                                                                             |
| Sombras                       | `shared/ui` no usa `shadow`/`elevation` (el botón 3D es con bordes)                 | Nada: se ve igual.                                                                                                                          |
| **Sesión tras desinstalar**   | La sesión vive en SecureStore                                                       | **Error real en iOS:** el Llavero (Keychain) **sobrevive a la desinstalación** pero SQLite no. Ver fase 1.                                  |
| Teclado numérico (código OTP) | `OtpInput` con `number-pad`                                                         | En iOS ese teclado no tiene tecla "Listo". Solo importa si se enciende la verificación de correo; verificar que el código se envíe a los 6. |
| Gesto de regresar (deslizar)  | Android: botón atrás. iOS: deslizar desde el borde                                  | Mismo efecto que el botón atrás de Android (el ejercicio solo se guarda al terminar). Sin cambio.                                           |
| Variables `EXPO_PUBLIC_*`     | En EAS, entorno `preview`                                                           | Las mismas sirven para iOS: no se crea nada.                                                                                                |

## 3. Decisiones

| #   | Decisión                    | Propuesta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1  | **Cuenta de Apple**         | **Pendiente.** Instalar una app propia en el iPhone de otra persona exige el **Apple Developer Program: 99 USD al año**. No hay alternativa gratuita: ni el APK de iOS (`.ipa`) se puede pasar por WhatsApp, ni Expo Go sirve ya sin esa cuenta. Opciones: (a) cuenta **individual** del equipo, se paga y queda lista en 1-2 días; (b) cuenta de **organización del ITSCCH** con **exención de la cuota** para instituciones educativas acreditadas: gratis, pero la tramita el representante legal del instituto, pide número D-U-N-S y tarda semanas. |
| I2  | Mac                         | **No hace falta.** EAS Build compila en la nube y maneja certificados y perfiles. Lo único es que no hay simulador de iPhone en Windows: se prueba en un **iPhone físico**.                                                                                                                                                                                                                                                                                                                                                                              |
| I3  | **Forma de reparto**        | **Recomendada: TestFlight** (app oficial de Apple). Con enlace público admite hasta 10 000 probadores, no hay que registrar teléfonos y no pide "Modo de desarrollador". La primera versión pasa una revisión beta de Apple (~1 día). Alternativa para el primer iPhone del equipo: **distribución interna (ad hoc)** con el perfil `preview` — cada iPhone se registra con `eas device:create`, máximo 100 por año, hay que recompilar al sumar teléfonos y activar el Modo de desarrollador en iOS 16+.                                                |
| I4  | Identificador               | `ios.bundleIdentifier` = **`mx.edu.itscch.contaitscch`**, igual que Android. Es permanente.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| I5  | Versiones                   | La misma `version` (`1.0.0`) y la misma `runtimeVersion` para las dos plataformas. El número de build de iOS (`buildNumber`) lo incrementa EAS por separado (`appVersionSource: remote`), sin tocar el `versionCode` de Android.                                                                                                                                                                                                                                                                                                                         |
| I6  | Canal de EAS Update         | El build de TestFlight usa el canal **`preview`**, como el APK. Así `npm run update:preview` corrige las dos plataformas a la vez.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| I7  | iPad                        | `supportsTablet: false`. La app es vertical y pensada para teléfono; en iPad se abre en modo iPhone. Evita capturas y revisión de iPad.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| I8  | Cifrado (export compliance) | `ios.config.usesNonExemptEncryption: false`. La app solo usa HTTPS y PBKDF2 para la contraseña (exentos). Sin esto, App Store Connect pregunta lo mismo en cada build.                                                                                                                                                                                                                                                                                                                                                                                   |

## 4. Cómo se protege Android

| Cambio                                | Efecto en Android                                                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bloque `ios` en `app.json`            | Ninguno: el build de Android no lo lee. No cambia `version` ni `runtimeVersion` → **no hace falta un APK nuevo**.                                                                                             |
| Perfil `testflight` en `eas.json`     | Ninguno: `build:apk` sigue usando `preview` con `--platform android`.                                                                                                                                         |
| Corrección de sesión (fase 1, JS)     | Llega por EAS Update. También corrige un caso raro de Android (respaldo de Google restaurado). Pasa por pruebas y la regresión de la fase 4.                                                                  |
| `update:preview` con `--platform all` | La actualización de Android es idéntica a la de hoy; solo se agrega la de iOS.                                                                                                                                |
| Dependencias nativas                  | **Prohibido agregar o quitar** mientras dure la beta: obligaría a subir `version` y a reinstalar el APK. (Tampoco se quitan las que sobran de la plantilla: `@expo/ui`, `expo-glass-effect`, `expo-symbols`.) |

Regla: todo cambio de JS pensado para iOS usa `Platform.OS === 'ios'` o un valor que sea correcto en las
dos plataformas, y se prueba en Android antes de publicarlo.

## 5. Fases

### Fase 0 — Cuenta de Apple (usuario)

1. Decidir I1. Inscribirse en https://developer.apple.com/programs/enroll/ con un Apple ID del **proyecto**
   (no personal, igual que P3 del spec 08) y con verificación en dos pasos.
2. Esperar la aprobación (individual: horas a 2 días; organización: semanas).
3. Tener a mano un iPhone (iOS 16 o superior) para la primera prueba.

### Fase 1 — Corregir la sesión tras reinstalar (Claude)

Problema: en iPhone, al borrar la app y volver a instalarla, SecureStore aún tiene `user_id` + `api_token`
pero SQLite está vacío. El guard deja entrar, pero no hay perfil local (`GetCurrentUserUseCase` devuelve
`null`): saludo y Perfil vacíos.

Solución (simple y válida en las dos plataformas): al arrancar, si hay sesión pero el usuario no existe en
SQLite, se **cierra la sesión** y se muestra el inicio de sesión. Al entrar, `login` recupera el perfil y el
avance de la nube (ya funciona así en un teléfono nuevo).

- `features/auth/domain/usecases/DiscardOrphanSessionUseCase.ts` (+ prueba): sesión sin usuario local →
  `session.clear()`; con usuario o sin sesión → nada.
- `composition/bootstrap.ts`: ejecutarlo después de `session.load()` y antes de `startAutoSync`.
- Prueba de integración con `createTestContainer`: sesión guardada + base vacía → la app pide login.
- `npm run typecheck && npm run lint && npm test`; publicar con `update:preview` (solo Android por ahora)
  y repetir los casos 1, 6 y 14 del spec 08 en Android.

### Fase 2 — Configurar iOS (Claude prepara, usuario aprueba)

`app.json` (solo se agrega el bloque `ios`):

```json
"ios": {
  "bundleIdentifier": "mx.edu.itscch.contaitscch",
  "supportsTablet": false,
  "config": { "usesNonExemptEncryption": false }
}
```

`eas.json` (los perfiles existentes no cambian):

```json
"build": {
  "testflight": {
    "extends": "base",
    "distribution": "store",
    "environment": "preview",
    "channel": "preview",
    "autoIncrement": true
  }
},
"submit": {
  "testflight": { "ios": { "ascAppId": "<lo da App Store Connect en la fase 3>" } }
}
```

`package.json`:

- `"build:ios": "npx eas-cli@latest build --platform ios --profile testflight"`
- `"submit:ios": "npx eas-cli@latest submit --platform ios --profile testflight --latest"`
- `"build:ios:adhoc": "npx eas-cli@latest build --platform ios --profile preview"` (alternativa I3)
- `update:preview`: cambiar `--platform android` por `--platform all` **después** del primer build de iOS.

Verificar: `npx expo config --type public` muestra el bloque `ios`; `npx expo export --platform ios`
compila el bundle; el bundle de Android sigue igual (`export:embed --platform android … --reset-cache`).
Actualizar `CLAUDE.md` (Builds y Comandos).

### Fase 3 — Primer build de iOS (usuario lanza, Claude guía)

1. `npm run build:ios`. La CLI pide iniciar sesión con el Apple ID. EAS crea el identificador, el
   certificado de distribución y el perfil de aprovisionamiento, y los guarda (como el keystore de Android).
2. En https://appstoreconnect.apple.com crear la app ("CONTAITSCCH", idioma español (México), bundle
   `mx.edu.itscch.contaitscch`). Copiar su **Apple ID numérico** a `ascAppId`.
3. `npm run submit:ios` sube el build a TestFlight (Apple lo procesa en 10-30 min).
4. Si llega un correo de Apple por "privacy manifest" (`ITMS-91053`), agregar `ios.privacyManifests` en
   `app.json` con las APIs que nombre y recompilar.

Alternativa ad hoc: `npx eas-cli@latest device:create` (abre un enlace en el iPhone para registrarlo),
`npm run build:ios:adhoc`, activar _Ajustes → Privacidad y seguridad → Modo de desarrollador_ e instalar
desde el enlace o QR de EAS.

### Fase 4 — Prueba de humo (usuario, en iPhone y en Android)

Los 14 casos del spec 08 en el iPhone, más:

| #   | Caso                                                      | Esperado                                                                  |
| --- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| 15  | Registro y login con el teclado abierto                   | El campo activo y el botón quedan visibles; no se tapan con el teclado    |
| 16  | iPhone con isla dinámica o notch                          | La barra navy cubre la zona de estado; nada queda bajo la barra de inicio |
| 17  | Fuentes en títulos y botones                              | Plus Jakarta Sans con el grosor correcto (no la fuente del sistema)       |
| 18  | Deslizar desde el borde en una lección y en un ejercicio  | Regresa como el botón atrás de Android, sin guardar un intento incompleto |
| 19  | Borrar la app e instalarla otra vez                       | Pide iniciar sesión; al entrar recupera el avance (fase 1)                |
| 20  | Avance cruzado: aprobar en iPhone y abrir en Android      | El ranking y el Android muestran el mismo avance                          |
| 21  | `npm run update:preview` (ya con `--platform all`)        | Las dos apps reciben el cambio; Perfil muestra el nuevo id en ambas       |
| 22  | **Regresión Android:** casos 1, 4, 5, 13 y 14 del spec 08 | Igual que antes de este spec                                              |

### Fase 5 — Reparto por TestFlight (usuario)

1. **Prueba interna** (sin revisión de Apple): en App Store Connect → TestFlight, agregar al equipo como
   probadores internos (hasta 100, con acceso a App Store Connect).
2. **Prueba externa** (resto de probadores): llenar _Información de prueba_ (descripción, correo de
   contacto, cuenta de prueba para el revisor y, si la pide, URL de **aviso de privacidad**), enviar a
   revisión beta y activar el **enlace público**.
3. Mensaje para probadores: instalar **TestFlight** desde la App Store, abrir el enlace, _Instalar_. Cada
   build de TestFlight vence a los **90 días**: antes, compilar y subir otro (`build:ios` + `submit:ios`).
4. Las correcciones de JS y contenido llegan por `update:preview` a las dos plataformas, sin nuevo build.

### Fase 6 — Si después se publica en tiendas (no es parte de la beta)

- **Eliminar cuenta desde la app:** la App Store (5.1.1(v)) y Google Play lo exigen a toda app que permite
  crear cuentas. Sería una RPC `delete_account` (con `private.is_owner`) y un botón en Perfil; le sirve a
  las dos plataformas. Conviene hacerlo antes de la revisión beta externa por si Apple lo señala.
- Aviso de privacidad publicado en una URL (también lo pide Google Play).
- No se exige "Iniciar sesión con Apple": la app no usa inicio de sesión de terceros.
- Capturas de iPhone de 6.9" para la ficha de la tienda.

## 6. Riesgos

| Riesgo                                         | Atención                                                                                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Costo de Apple (99 USD/año)                    | Inevitable para iOS. La exención para el ITSCCH lo elimina, pero es lenta; puede empezarse con cuenta individual y migrar después. |
| No hay Mac ni simulador                        | Cada prueba de iOS es en un iPhone real; los errores se diagnostican con los logs de EAS y lo que reporte el probador.             |
| La revisión beta de Apple rechaza la versión   | Responder en App Store Connect; lo más probable es pedir cuenta de prueba, aviso de privacidad o eliminar cuenta (fase 6).         |
| Builds de TestFlight vencen a los 90 días      | Recordatorio para recompilar; el avance está en SQLite y en la nube, no se pierde al instalar el build nuevo.                      |
| Un `update:preview` roto afecta a las dos apps | Probarlo antes en un teléfono de cada plataforma; si falla, `update:republish` de la anterior (como en el spec 08).                |
| Un cambio nativo pensado para iOS              | Prohibido durante la beta (sección 4). Si fuera inevitable: subir `version`, nuevo APK **y** nuevo build de iOS.                   |
| Perder las credenciales de Apple               | Las guarda EAS; respaldo con `npx eas-cli@latest credentials -p ios`.                                                              |
