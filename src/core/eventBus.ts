type Listener<T> = (payload: T) => void;

export class EventBus<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
    (this.listeners[event] ??= []).push(listener);
    return () => this.off(event, listener); // returns unsubscribe fn
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
    this.listeners[event] = (this.listeners[event] ?? []).filter((l) => l !== listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    for (const l of this.listeners[event] ?? []) l(payload);
  }
}