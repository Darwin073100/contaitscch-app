import type { IconName } from '@/shared/ui';

// Los JSON del curso usan nombres cortos de icono ("scale"); aquí se traducen al set de la app.
// Un icono nuevo en el contenido = una entrada aquí. Si no se reconoce, se usa el de información.
const contentIcons: Record<string, IconName> = {
  scale: 'scale-balance',
  lightbulb: 'lightbulb-on-outline',
  info: 'information-outline',
  warning: 'alert-outline',
  book: 'book-open-variant',
};

export function contentIcon(name: string | undefined): IconName {
  return (name && contentIcons[name]) || 'information-outline';
}
