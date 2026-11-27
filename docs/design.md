# Design V2: "Showroom to Dust"

Concept stays: a retail showroom you fall for, a bargain laptop that ages, a clean studio reveal. Look upgrades to a cinematic, real-time 3D showroom behind crisp paper-and-glass DOM overlays.

## 1. Direction in one paragraph
Act I puts the shopper inside a moody, spotlight-lit electronics showroom: graphite reflective floor (`#17191D`), obsidian wall (`#0B0C0E`), warm halogen pools (`#FFF3E0`), a glowing crimson `"MEGA SALE"` neon sign (`#E4262B`), paper-white price tags (`#F4F1EA`) with crisp black ink (`#111111`), and red discount stickers. Three brushed-metal laptops (pink `#FF6FA5`, mint `#66E0BE`, lilac `#B9A7FF`) rest on the lit plinth. As Act II runs, `--decay` (`0` to `1`) turns the SAME showroom to dust: spotlights flicker and dim, saturation drains toward green-grey (`#7E8A83`), dust motes thicken, metallic lids pick up micro-scratches, screen panels yellow with dead-pixel streaks, and vignette/grain tighten. Act III steps into a bright studio (`#EEF3FA` to `#FFFFFF`) accented only by Clear Blue (`#0B63F6`), showing a pristine AI PC slowly rotating on a soft contact shadow.

## 2. What is product UI and what is 3D stage
- **3D stage (`<canvas id="stage3d" aria-hidden="true">`)**: fixed full-bleed viewport background lazy-loaded after first paint (`Three.js`, procedural PBR laptops + `RoomEnvironment` + self-hosted CC0 textures + particles). Never owns game state or game logic; reads store state only.
- **Product DOM UI**: headline, price tags, starbursts, persona chips, primary/secondary buttons, scene interactive controls, timer ring, receipt tape, Fair Fight table, Result card, Staff QR. Always remains the single source of truth for text, accessibility, focus, keyboard play, and tests.
- **Fallback mode (`?lite=1`, `prefers-reduced-motion`, or no WebGL2)**: renders a CSS-shaded 3D-perspective DOM/SVG laptop + full-bleed V2 showroom palette cleanly so no device ever sees a blank screen.

## 3. Tokens (`src/ui/tokens.css`)
Components use tokens only. Zero hex values inside `src/ui/components`, `src/screens`, or component CSS.
```css
:root {
  /* Act I showroom & paper tokens */
  --wall-obsidian: #0b0c0e;
  --floor-graphite: #17191d;
  --spot-warm: #fff3e0;
  --stock-red: #e4262b;
  --paper-white: #f4f1ea;
  --ink-black: #111111;
  --thermal: #ecebe6;
  --dust: #7e8a83;

  /* Act III bright studio */
  --studio-ice: #eef3fa;
  --studio-white: #ffffff;
  --clear-blue: #0b63f6;
  --clear-ink: #0a1530;

  /* legacy compatibility aliases (kept semantic for shared screens/components) */
  --print-black: var(--ink-black);
  --white: var(--studio-white);
  --clear-white: var(--studio-ice);

  /* laptop colourways (unbranded metallic decoys) */
  --lap-pink: #ff6fa5;
  --lap-mint: #66e0be;
  --lap-lilac: #b9a7ff;

  /* semantic Act I defaults */
  --bg: var(--wall-obsidian);
  --fg: var(--paper-white);
  --surface: var(--floor-graphite);
  --surface-card: var(--paper-white);
  --surface-card-ink: var(--ink-black);
  --accent: var(--stock-red);
  --paper: var(--thermal);
  --danger: var(--stock-red);
  --ok: var(--clear-blue);
  --btn-primary-bg: var(--spot-warm);
  --btn-primary-fg: var(--ink-black);

  /* decay (driven solely by src/ui/decay.ts, 0..1) */
  --decay: 0;
  --sat: calc(1 - 0.85 * var(--decay));
  --dim: calc(1 - 0.14 * var(--decay));
  --grain-opacity: calc(0.06 + 0.34 * var(--decay));
  --scratch-opacity: 0;
  --crack-opacity: 0;

  /* typography, spacing, radii, layout, motion */
  --font-display: 'Archivo Variable', 'Archivo', sans-serif;
  --font-body: 'Mukta', sans-serif;
  --font-receipt: 'DM Mono', monospace;
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px; --s7: 48px; --s8: 72px;
  --r-tag: 6px 18px 6px 6px; --r-btn: 999px; --r-paper: 2px; --r-lap: 14px; --r-panel: 16px;
  --tap: 56px;
  --stage-w: 1920; --stage-h: 1080;
  --t-fast: 140ms; --t-flip: 1200ms; --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}

.skin-clear,
.decay-scope.skin-clear {
  --bg: var(--studio-ice);
  --fg: var(--clear-ink);
  --surface: var(--studio-white);
  --accent: var(--clear-blue);
  --btn-primary-bg: var(--clear-blue);
  --btn-primary-fg: var(--studio-white);
  --sat: 1 !important;
  --dim: 1 !important;
  --grain-opacity: 0 !important;
  --scratch-opacity: 0 !important;
  --crack-opacity: 0 !important;
}
```
Notice `.decay-scope` keeps `filter` off `backdrop-filter` / fixed descendants clean so translucent HUD cards never clip `position: fixed`.

