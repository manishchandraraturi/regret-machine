# PRD: The Regret Machine

Status: v1 | Owner: Capt (Manish Chandra Raturi) + team of 3 | Date: 25 Nov 2026 | Deadline: Fri 27 Nov 2026, 12:00 PM IST

## 0. Reading rules for agents
- Every line below maps to an ID (SRC, ADD, DSN, DEL). Build all IDs of your phase. Do not skip, merge, rename or soften.
- No invented data. Vendor numbers come only from `src/data/claims.json`. Scenes are illustrations and must be labelled so.
- If something cannot be done as written, write `SPEC GAP: <ID> - <WHAT> - <WHY>` in capitals in progress.md and in your report.

## 1. One-line pitch
Pick a laptop on looks and price, then live with it for 3 years in 3 minutes, and feel what the sticker did not tell you.

## 2. The problem in plain English
Intel's brief: Gen Z already uses AI daily but does not think it needs an AI PC. In stores they pick by price and colour, then end up with a laptop that ages badly. The job is to turn "why an AI PC?" into "I want this Intel AI PC", in 2-3 minutes, for people with little technical knowledge.

Our insight: nobody argues against a spec sheet they do not understand. People do react to regret. So the game does not explain specs. It lets the player make the exact mistake (buy the shiny one), then fast-forwards the consequences.

## 3. Who it is for
| Persona | Needs | How the game helps |
|---|---|---|
| Study (college student) | Notes, battery in class, low cost of ownership | Lecture scene, long-day scene |
| Create (reels, edits) | Fast export, no stutter | Creator scene |
| Game | Smooth frames on thin laptops | Creator scene, graphics claims |
| Hustle (work + side income) | Battery, privacy of client files | Long-day scene, private-files scene |
Secondary viewer: the store sales associate, who gets a clear ask list on the Staff screen. Tertiary: the Intel jury.

## 4. Product shape
- Static web app (HTML/CSS/TypeScript), public URL on GitHub Pages. Runs on the store's demo PC (kiosk, 1920x1080 landscape) and on a shopper's phone (390x844 portrait) from a QR.
- No accounts, no backend, no data collection. Jury gets the same public URL.
- Facilitator mode `?facilitator=1`: skip scene, jump to Result, reset.

## 5. Principles (non-negotiable)
1. Honest. Intel numbers are always "Intel-claimed, up to", with the baseline. Scenes are "Illustration".
2. Never name or mock a real competitor laptop. The decoy is a fictional archetype: shiny, older chip, no AI chip, small battery.
3. Fair Fight concedes where rivals lead. Trust beats hype.
4. Plain words. Every tech term is explained in one short line the first time it appears.
5. 2-3 minutes. If a scene runs long, cut the scene, not the contrast.

## 6. Core user journey (the demo path)
1. Attract (loops): flyer "Mega sale. ₹38,990." Tap to start.
2. Shelf: three shiny unbranded laptops, same "AI powered" sticker on all three (the trap). Player picks a persona chip and taps "Buy it".
3. Year flip, then four scenes in this order, ~22 s each, always: Year 1 Lecture hall, Year 2 Long day, Year 2 night Creator, Year 3 Private files. After each: 6 s split reveal (decayed shelf laptop left, Intel AI PC right) + a regret line printed on the receipt tape.
4. Receipt: the full tape prints. Regret score out of 100.
5. Fair Fight (skippable, 12 s): Intel Core Ultra Series 3 vs AMD Ryzen AI vs Qualcomm Snapdragon X, with concessions.
6. Result: personalised recommendation (persona + performance), "ask for" list in plain words, share card, Staff screen with QR.

Time budget: Attract 8 + Shelf 20 + flips 4x1.2 + scenes 4x28 + Receipt 10 + Fair Fight 12 + Result 15 = about 180 s at the slowest, 130 s at a brisk pace. Target 120-180 s (SRC-06).

## 7. Demo cut lines
See phases.md. CUT LINE 1 after P5 (flow works, scenes stubbed). CUT LINE 2 after P7 (two scenes: minimum to submit). CUT LINE 3 after P9 (all four scenes). Full after P10.

## 8. Requirements
Every row is generated from `tools/requirements.py`. Do not edit by hand.

