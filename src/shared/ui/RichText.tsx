import { AppText, type AppTextProps } from './AppText';
import { parseEmphasis } from './parseEmphasis';

type RichTextProps = Omit<AppTextProps, 'children'> & {
  /** Texto con negritas en formato `**así**` (igual que en los JSON de contenido). */
  text: string;
  /** Color de los fragmentos en negrita; por defecto blanco. */
  emphasisTone?: AppTextProps['tone'];
};

export function RichText({ text, emphasisTone = 'default', ...props }: RichTextProps) {
  return (
    <AppText {...props}>
      {parseEmphasis(text).map((segment, i) =>
        segment.bold ? (
          <AppText key={i} variant={props.variant} weight="bold" tone={emphasisTone}>
            {segment.text}
          </AppText>
        ) : (
          segment.text
        ),
      )}
    </AppText>
  );
}
