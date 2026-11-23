/* Layar kunci kado: kain sutra krem berlipat, pita beludru marun bermotif kawung emas,
   gembok kuningan berukir (badan & sengkang terpisah supaya sengkangnya bisa terangkat),
   dan anak kunci yang diikat benang merah dengan seuntai ronce melati. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, mix, jitter, linGrad, radGrad, leaf } = F;
  const WARM = '#3a1d12';
  const BRASS = { hi: '#fff4cc', light: '#f1d58a', base: '#c99a3e', mid: '#a87a26', dark: '#6e4b14', deep: '#47300b' };
  const MAROON = { light: '#a2384a', base: '#7a1f31', dark: '#4e0f1d' };

  const STOPS_V = [[0, BRASS.dark], [0.16, BRASS.base], [0.36, BRASS.light], [0.48, BRASS.hi], [0.6, BRASS.light], [0.84, BRASS.mid], [1, BRASS.deep]];
  /** bidang logam dipoles: gradien silinder + sapuan halus yang warnanya mengikuti gradien itu */
  function metal(parent, d, box, { dir = [0, 1], n = 60, cast = 'cast', stops = STOPS_V, across = 'x' } = {}) {
    const R = parent.__R;
    const [x, y, w, h] = box;
    const base = across === 'x' ? linGrad(parent, stops, x, y, x + w, y) : linGrad(parent, stops, x, y, x + w, y + h);
    return painted(parent, d, {
      base, n, R, filter: 'impastoFine', cast,
      stroke: () => {
        const u = R(), v = R();
        const sx = x + u * w, sy = y + v * h, L = Math.max(w, h) * (0.12 + R() * 0.26);
        const t = across === 'x' ? u : (u + v) / 2;
        const col = F.ramp(stops, Math.min(1, Math.max(0, t + (R() - 0.5) * 0.06)));
        return { d: `M${sx},${sy}l${dir[0] * L},${dir[1] * L}`, color: jitter(col, 4, R), width: 3 + R() * 6, opacity: 0.18 + R() * 0.22 };
      },
    });
  }

  /* ───────────── latar: sutra krem dengan lipatan lembut ───────────── */
  F.sprites['bg-kunci'] = { w: 780, h: 1500, seed: 601, scale: 1, draw(svg, R) {
    const stops = [[0, '#fbf2e4'], [0.45, '#f6e6d0'], [1, '#ecd5b9']];
    wash(svg, { x: -60, y: -40, w: 900, h: 1580, R, n: 520, angle: 62, len: [0.3, 0.8], width: [18, 52], opacity: [0.18, 0.42], base: linGrad(svg, stops, 0, 0, 780, 1500), color: (u, v) => F.ramp(stops, v * 0.8 + u * 0.2) });
    // lipatan sutra: pita terang & teduh yang melengkung diagonal
    const folds = [[-120, 260, 0.9], [60, 640, 1.1], [-40, 1060, 0.8], [260, 1320, 1]];
    folds.forEach(([x0, y0, k]) => {
      const d = `M${x0},${y0}C${x0 + 260 * k},${y0 - 120 * k} ${x0 + 520 * k},${y0 + 140 * k} ${x0 + 980},${y0 - 60 * k}`;
      el('path', { d, fill: 'none', stroke: '#fffaf1', 'stroke-width': 70 * k, 'stroke-opacity': 0.55, filter: 'url(#softer)', 'stroke-linecap': 'round' }, svg);
      el('path', { d, fill: 'none', stroke: '#b98e63', 'stroke-width': 34 * k, 'stroke-opacity': 0.22, filter: 'url(#softer)', transform: `translate(0 ${54 * k})`, 'stroke-linecap': 'round' }, svg);
    });
    // kilau sutra dari kiri-atas, teduh ke kanan-bawah
    el('ellipse', { cx: 220, cy: 330, rx: 520, ry: 560, fill: '#fffbf2', opacity: 0.5, filter: 'url(#softer)' }, svg);
    el('rect', { width: 780, height: 1500, fill: linGrad(svg, [[0, '#ffffff', 0], [0.6, '#ffffff', 0], [1, '#6b4426', 0.22]], 0, 0, 780, 1500) }, svg);
    // motif kawung tenun samar di kain
    const kw = el('g', { opacity: 0.028, fill: 'none', stroke: '#8a5a2e', 'stroke-width': 2 }, svg);
    for (let y = 60; y < 1500; y += 92) for (let x = (y / 92) % 2 ? 46 : 0; x < 800; x += 92) {
      for (const a of [45, 135, 225, 315]) el('ellipse', { cx: x, cy: y, rx: 20, ry: 9, transform: `rotate(${a} ${x} ${y}) translate(23 0)` }, kw);
    }
    // bunga & kelopak berserakan di tepi (rangkaian hantaran)
    const fl = el('g', { filter: 'url(#castBig)' }, svg);
    const gr = F.flora.GREEN;
    [[-20, 1500, -40], [800, 1490, 220]].forEach(([x, y, a], i) => {
      const g = el('g', { transform: `translate(${x} ${y}) rotate(${a})` }, svg);
      [[-30, 0, 260, 90], [0, 1, 300, 100], [32, 2, 240, 84]].forEach(([r, gi, len, w]) => leaf(g, { len, w, ...gr[gi], R, n: 34, transform: `rotate(${r * (i ? -1 : 1)})`, curve: 0.15, cast: 'castBig' }));
    });
    F.flora.flowers.kamboja(el('g', { transform: 'translate(110 1400) rotate(-18)' }, fl), R, 0.62);
    F.flora.flowers.melati(el('g', { transform: 'translate(250 1460) rotate(20)' }, fl), R, 0.6);
    F.flora.flowers.melati(el('g', { transform: 'translate(40 1250) rotate(-30)' }, fl), R, 0.48);
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(690 1390) rotate(24)' }, fl), R, 0.56);
    F.flora.flowers.melati(el('g', { transform: 'translate(560 1470) rotate(-10)' }, fl), R, 0.52);
    F.flora.flowers.melati(el('g', { transform: 'translate(740 120) rotate(40)' }, fl), R, 0.42);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(40 90) rotate(140)' }, fl), R, 0.42);
    [[160, 1290, 30, 0.42, 'melati'], [620, 1260, -60, 0.4, 'kambojaPink'], [420, 1440, 90, 0.36, 'kamboja'], [700, 300, -20, 0.34, 'melati'], [60, 420, 60, 0.32, 'kamboja']].forEach(([x, y, r, s, pal]) =>
      F.petal(el('g', { transform: `translate(${x} ${y}) rotate(${r}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...F.flora.PAL[pal], cast: false }));
  } };

  /* ───────────── pita beludru marun bermotif kawung emas, dengan simpul di bawah ───────────── */
  F.sprites['kunci-pita'] = { w: 120, h: 470, seed: 602, draw(svg, R) {
    svg.__R = R;
    const d = 'M34,-10H86L84,380Q60,392 36,380Z';
    const p = painted(svg, d, {
      base: linGrad(svg, [[0, MAROON.dark], [0.3, MAROON.base], [0.55, MAROON.light], [0.75, MAROON.base], [1, MAROON.dark]], 34, 0, 86, 0), n: 90, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 36 + R() * 48, y = R() * 380; return { d: `M${x},${y}l${(R() - 0.5) * 2},${30 + R() * 50}`, color: jitter(mix(MAROON.base, R() < 0.5 ? MAROON.light : MAROON.dark, R() * 0.7), 6, R), width: 2 + R() * 4, opacity: 0.35 + R() * 0.3 }; },
    });
    // tepi emas
    el('path', { d: 'M38,-10L37,378', stroke: BRASS.light, 'stroke-width': 2.4, 'stroke-opacity': 0.8, fill: 'none' }, p.inner);
    el('path', { d: 'M82,-10L83,378', stroke: BRASS.base, 'stroke-width': 2.4, 'stroke-opacity': 0.75, fill: 'none' }, p.inner);
    // kawung emas
    const k = el('g', { fill: 'none', stroke: BRASS.light, 'stroke-width': 1.6, opacity: 0.75 }, p.inner);
    for (let y = 22; y < 370; y += 34) {
      for (const a of [45, 135, 225, 315]) el('ellipse', { cx: 60, cy: y, rx: 8, ry: 3.6, transform: `rotate(${a} 60 ${y}) translate(9.5 0)` }, k);
      el('circle', { cx: 60, cy: y, r: 1.6, fill: BRASS.light, stroke: 'none' }, k);
    }
    // kilau beludru
    el('path', { d: 'M56,-10L55,376', stroke: '#ffd6dd', 'stroke-width': 6, 'stroke-opacity': 0.16, fill: 'none', filter: 'url(#blur2)' }, p.inner);
    // simpul cincin di bawah (tempat sengkang gembok mengait)
    const loop = el('g', { filter: 'url(#cast)' }, svg);
    el('ellipse', { cx: 60, cy: 410, rx: 30, ry: 44, fill: 'none', stroke: MAROON.dark, 'stroke-width': 17 }, loop);
    el('ellipse', { cx: 60, cy: 410, rx: 30, ry: 44, fill: 'none', stroke: linGrad(svg, [[0, MAROON.light], [0.5, MAROON.base], [1, MAROON.dark]], 30, 370, 90, 450), 'stroke-width': 12 }, loop);
    el('path', { d: 'M36,388A30,44 0 0 1 72,368', fill: 'none', stroke: '#ffd6dd', 'stroke-width': 3, 'stroke-opacity': 0.35, 'stroke-linecap': 'round' }, loop);
  } };

  /* ───────────── gembok kuningan: sengkang & badan pada kanvas yang sama ───────────── */
  const LW = 260, LH = 340;
  const BODY = 'M44,150Q44,132 64,130H196Q216,132 216,150L222,262Q222,322 130,326Q38,322 38,262Z';

  F.sprites['kunci-sengkang'] = { w: LW, h: LH, seed: 603, draw(svg, R) {
    svg.__R = R;
    // sengkang: batang bulat berbentuk U, kaki kiri masuk badan, kaki kanan juga
    const outer = 'M66,176V92A64,64 0 0 1 194,92V176H168V92A38,38 0 0 0 92,92V176Z';
    metal(svg, outer, [66, 28, 128, 148], { dir: [0, 1], n: 50, stops: [[0, BRASS.dark], [0.1, BRASS.base], [0.17, BRASS.hi], [0.24, BRASS.base], [0.5, BRASS.mid], [0.76, BRASS.base], [0.84, BRASS.light], [0.92, BRASS.mid], [1, BRASS.deep]] });
    // kilap memanjang di lengkung
    el('path', { d: 'M76,170V94A54,54 0 0 1 130,40', fill: 'none', stroke: '#fffaf0', 'stroke-width': 3.2, 'stroke-opacity': 0.75, 'stroke-linecap': 'round' }, svg);
    el('path', { d: 'M186,96A56,56 0 0 0 150,44', fill: 'none', stroke: BRASS.deep, 'stroke-width': 2.4, 'stroke-opacity': 0.45, 'stroke-linecap': 'round' }, svg);
  } };

  F.sprites['kunci-gembok'] = { w: LW, h: LH, seed: 604, draw(svg, R) {
    svg.__R = R;
    // badan: kuningan tebal, sapuan mengikuti lengkung
    metal(svg, BODY, [38, 130, 184, 196], { dir: [0.08, 1], n: 90, cast: 'castBig', stops: [[0, BRASS.dark], [0.14, BRASS.base], [0.3, BRASS.light], [0.42, BRASS.hi], [0.56, BRASS.light], [0.8, BRASS.mid], [1, BRASS.deep]] });
    // cahaya dari kiri-atas, teduh ke kanan-bawah
    el('path', { d: BODY, fill: radGrad(svg, [[0, '#fff6d8', 0.55], [0.5, '#fff6d8', 0], [1, '#2a1a05', 0.38]], 92, 168, 210) }, svg);
    // bingkai ukiran di tepi badan
    const inset = 'M58,158Q58,146 72,145H188Q202,146 202,158L207,258Q207,306 130,310Q53,306 53,258Z';
    el('path', { d: inset, fill: 'none', stroke: BRASS.deep, 'stroke-width': 3, 'stroke-opacity': 0.55 }, svg);
    el('path', { d: inset, fill: 'none', stroke: '#fff3c8', 'stroke-width': 1.6, 'stroke-opacity': 0.6, transform: 'translate(-1.2 -1.4)' }, svg);
    // titik-titik ukiran (granulasi) di bahu badan
    for (let i = 0; i < 17; i++) el('circle', { cx: 82 + i * 6, cy: 152, r: 1.7, fill: BRASS.deep, opacity: 0.45 }, svg);
    // medali tengah: kawung empat kelopak di sekeliling lubang kunci
    const cx = 130, cy = 232;
    el('circle', { cx, cy, r: 50, fill: radGrad(svg, [[0, BRASS.light], [0.7, BRASS.base], [1, BRASS.mid]], cx - 14, cy - 18, 60), stroke: BRASS.deep, 'stroke-width': 2.4, 'stroke-opacity': 0.6 }, svg);
    el('circle', { cx, cy, r: 50, fill: 'none', stroke: '#fff4cc', 'stroke-width': 1.4, 'stroke-opacity': 0.7, transform: 'translate(-1 -1.2)' }, svg);
    const kw = el('g', { fill: 'none', stroke: BRASS.deep, 'stroke-width': 2.6, 'stroke-opacity': 0.62 }, svg);
    for (const a of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: 19, ry: 9, transform: `rotate(${a} ${cx} ${cy}) translate(27 0)` }, kw);
    const kwl = el('g', { fill: 'none', stroke: '#fff4cc', 'stroke-width': 1.2, 'stroke-opacity': 0.55 }, svg);
    for (const a of [45, 135, 225, 315]) el('ellipse', { cx: cx - 0.8, cy: cy - 1, rx: 19, ry: 9, transform: `rotate(${a} ${cx} ${cy}) translate(27 0)` }, kwl);
    // sulur kecil di bawah medali
    // lubang kunci: cekung gelap dengan tepi kuningan
    const hole = `M${cx},${cy - 15}a10,10 0 0 1 6.5,17.6L141,${cy + 18}H119L123.5,${cy + 2.6}A10,10 0 0 1 ${cx},${cy - 15}Z`;
    el('path', { d: hole, fill: BRASS.deep, transform: 'translate(0 1.6)', opacity: 0.6 }, svg);
    el('path', { d: hole, fill: linGrad(svg, [[0, '#120a02'], [1, '#3a2508']], 0, cy - 15, 0, cy + 18) }, svg);
    el('path', { d: hole, fill: 'none', stroke: '#fff4cc', 'stroke-width': 1.4, 'stroke-opacity': 0.55, transform: 'translate(0.8 1.2)' }, svg);
    // keling di bahu badan
    [[66, 160], [194, 160]].forEach(([x, y]) => {
      el('circle', { cx: x, cy: y, r: 6.5, fill: radGrad(svg, [[0, BRASS.hi], [0.6, BRASS.base], [1, BRASS.dark]], x - 2, y - 2, 8) }, svg);
    });
    // kamboja kecil terselip di sudut (sentuhan floa)
    const fl = el('g', { filter: 'url(#cast)' }, svg);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(206 300) rotate(-24)' }, fl), R, 0.22);
    leaf(svg, { len: 46, w: 20, ...F.flora.GREEN[1], R, n: 10, transform: 'translate(212 312) rotate(118)', cast: 'cast', filter: 'impastoFine' });
  } };

  /* ───────────── anak kunci kuningan, diikat benang merah & ronce melati ───────────── */
  F.sprites['kunci-anak'] = { w: 170, h: 330, seed: 605, draw(svg, R) {
    svg.__R = R;
    const g = el('g', { transform: 'translate(70 0)' }, svg);
    g.__R = R;
    // kepala kunci: cincin berukir dengan empat kelopak kawung berlubang
    const bow = 'M0,14a40,40 0 1 1 0,80a40,40 0 1 1 0,-80Z';
    metal(g, bow, [-40, 14, 80, 80], { dir: [1, 1], n: 30, across: 'xy', stops: [[0, BRASS.dark], [0.25, BRASS.base], [0.45, BRASS.hi], [0.6, BRASS.light], [1, BRASS.deep]] });
    const holes = el('g', { fill: '#2b1a05', opacity: 0.85 }, g);
    for (const a of [45, 135, 225, 315]) el('ellipse', { cx: 0, cy: 54, rx: 12, ry: 6, transform: `rotate(${a} 0 54) translate(17 0)` }, holes);
    el('circle', { cx: 0, cy: 54, r: 4, fill: BRASS.light }, g);
    el('path', { d: 'M-30,40a36,36 0 0 1 30,-22', fill: 'none', stroke: '#fffaf0', 'stroke-width': 2.4, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, g);
    // leher & batang
    metal(g, 'M-9,92H9L7,104H-7Z', [-9, 92, 18, 12], { dir: [1, 0], n: 8 });
    metal(g, 'M-6,102H6V262H-6Z', [-6, 102, 12, 160], { dir: [0, 1], n: 24, stops: [[0, BRASS.dark], [0.3, BRASS.light], [0.5, BRASS.hi], [0.75, BRASS.base], [1, BRASS.deep]] });
    [128, 140].forEach((y) => el('rect', { x: -8, y, width: 16, height: 5, rx: 2, fill: BRASS.mid, opacity: 0.9 }, g));
    // gigi kunci
    metal(g, 'M6,226H34V238H26V246H34V262H6Z', [6, 226, 28, 36], { dir: [1, 0], n: 16 });
    el('path', { d: 'M-5,108V258', stroke: '#fffaf0', 'stroke-width': 1.6, 'stroke-opacity': 0.7, fill: 'none' }, g);
    // benang merah terikat di cincin, menjuntai dengan ronce melati
    const thread = el('g', { filter: 'url(#cast)' }, g);
    el('path', { d: 'M-26,26q-18,10 -12,30', fill: 'none', stroke: '#9e1b24', 'stroke-width': 4, 'stroke-linecap': 'round' }, thread);
    el('path', { d: 'M-34,30q-30,60 -14,130q8,40 -6,80', fill: 'none', stroke: '#b3242d', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, thread);
    el('circle', { cx: -33, cy: 31, r: 6, fill: '#8f1620' }, thread);
    // ronce: kuncup melati berderet di sepanjang benang
    const buds = el('g', { filter: 'url(#cast)' }, g);
    const pts = [[-46, 62, -10], [-52, 92, 6], [-50, 122, -4], [-44, 152, 10], [-42, 182, -8], [-46, 212, 4]];
    pts.forEach(([x, y, r], i) => {
      const s = 0.2 - i * 0.008;
      const b = el('g', { transform: `translate(${x} ${y}) rotate(${180 + r}) ` }, buds);
      F.petal(b, { len: 104 * s * 1.25, w: 54 * s * 1.25, round: 0.5, R, n: 10, side: 0.7, veins: 0, ...F.flora.PAL.melati, cast: false });
    });
    // satu melati mekar di ujung untaian
    F.flora.flowers.melati(el('g', { transform: 'translate(-50 250) rotate(14)', filter: 'url(#cast)' }, g), R, 0.42);
  } };
})();
