# 00_START_HERE: The Regret Machine pack

Deadline: **Fri 27 Nov 2026, 12:00 PM IST**. Freeze features Fri 06:00. Deploy test Fri 09:00. Submit by 10:30.

## What you got
| Path | What |
|---|---|
| `docs/prd.md` | What we build, journey, scenes, requirements table |
| `docs/architecture.md` | Stack, modules, formulas, tests, deploy |
| `docs/design.md` | "Sale Tag Decay" design: tokens, type, layout, components, checklist |
| `docs/schema.md` | Content files + claims policy (no database in this project) |
| `docs/security.md` | Static-site safety, CSP, privacy, trademark |
| `docs/copy.md` | Voice and jargon rules (text itself is in `src/data/copy.*.json`) |
| `docs/phases.md` + `phases.mmd` | 13 phases, cut lines, clock rules (generated) |
| `docs/progress.md` | Living tracker the agent updates |
| `docs/SPEC_CHECKLIST.md` | Every requirement ID with status + evidence (generated) |
| `docs/setup-checklist.md` | Tools, accounts, human tasks |
| `docs/demo-script.md` | 3-minute jury script + likely questions |
| `docs/DEEPSEEK_STARTER_PROMPT.md` | Paste into DeepSeek FIRST (~1.5k tokens) |
| `docs/DEEPSEEK_BRIEF.md` | Paste into DeepSeek SECOND (lean context) |
| `src/data/*.json` | Ready content: 16 claims, EN+HI copy (97 keys), scenes, ladder, laptops |
| `tools/` | `requirements.py` (single source), `gen_docs.py`, `check_claims.py` |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | Rules for coding agents (repo root) |
| `.github/workflows/ci.yml`, `.gitignore`, `.env.example`, `.nvmrc`, `.editorconfig`, `.prettierrc`, `README.md` | Scaffold |

## Baby steps
1. Unzip into `E:\Projects\RegretMachine`.
2. Run `node -v`. Put the major number in `.nvmrc` (pack says 22). Fill "Setup facts" in `docs/DEEPSEEK_BRIEF.md`.
3. Create a **public** GitHub repo (empty). In Settings > Pages set Source to **GitHub Actions**.
4. In the folder: `git init`, `git add .`, `git commit -m "chore: doc pack"`, add remote, push `main`.
5. Join the WhatsApp group and register if not done (SRC-23).
6. Open DeepSeek. Paste `DEEPSEEK_STARTER_PROMPT.md`. Wait for its reply.
7. Paste `DEEPSEEK_BRIEF.md`. If it cuts off, tell me and I split it into parts.
8. DeepSeek writes the S0.1 prompt. Paste it in Antigravity (project folder open).
9. Paste the REPORT back into DeepSeek. Accept or fix. Say "next".
10. Come back to me for: a report that looks wrong, a design doubt, a decision, a claim to verify.

## Team of 3
- **Capt:** runs the pipeline, merges, final deploy, form.
- **Teammate A:** Hindi review, jury rehearsal, plays the game for feel.
- **Teammate B:** claims verification (Intel footnotes for C-05..C-16), phone testing, fallback video.

## Edit-the-source rule
Never hand-edit `phases.md`, `SPEC_CHECKLIST.md`, the requirements table in `prd.md`, or `DEEPSEEK_BRIEF.md`. Edit `tools/requirements.py` (or AGENTS.md) and run `python tools/gen_docs.py`.

## Honest warnings
- 27 planned hours for 36 or fewer clock hours with sleep. Do not start P8 or P9 if P7 is not done by Thu 22:00.
- C-05 to C-16 are UNVERIFIED. `python tools/check_claims.py --release` will fail until they are verified or removed from screens. That is deliberate: accuracy is 3 points.
- Hindi is a first draft. Get it reviewed.
- Nothing here proves your laptop story to Intel's own numbers. Every number is "Intel-claimed". Say that out loud at the jury.