## 4. Typography
| Role | Font | Size (kiosk 1920 / phone 390) | Weight / width | Where |
|---|---|---|---|---|
| Showroom headline | Archivo condensed | clamp(40px, 6.4vw, 118px) | 900 | Attract, Shelf price, Year transition |
| Screen title | Archivo | clamp(28px, 3vw, 56px) | 700 | Scene titles, Receipt, Fair Fight, Result, Staff |
| Body | Mukta | clamp(16px, 1.35vw, 24px) / lh 1.4 | 400 / 600 | Instructions, panels, cards |
| Button | Mukta | clamp(18px, 1.4vw, 22px) | 700 | Primary & secondary pills |
| Receipt | DM Mono | 18px-20px / lh 1.3 | 400 | Receipt tape only (`tabular-nums`) |
| Small print | Mukta | 14px min | 400 | Illustration tags, claim footers |
Hindi uses Mukta 400/600/700/800 with `letter-spacing: 0` and line-height `1.3`. All font files load from `@fontsource/*` inside the origin bundle (zero CDN calls).

## 5. Material recipes
- **Showroom walls & reflective floor**: `#0B0C0E` radial overhead halo over `#17191D` floor grid/concrete PBR roughness & normal maps (`ambientCG` CC0 textures self-hosted <= 150 KB each + Three.js `RoomEnvironment`).
- **Act I/II DOM panels**: `#F4F1EA` crisp paper cards or translucent obsidian glass (`color-mix(in oklab, var(--wall-obsidian) 76%, transparent)`) with subtle highlight rim `1px` and soft layered shadow; never hard MS-Paint comic frames in V2.
- **Neon accent**: `#E4262B` practical glow on the `"MEGA SALE"` starburst badge and 3D plinth neon tube.
- **Decay overlays**: `.decay-scope` drives saturation/dim, SVG noise grain overlay, diagonal micro-scratch streaks at `decay >= 0.6`, and corner glass crack at `decay >= 0.9` in DOM; synced 1:1 with `Stage3D` shader uniforms (dimmed lights, green-grey cast `#7E8A83`, scratch roughness boost, screen dead-pixel streak overlay, dust motes).
- **Act III Studio**: linear gradient `var(--studio-ice)` (`#EEF3FA`) to `var(--studio-white)` (`#FFFFFF`), `1px` hairline slate borders, Clear Blue (`#0B63F6`) primary pills, zero stickers.

## 6. Layout grid
- Full-bleed `100dvh` canvas (`#stage3d` fixed behind) + centered overlay stage (`max-width: 1920px`, safe viewport padding `clamp(10px, 2dvh, 24px)`). Zero page vertical scroll at `>= 1280x640` (`1280x640`, `1366x768`, `1536x730`, `1920x1080`, `2560x1300`) and zero horizontal scroll at `390x844`.
- **Attract**: Left column shows paper `"The Regret Machine"` wordmark, condensed hero headline, body subhead, and primary `Pick your laptop` button; right/back shows 3D showroom laptops + glowing crimson starburst; bottom band holds 3 fully visible on-screen hanging paper price tags gently swaying on strings (no horizontal drift off-screen).
- **Shelf**: Top condensed heading + price (`<= 2` lines), 3 spotlit laptop slots across center, persona chips row + primary `Buy it` button in a compact bottom bar — all visible without scroll from `1280x640` upwards and cleanly stacked on `390x844`.
- **Scenes x4**: Compact HUD play panel (`1480px` zone) + `280px` thermal Receipt column on desktop (compact collapsible tape on `390x844`), sharing space cleanly with the live 3D laptop stage reaction beside/behind the play card.
- **Reveal**: Split comparison over the dual-laptop 3D showcase (left aged shelf laptop at current `decay`, right pristine studio AI PC), with an animated vertical center wipe, DOM cards + ClaimChip + `"Illustration"` badge.
- **Receipt**: Crisp thermal paper strip resting over a dark showroom desk view with the retired decoy laptop behind.
- **Fair Fight / Result / Staff**: Bright studio backdrop (`#EEF3FA` -> `#FFFFFF`), generous editorial spacing, Clear Blue CTAs, spinning pristine studio laptop with persona rim light behind/beside cards.

