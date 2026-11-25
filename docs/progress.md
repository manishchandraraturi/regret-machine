# progress.md (living tracker; agents update at the end of every slice)

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
| P8 | TODO | | |
| P9 | TODO | | cut line 3 |
| P10 | TODO | | |
| P11 | TODO | | |
| P12 | TODO | | |

## SPEC GAP log
- `SPEC GAP: SRC-23 - human WhatsApp/registration not evidenced in repo - agent cannot perform it`

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

## Slice log (newest first)
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
- 2026-11-25 P4: added `src/ui/components/laptop.ts`, `src/ui/screens.css`, `src/screens/{attract,shelf,scene-stub}.ts`, wired `src/main.ts`, `tests/e2e/p4-flow.spec.ts`, screenshots in `evidence/P4/` (design §12 Attract layout at 1920x1080 & 390x844 ticked).
- 2026-11-25 P3: added `src/engines/{audio,loop,input,sharecard,qr}.ts` + `tests/unit/engines.test.ts` (25 unit tests pass).
- 2026-11-25 P2: added `src/core/{types,env,data,i18n,store,scoring,result,machine,idle}.ts` + unit tests (`scoring.test.ts`, `result.test.ts`, `core.test.ts`).
- 2026-11-25 A-CLOSEOUT: trimmed font subsets to latin (+ devanagari for Mukta), added e2e CSP guard helper, aligned SPEC_CHECKLIST multi-phase rows to IN PROGRESS.
- 2026-11-25 FIX Bundle A: split `src/ui/base.css` into `base.css`, `components.css`, and `overlays-and-gallery.css` (all <= 300 lines); verified deployed Pages title & `base: './'`, ticked design.md §12 copy rule.
- 2026-11-25 P1: added `tokens.css`, `base.css`, `fonts.ts`, `decay.ts`, 8 components in `src/ui/components/`, `gallery.html` + `src/gallery.ts`, unit & e2e tests, screenshots in `evidence/P1/`.
- 2026-11-25 P0: scaffolded Vite + TS strict, ESLint, Vitest, Playwright; added CSP meta, `base: './'`, `public/health.html`, `tests/e2e/smoke.spec.ts`, updated `ci.yml` with e2e.
- 2026-11-25 DOC SYNC: synced Node 24 in `.nvmrc` and `tools/gen_docs.py`, updated `AGENTS.md` §4/§13 for bundle workflow, regenerated docs.
