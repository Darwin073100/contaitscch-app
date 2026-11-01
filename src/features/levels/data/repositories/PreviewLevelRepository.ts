import type { LevelProgress } from '../../domain/entities/Level';
import type { LevelRepository } from '../../domain/repositories/LevelRepository';

// Temporal: textos de docs/design/menu-inicio-niveles.png con el mismo avance que el temario de
// ejemplo de learning (Básico 3/6). Se reemplaza por SqliteLevelRepository
// (ver spec/03_home_levels_spec.md, sección 9).
const preview: LevelProgress[] = [
  {
    id: 1,
    name: 'Básico',
    sortOrder: 1,
    subtitle: 'Fundamentos y Cuentas',
    description:
      'Domina la estructura del Activo, Pasivo, Capital y la regla de oro: Causa y Efecto en libros diarios.',
    completedTopics: 3,
    totalTopics: 6,
    examPassed: false,
  },
  {
    id: 2,
    name: 'Intermedio',
    sortOrder: 2,
    subtitle: 'Estados Financieros e IVA',
    description:
      'Elabora Balance General y Estado de Resultados, y calcula el IVA de cada operación.',
    completedTopics: 0,
    totalTopics: 6,
    examPassed: false,
  },
  {
    id: 3,
    name: 'Avanzado',
    sortOrder: 3,
    subtitle: 'Costos, Auditoría y Fiscal',
    description:
      'Analiza costos de producción, revisa estados con criterio de auditoría y cumple con el SAT.',
    completedTopics: 0,
    totalTopics: 6,
    examPassed: false,
  },
];

export class PreviewLevelRepository implements LevelRepository {
  async getProgress(): Promise<LevelProgress[]> {
    return preview;
  }
}
