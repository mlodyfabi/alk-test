import { describe, expect, it } from 'vitest';
import formats from '../../../../data/format-revenue.json';
import marketsJson from '../../../../data/markets.json';
import type { FormatRevenueData, MarketsData } from '../types';
import { activeEvent } from '../timeline';
import {
  filterFormats,
  marketSegmentValues,
  perCapita,
  shareOfTotal,
  valuesForYear,
} from './index';

const fr = formats as unknown as FormatRevenueData;
const { markets } = marketsJson as unknown as MarketsData;

describe('market helpers', () => {
  it('shareOfTotal sums to 100 and handles a zero total', () => {
    const s = shareOfTotal({ a: 1, b: 3 });
    expect(s.a! + s.b!).toBeCloseTo(100);
    expect(shareOfTotal({ a: 0 }).a).toBe(0);
  });

  it('perCapita divides and guards against zero population', () => {
    expect(perCapita(100, 4)).toBe(25);
    expect(perCapita(100, 0)).toBe(0);
  });

  it('valuesForYear finds rows or returns undefined', () => {
    expect(valuesForYear(fr, 2000)?.year).toBe(2000);
    expect(valuesForYear(fr, 1800)).toBeUndefined();
  });

  it('filterFormats recomputes total and shares', () => {
    const row = valuesForYear(fr, 2025)!;
    const f = filterFormats(row, ['streaming', 'vinyl']);
    expect(f.total).toBe(row.values.streaming! + row.values.vinyl!);
    expect(Object.keys(f.values)).toEqual(['streaming', 'vinyl']);
    expect(filterFormats(row, []).total).toBe(0);
  });

  it.each(markets)('segment values of $id add up to total in both modes', (m) => {
    const abs = Object.values(marketSegmentValues(m, 'absolute')).reduce((s, v) => s + v, 0);
    expect(abs).toBeCloseTo(m.total_revenue_2025_mln);
    const pc = Object.values(marketSegmentValues(m, 'perCapita')).reduce((s, v) => s + v, 0);
    expect(pc).toBeCloseTo(m.total_revenue_2025_mln / m.population_mln);
  });
});

describe('timeline', () => {
  it('activeEvent returns the latest event not after the year', () => {
    const ev = [
      { id: 'a', year: 1990, title: '', description: '' },
      { id: 'b', year: 2000, title: '', description: '' },
    ];
    expect(activeEvent(ev, 1999)?.id).toBe('a');
    expect(activeEvent(ev, 2000)?.id).toBe('b');
    expect(activeEvent(ev, 1980)).toBeUndefined();
  });
});
