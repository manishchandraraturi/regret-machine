# progress.md (living tracker; agents update at the end of every slice)

> **V2 Redesign Branch (`redesign-v2`) Rollback:**
> `main` stays untouched at `v1.2` (`7b89b96`, `pre-redesign`). Rollback command if aborting `redesign-v2`:
> `git checkout main && git reset --hard pre-redesign`
>
> **Stack addition (`AGENTS.md §5`, Capt-authorized):** `three@0.187.0` + `@types/three@0.187.0` (verified on npm 2026-11-27, released 2026-10-30) — only 3D library for lazy-loaded `<canvas id="stage3d">` "Showroom to Dust" rendering; no Draco/KTX2/workers/wasm (`script-src 'self'`).

## Phase status
| Phase | Status | Tag | Notes |
|---|---|---|---|
| P0 | DONE | phase-P0 | Scaffold, CI/e2e, CSP, health.html, screenshots in evidence/P0/ |
| P1 | DONE | phase-P1 | Design tokens, self-hosted fonts, decay engine, 8 P1 components, gallery.html |
| P2 | DONE | phase-P2 | Core types, env, data, i18n, store, scoring, result, machine, idle; 20 unit tests pass |
| P3 | DONE | phase-P3 | Shared engines (audio, loop, input, sharecard, qr) + 5 unit tests pass |
| P4 | DONE | phase-P4 | Laptop SVG, Attract, Shelf, main wiring, idle/facilitator/Hindi e2e + evidence/P4/ |
| P5 | DONE | phase-P5, cutline-1 | CUT LINE 1: ClaimChip, scene-frame + stub scenes, Receipt, Result (Clear skin), Staff + QR, share card 1080x1920, axe 0 serious |
| P6 | DONE | phase-P6 | Long day (battery) scene, C-05/C-06 (unconfirmed), 2 receipt lines, 22s e2e + evidence/P6/ |
| P7 | DONE | phase-P7, cutline-2 | CUT LINE 2: Lecture hall scene, Wi-Fi drop, C-02 + NPU gloss, 22s e2e + evidence/P7/ |
| P8 | DONE | phase-P8 | Private files scene, 6 file cards, upload banner, on-device reveal, 22s e2e + evidence/P8/ |
| P9 | DONE | phase-P9, cutline-3 | CUT LINE 3: Creator night scene, stutter, C-03/C-04 + baseline, all 4 scenes live + evidence/P9/ |
| P10 | DONE | phase-P10 | Fair Fight screen + fairfight.json (5 rows, 3 concessions), Hindi 390px pass + evidence/P10/ |
| P11 | DONE | phase-P11 | Hardening: 120-180s timed run, jargon lint, axe 0 violations, 518.30 KB gzip, 0 third-party |
| P12 | DONE | phase-P12, v1.0 | Deliverables finalised, SPEC_CHECKLIST audited (0 TODO rows), freeze tag v1.0 |
| P13 | DONE | pre-polish (prior), 723a0b8 | Neo-Brutalist visual overhaul, Clear-skin `--sat`/`--dim` fix, mobile `.rm-controls` wrap fix, `evidence/P13/` |
| F0 | DONE | pre-polish, 45938530876 | Root cause of 45650796492 identified (GitHub Pages HTTP 500), re-triggered on `723a0b8` (`build`+`deploy` success) |
| F1 | DONE | - | Centered `1920x1080` stage (`>= 1200px`), marquee fade `mask-image`, Attract pink hero laptop + starburst, `48px` `.rm-wordmark`, `evidence/F1/` |
| F2 | DEFERRED | - | Claims resolution deferred per Capt: kept 9 UNVERIFIED claims with `(unconfirmed)` labels & intact `fairfight.json` concessions (`SRC-21` SPEC GAP) |
| F3 | DONE | v1.1 | Final Bundle F gate passed, live 390x844 & 1920x1080 verified, tagged `v1.1` (`v1.0` & `pre-polish` untouched) |
| Part 1 (v1.2) | DONE | pre-fix, v1.2, pre-redesign | Shelf no-scroll fit at `1280x640`/`1366x768`/`1536x730` + Attract on-screen tags; CI `45942826383` green; live `main-4aIyqvME.js` verified (`7b89b96`) |
| R0 | DONE | pre-redesign (`redesign-v2`) | Safety tag `pre-redesign`, branch `redesign-v2`, `evidence/V2-before/` (26 PNGs), `AGENTS.md §5`, `architecture.md §2,4`, `design.md` V2, `ASSETS.md`, `requirements.py` + `gen_docs.py` |
| R1 | DONE | v2-r1 | V2 Obsidian/Studio palette, full-bleed `100dvh` fit across all 6 viewports (`1280x640`..`2560x1300` & `390x844`), `clip-path` shaded CSS laptop fallback, split `controls.css`/`fit-layout.css` (`<= 281` lines/file), updated `sharecard.ts`, `evidence/V2-r1/` |
| R2 | DONE | - | `three@0.187.0` + `@types/three@0.187.0`, ambientCG CC0 `Concrete015`/`Metal009` self-hosted `.webp` (`4.1`–`31.7 KB`), `src/stage3d/*` (`RoomEnvironment`, procedural PBR laptop w/ `InstancedMesh` keys, lights, dust particles, adaptive 60-frame quality, fallback decision), `tests/unit/stage3d.test.ts` (44 unit tests green) |
| R3 | DONE | v2-r3 | Lazy 3D wiring into Attract, Shelf, Result + software-GL fallback optimization + `?lite=1` e2e helper + `v2-r3` e2e (46/46 green) |
| R4 | DONE | v2-r4 | Wired `ctx.setStageHint` in all 4 scenes (`lecture`, `battery`, `creator`, `private`) for 3D fail/alert/stutter/reveal dual-laptop showcase + `evidence/V2-r4/` |
| R5 | DONE | v2-r5 | Added README Demo build section (`npm run build; npm run preview`, `?lite=1` fallback), final full gate green on `redesign-v2` |

