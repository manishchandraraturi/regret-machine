# Architecture

## 1. System diagram
```
 Browser (kiosk PC or phone)
 ┌───────────────────────────────────────────────────────────┐
 │ index.html ── main.ts ── core/machine.ts (state machine)  │
 │      │                       │        │                   │
 │      │                  core/store   core/scoring,result  │
 │      │                       │                            │
 │  screens/*.ts  ◄──── data/*.json (claims, copy, scenes,   │
 │  (Attract, Shelf,          personas, laptops, ladder)     │
 │   4 scenes, Receipt,                                      │
 │   FairFight, Result,   ui/ (tokens.css, decay.ts,         │
 │   Staff)               components/*)                      │
 │      │                                                    │
 │  engines/ (audio, loop, input, sharecard, qr)             │
 └───────────────────────────────────────────────────────────┘
   Static files only. Hosted on GitHub Pages. No server, no DB.
```
System of record: `src/data/*.json` (content) and in-memory `store` (session). Nothing is persisted. Reload = fresh game.

## 2. Stack
| Layer | Choice | Why |
|---|---|---|
| Build | Vite + TypeScript, vanilla (no UI framework) | Smallest bundle, fewest moving parts, fast TTI (< 2.5 s) |
| 3D Showroom | `three` (pinned `0.187.0`, `@types/three`), lazy-imported after first paint | Real-time PBR showroom, `RoomEnvironment`, dust/crack decay shaders; no Draco/KTX2/workers/wasm (CSP) |
| Styling | Plain CSS with custom properties (`tokens.css`) + V2 glass/paper overlays | Single `--decay` source drives both 3D uniforms and CSS DOM fallback (`?lite=1`, reduced motion, no WebGL2) |
| Tests | Vitest (unit), Playwright (e2e + screenshots), axe-core via Playwright | Evidence over claims |
| Fonts | Self-hosted via `@fontsource` packages: Archivo, Mukta, DM Mono | No CDN, works offline (ADD-04) |
| QR | Self-authored pure-TS Reed-Solomon matrix encoder (`src/engines/qr.ts`) | Zero third-party network calls, decoded by jsQR in unit/e2e tests |
| Hosting | GitHub Pages from Actions | VERIFIED 25 Nov 2026: free for public repos; site <= 1 GB; soft 100 GB/month bandwidth; deploy must finish < 10 min |
| Fallback host | Vercel or Netlify static | UNVERIFIED. Use only if Pages fails |

## 3. Decisions and deviations
| Decision | Spec / default | Chosen | Why | Source |
|---|---|---|---|---|
| Build "game" as web page, not exe | Spec: URL only, no exe | Static site | Spec rule e | Problem statement |
| No framework | Typical React | Vanilla TS | 4 small scenes, no shared complex state | Our call |
| Hosting | any public URL | GitHub Pages | Free, no card, deployable by agent | docs.github.com |
| Fonts self-hosted | Google Fonts CDN | @fontsource | Store Wi-Fi + CSP | ADD-04 |
| Decoy laptop fictional | Name a competitor | Fictional archetype | Accuracy + fairness | PRD principle 2 |
| Sound synthesised | mp3 files | WebAudio | No asset licensing, tiny | ADD-05 |

