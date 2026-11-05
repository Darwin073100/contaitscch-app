# 05 — Registro: Tus Datos y Verificación (`auth`)

- **Estado:** maquetación implementada (solo `presentation`). Sin dominio, datos ni red todavía.
- **Fecha:** 1 de noviembre de 2026
- **Fuente:** `docs/design/register.png`, `docs/design/registro-verificacion.png`; historias "Registro de usuario" y "Verificar correo electrónico" de `docs/USER_STORIES.md`; sección "Autenticación sin Supabase Auth" de `docs/ARCHITECTURE.md`.
- **Depende de:** `spec/01_ui_components_spec.md` (kit `@/shared/ui`).
- **Código:** `src/features/auth/`, rutas `src/app/(auth)/registro.tsx` y `src/app/(auth)/verificar-correo.tsx`.

## 1. Objetivo y alcance

| Criterio de la historia                         | Cómo se cumple en la maquetación                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Nombre y apellidos, mínimo 3 caracteres         | `registerFormSchema` (Zod, sin contar espacios) + error bajo el campo              |
| Correo, mínimo 3 caracteres y con @             | Zod `email()` tras `trim` y minúsculas                                             |
| Contraseña, mínimo 6 caracteres                 | Zod + hint "Mínimo 6 caracteres" + medidor "Nivel de seguridad" (solo orientativo) |
| País y Estado requeridos, Ciudad opcional       | Sección "Dirección" en la misma tarjeta (no aparece en la captura, ver sección 5)  |
| Enviar código y pedirlo                         | Paso 2: `OtpInput` de 6 dígitos y reenvío cada 45 s                                |
| Ir a la pantalla inicial sin volver a loguearse | "Validar y Entrar al Curso" → `router.replace('/')` (sin regreso al registro)      |

Fuera de alcance (siguiente spec de `auth`): `RegisterUserUseCase`, `VerifyEmailCodeUseCase`, `RequestVerificationCodeUseCase`, `PasswordHasher`, RPC, sesión en SecureStore, guard de sesión y Login.

## 2. Estructura

```text
features/auth/
├── index.ts                         # RegisterScreen, VerifyEmailScreen
└── presentation/
    ├── forms/                       # registerFormSchema (Zod), getPasswordStrength (+ pruebas)
    ├── components/                  # AuthLayout, RegisterHero, AuthBenefits, LoginPrompt,
    │                                # PasswordStrengthMeter, FormTextField (TextField + RHF)
    ├── viewmodels/                  # useRegisterViewModel, useVerifyEmailViewModel
    └── screens/                     # RegisterScreen, VerifyEmailScreen (+ pruebas)
```

Los dos pasos son **rutas separadas** (como define ARCHITECTURE.md): el paso 1 queda en la pila, así "Corregir mis datos" hace `router.back()` y el formulario conserva lo escrito. El correo viaja como parámetro (`/verificar-correo?email=…`) solo para mostrarlo; cuando exista la sesión, el paso 2 lo leerá de ahí.

## 3. Composición

| Elemento de la captura                             | Composición                                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Badge, logo, título y subtítulo                    | `RegisterHero`: `Badge primary uppercase` + `Logo lg ring verified` + `AppText title` + `caption`                                   |
| Stepper "1 Tus Datos / 2 Verificación"             | `Stepper current={0 \| 1}`                                                                                                          |
| Campos con icono                                   | `FormTextField` (`useController` → `TextField`): `account-outline`, `card-account-details-outline`, `email-outline`, `lock-outline` |
| "Nivel de seguridad"                               | `PasswordStrengthMeter`: `ProgressBar size=sm` (`danger` / `streak` / `primary`) + captions                                         |
| "Crear Cuenta y Recibir Código"                    | `Button leftIcon=send-outline loading`                                                                                              |
| Tarjeta "Confirma tu Correo"                       | `Card lg` → `IconBox info circle lg`, `subtitle`, `RichText caption` con el correo en negrita, `OtpInput`                           |
| "Reenviar en 00:45"                                | `Badge icon=clock-outline` con `useCountdown(45)`; al llegar a 0 → `Button ghost` "Reenviar código"                                 |
| "Validar y Entrar al Curso" / "Corregir mis datos" | `Button leftIcon=check-decagram-outline disabled={código incompleto}` / `Button ghost leftIcon=arrow-left`                          |
| "¿Ya tienes cuenta activa?" + enlace               | `LoginPrompt`: `caption` + `Button ghost rightIcon=login`                                                                           |
| Certificado · Ligas y Rangos · 100% Seguro         | `AuthBenefits`: `Card` → `Row` de `Column` (`Icon` + `caption`) separados por `Divider vertical`                                    |

