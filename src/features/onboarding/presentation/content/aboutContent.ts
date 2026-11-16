import Constants from 'expo-constants';

import type { ColorToken } from '@/shared/theme';
import type { IconBoxProps, IconName } from '@/shared/ui';

// Contenido estático de "Acerca de" (historia "Introducción a la app"). No hay datos del usuario
// ni red: por eso no pasa por use case ni repositorio. Editar aquí los textos y el equipo.

type Highlight = { icon: IconName; color: ColorToken; label: string };
type Topic = { icon: IconName; label: string };
type Objective = {
  icon: IconName;
  tone: NonNullable<IconBoxProps['tone']>;
  title: string;
  description: string;
};
type Step = { icon: IconName; title: string; description: string };
export type TeamMember = { name: string; detail?: string };
export type TeamGroup = { role: string; members: TeamMember[] };

/** "1.0.0" de app.json → "v1.0". */
function versionLabel(version = '1.0.0'): string {
  return `v${version.split('.').slice(0, 2).join('.')}`;
}

const team: TeamGroup[] = [
  {
    role: 'Docencia y Asesoría Contable',
    members: [
      {
        name: 'Doc. Maribel Domínguez Vargas',
        detail: 'Profesora de la asignatura que dio origen al proyecto',
      },
    ],
  },
  {
    role: 'Alumnos',
    members: [
      { name: 'Fátima Amada Ponce Martínez' },
      { name: 'Benelly Jolette Caballero Morales' },
      { name: 'Diego Cervantes Santana' },
    ],
  },
  {
    role: 'Desarrollo y Diseño UI/UX',
    members: [
      {
        name: 'Ing. Edwin Garcia Quiterio',
        detail: 'Arquitectura móvil, gamificación y experiencia de usuario',
      },
    ],
  },
];

export const aboutContent = {
  hero: {
    version: versionLabel(Constants.expoConfig?.version),
    title: 'CONTAITSCCH',
    tagline: 'Aprendizaje claro, práctico y gradual',
  },
  highlights: [
    { icon: 'layers-outline', color: 'amber', label: '6 niveles' },
    { icon: 'book-open-page-variant-outline', color: 'accent', label: '24 temas' },
    { icon: 'check-circle-outline', color: 'amber', label: 'Ejercicio por tema' },
  ] satisfies Highlight[],
  intro: {
    title: '¿Qué es CONTAITSCCH?',
    text:
      'Es una aplicación para que la comunidad estudiantil aprenda contabilidad desde cero, de forma ' +
      'clara y gradual. El contenido avanza por 6 niveles; cada nivel tiene 4 temas y cada tema ' +
      'termina con un ejercicio. Todos los ejemplos usan negocios pequeños mexicanos: una papelería, ' +
      'una tienda, un taller, una cafetería.',
    topics: [
      { icon: 'scale-balance', label: 'Partida doble' },
      { icon: 'table-large', label: 'Cuentas T' },
      { icon: 'chart-line', label: 'Estados financieros' },
      { icon: 'receipt-text-outline', label: 'IVA e ISR' },
    ] satisfies Topic[],
  },
  howItWorks: [
    {
      icon: 'book-open-variant',
      title: 'Estudia el tema',
      description:
        'Objetivo, explicación, ejemplo resuelto y repaso con la idea clave y el error común.',
    },
    {
      icon: 'pencil-outline',
      title: 'Resuelve el ejercicio',
      description:
        'Preguntas sobre lo que acabas de ver. La app te dice si acertaste, sin revelar la respuesta.',
    },
    {
      icon: 'check-decagram',
      title: 'Aprueba para avanzar',
      description:
        'El siguiente tema se desbloquea al aprobar el ejercicio. Si no apruebas, vuelves a tomar la lección.',
    },
  ] satisfies Step[],
  objectives: [
    {
      icon: 'head-lightbulb-outline',
      tone: 'accent',
      title: 'Aprendizaje Práctico',
      description:
        'Facilitar la comprensión de los fundamentos contables mediante ejercicios breves, escenarios aplicados y mecánicas dinámicas.',
    },
    {
      icon: 'lock-open-variant-outline',
      tone: 'amber',
      title: 'Aprueba para avanzar',
      description:
        'El siguiente tema se desbloquea al aprobar el ejercicio. Si no apruebas, vuelves a tomar la lección sin penalizaciones.',
    },
    {
      icon: 'trending-up',
      tone: 'navy',
      title: 'Avance Medible',
      description:
        'Sigue tu progreso por nivel, compara tus temas aprobados en el ranking y termina con el examen integrador.',
    },
  ] satisfies Objective[],
  institution: {
    overline: 'Institución de respaldo',
    // Nombre tomado del prototipo del cliente; confirmar el nombre oficial completo.
    name: 'Instituto Tecnológico Superior · ITSCH',
    detail: 'División de Contaduría Pública',
  },
  team,
  closing: 'Desarrollado con orgullo para la comunidad estudiantil de Contaduría',
  cta: 'Comenzar a estudiar',
};
