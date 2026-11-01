import { tv, type VariantProps } from 'tailwind-variants';

// Variantes compartidas por Row y Column: las features componen layouts sin escribir clases.
export const layout = tv({
  variants: {
    direction: { row: 'flex-row', column: 'flex-col' },
    gap: { none: '', xs: 'gap-1', sm: 'gap-2', md: 'gap-3', lg: 'gap-4', xl: 'gap-6' },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    grow: { true: 'flex-1' },
    wrap: { true: 'flex-wrap' },
  },
  defaultVariants: { gap: 'none' },
});

export type LayoutVariants = Omit<VariantProps<typeof layout>, 'direction'>;
