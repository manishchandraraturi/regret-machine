# External & Self-Hosted Assets Ledger (`RegretMachine` V2)

All runtime assets are self-hosted in this repository (`dist/assets/`), served strictly from own origin (`default-src 'self'`), with **zero runtime third-party requests**. No brand logos, no faces, no trademarked laptop geometry or scripts.

| Asset / Resource | Role | Source & Author | Licence | Format & Size Budget | Status | Verified Date |
|---|---|---|---|---|---|---|
| `@fontsource-variable/archivo`, `@fontsource/archivo` | Display font (condensed/bold Latin) | Fontsource / Google Fonts (Omnibus-Type) | SIL OFL 1.1 | `.woff2` self-hosted | Bundled (P1) | 2026-11-25 |
| `@fontsource/mukta` | Body & Hindi Devanagari font | Fontsource / Google Fonts (Ek Type) | SIL OFL 1.1 | `.woff2` self-hosted | Bundled (P1) | 2026-11-25 |
| `@fontsource/dm-mono` | Receipt tape monospace font | Fontsource / Google Fonts (Colophon Foundry) | SIL OFL 1.1 | `.woff2` self-hosted | Bundled (P1) | 2026-11-25 |
| `three` (`RoomEnvironment`) | Studio & showroom IBL reflection environment | Three.js authors (`three/examples/jsm/environments/RoomEnvironment.js`) | MIT | Procedural runtime (0 KB external texture) | Planned (R2) | 2026-11-27 |
| Procedural PBR Laptop Model + Keys | 3 decoy laptops (`#FF6FA5`, `#66E0BE`, `#B9A7FF`) & studio AI PC (`#0B63F6` rim) | Authored in `src/stage3d/laptop-model.ts` (CC0 laptop check: Poly Haven `classic_laptop` rejected as retro beige DOS computer, brand-free procedural modern chassis chosen) | Own work (MIT / repo licence) | Procedural geometry + CanvasTexture | Planned (R2) | 2026-11-27 |
| CC0 Concrete / Showroom Floor Textures | Plinth & showroom floor roughness / normal / albedo maps | Poly Haven / ambientCG (exact asset IDs, URLs, `.webp`/`.avif` <= 150 KB each recorded in R2) | CC0 1.0 | Self-hosted `.webp` <= 150 KB | Pending download (R2) | 2026-11-27 |
| CC0 Brushed Metal Maps | Laptop lid & chassis brushed roughness / normal micro-detail | Poly Haven / ambientCG (exact asset IDs, URLs, `.webp`/`.avif` <= 150 KB each recorded in R2) | CC0 1.0 | Self-hosted `.webp` <= 150 KB | Pending download (R2) | 2026-11-27 |
