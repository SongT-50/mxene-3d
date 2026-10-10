"""Public atlas: show the verbatim source sentence only for papers with a confirmed open licence (2026-10-11, MXENE-T1).
Licences: OpenAlex locations[].license (by DOI) and Europe PMC `license` (by PMCID, for points without a DOI).
Points from papers without a confirmed CC / public-domain licence keep value, unit, conditions and DOI;
their sentence `q` is replaced by a notice. Applies to every embedded record array in atlas/index.html and atlas/explore.html.
Usage: python redact_quotes.py <openalex_licences.json> <pmc_licences.json>
"""
import json
import os
import sys

OA = json.load(open(sys.argv[1], encoding="utf-8"))
PMC = json.load(open(sys.argv[2], encoding="utf-8"))
NOTICE = "Source sentence not shown here: no open licence was confirmed for this paper. The value, conditions and DOI are given; please read the sentence in the original paper."
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "atlas")


def open_licence(rec):
    d = (rec.get("d") or "").lower()
    if d:
        return any(l.startswith("cc-") or l == "public-domain" for l in OA.get(d, {}).get("lic", []))
    lic = PMC.get(rec.get("p"))
    return bool(lic) and lic.lower().startswith("cc")


def process(path):
    t = open(path, encoding="utf-8").read()
    dec = json.JSONDecoder()
    out, i, arrays, shown, hidden = [], 0, 0, 0, 0
    while True:
        k = t.find("[{", i)
        if k < 0:
            out.append(t[i:])
            break
        try:
            val, end = dec.raw_decode(t[k:])
        except ValueError:
            out.append(t[i:k + 2]); i = k + 2
            continue
        if isinstance(val, list) and val and isinstance(val[0], dict) and "q" in val[0] and "p" in val[0] and "v" in val[0]:
            arrays += 1
            for rec in val:
                if open_licence(rec):
                    shown += 1
                else:
                    rec["q"] = NOTICE; rec["q_hidden"] = True; hidden += 1
            out.append(t[i:k]); out.append(json.dumps(val, ensure_ascii=False, separators=(",", ":")))
        else:
            out.append(t[i:k + end])
        i = k + end
    open(path, "w", encoding="utf-8").write("".join(out))
    print(os.path.basename(path), "arrays", arrays, "sentences shown", shown, "hidden", hidden)


for f in ("index.html", "explore.html"):
    process(os.path.join(HERE, f))
