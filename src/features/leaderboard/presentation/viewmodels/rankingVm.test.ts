import type { RankingEntry, RankingView } from '../../domain/entities/Ranking';
import { toRankingVm } from './rankingVm';

const NOW = '2026-11-15T12:00:00.000Z';

const entry = (
  position: number,
  firstName: string,
  topicsPassed: number,
  isMe = false,
): RankingEntry => ({
  position,
  firstName,
  lastName: 'Méndez Ruiz',
  city: null,
  state: 'Michoacán',
  country: 'México',
  levelsCompleted: Math.floor(topicsPassed / 4),
  topicsPassed,
  isMe,
});

const entries = [
  entry(1, 'Carlos', 19),
  entry(2, 'Andrea', 17),
  entry(3, 'Miguel', 13),
  entry(4, 'Ana', 9, true),
];

const view = (overrides: Partial<RankingView> = {}): RankingView => ({
  ranking: { total: 4, entries, me: entries[3] },
  fetchedAt: NOW,
  live: true,
  notice: null,
  ...overrides,
});

describe('toRankingVm', () => {
  it('podio con los 3 primeros y su base de niveles', () => {
    const vm = toRankingVm(view(), NOW);

    expect(vm.podium).toEqual([
      expect.objectContaining({ place: 1, name: 'Carlos Méndez', value: 4, unit: 'niveles' }),
      expect.objectContaining({ place: 2, caption: '17 temas' }),
      expect.objectContaining({ place: 3, initials: 'MM' }),
    ]);
    expect(vm.countLabel).toBe('4 estudiantes');
  });

  it('la fila propia dice "Tú" y la barra muestra cuánto falta para el podio', () => {
    const vm = toRankingVm(view(), NOW);

    expect(vm.rows[3]).toMatchObject({
      initials: 'TÚ',
      title: 'Tú · Ana Méndez',
      subtitle: 'Michoacán, México',
      isMe: true,
    });
    expect(vm.me).toEqual({
      position: '#4',
      caption: '2 niveles · 9 temas',
      message: '4 temas para el podio',
    });
  });

  it('en el podio', () => {
    const top = [entry(1, 'Ana', 5, true)];
    const vm = toRankingVm(view({ ranking: { total: 1, entries: top, me: top[0] } }), NOW);

    expect(vm.podium[0].name).toBe('Tú');
    expect(vm.me).toEqual({
      position: '#1',
      caption: '1 nivel · 5 temas',
      message: 'Estás en el podio',
    });
  });

  it('sin red avisa que es el último ranking guardado', () => {
    const vm = toRankingVm(
      view({ live: false, notice: 'offline', fetchedAt: '2026-11-15T10:00:00.000Z' }),
      NOW,
    );

    expect(vm.notice).toBe('Sin conexión · Ranking de hace 2 h');
  });

  it('sin participar no hay barra "Tu posición"', () => {
    expect(toRankingVm(view({ ranking: { total: 4, entries, me: null } }), NOW).me).toBeNull();
  });
});