## SPEC GAP log
- `SPEC GAP: SRC-23 - human WhatsApp/registration not evidenced in repo - agent cannot perform it`
- `SPEC GAP: SRC-21 / ADD-03 (--release) - 9 used claims (C-05, C-06, C-10..C-16) remain UNVERIFIED in claims.json (check_claims.py --release exits 1; F2 deferred per Capt) - submission readiness is NOT READY`

## Decisions log
| Date | Decision | Why | Source |
|---|---|---|---|
| 2026-11-25 | Static Vite + vanilla TS on GitHub Pages | Spec: public URL only; smallest surface | architecture.md |
| 2026-11-25 | Fictional decoy laptops | Accuracy and fairness | prd.md principle 2 |
| 2026-11-25 | Node major 24 (v24.15.0) in `.nvmrc` | Matches local LTS environment | `node -v` |
| 2026-11-25 | Repo URL `https://github.com/manishchandraraturi/regret-machine.git` (Pages-enabled status: verify on first deploy) | Remote already created and pushed | `git remote -v` |
| 2026-11-25 | Dev deps: `vite`, `typescript`, `vitest`, `@playwright/test`, `eslint`, `@eslint/js`, `typescript-eslint`, `jsdom`, `@axe-core/playwright` | Fixed stack per AGENTS.md §5 & architecture.md §2 | package.json |
| 2026-11-25 | Self-hosted fonts: `@fontsource-variable/archivo` (5.3.0), `@fontsource/mukta` (5.3.0), `@fontsource/dm-mono` (5.3.0) | Verified on npm; variable Archivo provides wdth 62% & wght 900 without CDN | npm view / AGENTS.md §5 |
| 2026-11-25 | QR encoder `qrcode-generator@2.0.4` (MIT) + dev-only test decoder `jsqr@1.4.0` (Apache-2.0) | Small, maintained, zero runtime network calls; jsqr verifies QR round-trip in unit tests | npm view / AGENTS.md §5 |

