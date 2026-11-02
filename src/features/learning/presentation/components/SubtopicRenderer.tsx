import type { ReactNode } from 'react';

import { Callout, Column, RichText } from '@/shared/ui';

import type { ContentBlock } from '../../domain/entities/TopicSession';
import { contentIcon } from './contentIcons';
import { TAccountCard } from './TAccountCard';

type BlockType = ContentBlock['type'];
type BlockRenderer<T extends BlockType> = (block: Extract<ContentBlock, { type: T }>) => ReactNode;

// Registry: un componente por tipo de bloque. Bloque nuevo = esquema Zod + tipo en el dominio +
// entrada aquí (TypeScript exige la entrada: el registro cubre todos los tipos).
const renderers: { [T in BlockType]: BlockRenderer<T> } = {
  paragraph: (b) => <RichText text={b.text} />,
  t_account: (b) => <TAccountCard debit={b.debit} credit={b.credit} />,
  callout: (b) => (
    <Callout
      variant="boxed"
      tone="accent"
      icon={contentIcon(b.icon)}
      title={b.title}
      text={b.text}
    />
  ),
  example: (b) => (
    <Callout
      variant="boxed"
      tone="primary"
      icon="lightbulb-on-outline"
      title={b.title ?? 'Ejemplo'}
      text={b.text}
    />
  ),
};

function renderBlock(block: ContentBlock): ReactNode {
  return (renderers[block.type] as BlockRenderer<BlockType>)(block as never);
}

type SubtopicRendererProps = {
  blocks: ContentBlock[];
};

/** Pinta el contenido de un subtema bloque por bloque. */
export function SubtopicRenderer({ blocks }: SubtopicRendererProps) {
  return (
    <Column gap="lg">
      {blocks.map((block, i) => (
        // El contenido es estático dentro de un paso: el índice es una llave estable.
        <Column key={`${block.type}-${i}`}>{renderBlock(block)}</Column>
      ))}
    </Column>
  );
}
