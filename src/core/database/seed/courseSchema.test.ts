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
  normalizeTerm,
  validateCourse,
  type LevelFile,
  type QuestionContent,
} from './courseSchema';

const question = (quizId: number, sortOrder: number, correct = 1): QuestionContent => {
  const id = quizId * 100 + sortOrder;
  return {
    id,
    sortOrder,
    statement: `Pregunta ${id}`,
    options: [0, 1, 2, 3].map((i) => ({
      id: id * 10 + i + 1,
      text: `Opción ${i}`,
      isCorrect: i === correct,
    })),
  };
};

const topic = (levelId: number, sortOrder: number) => {
  const id = levelId * 100 + sortOrder;
  return {
    id,
    sortOrder,
    title: `Tema ${id}`,
    objective: 'Objetivo del tema.',
    explanation: ['Primer párrafo.'],
    example: { title: 'Caso práctico', steps: ['Paso 1.'] },
    keyIdea: 'Idea clave.',
    commonError: 'Error común.',
    activity: 'Actividad.',
    quiz: { questions: [question(id, 1), question(id, 2)] },
  };
};

const level = (id = 1): LevelFile => ({
  level: { id, title: `Nivel ${id}: fundamentos`, goal: 'Al terminar este nivel…' },
  topics: [1, 2, 3, 4].map((n) => topic(id, n)),
});

const issues = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((i) => i.message) ?? [];

describe('LevelFileSchema', () => {
  it('acepta un nivel con 4 temas e ids correctos', () => {
    expect(LevelFileSchema.safeParse(level()).success).toBe(true);
  });

  it('exige exactamente 4 temas por nivel', () => {
    const content = level();
    content.topics.pop();
    expect(LevelFileSchema.safeParse(content).success).toBe(false);
  });

  it('el id del tema es nivel×100 + orden', () => {
    const content = level(2);
    content.topics[0].id = 101;
    expect(issues(LevelFileSchema.safeParse(content))).toContain('Tema 101: el id debe ser 201');
  });

  it('ids de pregunta (quiz×100 + orden) y de opción (pregunta×10 + posición)', () => {
    const content = level();
    content.topics[0].quiz.questions[1].id = 999;
    content.topics[0].quiz.questions[0].options[2].id = 1;
    expect(issues(LevelFileSchema.safeParse(content))).toEqual(
      expect.arrayContaining([
        'Pregunta 999: el id debe ser 10102',
        'Opción 1: el id debe ser 101013',
      ]),
    );
  });

  it('opción múltiple con exactamente una correcta y a lo más 4 opciones', () => {
    const twoCorrect = level();
    twoCorrect.topics[0].quiz.questions[0].options[0].isCorrect = true;
    expect(issues(LevelFileSchema.safeParse(twoCorrect))).toContain(
      'Debe haber exactamente una opción correcta',
    );

    const fiveOptions = level();
    const q = fiveOptions.topics[0].quiz.questions[0];
    q.options.push({ id: q.id * 10 + 5, text: 'Otra', isCorrect: false });
    expect(LevelFileSchema.safeParse(fiveOptions).success).toBe(false);
  });

  it('passMark no puede ser mayor que el número de preguntas', () => {
    const content = level();
    content.topics[0].quiz.passMark = 3;
    expect(issues(LevelFileSchema.safeParse(content))).toContain(
      'Tema 101: passMark (3) es mayor que el número de preguntas',
    );
  });

  it('no acepta niveles fuera del catálogo de Postgres (1..6)', () => {
    expect(LevelFileSchema.safeParse(level(7)).success).toBe(false);
  });
});

describe('FinalExamSchema', () => {
  const exam = () => ({ id: 900, passMark: 2, questions: [question(900, 1), question(900, 2)] });

  it('acepta el examen con id 900', () => {
    expect(FinalExamSchema.safeParse(exam()).success).toBe(true);
  });

  it('rechaza otro id y un passMark mayor que las preguntas', () => {
    expect(FinalExamSchema.safeParse({ ...exam(), id: 1 }).success).toBe(false);
    expect(issues(FinalExamSchema.safeParse({ ...exam(), passMark: 5 }))).toContain(
      'Examen final: passMark (5) es mayor que el número de preguntas',
    );
  });
});

describe('GlossarySchema', () => {
  it('rechaza términos repetidos sin distinguir mayúsculas ni acentos', () => {
    const result = GlossarySchema.safeParse([
      { term: 'Débito', definition: 'A' },
      { term: 'debito ', definition: 'B' },
    ]);
    expect(issues(result)).toContain('Término repetido: debito');
  });

  it('normalizeTerm quita acentos, espacios y mayúsculas', () => {
    expect(normalizeTerm('  Balanza de Comprobación ')).toBe('balanza de comprobacion');
  });
});

describe('validateCourse', () => {
  it('los niveles van de 1 a n sin huecos', () => {
    expect(validateCourse([level(1), level(2)])).toEqual([]);
    expect(validateCourse([level(1), level(3)])).toHaveLength(1);
  });
});

describe('contenido del bundle', () => {
  const levels = [nivel1, nivel2, nivel3, nivel4, nivel5, nivel6].map((l) =>
    LevelFileSchema.parse(l),
  );

  it('6 niveles × 4 temas válidos, examen de 10 preguntas (8 para aprobar) y 33 términos', () => {
    const manifest = ManifestSchema.parse(manifestJson);
    const exam = FinalExamSchema.parse(finalExamJson);

    expect(manifest.levels).toHaveLength(6);
    expect(validateCourse(levels)).toEqual([]);
    expect(levels.flatMap((l) => l.topics.map((t) => t.id))).toEqual([
      101, 102, 103, 104, 201, 202, 203, 204, 301, 302, 303, 304, 401, 402, 403, 404, 501, 502, 503,
      504, 601, 602, 603, 604,
    ]);
    expect(exam.questions).toHaveLength(10);
    expect(exam.passMark).toBe(8);
    expect(GlossarySchema.parse(glossaryJson)).toHaveLength(33);
  });

  it('cada ejercicio de tema tiene 2 preguntas con retroalimentación', () => {
    for (const t of levels.flatMap((l) => l.topics)) {
      expect(t.quiz.questions).toHaveLength(2);
      expect(t.quiz.questions.every((q) => q.feedback)).toBe(true);
    }
  });
});