`AuthLayout` arma hero, stepper, contenido, enlace a login y beneficios para los dos pasos (`Screen scroll safeBottom keyboardAvoiding`).

## 4. Cambios en `shared`

| Archivo                        | Cambio                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `shared/ui/Screen.tsx`         | Prop `keyboardAvoiding`: envuelve el contenido en `KeyboardAvoidingView` (`padding` en iOS, guía de Expo). |
| `shared/ui/ProgressBar.tsx`    | Tono `danger` (contraseña débil).                                                                          |
| `shared/hooks/useCountdown.ts` | Cuenta regresiva por ticks de 1 s + `formatCountdown(45)` → `"00:45"`.                                     |

## 5. Diferencias deliberadas con la captura

| Captura                                         | Implementación                                           | Motivo                                                             |
| ----------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| Sin dirección                                   | Sección "Dirección": País *, Estado *, Ciudad (opcional) | La historia la exige y la RPC `register` la recibe.                |
| "Mín. 6 caracteres" a la derecha de la etiqueta | Hint bajo el campo                                       | `TextField` ya tiene `hint`; evita una variante nueva de etiqueta. |
| Insignia de birrete sobre el logo               | Insignia de verificado (`Logo verified`)                 | Reutiliza el componente existente.                                 |
| Píldora gris arriba a la derecha                | Se omite                                                 | No tiene contenido ni función en la captura.                       |
| Texto "…enviamos a tu bandeja."                 | "…enviamos a **correo@…**." cuando se conoce el correo   | El usuario confirma a qué dirección se envió.                      |

## 6. Navegación

| Desde                        | Acción                                                              | Destino                       |
| ---------------------------- | ------------------------------------------------------------------- | ----------------------------- |
| Ajustes (temporal)           | "Ver registro (temporal)"                                           | `/registro`                   |
| Paso 1, formulario válido    | `router.push({ pathname: '/verificar-correo', params: { email } })` | Paso 2                        |
| Paso 2, "Corregir mis datos" | `router.back()`; sin historial → `router.replace('/registro')`      | Paso 1 con los datos escritos |
| Paso 2, código de 6 dígitos  | `router.replace('/')`                                               | Pestaña Aprender              |

Rutas tipadas: `.expo/types/router.d.ts` se actualizó a mano con `/registro` y `/verificar-correo` (igual que en spec 04); `expo start` lo regenera.

## 7. Pendientes

| #   | Pendiente                  | Detalle                                                                                                                             |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Use cases y datos          | **Hecho (paso 3b):** `RegisterUser`, `RequestVerificationCode` y `VerifyEmailCode` conectados a los ViewModels.                     |
| 2   | Mensajes de `verify_email` | **Hecho (paso 3b):** `Callout` con los mensajes de la tabla de ARCHITECTURE.md (`invalid_code` limpia casillas; `expired` reenvía). |
| 3   | Login                      | `openLogin` no hace nada hasta que exista la pantalla.                                                                              |
| 4   | Guard de sesión            | **Hecho (paso 3b):** `composition/RootNavigator.tsx` con `Stack.Protected`. Ajustes tiene un "Cerrar sesión (temporal)".            |
| 5   | Sin red                    | **Hecho (paso 3b):** aviso "Necesitas conexión a internet para crear tu cuenta" en el registro.                                     |
| 6   | País/Estado como lista     | Hoy son texto libre; valorar un selector si se necesitan datos normalizados.                                                        |

## 8. Pruebas

| Archivo                                                | Qué cubre                                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `auth/presentation/forms/registerFormSchema.test.ts`   | Mínimos, @, requeridos, ciudad opcional, correo normalizado                        |
| `auth/presentation/forms/passwordStrength.test.ts`     | Niveles vacío / débil / media / fuerte                                             |
| `auth/presentation/screens/RegisterScreen.test.tsx`    | Errores sin avanzar; datos válidos → `/verificar-correo` con el correo normalizado |
| `auth/presentation/screens/VerifyEmailScreen.test.tsx` | "Validar" solo con 6 dígitos; cuenta regresiva y reenvío; "Corregir mis datos"     |
| `shared/hooks/useCountdown.test.ts`                    | Ticks, fin y reinicio; formato `mm:ss`                                             |

`testTimeout` de Jest subió a 20 s: la primera prueba de pantalla de cada archivo tarda 3–7 s en cargar módulos en frío.
