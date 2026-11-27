# External & Self-Hosted Assets Ledger (`RegretMachine` V2)

All runtime assets are self-hosted in this repository (`dist/assets/`), served strictly from own origin (`default-src 'self'`), with **zero runtime third-party requests**. No brand logos, no faces, no trademarked laptop geometry or scripts.

| Asset / Resource | Role | Source & Author | Licence | Format & Size Budget | Status | Verified Date |
|---|---|---|---|---|---|---|
| `@fontsource-variable/archivo`, `@fontsource/archivo` | Display font (condensed/bold Latin) | Fontsource / Google Fonts (Omnibus-Type) | SIL OFL 1.1 | `.woff2` self-hosted | Bundled (P1) | 2026-11-25 |
| `@fontsource/mukta` | Body & Hindi Devanagari font | Fontsource / Google Fonts (Ek Type) | SIL OFL 1.1 | `.woff2` self-hosted | Bundled (P1) | 2026-11-25 |
| `@fontsource/dm-mono` | Receipt tape monospace font | Fontsource / Google Fonts (Colophon Foundry) | SIL OFL 1.1 | `.woff2` self-hosted | Bundled (P1) | 2026-11-25 |
| `three@0.187.0` (`RoomEnvironment`) | Studio & showroom IBL reflection environment | Three.js authors (`three/examples/jsm/environments/RoomEnvironment.js`) | MIT | Procedural runtime (0 KB external texture) | Bundled (R2, lazy chunk) | 2026-11-27 |
| Procedural PBR Laptop Model + Keys | 3 unbranded metallic laptops (`#FF6FA5`, `#66E0BE`, `#B9A7FF`) & studio AI PC (`#0B63F6` rim) | Authored in `src/stage3d/laptop-model.ts` (Poly Haven `classic_laptop` rejected as retro beige DOS chassis; brand-free procedural modern chassis chosen) | Own work (MIT / repo licence) | Procedural geometry + `CanvasTexture` | Bundled (R2) | 2026-11-27 |
| `src/assets/textures/concrete-color.webp` | Showroom floor concrete albedo map (`512x512`) | ambientCG `Concrete015` (`https://ambientcg.com/a/Concrete015`, downscaled from `Concrete015_1K-JPG_Color.jpg`) | CC0 1.0 | Self-hosted `.webp` `4.1 KB` (<= 150 KB) | Bundled (R2) | 2026-11-27 |
| `src/assets/textures/concrete-normal.webp` | Showroom floor concrete OpenGL normal map (`512x512`) | ambientCG `Concrete015` (`https://ambientcg.com/a/Concrete015`, downscaled from `Concrete015_1K-JPG_NormalGL.jpg`) | CC0 1.0 | Self-hosted `.webp` `31.7 KB` (<= 150 KB) | Bundled (R2) | 2026-11-27 |
| `src/assets/textures/concrete-roughness.webp` | Showroom floor concrete roughness map (`512x512`) | ambientCG `Concrete015` (`https://ambientcg.com/a/Concrete015`, downscaled from `Concrete015_1K-JPG_Roughness.jpg`) | CC0 1.0 | Self-hosted `.webp` `14.4 KB` (<= 150 KB) | Bundled (R2) | 2026-11-27 |
| `src/assets/textures/metal-normal.webp` | Brushed aluminum micro-normal map (`512x512`) | ambientCG `Metal009` (`https://ambientcg.com/a/Metal009`, downscaled from `Metal009_1K-JPG_NormalGL.jpg`) | CC0 1.0 | Self-hosted `.webp` `1.3 KB` (<= 150 KB) | Bundled (R2) | 2026-11-27 |
| `src/assets/textures/metal-roughness.webp` | Brushed aluminum roughness/micro-scratch map (`512x512`) | ambientCG `Metal009` (`https://ambientcg.com/a/Metal009`, downscaled from `Metal009_1K-JPG_Roughness.jpg`) | CC0 1.0 | Self-hosted `.webp` `16.6 KB` (<= 150 KB) | Bundled (R2) | 2026-11-27 |
