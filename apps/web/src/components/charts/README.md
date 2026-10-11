# Chart primitives

Pure SVG React components (no chart library). Each takes plain data plus formatter callbacks and
renders a responsive `viewBox` with an accessible `<title>`. Pair every chart with a text
alternative (`DataTable` in `components/ui.tsx`).

| Component        | Use                                                              |
| ---------------- | ---------------------------------------------------------------- |
| `StackedArea`    | stacked series over x, active-index cursor, click/drag to select |
| `Waterfall`      | gross -> deductions -> result                                    |
| `LineChart`      | lines with vertical markers and end labels                       |
| `StackedBars`    | horizontal stacked / 100% bars                                   |
| `Axis`, `Legend` | building blocks                                                  |

Colours come from `design/tokens.ts`; text styles from `styles/global.css`.
