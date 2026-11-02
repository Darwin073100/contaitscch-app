import { LevelContentSchema, validateCourse, type LevelContent } from './contentSchema';

type LevelWithExam = LevelContent & { exam: NonNullable<LevelContent['exam']> };

const levelInfo = (id: number, name: string) => ({
  id,
  name,
  sortOrder: id,
  title: `Módulo ${name}`,
  tagline: `Frase del nivel ${name}.`,
  subtitle: `Subtítulo ${name}`,
  description: `Descripción del nivel ${name}.`,
});

const validLevel = (): LevelWithExam => ({
  level: levelInfo(1, 'Básico'),
  topics: [
    {
      id: 101,
      title: 'Conceptos básicos',
      sortOrder: 1,
      subtopics: [
        {
          id: 10101,
          title: '¿Qué es la contabilidad?',
          sortOrder: 1,
          blocks: [{ type: 'paragraph', text: 'La contabilidad registra operaciones.' }],
        },
      ],
    },
  ],
  exam: {
    id: 1,
    xpReward: 100,
    passingScore: 70,
    questions: [
      {
        id: 1001,
        type: 'multiple_choice',
        sortOrder: 1,
        statement: '¿Qué lado de la Cuenta T es el Debe?',
        options: [
          { id: 100101, text: 'Izquierdo', isCorrect: true },
          { id: 100102, text: 'Derecho', isCorrect: false },
        ],
      },
      {
        id: 1002,
        type: 'complementary',
        sortOrder: 2,
        statement: 'El lado derecho de una Cuenta T se llama ____.',
        options: [{ id: 100201, text: 'Haber', isCorrect: true }],
      },
    ],
  },
});

describe('LevelContentSchema', () => {
  it('acepta un nivel con ids correctos', () => {
    expect(LevelContentSchema.safeParse(validLevel()).success).toBe(true);
  });

  it('rechaza un tema cuyo id no sigue nivel×100 + orden', () => {
    const level = validLevel();
    level.topics[0].id = 105;

    const result = LevelContentSchema.safeParse(level);

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('el id debe ser 101');
  });

  it('rechaza opción múltiple con más de una respuesta correcta', () => {
    const level = validLevel();
    level.exam.questions[0].options[1].isCorrect = true;

    expect(LevelContentSchema.safeParse(level).success).toBe(false);
  });

  it('rechaza bloques de tipo desconocido', () => {
    const level = validLevel() as unknown as { topics: { subtopics: { blocks: unknown[] }[] }[] };
    level.topics[0].subtopics[0].blocks.push({ type: 'video', url: 'x' });

    expect(LevelContentSchema.safeParse(level).success).toBe(false);
  });
});

describe('nivel en preparación', () => {
  it('acepta un nivel sin temas ni examen', () => {
    expect(
      LevelContentSchema.safeParse({ level: levelInfo(2, 'Intermedio'), topics: [] }).success,
    ).toBe(true);
  });

  it('rechaza un nivel con temas pero sin examen', () => {
    const { exam: _exam, ...withoutExam } = validLevel();

    expect(LevelContentSchema.safeParse(withoutExam).success).toBe(false);
  });

  it('rechaza un nivel con examen pero sin temas', () => {
    expect(LevelContentSchema.safeParse({ ...validLevel(), topics: [] }).success).toBe(false);
  });
});

describe('validateCourse', () => {
  it('detecta niveles con el mismo id', () => {
    expect(validateCourse([validLevel(), validLevel()])).toContain(
      'Nivel 1 repetido entre niveles',
    );
  });
});
