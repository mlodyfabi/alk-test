# Contributing

1. Branch from `main`: `feat/<module>`, `fix/<desc>`, `data/<desc>`, `docs/<desc>`.
2. Small commits in Conventional Commits style (`feat(core): ...`, `fix(web): ...`).
3. Before pushing: `npm run lint && npm run typecheck && npm test && npm run validate:data`.
4. Open a PR to `main`; fill the template. UI changes need a screenshot.
5. CI must be green. Merge to `main` deploys to GitHub Pages.

Rules: data is fictional only; UI strings go to `apps/web/src/i18n/pl.ts`; financial logic lives in
`packages/core` with tests; new data fields need a schema update in `data/README.md`.

The repo-root build (`index.html`, `assets/`) is generated: do not edit it by hand; CI refreshes it after merge (or run `npm run build:root`).
