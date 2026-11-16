import { Callout, Column } from '@/shared/ui';

type ReviewStepProps = { keyIdea: string; commonError: string; activity: string };

/** Paso 4: idea clave, error común y actividad para practicar. */
export function ReviewStep({ keyIdea, commonError, activity }: ReviewStepProps) {
  return (
    <Column gap="md">
      <Callout tone="amber" icon="key-variant" title="Idea clave" text={keyIdea} />
      <Callout tone="danger" icon="alert-outline" title="Error común" text={commonError} />
      <Callout
        tone="muted"
        icon="pencil-outline"
        title="Actividad para practicar"
        text={activity}
      />
    </Column>
  );
}
