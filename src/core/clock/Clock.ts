import { format } from 'date-fns';

export interface Clock {
  /** Instante actual en ISO-8601 UTC, para columnas como earned_at o synced_at. */
  nowIso(): string;
  /** Día local del usuario en formato YYYY-MM-DD. */
  todayLocal(): string;
}

export class SystemClock implements Clock {
  nowIso(): string {
    return new Date().toISOString();
  }

  todayLocal(): string {
    return format(new Date(), 'yyyy-MM-dd');
  }
}
