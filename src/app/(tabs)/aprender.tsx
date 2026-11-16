import { useLocalSearchParams } from 'expo-router';

import { SyllabusMapScreen } from '@/features/learning';
import { AppTopBar } from '@/features/profile';

// Pestaña Aprender. ?level=N abre la ruta de ese nivel; sin él, la del nivel actual.
export default function LearnTab() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const levelId = level ? Number(level) : undefined;
  return (
    <SyllabusMapScreen
      levelId={Number.isInteger(levelId) ? levelId : undefined}
      header={<AppTopBar />}
    />
  );
}
