import { InMemoryDomainEventBus, type DomainEvent } from './DomainEventBus';

describe('InMemoryDomainEventBus', () => {
  const event: DomainEvent = { type: 'ProgressChanged', quizId: 101 };

  it('entrega el evento a todos los oyentes', () => {
    const bus = new InMemoryDomainEventBus();
    const a = jest.fn();
    const b = jest.fn();
    bus.subscribe(a);
    bus.subscribe(b);

    bus.publish(event);

    expect(a).toHaveBeenCalledWith(event);
    expect(b).toHaveBeenCalledWith(event);
  });

  it('deja de avisar al cancelar la suscripción', () => {
    const bus = new InMemoryDomainEventBus();
    const listener = jest.fn();
    const unsubscribe = bus.subscribe(listener);

    unsubscribe();
    bus.publish(event);

    expect(listener).not.toHaveBeenCalled();
  });

  it('un oyente que falla no impide que los demás reciban el evento', () => {
    const bus = new InMemoryDomainEventBus();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const after = jest.fn();
    bus.subscribe(() => {
      throw new Error('falla');
    });
    bus.subscribe(after);

    bus.publish(event);

    expect(after).toHaveBeenCalledWith(event);
    spy.mockRestore();
  });
});
