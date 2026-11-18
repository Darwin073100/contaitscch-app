import type { LevelsOverview } from '@/features/levels';
import type { FinalExamStatus } from '@/features/quizzes';

import { toProfileVm, type ProfileData } from './profileVm';

const NOW = '2026-11-15T12:00:00.000Z';

const level = (id: number, done: number) => ({
  id,
  sortOrder: id,
  title: `Nivel ${id}`,
  description: '',
  completedTopics: done,
  totalTopics: 4,
  status: done === 4 ? ('completed' as const) : ('inProgress' as const),
  progress: done / 4,
});

const levels: LevelsOverview = {
  levels: [level(1, 4), level(2, 1)],
  currentLevel: level(2, 1),
  career: { completedTopics: 5, totalTopics: 8, progress: 5 / 8 },
};

const exam = (overrides: Partial<FinalExamStatus> = {}): FinalExamStatus => ({
  status: 'locked',
  attempts: 0,
  bestScore: null,
  total: 10,
  passMark: 8,
  ...overrides,
});

const data = (overrides: Partial<ProfileData> = {}): ProfileData => ({
  user: {
    email: 'ana@correo.com',
    firstName: 'Ana Sofía',
    lastName: 'López',
    country: 'México',
    state: 'Chiapas',
    city: 'Tuxtla',
  },
  levels,
  exam: exam(),
  sync: { status: 'pending', pendingCount: 2, lastSyncedAt: null },
  app: { version: '1.0.0', updateId: null, embedded: true },
  ...overrides,
});

describe('toProfileVm', () => {
  it('tarjeta del alumno y avance por nivel', () => {
    const vm = toProfileVm(data(), NOW);

    expect(vm.card).toEqual({
      initials: 'AS',
      name: 'Ana Sofía López',
      email: 'ana@correo.com',
      place: 'Tuxtla, Chiapas, México',
      levelLine: 'Nivel 2 · 5 de 8 temas aprobados',
    });
    expect(vm.levels).toEqual([
      { id: 1, label: 'Nivel 1', progress: 1, count: '4/4' },
      { id: 2, label: 'Nivel 2', progress: 0.25, count: '1/4' },
    ]);
    expect(vm.pendingCount).toBe(2);
    expect(vm.sync.title).toBe('2 cambios por sincronizar');
  });

  it('línea del examen integrador según su estado', () => {
    expect(toProfileVm(data(), NOW).examLine).toBe(
      'Examen integrador: se desbloquea al aprobar los 8 temas.',
    );
    expect(toProfileVm(data({ exam: exam({ status: 'available' }) }), NOW).examLine).toBe(
      'Examen integrador: disponible, sin presentar.',
    );
    expect(
      toProfileVm(data({ exam: exam({ status: 'passed', bestScore: 9, attempts: 2 }) }), NOW)
        .examLine,
    ).toBe('Examen integrador: mejor resultado 9/10 (aprobado).');
  });

  it('línea de versión: desarrollo, lo que trajo el APK o una actualización de EAS Update', () => {
    const line = (app: ProfileData['app']) => toProfileVm(data({ app }), NOW).versionLine;
    const id = '1a2b3c4d-0000-4000-8000-000000000000';

    expect(line({ version: '1.0.0', updateId: null, embedded: true })).toBe(
      'Versión 1.0.0 (desarrollo)',
    );
    expect(line({ version: '1.0.0', updateId: id, embedded: true })).toBe(
      'Versión 1.0.0 · instalación 1a2b3c4d',
    );
    expect(line({ version: '1.0.0', updateId: id, embedded: false })).toBe(
      'Versión 1.0.0 · actualización 1a2b3c4d',
    );
  });
});
