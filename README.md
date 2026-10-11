# Music Money Lab

Interactive web app that shows how money flows in the music industry. Built for ALK classes.
**All data is fictional and for education only.** Requirements: [docs/PRD.md](docs/PRD.md).

Modules: Format Timeline, Royalty Splitter, Tour P&L, Market Compare. UI is in Polish.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command                 | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `npm test`              | unit tests (core logic, data validator)              |
| `npm run lint`          | ESLint, zero warnings                                |
| `npm run typecheck`     | TypeScript strict                                    |
| `npm run validate:data` | schema, percentage sums, cross references in `data/` |
| `npm run build`         | production build in `apps/web/dist`                  |

## Structure

```
apps/web/        React + Vite UI (modules in src/modules, SVG charts in src/components/charts)
packages/core/   pure logic: royalty, tour, market (no UI)
data/            fictional JSON + README
docs/            PRD, FORMULAS, DECISIONS
scripts/         validate-data
```

## Deploy

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to `main`.
One-time setup: repo **Settings -> Pages -> Source: GitHub Actions**.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch and PR workflow.
