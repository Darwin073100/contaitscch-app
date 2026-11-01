#!/usr/bin/env bash
# PostToolUse (Edit|Write): formatea con Prettier y corre ESLint sobre el archivo editado.
# Si ESLint encuentra errores (por ejemplo, un import que rompe las fronteras entre features),
# sale con 2 para que Claude vea el error y lo corrija en el mismo turno.
set -uo pipefail

input="$(cat)"
file="$(printf "%s" "$input" | node "$CLAUDE_PROJECT_DIR/.claude/hooks/file-path.js")"
[ -z "$file" ] || [ ! -f "$file" ] && exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0

case "$file" in
  *.ts|*.tsx|*.js|*.jsx)
    npx --no-install prettier --write "$file" >/dev/null 2>&1
    if ! out="$(npx --no-install eslint --max-warnings=0 "$file" 2>&1)"; then
      echo "ESLint encontró problemas en $file:" >&2
      echo "$out" >&2
      exit 2
    fi ;;
  *.json|*.md|*.css)
    npx --no-install prettier --write "$file" >/dev/null 2>&1 ;;
esac

exit 0
