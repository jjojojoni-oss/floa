/* Tiup Lilin: kue pandan-stroberi di atas tatakan, meja bertaplak kawung, lilin, api, asap,
   bendera pesta, balon, dan dua latar ruang (temaram + terang). Kue dan posisi lilin memakai kanvas 440×480. */
(() => {
  const F = window.FLOA;
  const { el, painted, dabs, mix, jitter, ramp, petal, leaf } = F;
  const W = 440, H = 480;

  const CREAM = { base: '#fff0d6', light: '#fffdf6', dark: '#e9cba3', deep: '#c9a077' };
  const PINK = { light: '#ffc9d2', mid: '#f08aa4', dark: '#b9486f' };
  const PANDAN = { light: '#dcebae', mid: '#a5cf86', dark: '#5c9960' };
  const SHADOW = '#3a1d12';

  const TOP = { cx: 220, cy: 206, rx: 92, ry: 17, h: 80 };
  const BOT = { cx: 220, cy: 286, rx: 146, ry: 25, h: 100 };

  const edge = (e, x, dy = 0) => e.cy + dy + e.ry * Math.sqrt(Math.max(0, 1 - ((x - e.cx) / e.rx) ** 2));
  const ellipse = (cx, cy, rx, ry) => `M${cx - rx},${cy}a${rx},${ry} 0 1 0 ${rx * 2},0a${rx},${ry} 0 1 0 ${-rx * 2},0Z`;
  const bodyPath = (e) => `M${e.cx - e.rx},${e.cy}L${e.cx - e.rx},${e.cy + e.h}A${e.rx},${e.ry} 0 0 0 ${e.cx + e.rx},${e.cy + e.h}L${e.cx + e.rx},${e.cy}Z`;

  /** Lapisan krim: permukaan atas + lelehan di sisi depan. */
  function frostingPath(e, depths) {
    const m = depths.length, x0 = e.cx - e.rx, w = (2 * e.rx) / m;
    let d = `M${x0},${e.cy}`;
    for (let k = 0; k < m; k++) {
      const xa = x0 + k * w, xb = xa + w;
      const yb = edge(e, xa + w / 2) + depths[k];
      const y2 = k === m - 1 ? e.cy : edge(e, xb) + 4;
      d += `C${xa},${yb} ${xb},${yb} ${xb},${y2}`;
    }
    return `${d}A${e.rx},${e.ry} 0 0 0 ${x0},${e.cy}Z`;
  }

  /** Sisi kue: sapuan melengkung mengikuti lingkar kue; terang di kiri, teduh di kanan. */
  function tier(svg, R, e, pal, n) {
    const stops = [[0, pal.mid], [0.2, pal.light], [0.58, pal.mid], [1, pal.dark]];
    return painted(svg, bodyPath(e), {
      base: F.linGrad(svg, stops, e.cx - e.rx, 0, e.cx + e.rx, 0), n, R, filter: 'impastoH', cast: 'cast',
      stroke: () => {
        const v = R(), L = e.rx * (0.3 + R() * 0.5);
        const xm = e.cx - e.rx + R() * 2 * e.rx, x1 = xm - L / 2, x2 = xm + L / 2;
        const y = e.cy + v * e.h;
        const at = (x) => y + (edge(e, Math.max(e.cx - e.rx, Math.min(e.cx + e.rx, x))) - e.cy);
        let c = ramp(stops, (xm - (e.cx - e.rx)) / (2 * e.rx));
        if (v > 0.75) c = mix(c, pal.dark, 0.25);
        if (R() < 0.12) c = mix(c, pal.light, 0.5);
        return { d: `M${x1},${at(x1)}Q${xm},${2 * at(xm) - (at(x1) + at(x2)) / 2} ${x2},${at(x2)}`, color: jitter(c, 8, R), width: 8 + R() * 13, opacity: 0.35 + R() * 0.45 };
      },
    });
  }

  /** Krim yang disapu kuas: pusaran di permukaan atas, sapuan turun di lelehan. */
  function frosting(svg, R, e, depths, n) {
    return painted(svg, frostingPath(e, depths), {
      base: CREAM.base, n, R, filter: 'impasto', cast: 'cast',
      stroke: () => {
        if (R() < 0.55) {
          const a = R() * Math.PI * 2, k = 0.25 + R() * 0.7, da = 0.25 + R() * 0.5;
          const p = (t, kk) => `${e.cx + Math.cos(t) * e.rx * kk},${e.cy + Math.sin(t) * e.ry * kk}`;
          const shade = Math.cos(a - Math.PI * 0.25); // > 0 = sisi kanan-bawah
          const c = shade > 0 ? mix(CREAM.base, CREAM.dark, shade * 0.6) : mix(CREAM.base, CREAM.light, -shade * 0.9);
          return { d: `M${p(a, k)}Q${p(a + da / 2, k * 1.06)} ${p(a + da, k)}`, color: jitter(c, 5, R), width: 6 + R() * 9, opacity: 0.5 + R() * 0.4 };
        }
        const x = e.cx - e.rx + R() * 2 * e.rx, y = edge(e, x) - 4 + R() * 10, L = 10 + R() * 26;
        const t = (x - (e.cx - e.rx)) / (2 * e.rx);
        const c = t > 0.6 ? mix(CREAM.base, CREAM.dark, (t - 0.6) * 1.5) : mix(CREAM.base, CREAM.light, R() * 0.8);
        return { d: `M${x},${y}q${(R() - 0.5) * 6},${L / 2} ${(R() - 0.5) * 4},${L}`, color: jitter(c, 5, R), width: 7 + R() * 9, opacity: 0.5 + R() * 0.4 };
      },
    });
  }

  /** Semprotan krim melingkari dasar tiap tingkat. */
  function piping(svg, R, e, m, r) {
    const g = el('g', { filter: 'url(#cast)' }, svg);
    dabs(g, { n: m + 1, R, filter: 'impastoFine', place: (k) => { const x = e.cx - e.rx + 8 + (k * (2 * e.rx - 16)) / m; return { x, y: edge(e, x, e.h) - r * 0.55, rx: r, ry: r * 0.9, color: jitter(k / m > 0.65 ? mix(CREAM.base, CREAM.dark, 0.5) : CREAM.base, 4, R), opacity: 1 }; } });
    dabs(g, { n: m + 1, R, filter: null, place: (k) => { const x = e.cx - e.rx + 8 + (k * (2 * e.rx - 16)) / m; return { x: x - r * 0.25, y: edge(e, x, e.h) - r * 0.85, rx: r * 0.42, ry: r * 0.34, color: CREAM.light, opacity: 0.85 }; } });
  }

  function sprinkles(svg, R) {
    const g = el('g', { filter: 'url(#cast)' }, svg);
    const cols = ['#fff6e2', '#ffd24a', '#7fd1c7', '#b7a2ee', '#ffffff', '#ff9d5c'];
    for (let i = 0; i < 26; i++) {
      const x = BOT.cx - BOT.rx + 16 + R() * (2 * BOT.rx - 32), y = BOT.cy + 44 + R() * 34 + (edge(BOT, x) - BOT.cy);
      const a = R() * Math.PI, L = 6 + R() * 4;
      el('path', { d: `M${x - Math.cos(a) * L},${y - Math.sin(a) * L}L${x + Math.cos(a) * L},${y + Math.sin(a) * L}`, stroke: cols[i % cols.length], 'stroke-width': 4.4, 'stroke-linecap': 'round' }, g);
    }
  }

  /** Tatakan kue porselen. */
  function stand(svg, R) {
    const POR = { base: '#f6ebd9', light: '#fffdf7', dark: '#cdb597' };
    el('ellipse', { cx: 224, cy: 461, rx: 128, ry: 13, fill: SHADOW, opacity: 0.34, filter: 'url(#soft)' }, svg);
    const flat = (d, n, cx, rx, cast) => painted(svg, d, {
      base: F.linGrad(svg, [[0, POR.base], [0.25, POR.light], [1, POR.dark]], cx - rx, 0, cx + rx, 0), n, R, filter: 'impastoH', cast,
      stroke: () => { const x = cx - rx + R() * 2 * rx, L = 20 + R() * 60, t = (x - cx + rx) / (2 * rx); return { d: `M${x - L / 2},${380 + R() * 80}q${L / 2},${4 + R() * 4} ${L},0`, color: jitter(t > 0.6 ? mix(POR.base, POR.dark, (t - 0.6) * 1.8) : mix(POR.base, POR.light, R()), 5, R), width: 5 + R() * 8, opacity: 0.4 + R() * 0.4 }; },
    });
    flat(ellipse(220, 451, 80, 12), 16, 220, 80, false);
    flat(ellipse(220, 447, 80, 12), 22, 220, 80, 'cast');
    flat('M194,398Q206,424 178,447L262,447Q234,424 246,398Z', 24, 220, 44, 'cast');
    flat(ellipse(220, 398, 180, 23), 20, 220, 180, 'cast');
    flat(ellipse(220, 391, 180, 23), 70, 220, 180, false);
    el('ellipse', { cx: 220, cy: 391, rx: 156, ry: 17, fill: 'none', stroke: POR.dark, 'stroke-width': 1.6, opacity: 0.5 }, svg);
  }

  function cake(svg, R) {
    stand(svg, R);
    tier(svg, R, BOT, PINK, 190);
    sprinkles(svg, R);
    piping(svg, R, BOT, 13, 10.5);
    frosting(svg, R, BOT, [20, 40, 16, 34, 18, 46, 24, 14, 38, 20], 130);
    tier(svg, R, TOP, PANDAN, 120);
    piping(svg, R, TOP, 9, 9);
    frosting(svg, R, TOP, [16, 32, 13, 27, 38, 16, 24], 90);
    // sentuhan floa: kamboja dan daun di tepi kue
    const gr = F.flora.GREEN[1];
    leaf(svg, { len: 58, w: 24, ...gr, R, n: 14, transform: 'translate(96 300) rotate(-64)', curve: -0.2 });
    leaf(svg, { len: 50, w: 22, ...F.flora.GREEN[0], R, n: 12, transform: 'translate(100 304) rotate(-118)', curve: 0.2 });
    F.flora.flowers.kamboja(el('g', { transform: 'translate(106 294) rotate(20)' }, svg), R, 0.2);
    F.flora.flowers.melati(el('g', { transform: 'translate(142 304) rotate(40)' }, svg), R, 0.36);
    leaf(svg, { len: 46, w: 20, ...gr, R, n: 12, transform: 'translate(352 384) rotate(72)', curve: 0.2 });
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(346 380) rotate(-30)' }, svg), R, 0.17);
  }
  F.sprites['lilin-kue'] = { w: W, h: H, seed: 411, draw: cake };

  /** Posisi lilin (dasar batang) di kanvas kue untuk 3–5 batang. Dipakai juga oleh template. */
  const candleSpots = (n) => {
    const span = n <= 3 ? 92 : n === 4 ? 122 : 142;
    return Array.from({ length: n }, (_, i) => ({ x: TOP.cx + (n === 1 ? 0 : i / (n - 1) - 0.5) * span, y: TOP.cy + (i % 2 === 0 ? -5 : 6) }));
  };

  const CANDLES = [
    { mid: '#ee6a58', light: '#ffb7a0', dark: '#a8322f' },
    { mid: '#3fa39a', light: '#a3dccb', dark: '#1f6660' },
    { mid: '#ffb52e', light: '#ffe08a', dark: '#c9781a' },
    { mid: '#8e72d0', light: '#cdbdf2', dark: '#523a94' },
    { mid: '#f47a9c', light: '#ffc6d2', dark: '#b03a63' },
  ];
  /** Lilin bergaris, kanvas 44×150; dasar di (22,142), ujung sumbu di (22,28). */
  function candle(svg, R, pal) {
    const g = el('g', {}, svg);
    el('ellipse', { cx: 23, cy: 144, rx: 15, ry: 5, fill: SHADOW, opacity: 0.25, filter: 'url(#blur2)' }, g);
    const p = painted(g, 'M13,45a5,5 0 0 1 5,-5h8a5,5 0 0 1 5,5V142H13Z', {
      base: F.linGrad(svg, [[0, pal.light], [0.4, pal.mid], [1, pal.dark]], 13, 0, 31, 0), n: 26, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 14 + R() * 16, y = 44 + R() * 80, t = (x - 13) / 18; return { d: `M${x},${y}l${(R() - 0.5) * 2},${14 + R() * 22}`, color: jitter(t > 0.6 ? mix(pal.mid, pal.dark, 0.6) : mix(pal.mid, pal.light, R() * 0.8), 6, R), width: 3 + R() * 3, opacity: 0.5 + R() * 0.4 }; },
    });
    for (let k = 0; k < 4; k++) { const y = 62 + k * 24; el('path', { d: `M10,${y + 7}L34,${y - 9}`, stroke: '#fffaf0', 'stroke-width': 6.5, 'stroke-opacity': 0.9 }, p.inner); }
    el('path', { d: 'M27.5,46V140', stroke: pal.dark, 'stroke-width': 4, 'stroke-opacity': 0.35 }, p.inner);
    el('path', { d: 'M16,46V136', stroke: '#fff', 'stroke-width': 1.6, 'stroke-opacity': 0.55, 'stroke-linecap': 'round' }, p.inner);
    // lelehan lilin di puncak + sumbu
    dabs(g, { n: 3, R, filter: 'impastoFine', place: (k) => ({ x: 17 + k * 5, y: 41 + (k % 2) * 3, rx: 4.6, ry: 3.4, color: mix(pal.mid, pal.light, 0.6), opacity: 1 }) });
    el('path', { d: 'M22,40Q23.5,34 21.5,28', fill: 'none', stroke: '#3b2530', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
    // gundukan krim di dasar supaya menyatu dengan kue
    dabs(g, { n: 4, R, filter: 'impastoFine', place: (k) => ({ x: 13 + k * 6, y: 142 + (k % 2), rx: 6, ry: 3.6, color: jitter(k > 2 ? CREAM.dark : CREAM.base, 4, R), opacity: 1 }) });
  }
  CANDLES.forEach((pal, i) => { F.sprites[`lilin-batang-${i + 1}`] = { w: 44, h: 150, seed: 420 + i, draw(svg, R) { candle(svg, R, pal); } }; });

  /** Nyala api, kanvas 70×110; pangkal di (35,104). */
  function flame(g, R) {
    petal(g, { len: 94, w: 50, round: 0.5, skew: 0.07, stops: [[0, '#ff6b1a'], [0.3, '#ff9a24'], [0.7, '#ffc640'], [1, '#ffe58a']], shade: '#f2601a', light: '#fff0b0', R, n: 34, veins: 0, side: 0.5, filter: 'impastoFine', cast: false });
    petal(g, { len: 60, w: 27, round: 0.5, skew: 0.05, stops: [[0, '#ffd45e'], [0.5, '#fff0a8'], [1, '#fffdf0']], shade: '#ffc640', light: '#ffffff', R, n: 16, veins: 0, side: 0.3, filter: 'impastoFine', cast: false, transform: 'translate(0 -4)' });
    el('ellipse', { cx: 0, cy: -9, rx: 6, ry: 8, fill: '#7fb4ff', opacity: 0.5, filter: 'url(#blur2)' }, g);
  }
  F.sprites['lilin-api'] = { w: 70, h: 110, seed: 431, draw(svg, R) { flame(el('g', { transform: 'translate(35 104)' }, svg), R); } };

  F.sprites['lilin-asap'] = { w: 70, h: 150, seed: 432, draw(svg) {
    const g = el('g', { filter: 'url(#blur2)' }, svg);
    el('path', { d: 'M35,146C18,122 52,104 36,80C22,58 48,42 34,14', fill: 'none', stroke: '#fffaf2', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-opacity': 0.5 }, g);
    el('path', { d: 'M38,140C26,120 50,100 40,82C30,62 46,46 38,24', fill: 'none', stroke: '#ffffff', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-opacity': 0.65 }, g);
  } };

  // ── meja bundar bertaplak, kanvas 700×310; pusat permukaan di (350,70) ──
  const TAB = { cx: 350, cy: 70, rx: 338, ry: 58 };
  function kawung(svg, color, size, transform) {
    const id = F.uid('k'), s = size;
    const pt = el('pattern', { id, width: s, height: s, patternUnits: 'userSpaceOnUse', patternTransform: transform }, svg.querySelector('defs') || (svg.ownerSVGElement || svg).querySelector('defs'));
    for (const [cx, cy] of [[0, 0], [s, 0], [0, s], [s, s], [s / 2, s / 2]]) {
      for (const a of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: s * 0.2, ry: s * 0.09, fill: 'none', stroke: color, 'stroke-width': s * 0.024, transform: `rotate(${a} ${cx} ${cy}) translate(${s * 0.23} 0)` }, pt);
      el('circle', { cx, cy, r: s * 0.03, fill: color }, pt);
    }
    return `url(#${id})`;
  }
  function table(svg, R) {
    const root = svg.ownerSVGElement || svg;
    // taplak batik hijau toska dengan kawung krem
    const CL = { base: '#2f8a84', light: '#6cc2b0', dark: '#164f4e' };
    const drop = 172;
    const m = 14, w = (2 * TAB.rx) / m;
    let hem = `M${TAB.cx + TAB.rx},${TAB.cy + drop}`;
    for (let k = 0; k < m; k++) {
      const xa = TAB.cx + TAB.rx - k * w, xb = xa - w;
      hem += `Q${xa - w / 2},${edge(TAB, xa - w / 2, drop) + 20} ${xb},${edge(TAB, xb, drop)}`;
    }
    const d = `M${TAB.cx - TAB.rx},${TAB.cy}A${TAB.rx},${TAB.ry} 0 0 0 ${TAB.cx + TAB.rx},${TAB.cy}L${hem.slice(1)}Z`;
    const hang = painted(svg, d, {
      base: F.linGrad(root, [[0, CL.base], [1, mix(CL.base, CL.dark, 0.7)]], 0, TAB.cy, 0, TAB.cy + drop + 60), n: 260, R, filter: 'impasto', cast: false,
      stroke: () => {
        const x = TAB.cx - TAB.rx + R() * 2 * TAB.rx, y0 = edge(TAB, x) + R() * (drop - 20), L = 50 + R() * 100;
        const fold = Math.sin(x * 0.085) * 0.6 + Math.sin(x * 0.031 + 1) * 0.4; // lipatan kain
        const c = fold > 0 ? mix(CL.base, CL.light, fold * 0.85) : mix(CL.base, CL.dark, -fold * 0.95);
        return { d: `M${x},${y0}q${(R() - 0.5) * 8},${L / 2} ${(R() - 0.5) * 6},${L}`, color: jitter(c, 5, R), width: 12 + R() * 16, opacity: 0.4 + R() * 0.4 };
      },
    });
    el('path', { d, fill: kawung(root, '#f6e7c8', 58, 'rotate(45)'), opacity: 0.42 }, hang.inner);
    // renda krem di tepi bawah
    el('path', { d: hem, fill: 'none', stroke: '#f6e7c8', 'stroke-width': 9, 'stroke-opacity': 0.9, transform: 'translate(0 -6)' }, hang.inner);
    el('path', { d: hem, fill: 'none', stroke: '#f6e7c8', 'stroke-width': 2, 'stroke-opacity': 0.7, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round', transform: 'translate(0 -20)' }, hang.inner);
    el('path', { d: `M${TAB.cx - TAB.rx},${TAB.cy}A${TAB.rx},${TAB.ry} 0 0 0 ${TAB.cx + TAB.rx},${TAB.cy}`, fill: 'none', stroke: '#0c2f30', 'stroke-width': 30, 'stroke-opacity': 0.3, transform: 'translate(0 16)', filter: 'url(#soft)' }, hang.inner);
    // permukaan meja
    const top = painted(svg, ellipse(TAB.cx, TAB.cy, TAB.rx, TAB.ry), {
      base: F.radGrad(root, [[0, CL.light], [0.55, CL.base], [1, mix(CL.base, CL.dark, 0.5)]], TAB.cx - 40, TAB.cy - 6, TAB.rx), n: 160, R, filter: 'impastoH', cast: false,
      stroke: () => {
        const a = R() * Math.PI * 2, k = Math.sqrt(R()), x = TAB.cx + Math.cos(a) * TAB.rx * k, y = TAB.cy + Math.sin(a) * TAB.ry * k, L = 50 + R() * 120;
        return { d: `M${x - L / 2},${y}q${L / 2},${(R() - 0.5) * 6} ${L},0`, color: jitter(k > 0.65 ? mix(CL.base, CL.dark, (k - 0.65) * 1.6) : mix(CL.base, CL.light, R() * 0.9), 5, R), width: 10 + R() * 14, opacity: 0.35 + R() * 0.4 };
      },
    });
    el('path', { d: ellipse(TAB.cx, TAB.cy, TAB.rx, TAB.ry), fill: kawung(root, '#f6e7c8', 58, 'scale(1 0.34) rotate(45)'), opacity: 0.4 }, top.inner);
    el('path', { d: `M${TAB.cx - TAB.rx + 6},${TAB.cy + 2}A${TAB.rx - 6},${TAB.ry - 2} 0 0 0 ${TAB.cx + TAB.rx - 6},${TAB.cy + 2}`, fill: 'none', stroke: '#c9f0e2', 'stroke-width': 3, 'stroke-opacity': 0.55 }, svg);
  }
  // dirender 0,75× (tampil ±525px di layar): ukuran berkas lebih hemat
  F.sprites['lilin-meja'] = { w: 525, h: 233, seed: 441, draw(svg, R) { table(el('g', { transform: 'scale(0.75)' }, svg), R); } };

  // ── bendera pesta, kanvas 780×190 ──
  const FLAG_COLORS = [
    { mid: '#ee6a58', light: '#ffb7a0', dark: '#b03b35' },
    { mid: '#ffb52e', light: '#ffe08a', dark: '#cf7f1c' },
    { mid: '#3fa39a', light: '#a3dccb', dark: '#226c66' },
    { mid: '#f58ea6', light: '#ffd0da', dark: '#c0506f' },
    { mid: '#8e72d0', light: '#cdbdf2', dark: '#5a4198' },
    { mid: '#5a9f79', light: '#b7dba0', dark: '#2f6b4f' },
  ];
  function bunting(svg, R, { p0 = [-12, 20], p1 = [390, 158], p2 = [792, 20], count = 9, size = 1 } = {}) {
    const at = (t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
    el('path', { d: `M${p0}Q${p1} ${p2}`, fill: 'none', stroke: '#6b3d33', 'stroke-width': 3.4 * size, 'stroke-linecap': 'round' }, svg);
    el('path', { d: `M${p0}Q${p1} ${p2}`, fill: 'none', stroke: '#d9a98a', 'stroke-width': 1.1 * size, 'stroke-opacity': 0.7, transform: 'translate(0 -1)' }, svg);
    for (let k = 0; k < count; k++) {
      const t = 0.07 + (k * 0.86) / (count - 1);
      const [x, y] = at(t), [xb, yb] = at(t + 0.01);
      const rot = (Math.atan2(yb - y, xb - x) * 180) / Math.PI;
      const pal = FLAG_COLORS[k % FLAG_COLORS.length];
      const g = el('g', { transform: `translate(${x} ${y}) rotate(${rot + (R() - 0.5) * 8}) scale(${size})` }, svg);
      const p = painted(g, 'M-33,-2L33,-2Q20,40 0,86Q-20,40 -33,-2Z', {
        base: F.linGrad(svg, [[0, pal.light], [0.45, pal.mid], [1, pal.dark]], -33, 0, 33, 30), n: 30, R, filter: 'impastoFine', cast: 'cast',
        stroke: () => { const xx = -30 + R() * 60, yy = R() * 50, L = 14 + R() * 26; return { d: `M${xx},${yy}q${-xx * 0.08},${L / 2} ${-xx * 0.2},${L}`, color: jitter(xx > 6 ? mix(pal.mid, pal.dark, 0.55) : mix(pal.mid, pal.light, R() * 0.8), 6, R), width: 7 + R() * 8, opacity: 0.45 + R() * 0.4 }; },
      });
      el('path', { d: 'M-33,-2H33V8H-33Z', fill: '#fff6e4', opacity: 0.92 }, p.inner);
      if (k % 2 === 0) for (const [cx, cy, r] of [[0, 30, 5], [-9, 46, 3.6], [9, 46, 3.6], [0, 60, 3]]) el('circle', { cx, cy, r, fill: '#fff6e4', opacity: 0.75 }, p.inner);
    }
  }
  F.sprites['lilin-bendera'] = { w: 468, h: 114, seed: 451, draw(svg, R) { bunting(el('g', { transform: 'scale(0.6)' }, svg), R); } };

  // ── balon, kanvas 150×330 ──
  const BALLOONS = [
    { mid: '#ee6a58', light: '#ffc0aa', dark: '#a8322f' },
    { mid: '#ffb52e', light: '#ffe9a0', dark: '#c9781a' },
    { mid: '#3fa39a', light: '#b6e6d6', dark: '#1f6660' },
    { mid: '#8e72d0', light: '#dccfff', dark: '#523a94' },
  ];
  function balloon(svg, R, pal) {
    el('path', { d: 'M75,176q12,34 -3,70q-14,34 2,78', fill: 'none', stroke: '#8a5a4a', 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: 0.75 }, svg);
    el('path', { d: 'M75,176q12,34 -3,70q-14,34 2,78', fill: 'none', stroke: '#f3e2c8', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: 0.6, transform: 'translate(-1 0)' }, svg);
    const d = 'M75,10C119,10 139,50 139,86C139,128 105,160 75,166C45,160 11,128 11,86C11,50 31,10 75,10Z';
    const p = painted(svg, d, {
      base: F.radGrad(svg, [[0, pal.light], [0.45, pal.mid], [1, pal.dark]], 52, 54, 110), n: 110, R, filter: 'impasto', cast: false,
      stroke: () => {
        const a = R() * Math.PI * 2, k = 0.2 + R() * 0.78, da = 0.3 + R() * 0.6;
        const pt = (t) => `${75 + Math.cos(t) * 62 * k},${88 + Math.sin(t) * 76 * k}`;
        const sh = Math.cos(a - Math.PI * 0.25) * k; // kanan-bawah = teduh
        const c = sh > 0 ? mix(pal.mid, pal.dark, sh * 0.85) : mix(pal.mid, pal.light, -sh * 0.9);
        return { d: `M${pt(a)}Q${75 + Math.cos(a + da / 2) * 62 * k * 1.08},${88 + Math.sin(a + da / 2) * 76 * k * 1.08} ${pt(a + da)}`, color: jitter(c, 7, R), width: 9 + R() * 12, opacity: 0.4 + R() * 0.4 };
      },
    });
    el('ellipse', { cx: 48, cy: 50, rx: 13, ry: 22, fill: '#fff', opacity: 0.5, transform: 'rotate(28 48 50)', filter: 'url(#blur2)' }, p.inner);
    painted(svg, 'M75,163L66,180Q75,176 84,180Z', { base: pal.dark, n: 4, R, filter: 'impastoFine', cast: false, stroke: () => ({ d: `M${70 + R() * 10},166l0,10`, color: pal.mid, width: 3, opacity: 0.6 }) });
  }
  BALLOONS.forEach((pal, i) => { F.sprites[`lilin-balon-${i + 1}`] = { w: 150, h: 330, seed: 460 + i, draw(svg, R) { balloon(svg, R, pal); } }; });

  // ── latar ruang: dinding berwallpaper kawung, lantai kayu ──
  function room(svg, R, { wall, glow, motif, motifOp, floor, board }) {
    const LW = F.latar.W, LH = F.latar.H;
    F.latar.sky(svg, R, wall, { n: 560 });
    el('rect', { x: 0, y: 0, width: LW, height: 1296, fill: kawung(svg, motif, 132, 'rotate(45)'), opacity: motifOp }, svg);
    el('rect', { x: 0, y: 0, width: LW, height: LH, fill: F.radGrad(svg, glow, 390, 770, 640) }, svg);
    // lantai + lis
    F.wash(svg, { x: -40, y: 1300, w: LW + 80, h: 220, R, n: 150, angle: 0, len: [0.2, 0.6], width: [18, 40], opacity: [0.4, 0.8], base: floor[0], color: (u, v) => mix(floor[0], floor[1], v * 0.8 + R() * 0.2), filter: 'canvas' });
    F.wash(svg, { x: -40, y: 1272, w: LW + 80, h: 34, R, n: 40, angle: 0, len: [0.2, 0.5], width: [10, 20], opacity: [0.5, 0.9], base: board[0], color: () => mix(board[0], board[1], R()), filter: 'canvas' });
    el('rect', { x: 0, y: 1300, width: LW, height: 26, fill: SHADOW, opacity: 0.22, filter: 'url(#soft)' }, svg);
  }
  F.sprites['bg-lilin'] = { w: F.latar.W, h: F.latar.H, seed: 471, scale: 1, draw(svg, R) {
    room(svg, R, {
      wall: [[0, '#1b0f2c'], [0.3, '#2c1840'], [0.55, '#472548'], [0.78, '#3a1d3a'], [1, '#22112a']],
      glow: [[0, '#ffb057', 0.4], [0.45, '#ff8e4a', 0.16], [1, '#ff8e4a', 0]],
      motif: '#c79ac4', motifOp: 0.07, floor: ['#2a1422', '#160a14'], board: ['#3c2034', '#241225'],
    });
    dabs(svg, { n: 26, R, filter: 'soft', place: (i, R2) => ({ x: R2() * 780, y: 80 + R2() * 1100, rx: 6 + R2() * 12, color: R2() < 0.5 ? '#ffcf8a' : '#ff9d6a', opacity: 0.1 + R2() * 0.14 }) });
  } };
  F.sprites['bg-lilin-terang'] = { w: F.latar.W, h: F.latar.H, seed: 472, scale: 1, draw(svg, R) {
    room(svg, R, {
      wall: [[0, '#f6c2a8'], [0.3, '#f9d2b6'], [0.6, '#fde3c8'], [1, '#f7d7b8']],
      glow: [[0, '#fffaf0', 0.75], [0.5, '#fff1d6', 0.3], [1, '#fff1d6', 0]],
      motif: '#d98c6c', motifOp: 0.22, floor: ['#c98f6a', '#9a6144'], board: ['#f7e3c9', '#dcbf9c'],
    });
    dabs(svg, { n: 60, R, filter: 'impastoFine', place: (i, R2) => ({ x: R2() * 780, y: R2() * 1250, rx: 4 + R2() * 6, ry: 2.5 + R2() * 3, rot: R2() * 180, color: ['#ee6a58', '#ffb52e', '#3fa39a', '#8e72d0', '#f58ea6', '#ffffff'][i % 6], opacity: 0.5 + R2() * 0.35 }) });
  } };

  // ── kartu katalog: kue menyala di ruang temaram ──
  F.sprites['cover-lilin'] = { w: 480, h: 600, seed: 481, draw(svg, R) {
    const bg = el('g', { transform: 'scale(0.62)' }, svg);
    F.latar.sky(bg, R, [[0, '#1b0f2c'], [0.35, '#30193f'], [0.7, '#4a2648'], [1, '#2a1430']], { n: 300 });
    el('rect', { x: 0, y: 0, width: 780, height: 1000, fill: kawung(svg, '#c79ac4', 132, 'rotate(45)'), opacity: 0.1 }, bg);
    el('rect', { x: 0, y: 0, width: 480, height: 600, fill: F.radGrad(svg, [[0, '#ffbe6a', 0.55], [0.5, '#ff8e4a', 0.2], [1, '#ff8e4a', 0]], 240, 250, 330) }, svg);
    table(el('g', { transform: 'translate(-90 432) scale(0.94)' }, svg), R);
    el('rect', { x: 0, y: 420, width: 480, height: 180, fill: F.linGrad(svg, [[0, '#1b0f2c', 0], [1, '#1b0f2c', 0.55]], 0, 430, 0, 600) }, svg);
    const g = el('g', { transform: 'translate(22 44) scale(0.99)' }, svg);
    cake(g, R);
    candleSpots(5).forEach((c, i) => {
      candle(el('g', { transform: `translate(${c.x - 22} ${c.y - 142})` }, g), R, CANDLES[i]);
      el('circle', { cx: c.x, cy: c.y - 150, r: 74, fill: F.radGrad(svg, [[0, '#ffe9a8', 0.75], [0.4, '#ffb347', 0.3], [1, '#ffb347', 0]], c.x, c.y - 150, 74) }, g);
      flame(el('g', { transform: `translate(${c.x} ${c.y - 112}) scale(0.62) rotate(${(R() - 0.5) * 12})` }, g), R);
    });
    dabs(svg, { n: 16, R, filter: 'soft', place: (i, R2) => ({ x: R2() * 480, y: R2() * 380, rx: 4 + R2() * 7, color: '#ffd9a0', opacity: 0.16 + R2() * 0.2 }) });
  } };

  F.lilin = { candleSpots, TOP };
})();
