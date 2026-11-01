---
name: new-usecase
description: Crea un caso de uso con su interfaz de repositorio, implementación, registro en DI y prueba unitaria, siguiendo Clean Architecture. Úsalo cuando haya que agregar una acción de negocio (completar tema, enviar examen, sincronizar, etc.).
argument-hint: <feature> <NombreUseCase> [qué hace]
---

Crea el use case descrito en: `$ARGUMENTS`

## Plantilla obligatoria
```ts
// src/features/<feature>/domain/usecases/<Nombre>UseCase.ts
export class <Nombre>UseCase {
  constructor(
    // solo interfaces de domain/ o de index.ts de otras features, Clock, UnitOfWork, DomainEventBus
  ) {}

  async execute(input: <Nombre>Input): Promise<Result<<Nombre>Output, <Nombre>Error>> {
    // 1. validar entrada  2. reglas de negocio (policies puras)
    // 3. escribir dentro de uow.run(tx => ...) si toca varias tablas
    // 4. publicar evento de dominio si otras features deben enterarse
  }
}
```

## Pasos
1. Lee el `index.ts` y `domain/` de la feature para reutilizar entidades e interfaces existentes.
2. Si hace falta, agrega métodos a la interfaz del repositorio (ISP: interfaces pequeñas).
3. Implementa el método en `data/repositories/` y su consulta en `data/datasources/`.
4. Registra el use case en `src/app/container.ts`.
5. Escribe `<Nombre>UseCase.test.ts` con repositorios en memoria y `FakeClock`,
   cubriendo el caso feliz, la idempotencia y los errores esperados.
6. `npx jest <archivo de test> && npm run typecheck`.
