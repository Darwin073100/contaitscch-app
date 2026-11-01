#!/usr/bin/env bash
# PreToolUse (Edit|Write): bloquea cambios a archivos sensibles o que no deben editarse a mano.
# Salida 2 = bloquea la acción y el mensaje de stderr llega a Claude.
set -euo pipefail

input="$(cat)"
rel="$(printf "%s" "$input" | node "$CLAUDE_PROJECT_DIR/.claude/hooks/file-path.js" --relative)"
[ -z "$rel" ] && exit 0
file="$CLAUDE_PROJECT_DIR/$rel"


case "$rel" in
  .env|.env.*|*/.env|*/.env.*)
    echo "Bloqueado: no se editan archivos .env. Pide al usuario que configure el secreto." >&2
    exit 2 ;;
  package-lock.json|yarn.lock|pnpm-lock.yaml)
    echo "Bloqueado: el lockfile solo cambia con npm install / npx expo install." >&2
    exit 2 ;;
  src/core/database/migrations/*.sql)
    # Las migraciones ya generadas no se editan: se crea una nueva con npm run db:generate.
    if [ -f "$file" ]; then
      echo "Bloqueado: '$rel' ya existe. Crea una migración nueva en lugar de editar una aplicada." >&2
      exit 2
    fi ;;
  supabase/migrations/*.sql)
    if [ -f "$file" ]; then
      echo "Bloqueado: '$rel' ya existe. Usa 'supabase migration new <nombre>' para un cambio nuevo." >&2
      exit 2
    fi ;;
esac

exit 0
