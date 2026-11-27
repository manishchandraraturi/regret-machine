# Design: "Sale Tag Decay"

No reference images exist. This is an original direction, written so a weak coding model can copy it without guessing.

## 1. Direction in one paragraph
The game looks like an Indian electronics-store flyer: loud yellow, red slashes, hanging price tags, a "Mega sale" starburst. That is the shopper's own visual world, so it is instantly legible in a store. Then the interface ages as the player lives with the wrong laptop: colour drains, grain and scratches appear, a crack grows. The one memorable thing is the **decay engine**: a single number `--decay` (0 to 1) that visibly ruins the sale flyer scene by scene. The reveal flips to a calm "Clear skin" (cool white, one clean blue, no stickers) so the Intel side feels like relief. Everything else stays quiet and disciplined.

Anti-template decisions (checked against common AI-page tells): no cream-and-serif, no dark-mode acid accent, no identical rounded cards with soft shadows, no uppercase eyebrow labels, no middle-dot meta strings, no arrows on buttons, no single-word accent in headlines, no monospace small labels (mono only inside the receipt, where it is true to life), numbered markers only for Year 1/2/3 because that is a real sequence.

## 2. What is product UI and what is mockup
- Product UI: everything on screen.
- Mockup only (do NOT build): device bezels around the laptops, drop-shadowed browser chrome, 3D tilt of the whole page, depth blur. Laptops are flat vector illustrations (section 7.4).

## 3. Tokens (`src/ui/tokens.css`)
Components use tokens only. No hex in components.
```css
:root {
  /* colour roles, Act I flyer */
  --sale-yellow: #FFD21F;
  --stock-red:   #E4262B;
  --print-black: #000000;      /* pure black on purpose: it is a printed flyer */
  --thermal:     #ECEBE6;      /* receipt paper, slightly cool */
  --dust:        #7C8084;      /* what colour becomes when it ages */
  --clear-blue:  #0B63F6;      /* our own blue, NOT Intel brand blue */
  --clear-white: #F7FAFF;
  /* laptop colourways (decoys) */
  --lap-pink: #FF6FA5;  --lap-mint: #66E0BE;  --lap-lilac: #B9A7FF;
  /* semantic */
  --bg: var(--sale-yellow);  --fg: var(--print-black);
  --accent: var(--stock-red); --paper: var(--thermal);
  --danger: var(--stock-red); --ok: var(--clear-blue);
  /* decay (set by decay.ts; 0..1) */
  --decay: 0;
  --sat: calc(1 - 0.85 * var(--decay));
  --dim: calc(1 - 0.12 * var(--decay));
  --grain-opacity: calc(0.05 + 0.22 * var(--decay));
  /* spacing, 4-pt base */
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px; --s7: 48px; --s8: 72px;
  /* radii: different per element role, not one radius for everything */
  --r-tag: 6px 18px 6px 6px;   /* price tag, one clipped corner */
  --r-btn: 999px;              /* pill, only buttons */
  --r-paper: 2px;              /* receipt */
  --r-lap: 14px;               /* laptop body */
  /* layout */
  --tap: 56px;                 /* min touch target (>= 48) */
  --stage-w: 1920; --stage-h: 1080;
  /* motion */
  --t-fast: 120ms; --t-flip: 1200ms; --ease: cubic-bezier(.2,.8,.2,1);
}
.skin-clear {
  --bg: var(--clear-white); --fg: #0A1530; --accent: var(--clear-blue);
  --sat: 1; --dim: 1; --grain-opacity: 0;
}
```
The page wrapper `.decay-scope` applies `filter: saturate(var(--sat)) brightness(var(--dim))`. The split reveal uses two scopes: left `--decay` = current, right = 0 with `.skin-clear`.

## 4. Typography
| Role | Font | Size (kiosk 1920 / phone 390) | Weight / width | Where |
|---|---|---|---|---|
| Flyer headline | Archivo, `font-stretch: 62%` | clamp(64px, 9vw, 168px) | 900 | Attract, Shelf price, Year Flip |
| Screen title | Archivo `font-stretch: 100%` | clamp(32px, 3.4vw, 64px) | 700 | Scene titles, Result |
| Body | Mukta | clamp(18px, 1.5vw, 28px) / lh 1.4 | 400 / 600 | Instructions, copy |
| Button | Mukta | 24px (phone 20px) | 700 | All buttons |
| Receipt | DM Mono | 20px / lh 1.3 | 400 | Tape only |
| Small print | Mukta | 14px min | 400 | Illustration tags, claim footers |
- Hindi: headings use Mukta 800 (Archivo has no Devanagari), `letter-spacing: 0`, line-height 1.25. Latin tracking only on Archivo condensed: `letter-spacing: -0.01em`.
- Uppercase: only for flyer headlines of 64 px or more (it is how retail flyers talk). Never for labels or buttons. Sentence case everywhere else.
- Line length under 70 characters. Numbers: Indian grouping for rupees (₹38,990), tabular figures on the receipt (`font-variant-numeric: tabular-nums`).
- Font files from `@fontsource` packages copied into the build. No CDN. Font family is a single token each: `--font-display`, `--font-body`, `--font-receipt`. If a font cannot be matched, record `IDENTIFIED BY EYE` in progress.md and keep the token.

