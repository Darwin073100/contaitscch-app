// API pública de glossary: lo único que src/app y otras features pueden importar.
export type { Glossary, GlossaryGroup, GlossaryTerm } from './domain/entities/Glossary';
export { GetGlossaryUseCase } from './domain/usecases/GetGlossaryUseCase';
