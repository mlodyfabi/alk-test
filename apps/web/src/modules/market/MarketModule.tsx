import { useState } from 'react';
import { marketSegmentValues, perCapita } from '@mml/core';
import { Card, DataTable, Segmented } from '../../components/ui';
import { Legend, LineChart, StackedBars } from '../../components/charts';
import { seriesColor } from '../../design/tokens';
import { marketsData } from '../../data';
import { pl } from '../../i18n/pl';
import { fmtDec1, fmtDec2, fmtInt, fmtPct } from '../../lib/format';

const t = pl.market;
const { markets, segments } = marketsData;
const years = markets[0]!.streaming_share_history.map((h) => h.year);

export function MarketModule() {
  const [mode, setMode] = useState<'absolute' | 'perCapita'>('absolute');
  const fmt = mode === 'absolute' ? fmtInt : fmtDec1;
  const unit = mode === 'absolute' ? t.unitAbs : t.unitPc;
  const modeLabel = mode === 'absolute' ? t.absolute : t.perCapita;

  return (
    <div className="module">
      <header className="module-head">
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
      </header>

      <Card title={`${t.structure} (${unit})`}>
        <Segmented
          label={t.mode}
          value={mode}
          options={[
            { value: 'absolute', label: t.absolute },
            { value: 'perCapita', label: t.perCapita },
          ]}
          onChange={(v) => setMode(v as typeof mode)}
        />
        <StackedBars
          rows={markets.map((m) => {
            const vals = marketSegmentValues(m, mode);
            return {
              id: m.id,
              label: m.label,
              segments: segments.map((s, i) => ({
                id: s.id,
                label: s.label,
                color: seriesColor(i),
                value: vals[s.id] ?? 0,
              })),
            };
          })}
          formatValue={fmt}
          title={t.structureTitle(modeLabel)}
        />
        <Legend
          items={segments.map((s, i) => ({ id: s.id, label: s.label, color: seriesColor(i) }))}
        />
        <DataTable
          summary={pl.common.chartData}
          head={[
            '',
            t.population,
            t.total + ` (${unit})`,
            ...segments.map((s) => `${s.label} (%)`),
          ]}
          rows={markets.map((m) => [
            m.label,
            fmtInt(m.population_mln),
            mode === 'absolute'
              ? fmtInt(m.total_revenue_2025_mln)
              : fmtDec2(perCapita(m.total_revenue_2025_mln, m.population_mln)),
            ...segments.map((s) => fmtPct(m.segments_2025[s.id] ?? 0)),
          ])}
        />
      </Card>

      <Card title={t.history}>
        <LineChart
          xs={years}
          series={markets.map((m, i) => ({
            id: m.id,
            label: m.label,
            color: seriesColor(i),
            values: m.streaming_share_history.map((h) => h.share),
          }))}
          formatX={String}
          formatY={(v) => `${fmtInt(v)}%`}
          yMin={0}
          yMax={100}
          title={t.historyTitle}
        />
        <DataTable
          summary={pl.common.chartData}
          head={['', ...markets.map((m) => m.label)]}
          rows={years.map((y, yi) => [
            y,
            ...markets.map((m) => fmtPct(m.streaming_share_history[yi]?.share ?? 0)),
          ])}
        />
      </Card>
    </div>
  );
}
