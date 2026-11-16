import { useLocalSearchParams } from 'expo-router';

import { QuizScreen } from '@/features/quizzes';

// Ejercicio de un tema (quizId = id del tema) o examen integrador (900).
export default function QuizRoute() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  return <QuizScreen quizId={Number(quizId)} />;
}