## External facts the agent had to look up
| Fact | Value | URL | Date | By |
|---|---|---|---|---|
| GitHub Pages limits | 1 GB site, 100 GB/month soft, 10 min deploy | docs.github.com Pages limits | 2026-11-25 | Claude |
| Intel claims C-01..C-04 | see claims.json | Intel newsroom CES 2026 | 2026-11-25 | Claude |
| `@fontsource` package names | `@fontsource-variable/archivo` 5.3.0, `@fontsource/mukta` 5.3.0, `@fontsource/dm-mono` 5.3.0 | npm | 2026-11-25 | agent |
| QR library choice | `qrcode-generator@2.0.4` (MIT), test decoder `jsqr@1.4.0` (Apache-2.0) | npm | 2026-11-25 | agent |
| GitHub Actions current majors (checkout, setup-node, configure-pages, upload-pages-artifact, deploy-pages) | UNVERIFIED, ci.yml uses last-known majors | github.com/actions | | agent |
| NEXT_STEP_URL (Intel AI PC page) | UNVERIFIED | | | Capt |
| Intel footnotes for C-05, C-06, C-07, C-08, C-16 | UNVERIFIED | Intel product brief / press deck | | teammate B |

## Open questions for the human
1. ~~`node -v` major version (set `.nvmrc`).~~ **Closed:** Node 24 (`v24.15.0`).
2. ~~GitHub repo URL and whether the remote exists.~~ **Closed:** `https://github.com/manishchandraraturi/regret-machine.git` (remote exists; Pages-enabled status: verify on first deploy).
3. Which Intel page should the QR open (NEXT_STEP_URL)?

## P6 acceptance checklist
- [x] Scene runs 22 s +- 2 s (`tests/e2e/p6-battery.spec.ts`)
- [x] Reveal shows 'Illustration' tag and 'Intel-claimed' tag (`evidence/P6/reveal-1920x1080.png`, `evidence/P6/reveal-390x844.png`)
- [x] Regret tape prints 2 lines (`tests/e2e/p6-battery.spec.ts`)
- [x] Unit + e2e pass (`tests/unit/battery.test.ts`, `tests/e2e/p6-battery.spec.ts`)

## P7 acceptance checklist
- [x] Scene 22 s (`tests/e2e/p7-lecture.spec.ts`)
- [x] NPU gloss visible in plain words (`tests/e2e/p7-lecture.spec.ts`, `evidence/P7/reveal-1920x1080.png`)
- [x] Unit + e2e pass (`tests/unit/lecture.test.ts`, `tests/e2e/p7-lecture.spec.ts`)
- [x] CUT LINE 2 tag created (`cutline-2`)

## P8 acceptance checklist
- [x] Scene 22 s (`tests/e2e/p8-private.spec.ts`)
- [x] Copy says 'can run on your laptop', never 'always private' (`src/data/copy.en.json`, `tests/e2e/p8-private.spec.ts`)
- [x] Unit + e2e pass (`tests/unit/private.test.ts`, `tests/e2e/p8-private.spec.ts`)

## P9 acceptance checklist
- [x] Scene 22 s (`tests/e2e/p9-creator.spec.ts`)
- [x] Baseline text shown: vs earlier-generation Intel chip, Intel-measured (`tests/e2e/p9-creator.spec.ts`, `evidence/P9/reveal-1920x1080.png`)
- [x] Unit + e2e pass (`tests/unit/creator.test.ts`, `tests/e2e/p9-creator.spec.ts`, `tests/e2e/p5-flow.spec.ts` 4 personas through all 4 real scenes)
- [x] CUT LINE 3 tag created (`cutline-3`)

