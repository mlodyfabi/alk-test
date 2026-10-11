import type { TimelineEvent } from '../types';

/** Latest event at or before `year`, or undefined. */
export function activeEvent(events: TimelineEvent[], year: number): TimelineEvent | undefined {
  return [...events].filter((e) => e.year <= year).sort((a, b) => b.year - a.year)[0];
}

export function eventsByYear(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.year - b.year);
}
