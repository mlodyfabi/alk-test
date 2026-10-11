import type { FormatRevenueData, FormatYear, MarketInfo } from '../types';

/** Percent share (0..100) of each key in the total. Zero total gives zeros. */
export function shareOfTotal(values: Record<string, number>): Record<string, number> {
  const total = Object.values(values).reduce((s, v) => s + v, 0);
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, total > 0 ? (v / total) * 100 : 0]),
  );
}

/** Revenue per inhabitant (ARPU) in the same currency unit as total (mln / mln). */
export function perCapita(totalMln: number, populationMln: number): number {
  return populationMln > 0 ? totalMln / populationMln : 0;
}

/** Segment values of a market for 2025; absolute (mln) or per capita. */
export function marketSegmentValues(market: MarketInfo, mode: 'absolute' | 'perCapita') {
  const out: Record<string, number> = {};
  for (const [id, pct] of Object.entries(market.segments_2025)) {
    const abs = (market.total_revenue_2025_mln * pct) / 100;
    out[id] = mode === 'absolute' ? abs : perCapita(abs, market.population_mln);
  }
  return out;
}

export function valuesForYear(data: FormatRevenueData, year: number): FormatYear | undefined {
  return data.years.find((y) => y.year === year);
}

/** Values of enabled formats only, with recomputed total. */
export function filterFormats(row: FormatYear, enabled: string[]) {
  const values: Record<string, number> = {};
  let total = 0;
  for (const id of enabled) {
    const v = row.values[id] ?? 0;
    values[id] = v;
    total += v;
  }
  return { year: row.year, values, total };
}
