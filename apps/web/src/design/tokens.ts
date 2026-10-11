/** Colour tokens mirrored in styles/global.css (CSS variables). Series colours reach >=3:1 contrast on the dark panel (--bg). */
export const SERIES = [
  '#ff7a6b', // coral
  '#8d8bff', // periwinkle
  '#f7a072', // apricot
  '#5cd0e0', // cyan
  '#f283c6', // pink
  '#ffd9a8', // cream
  '#6ee7b7', // mint
] as const;

export const COLORS = {
  gross: '#8d8bff',
  deduction: '#ff7a6b',
  result: '#6ee7b7',
  warn: '#ffd23f',
  positive: '#6ee7b7',
} as const;

export function seriesColor(i: number): string {
  return SERIES[i % SERIES.length]!;
}
