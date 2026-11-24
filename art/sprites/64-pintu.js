/* Setinggi Ini: sudut pintu rumah — dinding hijau sage dua nada, daun pintu jati berpanel, kusen krem tempat
   garis-garis tinggi badan digores, meteran kain yang dipaku di sebelahnya, papan nama gantung, lubang angin
   berkisi kawung, pot tanaman, keset dan sandal jepit, plus seekor cicak (saksi bisu). Garis pensil, tulisan
   tangan, foto, dan semua kata dipasang dari DOM di atas lukisan ini. Tidak ada sosok manusia. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, mix, jitter, ramp, linGrad, radGrad, leaf } = F;
  const W = 780, H = 1500;
  const SAGE = { hi: '#e8f0dc', light: '#dbe6cd', base: '#cfdcc0', mid: '#bccdab', dark: '#a6b994', deep: '#8aa07a' };
  const CREAM = ['#d6c49c', '#f3e8cd', '#fffaf0'];
  const TEAK = { deep: '#472611', dark: '#6c4020', base: '#9a5f33', light: '#bd834b', hi: '#dfa96e' };
  const TERRA = { deep: '#7c2f16', dark: '#a8452a', base: '#d9643a', light: '#ee8e62', hi: '#ffc6a6' };
  const BRASS = [[0, '#f0c85e'], [0.2, '#fff3c4'], [0.45, '#efc257'], [0.72, '#c18f2a'], [1, '#86601a']];
  const SHADOW = '#3a1d12';
  const GRAPHITE = '#3b3a36';

  /* ukuran dunia (dipakai juga di src/templates/pintu/index.tsx) */
  const FLOOR = 1330, DOOR_TOP = 290, JX0 = 330, JX1 = 414, LINTEL = 200;

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const circ = (cx, cy, r) => `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}Z`;

  /** bidang bebas dilukis dengan sapuan searah `dir`; cols = [gelap, dasar, terang] */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90], base } = {}) => painted(g, d, {
    base: base || cols[1], n, R, filter, cast,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x - (dir[0] / m) * L * 0.5},${y - (dir[1] / m) * L * 0.5}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.35 + R() * 0.45 };
    },
  });

  /** logam kuningan */
  const brass = (g, d, box, R, cast = 'cast') => painted(g, d, {
    base: linGrad(g, BRASS, box[0], box[1], box[0] + box[2], box[1] + box[3]), n: 14, R, filter: 'impastoFine', cast,
    stroke: () => {
      const u = R(), v = R();
      return { d: `M${box[0] + u * box[2]},${box[1] + v * box[3]}l${4 + R() * 10},${6 + R() * 12}`, color: jitter(ramp(BRASS, (u + v) / 2), 4, R), width: 2 + R() * 4, opacity: 0.25 };
    },
  });

  /** kamboja kecil lima kelopak (tanda floa), berpusat di (0,0) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
  function mark(g, x, y, s, fill, opacity = 1) {
    const m = el('g', { transform: `translate(${x} ${y}) scale(${s})`, opacity }, g);
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill, transform: `rotate(${i * 72})` }, m);
    el('circle', { r: 3.4, fill: mix(fill, '#fff4cc', 0.6) }, m);
  }
  const HEART = 'M0,9C-15,-3 -8,-15 0,-7C8,-15 15,-3 0,9Z';

  /** motif kawung sebagai pattern; solid = kelopak terisi (kisi ukir), selain itu garis tipis */
  function kawung(svg, color, size = 46, sw = 1.3, solid = false) {
    const id = F.uid('kw');
    const pt = el('pattern', { id, width: size, height: size, patternUnits: 'userSpaceOnUse' }, (svg.ownerSVGElement || svg).querySelector('defs'));
    const h = size / 2;
    for (const [cx, cy] of [[0, 0], [size, 0], [0, size], [size, size], [h, h]]) {
      for (const an of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: size * (solid ? 0.23 : 0.2), ry: size * (solid ? 0.12 : 0.09), fill: solid ? color : 'none', stroke: solid ? 'none' : color, 'stroke-width': sw, transform: `rotate(${an} ${cx} ${cy}) translate(${size * 0.25} 0)` }, pt);
      el('circle', { cx, cy, r: solid ? size * 0.07 : sw * 1.3, fill: color }, pt);
    }
    return `url(#${id})`;
  }

  /* ───────────── dinding: sage dua nada + cahaya jendela dengan bayangan pelepah ───────────── */
  const DADO = 1140;
  function wall(svg, R) {
    const tone = [[0, SAGE.hi], [0.42, SAGE.base], [1, SAGE.mid]];
    wash(svg, {
      x: -40, y: -30, w: W + 80, h: H + 60, R, n: 640, angle: 84, len: [0.07, 0.17], width: [26, 62], opacity: [0.22, 0.5],
      base: linGrad(svg, tone, 0, 0, W, H),
      color: (u, v, R) => ramp(tone, u * 0.3 + v * 0.7 + (R() - 0.5) * 0.34),
    });
    // bagian bawah dinding dicat lebih tua, dengan kawung nada di atas nada
    const dd = `M360,${DADO}H${W + 30}V${FLOOR}H360Z`;
    wash(svg, { x: 360, y: DADO, w: W - 330, h: FLOOR - DADO, R, n: 170, angle: 3, len: [0.16, 0.42], width: [14, 32], opacity: [0.3, 0.6], base: SAGE.dark, clip: dd, color: (u, v, R) => mix(SAGE.dark, R() < 0.55 ? SAGE.deep : SAGE.mid, R() * 0.5) });
    el('path', { d: dd, fill: kawung(svg, SAGE.hi, 64, 1.5), opacity: 0.2 }, svg);
    el('path', { d: dd, fill: kawung(svg, '#566b48', 64, 1.5), opacity: 0.2, transform: 'translate(1.6 2)' }, svg);
    // lis pembatas
    el('path', { d: `M360,${DADO + 7}H${W + 30}`, stroke: SHADOW, 'stroke-width': 8, 'stroke-opacity': 0.16, filter: 'url(#blur2)' }, svg);
    el('path', { d: `M360,${DADO}H${W + 30}`, stroke: CREAM[1], 'stroke-width': 7 }, svg);
    el('path', { d: `M360,${DADO - 2.4}H${W + 30}`, stroke: CREAM[2], 'stroke-width': 1.8 }, svg);
    // hangat dari kiri-atas
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#fff8d8', 0.34], [0.5, '#fff8d8', 0.1], [1, '#fff8d8', 0]], 150, 120, 1000) }, svg);
    // cahaya jendela: enam petak miring yang jatuh ke dinding
    const lg = el('g', { filter: 'url(#blur2)' }, svg);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      const x = 468 + c * 138, y = 396 + r * 212 + c * 40, w = 124, h = 196;
      el('path', { d: `M${x},${y}L${x + w},${y + 36}V${y + 36 + h}L${x},${y + h}Z`, fill: '#fff8d2', opacity: 0.4 - r * 0.07 }, lg);
    }
    // bayangan pelepah palem yang ikut jatuh di dalam cahaya itu
    const fr = el('g', { filter: 'url(#soft)', opacity: 0.17 }, svg);
    for (const [fx, fy, rot, s] of [[770, 640, -62, 1], [790, 880, -78, 1.15], [760, 470, -48, 0.8]]) {
      const f = el('g', { transform: `translate(${fx} ${fy}) rotate(${rot}) scale(${s})` }, fr);
      el('path', { d: 'M0,0Q14,-150 60,-300', fill: 'none', stroke: '#3f5a3a', 'stroke-width': 7, 'stroke-linecap': 'round' }, f);
      for (let i = 0; i < 9; i++) {
        const t = 0.14 + i * 0.095, x = 2 * (1 - t) * t * 14 + t * t * 60, y = 2 * (1 - t) * t * -150 + t * t * -300, L = 110 * Math.sin(Math.PI * (0.22 + t * 0.7));
        for (const sg of [-1, 1]) el('path', { d: `M0,0C${L * 0.3},${-12} ${L * 0.75},${-10} ${L},0C${L * 0.75},10 ${L * 0.3},10 0,0Z`, fill: '#3f5a3a', transform: `translate(${x} ${y}) rotate(${sg > 0 ? -38 + t * 20 : 218 - t * 20})` }, f);
      }
    }
  }

  /* ───────────── lubang angin di atas pintu: kisi kawung ───────────── */
  function roster(svg, R) {
    const x = 36, y = 70, w = 280, h = 96;
    shape(svg, rrect(x - 13, y - 13, w + 26, h + 26, 5), [x - 13, y - 13, w + 26, h + 26], CREAM, R, { n: 46, dir: [1, 0.02], width: [8, 16], len: [40, 140], cast: 'cast' });
    const id = F.uid('r');
    el('rect', { x, y, width: w, height: h, rx: 2 }, el('clipPath', { id }, svg));
    const g = el('g', { 'clip-path': `url(#${id})` }, svg);
    el('rect', { x, y, width: w, height: h, fill: linGrad(svg, [[0, '#3d2c1c'], [1, '#6b5238']], 0, y, 0, y + h) }, g);
    el('ellipse', { cx: x + w * 0.4, cy: y + h, rx: 150, ry: 60, fill: '#f2b56a', opacity: 0.35, filter: 'url(#soft)' }, g);
    el('rect', { x: x - 48, y: y - 48, width: w + 96, height: h + 96, fill: kawung(svg, '#a8946a', 48, 0, true), transform: 'translate(2.5 3.5)' }, g);
    el('rect', { x: x - 48, y: y - 48, width: w + 96, height: h + 96, fill: kawung(svg, CREAM[1], 48, 0, true) }, g);
    el('rect', { x: x - 48, y: y - 48, width: w + 96, height: h + 96, fill: kawung(svg, CREAM[2], 48, 1.4), opacity: 0.6, transform: 'translate(-1 -1.4)' }, g);
    el('rect', { x: x - 2, y: y - 2, width: w + 4, height: h + 4, fill: 'none', stroke: SHADOW, 'stroke-width': 9, 'stroke-opacity': 0.35, filter: 'url(#blur2)', transform: 'translate(3 4)' }, g);
    el('rect', { x, y, width: w, height: h, rx: 2, fill: 'none', stroke: '#a8946a', 'stroke-width': 1.6 }, svg);
  }

  /* ───────────── daun pintu jati berpanel ───────────── */
  function door(svg, R) {
    const d = `M-30,${DOOR_TOP}H${JX0}V${FLOOR + 2}H-30Z`;
    const p = painted(svg, d, {
      base: linGrad(svg, [[0, TEAK.light], [0.45, TEAK.base], [1, TEAK.dark]], -30, DOOR_TOP, JX0, FLOOR), n: 320, R, filter: 'impasto',
      stroke: () => {
        const x = -30 + R() * 360, y = DOOR_TOP - 60 + R() * 1060, L = 90 + R() * 280;
        return { d: `M${x},${y}q${(R() - 0.5) * 10},${L / 2} ${(R() - 0.5) * 8},${L}`, color: jitter(mix(TEAK.base, R() < 0.45 ? TEAK.dark : TEAK.light, R() * 0.7), 6, R), width: 5 + R() * 13, opacity: 0.3 + R() * 0.4 };
      },
    });
    const ov = p.inner;
    // serat kayu
    for (let i = 0; i < 40; i++) {
      const x = -20 + R() * 345, y = DOOR_TOP + R() * 900, L = 120 + R() * 320;
      el('path', { d: `M${x},${y}c${(R() - 0.5) * 14},${L * 0.3} ${(R() - 0.5) * 14},${L * 0.7} ${(R() - 0.5) * 10},${L}`, fill: 'none', stroke: R() < 0.75 ? TEAK.deep : TEAK.hi, 'stroke-width': 0.8 + R() * 1.5, 'stroke-opacity': 0.14 + R() * 0.16 }, ov);
    }
    // panel cekung: tepi atas & kiri teduh, tepi bawah & kanan kena cahaya
    const panel = (x, y, w, h, b = 24) => {
      const x1 = x + w, y1 = y + h;
      el('path', { d: `M${x},${y}H${x1}V${y1}H${x}Z`, fill: TEAK.deep, opacity: 0.14 }, ov);
      el('path', { d: `M${x},${y}H${x1}L${x1 - b},${y + b}H${x + b}Z`, fill: TEAK.deep, opacity: 0.5 }, ov);
      el('path', { d: `M${x},${y}L${x + b},${y + b}V${y1 - b}L${x},${y1}Z`, fill: TEAK.deep, opacity: 0.36 }, ov);
      el('path', { d: `M${x},${y1}L${x + b},${y1 - b}H${x1 - b}L${x1},${y1}Z`, fill: TEAK.hi, opacity: 0.42 }, ov);
      el('path', { d: `M${x1},${y}L${x1 - b},${y + b}V${y1 - b}L${x1},${y1}Z`, fill: TEAK.hi, opacity: 0.3 }, ov);
      el('path', { d: `M${x},${y}H${x1}V${y1}H${x}Z`, fill: 'none', stroke: TEAK.deep, 'stroke-width': 1.8, 'stroke-opacity': 0.55 }, ov);
      // bidang tengah yang menonjol
      const i = b + 16;
      el('path', { d: rrect(x + i, y + i, w - i * 2, h - i * 2, 3), fill: linGrad(svg, [[0, TEAK.hi, 0.3], [0.5, TEAK.hi, 0.04], [1, TEAK.deep, 0.24]], x, y, x1, y1) }, ov);
      el('path', { d: `M${x + i},${y1 - i}V${y + i}H${x1 - i}`, fill: 'none', stroke: TEAK.hi, 'stroke-width': 2, 'stroke-opacity': 0.55 }, ov);
      el('path', { d: `M${x + i},${y1 - i}H${x1 - i}V${y + i}`, fill: 'none', stroke: TEAK.deep, 'stroke-width': 2.4, 'stroke-opacity': 0.5 }, ov);
    };
    panel(-70, 380, 312, 352);
    panel(-70, 852, 312, 340);
    // teduh di bawah ambang atas dan menjelang lantai, sedikit kilau di tengah
    el('rect', { x: -30, y: DOOR_TOP, width: 362, height: 1044, fill: linGrad(svg, [[0, '#200e04', 0.55], [0.045, '#200e04', 0.12], [0.1, '#200e04', 0], [0.86, '#200e04', 0], [1, '#200e04', 0.34]], 0, DOOR_TOP, 0, FLOOR) }, ov);
    el('ellipse', { cx: 150, cy: 640, rx: 150, ry: 330, fill: '#ffd9a0', opacity: 0.1, filter: 'url(#softer)' }, ov);
    // celah antara daun pintu dan kusen
    el('rect', { x: JX0 - 5, y: DOOR_TOP, width: 6, height: FLOOR - DOOR_TOP, fill: '#1f0e05', opacity: 0.6 }, ov);
    // gagang kuningan di sisi jauh (engselnya di sisi kusen yang digarisi, jadi tepi ini lapang untuk foto)
    const hx = 78, hy = 742;
    brass(svg, rrect(hx - 14, hy, 28, 138, 9), [hx - 14, hy, 28, 138], R, 'cast');
    for (const y of [hy + 12, hy + 126]) el('circle', { cx: hx, cy: y, r: 2.6, fill: '#6b4a12', opacity: 0.7 }, svg);
    brass(svg, rrect(hx - 10, hy + 26, 98, 18, 9), [hx - 10, hy + 22, 98, 26], R, 'castBig');
    el('path', { d: `M${hx + 2},${hy + 30}H${hx + 80}`, stroke: '#fffbe2', 'stroke-width': 2.4, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, svg);
    brass(svg, circ(hx, hy + 35, 14), [hx - 14, hy + 21, 28, 28], R, 'cast');
    el('circle', { cx: hx - 4, cy: hy + 31, r: 4, fill: '#fffbe2', opacity: 0.75 }, svg);
    el('circle', { cx: hx, cy: hy + 92, r: 5, fill: '#2a1708' }, svg);
    el('path', { d: `M${hx},${hy + 92}v13`, stroke: '#2a1708', 'stroke-width': 4.4, 'stroke-linecap': 'round' }, svg);
  }

  /** engsel kuningan di celah pintu–kusen; y = tepi atasnya */
  function hinge(svg, R, y) {
    brass(svg, rrect(JX0 - 19, y, 17, 52, 3), [JX0 - 19, y, 17, 52], R, 'cast');
    for (const dy of [11, 41]) el('circle', { cx: JX0 - 11, cy: y + dy, r: 2.3, fill: '#6b4a12', opacity: 0.75 }, svg);
    brass(svg, rrect(JX0 - 6, y - 5, 9, 62, 4.5), [JX0 - 6, y - 5, 9, 62], R, 'cast');
    for (const dy of [14, 26, 38]) el('path', { d: `M${JX0 - 6},${y + dy}h9`, stroke: '#6b4a12', 'stroke-width': 1.2, 'stroke-opacity': 0.6 }, svg);
  }

  /* ───────────── kusen krem: ambang atas + tiang kanan (tempat garis tinggi badan) ───────────── */
  function casing(svg, R) {
    // bayangan kusen yang jatuh ke dinding di kanannya
    el('rect', { x: JX1 - 4, y: LINTEL + 6, width: 54, height: FLOOR - LINTEL - 6, fill: linGrad(svg, [[0, SHADOW, 0.34], [0.5, SHADOW, 0.1], [1, SHADOW, 0]], JX1, 0, JX1 + 48, 0), filter: 'url(#blur2)' }, svg);
    el('rect', { x: -30, y: LINTEL - 6, width: JX1 + 60, height: 16, fill: SHADOW, opacity: 0.12, filter: 'url(#soft)' }, svg);
    // tiang
    const jd = `M${JX0},${DOOR_TOP - 4}H${JX1}V${FLOOR + 2}H${JX0}Z`;
    const j = shape(svg, jd, [JX0, DOOR_TOP, JX1 - JX0, FLOOR - DOOR_TOP], CREAM, R, { n: 190, dir: [0.012, 1], width: [6, 15], len: [80, 280] });
    const jo = j.inner;
    el('rect', { x: JX0, y: DOOR_TOP, width: JX1 - JX0, height: FLOOR - DOOR_TOP, fill: linGrad(svg, [[0, '#fff', 0.34], [0.3, '#fff', 0.05], [0.7, '#8a6c3c', 0.02], [1, '#8a6c3c', 0.24]], JX0, 0, JX1, 0) }, jo);
    // alur profil kusen
    for (const [x, dark] of [[JX0 + 15, 1], [JX1 - 15, 1]]) {
      el('path', { d: `M${x},${DOOR_TOP}V${FLOOR}`, stroke: '#9c8658', 'stroke-width': 2.4, 'stroke-opacity': 0.55 * dark }, jo);
      el('path', { d: `M${x + 2.6},${DOOR_TOP}V${FLOOR}`, stroke: '#fffdf4', 'stroke-width': 1.8, 'stroke-opacity': 0.85 }, jo);
    }
    el('path', { d: `M${JX0 + 1.5},${DOOR_TOP}V${FLOOR}`, stroke: '#fffdf4', 'stroke-width': 2.4, 'stroke-opacity': 0.8 }, jo);
    el('path', { d: `M${JX1 - 1.2},${DOOR_TOP}V${FLOOR}`, stroke: '#8f7a4e', 'stroke-width': 2.4, 'stroke-opacity': 0.6 }, jo);
    // bekas pakai: noda tangan, lecet kecil, cat mengelupas di dekat lantai
    for (let i = 0; i < 9; i++) el('ellipse', { cx: JX0 + 10 + R() * 64, cy: 520 + R() * 780, rx: 6 + R() * 16, ry: 10 + R() * 26, fill: '#8a7448', opacity: 0.05 + R() * 0.06, filter: 'url(#blur2)' }, jo);
    for (let i = 0; i < 12; i++) { const x = JX0 + 6 + R() * 70, y = 1130 + R() * 190; el('path', { d: `M${x},${y}l${(R() - 0.5) * 10},${4 + R() * 12}`, stroke: '#a8905c', 'stroke-width': 1 + R() * 1.6, 'stroke-opacity': 0.35, 'stroke-linecap': 'round' }, jo); }
    el('rect', { x: JX0, y: DOOR_TOP, width: JX1 - JX0, height: 60, fill: linGrad(svg, [[0, SHADOW, 0.3], [1, SHADOW, 0]], 0, DOOR_TOP, 0, DOOR_TOP + 60) }, jo);
    el('rect', { x: JX0, y: FLOOR - 70, width: JX1 - JX0, height: 72, fill: linGrad(svg, [[0, SHADOW, 0], [1, SHADOW, 0.2]], 0, FLOOR - 70, 0, FLOOR) }, jo);
    // ambang atas, sedikit lebih lebar dari tiang, dengan lis di puncaknya
    const ld = `M-30,${LINTEL}H${JX1 + 20}V${DOOR_TOP}H-30Z`;
    const l = shape(svg, ld, [-30, LINTEL, JX1 + 50, DOOR_TOP - LINTEL], CREAM, R, { n: 90, dir: [1, 0.012], width: [7, 16], len: [70, 240], cast: 'castBig' });
    el('rect', { x: -30, y: LINTEL, width: JX1 + 50, height: DOOR_TOP - LINTEL, fill: linGrad(svg, [[0, '#fff', 0.36], [0.35, '#fff', 0.04], [1, '#8a6c3c', 0.22]], 0, LINTEL, 0, DOOR_TOP) }, l.inner);
    for (const y of [LINTEL + 17, DOOR_TOP - 16]) {
      el('path', { d: `M-30,${y}H${JX1 + 20}`, stroke: '#9c8658', 'stroke-width': 2.4, 'stroke-opacity': 0.5 }, l.inner);
      el('path', { d: `M-30,${y + 2.6}H${JX1 + 20}`, stroke: '#fffdf4', 'stroke-width': 1.8, 'stroke-opacity': 0.85 }, l.inner);
    }
    shape(svg, `M-30,${LINTEL - 14}H${JX1 + 30}V${LINTEL + 3}H-30Z`, [-30, LINTEL - 14, JX1 + 60, 17], [CREAM[1], CREAM[2], '#ffffff'], R, { n: 24, dir: [1, 0], width: [5, 10], len: [60, 160], cast: 'cast' });
  }

  /* ───────────── meteran kain kuning yang dipaku di sebelah kusen ───────────── */
  function tape(svg, R, { x = 424, y0 = 326, y1 = 1262 } = {}) {
    const w = 22;
    const wob = (y) => Math.sin(y / 130) * 1.6;
    let dl = '', dr = '';
    for (let y = y0; y <= y1; y += 26) { dl += `${dl ? 'L' : 'M'}${(x + wob(y)).toFixed(1)},${y}`; dr = `L${(x + w + wob(y)).toFixed(1)},${y}` + dr; }
    const d = `${dl}L${x + wob(y1)},${y1}L${x + w + wob(y1)},${y1}${dr}Z`;
    const YEL = ['#d9a51c', '#f6cd3e', '#ffe98e'];
    const p = shape(svg, d, [x - 2, y0, w + 4, y1 - y0], YEL, R, { n: 120, dir: [0.01, 1], width: [4, 9], len: [30, 110], cast: 'cast' });
    el('path', { d, fill: linGrad(svg, [[0, '#fff', 0.3], [0.5, '#fff', 0], [1, '#7a5206', 0.22]], x, 0, x + w, 0) }, p.inner);
    for (let k = 0, y = y1 - 10; y > y0 + 14; y -= 9.4, k++) {
      const L = k % 10 === 0 ? 15 : k % 5 === 0 ? 11 : 6, xx = x + wob(y);
      el('path', { d: `M${xx},${y}h${L}`, stroke: '#4a360a', 'stroke-width': k % 10 === 0 ? 1.7 : 1.1, 'stroke-opacity': 0.8 }, p.inner);
      // pengganti angka: titik merah kecil tiap sepuluh strip
      if (k % 10 === 0) el('circle', { cx: xx + 18, cy: y - 3.2, r: 1.5, fill: TERRA.dark, opacity: 0.85 }, p.inner);
    }
    // ujung logam di bawah, paku payung merah di atas
    brass(svg, rrect(x - 1 + wob(y1), y1 - 3, w + 2, 15, 2), [x - 1, y1 - 3, w + 2, 15], R, 'cast');
    const pin = el('g', { filter: 'url(#cast)' }, svg);
    el('circle', { cx: x + w / 2, cy: y0 + 7, r: 8.5, fill: radGrad(svg, [[0, TERRA.hi], [0.5, TERRA.base], [1, TERRA.deep]], x + w / 2 - 3, y0 + 4, 11) }, pin);
    el('circle', { cx: x + w / 2 - 2.6, cy: y0 + 4.4, r: 2.2, fill: '#fff', opacity: 0.7 }, svg);
  }

  /* ───────────── lis lantai + lantai tegel terakota ───────────── */
  function floor(svg, R) {
    shape(svg, `M${JX1},${FLOOR - 42}H${W + 30}V${FLOOR + 2}H${JX1}Z`, [JX1, FLOOR - 42, W - JX1 + 30, 44], CREAM, R, { n: 60, dir: [1, 0.01], width: [6, 14], len: [50, 180], filter: 'impastoH', cast: 'cast' });
    el('path', { d: `M${JX1},${FLOOR - 38}H${W + 30}`, stroke: '#fffdf4', 'stroke-width': 2.2, 'stroke-opacity': 0.85 }, svg);
    el('path', { d: `M${JX1},${FLOOR - 30}H${W + 30}`, stroke: '#9c8658', 'stroke-width': 1.8, 'stroke-opacity': 0.5 }, svg);
    const tone = (v) => mix('#d27045', '#a2452a', v);
    wash(svg, { x: -40, y: FLOOR, w: W + 80, h: H - FLOOR + 30, R, n: 240, angle: 0, len: [0.08, 0.26], width: [8, 22], opacity: [0.3, 0.6], base: linGrad(svg, [[0, '#cc673f'], [1, '#a44528']], 0, FLOOR, 0, H), color: (u, v, R) => mix(tone(v), '#e89a6c', R() * 0.32) });
    // nat tegel: sedikit perspektif
    const gr = el('g', { stroke: '#f1dcc0', 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, svg);
    for (const [y, sw] of [[FLOOR + 50, 2.4], [FLOOR + 122, 3.2]]) el('path', { d: `M-20,${y}H${W + 20}`, 'stroke-width': sw }, gr);
    for (let k = -5; k <= 5; k++) { const xt = 372 + k * 132; el('path', { d: `M${xt},${FLOOR + 2}L${372 + (xt - 372) * 1.42},${H + 10}`, 'stroke-width': 2.6 }, gr); }
    // bayangan di kaki dinding & pintu
    el('rect', { x: -30, y: FLOOR, width: W + 60, height: 40, fill: linGrad(svg, [[0, '#3a1408', 0.5], [1, '#3a1408', 0]], 0, FLOOR, 0, FLOOR + 40) }, svg);
    el('path', { d: `M-30,${FLOOR + 1}H${W + 30}`, stroke: '#2a0f06', 'stroke-width': 3, 'stroke-opacity': 0.5 }, svg);
  }

  /* ───────────── keset sabut + sandal jepit ───────────── */
  function mat(svg, R) {
    const d = 'M44,1350H296L318,1420H20Z';
    el('path', { d: 'M30,1356H306L330,1430H10Z', fill: '#2a0f06', opacity: 0.3, filter: 'url(#soft)' }, svg);
    const p = shape(svg, d, [20, 1350, 300, 70], ['#8f6430', '#b98b4c', '#d9b072'], R, { n: 130, dir: [0.1, 1], width: [3, 7], len: [10, 30], filter: 'impasto' });
    el('path', { d: 'M62,1362H280L296,1408H44Z', fill: kawung(svg, '#6b4420', 30, 1.6), opacity: 0.6 }, p.inner);
    el('path', { d: 'M56,1358H284L302,1412H38Z', fill: 'none', stroke: '#6b4420', 'stroke-width': 3, 'stroke-opacity': 0.6 }, p.inner);
    const sandal = (x, y, rot) => {
      const g = el('g', { transform: `translate(${x} ${y}) rotate(${rot})`, filter: 'url(#cast)' }, svg);
      el('path', { d: 'M-30,0C-30,-10 -18,-13 0,-12C20,-11 32,-9 32,0C32,9 20,11 0,12C-18,13 -30,10 -30,0Z', fill: linGrad(svg, [[0, '#3f9a84'], [1, '#226352']], -30, -12, 30, 12) }, g);
      el('path', { d: 'M-28,0C-28,-8 -17,-10.5 0,-10C18,-9 29,-7 29,0', fill: 'none', stroke: '#8fd6c2', 'stroke-width': 1.6, 'stroke-opacity': 0.7 }, g);
      el('path', { d: 'M18,-1L-2,-10M18,-1L-2,10', fill: 'none', stroke: CREAM[2], 'stroke-width': 4.6, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: 18, cy: -1, r: 2.6, fill: CREAM[0] }, g);
    };
    sandal(128, 1376, -8);
    sandal(196, 1388, 5);
  }

  /* ───────────── pot terakota dengan daun-daun tegak ───────────── */
  function plant(svg, R, { x = 712, y = 1244 } = {}) {
    el('ellipse', { cx: x + 10, cy: y + 100, rx: 76, ry: 13, fill: '#2a0f06', opacity: 0.35, filter: 'url(#soft)' }, svg);
    const G = F.flora.GREEN;
    // daun yang condong ke kiri dibuat pendek: tulisan kenangan garis terbawah ada di sebelah kirinya
    [[-26, 104, 44, 2], [38, 150, 52, 3], [-13, 172, 58, 0], [22, 228, 62, 1], [-4, 246, 64, 2], [9, 290, 62, 0], [48, 96, 40, 1]].forEach(([a, len, w, gi], i) => {
      leaf(svg, { len, w, ...G[gi], R, n: 46, curve: a > 0 ? 0.22 : -0.2, side: a > 0 ? 1 : -1, transform: `translate(${x + a * 0.5} ${y + 6}) rotate(${a})`, cast: i > 1 });
    });
    const body = `M${x - 46},${y}H${x + 46}L${x + 34},${y + 98}Q${x},${y + 106} ${x - 34},${y + 98}Z`;
    const p = shape(svg, body, [x - 46, y, 92, 104], [TERRA.dark, TERRA.base, TERRA.light], R, { n: 50, dir: [1, 0.08], width: [7, 15], len: [20, 60], cast: 'castBig' });
    el('path', { d: body, fill: linGrad(svg, [[0, '#fff', 0.26], [0.35, '#fff', 0], [1, '#4a1508', 0.42]], x - 46, 0, x + 46, 0) }, p.inner);
    const rim = rrect(x - 54, y - 18, 108, 24, 7);
    const r = shape(svg, rim, [x - 54, y - 18, 108, 24], [TERRA.dark, TERRA.base, TERRA.light], R, { n: 22, dir: [1, 0.02], width: [6, 11], len: [20, 60], cast: 'cast' });
    el('path', { d: rim, fill: linGrad(svg, [[0, '#fff', 0.32], [0.4, '#fff', 0], [1, '#4a1508', 0.4]], x - 54, 0, x + 54, 0) }, r.inner);
  }

  /* ───────────── papan nama gantung (tulisannya dari DOM) ───────────── */
  const PQ = { x: 492, y: 152, w: 224, h: 164 };
  function plaque(svg, R, { heart = false } = {}) {
    const { x, y, w, h } = PQ;
    const st = el('g', { filter: 'url(#cast)' }, svg);
    el('path', { d: `M${x + 36},${y + 12}L${x + w / 2},${y - 58}L${x + w - 36},${y + 12}`, fill: 'none', stroke: '#8a6a3c', 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, st);
    el('path', { d: `M${x + 36},${y + 12}L${x + w / 2},${y - 58}L${x + w - 36},${y + 12}`, fill: 'none', stroke: '#d9bd86', 'stroke-width': 1.1, 'stroke-dasharray': '3 4' }, st);
    el('circle', { cx: x + w / 2, cy: y - 59, r: 5.5, fill: radGrad(svg, [[0, '#fff3c4'], [0.6, '#c9962e'], [1, '#6b4a12']], x + w / 2 - 2, y - 61, 7) }, st);
    const d = rrect(x, y, w, h, 16);
    const p = shape(svg, d, [x, y, w, h], ['#e2d2ad', '#fbf3df', '#fffdf6'], R, { n: 70, dir: [1, 0.03], width: [9, 20], len: [40, 130], cast: 'castBig' });
    el('path', { d, fill: kawung(svg, '#b9975c', 44, 1), opacity: 0.1 }, p.inner);
    el('path', { d, fill: linGrad(svg, [[0, '#fff', 0.3], [0.5, '#fff', 0], [1, '#7a4a1c', 0.16]], x, y, x + w, y + h) }, p.inner);
    el('path', { d: rrect(x + 9, y + 9, w - 18, h - 18, 10), fill: 'none', stroke: TERRA.base, 'stroke-width': 2.4, 'stroke-opacity': 0.8 }, svg);
    el('path', { d: rrect(x + 14, y + 14, w - 28, h - 28, 7), fill: 'none', stroke: '#b98a4a', 'stroke-width': 1, 'stroke-opacity': 0.7 }, svg);
    for (const cx of [x + 36, x + w - 36]) el('circle', { cx, cy: y + 12, r: 4, fill: '#6b4a12', opacity: 0.6 }, svg);
    // kamboja kecil di sudut kanan-bawah
    const G = F.flora.GREEN;
    leaf(svg, { len: 58, w: 25, ...G[1], R, n: 14, transform: `translate(${x + w - 26} ${y + h - 16}) rotate(-76)`, curve: 0.2 });
    leaf(svg, { len: 50, w: 23, ...G[3], R, n: 14, transform: `translate(${x + w - 22} ${y + h - 22}) rotate(-8)`, curve: -0.2 });
    F.flora.flowers.kamboja(el('g', { transform: `translate(${x + w - 20} ${y + h - 14}) rotate(18)` }, svg), R, 0.15);
    if (heart) el('path', { d: HEART, fill: TERRA.base, transform: `translate(${x + w / 2 - 8} ${y + h / 2 + 2}) scale(2.6)` }, svg);
  }

  /* ───────────── cicak di dinding; (0,0) = tengah badan, kepala ke atas ───────────── */
  function cicak(g) {
    const c = '#cbb68c', d = '#9c875e';
    const body = el('g', {}, g);
    const draw = (p, shadow) => {
      const a = shadow ? { stroke: SHADOW, fill: SHADOW } : { stroke: c, fill: c };
      for (const [x, y, dx, dy] of [[-6, -11, -15, -9], [6, -11, 15, -12], [-6, 9, -16, 8], [6, 9, 15, 12]]) {
        el('path', { d: `M${x},${y}q${dx * 0.5},${dy * 0.1} ${dx},${dy}`, fill: 'none', stroke: a.stroke, 'stroke-width': 4, 'stroke-linecap': 'round' }, p);
        for (const t of [-0.6, 0, 0.6]) el('path', { d: `M${x + dx},${y + dy}l${Math.sign(dx) * 4.5 * Math.cos(t)},${Math.sign(dy) * 2 + 4.5 * Math.sin(t)}`, stroke: a.stroke, 'stroke-width': 1.7, 'stroke-linecap': 'round' }, p);
      }
      el('path', { d: 'M-5,14C-4,34 10,40 6,58C4,64 -2,66 -4,62C2,58 0,46 -7,36C-11,28 -9,20 -5,14Z', fill: a.fill }, p);
      el('ellipse', { rx: 8.4, ry: 19, fill: a.fill }, p);
      el('path', { d: 'M-7,-16C-9,-26 -6,-37 0,-38C6,-37 9,-26 7,-16Z', fill: a.fill }, p);
    };
    draw(el('g', { transform: 'translate(3 5)', opacity: 0.28, filter: 'url(#blur2)' }, body), true);
    draw(body, false);
    el('ellipse', { cx: -2.4, cy: -2, rx: 3, ry: 13, fill: '#efe0bb', opacity: 0.6 }, body);
    for (const [x, y] of [[2, -8], [-1, 4], [3, 10], [1, 26], [4, 40]]) el('circle', { cx: x, cy: y, r: 1.5, fill: d, opacity: 0.7 }, body);
    for (const x of [-4.4, 4.4]) { el('circle', { cx: x, cy: -29, r: 2.3, fill: '#1e150c' }, body); el('circle', { cx: x - 0.6, cy: -29.8, r: 0.7, fill: '#fff' }, body); }
  }

  /** seluruh sudut rumah */
  function world(svg, R, { sign = true, heart = false, gecko = 'translate(708 384) rotate(-24) scale(1.05)' } = {}) {
    wall(svg, R);
    roster(svg, R);
    door(svg, R);
    casing(svg, R);
    for (const y of [316, 1082]) hinge(svg, R, y);
    tape(svg, R);
    floor(svg, R);
    mat(svg, R);
    plant(svg, R);
    if (sign) plaque(svg, R, { heart });
    cicak(el('g', { transform: gecko }, svg));
    // paku kecil tempat pensil digantung
    el('circle', { cx: 543, cy: 375, r: 6, fill: SHADOW, opacity: 0.25, filter: 'url(#blur2)' }, svg);
    el('circle', { cx: 540, cy: 372, r: 4.4, fill: radGrad(svg, [[0, '#fff3c4'], [0.6, '#c9962e'], [1, '#6b4a12']], 538.6, 370.4, 6) }, svg);
    // sudut-sudut sedikit meredup
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#2c2415', 0], [0.6, '#2c2415', 0], [1, '#2c2415', 0.26]], W * 0.46, H * 0.46, H * 0.74) }, svg);
  }

  /* ───────────── pensil; (0,0) = ujung grafit, badannya tegak ke atas ───────────── */
  function pencil(g, R) {
    const p = el('g', { filter: 'url(#cast)' }, g);
    const w = 17;
    const body = `M${-w},-64H${w}V-262H${-w}Z`;
    const b = shape(p, body, [-w, -262, w * 2, 198], [TERRA.dark, TERRA.base, TERRA.light], R, { n: 44, dir: [0, 1], width: [4, 9], len: [30, 100] });
    el('rect', { x: -w, y: -262, width: 11, height: 198, fill: '#fff', opacity: 0.26 }, b.inner);
    el('rect', { x: 6, y: -262, width: 11, height: 198, fill: '#4a1508', opacity: 0.26 }, b.inner);
    el('path', { d: 'M-6,-262V-64M6,-262V-64', stroke: '#4a1508', 'stroke-width': 1, 'stroke-opacity': 0.3 }, b.inner);
    el('rect', { x: -w, y: -246, width: w * 2, height: 13, fill: CREAM[2], opacity: 0.92 }, b.inner);
    mark(b.inner, 0, -206, 0.62, '#ffe7a8', 0.95);
    // serutan: kayu muda dengan tepi bergelombang, lalu grafit
    el('path', { d: `M${-w},-64Q-11.5,-56 -6,-64Q0,-56 6,-64Q11.5,-56 ${w},-64L4.8,-15H-4.8Z`, fill: linGrad(g, [[0, '#f7ddb0'], [0.5, '#e8c28e'], [1, '#b98a52']], -w, 0, w, 0) }, p);
    el('path', { d: 'M-4.8,-15H4.8L0.6,0.5Q0,1.4 -0.6,0.5Z', fill: linGrad(g, [[0, '#6a6862'], [1, '#262522']], -5, 0, 5, 0) }, p);
    // cincin kuningan + penghapus
    brass(p, `M${-w - 1},-262H${w + 1}V-292H${-w - 1}Z`, [-w - 1, -292, w * 2 + 2, 30], R, false);
    for (const y of [-286, -279, -272]) el('path', { d: `M${-w - 1},${y}H${w + 1}`, stroke: '#6b4a12', 'stroke-width': 1.3, 'stroke-opacity': 0.55 }, p);
    el('path', { d: `M${-w + 1},-292V-312Q${-w + 1},-324 0,-324Q${w - 1},-324 ${w - 1},-312V-292Z`, fill: linGrad(g, [[0, '#ffc0c8'], [0.5, '#f29aa5'], [1, '#c96a78']], -w, 0, w, 0) }, p);
    el('path', { d: `M${-w + 6},-296V-312Q${-w + 6},-318 -5,-319`, fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, p);
  }

  /* ───────────── surat terlipat; (0,0) = tengah ───────────── */
  function letter(g, R) {
    const w = 290, h = 168;
    const d = rrect(-w / 2, -h / 2, w, h, 5);
    const p = shape(g, d, [-w / 2, -h / 2, w, h], ['#e0cfa8', '#fbf2dc', '#fffdf6'], R, { n: 70, dir: [1, 0.04], width: [10, 22], len: [40, 130], cast: 'castBig' });
    el('path', { d, fill: kawung(g, '#b9975c', 46, 1), opacity: 0.12 }, p.inner);
    // lipatan atas menutup ke bawah, dengan bayangan di bawah tepinya
    el('rect', { x: -w / 2, y: 8, width: w, height: 26, fill: linGrad(g, [[0, '#7a5a2c', 0.3], [1, '#7a5a2c', 0]], 0, 8, 0, 34) }, p.inner);
    el('path', { d: `M${-w / 2},8H${w / 2}`, stroke: '#b59a66', 'stroke-width': 1.6 }, p.inner);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h / 2 + 8, fill: linGrad(g, [[0, '#fff', 0.5], [1, '#fff', 0.05]], 0, -h / 2, 0, 8) }, p.inner);
    el('path', { d, fill: linGrad(g, [[0, '#fff', 0.2], [0.5, '#fff', 0], [1, '#7a4a1c', 0.2]], -w / 2, -h / 2, w / 2, h / 2) }, p.inner);
    // baris-baris samar pengganti tulisan + stiker hati (di sisi kanan: sisi itulah yang menyembul dari balik kusen)
    for (const [y, a, b] of [[-48, -20, 110], [-28, 20, 110]]) el('path', { d: `M${a},${y}H${b}`, stroke: '#8a6a44', 'stroke-width': 4, 'stroke-opacity': 0.28, 'stroke-linecap': 'round' }, p.inner);
    const s = el('g', { filter: 'url(#cast)' }, g);
    el('circle', { cx: 62, cy: 8, r: 21, fill: radGrad(g, [[0, TERRA.light], [0.6, TERRA.base], [1, TERRA.dark]], 56, 2, 26) }, s);
    el('path', { d: HEART, fill: '#fff3da', transform: 'translate(62 9.5) scale(1.05)' }, s);
  }

  /* ───────────── mini-game: bola bekel + biji bekel kuningan ───────────── */
  function ball(g, R) {
    const r = 76;
    const p = painted(g, circ(0, 0, r), {
      base: radGrad(g, [[0, '#ffe0cc'], [0.3, TERRA.hi], [0.62, TERRA.light], [0.86, TERRA.base], [1, TERRA.dark]], -24, -28, r * 1.5), n: 40, R, filter: null, cast: 'cast',
      stroke: () => {
        const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * r * 0.9, x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        return { d: `M${x},${y}q${10 + R() * 14},${-4 + R() * 8} ${20 + R() * 20},${(R() - 0.5) * 12}`, color: jitter(mix(TERRA.light, x + y > 20 ? TERRA.dark : TERRA.hi, R() * 0.6), 5, R), width: 7 + R() * 10, opacity: 0.3 };
      },
    });
    // pusaran krem khas bola karet
    for (const [dy, o] of [[-34, 0.5], [4, 0.6], [40, 0.42]]) el('path', { d: `M-90,${dy + 20}C-40,${dy - 26} 30,${dy + 30} 92,${dy - 16}`, fill: 'none', stroke: '#fff3da', 'stroke-width': 13, 'stroke-opacity': o, 'stroke-linecap': 'round' }, p.inner);
    for (const [dy, o] of [[-14, 0.5], [24, 0.4]]) el('path', { d: `M-90,${dy + 18}C-40,${dy - 24} 30,${dy + 28} 92,${dy - 14}`, fill: 'none', stroke: '#f6c9406a', 'stroke-width': 5, 'stroke-opacity': o }, p.inner);
    el('circle', { r, fill: radGrad(g, [[0, '#fff', 0], [0.7, '#fff', 0], [1, '#5a1c0a', 0.5]], -18, -20, r * 1.12) }, p.inner);
    el('ellipse', { cx: -28, cy: -36, rx: 22, ry: 13, fill: '#fff', opacity: 0.6, transform: 'rotate(-34 -28 -36)', filter: 'url(#blur2)' }, p.inner);
    el('circle', { cx: -40, cy: -22, r: 4.5, fill: '#fff', opacity: 0.7 }, p.inner);
  }
  function jack(g, R, s = 1) {
    const j = el('g', { transform: `scale(${s})`, filter: 'url(#cast)' }, g);
    const arm = (a, L) => {
      const x = Math.cos(a) * L, y = Math.sin(a) * L;
      el('path', { d: `M0,0L${x},${y}`, stroke: '#a87a22', 'stroke-width': 9, 'stroke-linecap': 'round' }, j);
      el('path', { d: `M${-1.5},-1.5L${x - 1.5},${y - 1.5}`, stroke: '#f7dc8a', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, j);
      el('circle', { cx: x, cy: y, r: 8.6, fill: radGrad(g, [[0, '#fff3c4'], [0.5, '#e5b548'], [1, '#86601a']], x - 3, y - 3, 11) }, j);
    };
    for (const a of [0.5, 2.1, 3.64, 5.24]) arm(a, 25);
    el('circle', { r: 9.4, fill: radGrad(g, [[0, '#fff3c4'], [0.5, '#e5b548'], [1, '#86601a']], -3, -3, 12) }, j);
  }

  /* ───────────── sprite ───────────── */
  const scaled = (name, w, h, seed, draw, k = 0.5) => { F.sprites[name] = { w: w * k, h: h * k, viewBox: `0 0 ${w} ${h}`, seed, draw }; };

  F.sprites['bg-pintu'] = { w: W, h: H, seed: 641, draw(svg, R) { world(svg, R); } };
  scaled('pintu-pensil', 80, 344, 642, (svg, R) => pencil(el('g', { transform: 'translate(38 332)' }, svg), R), 0.6);
  scaled('pintu-surat', 340, 220, 643, (svg, R) => letter(el('g', { transform: 'translate(166 102)' }, svg), R), 0.7);
  scaled('game-pintu-bola', 190, 190, 644, (svg, R) => ball(el('g', { transform: 'translate(92 90)' }, svg), R), 0.8);
  scaled('game-pintu-biji', 300, 120, 645, (svg, R) => {
    el('ellipse', { cx: 150, cy: 96, rx: 130, ry: 14, fill: '#2a0f06', opacity: 0.28, filter: 'url(#soft)' }, svg);
    [[52, 70, 1, 10], [112, 82, 0.9, 50], [168, 66, 1.05, -20], [226, 84, 0.92, 30], [262, 62, 0.8, 70]].forEach(([x, y, s, r]) => jack(el('g', { transform: `translate(${x} ${y}) rotate(${r})` }, svg), R, s));
  }, 0.7);

  F.sprites['cover-pintu'] = { w: 480, h: 600, seed: 646, draw(svg, R) {
    const g = el('g', { transform: 'translate(-92 -292) scale(0.8)' }, svg);
    // cicaknya ikut menonton pensil dari dinding (di posisi aslinya ia terpotong tepi kartu)
    world(g, R, { sign: false, gecko: 'translate(634 566) rotate(-58) scale(1.1)' });
    // garis-garis tinggi badan + coretan pengganti tulisan + foto/gambar kapur di daun pintu
    const ys = [1010, 906, 802, 698, 594, 488];
    ys.forEach((y, i) => {
      const last = i === ys.length - 1;
      el('path', { d: `M${JX0 + 5},${y + 1}C${JX0 + 26},${y - 3} ${JX0 + 52},${y + 3} ${JX1 - 4},${y - 1}`, fill: 'none', stroke: last ? TERRA.dark : GRAPHITE, 'stroke-width': last ? 4 : 2.6, 'stroke-linecap': 'round', 'stroke-opacity': 0.9 }, g);
      for (let l = 0; l < (i % 2 ? 2 : 3); l++) {
        let d = `M462,${y - 14 + l * 17}`;
        const n = 9 + Math.floor(R() * 7) - l * 2;
        for (let k = 0; k < n; k++) d += `q${4 + R() * 3},${-7 - R() * 4} ${8 + R() * 4},0`;
        el('path', { d, fill: 'none', stroke: last ? TERRA.dark : GRAPHITE, 'stroke-width': 1.7, 'stroke-opacity': 0.62, 'stroke-linecap': 'round' }, g);
      }
    });
    // dua foto ditempel selotip di daun pintu (isinya sapuan warna saja)
    const snap = (x, y, rot, cols) => {
      const s = el('g', { transform: `translate(${x} ${y}) rotate(${rot})`, filter: 'url(#cast)' }, g);
      el('rect', { x: -44, y: -48, width: 88, height: 100, rx: 2, fill: '#fffaf0' }, s);
      el('rect', { x: -38, y: -42, width: 76, height: 76, fill: linGrad(svg, [[0, cols[0]], [1, cols[1]]], 0, -42, 0, 34) }, s);
      el('circle', { cx: 14, cy: -16, r: 12, fill: cols[2], opacity: 0.9 }, s);
      el('path', { d: 'M-38,34V10Q-16,-8 0,12Q18,-2 38,16V34Z', fill: cols[3], opacity: 0.9 }, s);
      el('rect', { x: -19, y: -58, width: 38, height: 17, fill: TERRA.light, opacity: 0.72, transform: 'rotate(-5)' }, s);
    };
    snap(272, 906, -5, ['#bfe0ee', '#fbe2b8', '#fff3c4', '#6fa87c']);
    snap(268, 594, 4, ['#f6c9a2', '#ffe9c4', '#ffd36e', '#c9623c']);
    // gambar kapur: matahari dan bunga
    const chalk = { fill: 'none', stroke: '#fff3d6', 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-opacity': 0.85 };
    const sun = el('g', { transform: 'translate(270 1020)' }, g);
    el('circle', { r: 15, ...chalk }, sun);
    for (let i = 0; i < 8; i++) el('path', { d: 'M0,-22V-32', ...chalk, transform: `rotate(${i * 45})` }, sun);
    const fl = el('g', { transform: 'translate(272 470)' }, g);
    for (let i = 0; i < 5; i++) el('path', { d: 'M0,0C9,-8 10,-21 0,-26C-10,-21 -9,-8 0,0Z', ...chalk, stroke: '#ffd98a', transform: `rotate(${i * 72})` }, fl);
    // hati kecil di ujung garis "sekarang"
    el('path', { d: HEART, fill: TERRA.base, transform: `translate(${JX1 + 62} 462) scale(1.5) rotate(-8)` }, g);
    // pensil sedang menggores garis teratas
    pencil(el('g', { transform: `translate(${JX1 - 6} 487) rotate(38) scale(0.62)` }, g), R);
    // kamboja terselip di sudut bawah
    const G = F.flora.GREEN;
    leaf(svg, { len: 130, w: 54, ...G[0], R, transform: 'translate(64 566) rotate(-58)', curve: 0.2 });
    leaf(svg, { len: 116, w: 50, ...G[3], R, transform: 'translate(70 560) rotate(16)', curve: -0.2 });
    F.flora.flowers.kamboja(el('g', { transform: 'translate(70 548) rotate(12)' }, svg), R, 0.34);
  } };
})();