## P10 acceptance checklist
- [x] Each row shows source id (`tests/unit/fairfight.test.ts`, `tests/e2e/p10-fairfight.spec.ts`)
- [x] At least 2 rows concede a rival strength (`tests/unit/fairfight.test.ts`, `tests/e2e/p10-fairfight.spec.ts`: 3 rival concession cells across C-12 and C-13)
- [x] No Hindi text overflows at 390 px (`tests/e2e/p10-fairfight.spec.ts`, `evidence/P10/fairfight-hi-390x844.png`, `evidence/P10/result-after-ff-390x844.png`)

## P11 acceptance checklist
- [x] Timed run output pasted (`tests/e2e/p11-hardening.spec.ts`)
- [x] `check_claims.py` exit 0 (`--release` exit 1 logged as SPEC GAP for Teammate B)
- [x] Bundle report <= 600 KB gzip (`518.30 KB` / `530735` bytes)
- [x] axe: 0 serious issues (0 total violations after `tape.ts` `h2` fix)
- [x] Screenshots at 1920x1080 and 390x844 for every screen (`evidence/P4`..`evidence/P11`)

## P12 acceptance checklist
- [x] Checklist has no TODO rows (`docs/SPEC_CHECKLIST.md` audit: 0 TODO, 0 IN PROGRESS)
- [x] Public URL tested logged out on a phone (`390x844` fresh Playwright context)
- [x] FREEZE tag `v1.0` created before Fri 09:00

## Slice log (newest first)
- 2026-11-27 Bundle F-UNBLOCK (F0+F1+F3, F2 deferred): committed P13 (`723a0b8`), verified CI deploy `45938530876` success (F0); implemented centered `1920x1080` stage, marquee fade `mask-image`, Attract pink hero laptop + starburst, `48px` `.rm-wordmark`, fixed `rm-pop-in` opacity, updated `docs/design.md §13`, captured 32 `evidence/F1/*.png` screenshots; deferred F2 per Capt (`SRC-21` SPEC GAP); tagged `v1.1`.
- 2026-11-25 TEST-HARDENING: added `tests/e2e/cross-domain.spec.ts` (4 e2e tests) and `tests/unit/edge-cases.test.ts` (5 unit tests); 41 unit + 27 e2e pass, live Pages 390x844 logged-out walkthrough 0 third-party / 0 CSP violations, 518.30 KB gzip, forbidden API grep empty.

