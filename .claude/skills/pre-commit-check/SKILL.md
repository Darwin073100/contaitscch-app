---
name: pre-commit-check
description: Verifica que los cambios estén listos para commit - typecheck, lint, tests, validación de contenido y revisión de arquitectura - y propone el mensaje de commit. Úsalo solo cuando el usuario lo pida explícitamente.
disable-model-invocation: true
---

Cambios actuales:
!`git status --short`

!`git diff --stat HEAD`

## Pasos
1. Corre en orden y detente en el primer fallo, mostrando el error resumido:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run content:validate` (solo si cambió algo en `src/core/database/seed/content/`)
2. Pide al subagente `architecture-reviewer` que revise el diff.
3. Si todo pasa, propone un mensaje de commit en español con formato Conventional Commits
   (`feat(learning): completar tema otorga 5 XP`), un cuerpo breve con el porqué,
   y pregunta antes de ejecutar `git commit`.
4. Nunca hagas `git push`.
