import { RankingScreen } from '@/features/leaderboard';
import { AppTopBar } from '@/features/profile';

// Al entrar se sube el avance pendiente y se pide el ranking.
export default function RankingTab() {
  return <RankingScreen header={<AppTopBar />} />;
}
