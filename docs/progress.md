# progress.md (living tracker; agents update at the end of every slice)

## Phase status
| Phase | Status | Tag | Notes |
|---|---|---|---|
| P0 | TODO | | |
| P1 | TODO | | |
| P2 | TODO | | |
| P3 | TODO | | |
| P4 | TODO | | |
| P5 | TODO | | cut line 1 |
| P6 | TODO | | |
| P7 | TODO | | cut line 2 |
| P8 | TODO | | |
| P9 | TODO | | cut line 3 |
| P10 | TODO | | |
| P11 | TODO | | |
| P12 | TODO | | |

## SPEC GAP log
None yet. Format: `SPEC GAP: <ID> - <WHAT> - <WHY>`.

## Decisions log
| Date | Decision | Why | Source |
|---|---|---|---|
| 2026-11-25 | Static Vite + vanilla TS on GitHub Pages | Spec: public URL only; smallest surface | architecture.md |
| 2026-11-25 | Fictional decoy laptops | Accuracy and fairness | prd.md principle 2 |

## External facts the agent had to look up
| Fact | Value | URL | Date | By |
|---|---|---|---|---|
| GitHub Pages limits | 1 GB site, 100 GB/month soft, 10 min deploy | docs.github.com Pages limits | 2026-11-25 | Claude |
| Intel claims C-01..C-04 | see claims.json | Intel newsroom CES 2026 | 2026-11-25 | Claude |
| `@fontsource` package names | UNVERIFIED | npm | | agent |
| QR library choice | UNVERIFIED | npm | | agent |
| GitHub Actions current majors (checkout, setup-node, configure-pages, upload-pages-artifact, deploy-pages) | UNVERIFIED, ci.yml uses last-known majors | github.com/actions | | agent |
| NEXT_STEP_URL (Intel AI PC page) | UNVERIFIED | | | Capt |
| Intel footnotes for C-05, C-06, C-07, C-08, C-16 | UNVERIFIED | Intel product brief / press deck | | teammate B |

## Open questions for the human
1. `node -v` major version (set `.nvmrc`).
2. GitHub repo URL and whether the remote exists.
3. Which Intel page should the QR open (NEXT_STEP_URL)?

## Slice log (newest first)
(empty)
