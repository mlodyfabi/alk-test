# Formulas

All implemented as pure functions in `packages/core`, covered by tests.

## Royalty (`royalty/index.ts`)

```
gross          = streams * gross_per_stream
platform       = gross * platform_cut
net            = gross - platform
recordingSide  = net * recording_side_share
publishingSide = net - recordingSide
label          = recordingSide * (1 - recording_artist_share)
artistRecording= recordingSide - label
recouped       = min(advance, artistRecording)       # advance is recouped from recording royalties only
cmo            = publishingSide * cmo_fee
writer         = (publishingSide - cmo) * publishing_artist_share
publisher      = (publishingSide - cmo) - writer
artistGross    = (artistRecording - recouped) + writer
manager        = artistGross * manager_commission
artistNet      = artistGross - manager
```

Invariant: `platform + label + recouped + publisher + cmo + manager + artistNet = gross`, all parts >= 0.
Recoupment streams = `ceil(advance / (rate * (1 - platform_cut) * recording_side_share * recording_artist_share))`; `null` if the artist share is 0.

## Tour (`tour/index.ts`)

```
attendance = round(capacity * sellThrough)               # sellThrough clamped to 0..1
ticketed:  artistTicketRevenue = attendance * price * (1 - venue_cut)
festival:  artistTicketRevenue = flat_fee                # independent of attendance
merch      = attendance * merch_spend_per_head * merch_margin
costs      = production + km * transport_per_km + rooms * nights * lodging
             + people * (nights + 1) * per_diem + insurance
             + artistTicketRevenue * (agent + manager commission)
profit     = artistTicketRevenue + merch - costs
```

Profit is linear in attendance (`slope * a + intercept`), so break-even = `ceil(-intercept / slope)`;
0 when the intercept is >= 0 (festival fee covers costs); `null` when the slope is <= 0.
`achievable` is false when break-even exceeds capacity.

## Market (`market/index.ts`)

`shareOfTotal` = value / sum * 100; `perCapita` = revenue (mln) / population (mln);
`filterFormats` recomputes the total over enabled formats only.
