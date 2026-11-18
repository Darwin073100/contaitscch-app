# 08 — Salida a producción: Supabase en la nube y APK de prueba

- **Estado:** en curso. Decisiones confirmadas el 17 de noviembre de 2026: P1, P5 y P8.
  - Fase 0 ✔ (18 nov): verificaciones en verde. Pendiente: `npx expo install --fix` (6 paquetes del SDK
    bloqueados un día por la regla de pnpm) y reinstalar `node_modules` (copia doble de `expo-font`).
  - Fase 1 ✔ (18 nov): la nube tenía el esquema v1 sin historial; se alineó con `db reset --linked` y
    quedaron las 10 migraciones. Security Advisor sin avisos; `curl` a `get_login_params` responde.
  - Fase 2 ✔ (18 nov): proyecto EAS `@contaitscchs-team/contaitscch-app`, `eas.json` (sin perfil
    `development`: el proyecto usa Expo Go), `expo-updates`, versión en Perfil (`updateId` en lugar del
    número de build: `expo-application` quedó bloqueado por la regla de pnpm y no hace falta).
    Pendiente: las variables de EAS (las crea el usuario).
- **Fecha:** 17 de noviembre de 2026
- **Rama base:** `refactor/cliente-v2` (se fusiona a `main` antes del primer build).
- **Antecedentes:** `supabase/README.md` (Supabase local), `spec/07_auth_optional_email_verification_spec.md`
  (verificación apagada), `docs/ARCHITECTURE.md` → "Pendientes y riesgos".

## 1. Objetivo

1. El proyecto de Supabase **que ya existe en la nube** queda con todas las migraciones y cualquier persona
   se puede registrar desde la app (verificación de correo apagada).
2. Un **APK** de Android compilado contra ese Supabase, que se pueda pasar por WhatsApp, Drive o un enlace
   para que otras personas lo instalen y prueben la app, y que reciba correcciones con **EAS Update** sin
   reinstalar.
3. Cuando el cliente apruebe, se **borran todos los datos** de la nube para que el uso real empiece de cero
   (fase 7).

Fuera de alcance: publicar en Google Play, iOS, encender la verificación de correo (falta proveedor, se
planea Resend) y la versión web.

## 2. Situación actual

| Tema                   | Hoy                                                                | Falta                                                                      |
| ---------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Supabase               | Local (Docker) + un proyecto en la nube (el del MCP, solo lectura) | Confirmar qué migraciones tiene la nube y aplicar las que falten de las 10 |
| Variables de la app    | `.env.local` (en `.gitignore`)                                     | Variables en **EAS**: el builder en la nube no recibe `.env.local`         |
| Configuración Android  | `app.json` sin `android.package` ni `versionCode`                  | Identificador del paquete, número de versión y `eas.json`                  |
| Build                  | Solo `npx expo export` (bundle)                                    | Perfil `preview` que genere `.apk` firmado                                 |
| Actualizaciones OTA    | No hay `expo-updates`                                              | Instalarlo y configurarlo **antes** del primer APK que se reparta          |
| Ícono / splash         | `icon.png` y el ícono adaptable ya son de 1024×1024                | Revisarlo en un teléfono real (recorte del ícono adaptable)                |
| Verificación de correo | Apagada por omisión (`private.settings`)                           | Nada: en la nube queda apagada al aplicar la migración                     |

Si faltan las variables, `createSupabaseClient()` (`src/core/network/supabaseClient.ts`) lanza un error al
arrancar y la app lo muestra en pantalla. Por eso un APK compilado sin las variables de EAS **no funciona**.

## 3. Decisiones

