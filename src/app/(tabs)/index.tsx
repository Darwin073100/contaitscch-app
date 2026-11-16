import { HomeScreen } from '@/features/home';
import { AppTopBar } from '@/features/profile';

// Pestaña Niveles (inicio).
export default function LevelsTab() {
  return <HomeScreen header={<AppTopBar />} />;
}
