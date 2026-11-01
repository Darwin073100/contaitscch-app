#!/usr/bin/env bash
# PostToolUse (Edit|Write): si se editó un JSON de contenido del curso, valida todo el contenido
# con los esquemas Zod (ids únicos, tipos de pregunta, bloques válidos).
set -uo pipefail

input="$(cat)"
file="$(printf "%s" "$input" | node "$CLAUDE_PROJECT_DIR/.claude/hooks/file-path.js")"

case "$file" in
  */src/core/database/seed/content/*.json) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 0
if ! out="$(npm run --silent content:validate 2>&1)"; then
  echo "El contenido JSON no pasó la validación:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
