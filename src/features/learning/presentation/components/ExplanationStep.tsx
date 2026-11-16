import { Column, RichText } from '@/shared/ui';

type ExplanationStepProps = { paragraphs: string[] };

/** Paso 2: explicación del tema en párrafos. */
export function ExplanationStep({ paragraphs }: ExplanationStepProps) {
  return (
    <Column gap="md">
      {paragraphs.map((text, i) => (
        // El contenido es estático: el índice es una llave estable
        <RichText key={i} text={text} variant="body" />
      ))}
    </Column>
  );
}
