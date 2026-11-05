# Supabase local: cómo levantarlo y usarlo

Guía para correr Supabase en tu computadora (Windows + Docker Desktop) durante el desarrollo de CONTAITSCCH.

Supabase local es una copia completa del servidor (Postgres, API y Edge Functions) dentro de contenedores de Docker. Sirve para probar las funciones RPC y la Edge Function de correo **sin tocar el proyecto en la nube**.

> La app sigue funcionando sin Supabase: niveles, temas, XP y racha viven en SQLite. Supabase solo hace falta para registro, verificación de correo, login y ranking.

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
   | Edge Functions    | http://127.0.0.1:54321/functions/v1                       | `send-verification` (cuando exista)                    |

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

- `db reset` **borra todos los datos locales** (usuarios de prueba, XP…) y vuelve a crear la base con las migraciones. En local está bien; nunca lo uses con `--linked` (eso sería la nube).
- **Nunca edites una migración que ya está en git.** Para corregir algo, crea una migración nueva.
- Cada tabla nueva lleva `enable row level security` y ninguna política: solo se accede por funciones RPC (ver `CLAUDE.md`, sección Seguridad).

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

## 6. Edge Functions y secretos (cuando exista `send-verification`)

- El código va en `supabase/functions/<nombre>/index.ts` (Deno).
- Para probarlas en local: `npx supabase functions serve`.
- Los secretos de Gmail para local van en `supabase/functions/.env`, que está ignorado por git:

  ```bash
  GMAIL_CLIENT_ID=...
  GMAIL_CLIENT_SECRET=...
  GMAIL_REFRESH_TOKEN=...
  GMAIL_SENDER=...
  ```

- En la nube se configuran con `npx supabase secrets set …` (ver `docs/ARCHITECTURE.md`, sección "Envío con Gmail"). **Nunca** escribas secretos en el código ni en archivos que se suban a git.

---

## 7. Qué servicios están encendidos

Configurado en `supabase/config.toml`:

| Servicio                                 | Estado    | Motivo                                                                                                        |
| ---------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| Postgres (`db`)                          | Encendido | Tablas `profile`, `xp_event`, `daily_activity` y funciones RPC                                                |
| API (`api`, PostgREST + Kong)            | Encendido | `supabase.rpc()` desde la app                                                                                 |
| Edge Functions (`edge_runtime`)          | Encendido | `send-verification` (correo con la API de Gmail)                                                              |
| Studio                                   | Encendido | Ver los datos en el navegador                                                                                 |
| Auth                                     | Encendido | **Solo** para que la CLI genere las llaves de API. La app no usa Supabase Auth: su sesión es `id + api_token` |
| Storage, Realtime, Analytics, SMTP local | Apagados  | El proyecto no los usa; así arranca más rápido y gasta menos memoria                                          |

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
