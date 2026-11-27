# The Regret Machine

A browser game for the CMRIT x Intel "1 Million Minds" challenge. Pick a laptop on looks and price, then live with it for 3 years in 3 minutes.

- **Public URL**: https://manishchandraraturi.github.io/regret-machine/
- **Component Gallery**: https://manishchandraraturi.github.io/regret-machine/gallery.html
- **Health Check**: https://manishchandraraturi.github.io/regret-machine/health.html

## Run
```bash
npm ci
npm run dev       # local dev server
npm run lint      # ESLint
npm run typecheck # TypeScript strict
npm run test      # Vitest unit tests
npm run build     # Vite production build (dist/)
npm run e2e       # Playwright e2e + axe-core
python tools/check_claims.py
```

## Demo build
Build and serve the production bundle locally for kiosk or jury demos:
```bash
npm run build; npm run preview
```
If the demo machine has no WebGL2 or a slow software GPU, append `?lite=1` to the URL (for example `http://localhost:4173/?lite=1`) to use the shaded CSS/DOM fallback.

## Claims policy
Every Intel number on screen comes from `src/data/claims.json` with a source and baseline, and is marked "Intel-claimed, up to" (plus `(unconfirmed)` for any `UNVERIFIED` claim). Scenes are illustrations, not measurements.

## Privacy & security
Static client-side app only. No backend, no cookies, no `localStorage`/`sessionStorage`, no analytics, no third-party runtime requests, strict CSP meta tag, and self-hosted `@fontsource` fonts.

## Credits
A student project made for the CMRIT x Intel 1 Million Minds challenge. Intel, the Intel logo, Intel Core and Arc are trademarks of Intel Corporation or its subsidiaries.
