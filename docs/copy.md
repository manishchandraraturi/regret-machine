# Copy rules and voice

Source of truth for text: `src/data/copy.en.json` and `copy.hi.json` (97 keys each). This file holds the rules only.

## Voice
- Blunt, a little funny, store-floor Hinglish energy but written in plain English. Short sentences. Active verbs. Sentence case.
- Name things by what the shopper understands: "AI chip", not "NPU", the first time. Show the NPU gloss once per scene that uses it.
- A button says exactly what happens: "Buy it", "Pick your laptop", "Show the store team". Same name in the next confirmation.
- Failure text says what happened and what it cost, no apology: "Battery 0%. Charger is at home."
- Never say "always private", "guaranteed", "best", "fastest", "beats". Say "up to", "can", "Intel-claimed".
- Never name a real laptop as the bad one.

## Jargon lint (SRC-04)
These words must not appear in shopper-facing text unless followed by the gloss: NPU, TOPS, GPU, x86, Arm, LLM, benchmark, inference, Xe, XMX. The lint script in P11 greps copy files and claim text shown on screen.

## Hindi
- Keep brand and chip names in Latin script (Intel, Core Ultra, Arc, TOPS, NPU).
- REVIEW BY NATIVE SPEAKER before freeze (teammate A). Check overflow at 390 px.
