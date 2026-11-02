import { useLocalSearchParams } from 'expo-router';

import { TopicSessionScreen } from '@/features/learning';

export default function TopicSessionRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  // Un id inválido llega como NaN y la pantalla muestra "sin contenido".
  return <TopicSessionScreen topicId={Number(topicId)} />;
}