## 5. Material recipes
- Flyer ink: flat fills, 4 px black outlines on stickers, hard offset shadow `6px 6px 0 var(--print-black)` on price tags only (a printed look, not a soft UI shadow).
- Grain: inline SVG `feTurbulence` as data-URI background on `.decay-scope::after`, `mix-blend-mode: multiply`, opacity `var(--grain-opacity)`, `pointer-events: none`.
- Scratches (decay >= 0.6): `.decay-scope::before`, three thin diagonal `linear-gradient` lines, opacity `(decay-0.5)*1.2`.
- Crack (decay >= 0.9): one SVG path overlay anchored to the laptop screen corner, stroke 2 px `--dust`. One crack only.
- Receipt: `--thermal` fill, zig-zag bottom edge via CSS mask, no shadow, 2 px radius.
- Performance: no `backdrop-filter`, no animated filters over video-size areas. Decay filter is applied on a scope that changes only during the 1.2 s tween.

## 6. Layout grid (landscape 1920x1080 stage, scaled to fit, letterboxed with `--clear-white` bars only in Clear skin, `--sale-yellow` otherwise)
```
┌──────────────────────────────────────────────────────────────┬──────────┐
│ [Year chip]  Scene title                     [EN|हि] [mute]  │  TAPE    │
│                                                              │ (receipt │
│                    PLAY AREA (1480 x 820)                    │  240 w)  │
│                                                              │  prints  │
│  hint line (body)                         [ring 22s timer]   │  lines   │
└──────────────────────────────────────────────────────────────┴──────────┘
```
Phone portrait 390x844: header 64, play area fills, tape collapses to a 120 px strip at the bottom showing the latest 3 lines (tap to expand).
Alignment: left-aligned text, play content centred. No justified text.

Shelf (landscape):
```
 Mega sale. ₹38,990.                         (flyer headline, left, 2 lines)
 ┌ tag ┐   ┌ tag ┐   ┌ tag ┐                 three laptops on a shelf line
 [laptop]  [laptop]  [laptop]
 chips: Study | Create | Game | Work and side hustle      [Buy it]
```
Result (Clear skin): left column card (persona name, regret score), right column asks list + 3 buttons. No stickers, generous whitespace.

## 7. Components
### 7.1 Sticker / Starburst
16-point SVG polygon, fill `--stock-red`, 4 px black stroke, text `--sale-yellow` Archivo 900 rotated -8deg. Decay: opacity `1 - decay`, at decay >= 0.5 one point corner curls (CSS clip-path change). States: static only.
### 7.2 PriceTag
Hanging tag with punched hole and string (SVG), `--r-tag`, hard shadow. Price in Archivo 900. MRP struck through with a red diagonal slash (CSS `linear-gradient` 45deg). Selected state: tag swings once (Web Animations, 400 ms) and gets a 4 px blue outline.
### 7.3 Button
Pill, 56 px min height, Mukta 700. Primary: fill `--print-black`, text `--sale-yellow` (Act I) / fill `--clear-blue`, text white (Clear skin). Focus-visible: 4 px outline offset 3 px in contrasting colour. Pressed: translateY(2px). Disabled: 40 % opacity + cursor not-allowed + `aria-disabled`. No arrows in labels.
### 7.4 Laptop illustration (flat SVG, built in code)
Lid rectangle `--r-lap`, colourway fill, screen inset rectangle, base trapezoid, no brand mark, no bezel mockup. Screen content slot is a `<foreignObject>` or overlay div that scenes fill. Three colourways only differ by fill.
### 7.5 Chip (persona)
Outlined pill, 2 px black, selected = filled black with yellow text. Min 56 px.
### 7.6 Tape (receipt)
DM Mono 20 px lines, right-aligned points, dotted leader. New line slides in from the top with a 120 ms tick (sound if unmuted). Header "Receipt" (sentence case), footer shows running regret.
### 7.7 SplitReveal
Left half "Your laptop" (current decay, flyer skin faded), right half "Intel AI PC" (decay 0, `.skin-clear`). A divider line wipes from centre outward in 500 ms, then both halves play a 4 s looped illustration of the same moment. Under each half one label and, on the right, one claim chip with its tag (e.g. "Up to 27 hours, Netflix streaming. Intel-claimed"). A small "Illustration" tag sits bottom-left of the whole split.
### 7.8 YearFlip (the one orchestrated moment)
Full-screen tear-off calendar sheet showing "Year 2" in Archivo 900. The old sheet peels up (rotateX with transform-origin top, 700 ms) while `--decay` tweens +0.25 over 1.2 s. Reduced motion: cross-fade 300 ms, decay jumps.
### 7.9 Claim chip
White (`--clear-white`) pill, 14-16 px text, tag as a small plain-words suffix ("Intel-claimed", "Independent review", "Our advice"). Never hidden. Tap opens a bottom sheet with baseline + source name (no live links on kiosk; text only, URL shown small for phones).