## Domain Test Matrix (TEST-HARDENING)
| Domain | New/Existing test | Result | Evidence |
|---|---|---|---|
| Hostile URL params & flags | `tests/e2e/cross-domain.spec.ts` (`hostile ?lang=xx...`), `tests/unit/core.test.ts` | PASS | 0 third-party, 0 CSP, `lang=en`, facilitator bar hidden |
| Direct static routes & CSP | `tests/e2e/cross-domain.spec.ts` (`direct /health.html and /gallery.html...`), `tests/e2e/smoke.spec.ts` | PASS | `/health.html` & `/gallery.html` 0 CSP, 0 third-party |
| Mobile 390x844 overflow & Staff QR | `tests/e2e/cross-domain.spec.ts` (`390x844 has no horizontal overflow...`), `tests/unit/edge-cases.test.ts` | PASS | `scrollWidth <= innerWidth` across all screens; `not_configured: VITE_NEXT_STEP_URL` |
| Keyboard-only & reduced-motion | `tests/e2e/cross-domain.spec.ts`, `tests/e2e/p11-hardening.spec.ts`, `tests/e2e/gallery.spec.ts` | PASS | Full flow to Staff (keyboard) & Result (reduced-motion) |
| Unit edge cases (claims/i18n/idle/share) | `tests/unit/edge-cases.test.ts` (5 tests) | PASS | `claim()` throws, `CONTENT_MISSING`, idle clears state, `AbortError` -> `cancelled` |
| Accessibility (axe-core) | `tests/e2e/p5-flow.spec.ts`, `p6`–`p11` specs | PASS | 0 serious/critical/moderate violations (`AXE_*=[]` on all screens) |
| Live GitHub Pages (390x844) | `https://manishchandraraturi.github.io/regret-machine/` Playwright walkthrough | PASS | All 10 screens `overflow_ok=true`, `THIRD_PARTY=[]`, `CSP=[]` |
- 2026-11-25 FIX Bundle E: added keyboard-only full-run e2e (`p11-hardening.spec.ts`), 14 `390x844` P11 screenshots, marked `DEL-04` DONE (rehearsal in Capt TODOs), readiness `NOT READY` until `check_claims.py --release` passes.
- 2026-11-25 P12 (FREEZE v1.0): finalised `README.md`, `docs/system-design.md`, audited `docs/SPEC_CHECKLIST.md` (0 TODO rows), tagged `phase-P12` and `v1.0`.
- 2026-11-25 P11: added `tests/unit/jargon.test.ts`, `tests/e2e/p11-hardening.spec.ts`, fixed `tape.ts` `h3`->`h2` (0 axe violations everywhere), verified 518.30 KB gzip, 0 forbidden APIs.
- 2026-11-25 P10: added `src/data/fairfight.json`, `src/screens/fairfight.ts`, `getFairFight()` in `data.ts`, enabled `skipFairFight: false` in `main.ts`, 390px wrap rules, `tests/unit/fairfight.test.ts`, `tests/e2e/p10-fairfight.spec.ts`, screenshots in `evidence/P10/`.
- 2026-11-25 P9 (CUT LINE 3): added `src/screens/scene-creator.ts`, `scene.creator.baseline` in copy.*.json, removed `createStubScene` from `scenes/index.ts`, `tests/unit/creator.test.ts`, `tests/e2e/p9-creator.spec.ts`, screenshots in `evidence/P9/`.
- 2026-11-25 P8: added `src/screens/scene-private.ts`, `scene.private.note` in copy.*.json, `tests/unit/private.test.ts`, `tests/e2e/p8-private.spec.ts`, screenshots in `evidence/P8/`; added P6 `fail-*.png` screenshots.
- 2026-11-25 P7 (CUT LINE 2): added `src/screens/scene-lecture.ts`, registered in `scenes/index.ts`, `tests/unit/lecture.test.ts`, `tests/e2e/p7-lecture.spec.ts`, screenshots in `evidence/P7/`.
- 2026-11-25 P6: added `src/screens/scene-battery.ts`, `src/ui/scenes.css`, 2-line receipt support in `receipt.ts`/`scene-frame.ts`, `unconfirmed` label in `claimchip.ts`, `tests/unit/battery.test.ts`, `tests/e2e/p6-battery.spec.ts`, screenshots in `evidence/P6/`.
- 2026-11-25 CARRYOVER: updated `ADD-08` evidence with `168feab` and `P5_QR_E2E_DECODED`; recorded known non-serious axe moderate `heading-order` on Receipt (`h1` -> `h3` in `tape.ts`).
- 2026-11-25 FIX Bundle B: added 390x844 screenshots for result-create/game/hustle/hi, raw axe output logging, QR e2e with test URL `https://example.invalid/regret-machine-test`, and design.md §12 checklist ticks.
- 2026-11-25 P5 (CUT LINE 1): added `claimchip.ts`, `scene-frame.ts`, `scenes/index.ts`, `receipt.ts`, `result.ts`, `staff.ts`, `p5-screens.css`, `ci.yml` `vars.VITE_NEXT_STEP_URL`, `p5-flow.spec.ts` + `p5-ui.test.ts` (axe 0 serious, 1080x1920 PNG, 4 personas).