## 4. Repository layout
```
RegretMachine/
  AGENTS.md  CLAUDE.md  GEMINI.md  README.md  package.json  vite.config.ts
  index.html  gallery.html  public/health.html
  docs/  (prd, architecture, design, ASSETS, schema, security, copy, phases, progress, SPEC_CHECKLIST, ...)
  tools/ (requirements.py, gen_docs.py, check_claims.py)
  evidence/  (P0..P12, v1.2, V2-before, V2-r1..r5 screenshots and logs)
  src/
    main.ts  gallery.ts
    assets/ textures/ (self-hosted CC0 PBR textures <= 150 KB each)
    core/   env.ts store.ts machine.ts scoring.ts result.ts i18n.ts idle.ts types.ts
    data/   claims.json scenes.json copy.en.json copy.hi.json personas.json laptops.json ladder.json fairfight.json
    stage3d/ index.ts stage.ts laptop-model.ts materials.ts lights.ts particles.ts quality.ts fallback.ts scenes3d.ts
    ui/     tokens.css base.css components.css screens.css f1-layout.css p5-screens.css scenes.css overlays-and-gallery.css decay.ts components/
    screens/ attract.ts shelf.ts scene-lecture.ts scene-battery.ts scene-creator.ts scene-private.ts scene-frame.ts receipt.ts fairfight.ts result.ts staff.ts
    engines/ audio.ts loop.ts input.ts sharecard.ts qr.ts
  tests/unit/  tests/e2e/
  .github/workflows/ci.yml
```
Limits: one file <= 300 lines, one function <= 50 lines.

