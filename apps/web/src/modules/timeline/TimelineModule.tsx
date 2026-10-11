import { useMemo, useState } from 'react';
import { activeEvent, eventsByYear, filterFormats, shareOfTotal, valuesForYear } from '@mml/core';
import { Card, DataTable, Slider, Stat, Toggle } from '../../components/ui';
import { StackedArea } from '../../components/charts';
import { seriesColor } from '../../design/tokens';
import { formatData, timelineData } from '../../data';
import { pl } from '../../i18n/pl';
import { fmtDec1, fmtInt } from '../../lib/format';

const t = pl.timeline;
const years = formatData.years.map((y) => y.year);
const events = eventsByYear(timelineData.events);

export function TimelineModule() {
  const [year, setYear] = useState(2015);
  const [enabled, setEnabled] = useState<string[]>(formatData.formats.map((f) => f.id));

  const colors = useMemo(
    () => Object.fromEntries(formatData.formats.map((f, i) => [f.id, seriesColor(i)])),
    [],
  );
  const shown = formatData.formats.filter((f) => enabled.includes(f.id));
  const idx = Math.max(0, years.indexOf(year));
  const row = valuesForYear(formatData, year);
  const filtered = row ? filterFormats(row, enabled) : undefined;
  const shares = filtered ? shareOfTotal(filtered.values) : {};
  const current = activeEvent(events, year);

  const toggle = (id: string, on: boolean) =>
    setEnabled((cur) => (on ? [...cur, id] : cur.filter((x) => x !== id)));

  return (
    <div className="module">
      <header className="module-head">
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
      </header>

      <div className="grid-main">
        <Card>
          {shown.length === 0 ? (
            <p className="empty">{t.noFormats}</p>
          ) : (
            <StackedArea
              xs={years}
              series={shown.map((f) => ({
                id: f.id,
                label: f.label,
                color: colors[f.id]!,
                values: formatData.years.map((y) => y.values[f.id] ?? 0),
              }))}
              activeIndex={idx}
              onSelect={(i) => setYear(years[i] ?? year)}
              formatY={fmtInt}
              title={t.chartTitle}
            />
          )}
          <Slider
            label={t.year}
            value={year}
            min={years[0]!}
            max={years[years.length - 1]!}
            onChange={setYear}
          />
          <div className="toggles" role="group" aria-label={t.formats}>
            {formatData.formats.map((f) => (
              <Toggle
                key={f.id}
                label={f.label}
                checked={enabled.includes(f.id)}
                onChange={(on) => toggle(f.id, on)}
                color={colors[f.id]}
              />
            ))}
          </div>
          <DataTable
            summary={pl.common.chartData}
            head={[t.year, ...shown.map((f) => f.label), t.total]}
            rows={formatData.years.map((y) => {
              const f = filterFormats(y, enabled);
              return [y.year, ...shown.map((s) => fmtInt(f.values[s.id] ?? 0)), fmtInt(f.total)];
            })}
          />
        </Card>

        <Card title={`${t.year} ${year}`} className="readout">
          <Stat label={`${t.total} (${pl.common.unit})`} value={fmtInt(filtered?.total ?? 0)} />
          <ul className="share-list" aria-label={t.share}>
            {shown.map((f) => (
              <li key={f.id}>
                <span className="swatch" style={{ background: colors[f.id] }} aria-hidden="true" />
                <span className="share-name">{f.label}</span>
                <span className="share-bar" aria-hidden="true">
                  <span style={{ width: `${shares[f.id] ?? 0}%`, background: colors[f.id] }} />
                </span>
                <span className="share-val">{fmtDec1(shares[f.id] ?? 0)}%</span>
              </li>
            ))}
          </ul>
          {current && (
            <p className="current-event" aria-live="polite">
              <strong>{current.year}:</strong> {current.title}
            </p>
          )}
        </Card>
      </div>

      <h3 className="section-title">{t.events}</h3>
      <ol className="event-cards">
        {events.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              className={`event ${current?.id === e.id ? 'active' : ''}`}
              aria-current={current?.id === e.id ? 'true' : undefined}
              onClick={() => setYear(e.year)}
              aria-label={`${t.selectEvent} ${e.year}: ${e.title}`}
            >
              <span className="event-year">{e.year}</span>
              <span className="event-title">{e.title}</span>
              <span className="event-desc">{e.description}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
