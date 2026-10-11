# Data (fictional)

Every number here is invented for teaching. Each file has `meta.disclaimer`. Do not add real data.
`npm run validate:data` checks schemas, percentage sums and cross references.

| File | Content |
| --- | --- |
| `format-revenue.json` | `formats[]`, `years[]` (1990-2025) with `values` per format and `total` (must equal their sum), unit mln PLN |
| `timeline-events.json` | 14 milestones `{id, year, title, description}` |
| `royalty-models.json` | `params` (rate per stream, platform cut, recording side share, CMO fee, manager commission), `stream_presets`, 4 `deals` (artist shares 0..1, advance) |
| `tour-templates.json` | `rates`, `merch_mix` (shares sum to 100), `venue_tiers` (`ticketed` or `flat_fee`), `crew_presets`, `tours` (stops reference tiers) |
| `artists-demo.json` | demo artists with `default_deal`, `crew_preset`, `typical_venue_tier`, `default_tour` references |
| `markets.json` | 4 fictional markets: population, 2025 revenue, `segments_2025` (sum 100), streaming share history 2010-2025 |

Changing a value needs no UI change. Adding a field: update `packages/core/src/types.ts`, `scripts/validate-data.ts` and this file.
