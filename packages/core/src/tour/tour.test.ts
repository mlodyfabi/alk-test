import { describe, expect, it } from 'vitest';
import tourData from '../../../../data/tour-templates.json';
import type { TourTemplatesData } from '../types';
import { calculateBreakEven, calculateShow, calculateTour } from './index';

const {
  rates,
  venue_tiers: tiers,
  crew_presets: crews,
  tours,
} = tourData as unknown as TourTemplatesData;
const crew = crews[1]!;
const input = (tierId: string, sellThrough: number) => ({
  tier: tiers.find((t) => t.id === tierId)!,
  crew,
  rates,
  sellThrough,
  distanceKm: 200,
  nights: 1,
});

describe('tour show', () => {
  it('ticketed revenue = capacity * occupancy * price minus venue cut', () => {
    const r = calculateShow(input('club', 0.5));
    expect(r.attendance).toBe(200);
    expect(r.ticketGross).toBe(200 * 80);
    expect(r.artistTicketRevenue).toBeCloseTo(16000 * 0.85);
  });

  it('festival pays a flat fee regardless of sell-through', () => {
    const lo = calculateShow(input('festival', 0));
    const hi = calculateShow(input('festival', 1));
    expect(lo.artistTicketRevenue).toBe(40000);
    expect(hi.artistTicketRevenue).toBe(40000);
    expect(hi.profit).toBeGreaterThan(lo.profit);
  });

  it('0% sell-through gives a loss for ticketed venues', () => {
    expect(calculateShow(input('theatre', 0)).profit).toBeLessThan(0);
  });

  it('clamps sell-through to 0..1', () => {
    expect(calculateShow(input('club', 5)).attendance).toBe(400);
    expect(calculateShow(input('club', -1)).attendance).toBe(0);
  });
});

describe('break-even', () => {
  it.each(tiers.map((t) => t.id))('profit is ~0 at break-even for %s', (id) => {
    const be = calculateBreakEven(input(id, 0));
    if (be.tickets === null || !be.achievable) return;
    const cap = tiers.find((t) => t.id === id)!.capacity;
    const at = calculateShow(input(id, be.tickets / cap));
    expect(at.profit).toBeGreaterThanOrEqual(-1);
    if (be.tickets > 0) {
      const below = calculateShow(input(id, (be.tickets - 2) / cap));
      expect(below.profit).toBeLessThan(0);
    }
  });

  it('festival with a covering fee needs 0 tickets', () => {
    expect(calculateBreakEven(input('festival', 0)).tickets).toBe(0);
  });

  it('flags a break-even above capacity as not achievable', () => {
    const be = calculateBreakEven({ ...input('club', 0), distanceKm: 20000 });
    expect(be.achievable).toBe(false);
  });
});

describe('tour', () => {
  it('sums shows and handles a single stop', () => {
    const single = tours.find((t) => t.stops.length === 1)!;
    const r = calculateTour(single.stops, tiers, crew, rates, 0.8);
    expect(r.shows).toHaveLength(1);
    expect(r.profit).toBeCloseTo(r.shows[0]!.profit);
  });

  it('tour profit equals sum of show profits and per-stop override works', () => {
    const t = tours[0]!;
    const r = calculateTour(t.stops, tiers, crew, rates, 0.7);
    expect(r.profit).toBeCloseTo(r.shows.reduce((s, x) => s + x.profit, 0));
    const over = calculateTour(
      [{ ...t.stops[0]!, sellThrough: 1 }, ...t.stops.slice(1)],
      tiers,
      crew,
      rates,
      0.7,
    );
    expect(over.shows[0]!.attendance).toBe(tiers.find((x) => x.id === t.stops[0]!.tier)!.capacity);
  });

  it('throws on an unknown tier', () => {
    expect(() =>
      calculateTour(
        [{ city: 'X', tier: 'nope', distance_km: 0, nights: 1 }],
        tiers,
        crew,
        rates,
        1,
      ),
    ).toThrow();
  });
});
