// Composition root: aquí se instancian repositorios y use cases (inyección por constructor).
// Vive fuera de src/app porque Expo Router trata cada archivo de src/app como una ruta.
// Es el único lugar que importa rutas internas de las features (data/ y domain/).
import { SystemClock, type Clock } from '@/core/clock/Clock';
import { PreviewSyllabusRepository } from '@/features/learning/data/repositories/PreviewSyllabusRepository';
import { GetSyllabusUseCase } from '@/features/learning/domain/usecases/GetSyllabusUseCase';

export type Container = {
  clock: Clock;
  learning: {
    getSyllabus: GetSyllabusUseCase;
  };
};

export function createContainer(): Container {
  const syllabi = new PreviewSyllabusRepository();

  return {
    clock: new SystemClock(),
    learning: {
      getSyllabus: new GetSyllabusUseCase(syllabi),
    },
  };
}
