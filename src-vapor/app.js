// Vapor-phase Ti2CCl2 MXene explainer (standalone; global THREE r147 + THREE.OrbitControls)
// Source paper: Kim, H. et al. Vapor-Phase Synthesis of Ti2CCl2 MXene. J. Am. Chem. Soc. 2026, doi:10.1021/jacs.6c10774 (CC-BY 4.0).
// Four scenes far apart along x: reactor (1 unit = 1 mm), molecules + crystal (1 unit = 1 Å), spherulites (schematic, not to scale).
(function () {
  "use strict";
  if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;   // hex colours == legend (see sibling explainer v1.1)
  const VIDEO = /[?&]video/.test(location.search);
  if (VIDEO) document.body.classList.add("video");

  // ---------------- crystallography (from XRD peak positions in [1], Cu Kα 1.5406 Å) ----------------
  // (100) 32.3° -> d = 2.769 Å -> a = d·2/√3 = 3.20 Å ; (110) 57.4° -> d = 1.604 Å -> a = 3.21 Å
  // (002) 10.5° -> d = 8.42 Å ; (004) 20.8° -> d = 4.27 Å (×2 = 8.53 Å). Interlayer repeat used: 8.45 Å.
  const a = 3.20, D = 8.45;
  const hTi = 1.25;            // Ti plane height above/below C (≈ half of TiC (111) spacing 2.50 Å) — approximate
  const hCl = hTi + 1.70;      // Cl plane height (Ti–Cl vertical ≈ 1.70 Å assumed) — approximate
  const N = 6;
  const SITE = { A: [0, 0], B: [1 / 3, 1 / 3], C: [2 / 3, 2 / 3] }, ABC = ["A", "B", "C"];   // hollow sites for the 60° basis used by xy() (fixed 2026-10-10: the old 120°-basis fractions sat off the hollows)
  const COL = { Ti: "#9aa7bd", C: "#3b3b44", Cl: "#3fbf9a", H: "#f2f2f2", Tip: "#a3a7ae" };
  const RAD = { Ti: 0.62, C: 0.38, Cl: 0.55, H: 0.24 };
  const S3 = Math.sqrt(3) / 2;
  const cen = (aa, n) => [aa * ((n - 1) / 2 + (n - 1) / 4), aa * S3 * (n - 1) / 2];
  const xyA = (aa, n, u, v) => { const [cx, cz] = cen(aa, n); return [aa * (u + v / 2) - cx, aa * S3 * v - cz]; };

  // ---------------- scene anchors ----------------
  const RX = -1400, MX = 300, MZ = 1400, MD = -2800;     // reactor · molecules · meso · loading modes ; crystal at origin

  // ---------------- references ----------------
  const REFS = [
    ["Kim, H., Kim, J., Zhang, T., Das, S., Hioki, Y., Stach, E. A., Gogotsi, Y. (2026). Vapor-phase synthesis of Ti2CCl2 MXene. J. Am. Chem. Soc. (published online; CC-BY 4.0).", "10.1021/jacs.6c10774"],
    ["Wang, D. et al. (2023). Direct synthesis and chemical vapor deposition of 2D carbide and nitride MXenes. Science 379, 1242–1247.", "10.1126/science.add9204"],
    ["Xiang, M. et al. (2024). Gas-phase synthesis of Ti2CCl2 enables an efficient catalyst for lithium–sulfur batteries. The Innovation 5, 100540.", "10.1016/j.xinn.2023.100540"],
    ["Yue, F. et al. (2024). One-step gas-phase syntheses of few-layered single-phase Ti2NCl2 and Ti2CCl2 MXenes with high stabilities. Nat. Commun. 15, 10334.", "10.1038/s41467-024-54815-9"],
    ["Wang, D. et al. (2026). Molecular organohalides as general precursors for direct synthesis of two-dimensional transition metal carbide MXenes. Nat. Synth. 5, 556–564.", "10.1038/s44160-025-00946-w"],
    ["Naguib, M. et al. (2011). Two-dimensional nanocrystals produced by exfoliation of Ti3AlC2. Adv. Mater. 23, 4248–4253.", "10.1002/adma.201102306"],
    ["Zhang, T. et al. (2024). Delamination of chlorine-terminated MXene produced using molten salt etching. Chem. Mater. 36, 1998–2006.", "10.1021/acs.chemmater.3c02872"],
    ["Li, M. et al. (2019). Element replacement approach by reaction with Lewis acidic molten salts to synthesize nanolaminated MAX phases and MXenes. J. Am. Chem. Soc. 141, 4730–4737.", "10.1021/jacs.9b00574"],
  ];

  // ---------------- steps (v2: confinement is the spine; zoom in from furnace to atoms, then back out) ----------------
  // ladder: 0 reactor·mm · 1 deposit·µm · 2 spherulite·nm–µm · 3 molecules/atoms·Å
  const NEXT = (s) => `<span class="next">Next: ${s}</span>`;
  const STEPS = [
    { id: "exp", ladder: 0, short: "Grow MXene from gases — no MAX precursor, no acid etching.", title: "The vapor-growth experiment", scale: "reactor · mm (schematic)", scene: "reactor",
      cam: [RX + 50, 70, 175], look: [RX, -4, 0], dive: [RX, -6.7, 0],
      text: "Ti₂CCl₂ can be <b>grown from the gas phase</b> instead of being etched out of a MAX phase. Ti powder (or low-cost Ti sponge) sits in the hot zone of a horizontal tube furnace; Ar bubbled through liquid <b>TiCl₄</b> and an Ar/<b>CH₄</b> mixture flow over it at 800–950 °C. The question the paper answers: <b>where</b> does MXene form, and <b>why</b> there?" + NEXT("the answer depends on how the Ti is loaded."),
      facts: [["Precursors", "Ti powder or sponge · TiCl₄ · CH₄ (5% in Ar)"], ["Furnace", "horizontal, 1-inch work tube"], ["Carrier tube", "quartz, 10 mm I.D. × 4 cm"], ["Temperatures studied", "750–1000 °C"], ["Reported optimum", "875 °C (2 h) · 850 °C (24 h)"], ["After growth", "collected without washing"]],
      chart: "program", note: "Set-up and program from the Experimental Section of [1]; gas streams and sizes in the view are schematic. Ti sponge (Kroll process) is reported as nearly 4000× cheaper than high-purity Ti foil [1]. Earlier gas-phase routes: CVD on Ti foil, TiCl₄ + CH₄ at 950 °C [2]; fluidized bed and two-zone furnace at 770 °C [3, 4]; organohalide precursors [5].", refs: [0, 1, 2, 3, 4] },
    { id: "modes", ladder: 0, short: "Same Ti, three loadings — confinement decides where MXene grows.", title: "Change the Ti loading, change the growth", scale: "carrier cross-sections · mm (schematic)", scene: "modes",
      cam: [MD, 22, 250], look: [MD, -10, 0], dive: [MD + 33, 18, 0],
      text: "Three ways of loading the same Ti powder: <b>(a)</b> in a crucible, MXene forms only as a thin carpet with microspheres on the Ti top surface, while the Ti underneath is mostly etched; <b>(b)</b> in a narrow quartz carrier tube, black MXene spherulites deposit on a quartz plate facing the Ti, in addition to MXene on the Ti bed; <b>(c)</b> with Ti spread along the tube wall, the whole volume fills with MXene after 24 h. A quartz plate above a crucible without a carrier tube (control) gets only a Ti film with TiC particles, no MXene on the quartz." + NEXT("why does a smaller volume make the difference?"),
      facts: [["(a) Ti in crucible", "carpet + microspheres on the Ti top surface"], ["(b) carrier tube + quartz", "spherulites on the quartz facing the Ti (within 1 h), plus MXene on the Ti bed"], ["(c) Ti on inner wall", "carrier filled with MXene after 24 h"], ["Control (no carrier tube, quartz above)", "Ti film + TiC particles on the quartz, no MXene there"], ["Explanation", "confinement raises TiClₓ concentration and shortens diffusion"]],
      sem: [["f1b", "Fig. 1b — (a) Ti in crucible: MXene carpet and microspheres on the Ti top surface (circles: fractured microspheres)"], ["f1d", "Fig. 1d — (b) MXene spherulites on the quartz substrate"], ["f1f", "Fig. 1f — (c) Ti on the carrier wall, 24 h: intergrown spherulites"]],
      note: "Redrawn after Figure 1 of [1]; sizes and deposit amounts are schematic. In the open tube, laminar flow carries TiCl₄ near the tube bottom, so in (a) TiClₓ meets CH₄ mainly at the Ti top surface [1].", refs: [0, 1] },
    { id: "supply", ladder: 3, short: "Hot Ti turns TiCl₄ into TiCl₂, which piles up in the small gap.", title: "Confinement builds up TiCl₂ next to the Ti", scale: "gap between Ti and quartz · Å (schematic)", scene: "mol",
      cam: [MX + 30, 30, 84], look: [MX, 14, 0], dive: [MX, 15, 0],
      text: "Zooming into the gap between the Ti powder (bottom) and the quartz plate (top): TiCl₄ attacks hot Ti and, in net terms, <b>Ti + TiCl₄ → 2 TiCl₂</b>. The authors propose TiCl₂ as the <b>chemically privileged intermediate</b>: above ~1002 K the reaction forming TiCl₂ has a more favourable calculated Gibbs free-energy change than the one forming TiCl₃. TiCl₂ has a far lower vapour pressure than TiCl₄/TiCl₃ and travels only a short distance — so it <b>accumulates where the volume is small</b>." + NEXT("what happens once enough TiCl₂ is there?"),
      facts: [["Key intermediate (proposed)", "TiCl₂ (g)"], ["TiCl₂ vs TiCl₃", "TiCl₂ preferred above 1002 K (≈ 729 °C)"], ["TiCl (g)", "strongly uphill — not expected"], ["Equilibrium speciation (cited in [1])", "Ti:TiCl₄ 1:1 or 2:1 favours TiCl₂; 1:3 favours TiCl₃ — but TiCl₄/TiCl₃ remain the predominant gases"], ["Why confinement", "short transport length of TiCl₂; MXene forms only near the Ti source"]],
      eq: "(1) ½ Ti(s) + ½ TiCl₄(g) → TiCl₂(g)<br>(2) ¼ Ti(s) + ¾ TiCl₄(g) → TiCl₃(g)<br>(3) ⅓ Ti(s) + ⅔ TiCl₃(g) → TiCl₂(g)",
      note: "Reactions and the 1002 K crossover as reported in [1] (Gibbs free-energy changes from NIST data / Shomate fits; vapour pressures with TRAGMIN 5.2b). Each TiCl₄ that lands releases two TiCl₂ in the view (net reaction, not an elementary step). Molecule shapes are schematic.", refs: [0, 3] },
    { id: "threshold", ladder: 3, short: "Too little TiCl₂: it falls back to Ti. Enough: MXene nucleates.", title: "Crossing the nucleation threshold", scale: "near the quartz · Å (schematic)", scene: "mol",
      cam: [MX + 30, 30, 90], look: [MX, 15, 0],
      text: "In the proposed picture, while TiCl₂ is still below a threshold it <b>disproportionates back</b> to Ti and TiCl₄ — a thin metallic Ti film appears on the quartz during an incubation period. Once TiCl₂ is <b>locally supersaturated</b>, it reacts with CH₄ and <b>MXene nucleates</b> (centre). Too much carbon activity or heat gives cubic <b>TiC</b> instead." + NEXT("how a nucleus grows into a sheet."),
      facts: [["Below threshold", "TiCl₂ → Ti film + TiCl₄ (incubation)"], ["Above threshold + CH₄", "Ti₂CCl₂ nucleates"], ["High CH₄ or T", "cubic TiC from any Ti species"], ["Design rule", "keep Cl activity high vs. C"], ["Threshold value", "not given numerically in [1]"]],
      eq: "2 TiCl₂(g) → Ti(s) + TiCl₄(g)<br><span style='color:#5d6472'>(balanced form of the disproportionation described in [1])</span>",
      chart: "route", note: "Route redrawn after Figure 2a of [1]. Evidence for the TiCl₂ role given there: MXene forms only near the Ti source, a metallic Ti layer appears near the source, a 1:1 TiCl₄–Ti collision is simpler than the TiCl₃ route, and heated TiCl₃ disproportionates to TiCl₄ + TiCl₂.", refs: [0] },
    { id: "growth", ladder: 3, short: "Proposed growth picture: TiCl₂ + methane → a Cl-capped 2D crystal, plus HCl.", title: "A nucleus grows by edge addition", scale: "nucleus · Å (schematic)", scene: "mol",
      cam: [MX + 14, 50, 50], look: [MX, 13, 0], dive: [MX, 15, 0],
      text: "TiCl₂ reacts with methane and releases <b>HCl</b>. The authors' picture: units of Cl–Ti–C–Ti–Cl add at the flake edge; two extra H atoms cap the edge carbon and leave when the next unit arrives. Close-packed in-plane assembly gives a <b>hexagonal sheet with Cl on both faces</b> — carbon goes from tetrahedral (CH₄) to octahedral (Ti₆C). The surface Ti–Cl bonds survive instead of reacting on to TiC." + NEXT("what the finished crystal looks like."),
      facts: [["Overall-reaction byproducts", "HCl (H₂ as simplified bookkeeping)"], ["Carbon", "tetrahedral (CH₄) → octahedral (Ti₆C)"], ["Surface", "Cl termination"], ["Status", "hypothesized; authors call for computational verification"]],
      eq: "(4) 2 TiCl₂(g) + CH₄(g) → Ti₂CCl₂(s) + 2 HCl(g) + H₂(g)",
      chart: "window", note: "The edge-growth animation illustrates the mechanism proposed in [1]; it is not a simulation. H₂ in reaction (4) is a simplified byproduct for the two excess H atoms [1]. Chart: products of 2 h runs on quartz, from XRD (Fig. 2e of [1]); not shown as bars: bcc-Ti remaining at 1000 °C and yellow TiC₁₋ₓ at the substrate edge at 750–770 °C.", refs: [0] },
    { id: "crystal", ladder: 3, short: "Five atomic planes: Cl–Ti–C–Ti–Cl.", title: "The crystal: the thinnest slice of TiC, capped with Cl", scale: "atomic · Å", scene: "crystal",
      cam: [34, 26, 78], look: [0, D, 0], dive: [0, D, 0],
      text: "Each flake has five atomic planes: <b>Cl–Ti–C–Ti–Cl</b>. From HAADF-STEM and HRTEM, the stacking is described as Cl(A)–Ti(B)–C–Ti(A)–Cl(B); across the Cl–Cl van der Waals gap the next Cl layer sits in the hollows, giving an fcc-like sequence — like a (111) slice of rock-salt TiC with the maximum Cl termination. Stacked flakes are <b>coherently aligned</b> — unlike MAX-derived MXenes, which often show alternating in-plane orientations because A-element layers act as twin boundaries." + NEXT("zoom back out — flakes do not grow alone."),
      facts: [["Formula", "Ti₂CCl₂ (M₂X, Tₓ = Cl)"], ["a (from XRD (100), (110))", "≈ 3.20 Å"], ["(002) at 2θ ≈ 10.5°", "interlayer repeat d ≈ 8.4 Å"], ["Raman", "143 (Eg), 226 (Ag) · 430 cm⁻¹ (Cl mode)"], ["Thermal (TGA, Ar)", "stable to ~900 °C · onset 962 °C"]],
      chart: "xrd", note: "a and d were computed here from the peak positions reported in [1] (Cu Kα 1.5406 Å). Vertical distances inside a flake are approximate (Ti–Ti from the TiC (111) spacing, Ti–Cl height assumed). Plane registry follows the description in [1]; the C site label and full ABC continuity across gaps are inferred here from rock-salt TiC geometry (the paper names A and B only). Three flakes shown.", refs: [0] },
    { id: "sph", ladder: 2, short: "Flakes sprout from each nucleus into a ball: a spherulite.", title: "Lamellae organise into spherulites", scale: "nm–µm (schematic, not to scale)", scene: "meso",
      cam: [MZ + 6, 30, 235], look: [MZ, 2, 0],
      text: "Flakes do not grow as one sheet. Each nucleus sprouts lamellae (likely a few layers thick) in many directions, forming a <b>spherulite</b> — a ball of flakes whose lateral size approaches its radius. At 950 °C (left to right): tiny particle aggregates first, <b>~300 nm</b> spherulites after 2 h, <b>2–3 µm</b> after 24 h. With time they open up and flake edges turn toward the incoming TiCl₂/CH₄ flux." + NEXT("many spherulites meet."),
      facts: [["Early stage", "tiny particle aggregates (size not stated)"], ["2 h (950 °C)", "~300 nm diameter"], ["24 h (950 °C)", "2–3 µm"], ["Flakes", "likely few layers; edge ≈ spherulite radius"], ["Similar to", "MoS₂ / MoSe₂ spherulites"]],
      sem: [["f2f", "Fig. 2f — early stage: tiny particle aggregates (950 °C)"], ["f2g", "Fig. 2g — after 2 h: ~300 nm spherulites"], ["f2h", "Fig. 2h — after 24 h: larger spherulites (note the 500 nm scale bar)"]],
      chart: "size", note: "Schematic; the three stages are not drawn to scale and the animation compresses 24 h. SEM evidence: Figure 2f–h of [1]. Note: 24 h powder grown at 950 °C is TiC-dominated (Fig. 3b of [1]); 850 °C is the reported 24 h optimum.", refs: [0] },
    { id: "merge", ladder: 1, short: "Spherulites merge and fill the tube — but long runs grow TiC.", title: "Merging, filling — and the TiC limit", scale: "µm (schematic)", scene: "meso",
      cam: [MZ + 70, 110, 300], look: [MZ, 0, 0],
      text: "Neighbouring spherulites expand and <b>merge</b>; with Ti on the carrier wall the tube fills with bulk MXene after 24 h, in swirl-like domains with flakes tens of micrometres across. The network is mesoporous: <b>44.7 m²/g</b> for bulk powder, <b>361 m²/g</b> for small spherulites. But longer and hotter is not simply better: long runs also grow cubic <b>TiC</b>, likely in spherulite cores where TiCl₂ runs short (cut-away, front)." + NEXT("where this route could go."),
      facts: [["24 h, Ti on tube wall", "tube volume filled with MXene"], ["BET surface area", "44.7 m²/g (bulk) · 361 m²/g (small spherulites)"], ["Pore volume (QSDFT)", "0.12 · 0.71 cm³/g"], ["24 h optimum", "850 °C (840 °C: lower yield; 950 °C: TiC-dominated)"], ["TiC", "screened out during delamination"]],
      sem: [["f3a", "Fig. 3a — bulk Ti₂CCl₂ from lateral growth in a confined volume: swirl-like merged domains"]],
      chart: "window", note: "Values as reported in [1] (Fig. 3, Fig. S14). The TiC core is the authors' suggested location, drawn schematically. They suggest flat crystals or slightly higher Cl activity to avoid TiC completely.", refs: [0] },
    { id: "future", ladder: 3, short: "Next goal: large, flat single flakes — not yet achieved.", title: "Toward larger single crystals", scale: "atomic · Å (future target)", scene: "crystal",
      cam: [26, 24, 60], look: [0, -1, 0],
      text: "The vapor route skips the MAX phase, fluoride etchants and washing, and gives <b>Cl-terminated</b> Ti₂CCl₂ (supported by Raman, EDS and atomic imaging) and coherently stacked crystals. The powder can still be delaminated (Li⁺ via LiCl or n-butyllithium, ~10% yield, dispersed in NMF) with an unchanged Raman spectrum. The stated next goal: <b>lower the steady-state TiCl₂</b> to suppress secondary nucleation while keeping lateral growth — toward wafer-scale single flakes for electronics and quantum devices. The flat flake shown is that <b>future target</b>.",
      facts: [["Precursor (for Ti₂C)", "MAX route: Ti₂AlC · vapor route: Ti, TiCl₄, CH₄"], ["Chemistry", "fluoride-containing acids or Lewis-acid molten salts · gas-phase reaction, no etchant"], ["Terminations", "mixed –O/–OH/–F (aqueous fluoride routes) · –Cl (Raman, EDS, STEM)"], ["Stacking", "often inherited orientation alternation · coherent alignment observed here"], ["Delamination", "~10% yield (LiCl or n-BuLi), NMF"]],
      note: "Comparison summarised from [1] and the general MXene literature [6, 8]; thermal-stability figures cited in [1]: O/OH/F-terminated Ti₂CTₓ ~700 °C vs. vapor-grown Ti₂CCl₂ onset 962 °C. The single flat flake shown here is the stated goal, <b>not a reported result</b>. Top-down references: HF etching [6]; Lewis-acid molten salts giving –Cl terminations [8]; delamination of Cl-terminated MXene [7].", refs: [0, 5, 6, 7] },
  ];
  const LADDER = ["reactor · mm", "deposit · µm", "spherulite · nm–µm", "molecules · Å"];

  // ---------------- charts (inline SVG, schematic) ----------------
  const T = (x, y, s, o) => `<text x="${x}" y="${y}" font-size="${(o && o.fs) || 9}" fill="${(o && o.c) || "#555"}" text-anchor="${(o && o.a) || "start"}"${o && o.w ? ' font-weight="700"' : ""}>${s}</text>`;
  function program() {
    // time axis is schematic; temperatures are from [1]
    const y = (C) => 140 - (C - 20) * 0.12;
    let s = `<svg viewBox="0 0 300 175"><line x1="30" y1="140" x2="292" y2="140" stroke="#999"/><line x1="30" y1="140" x2="30" y2="14" stroke="#999"/>`;
    s += `<rect x="128" y="20" width="110" height="120" fill="#e3f2ee"/>`;
    s += `<path d="M30 ${y(20)} L80 ${y(800)} L88 ${y(800)} L128 ${y(875)} L238 ${y(875)} L262 ${y(120)} L292 ${y(40)}" fill="none" stroke="#1f7a68" stroke-width="2"/>`;
    s += T(52, y(800) + 22, "30 °C/min → 800 °C, 2 min", { fs: 8.5 }) + T(92, y(875) - 6, "10 °C/min", { fs: 8.5 });
    s += T(183, 36, "TiCl₄ + CH₄ on", { a: "middle", c: "#1f7a68", w: 1 }) + T(183, 49, "hold 2–24 h at target", { a: "middle", fs: 8.5 });
    s += T(250, 112, "lid opened:", { fs: 8.5 }) + T(250, 123, "rapid cooling", { fs: 8.5 });
    s += T(26, y(875) + 3, "target", { a: "end", fs: 8 }) + T(26, y(20) + 3, "RT", { a: "end", fs: 8 });
    s += T(160, 160, "time → (schematic)", { a: "middle", fs: 9.5, c: "#666" }) + T(34, 12, "temperature program and gas switching [1]", { c: "#888" });
    return s + "</svg>";
  }
  function route() {
    const box = (x, y, w, t, col) => `<rect x="${x}" y="${y}" width="${w}" height="22" rx="5" fill="#fff" stroke="${col}" stroke-width="1.5"/>` + T(x + w / 2, y + 15, t, { a: "middle", fs: 9.5, c: "#1d2129" });
    const arr = (x1, y1, x2, y2, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="1.8" marker-end="url(#ah)"/>`;
    let s = `<svg viewBox="0 0 300 175"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#555"/></marker></defs>`;
    s += box(8, 74, 78, "Ti + TiCl₄", "#c0392b") + arr(86, 85, 116, 85, "#c0392b") + box(118, 74, 56, "TiCl₂", "#c0392b");
    s += arr(174, 80, 206, 34, "#1f7a68") + box(206, 22, 88, "Ti₂CCl₂ MXene", "#1f7a68") + T(118, 42, "+ CH₄, above", { fs: 8, c: "#1f7a68" }) + T(118, 52, "threshold", { fs: 8, c: "#1f7a68" });
    s += arr(174, 90, 206, 136, "#2e6db4") + box(206, 128, 88, "Ti + TiCl₄", "#2e6db4") + T(112, 126, "below threshold:", { fs: 8, c: "#2e6db4" }) + T(112, 136, "disproportionation", { fs: 8, c: "#2e6db4" });
    s += `<line x1="250" y1="46" x2="250" y2="124" stroke="#888" stroke-dasharray="3 3"/>` + T(256, 82, "TiC", { fs: 10, w: 1, c: "#666" }) + T(256, 94, "high C or T", { fs: 7.5, c: "#666" });
    s += T(8, 14, "reaction route, redrawn after Fig. 2a of [1]", { c: "#888" });
    return s + "</svg>";
  }
  function window_() {
    const X = (C) => 40 + (C - 750) * (250 / 260);
    let s = `<svg viewBox="0 0 300 175"><line x1="40" y1="128" x2="292" y2="128" stroke="#999"/>`;
    [750, 800, 850, 900, 950, 1000].forEach((C) => (s += `<line x1="${X(C)}" y1="128" x2="${X(C)}" y2="132" stroke="#999"/>` + T(X(C), 143, C, { a: "middle", fs: 8.5, c: "#666" })));
    const bar = (y, c1, c2, col, lab) => `<rect x="${X(c1)}" y="${y}" width="${X(c2) - X(c1)}" height="16" rx="3" fill="${col}"/>` + T(X(c1) - 4, y + 12, lab, { a: "end", fs: 8.5 });
    s += bar(28, 750, 900, "#b9c0cc", "Ti film");
    s += bar(58, 800, 950, "#3fbf9a", "Ti₂CCl₂");
    s += bar(88, 900, 1000, "#7a7a7a", "TiC");
    s += `<line x1="${X(875)}" y1="22" x2="${X(875)}" y2="112" stroke="#1d2129" stroke-dasharray="3 3"/>` + T(X(875) + 3, 20, "875 °C best (2 h)", { fs: 8.5, w: 1 });
    s += T(X(1000) - 2, 70, "gone at 1000", { a: "end", fs: 7.5, c: "#1d2129" });
    s += T(166, 160, "reported XRD detection ranges, 2 h on quartz — not phase boundaries", { a: "middle", fs: 8.5, c: "#666" });
    return s + "</svg>";
  }
  function xrd() {
    const X = (tt) => 30 + (tt - 5) * (262 / 60);   // 5°..65°
    const pk = (x0, h, col, dash, w) => { let d = ""; for (let i = 0; i <= 300; i++) { const tt = 5 + i * 60 / 300; const yy = h * Math.exp(-Math.pow((tt - x0) / (w || 0.35), 2)); d += (i ? "L" : "M") + X(tt).toFixed(1) + " " + (128 - yy).toFixed(1); } return `<path d="${d}" fill="none" stroke="${col}" stroke-width="1.6" ${dash ? 'stroke-dasharray="3 2"' : ""}/>`; };
    let s = `<svg viewBox="0 0 300 175"><line x1="30" y1="128" x2="292" y2="128" stroke="#999"/>`;
    [10, 20, 30, 40, 50, 60].forEach((t) => (s += `<line x1="${X(t)}" y1="128" x2="${X(t)}" y2="132" stroke="#999"/>` + T(X(t), 143, t, { a: "middle", fs: 8.5, c: "#666" })));
    [[10.5, 95, "(002)"], [20.8, 38, "(004)"], [32.3, 30, "(100)"], [57.4, 22, "(110)"]].forEach(([p, h, l]) => (s += pk(p, h, "#1f7a68") + T(X(p), 122 - h, l, { a: "middle", fs: 8 })));
    [[36.8, 26], [41.4, 30], [61.8, 18]].forEach(([p, h]) => (s += pk(p, h, "#999", true)));
    s += T(X(41.4), 90, "TiC (≥ 900 °C)", { a: "middle", fs: 8, c: "#888" });
    s += T(160, 160, "2θ (°), Cu Kα — positions from [1]; heights schematic", { a: "middle", fs: 9, c: "#666" });
    return s + "</svg>";
  }
  function size() {
    const X = (nm) => 40 + Math.log10(nm / 50) * (250 / Math.log10(4000 / 50));
    let s = `<svg viewBox="0 0 300 175"><line x1="40" y1="128" x2="292" y2="128" stroke="#999"/>`;
    [100, 300, 1000, 3000].forEach((nm) => (s += `<line x1="${X(nm)}" y1="128" x2="${X(nm)}" y2="132" stroke="#999"/>` + T(X(nm), 143, nm >= 1000 ? nm / 1000 + " µm" : nm + " nm", { a: "middle", fs: 8.5, c: "#666" })));
    s += `<circle cx="${X(300)}" cy="78" r="6" fill="#3fbf9a"/>` + T(X(300) + 10, 82, "2 h: ~300 nm", { fs: 9 });
    s += `<rect x="${X(2000)}" y="98" width="${X(3000) - X(2000)}" height="12" rx="3" fill="#1f7a68"/>` + T(X(2000) - 6, 108, "24 h: 2–3 µm", { a: "end", fs: 9 });
    s += T(44, 34, "early: tiny particle aggregates (size not stated)", { fs: 8.5, c: "#666" });
    s += T(166, 160, "spherulite diameter at 950 °C (log scale) [1]", { a: "middle", fs: 9, c: "#666" });
    return s + "</svg>";
  }
  const CH = { program, route, window: window_, xrd, size };

  // ---------------- three.js basics ----------------
  const host = document.getElementById("view");
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.outputEncoding = THREE.sRGBEncoding;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f4f6f6");
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 8000);
  scene.add(new THREE.HemisphereLight("#ffffff", "#b4b9b2", 1.0));
  const key = new THREE.DirectionalLight("#ffffff", 0.9); key.position.set(30, 60, 40); scene.add(key);
  const fill = new THREE.DirectionalLight("#ffffff", 0.35); fill.position.set(-40, 10, -20); scene.add(fill);
  const ctl = new THREE.OrbitControls(cam, renderer.domElement);
  ctl.enableDamping = true;

  const mat = (col, o) => new THREE.MeshStandardMaterial(Object.assign({ color: col, roughness: 0.45, metalness: 0.08 }, o || {}));
  const MATS = { Ti: mat(COL.Ti, { metalness: 0.35, roughness: 0.35 }), C: mat(COL.C), Cl: mat(COL.Cl), H: mat(COL.H), Tip: mat(COL.Tip, { metalness: 0.4, roughness: 0.5 }), Mx: mat("#1b1d22", { roughness: 0.7 }), TiC: mat("#b08d57", { metalness: 0.3, roughness: 0.45 }) };
  const SPH = new THREE.SphereGeometry(1, 20, 14);
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function ball(el, x, y, z, parent, r) { const m = new THREE.Mesh(SPH, MATS[el]); m.scale.setScalar(r || RAD[el]); m.position.set(x, y, z); parent.add(m); return m; }
  function inst(el, pts, parent, matOverride, r) {
    const im = new THREE.InstancedMesh(SPH, matOverride || MATS[el], pts.length), m = new THREE.Matrix4(), rr = r || RAD[el];
    pts.forEach((p, i) => { const s = p[3] || rr; m.makeScale(s, s, s).setPosition(p[0], p[1], p[2]); im.setMatrixAt(i, m); });
    parent.add(im); return im;
  }
  function label(text, size) {
    const cv = document.createElement("canvas"), g = cv.getContext("2d");
    const font = "600 40px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    g.font = font; const w = Math.ceil(g.measureText(text).width) + 36; cv.width = w; cv.height = 64;
    g.font = font; g.fillStyle = "rgba(255,255,255,.92)"; g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 2;
    g.beginPath(); g.roundRect(1, 1, w - 2, 62, 14); g.fill(); g.stroke();
    g.fillStyle = "#1d2129"; g.textBaseline = "middle"; g.fillText(text, 18, 34);
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    const s = size || 1.4; sp.scale.set(s * w / 64, s, 1); sp.renderOrder = 10; return sp;
  }
  function fade(obj, al) {
    obj.traverse((o) => { if (o.material && !o.isSprite) { o.material.transparent = al < 0.999; o.material.opacity = al; } });
    obj.visible = al > 0.01;
  }
  const LAB = []; // [sprite, ids[]]
  function addLab(text, size, pos, ids) { const s = label(text, size); s.position.set(...pos); scene.add(s); LAB.push([s, ids]); return s; }
  const glassMat = (op) => new THREE.MeshPhysicalMaterial({ color: "#c8dbe6", transparent: true, opacity: op, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false });
  const xTube = (r, len, op) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 40, 1, true), glassMat(op)); m.rotation.z = Math.PI / 2; return m; };

  // ---------------- molecules ----------------
  const TET = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => v.map((q) => q / Math.sqrt(3)));
  function mTiCl4() { const g = new THREE.Group(); ball("Ti", 0, 0, 0, g); TET.forEach((d) => ball("Cl", d[0] * 2.17, d[1] * 2.17, d[2] * 2.17, g)); return g; }
  function mTiCl2() { const g = new THREE.Group(); ball("Ti", 0, 0, 0, g); ball("Cl", 2.2, 0, 0, g); ball("Cl", -2.2, 0, 0, g); return g; }
  function mCH4() { const g = new THREE.Group(); ball("C", 0, 0, 0, g); TET.forEach((d) => ball("H", d[0] * 1.09, d[1] * 1.09, d[2] * 1.09, g)); return g; }
  function mHCl() { const g = new THREE.Group(); ball("Cl", 0, 0, 0, g); ball("H", 1.27, 0, 0, g); return g; }

  // ================= scene: crystal (origin, Å) =================
  const crystal = new THREE.Group(); scene.add(crystal);
  const PLANES = ["Cl", "Ti", "C", "Ti", "Cl"], HGT = [-hCl, -hTi, 0, hTi, hCl];
  const flakes = [];
  for (let k = 0; k < 3; k++) {
    const g = new THREE.Group(); g.userData.base = k * D; crystal.add(g);
    const s0 = (5 * k) % 3;    // continuous ABC… across the Cl–Cl gap (fcc-like); flake 0 = Cl(A) Ti(B) C(C) Ti(A) Cl(B); C(C) inferred from rock-salt geometry
    const own = { Ti: MATS.Ti.clone(), C: MATS.C.clone(), Cl: MATS.Cl.clone() };
    PLANES.forEach((el, i) => {
      const st = SITE[ABC[(s0 + i) % 3]], pts = [];
      for (let u = 0; u < N; u++) for (let v = 0; v < N; v++) { const [x, z] = xyA(a, N, u + st[0], v + st[1]); pts.push([x, HGT[i], z]); }
      inst(el, pts, g, own[el]);
    });
    flakes.push(g);
  }
  const wafer = new THREE.Mesh(new THREE.CylinderGeometry(19, 19, 1.2, 64), new THREE.MeshPhysicalMaterial({ color: "#c8dbe6", transparent: true, opacity: 0.6, roughness: 0.1 }));
  wafer.position.y = -hCl - 2.6; crystal.add(wafer);
  const gapBar = new THREE.Group(); crystal.add(gapBar);
  { const pts = [-11, 0, -9, -11, D, -9, -12, 0, -9, -10, 0, -9, -12, D, -9, -10, D, -9]; const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); gapBar.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: "#1f7a68" }))); }
  addLab("Cl–Ti–C–Ti–Cl flake", 1.3, [-15, 0, 0], ["crystal"]);
  addLab("Cl···Cl van der Waals gap", 1.2, [12, D / 2, 6], ["crystal"]);
  addLab("d ≈ 8.4 Å", 1.2, [-15, D / 2, -9], ["crystal"]);
  addLab("FUTURE TARGET — wafer-scale single flake (not yet achieved)", 1.2, [0, hCl + 4.5, 0], ["future"]);
  addLab("Cl", 1.1, [9.5, hCl, 0], ["future"]);
  addLab("Ti₂C core", 1.1, [9.5, 0, 0], ["future"]);

  // ================= scene: molecules (MX, Å) — the gap between Ti and quartz =================
  const molG = new THREE.Group(); molG.position.set(MX, 0, 0); scene.add(molG);
  const aTi = 2.95, NS = 8;
  const surf = new THREE.Group(); molG.add(surf);
  [["A", 0], ["B", -2.34]].forEach(([st, y]) => { const pts = []; for (let u = 0; u < NS; u++) for (let v = 0; v < NS; v++) { const [x, z] = xyA(aTi, NS, u + SITE[st][0], v + SITE[st][1]); pts.push([x, y, z]); } inst("Ti", pts, surf); });
  const quartz = new THREE.Mesh(new THREE.BoxGeometry(30, 1.2, 26), glassMat(0.55));
  quartz.position.y = 30; molG.add(quartz);
  const tiFilm = new THREE.Group(); molG.add(tiFilm);
  { const R0 = rng(9), pts = []; for (let i = 0; i < 70; i++) pts.push([(R0() - 0.5) * 26, 28.8, (R0() - 0.5) * 22]); inst("Ti", pts, tiFilm); }
  const MR = rng(31);
  const cyc = [];   // net Ti + TiCl4 -> 2 TiCl2: one TiCl4 lands, two TiCl2 leave
  for (let i = 0; i < 12; i++) { const a4 = mTiCl4(), a2 = mTiCl2(), a2b = mTiCl2(); molG.add(a4); molG.add(a2); molG.add(a2b); cyc.push({ a4, a2, a2b, x: (MR() - 0.5) * 18, z: (MR() - 0.5) * 16, dx: (MR() - 0.5) * 10, dz: (MR() - 0.5) * 8, ph: MR(), rot: MR() * 6 }); }
  const drift = [];
  for (let i = 0; i < 26; i++) { const isTi = i < 18; const m = isTi ? mTiCl2() : mCH4(); molG.add(m); drift.push({ m, isTi, x: (MR() - 0.5) * 24, y: 7 + MR() * 19, z: (MR() - 0.5) * 18, ph: MR() * 6.28, sp: 0.4 + MR() * 0.6 }); }
  const grow = new THREE.Group(); grow.position.y = 15; molG.add(grow);
  const cells = [];
  { const NG = 13;
    for (let u = 0; u < NG; u++) for (let v = 0; v < NG; v++) {
      const [x0, z0] = xyA(a, NG, u, v), r = Math.hypot(x0, z0); if (r > 17) continue;
      const g = new THREE.Group(); grow.add(g);
      PLANES.forEach((el, i) => { const st = SITE[ABC[i % 3]]; const [x, z] = xyA(a, NG, u + st[0], v + st[1]); ball(el, x, HGT[i] * 0.85, z, g); });
      cells.push({ g, r });
    } }
  cells.sort((p, q) => p.r - q.r);
  const hcl = [];
  for (let i = 0; i < 8; i++) { const m = mHCl(); molG.add(m); hcl.push({ m, ang: MR() * 6.28, ph: MR() }); }
  addLab("quartz wall, close by (confined)", 1.3, [MX, 33.5, 0], ["supply"]);
  addLab("hot Ti powder surface", 1.3, [MX - 16, -1, 10], ["supply"]);
  addLab("TiCl₄ lands → 2 TiCl₂ leave", 1.3, [MX + 12, 24, 0], ["supply"]);
  addLab("quartz: thin Ti film during incubation", 1.3, [MX, 33.5, 0], ["threshold"]);
  addLab("TiCl₂ + CH₄ (gas)", 1.3, [MX - 14, 8, 8], ["threshold"]);
  const nucLab = addLab("supersaturated → nucleus (proposed mechanism)", 1.3, [MX + 2, 20, 0], ["threshold"]);
  addLab("growing Ti₂CCl₂ edge (proposed mechanism)", 1.3, [MX, 21, 0], ["growth"]);
  addLab("HCl leaves", 1.3, [MX + 22, 17, -4], ["growth"]);

  // ================= scene: reactor (RX, mm) =================
  const reactor = new THREE.Group(); reactor.position.set(RX, 0, 0); scene.add(reactor);
  reactor.add(xTube(12.7, 170, 0.22));
  const furnace = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 90, 40, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: "#d98c5f", transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }));
  furnace.rotation.z = Math.PI / 2; reactor.add(furnace);
  const heatMat = new THREE.MeshStandardMaterial({ color: "#ff8a3d", emissive: new THREE.Color("#ff6a1a"), emissiveIntensity: 0.9 });
  [[0, 19], [0, -19]].forEach(([z, y]) => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 84, 12), heatMat); h.rotation.z = Math.PI / 2; h.position.set(0, y, z); reactor.add(h); });
  const carrier = xTube(6, 40, 0.38); carrier.position.y = -6.7; reactor.add(carrier);
  { const R1 = rng(3), pts = []; for (let i = 0; i < 520; i++) { const x = (R1() - 0.5) * 38, th = R1() * Math.PI * 2; pts.push([x, -6.7 + Math.cos(th) * 4.7, Math.sin(th) * 4.7]); } inst("Tip", pts, reactor, null, 0.42); }
  const gas = [];
  { const R2 = rng(77); for (let i = 0; i < 90; i++) { const kind = i % 3; const m = new THREE.Mesh(SPH, new THREE.MeshBasicMaterial({ color: ["#3fbf9a", "#2e6db4", "#e8b44a"][kind] })); m.scale.setScalar(0.7); reactor.add(m); gas.push({ m, kind, s: R2(), y: (R2() - 0.5) * 18, z: (R2() - 0.5) * 18 }); } }
  addLab("horizontal tube furnace (1-inch work tube)", 3.4, [RX, 32, 0], ["exp"]);
  addLab("quartz carrier tube + Ti powder (hot zone)", 3.2, [RX - 4, -21, 10], ["exp"]);
  addLab("Ar + TiCl₄ (teal) · Ar/CH₄ (blue) →", 3.0, [RX - 44, 26, 0], ["exp"]);
  addLab("→ exhaust (net products: HCl, H₂)", 3.0, [RX + 30, -30, 0], ["exp"]);

  // ================= scene: three Ti loading modes + control (MD, mm) =================
  const modes = new THREE.Group(); modes.position.set(MD, 0, 0); scene.add(modes);
  const MODE_XY = [[-33, 22], [33, 22], [-33, -22], [33, -22]];   // 2 × 2 grid
  const crucMat = mat("#e9e5dc", { roughness: 0.8 });
  const grows = [];   // deposits that appear over time: {obj, t0}
  function crucible(g) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 10), crucMat); base.position.y = -10.5; g.add(base);
    [[-7.5, 0], [7.5, 0]].forEach(([x]) => { const w = new THREE.Mesh(new THREE.BoxGeometry(1, 6, 10), crucMat); w.position.set(x, -7.5, 0); g.add(w); });
    const back = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 1), crucMat); back.position.set(0, -7.5, -4.5); g.add(back);
    const R5 = rng(41), pts = []; for (let i = 0; i < 260; i++) pts.push([(R5() - 0.5) * 13.5, -9.6 + R5() * 4.4, (R5() - 0.5) * 8]); inst("Tip", pts, g, null, 0.5);
  }
  const ringMat = new THREE.MeshBasicMaterial({ color: "#6c8ea3" });
  const rings = (g, x0, y0, r) => [-15, 15].forEach((dx) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.18, 6, 40), ringMat); m.rotation.y = Math.PI / 2; m.position.set(x0 + dx, y0, 0); g.add(m); });
  MODE_XY.forEach(([x, y], i) => {
    const g = new THREE.Group(); g.position.set(x, y, 0); modes.add(g);
    g.add(xTube(12.7, 34, 0.16));
    if (i === 0) {           // (a) crucible: carpet + microspheres on top surface of Ti
      crucible(g);
      const carpet = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.5, 8), MATS.Mx); carpet.position.y = -4.9; g.add(carpet); grows.push({ obj: carpet, t0: 0.5, sy: true });
      const R6 = rng(5), pts = []; for (let k = 0; k < 9; k++) pts.push([(R6() - 0.5) * 12, -4.3, (R6() - 0.5) * 7, 0.5 + R6() * 0.6]);
      const ms = inst("Mx", pts, g); grows.push({ obj: ms, t0: 1.5 });
    } else if (i === 1) {    // (b) carrier + Ti bed + quartz plate above: spherulites on the face toward Ti
      const c = xTube(6, 30, 0.5); c.position.y = -6.7; g.add(c); rings(g, 0, -6.7, 6);
      const R7 = rng(7), pts = []; for (let k = 0; k < 300; k++) { const x0 = (R7() - 0.5) * 28, zz = -4 + R7() * 6, yy = -11.6 + R7() * 2.2; pts.push([x0, yy, zz]); } inst("Tip", pts, g, null, 0.5);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.5, 6.5), glassMat(0.75)); plate.position.set(0, -5.2, 0); g.add(plate);
      const R8 = rng(8), sp = []; for (let k = 0; k < 60; k++) sp.push([(R8() - 0.5) * 9, -5.9 - R8() * 0.4, (R8() - 0.5) * 6, 0.45 + R8() * 0.35]);
      const dots = inst("Mx", sp, g); grows.push({ obj: dots, t0: 0.8 });
      const bed = new THREE.Mesh(new THREE.BoxGeometry(27, 0.4, 6), MATS.Mx); bed.position.y = -9.2; g.add(bed); grows.push({ obj: bed, t0: 0.6, sy: true });
    } else if (i === 2) {    // (c) Ti on inner wall: the volume fills with MXene after 24 h
      const c = xTube(6, 30, 0.5); c.position.y = -6.7; g.add(c); rings(g, 0, -6.7, 6);
      const R9 = rng(9), pts = []; for (let k = 0; k < 420; k++) { const x0 = (R9() - 0.5) * 28, th = Math.PI * (0.5 + R9()); pts.push([x0, -6.7 + Math.cos(th) * 5.2, Math.sin(th) * 5.2]); } inst("Tip", pts, g, null, 0.45);   // back half only (cut-away view)
      const fillG = new THREE.Group(); g.add(fillG);
      const R10 = rng(10); for (let k = 0; k < 220; k++) { const x0 = (R10() - 0.5) * 27, th = R10() * 6.283, r = Math.sqrt(R10()) * 4.3; const m = new THREE.Mesh(SPH, MATS.Mx); m.scale.setScalar(0.55 + R10() * 0.35); m.position.set(x0, -6.7 + Math.cos(th) * r, Math.sin(th) * r); m.userData.order = r; fillG.add(m); }
      fillG.children.sort((p, q) => q.userData.order - p.userData.order);
      grows.push({ obj: fillG, t0: 0.8, fill: true });
    } else {                 // control: open crucible with a quartz plate above → Ti film + TiC, no MXene
      crucible(g);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 8), glassMat(0.75)); plate.position.set(0, 1.5, 0); g.add(plate);
      const film = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.18, 7.6), MATS.Ti); film.position.set(0, 1.15, 0); g.add(film); grows.push({ obj: film, t0: 0.6 });
      const R11 = rng(11), tc = []; for (let k = 0; k < 10; k++) tc.push([(R11() - 0.5) * 10, 0.85, (R11() - 0.5) * 6.5, 0.3 + R11() * 0.2]);
      const tic = inst("TiC", tc, g); grows.push({ obj: tic, t0: 1.6 });
    }
  });
  [["(a) Ti in crucible", "MXene carpet + microspheres on Ti top"], ["(b) carrier tube + quartz plate", "MXene on facing quartz + on Ti bed"], ["(c) Ti on carrier wall (front cut away)", "24 h: carrier filled with MXene"], ["control: no carrier tube, quartz above", "quartz: Ti film + TiC, no MXene"]]
    .forEach(([t1, t2], i) => { const [x, y] = MODE_XY[i]; addLab(t1, 3.4, [MD + x, y + 15, 0], ["modes"]); addLab(t2, 3.0, [MD + x, y - 17, 0], ["modes"]); });

  // ================= scene: spherulites (MZ, schematic) =================
  const meso = new THREE.Group(); meso.position.set(MZ, 0, 0); scene.add(meso);
  // curved hexagonal lamella ("petal"): flat hexagon bent slightly, light metallic grey
  const PET = (() => { const g = new THREE.RingGeometry(0.001, 1, 6, 5);   // hexagonal outline, radially subdivided so it can bend
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.28 * (x * x) - 0.1 * y * y); } g.computeVertexNormals(); return g; })();
  const petMat = mat("#b9bfca", { metalness: 0.3, roughness: 0.38, side: THREE.DoubleSide });
  function spherulite(seed, nf, parent, cut) {
    const g = new THREE.Group(), R3 = rng(seed);
    for (let i = 0; i < nf; i++) {
      const u = R3() * 2 - 1, th = R3() * 6.283, r = Math.sqrt(1 - u * u);
      const dir = new THREE.Vector3(r * Math.cos(th), u, r * Math.sin(th));
      const side = new THREE.Vector3(R3() - 0.5, R3() - 0.5, R3() - 0.5);
      if (cut && dir.z > 0.05) continue;   // cut-away: remove the front half
      const nrm = new THREE.Vector3().crossVectors(dir, side).normalize();   // lamella plane contains the radial direction
      const yax = new THREE.Vector3().crossVectors(nrm, dir).normalize();
      const m = new THREE.Mesh(PET, petMat);
      m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir, yax, nrm));   // long axis along the radius
      const s = 0.5 + R3() * 0.08; m.scale.set(s, s * (0.45 + R3() * 0.2), s); m.position.copy(dir.clone().multiplyScalar(0.5));   // sheet runs from the nucleus to ≈ the radius
      g.add(m);
    }
    (parent || meso).add(g); return g;
  }
  function aggregate(seed) { const g = new THREE.Group(), R = rng(seed); for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(SPH, petMat); m.scale.setScalar(0.18 + R() * 0.12); m.position.set((R() - 0.5) * 0.9, (R() - 0.5) * 0.9, (R() - 0.5) * 0.9); g.add(m); } meso.add(g); return g; }
  const ROW = [{ obj: aggregate(3), x: -62, r: 6 }, { obj: spherulite(11, 130), x: -22, r: 13 }, { obj: spherulite(12, 220), x: 38, r: 24 }];
  ROW.forEach((o) => (o.obj.position.x = o.x));
  addLab("early: tiny aggregates", 3.2, [MZ - 54, -20, 0], ["sph"]);
  addLab("~2 h: ~300 nm", 3.2, [MZ - 22, -24, 0], ["sph"]);
  addLab("~24 h: 2–3 µm", 3.2, [MZ + 38, -34, 0], ["sph"]);
  addLab("note: at 950 °C the 24 h powder is TiC-dominated (850 °C = 24 h optimum)", 2.6, [MZ + 10, 44, 0], ["sph"]);
  addLab("950 °C · sizes not to scale", 3.0, [MZ - 40, 30, 0], ["sph"]);
  const many = [];
  { const R4 = rng(23); for (let i = 0; i < 20; i++) { const g = spherulite(100 + i, 110); g.position.set((R4() - 0.5) * 130, (R4() - 0.5) * 70, -20 + (R4() - 0.5) * 60); g.userData.r = 15 + R4() * 14; g.userData.ph = R4(); many.push(g); } }
  const cutG = new THREE.Group(); cutG.position.set(0, -6, 45); meso.add(cutG);
  const cutSph = spherulite(77, 300, cutG, true); cutSph.scale.setScalar(24);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat("#b08d57", { transparent: true, opacity: 0.55, metalness: 0.3 })); core.scale.setScalar(5.5); cutG.add(core);
  addLab("spherulites merge into a porous network", 4.2, [MZ, 62, 0], ["merge"]);
  addLab("cut-away: possible TiC location (not directly mapped)", 3.6, [MZ, -40, 70], ["merge"]);

  // ---------------- "you are here" locator (schematic carrier tube in the furnace) ----------------
  const LOC = { exp: ["furnace", "the whole hot zone"], modes: ["carrier", "the carrier tube (loading)"], supply: ["gap", "gap between Ti powder and quartz"], threshold: ["gap", "near the quartz, inside the gap"], growth: ["gap", "one nucleus in the gap"], crystal: ["gap", "inside one flake"], sph: ["plate", "deposit on the quartz plate"], merge: ["fill", "the carrier filling up (24 h)"] };
  function locator([where, what]) {
    const hl = "#1f7a68";
    let s = `<svg viewBox="0 0 220 92"><rect x="4" y="14" width="212" height="56" rx="8" fill="#fbe9dc" stroke="${where === "furnace" ? hl : "#e0b89c"}" stroke-width="${where === "furnace" ? 3 : 1}"/>`;
    s += `<line x1="4" y1="24" x2="216" y2="24" stroke="#c8dbe6" stroke-width="1.5"/><line x1="4" y1="60" x2="216" y2="60" stroke="#c8dbe6" stroke-width="1.5"/>`;
    s += `<rect x="66" y="30" width="88" height="26" rx="5" fill="#eef5f8" stroke="${where === "carrier" ? hl : "#8fb0c2"}" stroke-width="${where === "carrier" ? 3 : 1.2}"/>`;
    for (let i = 0; i < 22; i++) s += `<circle cx="${70 + i * 3.8}" cy="${52 - (i % 2)}" r="1.8" fill="#a3a7ae"/>`;
    s += `<rect x="76" y="37" width="68" height="2.5" fill="#c8dbe6" stroke="#8fb0c2" stroke-width=".6"/>`;
    if (where === "plate" || where === "fill") s += `<rect x="78" y="39.5" width="64" height="${where === "fill" ? 10 : 2}" fill="#1b1d22" opacity="${where === "fill" ? 0.75 : 1}"/>`;
    const C = { gap: [110, 45, 6], plate: [110, 41, 6], fill: [110, 45, 12] }[where];
    if (C) s += `<circle cx="${C[0]}" cy="${C[1]}" r="${C[2]}" fill="none" stroke="${hl}" stroke-width="2.5"/><line x1="${C[0] + C[2] * 0.7}" y1="${C[1] - C[2] * 0.7}" x2="186" y2="8" stroke="${hl}" stroke-width="1.2"/>`;
    s += `<text x="8" y="10" font-size="8.5" fill="#5d6472" font-family="ui-monospace,Consolas,monospace">where we are</text>`;
    s += `<text x="110" y="84" font-size="9.5" fill="#1d2129" text-anchor="middle">${what}</text></svg>`;
    return s;
  }

  // ---------------- UI ----------------
  const list = document.getElementById("steps");
  STEPS.forEach((st, i) => { const li = document.createElement("li"); li.innerHTML = `<span class="n">${String(i + 1).padStart(2, "0")}</span>${st.title}`; li.onclick = () => go(i); list.appendChild(li); });
  const refsEl = document.getElementById("refs");
  REFS.forEach(([t, doi], i) => { const li = document.createElement("li"); li.id = "ref" + i; li.innerHTML = `${t} <a href="https://doi.org/${doi}" target="_blank" rel="noopener">doi:${doi}</a>`; refsEl.appendChild(li); });
  const ladderEl = document.getElementById("ladder");
  ladderEl.innerHTML = LADDER.map((s, i) => (i ? "<i>›</i>" : "") + `<span>${s}</span>`).join("");
  const ladderSpans = [...ladderEl.querySelectorAll("span")];
  const fadeEl = document.getElementById("fade");
  const ui = { labels: true, spin: VIDEO };
  const tgl = (id, k) => { const b = document.getElementById(id); b.onclick = () => { ui[k] = !ui[k]; b.classList.toggle("on", ui[k]); }; };
  tgl("tLab", "labels"); tgl("tSpin", "spin");
  document.getElementById("png").onclick = () => { const a_ = document.createElement("a"); a_.download = `mxene-vapor-step${cur + 1}.png`; a_.href = renderer.domElement.toDataURL("image/png"); a_.click(); };

  let cur = 0, k = 0, tw = null, tr = null, shown = null;
  const fromP = new THREE.Vector3(), fromL = new THREE.Vector3();
  function go(i) {
    const prev = cur;
    cur = Math.max(0, Math.min(STEPS.length - 1, i)); k = 0;
    const st = STEPS[cur];
    const P = new THREE.Vector3(...st.cam), Lk = new THREE.Vector3(...st.look);
    if (VIDEO) P.sub(Lk).multiplyScalar(1.45).add(Lk);
    if (shown && shown !== st.scene) {
      // scene change: dive toward the feature that the next step zooms into (or back out), fade, then settle
      const zoomIn = STEPS[cur].ladder > STEPS[prev].ladder || (STEPS[cur].ladder === STEPS[prev].ladder && cur > prev);
      const target = new THREE.Vector3(...(zoomIn && STEPS[prev].dive ? STEPS[prev].dive : STEPS[prev].look));
      tr = { ph: 0, t: 0, p0: cam.position.clone(), l0: ctl.target.clone(), target, P, Lk, zoomIn }; tw = null;
    } else { fromP.copy(cam.position); fromL.copy(ctl.target); tw = { t: 0, p: P, l: Lk }; if (!shown) shown = st.scene; }
    [...list.children].forEach((li, j) => li.classList.toggle("on", j === cur));
    ladderSpans.forEach((s, j) => s.classList.toggle("on", j === st.ladder));
    document.getElementById("stitle").textContent = `${cur + 1}. ${st.title}`;
    document.getElementById("stext").innerHTML = VIDEO ? st.short : st.text;
    document.getElementById("scale").textContent = st.scale;
    document.getElementById("facts").innerHTML = st.facts.map(([x, y]) => `<tr><td>${x}</td><td>${y}</td></tr>`).join("");
    document.getElementById("eq").innerHTML = st.eq ? `<div class="eq">${st.eq}</div>` : "";
    const ch = document.getElementById("chart"); ch.style.display = st.chart ? "" : "none"; ch.innerHTML = st.chart ? CH[st.chart]() : "";
    const sb = document.getElementById("semBox");
    sb.innerHTML = st.sem && window.SEM ? `<h2>From the paper (SEM)</h2><div class="sem">${st.sem.map(([k, c]) => `<figure><img src="${window.SEM[k]}" alt="${c}"><figcaption>${c}</figcaption></figure>`).join("")}<div class="src">SEM images: Kim, H. et al., J. Am. Chem. Soc. 2026, doi:10.1021/jacs.6c10774 — CC BY 4.0. Cropped and resized; no other changes.</div></div>` : "";
    const loc = document.getElementById("locator"); loc.style.display = LOC[st.id] ? "" : "none"; loc.innerHTML = LOC[st.id] ? locator(LOC[st.id]) : "";
    document.getElementById("snote").innerHTML = st.note + (st.refs ? ` <span style="white-space:nowrap">[${st.refs.map((r) => r + 1).join(", ")}]</span>` : "");
    REFS.forEach((_, r) => (document.getElementById("ref" + r).style.fontWeight = st.refs && st.refs.includes(r) ? "700" : "400"));
    try { history.replaceState(null, "", "#" + (cur + 1)); } catch (e) {}
  }
  window.__go = go; window.__ready = false;
  document.getElementById("prev").onclick = () => go(cur - 1);
  document.getElementById("next").onclick = () => go(cur + 1);
  let auto = null; const ab = document.getElementById("auto");
  ab.onclick = () => { if (auto) { clearInterval(auto); auto = null; ab.textContent = "▶ Play"; return; } ab.textContent = "■ Stop"; auto = setInterval(() => go(cur + 1 >= STEPS.length ? 0 : cur + 1), 11000); };
  addEventListener("keydown", (e) => { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); });
  function resize() { const r = host.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%"; cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix(); }
  addEventListener("resize", resize); resize();
  const start = Math.max(0, Math.min(STEPS.length - 1, (parseInt((location.hash || "#1").slice(1)) || 1) - 1));
  cam.position.set(...STEPS[start].cam); ctl.target.set(...STEPS[start].look); cur = start; go(start);

  // ---------------- animation ----------------
  const clock = new THREE.Clock(); let t = 0;
  const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
  const MANUAL = /[?&]manual/.test(location.search);
  let vOne = STEPS[cur].id === "future" ? 1 : 0;
  function frame(dtIn, draw) {
    const dt = dtIn !== undefined ? dtIn : Math.min(0.05, clock.getDelta()); t += dt; k += dt;
    if (tr) {
      if (tr.ph === 0) {   // leave: move 55% toward the dive point while fading to white
        tr.t = Math.min(1, tr.t + dt / 0.55); const e = ease(tr.t);
        cam.position.lerpVectors(tr.p0, tr.target, (tr.zoomIn ? 0.55 : -0.35) * e + 0).add(tr.zoomIn ? new THREE.Vector3() : new THREE.Vector3()); ctl.target.lerpVectors(tr.l0, tr.target, e);
        fadeEl.style.opacity = e;
        if (tr.t >= 1) { shown = STEPS[cur].scene; tr.ph = 1; tr.t = 0; const s0 = tr.zoomIn ? 0.3 : 1.8; tr.p1 = tr.Lk.clone().add(tr.P.clone().sub(tr.Lk).multiplyScalar(s0)); cam.position.copy(tr.p1); ctl.target.copy(tr.Lk); k = 0; }
      } else {             // arrive: settle from close-in (zoom-in) or far-out (zoom-out) while fading in
        tr.t = Math.min(1, tr.t + dt / 1.1); const e = ease(tr.t);
        cam.position.lerpVectors(tr.p1, tr.P, e); fadeEl.style.opacity = 1 - e;
        if (tr.t >= 1) { tr = null; fadeEl.style.opacity = 0; }
      }
    }
    if (tw) { tw.t = Math.min(1, tw.t + dt / 1.5); const e = ease(tw.t); cam.position.lerpVectors(fromP, tw.p, e); ctl.target.lerpVectors(fromL, tw.l, e); if (tw.t >= 1) tw = null; }
    const id = STEPS[cur].id, sc = shown, spin = ui.spin ? t * 0.25 : 0;
    crystal.visible = sc === "crystal"; molG.visible = sc === "mol"; reactor.visible = sc === "reactor"; meso.visible = sc === "meso"; modes.visible = sc === "modes";
    // crystal
    vOne += ((id === "future" ? 1 : 0) - vOne) * Math.min(1, dt * 3.5);
    flakes.forEach((g, i) => { g.position.y = g.userData.base + (i ? vOne * 6 * i : 0); g.rotation.y = spin; if (i) fade(g, 1 - vOne); });
    wafer.visible = vOne > 0.05; fade(wafer, 0.6 * vOne); wafer.rotation.y = spin; gapBar.visible = id === "crystal"; gapBar.rotation.y = spin;
    // molecules
    if (sc === "mol") {
      molG.rotation.y = spin;
      surf.visible = id === "supply" || id === "threshold"; quartz.visible = id === "supply" || id === "threshold"; tiFilm.visible = id === "threshold";
      cyc.forEach((p) => { const ph = (t * 0.12 + p.ph) % 1; const on = id === "supply";
        p.a4.visible = on && ph < 0.5; p.a2.visible = p.a2b.visible = on && ph >= 0.5;
        if (ph < 0.5) { const e = ph / 0.5; p.a4.position.set(p.x - p.dx * (1 - e), 26 - e * 22.5, p.z - p.dz * (1 - e)); p.a4.rotation.set(t + p.rot, t * 0.7, 0); }
        else { const e = (ph - 0.5) / 0.5; p.a2.position.set(p.x + p.dx * e, 3.5 + e * 22, p.z + p.dz * e); p.a2.rotation.set(0, t * 0.9 + p.rot, 0.4); p.a2b.position.set(p.x - p.dz * e, 3.5 + e * 18, p.z + p.dx * e); p.a2b.rotation.set(0.3, -t * 0.8 + p.rot, 0); } });
      const nTi = id === "supply" ? Math.min(18, Math.floor(k * 1.6)) : 18;   // TiCl2 accumulates in the gap
      drift.forEach((d, i) => {
        d.m.visible = (id === "supply" && d.isTi && i < nTi) || id === "threshold" || id === "growth";
        if (id === "growth") { const an = d.ph + t * 0.15, rr = 24 + Math.sin(t * 0.7 + i) * 2; d.m.position.set(Math.cos(an) * rr, 15 + Math.sin(t * d.sp + i) * 3, Math.sin(an) * rr); }
        else d.m.position.set(d.x + Math.sin(t * d.sp + d.ph) * 2.5, d.y + Math.cos(t * d.sp * 0.8 + d.ph) * 1.6, d.z + Math.sin(t * d.sp * 0.6 + d.ph * 2) * 2.5);
        d.m.rotation.set(t * d.sp, t * 0.5 + d.ph, 0); });
      const gr = id === "threshold" ? Math.max(0, Math.min(4, (k - 2.5) * 1.5)) : id === "growth" ? Math.min(17, 2.4 + k * 1.6) : 0;
      grow.visible = id === "threshold" || id === "growth"; cells.forEach((c) => (c.g.visible = c.r <= gr));
      nucLab.material.opacity = id === "threshold" ? Math.min(1, Math.max(0, k - 2.5)) : 1;
      hcl.forEach((h) => { const ph = (t * 0.3 + h.ph) % 1; h.m.visible = id === "growth" && gr > 4; const r0 = Math.min(gr, 17) + ph * 12; h.m.position.set(Math.cos(h.ang) * r0, 15 + ph * 6, Math.sin(h.ang) * r0); h.m.rotation.set(0, h.ang + t, ph * 3); });
    }
    // reactor
    if (sc === "reactor") {
      reactor.rotation.y = ui.spin ? Math.sin(t * 0.3) * 0.5 : 0;
      heatMat.emissiveIntensity = 0.75 + 0.2 * Math.sin(t * 2);
      gas.forEach((g) => { const ph = (t * 0.06 + g.s) % 1; const x = -85 + ph * 170; const inZone = Math.abs(x) < 22;
        g.m.position.set(x, inZone ? -6.7 + g.y * 0.22 : g.y * 0.6, inZone ? g.z * 0.22 : g.z * 0.6);
        g.m.visible = g.kind === 2 ? x > 0 : x < 30; });
    }
    // loading modes: deposits appear over the first seconds (clamped, not looping)
    if (sc === "modes") {
      modes.rotation.y = ui.spin ? Math.sin(t * 0.3) * 0.25 : 0;
      grows.forEach((d) => { const q = Math.max(0, Math.min(1, (k - d.t0) / 2.5));
        if (d.fill) d.obj.children.forEach((m, i) => (m.visible = i < q * d.obj.children.length));
        else if (d.sy) { d.obj.visible = q > 0.01; d.obj.scale.y = Math.max(0.01, q); }
        else { d.obj.visible = q > 0.01; d.obj.scale.setScalar(Math.max(0.01, 0.4 + 0.6 * q)); } });
    }
    // spherulites
    if (sc === "meso") {
      meso.rotation.y = 0;
      const row = id === "sph";
      ROW.forEach((o, i) => { o.obj.visible = row; const q = Math.min(1, Math.max(0.05, (k - i * 1.2) / 2.2)); o.obj.scale.setScalar(o.r * q); o.obj.rotation.y = spin + t * 0.15; });
      many.forEach((g) => { g.visible = !row; const q = Math.min(1, 0.35 + k * 0.12 + g.userData.ph * 0.1); g.scale.setScalar(g.userData.r * q); g.rotation.y = t * 0.05 + g.userData.ph; });
      cutG.visible = !row; cutG.rotation.y = Math.sin(t * 0.3) * 0.3;
    }
    LAB.forEach(([s, ids]) => { s.visible = ui.labels && !tr && ids.includes(id) && STEPS[cur].scene === sc; });
    ctl.update(); if (draw !== false) renderer.render(scene, cam); window.__ready = true;
    if (!MANUAL) requestAnimationFrame(() => frame());
  }
  window.__tick = (dt, draw) => frame(dt, draw);   // manual mode: deterministic frames (draw=false skips rendering)
  if (MANUAL) frame(0); else frame();
})();
