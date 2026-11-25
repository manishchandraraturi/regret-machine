# Setup checklist

| Service / tool | Needed by | What for | Notes |
|---|---|---|---|
| Node (LTS) on Windows | before P0 | build + tests | Run `node -v`, put the major version in `.nvmrc` |
| Git + GitHub account | before P0 | repo + Pages | Repo must be **public** for free Pages (verified 25 Nov 2026) |
| GitHub repo created by Capt | before P0 | remote | Agent never creates it |
| GitHub Pages enabled (Settings > Pages > Source: GitHub Actions) | before P0 deploy | hosting | Do once, by hand |
| Antigravity | before P0 | coding agent | Already owned |
| DeepSeek chat | before P0 | prompt writer | Keep context lean (see DEEPSEEK_STARTER_PROMPT) |
| Playwright browsers | P0 | e2e | `npx playwright install chromium` |
| Python 3 | P0 | tools/ scripts | gen_docs.py, check_claims.py |
| Phone for testing | P4 onward | real device check | Same Wi-Fi or the Pages URL |
| NEXT_STEP_URL | before P5 | QR target | Capt picks an official Intel page about AI PCs, pastes into `.env.local` and Pages build env |

No paid service is needed. No API keys exist. Never paste secrets in chat.

## Human tasks (cannot be done by agents)
| Who | Task | When |
|---|---|---|
| Capt | Run the pipeline (DeepSeek > Antigravity), approve each phase | now to Fri 06:00 |
| Teammate A | Hindi copy review (copy.hi.json), jury script rehearsal | Thu |
| Teammate B | Claims verification: open Intel footnotes, fill `conditions`, set VERIFIED or remove | Thu before 18:00 |
| All | Play the game on a phone and a 1080p screen, note bugs | Thu night, Fri 07:00 |
| Capt | Fill the Google Form (do not use the last hour) | Fri before 10:30 |
