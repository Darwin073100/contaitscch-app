---
name: add-question-type
description: Agrega un tipo nuevo de pregunta de examen (por ejemplo ordenar asientos o arrastrar montos a una cuenta T) usando el QuestionTypeRegistry, sin modificar el flujo del examen. Úsalo cuando se pida un nuevo formato de pregunta.
argument-hint: <tipo_en_snake_case> [descripción de la interacción]
---

Agrega el tipo de pregunta `$ARGUMENTS` respetando el principio Abierto/Cerrado.

Tipos registrados actualmente:
!`grep -rn "register(" src/composition/container.ts 2>/dev/null | grep -i grader`

## Pasos
1. Esquema Zod del nuevo tipo en `src/core/database/seed/contentSchema.ts` (unión discriminada por `type`).
2. Grader en `src/features/exams/domain/grading/<Tipo>Grader.ts` implementando `QuestionGrader`.
3. Componente de vista en `src/features/exams/presentation/components/questions/<Tipo>QuestionView.tsx`
   con NativeWind, usando componentes de `shared/ui`.
4. Registro en `src/composition/container.ts`: `.register(new <Tipo>Grader(), <Tipo>QuestionView)`.
5. NO modifiques `SubmitExamUseCase` ni `ExamSessionScreen`: si parece necesario, el diseño del registry
   está mal; detente y explica por qué.
6. Tests del grader (respuestas correctas, incorrectas y normalización).
7. Agrega una pregunta de ejemplo en el JSON del nivel (pide ayuda al subagente `content-author`)
   y corre `npm run content:validate`.