## 7. Components
- **7.1 Sticker / Starburst**: Crimson `#E4262B` SVG polygon + neon halo, white-warm or paper-white ink, curlers/fades with `decay`.
- **7.2 PriceTag**: Paper `#F4F1EA` hanging tag with brass eyelet, string, crisp `#111111` Archivo price, red diagonal MRP strike, gentle harmonic sway on string (`prefers-reduced-motion` static), Clear Blue selection halo.
- **7.3 Button**: Pill `min-height: 48px` (`--tap: 56px` where room permits), clean lift hover, `translateY(2px)` press, 4 px `focus-visible` outline. Warm spotlight fill `--spot-warm` with `#111111` ink in Act I; `--clear-blue` with `#FFFFFF` ink in Act III.
- **7.4 Laptop (3D PBR + DOM fallback)**: Primary visual is procedural PBR in Three.js (`laptop-model.ts`: rounded-box chassis & lid, articulated hinge, instanced scissor keys, trackpad recess, glowing screen `CanvasTexture`, brushed metal roughness/normal maps, 3 colourways `--lap-pink`, `--lap-mint`, `--lap-lilac`, zero logos). Fallback DOM (`laptop.ts`) upgrades from flat SVG to layered CSS 3D shaded chassis (`perspective`, brushed sheen gradient, hinged recessed keyboard deck, soft contact shadow).
- **7.5 Chip (persona)**: Ink/glass pill in Act I (`min-height: 48px`), Clear Blue selected accent.
- **7.6 Tape (receipt)**: DM Mono `18px-20px` tabular lines on `--thermal`, zig-zag paper edge.
- **7.7 SplitReveal**: Left aged + right clear `.skin-clear` panels synced with 3D dual-laptop wipe, mandatory `"Illustration"` tag and clickable `ClaimChip`.
- **7.8 YearFlip**: Year transition time-lapse in 3D (lighting shifts day-to-night, dust builds, `--decay` tweens `+0.25` over `1.2 s`) paired with DOM tear-off/fade calendar overlay.
- **7.9 ClaimChip**: Pure paper pill + plain-words source suffix (`"Intel-claimed"`, `"Independent review"`, `"Our advice"`, `"(unconfirmed)"` if `UNVERIFIED`), opening accessible baseline sheet.

## 8. Screens table
| Screen | Skin | 3D Stage / Backdrop | DOM Layer |
|---|---|---|---|
| Attract | Act I Obsidian | 3-laptop pedestal dolly + mouse/gyro parallax + red neon flicker + dust motes | Wordmark, headline, subhead, CTA, 3 swaying tags, starburst |
| Shelf | Act I Obsidian | 3 spotlit laptops (hover/focus lift & rim glow; select push forward) | Heading, 3 selectable price-tag cards, persona chips, `Buy it` |
| YearFlip x3 | Act I -> II | Day-to-night light sweep + decay tween +0.25 (1.2s) | Calendar sheet overlay + `Next` button |
| Scene x4 | Act II Aging | Shelf laptop reacts (low battery black-out, no-signal, stutter shake, upload progress bar) | Interactive challenge HUD, timer ring, live Receipt tape, SplitReveal |
| Receipt | Act II Dark Desk | Top-down angled dark desk with retired dead laptop behind | Full printed thermal tape, regret total, `See the fair fight` |
| Fair Fight | Act III Bright Studio | Bright `#EEF3FA`->`#FFFFFF` studio backdrop, slow-spinning pristine AI PC | 5x3 table with source tags and rival concessions |
| Result | Act III Bright Studio | Pristine rotating AI PC with persona-tinted rim light & contact shadow | Recommendation card, Plain-words asks, Share PNG / Staff / Play again |
| Staff | Act III Bright Studio | Clean studio ambient backdrop | Ask summary + high-contrast scannable QR |

