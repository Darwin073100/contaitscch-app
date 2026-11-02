import { BlockSchema } from '@/core/database/seed/contentSchema';

import type { ContentBlock } from '../../domain/entities/TopicSession';

const BlocksSchema = BlockSchema.array();

/**
 * `subtopic.content` (JSON) → bloques del dominio. Se valida otra vez por si la fila no vino del
 * ContentSeeder. Si `BlockSchema` y `ContentBlock` se separan, esto deja de compilar.
 */
export function toContentBlocks(content: string): ContentBlock[] {
  return BlocksSchema.parse(JSON.parse(content));
}
