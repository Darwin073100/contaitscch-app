// Valida los JSON del curso con los esquemas Zod. Uso: npm run content:validate
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  LevelContentSchema,
  ManifestSchema,
  validateCourse,
  type LevelContent,
} from '../src/core/database/seed/contentSchema';

const contentDir = join(__dirname, '..', 'src', 'core', 'database', 'seed', 'content');
const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(join(contentDir, file), 'utf8'));

const errors: string[] = [];
const manifest = ManifestSchema.safeParse(readJson('manifest.json'));

if (!manifest.success) {
  errors.push(`manifest.json:\n${manifest.error.message}`);
} else {
  const levels: LevelContent[] = [];
  for (const file of manifest.data.levels) {
    try {
      const parsed = LevelContentSchema.safeParse(readJson(file));
      if (parsed.success) levels.push(parsed.data);
      else errors.push(`${file}:\n${parsed.error.message}`);
    } catch (e) {
      errors.push(`${file}: ${(e as Error).message}`);
    }
  }
  errors.push(...validateCourse(levels));
  if (errors.length === 0) {
    console.log(`Contenido válido: versión ${manifest.data.version}, ${levels.length} nivel(es).`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n\n'));
  process.exit(1);
}
