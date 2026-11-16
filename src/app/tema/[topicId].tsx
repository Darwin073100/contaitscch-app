import { useLocalSearchParams } from 'expo-router';

import { LessonScreen } from '@/features/learning';

export default function LessonRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  // Un id inválido llega como NaN y la pantalla muestra "no encontramos este tema".
  return <LessonScreen topicId={Number(topicId)} />;
}
