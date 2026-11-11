import type { Container } from './container';
import { createTestContainer } from './testing/createTestContainer';

/** Responde un ejercicio con `correct` aciertos usando solo la API pública (Comprobar). */
async function answer(container: Container, quizId: number, correct: number) {
  const quiz = await container.quizzes.startQuiz.execute({ quizId });
  if (!quiz.ok) throw new Error(quiz.error);
  const answers: Record<number, number> = {};
  for (const [i, question] of quiz.value.questions.entries()) {
    const checks = await Promise.all(
      question.options.map((o) =>
        container.quizzes.checkAnswer.execute({ quizId, questionId: question.id, optionId: o.id }),
      ),
    );
    const right = question.options.find((_, k) => checks[k].ok && checks[k].value.correct)!;
    const wrong = question.options.find((o) => o.id !== right.id)!;
    answers[question.id] = i < correct ? right.id : wrong.id;
  }
  return container.quizzes.submitQuiz.execute({ quizId, answers });
}

describe('avance del curso (integración sobre SQLite)', () => {
  it('aprobar el ejercicio de N1-L4 completa el Nivel 1 y abre N2-L1', async () => {
    const container = await createTestContainer({ completedTopics: [101, 102, 103] });
    const events: string[] = [];
    container.events.subscribe((e) => events.push(e.type));

    const result = await answer(container, 104, 2);

    expect(result.ok && result.value).toMatchObject({ passedNow: true, levelJustCompleted: 1 });
    expect(events).toEqual(['ProgressChanged', 'LevelCompleted']);

    const levels = await container.levels.getLevelsOverview.execute();
    expect(levels.ok && levels.value.levels.slice(0, 2).map((l) => l.status)).toEqual([
      'completed',
      'inProgress',
    ]);
    const syllabus = await container.learning.getSyllabus.execute({ levelId: 2 });
    expect(syllabus.ok && syllabus.value.activeTopic?.id).toBe(201);
  });

  it('reprobar deja el tema por aprobar y el siguiente bloqueado', async () => {
    const container = await createTestContainer();

    const result = await answer(container, 101, 1);

    expect(result.ok && result.value.passedNow).toBe(false);
    const syllabus = await container.learning.getSyllabus.execute({ levelId: 1 });
    expect(syllabus.ok && syllabus.value.topics.slice(0, 2)).toMatchObject([
      { id: 101, status: 'active', retry: true },
      { id: 102, status: 'locked' },
    ]);
  });

  it('el examen integrador se abre con los 24 temas y se aprueba con 8 de 10', async () => {
    const all = [1, 2, 3, 4, 5, 6].flatMap((n) => [1, 2, 3, 4].map((t) => n * 100 + t));
    const container = await createTestContainer({ completedTopics: all });

    expect(await container.quizzes.getFinalExamStatus.execute()).toMatchObject({
      ok: true,
      value: { status: 'available', total: 10, passMark: 8 },
    });

    await answer(container, 900, 7);
    expect(await container.quizzes.getFinalExamStatus.execute()).toMatchObject({
      value: { status: 'pending', bestScore: 7 },
    });

    await answer(container, 900, 8);
    expect(await container.quizzes.getFinalExamStatus.execute()).toMatchObject({
      value: { status: 'passed', bestScore: 8, attempts: 2 },
    });
  });
});
