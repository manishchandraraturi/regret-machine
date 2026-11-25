# System design: The Regret Machine

Static Vite + vanilla TypeScript web game hosted on GitHub Pages (`base: './'`). No backend, no database, no cookies, no storage APIs, and zero third-party runtime requests.

## Architecture & data flow
- **Entry**: `index.html` (strict CSP meta tag) -> `src/main.ts` wires `store` (in-memory `GameState`), `machine` (`scenes.json` order), `idle` (60 s auto-reset), `audio` (WebAudio synthesis, muted by default), and `?lang=en|hi` / `?facilitator=1`.
- **Flow**: `Attract` -> `Shelf` (3 fictional decoy laptops + 4 personas) -> `YearFlip` (`--decay` +0.25) -> 4 scenes (`lecture`, `battery`, `creator`, `private`) -> `Receipt` -> `Fair Fight` (5 rows, 3 rival concessions) -> `Result` (`Clear` skin + 1080x1920 PNG share card) -> `Staff` (plain-words ask list + QR).
- **Decay engine (`src/ui/decay.ts`)**: drives `--decay` (0..1) to drain saturation, dim brightness, and layer SVG grain, diagonal scratches (`>= 0.6`), and a screen crack (`>= 0.9`).

## Scoring & regret formula
- Scene weights `base`: lecture 20, battery 30, creator 25, private 25, multiplied by persona `boost` from `src/data/scenes.json`.
- Severity: `f_i = 1 - 0.4 * (playerScore_i / 100)`.
- `regret = round(100 * sum(w_i * f_i) / sum(w_i))` in `[60, 100]`; line points are rounded to sum exactly to `regret`.
- Best scene = `argmax playerScore` with `ladder.json` tiebreak per persona.

## Claims & privacy policy
- All vendor numbers come exclusively from `src/data/claims.json`, validated by `tools/check_claims.py`. `UNVERIFIED` claims display `(unconfirmed)`.
- No analytics, no accounts, no network `fetch` calls.

## Verification summary
- 36 Vitest unit tests (scoring, 4-persona results, fake-timer idle, i18n, jargon lint, QR round-trip, 1080x1920 sharecard).
- 21 Playwright e2e tests (1920x1080 & 390x844, 133.0 s timed run, `axe-core` 0 violations, strict CSP guard).
- Total gzip bundle size: `518.30 KB` (under 600 KB budget).
