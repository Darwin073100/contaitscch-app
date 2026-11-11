import { asc, eq } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { questionOptions, questions, quizzes } from '@/core/database/schema';

import type { AnswerKey, GradableQuiz, QuizQuestion } from '../../domain/entities/Quiz';
import type { QuizReader } from '../../domain/repositories/QuizReader';

export class SqliteQuizRepository implements QuizReader {
  constructor(private readonly db: AppDatabase) {}

  async findQuiz(quizId: number): Promise<GradableQuiz | null> {
    const quiz = this.db
      .select({
        id: quizzes.id,
        kind: quizzes.kind,
        topicId: quizzes.topicId,
        passMark: quizzes.passMark,
      })
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .get();
    if (!quiz) return null;

    const rows = this.db
      .select({
        questionId: questions.id,
        statement: questions.statement,
        feedback: questions.feedback,
        optionId: questionOptions.id,
        text: questionOptions.text,
        isCorrect: questionOptions.isCorrect,
      })
      .from(questions)
      .innerJoin(questionOptions, eq(questionOptions.questionId, questions.id))
      .where(eq(questions.quizId, quizId))
      .orderBy(asc(questions.sortOrder), asc(questionOptions.sortOrder))
      .all();

    // Filas pregunta × opción → preguntas con sus opciones A–D y la clave de respuestas
    const byQuestion = new Map<number, QuizQuestion>();
    const answerKey: Record<number, AnswerKey> = {};
    for (const row of rows) {
      let question = byQuestion.get(row.questionId);
      if (!question) {
        question = { id: row.questionId, statement: row.statement, options: [] };
        byQuestion.set(row.questionId, question);
      }
      question.options.push({ id: row.optionId, text: row.text });
      if (row.isCorrect) {
        answerKey[row.questionId] = { correctOptionId: row.optionId, feedback: row.feedback };
      }
    }

    return { ...quiz, questions: [...byQuestion.values()], answerKey };
  }
}
