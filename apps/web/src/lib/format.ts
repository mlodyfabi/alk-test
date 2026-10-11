const nf = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export const fmtInt = (n: number) => nf.format(Math.round(n));
export const fmtDec1 = (n: number) => nf1.format(n);
export const fmtDec2 = (n: number) => nf2.format(n);
export const fmtPct = (n: number) => `${nf1.format(n)}%`;
export const fmtPLN = (n: number) => `${nf.format(Math.round(n))} zł`;
/** Compact: 1 234 567 -> "1,2 mln" */
export function fmtCompact(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return `${nf1.format(n / 1e9)} mld`;
  if (a >= 1e6) return `${nf1.format(n / 1e6)} mln`;
  if (a >= 1e4) return `${nf.format(n / 1e3)} tys.`;
  return nf.format(n);
}
