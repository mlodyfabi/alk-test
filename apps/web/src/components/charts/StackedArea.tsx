import { useId, type PointerEvent } from 'react';
import { Axis } from './Axis';
import { linear, niceMax, niceTicks } from './scale';

export interface AreaSeries {
  id: string;
  label: string;
  color: string;
  /** one value per x */
  values: number[];
}
export interface StackedAreaProps {
  xs: number[];
  /** drawn bottom to top */
  series: AreaSeries[];
  /** index into xs of the highlighted point */
  activeIndex: number;
  onSelect?: (index: number) => void;
  formatY: (v: number) => string;
  /** accessible name of the chart */
  title: string;
  height?: number;
}

const W = 800;
const M = { top: 16, right: 96, bottom: 30, left: 56 };

/** Stacked area chart with direct series labels and a highlighted x position. */
export function StackedArea({
  xs,
  series,
  activeIndex,
  onSelect,
  formatY,
  title,
  height = 360,
}: StackedAreaProps) {
  const id = useId();
  const n = xs.length;
  const totals = xs.map((_, i) => series.reduce((s, x) => s + (x.values[i] ?? 0), 0));
  const yMax = niceMax(Math.max(1, ...totals));
  const x = linear(xs[0] ?? 0, xs[n - 1] ?? 1, M.left, W - M.right);
  const y = linear(0, yMax, height - M.bottom, M.top);

  const cum = xs.map(() => 0);
  const layers = series.map((s) => {
    const lower = [...cum];
    s.values.forEach((v, i) => (cum[i] = (cum[i] ?? 0) + v));
    const upper = [...cum];
    const top = xs.map((px, i) => `${x(px)},${y(upper[i] ?? 0)}`);
    const bottom = xs.map((px, i) => `${x(px)},${y(lower[i] ?? 0)}`).reverse();
    return { s, lower, upper, d: `M${top.join('L')}L${bottom.join('L')}Z` };
  });

  const pick = (e: PointerEvent<SVGRectElement>) => {
    if (!onSelect) return;
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * (W - M.left - M.right) + M.left;
    let best = 0;
    xs.forEach((v, i) => {
      if (Math.abs(x(v) - px) < Math.abs(x(xs[best] ?? 0) - px)) best = i;
    });
    onSelect(best);
  };

  const ax = xs[activeIndex];
  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-labelledby={`${id}-t`} className="chart">
      <title id={`${id}-t`}>{title}</title>
      <Axis
        orientation="y"
        scale={y}
        ticks={niceTicks(0, yMax, 5)}
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
        ticks={xs.filter((v) => v % 5 === 0)}
        from={M.left}
        to={W - M.right}
        offset={height - M.bottom}
        format={String}
      />
      {layers.map(({ s, d }) => (
        <path
          key={s.id}
          d={d}
          fill={s.color}
          fillOpacity={0.88}
          stroke="var(--bg)"
          strokeWidth={1}
        />
      ))}
      {layers.map(({ s, lower, upper }) => {
        const mid = ((lower[n - 1] ?? 0) + (upper[n - 1] ?? 0)) / 2;
        const h = y(lower[n - 1] ?? 0) - y(upper[n - 1] ?? 0);
        return h > 11 ? (
          <text
            key={s.id}
            x={W - M.right + 8}
            y={y(mid)}
            dy="0.32em"
            className="direct-label"
            fill={s.color}
          >
            {s.label}
          </text>
        ) : null;
      })}
      {ax !== undefined && (
        <g pointerEvents="none">
          <line x1={x(ax)} x2={x(ax)} y1={M.top} y2={height - M.bottom} className="cursor-line" />
          {layers.map(({ s, upper }) => (
            <circle
              key={s.id}
              cx={x(ax)}
              cy={y(upper[activeIndex] ?? 0)}
              r={3.5}
              fill={s.color}
              stroke="var(--bg)"
              strokeWidth={1.5}
            />
          ))}
        </g>
      )}
      {onSelect && (
        <rect
          x={M.left}
          y={M.top}
          width={W - M.left - M.right}
          height={height - M.top - M.bottom}
          fill="transparent"
          onPointerDown={pick}
          onPointerMove={(e) => e.buttons === 1 && pick(e)}
          style={{ cursor: 'col-resize', touchAction: 'pan-y' }}
        />
      )}
    </svg>
  );
}
