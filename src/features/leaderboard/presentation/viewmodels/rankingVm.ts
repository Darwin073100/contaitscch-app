import type { PodiumPlace } from '@/shared/ui';
import { getInitials, timeAgo } from '@/shared/utils';

import type { RankingEntry, RankingView } from '../../domain/entities/Ranking';
import { podiumGap } from '../../domain/policies/PodiumPolicy';

// Textos ya armados para la pestaña Ranking: la pantalla solo pinta.

export type RankRowVm = {
  key: string;
  position: number;
  initials: string;
  title: string;
  subtitle: string;
  levels: number;
  topics: number;
  isMe: boolean;
};

export type RankingVm = {
  podium: PodiumPlace[];
  countLabel: string;
  rows: RankRowVm[];
  /** Aviso cuando se muestra el último ranking guardado; null si está al día. */
  notice: string | null;
  /** Barra fija "Tu posición"; null si aún no participas. */
  me: { position: string; caption: string; message: string } | null;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "Carlos Méndez Ruiz" → "Carlos Méndez". */
const shortName = (e: RankingEntry) => `${e.firstName} ${e.lastName.split(/\s+/)[0] ?? ''}`.trim();
const fullName = (e: RankingEntry) => `${e.firstName} ${e.lastName}`.trim();
const place = (e: RankingEntry) => [e.city, e.state, e.country].filter(Boolean).join(', ');

function notice(view: RankingView, nowIso: string): string | null {
  if (view.live) return null;
  const when = timeAgo(view.fetchedAt, nowIso);
  switch (view.notice) {
    case 'offline':
      return `Sin conexión · Ranking de ${when}`;
    case 'sync_failed':
      return `No se pudo subir tu avance · Ranking de ${when}`;
    default:
      return `No se pudo actualizar · Ranking de ${when}`;
  }
}

export function toRankingVm(view: RankingView, nowIso: string): RankingVm {
  const { entries, total, me } = view.ranking;
  const gap = podiumGap(view.ranking);

  return {
    podium: entries.slice(0, 3).map((e, i) => ({
      place: (i + 1) as 1 | 2 | 3,
      position: e.position,
      initials: getInitials(fullName(e)),
      name: e.isMe ? 'Tú' : shortName(e),
      caption: plural(e.topicsPassed, 'tema', 'temas'),
      value: e.levelsCompleted,
      unit: e.levelsCompleted === 1 ? 'nivel' : 'niveles',
      isMe: e.isMe,
    })),
    countLabel: plural(total, 'estudiante', 'estudiantes'),
    rows: entries.map((e, i) => ({
      key: `${e.position}-${i}`,
      position: e.position,
      initials: e.isMe ? 'TÚ' : getInitials(fullName(e)),
      title: e.isMe ? `Tú · ${shortName(e)}` : fullName(e),
      subtitle: place(e),
      levels: e.levelsCompleted,
      topics: e.topicsPassed,
      isMe: e.isMe,
    })),
    notice: notice(view, nowIso),
    me:
      me && gap
        ? {
            position: `#${me.position}`,
            caption: `${plural(me.levelsCompleted, 'nivel', 'niveles')} · ${plural(me.topicsPassed, 'tema', 'temas')}`,
            message: gap.onPodium
              ? 'Estás en el podio'
              : `${plural(gap.topicsToPodium, 'tema', 'temas')} para el podio`,
          }
        : null,
  };
}
