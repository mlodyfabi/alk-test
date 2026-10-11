import type { Scale } from './scale';

export interface AxisProps {
  orientation: 'x' | 'y';
  scale: Scale;
  ticks: number[];
  /** Plot area bounds in px: x axis uses [left,right] at y=offset, y axis [top,bottom] at x=offset */
  from: number;
  to: number;
  offset: number;
  format: (v: number) => string;
  grid?: boolean;
  /** For y axis grid: width of plot */
  gridLength?: number;
}

/** SVG axis with optional grid lines. */
export function Axis({
  orientation,
  scale,
  ticks,
  from,
  to,
  offset,
  format,
  grid,
  gridLength,
}: AxisProps) {
  if (orientation === 'x') {
    return (
      <g className="axis">
        <line x1={from} x2={to} y1={offset} y2={offset} className="axis-line" />
        {ticks.map((t) => (
          <g key={t} transform={`translate(${scale(t)},${offset})`}>
            <line y2={5} className="axis-line" />
            <text y={19} textAnchor="middle" className="axis-text">
              {format(t)}
            </text>
          </g>
        ))}
      </g>
    );
  }
  return (
    <g className="axis">
      {ticks.map((t) => (
        <g key={t} transform={`translate(${offset},${scale(t)})`}>
          {grid && <line x2={gridLength ?? 0} className="grid-line" />}
          <text x={-8} dy="0.32em" textAnchor="end" className="axis-text">
            {format(t)}
          </text>
        </g>
      ))}
      <line x1={offset} x2={offset} y1={from} y2={to} className="axis-line" />
    </g>
  );
}
