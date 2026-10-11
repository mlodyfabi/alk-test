import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateAll } from './validate-data';

const names = [
  'format-revenue',
  'timeline-events',
  'royalty-models',
  'tour-templates',
  'artists-demo',
  'markets',
];
const load = () =>
  Object.fromEntries(
    names.map((n) => [
      n,
      JSON.parse(readFileSync(new URL(`../data/${n}.json`, import.meta.url), 'utf8')),
    ]),
  );

describe('validateAll', () => {
  it('accepts the shipped data', () => {
    expect(validateAll(load())).toEqual([]);
  });
  it('detects a missing disclaimer', () => {
    const d = load();
    delete d['markets'].meta.disclaimer;
    expect(validateAll(d).join()).toContain('meta.disclaimer');
  });
  it('detects segments not summing to 100', () => {
    const d = load();
    d['markets'].markets[0].segments_2025.live += 5;
    expect(validateAll(d).join()).toContain('do not sum to 100');
  });
  it('detects broken cross references', () => {
    const d = load();
    d['artists-demo'].artists[0].default_deal = 'nope';
    d['tour-templates'].tours[0].stops[0].tier = 'nope';
    const e = validateAll(d).join();
    expect(e).toContain('unknown default_deal');
    expect(e).toContain('unknown tier');
  });
  it('detects wrong format totals', () => {
    const d = load();
    d['format-revenue'].years[0].total += 1;
    expect(validateAll(d).join()).toContain('total');
  });
});
