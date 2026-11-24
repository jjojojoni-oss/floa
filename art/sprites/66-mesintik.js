/* Mesin Tik: meja penulis di malam hari — dinding hijau-biru tua bermotif kawung, jendela lengkung dengan bulan,
   meja kayu dengan alas laken, setumpuk kertas kosong, vas kamboja. Di atasnya: lampu meja kuningan (cahayanya
   dari DOM), mesin tik hijau sage (badan, kereta dengan rol, tuas, tuts kaca satu per satu), keranjang rotan,
   bola-bola kertas remasan, lembar draf yang kusut, dan si bola kertas untuk mini-game.
   Latar memakai satuan 32 per em (780 × 1500), sama dengan .world di style.module.css.
   Semua tulisan (huruf tuts, ketikan, catatan) dipasang dari DOM di atas lukisan ini. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, linGrad, radGrad, leaf } = F;
  const W = 780, H = 1500;
  /** tepi belakang meja */
  const DESK = 912;

  const SAGE = { hi: '#f0f8e8', light: '#cbe0c6', base: '#9dc0a3', mid: '#769d83', dark: '#4f7562', deep: '#2b4a3c' };
  const BRASS = { hi: '#fff3c6', light: '#f3d27e', base: '#d5a13e', mid: '#a97823', dark: '#714a10', deep: '#432a08' };
  const CHROME = { hi: '#ffffff', light: '#e6eded', base: '#b7c3c5', mid: '#86949b', dark: '#57646d', deep: '#2f3940' };
  const INK = { hi: '#7b838c', light: '#4b525b', base: '#2d3239', mid: '#21252b', dark: '#15181c', deep: '#0b0d10' };
  const WOOD = { hi: '#dda066', light: '#bb7a48', base: '#975a35', mid: '#764226', dark: '#552c19', deep: '#33180d' };
  const AMBER = { hi: '#fff0b8', light: '#f8cf66', base: '#e2a93b', mid: '#bb8222', dark: '#865611', deep: '#52330a' };
  const RATTAN = { hi: '#f6d9a2', light: '#e0b06c', base: '#c08a48', mid: '#9a6830', dark: '#6d441c', deep: '#40250e' };
  const PAPER = ['#c9b998', '#f4ead4', '#fffaf0'];
  const RED = '#b3261e';

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const circ = (cx, cy, r) => `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}Z`;
  const ell = (cx, cy, rx, ry) => `M${cx - rx},${cy}A${rx},${ry} 0 1 1 ${cx + rx},${cy}A${rx},${ry} 0 1 1 ${cx - rx},${cy}Z`;
  const defsOf = (g) => (g.ownerSVGElement || g).querySelector('defs');
  const at = (g, tf) => el('g', { transform: tf }, g);
  function clip(g, d) {
    const id = F.uid('cl');
    el('path', { d }, el('clipPath', { id }, g));
    return el('g', { 'clip-path': `url(#${id})` }, g);
  }
  /** motif kawung sebagai pattern; mengembalikan url(#id) */
  function kawung(g, color, size = 46, sw = 1.3) {
    const id = F.uid('kw');
    const pt = el('pattern', { id, width: size, height: size, patternUnits: 'userSpaceOnUse' }, defsOf(g));
    const h = size / 2;
    for (const [cx, cy] of [[0, 0], [size, 0], [0, size], [size, size], [h, h]]) {
      for (const an of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: size * 0.2, ry: size * 0.09, fill: 'none', stroke: color, 'stroke-width': sw, transform: `rotate(${an} ${cx} ${cy}) translate(${size * 0.23} 0)` }, pt);
      el('circle', { cx, cy, r: sw * 1.3, fill: color }, pt);
    }
    return `url(#${id})`;
  }
  /** bidang bebas dilukis dengan sapuan searah `dir`; cols = [gelap, dasar, terang] */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90], base } = {}) => painted(g, d, {
    base: base || cols[1], n, R, filter, cast,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.35 + R() * 0.45 };
    },
  });
  /** logam dipoles (kuningan/krom): gradien diagonal, terang di kiri-atas, plus sapuan halus */
  const stopsOf = (P) => [[0, P.light], [0.18, P.hi], [0.4, P.light], [0.62, P.base], [0.85, P.mid], [1, P.dark]];
  function metal(g, d, box, P, R, { n = 26, cast = 'cast', dir = [0.3, 1], vertical } = {}) {
    const [x, y, w, h] = box;
    const st = stopsOf(P);
    return painted(g, d, {
      base: vertical ? linGrad(g, st, x, y, x, y + h) : linGrad(g, st, x, y, x + w, y + h), n, R, filter: 'impastoFine', cast,
      stroke: () => {
        const u = R(), v = R(), L = Math.max(w, h) * (0.1 + R() * 0.22), m = Math.hypot(dir[0], dir[1]);
        return { d: `M${x + u * w},${y + v * h}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(ramp(st, (vertical ? v : (u + v) / 2) + (R() - 0.5) * 0.08), 4, R), width: 2 + R() * 5, opacity: 0.18 + R() * 0.22 };
      },
    });
  }
  /** kamboja kecil lima kelopak (tanda floa), berpusat di (0,0) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
  function mark(g, x, y, s, fill, opacity = 1) {
    const m = el('g', { transform: `translate(${x} ${y}) scale(${s})`, opacity }, g);
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill, transform: `rotate(${i * 72})` }, m);
    el('circle', { r: 3.4, fill: mix(fill, '#fff4cc', 0.6) }, m);
  }

  /* ───────────── dinding & jendela ───────────── */
  const WALL = [[0, '#131e28'], [0.35, '#1c2b36'], [0.75, '#243845'], [1, '#2a414f']];
  function wall(svg, R) {
    wash(svg, {
      x: -40, y: -30, w: W + 80, h: DESK + 60, R, n: 560, angle: 88, len: [0.1, 0.3], width: [22, 54], opacity: [0.3, 0.65],
      base: linGrad(svg, WALL, 0, 0, 0, DESK),
      color: (u, v) => { let c = ramp(WALL, v + (R() - 0.5) * 0.12); if (R() < 0.2) c = mix(c, '#3a6068', 0.25); return c; },
    });
    // kertas dinding kawung: garis terang tipis + bayangannya
    el('rect', { x: 0, y: 0, width: W, height: DESK, fill: kawung(svg, '#06090d', 92, 2.2), opacity: 0.22, transform: 'translate(2 2.6)' }, svg);
    el('rect', { x: 0, y: 0, width: W, height: DESK, fill: kawung(svg, '#8cc0c0', 92, 2), opacity: 0.11 }, svg);
    // lis kayu tipis sedikit di atas meja
    el('rect', { x: 0, y: DESK - 86, width: W, height: 10, fill: '#0c141b', opacity: 0.35 }, svg);
    el('rect', { x: 0, y: DESK - 88, width: W, height: 3, fill: '#5b8a8e', opacity: 0.3 }, svg);
  }

  const WIN = { x: 452, y: 296, w: 270, h: 360 };
  function windowArt(svg, R) {
    const { x, y, w, h } = WIN;
    const r = w / 2;
    const arch = `M${x},${y + h}V${y + r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h}Z`;
    // cahaya bulan yang merembes ke dinding
    el('ellipse', { cx: x + r, cy: y + h * 0.5, rx: w * 1.05, ry: h * 0.86, fill: '#6e9fd2', opacity: 0.2, filter: 'url(#softer)' }, svg);
    el('path', { d: arch, fill: '#070c12', opacity: 0.6, transform: 'translate(8 10)', filter: 'url(#soft)' }, svg);
    const SKYN = [[0, '#0e1638'], [0.45, '#1e3468'], [0.8, '#45649a'], [1, '#8198b8']];
    const g = clip(svg, arch);
    wash(g, { x, y, w, h, R, n: 190, angle: -4, len: [0.25, 0.7], width: [10, 26], opacity: [0.3, 0.7], base: linGrad(svg, SKYN, 0, y, 0, y + h), color: (u, v) => ramp(SKYN, v + (R() - 0.5) * 0.06) });
    dabs(g, { n: 46, R, filter: null, place: (i, R2) => ({ x: x + R2() * w, y: y + Math.pow(R2(), 1.4) * h * 0.7, rx: R2() < 0.12 ? 2.1 : 0.8 + R2() * 0.9, color: R2() < 0.4 ? '#ffe9b8' : '#ffffff', opacity: 0.35 + R2() * 0.55 }) });
    // bulan
    const mx = x + 190, my = y + 104;
    el('circle', { cx: mx, cy: my, r: 92, fill: radGrad(svg, [[0, '#fff4cf', 0.55], [0.4, '#cfe0ff', 0.24], [1, '#cfe0ff', 0]], mx, my, 92) }, g);
    el('circle', { cx: mx, cy: my, r: 31, fill: radGrad(svg, [[0, '#fffdf0'], [0.7, '#fff0c2'], [1, '#f1d792']], mx - 8, my - 10, 40), filter: 'url(#blur2)' }, g);
    for (const [dx, dy, rr] of [[-9, -6, 6], [8, 5, 8], [-3, 13, 4], [13, -12, 3.4]]) el('circle', { cx: mx + dx, cy: my + dy, r: rr, fill: '#d9bd7c', opacity: 0.32 }, g);
    // awan tipis melintas
    const cl = el('g', { filter: 'url(#mist)' }, g);
    for (const [cx, cy, L, sw, c, o] of [[x + 110, y + 170, 170, 18, '#5370a8', 0.5], [x + 190, y + 214, 130, 12, '#7f97c4', 0.4], [x + 70, y + 96, 100, 10, '#3c5690', 0.5]]) el('path', { d: `M${cx - L / 2},${cy}q${L / 2},-8 ${L},0`, stroke: c, 'stroke-width': sw, 'stroke-linecap': 'round', fill: 'none', 'stroke-opacity': o }, cl);
    // atap-atap tetangga & nyiur di kejauhan
    const roof = `M${x},${y + h}V${y + h - 44}l28,-22l28,22v8h20v-32l38,-26l38,26v12h24l22,-18l22,18v-24h32v-18l26,-16l22,16v76Z`;
    el('path', { d: roof, fill: '#0b1230' }, g);
    for (const [dx, dy] of [[40, -22], [124, -36], [236, -32]]) { el('rect', { x: x + dx, y: y + h + dy, width: 8, height: 10, fill: '#ffc869' }, g); el('circle', { cx: x + dx + 4, cy: y + h + dy + 5, r: 14, fill: '#ffc869', opacity: 0.25, filter: 'url(#blur2)' }, g); }
    // pantulan kaca
    for (const [dx, o] of [[30, 0.07], [64, 0.05], [176, 0.05]]) el('path', { d: `M${x + dx},${y + h}l90,${-h}h22l-90,${h}Z`, fill: '#fff', opacity: o }, g);
    // kusen: bayangan dalam, bilah tengah, bingkai
    el('path', { d: arch, fill: 'none', stroke: '#05080c', 'stroke-width': 26, 'stroke-opacity': 0.45, filter: 'url(#blur2)' }, g);
    const FR = ['#2c4a52', '#527d82', '#8ab8b6'];
    const bar = (d, sw) => { el('path', { d, fill: 'none', stroke: FR[0], 'stroke-width': sw + 4, 'stroke-linecap': 'butt' }, svg); el('path', { d, fill: 'none', stroke: FR[1], 'stroke-width': sw, filter: 'url(#impastoFine)' }, svg); el('path', { d, fill: 'none', stroke: FR[2], 'stroke-width': Math.max(1.4, sw * 0.16), 'stroke-opacity': 0.75, transform: `translate(${-sw * 0.28} ${-sw * 0.28})` }, svg); };
    bar(`M${x + r},${y + 4}V${y + h}`, 9);
    bar(`M${x},${y + r + 6}H${x + w}`, 9);
    bar(arch, 17);
    // ambang jendela
    shape(svg, rrect(x - 26, y + h - 4, w + 52, 24, 5), [x - 26, y + h - 4, w + 52, 24], FR, R, { n: 26, width: [5, 10], cast: 'cast' });
    el('path', { d: `M${x - 22},${y + h - 1}H${x + w + 22}`, stroke: '#b9e0dc', 'stroke-width': 2.4, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, svg);
  }

  /* ───────────── meja ───────────── */
  function desk(svg, R) {
    const DK = [[0, WOOD.mid], [0.1, WOOD.base], [0.45, WOOD.light], [0.8, WOOD.base], [1, WOOD.mid]];
    // bayangan dinding tepat di atas tepi meja
    el('rect', { x: 0, y: DESK - 60, width: W, height: 62, fill: linGrad(svg, [[0, '#070b10', 0], [1, '#070b10', 0.6]], 0, DESK - 60, 0, DESK) }, svg);
    wash(svg, {
      x: -40, y: DESK, w: W + 80, h: H - DESK + 30, R, n: 760, angle: 0, len: [0.14, 0.5], width: [7, 20], opacity: [0.3, 0.7],
      base: linGrad(svg, DK, 0, DESK, 0, H),
      color: (u, v) => { let c = ramp(DK, v + (R() - 0.5) * 0.1); const k = R(); if (k < 0.22) c = mix(c, WOOD.dark, 0.4); else if (k < 0.4) c = mix(c, WOOD.hi, 0.32); return c; },
    });
    // serat kayu & sambungan papan
    const gr = el('g', { filter: 'url(#blur2)' }, svg);
    for (let i = 0; i < 60; i++) {
      const y = DESK + 8 + R() * (H - DESK), x = -20 + R() * W, L = 120 + R() * 420;
      el('path', { d: `M${x},${y}q${L / 2},${(R() - 0.5) * 9} ${L},${(R() - 0.5) * 5}`, fill: 'none', stroke: R() < 0.7 ? WOOD.deep : WOOD.hi, 'stroke-width': 1 + R() * 2, 'stroke-opacity': 0.14 + R() * 0.2, 'stroke-linecap': 'round' }, gr);
    }
    for (const y of [DESK + 132, DESK + 392]) {
      el('path', { d: `M-10,${y}H${W + 10}`, stroke: WOOD.deep, 'stroke-width': 3, 'stroke-opacity': 0.55 }, svg);
      el('path', { d: `M-10,${y + 3}H${W + 10}`, stroke: WOOD.hi, 'stroke-width': 1.4, 'stroke-opacity': 0.4 }, svg);
    }
    // tepi belakang meja: garis terang yang menangkap cahaya
    el('path', { d: `M-10,${DESK + 1}H${W + 10}`, stroke: '#f1bb80', 'stroke-width': 3, 'stroke-opacity': 0.55 }, svg);
    // kawung samar seperti ukiran di kayu
    el('rect', { x: 0, y: DESK + 150, width: W, height: H - DESK - 150, fill: kawung(svg, WOOD.deep, 110, 2.2), opacity: 0.09 }, svg);
    // alas laken hijau di bawah mesin tik (trapesium, tepi berjahit emas)
    const pad = 'M34,1108H746L772,1236H8Z';
    el('path', { d: pad, fill: '#1c0d06', opacity: 0.55, transform: 'translate(4 12)', filter: 'url(#soft)' }, svg);
    shape(svg, pad, [0, 1100, 780, 140], ['#143429', '#1f4a3a', '#2f6650'], R, { n: 70, width: [8, 18], filter: 'impastoH' });
    el('path', { d: 'M48,1120H732L754,1224H26Z', fill: 'none', stroke: BRASS.light, 'stroke-width': 1.8, 'stroke-opacity': 0.6, 'stroke-dasharray': '7 5' }, svg);
  }

  /** setumpuk kertas kosong di kiri depan (lembar teratasnya dipasang dari DOM supaya bisa dimasukkan ke rol) */
  function stack(svg, R) {
    const g = at(svg, 'translate(70 1252) rotate(-5)');
    const sheet = (dx, dy, rot, tone) => {
      const s = at(g, `translate(${dx} ${dy}) rotate(${rot}) skewX(-14)`);
      shape(s, rrect(0, 0, 236, 104, 3), [0, 0, 236, 104], [mix('#e6d9bb', '#8f8266', tone), mix('#f6edd8', PAPER[0], tone), mix('#fffaf0', PAPER[0], tone)], R, { n: 10, width: [14, 26], len: [60, 160], cast: 'cast' });
    };
    el('path', { d: 'M-14,112L246,112L262,30L10,30Z', fill: '#1c0d06', opacity: 0.5, transform: 'translate(14 12) skewX(-14)', filter: 'url(#soft)' }, g);
    sheet(6, 8, 2.5, 0.5); sheet(-4, 5, -2, 0.35); sheet(3, 2, 1.2, 0.2); sheet(0, 0, 0, 0);
  }

  /** vas keramik kecil berisi kamboja di belakang-kanan meja */
  function vase(svg, R) {
    const g = at(svg, 'translate(676 934)');
    // tangkai & daun
    for (const d of ['M0,-110C-6,-190 -30,-230 -34,-272', 'M4,-110C14,-170 22,-200 22,-226', 'M-2,-110C-2,-150 -50,-180 -66,-196']) {
      el('path', { d, fill: 'none', stroke: '#233f2c', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
      el('path', { d, fill: 'none', stroke: '#5d8a58', 'stroke-width': 2, 'stroke-opacity': 0.7, 'stroke-linecap': 'round', transform: 'translate(-1.4 0)' }, g);
    }
    const GR = { dark: '#1f4030', mid: '#3d7150', light: '#7fb078' };
    leaf(g, { len: 108, w: 38, ...GR, R, n: 26, transform: 'translate(-62 -194) rotate(-64)', curve: 0.2 });
    leaf(g, { len: 92, w: 34, ...GR, R, n: 22, transform: 'translate(20 -214) rotate(52)', curve: -0.2 });
    leaf(g, { len: 80, w: 30, ...GR, R, n: 20, transform: 'translate(-20 -236) rotate(-22)', curve: 0.1 });
    F.flora.flowers.kamboja(at(g, 'translate(-36 -286) rotate(14)'), R, 0.24);
    F.flora.flowers.kamboja(at(g, 'translate(26 -232) rotate(-30)'), R, 0.17);
    // badan vas
    const d = 'M-16,-124H16Q18,-112 14,-100Q36,-70 36,-30Q36,-4 22,0H-22Q-36,-4 -36,-30Q-36,-70 -14,-100Q-18,-112 -16,-124Z';
    el('ellipse', { cx: 14, cy: 2, rx: 54, ry: 9, fill: '#1c0d06', opacity: 0.5, filter: 'url(#blur2)' }, g);
    const p = shape(g, d, [-36, -124, 72, 124], ['#8a8f9e', '#e9e4d6', '#fffdf6'], R, { n: 34, dir: [0.1, 1], width: [5, 11], cast: 'cast', base: linGrad(svg, [[0, '#fffdf6'], [0.45, '#e9e4d6'], [1, '#8c8fa0']], -36, 0, 36, 0) });
    el('path', { d: 'M-36,-44H36V-22H-36Z', fill: '#2c4f78', opacity: 0.85 }, p.inner);
    el('rect', { x: -36, y: -44, width: 72, height: 22, fill: kawung(svg, '#f4efe0', 22, 1.1), opacity: 0.9 }, p.inner);
    el('path', { d: 'M-22,-90Q-30,-60 -28,-22', fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-opacity': 0.6, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
  }

  /* ───────────── lampu meja ───────────── */
  /** kanvas 288 × 608; engsel kap di (150,128), kap menghadap kanan-bawah */
  function lamp(svg, R, { lit = false } = {}) {
    // kaki
    el('ellipse', { cx: 80, cy: 590, rx: 74, ry: 12, fill: '#1c0d06', opacity: 0.5, filter: 'url(#blur2)' }, svg);
    metal(svg, 'M14,584Q14,566 72,562Q130,566 130,584Q130,596 72,598Q14,596 14,584Z', [14, 562, 116, 36], BRASS, R, { n: 14 });
    metal(svg, 'M52,566Q54,540 72,536Q90,540 92,566Z', [52, 536, 40, 30], BRASS, R, { n: 8 });
    // leher angsa
    const neck = 'M72,544C22,430 4,214 96,116';
    el('path', { d: neck, fill: 'none', stroke: BRASS.deep, 'stroke-width': 15, 'stroke-linecap': 'round', filter: 'url(#cast)' }, svg);
    el('path', { d: neck, fill: 'none', stroke: BRASS.base, 'stroke-width': 11, 'stroke-linecap': 'round', filter: 'url(#impastoFine)' }, svg);
    el('path', { d: neck, fill: 'none', stroke: BRASS.dark, 'stroke-width': 11, 'stroke-opacity': 0.55, 'stroke-dasharray': '2 7' }, svg);
    el('path', { d: neck, fill: 'none', stroke: BRASS.hi, 'stroke-width': 2.6, 'stroke-opacity': 0.85, 'stroke-linecap': 'round', transform: 'translate(-3 -1)' }, svg);
    // kap
    const g = at(svg, 'translate(150 128) rotate(-35)');
    metal(g, rrect(-17, -86, 34, 34, 7), [-17, -86, 34, 34], BRASS, R, { n: 8 });
    // bagian dalam kap (terlihat dari bawah)
    el('path', { d: ell(0, 34, 80, 19), fill: lit ? radGrad(svg, [[0, '#fffdf0'], [0.5, '#ffeeb4'], [1, '#f0c468']], 0, 34, 80) : linGrad(svg, [[0, '#b7a983'], [1, '#7d7054']], -80, 20, 80, 50) }, g);
    el('ellipse', { cx: 0, cy: 37, rx: 20, ry: 10, fill: lit ? '#ffffff' : '#e8dfc6', opacity: lit ? 1 : 0.85 }, g);
    const dome = 'M-20,-58Q-34,-14 -80,34Q0,10 80,34Q34,-14 20,-58Z';
    const st = [[0, AMBER.light], [0.2, AMBER.hi], [0.45, AMBER.light], [0.7, AMBER.base], [1, AMBER.dark]];
    const p = painted(g, dome, {
      base: linGrad(svg, st, -80, 0, 80, 0), n: 60, R, filter: 'impasto', cast: 'castBig',
      stroke: () => { const u = R(), v = R(), x = -80 * v + u * 160 * v, y = -58 + v * 92; return { d: `M${x * 0.9},${y}q${(R() - 0.5) * 6},14 ${x * 0.14},${22 + R() * 14}`, color: jitter(ramp(st, u + (R() - 0.5) * 0.12), 6, R), width: 4 + R() * 9, opacity: 0.3 + R() * 0.4 }; },
    });
    el('path', { d: 'M-22,-40Q-36,-10 -58,14', fill: 'none', stroke: '#fff8dc', 'stroke-width': 7, 'stroke-opacity': 0.65, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
    el('path', { d: 'M-80,34Q0,10 80,34', fill: 'none', stroke: BRASS.deep, 'stroke-width': 3.4, 'stroke-opacity': 0.7 }, g);
    el('path', { d: 'M-80,34A80,19 0 0 0 80,34', fill: 'none', stroke: BRASS.light, 'stroke-width': 3.6 }, g);
    el('path', { d: 'M-80,34A80,19 0 0 0 80,34', fill: 'none', stroke: BRASS.dark, 'stroke-width': 1.2, 'stroke-opacity': 0.8, transform: 'translate(0 2.6)' }, g);
    // kamboja kecil di kap (tanda floa)
    mark(g, 30, -4, 0.62, AMBER.dark, 0.7);
  }
  /** rantai tarik lampu: manik kuningan + bandul; kanvas 40 × 150, digantung dari (20,0) */
  function chain(svg, R) {
    for (let y = 4; y < 112; y += 7.4) { el('circle', { cx: 20.6, cy: y + 1, r: 3.2, fill: BRASS.deep, opacity: 0.6 }, svg); el('circle', { cx: 20, cy: y, r: 2.9, fill: radGrad(svg, [[0, BRASS.hi], [0.6, BRASS.base], [1, BRASS.dark]], 19, y - 1, 3.4) }, svg); }
    metal(svg, 'M20,108C30,120 31,134 20,140C9,134 10,120 20,108Z', [9, 108, 22, 32], BRASS, R, { n: 6 });
    el('ellipse', { cx: 16.5, cy: 122, rx: 2.2, ry: 5, fill: '#fff', opacity: 0.7 }, svg);
  }

  /* ───────────── mesin tik ───────────── */
  /** tutup tuts kaca bundar: cincin kuningan + kaca krem; berpusat di (0,0), jari-jari ±21 */
  function keycap(g, R) {
    el('ellipse', { cx: 2.5, cy: 5.5, rx: 20.5, ry: 19.5, fill: '#050807', opacity: 0.6, filter: 'url(#blur2)' }, g);
    el('circle', { r: 20.5, fill: BRASS.deep }, g);
    el('circle', { r: 19.6, fill: linGrad(g, [[0, BRASS.hi], [0.35, BRASS.light], [0.7, BRASS.mid], [1, BRASS.dark]], -14, -16, 14, 16) }, g);
    el('circle', { r: 15.8, fill: BRASS.deep, opacity: 0.75 }, g);
    el('circle', { r: 15.2, fill: radGrad(g, [[0, '#fffef6'], [0.6, '#f6ecd4'], [1, '#d6c5a0']], -4, -6, 20), filter: 'url(#impastoFine)' }, g);
    el('path', { d: 'M-11,-4A12,12 0 0 1 2,-12.4', fill: 'none', stroke: '#fff', 'stroke-width': 2.6, 'stroke-opacity': 0.85, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M6,11.6A13,13 0 0 0 12.6,3', fill: 'none', stroke: '#8f7d58', 'stroke-width': 2, 'stroke-opacity': 0.35, 'stroke-linecap': 'round' }, g);
  }
  /** spasi: bilah gading panjang; kanvas 280 × 44 */
  function spacebar(svg, R) {
    el('path', { d: rrect(12, 14, 256, 24, 11), fill: '#050807', opacity: 0.6, filter: 'url(#blur2)' }, svg);
    const p = shape(svg, rrect(10, 6, 256, 24, 11), [10, 6, 256, 24], ['#c8b68e', '#f1e6cb', '#fffdf4'], R, { n: 16, width: [4, 8], len: [30, 90], base: linGrad(svg, [[0, '#fffdf4'], [0.55, '#f1e6cb'], [1, '#c2ae84']], 0, 6, 0, 30) });
    el('path', { d: 'M22,11H250', stroke: '#fff', 'stroke-width': 2.4, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, p.inner);
    el('path', { d: rrect(10, 6, 256, 24, 11), fill: 'none', stroke: BRASS.dark, 'stroke-width': 1.4, 'stroke-opacity': 0.7 }, svg);
  }
  /** posisi tuts di kanvas badan (sama dengan KEYS di index.tsx) */
  const KEY_ROWS = [[10, 96, 306], [9, 122, 354], [9, 148, 402]];
  const keySpots = () => KEY_ROWS.flatMap(([n, x0, y]) => Array.from({ length: n }, (_, i) => [x0 + i * 52, y]));

  /** badan mesin tik; kanvas 660 × 520. Pemandu huruf di tengah-atas menjulur ke depan rol. */
  function body(svg, R, { keys = false } = {}) {
    el('ellipse', { cx: 334, cy: 484, rx: 326, ry: 24, fill: '#140a05', opacity: 0.62, filter: 'url(#soft)' }, svg);
    const shell = 'M96,92H564Q592,92 598,120L644,428Q650,480 598,480H62Q10,480 16,428L62,120Q68,92 96,92Z';
    const st = [[0, SAGE.hi], [0.2, SAGE.light], [0.5, SAGE.base], [0.8, SAGE.mid], [1, SAGE.dark]];
    const p = painted(svg, shell, {
      base: linGrad(svg, st, 60, 90, 600, 480), n: 300, R, filter: 'impasto', cast: 'castBig',
      stroke: () => { const x = 10 + R() * 640, y = 90 + R() * 390, L = 30 + R() * 80; const t = (x - 10) / 640 * 0.5 + (y - 90) / 390 * 0.5; return { d: `M${x},${y}q${L / 2},${(R() - 0.5) * 8} ${L},${(R() - 0.5) * 6}`, color: jitter(ramp(st, t + (R() - 0.5) * 0.22), 6, R), width: 8 + R() * 16, opacity: 0.3 + R() * 0.4 }; },
    });
    // bidang atas (dek) lebih terang, lereng depan sedikit lebih teduh
    el('path', { d: 'M40,250H620L650,480H10Z', fill: SAGE.deep, opacity: 0.2 }, p.inner);
    el('path', { d: 'M52,250H608', stroke: SAGE.deep, 'stroke-width': 3, 'stroke-opacity': 0.45 }, p.inner);
    el('path', { d: 'M52,253.5H608', stroke: SAGE.hi, 'stroke-width': 2, 'stroke-opacity': 0.55 }, p.inner);
    // kilap enamel di kiri-atas, teduh di kanan-bawah
    el('path', { d: 'M84,108Q70,112 66,132L40,300', fill: 'none', stroke: '#fff', 'stroke-width': 9, 'stroke-opacity': 0.5, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
    el('path', { d: 'M110,100H330', fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-opacity': 0.42, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
    el('path', { d: 'M604,130L646,440Q648,476 600,478H60', fill: 'none', stroke: SAGE.deep, 'stroke-width': 14, 'stroke-opacity': 0.45, filter: 'url(#soft)' }, p.inner);
    // garis emas tipis
    el('path', { d: 'M100,104H560Q582,104 587,126L630,426Q635,466 596,467H64Q25,466 30,426L73,126Q78,104 100,104Z', fill: 'none', stroke: BRASS.light, 'stroke-width': 1.7, 'stroke-opacity': 0.75 }, svg);
    el('path', { d: shell, fill: 'none', stroke: SAGE.deep, 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, svg);

    // keranjang huruf: bukaan setengah lingkaran dengan batang-batang huruf
    const bx = 330, by = 240, brx = 152, bry = 122;
    const basket = `M${bx - brx},${by}A${brx},${bry} 0 0 1 ${bx + brx},${by}Z`;
    el('path', { d: basket, fill: radGrad(svg, [[0, '#26332f'], [0.7, '#111916'], [1, '#070b0a']], bx, by, brx) }, svg);
    const bk = clip(svg, basket);
    for (let i = 0; i < 29; i++) {
      const a = Math.PI + ((i + 0.5) / 29) * Math.PI;
      const x1 = bx + Math.cos(a) * 34, y1 = by + Math.sin(a) * 26, x2 = bx + Math.cos(a) * brx * 0.84, y2 = by + Math.sin(a) * bry * 0.84;
      el('path', { d: `M${x1},${y1}L${x2},${y2}`, stroke: CHROME.dark, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, bk);
      el('path', { d: `M${x1},${y1}L${x2},${y2}`, stroke: CHROME.light, 'stroke-width': 1.2, 'stroke-opacity': 0.8, transform: 'translate(-0.8 -0.6)' }, bk);
      el('rect', { x: -4.4, y: -6, width: 8.8, height: 12, rx: 1.6, fill: i % 2 ? CHROME.light : CHROME.base, stroke: CHROME.deep, 'stroke-width': 0.8, transform: `translate(${x2} ${y2}) rotate(${(a * 180) / Math.PI + 90})` }, bk);
    }
    el('path', { d: basket, fill: 'none', stroke: '#030504', 'stroke-width': 22, 'stroke-opacity': 0.5, filter: 'url(#blur2)' }, bk);
    el('path', { d: `M${bx - 44},${by}A44,34 0 0 1 ${bx + 44},${by}Z`, fill: linGrad(svg, stopsOf(CHROME), bx - 44, by - 34, bx + 44, by) }, svg);
    el('path', { d: `M${bx - 44},${by}A44,34 0 0 1 ${bx + 44},${by}`, fill: 'none', stroke: CHROME.deep, 'stroke-width': 1.4 }, svg);
    el('path', { d: `M${bx - brx},${by}A${brx},${bry} 0 0 1 ${bx + brx},${by}`, fill: 'none', stroke: CHROME.deep, 'stroke-width': 8 }, svg);
    el('path', { d: `M${bx - brx},${by}A${brx},${bry} 0 0 1 ${bx + brx},${by}`, fill: 'none', stroke: linGrad(svg, stopsOf(CHROME), bx - brx, by - bry, bx + brx, by), 'stroke-width': 5 }, svg);
    metal(svg, rrect(bx - brx - 8, by - 3, brx * 2 + 16, 11, 4), [bx - brx - 8, by - 3, brx * 2 + 16, 11], CHROME, R, { n: 6, vertical: true });

    // gulungan pita di kiri & kanan
    for (const cx of [112, 548]) {
      const cy = 172;
      el('circle', { cx: cx + 3, cy: cy + 6, r: 50, fill: '#0e1512', opacity: 0.5, filter: 'url(#blur2)' }, svg);
      el('circle', { cx, cy, r: 48, fill: radGrad(svg, [[0, INK.light], [0.8, INK.mid], [1, INK.deep]], cx - 12, cy - 14, 60) }, svg);
      el('circle', { cx, cy, r: 41, fill: 'none', stroke: RED, 'stroke-width': 9 }, svg);
      el('circle', { cx, cy, r: 41, fill: 'none', stroke: '#e0584c', 'stroke-width': 1.6, 'stroke-opacity': 0.8, 'stroke-dasharray': '3 4' }, svg);
      el('circle', { cx, cy, r: 33, fill: 'none', stroke: INK.deep, 'stroke-width': 7 }, svg);
      metal(svg, circ(cx, cy, 28), [cx - 28, cy - 28, 56, 56], CHROME, R, { n: 12, cast: false });
      for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2 + 0.5; el('ellipse', { cx: cx + Math.cos(a) * 16, cy: cy + Math.sin(a) * 16, rx: 6.4, ry: 4.4, fill: INK.dark, transform: `rotate(${(a * 180) / Math.PI + 90} ${cx + Math.cos(a) * 16} ${cy + Math.sin(a) * 16})` }, svg); }
      el('circle', { cx, cy, r: 6.4, fill: radGrad(svg, [[0, BRASS.hi], [0.6, BRASS.base], [1, BRASS.dark]], cx - 2, cy - 2, 8), stroke: BRASS.deep, 'stroke-width': 0.8 }, svg);
      el('circle', { cx, cy, r: 28, fill: 'none', stroke: CHROME.deep, 'stroke-width': 1.2 }, svg);
    }
    // pita merah-hitam menuju pemandu huruf
    for (const [x1, x2] of [[150, 314], [510, 346]]) {
      el('path', { d: `M${x1},142L${x2},58`, stroke: RED, 'stroke-width': 4.4 }, svg);
      el('path', { d: `M${x1},146L${x2},62`, stroke: INK.dark, 'stroke-width': 4.4 }, svg);
    }
    // pemandu huruf + penggetar pita
    for (const s of [-1, 1]) {
      const d = `M${330 + s * 15},96V34Q${330 + s * 15},20 ${330 + s * 24},12`;
      el('path', { d, fill: 'none', stroke: CHROME.deep, 'stroke-width': 6.4, 'stroke-linecap': 'round' }, svg);
      el('path', { d, fill: 'none', stroke: CHROME.light, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, svg);
      el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 1.2, 'stroke-opacity': 0.9, 'stroke-linecap': 'round', transform: 'translate(-0.9 0)' }, svg);
    }
    el('rect', { x: 313, y: 50, width: 34, height: 9, fill: RED }, svg);
    el('rect', { x: 313, y: 59, width: 34, height: 9, fill: INK.dark }, svg);
    metal(svg, rrect(306, 78, 48, 16, 4), [306, 78, 48, 16], CHROME, R, { n: 5 });

    // lekukan papan tuts
    const well = rrect(54, 268, 552, 176, 26);
    el('path', { d: well, fill: linGrad(svg, [[0, '#0c1311'], [0.25, '#18231f'], [1, '#22302b']], 0, 268, 0, 444) }, svg);
    const wl = clip(svg, well);
    el('path', { d: well, fill: 'none', stroke: '#020403', 'stroke-width': 26, 'stroke-opacity': 0.7, filter: 'url(#soft)', transform: 'translate(4 8)' }, wl);
    for (const y of [330, 378, 424]) { el('path', { d: `M60,${y}H600`, stroke: '#030504', 'stroke-width': 3, 'stroke-opacity': 0.55 }, wl); el('path', { d: `M60,${y + 2.6}H600`, stroke: '#4d6a5d', 'stroke-width': 1.3, 'stroke-opacity': 0.5 }, wl); }
    el('path', { d: well, fill: 'none', stroke: SAGE.deep, 'stroke-width': 2.4 }, svg);
    el('path', { d: 'M76,444.5H584', stroke: SAGE.hi, 'stroke-width': 2, 'stroke-opacity': 0.7 }, svg);
    // tangkai tuts (tutupnya dipasang dari DOM supaya bisa ditekan)
    for (const [x, y] of keySpots()) el('ellipse', { cx: x + 2, cy: y + 7, rx: 15, ry: 12, fill: '#030504', opacity: 0.7 }, svg);
    if (keys) { for (const [x, y] of keySpots()) keycap(at(svg, `translate(${x} ${y})`), R); spacebar(at(svg, 'translate(192 412) scale(1)'), R); }
    // plakat kuningan dengan kamboja
    metal(svg, rrect(276, 451, 108, 21, 7), [276, 451, 108, 21], BRASS, R, { n: 8 });
    mark(svg, 330, 462.5, 0.44, BRASS.deep, 0.85);
    for (const dx of [-34, -22, 22, 34]) el('circle', { cx: 330 + dx, cy: 461.5, r: 1.7, fill: BRASS.deep, opacity: 0.7 }, svg);
  }

  /** kereta: rol karet, kenop, penjepit kertas, penggaris; kanvas 600 × 170 */
  function carriage(svg, R) {
    el('path', { d: rrect(60, 112, 484, 52, 14), fill: '#140a05', opacity: 0.5, filter: 'url(#soft)', transform: 'translate(4 8)' }, svg);
    // rel depan (enamel sage)
    shape(svg, rrect(58, 98, 484, 58, 15), [58, 98, 484, 58], [SAGE.dark, SAGE.base, SAGE.light], R, { n: 40, width: [6, 13], cast: 'cast', base: linGrad(svg, [[0, SAGE.light], [0.5, SAGE.base], [1, SAGE.dark]], 0, 98, 0, 156) });
    el('path', { d: 'M74,103H526', stroke: '#fff', 'stroke-width': 2.4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, svg);
    // kenop di dua ujung
    for (const [x, s] of [[26, 1], [524, -1]]) {
      const kb = rrect(x, 22, 50, 92, 9);
      const p = shape(svg, kb, [x, 22, 50, 92], [INK.deep, INK.base, INK.light], R, { n: 14, dir: [1, 0], width: [3, 6], cast: 'cast', base: linGrad(svg, [[0, INK.light], [0.16, INK.hi], [0.36, INK.base], [0.8, INK.dark], [1, INK.deep]], 0, 22, 0, 114) });
      for (let k = 0; k < 9; k++) el('path', { d: `M${x + 4 + k * 5.4},24V112`, stroke: '#000', 'stroke-width': 1.6, 'stroke-opacity': 0.45 }, p.inner);
      metal(svg, rrect(s > 0 ? x + 50 : x - 9, 34, 9, 68, 3), [s > 0 ? x + 50 : x - 9, 34, 9, 68], CHROME, R, { n: 4, vertical: true, cast: false });
    }
    // rol
    const pl = rrect(84, 30, 432, 76, 9);
    const PL = [[0, '#5d646d'], [0.16, '#838b94'], [0.34, '#3b4148'], [0.78, '#1d2126'], [1, '#101215']];
    const p = painted(svg, pl, {
      base: linGrad(svg, PL, 0, 30, 0, 106), n: 70, R, filter: 'impastoH', cast: 'cast',
      stroke: () => { const x = 84 + R() * 432, y = 30 + R() * 76, L = 40 + R() * 140; return { d: `M${x},${y}h${L}`, color: jitter(ramp(PL, (y - 30) / 76 + (R() - 0.5) * 0.08), 4, R), width: 3 + R() * 6, opacity: 0.3 + R() * 0.35 }; },
    });
    el('path', { d: 'M92,43H508', stroke: '#fff', 'stroke-width': 3, 'stroke-opacity': 0.3, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
    // batang penjepit kertas + dua rol kecil
    el('path', { d: 'M92,57H508', stroke: CHROME.deep, 'stroke-width': 6.5, 'stroke-linecap': 'round', transform: 'translate(1 3)', 'stroke-opacity': 0.7 }, svg);
    el('path', { d: 'M92,56H508', stroke: linGrad(svg, [[0, CHROME.hi], [0.5, CHROME.base], [1, CHROME.dark]], 0, 53, 0, 60), 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    for (const x of [176, 398]) { el('rect', { x, y: 48, width: 28, height: 17, rx: 5, fill: linGrad(svg, [[0, INK.hi], [0.4, INK.base], [1, INK.deep]], 0, 48, 0, 65), stroke: '#000', 'stroke-width': 0.8 }, svg); }
    // penggaris margin
    el('rect', { x: 96, y: 108, width: 408, height: 17, rx: 3, fill: linGrad(svg, [[0, '#fffdf4'], [1, '#d6c9a8']], 0, 108, 0, 125), stroke: CHROME.dark, 'stroke-width': 1 }, svg);
    for (let i = 0; i <= 50; i++) el('path', { d: `M${100 + i * 8},${125}v${i % 5 === 0 ? -10 : -5}`, stroke: '#3a3226', 'stroke-width': i % 5 === 0 ? 1.4 : 0.9, 'stroke-opacity': 0.8 }, svg);
    for (const x of [124, 468]) metal(svg, `M${x},102h14l-3,26h-8Z`, [x, 102, 14, 26], CHROME, R, { n: 3 });
    // dudukan tuas di ujung kanan
    metal(svg, circ(552, 132, 13), [539, 119, 26, 26], CHROME, R, { n: 5 });
    el('circle', { cx: 552, cy: 132, r: 4.4, fill: CHROME.deep }, svg);
  }
  /** tuas balik kereta; kanvas 120 × 170, engsel di (24,146) */
  function lever(svg, R) {
    const arm = 'M24,146C30,100 52,62 86,36';
    el('path', { d: arm, fill: 'none', stroke: '#140a05', 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-opacity': 0.4, transform: 'translate(4 6)', filter: 'url(#blur2)' }, svg);
    el('path', { d: arm, fill: 'none', stroke: CHROME.deep, 'stroke-width': 11, 'stroke-linecap': 'round' }, svg);
    el('path', { d: arm, fill: 'none', stroke: linGrad(svg, stopsOf(CHROME), 20, 30, 90, 150), 'stroke-width': 8, 'stroke-linecap': 'round' }, svg);
    el('path', { d: arm, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': 0.9, 'stroke-linecap': 'round', transform: 'translate(-2 -1)' }, svg);
    // gagang
    const pad = at(svg, 'translate(90 32) rotate(38)');
    metal(pad, rrect(-13, -27, 26, 40, 12), [-13, -27, 26, 40], CHROME, R, { n: 8 });
    el('ellipse', { cx: -4, cy: -12, rx: 3, ry: 9, fill: '#fff', opacity: 0.75 }, pad);
    metal(svg, circ(24, 146, 9), [15, 137, 18, 18], BRASS, R, { n: 3, cast: false });
  }

  /* ───────────── kertas remasan & keranjang ───────────── */
  /** bola kertas remasan berfaset, berpusat di (cx,cy) */
  function crumple(g, cx, cy, r, R, { shadow = true, n = 12 } = {}) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + R() * 0.25, k = 0.84 + R() * 0.24; pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * 0.94]); }
    const inner = Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 + R(), k = 0.2 + R() * 0.36; return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]; });
    const out = `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z`;
    if (shadow) el('ellipse', { cx: cx + r * 0.12, cy: cy + r * 0.92, rx: r * 0.95, ry: r * 0.2, fill: '#1c0d06', opacity: 0.5, filter: 'url(#blur2)' }, g);
    const wrap = el('g', { filter: 'url(#cast)' }, g);
    const body = el('g', { filter: 'url(#impastoFine)' }, wrap);
    el('path', { d: out, fill: PAPER[1], stroke: PAPER[1], 'stroke-width': 3, 'stroke-linejoin': 'round' }, body);
    const cg = clip(body, out);
    const near = (p) => inner.reduce((b, q) => (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(b[0] - p[0], b[1] - p[1]) ? q : b), inner[0]);
    const tone = (mx, my) => {
      // terang di kiri-atas, teduh kebiruan di kanan-bawah
      const t = ((mx - cx) + (my - cy)) / (2 * r) + (R() - 0.5) * 0.7;
      return t < -0.25 ? '#fffcf2' : t < 0.05 ? '#f8eed8' : t < 0.3 ? '#ecdfc2' : t < 0.5 ? '#d8c7a4' : '#bda985';
    };
    const tris = [];
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], q = near([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); tris.push([a, b, q]); }
    for (let i = 0; i < 6; i++) tris.push([inner[i], inner[(i + 1) % 6], inner[(i + 3) % 6]]);
    for (let i = 0; i < n; i++) { const q1 = near(pts[i]), q2 = near(pts[(i + 1) % n]); if (q1 !== q2) tris.push([pts[(i + 1) % n], q1, q2]); }
    for (const [a, b, c] of tris) {
      const mx = (a[0] + b[0] + c[0]) / 3, my = (a[1] + b[1] + c[1]) / 3;
      el('path', { d: `M${a}L${b}L${c}Z`, fill: tone(mx, my), stroke: '#a08c66', 'stroke-width': Math.max(0.6, r * 0.014), 'stroke-opacity': 0.34, 'stroke-linejoin': 'round' }, cg);
    }
    for (let i = 0; i < 5; i++) { const a = inner[i], b = pts[Math.floor(R() * n)]; el('path', { d: `M${a}L${b}`, stroke: '#fffdf6', 'stroke-width': Math.max(0.8, r * 0.03), 'stroke-opacity': 0.7 }, cg); }
    // sedikit bekas ketikan yang terlihat di lipatan
    for (let i = 0; i < 4; i++) { const a = R() * Math.PI * 2, d0 = r * (0.15 + R() * 0.5), x = cx + Math.cos(a) * d0, y = cy + Math.sin(a) * d0, L = r * (0.16 + R() * 0.2), an = R() * 180; el('path', { d: `M${-L / 2},0H${L / 2}`, stroke: '#3a3226', 'stroke-width': Math.max(0.9, r * 0.03), 'stroke-opacity': 0.4, 'stroke-dasharray': `${r * 0.05} ${r * 0.035}`, transform: `translate(${x} ${y}) rotate(${an})` }, cg); }
    el('path', { d: out, fill: 'none', stroke: '#8a7650', 'stroke-width': Math.max(0.9, r * 0.02), 'stroke-opacity': 0.6, 'stroke-linejoin': 'round' }, wrap);
  }

  /** keranjang rotan; kanvas 170 × 180 */
  function bin(svg, R) {
    el('ellipse', { cx: 92, cy: 164, rx: 76, ry: 13, fill: '#1c0d06', opacity: 0.6, filter: 'url(#soft)' }, svg);
    // bagian dalam + bibir belakang
    el('path', { d: ell(85, 42, 74, 16), fill: RATTAN.mid }, svg);
    el('path', { d: ell(85, 43, 68, 12.5), fill: linGrad(svg, [[0, '#170b04'], [1, '#4a2c14']], 0, 30, 0, 58) }, svg);
    crumple(svg, 58, 36, 24, R, { shadow: false });
    crumple(svg, 108, 34, 22, R, { shadow: false });
    // badan anyaman: celah gelap di bawah, lalu bilah rotan berselang-seling (pola bata) yang mengikuti lengkung silinder
    const d = 'M11,42Q85,74 159,42L140,154Q85,176 30,154Z';
    const st = [[0, RATTAN.light], [0.22, RATTAN.hi], [0.5, RATTAN.base], [0.8, RATTAN.mid], [1, RATTAN.dark]];
    const p = painted(svg, d, { base: linGrad(svg, [[0, '#5e3818'], [1, '#2c170a']], 0, 42, 0, 170), n: 0, R, filter: 'impastoFine', cast: 'cast', stroke: () => null });
    const xl = (y) => 11 + ((y - 42) / 112) * 19, xr = (y) => 159 - ((y - 42) / 112) * 19;
    // tiang tegak yang mengintip di celah
    for (let i = 1; i < 14; i++) {
      const u = i / 14, ct = -Math.cos(u * Math.PI);
      const x1 = 85 + ct * 74, x2 = 85 + ct * 55;
      el('path', { d: `M${x1},${42 + Math.sin(u * Math.PI) * 16}L${x2},${154 + Math.sin(u * Math.PI) * 11}`, stroke: mix(RATTAN.mid, RATTAN.deep, 0.3), 'stroke-width': 2.6, 'stroke-opacity': 0.8 }, p.inner);
    }
    for (let row = 0, y = 49; y < 168; y += 9.6, row++) {
      const a = xl(y), b = xr(y), cxm = (a + b) / 2, rx = (b - a) / 2 + 2;
      const sag = 16 - ((y - 42) / 112) * 5;
      const n = 7, off = (row % 2) * 0.5, band = row === 6 || row === 7;
      for (let i = -1; i <= n; i++) {
        const u0 = Math.max(0.004, (i + off) / n + 0.016), u1 = Math.min(0.996, (i + 1 + off) / n - 0.016);
        if (u1 - u0 < 0.02) continue;
        const pts = [];
        for (let k = 0; k <= 6; k++) { const u = u0 + ((u1 - u0) * k) / 6; pts.push([cxm - rx * Math.cos(u * Math.PI), y + sag * Math.sin(u * Math.PI)]); }
        const path = `M${pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join('L')}`;
        const um = (u0 + u1) / 2;
        let c = ramp(st, um * 0.86 + (row / 12) * 0.14 + (R() - 0.5) * 0.08);
        if (band) c = mix(c, '#6a3518', 0.62);
        // bilah makin sempit di tepi silinder (terlihat menyamping)
        const wdt = 7.6 * (0.62 + 0.38 * Math.sin(um * Math.PI));
        el('path', { d: path, fill: 'none', stroke: jitter(c, 6, R), 'stroke-width': wdt, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, p.inner);
        el('path', { d: path, fill: 'none', stroke: band ? '#c98a56' : RATTAN.hi, 'stroke-width': 1.3, 'stroke-opacity': 0.25 + 0.45 * (1 - um), 'stroke-linecap': 'round', transform: `translate(0 ${-wdt * 0.28})` }, p.inner);
        el('path', { d: path, fill: 'none', stroke: RATTAN.deep, 'stroke-width': 1.2, 'stroke-opacity': 0.35, 'stroke-linecap': 'round', transform: `translate(0 ${wdt * 0.36})` }, p.inner);
      }
    }
    // teduh di sisi kanan, kilap di kiri, dan bayangan bibir keranjang
    el('path', { d: 'M136,52L120,170', stroke: '#2a1406', 'stroke-width': 34, 'stroke-opacity': 0.32, filter: 'url(#soft)' }, p.inner);
    el('path', { d: 'M28,58L42,160', stroke: '#fff1d0', 'stroke-width': 10, 'stroke-opacity': 0.16, filter: 'url(#soft)' }, p.inner);
    el('path', { d: 'M8,48Q85,82 162,48', fill: 'none', stroke: '#2a1406', 'stroke-width': 9, 'stroke-opacity': 0.4, filter: 'url(#blur2)' }, p.inner);
    // bibir depan berlilit
    const rim = 'M11,42A74,16 0 0 0 159,42';
    el('path', { d: rim, fill: 'none', stroke: RATTAN.deep, 'stroke-width': 12, 'stroke-linecap': 'round' }, svg);
    el('path', { d: rim, fill: 'none', stroke: RATTAN.base, 'stroke-width': 9, 'stroke-linecap': 'round', filter: 'url(#impastoFine)' }, svg);
    el('path', { d: rim, fill: 'none', stroke: RATTAN.hi, 'stroke-width': 9, 'stroke-opacity': 0.75, 'stroke-dasharray': '5 6' }, svg);
    el('path', { d: 'M11,42A74,16 0 0 1 159,42', fill: 'none', stroke: RATTAN.mid, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
  }

  /** lembar draf yang sudah dibuka lagi: kusut, penuh bekas lipatan; kanvas (w + 44) × (h + 44) */
  function wrinkled(svg, R, w = 516, h = 356, nx = 7, ny = 5) {
    const x0 = 22, y0 = 16;
    let d = '';
    const edge = (xa, ya, xb, yb, n) => { for (let i = 0; i <= n; i++) { const t = i / n; d += `${d ? 'L' : 'M'}${(xa + (xb - xa) * t + (R() - 0.5) * 5).toFixed(1)},${(ya + (yb - ya) * t + (R() - 0.5) * 5).toFixed(1)}`; } };
    edge(x0, y0, x0 + w, y0, 9); edge(x0 + w, y0, x0 + w, y0 + h, 7); edge(x0 + w, y0 + h, x0, y0 + h, 9); edge(x0, y0 + h, x0, y0, 7);
    d += 'Z';
    const wrap = el('g', { filter: 'url(#castBig)' }, svg);
    const body = el('g', { filter: 'url(#impastoFine)' }, wrap);
    el('path', { d, fill: linGrad(svg, [[0, PAPER[2]], [0.6, PAPER[1]], [1, '#e2d5b8']], x0, y0, x0 + w, y0 + h) }, body);
    const cg = clip(body, d);
    // jaring lipatan: titik-titik kisi yang digeser acak, tiap petak diberi teduh/terang tipis
    const P = [];
    for (let j = 0; j <= ny; j++) { P.push([]); for (let i = 0; i <= nx; i++) P[j].push([x0 + (i / nx) * w + (i && i < nx ? (R() - 0.5) * 46 : 0), y0 + (j / ny) * h + (j && j < ny ? (R() - 0.5) * 40 : 0)]); }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = P[j][i], b = P[j][i + 1], c = P[j + 1][i + 1], e = P[j + 1][i];
      const flip = R() < 0.5;
      for (const tri of flip ? [[a, b, c], [a, c, e]] : [[a, b, e], [b, c, e]]) {
        const k = R();
        el('path', { d: `M${tri[0]}L${tri[1]}L${tri[2]}Z`, fill: k < 0.45 ? '#8c7c5c' : '#ffffff', opacity: k < 0.45 ? 0.05 + R() * 0.11 : 0.2 + R() * 0.4 }, cg);
      }
      const line = (p, q) => { el('path', { d: `M${p}L${q}`, stroke: '#8a7a5c', 'stroke-width': 1.3, 'stroke-opacity': 0.26 + R() * 0.2 }, cg); el('path', { d: `M${p}L${q}`, stroke: '#fff', 'stroke-width': 1.4, 'stroke-opacity': 0.6, transform: 'translate(-1.2 -1.4)' }, cg); };
      line(a, b); line(a, e); if (flip) line(a, c); else line(b, e);
    }
    el('rect', { x: x0, y: y0, width: w, height: h, fill: kawung(svg, '#a8946c', 64, 1.3), opacity: 0.09 }, cg);
    el('path', { d, fill: 'none', stroke: '#9a8a68', 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, wrap);
  }
  /** klip kertas; kanvas 44 × 100 */
  function paperclip(svg) {
    const d = 'M14,30V78A10,10 0 0 0 34,78V20A7,7 0 0 0 20,20V70A3.4,3.4 0 0 0 27,70V32';
    el('path', { d, fill: 'none', stroke: '#1c0d06', 'stroke-width': 5, 'stroke-opacity': 0.35, 'stroke-linecap': 'round', transform: 'translate(2 3)', filter: 'url(#blur2)' }, svg);
    el('path', { d, fill: 'none', stroke: CHROME.dark, 'stroke-width': 4.6, 'stroke-linecap': 'round' }, svg);
    el('path', { d, fill: 'none', stroke: CHROME.light, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, svg);
    el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 0.9, 'stroke-opacity': 0.9, 'stroke-linecap': 'round', transform: 'translate(-0.7 0)' }, svg);
  }

  /* ───────────── sprite ───────────── */
  const scaled = (name, w, h, seed, draw, k = 0.5) => { F.sprites[name] = { w: w * k, h: h * k, viewBox: `0 0 ${w} ${h}`, seed, draw }; };
  const vignette = (svg, w, h, o = 0.5) => el('rect', { x: 0, y: 0, width: w, height: h, fill: radGrad(svg, [[0, '#000', 0], [0.55, '#000', 0], [1, '#04070b', o]], w / 2, h * 0.56, h * 0.74) }, svg);

  F.sprites['bg-mesintik'] = { w: W, h: H, seed: 661, scale: 1, draw(svg, R) { wall(svg, R); windowArt(svg, R); desk(svg, R); vase(svg, R); stack(svg, R); vignette(svg, W, H, 0.42); } };
  scaled('mesintik-lampu', 288, 608, 662, (svg, R) => lamp(svg, R));
  // sama persis dengan lampu mati (benih sama), hanya bagian dalam kap & bohlamnya menyala: ditumpuk lalu dipudarkan
  scaled('mesintik-lampu-nyala', 288, 608, 662, (svg, R) => lamp(svg, R, { lit: true }));
  scaled('mesintik-rantai', 40, 150, 663, (svg, R) => chain(svg, R), 0.7);
  scaled('mesintik-badan', 660, 520, 664, (svg, R) => body(svg, R));
  scaled('mesintik-kereta', 600, 170, 665, (svg, R) => carriage(svg, R));
  scaled('mesintik-tuas', 120, 170, 666, (svg, R) => lever(svg, R), 0.6);
  scaled('mesintik-tuts', 52, 56, 667, (svg, R) => keycap(at(svg, 'translate(26 25)'), R), 0.8);
  scaled('mesintik-spasi', 280, 44, 668, (svg, R) => spacebar(svg, R), 0.6);
  scaled('mesintik-keranjang', 170, 180, 669, (svg, R) => bin(svg, R), 0.8);
  scaled('mesintik-bola', 110, 110, 670, (svg, R) => crumple(svg, 55, 50, 40, R), 0.8);
  scaled('mesintik-bola-2', 110, 110, 673, (svg, R) => crumple(svg, 55, 50, 40, R, { n: 11 }), 0.8);
  // tegak (seperti selembar HVS), dipakai sebagai kartu draf yang dibuka
  scaled('mesintik-kusut', 520, 680, 671, (svg, R) => wrinkled(svg, R, 476, 640, 5, 7));
  scaled('mesintik-klip', 44, 100, 672, (svg) => paperclip(svg), 0.7);
  scaled('game-mesintik-bola', 220, 210, 674, (svg, R) => crumple(svg, 110, 98, 84, R, { n: 14 }), 0.8);

  F.sprites['cover-mesintik'] = { w: 480, h: 600, seed: 675, draw(svg, R) {
    const k = 480 / W;
    const w = at(svg, `translate(0 -196) scale(${k})`);
    wall(w, R); windowArt(w, R); desk(w, R); vase(w, R);
    lamp(at(w, 'translate(29 349)'), R, { lit: true });
    chain(at(w, 'translate(140 520)'), R);
    // kerucut cahaya lampu
    el('path', { d: 'M150,470L250,520L700,1300H-80Z', fill: linGrad(svg, [[0, '#ffe7ac', 0.62], [0.5, '#ffd27a', 0.26], [1, '#ffd27a', 0]], 200, 480, 430, 1260), filter: 'url(#softer)' }, w);
    el('circle', { cx: 196, cy: 504, r: 70, fill: radGrad(svg, [[0, '#fffbe0', 0.95], [0.4, '#ffe39a', 0.5], [1, '#ffd27a', 0]], 196, 504, 70) }, w);
    // kertas di rol: beberapa baris "ketikan" dan sebuah hati merah
    const px = 390 - 170, py = 452;
    el('path', { d: rrect(px, py, 340, 310, 4), fill: '#05080c', opacity: 0.45, transform: 'translate(10 8)', filter: 'url(#soft)' }, w);
    shape(w, rrect(px, py, 340, 310, 4), [px, py, 340, 310], ['#eadcbd', '#f8f0dc', '#fffaf0'], R, { n: 16, width: [16, 30], len: [60, 180], base: linGrad(svg, [[0, '#fffaf0'], [1, '#eadcbd']], px, py, px + 340, py + 310) });
    for (const [dx, y, L, o] of [[50, 520, 130, 0.7], [50, 566, 220, 0.55], [50, 600, 180, 0.55]]) el('path', { d: `M${px + dx},${y}h${L}`, stroke: '#2b2622', 'stroke-width': 7, 'stroke-opacity': o, 'stroke-dasharray': '11 6', 'stroke-linecap': 'butt' }, w);
    el('path', { d: `M${px + 50},654h110`, stroke: RED, 'stroke-width': 7, 'stroke-opacity': 0.85, 'stroke-dasharray': '11 6' }, w);
    el('path', { d: 'M0,12C-20,-4 -11,-20 0,-9C11,-20 20,-4 0,12Z', fill: RED, transform: `translate(${px + 196} 652) scale(1.5)` }, w);
    carriage(at(w, 'translate(90 694)'), R);
    body(at(w, 'translate(60 724)'), R, { keys: true });
    // keranjang & bola kertas
    bin(at(w, 'translate(590 1090) scale(1.1)'), R);
    crumple(w, 654, 1106, 40, R); crumple(w, 716, 1118, 36, R); crumple(w, 520, 1236, 40, R); crumple(w, 84, 1236, 38, R);
    // pendar hangat lampu + malam di tepi
    el('ellipse', { cx: 390, cy: 820, rx: 440, ry: 440, fill: radGrad(svg, [[0, '#ffd98a', 0.3], [0.6, '#ffc470', 0.1], [1, '#ffc470', 0]], 390, 820, 440) }, w);
    el('rect', { x: 0, y: 0, width: 480, height: 600, fill: radGrad(svg, [[0, '#000', 0], [0.5, '#000', 0], [1, '#04070b', 0.62]], 236, 330, 420) }, svg);
  } };
})();
