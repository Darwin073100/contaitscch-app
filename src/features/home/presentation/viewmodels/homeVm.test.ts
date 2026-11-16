import type { CourseLesson, CourseProgress } from '@/features/learning';
import type { LevelOverviewItem, LevelsOverview } from '@/features/levels';
import type { FinalExamStatus } from '@/features/quizzes';

import { tips } from '../content/tips';
import { toHomeVm, type HomeData } from './homeVm';

const level = (sortOrder: number, status: LevelOverviewItem['status'], done: number) => ({
  id: sortOrder,
  sortOrder,
  title: `Nivel ${sortOrder}: título`,
  description: 'Meta',
  completedTopics: done,
  totalTopics: 4,
  status,
  progress: done / 4,
});

const levels: LevelsOverview = {
  levels: [level(1, 'completed', 4), level(2, 'inProgress', 1), level(3, 'locked', 0)],
  currentLevel: level(2, 'inProgress', 1),
  career: { completedTopics: 5, totalTopics: 12, progress: 5 / 12 },
};

const next = (state: CourseLesson['state']): CourseLesson => ({
  topicId: 202,
  levelId: 2,
  levelOrder: 2,
  order: 2,
  title: 'La partida doble',
  passed: false,
  attempts: state === 'retry' ? 1 : 0,
  bestScore: 0,
  index: 5,
  state,
});

const course = (nextLesson: CourseLesson | null, passedCount = 5): CourseProgress => ({
  lessons: [],
  levels: [],
  nextLesson,
  currentLevelId: 2,
  passedCount,
  totalCount: 12,
  finalExamUnlocked: passedCount === 12,
});

const exam = (overrides: Partial<FinalExamStatus> = {}): FinalExamStatus => ({
  status: 'locked',
  attempts: 0,
  bestScore: null,
  total: 10,
  passMark: 8,
  ...overrides,
});

const data = (overrides: Partial<HomeData> = {}): HomeData => ({
  user: {
    email: 'ana@correo.com',
    firstName: 'Ana',
    lastName: 'López',
    country: 'México',
    state: 'Chiapas',
    city: null,
  },
  course: course(next('current')),
  levels,
  exam: exam(),
  tip: tips[0],
  ...overrides,
});

describe('toHomeVm', () => {
  it('saludo, estadísticas y progreso del curso', () => {
    const vm = toHomeVm(data());

    expect(vm.greeting.title).toBe('Hola, Ana');
    expect(vm.stats.map((s) => `${s.label}:${s.value}`)).toEqual([
      'Temas aprobados:5/12',
      'Nivel actual:2 de 3',
      'Examen final:Bloqueado',
    ]);
    expect(vm.course).toEqual({
      progress: 5 / 12,
      percentLabel: '42%',
      doneLabel: '5 de 12 temas',
      remainingLabel: '7 por aprobar',
    });
    expect(vm.levelsLabel).toBe('3 niveles · 12 temas');
  });

  it('siguiente tema: continuar o retomar si lo reprobó', () => {
    expect(toHomeVm(data()).next).toMatchObject({
      overline: 'Tu siguiente tema · Nivel 2',
      title: 'La partida doble',
      actionLabel: 'Continuar',
      topicId: 202,
    });
    expect(toHomeVm(data({ course: course(next('current'), 0) })).next?.actionLabel).toBe(
      'Empezar',
    );
    expect(toHomeVm(data({ course: course(next('retry')) })).next).toMatchObject({
      overline: 'Vuelve a tomar este tema · Nivel 2',
      actionLabel: 'Retomar lección',
      retry: true,
    });
  });

  it('examen final bloqueado y disponible con su mejor resultado', () => {
    expect(toHomeVm(data()).exam).toEqual({
      unlocked: false,
      title: '10 preguntas de toda la ruta',
      detail: 'Se desbloquea cuando apruebes los 12 temas. Llevas 5.',
      canTake: false,
    });
    const pending = toHomeVm(
      data({
        course: course(null, 12),
        exam: exam({ status: 'pending', attempts: 1, bestScore: 6 }),
      }),
    );
    expect(pending.next).toBeNull();
    expect(pending.exam).toMatchObject({
      unlocked: true,
      detail: 'Se aprueba con 8 de 10. Mejor resultado: 6/10.',
    });
    expect(pending.stats[2].value).toBe('Por aprobar');
  });
});
