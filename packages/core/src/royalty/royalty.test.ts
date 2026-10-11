import { describe, expect, it } from 'vitest';
import royalty from '../../../../data/royalty-models.json';
import type { RoyaltyModelsData } from '../types';
import { calculateRecoupment, calculateRoyaltyWaterfall, compareDeals } from './index';

const { params, deals } = royalty as unknown as RoyaltyModelsData;

describe('royalty waterfall', () => {
  it.each(deals)('parts sum to gross for deal $id', (deal) => {
    for (const streams of [0, 1, 250_000, 15_000_000, 1e9]) {
      const r = calculateRoyaltyWaterfall(streams, deal, params);
      const sum = Object.values(r.parts).reduce((s, v) => s + v, 0);
      expect(sum).toBeCloseTo(r.gross, 6);
      for (const v of Object.values(r.parts)) expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it('gross is streams * rate', () => {
    const r = calculateRoyaltyWaterfall(1000, deals[0]!, params);
    expect(r.gross).toBeCloseTo(1000 * params.gross_per_stream);
  });

  it('zero streams give zeros and an untouched advance', () => {
    const major = deals.find((d) => d.id === 'major')!;
    const r = calculateRoyaltyWaterfall(0, major, params);
    expect(r.gross).toBe(0);
    expect(r.parts.artistNet).toBe(0);
    expect(r.recoupProgress).toBe(0);
    expect(r.advanceRemaining).toBe(major.advance);
  });

  it('negative streams are treated as zero', () => {
    expect(calculateRoyaltyWaterfall(-5, deals[0]!, params).gross).toBe(0);
  });

  it('recoups the advance exactly at the break-even stream count', () => {
    const major = deals.find((d) => d.id === 'major')!;
    const { streamsToRecoup } = calculateRecoupment(major, params);
    expect(streamsToRecoup).not.toBeNull();
    const before = calculateRoyaltyWaterfall(streamsToRecoup! - 1000, major, params);
    const after = calculateRoyaltyWaterfall(streamsToRecoup!, major, params);
    expect(before.recoupProgress).toBeLessThan(1);
    expect(after.recoupProgress).toBeCloseTo(1, 6);
  });

  it('self-release has no advance and recoupment is trivially 0', () => {
    const self = deals.find((d) => d.id === 'self')!;
    expect(calculateRecoupment(self, params).streamsToRecoup).toBe(0);
    expect(calculateRoyaltyWaterfall(100, self, params).recoupProgress).toBe(1);
  });

  it('cannot recoup with a zero artist share', () => {
    const deal = { ...deals[0]!, recording_artist_share: 0, advance: 100 };
    expect(calculateRecoupment(deal, params).streamsToRecoup).toBeNull();
  });

  it('compareDeals reports the artist net delta', () => {
    const [a, b] = [deals[0]!, deals[3]!];
    const c = compareDeals(15_000_000, a, b, params);
    expect(c.artistNetDelta).toBeCloseTo(c.b.parts.artistNet - c.a.parts.artistNet);
    expect(c.b.parts.artistNet).toBeGreaterThan(c.a.parts.artistNet);
  });
});
