import { useId } from 'react';

export interface BarSegment {
  id: string;
  label: string;
  color: string;
  value: number;
}
export interface BarRow {
  id: string;
  label: string;
  segments: BarSegment[];
}
export interface StackedBarsProps {
  rows: BarRow[];
  formatValue: (v: number) => string;
  /** true: every bar fills the width (shares); false: bars share one scale */
  normalize?: boolean;
  title: string;
}

const W = 800;
const LABEL_W = 120;
const ROW_H = 44;

/** Horizontal stacked bars, one row per category, values printed inside wide segments. */
export function StackedBars({ rows, formatValue, normalize = false, title }: StackedBarsProps) {
  const id = useId();
  const totals = rows.map((r) => r.segments.reduce((s, x) => s + x.value, 0));
  const max = Math.max(1e-9, ...totals);
  const plotW = W - LABEL_W - 80;
  const height = rows.length * ROW_H + 8;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-labelledby={`${id}-t`} className="chart">
      <title id={`${id}-t`}>{title}</title>
      {rows.map((r, ri) => {
        const total = totals[ri] ?? 0;
        const scale = plotW / (normalize ? total || 1 : max);
        let x = LABEL_W;
        return (
          <g key={r.id} transform={`translate(0,${ri * ROW_H + 4})`}>
            <text
              x={LABEL_W - 10}
              y={ROW_H / 2 - 4}
              textAnchor="end"
              dy="0.32em"
              className="row-label"
            >
              {r.label}
            </text>
            {r.segments.map((s) => {
              const w = s.value * scale;
              const sx = x;
              x += w;
              return (
                <g key={s.id}>
                  <rect
                    x={sx}
                    y={4}
                    width={Math.max(0, w)}
                    height={ROW_H - 12}
                    fill={s.color}
                    stroke="var(--bg)"
                    strokeWidth={1}
                  >
                    <title>{`${s.label}: ${formatValue(s.value)}`}</title>
                  </rect>
                  {w > 54 && (
                    <text
                      x={sx + w / 2}
                      y={ROW_H / 2 - 2}
                      textAnchor="middle"
                      dy="0.32em"
                      className="bar-text"
                    >
                      {formatValue(s.value)}
                    </text>
                  )}
                </g>
              );
            })}
            <text x={x + 8} y={ROW_H / 2 - 2} dy="0.32em" className="value-label">
              {formatValue(total)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
