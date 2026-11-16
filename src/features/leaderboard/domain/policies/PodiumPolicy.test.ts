import type { RankingEntry } from '../entities/Ranking';
import { podiumGap } from './PodiumPolicy';

const entry = (position: number, topicsPassed: number, isMe = false): RankingEntry => ({
  position,
  firstName: `P${position}`,
  lastName: 'Apellido',
  city: null,
  state: 'Michoacán',
  country: 'México',
  levelsCompleted: Math.floor(topicsPassed / 4),
  topicsPassed,
  isMe,
});

const entries = [entry(1, 19), entry(2, 17), entry(3, 13), entry(4, 9, true)];

describe('podiumGap', () => {
  it('fuera del podio: temas que faltan para igualar al 3.er lugar', () => {
    expect(podiumGap({ total: 4, entries, me: entries[3] })).toEqual({
      onPodium: false,
      topicsToPodium: 4,
    });
  });

  it('en el podio', () => {
    expect(podiumGap({ total: 4, entries, me: entries[2] })).toEqual({ onPodium: true });
  });

  it('empatado con el 3.er lugar en temas pero detrás: falta al menos 1', () => {
    const me = entry(4, 13, true);
    expect(podiumGap({ total: 4, entries: [...entries.slice(0, 3), me], me })).toEqual({
      onPodium: false,
      topicsToPodium: 1,
    });
  });

  it('sin participar no hay brecha', () => {
    expect(podiumGap({ total: 3, entries: entries.slice(0, 3), me: null })).toBeNull();
  });
});
