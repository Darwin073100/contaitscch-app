import avanzado from './content/avanzado.json';
import basico from './content/basico.json';
import intermedio from './content/intermedio.json';
// Temporal (refactorización v2, F2): el seeder sigue con el contenido v2 hasta migrar SQLite (F3).
import manifestJson from './content/manifest.v2.json';
import {
  LevelContentSchema,
  ManifestSchema,
  validateCourse,
  type LevelContent,
} from './contentSchema';

// Metro solo incluye en el bundle los archivos con import estático:
// un nivel nuevo = su archivo en manifest.json y una entrada aquí.
const levelFiles: Record<string, unknown> = {
  'basico.json': basico,
  'intermedio.json': intermedio,
  'avanzado.json': avanzado,
};

export type Course = { version: number; levels: LevelContent[] };

/** Contenido del curso validado con Zod. Si el JSON está mal es un error de captura: lanza. */
export function loadCourse(): Course {
  const manifest = ManifestSchema.parse(manifestJson);
  const levels = manifest.levels.map((file) => {
    if (!(file in levelFiles)) {
      throw new Error(`${file} está en manifest.json pero no está importado en loadCourse.ts`);
    }
    return LevelContentSchema.parse(levelFiles[file]);
  });
  const errors = validateCourse(levels);
  if (errors.length > 0) throw new Error(errors.join('\n'));
  return { version: manifest.version, levels };
}
