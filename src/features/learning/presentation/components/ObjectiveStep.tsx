import { AppText, Callout, Column, Figure, RichText } from '@/shared/ui';

import { lessonImage } from '../content/lessonImages';

type ObjectiveStepProps = {
  topicId: number;
  title: string;
  objective: string;
  retakeNote: string | null;
  howToPass: string;
};

/** Paso 1: objetivo, infografía ampliable y cómo se aprueba el tema. */
export function ObjectiveStep({
  topicId,
  title,
  objective,
  retakeNote,
  howToPass,
}: ObjectiveStepProps) {
  const image = lessonImage(topicId);
  return (
    <Column gap="lg">
      {retakeNote && <Callout variant="boxed" tone="danger" icon="replay" text={retakeNote} />}
      <RichText text={objective} variant="subtitle" tone="muted" weight="regular" />
      {image ? (
        <Figure source={image} alt={`Infografía: ${title}`} />
      ) : (
        <AppText variant="caption">Este tema aún no tiene infografía.</AppText>
      )}
      <Callout
        variant="boxed"
        tone="accent"
        icon="flag"
        title="Cómo se aprueba este tema"
        text={howToPass}
      />
    </Column>
  );
}
