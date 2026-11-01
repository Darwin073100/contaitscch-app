// Composition root: aquí se instancian repositorios y use cases (inyección por constructor).
// Vive fuera de src/app porque Expo Router trata cada archivo de src/app como una ruta.
import { SystemClock, type Clock } from '@/core/clock/Clock';

export type Container = {
  clock: Clock;
};

export function createContainer(): Container {
  return {
    clock: new SystemClock(),
  };
}
