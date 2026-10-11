import type {
  ArtistsDemoData,
  FormatRevenueData,
  MarketsData,
  RoyaltyModelsData,
  TimelineEventsData,
  TourTemplatesData,
} from '@mml/core';
import artists from '../../../data/artists-demo.json';
import formatRevenue from '../../../data/format-revenue.json';
import markets from '../../../data/markets.json';
import royalty from '../../../data/royalty-models.json';
import timeline from '../../../data/timeline-events.json';
import tour from '../../../data/tour-templates.json';

export const artistsData = artists as unknown as ArtistsDemoData;
export const formatData = formatRevenue as unknown as FormatRevenueData;
export const marketsData = markets as unknown as MarketsData;
export const royaltyData = royalty as unknown as RoyaltyModelsData;
export const timelineData = timeline as unknown as TimelineEventsData;
export const tourData = tour as unknown as TourTemplatesData;
