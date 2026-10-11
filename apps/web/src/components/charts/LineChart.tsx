import { useId } from 'react';
import { Axis } from './Axis';
import { linear, niceTicks } from './scale';

export interface LineSeries {
  id: string;
  label: string;
  color: string;
  values: number[];
  dashed?: boolean;
}
export interface LineMarker {
  x: number;
  label: string;
  color: string;
}
export interface LineChartProps {
  xs: number[];
  series: LineSeries[];
  markers?: LineMarker[];
  formatX: (v: number) => string;
  formatY: (v: number) => string;
  title: string;
  /** draw a zero baseline highlighted (useful for profit/loss charts) */
  zeroLine?: boolean;
  yMin?: number;
  yMax?: number;
  height?: number;
}

const W = 800;
const M = { top: 22, right: 110, bottom: 30, left: 64 };

/** Multi-series line chart with direct end labels and vertical markers. */
export function LineChart({
  xs,
  series,
  markers = [],
  formatX,
  formatY,
  title,
  zeroLine,
  yMin,
  yMax,
  height = 320,
}: LineChartProps) {
  const id = useId();
  const all = series.flatMap((s) => s.values);
  const lo = yMin ?? Math.min(0, ...all);
  const hi = yMax ?? Math.max(1, ...all);
  const ticks = niceTicks(lo, hi, 5);
  const y0 = Math.min(lo, ticks[0] ?? lo);
  const y1 = Math.max(hi, ticks[ticks.length - 1] ?? hi);
  const x = linear(xs[0] ?? 0, xs[xs.length - 1] ?? 1, M.left, W - M.right);
  const y = linear(y0, y1, height - M.bottom, M.top);
  const xTicks = niceTicks(xs[0] ?? 0, xs[xs.length - 1] ?? 1, 6);

  // nudge end labels apart
  const ends = series
    .map((s) => ({ s, y: y(s.values[s.values.length - 1] ?? 0) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) {
    const prev = ends[i - 1]!;
    const cur = ends[i]!;
    if (cur.y - prev.y < 14) cur.y = prev.y + 14;
  }

  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-labelledby={`${id}-t`} className="chart">
      <title id={`${id}-t`}>{title}</title>
      <Axis
        orientation="y"
        scale={y}
        ticks={ticks}
        from={M.top}
        to={height - M.bottom}
        offset={M.left}
        format={formatY}
        grid
        gridLength={W - M.left - M.right}
      />
      <Axis
        orientation="x"
        scale={x}
        ticks={xTicks}
        from={M.left}
        to={W - M.right}
        offset={height - M.bottom}
        format={formatX}
      />
      {zeroLine && y0 < 0 && (
        <line x1={M.left} x2={W - M.right} y1={y(0)} y2={y(0)} className="zero-line" />
      )}
      {series.map((s) => (
        <polyline
          key={s.id}
          fill="none"
          stroke={s.color}
          strokeWidth={2.4}
          strokeDasharray={s.dashed ? '6 4' : undefined}
          strokeLinejoin="round"
          points={xs.map((px, i) => `${x(px)},${y(s.values[i] ?? 0)}`).join(' ')}
        />
      ))}
      {markers.map((m) => (
        <g key={m.label}>
          <line
            x1={x(m.x)}
            x2={x(m.x)}
            y1={M.top}
            y2={height - M.bottom}
            stroke={m.color}
            strokeDasharray="4 3"
          />
          <text x={x(m.x) + 5} y={M.top + 10} className="direct-label" fill={m.color}>
            {m.label}
          </text>
        </g>
      ))}
      {ends.map(({ s, y: ly }) => (
        <text
          key={s.id}
          x={W - M.right + 8}
          y={ly}
          dy="0.32em"
          className="direct-label"
          fill={s.color}
        >
          {s.label}
        </text>
      ))}
    </svg>
  );
}