## 9. States
- **Interactive / Focus / Press**: `focus-visible` 4px high-contrast outline on every button/chip/tag. Disabled buttons use `aria-disabled="true"` + 45% opacity.
- **Loading / Lazy 3D**: DOM renders immediately on first paint (`< 2.5 s`); `#stage3d` chunk lazy-imports after first paint and fades opacity `0 -> 1` cleanly.
- **Fallback (`?lite=1`, reduced motion, no WebGL2)**: immediately skips Three.js chunk or renderer init and shows full-bleed V2 CSS showroom + shaded CSS 3D laptop fallback (`zero blank screen`).
- **Error**: scene error shows calm skip banner `"Something slipped. Skip this scene"` (`design.md §9` contract kept intact).

## 10. Responsive and accessibility
- Breakpoints: `>= 1200` kiosk landscape (`100dvh` locked, zero scroll); `700-1199` compact landscape (`>= 1280x640` fit rules apply to desktop height too); `< 700` (`390x844` mobile portrait, zero horizontal overflow).
- Contrast AA >= 4.5:1 across paper `#F4F1EA` / ink `#111111`, spot-warm `#FFF3E0` / `#111111`, obsidian cards `#0B0C0E` / `#F4F1EA`, studio `#FFFFFF` / `#0A1530`, and `#0B63F6` / `#FFFFFF`.
- Keyboard (`1-6`, arrows, `Space`, `Enter`) plays every screen and scene. Screen reader labels strictly live in DOM while `#stage3d` is `aria-hidden="true"`.

## 11. Motion rules
- `prefers-reduced-motion: reduce`: disables 3D dolly/sway/rotation, disables CTA pulse & tag sway, switches Year transition to crisp opacity cross-fade (`300 ms`) with instant `--decay` step, or uses lightweight static V2 DOM mode cleanly.
- Adaptive quality in 3D: sample first 60 frame intervals; if mean frame time `> 24 ms`, cap `pixelRatio = 1`, disable post bloom/grain pass, and halve dust particle count.

## 12. Design acceptance checklist (V2)
- [ ] Attract shows obsidian showroom, glowing crimson neon, 3 laptops, paper headline, swaying on-screen tags, CTA pulse.
- [ ] Shelf fits title, 3 laptops, persona chips, and `Buy it` inside viewport with zero vertical scroll at `2560x1300`, `1920x1080`, `1536x730`, `1366x768`, `1280x640`, and clean stack on `390x844`.
- [ ] Gallery shows every V2 component at decay `0`, `0.5`, `1.0` in Act I Obsidian and Act III Bright Studio (`gallery.html`).
- [ ] Zero hex values inside `src/ui/components` (tokens only) and zero inline `<style>` / `style=""`.
- [ ] All fonts (`Archivo`, `Mukta`, `DM Mono`) and PBR textures load strictly from self-hosted origin (0 third-party calls).
- [ ] `decay` (`0 -> 1`) visibly transforms both DOM and 3D stage (dimming, `#7E8A83` green-grey drain, scratches, dust, screen degradation).
- [ ] SplitReveal shows degraded left laptop vs pristine Clear Blue studio right laptop at a glance with `Illustration` and claim tags.
- [ ] ShareCard renders crisp V2 palette PNG at exact `1080x1920`.
- [ ] Fallback mode (`?lite=1`, WebGL unavailable, `prefers-reduced-motion`) renders cleanly without blank canvas or uncaught errors.
- [ ] Hindi (`?lang=hi`) renders without clipping or horizontal overflow at `390x844`, axe 0 serious/critical violations on every screen, touch targets >= 48 px.

## 13. Declared deviations & V1 -> V2 history
- **V1 -> V2 Redesign ("Showroom to Dust", Capt-authorized)**: Replaced flat `#FFD21F` yellow flyer + neo-brutalist black borders/clown shadows + flat 2D SVG laptops with the V2 Obsidian Showroom (`#0B0C0E` / `#17191D` / `#FFF3E0` / `#F4F1EA` / `#E4262B`), Three.js PBR laptop showcase + particle/decay shaders (`#stage3d`), Bright Studio Act III (`#EEF3FA`..`#FFFFFF` + `#0B63F6`), and shaded CSS 3D fallback (`?lite=1` / no WebGL2 / reduced motion). Gameplay, scoring, timings (`22 s`), `claims.json`, copy keys, and claim tags remain unchanged. Rollback tag on `main`: `pre-redesign` (`v1.2`, commit `7b89b96`).
