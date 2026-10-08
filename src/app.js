// Ti3AlC2 -> Ti3C2Tx MXene interactive explainer (standalone; uses global THREE r147 + THREE.OrbitControls)
// Units in the atomic scene: 1 = 1 Å. Crystal c-axis -> three.js +y.
(function () {
  "use strict";
  // 2026-10-08 fix: with r147's default legacy colour mode the sRGB hex codes below were treated as linear values and
  // then re-encoded to sRGB on output, so every atom rendered paler than its legend swatch (Al orange -> pale yellow,
  // C near-black -> mid grey). Switching legacy mode off makes THREE.Color convert hex sRGB -> linear, so 3D == legend.
  if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
  const VIDEO = /[?&]video/.test(location.search);
  if (VIDEO) document.body.classList.add("video");
  // ---------------- crystallography (idealized, approximate) ----------------
  const a = 3.07, c = 18.6;           // Ti3AlC2 lattice parameters (approx., Å)
  const zTi2 = 0.128, zC = 0.070;     // approximate fractional z of Ti(2) 4f and C 4f
  const N = 6;                        // supercell N x N
  const SITE = { A: [0, 0], B: [1 / 3, 2 / 3], C: [2 / 3, 1 / 3] };
  const COL = { Ti: "#9aa7bd", C: "#3b3b44", Al: "#e3913f", O: "#d9473a", H: "#f2f2f2", F: "#8fd14f", Li: "#8a63e6" };
  const RAD = { Ti: 0.62, C: 0.38, Al: 0.6, O: 0.38, H: 0.22, F: 0.36, Li: 0.42 };
  const S3 = Math.sqrt(3) / 2;
  const cx = a * ((N - 1) / 2 + (N - 1) / 4), cz = a * S3 * (N - 1) / 2;
  const xy = (u, v) => [a * (u + v / 2) - cx, a * S3 * v - cz];

  // ---------------- steps ----------------
  const REFS = [
    ["Barsoum, M. W. (2000). The MN+1AXN phases: a new class of solids. Prog. Solid State Chem. 28, 201–281.", "10.1016/S0079-6786(00)00006-6"],
    ["Naguib, M. et al. (2011). Two-dimensional nanocrystals produced by exfoliation of Ti3AlC2. Adv. Mater. 23, 4248–4253.", "10.1002/adma.201102306"],
    ["Ghidiu, M. et al. (2014). Conductive two-dimensional titanium carbide ‘clay’ with high volumetric capacitance. Nature 516, 78–81.", "10.1038/nature13970"],
    ["Anasori, B., Lukatskaya, M. R., Gogotsi, Y. (2017). 2D metal carbides and nitrides (MXenes) for energy storage. Nat. Rev. Mater. 2, 16098.", "10.1038/natrevmats.2016.98"],
    ["Alhabeb, M. et al. (2017). Guidelines for synthesis and processing of two-dimensional titanium carbide (Ti3C2Tx MXene). Chem. Mater. 29, 7633–7644.", "10.1021/acs.chemmater.7b02847"],
    ["Hantanasirisakul, K. et al. (2016). Fabrication of Ti3C2Tx MXene transparent thin films with tunable optoelectronic properties. Adv. Electron. Mater. 2, 1600050.", "10.1002/aelm.201600050"],
    ["Mashtalir, O. et al. (2013). Intercalation and delamination of layered carbides and carbonitrides. Nat. Commun. 4, 1716.", "10.1038/ncomms2664"],
    ["Naguib, M. et al. (2015). Large-scale delamination of multi-layers transition metal carbides and carbonitrides “MXenes”. Dalton Trans. 44, 9353–9358.", "10.1039/C5DT01247C"],
    ["Li, M. et al. (2019). Element replacement approach by reaction with Lewis acidic molten salts to synthesize nanolaminated MAX phases and MXenes. J. Am. Chem. Soc. 141, 4730–4737.", "10.1021/jacs.9b00574"],
    ["Kamysbayev, V. et al. (2020). Covalent surface modifications and superconductivity of two-dimensional metal carbide MXenes. Science 369, 979–983.", "10.1126/science.aba8311"],
  ];
  const STEPS = [
    { short: "This is Ti₃AlC₂ — a layered ceramic crystal (a MAX phase).", title: "Ti₃AlC₂ — the MAX phase precursor", scale: "atomic · Å",
      cam: [18, 16, 62], look: [0, 9.3, 0],
      text: "Ti₃AlC₂ is a layered hexagonal carbide (<b>P6₃/mmc</b>). <b>Ti₃C₂ slabs</b> (Ti–C–Ti–C–Ti) alternate with single <b>Al layers</b>. Three slabs and two Al layers are shown — one full unit cell along <i>c</i> contains two formula units.",
      facts: [["Formula", "Ti₃AlC₂ (M₃AX₂, “312”)"], ["Space group", "P6₃/mmc (No. 194)"], ["Lattice (approx.)", "a ≈ 3.07 Å, c ≈ 18.6 Å"], ["Sites used", "Ti(1) 2a · Ti(2) 4f · Al 2b · C 4f"]],
      chart: "xrd0", note: "Positions follow the idealized P6₃/mmc Wyckoff sites (Ti(1) octahedrally coordinated by C; Al in trigonal-prismatic sites between Ti(2) layers) with approximate z(Ti2) ≈ 0.128 and z(C) ≈ 0.070. Treat geometry as schematic, not a refinement; use a primary structure determination for exact values.", refs: [0] },
    { short: "The aluminium layers (orange) are the weak link.", title: "Why Al can be removed selectively", scale: "atomic · Å",
      cam: [16, 12, 50], look: [0, 6, 0],
      text: "Within a slab, <b>Ti–C bonds</b> are strong (mixed covalent/ionic/metallic). The <b>Ti–Al bonds</b> to the A-layer are weaker and metallic. That difference is what lets an etchant attack the <b>Al layer</b> (glowing) while leaving the Ti₃C₂ slabs intact.",
      facts: [["Strong", "M–X (Ti–C) within slabs"], ["Weaker", "M–A (Ti–Al) between slabs"], ["Consequence", "A-layer is the reactive plane"]],
      note: "This is the qualitative picture used throughout the MAX/MXene literature; bond strengths are not drawn to scale.", refs: [0, 1] },
    { short: "Acid etches out only the aluminium.", title: "Selective etching of Al", scale: "atomic · Å",
      cam: [20, 18, 66], look: [0, 9.3, 0],
      text: "In <b>HF</b> — or <b>LiF + HCl</b>, which forms HF in situ — the Al layers dissolve. What remains is a stack of Ti₃C₂ sheets, an “accordion-like” multilayer held together by weaker interactions.",
      facts: [["Etchants", "HF (aq) · LiF + HCl (in situ HF)"], ["Removed", "Al (as AlF₃ / Al species)"], ["Product", "multilayer Ti₃C₂Tₓ"]],
      eq: "Ti₃AlC₂ + 3 HF → AlF₃ + 3/2 H₂ + Ti₃C₂",
      chart: "xrd1", note: "Idealized overall reaction as written by Naguib et al. (2011). Real etching conditions (concentration, time, temperature) strongly affect quality and terminations.", refs: [1, 2, 4] },
    { short: "The bare titanium surfaces grab –O, –OH and –F.", title: "Surface terminations Tₓ", scale: "atomic · Å",
      cam: [14, 10, 42], look: [0, 4.6, 0],
      text: "The exposed outer Ti surfaces are immediately capped by species from the solution — <b>–O</b>, <b>–OH</b> and <b>–F</b>. Hence the formula <b>Ti₃C₂Tₓ</b>. Terminations make the flakes hydrophilic and strongly influence conductivity and chemistry.",
      facts: [["Formula", "Ti₃C₂Tₓ"], ["Common Tₓ (aq. fluoride routes)", "–O, –OH, –F (mixed)"], ["Shown at", "hollow sites above inner Ti(1)"]],
      eq: "Ti₃C₂ + 2 H₂O → Ti₃C₂(OH)₂ + H₂<br>Ti₃C₂ + 2 HF → Ti₃C₂F₂ + H₂<br><span style='color:#5d6472'>(idealized, as written in [2])</span>",
      note: "The O/OH/F mixture drawn here (≈ 50/30/20) is illustrative only. Actual ratios depend on the etchant and processing; other routes (e.g., Lewis-acid molten salts) give –Cl/–Br terminations [9, 10].", refs: [1, 4, 8, 9] },
    { short: "Ions slip between the sheets and push them apart.", title: "Intercalation and c-lattice expansion", scale: "atomic · Å",
      cam: [22, 24, 84], look: [0, 16, 0],
      text: "Cations and water (<b>Li⁺</b> for LiF/HCl-etched material) or organic molecules (e.g. <b>DMSO</b> or <b>tetraalkylammonium hydroxides</b> for HF-etched material) enter the gaps between sheets. The interlayer spacing grows — seen in XRD as the <b>(002) peak shifting to lower 2θ</b>.",
      facts: [["LiF/HCl route", "Li⁺ + H₂O intercalated (“clay”)"], ["HF route", "DMSO, R₄N⁺OH⁻, … needed"], ["Signature", "(002) → lower 2θ, larger c"]],
      chart: "xrd2", note: "Gap sizes in the 3D view are exaggerated for visibility. Organic intercalation/delamination: DMSO [7]; organic bases (tetraalkylammonium hydroxides), shown for V₂C and Ti₃CN [8].", refs: [2, 4, 6, 7] },
    { short: "One sheet: five atomic planes, about 1 nm thick — a 2D metal.", title: "Delamination: a single Ti₃C₂Tₓ flake", scale: "atomic · Å",
      cam: [16, 15, 36], look: [0, 0, 0],
      text: "Shaking or sonication separates the sheets into a colloidal suspension of <b>single flakes</b>: five atomic planes (Ti–C–Ti–C–Ti) with terminations on both faces — a true <b>2D metal carbide</b>, about a nanometre thick but up to micrometres wide.",
      facts: [["Atomic planes", "Ti 3 · C 2 (+ Tₓ both sides)"], ["Thickness", "on the order of 1 nm"], ["Lateral size", "typically sub-µm to several µm"], ["Dispersion", "water, without surfactant"]],
      note: "Monolayer thickness measured by AFM depends on terminations and adsorbed water; quote values from your own measurements.", refs: [2, 4] },
    { short: "Stack the flakes into a film. Electrons hop flake to flake.", title: "Restacked films", scale: "film · µm (schematic)", film: true,
      cam: [400, 150, 230], look: [400, 0, 0],
      text: "Filtering, spray- or spin-coating the suspension produces <b>films of aligned, overlapping flakes</b>. Electrons (yellow) move metallically <b>within</b> flakes; <b>flake-to-flake contacts</b> dominate the film resistance. Ions and water can enter between flakes, which is why such films work as electrodes: in acidic electrolytes charge storage is largely pseudocapacitive (proton-coupled redox at surface Ti–O), in neutral ones mostly intercalation capacitance.",
      facts: [["In-flake transport", "metallic"], ["Film resistance", "limited by flake junctions"], ["Between flakes", "ions / H₂O can intercalate"], ["Acidic electrolyte", "pseudocapacitive (surface redox)"]],
      note: "Flake sizes and stacking in this view are schematic and not to scale.", refs: [3, 4] },
    { short: "Make it thin enough and it is transparent — and still conducts.", title: "Transparent conducting films", scale: "film on glass · mm (schematic)", film: true,
      cam: [400, 140, 270], look: [400, 0, 0],
      text: "Thin Ti₃C₂Tₓ films on glass are <b>transparent and conductive</b>. Thinner films transmit more light but have higher sheet resistance — the curve on the right. The film in the view oscillates in thickness; the marker follows it along the trade-off.",
      facts: [["Thinner", "higher T, higher Rₛ"], ["Thicker", "lower T, lower Rₛ"], ["Levers", "flake size, overlap, terminations, annealing"]],
      eq: "T = (1 + (Z₀ / 2Rₛ) · σ<sub>op</sub>/σ<sub>dc</sub>)<sup>−2</sup> , Z₀ ≈ 377 Ω",
      chart: "trs", note: "Standard thin-film relation between transmittance and sheet resistance; the figure of merit is σ<sub>dc</sub>/σ<sub>op</sub>. The curve is drawn for one fixed ratio and has no numerical axes. For very thin, non-continuous (percolative) films this bulk relation no longer holds.", refs: [5] },
  ];

  // ---------------- charts (inline SVG, schematic) ----------------
  function xrd(stage) {
    // MAX (002): d = c/2 = 9.3 Å -> 2θ(Cu Kα 1.5406 Å) ≈ 9.50°
    const X = (tt) => 30 + (tt - 4) * (260 / 8);       // 4°..12°
    const peak = (x0, w, h, col, dash) => {
      let d = ""; for (let i = 0; i <= 120; i++) { const tt = 4 + i * 8 / 120; const y = h * Math.exp(-Math.pow((tt - x0) / w, 2)); d += (i ? "L" : "M") + X(tt).toFixed(1) + " " + (130 - y).toFixed(1); }
      return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2" ${dash ? 'stroke-dasharray="4 3"' : ""}/>`;
    };
    let s = `<svg viewBox="0 0 300 175"><line x1="30" y1="130" x2="292" y2="130" stroke="#999"/>`;
    [4, 6, 8, 10, 12].forEach((t) => (s += `<line x1="${X(t)}" y1="130" x2="${X(t)}" y2="134" stroke="#999"/><text x="${X(t)}" y="146" font-size="9" text-anchor="middle" fill="#666">${t}</text>`));
    s += `<text x="160" y="162" font-size="9.5" text-anchor="middle" fill="#666">2θ (°), Cu Kα — schematic</text>`;
    s += peak(9.5, 0.12, 95, stage === 0 ? "#b4541a" : "#c9c9c9", stage !== 0);
    s += `<text x="${X(9.5) + 6}" y="32" font-size="9" fill="#555">MAX (002) ≈ 9.5°</text>`;
    if (stage >= 1) s += peak(8.8, 0.3, 70, stage === 1 ? "#b4541a" : "#c9c9c9", stage !== 1) + `<text x="${X(8.8) - 4}" y="${stage === 1 ? 58 : 70}" font-size="9" text-anchor="end" fill="#555">etched multilayer</text>`;
    if (stage >= 2) s += peak(6.6, 0.35, 80, "#b4541a") + `<text x="${X(6.6)}" y="44" font-size="9" text-anchor="middle" fill="#555">intercalated</text>`;
    s += `<text x="34" y="14" font-size="9" fill="#888">only the MAX position is computed (c ≈ 18.6 Å); shifted peaks are illustrative</text></svg>`;
    return s;
  }
  function trs() {
    const r = 6; // fixed σop/σdc*Z0/2 scale for drawing
    let d = ""; const pts = [];
    for (let i = 0; i <= 100; i++) { const lr = -1 + i * 3 / 100; const Rs = Math.pow(10, lr); const T = Math.pow(1 + r / (2 * Rs * 10), -2); const x = 30 + i * 2.6, y = 140 - T * 120; pts.push([x, y]); d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
    return `<svg viewBox="0 0 300 175"><line x1="30" y1="140" x2="292" y2="140" stroke="#999"/><line x1="30" y1="140" x2="30" y2="14" stroke="#999"/>
      <path d="${d}" fill="none" stroke="#b4541a" stroke-width="2"/><circle id="trsDot" cx="${pts[50][0]}" cy="${pts[50][1]}" r="5" fill="#1d2129"/>
      <text x="160" y="160" font-size="9.5" text-anchor="middle" fill="#666">sheet resistance Rₛ (log) →</text>
      <text x="12" y="80" font-size="9.5" text-anchor="middle" fill="#666" transform="rotate(-90 12 80)">transmittance T →</text>
      <text x="40" y="128" font-size="9" fill="#666">thick</text><text x="250" y="30" font-size="9" fill="#666">thin</text></svg>`;
  }
  const CH = { xrd0: () => xrd(0), xrd1: () => xrd(1), xrd2: () => xrd(2), trs };

  // ---------------- three.js scene ----------------
  const host = document.getElementById("view");
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.outputEncoding = THREE.sRGBEncoding;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f3f2ee");
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 5000);
  scene.add(new THREE.HemisphereLight("#ffffff", "#b9b4a8", 1.0));
  const key = new THREE.DirectionalLight("#ffffff", 0.9); key.position.set(30, 60, 40); scene.add(key);
  const fill = new THREE.DirectionalLight("#ffffff", 0.35); fill.position.set(-40, 10, -20); scene.add(fill);
  const ctl = new THREE.OrbitControls(cam, renderer.domElement);
  ctl.enableDamping = true;

  const mat = (col, o) => new THREE.MeshStandardMaterial(Object.assign({ color: col, roughness: 0.45, metalness: 0.08 }, o || {}));
  const MATS = {}; Object.keys(COL).forEach((k) => (MATS[k] = mat(COL[k], k === "Ti" ? { metalness: 0.35, roughness: 0.35 } : {})));
  const SPH = new THREE.SphereGeometry(1, 20, 14);

  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function layer(el, site, y, parent, matOverride) {
    const pts = [];
    for (let u = 0; u < N; u++) for (let v = 0; v < N; v++) { const [x, z] = xy(u + SITE[site][0], v + SITE[site][1]); pts.push([x, y, z]); }
    const im = new THREE.InstancedMesh(SPH, matOverride || MATS[el], pts.length);
    const m = new THREE.Matrix4(), r = RAD[el];
    pts.forEach((p, i) => { m.makeScale(r, r, r).setPosition(p[0], p[1], p[2]); im.setMatrixAt(i, m); });
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

  // slabs: centre fractional z = 0, 0.5, 1.0
  const slabs = [], terms = [], als = [], ions = [];
  const R = rng(17);
  const centres = [0, 0.5, 1.0];
  centres.forEach((zf, s) => {
    const g = new THREE.Group(); g.userData.base = zf * c; scene.add(g);
    const odd = Math.abs(zf - 0.5) < 1e-6;
    // 4f orbit: (1/3,2/3,z) and its inversion image (2/3,1/3,-z) -> upper and lower halves sit on OPPOSITE sites.
    // even slab (z=0):   upper C@B, Ti2@C ; lower C@C, Ti2@B   (Ti1 octahedral, Al trigonal prismatic)
    // odd slab  (z=1/2): upper C@C, Ti2@B ; lower C@B, Ti2@C
    const up = odd ? { C: "C", T: "B" } : { C: "B", T: "C" }, dn = odd ? { C: "B", T: "C" } : { C: "C", T: "B" };
    // own materials so each slab can fade independently
    const own = {}; ["Ti", "C"].forEach((k) => (own[k] = MATS[k].clone()));
    layer("Ti", "A", 0, g, own.Ti);
    layer("C", up.C, zC * c, g, own.C); layer("C", dn.C, -zC * c, g, own.C);
    layer("Ti", up.T, zTi2 * c, g, own.Ti); layer("Ti", dn.T, -zTi2 * c, g, own.Ti);
    // terminations (both faces), hollow site above Ti(1) = site A
    const tg = new THREE.Group(); g.add(tg);
    const tmats = { O: MATS.O.clone(), H: MATS.H.clone(), F: MATS.F.clone() };
    [1, -1].forEach((sg) => {
      const yT = sg * (zTi2 * c + 1.1);
      const lists = { O: [], H: [], F: [] };
      for (let u = 0; u < N; u++) for (let v = 0; v < N; v++) {
        const [x, z] = xy(u, v); const q = R();
        if (q < 0.5) lists.O.push([x, yT, z]);
        else if (q < 0.8) { lists.O.push([x, yT, z]); lists.H.push([x, yT + sg * 0.97, z]); }
        else lists.F.push([x, yT, z]);
      }
      Object.keys(lists).forEach((el) => {
        const L = lists[el]; if (!L.length) return;
        const im = new THREE.InstancedMesh(SPH, tmats[el], L.length), m = new THREE.Matrix4(), r = RAD[el];
        L.forEach((p, i) => { m.makeScale(r, r, r).setPosition(p[0], p[1], p[2]); im.setMatrixAt(i, m); });
        tg.add(im);
      });
    });
    slabs.push(g); terms.push(tg);
  });
  [0.25, 0.75].forEach((zf, i) => {
    const g = new THREE.Group(); g.userData.base = zf * c; g.userData.idx = i; scene.add(g);
    const am = MATS.Al.clone(); am.emissive = new THREE.Color("#ff7a1a"); am.emissiveIntensity = 0;
    layer("Al", "A", 0, g, am); g.userData.mat = am; als.push(g);
    const ig = new THREE.Group(); ig.userData.base = zf * c; scene.add(ig);
    for (let k = 0; k < 16; k++) {
      const m = new THREE.Mesh(SPH, MATS.Li.clone()); m.scale.setScalar(RAD.Li);
      m.position.set((R() - 0.5) * N * a * 1.3, 0, (R() - 0.5) * N * a * S3);
      m.userData.ph = R() * 6.28; ig.add(m);
    }
    ions.push(ig);
  });

  // unit cell outline (one cell, centred-ish)
  const u0 = Math.floor(N / 2) - 1, v0 = Math.floor(N / 2) - 1;
  const corners = [[u0, v0], [u0 + 1, v0], [u0 + 1, v0 + 1], [u0, v0 + 1]].map(([u, v]) => xy(u, v));
  const cellPts = [];
  for (let i = 0; i < 4; i++) {
    const [x1, z1] = corners[i], [x2, z2] = corners[(i + 1) % 4];
    [0, c].forEach((y) => cellPts.push(x1, y, z1, x2, y, z2));
    cellPts.push(x1, 0, z1, x1, c, z1);
  }
  const cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.Float32BufferAttribute(cellPts, 3));
  const cell = new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: "#b4541a" })); scene.add(cell);
  const lab = {
    slab: label("Ti₃C₂ slab"), al: label("Al layer"), cc: label("c ≈ 18.6 Å", 1.2), tx: label("Tₓ (–O / –OH / –F)"), li: label("intercalant (Li⁺ / H₂O)"), flake: label("single Ti₃C₂Tₓ flake ≈ 1 nm"),
  };
  Object.values(lab).forEach((s) => scene.add(s));

  // ---------------- film scene (far away, schematic) ----------------
  const FX = 400;
  const film = new THREE.Group(); film.position.set(FX, 0, 0); scene.add(film);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(220, 6, 140), new THREE.MeshPhysicalMaterial({ color: "#dcebf5", transparent: true, opacity: 0.55, roughness: 0.05 }));
  glass.position.y = -3; film.add(glass);
  const flakes = new THREE.Group(); film.add(flakes);
  const FR = rng(5), flakeMat = mat("#7f8aa0", { metalness: 0.5, roughness: 0.35, transparent: true, opacity: 0.92 });
  const flakeList = [];
  for (let i = 0; i < 70; i++) {
    const w = 26 + FR() * 34, d = w * (0.55 + FR() * 0.4);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), flakeMat);
    m.position.set((FR() - 0.5) * 150, 0.6 + (i % 7) * 1.1 + FR() * 0.4, (FR() - 0.5) * 90);
    m.rotation.set((FR() - 0.5) * 0.04, FR() * Math.PI, (FR() - 0.5) * 0.04);
    m.userData.layer = i % 7; flakes.add(m); flakeList.push(m);
  }
  const elec = [];
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(SPH, new THREE.MeshBasicMaterial({ color: "#f2b705" })); m.scale.setScalar(1.3); film.add(m); elec.push({ m, s: FR(), z: (FR() - 0.5) * 80, y: 2 + FR() * 6 }); }
  const rays = [];
  for (let i = 0; i < 7; i++) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.6, 120, 10), new THREE.MeshBasicMaterial({ color: "#f5d36b", transparent: true, opacity: 0.25, depthWrite: false }));
    r.position.set(-70 + i * 23, 60, 0); film.add(r); rays.push(r);
  }
  const filmLab = label("restacked flake film", 7); filmLab.position.set(FX, 30, 0); scene.add(filmLab);

  // ---------------- UI ----------------
  const list = document.getElementById("steps");
  STEPS.forEach((st, i) => { const li = document.createElement("li"); li.innerHTML = `<span class="n">${String(i + 1).padStart(2, "0")}</span>${st.title}`; li.onclick = () => go(i); list.appendChild(li); });
  const refsEl = document.getElementById("refs");
  REFS.forEach(([t, doi], i) => { const li = document.createElement("li"); li.id = "ref" + i; li.innerHTML = `${t} <a href="https://doi.org/${doi}" target="_blank" rel="noopener">doi:${doi}</a>`; refsEl.appendChild(li); });
  const ui = { cell: true, labels: true, spin: VIDEO };
  const tgl = (id, k) => { const b = document.getElementById(id); b.onclick = () => { ui[k] = !ui[k]; b.classList.toggle("on", ui[k]); }; };
  tgl("tCell", "cell"); tgl("tLab", "labels"); tgl("tSpin", "spin");
  document.getElementById("png").onclick = () => { const a_ = document.createElement("a"); a_.download = `mxene-step${cur + 1}.png`; a_.href = renderer.domElement.toDataURL("image/png"); a_.click(); };

  let cur = 0, k = 0, tw = null;
  const fromP = new THREE.Vector3(), fromL = new THREE.Vector3();
  function go(i) {
    cur = Math.max(0, Math.min(STEPS.length - 1, i)); k = 0;
    const st = STEPS[cur];
    fromP.copy(cam.position); fromL.copy(ctl.target);
    const P = new THREE.Vector3(...st.cam), Lk = new THREE.Vector3(...st.look);
    if (VIDEO) P.sub(Lk).multiplyScalar(1.45).add(Lk);   // portrait frame: pull the camera back
    tw = { t: 0, p: P, l: Lk };
    [...list.children].forEach((li, j) => li.classList.toggle("on", j === cur));
    document.getElementById("stitle").textContent = `${cur + 1}. ${st.title}`;
    document.getElementById("stext").innerHTML = VIDEO ? st.short : st.text;
    document.getElementById("scale").textContent = st.scale;
    document.getElementById("facts").innerHTML = st.facts.map(([x, y]) => `<tr><td>${x}</td><td>${y}</td></tr>`).join("");
    document.getElementById("eq").innerHTML = st.eq ? `<div class="eq">${st.eq}</div>` : "";
    const ch = document.getElementById("chart"); ch.style.display = st.chart ? "" : "none"; ch.innerHTML = st.chart ? CH[st.chart]() : "";
    document.getElementById("snote").innerHTML = st.note + (st.refs ? ` <span style="white-space:nowrap">[${st.refs.map((r) => r + 1).join(", ")}]</span>` : "");
    REFS.forEach((_, r) => (document.getElementById("ref" + r).style.fontWeight = st.refs && st.refs.includes(r) ? "700" : "400"));
    try { history.replaceState(null, "", "#" + (cur + 1)); } catch (e) {}
  }
  window.__go = go; window.__ready = false;
  document.getElementById("prev").onclick = () => go(cur - 1);
  document.getElementById("next").onclick = () => go(cur + 1);
  let auto = null; const ab = document.getElementById("auto");
  ab.onclick = () => { if (auto) { clearInterval(auto); auto = null; ab.textContent = "▶ Play"; return; } ab.textContent = "■ Stop"; auto = setInterval(() => go(cur + 1 >= STEPS.length ? 0 : cur + 1), 9000); };
  addEventListener("keydown", (e) => { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); });
  function size() { const r = host.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%"; cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix(); }
  addEventListener("resize", size); size();
  const start = Math.max(0, (parseInt((location.hash || "#1").slice(1)) || 1) - 1);
  cam.position.set(...STEPS[Math.min(start, STEPS.length - 1)].cam); ctl.target.set(...STEPS[Math.min(start, STEPS.length - 1)].look); go(start);

  // state per step: [Al present, terminations, gap, single flake, Al glow]
  const TG = [[1, 0, 0, 0, 0], [1, 0, 0, 0, 1], [0, 0, 0.15, 0, 0], [0, 1, 0.15, 0, 0], [0, 1, 1, 0, 0], [0, 1, 1, 1, 0], [0, 1, 1, 1, 0], [0, 1, 1, 1, 0]];
  const v = TG[Math.min(start, TG.length - 1)].slice();
  const clock = new THREE.Clock(); let t = 0;
  const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
  const MANUAL = /[?&]manual/.test(location.search);
  function frame(dtIn) {
    const dt = dtIn !== undefined ? dtIn : Math.min(0.05, clock.getDelta()); t += dt; k += dt;
    if (tw) { tw.t = Math.min(1, tw.t + dt / 1.5); const e = ease(tw.t); cam.position.lerpVectors(fromP, tw.p, e); ctl.target.lerpVectors(fromL, tw.l, e); if (tw.t >= 1) tw = null; }
    const tg = TG[cur]; for (let i = 0; i < v.length; i++) v[i] += (tg[i] - v[i]) * Math.min(1, dt * 1.8);
    const [vAl, vT, vGap, vOne, vGlow] = v;
    const spin = ui.spin ? t * 0.25 : 0;
    const GAPA = 7.5; // Å added per interlayer at full expansion (exaggerated)
    slabs.forEach((g, s) => {
      g.position.y = g.userData.base + s * vGap * GAPA; g.rotation.y = spin;
      const keep = s === 0 ? 1 : 1 - vOne;
      g.children.forEach((ch) => { if (ch !== terms[s]) { ch.material.transparent = keep < 0.999; ch.material.opacity = keep; } });
      g.visible = keep > 0.01; fade(terms[s], keep * vT);
    });
    als.forEach((g, i) => {
      g.position.y = g.userData.base + (i + 0.5) * vGap * GAPA + (1 - vAl) * 6; g.rotation.y = spin;
      g.position.x = (1 - vAl) * (i ? 14 : -14); fade(g, vAl);
      g.userData.mat.emissiveIntensity = vGlow * (0.55 + 0.45 * Math.sin(t * 4));
    });
    ions.forEach((g, i) => {
      g.position.y = g.userData.base + (i + 0.5) * vGap * GAPA; g.rotation.y = spin;
      g.children.forEach((m) => (m.position.y = Math.sin(t * 1.6 + m.userData.ph) * 0.6));
      fade(g, cur === 4 ? Math.max(0, (vGap - 0.3) / 0.7) : 0);
    });
    cell.visible = ui.cell && cur <= 1; cell.rotation.y = spin;
    const L = ui.labels;
    lab.slab.visible = L && cur <= 2; lab.slab.position.set(-cx - 6, 0, 0);
    lab.al.visible = L && cur <= 1; lab.al.position.set(-cx - 6, 0.25 * c, 0);
    lab.cc.visible = L && ui.cell && cur <= 1; lab.cc.position.set(corners[0][0] - 2.5, c / 2, corners[0][1]);
    lab.tx.visible = L && cur === 3; lab.tx.position.set(0, -(zTi2 * c + 1.1) - 2.4, cz * 0.6);
    lab.li.visible = L && cur === 4; lab.li.position.set(0, als[0].position.y + 3, cz * 0.8);
    lab.flake.visible = L && cur === 5; lab.flake.position.set(0, zTi2 * c + 5, 0);
    filmLab.visible = L && STEPS[cur].film && cur === 6;
    // film scene
    const thick = cur === 7 ? 0.5 + 0.5 * Math.sin(t * 0.9) : 1;   // 0 thin … 1 thick
    flakeList.forEach((m) => (m.visible = m.userData.layer <= Math.round(thick * 6)));
    flakeMat.opacity = cur === 7 ? 0.5 + thick * 0.45 : 0.92;
    rays.forEach((r) => { r.visible = cur === 7; r.material.opacity = 0.32 - thick * 0.22; });
    elec.forEach((e) => { const ph = (t * 0.12 + e.s) % 1; e.m.position.set(-75 + ph * 150, e.y * (cur === 7 ? thick : 1), e.z + Math.sin(ph * 14) * 3); e.m.visible = cur >= 6; });
    if (cur === 7) { const dot = document.getElementById("trsDot"); if (dot) { const i = Math.round((1 - thick) * 100); const lr = -1 + i * 3 / 100; const Rs = Math.pow(10, lr); const T = Math.pow(1 + 6 / (2 * Rs * 10), -2); dot.setAttribute("cx", (30 + i * 2.6).toFixed(1)); dot.setAttribute("cy", (140 - T * 120).toFixed(1)); } }
    ctl.update(); renderer.render(scene, cam); window.__ready = true;
    if (!MANUAL) requestAnimationFrame(() => frame());
  }
  window.__tick = (dt) => frame(dt);     // manual mode: one deterministic frame per call (video export)
  if (MANUAL) frame(0); else frame();
})();
