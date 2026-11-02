export type TAccountItem = {
  /** Aumento (+), disminución (−) o sin signo. */
  sign: 'plus' | 'minus' | null;
  /** Texto tal cual viene del JSON ("+ Activo"). */
  text: string;
};

// Se aceptan el signo menos tipográfico (−), el guion (-) y la raya corta (–).
const MINUS = ['−', '-', '–'];

/** "+ Activo" → aumento; "− Pasivo" → disminución. El signo decide el icono del movimiento. */
export function parseTAccountItem(raw: string): TAccountItem {
  const text = raw.trim();
  const first = text.charAt(0);
  if (first === '+') return { sign: 'plus', text };
  if (MINUS.includes(first)) return { sign: 'minus', text };
  return { sign: null, text };
}
