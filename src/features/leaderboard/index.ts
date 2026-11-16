// API pública de leaderboard: lo único que src/app y otras features pueden importar.
export type { PodiumGap, Ranking, RankingEntry, RankingView } from './domain/entities/Ranking';
export { podiumGap } from './domain/policies/PodiumPolicy';
export { SyncAndFetchRankingUseCase } from './domain/usecases/SyncAndFetchRankingUseCase';
