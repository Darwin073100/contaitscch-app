// Valida los JSON del curso con los esquemas Zod. Uso: npm run content:validate
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ZodType } from 'zod';

import {
  FinalExamSchema,
  GlossarySchema,
  LevelFileSchema,
  ManifestSchema,
  validateCourse,
  type LevelFile,
} from '../src/core/database/seed/courseSchema';

const contentDir = join(__dirname, '..', 'src', 'core', 'database', 'seed', 'content');
const errors: string[] = [];

/** Lee y valida un archivo; si falla, anota el error y devuelve undefined. */
function parseFile<T>(file: string, schema: ZodType<T>): T | undefined {
  try {
    const parsed = schema.safeParse(JSON.parse(readFileSync(join(contentDir, file), 'utf8')));
    if (parsed.success) return parsed.data;
    errors.push(`${file}:\n${parsed.error.message}`);
  } catch (e) {
    errors.push(`${file}: ${(e as Error).message}`);
  }
  return undefined;
}

const manifest = parseFile('manifest.json', ManifestSchema);
if (manifest) {
  const levels = manifest.levels
    .map((file) => parseFile(file, LevelFileSchema))
    .filter((l): l is LevelFile => l !== undefined);
  const exam = parseFile(manifest.finalExam, FinalExamSchema);
  const glossary = parseFile(manifest.glossary, GlossarySchema);
  errors.push(...validateCourse(levels));

  if (errors.length === 0) {
    console.log(
      `Contenido válido: versión ${manifest.version}, ${levels.length} niveles, ` +
        `${levels.reduce((n, l) => n + l.topics.length, 0)} temas, ` +
        `${exam?.questions.length} preguntas de examen, ${glossary?.length} términos.`,
    );
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n\n'));
  process.exit(1);
}
