// Lee el JSON del hook por stdin e imprime tool_input.file_path con "/" (también en Windows).
// Con --relative imprime la ruta relativa a CLAUDE_PROJECT_DIR. Sustituye a jq.
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let file = '';
  try {
    file = JSON.parse(input).tool_input?.file_path ?? '';
  } catch {
    return;
  }
  if (!file) return;
  if (process.argv.includes('--relative')) {
    file = path.relative(process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), file);
  }
  process.stdout.write(file.replace(/\\/g, '/'));
});
