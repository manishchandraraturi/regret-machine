# progress.md (living tracker; agents update at the end of every slice)

## Phase status
| Phase | Status | Tag | Notes |
|---|---|---|---|
| P0 | DONE | phase-P0 | Scaffold, CI/e2e, CSP, health.html, screenshots in evidence/P0/ |
| P1 | DONE | phase-P1 | Design tokens, self-hosted fonts, decay engine, 8 P1 components, gallery.html |
| P2 | DONE | phase-P2 | Core types, env, data, i18n, store, scoring, result, machine, idle; 20 unit tests pass |
| P3 | DONE | phase-P3 | Shared engines (audio, loop, input, sharecard, qr) + 5 unit tests pass |
| P4 | DONE | phase-P4 | Laptop SVG, Attract, Shelf, main wiring, idle/facilitator/Hindi e2e + evidence/P4/ |
| P5 | TODO | | cut line 1 |
| P6 | TODO | | |
| P7 | TODO | | cut line 2 |
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

## Slice log (newest first)
- 2026-11-25 P4: added `src/ui/components/laptop.ts`, `src/ui/screens.css`, `src/screens/{attract,shelf,scene-stub}.ts`, wired `src/main.ts`, `tests/e2e/p4-flow.spec.ts`, screenshots in `evidence/P4/` (design §12 Attract layout at 1920x1080 & 390x844 ticked).
- 2026-11-25 P3: added `src/engines/{audio,loop,input,sharecard,qr}.ts` + `tests/unit/engines.test.ts` (25 unit tests pass).
- 2026-11-25 P2: added `src/core/{types,env,data,i18n,store,scoring,result,machine,idle}.ts` + unit tests (`scoring.test.ts`, `result.test.ts`, `core.test.ts`).
- 2026-11-25 A-CLOSEOUT: trimmed font subsets to latin (+ devanagari for Mukta), added e2e CSP guard helper, aligned SPEC_CHECKLIST multi-phase rows to IN PROGRESS.
- 2026-11-25 FIX Bundle A: split `src/ui/base.css` into `base.css`, `components.css`, and `overlays-and-gallery.css` (all <= 300 lines); verified deployed Pages title & `base: './'`, ticked design.md §12 copy rule.
- 2026-11-25 P1: added `tokens.css`, `base.css`, `fonts.ts`, `decay.ts`, 8 components in `src/ui/components/`, `gallery.html` + `src/gallery.ts`, unit & e2e tests, screenshots in `evidence/P1/`.
- 2026-11-25 P0: scaffolded Vite + TS strict, ESLint, Vitest, Playwright; added CSP meta, `base: './'`, `public/health.html`, `tests/e2e/smoke.spec.ts`, updated `ci.yml` with e2e.
- 2026-11-25 DOC SYNC: synced Node 24 in `.nvmrc` and `tools/gen_docs.py`, updated `AGENTS.md` §4/§13 for bundle workflow, regenerated docs.
