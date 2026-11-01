export type TextSegment = { text: string; bold: boolean };

/** Divide "El **DEBE** y el **HABER**" en segmentos normales y en negrita (formato de los JSON de contenido). */
export function parseEmphasis(input: string): TextSegment[] {
  return input
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((part) => part.length > 0)
    .map((part) =>
      part.startsWith('**') && part.endsWith('**') && part.length > 4
        ? { text: part.slice(2, -2), bold: true }
        : { text: part, bold: false },
    );
}
