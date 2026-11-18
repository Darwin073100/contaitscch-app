# Supabase local: cómo levantarlo y usarlo

Guía para correr Supabase en tu computadora (Windows + Docker Desktop) durante el desarrollo de CONTAITSCCH.

Supabase local es una copia completa del servidor (Postgres, API y Edge Functions) dentro de contenedores de Docker. Sirve para probar las funciones RPC y la Edge Function de correo **sin tocar el proyecto en la nube**.

> La app sigue funcionando sin Supabase: el curso y el avance viven en SQLite. Supabase hace falta para registro, verificación de correo, login, sincronizar el avance entre teléfonos y el ranking.

---

## 1. Requisitos (una sola vez)

| Requisito                                            | Cómo comprobarlo                                                |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| **Docker Desktop** instalado y abierto (motor WSL 2) | En Docker Desktop, abajo a la izquierda dice **Engine running** |
| **Node.js** y **pnpm**                               | `node -v` y `pnpm -v`                                           |
| Dependencias del proyecto instaladas                 | En la raíz del proyecto: `pnpm install`                         |
| ~6 GB libres en disco                                | Las imágenes de Supabase pesan unos 5.5 GB                      |

No instales la CLI de Supabase de forma global. Ya viene en el proyecto como dependencia de desarrollo (`supabase` en `package.json`, versión 2.x estable fijada) y se usa siempre con `npx supabase …`.

Comprueba la CLI desde la raíz del proyecto:

```bash
npx supabase --version
# 2.122.0
```

---

## 2. Primer arranque

1. Abre **Docker Desktop** y espera a que diga **Engine running**.
2. En una terminal, en la raíz del proyecto (`contaitscch-app/`):

   ```bash
   npx supabase start
   ```

   La primera vez descarga las imágenes y tarda entre 5 y 15 minutos según tu internet. Después arranca en menos de un minuto.

3. Al terminar verás una tabla con las direcciones locales:

   | Qué               | Dirección                                                 | Para qué                                               |
   | ----------------- | --------------------------------------------------------- | ------------------------------------------------------ |
   | Project URL (API) | http://127.0.0.1:54321                                    | La que usa la app (`supabase.rpc`, `functions.invoke`) |
   | Studio            | http://127.0.0.1:54323                                    | Ver tablas, datos y correr SQL desde el navegador      |
   | Base de datos     | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Conectarte con un cliente SQL (DBeaver, pgAdmin…)      |
   | Edge Functions    | http://127.0.0.1:54321/functions/v1                       | `send-verification` (correo de verificación)           |

   También muestra las llaves: **Publishable key** (`sb_publishable_…`) y **Secret key** (`sb_secret_…`). Las de local son iguales en todas las computadoras y no sirven para la nube, pero aun así no las subas al repositorio.