| #   | Decisión                       | Resultado                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Proyecto de Supabase           | **Confirmada: se reutiliza el proyecto que ya existe** en la nube. Durante la beta, Supabase **local** es el único entorno de desarrollo: cada migración se prueba ahí (`db reset` + `test db`) antes de subirla. El MCP de Claude Code apunta a este proyecto en **solo lectura**: sirve para revisar los datos y los logs de la beta, nunca para escribir.                                                  |
| P2  | Región                         | La que ya tiene el proyecto. No se puede cambiar.                                                                                                                                                                                                                                                                                                                                                             |
| P3  | Dueño de las cuentas           | Cuentas del **proyecto** (correo del equipo), no personales, con los demás integrantes invitados. Así el proyecto no depende de una sola persona.                                                                                                                                                                                                                                                             |
| P4  | Cómo compilar el APK           | **EAS Build en la nube** (`npx eas-cli@latest`), perfil `preview`, `buildType: "apk"`, `distribution: "internal"`. No hace falta Android Studio. La cuota gratuita de EAS alcanza para un proyecto escolar. Alternativa sin cuota: build local (requiere JDK y SDK de Android).                                                                                                                               |
| P5  | Identificador del paquete      | **Confirmada: `mx.edu.itscch.contaitscch`.** Es permanente: si se cambia, el teléfono lo trata como otra app y no se actualiza encima de la anterior.                                                                                                                                                                                                                                                         |
| P6  | Firma del APK                  | EAS genera y guarda el keystore. Todas las versiones se firman con el mismo, así el APK nuevo se instala encima del anterior **sin perder el avance** (SQLite). Se descarga un respaldo con `eas credentials`.                                                                                                                                                                                                |
| P7  | Variables por entorno          | EAS Environment Variables: `preview` y `production` apuntan al proyecto de la nube. `.env.local` sigue apuntando a Supabase local. Las `EXPO_PUBLIC_*` quedan dentro del APK, así que su visibilidad es `plaintext` o `sensitive`, nunca `secret`.                                                                                                                                                            |
| P8  | Actualizaciones sin reinstalar | **Confirmada: EAS Update** con `expo-updates`, canal `preview`. Es poco trabajo: una dependencia, un comando de configuración y un APK nuevo. Desde ahí, los cambios de JS y de contenido JSON llegan al abrir la app. Un cambio nativo (dependencia con código nativo, `app.json`) sí necesita otro APK. `runtimeVersion` con la política `appVersion`: subir `version` en `app.json` obliga a un APK nuevo. |
| P9  | Versión visible                | Mostrar "Versión 1.0.0 (build N)" y el id corto de la actualización en Perfil, para que quien reporte un error diga qué tiene instalado.                                                                                                                                                                                                                                                                      |
| P10 | Borrón al aprobar el cliente   | Se borran **solo los datos** (`truncate`), no el esquema: las migraciones, las RPC y el interruptor de verificación se conservan. Ver fase 7.                                                                                                                                                                                                                                                                 |

## 4. Fases

Cada fase indica quién la hace. Lo que necesita cuentas, contraseñas o llaves lo hace el usuario: Claude
no lee `.env*` ni maneja secretos (ver `CLAUDE.md`, Seguridad).

### Fase 0 — Congelar la versión (Claude + usuario)

1. Rama limpia: `npm run typecheck && npm run lint && npm test`, `npm run content:validate`,
   `npx supabase test db` (pgTAP en local) y `npx expo export --platform android`.
2. `npx expo-doctor` y `npx expo install --check`: corregir lo que reporten.
3. Fusionar `refactor/cliente-v2` → `main` con un PR. Los builds de prueba salen siempre de `main`.

**Listo cuando:** todo pasa en verde y `main` tiene el código de la v2.

### Fase 1 — Supabase en la nube (usuario, con guía de Claude)

1. Vincular la CLI al proyecto existente (pide la contraseña de la base; está en el panel →
   _Settings → Database_, y se guarda en un gestor de contraseñas):

   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-del-proyecto>
   npx supabase migration list --linked
   ```

2. Según lo que muestre `migration list`:
   - **Coincide con `supabase/migrations/`** (o le faltan solo las últimas) → `npx supabase db push --dry-run`
     y luego `npx supabase db push`.
   - **No coincide** (migraciones que ya no están en el repo, nombres distintos o cambios hechos a mano en
     el panel) → como todavía no hay usuarios reales, se alinea desde cero con
     `npx supabase db reset --linked` (borra todo y aplica las 10 migraciones). Es la **única** vez, junto
     con la fase 7, en que se permite tocar la nube así, y el usuario lo confirma antes.
   - **No** ejecutar `npx supabase config push`: `config.toml` es la configuración local
     (`site_url = 127.0.0.1`…).

3. En **SQL Editor**, comprobar:

   ```sql
   select * from private.settings;                -- email_verification_required = false
   select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' order by 1;         -- register, login, sync_progress, get_ranking…
   ```

4. **Integrations → Data API**: confirmar que está encendida y que solo expone el esquema `public`
   (la app usa `supabase.rpc()` por PostgREST).
5. **Authentication → Sign In / Providers**: desactivar _Allow new users to sign up_. La app no usa
   Supabase Auth, y así nadie puede crear usuarios de Auth con la llave pública.
6. **Advisors → Security Advisor**: revisar que no haya avisos de tablas sin RLS ni funciones con
   `search_path` mutable. Si aparece algo, se corrige con una migración nueva probada en local.
7. **Settings → API Keys**: copiar la URL (`https://<ref>.supabase.co`) y la **Publishable key**
   (`sb_publishable_…`). La _Secret key_ **no** va en la app.