## Design §12 checklist (Bundle A + Bundle B)
- [x] Gallery shows every component at decay 0, 0.5, 1 in Flyer and Clear skins (`evidence/P1/gallery-1920x1080.png`, `evidence/P1/gallery-390x844.png`)
- [x] No hex colour appears in `src/ui/components` (grep empty)
- [x] Fonts load from own origin (`tests/e2e/gallery.spec.ts`, `tests/e2e/smoke.spec.ts`)
- [x] Attract at 1920x1080 and 390x844 matches section 6 layout (`evidence/P4/attract-1920x1080.png`, `evidence/P4/attract-390x844.png`)
- [x] Decay visibly different at 0.25, 0.5, 0.75, 1.0 (`evidence/P1/decay-strip-1920x1080.png`)
- [x] Left/right of SplitReveal clearly differ at a glance (`evidence/P1/gallery-1920x1080.png`)
- [x] No uppercase labels, no eyebrows, no arrows in button text, no single accented word in headlines (`Select-String` + `evidence/P1/gallery-*.png`, `evidence/P4/attract-*.png`, `evidence/P5/result-*.png`)
- [x] Hindi renders without clipping at 390 px (`evidence/P1/gallery-390x844.png`, `evidence/P4/shelf-hi-390x844.png`, `evidence/P5/result-hi-390x844.png`)
- [x] Reduced-motion variant tested (`evidence/P1/gallery-reduced-motion.png`, `tests/e2e/p5-flow.spec.ts`)
- [x] Touch targets >= 48 px measured (`tests/e2e/gallery.spec.ts`)
- [x] P8 Private files design & Hindi 390px check (`evidence/P8/play-*.png`, `upload-banner-*.png`, `reveal-*.png`, `reveal-hi-390x844.png`)
- [x] P9 Creator night design & Hindi 390px check (`evidence/P9/play-*.png`, `stutter-*.png`, `reveal-*.png`, `reveal-hi-390x844.png`)
- Known non-serious axe issue (P5-P9): moderate `heading-order` (`h1` -> `h3` in `src/ui/components/tape.ts`), 0 serious/critical violations.
- 2026-11-25 P4: added `src/ui/components/laptop.ts`, `src/ui/screens.css`, `src/screens/{attract,shelf,scene-stub}.ts`, wired `src/main.ts`, `tests/e2e/p4-flow.spec.ts`, screenshots in `evidence/P4/` (design §12 Attract layout at 1920x1080 & 390x844 ticked).
- 2026-11-25 P3: added `src/engines/{audio,loop,input,sharecard,qr}.ts` + `tests/unit/engines.test.ts` (25 unit tests pass).
- 2026-11-25 P2: added `src/core/{types,env,data,i18n,store,scoring,result,machine,idle}.ts` + unit tests (`scoring.test.ts`, `result.test.ts`, `core.test.ts`).
- 2026-11-25 A-CLOSEOUT: trimmed font subsets to latin (+ devanagari for Mukta), added e2e CSP guard helper, aligned SPEC_CHECKLIST multi-phase rows to IN PROGRESS.
- 2026-11-25 FIX Bundle A: split `src/ui/base.css` into `base.css`, `components.css`, and `overlays-and-gallery.css` (all <= 300 lines); verified deployed Pages title & `base: './'`, ticked design.md §12 copy rule.
- 2026-11-25 P1: added `tokens.css`, `base.css`, `fonts.ts`, `decay.ts`, 8 components in `src/ui/components/`, `gallery.html` + `src/gallery.ts`, unit & e2e tests, screenshots in `evidence/P1/`.
- 2026-11-25 P0: scaffolded Vite + TS strict, ESLint, Vitest, Playwright; added CSP meta, `base: './'`, `public/health.html`, `tests/e2e/smoke.spec.ts`, updated `ci.yml` with e2e.
- 2026-11-25 DOC SYNC: synced Node 24 in `.nvmrc` and `tools/gen_docs.py`, updated `AGENTS.md` §4/§13 for bundle workflow, regenerated docs.
