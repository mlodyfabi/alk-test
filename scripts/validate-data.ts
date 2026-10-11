import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const FILES = [
  'format-revenue',
  'timeline-events',
  'royalty-models',
  'tour-templates',
  'artists-demo',
  'markets',
];

const sumsTo100 = (values: number[]) => Math.abs(values.reduce((s, v) => s + v, 0) - 100) < 0.01;

/** Returns a list of human-readable problems; empty means valid. */
export function validateAll(files: Record<string, Json>): string[] {
  const errors: string[] = [];
  const err = (file: string, msg: string) => errors.push(`${file}: ${msg}`);

  for (const name of FILES) {
    const d = files[name];
    if (!d) err(name, 'file missing');
    else if (typeof d.meta?.disclaimer !== 'string' || !d.meta.disclaimer)
      err(name, 'meta.disclaimer missing');
  }

  const fr = files['format-revenue'];
  if (fr?.years) {
    for (const y of fr.years) {
      const sum = Object.values(y.values as Record<string, number>).reduce((s, v) => s + v, 0);
      if (sum !== y.total) err('format-revenue', `year ${y.year}: total ${y.total} != sum ${sum}`);
      for (const f of fr.formats) {
        if (!(f.id in y.values)) err('format-revenue', `year ${y.year}: missing format ${f.id}`);
      }
    }
  }

  const ev = files['timeline-events']?.events;
  if (ev && ev.length !== 14) err('timeline-events', `expected 14 events, got ${ev.length}`);

  const rm = files['royalty-models'];
  const tt = files['tour-templates'];
  const ad = files['artists-demo'];
  const mk = files['markets'];

  if (rm?.deals) {
    for (const d of rm.deals) {
      for (const k of ['recording_artist_share', 'publishing_artist_share']) {
        if (d[k] < 0 || d[k] > 1) err('royalty-models', `deal ${d.id}: ${k} outside 0..1`);
      }
    }
  }

  if (tt) {
    if (!sumsTo100((tt.merch_mix ?? []).map((m: Json) => m.share)))
      err('tour-templates', 'merch_mix shares do not sum to 100');
    const tiers = new Set((tt.venue_tiers ?? []).map((t: Json) => t.id));
    for (const tour of tt.tours ?? []) {
      for (const s of tour.stops) {
        if (!tiers.has(s.tier)) err('tour-templates', `tour ${tour.id}: unknown tier ${s.tier}`);
      }
    }
  }

  if (ad?.artists) {
    const deals = new Set((rm?.deals ?? []).map((d: Json) => d.id));
    const crews = new Set((tt?.crew_presets ?? []).map((c: Json) => c.id));
    const tiers = new Set((tt?.venue_tiers ?? []).map((t: Json) => t.id));
    const tours = new Set((tt?.tours ?? []).map((t: Json) => t.id));
    for (const a of ad.artists) {
      if (!deals.has(a.default_deal)) err('artists-demo', `${a.id}: unknown default_deal`);
      if (!crews.has(a.crew_preset)) err('artists-demo', `${a.id}: unknown crew_preset`);
      if (!tiers.has(a.typical_venue_tier))
        err('artists-demo', `${a.id}: unknown typical_venue_tier`);
      if (!tours.has(a.default_tour)) err('artists-demo', `${a.id}: unknown default_tour`);
    }
  }

  if (mk?.markets) {
    const segs = (mk.segments ?? []).map((s: Json) => s.id);
    for (const m of mk.markets) {
      if (!sumsTo100(Object.values(m.segments_2025 as Record<string, number>)))
        err('markets', `${m.id}: segments_2025 do not sum to 100`);
      for (const s of segs)
        if (!(s in m.segments_2025)) err('markets', `${m.id}: missing segment ${s}`);
    }
  }

  return errors;
}

function main() {
  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
  const files: Record<string, Json> = {};
  for (const name of FILES) {
    try {
      files[name] = JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8'));
    } catch (e) {
      console.error(`${name}.json: cannot read/parse (${(e as Error).message})`);
      process.exit(1);
    }
  }
  const errors = validateAll(files);
  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    process.exit(1);
  }
  console.log(`✓ ${FILES.length} data files valid`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
