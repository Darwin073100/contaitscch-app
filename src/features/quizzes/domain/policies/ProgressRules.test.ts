import type { QuizProgress } from '../entities/QuizProgress';
import { applyResult, isPassing, mergeProgress, reconcile } from './ProgressRules';

const T1 = '2026-11-01T10:00:00.000Z';
const T2 = '2026-11-02T10:00:00.000Z';
const T3 = '2026-11-03T10:00:00.000Z';

const progress = (overrides: Partial<QuizProgress> = {}): QuizProgress => ({
  quizId: 101,
  passed: false,
  bestScore: 0,
  attempts: 0,
  passedAt: null,
  updatedAt: T1,
  ...overrides,
});

describe('isPassing', () => {
  it('aprueba con los aciertos mínimos o más', () => {
    expect(isPassing(2, 2)).toBe(true);
    expect(isPassing(8, 8)).toBe(true);
    expect(isPassing(7, 8)).toBe(false);
  });
});

describe('applyResult', () => {
  it('primer intento aprobado', () => {
    expect(applyResult(null, { quizId: 101, score: 2, passMark: 2, at: T1 })).toEqual({
      quizId: 101,
      passed: true,
      bestScore: 2,
      attempts: 1,
      passedAt: T1,
      updatedAt: T1,
    });
  });

  it('reprobar suma intento sin aprobar', () => {
    expect(applyResult(null, { quizId: 101, score: 1, passMark: 2, at: T1 })).toMatchObject({
      passed: false,
      attempts: 1,
      passedAt: null,
    });
  });

  it('reprobar después de aprobar no deshace el aprobado ni baja el mejor puntaje', () => {
    const before = progress({ passed: true, bestScore: 2, attempts: 1, passedAt: T1 });

    expect(applyResult(before, { quizId: 101, score: 0, passMark: 2, at: T2 })).toEqual({
      quizId: 101,
      passed: true,
      bestScore: 2,
      attempts: 2,
      passedAt: T1,
      updatedAt: T2,
    });
  });

  it('aprobar en un reintento guarda esa fecha', () => {
    const before = progress({ bestScore: 1, attempts: 2 });

    expect(applyResult(before, { quizId: 101, score: 2, passMark: 2, at: T3 })).toMatchObject({
      passed: true,
      attempts: 3,
      passedAt: T3,
    });
  });
});

describe('mergeProgress', () => {
  const a = progress({ passed: true, bestScore: 2, attempts: 1, passedAt: T2, updatedAt: T2 });
  const b = progress({ bestScore: 1, attempts: 4, updatedAt: T3 });
  const c = progress({ passed: true, bestScore: 2, attempts: 2, passedAt: T1, updatedAt: T1 });

  it('nunca pierde un aprobado y toma los mayores', () => {
    expect(mergeProgress(a, b)).toEqual({
      quizId: 101,
      passed: true,
      bestScore: 2,
      attempts: 4,
      passedAt: T2,
      updatedAt: T3,
    });
  });

  it('passedAt es el más antiguo', () => {
    expect(mergeProgress(a, c).passedAt).toBe(T1);
  });

  it('es conmutativa, asociativa e idempotente', () => {
    expect(mergeProgress(a, b)).toEqual(mergeProgress(b, a));
    expect(mergeProgress(mergeProgress(a, b), c)).toEqual(mergeProgress(a, mergeProgress(b, c)));
    expect(mergeProgress(a, a)).toEqual(a);
  });
});

describe('reconcile', () => {
  const remote = progress({ passed: true, bestScore: 2, attempts: 3, passedAt: T1, updatedAt: T2 });

  it('fila nueva de la nube: se adopta sincronizada', () => {
    expect(reconcile(null, remote)).toEqual({ progress: remote, synced: true });
  });

  it('mismo contenido: se adoptan las fechas del servidor aunque el reloj local vaya adelantado', () => {
    const local = { ...remote, updatedAt: '2100-01-01T00:00:00.000Z' };

    expect(reconcile(local, remote)).toEqual({ progress: remote, synced: true });
  });

  it('el teléfono tiene más (cambió durante la subida): queda la fusión, pendiente', () => {
    const local = progress({
      passed: true,
      bestScore: 2,
      attempts: 4,
      passedAt: T1,
      updatedAt: T3,
    });

    expect(reconcile(local, remote)).toEqual({
      progress: { ...remote, attempts: 4, updatedAt: T3 },
      synced: false,
    });
  });

  it('la nube tiene más (otro teléfono): se adopta sin perder nada', () => {
    const local = progress({ bestScore: 1, attempts: 1, updatedAt: T1 });

    expect(reconcile(local, remote)).toEqual({ progress: remote, synced: true });
  });
});
