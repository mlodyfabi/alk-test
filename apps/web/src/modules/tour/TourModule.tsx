import { useMemo, useState } from 'react';
import { calculateBreakEven, calculateShow, calculateTour, type TourStop } from '@mml/core';
import { Badge, Card, DataTable, Select, Slider, Stat } from '../../components/ui';
import { LineChart, StackedBars } from '../../components/charts';
import { COLORS, seriesColor } from '../../design/tokens';
import { tourData } from '../../data';
import { pl } from '../../i18n/pl';
import { useArtist } from '../../state/artist';
import { fmtInt, fmtPLN, fmtPct } from '../../lib/format';

const t = pl.tour;
const { rates, venue_tiers: tiers, crew_presets: crews, tours } = tourData;
const costKeys = [
  'production',
  'transport',
  'lodging',
  'perDiem',
  'insurance',
  'agent',
  'manager',
] as const;

export function TourModule() {
  const { artist } = useArtist();
  const [tourId, setTourId] = useState(artist?.default_tour ?? tours[0]!.id);
  const [stops, setStops] = useState<TourStop[]>(() =>
    structuredClone(tours.find((x) => x.id === (artist?.default_tour ?? tours[0]!.id))!.stops),
  );
  const [crewId, setCrewId] = useState(artist?.crew_preset ?? crews[0]!.id);
  const [sell, setSell] = useState(Math.round((artist?.default_sell_through ?? 0.7) * 100));
  const [focus, setFocus] = useState(0);

  const crew = crews.find((c) => c.id === crewId)!;
  const tour = useMemo(
    () => calculateTour(stops, tiers, crew, rates, sell / 100),
    [stops, crew, sell],
  );
  const fi = Math.min(focus, stops.length - 1);
  const fStop = stops[fi];
  const fTier = tiers.find((x) => x.id === fStop?.tier);

  const loadTour = (id: string) => {
    setTourId(id);
    setStops(structuredClone(tours.find((x) => x.id === id)!.stops));
    setFocus(0);
  };
  const patch = (i: number, p: Partial<TourStop>) =>
    setStops((s) => s.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const curve = useMemo(() => {
    if (!fStop || !fTier) return null;
    const base = { tier: fTier, crew, rates, distanceKm: fStop.distance_km, nights: fStop.nights };
    const step = Math.max(1, Math.round(fTier.capacity / 40));
    const xs: number[] = [];
    for (let a = 0; a < fTier.capacity; a += step) xs.push(a);
    xs.push(fTier.capacity);
    const values = xs.map(
      (a) => calculateShow({ ...base, sellThrough: a / fTier.capacity }).profit,
    );
    return { xs, values, be: calculateBreakEven({ ...base, sellThrough: 0 }) };
  }, [fStop, fTier, crew]);

  const nowAttendance = tour.shows[fi]?.attendance ?? 0;

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
            value={tourId}
            options={tours.map((x) => ({ value: x.id, label: x.label }))}
            onChange={loadTour}
          />
          <Select
            label={t.crew}
            value={crewId}
            options={crews.map((c) => ({ value: c.id, label: `${c.label} (${c.people})` }))}
            onChange={setCrewId}
          />
          <Slider
            label={t.sellThrough}
            value={sell}
            min={0}
            max={100}
            onChange={setSell}
            format={(v) => `${v}%`}
          />
        </div>
        <div className="stats">
          <Stat label={t.revenue} value={fmtPLN(tour.revenue)} />
          <Stat label={t.costs} value={fmtPLN(tour.totalCosts)} />
          <Stat
            label={t.result}
            value={fmtPLN(tour.profit)}
            tone={tour.profit >= 0 ? 'good' : 'warn'}
          />
        </div>
      </Card>

      <Card title={t.stops}>
        <div className="table-wrap">
          <table className="stops">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{pl.common.city}</th>
                <th scope="col">{pl.common.venue}</th>
                <th scope="col">{pl.common.distance}</th>
                <th scope="col">{t.attendance}</th>
                <th scope="col">{t.perShow}</th>
                <th scope="col">
                  <span className="sr-only">{pl.common.remove}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {stops.map((s, i) => {
                const show = tour.shows[i]!;
                return (
                  <tr key={i} className={i === fi ? 'focus' : ''}>
                    <td>{i + 1}</td>
                    <td>
                      <input
                        aria-label={`${pl.common.city} ${i + 1}`}
                        value={s.city}
                        onChange={(e) => patch(i, { city: e.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        aria-label={`${pl.common.venue} ${i + 1}`}
                        value={s.tier}
                        onChange={(e) => patch(i, { tier: e.target.value })}
                      >
                        {tiers.map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        aria-label={`${pl.common.distance} ${i + 1}`}
                        value={s.distance_km}
                        onChange={(e) =>
                          patch(i, { distance_km: Math.max(0, Number(e.target.value) || 0) })
                        }
                      />
                    </td>
                    <td>{fmtInt(show.attendance)}</td>
                    <td className={show.profit >= 0 ? 'pos' : 'neg'}>{fmtPLN(show.profit)}</td>
                    <td className="row-actions">
                      <button
                        type="button"
                        className="link"
                        onClick={() => setFocus(i)}
                        aria-pressed={i === fi}
                      >
                        {t.breakEvenShow} {i + 1}
                      </button>
                      {stops.length > 1 && (
                        <button
                          type="button"
                          className="link"
                          onClick={() => setStops((c) => c.filter((_, j) => j !== i))}
                        >
                          {pl.common.remove}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() =>
            setStops((c) => [
              ...c,
              { city: t.newCity, tier: tiers[0]!.id, distance_km: 100, nights: 1 },
            ])
          }
        >
          {t.addStop}
        </button>
      </Card>

      {curve && fStop && fTier && (
        <Card title={`${t.breakEven}: ${fStop.city}`}>
          <p className="muted">
            {curve.be.tickets === null ? (
              <Badge tone="warn">{t.noBreakEven}</Badge>
            ) : (
              <>
                <strong>{t.tickets(curve.be.tickets)}</strong>
                {curve.be.occupancyPct !== null &&
                  ` · ${t.occupancy(fmtPct(curve.be.occupancyPct))}`}{' '}
                {!curve.be.achievable && <Badge tone="warn">{t.notAchievable}</Badge>}
              </>
            )}
            {fTier.kind === 'flat_fee' && ` ${t.flatFeeNote}`}
          </p>
          <LineChart
            xs={curve.xs}
            series={[{ id: 'p', label: t.profitLine, color: seriesColor(0), values: curve.values }]}
            markers={[
              { x: nowAttendance, label: t.nowMarker, color: seriesColor(2) },
              ...(curve.be.tickets !== null &&
              curve.be.tickets > 0 &&
              curve.be.tickets <= fTier.capacity
                ? [{ x: curve.be.tickets, label: t.breakEvenMarker, color: COLORS.warn }]
                : []),
            ]}
            formatX={fmtInt}
            formatY={(v) => fmtInt(v)}
            title={t.chartTitle(fStop.city)}
            zeroLine
          />
        </Card>
      )}

      <Card title={t.costsChartTitle}>
        <StackedBars
          rows={tour.shows.map((s, i) => ({
            id: String(i),
            label: s.city,
            segments: costKeys.map((k, ki) => ({
              id: k,
              label: t.categories[k] ?? k,
              color: seriesColor(ki),
              value: s.costs[k],
            })),
          }))}
          formatValue={fmtInt}
          title={t.costsChartTitle}
        />
        <ul className="legend">
          {costKeys.map((k, ki) => (
            <li key={k}>
              <span className="swatch" style={{ background: seriesColor(ki) }} aria-hidden="true" />
              {t.categories[k]}
            </li>
          ))}
        </ul>
        <DataTable
          summary={pl.common.chartData}
          head={[
            pl.common.city,
            t.revenueParts.tickets,
            t.revenueParts.merch,
            ...costKeys.map((k) => t.categories[k] ?? k),
            pl.common.profit,
          ]}
          rows={tour.shows.map((s) => [
            s.city,
            fmtInt(s.artistTicketRevenue),
            fmtInt(s.merchRevenue),
            ...costKeys.map((k) => fmtInt(s.costs[k])),
            fmtInt(s.profit),
          ])}
        />
      </Card>
    </div>
  );
}
