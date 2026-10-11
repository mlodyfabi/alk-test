import type { Deal, RoyaltyParams, RoyaltyResult, WaterfallStep } from '../types';

const nonNeg = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/** Gross revenue = streams * per-stream rate. */
export function grossRevenue(streams: number, params: RoyaltyParams): number {
  return nonNeg(streams) * params.gross_per_stream;
}

/**
 * Splits gross streaming revenue between platform, label, publisher, CMO,
 * manager and artist. All parts are >= 0 and sum to the gross revenue.
 * The advance is recouped from the artist's recording royalty only.
 */
export function calculateRoyaltyWaterfall(
  streams: number,
  deal: Deal,
  params: RoyaltyParams,
): RoyaltyResult {
  const gross = grossRevenue(streams, params);
  const platform = gross * params.platform_cut;
  const net = gross - platform;
  const recordingSide = net * params.recording_side_share;
  const publishingSide = net - recordingSide;

  const label = recordingSide * (1 - deal.recording_artist_share);
  const artistRecording = recordingSide - label;
  const recouped = Math.min(deal.advance, artistRecording);
  const artistRecordingPaid = artistRecording - recouped;

  const cmo = publishingSide * params.cmo_fee;
  const publishingPool = publishingSide - cmo;
  const writer = publishingPool * deal.publishing_artist_share;
  const publisher = publishingPool - writer;

  const artistGross = artistRecordingPaid + writer;
  const manager = artistGross * params.manager_commission;
  const artistNet = artistGross - manager;

  const steps: WaterfallStep[] = [
    { id: 'gross', label: 'Gross revenue', amount: gross, kind: 'gross' },
    { id: 'platform', label: 'Platform cut', amount: platform, kind: 'deduction' },
    { id: 'label', label: 'Label share', amount: label, kind: 'deduction' },
    { id: 'recouped', label: 'Advance recouped', amount: recouped, kind: 'deduction' },
    { id: 'publisher', label: 'Publisher share', amount: publisher, kind: 'deduction' },
    { id: 'cmo', label: 'CMO fee', amount: cmo, kind: 'deduction' },
    { id: 'manager', label: 'Manager commission', amount: manager, kind: 'deduction' },
    { id: 'artistNet', label: 'Artist net', amount: artistNet, kind: 'result' },
  ];

  return {
    gross,
    parts: { platform, label, recouped, publisher, cmo, manager, artistNet },
    steps,
    recoupProgress: deal.advance > 0 ? recouped / deal.advance : 1,
    advanceRemaining: deal.advance - recouped,
  };
}

export interface DealComparison {
  a: RoyaltyResult;
  b: RoyaltyResult;
  /** artist net of B minus artist net of A */
  artistNetDelta: number;
}

export function compareDeals(
  streams: number,
  dealA: Deal,
  dealB: Deal,
  params: RoyaltyParams,
): DealComparison {
  const a = calculateRoyaltyWaterfall(streams, dealA, params);
  const b = calculateRoyaltyWaterfall(streams, dealB, params);
  return { a, b, artistNetDelta: b.parts.artistNet - a.parts.artistNet };
}

export interface RecoupmentResult {
  advance: number;
  /** artist recording royalty earned per stream */
  artistRoyaltyPerStream: number;
  /** streams needed to recoup the advance; null when it can never be recouped */
  streamsToRecoup: number | null;
}

export function calculateRecoupment(deal: Deal, params: RoyaltyParams): RecoupmentResult {
  const perStream =
    params.gross_per_stream *
    (1 - params.platform_cut) *
    params.recording_side_share *
    deal.recording_artist_share;
  const streamsToRecoup =
    deal.advance <= 0 ? 0 : perStream > 0 ? Math.ceil(deal.advance / perStream) : null;
  return { advance: deal.advance, artistRoyaltyPerStream: perStream, streamsToRecoup };
}
