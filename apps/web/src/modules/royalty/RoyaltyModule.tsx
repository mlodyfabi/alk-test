import { useState } from 'react';
import { calculateRecoupment, calculateRoyaltyWaterfall } from '@mml/core';
import { Badge, Card, DataTable, NumberField, Select, Stat, Toggle } from '../../components/ui';
import { Waterfall } from '../../components/charts';
import { COLORS } from '../../design/tokens';
import { royaltyData } from '../../data';
import { pl } from '../../i18n/pl';
import { useArtist } from '../../state/artist';
import { fmtCompact, fmtInt, fmtPLN, fmtPct } from '../../lib/format';

const t = pl.royalty;
const { params, deals, stream_presets: presets } = royaltyData;
const CUSTOM = 'custom';

export function RoyaltyModule() {
  const { artist } = useArtist();
  const [streams, setStreams] = useState(artist?.monthly_streams ?? 2_000_000);
  const [dealA, setDealA] = useState(artist?.default_deal ?? deals[0]!.id);
  const [dealB, setDealB] = useState(
    deals.find((d) => d.id !== (artist?.default_deal ?? deals[0]!.id))!.id,
  );
  const [compare, setCompare] = useState(false);

  const presetId = presets.find((p) => p.streams === streams)?.id ?? CUSTOM;
  const ids = compare ? [dealA, dealB] : [dealA];
  const results = ids.map((id) => {
    const deal = deals.find((d) => d.id === id)!;
    return {
      deal,
      r: calculateRoyaltyWaterfall(streams, deal, params),
      rec: calculateRecoupment(deal, params),
    };
  });
  const max = Math.max(1, ...results.map((x) => x.r.gross));

  return (
    <div className="module">
      <header className="module-head">
        <h2>{t.title}</h2>
        <p>
          {t.intro} {pl.common.fictionalRates}
        </p>
      </header>

      <Card>
        <div className="controls">
          <Select
            label={t.preset}
            value={presetId}
            options={[
              ...presets.map((p) => ({
                value: p.id,
                label: `${p.label} (${fmtCompact(p.streams)})`,
              })),
              { value: CUSTOM, label: pl.common.custom },
            ]}
            onChange={(v) => {
              const p = presets.find((x) => x.id === v);
              if (p) setStreams(p.streams);
            }}
          />
          <NumberField label={t.streams} value={streams} step={10000} onChange={setStreams} />
          <Select
            label={t.deal}
            value={dealA}
            options={deals.map((d) => ({ value: d.id, label: d.label }))}
            onChange={setDealA}
          />
          {compare && (
            <Select
              label={t.dealB}
              value={dealB}
              options={deals.map((d) => ({ value: d.id, label: d.label }))}
              onChange={setDealB}
            />
          )}
          <Toggle label={t.compare} checked={compare} onChange={setCompare} />
        </div>
      </Card>

      <div className={compare ? 'grid-two' : ''}>
        {results.map(({ deal, r, rec }, i) => (
          <Card
            key={deal.id + i}
            title={compare ? `${i === 0 ? 'A' : 'B'}: ${deal.label}` : deal.label}
          >
            <div className="stats">
              <Stat label={t.gross} value={fmtPLN(r.gross)} />
              <Stat label={t.artistNet} value={fmtPLN(r.parts.artistNet)} tone="good" />
              <Stat
                label={t.share}
                value={fmtPct(r.gross > 0 ? (r.parts.artistNet / r.gross) * 100 : 0)}
              />
            </div>
            <Waterfall
              bars={r.steps.map((s) => ({
                id: s.id,
                label: t.steps[s.id] ?? s.label,
                value: s.amount,
                kind: s.kind,
              }))}
              formatValue={fmtCompact}
              max={compare ? max : undefined}
              title={t.chartTitle(deal.label)}
              colors={{ gross: COLORS.gross, deduction: COLORS.deduction, result: COLORS.result }}
            />
            <div className="recoup">
              <div className="recoup-head">
                <strong>{t.recoup}</strong>
                {deal.advance > 0 ? (
                  <Badge tone={r.recoupProgress >= 1 ? 'good' : 'warn'}>
                    {fmtPct(r.recoupProgress * 100)}
                  </Badge>
                ) : (
                  <Badge>{t.advanceNone}</Badge>
                )}
              </div>
              {deal.advance > 0 && (
                <>
                  <div
                    className="progress"
                    role="progressbar"
                    aria-label={t.recoup}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(r.recoupProgress * 100)}
                  >
                    <span
                      style={{ width: `${r.recoupProgress * 100}%` }}
                      className={r.recoupProgress >= 1 ? 'done' : ''}
                    />
                  </div>
                  <p className="muted">
                    {t.advance}: {fmtPLN(deal.advance)} · {t.recouped}: {fmtPLN(r.parts.recouped)} ·{' '}
                    {rec.streamsToRecoup === null
                      ? t.neverRecoup
                      : `${t.streamsToRecoup}: ${fmtInt(rec.streamsToRecoup)}`}
                  </p>
                </>
              )}
            </div>
            <DataTable
              summary={pl.common.chartData}
              head={['', 'zł']}
              rows={r.steps.map((s) => [t.steps[s.id] ?? s.label, fmtInt(s.amount)])}
            />
          </Card>
        ))}
      </div>

      {compare && results.length === 2 && (
        <Card>
          <Stat
            label={t.delta}
            value={fmtPLN(results[1]!.r.parts.artistNet - results[0]!.r.parts.artistNet)}
            tone={results[1]!.r.parts.artistNet >= results[0]!.r.parts.artistNet ? 'good' : 'warn'}
          />
        </Card>
      )}
      <p className="muted note">{t.explain}</p>
    </div>
  );
}
