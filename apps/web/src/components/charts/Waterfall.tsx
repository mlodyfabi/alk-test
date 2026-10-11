import { useId } from 'react';
import { Axis } from './Axis';
import { linear, niceMax, niceTicks } from './scale';

export interface WaterfallBar {
  id: string;
  label: string;
  value: number;
  /** gross: from zero, deduction: floats down from the running total, result: from zero */
  kind: 'gross' | 'deduction' | 'result';
}
export interface WaterfallProps {
  bars: WaterfallBar[];
  formatValue: (v: number) => string;
  formatAxis?: (v: number) => string;
  title: string;
  /** fixed axis maximum so two charts can share a scale */
  max?: number;
  height?: number;
  colors: Record<WaterfallBar['kind'], string>;
}

const W = 800;
const M = { top: 28, right: 12, bottom: 48, left: 56 };

function wrap(label: string): string[] {
  const words = label.split(' ');
  if (words.length < 2) return [label];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

/** Waterfall from a starting total to a final result. */
export function Waterfall({
  bars,
  formatValue,
  formatAxis,
  title,
  max,
  height = 340,
  colors,
}: WaterfallProps) {
  const id = useId();
  const top = niceMax(max ?? Math.max(1, ...bars.map((b) => b.value)));
  const y = linear(0, top, height - M.bottom, M.top);
  const slot = (W - M.left - M.right) / bars.length;
  const bw = Math.min(slot * 0.66, 72);
  let remaining = 0;
  return (
    <div className="chart-scroll">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        role="img"
        aria-labelledby={`${id}-t`}
        className="chart wide"
      >
        <title id={`${id}-t`}>{title}</title>
        <Axis
          orientation="y"
          scale={y}
          ticks={niceTicks(0, top, 5)}
          from={M.top}
          to={height - M.bottom}
          offset={M.left}
          format={formatAxis ?? formatValue}
          grid
          gridLength={W - M.left - M.right}
        />
        {bars.map((b, i) => {
          let hi: number, lo: number;
          if (b.kind === 'deduction') {
            hi = remaining;
            lo = remaining - b.value;
            remaining = lo;
          } else {
            hi = b.value;
            lo = 0;
            if (b.kind === 'gross') remaining = b.value;
          }
          const cx = M.left + slot * (i + 0.5);
          const barH = Math.max(1.5, y(lo) - y(hi));
          return (
            <g key={b.id}>
              <rect
                x={cx - bw / 2}
                y={y(hi)}
                width={bw}
                height={barH}
                fill={colors[b.kind]}
                rx={2}
              />
              <text x={cx} y={y(hi) - 7} textAnchor="middle" className="value-label">
                {formatValue(b.value)}
              </text>
              {wrap(b.label).map((line, li) => (
                <text
                  key={li}
                  x={cx}
                  y={height - M.bottom + 18 + li * 14}
                  textAnchor="middle"
                  className="axis-text"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
