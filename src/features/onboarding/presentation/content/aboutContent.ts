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
    tagline: 'Plataforma Académica Gamificada',
  },
  highlights: [
    { icon: 'fire', color: 'streak', label: 'Rachas Diarias' },
    { icon: 'lightning-bolt', color: 'primary', label: 'XP Puntos Progreso' },
    { icon: 'infinity', color: 'danger', label: 'Vidas Ilimitadas' },
  ] satisfies Highlight[],
  intro: {
    title: '¿Qué es CONTAITSCCH?',
    text:
      'Es un entorno educativo interactivo diseñado especialmente para que la comunidad estudiantil ' +
      'domine los pilares contables de manera intuitiva y sin frustración. Mediante micro-retos ' +
      'basados en el modelo de repetición espaciada, transformamos la complejidad de la disciplina ' +
      'contable en una experiencia motivante, visual y tangible.',
    topics: [
      { icon: 'scale-balance', label: 'Partida Doble' },
      { icon: 'table-large', label: 'Cuentas T' },
      { icon: 'chart-bar', label: 'Estados Financieros' },
    ] satisfies Topic[],
  },
  objectives: [
    {
      icon: 'head-lightbulb-outline',
      tone: 'primarySoft',
      title: 'Aprendizaje Práctico',
      description:
        'Facilitar la comprensión de los fundamentos contables mediante ejercicios breves, escenarios aplicados y mecánicas dinámicas.',
    },
    {
      icon: 'lock-open-variant-outline',
      tone: 'accentSoft',
      title: 'Cero Bloqueos por Errores',
      description:
        'Vidas ilimitadas pensadas para aprender guiadamente del error sin temor a penalizaciones ni tiempos de espera.',
    },
    {
      icon: 'trending-up',
      tone: 'infoSoft',
      title: 'Constancia Medible',
      description:
        'Impulsar la disciplina formativa a través de rachas consecutivas, métricas de retención y acumulación de experiencia (XP).',
    },
  ] satisfies Objective[],
  institution: {
    overline: 'Institución de respaldo',
    // Pendiente: nombre oficial completo del ITSSCH (spec 04, sección 8).
    name: 'ITSSCH',
    detail: 'División de Contaduría Pública',
  },
  team,
  closing: 'Desarrollado con orgullo para la comunidad estudiantil de Contaduría',
  cta: '¡Comenzar a Aprender!',
};
