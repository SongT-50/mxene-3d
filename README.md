# MXene in 3D — from Ti₃AlC₂ to Ti₃C₂Tₓ

**An interactive, offline, single-file 3D explainer of how the most-studied MXene is made.**
Rotate the crystal, etch out the aluminium, watch terminations cap the surface, and peel off a ~1 nm sheet.

▶ **Open it:** https://songt-50.github.io/mxene-3d/ (or download `index.html` and double-click — no internet needed)

![preview](preview.png)

## The 8 steps
1. **Ti₃AlC₂ MAX phase** — P6₃/mmc, Ti₃C₂ slabs + Al layers, unit cell shown
2. **Why Al leaves** — strong Ti–C vs. weaker Ti–Al bonding
3. **Selective etching** — HF or LiF + HCl, with the idealized reaction
4. **Surface terminations Tₓ** — –O, –OH, –F
5. **Intercalation** — Li⁺/H₂O or organic molecules; (002) peak shifts to lower 2θ
6. **Delamination** — one Ti₃C₂Tₓ flake, five atomic planes
7. **Restacked films** — in-flake metallic transport, flake-to-flake junctions
8. **Transparent conducting films** — the transmittance vs. sheet-resistance trade-off

Each step has a key-facts panel, equations, a schematic chart and numbered references (DOIs linked). Buttons: unit cell, labels, auto-rotate, **Save PNG** (for slides).

## How it was made
- **Built with an AI assistant (Claude)** by Sapjil Coding (삽질코딩), a Korean channel about building things with code and AI.
- **Rendering:** plain [three.js](https://threejs.org) (r147, MIT), inlined so the whole thing is one HTML file. No build tools, no server, no tracking.
- **Structure:** atoms are placed on the idealized P6₃/mmc Wyckoff sites of Ti₃AlC₂ — Ti(1) 2a, Ti(2) 4f, Al 2b, C 4f — with approximate a ≈ 3.07 Å, c ≈ 18.6 Å. The (002) position (≈ 9.5°, Cu Kα) is computed from *c*; other peak positions are illustrative.
- **Checks we ran before publishing:**
  - every reference was checked against Crossref/OpenAlex (exists · title · first author · volume · pages) — 10/10;
  - two independent AI review passes on the science. The first caught a real error — the two halves of each slab were placed on the same in-plane site, which drew Ti(1) as trigonal-prismatic and Al as octahedral. It was fixed using the inversion symmetry of 4f, so Ti(1) is now octahedral and Al trigonal-prismatic. The second pass caught a citation that did not support its sentence, and it was corrected.

## Honest limits
This is a teaching model, not a structure refinement. Lattice parameters and z-coordinates are approximate. The O/OH/F mix and placement are illustrative. Gaps between layers are exaggerated for visibility. Flake sizes and film views are schematic.

## Source
`src/app.js` (scene + content) and `src/template.html` (layout) → `python build.py` → `index.html`.
Code: MIT. References: see [REFERENCES.md](REFERENCES.md).