8. Prueba rápida sin la app (Git Bash):

   ```bash
   curl -X POST "https://<ref>.supabase.co/rest/v1/rpc/get_login_params" \
     -H "apikey: <publishable>" -H "Content-Type: application/json" \
     -d '{"p_email":"prueba@ejemplo.com"}'
   ```

   Debe responder una sal y las iteraciones (la sal falsa estable para correos que no existen).

9. `npx supabase unlink` al terminar, para que ningún comando posterior toque la nube por accidente.
10. Edge Function `send-verification`: **no se despliega todavía** (la verificación está apagada). Se
    despliega cuando haya proveedor de correo (spec aparte).

**Listo cuando:** `migration list --linked` muestra las 10 aplicadas, el `curl` responde y el Security
Advisor no muestra avisos.

### Fase 2 — Configurar EAS, Android y EAS Update (Claude prepara, usuario aprueba)

Antes de escribir la configuración, Claude revisa la documentación de EAS Build, Environment variables y
EAS Update para el SDK 58 (https://docs.expo.dev/llms.txt), como pide `AGENTS.md`. Los fragmentos de
abajo son la forma esperada y se ajustan a lo que diga la documentación.

1. El usuario crea la cuenta de Expo (P3) y ejecuta `npx eas-cli@latest login`.
2. `npx eas-cli@latest init`: crea el proyecto en EAS y agrega `extra.eas.projectId` y `owner` en `app.json`.
3. `app.json` (Claude):

   ```json
   "android": {
     "package": "mx.edu.itscch.contaitscch",
     "adaptiveIcon": { "...": "como está" },
     "predictiveBackGestureEnabled": false
   },
   "runtimeVersion": { "policy": "appVersion" }
   ```

   `version` se queda en `1.0.0`. El `versionCode` lo lleva EAS (`appVersionSource: "remote"`).

4. EAS Update (Claude): `npx expo install expo-updates` y `npx eas-cli@latest update:configure`. Agrega
   `updates.url` a `app.json` y el `channel` a los perfiles de `eas.json`.
5. `eas.json` (Claude):

   ```json
   {
     "cli": { "version": ">= 16.0.0", "appVersionSource": "remote" },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal",
         "environment": "development"
       },
       "preview": {
         "distribution": "internal",
         "environment": "preview",
         "channel": "preview",
         "autoIncrement": true,
         "android": { "buildType": "apk" }
       },
       "production": {
         "environment": "production",
         "channel": "production",
         "autoIncrement": true,
         "android": { "buildType": "app-bundle" }
       }
     }
   }
   ```

6. Variables en EAS (usuario; los valores salen de la fase 1, paso 7). Las mismas sirven para el build y
   para `eas update`:

   ```bash
   # Una vez por ambiente: preview (APK de prueba) y production
   npx eas-cli@latest env:set --environment preview --visibility plaintext \
     --name EXPO_PUBLIC_SUPABASE_URL --value "https://<ref>.supabase.co"
   npx eas-cli@latest env:set --environment preview --visibility sensitive \
     --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sb_publishable_..."
   npx eas-cli@latest env:list --environment preview
   ```

7. Versión visible en Perfil (P9) (Claude): la ruta o el contenedor leen `expo-constants` y
   `expo-updates` y se los pasan a `toProfileVm` (nada de esto entra a dominio), con su prueba.
8. Scripts en `package.json` (Claude), para no escribir los comandos largos:
   - `build:apk` → `eas-cli build --platform android --profile preview`
   - `update:preview` → `eas-cli update --channel preview --environment preview`
9. Documentación (Claude): sección "Nube" en `supabase/README.md` (el proyecto de la nube es el de la beta;
   local es desarrollo), comandos de EAS en `CLAUDE.md` (y corregir que el MCP apunta "al proyecto de
   desarrollo") y "Pendientes y riesgos" de `docs/ARCHITECTURE.md`.

**Listo cuando:** `npm run typecheck && npm run lint && npm test` pasan, `npx expo export --platform android`
compila, `npx expo config --type public` muestra el `package`, `runtimeVersion` y `updates.url`, y
`env:list` muestra las dos variables.

### Fase 3 — Primer APK (usuario lanza el build)

```bash
npm run build:apk
```

- La primera vez pregunta si genera el keystore: **sí** (P6). Después hay que descargar el respaldo:
  `npx eas-cli@latest credentials` → Android → _Download credentials_, y guardarlo fuera del repositorio
  (`*.jks` ya está en `.gitignore`).
- El build tarda de 10 a 30 minutos (más si hay fila en el plan gratuito). Al terminar, EAS da un
  **enlace y un código QR** para descargar el `.apk`.

**Listo cuando:** el APK se instala en un teléfono propio y pasa la prueba de humo (fase 4).

### Fase 4 — Prueba de humo en teléfonos reales (usuario, lista de Claude)

Mínimo **dos teléfonos Android** (uno de gama baja) y dos cuentas:

| #   | Caso                                                    | Esperado                                                                                                               |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Instalar el APK y abrirlo                               | Abre sin la pantalla de error de configuración                                                                         |
| 2   | Registrarse con datos reales                            | Entra directo a Niveles (sin código)                                                                                   |
| 3   | Registrarse otra vez con el mismo correo                | "Este correo ya tiene una cuenta"                                                                                      |
| 4   | Aprobar N1-L1 y N1-L2                                   | Se desbloquea el siguiente tema; el indicador pasa a "sincronizado"                                                    |
| 5   | Modo avión: aprobar otro tema                           | "Pendiente (1)"; al quitar el modo avión se sincroniza solo                                                            |
| 6   | Iniciar sesión con la misma cuenta en el teléfono 2     | Recupera el avance del teléfono 1                                                                                      |
| 7   | Ranking con las dos cuentas                             | Aparecen las dos, ordenadas, sin correos                                                                               |
| 8   | Ranking sin red                                         | "Ranking de hace X"                                                                                                    |
| 9   | Reiniciar mi avance en el teléfono 1 y sincronizar el 2 | El teléfono 2 recibe el avance vacío (`replace`) y no vuelve a subirlo                                                 |
| 10  | Cerrar sesión e iniciar con contraseña incorrecta       | Mensaje genérico                                                                                                       |
| 11  | Modo oscuro del sistema                                 | Colores correctos en todas las pestañas                                                                                |
| 12  | Ícono, nombre y splash en el lanzador                   | Ícono sin recorte raro, nombre "CONTAITSCCH"                                                                           |
| 13  | `npm run update:preview` con un cambio de texto         | Al cerrar y volver a abrir la app (a veces dos veces) aparece el texto nuevo y Perfil muestra otro id de actualización |
| 14  | Instalar un segundo APK (build N+1) encima              | Se actualiza sin desinstalar y conserva sesión y avance                                                                |

En el **Table Editor** se confirman las filas en `profile` y `quiz_progress`.

### Fase 5 — Repartir el APK y mantener la beta (usuario)

1. Compartir el **enlace de EAS** o descargar el `.apk` y mandarlo por WhatsApp o Drive.
2. Instrucciones para quienes lo prueban (Claude redacta un texto corto para pegar en el grupo):
   - Abrir el archivo y permitir "Instalar apps desconocidas" para WhatsApp, Drive o el navegador.
   - Si Play Protect avisa "App no analizada", elegir **Instalar de todos modos** (pasa con cualquier APK
     fuera de Google Play).
   - Cómo reportar errores: captura, modelo del teléfono y la versión que muestra Perfil (P9).
3. Correcciones durante la beta:

   | Cambio                                                          | Cómo llega a los teléfonos                                                                |
   | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
   | Código JS/TS, textos, contenido JSON (subir `manifest.version`) | `npm run update:preview`; llega al abrir la app                                           |
   | Dependencia nativa nueva, `app.json`, ícono, splash             | Subir `version` en `app.json` + `npm run build:apk` + enlace nuevo                        |
   | Base de datos                                                   | Migración nueva probada en local + `db push` (nada que borre datos de testers sin avisar) |

   Antes de cada `update:preview` o build: `npm run typecheck && npm run lint && npm test`.

### Fase 6 — Riesgos de la beta

| Riesgo                                                     | Atención                                                                                                                                                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **El plan gratuito pausa el proyecto tras 7 días sin uso** | Durante las pruebas el uso diario lo evita. Si se pausa: panel → _Restore project_ (los datos se conservan). Mientras está pausado la app sigue funcionando offline; registro, login, sincronización y ranking fallan con el mensaje de "sin conexión". |
| Registros basura o automatizados (`register` es público)   | Aceptable en una beta escolar. Se revisa el Table Editor y se borran las filas. Si pasa, se agrega un límite por tiempo en una migración, o se enciende la verificación de correo.                                                                      |
| Datos personales (nombre, correo, ubicación)               | Agregar un **aviso de privacidad** breve (qué se guarda, para qué y que los datos de la beta se borran al terminar) en "Conoce CONTAITSCCH" o en el registro, antes de repartir el APK fuera del equipo (LFPDPPP).                                      |
| Perder el keystore                                         | Respaldo en la fase 3. Sin él, ninguna versión nueva se puede instalar encima y todos tendrían que desinstalar y perder el avance local.                                                                                                                |
| Un `update:preview` con un error rompe la app de todos     | Probarlo antes en un teléfono propio; si falla, `npx eas-cli@latest update:republish` de la actualización anterior (o publicar la corrección).                                                                                                          |
| Tocar la nube por error desde la CLI                       | `unlink` al terminar la fase 1; el MCP es de solo lectura; `db reset --linked` solo en la fase 1 (si hace falta alinear) y nunca después de que haya usuarios reales; nunca `config push`.                                                              |
| Cambiar ids del contenido después de repartir el APK       | Prohibido (`CLAUDE.md`, Contenido JSON): Supabase guarda `quiz_id` y el avance de los usuarios se corrompería.                                                                                                                                          |
| Sin entorno de nube para probar migraciones (P1)           | Supabase local es idéntico en esquema; cada migración pasa `db reset` + `test db` en local antes del `db push`.                                                                                                                                         |
| Contenido fiscal (IVA, ISR)                                | Sigue pendiente la revisión de un contador antes de un uso oficial (ver `docs/ARCHITECTURE.md`).                                                                                                                                                        |

### Fase 7 — Borrón y cuenta nueva al aprobar el cliente (usuario confirma, Claude prepara)

Se hace **una sola vez**, cuando el cliente da el visto bueno.

1. Último `update:preview` o APK con la versión aprobada (o el build `production` si se decide otro canal).
2. En **SQL Editor** de la nube, primero revisar qué se va a borrar y luego borrarlo en una transacción:

   ```sql
   select count(*) from public.profile;           -- cuentas de la beta
   select count(*) from public.quiz_progress;     -- avance de la beta

   begin;
   truncate public.quiz_progress, public.email_verification, public.profile;
   commit;
   ```

   Se conserva todo lo demás: esquema, RPC, permisos y `private.settings` (la verificación sigue como
   esté). No se usa `db reset --linked`: ya no hace falta reaplicar migraciones y es más fácil equivocarse.

3. Qué pasa en los teléfonos de quienes probaron (ya lo maneja la app, sin cambios de código):
   - La siguiente sincronización recibe `invalid_token` y `SyncProgressUseCase` cierra la sesión: la app
     vuelve a la pantalla de registro o inicio de sesión.
   - Al registrarse de nuevo, el teléfono no tiene generación de la cuenta nueva y la nube responde
     `replace` con el avance vacío: el avance de la beta **no se sube** a la cuenta nueva.
   - El ranking guardado en el teléfono muestra los nombres viejos hasta que se descarga el nuevo.
4. Comprobar en el Table Editor que `profile` y `quiz_progress` están vacías y registrarse una vez con una
   cuenta del equipo para confirmar que todo funciona; después borrar esa cuenta si no debe aparecer en el
   ranking.
5. A partir de aquí ya hay **usuarios reales**: ninguna migración puede borrar datos, y `db reset --linked`
   queda prohibido.

## 5. Resumen de quién hace qué

| Paso                                                                               | Usuario |     Claude     |
| ---------------------------------------------------------------------------------- | :-----: | :------------: |
| Verificaciones, `expo-doctor`, PR a `main` (fase 0)                                |    ✔    |       ✔        |
| `link`, `migration list`, `db push`, ajustes de Auth y Data API                    |    ✔    |      guía      |
| Cuenta de Expo, `eas init`, variables de EAS                                       |    ✔    |      guía      |
| `app.json`, `eas.json`, `expo-updates`, versión en Perfil, scripts y documentación | aprueba |       ✔        |
| Lanzar el build, respaldar el keystore, publicar updates                           |    ✔    |                |
| Prueba de humo en teléfonos y reparto del APK                                      |    ✔    | lista y textos |
| Borrar los datos de la beta (fase 7)                                               |    ✔    | SQL y revisión |

## 6. Criterios de terminado

- [ ] La nube tiene las 10 migraciones, el Security Advisor no muestra avisos y el registro de Auth está desactivado.
- [ ] `eas.json`, `android.package`, `runtimeVersion` y `expo-updates` en `main`; variables `EXPO_PUBLIC_*` en EAS.
- [ ] APK `preview` instalado en 2 teléfonos con los 14 casos de la fase 4 en verde (incluida una actualización OTA).
- [ ] Keystore respaldado fuera del repositorio.
- [ ] Enlace del APK e instrucciones compartidos con quienes van a probar.
- [ ] `supabase/README.md`, `CLAUDE.md` y `docs/ARCHITECTURE.md` actualizados.
- [ ] (Al aprobar el cliente) Datos de la beta borrados con la fase 7.
