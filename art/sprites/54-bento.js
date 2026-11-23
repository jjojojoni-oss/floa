/* Your Bento: serbet kotak-kotak, kotak bekal kayu + tutup + pita, lauk-lauk kecil yang menggemaskan,
   alas (selada, cup kertas), sumpit, dan kartu katalog. Skala: 20px = 1em di template. Lauk memakai kanvas 170×170. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, leaf, petal, linGrad } = F;
  const WARM = '#3a1d12';
  const rr = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const circle = (cx, cy, r) => `M${cx - r},${cy}a${r},${r} 0 1 0 ${r * 2},0a${r},${r} 0 1 0 ${-r * 2},0Z`;
  const oval = (cx, cy, rx, ry) => `M${cx - rx},${cy}a${rx},${ry} 0 1 0 ${rx * 2},0a${rx},${ry} 0 1 0 ${-rx * 2},0Z`;

  /** Bidang bebas dengan sapuan pendek; cols = [teduh, dasar, terang]. Sisi kiri-atas lebih terang. */
  function shape(parent, d, box, cols, R, { n = 40, dir = [1, 0.15], width = [5, 12], len = [12, 44], filter = 'impastoFine', cast = 'cast', transform, spread = 0.6 } = {}) {
    const a0 = Math.atan2(dir[1], dir[0]);
    return painted(parent, d, {
      base: cols[1], n, R, filter, cast, transform,
      stroke: () => {
        const u = R(), v = R(), x = box[0] + u * box[2], y = box[1] + v * box[3], L = len[0] + R() * (len[1] - len[0]);
        const a = a0 + (R() - 0.5) * spread;
        const lit = u + v < 0.85 + (R() - 0.5) * 0.5;
        const c = mix(cols[1], lit ? cols[2] : cols[0], 0.15 + R() * 0.65);
        return { d: `M${x},${y}l${Math.cos(a) * L},${Math.sin(a) * L}`, color: jitter(c, 6, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.4 + R() * 0.45 };
      },
    });
  }
  /** teduh di tepi kanan-bawah + terang di tepi kiri-atas, supaya benda terasa gembung */
  function volume(inner, d, { w = 12, shade = 0.16, light = 0.5, lc = '#ffffff' } = {}) {
    el('path', { d, fill: 'none', stroke: WARM, 'stroke-width': w, 'stroke-opacity': shade, transform: `translate(${-w * 0.3} ${-w * 0.36})`, filter: 'url(#blur2)' }, inner);
    el('path', { d, fill: 'none', stroke: lc, 'stroke-width': w * 0.5, 'stroke-opacity': light, transform: `translate(${w * 0.26} ${w * 0.3})`, filter: 'url(#blur2)' }, inner);
  }
  const gloss = (g, d, w = 5, o = 0.6) => el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-opacity': o, filter: 'url(#blur2)' }, g);

  /* ───────────────────────── serbet kotak-kotak ───────────────────────── */
  function gingham(svg, R, W, H, { cell = 62, rot = -7, c = '#8dbdae', base = '#f8eed9' } = {}) {
    wash(svg, { x: -40, y: -40, w: W + 80, h: H + 80, R, n: Math.round((W * H) / 5200), angle: rot, len: [0.3, 0.8], width: [18, 44], opacity: [0.25, 0.6], base, color: (u, v, R2) => mix(base, R2() < 0.5 ? '#fffaf0' : '#eddfc2', R2() * 0.7) });
    const D = Math.hypot(W, H) + cell * 2;
    const g = el('g', { transform: `translate(${W / 2} ${H / 2}) rotate(${rot})`, filter: 'url(#canvas)' }, svg);
    for (const vert of [0, 1]) {
      for (let p = -D / 2; p < D / 2; p += cell * 2) {
        const mid = p + cell / 2;
        el('path', { d: vert ? `M${mid},${-D / 2}V${D / 2}` : `M${-D / 2},${mid}H${D / 2}`, stroke: c, 'stroke-width': cell, 'stroke-opacity': 0.3, fill: 'none' }, g);
        for (let k = 0; k < Math.ceil(D / 70); k++) {
          const L = 110 + R() * 280, t = -D / 2 + R() * D, off = mid + (R() - 0.5) * cell * 0.3, w = cell * (0.3 + R() * 0.5);
          const col = jitter(mix(c, R() < 0.5 ? '#5f9d8c' : '#c4e0d4', R() * 0.6), 5, R);
          el('path', { d: vert ? `M${off},${t}v${L}` : `M${t},${off}h${L}`, stroke: col, 'stroke-width': w, 'stroke-opacity': 0.12 + R() * 0.16, fill: 'none' }, g);
        }
        // benang tepi garis
        for (const e of [-1, 1]) el('path', { d: vert ? `M${mid + (e * cell) / 2},${-D / 2}V${D / 2}` : `M${-D / 2},${mid + (e * cell) / 2}H${D / 2}`, stroke: '#4f8f7e', 'stroke-width': 1.6, 'stroke-opacity': 0.22, fill: 'none' }, g);
      }
    }
  }
  /** lipatan kain: pita terang-gelap yang sangat lembut */
  function folds(svg, list) {
    list.forEach(([x1, y1, x2, y2, w, o]) => {
      el('path', { d: `M${x1},${y1}L${x2},${y2}`, stroke: WARM, 'stroke-width': w, 'stroke-opacity': o, fill: 'none', filter: 'url(#softer)' }, svg);
      el('path', { d: `M${x1 - w * 0.6},${y1 - w * 0.4}L${x2 - w * 0.6},${y2 - w * 0.4}`, stroke: '#fffdf4', 'stroke-width': w * 0.6, 'stroke-opacity': o * 2.2, fill: 'none', filter: 'url(#softer)' }, svg);
    });
  }

  F.sprites['bg-bento'] = { w: 780, h: 1500, seed: 541, scale: 1, draw(svg, R) {
    gingham(svg, R, 780, 1500);
    folds(svg, [[-60, 520, 860, 380, 60, 0.06], [-60, 1180, 860, 1040, 70, 0.055], [250, -40, 190, 1560, 50, 0.04]]);
    // cahaya pagi dari kiri-atas, makin teduh ke kanan-bawah
    el('ellipse', { cx: 200, cy: 300, rx: 560, ry: 520, fill: '#fffaea', opacity: 0.6, filter: 'url(#softer)' }, svg);
    el('rect', { width: 780, height: 1500, fill: linGrad(svg, [[0, '#fff6dc', 0.2], [0.5, '#fff6dc', 0], [1, '#5a3216', 0.2]], 0, 0, 780, 1500) }, svg);
    // sudut kanan-bawah: daun dan kamboja kecil
    const gr = F.flora.GREEN;
    const c = el('g', { transform: 'translate(800 1512)' }, svg);
    [[-66, 0, 250, 86], [-38, 2, 300, 96], [-12, 1, 240, 84]].forEach(([a, gi, len, w]) => leaf(c, { len, w, ...gr[gi], R, n: 44, transform: `rotate(${a})`, curve: -0.18, cast: 'castBig' }));
    const fl = el('g', { filter: 'url(#castBig)' }, svg);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(676 1404) rotate(-12)' }, fl), R, 0.6);
    F.flora.flowers.melati(el('g', { transform: 'translate(560 1462) rotate(20)' }, fl), R, 0.5);
    F.flora.flowers.melati(el('g', { transform: 'translate(742 1268) rotate(50)' }, fl), R, 0.42);
    // sudut kiri-atas: setangkai daun mengintip
    const t = el('g', { transform: 'translate(-30 -26) rotate(140)' }, svg);
    [[-24, 3, 200, 74], [10, 1, 240, 82]].forEach(([a, gi, len, w]) => leaf(t, { len, w, ...gr[gi], R, n: 36, transform: `rotate(${a})`, curve: 0.2, cast: 'castBig' }));
    [[110, 1392, 30, 0.42, 'kamboja'], [40, 1300, -50, 0.34, 'kambojaPink'], [724, 132, 140, 0.34, 'kamboja']].forEach(([x, y, rot, s, pal]) => petal(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...F.flora.PAL[pal], cast: false }));
  } };

  /* ───────────────────────── kayu ───────────────────────── */
  const WOOD = { dark: '#a06a38', pale: '#f7dfb4' };
  function wood(parent, d, box, R, { tone = '#cf9a62', n = 120, cast, vertical = false, filter, transform } = {}) {
    return painted(parent, d, {
      base: tone, n, R, filter: filter || (vertical ? 'impasto' : 'impastoH'), cast, transform,
      stroke: () => {
        const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = 40 + R() * 170, b = (R() - 0.5) * 6;
        const c = mix(tone, R() < 0.5 ? WOOD.pale : WOOD.dark, R() * 0.5);
        return { d: vertical ? `M${x},${y - L / 2}q${b},${L / 2} 0,${L}` : `M${x - L / 2},${y}q${L / 2},${b} ${L},0`, color: jitter(c, 5, R), width: 2.5 + R() * 9, opacity: 0.22 + R() * 0.4 };
      },
    });
  }

  const BW = 400, BH = 490, RIM = 22;
  /** kotak bekal kayu dilihat dari atas; (0,0) = sudut kiri-atas kotak */
  function box(g, R) {
    const out = rr(0, 0, BW, BH, 46), inn = rr(RIM, RIM, BW - 2 * RIM, BH - 2 * RIM, 27);
    const o = wood(g, out, [0, 0, BW, BH], R, { tone: '#c88f56', n: 190, cast: 'castBig' });
    el('path', { d: out, fill: 'none', stroke: '#7a4a22', 'stroke-width': 14, 'stroke-opacity': 0.3, transform: 'translate(-4 -5)', filter: 'url(#blur2)' }, o.inner);
    el('path', { d: rr(5, 5, BW - 10, BH - 10, 42), fill: 'none', stroke: '#ffe9c0', 'stroke-width': 4, 'stroke-opacity': 0.75, filter: 'url(#blur2)' }, o.inner);
    const f = wood(g, inn, [RIM, RIM, BW - 2 * RIM, BH - 2 * RIM], R, { tone: '#ecca97', n: 230 });
    // dinding kiri & atas menjatuhkan bayangan ke lantai kotak
    el('path', { d: inn, fill: 'none', stroke: WARM, 'stroke-width': 30, 'stroke-opacity': 0.3, transform: 'translate(8 10)', filter: 'url(#soft)' }, f.inner);
    el('path', { d: inn, fill: 'none', stroke: '#fff3d6', 'stroke-width': 10, 'stroke-opacity': 0.5, transform: 'translate(-4 -5)', filter: 'url(#blur2)' }, f.inner);
    el('path', { d: inn, fill: 'none', stroke: '#75441e', 'stroke-width': 2.4, 'stroke-opacity': 0.55 }, g);
  }
  F.sprites['bento-kotak'] = { w: 440, h: 536, seed: 542, draw(svg, R) { box(el('g', { transform: 'translate(16 12)' }, svg), R); } };

  function divider(g, R, len, vertical) {
    const d = vertical ? rr(0, 0, 14, len, 2) : rr(0, 0, len, 14, 2);
    const p = wood(g, d, vertical ? [0, 0, 14, len] : [0, 0, len, 14], R, { tone: '#cc955b', n: Math.round(len / 9), cast: 'cast', vertical });
    el('path', { d: vertical ? `M3,0V${len}` : `M0,3H${len}`, stroke: '#ffe9c0', 'stroke-width': 3, 'stroke-opacity': 0.75, fill: 'none', filter: 'url(#blur2)' }, p.inner);
    el('path', { d: vertical ? `M12.5,0V${len}` : `M0,12.5H${len}`, stroke: '#7a4a22', 'stroke-width': 3, 'stroke-opacity': 0.35, fill: 'none' }, p.inner);
  }
  F.sprites['bento-sekat-h'] = { w: 380, h: 30, seed: 543, draw(svg, R) { divider(el('g', { transform: 'translate(0 6)' }, svg), R, 380, false); } };
  F.sprites['bento-sekat-v'] = { w: 30, h: 470, seed: 544, draw(svg, R) { divider(el('g', { transform: 'translate(6 0)' }, svg), R, 470, true); } };

  /** motif kawung kecil */
  function kawung(g, x, y, s, color, o = 0.4, sw = 2.4) {
    const k = el('g', { transform: `translate(${x} ${y})`, fill: 'none', stroke: color, 'stroke-width': sw, opacity: o }, g);
    for (const a of [45, 135, 225, 315]) el('ellipse', { cx: 0, cy: 0, rx: s, ry: s * 0.46, transform: `rotate(${a}) translate(${s * 1.12} 0)` }, k);
    el('circle', { r: s * 0.2, fill: color, stroke: 'none' }, k);
  }

  const LW = 416, LH = 506;
  /** tutup kotak (sisi luar): kayu berbingkai dengan cap kawung bakar di tengah */
  function lid(g, R) {
    const out = rr(0, 0, LW, LH, 52);
    const o = wood(g, out, [0, 0, LW, LH], R, { tone: '#d6a269', n: 260, cast: 'castBig' });
    el('path', { d: out, fill: 'none', stroke: '#7a4a22', 'stroke-width': 22, 'stroke-opacity': 0.26, transform: 'translate(-6 -8)', filter: 'url(#blur2)' }, o.inner);
    el('path', { d: out, fill: 'none', stroke: '#fff0cf', 'stroke-width': 12, 'stroke-opacity': 0.6, transform: 'translate(5 6)', filter: 'url(#blur2)' }, o.inner);
    // alur bingkai
    el('path', { d: rr(26, 26, LW - 52, LH - 52, 32), fill: 'none', stroke: '#8a5a2c', 'stroke-width': 3, 'stroke-opacity': 0.45 }, o.inner);
    el('path', { d: rr(28, 28, LW - 56, LH - 56, 30), fill: 'none', stroke: '#fff0cf', 'stroke-width': 2, 'stroke-opacity': 0.55 }, o.inner);
    // cap bakar: rangkaian kawung di tengah + untaian kecil di sudut
    const cx = LW / 2, cy = 150;
    el('circle', { cx, cy, r: 62, fill: 'none', stroke: '#7a4a22', 'stroke-width': 2.6, 'stroke-opacity': 0.42 }, o.inner);
    el('circle', { cx, cy, r: 55, fill: 'none', stroke: '#7a4a22', 'stroke-width': 1.4, 'stroke-opacity': 0.34, 'stroke-dasharray': '2 6' }, o.inner);
    kawung(o.inner, cx, cy, 20, '#6f4120', 0.5, 3);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => kawung(o.inner, cx + sx * 150, LH / 2 + sy * 196, 9, '#6f4120', 0.3, 1.8));
  }
  F.sprites['bento-tutup'] = { w: 460, h: 556, seed: 545, draw(svg, R) { lid(el('g', { transform: 'translate(18 14)' }, svg), R); } };

  /** tutup dari sisi dalam: kayu polos lebih muda dengan bibir penahan */
  function lidInside(g, R) {
    const out = rr(0, 0, LW, LH, 52);
    const o = wood(g, out, [0, 0, LW, LH], R, { tone: '#e7c592', n: 240, cast: 'castBig' });
    el('path', { d: out, fill: 'none', stroke: '#7a4a22', 'stroke-width': 18, 'stroke-opacity': 0.24, transform: 'translate(-5 -7)', filter: 'url(#blur2)' }, o.inner);
    const lipO = rr(18, 18, LW - 36, LH - 36, 38), lipI = rr(34, 34, LW - 68, LH - 68, 26);
    const lip = wood(g, `${lipO}${lipI}`, [18, 18, LW - 36, LH - 36], R, { tone: '#cf9a62', n: 0 });
    lip.inner.parentNode.querySelector('clipPath path').setAttribute('clip-rule', 'evenodd');
    lip.inner.querySelector('path').setAttribute('fill-rule', 'evenodd');
    for (let i = 0; i < 90; i++) {
      const x = 18 + R() * (LW - 36), y = 18 + R() * (LH - 36), L = 40 + R() * 120;
      el('path', { d: `M${x - L / 2},${y}h${L}`, stroke: jitter(mix('#cf9a62', R() < 0.5 ? WOOD.pale : WOOD.dark, R() * 0.5), 5, R), 'stroke-width': 3 + R() * 7, 'stroke-opacity': 0.3 + R() * 0.3, fill: 'none' }, lip.inner);
    }
    el('path', { d: lipO, fill: 'none', stroke: '#fff0cf', 'stroke-width': 3, 'stroke-opacity': 0.7 }, g);
    el('path', { d: lipI, fill: 'none', stroke: '#75441e', 'stroke-width': 3, 'stroke-opacity': 0.4 }, g);
    el('path', { d: lipI, fill: 'none', stroke: WARM, 'stroke-width': 16, 'stroke-opacity': 0.14, transform: 'translate(5 6)', filter: 'url(#soft)', 'clip-path': 'none' }, o.inner);
  }
  F.sprites['bento-tutup-dalam'] = { w: 460, h: 556, seed: 546, draw(svg, R) { lidInside(el('g', { transform: 'translate(18 14)' }, svg), R); } };

  /* ───────────────────────── pita kain + simpul ───────────────────────── */
  const RED = { stops: [[0, '#b53a1e'], [0.45, '#e4572e'], [1, '#f79a72']], shade: '#9a2d14', light: '#ffd0b8' };
  function band(g, R, len) {
    const d = rr(0, 0, len, 44, 3);
    const p = shape(g, d, [0, 0, len, 44], ['#b8401f', '#e4572e', '#f58e66'], R, { n: 110, dir: [1, 0], width: [4, 11], len: [30, 110], spread: 0.08, filter: 'impastoH', cast: 'cast' });
    // tenunan + jahitan krem
    for (let x = 6; x < len; x += 9) el('path', { d: `M${x},0V44`, stroke: '#8f2a12', 'stroke-width': 1, 'stroke-opacity': 0.16 }, p.inner);
    for (const y of [7, 37]) el('path', { d: `M4,${y}H${len - 4}`, stroke: '#fff3dc', 'stroke-width': 2.6, 'stroke-dasharray': '9 6', 'stroke-linecap': 'round', 'stroke-opacity': 0.9, fill: 'none' }, p.inner);
    // pita melengkung turun di kedua tepi tutup
    el('rect', { x: 0, y: 0, width: 26, height: 44, fill: linGrad(g, [[0, WARM, 0.4], [1, WARM, 0]], 0, 0, 26, 0) }, p.inner);
    el('rect', { x: len - 26, y: 0, width: 26, height: 44, fill: linGrad(g, [[0, WARM, 0], [1, WARM, 0.45]], len - 26, 0, len, 0) }, p.inner);
    el('path', { d: `M0,2H${len}`, stroke: '#ffd9c2', 'stroke-width': 2, 'stroke-opacity': 0.5, fill: 'none' }, p.inner);
  }
  function bow(g, R, s = 1) {
    const b = el('g', { transform: `scale(${s})` }, g);
    petal(b, { len: 64, w: 30, round: 0.4, notch: 12, R, n: 24, veins: 0, ...RED, transform: 'rotate(152)' });
    petal(b, { len: 60, w: 30, round: 0.4, notch: 12, R, n: 24, veins: 0, ...RED, transform: 'rotate(204)' });
    petal(b, { len: 66, w: 52, round: 0.95, R, n: 34, veins: 1, ...RED, transform: 'rotate(-78)' });
    petal(b, { len: 66, w: 52, round: 0.95, R, n: 34, veins: 1, ...RED, transform: 'rotate(78)', side: -0.6 });
    shape(b, rr(-13, -15, 26, 30, 9), [-13, -15, 26, 30], ['#a83318', '#d94f29', '#f58e66'], R, { n: 12, dir: [0, 1], width: [4, 8] });
  }
  F.sprites['bento-pita'] = { w: 460, h: 140, seed: 547, draw(svg, R) {
    band(el('g', { transform: 'translate(18 48)' }, svg), R, LW);
    bow(el('g', { transform: 'translate(118 68) rotate(-4)' }, svg), R, 1);
  } };

  /* ───────────────────────── lauk (kanvas 170×170, pusat ±85,85) ───────────────────────── */
  const FACE = '#2b1a12';
  const food = {
    onigiri(g, R, v = 1) {
      const d = 'M85,18C98,18 108,28 116,42L152,106C164,128 152,146 130,146L40,146C18,146 6,128 18,106L54,42C62,28 72,18 85,18Z';
      const p = painted(g, d, {
        base: '#fbf6ea', n: 230, R, filter: 'impastoFine', cast: 'cast',
        stroke: () => {
          const x = 8 + R() * 154, y = 16 + R() * 132, a = R() * Math.PI, L = 4 + R() * 5;
          const lit = x + y < 175 + (R() - 0.5) * 60;
          return { d: `M${x},${y}l${Math.cos(a) * L},${Math.sin(a) * L}`, color: jitter(lit ? (R() < 0.65 ? '#ffffff' : '#f3ecd8') : R() < 0.5 ? '#e4d9bf' : '#f5efdf', 3, R), width: 3.4 + R() * 2.6, opacity: 0.75 };
        },
      });
      volume(p.inner, d, { w: 16, shade: 0.2, light: 0.7 });
      // nori
      const n = shape(g, 'M56,104Q85,98 114,104L114,147L56,147Z', [56, 98, 58, 50], ['#101a15', '#1d2f26', '#3d5a48'], R, { n: 26, dir: [0.1, 1], width: [4, 9], len: [14, 34], cast: 'cast' });
      el('path', { d: 'M58,106Q85,100 112,106', fill: 'none', stroke: '#6f8f7a', 'stroke-width': 2, 'stroke-opacity': 0.6 }, n.inner);
      // wajah
      const f = el('g', {}, g);
      for (const x of [57, 113]) el('ellipse', { cx: x, cy: 88, rx: 10, ry: 6.5, fill: '#ff8f8f', opacity: 0.5, filter: 'url(#blur2)' }, f);
      if (v === 1) {
        for (const x of [70, 100]) { el('ellipse', { cx: x, cy: 76, rx: 4.6, ry: 6.2, fill: FACE }, f); el('circle', { cx: x - 1.4, cy: 73.6, r: 1.5, fill: '#fff' }, f); }
        el('path', { d: 'M77,87q8,8 16,0', fill: 'none', stroke: FACE, 'stroke-width': 3, 'stroke-linecap': 'round' }, f);
      } else {
        for (const x of [70, 100]) el('path', { d: `M${x - 6},78q6,-8 12,0`, fill: 'none', stroke: FACE, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, f);
        el('ellipse', { cx: 85, cy: 89, rx: 4.6, ry: 5.2, fill: '#b8402f' }, f);
        // umeboshi di puncak
        const u = shape(g, circle(85, 44, 10), [75, 34, 20, 20], ['#8f1f2a', '#c8323c', '#f07a78'], R, { n: 8, width: [3, 6], len: [4, 10] });
        el('circle', { cx: 81.5, cy: 40.5, r: 2.6, fill: '#fff', opacity: 0.7 }, u.inner);
        // taburan wijen
        for (let i = 0; i < 7; i++) el('ellipse', { cx: 62 + R() * 46, cy: 52 + R() * 12, rx: 2.4, ry: 1.3, fill: FACE, opacity: 0.8, transform: `rotate(${R() * 180} 85 60)` }, f);
      }
    },

    tamago(g, R) {
      const d = rr(22, 40, 126, 90, 28);
      const p = shape(g, d, [22, 40, 126, 90], ['#d9952a', '#f6c84c', '#ffe994'], R, { n: 70, dir: [1, 0.05], width: [5, 12], len: [16, 50], spread: 0.5 });
      volume(p.inner, d, { w: 14, shade: 0.22, light: 0.6, lc: '#fff6c8' });
      // gulungan telur: lapis demi lapis
      const swirl = 'M36,62Q36,52 48,52H122Q136,52 136,64V106Q136,118 122,118H54Q42,118 42,106V78Q42,66 54,66H112Q122,66 122,76V96Q122,105 112,105H66Q57,105 57,96V88Q57,80 66,80H100Q107,80 107,86Q107,92 100,92H76';
      el('path', { d: swirl, fill: 'none', stroke: '#fff2b0', 'stroke-width': 5, 'stroke-opacity': 0.65, 'stroke-linecap': 'round', transform: 'translate(1.5 2.5)' }, p.inner);
      el('path', { d: swirl, fill: 'none', stroke: '#b36f14', 'stroke-width': 3.2, 'stroke-opacity': 0.72, 'stroke-linecap': 'round' }, p.inner);
      el('path', { d, fill: 'none', stroke: '#b06f1a', 'stroke-width': 4, 'stroke-opacity': 0.55 }, p.inner);
      gloss(g, 'M40,56Q46,48 62,47', 5, 0.65);
    },

    sosis(g0, R) {
      const g = el('g', { transform: 'translate(0 -6)' }, g0);
      const cols = ['#a0281a', '#dc4a30', '#f98e6c'];
      // kaki gurita melebar dan melengkung di ujungnya
      const legs = el('g', { filter: 'url(#cast)' }, g);
      const lg = el('g', { filter: 'url(#impastoFine)' }, legs);
      [[-58, 50], [-30, 54], [0, 52], [30, 54], [58, 50]].forEach(([a, L], i) => {
        const r = (a * Math.PI) / 180, x0 = 85 + Math.sin(r) * 18, y0 = 96;
        const x1 = 85 + Math.sin(r) * (L + 4), y1 = 100 + Math.cos(r) * L, curl = (a === 0 ? (i % 2 ? 1 : -1) * 6 : Math.sign(a) * 14);
        const d = `M${x0},${y0}Q${(x0 + x1) / 2},${(y0 + y1) / 2 + 6} ${x1},${y1}q${curl * 0.7},7 ${curl},${-4}`;
        el('path', { d, fill: 'none', stroke: jitter(mix(cols[1], cols[0], 0.2 + (a > 0 ? 0.25 : 0)), 5, R), 'stroke-width': 15, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, lg);
        el('path', { d, fill: 'none', stroke: cols[2], 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-opacity': 0.6, transform: 'translate(-2.5 -2)' }, lg);
      });
      const d = 'M47,62a38,38 0 0 1 76,0L123,98Q123,110 111,110L59,110Q47,110 47,98Z';
      const p = shape(g, d, [47, 24, 76, 86], cols, R, { n: 50, dir: [0.1, 1], width: [5, 11], len: [14, 40] });
      volume(p.inner, d, { w: 14, shade: 0.26, light: 0.5, lc: '#ffc2a6' });
      gloss(g, 'M58,54q4,-17 20,-22', 6, 0.7);
      for (const x of [73, 97]) { el('ellipse', { cx: x, cy: 66, rx: 4, ry: 5.4, fill: FACE }, g); el('circle', { cx: x - 1.2, cy: 64, r: 1.3, fill: '#fff' }, g); }
      el('circle', { cx: 85, cy: 81, r: 5.2, fill: '#7e1a10', stroke: '#ffe9d6', 'stroke-width': 2.6 }, g);
      for (const x of [62, 108]) el('ellipse', { cx: x, cy: 77, rx: 6.5, ry: 4.2, fill: '#ffb39a', opacity: 0.55, filter: 'url(#blur2)' }, g);
    },

    ebi(g, R) {
      const e = el('g', { transform: 'translate(82 90) rotate(-40)' }, g);
      // ekor merah
      const tail = { stops: [[0, '#f9b890'], [0.4, '#f2603c'], [1, '#d93a22']], shade: '#a52a1c', light: '#ffd9c2' };
      petal(e, { len: 40, w: 24, round: 0.45, R, n: 14, veins: 2, ...tail, transform: 'translate(48 -2) rotate(68)' });
      petal(e, { len: 40, w: 24, round: 0.45, R, n: 14, veins: 2, ...tail, transform: 'translate(48 2) rotate(112)' });
      const d = 'M-66,0C-66,-22 -42,-29 -10,-27C22,-25 46,-16 54,-6L54,6C46,16 22,25 -10,27C-42,29 -66,22 -66,0Z';
      const p = shape(e, d, [-66, -29, 120, 58], ['#b06a1c', '#e2a23c', '#f9d98a'], R, { n: 50, dir: [1, 0.2], width: [5, 10], len: [8, 20], spread: 2.5 });
      // remah tepung roti
      for (let i = 0; i < 130; i++) {
        const x = -64 + R() * 118, y = -27 + R() * 54, lit = x * 0.4 + y > -6 ? 0 : 1;
        el('ellipse', { cx: x, cy: y, rx: 2 + R() * 3.4, ry: 1.6 + R() * 2.6, fill: jitter(R() < (lit ? 0.7 : 0.3) ? '#fbe2a0' : R() < 0.5 ? '#c98426' : '#e6ad48', 6, R), 'fill-opacity': 0.9, transform: `rotate(${R() * 180} ${x} ${y})` }, p.inner);
      }
      volume(p.inner, d, { w: 12, shade: 0.22, light: 0.3, lc: '#fff0c0' });
      dabs(e, { n: 34, R, filter: 'impastoFine', place: (i, R2) => { const t = (i / 34) * Math.PI * 2, x = -6 + Math.cos(t) * 58 + (R2() - 0.5) * 6, y = Math.sin(t) * 26 + (R2() - 0.5) * 5; if (x > 46) return null; return { x, y, rx: 3 + R2() * 3, ry: 2.4 + R2() * 2.4, rot: R2() * 180, color: jitter(Math.sin(t) < 0 ? '#f7d488' : '#c98426', 6, R2), opacity: 0.95 }; } });
    },

    brokoli(g, R) {
      const st = shape(g, 'M70,98L100,98L97,146Q85,154 73,146Z', [70, 98, 30, 56], ['#86ad52', '#b4d37e', '#e0f0b4'], R, { n: 14, dir: [0, 1], width: [4, 8] });
      el('path', { d: 'M78,104V144M90,104V146', stroke: '#7ea24c', 'stroke-width': 1.6, 'stroke-opacity': 0.5 }, st.inner);
      const heads = [[85, 44, 25], [57, 58, 22], [113, 58, 22], [46, 84, 19], [124, 84, 19], [70, 90, 22], [100, 90, 22], [85, 68, 26]];
      const grp = el('g', { filter: 'url(#cast)' }, g);
      heads.forEach(([cx, cy, r]) => {
        const p = shape(grp, circle(cx, cy, r), [cx - r, cy - r, r * 2, r * 2], ['#1f5c30', '#3a8a45', '#7cc46a'], R, { n: 0, cast: false, filter: 'impasto' });
        for (let i = 0; i < 26; i++) {
          const a = R() * Math.PI * 2, k = Math.sqrt(R()) * r * 0.95, x = cx + Math.cos(a) * k, y = cy + Math.sin(a) * k, lit = (x - cx) + (y - cy) < -r * 0.1;
          el('circle', { cx: x, cy: y, r: 2.6 + R() * 4, fill: jitter(lit ? (R() < 0.6 ? '#8fd07a' : '#5fae55') : R() < 0.6 ? '#2c7239' : '#1b5229', 7, R), 'fill-opacity': 0.9 }, p.inner);
        }
        el('path', { d: circle(cx, cy, r), fill: 'none', stroke: '#123f22', 'stroke-width': 6, 'stroke-opacity': 0.25, transform: 'translate(-2 -2.5)', filter: 'url(#blur2)' }, p.inner);
      });
    },

    tomat(g, R) {
      const d = circle(85, 88, 37);
      const p = shape(g, d, [48, 51, 74, 74], ['#9c1a18', '#e03a2b', '#ff8062'], R, { n: 40, dir: [0.6, 1], width: [6, 12], len: [12, 34], spread: 1 });
      volume(p.inner, d, { w: 14, shade: 0.3, light: 0.35, lc: '#ffb49c' });
      gloss(g, 'M62,74q4,-12 16,-16', 7, 0.75);
      el('circle', { cx: 104, cy: 104, r: 5, fill: '#ffc2ae', opacity: 0.35, filter: 'url(#blur2)' }, g);
      const c = el('g', { transform: 'translate(90 80)' }, g);
      for (let i = 0; i < 5; i++) leaf(c, { len: 19, w: 8.5, dark: '#1f5a30', mid: '#3d8a4c', light: '#9ccf8a', R, n: 6, transform: `rotate(${i * 72 + 10})`, cast: i === 0 });
      el('circle', { r: 3.4, fill: '#2f6b3a' }, c);
    },

    wortel(g, R) {
      let d = circle(85, 86, 20);
      for (let i = 0; i < 5; i++) { const a = ((i * 72 - 90) * Math.PI) / 180; d += circle(85 + Math.cos(a) * 25, 86 + Math.sin(a) * 25, 20); }
      const p = shape(g, d, [40, 41, 90, 90], ['#c95f10', '#f28c28', '#ffc070'], R, { n: 50, dir: [1, 0.4], width: [5, 10], len: [10, 30], spread: 3 });
      volume(p.inner, d, { w: 10, shade: 0.24, light: 0.5, lc: '#ffe0a8' });
      el('circle', { cx: 85, cy: 86, r: 15, fill: '#ffc97a', opacity: 0.55, filter: 'url(#blur2)' }, p.inner);
      el('circle', { cx: 85, cy: 86, r: 15, fill: 'none', stroke: '#d9741a', 'stroke-width': 2, 'stroke-opacity': 0.5 }, p.inner);
      for (let i = 0; i < 5; i++) { const a = ((i * 72 - 54) * Math.PI) / 180; el('path', { d: `M${85 + Math.cos(a) * 15},${86 + Math.sin(a) * 15}L${85 + Math.cos(a) * 27},${86 + Math.sin(a) * 27}`, stroke: '#c8641a', 'stroke-width': 2, 'stroke-opacity': 0.45, 'stroke-linecap': 'round' }, p.inner); }
    },

    apel(g, R) {
      const a = el('g', { transform: 'rotate(-14 85 85)' }, g);
      const d = 'M20,86C20,58 50,44 90,44C128,44 152,60 152,86C152,112 128,126 90,126C50,126 20,114 20,86Z';
      const p = shape(a, d, [20, 44, 132, 82], ['#e9d39a', '#fff3cf', '#fffdf4'], R, { n: 40, dir: [1, 0.1], width: [6, 12], len: [14, 36] });
      volume(p.inner, d, { w: 12, shade: 0.16, light: 0.6 });
      // kulit merah dengan potongan V: jadi telinga kelinci
      const skinD = 'M30,86C30,62 56,52 92,52C124,52 144,64 144,86C144,108 124,118 92,118C56,118 30,108 30,86ZM22,66L96,86L22,106Z';
      const skin = painted(a, skinD, {
        base: '#d5323a', n: 50, R, filter: 'impastoFine', cast: 'cast',
        stroke: () => { const x = 30 + R() * 114, y = 52 + R() * 66, L = 14 + R() * 30; return { d: `M${x},${y}l${L},${(R() - 0.5) * 6}`, color: jitter(mix('#d5323a', y < 80 ? '#f47e74' : '#961a22', R() * 0.7), 6, R), width: 5 + R() * 6, opacity: 0.4 + R() * 0.45 }; },
      });
      skin.inner.parentNode.querySelector('clipPath path').setAttribute('clip-rule', 'evenodd');
      skin.inner.querySelector('path').setAttribute('fill-rule', 'evenodd');
      gloss(a, 'M100,62q24,-3 36,10', 5, 0.5);
      // mata wijen + hidung merah muda
      for (const y of [80, 92]) el('ellipse', { cx: 50, cy: y, rx: 3.2, ry: 2.5, fill: FACE }, a);
      el('ellipse', { cx: 30, cy: 86, rx: 3.6, ry: 2.8, fill: '#f08a8a', opacity: 0.85 }, a);
    },

    stroberi(g, R) {
      const d = 'M85,44C112,36 136,58 130,90C124,120 102,144 85,148C68,144 46,120 40,90C34,58 58,36 85,44Z';
      const p = shape(g, d, [38, 40, 94, 108], ['#a3152a', '#e2333f', '#ff7d78'], R, { n: 46, dir: [0.3, 1], width: [6, 12], len: [14, 36], spread: 0.9 });
      volume(p.inner, d, { w: 14, shade: 0.3, light: 0.36, lc: '#ffb0a8' });
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
        const x = 55 + c * 20 + (r % 2 ? 10 : 0) + (R() - 0.5) * 4, y = 68 + r * 16 + (R() - 0.5) * 3;
        el('ellipse', { cx: x, cy: y, rx: 2.1, ry: 3.1, fill: '#ffe08a', 'fill-opacity': 0.92 }, p.inner);
        el('ellipse', { cx: x + 0.9, cy: y + 1.2, rx: 2.3, ry: 3.2, fill: '#7e0f1f', 'fill-opacity': 0.3 }, p.inner);
      }
      gloss(g, 'M56,74q2,-14 16,-20', 6, 0.6);
      const c = el('g', { transform: 'translate(85 46)' }, g);
      for (let i = 0; i < 6; i++) leaf(c, { len: 26, w: 12, dark: '#1f5a30', mid: '#3d8a4c', light: '#a8d88e', R, n: 8, transform: `rotate(${-100 + i * 40})`, cast: i === 0 });
      el('path', { d: 'M0,2q3,-12 8,-16', stroke: '#4a7a3a', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, c);
    },
  };
  const PIECES = { 'bento-onigiri-1': (g, R) => food.onigiri(g, R, 1), 'bento-onigiri-2': (g, R) => food.onigiri(g, R, 2), 'bento-tamago': food.tamago, 'bento-sosis': food.sosis, 'bento-ebi': food.ebi, 'bento-brokoli': food.brokoli, 'bento-tomat': food.tomat, 'bento-wortel': food.wortel, 'bento-apel': food.apel, 'bento-stroberi': food.stroberi };
  Object.keys(PIECES).forEach((name, i) => { F.sprites[name] = { w: 170, h: 170, seed: 550 + i, draw(svg, R) { PIECES[name](svg, R); } }; });

  /* ───────────────────────── alas: selada & cup kertas ───────────────────────── */
  function frill(cx, cy, rx, ry, amp, freq, phase = 0) {
    let d = '';
    for (let i = 0; i <= 180; i++) {
      const t = (i / 180) * Math.PI * 2, k = 1 + amp * Math.sin(freq * t + phase) + amp * 0.5 * Math.sin(freq * 2.3 * t + 1.7);
      // superelips supaya mendekati kotak membulat
      const c = Math.cos(t), s = Math.sin(t), n = 3.2, q = Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(s), n), -1 / n);
      d += `${i ? 'L' : 'M'}${(cx + c * q * rx * k).toFixed(1)},${(cy + s * q * ry * k).toFixed(1)}`;
    }
    return `${d}Z`;
  }
  function lettuce(g, R, W = 240, H = 190) {
    const cx = W / 2, cy = H / 2;
    const d = frill(cx, cy, W / 2 - 14, H / 2 - 14, 0.05, 11, 0.6);
    const p = painted(g, d, {
      base: '#9ccc62', n: 150, R, filter: 'impasto', cast: 'cast',
      stroke: () => {
        const a = R() * Math.PI * 2, k = 0.15 + R() * 0.8, L = 14 + R() * 30;
        const x = cx + Math.cos(a) * (W / 2) * k, y = cy + Math.sin(a) * (H / 2) * k;
        const c = k > 0.72 ? mix('#7fb84e', '#d8f0a0', R()) : mix('#9ccc62', R() < 0.5 ? '#c9e88c' : '#6da544', R() * 0.6);
        return { d: `M${x},${y}l${Math.cos(a) * L},${Math.sin(a) * L}`, color: jitter(c, 6, R), width: 5 + R() * 9, opacity: 0.4 + R() * 0.4 };
      },
    });
    const vein = { fill: 'none', stroke: '#e9f8c0', 'stroke-linecap': 'round' };
    el('path', { d: `M${W * 0.08},${cy + 6}Q${cx},${cy - 10} ${W * 0.93},${cy + 4}`, ...vein, 'stroke-width': 3.2, 'stroke-opacity': 0.55 }, p.inner);
    for (let i = 0; i < 9; i++) {
      const x = W * (0.16 + i * 0.085), up = i % 2 ? 1 : -1, y0 = cy - 2 + (R() - 0.5) * 4, L = H * (0.2 + R() * 0.16);
      el('path', { d: `M${x},${y0}q${10 + R() * 8},${up * L * 0.5} ${22 + R() * 14},${up * L}`, ...vein, 'stroke-width': 1.7, 'stroke-opacity': 0.45 }, p.inner);
    }
    el('path', { d, fill: 'none', stroke: '#4f8a34', 'stroke-width': 9, 'stroke-opacity': 0.3, transform: 'translate(-3 -4)', filter: 'url(#blur2)' }, p.inner);
    el('path', { d, fill: 'none', stroke: '#eefcc4', 'stroke-width': 4, 'stroke-opacity': 0.7, transform: 'translate(2 3)' }, p.inner);
  }
  function cup(g, R, cols, W = 240, H = 190) {
    const cx = W / 2, cy = H / 2;
    const d = frill(cx, cy, W / 2 - 12, H / 2 - 12, 0.022, 34);
    const p = painted(g, d, {
      base: cols[1], n: 90, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = R() * W, y = R() * H, L = 20 + R() * 50; return { d: `M${x},${y}l${L},${(R() - 0.5) * 8}`, color: jitter(mix(cols[1], x / W + y / H < 1 ? cols[2] : cols[0], R() * 0.6), 4, R), width: 6 + R() * 10, opacity: 0.35 + R() * 0.35 }; },
    });
    // lipit-lipit kertas menuju tepi
    for (let i = 0; i < 68; i++) {
      const t = (i / 68) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), n = 3.2, q = Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(s), n), -1 / n);
      const x1 = cx + c * q * (W / 2 - 40), y1 = cy + s * q * (H / 2 - 40), x2 = cx + c * q * (W / 2 - 12), y2 = cy + s * q * (H / 2 - 12);
      el('path', { d: `M${x1},${y1}L${x2},${y2}`, stroke: i % 2 ? cols[0] : '#ffffff', 'stroke-width': i % 2 ? 2 : 2.4, 'stroke-opacity': i % 2 ? 0.4 : 0.6, 'stroke-linecap': 'round' }, p.inner);
    }
    const fl = frill(cx, cy, W / 2 - 40, H / 2 - 40, 0, 1);
    el('path', { d: fl, fill: cols[2], 'fill-opacity': 0.5 }, p.inner);
    el('path', { d: fl, fill: 'none', stroke: cols[0], 'stroke-width': 2, 'stroke-opacity': 0.35 }, p.inner);
    el('path', { d: fl, fill: 'none', stroke: WARM, 'stroke-width': 12, 'stroke-opacity': 0.1, transform: 'translate(3 4)', filter: 'url(#blur2)' }, p.inner);
  }
  const CUPS = [['#e79aa8', '#f9c9d0', '#fff0f1'], ['#e4b64a', '#f8dc8a', '#fff6d2'], ['#7fbfa6', '#b9dfcc', '#ecf8f0']];
  F.sprites['bento-selada'] = { w: 240, h: 190, seed: 561, draw(svg, R) { lettuce(svg, R); } };
  CUPS.forEach((c, i) => { F.sprites[`bento-cup-${i + 1}`] = { w: 240, h: 190, seed: 562 + i, draw(svg, R) { cup(svg, R, c); } }; });

  /* ───────────────────────── pernak-pernik ───────────────────────── */
  function crumbs(g, R, n = 30, sx = 44, sy = 28) {
    dabs(el('g', { filter: 'url(#cast)' }, g), { n, R, filter: 'impastoFine', place: (i, R2) => { const a = R2() * Math.PI * 2, k = Math.pow(R2(), 0.7); return { x: 75 + Math.cos(a) * k * sx, y: 55 + Math.sin(a) * k * sy, rx: 1.8 + R2() * 4, ry: 1.4 + R2() * 3, rot: R2() * 180, color: jitter(['#fbf6ea', '#e6ad48', '#c98426', '#f6c84c', '#ffffff', '#b06a1c'][i % 6], 8, R2), opacity: 0.95 }; } });
  }
  F.sprites['bento-remah'] = { w: 150, h: 110, seed: 566, draw(svg, R) { crumbs(svg, R); } };

  const HEART = 'M0,14C-16,2 -24,-10 -15,-20C-8,-27 -1,-22 0,-16C1,-22 8,-27 15,-20C24,-10 16,2 0,14Z';
  function pick(g, R) {
    const s = el('g', { filter: 'url(#cast)' }, g);
    el('path', { d: 'M0,10L1.4,74', stroke: '#c9a36a', 'stroke-width': 4.4, 'stroke-linecap': 'round' }, s);
    el('path', { d: 'M-0.6,10L0.8,72', stroke: '#f3dcae', 'stroke-width': 1.4, 'stroke-linecap': 'round', 'stroke-opacity': 0.8 }, s);
    const p = shape(g, HEART, [-24, -27, 48, 42], ['#b3243e', '#ee4f68', '#ff9aa8'], R, { n: 16, width: [4, 9], len: [8, 22], spread: 1.4 });
    volume(p.inner, HEART, { w: 9, shade: 0.26, light: 0.4, lc: '#ffc6cd' });
    gloss(g, 'M-13,-12q2,-7 8,-8', 4, 0.75);
  }
  F.sprites['bento-hati'] = { w: 70, h: 116, seed: 567, draw(svg, R) { pick(el('g', { transform: 'translate(35 34)' }, svg), R); } };

  function chopsticks(g, R, len = 380) {
    // sandaran porselen berbentuk kacang, bermotif kawung nila
    const rest = rr(70, 0, 42, 66, 18);
    const rp = shape(g, rest, [70, 0, 42, 66], ['#d9cdb8', '#f6efe2', '#ffffff'], R, { n: 18, dir: [0.1, 1], width: [5, 10], cast: 'castBig' });
    volume(rp.inner, rest, { w: 10, shade: 0.2, light: 0.6 });
    kawung(rp.inner, 91, 12, 5, '#3f5f9a', 0.75, 1.5);
    kawung(rp.inner, 91, 54, 5, '#3f5f9a', 0.75, 1.5);
    const st = el('g', { filter: 'url(#castBig)' }, g);
    [[20, -1.2], [46, 1.4]].forEach(([y, a], i) => {
      const s = el('g', { transform: `translate(0 ${y}) rotate(${a})` }, st);
      const d = `M0,-7Q-4,0 0,7L${len},3Q${len + 3},0 ${len},-3Z`;
      const p = shape(s, d, [0, -8, len, 16], ['#3f2114', '#6a3a22', '#9c6238'], R, { n: 40, dir: [1, 0], width: [2, 5], len: [30, 120], spread: 0.04, filter: 'impastoFine', cast: false });
      el('path', { d: `M4,-4.2L${len - 4},-1.6`, stroke: '#d9a878', 'stroke-width': 1.6, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, p.inner);
      // pangkal berpernis merah + cincin emas
      el('rect', { x: -4, y: -9, width: 62, height: 18, fill: '#c2372b' }, p.inner);
      el('path', { d: 'M2,-4.4H56', stroke: '#ff9c86', 'stroke-width': 2, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, p.inner);
      for (const x of [60, 68]) el('rect', { x, y: -9, width: 3.4, height: 18, fill: '#f0c35a' }, p.inner);
      if (i === 0) el('rect', { x: 12, y: -9, width: 3, height: 18, fill: '#f0c35a', opacity: 0.9 }, p.inner);
    });
  }
  F.sprites['bento-sumpit'] = { w: 420, h: 90, seed: 568, draw(svg, R) { chopsticks(el('g', { transform: 'translate(18 10)' }, svg), R); } };

  F.sprites['bento-uap'] = { w: 90, h: 170, seed: 569, draw(svg) {
    const g = el('g', { filter: 'url(#soft)', fill: 'none', stroke: '#ffffff', 'stroke-linecap': 'round' }, svg);
    el('path', { d: 'M45,150C20,120 68,96 44,64C28,42 56,30 46,16', 'stroke-width': 13, 'stroke-opacity': 0.8 }, g);
    el('path', { d: 'M56,138C40,116 70,100 58,78', 'stroke-width': 8, 'stroke-opacity': 0.5 }, g);
  } };

  F.sprites['bento-bintang'] = { w: 48, h: 48, seed: 570, draw(svg, R) {
    const d = 'M24,3Q26.5,19 45,24Q26.5,29 24,45Q21.5,29 3,24Q21.5,19 24,3Z';
    const p = shape(svg, d, [3, 3, 42, 42], ['#f2a93a', '#ffd36e', '#fff6cf'], R, { n: 10, width: [3, 6], len: [6, 16], spread: 2, cast: false });
    el('circle', { cx: 24, cy: 24, r: 5, fill: '#fffbe6', opacity: 0.9, filter: 'url(#blur2)' }, p.inner);
  } };

  F.sprites['bento-selotip'] = { w: 150, h: 56, seed: 571, draw(svg, R) {
    let d = 'M14,10H136';
    for (let k = 0; k < 6; k++) d += `l${k % 2 ? 5 : -5},6`;
    d += 'H14';
    for (let k = 0; k < 6; k++) d += `l${k % 2 ? -5 : 5},-6`;
    d += 'Z';
    const p = shape(el('g', { opacity: 0.92 }, svg), d, [10, 10, 130, 36], ['#e9d9b6', '#fbf2dc', '#ffffff'], R, { n: 30, dir: [1, 0], width: [5, 12], len: [20, 60], spread: 0.1 });
    const m = el('g', { opacity: 0.6 }, p.inner);
    for (let x = 16; x < 140; x += 16) el('rect', { x, y: 8, width: 8, height: 40, fill: '#e4572e', opacity: 0.55 }, m);
    for (const y of [16, 32]) el('rect', { x: 8, y, width: 134, height: 8, fill: '#e4572e', opacity: 0.55 }, m);
    el('path', { d: 'M16,12H134', stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': 0.5, fill: 'none' }, p.inner);
  } };

  /* ───────────────────────── kartu katalog ───────────────────────── */
  const put = (g, name, x, y, size, rot = 0) => PIECES[name](el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${size / 170}) translate(-85 -85)` }, g), F.rng(Math.round(x * 7 + y * 13)));
  const bed = (g, R, kind, x, y, w, h) => { const b = el('g', { transform: `translate(${x} ${y}) scale(${w / 240} ${h / 190})` }, g); if (kind === 'selada') lettuce(b, R); else cup(b, R, CUPS[kind]); };

  F.sprites['cover-bento'] = { w: 480, h: 600, seed: 572, draw(svg, R) {
    gingham(svg, R, 480, 600, { cell: 46, rot: -9 });
    folds(svg, [[-40, 430, 520, 350, 44, 0.06], [140, -30, 100, 640, 36, 0.04]]);
    el('ellipse', { cx: 130, cy: 150, rx: 360, ry: 330, fill: '#fffaea', opacity: 0.55, filter: 'url(#softer)' }, svg);
    el('rect', { width: 480, height: 600, fill: linGrad(svg, [[0, '#fff6dc', 0.15], [0.5, '#fff6dc', 0], [1, '#5a3216', 0.22]], 0, 0, 480, 600) }, svg);
    // tutup mengintip di kiri-atas, di bawah kotak
    lid(el('g', { transform: 'translate(-150 -196) rotate(-17) scale(0.74)' }, svg), R);
    // sumpit di kanan
    chopsticks(el('g', { transform: 'translate(452 96) rotate(96) scale(1.06)' }, svg), R, 400);
    // kotak berisi
    const b = el('g', { transform: 'translate(64 118) rotate(4) scale(0.86)' }, svg);
    box(b, R);
    const I = RIM;
    bed(b, R, 'selada', I + 2, I + 2, 206, 164); bed(b, R, 2, I + 212, I + 2, 142, 164);
    bed(b, R, 0, I + 2, I + 172, 142, 272); bed(b, R, 1, I + 150, I + 172, 204, 132); bed(b, R, 'selada', I + 150, I + 310, 204, 134);
    const dv = (x, y, len, vert) => divider(el('g', { transform: `translate(${x} ${y})` }, b), R, len, vert);
    dv(I + 205, I, 170, true); dv(I, I + 163, 356, false); dv(I + 143, I + 170, 276, true); dv(I + 150, I + 301, 206, false);
    put(b, 'bento-onigiri-1', I + 62, I + 84, 128, -9); put(b, 'bento-onigiri-2', I + 146, I + 82, 128, 8);
    put(b, 'bento-sosis', I + 250, I + 66, 104, -12); put(b, 'bento-sosis', I + 312, I + 74, 104, 12); put(b, 'bento-sosis', I + 282, I + 112, 100, 2);
    put(b, 'bento-tamago', I + 74, I + 226, 142, -6); put(b, 'bento-tamago', I + 72, I + 308, 142, 5); put(b, 'bento-tamago', I + 74, I + 388, 142, -4);
    put(b, 'bento-brokoli', I + 198, I + 232, 110, -8); put(b, 'bento-wortel', I + 262, I + 214, 84, 0); put(b, 'bento-tomat', I + 270, I + 262, 92, 0); put(b, 'bento-brokoli', I + 322, I + 236, 104, 10);
    put(b, 'bento-apel', I + 206, I + 366, 124, -8); put(b, 'bento-stroberi', I + 276, I + 372, 104, 10); put(b, 'bento-stroberi', I + 326, I + 388, 96, -12);
    pick(el('g', { transform: 'translate(318 146) rotate(18) scale(0.86)' }, svg), R);
    // sentuhan floa: kamboja dan daun di kiri-bawah
    const gr = F.flora.GREEN;
    const c = el('g', { transform: 'translate(-14 612)' }, svg);
    [[18, 0, 150, 56], [48, 2, 170, 60], [76, 1, 140, 52]].forEach(([a, gi, len, w]) => leaf(c, { len, w, ...gr[gi], R, n: 30, transform: `rotate(${a})`, curve: 0.2, cast: 'castBig' }));
    const fl = el('g', { filter: 'url(#castBig)' }, svg);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(64 548) rotate(14)' }, fl), R, 0.36);
    F.flora.flowers.melati(el('g', { transform: 'translate(132 578) rotate(30)' }, fl), R, 0.34);
  } };
})();
