#!/usr/bin/env python3
"""Usage: python tools/check_claims.py [--release]
Dev mode: structure must be valid; UNVERIFIED allowed.
--release: any claim referenced by scenes.json or Fair Fight rows must be VERIFIED."""
import json, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
D = ROOT / "src" / "data"
TAGS = {"intel-claimed", "third-party", "our-advice", "public-fact"}
errs = []
claims = json.loads((D / "claims.json").read_text(encoding="utf-8"))
ids = set()
for c in claims:
    cid = c.get("id", "?")
    ids.add(cid)
    for k in ("id", "tag", "text", "metric", "baseline", "conditions", "source_name", "source_url", "status"):
        if not c.get(k):
            errs.append(f"{cid}: missing {k}")
    if c.get("tag") not in TAGS:
        errs.append(f"{cid}: bad tag {c.get('tag')}")
    for lang in ("en", "hi"):
        if not c.get("text", {}).get(lang):
            errs.append(f"{cid}: missing text.{lang}")
    if c.get("status") == "VERIFIED" and not c.get("verified_on"):
        errs.append(f"{cid}: VERIFIED without verified_on")
    if c.get("tag") == "intel-claimed" and c.get("baseline") in ("", None):
        errs.append(f"{cid}: intel-claimed needs baseline")
scenes = json.loads((D / "scenes.json").read_text(encoding="utf-8"))
used = set()
for s in scenes["scenes"].values():
    for cid in s.get("claims", []):
        used.add(cid)
        if cid not in ids:
            errs.append(f"scenes.json references unknown claim {cid}")
ff = D / "fairfight.json"
if ff.exists():
    for row in json.loads(ff.read_text(encoding="utf-8")):
        for cell in row.get("cells", {}).values():
            cid = cell.get("claim")
            if cid:
                used.add(cid)
                if cid not in ids:
                    errs.append(f"fairfight.json references unknown claim {cid}")
if "--release" in sys.argv:
    for c in claims:
        if c["id"] in used and c["status"] != "VERIFIED":
            errs.append(f"{c['id']}: shown in game but UNVERIFIED. Verify against primary source or remove it from the screen")
for lang in ("en", "hi"):
    keys = json.loads((D / f"copy.{lang}.json").read_text(encoding="utf-8"))
    if lang == "en":
        en = set(keys)
    elif set(keys) != en:
        errs.append(f"copy.hi.json keys differ from copy.en.json: {sorted(set(keys) ^ en)[:6]}")
if errs:
    print("CLAIMS CHECK FAILED"); [print(" -", e) for e in errs]; sys.exit(1)
print(f"claims ok: {len(claims)} claims, {len(used)} used, mode={'release' if '--release' in sys.argv else 'dev'}")