4. Abre Studio (http://127.0.0.1:54323) para confirmar que todo funciona.

---

## 3. Uso diario

| Quiero…                                                  | Comando                         |
| -------------------------------------------------------- | ------------------------------- |
| Encender Supabase                                        | `npx supabase start`            |
| Ver si está encendido, sus URLs y llaves                 | `npx supabase status`           |
| Apagarlo **conservando** los datos                       | `npx supabase stop`             |
| Apagarlo **borrando** todos los datos locales            | `npx supabase stop --no-backup` |
| Apagar Supabase de **todos** los proyectos de la máquina | `npx supabase stop --all`       |

Apágalo cuando no lo uses: los contenedores consumen memoria. Docker Desktop puede quedar abierto.

---

## 4. Migraciones (cambios a la base de datos)

Las tablas y funciones de Postgres se definen con archivos SQL en `supabase/migrations/`. Cada archivo es un cambio y se aplican en orden.

| Quiero…                                      | Comando                                                                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Crear una migración nueva                    | `npx supabase migration new <nombre_en_snake_case>` → crea `supabase/migrations/<fecha>_<nombre>.sql` vacío para escribir el SQL |
| Aplicar **todas** las migraciones desde cero | `npx supabase db reset`                                                                                                          |
| Ver qué migraciones hay                      | `npx supabase migration list --local`                                                                                            |
| Correr las pruebas de la base (pgTAP)        | `npx supabase test db` (archivos en `supabase/tests/`)                                                                           |

Reglas:

- `db reset` **borra todos los datos locales** (usuarios de prueba, avance…) y vuelve a crear la base con las migraciones. En local está bien; nunca lo uses con `--linked` (eso sería la nube).
- **Nunca edites una migración que ya está en git.** Para corregir algo, crea una migración nueva.
- Cada tabla nueva lleva `enable row level security` y ninguna política: solo se accede por funciones RPC (ver `CLAUDE.md`, sección Seguridad).

Funciones RPC que llama la app: `register`, `get_login_params`, `login`, `verify_email`, `sync_progress` (sube y fusiona el avance), `get_ranking` y `reset_progress`. `create_verification_code` solo la ejecuta la Edge Function (`service_role`).

---

## 5. Conectar la app (Expo) al Supabase local

La app lee dos variables de `.env.local`, en la raíz del proyecto. Ese archivo no se sube a git: créalo tú.

```bash
EXPO_PUBLIC_SUPABASE_URL=http://<IP-de-tu-PC>:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key de "npx supabase status">
```

### ¿Qué dirección poner en `EXPO_PUBLIC_SUPABASE_URL`?

`127.0.0.1` significa "este mismo aparato". En el teléfono, `127.0.0.1` es el teléfono, no tu PC.

| Dónde corre la app                                      | URL                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| Teléfono físico con Expo Go (misma red Wi‑Fi que la PC) | `http://<IP de tu PC>:54321`, por ejemplo `http://192.168.1.98:54321` |
| Emulador de Android                                     | `http://10.0.2.2:54321`                                               |
| Navegador (`npm run web`) en la misma PC                | `http://127.0.0.1:54321`                                              |

**Encontrar la IP de tu PC:** en PowerShell ejecuta `ipconfig` y busca **Adaptador de LAN inalámbrica Wi‑Fi → Dirección IPv4** (suele empezar con `192.168.`). Las direcciones `172.x.x.x` son de WSL o Docker y no sirven para el teléfono.

### Permitir la conexión en el Firewall de Windows (una vez)

El teléfono no podrá entrar al puerto 54321 hasta que lo permitas. En **PowerShell como administrador**:

```powershell
New-NetFirewallRule -DisplayName "Supabase local (API 54321)" -Direction Inbound -Protocol TCP -LocalPort 54321 -Action Allow -Profile Private
```

Tu red Wi‑Fi debe estar marcada como **privada** en Windows (Configuración → Red e Internet → Wi‑Fi → Tipo de perfil de red → Privada).

**Comprobarlo:** abre `http://<IP de tu PC>:54321/rest/v1/` en el navegador del teléfono. Si ves texto JSON, la conexión funciona.

### Después de cambiar `.env.local`

Las variables `EXPO_PUBLIC_*` se incrustan al compilar. Detén el servidor de Expo y vuelve a iniciarlo limpiando la caché:

```bash
npx expo start --clear
```

### Diferencia con la nube

En local, la API acepta peticiones aunque la llave falte o sea incorrecta. En la nube la llave sí se exige. Por eso la app siempre debe mandar la Publishable key: que funcione en local no garantiza que funcione en la nube.

---

### Verificación de correo: apagada por omisión

Mientras no haya proveedor de correo, el registro entra directo al curso sin código. El interruptor está en Postgres:

```sql
select * from private.settings;                                          -- ver el estado
update private.settings set email_verification_required = true;          -- pedir el código
update private.settings set email_verification_required = false;         -- entrar sin código
```

Ejecútalo en Studio → **SQL Editor**; en la nube, en el SQL Editor del proyecto. La app lo recibe al registrarse o iniciar sesión: no hace falta publicar otra versión. Las sesiones abiertas antes del cambio conservan lo que tenían.

### Ver el correo de verificación en local (Mailpit) — con la verificación encendida

En local, `send-verification` no usa Gmail: entrega el correo a **Mailpit**, un buzón de prueba que viene con Supabase local. Ningún correo sale a internet.

1. Regístrate en la app con cualquier correo (no tiene que existir).
2. Abre Mailpit en el navegador: http://127.0.0.1:54324. Ahí aparece "Tu código de verificación de CONTAITSCCH".
3. Escribe el código en la app y toca **Validar y Entrar al Curso**.

"Reenviar" solo funciona cada 45 segundos (`cooldown`). Para volver a probar el registro desde cero, usa **Perfil → Cerrar sesión** en la app.

Si Mailpit no está disponible, todavía puedes sacar el código a mano en Studio (http://127.0.0.1:54323) → **SQL Editor**. Esto solo funciona en local; en la nube, la función solo la puede ejecutar la Edge Function:

```sql
select public.create_verification_code(id, api_token)
from public.profile
where email = 'tu@correo.com';
```

---

## 6. Edge Function `send-verification` y secretos

- Código en `supabase/functions/send-verification/` (Deno, sin dependencias externas):
  - `index.ts`: servidor.
  - `handler.ts`: lógica.
  - `mailer.ts`: Gmail o Mailpit.
  - `email.ts`: contenido del correo.
- Pruebas con Jest: `npx jest supabase/functions`.
- **Local:** `npx supabase start` ya la sirve en http://127.0.0.1:54321/functions/v1/send-verification. Detecta que corre en local y manda el correo a Mailpit sin configurar nada.
- **Al editar la función:** en Windows la recarga en caliente no siempre detecta los cambios. Reinicia con `npx supabase stop` y `npx supabase start`; tus datos se conservan. No uses `docker restart`: pierde la configuración que inyecta la CLI.
- **Llave de la app:** `config.toml` tiene `verify_jwt = false` para esta función, porque la app llama con la llave publishable, que no es un JWT. La función valida `id + api_token` con la RPC `create_verification_code`.
- **Respuesta:** siempre HTTP 200 con `status`, que puede ser:
  - `ok`
  - `cooldown`
  - `already_verified`
  - `invalid_token`
  - `send_failed`

  Nunca devuelve el código a la app.

### Subir a la nube (lo decide el usuario)

1. Configura Google una sola vez (ver `docs/ARCHITECTURE.md`, sección "Envío con Gmail").
2. Guarda los secretos. **Nunca** los escribas en el código ni en archivos que se suban a git:

   ```bash
   npx supabase secrets set GMAIL_CLIENT_ID=... GMAIL_CLIENT_SECRET=... GMAIL_REFRESH_TOKEN=... GMAIL_SENDER=...
   ```

3. Despliega: `npx supabase functions deploy send-verification`. Toma `verify_jwt = false` de `config.toml`.

Si faltan los secretos de Gmail en la nube, la función responde `send_failed` y la app muestra "Necesitas conexión para verificar tu correo".

---

## 7. Qué servicios están encendidos

Configurado en `supabase/config.toml`:

| Servicio                        | Estado    | Motivo                                                                                                        |
| ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| Postgres (`db`)                 | Encendido | Tablas `profile`, `email_verification`, `quiz_progress`, vista `private.ranking` y funciones RPC              |
| API (`api`, PostgREST + Kong)   | Encendido | `supabase.rpc()` desde la app                                                                                 |
| Edge Functions (`edge_runtime`) | Encendido | `send-verification` (Gmail en la nube, Mailpit en local)                                                      |
| Studio                          | Encendido | Ver los datos en el navegador                                                                                 |
| Auth                            | Encendido | **Solo** para que la CLI genere las llaves de API. La app no usa Supabase Auth: su sesión es `id + api_token` |
| Mailpit (`local_smtp`)          | Encendido | Buzón de prueba para el correo de verificación: http://127.0.0.1:54324                                        |
| Storage, Realtime, Analytics    | Apagados  | El proyecto no los usa; así arranca más rápido y gasta menos memoria                                          |

---

## 8. Problemas comunes

| Síntoma                                                     | Solución                                                                                                                                            |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Cannot connect to the Docker daemon` o `docker: not found` | Abre Docker Desktop y espera a **Engine running**. Vuelve a correr `npx supabase start`                                                             |
| `port is already allocated` o un puerto 5432x ocupado       | Otro proyecto de Supabase sigue encendido: `npx supabase stop --all`, y luego `npx supabase start`                                                  |
| El primer `start` se corta por tiempo o red                 | Vuelve a ejecutarlo: continúa con las imágenes que ya bajó                                                                                          |
| Docker o la PC van muy lentos                               | Apaga Supabase con `npx supabase stop` cuando no lo uses. En Docker Desktop → Settings → Resources puedes revisar la memoria asignada               |
| El teléfono no conecta (`Network request failed`)           | Revisa la sección 5: IP de la PC (no `127.0.0.1`), misma red Wi‑Fi, regla del firewall, red **privada**, y reinicia Expo con `--clear`              |
| Quiero empezar de cero                                      | `npx supabase stop --no-backup`, y luego `npx supabase start`                                                                                       |
| Una migración falla en `db reset`                           | El error indica el archivo y la línea. Corrige con una migración nueva; solo si la que falla todavía no está en git, puedes corregirla directamente |

> Seguridad: Docker publica los puertos en todas las interfaces de red, incluida la base de datos (54322, con usuario y contraseña `postgres`). En redes públicas (escuela, cafetería) apaga Supabase o asegúrate de que la red esté marcada como **pública** en Windows, para que el firewall bloquee las conexiones entrantes.

---

## 9. Estructura de esta carpeta

```text
supabase/
├── README.md        # Esta guía
├── config.toml      # Configuración de Supabase local (puertos, servicios)
├── .gitignore       # Ignora .temp/, .branches/ y archivos .env locales
├── migrations/      # SQL de tablas y funciones RPC, en orden por fecha
├── tests/           # Pruebas pgTAP de las RPC y permisos (npx supabase test db)
└── functions/       # Edge Functions en Deno (send-verification)
```
