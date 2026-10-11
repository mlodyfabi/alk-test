export interface LegendItem {
  id: string;
  label: string;
  color: string;
}
/** Colour key for charts; keep it next to the chart for series without direct labels. */
export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="legend">
      {items.map((i) => (
        <li key={i.id}>
          <span className="swatch" style={{ background: i.color }} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
