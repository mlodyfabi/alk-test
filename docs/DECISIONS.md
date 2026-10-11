# Decisions

- `data/` was missing from the repo, so the fictional data set was authored from the PRD (6 files, schema in data/README.md).
- Built directly by one author on `claude/clever-dijkstra-0m4ylj` instead of the multi-agent wave plan, on the user's request ("just build the app").
- No push to `main` and no PR: the branch is ready for the user to open a PR.
- UI is Polish only; all strings in `apps/web/src/i18n/pl.ts` (shape ready for an `en.ts`).
- Charts are hand-written SVG in React, no d3 (small bundle, no extra dependency).
- Routing: location hash (`#/royalty`) so it works on GitHub Pages; Vite `base: './'` avoids needing the repo name.
- Tooling: npm workspaces, TypeScript strict, ESLint (flat), Prettier, Vitest; `@mml/core` is consumed as TS source.
- Tabs stay mounted (hidden) so settings survive tab switches; Royalty and Tour remount when the demo artist changes to apply its defaults.
- Advance is recouped from recording royalties only (publishing is not cross-collateralised).
- Merch is not subject to agent/manager commission or venue cut (simplification).
- Per diem covers `nights + 1` days (travel day plus nights).
- Currency PLN for royalty/tour, USD for the fictional markets.
- Visual redesign (coral/blue gradient, wide-tracked condensed headings, vertical rail nav, outlined module numbers) follows a user-supplied reference image; Barlow Condensed loaded from Google Fonts with system fallbacks.
- Text on the gradient sits on dark translucent backings so contrast stays WCAG AA; axe-core audit (wcag2a/aa, best-practice) reports 0 violations on all four tabs at 1366px and 390px.
- Built app is committed in the repo root (index.html, assets/, .nojekyll) so Pages "Deploy from a branch" (main / root) works; publish-root.yml keeps it in sync with main using GITHUB_TOKEN pushes ([skip ci]).