## 8. Screens table
| Screen | Skin | Main content |
|---|---|---|
| Attract | Flyer | Headline, starburst "Mega sale", drifting price tags, Pick your laptop |
| Shelf | Flyer | Three laptops, same stickers, persona chips, Buy it |
| YearFlip x3 | Flyer, decay rising | Calendar sheet |
| Scene x4 | Flyer + decay | Play area, tape, timer ring, then SplitReveal |
| Receipt | Thermal paper on dust background | Full tape, regret score |
| Fair Fight | Clear | 5 rows x 3 columns, concessions highlighted |
| Result | Clear | Card, asks, buttons |
| Staff | Clear, large type | Plain-words ask, QR |

## 9. States
Hover (desktop only): button lifts 1 px. Active: translateY(2px). Focus-visible: 4 px outline. Loading: none needed (static), fonts use `font-display: swap`. Empty: not applicable. Error: calm banner "Something slipped. Skip this scene" with one button. Disabled: see Button. No dead buttons: every button does something or is hidden.

## 10. Responsive and accessibility
- Breakpoints: >= 1200 kiosk landscape; 700-1199 tablet; < 700 phone portrait.
- Contrast AA. Check specifically: black on yellow (fine), yellow on red starburst text (verify >= 4.5:1 for large text, else switch to black), `--dust` text only for non-essential decoration.
- Keyboard: every scene playable with keys (1-6, arrows, space). Visible focus. `prefers-reduced-motion`: no swing, no tear-off, no shake, tape prints instantly.
- Sound is never the only signal. Colour is never the only signal (failure also shows an icon and text).

## 11. Motion rules
One orchestrated moment: YearFlip. Everything else answers a user action (tap feedback, correct/incorrect pulse, scene result). No scroll-triggered fade-ups, no hover transitions on every card, no looping decoration except the Attract tag drift (slow, 40 s loop, paused when a button is focused).

## 12. Design acceptance checklist (agent ticks with screenshots in evidence/P1 and per phase)
- [ ] Gallery shows every component at decay 0, 0.5, 1 in Flyer and Clear skins.
- [ ] No hex colour appears in `src/ui/components` (grep).
- [ ] Fonts load from own origin; Network tab shows zero font CDN calls.
- [ ] Attract at 1920x1080 and 390x844 matches section 6 layout.
- [ ] Decay visibly different at 0.25, 0.5, 0.75, 1.0 (side-by-side screenshot strip).
- [ ] Left/right of SplitReveal clearly differ at a glance (colour vs drained).
- [ ] No uppercase labels, no eyebrows, no arrows in button text, no single accented word in headlines.
- [ ] Hindi renders without clipping at 390 px.
- [ ] Reduced-motion variant tested.
- [ ] Touch targets >= 48 px measured.

## 13. Declared deviations
- **P13 Neo-Brutalist overhaul (Capt-authorized):** `.decay-scope` uses printed halftone `radial-gradient` dot-matrix texture + stronger grain + high-decay `inset 0 0 80px rgba(0, 0, 0, 0.4)` vignette + full-screen branching crack SVG (`decay >= 0.9`); `.rm-btn` and `.rm-chip` use 3 px `--print-black` borders, `4px 4px 0` / `3px 3px 0` hard offset shadows, press-down hover/active states, and chip `1.05` hover scale; laptops add dark charcoal screen bezels, glow, and keyboard decks (`laptop.ts`); `.rm-pricetag-card` floats via `4s` `@keyframes rm-float`, screens pop in via `@keyframes rm-pop-in`, enabled Buy button pulses via `box-shadow` `@keyframes rm-buy-pulse` (all disabled under `prefers-reduced-motion: reduce`); `.type-flyer` adds `2px 2px 0 rgba(0, 0, 0, 0.1)`. Revert: `git checkout pre-polish -- src/`.
- **F1 Layout polish (Capt-authorized):** For `>= 1200px` viewports, `.rm-shell` centers a max `1920x1080` stage horizontally and vertically with `--bg` (`--sale-yellow` or `.skin-clear` `--clear-white`) letterbox bars; `.rm-marquee` adds horizontal edge-fade `mask-image`; Attract centers the copy column in a two-column hero with one pink `laptop.ts` illustration + overlapping starburst on the right; `"The Regret Machine"` wordmark renders in Archivo condensed up to `48px` (`.rm-wordmark`). Revert: remove `src/ui/f1-layout.css` import from `src/main.ts` and restore `src/screens/attract.ts`.