## 5. Module contracts (TypeScript)
```ts
// core/types.ts
export type Lang = 'en' | 'hi';
export type Persona = 'study' | 'create' | 'game' | 'hustle';
export type SceneId = 'lecture' | 'battery' | 'creator' | 'private';
export type ClaimTag = 'intel-claimed' | 'third-party' | 'our-advice' | 'public-fact';
export interface Claim {
  id: string;                 // 'C-03'
  tag: ClaimTag;
  text: { en: string; hi: string };
  metric: string; baseline: string; conditions: string;
  source_name: string; source_url: string;
  verified_on: string;        // ISO date
  status: 'VERIFIED' | 'UNVERIFIED';
}
export interface RegretEvent { sceneId: SceneId; lineKey: string; points: number }
export interface SceneResult { sceneId: SceneId; playerScore: number; events: RegretEvent[] }
export interface GameState {
  lang: Lang; persona: Persona | null; laptopId: string | null;
  results: SceneResult[]; decay: number; muted: boolean; startedAt: number | null;
}
export interface Ctx { store: Store; t: (key: string) => string; claim: (id: string) => Claim; go: (to: ScreenId) => void }
export interface Screen { mount(root: HTMLElement, ctx: Ctx): () => void }  // returns cleanup
// engines
export interface Audio { setMuted(m: boolean): void; tick(): void; buzz(): void; chime(): void; register(): void }
export interface Loop { start(cb: (dtMs: number, tMs: number) => void): void; stop(): void }
```
- `claim(id)` THROWS if the id is missing. A screen may never print a number that is not from a claim (except player's own score and regret).
- Missing content = visible `CONTENT_MISSING:<key>` text in dev, test failure in CI. Never fake text.

## 6. Screens and URL parameters (no server routes)
| Param | Effect |
|---|---|
| `?lang=hi` | Start in Hindi (validated: only `en` or `hi`, else `en`) |
| `?facilitator=1` | Shows tiny facilitator bar: Skip scene, Go to Result, Reset |
| `gallery.html` | Component gallery for design review |
| `health.html` | Plain text "ok" for deploy check |
State flow: `attract > shelf > flip1 > lecture > flip2 > battery > creator > flip3 > private > receipt > fairfight > result > (staff) > attract`. Order lives in `scenes.json`, not in code.

## 7. Data flows
- Start: Shelf stores persona + laptop. `startedAt = performance.now()`.
- Scene: screen runs its own `Loop`, on end returns `SceneResult` to machine; machine appends and raises decay by 0.25 (tween 1.2 s in `decay.ts`).
- Receipt: reads `results[].events` and prints lines with 350 ms spacing (instant if reduced-motion).
- Result: `result.ts` picks tier + card from `ladder.json` using persona and best scene.
- Share card: `sharecard.ts` draws to `<canvas>` 1080x1920, `toBlob`, then `navigator.share({files})` if supported, else anchor download.

## 8. Algorithms (exact)
Scene weights `base`: lecture 20, battery 30, creator 25, private 25.
Persona boost (default 1.0): study {lecture 1.5, battery 1.25}; create {creator 1.5}; game {creator 1.5}; hustle {battery 1.5, private 1.5}.
```
w_i = base_i * boost_i
s_i = playerScore_i / 100                       // 0..1, how much the player salvaged
f_i = 1 - 0.4 * s_i                             // severity, 0.6..1.0
regret = round( 100 * sum(w_i * f_i) / sum(w_i) )   // 60..100
label: regret >= 90 "Ouch"; 75..89 "Painful"; < 75 "Could have been worse"
```
Per-scene regret line points: `points_i = round(w_i * f_i / sum(w) * 100)`; the last line absorbs rounding so lines sum to `regret`.
Player scores:
- lecture: `caught / 8 * 100`
- battery: `tasksDone / tasksSpawned * 100` (tasks spawn every 1.6 s for 16 s, so 10)
- creator: fill% at deadline (ring fills 1.0/s held, drains 0.5/s released, shelf laptop speed drops to 0.6/s after 8 s), cap 100
- private: `correct / 6 * 100`, correct = sensitive card kept private OR non-sensitive card allowed (sensitive flags in scenes.json)
Best scene = argmax playerScore; ties go to the persona's most relevant scene (ladder.json `tiebreak`).
Result: `ladder.json[persona]` gives card name, tier line, asks[], memory line. "Why this one" line = `why[bestScene]` text.
All functions pure and unit tested (SRC-13, SRC-21).

## 9. Environment variables
One file reads them: `src/core/env.ts`. All are PUBLIC (they ship to the browser). There are NO secrets in this project.
```
# Game
VITE_IDLE_SECONDS=60
VITE_AUDIO_DEFAULT=off          # off | on
VITE_NEXT_STEP_URL=             # an Intel page the QR opens; Capt confirms, see setup-checklist
VITE_SHOW_BUILD_STAMP=false     # prints short git hash on Staff screen when true
```

## 10. Error handling
- Content or claim missing: throw in `claim()`, dev overlay, CI fail.
- Share API unsupported or user cancels: fall back to download, no error toast on cancel.
- Audio blocked: stay muted, no message.
- Any uncaught error during a scene: `machine` shows a calm "Skip this scene" button and logs to console. Game must never dead-end in a store.

## 11. Observability
Console only. No analytics, no network logging (ADD-10).

## 12. Testing strategy
- Unit (Vitest): scoring, result for 4 personas, idle reset, i18n fallback, claim() throws, sharecard size, qr decode.
- e2e (Playwright): full run per persona, language switch mid-game, idle reset, facilitator skip, share download, zero third-party requests, timed run 120-180 s (`page.clock` or real-time at brisk pace).
- Accessibility: axe on every screen, keyboard-only run.
- Claims: `tools/check_claims.py` fails on any claim missing source_url, baseline or tag, or on `UNVERIFIED` claims used in a shipped screen without the label "unconfirmed".
- Visual: Playwright screenshots at 1920x1080 and 390x844 saved to `evidence/<phase>/`.

## 13. Deployment
1. GitHub repo public, default branch `main`. Settings > Pages > Source: GitHub Actions.
2. `ci.yml` runs lint, typecheck, test, build, then uploads `dist/` and deploys.
3. URL: `https://<user>.github.io/<repo>/`. Vite `base: './'` so paths work under the sub-path.
4. After deploy: open in a private window on a phone, run one full game.

## 14. Integration notes
- Intel product facts: see schema.md section 3 (claims) and progress.md "external facts" table. Baselines for C-03 and C-04 are confirmed from Intel's CES 2026 newsroom footnotes. C-05 test config, C-06, C-07, C-08 are from secondary outlets and stay UNVERIFIED until the agent opens Intel's product brief or footnotes and records them.
- Trademarks: no Intel logo files. Text only: "Intel® Core™ Ultra Series 3". Footer on Result and Fair Fight: "Intel, the Intel logo, Intel Core and Arc are trademarks of Intel Corporation or its subsidiaries." (same wording Intel uses in its press release).
