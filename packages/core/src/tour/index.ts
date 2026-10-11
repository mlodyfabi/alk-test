import type {
  BreakEven,
  CrewPreset,
  ShowResult,
  TourRates,
  TourResult,
  TourStopInput,
  VenueTier,
} from '../types';

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

export interface ShowInput {
  tier: VenueTier;
  sellThrough: number;
  distanceKm: number;
  nights: number;
  crew: CrewPreset;
  rates: TourRates;
}

/** Linear profit model: profit = attendance * slope + intercept. */
function linear(input: ShowInput) {
  const { tier, distanceKm, nights, crew, rates } = input;
  const flat = tier.kind === 'flat_fee';
  const perTicket = flat ? 0 : tier.ticket_price * (1 - tier.venue_cut);
  const commissions = rates.agent_commission + rates.manager_commission;
  const merchPerHead = rates.merch_spend_per_head * rates.merch_margin;
  const baseArtistRevenue = flat ? tier.flat_fee : 0;
  const fixed =
    tier.production_cost +
    distanceKm * rates.transport_per_km +
    crew.rooms * nights * rates.lodging_per_room_night +
    crew.people * (nights + 1) * rates.per_diem_per_person_day +
    rates.insurance_per_show;
  const slope = perTicket * (1 - commissions) + merchPerHead;
  const intercept = baseArtistRevenue * (1 - commissions) - fixed;
  return { slope, intercept, perTicket, baseArtistRevenue, fixed };
}

/** Per-diem covers travel day + nights (nights + 1 days). */
export function calculateShow(input: ShowInput): ShowResult {
  const { tier, crew, rates, distanceKm, nights } = input;
  const flat = tier.kind === 'flat_fee';
  const attendance = Math.round(tier.capacity * clamp01(input.sellThrough));
  const ticketGross = flat ? 0 : attendance * tier.ticket_price;
  const venueShare = ticketGross * tier.venue_cut;
  const artistTicketRevenue = flat ? tier.flat_fee : ticketGross - venueShare;
  const merchRevenue = attendance * rates.merch_spend_per_head * rates.merch_margin;
  const costs = {
    production: tier.production_cost,
    transport: distanceKm * rates.transport_per_km,
    lodging: crew.rooms * nights * rates.lodging_per_room_night,
    perDiem: crew.people * (nights + 1) * rates.per_diem_per_person_day,
    insurance: rates.insurance_per_show,
    agent: artistTicketRevenue * rates.agent_commission,
    manager: artistTicketRevenue * rates.manager_commission,
  };
  const totalCosts = Object.values(costs).reduce((s, v) => s + v, 0);
  const revenue = artistTicketRevenue + merchRevenue;
  return {
    attendance,
    ticketGross,
    venueShare,
    artistTicketRevenue,
    merchRevenue,
    revenue,
    costs,
    totalCosts,
    profit: revenue - totalCosts,
  };
}

/** Attendance at which a show breaks even. */
export function calculateBreakEven(input: ShowInput): BreakEven {
  const { slope, intercept } = linear(input);
  const cap = input.tier.capacity;
  if (intercept >= 0) return { tickets: 0, occupancyPct: 0, achievable: true };
  if (slope <= 0) return { tickets: null, occupancyPct: null, achievable: false };
  const tickets = Math.ceil(-intercept / slope);
  return { tickets, occupancyPct: (tickets / cap) * 100, achievable: tickets <= cap };
}

export function calculateTour(
  stops: TourStopInput[],
  tiers: VenueTier[],
  crew: CrewPreset,
  rates: TourRates,
  sellThrough: number,
): TourResult {
  const shows = stops.map((stop) => {
    const tier = tiers.find((t) => t.id === stop.tier);
    if (!tier) throw new Error(`Unknown venue tier: ${stop.tier}`);
    const r = calculateShow({
      tier,
      crew,
      rates,
      sellThrough: stop.sellThrough ?? sellThrough,
      distanceKm: stop.distance_km,
      nights: stop.nights,
    });
    return { ...r, city: stop.city, tier: stop.tier };
  });
  const revenue = shows.reduce((s, x) => s + x.revenue, 0);
  const totalCosts = shows.reduce((s, x) => s + x.totalCosts, 0);
  return { shows, revenue, totalCosts, profit: revenue - totalCosts };
}
