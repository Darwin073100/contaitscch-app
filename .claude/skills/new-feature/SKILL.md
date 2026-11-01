---
name: new-feature
description: Crea el esqueleto de una feature nueva de CONTAITSCCH con capas domain, data y presentation, su index.ts y el registro en el contenedor de dependencias. Úsalo cuando el usuario pida una feature o módulo nuevo.
argument-hint: <nombre-feature> [descripción]
---

Crea la feature `$ARGUMENTS` siguiendo la arquitectura del proyecto.

Features existentes:
!`ls src/features 2>/dev/null`

## Pasos
1. Si el nombre ya existe en la lista de arriba, detente y pregunta.
2. Crea esta estructura en `src/features/<nombre>/`:
   ```
   domain/entities/
   domain/repositories/      # interfaces
   domain/usecases/
   data/datasources/
   data/mappers/
   data/repositories/        # implementaciones
   presentation/screens/
   presentation/components/
   presentation/viewmodels/
   index.ts                  # API pública: pantallas, tipos y use cases que otras features pueden usar
   ```
3. Crea solo los archivos que la descripción realmente necesita (no archivos vacíos de relleno).
4. Registra repositorios y use cases en `src/app/container.ts` (inyección por constructor).
5. Si tiene pantallas, regístralas en `src/app/navigation`.
6. Si la feature reacciona a otras (ej. al completar un tema), suscríbete a eventos de
   `DomainEventBus` en lugar de importar internals de otra feature.
7. Agrega al menos un test de dominio.
8. Corre `npm run typecheck && npm run lint && npm test`.
9. Pide al subagente `architecture-reviewer` que revise el resultado.

Reporta el árbol creado y los siguientes pasos sugeridos.
