/* Bola Kaca: bola kaca berisi dunia tropis mungil (rumah kecil di bukit, di bawah pohon kamboja) di ambang
   jendela pagi. Latar kamar + jendela, empat langit (pagi, siang, senja, malam) untuk di dalam bola, dunia
   mungilnya versi siang & malam, kaca, debu, pita kado, alas kayu berpelat kuningan, kunci putar, bulan,
   lampion kecil, bagian bawah alas dengan surat terlipat, dan awan iseng untuk mini-game.
   Semua tulisan dipasang dari DOM di atas lukisan ini. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, mix, jitter, ramp, linGrad, radGrad, leaf, dabs } = F;
  const W = 780, H = 1500;
  /** bola kaca di dunia lukisan: pusat & jari-jari luar; bagian dalam (dunia mungil) memakai kanvas 500×500 */
  const GX = 390, GY = 640, RG = 255;
  const BRASS = { hi: '#fff4cc', light: '#f1d58a', base: '#c99a3e', mid: '#a87a26', dark: '#6e4b14', deep: '#47300b' };
  const PINK = { hi: '#ffd6e4', light: '#f39ab9', base: '#d9578a', mid: '#b83d6f', dark: '#8a2a54', deep: '#5a1838' };
  /** kayu: [gelap, dasar, terang] */
  const WALNUT = ['#2a140b', '#55301c', '#8c5a36'];
  const MAPLE = ['#cfa868', '#f2dcab', '#fff3d6'];
  const PAPER = ['#e6d3ad', '#fbf1d8', '#fffaf0'];

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const circ = (cx, cy, r) => `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}Z`;
  const oval = (cx, cy, rx, ry) => `M${cx - rx},${cy}A${rx},${ry} 0 1 1 ${cx + rx},${cy}A${rx},${ry} 0 1 1 ${cx - rx},${cy}Z`;
  const at = (g, transform, extra = {}) => el('g', { transform, ...extra }, g);
  const clipG = (g, d) => { const id = F.uid('b'); const cp = el('clipPath', { id }, g); el('path', { d }, cp); return el('g', { 'clip-path': `url(#${id})` }, g); };

  /** bidang bebas dilukis dengan sapuan searah `dir`; cols = [gelap, dasar, terang] */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90], base, transform, opacity = [0.35, 0.8] } = {}) => painted(g, d, {
    base: base || cols[1], n, R, filter, cast, transform,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: opacity[0] + R() * (opacity[1] - opacity[0]) };
    },
  });

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
  function inlayMark(g, x, y, s, squash = 1) {
    mark(g, x + 0.8, y + 1, s, '#1a0a05', { opacity: 0.5, squash, core: '#1a0a05' });
    mark(g, x, y, s, MAPLE[1], { squash, core: '#c9853a' });
    mark(g, x - 0.4, y - 0.5, s * 0.55, MAPLE[2], { squash, opacity: 0.7, core: '#e2a04a' });
  }
  function string(g, d, { w = 2, o = 0.9, color = MAPLE[1] } = {}) {
    el('path', { d, fill: 'none', stroke: '#1a0a05', 'stroke-width': w, 'stroke-opacity': 0.4, transform: 'translate(0.8 1)', 'stroke-linejoin': 'round' }, g);
    el('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-opacity': o, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
  }
  function sprig(g, x, y, s, flip = 1, squash = 1, color = MAPLE[1]) {
    const m = at(g, `translate(${x} ${y}) scale(${s * flip} ${s * squash})`);
    string(m, 'M0,0C18,-12 40,-12 58,-2', { w: 1.6, color });
    [[12, -6, -50], [24, -10, 40], [36, -9, -40], [48, -6, 46], [58, -2, 10]].forEach(([lx, ly, rot]) => {
      const d = 'M0,0C5,-4 5,-11 0,-15C-5,-11 -5,-4 0,0Z';
      el('path', { d, fill: '#1a0a05', opacity: 0.4, transform: `translate(${lx + 0.7} ${ly + 0.9}) rotate(${rot})` }, m);
      el('path', { d, fill: color, transform: `translate(${lx} ${ly}) rotate(${rot})` }, m);
    });
  }
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

  /* ───────────── latar: dinding biru pucat, jendela pagi, tirai tipis, ambang jendela ───────────── */
  const WIN = { x: 76, y: 104, w: 628, h: 884 };
  const SILL = 986;
  function outside(g, R) {
    const c = clipG(g, rrect(WIN.x, WIN.y, WIN.w, WIN.h, 3));
    const sk = [[0, '#9fc3e6'], [0.3, '#c6dcef'], [0.6, '#eceef0'], [0.82, '#fde6d2'], [1, '#fbd9bd']];
    wash(c, { x: WIN.x - 30, y: WIN.y - 30, w: WIN.w + 60, h: WIN.h + 60, R, n: 300, angle: -4, len: [0.25, 0.6], width: [24, 54], opacity: [0.3, 0.6], base: linGrad(g, sk, 0, WIN.y, 0, WIN.y + WIN.h), color: (u, v) => ramp(sk, v + (u - 0.5) * 0.06) });
    // matahari pagi di kiri-atas (di luar bingkai), cahayanya membanjiri kaca
    el('circle', { cx: 60, cy: 170, r: 330, fill: radGrad(g, [[0, '#fffaf0', 0.95], [0.35, '#fff3d6', 0.6], [1, '#fff3d6', 0]], 60, 170, 330) }, c);
    F.latar.clouds(c, R, '#ffffff', [[540, 250, 400, 80, 0.6], [250, 430, 330, 56, 0.45], [610, 560, 280, 46, 0.4]]);
    F.latar.clouds(c, R, '#ffd9cf', [[430, 330, 360, 36, 0.3]]);
    // bukit & laut jauh, berkabut
    el('path', { d: 'M60,790Q170,740 290,770T520,752T720,778V860H60Z', fill: '#b9cfd8', opacity: 0.9, filter: 'url(#blur2)' }, c);
    el('path', { d: 'M60,812H720V880H60Z', fill: linGrad(g, [[0, '#cfe1e8'], [1, '#e5eef0']], 0, 812, 0, 880), opacity: 0.9 }, c);
    for (let i = 0; i < 18; i++) el('path', { d: `M${80 + R() * 620},${820 + R() * 50}h${20 + R() * 50}`, stroke: '#ffffff', 'stroke-width': 2, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, c);
    // nyiur jauh
    const palm = (x, y, s) => {
      const p = at(c, `translate(${x} ${y}) scale(${s})`, { fill: '#8fb0b6', opacity: 0.85 });
      el('path', { d: 'M0,0C2,-30 6,-60 14,-90', fill: 'none', stroke: '#8fb0b6', 'stroke-width': 4 }, p);
      [[-40, 10], [-14, -8], [20, -6], [44, 12], [0, -16]].forEach(([dx, dy]) => el('path', { d: `M14,-90Q${14 + dx * 0.6},${-104 + dy} ${14 + dx},${-86 + dy * 1.4}Q${14 + dx * 0.5},${-96 + dy} 14,-90Z`, stroke: '#8fb0b6', 'stroke-width': 3 }, p));
    };
    palm(118, 792, 0.9); palm(150, 800, 0.7); palm(640, 786, 0.85);
    // kebun di luar, kabur karena jauh dari fokus
    const bush = el('g', { filter: 'url(#soft)' }, c);
    for (let i = 0; i < 70; i++) {
      const left = R() < 0.5, x = left ? 70 + R() * 130 : 590 + R() * 130, y = 840 + R() * 160;
      el('ellipse', { cx: x, cy: y, rx: 22 + R() * 34, ry: 16 + R() * 22, fill: jitter(['#6fa77a', '#8ebf86', '#4f8a64', '#a9d197'][Math.floor(R() * 4)], 8, R), opacity: 0.9 }, bush);
    }
    for (let i = 0; i < 26; i++) {
      const left = R() < 0.5, x = left ? 80 + R() * 110 : 600 + R() * 110, y = 850 + R() * 130;
      el('circle', { cx: x, cy: y, r: 5 + R() * 6, fill: ['#ffffff', '#ffb6c8', '#ffe39a'][Math.floor(R() * 3)], opacity: 0.85 }, bush);
    }
    // dahan kamboja yang menjuntai dari kanan-atas, di luar
    const br = at(c, 'translate(0 560)', { opacity: 0.95 });
    el('path', { d: 'M760,96C700,140 660,170 600,182C570,188 548,200 530,222', fill: 'none', stroke: '#8a7466', 'stroke-width': 11, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, br);
    el('path', { d: 'M640,172C628,200 618,214 600,232', fill: 'none', stroke: '#8a7466', 'stroke-width': 7, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, br);
    [[530, 222, 150], [600, 232, 170], [690, 140, 120]].forEach(([x, y, rot], i) => {
      for (let k = 0; k < 5; k++) leaf(br, { len: 70 + R() * 30, w: 24 + R() * 8, ...F.flora.GREEN[k % 2], R, n: 12, transform: `translate(${x} ${y}) rotate(${rot - 70 + k * 34})`, cast: false });
      F.flora.flowers.kamboja(at(br, `translate(${x - 4} ${y - 6}) scale(1 0.9)`), R, 0.12);
      F.flora.flowers.kamboja(at(br, `translate(${x + 16} ${y + 8}) rotate(40)`), R, 0.1);
      if (i !== 1) F.flora.flowers.kambojaPink(at(br, `translate(${x - 18} ${y + 12}) rotate(-20)`), R, 0.09);
    });
  }
  function frame(g, R) {
    const wh = ['#cdd3dc', '#f5f3ee', '#fffdf8'];
    // kusen luar
    const outer = `${rrect(40, 70, 700, 940, 6)}${rrect(WIN.x, WIN.y, WIN.w, WIN.h, 3)}`;
    const p = painted(g, outer, {
      base: linGrad(g, [[0, '#fffdf8'], [0.5, '#f2f0ea'], [1, '#d9dde3']], 40, 70, 740, 1010), n: 90, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const vert = R() < 0.5; const x = 40 + R() * 700, y = 70 + R() * 940, L = 40 + R() * 160; return { d: vert ? `M${x},${y}v${L}` : `M${x},${y}h${L}`, color: jitter(mix(wh[1], R() < 0.5 ? wh[0] : wh[2], R() * 0.6), 4, R), width: 4 + R() * 8, opacity: 0.25 + R() * 0.35 }; },
    });
    p.g.querySelectorAll('path').forEach((e) => { if (e.getAttribute('d') === outer) { e.setAttribute('fill-rule', 'evenodd'); e.setAttribute('clip-rule', 'evenodd'); } });
    // bayangan kusen jatuh ke kaca (cahaya dari kiri-atas)
    const sh = clipG(g, rrect(WIN.x, WIN.y, WIN.w, WIN.h, 3));
    el('path', { d: `M${WIN.x},${WIN.y}h${WIN.w}v18H${WIN.x + 18}V${WIN.y + WIN.h}h-18Z`, fill: '#6f7f95', opacity: 0.22, filter: 'url(#blur2)' }, sh);
    // palang tengah & palang atas
    const bar = (d, box) => { shape(g, d, box, wh, R, { n: 24, dir: box[2] > box[3] ? [1, 0] : [0, 1], len: [40, 140], width: [3, 7], cast: 'cast' }); };
    bar(rrect(WIN.x, 330, WIN.w, 20, 2), [WIN.x, 330, WIN.w, 20]);
    bar(rrect(380, WIN.y, 20, WIN.h, 2), [380, WIN.y, 20, WIN.h]);
    el('path', { d: `M${WIN.x},331H${WIN.x + WIN.w}M381,${WIN.y}V${WIN.y + WIN.h}`, stroke: '#ffffff', 'stroke-width': 2, 'stroke-opacity': 0.9 }, g);
    el('path', { d: `M${WIN.x},350H${WIN.x + WIN.w}M400,${WIN.y}V${WIN.y + WIN.h}`, stroke: '#9aa6b6', 'stroke-width': 2, 'stroke-opacity': 0.6 }, g);
    // kait jendela kuningan kecil
    for (const [x, y] of [[372, 640], [408, 640]]) brass(g, rrect(x - 4, y - 14, 8, 28, 3), [x - 4, y - 14, 8, 28], R, { n: 4 });
    // tepi dalam kusen: terang di kiri-atas
    el('path', { d: `M42,1008V72H738`, fill: 'none', stroke: '#ffffff', 'stroke-width': 3, 'stroke-opacity': 0.8 }, g);
    el('path', { d: `M${WIN.x - 1},${WIN.y + WIN.h}V${WIN.y - 1}H${WIN.x + WIN.w + 1}`, fill: 'none', stroke: '#a3adbb', 'stroke-width': 3, 'stroke-opacity': 0.7 }, g);
  }
  function curtain(g, R, side) {
    // tirai voile tipis; side -1 = kiri, 1 = kanan
    const X = (x) => (side < 0 ? x : W - x);
    const d = `M${X(-30)},40L${X(150)},40C${X(160)},300 ${X(138)},620 ${X(122)},800C${X(118)},880 ${X(100)},960 ${X(70)},1010L${X(-30)},1010Z`;
    const g2 = el('g', { opacity: 0.82 }, g);
    const c = clipG(g2, d);
    el('path', { d, fill: linGrad(g, [[0, '#ffffff', 0.92], [1, '#eef2f7', 0.85]], X(0), 0, X(150), 0) }, c);
    for (let i = 0; i < 46; i++) {
      const x = -20 + R() * 170, y0 = 40 + R() * 200, len = 400 + R() * 600;
      const tone = R() < 0.55 ? '#d5dde8' : '#ffffff';
      el('path', { d: `M${X(x)},${y0}C${X(x - 4 + R() * 8)},${y0 + len * 0.3} ${X(x - 10 + R() * 8)},${y0 + len * 0.7} ${X(x - 24 + R() * 10)},${y0 + len}`, fill: 'none', stroke: tone, 'stroke-width': 4 + R() * 14, 'stroke-opacity': 0.35 + R() * 0.4, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, c);
    }
    // sulaman kamboja putih kecil di tepi bawah
    for (let i = 0; i < 4; i++) mark(c, X(20 + i * 30), 940 + (i % 2) * 22, 0.7, '#ffffff', { opacity: 0.7, core: '#f3e2b8' });
    el('path', { d: `M${X(150)},40C${X(160)},300 ${X(138)},620 ${X(122)},800C${X(118)},880 ${X(100)},960 ${X(70)},1010`, fill: 'none', stroke: '#c4ccd8', 'stroke-width': 3, 'stroke-opacity': 0.6 }, g2);
  }
  function room(svg, R, { deco = true } = {}) {
    // dinding biru pucat
    const tone = [[0, '#e7eef6'], [0.5, '#dbe7f3'], [1, '#c8d6e6']];
    wash(svg, { x: -40, y: -30, w: W + 80, h: H + 60, R, n: 360, angle: 86, len: [0.06, 0.16], width: [26, 60], opacity: [0.2, 0.45], base: linGrad(svg, tone, 0, 0, W * 0.4, H), color: (u, v) => ramp(tone, v * 0.8 + u * 0.2) });
    el('rect', { x: 0, y: 0, width: W, height: H, fill: kawung(svg, '#b4c4d8', 80, 1.5), opacity: 0.22 }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: kawung(svg, '#ffffff', 80, 1.5), opacity: 0.35, transform: 'translate(-1.4 -1.8)' }, svg);
    // panel kayu di bawah ambang (beadboard)
    wash(svg, { x: -20, y: 1080, w: W + 40, h: H - 1060, R, n: 160, angle: 90, len: [0.1, 0.3], width: [10, 24], opacity: [0.2, 0.45], base: linGrad(svg, [[0, '#c9d7e6'], [1, '#d8e3ef']], 0, 1080, 0, H), color: (u, v) => mix('#c3d2e3', '#e5edf5', R()) });
    for (let x = 26; x < W; x += 52) {
      el('path', { d: `M${x},1080V${H}`, stroke: '#9fb1c6', 'stroke-width': 2.4, 'stroke-opacity': 0.55 }, svg);
      el('path', { d: `M${x + 2.5},1080V${H}`, stroke: '#f5f8fb', 'stroke-width': 1.6, 'stroke-opacity': 0.7 }, svg);
    }
    el('rect', { x: 0, y: 1080, width: W, height: H - 1080, fill: kawung(svg, '#ffffff', 64, 1.2), opacity: 0.16 }, svg);
    // jendela
    outside(svg, R);
    frame(svg, R);
    // berkas cahaya pagi masuk dari kiri-atas
    el('path', { d: 'M76,104L360,104L760,1500L300,1500Z', fill: linGrad(svg, [[0, '#fff6e0', 0.0], [0.4, '#fff6e0', 0.22], [1, '#fff6e0', 0]], 0, 104, 0, 1500), filter: 'url(#softer)' }, svg);
    // tirai & batang tirai
    curtain(svg, R, -1);
    curtain(svg, R, 1);
    brass(svg, rrect(0, 30, W, 14, 7), [0, 30, W, 14], R, { n: 20, dir: [1, 0.1] });
    for (let x = 6; x < 150; x += 24) { el('circle', { cx: x, cy: 40, r: 7, fill: 'none', stroke: BRASS.mid, 'stroke-width': 2.4 }, svg); el('circle', { cx: W - x, cy: 40, r: 7, fill: 'none', stroke: BRASS.mid, 'stroke-width': 2.4 }, svg); }

    // ambang jendela: permukaan atas (sedikit terlihat dari atas) + sisi depan
    const top = `M10,${SILL}H770L790,1036H-10Z`;
    shape(svg, top, [-10, SILL, 800, 50], ['#d8d3ca', '#f2ede4', '#fffcf6'], R, { n: 80, len: [60, 220], width: [4, 10], filter: 'impastoFine' });
    el('path', { d: `M10,${SILL}H770`, stroke: '#a8a29a', 'stroke-width': 3, 'stroke-opacity': 0.5 }, svg);
    // petak cahaya jendela di ambang
    el('path', { d: `M120,${SILL + 4}L380,${SILL + 4}L430,1032L150,1032Z`, fill: '#fff4d6', opacity: 0.5, filter: 'url(#blur2)' }, svg);
    const face = shape(svg, rrect(-10, 1034, W + 20, 48, 4), [-10, 1034, W + 20, 48], ['#c9c8c6', '#e8e5df', '#fbf8f2'], R, { n: 40, len: [80, 240], width: [3, 8], cast: 'castBig' });
    el('path', { d: 'M-10,1036H790', stroke: '#ffffff', 'stroke-width': 3, 'stroke-opacity': 0.9 }, face.inner);
    el('path', { d: 'M-10,1074H790', stroke: '#9aa2ad', 'stroke-width': 6, 'stroke-opacity': 0.35 }, face.inner);
    // bayangan ambang di dinding
    el('rect', { x: 0, y: 1082, width: W, height: 70, fill: linGrad(svg, [[0, '#55688a', 0.35], [1, '#55688a', 0]], 0, 1082, 0, 1152) }, svg);

    if (deco) {
      // pot sirih gading di kiri: daunnya menjuntai ke depan ambang
      const pot = 'M20,930H118L108,1016Q69,1024 30,1016Z';
      shape(svg, pot, [20, 930, 98, 90], ['#9a4a2e', '#c86d45', '#e9a07a'], R, { n: 26, dir: [0.2, 1], len: [14, 40], width: [5, 12], cast: 'castBig' });
      shape(svg, rrect(14, 924, 110, 16, 5), [14, 924, 110, 16], ['#9a4a2e', '#d27b52', '#f0b08c'], R, { n: 10, len: [20, 60], width: [3, 6], cast: 'cast' });
      el('path', { d: 'M28,958H110', stroke: '#fff1e6', 'stroke-width': 2, 'stroke-opacity': 0.5, 'stroke-dasharray': '6 5' }, svg);
      const vine = (pts, gi) => {
        el('path', { d: pts, fill: 'none', stroke: '#3c6e3f', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      };
      vine('M70,930C40,980 10,1060 26,1150C34,1200 18,1250 8,1290', 1);
      vine('M90,934C120,990 120,1070 96,1130C84,1160 92,1200 104,1230', 0);
      const heart = (x, y, rot, s, gi) => leaf(svg, { len: 46 * s, w: 40 * s, ...F.flora.GREEN[gi], R, n: 12, transform: `translate(${x} ${y}) rotate(${rot})`, curve: 0.1 });
      [[60, 920, -20, 1.2, 0], [86, 916, 24, 1.3, 1], [40, 930, -60, 1.1, 2], [104, 930, 60, 1.1, 0], [72, 900, 4, 1.2, 3], [32, 990, -120, 1, 1], [20, 1060, -150, 0.95, 0], [30, 1130, -200, 0.9, 2], [18, 1200, -160, 0.85, 1], [10, 1270, -190, 0.8, 0], [118, 1000, 140, 1, 2], [108, 1080, 170, 0.95, 0], [96, 1140, 200, 0.9, 1], [104, 1210, 160, 0.85, 3]].forEach(([x, y, r, s, gi]) => heart(x, y, r, s, gi));
      // kamboja gugur di kanan ambang
      el('ellipse', { cx: 700, cy: 1022, rx: 46, ry: 10, fill: '#55688a', opacity: 0.25, filter: 'url(#soft)' }, svg);
      F.flora.flowers.kambojaPink(at(svg, 'translate(692 1008) rotate(18) scale(1 0.62)'), R, 0.17);
      F.flora.flowers.kamboja(at(svg, 'translate(748 1022) rotate(-30) scale(1 0.62)'), R, 0.14);
      F.flora.flowers.kamboja(at(svg, 'translate(640 1024) rotate(60) scale(1 0.6)'), R, 0.08);
    }
    // cahaya pinggir kamar
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#000', 0], [0.62, '#000', 0], [1, '#33435f', 0.32]], W / 2, H * 0.48, H * 0.8) }, svg);
  }

  /* ───────────── dunia mungil di dalam bola (kanvas lokal 500×500, pusat 250,250) ───────────── */
  const KAMBOJA_MALAM = { stops: [[0, '#a8945a'], [0.22, '#c4b67e'], [0.5, '#d4d7ea'], [1, '#e9ecf8']], shade: '#7f86a8', light: '#ffffff' };
  const PINK_MALAM = { stops: [[0, '#9c8452'], [0.22, '#b8a272'], [0.5, '#c9a6bd'], [1, '#b884a3']], shade: '#6d5a80', light: '#efe6f4' };
  const DAY = {
    sea: ['#9cc4cc', '#c3dde0'],
    far: ['#8fb7ad', '#acccbf', '#d3e6d6'],
    mid: ['#5b9668', '#78ae78', '#a8d197'],
    lawn: ['#468650', '#76b965', '#b5dc8a'],
    path: ['#d6bd8f', '#efdcb2', '#fff4d8'],
    wall: ['#d6c6b2', '#f8eee0', '#fffaf2'],
    roof: ['#8e3a26', '#c75c3b', '#ee9264'],
    door: ['#2c6178', '#3f819a', '#7fb9cc'],
    pane: '#5f87ab', frame: '#fffaf2',
    shutter: ['#a8386a', '#d9578a', '#f39ab9'],
    stone: ['#9b958c', '#c7c1b6'],
    trunk: ['#6a5446', '#977b6b', '#c9ad9c'],
    green: [F.flora.GREEN[0], F.flora.GREEN[1], F.flora.GREEN[3]],
    white: F.flora.PAL.kamboja, pink: F.flora.PAL.kambojaPink,
    blooms: ['#ffffff', '#ffb3c9', '#ffe08a', '#f47a9c', '#ffd1dc'],
    rim: '#fff8de', shadow: '#2a4630', post: ['#6a4a36', '#9a7254', '#c49a78'], box: ['#9c2f5e', '#d9578a', '#f39ab9'], palm: '#7da49e',
  };
  const NIGHT = {
    sea: ['#22365a', '#2d4672'],
    far: ['#1a2b4c', '#243a60', '#33507a'],
    mid: ['#173246', '#21455a', '#346173'],
    lawn: ['#112c36', '#1d4549', '#356666'],
    path: ['#525c78', '#6e7894', '#929bb5'],
    wall: ['#5d6788', '#868fb0', '#aab2cf'],
    roof: ['#2e1a30', '#4c2a42', '#6c4260'],
    door: ['#1a2840', '#24385a', '#41587e'],
    pane: '#1b2440', frame: '#b2b9d4',
    shutter: ['#3e1f3c', '#5f2e52', '#86507a'],
    stone: ['#454a62', '#5f6680'],
    trunk: ['#2e2b40', '#433f58', '#625e7c'],
    green: [{ dark: '#0d2530', mid: '#1b4046', light: '#3f7471' }, { dark: '#11293a', mid: '#21494f', light: '#4a7d78' }, { dark: '#142a2c', mid: '#284b46', light: '#55806f' }],
    white: KAMBOJA_MALAM, pink: PINK_MALAM,
    blooms: ['#d6daf0', '#b98aac', '#b8ae7c', '#9e6a8c', '#c9b4cc'],
    rim: '#7182b4', shadow: '#060c1c', post: ['#2e2633', '#4a3e4c', '#625468'], box: ['#3e1f3c', '#5f2e52', '#86507a'], palm: '#1e3354',
  };
  /** garis rumput depan (permukaan tempat kelopak mendarat), satuan lokal */
  const LAWN = 'M-10,372Q60,350 150,352Q230,346 300,352Q400,350 520,380V520H-10Z';
  function world(g, R, P) {
    // laut & bukit jauh
    el('path', { d: 'M-10,290H520V340H-10Z', fill: linGrad(g, [[0, P.sea[1]], [1, P.sea[0]]], 0, 290, 0, 340) }, g);
    for (let i = 0; i < 10; i++) el('path', { d: `M${R() * 480},${296 + R() * 20}h${10 + R() * 26}`, stroke: P.rim, 'stroke-width': 1.4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, g);
    const far = 'M-10,306Q40,276 110,290Q160,262 230,288Q300,300 340,286Q410,262 520,296V350H-10Z';
    shape(g, far, [-10, 262, 530, 90], P.far, R, { n: 40, len: [20, 60], width: [5, 12], filter: 'impastoFine' });
    el('path', { d: 'M-10,306Q40,276 110,290Q160,262 230,288Q300,300 340,286Q410,262 520,296', fill: 'none', stroke: P.rim, 'stroke-width': 2, 'stroke-opacity': 0.45, filter: 'url(#blur2)' }, g);
    // nyiur di bukit jauh
    for (const [x, y, s] of [[96, 290, 0.5], [118, 286, 0.38], [408, 276, 0.46]]) {
      const p = at(g, `translate(${x} ${y}) scale(${s})`);
      el('path', { d: 'M0,0C2,-20 4,-40 10,-60', fill: 'none', stroke: P.palm, 'stroke-width': 4, 'stroke-linecap': 'round' }, p);
      [[-30, 6], [-10, -6], [16, -4], [32, 8]].forEach(([dx, dy]) => el('path', { d: `M10,-60Q${10 + dx * 0.6},${-72 + dy} ${10 + dx},${-56 + dy * 1.3}`, fill: 'none', stroke: P.palm, 'stroke-width': 4, 'stroke-linecap': 'round' }, p));
    }
    // bukit tengah
    const mid = 'M-10,334Q80,304 190,320Q300,330 420,310Q480,304 520,318V380H-10Z';
    shape(g, mid, [-10, 300, 530, 80], P.mid, R, { n: 60, dir: [1, -0.1], len: [14, 40], width: [5, 11] });
    el('path', { d: 'M-10,334Q80,304 190,320Q300,330 420,310Q480,304 520,318', fill: 'none', stroke: P.rim, 'stroke-width': 2.4, 'stroke-opacity': 0.5 }, g);
    dabs(g, { n: 16, R, filter: 'impastoFine', place: (i, R2) => ({ x: R2() * 500, y: 322 + R2() * 18, rx: 10 + R2() * 12, ry: 7 + R2() * 6, color: jitter(R2() < 0.5 ? P.mid[0] : mix(P.mid[1], P.mid[2], 0.4), 6, R2), opacity: 0.85 }) });
    // padang rumput depan
    const lw = shape(g, LAWN, [-10, 346, 530, 170], P.lawn, R, { n: 110, dir: [0.15, -1], len: [8, 22], width: [3, 7], filter: 'impastoFine' });
    el('path', { d: LAWN, fill: linGrad(g, [[0, P.lawn[2], 0.25], [0.5, P.lawn[1], 0], [1, P.shadow, 0.35]], 0, 350, 0, 470) }, lw.inner);
    el('path', { d: 'M-10,372Q60,350 150,352Q230,346 300,352Q400,350 520,380', fill: 'none', stroke: P.rim, 'stroke-width': 2.4, 'stroke-opacity': 0.55 }, g);
    // jalan setapak dari pintu
    const path = 'M182,356Q176,380 196,402Q222,430 214,470L262,470Q266,430 236,400Q214,380 204,356Z';
    shape(g, path, [176, 356, 90, 114], P.path, R, { n: 26, len: [8, 20], width: [3, 6], dir: [0.3, 1] });
    for (let i = 0; i < 7; i++) el('ellipse', { cx: 196 + i * 4 + R() * 10, cy: 368 + i * 14, rx: 6, ry: 2.6, fill: P.path[0], opacity: 0.5 }, g);

    // rumah mungil
    el('ellipse', { cx: 232, cy: 358, rx: 86, ry: 9, fill: P.shadow, opacity: 0.4, filter: 'url(#blur2)' }, g);
    const wall = 'M160,300H282V356H160Z';
    const wl = shape(g, wall, [160, 300, 122, 56], P.wall, R, { n: 30, dir: [0.2, 1], len: [10, 26], width: [4, 8], cast: 'cast' });
    el('path', { d: 'M248,300H282V356H248Z', fill: P.shadow, opacity: 0.12 }, wl.inner);
    el('path', { d: 'M160,300H282V312H160Z', fill: P.shadow, opacity: 0.22 }, wl.inner);
    // batu fondasi
    for (let i = 0; i < 9; i++) el('path', { d: rrect(158 + i * 14, 352, 13, 7, 2.5), fill: P.stone[i % 2], opacity: 0.95 }, g);
    // pintu
    shape(g, rrect(176, 318, 24, 38, 3), [176, 318, 24, 38], P.door, R, { n: 10, dir: [0, 1], len: [8, 20], width: [3, 5], cast: 'cast' });
    el('path', { d: 'M180,322H196V352H180Z', fill: 'none', stroke: P.door[0], 'stroke-width': 1.2, 'stroke-opacity': 0.7 }, g);
    el('circle', { cx: 195, cy: 338, r: 1.8, fill: BRASS.light }, g);
    el('path', { d: 'M172,357H204', stroke: P.stone[1], 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    // jendela + daun jendela merah muda + bak bunga
    shape(g, 'M210,312H220V342H210Z', [210, 312, 10, 30], P.shutter, R, { n: 6, dir: [0, 1], len: [6, 14], width: [2, 4] });
    shape(g, 'M262,312H272V342H262Z', [262, 312, 10, 30], P.shutter, R, { n: 6, dir: [0, 1], len: [6, 14], width: [2, 4] });
    for (const x of [213, 216, 265, 268]) el('path', { d: `M${x},315V339`, stroke: P.shutter[0], 'stroke-width': 0.8, 'stroke-opacity': 0.6 }, g);
    el('path', { d: rrect(220, 312, 42, 30, 2), fill: P.frame }, g);
    el('path', { d: rrect(223, 315, 36, 24, 1), fill: linGrad(g, [[0, mix(P.pane, '#ffffff', 0.35)], [1, P.pane]], 223, 315, 259, 339) }, g);
    el('path', { d: 'M241,315V339M223,327H259', stroke: P.frame, 'stroke-width': 2.2 }, g);
    el('path', { d: 'M226,318L236,318L229,334Z', fill: '#ffffff', opacity: 0.25 }, g);
    shape(g, rrect(216, 342, 50, 7, 2), [216, 342, 50, 7], P.post, R, { n: 6, len: [10, 30], width: [2, 4] });
    for (let i = 0; i < 9; i++) el('circle', { cx: 220 + i * 5.2, cy: 341 - R() * 3, r: 2.4 + R() * 1.2, fill: P.blooms[i % 3 === 0 ? 1 : i % 3 === 1 ? 0 : 3] }, g);
    // atap genteng
    const roof = 'M142,304L176,262H266L300,304Z';
    const rf = shape(g, roof, [142, 262, 158, 42], P.roof, R, { n: 40, dir: [1, 0], len: [12, 40], width: [3, 6], cast: 'cast' });
    for (let y = 270; y < 304; y += 7) el('path', { d: `M${142 + (304 - y) * 0}${''},${y}H300`, stroke: P.roof[0], 'stroke-width': 1.2, 'stroke-opacity': 0.5 }, rf.inner);
    for (let y = 270, k = 0; y < 304; y += 7, k++) for (let x = 146 + (k % 2) * 5; x < 300; x += 10) el('path', { d: `M${x},${y}v7`, stroke: P.roof[0], 'stroke-width': 0.8, 'stroke-opacity': 0.4 }, rf.inner);
    el('path', { d: 'M176,262H266L300,304', fill: 'none', stroke: P.roof[2], 'stroke-width': 2.2, 'stroke-opacity': 0.8, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M142,304L176,262', fill: 'none', stroke: P.rim, 'stroke-width': 2.4, 'stroke-opacity': 0.7 }, g);
    el('path', { d: 'M142,304H300', stroke: P.roof[0], 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    // semak berbunga di kiri rumah
    for (const [x, y, s] of [[136, 348, 1], [118, 360, 0.8], [296, 352, 0.7]]) {
      el('ellipse', { cx: x + 4, cy: y + 6, rx: 24 * s, ry: 6 * s, fill: P.shadow, opacity: 0.35, filter: 'url(#blur2)' }, g);
      shape(g, oval(x, y - 8 * s, 24 * s, 18 * s), [x - 24 * s, y - 26 * s, 48 * s, 36 * s], [P.green[0].dark, P.green[0].mid, P.green[0].light], R, { n: 16, len: [5, 12], width: [3, 6], dir: [0.4, -1], cast: 'cast' });
      for (let i = 0; i < 6; i++) el('circle', { cx: x - 16 * s + R() * 32 * s, cy: y - 20 * s + R() * 18 * s, r: 2.6 * s + R() * 1.4, fill: P.blooms[[1, 3, 0][i % 3]] }, g);
    }
    // kotak pos kecil di tepi jalan setapak
    el('path', { d: 'M302,396V364', stroke: P.post[0], 'stroke-width': 3.4, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M302,396V364', stroke: P.post[1], 'stroke-width': 1.4, 'stroke-linecap': 'round', transform: 'translate(-0.8 0)' }, g);
    shape(g, 'M292,352H312Q316,352 316,358V366H288V358Q288,352 292,352Z', [288, 352, 28, 14], P.box, R, { n: 6, len: [6, 14], width: [2, 4], cast: 'cast' });
    el('path', { d: 'M316,354V346H322V350H316', fill: P.box[1], stroke: P.box[0], 'stroke-width': 0.8 }, g);

    // pohon kamboja
    const T = P.trunk;
    el('ellipse', { cx: 362, cy: 368, rx: 46, ry: 7, fill: P.shadow, opacity: 0.4, filter: 'url(#blur2)' }, g);
    const limb = (d, w) => {
      el('path', { d, fill: 'none', stroke: T[0], 'stroke-width': w + 2, 'stroke-linecap': 'round' }, g);
      el('path', { d, fill: 'none', stroke: T[1], 'stroke-width': w, 'stroke-linecap': 'round' }, g);
      el('path', { d, fill: 'none', stroke: T[2], 'stroke-width': w * 0.35, 'stroke-linecap': 'round', 'stroke-opacity': 0.7, transform: `translate(${-w * 0.22} 0)` }, g);
    };
    limb('M352,368C356,350 350,330 356,312', 11);
    limb('M356,314C340,300 326,290 314,276', 7);
    limb('M356,314C352,296 346,280 344,262', 6);
    limb('M356,314C368,298 378,288 392,272', 6.5);
    limb('M360,318C380,312 398,304 420,292', 6);
    limb('M318,282C306,280 296,282 286,290', 4);
    const tips = [[314, 276, -30], [344, 262, -6], [392, 272, 20], [420, 292, 44], [286, 290, -60]];
    tips.forEach(([x, y, rot], i) => {
      const gr = P.green[i % P.green.length];
      for (let k = 0; k < 6; k++) leaf(g, { len: 26 + R() * 10, w: 10 + R() * 3, ...gr, R, n: 8, transform: `translate(${x} ${y}) rotate(${rot - 75 + k * 30})`, filter: 'impastoFine' });
    });
    tips.forEach(([x, y], i) => {
      const pal = i % 2 ? P.pink : P.white;
      const fl = (dx, dy, r, s) => { const f = at(g, `translate(${x + dx} ${y + dy}) rotate(${r})`); for (let k = 0; k < 5; k++) F.petal(f, { len: 150 * s, w: 118 * s, round: 0.9, skew: 0.16, R, n: 10, side: 0.8, veins: 1, ...pal, transform: `rotate(${k * 72 + 8})`, filter: 'impastoFine' }); };
      fl(-4, -6, 10, 0.065);
      fl(6, -2, -20, 0.055);
      if (i !== 4) fl(-1, 5, 40, 0.05);
    });
    // rumpun rumput & bunga di padang
    for (let i = 0; i < 26; i++) {
      const x = R() * 500, y = 372 + R() * 70;
      if (x > 172 && x < 270 && y < 420) continue;
      el('path', { d: `M${x},${y}l-3,-8M${x},${y}l0,-10M${x},${y}l3,-8`, stroke: P.lawn[R() < 0.5 ? 0 : 2], 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-opacity': 0.8 }, g);
      if (R() < 0.6) el('circle', { cx: x + R() * 4 - 2, cy: y - 9, r: 2.2 + R() * 1.2, fill: P.blooms[Math.floor(R() * P.blooms.length)] }, g);
    }
  }

  /** langit di dalam bola (kanvas 500×500) */
  function skyDisc(g, R, stops, { n = 160 } = {}) {
    wash(g, { x: -20, y: -20, w: 540, h: 540, R, n, angle: -6, len: [0.25, 0.6], width: [22, 50], opacity: [0.3, 0.65], base: linGrad(g, stops, 0, 0, 0, 380), color: (u, v) => ramp(stops, v * 1.32 + (u - 0.5) * 0.05) });
  }
  function puff(g, R, color, puffs) {
    const c = el('g', { filter: 'url(#soft)' }, g);
    puffs.forEach(([cx, cy, w, h, op]) => {
      for (let i = 0; i < Math.round(w / 6); i++) {
        const u = (R() + R()) / 2, v = (R() + R() + R()) / 3;
        el('ellipse', { cx: cx - w / 2 + u * w, cy: cy - h / 2 + v * h, rx: 8 + R() * w * 0.12, ry: 6 + R() * h * 0.3, fill: jitter(color, 5, R), opacity: op * (0.5 + R() * 0.5) }, c);
      }
    });
    return c;
  }
  const SKIES = {
    pagi(g, R) {
      skyDisc(g, R, [[0, '#a9c7e8'], [0.35, '#cfdcee'], [0.62, '#f3e2dc'], [0.82, '#ffdcc0'], [1, '#ffd2a8']]);
      el('circle', { cx: 70, cy: 300, r: 220, fill: radGrad(g, [[0, '#fff6dc', 0.9], [0.45, '#ffe6c2', 0.4], [1, '#ffe6c2', 0]], 70, 300, 220) }, g);
      F.latar.clouds(g, R, '#ffffff', [[330, 150, 220, 36, 0.5], [140, 220, 160, 26, 0.4]]);
      F.latar.clouds(g, R, '#ffd2c8', [[380, 250, 200, 22, 0.45]]);
    },
    siang(g, R) {
      skyDisc(g, R, [[0, '#4b93d3'], [0.3, '#72b1e4'], [0.62, '#acd5f1'], [1, '#e3f2fa']]);
      puff(g, R, '#ffffff', [[360, 160, 150, 60, 0.95], [334, 182, 110, 40, 0.9], [110, 224, 110, 36, 0.85], [440, 238, 80, 26, 0.7]]);
      puff(g, R, '#c9dff2', [[370, 186, 140, 20, 0.6], [120, 238, 90, 14, 0.5]]);
    },
    senja(g, R) {
      skyDisc(g, R, [[0, '#463d7a'], [0.25, '#7f4b88'], [0.47, '#cd6289'], [0.66, '#f28a6a'], [0.84, '#ffbd78'], [1, '#ffd796']]);
      el('circle', { cx: 430, cy: 300, r: 240, fill: radGrad(g, [[0, '#ffe7a8', 0.9], [0.4, '#ffb780', 0.45], [1, '#ffb780', 0]], 430, 300, 240) }, g);
      const st = el('g', { filter: 'url(#blur2)' }, g);
      for (let i = 0; i < 16; i++) {
        const y = 110 + R() * 160, x = R() * 400, L = 60 + R() * 160;
        el('path', { d: `M${x},${y}q${L / 2},${-3 + R() * 6} ${L},${R() * 4}`, fill: 'none', stroke: ['#f6a3a8', '#ffcf9a', '#b4609a', '#ffe2b8'][Math.floor(R() * 4)], 'stroke-width': 4 + R() * 9, 'stroke-opacity': 0.5 + R() * 0.35, 'stroke-linecap': 'round' }, st);
      }
    },
    malam(g, R) {
      skyDisc(g, R, [[0, '#0b1433'], [0.4, '#152450'], [0.72, '#24386b'], [1, '#3b4d83']]);
      el('path', { d: 'M-20,330C120,240 300,150 520,60', fill: 'none', stroke: '#8fa2d8', 'stroke-width': 90, 'stroke-opacity': 0.14, filter: 'url(#softer)' }, g);
      el('path', { d: 'M-20,330C120,240 300,150 520,60', fill: 'none', stroke: '#c9d3f2', 'stroke-width': 30, 'stroke-opacity': 0.1, filter: 'url(#soft)' }, g);
      for (let i = 0; i < 150; i++) {
        const x = R() * 500, y = R() * 330, r = R() < 0.9 ? 0.6 + R() * 1.1 : 1.6 + R();
        el('circle', { cx: x, cy: y, r, fill: R() < 0.8 ? '#ffffff' : '#ffe9b0', opacity: 0.4 + R() * 0.6 }, g);
      }
      for (const [x, y, s] of [[120, 90, 1], [380, 120, 0.8], [70, 200, 0.7], [450, 210, 0.6], [260, 40, 0.7]]) {
        el('circle', { cx: x, cy: y, r: 7 * s, fill: '#fff6d8', opacity: 0.35, filter: 'url(#blur2)' }, g);
        el('path', { d: `M${x},${y - 9 * s}L${x + 1.6 * s},${y - 1.6 * s}L${x + 9 * s},${y}L${x + 1.6 * s},${y + 1.6 * s}L${x},${y + 9 * s}L${x - 1.6 * s},${y + 1.6 * s}L${x - 9 * s},${y}L${x - 1.6 * s},${y - 1.6 * s}Z`, fill: '#fffbe8' }, g);
      }
      F.latar.clouds(g, R, '#33477c', [[180, 250, 220, 24, 0.5], [420, 270, 160, 18, 0.4]]);
    },
  };

  /* ───────────── kaca (520×520, pusat 260,260, jari-jari 255) ───────────── */
  function glass(g) {
    const C = 260, r = 255;
    el('circle', { cx: C, cy: C, r, fill: radGrad(g, [[0, '#ffffff', 0], [0.8, '#ffffff', 0], [0.93, '#dfeaf6', 0.22], [0.985, '#f4f8ff', 0.5], [1, '#ffffff', 0.2]], C, C, r) }, g);
    // tepi pembiasan: garis gelap tipis + cahaya biru di sisi teduh
    el('circle', { cx: C, cy: C, r: r - 2, fill: 'none', stroke: '#2d4466', 'stroke-width': 3, 'stroke-opacity': 0.35 }, g);
    el('path', { d: `M${C + r * Math.cos(0.2)},${C + r * Math.sin(0.2)}A${r},${r} 0 0 1 ${C + r * Math.cos(1.6)},${C + r * Math.sin(1.6)}`, fill: 'none', stroke: '#22324a', 'stroke-width': 16, 'stroke-opacity': 0.16, filter: 'url(#blur2)' }, g);
    // pantulan jendela di kiri-atas: lengkung terang dengan bayangan kusennya
    const arc = (a0, a1, r0, r1) => {
      const p = (a, rr) => `${C + rr * Math.cos(a)},${C + rr * Math.sin(a)}`;
      return `M${p(a0, r1)}A${r1},${r1} 0 0 1 ${p(a1, r1)}L${p(a1, r0)}A${r0},${r0} 0 0 0 ${p(a0, r0)}Z`;
    };
    el('path', { d: arc(3.36, 4.42, 200, 238), fill: '#ffffff', opacity: 0.42, filter: 'url(#blur2)' }, g);
    el('path', { d: arc(3.42, 3.92, 210, 232), fill: '#ffffff', opacity: 0.45 }, g);
    el('path', { d: arc(4.0, 4.38, 210, 232), fill: '#ffffff', opacity: 0.4 }, g);
    el('path', { d: arc(4.6, 5.0, 214, 238), fill: '#ffffff', opacity: 0.28, filter: 'url(#blur2)' }, g);
    // kilau kecil tajam
    el('ellipse', { cx: 150, cy: 128, rx: 14, ry: 8, fill: '#ffffff', opacity: 0.85, transform: 'rotate(-40 150 128)', filter: 'url(#blur2)' }, g);
    el('circle', { cx: 168, cy: 112, r: 4, fill: '#ffffff', opacity: 0.9 }, g);
    // pantulan hangat dari alas kayu di kanan-bawah
    el('path', { d: arc(0.35, 1.05, 222, 246), fill: '#ffd9a8', opacity: 0.3, filter: 'url(#blur2)' }, g);
    // gelembung udara kecil di puncak
    el('ellipse', { cx: 300, cy: 22, rx: 22, ry: 6, fill: '#ffffff', opacity: 0.35 }, g);
  }
  /** debu tipis yang menutupi kaca: lebih tebal di atas dan di tepi */
  function dust(g, R) {
    const C = 260, r = 252;
    const cl = clipG(g, circ(C, C, r));
    el('circle', { cx: C, cy: C, r, fill: radGrad(g, [[0, '#d6cdbd', 0.64], [0.7, '#cdc3b1', 0.74], [1, '#b5a995', 0.9]], C, C - 40, r) }, cl);
    el('rect', { x: 0, y: 0, width: 520, height: 260, fill: linGrad(g, [[0, '#c9bfae', 0.55], [1, '#c9bfae', 0]], 0, 0, 0, 260) }, cl);
    const s = el('g', { filter: 'url(#soft)' }, cl);
    for (let i = 0; i < 70; i++) {
      const x = R() * 520, y = R() * 520;
      el('ellipse', { cx: x, cy: y, rx: 20 + R() * 50, ry: 14 + R() * 34, fill: R() < 0.5 ? '#f1ebe0' : '#a89a86', opacity: 0.12 + R() * 0.2, transform: `rotate(${R() * 180} ${x} ${y})` }, s);
    }
    const sw = el('g', { filter: 'url(#blur2)' }, cl);
    for (let i = 0; i < 8; i++) {
      const x = 60 + R() * 380, y = 80 + R() * 360, L = 50 + R() * 90, a = -0.5 + R() * 0.3;
      el('path', { d: `M${x},${y}q${Math.cos(a) * L / 2},${Math.sin(a) * L / 2 - 8} ${Math.cos(a) * L},${Math.sin(a) * L}`, fill: 'none', stroke: '#efe9de', 'stroke-width': 10 + R() * 10, 'stroke-opacity': 0.16, 'stroke-linecap': 'round' }, sw);
    }
    // bintik debu & serat halus
    for (let i = 0; i < 260; i++) el('circle', { cx: R() * 520, cy: R() * 520, r: 0.6 + R() * 1.8, fill: R() < 0.6 ? '#7d7062' : '#fffaf0', opacity: 0.35 + R() * 0.4 }, cl);
    for (let i = 0; i < 12; i++) { const x = R() * 520, y = R() * 520; el('path', { d: `M${x},${y}q${8 + R() * 10},${-6 + R() * 12} ${16 + R() * 20},${R() * 8}`, fill: 'none', stroke: '#6f6354', 'stroke-width': 0.8, 'stroke-opacity': 0.45 }, cl); }
    // bekas jari samar
    for (const [x, y] of [[360, 330], [150, 380]]) for (let k = 0; k < 6; k++) el('ellipse', { cx: x, cy: y, rx: 8 + k * 4, ry: 11 + k * 5, fill: 'none', stroke: '#efe8dc', 'stroke-width': 1.6, 'stroke-opacity': 0.35, transform: `rotate(20 ${x} ${y})` }, cl);
  }

  /* ───────────── alas kayu (480×240, pojok kiri-atas di dunia 150,790) ───────────── */
  /** pelat kuningan di muka alas (satuan lokal alas) — sama dengan .plate di CSS */
  const PLATE = [82, 96, 316, 72];
  function base(g, R) {
    const cyl = [[0, '#6a3d24'], [0.2, '#a46e46'], [0.38, '#8a5634'], [0.72, '#4e2a18'], [1, '#2a140b']];
    // kaki bawah (lis)
    const foot = 'M12,198A228,22 0 0 0 468,198L470,214A230,24 0 0 1 10,214Z';
    painted(g, foot, { base: linGrad(g, cyl, 10, 0, 470, 0), n: 30, R, filter: 'impastoFine', cast: 'castBig', stroke: () => { const y = 196 + R() * 40, x = 10 + R() * 420; return { d: `M${x},${y}h${30 + R() * 90}`, color: jitter(ramp(cyl, (x - 10) / 460), 5, R), width: 2 + R() * 4, opacity: 0.3 }; } });
    el('path', { d: 'M14,199A226,21 0 0 0 466,199', fill: 'none', stroke: '#e6b182', 'stroke-width': 2, 'stroke-opacity': 0.7 }, g);
    // badan alas: sedikit melebar ke bawah, serat melingkar
    const body = 'M54,56C42,104 28,150 22,200A218,22 0 0 0 458,200C452,150 438,104 426,56Z';
    const b = painted(g, body, {
      base: linGrad(g, cyl, 22, 0, 458, 0), n: 90, R, filter: 'impastoFine',
      stroke: () => { const y = 60 + R() * 150, x = 20 + R() * 420, L = 40 + R() * 120; return { d: `M${x},${y}q${L / 2},${4 + R() * 4} ${L},${R() * 3}`, color: jitter(mix(ramp(cyl, (x + L / 2 - 22) / 436), R() < 0.5 ? WALNUT[0] : WALNUT[2], R() * 0.2), 4, R), width: 2 + R() * 5, opacity: 0.16 + R() * 0.24 }; },
    });
    for (let i = 0; i < 22; i++) { const y = 70 + R() * 130, x = 30 + R() * 300, L = 60 + R() * 160; el('path', { d: `M${x},${y}q${L / 2},${6} ${L},${2}`, fill: 'none', stroke: R() < 0.7 ? WALNUT[0] : '#c08a5c', 'stroke-width': 0.8 + R(), 'stroke-opacity': 0.3, 'stroke-linecap': 'round' }, b.inner); }
    // alur bubutan
    for (const y of [86, 184]) {
      el('path', { d: `M30,${y}A214,20 0 0 0 450,${y}`, fill: 'none', stroke: '#1a0a05', 'stroke-width': 3, 'stroke-opacity': 0.45, transform: 'translate(0 1.5)' }, b.inner);
      el('path', { d: `M30,${y}A214,20 0 0 0 450,${y}`, fill: 'none', stroke: '#d79a68', 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, b.inner);
    }
    el('rect', { x: 300, y: 40, width: 170, height: 180, fill: linGrad(g, [[0, '#120603', 0], [1, '#120603', 0.55]], 300, 0, 470, 0) }, b.inner);
    el('rect', { x: 10, y: 40, width: 470, height: 180, fill: linGrad(g, [[0, '#120603', 0], [0.6, '#120603', 0], [1, '#120603', 0.35]], 0, 40, 0, 216) }, b.inner);
    el('rect', { x: 40, y: 40, width: 140, height: 180, fill: linGrad(g, [[0, '#ffd9a8', 0], [0.5, '#ffd9a8', 0.16], [1, '#ffd9a8', 0]], 40, 0, 180, 0) }, b.inner);
    el('path', { d: 'M60,70C50,110 40,150 34,196', fill: 'none', stroke: '#f2c08e', 'stroke-width': 3, 'stroke-opacity': 0.35, filter: 'url(#blur2)' }, b.inner);
    // tatahan kamboja di kiri & kanan pelat
    for (const x of [52, 428]) inlayMark(g, x, 132, 0.5, 0.92);
    // pelat kuningan (tulisannya dari DOM)
    const [px, py, pw, ph] = PLATE;
    el('path', { d: rrect(px - 3, py - 2, pw + 6, ph + 6, 10), fill: '#1a0a05', opacity: 0.45, filter: 'url(#blur2)', transform: 'translate(2 3)' }, g);
    brass(g, rrect(px, py, pw, ph, 9), [px, py, pw, ph], R, { n: 26, dir: [1, 0.1], stops: [[0, BRASS.base], [0.22, BRASS.hi], [0.45, BRASS.light], [0.75, BRASS.base], [1, BRASS.mid]] });
    el('path', { d: rrect(px + 7, py + 6, pw - 14, ph - 12, 6), fill: 'none', stroke: BRASS.dark, 'stroke-width': 1.4, 'stroke-opacity': 0.65 }, g);
    el('path', { d: rrect(px + 8, py + 7.4, pw - 14, ph - 12, 6), fill: 'none', stroke: BRASS.hi, 'stroke-width': 0.9, 'stroke-opacity': 0.7 }, g);
    for (const [x, y] of [[px + 14, py + 13], [px + pw - 14, py + 13], [px + 14, py + ph - 13], [px + pw - 14, py + ph - 13]]) { el('circle', { cx: x, cy: y, r: 2.6, fill: BRASS.deep, opacity: 0.6 }, g); el('circle', { cx: x - 0.6, cy: y - 0.6, r: 1.1, fill: BRASS.hi }, g); }
    el('path', { d: `M${px + 20},${py + 8}H${px + pw * 0.45}`, stroke: '#ffffff', 'stroke-width': 2.4, 'stroke-opacity': 0.45, 'stroke-linecap': 'round' }, g);
    // poros kunci di sisi kanan
    el('ellipse', { cx: 444, cy: 160, rx: 11, ry: 13, fill: '#1a0a05', opacity: 0.6, transform: 'translate(1.5 2)' }, g);
    el('ellipse', { cx: 444, cy: 160, rx: 10, ry: 12, fill: radGrad(g, [[0, BRASS.hi], [0.5, BRASS.base], [1, BRASS.dark]], 441, 156, 13) }, g);
    // leher kuningan tempat bola duduk
    const collar = 'M54,28A186,18 0 0 0 426,28L426,58A186,18 0 0 1 54,58Z';
    brass(g, collar, [54, 10, 372, 66], R, { n: 34, dir: [1, 0.05], stops: [[0, BRASS.mid], [0.16, BRASS.light], [0.3, BRASS.hi], [0.48, BRASS.light], [0.7, BRASS.base], [0.9, BRASS.mid], [1, BRASS.dark]] });
    el('path', { d: 'M54,28A186,18 0 0 0 426,28', fill: 'none', stroke: BRASS.hi, 'stroke-width': 2.4, 'stroke-opacity': 0.9 }, g);
    el('path', { d: 'M54,58A186,18 0 0 0 426,58', fill: 'none', stroke: BRASS.deep, 'stroke-width': 2, 'stroke-opacity': 0.7 }, g);
    for (let i = 0; i < 13; i++) {
      const t = (i + 0.5) / 13, a = Math.PI * (1 - t), x = 240 + 186 * Math.cos(a), y = 43 + 18 * Math.sin(a);
      mark(g, x, y, 0.32, BRASS.dark, { opacity: 0.5 * Math.sin(Math.PI * t) + 0.15, core: BRASS.hi, squash: 0.8 });
    }
  }

  /* ───────────── pita kado: tali yang melilit bola & alas, dan simpulnya ───────────── */
  /** tali pita (sprite di dunia: viewBox 120 330 540 700) */
  function ribbonBands(g, R) {
    const cols = [PINK.dark, PINK.base, PINK.light];
    // tali melintang di badan alas
    const band = 'M178,894Q390,918 602,894L606,944Q390,968 174,944Z';
    shape(g, band, [174, 890, 432, 80], cols, R, { n: 50, dir: [1, 0.02], len: [40, 140], width: [4, 9], cast: 'cast' });
    el('path', { d: 'M180,898Q390,922 600,898', fill: 'none', stroke: PINK.hi, 'stroke-width': 3, 'stroke-opacity': 0.6 }, g);
    el('path', { d: 'M178,940Q390,964 602,940', fill: 'none', stroke: PINK.deep, 'stroke-width': 2, 'stroke-opacity': 0.45 }, g);
    el('rect', { x: 500, y: 880, width: 110, height: 90, fill: linGrad(g, [[0, '#2a0a18', 0], [1, '#2a0a18', 0.35]], 500, 0, 610, 0) }, clipG(g, band));
    // tali tegak: di depan bola (meridian), lalu turun lurus di muka alas
    const pts = [];
    for (let y = 392; y <= 812; y += 12) { const t = (y - GY) / RG; const w = 50 * Math.pow(Math.max(0.08, 1 - t * t), 0.42); pts.push([y, w]); }
    let d = 'M' + pts.map(([y, w]) => `${GX - w / 2},${y}`).join('L');
    d += `L${GX - 25},1012L${GX + 25},1012`;
    d += 'L' + pts.slice().reverse().map(([y, w]) => `${GX + w / 2},${y}`).join('L') + 'Z';
    const v = shape(g, d, [GX - 26, 386, 52, 630], cols, R, { n: 60, dir: [0.02, 1], len: [40, 140], width: [4, 9], cast: 'castBig' });
    el('path', { d: `M${GX - 8},398V1008`, stroke: PINK.hi, 'stroke-width': 5, 'stroke-opacity': 0.45, filter: 'url(#blur2)' }, v.inner);
    el('path', { d: `M${GX + 14},398V1008`, stroke: PINK.deep, 'stroke-width': 8, 'stroke-opacity': 0.25, filter: 'url(#blur2)' }, v.inner);
    // kilau satin di bagian bola yang paling dekat ke cahaya
    el('ellipse', { cx: GX - 6, cy: 520, rx: 10, ry: 60, fill: '#ffffff', opacity: 0.28, filter: 'url(#blur2)' }, v.inner);
  }
  /** simpul pita di puncak bola (kanvas 300×220, simpul di 150,74) */
  function bow(g, R) {
    const cols = [PINK.dark, PINK.base, PINK.light];
    // ekor pita
    shape(g, 'M140,82C120,120 96,160 70,206L92,196L100,216C122,168 142,128 156,90Z', [70, 82, 90, 136], cols, R, { n: 18, dir: [-0.4, 1], len: [16, 50], width: [4, 8], cast: 'cast' });
    shape(g, 'M158,86C176,126 196,164 230,204L234,182L252,190C220,152 196,118 172,80Z', [156, 80, 98, 126], [PINK.deep, PINK.mid, PINK.base], R, { n: 18, dir: [0.4, 1], len: [16, 50], width: [4, 8], cast: 'cast' });
    // dua kelopak simpul
    const loopL = 'M146,72C120,40 70,14 38,28C14,40 22,84 50,96C80,108 122,92 146,80Z';
    const loopR = 'M154,72C180,40 230,14 262,28C286,40 278,84 250,96C220,108 178,92 154,80Z';
    const l = shape(g, loopL, [14, 14, 134, 96], cols, R, { n: 30, dir: [-1, -0.4], len: [20, 60], width: [5, 10], cast: 'castBig' });
    el('path', { d: 'M138,74C112,52 76,40 52,48C42,52 40,66 50,74', fill: 'none', stroke: PINK.deep, 'stroke-width': 6, 'stroke-opacity': 0.4, filter: 'url(#blur2)' }, l.inner);
    el('path', { d: 'M44,34C60,24 90,26 118,46', fill: 'none', stroke: PINK.hi, 'stroke-width': 4, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, l.inner);
    const r = shape(g, loopR, [152, 14, 134, 96], [PINK.deep, PINK.mid, PINK.base], R, { n: 30, dir: [1, -0.4], len: [20, 60], width: [5, 10], cast: 'castBig' });
    el('path', { d: 'M162,74C188,52 224,40 248,48C258,52 260,66 250,74', fill: 'none', stroke: PINK.deep, 'stroke-width': 6, 'stroke-opacity': 0.45, filter: 'url(#blur2)' }, r.inner);
    el('path', { d: 'M184,42C208,28 236,24 256,32', fill: 'none', stroke: PINK.light, 'stroke-width': 3, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, r.inner);
    // simpul tengah
    shape(g, rrect(132, 58, 36, 34, 12), [132, 58, 36, 34], cols, R, { n: 12, dir: [0, 1], len: [10, 24], width: [4, 7], cast: 'cast' });
    el('path', { d: 'M140,64Q150,60 160,64', fill: 'none', stroke: PINK.hi, 'stroke-width': 3, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, g);
    // benang label
    el('path', { d: 'M162,86C190,110 214,130 226,160', fill: 'none', stroke: '#f6efe2', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
  }

  /* ───────────── kunci putar kupu-kupu (kanvas 120×120, poros di 60,60) ───────────── */
  function key(g, R) {
    brass(g, 'M60,60C50,38 32,26 18,32C2,40 2,80 18,88C32,94 50,82 60,60Z', [2, 26, 58, 68], R, { n: 18 });
    brass(g, 'M60,60C70,38 88,26 102,32C118,40 118,80 102,88C88,94 70,82 60,60Z', [60, 26, 58, 68], R, { n: 18 });
    el('path', { d: 'M44,60C38,48 28,42 20,46C12,52 12,68 20,74C28,78 38,72 44,60Z', fill: '#2c1a0a', opacity: 0.78 }, g);
    el('path', { d: 'M76,60C82,48 92,42 100,46C108,52 108,68 100,74C92,78 82,72 76,60Z', fill: '#2c1a0a', opacity: 0.78 }, g);
    el('path', { d: 'M20,36C10,42 6,56 10,68', fill: 'none', stroke: '#fffaf0', 'stroke-width': 2.2, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: 60, cy: 60, r: 14, fill: BRASS.dark, filter: 'url(#cast)' }, g);
    el('circle', { cx: 60, cy: 60, r: 12.4, fill: radGrad(g, [[0, '#fffbe6'], [0.4, BRASS.light], [0.8, BRASS.base], [1, BRASS.dark]], 56, 55, 16) }, g);
    mark(g, 60, 61, 0.46, BRASS.dark, { core: BRASS.hi, opacity: 0.85 });
  }

  /* ───────────── bulan sabit (90×90) & lampion kecil (64×90) ───────────── */
  function moon(g, R) {
    el('circle', { cx: 45, cy: 45, r: 40, fill: '#fff3c8', opacity: 0.28, filter: 'url(#soft)' }, g);
    const d = 'M58,14C40,10 20,24 18,44C16,66 34,82 56,78C40,72 32,58 33,44C34,30 44,18 58,14Z';
    shape(g, d, [16, 10, 44, 72], ['#e8cf8a', '#fff1c4', '#fffbe8'], R, { n: 14, dir: [0.3, 1], len: [8, 20], width: [3, 6] });
    for (const [x, y, r] of [[26, 40, 3], [30, 58, 2.4], [24, 52, 1.6]]) el('circle', { cx: x, cy: y, r, fill: '#e2c47c', opacity: 0.6 }, g);
  }
  function lantern(g, R) {
    el('ellipse', { cx: 32, cy: 46, rx: 30, ry: 38, fill: '#ffcf7a', opacity: 0.45, filter: 'url(#soft)' }, g);
    const body = 'M14,12Q32,4 50,12L56,64Q32,74 8,64Z';
    const p = painted(g, body, {
      base: radGrad(g, [[0, '#fffbe0'], [0.35, '#ffe39a'], [0.75, '#f6a548'], [1, '#d9703a']], 32, 56, 46), n: 16, R, filter: 'impastoFine',
      stroke: () => { const x = 10 + R() * 44, y = 10 + R() * 54; return { d: `M${x},${y}l${(R() - 0.5) * 4},${10 + R() * 14}`, color: jitter(R() < 0.5 ? '#ffd27a' : '#fff1c0', 6, R), width: 3 + R() * 4, opacity: 0.4 }; },
    });
    for (const x of [22, 32, 42]) el('path', { d: `M${x + (x - 32) * -0.2},10L${x + (x - 32) * 0.15},68`, stroke: '#c8642e', 'stroke-width': 1.2, 'stroke-opacity': 0.5 }, p.inner);
    el('path', { d: 'M12,64Q32,72 52,64', fill: 'none', stroke: '#b85a2a', 'stroke-width': 2, 'stroke-opacity': 0.7 }, g);
    el('ellipse', { cx: 32, cy: 66, rx: 9, ry: 3, fill: '#fffbe8' }, g);
    el('ellipse', { cx: 32, cy: 64, rx: 4, ry: 5, fill: '#ffffff', opacity: 0.9, filter: 'url(#blur2)' }, g);
  }

  /* ───────────── bagian bawah alas (520×520) & surat terlipat (320×220) ───────────── */
  function underside(g, R) {
    const C = 260;
    el('circle', { cx: C + 8, cy: C + 14, r: 250, fill: '#0c0814', opacity: 0.5, filter: 'url(#softer)' }, g);
    const cyl = [[0, WALNUT[2]], [0.45, WALNUT[1]], [1, WALNUT[0]]];
    const ring = painted(g, circ(C, C, 248), {
      base: linGrad(g, cyl, 40, 40, 480, 480), n: 110, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const a = R() * Math.PI * 2, r = 150 + R() * 96, L = 0.2 + R() * 0.5; const x1 = C + r * Math.cos(a), y1 = C + r * Math.sin(a), x2 = C + r * Math.cos(a + L), y2 = C + r * Math.sin(a + L); return { d: `M${x1},${y1}A${r},${r} 0 0 1 ${x2},${y2}`, color: jitter(ramp(cyl, ((x1 + y1) / 2 - 40) / 440 + (R() - 0.5) * 0.2), 5, R), width: 2 + R() * 6, opacity: 0.3 + R() * 0.3 }; },
    });
    for (const r of [238, 226, 212]) {
      el('circle', { cx: C, cy: C, r, fill: 'none', stroke: '#140804', 'stroke-width': 2.4, 'stroke-opacity': 0.5 }, ring.inner);
      el('circle', { cx: C - 0.8, cy: C - 1, r, fill: 'none', stroke: '#d7a06e', 'stroke-width': 1.2, 'stroke-opacity': 0.45 }, ring.inner);
    }
    // alas laken merah muda
    const felt = shape(g, circ(C, C, 200), [60, 60, 400, 400], ['#b45f7c', '#d1839c', '#ecb3c4'], R, { n: 90, len: [10, 30], width: [6, 14], filter: 'canvas', dir: [1, 0.6] });
    el('circle', { cx: C, cy: C, r: 200, fill: kawung(g, '#f7d2dc', 52, 1.4), opacity: 0.35 }, felt.inner);
    el('circle', { cx: C, cy: C, r: 200, fill: 'none', stroke: '#6e2a44', 'stroke-width': 18, 'stroke-opacity': 0.3, filter: 'url(#blur2)', transform: 'translate(5 7)' }, felt.inner);
    el('circle', { cx: C, cy: C, r: 192, fill: 'none', stroke: '#fff0f4', 'stroke-width': 1.6, 'stroke-dasharray': '6 6', 'stroke-opacity': 0.6 }, g);
    // pelat mesin musik kecil di tepi kanan + cap kamboja
    brass(g, circ(410, 352, 30), [380, 322, 60, 60], R, { n: 12 });
    el('circle', { cx: 410, cy: 352, r: 9, fill: BRASS.deep, opacity: 0.7 }, g);
    for (let i = 0; i < 8; i++) el('rect', { x: 407, y: 326, width: 6, height: 7, fill: BRASS.dark, opacity: 0.6, transform: `rotate(${i * 45} 410 352)` }, g);
    mark(g, 136, 380, 1.1, '#fff0f4', { opacity: 0.55, core: '#f6c2d0' });
    // empat kaki bulat laken
    for (const a of [0.8, 2.35, 3.95, 5.5]) { const x = C + 224 * Math.cos(a), y = C + 224 * Math.sin(a); el('circle', { cx: x + 1.5, cy: y + 2, r: 13, fill: '#0c0604', opacity: 0.5 }, g); el('circle', { cx: x, cy: y, r: 12, fill: radGrad(g, [[0, '#7a5a4a'], [1, '#3a2418']], x - 3, y - 3, 14) }, g); }
  }
  function letter(g, R) {
    el('path', { d: rrect(22, 30, 280, 176, 8), fill: '#2a0a18', opacity: 0.4, filter: 'url(#soft)', transform: 'translate(6 10)' }, g);
    const p = shape(g, rrect(20, 26, 280, 172, 6), [20, 26, 280, 172], PAPER, R, { n: 50, len: [40, 120], width: [8, 18] });
    el('path', { d: rrect(20, 26, 280, 172, 6), fill: kawung(g, '#c9a877', 40, 1.1), opacity: 0.2 }, p.inner);
    // garis lipatan sepertiga
    el('path', { d: 'M20,84H300M20,142H300', stroke: '#b89668', 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, p.inner);
    el('path', { d: 'M20,86H300M20,144H300', stroke: '#ffffff', 'stroke-width': 1.4, 'stroke-opacity': 0.8 }, p.inner);
    el('path', { d: 'M20,26H300V84H20Z', fill: '#8a6a44', opacity: 0.08 }, p.inner);
    // pita tipis + segel lilin kamboja
    shape(g, 'M146,20H174V204H146Z', [146, 20, 28, 184], [PINK.mid, PINK.base, PINK.light], R, { n: 16, dir: [0, 1], len: [20, 60], width: [3, 6], cast: 'cast' });
    const seal = 'M160,86C182,82 198,98 200,116C204,138 188,156 164,158C142,160 122,146 120,124C118,102 136,88 160,86Z';
    shape(g, seal, [118, 82, 86, 78], [PINK.dark, PINK.base, PINK.light], R, { n: 20, len: [10, 30], width: [4, 9], cast: 'cast' });
    el('circle', { cx: 160, cy: 122, r: 26, fill: 'none', stroke: PINK.dark, 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, g);
    mark(g, 160, 123, 1.05, PINK.dark, { core: PINK.hi });
    el('path', { d: 'M140,98C146,92 156,90 164,92', fill: 'none', stroke: '#ffd0de', 'stroke-width': 2.6, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, g);
    // kamboja kering terselip
    F.flora.flowers.kamboja(at(g, 'translate(270 50) rotate(24) scale(1 0.85)'), R, 0.13);
  }

  /* ───────────── mini-game: awan iseng (260×170) & rumah mungil (300×250) ───────────── */
  function cloud(g, R) {
    const d = 'M40,130C14,130 6,104 22,90C14,64 40,46 62,56C70,28 104,16 128,34C146,10 194,14 204,48C230,44 254,66 244,92C262,106 250,134 222,132Z';
    el('path', { d, fill: '#5d7396', opacity: 0.35, filter: 'url(#soft)', transform: 'translate(6 12)' }, g);
    const p = painted(g, d, {
      base: linGrad(g, [[0, '#ffffff'], [0.55, '#eef3fb'], [1, '#b9c8de']], 0, 20, 0, 134), n: 70, R, filter: 'canvas', cast: false,
      stroke: () => { const x = 10 + R() * 240, y = 20 + R() * 112, L = 14 + R() * 30; return { d: `M${x},${y}q${L / 2},${-5 + R() * 10} ${L},${R() * 6}`, color: jitter(y > 100 ? '#c3d0e4' : R() < 0.5 ? '#ffffff' : '#e6edf7', 5, R), width: 8 + R() * 12, opacity: 0.4 + R() * 0.4 }; },
    });
    el('path', { d: 'M30,124C80,136 180,138 236,126', fill: 'none', stroke: '#9fb2cf', 'stroke-width': 10, 'stroke-opacity': 0.4, filter: 'url(#blur2)' }, p.inner);
    el('path', { d: 'M66,60C74,40 98,30 120,40', fill: 'none', stroke: '#ffffff', 'stroke-width': 6, 'stroke-opacity': 0.9, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
  }
  /** rumah mungil di atas gundukan bukit (lukisan dunia malam, dipotong kubah) */
  function cottage(g, R) {
    const c = clipG(g, 'M0,240C0,80 70,4 200,4C330,4 400,80 400,240Z');
    world(at(c, 'translate(-74 -214)'), R, NIGHT);
  }

  /* ───────────── sprite ───────────── */
  const scaled = (name, w, h, seed, draw, k = 0.5, vb) => { F.sprites[name] = { w: w * k, h: h * k, viewBox: vb || `0 0 ${w} ${h}`, seed, draw }; };

  F.sprites['bg-bolakaca'] = { w: W, h: H, seed: 681, scale: 1, draw(svg, R) { room(svg, R); } };
  Object.entries(SKIES).forEach(([n, fn], i) => scaled(`bolakaca-langit-${n}`, 500, 500, 682 + i, (svg, R) => fn(svg, R), n === 'malam' ? 0.5 : 0.4));
  scaled('bolakaca-dunia', 500, 264, 690, (svg, R) => world(svg, R, DAY), 0.55, '0 236 500 264');
  scaled('bolakaca-dunia-malam', 500, 264, 690, (svg, R) => world(svg, R, NIGHT), 0.55, '0 236 500 264');
  scaled('bolakaca-kaca', 520, 520, 691, (svg) => glass(svg), 0.44);
  scaled('bolakaca-debu', 520, 520, 692, (svg, R) => dust(svg, R), 0.36);
  scaled('bolakaca-alas', 480, 240, 693, (svg, R) => base(svg, R), 0.6);
  scaled('bolakaca-pita', 540, 700, 694, (svg, R) => ribbonBands(svg, R), 0.45, '120 330 540 700');
  scaled('bolakaca-pita-simpul', 300, 220, 695, (svg, R) => bow(svg, R), 0.55);
  scaled('bolakaca-kunci', 120, 120, 696, (svg, R) => key(svg, R), 0.6);
  scaled('bolakaca-bulan', 90, 90, 697, (svg, R) => moon(svg, R), 0.6);
  scaled('bolakaca-lampion', 64, 90, 698, (svg, R) => lantern(svg, R), 0.7);
  scaled('bolakaca-bawah', 520, 520, 699, (svg, R) => underside(svg, R), 0.47);
  scaled('bolakaca-surat', 320, 220, 700, (svg, R) => letter(svg, R), 0.6);
  scaled('game-bolakaca-awan', 260, 170, 701, (svg, R) => cloud(svg, R), 0.75);
  scaled('game-bolakaca-rumah', 400, 240, 702, (svg, R) => cottage(svg, R), 0.75);

  F.sprites['cover-bolakaca'] = { w: 480, h: 600, seed: 703, draw(svg, R) {
    // kamar & jendela (dipotong di sekitar bola), bola senja dengan lampion yang naik
    room(at(svg, 'translate(-52 -229) scale(0.75)'), R, { deco: false });
    // senja turun di kamar: biru keunguan, hangat di sekitar bola
    el('rect', { x: 0, y: 0, width: 480, height: 600, fill: linGrad(svg, [[0, '#262a66', 0.62], [0.6, '#2c2f6a', 0.5], [1, '#1b2046', 0.62]], 0, 0, 0, 600) }, svg);
    el('circle', { cx: 240, cy: 290, r: 260, fill: radGrad(svg, [[0, '#ffd59a', 0.45], [0.5, '#ffb88a', 0.14], [1, '#ffb88a', 0]], 240, 290, 260) }, svg);
    const k = 0.62, ox = 240 - GX * k, oy = 300 - GY * k;
    const G = at(svg, `translate(${ox} ${oy}) scale(${k})`);
    el('ellipse', { cx: GX + 20, cy: 1016, rx: 250, ry: 22, fill: '#33435f', opacity: 0.4, filter: 'url(#soft)' }, G);
    const inside = clipG(at(G, `translate(${GX - 248} ${GY - 248}) scale(${496 / 500})`), circ(250, 250, 250));
    SKIES.senja(inside, R);
    el('rect', { x: 0, y: 0, width: 500, height: 500, fill: '#3a2f6e', opacity: 0.35 }, inside);
    world(inside, R, NIGHT);
    el('rect', { x: 0, y: 236, width: 500, height: 264, fill: '#ff9f7a', opacity: 0.16 }, inside);
    // jendela rumah menyala + lampu untai
    el('circle', { cx: 241, cy: 326, r: 46, fill: radGrad(svg, [[0, '#ffd98a', 0.85], [1, '#ffd98a', 0]], 241, 326, 46) }, inside);
    el('path', { d: rrect(223, 315, 36, 24, 1), fill: '#ffe7a6' }, inside);
    el('path', { d: 'M241,315V339M223,327H259', stroke: '#b2b9d4', 'stroke-width': 2.2 }, inside);
    for (let i = 0; i < 12; i++) { const t = i / 11, x = 146 + t * 150, y = 306 + Math.sin(t * Math.PI * 3) * 3; el('circle', { cx: x, cy: y, r: 4, fill: '#ffe9a8', opacity: 0.5, filter: 'url(#blur2)' }, inside); el('circle', { cx: x, cy: y, r: 1.8, fill: '#fffbe8' }, inside); }
    // kelopak & kilau yang berputar
    for (let i = 0; i < 26; i++) {
      const a = R() * Math.PI * 2, r = 40 + R() * 190, x = 250 + Math.cos(a) * r, y = 210 + Math.sin(a) * r * 0.8;
      if (R() < 0.5) el('ellipse', { cx: x, cy: y, rx: 6, ry: 3.4, fill: R() < 0.5 ? '#ffb6cb' : '#fff6ea', transform: `rotate(${R() * 180} ${x} ${y})` }, inside);
      else el('circle', { cx: x, cy: y, r: 1.6 + R() * 1.6, fill: '#fff1b8' }, inside);
    }
    const lant = [[200, 170, 0.6], [300, 110, 0.75], [150, 60, 0.5], [340, 230, 0.5], [250, 40, 0.42]];
    lant.forEach(([x, y, s]) => lantern(at(inside, `translate(${x - 32 * s} ${y - 45 * s}) scale(${s})`), R));
    glass(at(G, `translate(${GX - 260} ${GY - 260})`));
    base(at(G, 'translate(150 790)'), R);
    // lampion yang sudah keluar dari kaca
    [[70, 120, 0.75], [372, 70, 0.9], [300, 18, 0.6], [140, 34, 0.55], [410, 190, 0.6], [214, 70, 0.42]].forEach(([x, y, s]) => lantern(at(svg, `translate(${x} ${y}) scale(${s})`), R));
    for (const [x, y] of [[60, 200], [420, 180], [250, 18]]) el('circle', { cx: x, cy: y, r: 2.6, fill: '#fff3c2', opacity: 0.9 }, svg);
    F.flora.flowers.kambojaPink(at(svg, 'translate(54 560) rotate(14) scale(1 0.7)'), R, 0.2);
    F.flora.flowers.kamboja(at(svg, 'translate(430 566) rotate(-30) scale(1 0.7)'), R, 0.16);
    el('rect', { x: 0, y: 0, width: 480, height: 600, fill: radGrad(svg, [[0, '#000', 0], [0.6, '#000', 0], [1, '#1c2440', 0.4]], 240, 300, 430) }, svg);
  } };
})();
