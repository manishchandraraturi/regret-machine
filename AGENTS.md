# AGENTS.md: rules for every coding agent (single source)

Project: The Regret Machine (Intel 1 Million Minds). Static web game. Vite + TypeScript vanilla. No backend, no secrets.

## 1. Read order (docs win over the task prompt)
1. This file. 2. docs/progress.md. 3. The current phase in docs/phases.md. 4. The doc sections the prompt names (docs/design.md, architecture.md, schema.md, prd.md). 5. The SPEC_CHECKLIST rows of the phase.
If the prompt and a doc disagree, follow the doc and say so in the report.

## 2. Honesty protocol
- Never write "works" or "done" without raw command output or a test name.
- Banned words about finished work: should, probably, mock, placeholder, for now, TODO.
- No fake data in runtime code. Vendor numbers come only from `src/data/claims.json`. Missing content shows `CONTENT_MISSING:<key>` and fails CI.
- Failing tests are reported as failing. Never weaken, skip or delete a test to go green.
- Anything unfinished is reported as `SPEC GAP: <ID> - <WHAT> - <WHY>` in capitals.
- A scene not yet built shows an honest `SCENE_NOT_BUILT` frame, never a fake scene.

## 3. Spec fidelity
Build every requirement ID of the phase. Use exact names from schema.md and architecture.md. UI comes from docs/design.md only. Do not "improve" the design. Do not change requirement text (edit tools/requirements.py only if Capt says so, then run `python tools/gen_docs.py`).

## 4. Working method
Restate the task in 3 lines. Work in small vertical pieces (one slice, about an hour, about 10 files or fewer). Run tests as you go. No unrelated refactors. If unsure, STOP and ask (see section 12).

## 5. Tech rules
- Fixed stack: Vite, TypeScript (strict), Vitest, Playwright, axe-core. Fonts via `@fontsource` (Archivo, Mukta, DM Mono), self-hosted.
- Allowed additions only with a one-line justification in progress.md: one QR library, `@axe-core/playwright`, `@fontsource-variable/*` if needed.
- FORBIDDEN: UI frameworks and component kits (React, Vue, Tailwind, Bootstrap, shadcn), `any`, `innerHTML` with variable data, `localStorage`/`sessionStorage`/cookies, analytics, `fetch` to other origins, CDN links, committing secrets, inline `<style>`/`style=""` in markup (CSP), animation libraries, Intel logo files, real competitor laptop names as the "bad" laptop.
- Env is read only in `src/core/env.ts`.

## 6. Code conventions
File <= 300 lines, function <= 50 lines. Names: camelCase functions, PascalCase types, kebab-case files. Validate at every boundary (URL params, JSON load). Pure functions for scoring/result. Comments explain why, not what. Return `Result`-style objects or throw typed errors; never swallow errors.

## 7. UI rules
Tokens only (no hex in components). No dead buttons. Every scene has: PLAY, FAIL, REVEAL. Touch targets >= 48 px. Visible focus. Honour `prefers-reduced-motion`. Every screen tested at 1920x1080 and 390x844. Save screenshots to `evidence/<phase>/<name>.png`. Hindi text must not clip.

## 8. Error handling
A scene error must never dead-end the game: show the calm skip button (design.md section 9). Share API cancelled: no error. Audio blocked: stay muted.

## 9. Commands (paste raw output in every report)
```
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e                 # Playwright
python tools/check_claims.py
python tools/gen_docs.py    # only after editing tools/requirements.py
```
Stop any hanging command after 2 minutes and report it.

## 10. Folders
- DO NOT MODIFY: `docs/` (except `progress.md` and `SPEC_CHECKLIST.md` Status/Evidence columns), `tools/`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.
- You may edit: `src/`, `tests/`, `public/`, `index.html`, `gallery.html`, config files needed for the build, `src/data/*.json` content (never invent claim facts).
- Evidence goes to `evidence/<phase>/`.

## 11. Git rules
Commit to `main` in small steps, conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Tag finished phases `phase-Pn`, cut lines `cutline-1/2/3`, final `v1.0`. Never force-push. Never create the remote repo. If there is no remote, STOP.

## 12. STOP conditions
Stop and report `BLOCKED: <what> - <need> - <done so far>` when: a key/account is needed, docs are ambiguous or contradict each other, a package or API differs from the docs, a change would be destructive, you need to touch a forbidden folder, or a claim cannot be verified.

## 13. Antigravity notes
Keep plans short (5 lines). Open gallery.html and compare to docs/design.md before saying a UI task is done. Do not restyle. Use the screenshot tool for evidence. One slice per run.

## 14. MANDATORY REPORT FORMAT
```
REPORT <phase> <slice>
1. Task (restated, 3 lines)
2. Files changed (list, with line counts)
3. Requirement IDs addressed -> status (DONE / PARTIAL / SPEC GAP)
4. Commands run -> RAW OUTPUT (paste, do not summarise)
5. Tests added/run -> names and pass/fail counts
6. Evidence -> screenshot paths, commit hash(es), tag
7. Design check -> checklist items ticked (design.md section 12) with paths
8. Decisions/deviations -> what, why, source
9. External facts looked up -> what, URL, date (also added to progress.md)
10. SPEC GAPs / BLOCKED (capitals) or "none"
11. Next recommended slice
```
