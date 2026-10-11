// Data file shapes (mirrors data/*.json, see data/README.md)

export interface Meta {
  disclaimer: string;
  currency?: string;
  unit?: string;
  note?: string;
}

export interface FormatInfo {
  id: string;
  label: string;
}
export interface FormatYear {
  year: number;
  values: Record<string, number>;
  total: number;
}
export interface FormatRevenueData {
  meta: Meta;
  formats: FormatInfo[];
  years: FormatYear[];
}
export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
}
export interface TimelineEventsData {
  meta: Meta;
  events: TimelineEvent[];
}

export interface RoyaltyParams {
  gross_per_stream: number;
  platform_cut: number;
  recording_side_share: number;
  cmo_fee: number;
  manager_commission: number;
}
export interface Deal {
  id: string;
  label: string;
  recording_artist_share: number;
  publishing_artist_share: number;
  advance: number;
}
export interface StreamPreset {
  id: string;
  label: string;
  streams: number;
}
export interface RoyaltyModelsData {
  meta: Meta;
  params: RoyaltyParams;
  stream_presets: StreamPreset[];
  deals: Deal[];
}

export type VenueKind = 'ticketed' | 'flat_fee';
export interface VenueTier {
  id: string;
  label: string;
  kind: VenueKind;
  capacity: number;
  ticket_price: number;
  venue_cut: number;
  production_cost: number;
  flat_fee: number;
}
export interface TourRates {
  transport_per_km: number;
  lodging_per_room_night: number;
  per_diem_per_person_day: number;
  insurance_per_show: number;
  agent_commission: number;
  manager_commission: number;
  merch_spend_per_head: number;
  merch_margin: number;
}
export interface MerchShare {
  id: string;
  label: string;
  share: number;
}
export interface CrewPreset {
  id: string;
  label: string;
  people: number;
  rooms: number;
}
export interface TourStop {
  city: string;
  tier: string;
  distance_km: number;
  nights: number;
}
export interface TourTemplate {
  id: string;
  label: string;
  stops: TourStop[];
}
export interface TourTemplatesData {
  meta: Meta;
  rates: TourRates;
  merch_mix: MerchShare[];
  venue_tiers: VenueTier[];
  crew_presets: CrewPreset[];
  tours: TourTemplate[];
}

export interface DemoArtist {
  id: string;
  name: string;
  genre: string;
  monthly_streams: number;
  default_deal: string;
  crew_preset: string;
  typical_venue_tier: string;
  default_tour: string;
  default_sell_through: number;
}
export interface ArtistsDemoData {
  meta: Meta;
  artists: DemoArtist[];
}

export interface MarketInfo {
  id: string;
  label: string;
  population_mln: number;
  total_revenue_2025_mln: number;
  segments_2025: Record<string, number>;
  streaming_share_history: { year: number; share: number }[];
}
export interface MarketsData {
  meta: Meta;
  segments: { id: string; label: string }[];
  markets: MarketInfo[];
}

// Calculation results

export type WaterfallKind = 'gross' | 'deduction' | 'result';
export interface WaterfallStep {
  /** English label; UI translates by id */
  id: string;
  label: string;
  amount: number;
  kind: WaterfallKind;
}
export interface RoyaltyResult {
  gross: number;
  parts: {
    platform: number;
    label: number;
    recouped: number;
    publisher: number;
    cmo: number;
    manager: number;
    artistNet: number;
  };
  steps: WaterfallStep[];
  /** share of the advance recouped, 0..1 (1 when there is no advance) */
  recoupProgress: number;
  advanceRemaining: number;
}

export interface TourStopInput extends TourStop {
  sellThrough?: number;
}
export interface ShowResult {
  attendance: number;
  ticketGross: number;
  venueShare: number;
  artistTicketRevenue: number;
  merchRevenue: number;
  revenue: number;
  costs: {
    production: number;
    transport: number;
    lodging: number;
    perDiem: number;
    insurance: number;
    agent: number;
    manager: number;
  };
  totalCosts: number;
  profit: number;
}
export interface TourResult {
  shows: (ShowResult & { city: string; tier: string })[];
  revenue: number;
  totalCosts: number;
  profit: number;
}
export interface BreakEven {
  /** attendees needed; null when never profitable */
  tickets: number | null;
  /** percent of capacity (may exceed 100) */
  occupancyPct: number | null;
  achievable: boolean;
}
