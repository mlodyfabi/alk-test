/** Colour tokens mirrored in styles/global.css (CSS variables). Series colours reach WCAG AA (>=3:1 for graphics) on --bg. */
export const SERIES = [
  '#f0b04a', // amber
  '#d9703d', // copper
  '#5bb8b0', // teal
  '#b79af0', // lilac
  '#d8cba3', // sand
  '#8fc06a', // moss
  '#e5798f', // rose
] as const;

export const COLORS = {
  gross: '#f0b04a',
  deduction: '#c0643a',
  result: '#5bb8b0',
  warn: '#ff6b6b',
  positive: '#8fc06a',
} as const;

export function seriesColor(i: number): string {
  return SERIES[i % SERIES.length]!;
}