<!-- REQ_TABLE_START -->
| ID | Group | Requirement | Phase | Verified by |
|---|---|---|---|---|
| SRC-01 | SRC | Vibe-code an exciting, interactive game | P4-P9 | e2e full playthrough passes; manual play on phone + 1080p screen |
| SRC-02 | SRC | Helps shoppers discover Intel-powered AI PCs and makes a compelling case to buy one over competitors | P5,P10 | Result names Intel Core Ultra Series 3; Fair Fight screen exists |
| SRC-03 | SRC | Design for walk-in customers at Large Format Retail (LFR) stores such as Reliance Digital, Croma and Vijay Sales | P1,P4,P11 | Screenshots at 1920x1080 and 390x844; idle-reset e2e test |
| SRC-04 | SRC | Assume zero to less prior technical knowledge | P2,P11 | Copy lint: every tech term glossed in plain words (NPU, TOPS, GPU) |
| SRC-05 | SRC | Short, intuitive experience that grabs attention within seconds | P4 | e2e: Attract is interactive < 2 s after load; one-tap start |
| SRC-06 | SRC | Delivers its core message in 2-3 minutes | P11 | e2e timed run at default pace lands 120-180 s |
| SRC-07 | SRC | Playable challenges spanning distinctive use cases in learning, work, creativity, gaming and everyday life | P6-P9 | scenes.json use-case map + 4 scene tests |
| SRC-08 | SRC | Showcase AI on-device application support | P7 | Lecture scene test; claim C-02 shown with glossary |
| SRC-09 | SRC | Showcase privacy | P8 | Private-files scene test |
| SRC-10 | SRC | Showcase battery life | P6 | Long-day scene test; claims C-05, C-06 tagged Intel-claimed |
| SRC-11 | SRC | Showcase performance | P9 | Creator scene test; claims C-03, C-04 with baselines |
| SRC-12 | SRC | Make Intel's advantages tangible compared to key competitors | P6-P10 | Split reveal in every scene + Fair Fight screen |
| SRC-13 | SRC | End with a personalised AI PC recommendation | P5 | Unit test: 4 personas give 4 different recommendations |
| SRC-14 | SRC | End with a clear next step | P5 | Staff screen + QR + share card exist; e2e reaches them |
| SRC-15 | SRC | Submit only public URLs or self-hosted URLs. Do NOT submit exe or code files | P12 | URL opens in a private window, logged out |
| SRC-16 | SRC | Submit Round 1 entry in the Google Form by 27 Nov 2026, 12 PM | P12 | HUMAN: screenshot of form confirmation |
| SRC-17 | SRC | Participate individually or in a team of max 4 members (we are 3) | P12 | HUMAN: form lists 3 names |
| SRC-18 | SRC | Shortlisted teams present before the Intel Jury on 28 Nov | P12 | HUMAN: demo-script rehearsed twice |
| SRC-19 | SRC | Judging: creativity of the game (3 points) | P1,P4-P9 | Design acceptance checklist ticked with screenshots |
| SRC-20 | SRC | Judging: persuasive impact towards buying (3 points) | P5-P9 | Every scene ends in a felt contrast + recommendation |
| SRC-21 | SRC | Judging: technical accuracy of AI PC features (3 points) | P2,P11 | Claims audit: 100% of shown numbers have source + baseline + tag |
| SRC-22 | SRC | Judging: showcase of competitive superiority (1 point) | P10 | Fair Fight rows each carry a source id |
| SRC-23 | SRC | Join the WhatsApp group and register on the link in the group description | P0 | HUMAN: registration confirmed |
| ADD-01 | ADD | Kiosk mode: auto-reset to Attract after 60 s idle (config VITE_IDLE_SECONDS) | P2,P4 | Unit test with fake timers + e2e |
| ADD-02 | ADD | English/Hindi toggle on every screen | P2,P10 | e2e: switch language mid-game, state kept |
| ADD-03 | ADD | claims.json: every number shown has source, baseline, conditions, tag, verified_on | P2,P11 | tools/check_claims.py exits 0 |
| ADD-04 | ADD | No runtime third-party requests; fonts and assets self-hosted; works with weak store Wi-Fi | P0,P1,P11 | Playwright: zero requests outside origin |
| ADD-05 | ADD | Synthesised sound (WebAudio, no audio files), muted by default, visible mute toggle | P3 | Unit test engine; manual |
| ADD-06 | ADD | Accessibility: keyboard play, focus-visible, reduced-motion, contrast AA, touch targets >= 48 px | P1,P11 | axe run + manual keyboard run |
| ADD-07 | ADD | Shareable result card (PNG made in browser, Web Share API or download) | P3,P5 | e2e: download event fires, PNG 1080x1920 |
| ADD-08 | ADD | Store-staff screen: plain-words ask list + QR to NEXT_STEP_URL | P3,P5 | Screenshot; QR decodes to the URL |
| ADD-09 | ADD | Fair Fight screen concedes where rivals lead (honesty builds trust with the jury) | P10 | Row text review against claims.json |
| ADD-10 | ADD | No analytics, no cookies, no data collection, no accounts | P0,P11 | grep for storage/analytics APIs = empty |
| ADD-11 | ADD | Performance budget: JS+CSS+fonts <= 600 KB gzip; interactive < 2.5 s on mid phone (throttled) | P11 | Build size report + Lighthouse run pasted |
| ADD-12 | ADD | Evidence: unit tests for scoring/result; Playwright e2e screenshots per screen | P11 | evidence/ folder + test names |
| ADD-13 | ADD | Facilitator mode (?facilitator=1): skip scene, jump to result, reset. Demo-day lifesaver | P2,P4 | e2e |
| ADD-14 | ADD | Layouts: kiosk landscape 16:9 and phone portrait 390x844, same code | P1,P11 | Screenshots both |
| ADD-15 | ADD | Honest labelling: scenes are marked 'Illustration'; vendor numbers marked 'Intel-claimed, up to' | P2,P6-P10 | Visual check each scene |
| DSN-01 | DSN | Sale Tag Decay identity: Indian electronics-flyer look in Act I | P1 | design.md section 12 checklist |
| DSN-02 | DSN | Decay engine: --decay 0..1 drains colour, adds grain, scratches, crack | P1 | Visual test at 0, 0.5, 1 |
| DSN-03 | DSN | Typography: Archivo (display), Mukta (body, Hindi), DM Mono (receipt only) | P1 | Fonts load from own origin, not a CDN |
| DSN-04 | DSN | Receipt tape: running regret list that prints as events happen | P1,P5 | Component test |
| DSN-05 | DSN | Motion: one orchestrated Year Flip; everything else answers user action | P1,P3 | Reduced-motion swap verified |
| DSN-06 | DSN | Clear skin for the reveal: cool white + Clear Blue, no stickers | P1,P5 | Screenshot vs design.md |
| DEL-01 | DEL | Public URL live (GitHub Pages) | P12 | Open in private window on a phone |
| DEL-02 | DEL | README: what it is, how to run, claims policy, credits | P12 | File exists, reviewed |
| DEL-03 | DEL | One-page system design for the jury (docs/system-design.md) | P12 | File exists |
| DEL-04 | DEL | Jury demo script, 3 minutes, timed (docs/demo-script.md) | P12 | Rehearsed |
| DEL-05 | DEL | 60-second screen recording as fallback if venue Wi-Fi fails | P12 | File on phone + Drive |
<!-- REQ_TABLE_END -->

