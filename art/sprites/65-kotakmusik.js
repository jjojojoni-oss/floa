/* Kotak Musik: kotak musik antik dari kayu sonokeling bertatah maple dan kuningan, di atas meja rias saat
   senja. Badan kotak (mekanik silinder berpin di dalamnya), tutup (luar & dalam bercermin), laci-laci kecil,
   laci rahasia, kunci putar, sepasang bangau kertas, not yang melayang, dasar kotak berlapis beludru,
   dan si Not yang ngantukan untuk mini-game. Semua tulisan dipasang dari DOM di atas lukisan ini. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, mix, jitter, ramp, linGrad, radGrad, leaf } = F;
  const W = 780, H = 1500;
  const BRASS = { hi: '#fff4cc', light: '#f1d58a', base: '#c99a3e', mid: '#a87a26', dark: '#6e4b14', deep: '#47300b' };
  const VEL = { hi: '#ec9aa6', light: '#d06a7c', base: '#b5475a', mid: '#96354a', dark: '#6e2236', deep: '#3f1020' };
  /** kayu: [gelap, dasar, terang] */
  const ROSE = ['#44190f', '#7a3722', '#ae6238'];
  const BURL = ['#6a3019', '#a45a30', '#d79658'];
  const DARKW = ['#27100a', '#4d2114', '#7a3a22'];
  const OAK = ['#74442a', '#a26c44', '#cf9a66'];
  const MAPLE = ['#cfa868', '#f2dcab', '#fff3d6'];
  const PAPER = ['#e6d3ad', '#fbf1d8', '#fffaf0'];

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const circ = (cx, cy, r) => `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}Z`;
  const oval = (cx, cy, rx, ry) => `M${cx - rx},${cy}A${rx},${ry} 0 1 1 ${cx + rx},${cy}A${rx},${ry} 0 1 1 ${cx - rx},${cy}Z`;
  const at = (g, transform, extra = {}) => el('g', { transform, ...extra }, g);
  const clipG = (g, d) => { const id = F.uid('k'); const cp = el('clipPath', { id }, g); el('path', { d }, cp); return el('g', { 'clip-path': `url(#${id})` }, g); };

  /** bidang bebas dilukis dengan sapuan searah `dir`; cols = [gelap, dasar, terang] */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90], base, transform } = {}) => painted(g, d, {
    base: base || cols[1], n, R, filter, cast, transform,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.35 + R() * 0.45 };
    },
  });

  /** kayu dipernis: gradien terang (kiri-atas) ke gelap + sapuan panjang searah serat + garis serat halus */
  function wood(g, d, box, R, { tone = ROSE, n = 60, cast, dir = [1, 0.02], grain = 9, transform, width = [3, 9] } = {}) {
    const [x, y, w, h] = box, m = Math.hypot(dir[0], dir[1]), ux = dir[0] / m, uy = dir[1] / m;
    const p = painted(g, d, {
      base: linGrad(g, [[0, tone[2]], [0.45, tone[1]], [1, tone[0]]], x, y, x + w * 0.3, y + h), n, R, filter: 'impastoFine', cast, transform,
      stroke: () => {
        const sx = x + R() * w - w * 0.1, sy = y + R() * h, L = Math.max(w, h) * (0.16 + R() * 0.4), v = (sy - y) / h;
        const c = mix(mix(tone[2], tone[0], v * 0.9 + 0.05), R() < 0.5 ? tone[0] : tone[2], R() * 0.4);
        return { d: `M${sx},${sy}q${ux * L * 0.5 + uy * 4 * (R() - 0.5)},${uy * L * 0.5 + ux * 5 * (R() - 0.5)} ${ux * L},${uy * L}`, color: jitter(c, 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.25 + R() * 0.4 };
      },
    });
    for (let i = 0; i < grain; i++) {
      const sx = x + R() * w * 0.6, sy = y + R() * h, L = Math.max(w, h) * (0.3 + R() * 0.5), b = (R() - 0.5) * 7;
      el('path', { d: `M${sx},${sy}q${ux * L * 0.5 + uy * b},${uy * L * 0.5 + ux * b} ${ux * L},${uy * L}`, fill: 'none', stroke: R() < 0.7 ? tone[0] : tone[2], 'stroke-width': 0.7 + R() * 0.9, 'stroke-opacity': 0.22 + R() * 0.2, 'stroke-linecap': 'round' }, p.inner);
    }
    return p;
  }

  /** kuningan dipoles: gradien diagonal (terang di kiri-atas) + sapuan halus */
  const BR = [[0, BRASS.light], [0.18, BRASS.hi], [0.4, BRASS.light], [0.62, BRASS.base], [0.85, BRASS.mid], [1, BRASS.dark]];
  function brass(g, d, box, R, { n = 26, cast = 'cast', dir = [0.3, 1], transform, stops = BR } = {}) {
    const [x, y, w, h] = box;
    return painted(g, d, {
      base: linGrad(g, stops, x, y, x + w, y + h), n, R, filter: 'impastoFine', cast, transform,
      stroke: () => {
        const u = R(), v = R(), L = Math.max(w, h) * (0.1 + R() * 0.22), m = Math.hypot(dir[0], dir[1]);
        return { d: `M${x + u * w},${y + v * h}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(ramp(stops, (u + v) / 2 + (R() - 0.5) * 0.08), 4, R), width: 2 + R() * 5, opacity: 0.18 + R() * 0.22 };
      },
    });
  }

  /** kamboja kecil lima kelopak (tanda floa), berpusat di (0,0) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
  function mark(g, x, y, s, fill, { opacity = 1, squash = 1, core } = {}) {
    const m = el('g', { transform: `translate(${x} ${y}) scale(${s} ${s * squash})`, opacity }, g);
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill, transform: `rotate(${i * 72})` }, m);
    el('circle', { r: 3.4, fill: core || mix(fill, '#c98a2e', 0.6) }, m);
    return m;
  }
  /** tatahan (inlay) kamboja: bayangan tipis + maple + kilau mutiara */
  function inlayMark(g, x, y, s, squash = 1) {
    mark(g, x + 0.8, y + 1, s, '#2a0f08', { opacity: 0.5, squash, core: '#2a0f08' });
    mark(g, x, y, s, MAPLE[1], { squash, core: '#c9853a' });
    mark(g, x - 0.4, y - 0.5, s * 0.55, MAPLE[2], { squash, opacity: 0.7, core: '#e2a04a' });
  }
  /** garis tatahan maple dengan bayangan tipis */
  function string(g, d, { w = 2, o = 0.9, color = MAPLE[1] } = {}) {
    el('path', { d, fill: 'none', stroke: '#2a0f08', 'stroke-width': w, 'stroke-opacity': 0.4, transform: 'translate(0.8 1)', 'stroke-linejoin': 'round' }, g);
    el('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-opacity': o, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
  }
  /** sulur daun tatahan: tangkai melengkung dari (0,0) ke kanan dengan daun kecil berselang */
  function sprig(g, x, y, s, flip = 1, squash = 1, color = MAPLE[1]) {
    const m = at(g, `translate(${x} ${y}) scale(${s * flip} ${s * squash})`);
    string(m, 'M0,0C18,-12 40,-12 58,-2', { w: 1.6 });
    [[12, -6, -50], [24, -10, 40], [36, -9, -40], [48, -6, 46], [58, -2, 10]].forEach(([lx, ly, rot]) => {
      const d = 'M0,0C5,-4 5,-11 0,-15C-5,-11 -5,-4 0,0Z';
      el('path', { d, fill: '#2a0f08', opacity: 0.4, transform: `translate(${lx + 0.7} ${ly + 0.9}) rotate(${rot})` }, m);
      el('path', { d, fill: color, transform: `translate(${lx} ${ly}) rotate(${rot})` }, m);
    });
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

  /* ───────────── latar: dinding kamar saat senja + meja rias ───────────── */
  const TABLE = 944;
  function room(svg, R, { deco = true } = {}) {
    const tone = [[0, '#f9e6d2'], [0.5, '#f1d4bf'], [1, '#e3b9a2']];
    wash(svg, { x: -40, y: -30, w: W + 80, h: TABLE + 60, R, n: 420, angle: 86, len: [0.08, 0.2], width: [26, 60], opacity: [0.22, 0.5], base: linGrad(svg, tone, 0, 0, W * 0.5, TABLE), color: (u, v) => ramp(tone, v * 0.8 + u * 0.25) });
    // kertas dinding: kawung timbul, nada di atas nada
    el('rect', { x: 0, y: 0, width: W, height: TABLE, fill: kawung(svg, '#c98f78', 92, 1.7), opacity: 0.2 }, svg);
    el('rect', { x: 0, y: 0, width: W, height: TABLE, fill: kawung(svg, '#fff6e6', 92, 1.7), opacity: 0.3, transform: 'translate(-1.6 -2)' }, svg);
    // cahaya senja dari jendela: jajaran genjang hangat dengan bayangan kisi & daun kamboja
    const sun = clipG(svg, 'M250,90L800,-40L800,640L330,820Z');
    el('rect', { x: 200, y: -60, width: 640, height: 920, fill: linGrad(svg, [[0, '#fff3c8', 0.85], [0.6, '#ffd89a', 0.6], [1, '#ffbf86', 0.35]], 300, 0, 700, 800) }, sun);
    const bars = el('g', { stroke: '#d79c7c', 'stroke-opacity': 0.42, filter: 'url(#blur2)' }, sun);
    el('path', { d: 'M500,20L560,760', 'stroke-width': 20 }, bars);
    el('path', { d: 'M240,330L820,160', 'stroke-width': 18 }, bars);
    el('path', { d: 'M260,640L820,440', 'stroke-width': 16 }, bars);
    const sh = el('g', { fill: '#c7866c', opacity: 0.34, filter: 'url(#soft)' }, sun);
    [[640, 150, 60, 150, -30], [700, 250, 54, 140, 20], [600, 300, 50, 130, 64], [720, 420, 56, 150, -50], [640, 520, 48, 120, 30], [420, 200, 40, 110, -64], [390, 470, 44, 120, 44]].forEach(([x, y, w, l, rot]) => el('path', { d: `M0,0C${w * 0.6},${-l * 0.25} ${w * 0.5},${-l * 0.75} 0,${-l}C${-w * 0.5},${-l * 0.75} ${-w * 0.6},${-l * 0.25} 0,0Z`, transform: `translate(${x} ${y}) rotate(${rot})` }, sh));
    el('path', { d: 'M250,90L800,-40L800,640L330,820Z', fill: 'none', stroke: '#fff6dc', 'stroke-width': 26, 'stroke-opacity': 0.35, filter: 'url(#softer)' }, svg);
    // hangat menyeluruh + teduh di sudut kanan-bawah dinding
    el('rect', { x: 0, y: 0, width: W, height: TABLE, fill: radGrad(svg, [[0, '#ffe0a6', 0.34], [0.6, '#ffe0a6', 0.08], [1, '#ffe0a6', 0]], 120, 120, 820) }, svg);
    el('rect', { x: 0, y: TABLE - 260, width: W, height: 260, fill: linGrad(svg, [[0, '#a86a54', 0], [1, '#a86a54', 0.34]], 0, TABLE - 260, 0, TABLE) }, svg);

    // meja rias: papan kayu madu, serat mendatar, makin terang ke depan
    wash(svg, { x: -40, y: TABLE, w: W + 80, h: H - TABLE + 30, R, n: 420, angle: 0, len: [0.25, 0.8], width: [5, 16], opacity: [0.3, 0.7], base: linGrad(svg, [[0, '#8a5534'], [0.3, '#a8704a'], [1, '#c58f5f']], 0, TABLE, 0, H), filter: 'canvas', color: (u, v) => mix(mix('#8f5a38', '#cb9666', v), R() < 0.5 ? '#6f4028' : '#e0b07e', R() * 0.3) });
    for (let i = 0; i < 26; i++) {
      const y = TABLE + 14 + R() * (H - TABLE - 20), x = -20 + R() * 500, L = 200 + R() * 520;
      el('path', { d: `M${x},${y}q${L / 2},${(R() - 0.5) * 12} ${L},${(R() - 0.5) * 6}`, fill: 'none', stroke: R() < 0.7 ? '#6a3d25' : '#e9bd8c', 'stroke-width': 1 + R() * 1.6, 'stroke-opacity': 0.26, 'stroke-linecap': 'round' }, svg);
    }
    // pertemuan dinding dan meja
    el('path', { d: `M-20,${TABLE - 8}H${W + 20}`, stroke: '#7a4630', 'stroke-width': 30, 'stroke-opacity': 0.3, filter: 'url(#soft)' }, svg);
    el('path', { d: `M-20,${TABLE + 2}H${W + 20}`, stroke: '#f0c592', 'stroke-width': 4, 'stroke-opacity': 0.75, filter: 'url(#blur2)' }, svg);
    // pantulan cahaya senja di permukaan meja
    el('ellipse', { cx: 250, cy: 1250, rx: 380, ry: 120, fill: '#ffe2ac', opacity: 0.22, filter: 'url(#softer)' }, svg);
    if (deco) {
      // (taplak renda + bayangan kotak: sprite kotakmusik-taplak, supaya latar surat tidak punya bayangan kotak yang hilang)
      // kamboja & daun di sudut kiri-depan, untaian mutiara di kanan-depan
      leaf(svg, { len: 150, w: 56, ...F.flora.GREEN[1], R, n: 30, transform: 'translate(40 1470) rotate(62)', curve: 0.2 });
      leaf(svg, { len: 120, w: 46, ...F.flora.GREEN[0], R, n: 26, transform: 'translate(70 1480) rotate(28)', curve: -0.2 });
      el('ellipse', { cx: 84, cy: 1452, rx: 56, ry: 16, fill: '#3a1d12', opacity: 0.3, filter: 'url(#soft)' }, svg);
      F.flora.flowers.kamboja(at(svg, 'translate(74 1424) rotate(14) scale(1 0.8)'), R, 0.3);
      F.flora.flowers.kambojaPink(at(svg, 'translate(150 1466) rotate(-30) scale(1 0.8)'), R, 0.2);
      const pearls = el('g', { filter: 'url(#cast)' }, svg);
      for (let i = 0; i < 17; i++) {
        const t = i / 16, x = 560 + t * 230, y = 1452 - Math.sin(t * Math.PI) * 44 + t * 24;
        el('circle', { cx: x, cy: y, r: 8.4, fill: radGrad(svg, [[0, '#ffffff'], [0.5, '#f9ead9'], [1, '#d5b79f']], x - 3, y - 3, 10) }, pearls);
      }
    }
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#000', 0], [0.6, '#000', 0], [1, '#5a2a1c', 0.4]], W / 2, H * 0.52, H * 0.78) }, svg);
  }
  /** taplak renda di bawah kotak (tepi berlekuk, lubang kawung) + bayangan kotak; koordinat sama dengan latar */
  function lace(svg, R) {
    const scallop = (() => { let d = 'M40,1012H740V1126'; for (let x = 740; x > 40; x -= 35) d += `Q${x - 17.5},1150 ${x - 35},1126`; return d + 'Z'; })();
    el('path', { d: scallop, fill: '#5a3018', opacity: 0.3, filter: 'url(#soft)', transform: 'translate(6 9)' }, svg);
    const lc = shape(svg, scallop, [40, 1010, 700, 140], ['#e4cfb2', '#f8ecd8', '#fffaf0'], R, { n: 70, len: [60, 200], width: [8, 18], filter: 'impastoFine' });
    el('path', { d: scallop, fill: kawung(svg, '#b98f6c', 35, 1.5), opacity: 0.55 }, lc.inner);
    for (let x = 57.5; x < 740; x += 35) el('circle', { cx: x, cy: 1128, r: 4.4, fill: '#a8704a', opacity: 0.6 }, lc.inner);
    el('path', { d: 'M40,1104H740', stroke: '#c9a888', 'stroke-width': 1.6, 'stroke-dasharray': '5 5', opacity: 0.8 }, lc.inner);
    // cahaya senja yang jatuh di renda (kiri terang)
    el('path', { d: scallop, fill: linGrad(svg, [[0, '#fff3cf', 0.35], [0.6, '#fff3cf', 0], [1, '#7a4630', 0.12]], 40, 0, 740, 0) }, lc.inner);
    // bayangan kotak (jatuh ke kanan-bawah)
    el('ellipse', { cx: 420, cy: 1080, rx: 318, ry: 26, fill: '#3a1d12', opacity: 0.5, filter: 'url(#soft)' }, svg);
    el('path', { d: 'M150,1076H690L730,1104H190Z', fill: '#3a1d12', opacity: 0.22, filter: 'url(#soft)' }, svg);
  }

  /* ───────────── badan kotak (576×426): bak mekanik di atas, muka depan dengan rongga laci ───────────── */
  const BW = 576, BH = 426;
  /** rongga laci di muka depan: [x, y]; ukuran LW×LH */
  const SLOTS = [[34, 160], [350, 160], [34, 268], [350, 268]];
  const LW = 192, LH = 96;
  /** siku kuningan: sudutnya di (x,y), membuka ke arah (sx,sy). Dicerminkan lewat koordinat supaya arah cahayanya tetap. */
  function bracket(g, R, x, y, sx = 1, sy = 1) {
    const P = (a, b) => `${x + a * sx},${y + b * sy}`;
    const d = `M${P(0, 0)}L${P(54, 0)}Q${P(46, 6)} ${P(44, 16)}Q${P(30, 16)} ${P(26, 28)}Q${P(14, 30)} ${P(14, 44)}Q${P(6, 46)} ${P(0, 54)}Z`;
    brass(g, d, [Math.min(x, x + 54 * sx), Math.min(y, y + 54 * sy), 54, 54], R, { n: 10 });
    el('circle', { cx: x + 12 * sx, cy: y + 12 * sy, r: 3.2, fill: BRASS.deep, opacity: 0.7 }, g);
    el('circle', { cx: x + 12 * sx - 0.8, cy: y + 12 * sy - 0.8, r: 1.4, fill: BRASS.hi }, g);
    el('path', { d: `M${P(22, 8)}Q${P(30, 10)} ${P(34, 6)}M${P(8, 22)}Q${P(10, 30)} ${P(6, 34)}`, fill: 'none', stroke: BRASS.deep, 'stroke-width': 1.3, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, g);
  }
  function mechanism(g, R) {
    // sisir baja di belakang silinder
    shape(g, 'M84,34H296L300,50H80Z', [80, 34, 220, 16], ['#7d7a78', '#b9b6b0', '#ecebe6'], R, { n: 14, len: [20, 60], width: [3, 7], cast: 'cast' });
    for (let x = 88; x < 296; x += 7) el('path', { d: `M${x},42V58`, stroke: '#5c5855', 'stroke-width': 1.2, 'stroke-opacity': 0.75 }, g);
    for (const x of [100, 190, 280]) { el('circle', { cx: x, cy: 40, r: 3.4, fill: BRASS.mid }, g); el('circle', { cx: x - 0.8, cy: 39.2, r: 1.3, fill: BRASS.hi }, g); }
    // dudukan as + roda gigi
    brass(g, rrect(60, 46, 16, 40, 4), [60, 46, 16, 40], R, { n: 6 });
    brass(g, rrect(306, 46, 16, 40, 4), [306, 46, 16, 40], R, { n: 6 });
    const gear = el('g', { filter: 'url(#cast)' }, g);
    for (let i = 0; i < 12; i++) el('rect', { x: 337, y: 44, width: 6, height: 8, fill: BRASS.mid, transform: `rotate(${i * 30} 340 66)` }, gear);
    el('circle', { cx: 340, cy: 66, r: 16, fill: radGrad(g, [[0, BRASS.hi], [0.5, BRASS.base], [1, BRASS.dark]], 334, 60, 22) }, gear);
    el('circle', { cx: 340, cy: 66, r: 5, fill: BRASS.deep }, gear);
    // silinder kuningan (pin-pinnya dari DOM supaya bisa berputar)
    const cst = [[0, BRASS.dark], [0.14, BRASS.base], [0.3, BRASS.hi], [0.44, BRASS.light], [0.7, BRASS.base], [0.9, BRASS.dark], [1, BRASS.deep]];
    el('ellipse', { cx: 194, cy: 92, rx: 122, ry: 8, fill: '#1c060c', opacity: 0.55, filter: 'url(#blur2)' }, g);
    painted(g, rrect(76, 40, 230, 48, 9), {
      base: linGrad(g, cst, 0, 40, 0, 88), n: 46, R, filter: 'impastoFine',
      stroke: () => { const y = 40 + R() * 48, x = 76 + R() * 190, L = 30 + R() * 80; return { d: `M${x},${y}h${L}`, color: jitter(ramp(cst, (y - 40) / 48), 4, R), width: 2 + R() * 4, opacity: 0.25 + R() * 0.3 }; },
    });
    for (const x of [80, 302]) el('path', { d: `M${x},42V86`, stroke: BRASS.deep, 'stroke-width': 2.4, 'stroke-opacity': 0.6 }, g);
    // tatakan bangau kertas: cakram kuningan + per
    el('ellipse', { cx: 414, cy: 80, rx: 50, ry: 13, fill: '#1c060c', opacity: 0.5, filter: 'url(#blur2)' }, g);
    brass(g, oval(410, 72, 46, 15), [364, 57, 92, 30], R, { n: 14 });
    el('ellipse', { cx: 410, cy: 70, rx: 34, ry: 10, fill: 'none', stroke: BRASS.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.55 }, g);
    for (let i = 0; i < 3; i++) el('ellipse', { cx: 410, cy: 66 - i * 6, rx: 9 - i, ry: 3.4, fill: 'none', stroke: i % 2 ? BRASS.hi : BRASS.base, 'stroke-width': 2.2 }, g);
    // kamboja kecil terselip di sudut bak
    F.flora.flowers.kambojaPink(at(g, 'translate(494 80) rotate(20) scale(1 0.7)'), R, 0.085);
  }
  function body(g, R) {
    // bibir atas dinding kotak
    wood(g, 'M52,14L524,14L560,122L16,122Z', [16, 14, 544, 108], R, { tone: DARKW, n: 40, cast: 'cast' });
    string(g, 'M59,19L517,19L549,114L27,114Z', { w: 1.3, o: 0.55 });
    // rongga dalam berlapis beludru
    const cav = 'M70,26L506,26L536,106L40,106Z';
    const v = shape(g, cav, [40, 26, 496, 80], [VEL.deep, VEL.dark, VEL.mid], R, { n: 70, len: [30, 100], width: [6, 14] });
    el('path', { d: cav, fill: kawung(g, VEL.light, 30, 1), opacity: 0.3 }, v.inner);
    el('path', { d: 'M70,26L506,26L510,42L66,42Z', fill: VEL.light, opacity: 0.4 }, v.inner);
    el('path', { d: 'M66,42H510', stroke: VEL.deep, 'stroke-width': 2, 'stroke-opacity': 0.7 }, v.inner);
    el('path', { d: 'M70,26L34,110L96,110L104,26Z', fill: '#16040a', opacity: 0.55, filter: 'url(#soft)' }, v.inner);
    el('path', { d: 'M30,92H546V112H30Z', fill: '#16040a', opacity: 0.5, filter: 'url(#soft)' }, v.inner);
    mechanism(g, R);

    // muka depan
    wood(g, rrect(16, 122, 544, 276, 5), [16, 122, 544, 276], R, { tone: ROSE, n: 120, cast: 'castBig', grain: 22 });
    // rongga laci (laci digambar terpisah)
    for (const [x, y] of SLOTS) {
      el('path', { d: rrect(x - 3, y - 3, LW + 6, LH + 6, 6), fill: '#2a0f08', opacity: 0.55 }, g);
      el('path', { d: rrect(x, y, LW, LH, 4), fill: linGrad(g, [[0, '#0f0306'], [0.4, VEL.deep], [1, VEL.dark]], 0, y, 0, y + LH) }, g);
      el('path', { d: `M${x + 3},${y + LH - 2}H${x + LW - 3}`, stroke: VEL.light, 'stroke-width': 2, 'stroke-opacity': 0.35 }, g);
    }
    // pita tatahan di atas (frieze)
    string(g, 'M30,130H546', { w: 1.6 });
    string(g, 'M30,152H546', { w: 1.6 });
    for (let x = 44; x < 540; x += 22) {
      el('path', { d: `M${x},141l7,-6l7,6l-7,6Z`, fill: '#2a0f08', opacity: 0.4, transform: 'translate(0.7 0.9)' }, g);
      el('path', { d: `M${x},141l7,-6l7,6l-7,6Z`, fill: (x / 22) % 2 < 1 ? MAPLE[1] : '#e2a66a' }, g);
    }
    // kolom tengah: tatahan kamboja, pelat lubang kunci, lima soket penanda putaran
    string(g, rrect(240, 164, 96, 196, 8), { w: 1.4, o: 0.7 });
    sprig(g, 288, 198, 0.62, 1);
    sprig(g, 288, 198, 0.62, -1);
    inlayMark(g, 288, 190, 1.05);
    brass(g, 'M288,216C312,216 322,236 320,262C318,292 304,312 288,312C272,312 258,292 256,262C254,236 264,216 288,216Z', [254, 216, 68, 96], R, { n: 20 });
    el('path', { d: 'M288,224C306,224 314,240 312,262C310,286 300,304 288,304C276,304 266,286 264,262C262,240 270,224 288,224Z', fill: 'none', stroke: BRASS.deep, 'stroke-width': 1.2, 'stroke-opacity': 0.6 }, g);
    el('path', { d: 'M288,252a9,9 0 1 1 0.1,0ZM283,258L280,284H296L293,258Z', fill: '#1a0a06' }, g);
    for (let i = 0; i < 5; i++) {
      const x = 256 + i * 16;
      el('circle', { cx: x, cy: 338, r: 5.6, fill: MAPLE[0] }, g);
      el('circle', { cx: x, cy: 338, r: 4, fill: '#1e0b07' }, g);
    }
    // alas (plinth) yang sedikit menonjol
    wood(g, rrect(10, 370, 556, 30, 4), [10, 370, 556, 30], R, { tone: DARKW, n: 24, cast: 'cast', grain: 4 });
    el('path', { d: 'M14,372H562', stroke: '#e9b27c', 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, g);
    string(g, 'M30,386H546', { w: 1.2, o: 0.6 });
    // kilap tepi: terang di kiri-atas, teduh di kanan
    el('path', { d: 'M18,124H558', stroke: '#f1c08a', 'stroke-width': 2, 'stroke-opacity': 0.55 }, g);
    el('path', { d: 'M18,126V368', stroke: '#f1c08a', 'stroke-width': 2, 'stroke-opacity': 0.3 }, g);
    el('rect', { x: 520, y: 124, width: 40, height: 246, fill: linGrad(g, [[0, '#1c0906', 0], [1, '#1c0906', 0.45]], 520, 0, 560, 0) }, g);
    // siku kuningan di empat sudut muka
    bracket(g, R, 16, 122, 1, 1);
    bracket(g, R, 560, 122, -1, 1);
    bracket(g, R, 16, 370, 1, -1);
    bracket(g, R, 560, 370, -1, -1);
    // kaki bulat kuningan
    for (const x of [44, 484]) brass(g, `M${x},398H${x + 48}Q${x + 50},420 ${x + 24},420Q${x - 2},420 ${x},398Z`, [x, 398, 48, 22], R, { n: 8 });
  }

  /* ───────────── laci kecil (kanvas 200×108, muka 192×96 di (4,4)) ───────────── */
  function drawer(g, R) {
    wood(g, rrect(4, 4, LW, LH, 4), [4, 4, LW, LH], R, { tone: BURL, n: 46, cast: 'cast', grain: 10, dir: [1, 0.08] });
    // panel timbul: tepi terang kiri-atas, teduh kanan-bawah
    el('path', { d: `M6,${LH + 2}V6H${LW + 2}`, fill: 'none', stroke: '#ffd9a6', 'stroke-width': 2, 'stroke-opacity': 0.7 }, g);
    el('path', { d: `M6,${LH + 2}H${LW + 2}V6`, fill: 'none', stroke: '#3a160c', 'stroke-width': 2.4, 'stroke-opacity': 0.55 }, g);
    string(g, rrect(16, 15, LW - 24, LH - 22, 6), { w: 1.5 });
    for (const [x, y] of [[26, 25], [LW - 18, 25], [26, LH - 17], [LW - 18, LH - 17]]) { el('circle', { cx: x, cy: y, r: 2.6, fill: MAPLE[2] }, g); }
    // kenop kuningan dengan roset
    const cx = 100, cy = 52;
    const ro = el('g', { filter: 'url(#cast)' }, g);
    for (let i = 0; i < 8; i++) el('ellipse', { cx, cy: cy - 15, rx: 5.4, ry: 8, fill: i % 2 ? BRASS.base : BRASS.light, transform: `rotate(${i * 45} ${cx} ${cy})` }, ro);
    el('circle', { cx, cy, r: 13, fill: BRASS.mid }, ro);
    el('circle', { cx, cy, r: 11, fill: radGrad(g, [[0, '#fffbe6'], [0.35, BRASS.light], [0.75, BRASS.base], [1, BRASS.dark]], cx - 4, cy - 5, 15) }, g);
    el('ellipse', { cx: cx - 3.4, cy: cy - 4.4, rx: 3.6, ry: 2.4, fill: '#fff', opacity: 0.85 }, g);
  }
  /* laci rahasia di bawah cermin (kanvas 392×62, muka 380×50 di (6,6)): tanpa kenop, hanya tatahan */
  function secret(g, R) {
    wood(g, rrect(6, 6, 380, 50, 5), [6, 6, 380, 50], R, { tone: BURL, n: 50, cast: 'cast', grain: 8 });
    el('path', { d: 'M8,54V8H384', fill: 'none', stroke: '#ffd9a6', 'stroke-width': 2, 'stroke-opacity': 0.7 }, g);
    el('path', { d: 'M8,54H384V8', fill: 'none', stroke: '#3a160c', 'stroke-width': 2.2, 'stroke-opacity': 0.55 }, g);
    string(g, rrect(16, 14, 360, 34, 6), { w: 1.4 });
    sprig(g, 216, 36, 0.9, 1);
    sprig(g, 176, 36, 0.9, -1);
    inlayMark(g, 196, 33, 0.82);
    for (const x of [40, 352]) { el('path', { d: `M${x},31l6,-6l6,6l-6,6Z`, fill: MAPLE[1], transform: 'translate(-6 0)' }, g); }
  }

  /* ───────────── tutup tertutup (576×170): sisi atas bertatah, bibir depan, kait kuningan ───────────── */
  function lidClosed(g, R) {
    const top = 'M48,10L528,10L566,118L10,118Z';
    wood(g, top, [10, 10, 556, 108], R, { tone: BURL, n: 90, cast: 'cast', grain: 16 });
    // bingkai sonokeling di sekeliling panel
    el('path', { d: `${top}M74,24L502,24L530,104L46,104Z`, 'fill-rule': 'evenodd', fill: ROSE[1], opacity: 0.8 }, g);
    string(g, 'M74,24L502,24L530,104L46,104Z', { w: 1.8 });
    string(g, 'M62,17L514,17L548,111L28,111Z', { w: 1.1, o: 0.5 });
    // medali tengah: kamboja bertatah diapit sulur daun
    el('ellipse', { cx: 288, cy: 64, rx: 74, ry: 30, fill: DARKW[1], opacity: 0.75 }, g);
    string(g, oval(288, 64, 74, 30), { w: 1.6 });
    inlayMark(g, 288, 68, 2.2, 0.5);
    sprig(g, 372, 68, 1.3, 1, 0.55);
    sprig(g, 204, 68, 1.3, -1, 0.55);
    for (const [x, y] of [[92, 36], [486, 36], [74, 92], [504, 92]]) inlayMark(g, x, y, 0.5, 0.5);
    // kilap pernis
    el('path', { d: 'M90,30L260,30L226,96L64,96Z', fill: '#fff3d6', opacity: 0.16, filter: 'url(#soft)' }, clipG(g, top));
    // bibir depan tutup
    wood(g, rrect(8, 116, 560, 30, 5), [8, 116, 560, 30], R, { tone: ROSE, n: 30, cast: 'cast', grain: 5 });
    el('path', { d: 'M12,118H564', stroke: '#f6c894', 'stroke-width': 2, 'stroke-opacity': 0.75 }, g);
    string(g, 'M30,132H250M326,132H546', { w: 1.2, o: 0.65 });
    // kait kuningan
    brass(g, 'M262,112H314Q318,112 318,118V140Q318,160 288,164Q258,160 258,140V118Q258,112 262,112Z', [258, 112, 60, 52], R, { n: 16 });
    el('circle', { cx: 288, cy: 136, r: 8, fill: radGrad(g, [[0, '#fffbe6'], [0.5, BRASS.base], [1, BRASS.deep]], 285, 133, 10) }, g);
    el('path', { d: 'M268,120H308', stroke: BRASS.deep, 'stroke-width': 1.2, 'stroke-opacity': 0.6 }, g);
  }

  /* ───────────── tutup terbuka (500×310): bingkai kayu, cermin berbingkai emas, rongga laci rahasia ───────────── */
  function lidOpen(g, R) {
    const outer = 'M22,10L478,10L486,300L14,300Z';
    wood(g, outer, [14, 10, 472, 290], R, { tone: ROSE, n: 80, cast: 'castBig', grain: 12 });
    el('path', { d: 'M24,12H476', stroke: '#f6c894', 'stroke-width': 2.4, 'stroke-opacity': 0.8 }, g);
    string(g, 'M30,18L470,18L477,292L23,292Z', { w: 1.2, o: 0.5 });
    // bingkai emas + cermin
    brass(g, rrect(36, 24, 428, 204, 12), [36, 24, 428, 204], R, { n: 50, cast: 'cast' });
    const md = rrect(46, 34, 408, 184, 7);
    const mst = [[0, '#fff6e4'], [0.35, '#f3dcc8'], [0.7, '#d9d6d2'], [1, '#c2c9cc']];
    // kaca cermin: licin, tanpa serat kuas (serat membuatnya tampak seperti bulu)
    const m = painted(g, md, {
      base: linGrad(g, mst, 46, 34, 400, 218), n: 8, R, filter: '',
      stroke: () => { const x = 46 + R() * 408, y = 34 + R() * 184, L = 90 + R() * 140, t = ((x - 46) / 408 + (y - 34) / 184) / 2; return { d: `M${x},${y}l${-L * 0.45},${L}`, color: ramp(mst, t + (R() - 0.5) * 0.12), width: 40 + R() * 40, opacity: 0.08 + R() * 0.08 }; },
    });
    // pantulan: jendela senja yang buram + kilau miring
    el('ellipse', { cx: 130, cy: 90, rx: 90, ry: 60, fill: '#ffe2a6', opacity: 0.55, filter: 'url(#softer)' }, m.inner);
    el('ellipse', { cx: 380, cy: 190, rx: 90, ry: 50, fill: '#b98f86', opacity: 0.3, filter: 'url(#softer)' }, m.inner);
    el('path', { d: 'M150,20L210,20L110,240L50,240Z', fill: '#fff', opacity: 0.3, filter: 'url(#blur2)' }, m.inner);
    el('path', { d: 'M232,20L250,20L150,240L132,240Z', fill: '#fff', opacity: 0.22, filter: 'url(#blur2)' }, m.inner);
    el('path', { d: md, fill: 'none', stroke: '#3a2410', 'stroke-width': 10, 'stroke-opacity': 0.28, filter: 'url(#blur2)', transform: 'translate(3 4)' }, m.inner);
    el('path', { d: md, fill: 'none', stroke: BRASS.deep, 'stroke-width': 1.6, 'stroke-opacity': 0.7 }, g);
    for (const [x, y] of [[41, 29], [459, 29], [41, 223], [459, 223]]) { el('circle', { cx: x, cy: y, r: 3.4, fill: BRASS.deep, opacity: 0.6 }, g); el('circle', { cx: x - 0.8, cy: y - 0.8, r: 1.5, fill: BRASS.hi }, g); }
    // rongga laci rahasia
    el('path', { d: rrect(57, 235, 386, 56, 7), fill: '#2a0f08', opacity: 0.6 }, g);
    el('path', { d: rrect(60, 238, 380, 50, 5), fill: linGrad(g, [[0, '#0f0306'], [0.5, VEL.deep], [1, VEL.dark]], 0, 238, 0, 288) }, g);
  }

  /* ───────────── kunci putar ───────────── */
  /** rebah di meja (kanvas 200×110): sayap kupu-kupu di kiri, batang berulir ke kanan, pita kecil */
  function keyLying(g, R) {
    // pita merah muda diikat di leher kunci
    shape(g, 'M70,56C58,74 50,88 40,104L58,100L62,108C68,92 74,76 80,58Z', [40, 56, 40, 52], [VEL.mid, VEL.base, VEL.hi], R, { n: 12, dir: [0.3, 1], len: [10, 30], width: [3, 7], cast: 'cast' });
    shape(g, 'M78,56C84,74 92,86 104,98L106,84L118,86C104,76 94,66 88,54Z', [78, 54, 40, 44], [VEL.dark, VEL.base, VEL.light], R, { n: 12, dir: [0.5, 1], len: [10, 30], width: [3, 7], cast: 'cast' });
    // batang
    const st = [[0, BRASS.dark], [0.25, BRASS.hi], [0.5, BRASS.light], [0.8, BRASS.mid], [1, BRASS.deep]];
    painted(g, rrect(76, 36, 112, 18, 5), { base: linGrad(g, st, 0, 36, 0, 54), n: 10, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${76 + R() * 90},${38 + R() * 14}h${10 + R() * 30}`, color: jitter(BRASS.base, 6, R), width: 2 + R() * 2, opacity: 0.3 }) });
    for (let x = 150; x < 186; x += 6) el('path', { d: `M${x},37l3,16`, stroke: BRASS.deep, 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, g);
    brass(g, rrect(70, 30, 18, 30, 5), [70, 30, 18, 30], R, { n: 6 });
    // sayap kupu-kupu
    const wing = 'M70,45C64,22 46,4 28,6C10,8 6,28 16,38C22,44 32,46 40,45C32,46 22,48 16,54C6,64 12,82 30,84C48,86 64,68 70,45Z';
    brass(g, wing, [6, 4, 66, 82], R, { n: 30 });
    el('path', { d: 'M54,34C50,24 40,16 30,18C22,20 20,30 26,34C34,38 46,38 54,34ZM54,56C50,66 40,74 30,72C22,70 20,60 26,56C34,52 46,52 54,56Z', fill: '#3a2410', opacity: 0.75 }, g);
    el('path', { d: 'M30,10C18,12 12,24 18,34', fill: 'none', stroke: '#fffaf0', 'stroke-width': 2.4, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, g);
    // simpul pita
    el('ellipse', { cx: 79, cy: 56, rx: 8, ry: 6, fill: VEL.base, filter: 'url(#cast)' }, g);
    el('ellipse', { cx: 77, cy: 54, rx: 3, ry: 2, fill: VEL.hi }, g);
  }
  /** terpasang di lubang kunci, dilihat dari depan (kanvas 124×124, pusat 62,62) */
  function keyFront(g, R) {
    const lobe = 'M62,62C52,40 34,28 20,34C4,42 4,82 20,90C34,96 52,84 62,62Z';
    brass(g, lobe, [4, 30, 58, 64], R, { n: 20 });
    brass(g, 'M62,62C72,40 90,28 104,34C120,42 120,82 104,90C90,96 72,84 62,62Z', [62, 30, 58, 64], R, { n: 20 });
    el('path', { d: 'M46,62C40,50 30,44 22,48C14,54 14,70 22,76C30,80 40,74 46,62Z', fill: '#2c1a0a', opacity: 0.8 }, g);
    el('path', { d: 'M78,62C84,50 94,44 102,48C110,54 110,70 102,76C94,80 84,74 78,62Z', fill: '#2c1a0a', opacity: 0.8 }, g);
    el('path', { d: 'M22,38C12,44 8,58 12,70', fill: 'none', stroke: '#fffaf0', 'stroke-width': 2.2, 'stroke-opacity': 0.75, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M74,44C82,36 94,32 102,36', fill: 'none', stroke: '#fffaf0', 'stroke-width': 2, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: 62, cy: 62, r: 17, fill: BRASS.dark, filter: 'url(#cast)' }, g);
    el('circle', { cx: 62, cy: 62, r: 15, fill: radGrad(g, [[0, '#fffbe6'], [0.4, BRASS.light], [0.8, BRASS.base], [1, BRASS.dark]], 57, 56, 20) }, g);
    mark(g, 62, 63.5, 0.56, BRASS.dark, { core: BRASS.hi, opacity: 0.85 });
  }

  /* ───────────── sepasang bangau kertas di atas tangkai kuningan (kanvas 190×180, kaki tangkai di 95,172) ───────────── */
  /** f = 1 menghadap kanan, -1 menghadap kiri. Dicerminkan lewat koordinat (bukan scale negatif) supaya
   *  filter relief tetap diterangi dari kiri-atas; dengan scale(-1) kertas emasnya jadi kusam kehijauan. */
  function crane(g, R, cols, f = 1) {
    const [dk, md, lt, hi] = cols;
    const P = (pts, close = true) => 'M' + pts.map(([x, y]) => `${x * f},${y}`).join('L') + (close ? 'Z' : '');
    const box = [f > 0 ? -42 : -50, -72, 92, 78];
    const facet = (pts, c, o = 1) => { const p = shape(g, P(pts), box, [mix(c, dk, 0.3), c, mix(c, hi, 0.45)], R, { n: 8, dir: [0.4 * f, 1], len: [10, 30], width: [4, 9] }); p.g.setAttribute('opacity', o); return p; };
    facet([[-4, -14], [18, -14], [14, -62]], mix(dk, md, 0.4)); // sayap jauh
    facet([[-6, -12], [-18, -12], [-42, -54]], md); // ekor
    facet([[6, -12], [20, -12], [34, -60]], md); // leher
    facet([[34, -60], [49, -47], [31, -50]], lt); // kepala & paruh
    facet([[-22, -12], [22, -12], [0, 4]], md); // badan
    facet([[-22, -12], [0, -12], [0, 4]], dk, 0.5);
    facet([[-16, -14], [14, -14], [-6, -70]], lt); // sayap dekat
    facet([[-6, -70], [-1, -14], [14, -14]], hi, 0.55); // lipatan terang di sayap dekat
    const line = (pts) => P(pts, false);
    el('path', { d: [line([[-6, -70], [-1, -14]]), line([[-22, -12], [22, -12]]), line([[6, -12], [34, -60]]), line([[-18, -12], [-42, -54]])].join(''), fill: 'none', stroke: hi, 'stroke-width': 1.2, 'stroke-opacity': 0.85, 'stroke-linecap': 'round' }, g);
    el('path', { d: line([[-16, -14], [-6, -70], [14, -14]]), fill: 'none', stroke: dk, 'stroke-width': 1, 'stroke-opacity': 0.45, 'stroke-linejoin': 'round' }, g);
  }
  function cranes(g, R) {
    // tangkai + palang
    const rod = [[0, BRASS.dark], [0.3, BRASS.hi], [0.6, BRASS.base], [1, BRASS.deep]];
    el('path', { d: 'M95,172V118', stroke: linGrad(g, rod, 91, 0, 99, 0), 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M38,120Q95,106 152,120', fill: 'none', stroke: BRASS.dark, 'stroke-width': 6.4, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M38,119Q95,105 152,119', fill: 'none', stroke: BRASS.light, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: 95, cy: 113, r: 6, fill: radGrad(g, [[0, '#fffbe6'], [0.5, BRASS.base], [1, BRASS.dark]], 93, 111, 8) }, g);
    const a = at(g, 'translate(52 114) scale(1.12)', { filter: 'url(#cast)' });
    crane(a, R, ['#a8384e', '#d66578', '#f09aa6', '#ffd9dc']);
    const b = at(g, 'translate(138 114) scale(1.12)', { filter: 'url(#cast)' });
    crane(b, R, ['#c98a2a', '#f2c766', '#ffe6a6', '#fffbe8'], -1);
    // hati kecil di antara dua paruh
    el('path', { d: 'M0,7C-12,-3 -6,-12 0,-5C6,-12 12,-3 0,7Z', fill: VEL.base, transform: 'translate(95 40) scale(0.9)', filter: 'url(#cast)' }, g);
  }

  /* ───────────── not & kilau yang melayang ───────────── */
  function note1(g, R, cols = [BRASS.mid, BRASS.base, BRASS.hi]) {
    el('circle', { cx: 28, cy: 40, r: 26, fill: cols[2], opacity: 0.4, filter: 'url(#soft)' }, g);
    const d = 'M10,54C10,46 18,42 26,44C28,44.5 30,45.5 31,47V10L52,18C56,24 56,32 50,38C52,30 46,26 37,24V54C37,62 28,66 20,64C14,62 10,59 10,54Z';
    shape(g, d, [8, 8, 50, 58], cols, R, { n: 14, dir: [0.3, 1], len: [8, 24], width: [3, 6], cast: 'cast' });
    el('ellipse', { cx: 19, cy: 51, rx: 5, ry: 3, fill: '#fff', opacity: 0.75, transform: 'rotate(-20 19 51)' }, g);
  }
  function note2(g, R, cols = [VEL.mid, VEL.light, VEL.hi]) {
    el('circle', { cx: 38, cy: 40, r: 30, fill: cols[2], opacity: 0.35, filter: 'url(#soft)' }, g);
    const d = 'M8,56C8,48 16,45 23,47C24,47.3 25,47.8 26,48.5V16L64,8V50C64,58 56,61 49,59C43,57 40,54 40,50C40,43 48,40 55,42C56,42.3 57,42.8 58,43.5V22L32,27.5V56C32,64 24,67 17,65C11,63 8,60 8,56Z';
    shape(g, d, [6, 6, 60, 62], cols, R, { n: 16, dir: [0.3, 1], len: [8, 24], width: [3, 6], cast: 'cast' });
    el('ellipse', { cx: 17, cy: 53, rx: 4.6, ry: 2.8, fill: '#fff', opacity: 0.7, transform: 'rotate(-20 17 53)' }, g);
  }
  function sparkle(g) {
    el('circle', { cx: 24, cy: 24, r: 18, fill: '#fff0b8', opacity: 0.55, filter: 'url(#soft)' }, g);
    el('path', { d: 'M24,2C25.5,15 33,22.5 46,24C33,25.5 25.5,33 24,46C22.5,33 15,25.5 2,24C15,22.5 22.5,15 24,2Z', fill: '#fffbe8' }, g);
    el('path', { d: 'M24,10C25,18 30,23 38,24C30,25 25,30 24,38C23,30 18,25 10,24C18,23 23,18 24,10Z', fill: '#ffe08a', opacity: 0.8 }, g);
  }

  /* ───────────── dasar kotak dari atas (640×470) + lapisan beludru (560×404) ───────────── */
  function floor(g, R) {
    wood(g, rrect(8, 8, 624, 454, 18), [8, 8, 624, 454], R, { tone: ROSE, n: 110, cast: 'castBig', grain: 20 });
    string(g, rrect(22, 22, 596, 426, 12), { w: 1.6, o: 0.7 });
    for (const [x, y, sx, sy] of [[8, 8, 1, 1], [632, 8, -1, 1], [8, 462, 1, -1], [632, 462, -1, -1]]) bracket(g, R, x, y, sx, sy);
    const rec = rrect(46, 46, 548, 378, 8);
    const v = shape(g, rec, [46, 46, 548, 378], [VEL.deep, '#551a2a', VEL.dark], R, { n: 40, len: [40, 110], width: [28, 50], filter: 'canvas' });
    el('path', { d: rec, fill: 'none', stroke: '#12030a', 'stroke-width': 30, 'stroke-opacity': 0.6, filter: 'url(#soft)', transform: 'translate(8 10)' }, v.inner);
    // amplop surat: kertas krem berkawung samar, lipatan tutup, segel lilin kamboja
    const env = at(g, 'rotate(-3 320 235)');
    el('path', { d: rrect(104, 104, 432, 262, 6), fill: '#12030a', opacity: 0.5, filter: 'url(#soft)', transform: 'translate(8 12)' }, env);
    const e = shape(env, rrect(104, 104, 432, 262, 6), [104, 104, 432, 262], PAPER, R, { n: 60, len: [50, 160], width: [10, 22] });
    el('path', { d: rrect(104, 104, 432, 262, 6), fill: kawung(g, '#c9a877', 44, 1.2), opacity: 0.22 }, e.inner);
    el('path', { d: 'M104,366L250,236M536,366L390,236', fill: 'none', stroke: '#b89668', 'stroke-width': 1.6, 'stroke-opacity': 0.55 }, e.inner);
    el('path', { d: 'M106,106L320,262L534,106', fill: 'none', stroke: '#8a6a44', 'stroke-width': 9, 'stroke-opacity': 0.22, filter: 'url(#blur2)', transform: 'translate(0 5)' }, e.inner);
    el('path', { d: 'M106,106L320,262L534,106', fill: 'none', stroke: '#b89668', 'stroke-width': 2, 'stroke-opacity': 0.8 }, e.inner);
    const seal = 'M320,222C340,218 356,232 360,250C366,270 352,292 330,296C308,302 286,290 282,268C276,246 296,224 320,222Z';
    shape(env, seal, [278, 218, 88, 84], [VEL.dark, VEL.base, VEL.light], R, { n: 20, len: [10, 30], width: [4, 9], cast: 'cast' });
    el('circle', { cx: 321, cy: 259, r: 26, fill: 'none', stroke: VEL.dark, 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, env);
    mark(env, 321, 260, 1.05, VEL.dark, { core: VEL.hi });
    el('path', { d: 'M300,236C306,230 316,228 324,230', fill: 'none', stroke: '#ffd0d6', 'stroke-width': 2.6, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, env);
  }
  function velvet(g, R) {
    const d = rrect(6, 6, 548, 378, 8);
    // beludru: kilau lembut yang melebar, bukan sapuan panjang bergaris (itu terlihat seperti bulu)
    const vst = [[0, VEL.light], [0.45, VEL.base], [1, VEL.mid]];
    const v = painted(g, d, {
      base: linGrad(g, vst, 6, 6, 400, 384), n: 46, R, filter: 'canvas', cast: 'cast',
      stroke: () => { const x = R() * 560, y = R() * 390, L = 40 + R() * 90; return { d: `M${x},${y}q${L / 2},${-6 + R() * 12} ${L},${R() * 8}`, color: jitter(ramp(vst, (x / 560 + y / 390) / 2 + (R() - 0.5) * 0.3), 4, R), width: 26 + R() * 30, opacity: 0.18 + R() * 0.22 }; },
    });
    // jahitan kapitone belah ketupat + kancing kecil
    const q = el('g', { fill: 'none', 'stroke-linecap': 'round' }, v.inner);
    for (let i = -6; i < 12; i++) {
      el('path', { d: `M${i * 92},0L${i * 92 + 400},400`, stroke: VEL.deep, 'stroke-width': 3, 'stroke-opacity': 0.5 }, q);
      el('path', { d: `M${i * 92 + 3},0L${i * 92 + 403},400`, stroke: VEL.hi, 'stroke-width': 1.4, 'stroke-opacity': 0.45 }, q);
      el('path', { d: `M${i * 92 + 400},0L${i * 92},400`, stroke: VEL.deep, 'stroke-width': 3, 'stroke-opacity': 0.5 }, q);
      el('path', { d: `M${i * 92 + 403},0L${i * 92 + 3},400`, stroke: VEL.hi, 'stroke-width': 1.4, 'stroke-opacity': 0.45 }, q);
    }
    for (let r = 0; r < 10; r++) for (let c = -1; c < 8; c++) {
      const x = c * 92 + (r % 2 ? 46 : 0) + 16, y = r * 46 + 16;
      el('circle', { cx: x, cy: y, r: 5, fill: VEL.deep, opacity: 0.6 }, v.inner);
      el('circle', { cx: x - 1, cy: y - 1.4, r: 3.4, fill: radGrad(g, [[0, '#fff4cc'], [1, BRASS.base]], x - 2, y - 2, 4) }, v.inner);
    }
    el('path', { d, fill: kawung(g, VEL.hi, 46, 1), opacity: 0.16 }, v.inner);
    el('path', { d: 'M40,10L250,10L140,390L-60,390Z', fill: '#ffd0d6', opacity: 0.2, filter: 'url(#softer)' }, v.inner);
    el('path', { d, fill: 'none', stroke: VEL.deep, 'stroke-width': 3, 'stroke-opacity': 0.6 }, v.inner);
    el('path', { d: rrect(14, 14, 532, 362, 5), fill: 'none', stroke: '#f1d58a', 'stroke-width': 1.6, 'stroke-dasharray': '7 6', 'stroke-opacity': 0.7 }, v.inner);
    // tali pita emas untuk mengangkatnya
    shape(g, 'M242,362H318V400L280,386L242,400Z', [242, 362, 76, 40], [BRASS.mid, BRASS.light, BRASS.hi], R, { n: 12, dir: [0.1, 1], len: [8, 24], width: [5, 10], cast: 'cast' });
    el('path', { d: 'M250,368H310', stroke: BRASS.dark, 'stroke-width': 1.6, 'stroke-dasharray': '4 3', opacity: 0.7 }, g);
    mark(g, 280, 381, 0.5, BRASS.dark, { core: BRASS.hi, opacity: 0.8 });
  }

  /* ───────────── mini-game: si Not yang ngantukan + bantal ───────────── */
  function sleepy(g, R) {
    // tangkai + bendera
    const cols = ['#c98a1e', '#f4bf3d', '#ffe89a'];
    shape(g, 'M134,150V26C134,22 138,18 142,20C176,30 190,52 184,82C180,66 168,56 148,54V150Z', [132, 18, 60, 134], cols, R, { n: 24, dir: [0.2, 1], len: [14, 40], width: [5, 10], cast: 'cast' });
    // kepala not: bulat gemuk
    const head = 'M92,92C130,92 154,116 154,148C154,184 126,206 90,206C52,206 26,184 26,150C26,116 54,92 92,92Z';
    const hst = [[0, '#fff3b8'], [0.4, '#ffd659'], [0.8, '#f2ae2a'], [1, '#c98218']];
    painted(g, head, {
      base: radGrad(g, hst, 72, 128, 96), n: 70, R, filter: 'impasto', cast: 'castBig',
      stroke: () => { const a = R() * 6.28, r = Math.sqrt(R()) * 58, x = 90 + Math.cos(a) * r, y = 149 + Math.sin(a) * r * 0.9, L = 14 + R() * 26; return { d: `M${x},${y}q${L / 2},${-4 + R() * 8} ${L},${R() * 6}`, color: jitter(ramp(hst, Math.hypot(x - 72, y - 128) / 96), 6, R), width: 8 + R() * 12, opacity: 0.35 + R() * 0.4 }; },
    });
    el('path', { d: 'M50,124C56,110 70,102 86,100', fill: 'none', stroke: '#fffdf0', 'stroke-width': 7, 'stroke-opacity': 0.7, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
  }
  function pillow(g, R) {
    const d = 'M24,40C60,24 180,24 216,40C232,60 232,84 216,98C180,112 60,112 24,98C8,84 8,60 24,40Z';
    const v = shape(g, d, [8, 24, 224, 88], [VEL.mid, VEL.base, VEL.hi], R, { n: 50, len: [30, 90], width: [8, 16], cast: 'castBig' });
    el('path', { d, fill: kawung(g, '#ffd0d6', 34, 1), opacity: 0.3 }, v.inner);
    el('ellipse', { cx: 120, cy: 58, rx: 70, ry: 16, fill: VEL.dark, opacity: 0.5, filter: 'url(#soft)' }, v.inner);
    el('path', { d: 'M40,44C80,34 160,34 200,44', fill: 'none', stroke: '#ffe0e4', 'stroke-width': 4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, v.inner);
    for (const [x, y, r] of [[18, 40, -40], [222, 40, 40], [18, 98, -140], [222, 98, 140]]) {
      const t = at(g, `translate(${x} ${y}) rotate(${r})`);
      el('path', { d: 'M0,0V-14M-4,-2L-8,-14M4,-2L8,-14', stroke: BRASS.base, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, t);
      el('circle', { r: 4, fill: BRASS.light }, t);
    }
  }

  /* ───────────── sprite ───────────── */
  const scaled = (name, w, h, seed, draw, k = 0.5) => { F.sprites[name] = { w: w * k, h: h * k, viewBox: `0 0 ${w} ${h}`, seed, draw }; };

  F.sprites['bg-kotakmusik'] = { w: W, h: H, seed: 651, scale: 1, draw(svg, R) { room(svg, R); } };
  scaled('kotakmusik-badan', BW, BH, 652, (svg, R) => body(svg, R));
  scaled('kotakmusik-tutup', 576, 170, 653, (svg, R) => lidClosed(svg, R));
  scaled('kotakmusik-tutup-dalam', 500, 310, 654, (svg, R) => lidOpen(svg, R));
  scaled('kotakmusik-laci', 200, 108, 655, (svg, R) => drawer(svg, R), 0.6);
  scaled('kotakmusik-laci-rahasia', 392, 62, 656, (svg, R) => secret(svg, R), 0.6);
  scaled('kotakmusik-kunci', 200, 110, 657, (svg, R) => keyLying(svg, R), 0.7);
  scaled('kotakmusik-kunci-putar', 124, 124, 658, (svg, R) => keyFront(svg, R), 0.7);
  scaled('kotakmusik-bangau', 190, 180, 659, (svg, R) => cranes(svg, R), 0.9);
  F.sprites['kotakmusik-taplak'] = { w: 390, h: 92, viewBox: '0 996 780 184', seed: 668, draw(svg, R) { lace(svg, R); } };
  scaled('kotakmusik-not-1', 62, 72, 660, (svg, R) => note1(svg, R), 0.7);
  scaled('kotakmusik-not-2', 74, 74, 661, (svg, R) => note2(svg, R), 0.7);
  scaled('kotakmusik-kilau', 48, 48, 662, (svg) => sparkle(svg), 0.7);
  scaled('kotakmusik-dasar', 640, 470, 663, (svg, R) => floor(svg, R));
  scaled('kotakmusik-beludru', 560, 404, 664, (svg, R) => velvet(svg, R));
  scaled('game-kotakmusik-not', 200, 220, 665, (svg, R) => sleepy(svg, R), 0.8);
  scaled('game-kotakmusik-bantal', 240, 130, 666, (svg, R) => pillow(svg, R), 0.8);

  F.sprites['cover-kotakmusik'] = { w: 480, h: 600, seed: 667, draw(svg, R) {
    room(at(svg, 'translate(0 -176) scale(0.6154)'), R, { deco: false });
    // taplak & bayangan kotak
    el('ellipse', { cx: 250, cy: 534, rx: 214, ry: 20, fill: '#3a1d12', opacity: 0.45, filter: 'url(#soft)' }, svg);
    const b = at(svg, 'translate(42 26) scale(0.69)');
    lidOpen(at(b, 'translate(38 4)'), R);
    secret(at(b, 'translate(92 236)'), R);
    const bd = at(b, 'translate(0 290)');
    body(bd, R);
    // pin silinder (di situs digerakkan dari DOM)
    for (let i = 0; i < 26; i++) { const x = 86 + R() * 210, y = 44 + R() * 40; el('circle', { cx: x, cy: y, r: 2.2, fill: BRASS.deep }, bd); el('circle', { cx: x - 0.8, cy: y - 0.8, r: 1, fill: '#fffbe6' }, bd); }
    SLOTS.forEach(([x, y], i) => { if (i !== 1) drawer(at(bd, `translate(${x - 4} ${y - 4})`), R); });
    // satu laci terbuka dengan secarik catatan mengintip
    const od = at(bd, `translate(${SLOTS[1][0] - 10} ${SLOTS[1][1] + 12}) scale(1.06)`);
    shape(od, 'M30,-18H150L156,10H24Z', [24, -18, 132, 28], PAPER, R, { n: 10, len: [20, 60], width: [5, 10], cast: 'cast' });
    el('path', { d: 'M44,-8H136M48,0H120', stroke: '#8a6a44', 'stroke-width': 2, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, od);
    drawer(od, R);
    cranes(at(bd, 'translate(315 -100)'), R);
    keyFront(at(bd, 'translate(226 202)'), R);
    for (let i = 0; i < 5; i++) el('circle', { cx: 256 + i * 16, cy: 338, r: 3.4, fill: radGrad(svg, [[0, '#fff'], [1, '#ffd98a']], 255 + i * 16, 337, 4) }, bd);
    // not & kilau yang naik
    note1(at(svg, 'translate(150 150) rotate(-12) scale(0.8)'), R);
    note2(at(svg, 'translate(238 78) rotate(8) scale(0.78)'), R);
    note1(at(svg, 'translate(330 132) rotate(14) scale(0.62)'), R, [VEL.mid, VEL.light, VEL.hi]);
    note2(at(svg, 'translate(96 62) rotate(-8) scale(0.56)'), R, [BRASS.mid, BRASS.base, BRASS.hi]);
    for (const [x, y, s] of [[206, 170, 0.6], [300, 60, 0.5], [120, 120, 0.42], [384, 96, 0.5], [262, 190, 0.36]]) sparkle(at(svg, `translate(${x} ${y}) scale(${s})`));
    // kamboja di depan
    F.flora.flowers.kamboja(at(svg, 'translate(60 560) rotate(14) scale(1 0.8)'), R, 0.2);
    F.flora.flowers.kambojaPink(at(svg, 'translate(428 566) rotate(-30) scale(1 0.8)'), R, 0.15);
    el('rect', { x: 0, y: 0, width: 480, height: 600, fill: radGrad(svg, [[0, '#000', 0], [0.62, '#000', 0], [1, '#5a2a1c', 0.36]], 240, 310, 430) }, svg);
  } };
})();
