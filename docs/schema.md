# Schema (content + state; there is no database)

Project has NO database, NO auth, NO tenancy. "Schema" = the JSON content files and the in-memory state. Integrity rules are enforced by `tools/check_claims.py` (CI) and unit tests.

## 1. Conventions
- All content in `src/data/*.json`, UTF-8, 2-space indent. Keys are stable ids (`C-03`, `lecture`). Text is `{en, hi}`.
- Money in rupees as integers. Dates ISO (`2026-11-25`). Scores 0-100 integers. Decay 0..1 float.
- Ready-made files are in the pack under `src/data/`. Agents EDIT them, never recreate from scratch.

## 2. Files
| File | Shape | Notes |
|---|---|---|
| `claims.json` | `Claim[]` (architecture.md section 5) | 16 rows C-01..C-16. Only source of vendor numbers |
| `copy.en.json`, `copy.hi.json` | flat `{key: string}` | Same key set (checked). Hindi marked REVIEW BY NATIVE SPEAKER |
| `scenes.json` | `{order, scenes{}, boost{}, decayPerScene}` | Timings, base weights, file list with `sensitive` flags |
| `personas.json` | `{id, en, hi}[]` | 4 personas |
| `laptops.json` | `{id, name, colourway, price, mrp}[]` | Fictional decoys |
| `ladder.json` | per persona: card, tier, tiebreak[], asks[] | Recommendation content (asks are copy keys) |
| `fairfight.json` | NOT PROVIDED. Agent creates in P10 from the shape below | Rows reference claim ids |

`fairfight.json` shape:
```json
[{ "rowKey": "ff.row.apps",
   "cells": { "intel": {"text": {"en":"...","hi":"..."}, "claim": "C-10", "lead": true},
              "amd":   {"text": {...}, "claim": "C-10"},
              "qc":    {"text": {...}, "claim": "C-10", "concession": false} } }]
```
Rules: every cell has a `claim` id or the text is a pure question to the shopper. At least two cells have `"concession": true` for a rival (ADD-09): AI chip number (C-12), battery positioning (C-13).

## 3. Claims policy (ADD-03, SRC-21)
- `tag`: `intel-claimed` (shown with "Intel-claimed, up to" and baseline), `third-party`, `our-advice`, `public-fact`.
- `status`: `VERIFIED` only if the primary source (Intel newsroom, footnotes, product brief) was opened and the baseline copied. Otherwise `UNVERIFIED`.
- As shipped: C-01 to C-04 VERIFIED (Intel newsroom CES 2026 text and footnotes 1 and 2, checked 25 Nov 2026). C-05 to C-16 UNVERIFIED. Human task (teammate B, Thu): open Intel's product brief and press-deck footnotes, fill `conditions`, set VERIFIED, or remove the claim from the screen.
- `python tools/check_claims.py --release` must exit 0 before the freeze. It fails if any claim shown in the game is UNVERIFIED.
- Never write a number in copy that is not in claims.json. Player score and regret score are the only computed numbers.

## 4. In-memory state
`GameState` in architecture.md section 5. Reset on idle or Play again. Never written to storage, cookies or network (ADD-10).

## 5. Integrity rules and their tests
| Rule | Enforced by | Test |
|---|---|---|
| Every claim has source_url, baseline, conditions, tag, text en+hi | check_claims.py | CI step |
| copy.hi.json has the same keys as copy.en.json | check_claims.py | CI step |
| scenes.json claim ids exist | check_claims.py | CI step |
| `claim(id)` throws for unknown id | claims loader | unit |
| Regret lines sum to regret score | result.ts | unit |
| 4 personas give 4 different recommendation cards | result.ts | unit |
| No claim marked UNVERIFIED ships | check_claims.py --release | CI on tag |

## 6. Seed data rules
Laptop names and prices are fictional and labelled "Illustration" on screen. They never mimic a real product.
