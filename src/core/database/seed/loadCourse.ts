import finalExamJson from './content/examen-final.json';
import glossaryJson from './content/glosario.json';
import manifestJson from './content/manifest.json';
import nivel1 from './content/nivel-1.json';
import nivel2 from './content/nivel-2.json';
import nivel3 from './content/nivel-3.json';
import nivel4 from './content/nivel-4.json';
import nivel5 from './content/nivel-5.json';
import nivel6 from './content/nivel-6.json';
import {
  FinalExamSchema,
  GlossarySchema,
  LevelFileSchema,
  ManifestSchema,
  validateCourse,
  type FinalExamContent,
  type GlossaryContent,
  type LevelFile,
} from './courseSchema';

// Metro solo incluye en el bundle los archivos con import estático:
// un archivo nuevo = su entrada en manifest.json y aquí.
const contentFiles: Record<string, unknown> = {
  'nivel-1.json': nivel1,
  'nivel-2.json': nivel2,
  'nivel-3.json': nivel3,
  'nivel-4.json': nivel4,
  'nivel-5.json': nivel5,
  'nivel-6.json': nivel6,
  'examen-final.json': finalExamJson,
  'glosario.json': glossaryJson,
};

export type Course = {
  version: number;
  levels: LevelFile[];
  finalExam: FinalExamContent;
  glossary: GlossaryContent;
};

function fileContent(file: string): unknown {
  if (!(file in contentFiles)) {
    throw new Error(`${file} está en manifest.json pero no está importado en loadCourse.ts`);
  }
  return contentFiles[file];
}

/** Contenido del curso validado con Zod. Si el JSON está mal es un error de captura: lanza. */
export function loadCourse(): Course {
  const manifest = ManifestSchema.parse(manifestJson);
  const levels = manifest.levels.map((file) => LevelFileSchema.parse(fileContent(file)));
  const errors = validateCourse(levels);
  if (errors.length > 0) throw new Error(errors.join('\n'));
  return {
    version: manifest.version,
    levels,
    finalExam: FinalExamSchema.parse(fileContent(manifest.finalExam)),
    glossary: GlossarySchema.parse(fileContent(manifest.glossary)),
  };
}
