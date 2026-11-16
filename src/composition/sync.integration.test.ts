import type { Connectivity } from '@/core/connectivity/Connectivity';
import type { RemoteClient } from '@/core/network/RpcClient';

import type { Container } from './container';
import { createTestContainer } from './testing/createTestContainer';

const NOW = '2026-11-15T12:00:00+00:00';

const passedRow = (quizId: number) => ({
  quiz_id: quizId,
  passed: true,
  best_score: 2,
  attempts: 1,
  passed_at: NOW,
  updated_at: NOW,
});

/**
 * Nube falsa con las respuestas de sync_progress y get_ranking (las reglas reales las prueba
 * pgTAP en supabase/tests). Guarda lo que recibe para poder revisarlo.
 */
function fakeCloud(initial: number[]) {
  const rows = new Map(initial.map((q) => [q, passedRow(q)]));
  const received: unknown[][] = [];
  const client: RemoteClient = {
    rpc: async (fn, args = {}) => {
      if (fn === 'sync_progress') {
        const pending = args.p_progress as { quiz_id: number }[];
        received.push(pending);
        const all = () => [...rows.values()].sort((a, b) => a.quiz_id - b.quiz_id);
        if (args.p_generation !== 0) {
          return { data: { status: 'replace', generation: 0, progress: all() }, error: null };
        }
        for (const r of pending) rows.set(r.quiz_id, r as ReturnType<typeof passedRow>);
        return {
          data: { status: 'ok', generation: 0, synced_at: NOW, progress: all() },
          error: null,
        };
      }
      if (fn === 'get_ranking') {
        const me = {
          position: 1,
          first_name: 'Ana',
          last_name: 'López',
          city: null,
          state: 'Chiapas',
          country: 'México',
          levels_completed: 0,
          topics_passed: rows.size,
          is_me: true,
        };
        return { data: { status: 'ok', total: 1, entries: [me], me }, error: null };
      }
      return { data: null, error: { message: `RPC desconocida ${fn}` } };
    },
    functions: { invoke: async () => ({ data: null, error: { message: 'no' } }) },
  };
  return { client, rows, received };
}

const toggle = (): Connectivity & { online: boolean } => {
  const c = { online: true, isOnline: async () => c.online, onReconnect: () => () => {} };
  return c;
};

/** Aprueba un ejercicio con todas sus respuestas correctas (usando solo la API pública). */
async function pass(container: Container, quizId: number) {
  const quiz = await container.quizzes.startQuiz.execute({ quizId });
  if (!quiz.ok) throw new Error(quiz.error);
  const answers: Record<number, number> = {};
  for (const q of quiz.value.questions) {
    for (const o of q.options) {
      const check = await container.quizzes.checkAnswer.execute({
        quizId,
        questionId: q.id,
        optionId: o.id,
      });
      if (check.ok && check.value.correct) answers[q.id] = o.id;
    }
  }
  return container.quizzes.submitQuiz.execute({ quizId, answers });
}

describe('sincronización del avance (integración sobre SQLite)', () => {
  it('un teléfono nuevo continúa donde se quedó el avance sincronizado', async () => {
    const cloud = fakeCloud([101, 102, 103, 104]);
    const container = await createTestContainer({ remote: cloud.client, connectivity: toggle() });

    expect(await container.progress.syncProgress.execute()).toEqual({
      ok: true,
      value: { kind: 'replaced', pushed: 0 },
    });

    const levels = await container.levels.getLevelsOverview.execute();
    expect(levels.ok && levels.value.levels[0].status).toBe('completed');
    const syllabus = await container.learning.getSyllabus.execute({ levelId: 2 });
    expect(syllabus.ok && syllabus.value.activeTopic?.id).toBe(201);
    expect(await container.progress.getSyncStatus.execute()).toMatchObject({
      status: 'synced',
      pendingCount: 0,
    });
  });

  it('lo aprobado sin red queda pendiente y se sube al volver la conexión', async () => {
    const cloud = fakeCloud([]);
    const connectivity = toggle();
    const container = await createTestContainer({ remote: cloud.client, connectivity });
    await container.progress.syncProgress.execute();

    connectivity.online = false;
    await pass(container, 101);
    expect(await container.progress.getSyncStatus.execute()).toMatchObject({
      status: 'offline',
      pendingCount: 1,
    });

    connectivity.online = true;
    expect(await container.progress.getSyncStatus.execute()).toMatchObject({ status: 'pending' });
    await container.progress.syncProgress.execute();

    expect(cloud.received.at(-1)).toEqual([
      expect.objectContaining({ quiz_id: 101, passed: true }),
    ]);
    expect(cloud.rows.get(101)?.passed).toBe(true);
    expect(await container.progress.getSyncStatus.execute()).toMatchObject({
      status: 'synced',
      pendingCount: 0,
    });
  });

  it('Ranking sincroniza primero y sin red muestra el último guardado', async () => {
    const cloud = fakeCloud([]);
    const connectivity = toggle();
    const container = await createTestContainer({ remote: cloud.client, connectivity });
    await container.progress.syncProgress.execute();
    await pass(container, 101);

    const live = await container.leaderboard.syncAndFetchRanking.execute();
    expect(live.ok && live.value).toMatchObject({ live: true, notice: null });
    // El avance pendiente se subió antes de pedir el ranking
    expect(live.ok && live.value.ranking.me?.topicsPassed).toBe(1);

    connectivity.online = false;
    const cached = await container.leaderboard.syncAndFetchRanking.execute();
    expect(cached.ok && cached.value).toMatchObject({ live: false, notice: 'offline' });
    expect(cached.ok && cached.value.ranking.me?.topicsPassed).toBe(1);
  });
});
