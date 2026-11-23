/* Anniversary: kalender sobek di dinding rumah — papan karton merah berornamen emas, bilah seng,
   klip kertas, dinding plester bercahaya sore, bufet jati dengan cangkir blirik berisi kamboja. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf, petal, linGrad } = F;
  const WARM = '#3a1d12';
  const W = 780, H = 1500, SHELF = 1238;
  const RED = '#b3281f', MAROON = '#7a1512', GOLD = '#e8c268';

  /** bidang bebas dilukis dengan sapuan searah `dir` di dalam kotak pembatas */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90] } = {}) => painted(g, d, {
    base: cols[1], n, R, filter, cast,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.35 + R() * 0.45 };
    },
  });
  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;

  const leafShape = (len, w) => `M0,0C${w * 0.62},${-len * 0.22} ${w * 0.5},${-len * 0.74} 0,${-len}C${-w * 0.5},${-len * 0.74} ${-w * 0.62},${-len * 0.22} 0,0Z`;
  /** bayangan pelepah yang jatuh di dinding */
  function frondShadow(svg, x, y, rot, len, n, opacity = 0.16) {
    const g = el('g', { filter: 'url(#softer)', fill: '#7a5326', opacity, transform: `translate(${x} ${y}) rotate(${rot})` }, svg);
    el('path', { d: `M-5,0L5,0L3,${-len}L-3,${-len}Z` }, g);
    for (let i = 0; i < n; i++) {
      const t = 0.12 + (i / n) * 0.88;
      for (const sgn of [-1, 1]) el('path', { d: leafShape(len * (0.5 - t * 0.22), len * 0.09), transform: `translate(0 ${-len * t}) rotate(${sgn * (66 - t * 30)})` }, g);
    }
  }

  /** motif kawung sebagai pattern; mengembalikan url(#id) */
  function kawung(svg, color, size = 46, sw = 1.3) {
    const id = F.uid('kw');
    const pt = el('pattern', { id, width: size, height: size, patternUnits: 'userSpaceOnUse' }, (svg.ownerSVGElement || svg).querySelector('defs'));
    const h = size / 2;
    for (const [cx, cy] of [[0, 0], [size, 0], [0, size], [size, size], [h, h]]) {
      for (const an of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: size * 0.2, ry: size * 0.09, fill: 'none', stroke: color, 'stroke-width': sw, transform: `rotate(${an} ${cx} ${cy}) translate(${size * 0.23} 0)` }, pt);
      el('circle', { cx, cy, r: sw * 1.3, fill: color }, pt);
    }
    return `url(#${id})`;
  }

  /* ── dinding + bufet ── */
  function wall(svg, R, { props = true } = {}) {
    const tone = [[0, '#f8eed6'], [0.45, '#f3e4c4'], [0.8, '#ecd7ae'], [1, '#e2c797']];
    wash(svg, { x: -40, y: -30, w: W + 80, h: SHELF + 60, R, n: 600, angle: 85, len: [0.1, 0.26], width: [26, 64], opacity: [0.3, 0.7], base: linGrad(svg, tone, 0, 0, 0, SHELF), color: (u, v) => ramp(tone, v + (u - 0.5) * 0.12) });
    // plester tua: bercak terang-gelap samar
    dabs(svg, { n: 46, R, filter: 'soft', place: (i, R2) => ({ x: R2() * W, y: R2() * SHELF, rx: 30 + R2() * 70, ry: 18 + R2() * 40, rot: R2() * 180, color: R2() < 0.55 ? '#fffaf0' : '#c9a36a', opacity: 0.1 + R2() * 0.08 }) });
    // cahaya sore dari jendela: empat petak miring
    const light = el('g', { filter: 'url(#soft)', opacity: 0.4 }, svg);
    for (const d of ['M20,150L270,96L312,420L62,474Z', 'M300,90L540,38L582,362L342,414Z', 'M70,512L320,458L360,772L110,826Z', 'M350,452L590,400L630,714L390,766Z']) el('path', { d, fill: '#fffbe6' }, light);
    frondShadow(svg, 842, 420, -64, 600, 9, 0.17);
    frondShadow(svg, 812, 930, -80, 470, 8, 0.12);
    frondShadow(svg, -60, 1010, 70, 420, 7, 0.1);
    // retak rambut di plester
    el('path', { d: 'M690,40q-14,60 6,110t-10,120q-8,34 4,60', fill: 'none', stroke: '#a88655', 'stroke-width': 1.6, 'stroke-opacity': 0.35, filter: 'url(#blur2)' }, svg);

    // bufet jati: papan mendatar, bibir depan terang
    const teak = ['#8a5a32', '#a9713f', '#c89358'];
    wash(svg, { x: -40, y: SHELF, w: W + 80, h: H - SHELF + 30, R, n: 300, angle: 0, len: [0.25, 0.8], width: [5, 16], opacity: [0.3, 0.7], base: linGrad(svg, [[0, '#b9834a'], [1, '#8f5f34']], 0, SHELF, 0, H), filter: 'canvas', clip: `M-40,${SHELF}H${W + 40}V${H + 30}H-40Z`, color: (u, v, R2) => mix(teak[1], R2() < 0.5 ? teak[0] : teak[2], R2() * 0.7) });
    for (let k = 0; k < 3; k++) {
      const cx = 90 + R() * (W - 180), cy = SHELF + 60 + R() * 160;
      const g = el('g', { fill: 'none', stroke: '#5f3a1c', filter: 'url(#blur2)' }, svg);
      for (let r = 0; r < 4; r++) el('ellipse', { cx, cy, rx: 14 + r * 15, ry: 4 + r * 4.5, 'stroke-width': 2.2, 'stroke-opacity': 0.26 - r * 0.05 }, g);
    }
    el('path', { d: `M-20,${SHELF - 16}H${W + 20}`, stroke: WARM, 'stroke-width': 40, 'stroke-opacity': 0.14, filter: 'url(#soft)' }, svg);
    el('path', { d: `M-20,${SHELF + 3}H${W + 20}`, stroke: '#f3cf97', 'stroke-width': 6, 'stroke-opacity': 0.9, filter: 'url(#blur2)' }, svg);
    el('path', { d: `M-20,${SHELF + 16}H${W + 20}`, stroke: '#5f3a1c', 'stroke-width': 7, 'stroke-opacity': 0.22, filter: 'url(#soft)' }, svg);
    el('rect', { x: 0, y: SHELF, width: W, height: H - SHELF, fill: linGrad(svg, [[0, '#fff1cf', 0.2], [0.5, '#fff1cf', 0], [1, WARM, 0.25]], 0, SHELF, W, H) }, svg);
    if (!props) return;
    mug(el('g', { transform: `translate(628 ${SHELF + 120})` }, svg), R);
    marker(el('g', { transform: `translate(64 ${SHELF + 170}) rotate(-9)` }, svg), R);
    [[250, SHELF + 196, 60, 0.46, 'kambojaPink'], [470, SHELF + 150, -40, 0.4, 'kamboja'], [726, SHELF + 214, 110, 0.36, 'kamboja']].forEach(([x, y, rot, s, pal]) =>
      petal(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...F.flora.PAL[pal], cast: false }));
  }

  /** cangkir blirik hijau berisi kamboja; (0,0) = tengah alas cangkir */
  function mug(g, R) {
    el('ellipse', { cx: 14, cy: 4, rx: 100, ry: 17, fill: WARM, opacity: 0.3, filter: 'url(#soft)' }, g);
    const fr = F.flora;
    // daun & bunga di belakang bibir cangkir
    const back = el('g', { transform: 'translate(0 -150)' }, g);
    [[-38, 0, 230, 78, -0.2], [-8, 2, 270, 84, 0.15], [26, 1, 240, 80, 0.2], [52, 3, 200, 70, 0.25]].forEach(([a, gi, len, w, c]) => leaf(back, { len, w, ...fr.GREEN[gi], R, n: 40, transform: `rotate(${a})`, curve: c, cast: 'cast' }));
    // gagang
    el('path', { d: 'M66,-116q52,-4 50,40t-56,40', fill: 'none', stroke: '#2f7a5c', 'stroke-width': 17, 'stroke-linecap': 'round', filter: 'url(#cast)' }, g);
    el('path', { d: 'M70,-118q44,-2 43,38', fill: 'none', stroke: '#8fd0b0', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.7 }, g);
    const body = 'M-72,-150L-62,-8Q0,14 62,-8L72,-150Q0,-132 -72,-150Z';
    const p = shape(g, body, [-76, -154, 152, 160], ['#226348', '#34886a', '#7fc7a6'], R, { n: 70, dir: [0.08, 1], width: [8, 20], filter: 'impasto', cast: 'castBig' });
    // bintik blirik putih
    dabs(p.inner, { n: 120, R, filter: null, place: (i, R2) => ({ x: -70 + R2() * 140, y: -146 + R2() * 144, rx: 1.4 + R2() * 3.4, ry: 1.2 + R2() * 2.6, rot: R2() * 180, color: '#f4fbf2', opacity: 0.75 + R2() * 0.25 }) });
    el('path', { d: 'M-58,-140L-50,-14', stroke: '#c6f0dc', 'stroke-width': 9, 'stroke-opacity': 0.35, 'stroke-linecap': 'round', fill: 'none' }, p.inner);
    el('path', { d: 'M50,-140L44,-10', stroke: '#123f2d', 'stroke-width': 16, 'stroke-opacity': 0.28, 'stroke-linecap': 'round', fill: 'none' }, p.inner);
    // bibir cangkir
    el('ellipse', { cx: 0, cy: -150, rx: 72, ry: 15, fill: '#16352a' }, g);
    el('ellipse', { cx: 0, cy: -150, rx: 72, ry: 15, fill: 'none', stroke: '#1b2a3a', 'stroke-width': 5 }, g);
    el('path', { d: 'M-70,-153q70,-20 140,0', fill: 'none', stroke: '#9fb4d6', 'stroke-width': 2, 'stroke-opacity': 0.8 }, g);
    const fl = el('g', { filter: 'url(#castBig)' }, g);
    fr.flowers.kamboja(el('g', { transform: 'translate(-36 -218) rotate(14)' }, fl), R, 0.56);
    fr.flowers.kambojaPink(el('g', { transform: 'translate(48 -262) rotate(-20)' }, fl), R, 0.5);
    fr.flowers.melati(el('g', { transform: 'translate(-92 -292) rotate(8)' }, fl), R, 0.6);
    fr.flowers.melati(el('g', { transform: 'translate(98 -176) rotate(30)' }, fl), R, 0.5);
  }

  /** spidol merah tergeletak; (0,0) = ujung kiri */
  function marker(g, R) {
    el('ellipse', { cx: 96, cy: 20, rx: 100, ry: 9, fill: WARM, opacity: 0.3, filter: 'url(#soft)' }, g);
    shape(g, rrect(34, -14, 150, 28, 9), [34, -14, 150, 28], ['#8f1d17', '#c8372d', '#f0705e'], R, { n: 30, dir: [1, 0], width: [4, 9], cast: 'cast' });
    shape(g, rrect(0, -16, 58, 32, 10), [0, -16, 58, 32], ['#5f120f', '#8f1d17', '#c2473b'], R, { n: 16, dir: [1, 0], width: [4, 9], cast: 'cast' });
    el('path', { d: 'M40,-9H176', stroke: '#ffd2c6', 'stroke-width': 3, 'stroke-opacity': 0.55, 'stroke-linecap': 'round', fill: 'none' }, g);
    el('path', { d: 'M6,-10H52', stroke: '#ffb7a6', 'stroke-width': 3, 'stroke-opacity': 0.4, 'stroke-linecap': 'round', fill: 'none' }, g);
    el('rect', { x: 184, y: -8, width: 12, height: 16, rx: 3, fill: '#efe6d6' }, g);
  }

  F.sprites['bg-anniversary'] = { w: W, h: H, seed: 531, scale: 1, draw(svg, R) { wall(svg, R); } };

  /* ── papan kalender: karton merah, ornamen emas, kartus nama, mata ayam + benang ke paku ── */
  const BW = 340, BH = 466;
  function board(g, R) {
    // benang kasur dari dua mata ayam ke paku
    const tw = el('g', { fill: 'none', 'stroke-linecap': 'round', filter: 'url(#cast)' }, g);
    for (const d of [`M64,14L${BW / 2},-42`, `M${BW - 64},14L${BW / 2},-42`]) { el('path', { d, stroke: '#b99668', 'stroke-width': 3.4 }, tw); el('path', { d, stroke: '#f4e3c2', 'stroke-width': 1.2, 'stroke-dasharray': '3 4', 'stroke-opacity': 0.9 }, tw); }
    const body = rrect(0, 0, BW, BH, 12);
    const p = shape(g, body, [0, 0, BW, BH], ['#8f1d17', RED, '#cf4a38'], R, { n: 220, dir: [0.06, 1], width: [10, 26], len: [40, 130], cast: 'castBig' });
    el('rect', { x: 0, y: 0, width: BW, height: BH, fill: kawung(g, GOLD, 40, 1.2), opacity: 0.2 }, p.inner);
    // cahaya kiri-atas, teduh kanan-bawah
    el('rect', { x: 0, y: 0, width: BW, height: BH, fill: linGrad(g, [[0, '#ffd9b0', 0.2], [0.5, '#ffd9b0', 0], [1, '#2a0806', 0.28]], 0, 0, BW, BH) }, p.inner);
    // bingkai emas ganda
    el('path', { d: rrect(8, 8, BW - 16, BH - 16, 8), fill: 'none', stroke: GOLD, 'stroke-width': 2.6, 'stroke-opacity': 0.9 }, p.inner);
    el('path', { d: rrect(13, 13, BW - 26, BH - 26, 6), fill: 'none', stroke: GOLD, 'stroke-width': 1, 'stroke-opacity': 0.75 }, p.inner);
    // bidang gelap di balik blok kertas
    el('path', { d: rrect(22, 132, BW - 44, 314, 4), fill: '#4a0b09', opacity: 0.42 }, p.inner);
    // kartus nama: maroon berbingkai emas, ujungnya berlekuk
    const cart = `M52,26H288Q300,26 300,40Q314,44 314,70Q314,96 300,100Q300,114 288,114H52Q40,114 40,100Q26,96 26,70Q26,44 40,40Q40,26 52,26Z`;
    const c = shape(g, cart, [26, 26, 288, 88], ['#5a0d0b', MAROON, '#9a2a20'], R, { n: 50, dir: [1, 0.03], width: [8, 18], cast: 'cast' });
    el('path', { d: cart, fill: 'none', stroke: GOLD, 'stroke-width': 2.2 }, c.inner);
    el('path', { d: 'M58,34H282Q292,34 292,44Q306,50 306,70Q306,90 292,96Q292,106 282,106H58Q48,106 48,96Q34,90 34,70Q34,50 48,44Q48,34 58,34Z', fill: 'none', stroke: GOLD, 'stroke-width': 0.9, 'stroke-opacity': 0.7 }, c.inner);
    // sinar emas kecil di atas kartus
    const sun = el('g', { stroke: GOLD, 'stroke-linecap': 'round', opacity: 0.85 }, p.inner);
    for (let i = -3; i <= 3; i++) el('path', { d: `M${BW / 2 + i * 5},22l${i * 4},-9`, 'stroke-width': i === 0 ? 2 : 1.4 }, sun);
    // bunga kecil mengapit kartus
    const fr = F.flora;
    const L = el('g', { transform: 'translate(34 116)' }, g);
    leaf(L, { len: 52, w: 20, ...fr.GREEN[1], R, n: 12, transform: 'rotate(-110)', curve: 0.2, filter: 'impastoFine' });
    leaf(L, { len: 46, w: 18, ...fr.GREEN[0], R, n: 12, transform: 'rotate(150)', curve: -0.2, filter: 'impastoFine' });
    fr.flowers.kambojaPink(el('g', { transform: 'rotate(12)' }, L), R, 0.17);
    const Rr = el('g', { transform: `translate(${BW - 34} 116)` }, g);
    leaf(Rr, { len: 52, w: 20, ...fr.GREEN[2], R, n: 12, transform: 'rotate(110)', curve: -0.2, filter: 'impastoFine' });
    leaf(Rr, { len: 46, w: 18, ...fr.GREEN[3], R, n: 12, transform: 'rotate(-150)', curve: 0.2, filter: 'impastoFine' });
    fr.flowers.kamboja(el('g', { transform: 'rotate(-20)' }, Rr), R, 0.17);
    // mata ayam kuningan
    for (const x of [64, BW - 64]) {
      const e = el('g', { filter: 'url(#cast)' }, g);
      el('circle', { cx: x, cy: 14, r: 6.5, fill: '#c99a3c' }, e);
      el('circle', { cx: x - 1.4, cy: 12.6, r: 3.6, fill: '#f6dc8e', opacity: 0.8 }, e);
      el('circle', { cx: x, cy: 14, r: 2.8, fill: '#3a1208' }, e);
    }
    // paku
    const n = el('g', { filter: 'url(#cast)' }, g);
    el('circle', { cx: BW / 2, cy: -43, r: 6, fill: '#77706a' }, n);
    el('circle', { cx: BW / 2 - 1.6, cy: -44.6, r: 2.6, fill: '#e6e0d6' }, n);
  }
  F.sprites['anniversary-papan'] = { w: 380, h: 560, seed: 532, draw(svg, R) { board(el('g', { transform: 'translate(20 62)' }, svg), R); } };

  /* ── bilah seng penjepit blok kertas ── */
  function strip(g, R, w = 300) {
    const d = rrect(0, 0, w, 24, 3);
    const p = painted(g, d, {
      base: linGrad(g, [[0, '#f1ead8'], [0.45, '#b9b3a4'], [0.6, '#8f897c'], [1, '#c9c2b0']], 0, 0, 0, 24), n: 50, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = R() * w, y = 2 + R() * 20; return { d: `M${x},${y}l${30 + R() * 80},0`, color: jitter(ramp([[0, '#fbf6e8'], [0.5, '#aaa494'], [1, '#d6cfbd']], y / 24), 5, R), width: 2 + R() * 4, opacity: 0.4 + R() * 0.3 }; },
    });
    el('path', { d: `M3,3.4H${w - 3}`, stroke: '#ffffff', 'stroke-width': 1.8, 'stroke-opacity': 0.75 }, p.inner);
    el('path', { d: `M3,21H${w - 3}`, stroke: WARM, 'stroke-width': 2, 'stroke-opacity': 0.25 }, p.inner);
    for (const x of [26, w / 2, w - 26]) { el('circle', { cx: x, cy: 12, r: 4.6, fill: '#6e685c' }, g); el('circle', { cx: x - 1.2, cy: 10.8, r: 2, fill: '#f6f0e0', opacity: 0.9 }, g); }
  }
  F.sprites['anniversary-bilah'] = { w: 320, h: 48, seed: 533, draw(svg, R) { strip(el('g', { transform: 'translate(10 8)' }, svg), R); } };

  /* ── klip kertas ── */
  F.sprites['anniversary-klip'] = { w: 70, h: 150, seed: 534, draw(svg) {
    const d = 'M22,112V40a14,14 0 0 1 28,0V118a22,22 0 0 1 -44,0V30';
    const g = el('g', { fill: 'none', 'stroke-linecap': 'round', filter: 'url(#cast)' }, svg);
    el('path', { d, stroke: '#8a8478', 'stroke-width': 7 }, g);
    el('path', { d, stroke: '#d9d3c4', 'stroke-width': 4.4 }, g);
    el('path', { d, stroke: '#ffffff', 'stroke-width': 1.4, 'stroke-opacity': 0.85, transform: 'translate(-1 -1)' }, g);
  } };

  /* ── kartu katalog: kalender di dinding, selembar sedang melayang ── */
  const D1 = 'M38,0H62V118H82V140H18V118H38V36L16,46V22Z';
  const D4 = 'M62,0H88V88H104V110H88V140H62V110H4V90ZM62,36L30,88H62Z';
  /** lembar kalender lukisan 288×300 dengan angka 14; (0,0) = kiri-atas */
  function sheet(g, R, { digits = true, circle = false, torn = false } = {}) {
    let top = 'M0,0H288';
    if (torn) { top = 'M0,6'; for (let x = 12; x <= 288; x += 12) top += `L${x},${(x / 12) % 2 ? 0 : 7 + R() * 3}`; }
    const d = `${top}V300H0Z`;
    const p = shape(g, d, [0, 0, 288, 300], ['#eadfc6', '#fbf5e6', '#ffffff'], R, { n: 70, dir: [1, 0.02], width: [10, 22], len: [40, 120], cast: 'castBig' });
    shape(p.inner, 'M0,14H288V56H0Z', [0, 14, 288, 42], ['#8f1d17', '#c8372d', '#e66a55'], R, { n: 26, dir: [1, 0], width: [6, 14] });
    el('path', { d: 'M70,35h60M168,35h50', stroke: '#fff3da', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-opacity': 0.9, fill: 'none' }, p.inner);
    if (digits) {
      const dg = el('g', { transform: 'translate(33 84) scale(1.12)' }, p.inner);
      shape(dg, D1, [10, 0, 80, 140], ['#2a1510', '#3a2018', '#6a4636'], R, { n: 26, dir: [0.1, 1], width: [6, 12] });
      shape(el('g', { transform: 'translate(94 0)' }, dg), D4, [0, 0, 106, 140], ['#2a1510', '#3a2018', '#6a4636'], R, { n: 30, dir: [0.1, 1], width: [6, 12] });
    }
    el('path', { d: 'M92,268h104', stroke: '#6a4636', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-opacity': 0.55, fill: 'none' }, p.inner);
    el('path', { d: 'M0,0H288V300H0Z', fill: linGrad(g, [[0, '#fff', 0], [1, WARM, 0.12]], 0, 0, 288, 300) }, p.inner);
    if (circle) {
      const c = el('g', { fill: 'none', stroke: '#d2382b', 'stroke-linecap': 'round', filter: 'url(#wobble)' }, g);
      el('path', { d: 'M150,66C250,58 292,118 278,176C262,246 150,268 74,246C8,226 -6,140 42,96C74,66 130,58 176,70', 'stroke-width': 7, 'stroke-opacity': 0.92 }, c);
    }
    return p;
  }

  /* ── cap karet milestone: cincin tinta merah dengan tinta yang tidak rata (angka & satuan dari DOM) ── */
  F.sprites['anniversary-cap'] = { w: 220, h: 220, seed: 536, draw(svg, R) {
    const id = F.uid('m');
    const defs = svg.querySelector('defs');
    const mask = el('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 220, height: 220 }, defs);
    el('rect', { width: 220, height: 220, fill: '#fff' }, mask);
    // bercak tinta yang tidak menempel
    for (let i = 0; i < 150; i++) {
      const a = R() * Math.PI * 2, r = 50 + R() * 58;
      el('circle', { cx: 110 + Math.cos(a) * r, cy: 110 + Math.sin(a) * r, r: 0.6 + R() * (R() < 0.12 ? 4.2 : 1.6), fill: '#000', opacity: 0.5 + R() * 0.5 }, mask);
    }
    for (let i = 0; i < 6; i++) {
      const a = R() * Math.PI * 2;
      el('path', { d: `M${110 + Math.cos(a) * 60},${110 + Math.sin(a) * 60}l${(R() - 0.5) * 60},${(R() - 0.5) * 18}`, stroke: '#000', 'stroke-width': 1 + R() * 2, opacity: 0.7 }, mask);
    }
    const ink = '#c42a20';
    const g = el('g', { mask: `url(#${id})`, filter: 'url(#wobble)', fill: 'none', stroke: ink, 'stroke-linecap': 'round' }, svg);
    el('circle', { cx: 110, cy: 110, r: 100, 'stroke-width': 8 }, g);
    el('circle', { cx: 110, cy: 110, r: 87, 'stroke-width': 2.6 }, g);
    el('circle', { cx: 110, cy: 110, r: 78, 'stroke-width': 2, 'stroke-dasharray': '1.5 7' }, g);
  } };

  F.sprites['cover-anniversary'] = { w: 480, h: 600, seed: 535, draw(svg, R) {
    wall(el('g', { transform: 'translate(0 -244) scale(0.6154)' }, svg), R, { props: false });
    const cal = el('g', { transform: 'translate(104 76) scale(0.8)' }, svg);
    board(cal, R);
    // blok kertas: tepi tumpukan + lembar teratas
    const blk = el('g', { transform: 'translate(26 140)' }, cal);
    for (let i = 5; i >= 1; i--) el('path', { d: `M${i * 0.6},${300 + i * 2.2}H${288 - i * 0.6}`, stroke: i % 2 ? '#d9cdb2' : '#f6efdd', 'stroke-width': 2.4 }, blk);
    sheet(blk, R, { circle: true });
    strip(el('g', { transform: 'translate(20 128)' }, cal), R);
    // selembar yang baru disobek, melayang
    sheet(el('g', { transform: 'translate(300 372) rotate(19) scale(0.5)' }, svg), R, { digits: false, torn: true });
    sheet(el('g', { transform: 'translate(22 440) rotate(-24) scale(0.42)' }, svg), R, { digits: false, torn: true });
    // bufet: cangkir blirik & spidol
    mug(el('g', { transform: 'translate(398 588) scale(0.5)' }, svg), R);
    marker(el('g', { transform: 'translate(150 566) rotate(-8) scale(0.5)' }, svg), R);
    petal(el('g', { transform: 'translate(96 566) rotate(50) scale(0.34)', filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...F.flora.PAL.kambojaPink, cast: false });
  } };
})();
