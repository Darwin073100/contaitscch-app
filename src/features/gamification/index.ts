// API pública de gamification: lo único que src/app y otras features pueden importar.
export type { UserStats } from './domain/entities/UserStats';
export { calculateStreak } from './domain/policies/StreakCalculator';
export { XP_REWARD } from './domain/policies/XpRewardPolicy';
export { GetUserStatsUseCase } from './domain/usecases/GetUserStatsUseCase';