## 9. Module behaviour

### 9.1 Attract
- Full-screen flyer, slow marquee of price tags. Big headline, one button "Pick your laptop". Any tap or key starts. Language toggle (EN/HI) and mute toggle bottom corners.
- Idle 60 s on any screen returns here and clears state (ADD-01).

### 9.2 Shelf
- Three laptops (`laptops.json`): Zesta Glow (Sunset Pink, ₹38,990), Voltra Slim (Mint, ₹41,990), Nimbus Air (Lilac, ₹44,990). Fictional names. Each has the same three stickers: "AI powered", "Thin and light", "Sale". The only differences are colour and price. This is the point.
- Persona chips (4). Both selections required before "Buy it" enables.
- On Buy: cash-register sound (if unmuted), laptop tag turns, then Year Flip.

### 9.3 Scenes (all share a frame)
Frame: header chip "Year N" + scene title, tape on the right (landscape) or bottom (portrait), 22 s countdown ring, skip button only in facilitator mode.
Phases of a scene: PLAY 16 s on the shelf laptop, FAIL event, REVEAL 6 s split screen. Decay rises by +0.25 per scene (0.25, 0.5, 0.75, 1.0).

| Scene | Use case | Player action | Failure on shelf laptop (illustration) | Reveal on Intel AI PC |
|---|---|---|---|---|
| Lecture hall (Year 1) | Learning, AI on-device | Tap 8 falling notes before they hit the floor | Wi-Fi drops at 9 s, AI summary says "Needs internet" and vanishes | Summary still appears. Glossary: "NPU: a small chip built for AI so battery and fans do not suffer". Claim C-02 |
| Long day (Year 2) | Work, everyday, battery | Tap each task bubble (meeting, send file, share) as the clock runs 9 am to 7 pm | Battery bar hits 0 % around 2:30 pm, screen goes black | Bar still has charge at 7 pm. Claims C-05, C-06 with the exact test names |
| Creator night (Year 2) | Creativity, gaming, performance | Hold the Export ring to fill it before the upload deadline | Frames stutter, fan sound rises, export finishes late, deadline missed | Smooth, on time. Claims C-03, C-04 with baselines |
| Private files (Year 3) | Everyday, privacy | Six file cards (report card, bank PDF, diary, photos, resume, class notes): tap "Ask AI" on a card, then Allow upload or Keep private | AI help needs "Uploading to a server..." for each; refusing means no help | Same help runs on the laptop. Copy: "can run on your laptop" |

Player score per scene 0-100 (skill, shown as "your score"). Regret points are separate and deterministic (see architecture.md section 8).

### 9.4 Receipt
- Thermal-paper tape prints line by line with a printer tick. Lines come from the regret events collected. Ends with "Regret score: N / 100" and the small print "Illustration. Real results vary."

### 9.5 Fair Fight
- 5 rows x 3 columns (Intel Core Ultra Series 3, AMD Ryzen AI, Qualcomm Snapdragon X). Rows from `claims.json` with source ids: Runs your existing Windows apps, Built-in graphics, AI chip number on the box, Battery claims, Where to check. Concessions required (ADD-09): rivals may print higher AI chip numbers; Snapdragon is positioned battery-first.
- Footer: "Check independent reviews for your exact model."

### 9.6 Result
- Clear skin. Persona card name, recommended tier, three "ask for" lines in plain words, a "Why this one" line tied to the scene the player did best, then three buttons: Save my card (PNG), Show store team (Staff screen), Play again.

### 9.7 Staff screen
- Large text, no jargon needed for the shopper to hand it over: "I would like to see Intel Core Ultra Series 3 laptops. I mostly: <persona>. Please show me: <asks>". QR to NEXT_STEP_URL (an Intel page; value confirmed by Capt, see setup-checklist.md).

## 10. Recommendation logic (summary; formulas in architecture.md)
- Study: Core Ultra 5 or 7 class, 16 GB memory, battery first.
- Create: Core Ultra X7 or X9 class (strongest built-in graphics), 32 GB memory if budget allows.
- Game: Core Ultra X7 or X9 class, 16-32 GB.
- Hustle: Core Ultra 7 class, 16 GB, battery first.
These are shopping guidance lines, not Intel claims. Memory advice is third-party guidance (see claims C-15). Prices are not quoted.

## 11. Out of scope
Real benchmarks running in the browser. Real NPU access. Lead capture. Accounts. Analytics. Intel logo files. Naming any real laptop model as the "bad" one. Payments. Backend.

## 12. Success criteria
- A first-time shopper finishes the game in 2-3 minutes without help (SRC-06).
- Every number on screen traces to a claims.json row with a baseline (SRC-21).
- Jury remembers one thing: "the sale sticker aged".
- Public URL works logged out on a phone and on the kiosk resolution.

## 13. Risks
| Risk | Impact | Mitigation |
|---|---|---|
| Wrong or loose claim | Lose accuracy points (3) | claims.json + check_claims.py + tags; Fair Fight cites ids |
| Scope vs 27 h build | Unfinished scenes | Cut lines, freeze Fri 06:00, scenes independent |
| Weak coding model drifts on design | Looks like a template | design.md tokens, gallery page first, side-by-side acceptance |
| Venue Wi-Fi fails during jury | Demo dies | Fallback video (DEL-05), assets self-hosted, no runtime calls |
| Judges read "decoy" as unfair to rivals | Credibility | Decoy is a fictional archetype, Fair Fight concedes |
| Browser audio blocked | Silent demo | Muted by default, feature works without sound |
| Hindi text overflow | Broken UI | P10 pass at 390 px |
