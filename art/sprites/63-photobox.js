/* Photobox: bilik foto koral di depan dinding biru pucat — papan nama berlampu (lampu & tulisannya dari DOM),
   tenda bergaris, pintu bertirai beludru biru tua, celah koin, celah keluarnya strip; bagian dalam bilik
   (dinding, rumah lensa + lampu kilat, konsol, tombol rana), stiker, koin, dan si tangan iseng untuk mini-game.
   Semua tulisan dipasang dari DOM di atas lukisan ini. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, mix, jitter, ramp, linGrad, radGrad } = F;
  const W = 780, H = 1500;
  const CORAL = { hi: '#ffa890', light: '#f67a63', base: '#e8503a', mid: '#c53c29', dark: '#95291c', deep: '#5e170f' };
  const NAVY = { hi: '#7089bb', light: '#465d92', base: '#2c3d68', mid: '#1f2a44', dark: '#141c30', deep: '#0a0f1c' };
  const GOLD = { hi: '#fff3c4', light: '#f6d77c', base: '#e0aa3e', mid: '#b47f22', dark: '#7a5212', deep: '#4a300a' };
  const CREAM = ['#e6d3ad', '#fbf1d8', '#fffaf0'];
  const PASTEL = ['#ffd9c2', '#cfe9d8', '#ffe7a6', '#e0d4f2'];

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const circ = (cx, cy, r) => `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}Z`;
  const HEART = 'M0,30C-52,-8 -28,-52 0,-24C28,-52 52,-8 0,30Z';

  /** bidang bebas dilukis dengan sapuan searah `dir`; cols = [gelap, dasar, terang] */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90] } = {}) => painted(g, d, {
    base: cols[1], n, R, filter, cast,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.35 + R() * 0.45 };
    },
  });

  /** logam dipoles: gradien diagonal (terang di kiri-atas) + sapuan halus */
  const GOLD_STOPS = [[0, GOLD.light], [0.18, GOLD.hi], [0.4, GOLD.light], [0.62, GOLD.base], [0.85, GOLD.mid], [1, GOLD.dark]];
  const CHROME_STOPS = [[0, '#dfe7ee'], [0.18, '#ffffff'], [0.4, '#c9d5df'], [0.62, '#93a4b5'], [0.85, '#66788b'], [1, '#3f4d5e']];
  function metal(g, d, box, R, { n = 40, cast = 'cast', dir = [0.3, 1], stops = GOLD_STOPS } = {}) {
    const [x, y, w, h] = box;
    return painted(g, d, {
      base: linGrad(g, stops, x, y, x + w, y + h), n, R, filter: 'impastoFine', cast,
      stroke: () => {
        const u = R(), v = R(), L = Math.max(w, h) * (0.1 + R() * 0.22), m = Math.hypot(dir[0], dir[1]);
        return { d: `M${x + u * w},${y + v * h}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(ramp(stops, (u + v) / 2 + (R() - 0.5) * 0.08), 4, R), width: 3 + R() * 6, opacity: 0.18 + R() * 0.22 };
      },
    });
  }
  const gold = metal;

  /** kamboja kecil lima kelopak (tanda floa), berpusat di (0,0) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
  function mark(g, x, y, s, fill, opacity = 1, centre) {
    const m = el('g', { transform: `translate(${x} ${y}) scale(${s})`, opacity }, g);
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill, transform: `rotate(${i * 72})` }, m);
    el('circle', { r: 3.4, fill: centre || mix(fill, '#fff4cc', 0.6) }, m);
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

  /* ───────────── dinding biru pucat + lantai ubin catur ───────────── */
  function wall(svg, R) {
    const FLOOR = 1236, WY = 1016;
    const tone = [[0, '#e6f1f7'], [0.5, '#d2e5ef'], [1, '#bcd7e5']];
    wash(svg, {
      x: -40, y: -30, w: W + 80, h: FLOOR + 40, R, n: 420, angle: 88, len: [0.08, 0.2], width: [26, 60], opacity: [0.22, 0.5],
      base: linGrad(svg, tone, 0, 0, 0, FLOOR), color: (u, v) => ramp(tone, v + (R() - 0.5) * 0.3),
    });
    // kertas dinding kawung, nada di atas nada
    el('rect', { x: 0, y: 0, width: W, height: WY, fill: kawung(svg, '#ffffff', 92, 1.9), opacity: 0.42 }, svg);
    el('rect', { x: 0, y: 0, width: W, height: WY, fill: kawung(svg, '#6f9ab3', 92, 1.9), opacity: 0.16, transform: 'translate(2 2.6)' }, svg);
    // cahaya jendela dari kiri-atas
    el('rect', { x: 0, y: 0, width: W, height: FLOOR, fill: radGrad(svg, [[0, '#ffffff', 0.5], [0.5, '#fffaf0', 0.14], [1, '#fffaf0', 0]], 150, 180, 760) }, svg);
    // lis dinding bawah: papan biru yang lebih dalam, beralur
    const wt = [[0, '#a4c6d8'], [1, '#86aec5']];
    wash(svg, { x: -40, y: WY, w: W + 80, h: FLOOR - WY + 6, R, n: 150, angle: 90, len: [0.06, 0.16], width: [16, 34], opacity: [0.25, 0.5], base: linGrad(svg, wt, 0, WY, 0, FLOOR), color: (u, v) => mix(ramp(wt, v), '#c2dbe8', R() * 0.3) });
    for (let x = 34; x < W; x += 89) {
      el('path', { d: `M${x},${WY + 16}V${FLOOR - 36}`, stroke: '#5f8aa3', 'stroke-width': 3, 'stroke-opacity': 0.45 }, svg);
      el('path', { d: `M${x + 3},${WY + 16}V${FLOOR - 36}`, stroke: '#e3f0f6', 'stroke-width': 2, 'stroke-opacity': 0.6 }, svg);
    }
    el('path', { d: `M-20,${WY + 20}H${W + 20}`, stroke: '#4d7790', 'stroke-width': 22, 'stroke-opacity': 0.28, filter: 'url(#soft)' }, svg);
    shape(svg, `M-20,${WY - 12}H${W + 20}V${WY + 10}H-20Z`, [0, WY - 12, W, 22], CREAM, R, { n: 30, dir: [1, 0], width: [5, 10] });
    el('path', { d: `M-20,${WY - 10}H${W + 20}`, stroke: '#ffffff', 'stroke-width': 2.4, 'stroke-opacity': 0.8 }, svg);
    shape(svg, `M-20,${FLOOR - 34}H${W + 20}V${FLOOR + 2}H-20Z`, [0, FLOOR - 34, W, 36], CREAM, R, { n: 36, dir: [1, 0], width: [6, 14] });
    el('path', { d: `M-20,${FLOOR - 32}H${W + 20}`, stroke: '#ffffff', 'stroke-width': 2.4, 'stroke-opacity': 0.8 }, svg);

    // lantai ubin catur berperspektif
    const vpY = FLOOR - 430, ys = [];
    for (let k = 0; k <= 6; k++) ys.push(FLOOR + (H + 30 - FLOOR) * Math.pow(k / 6, 1.45));
    const xAt = (j, y) => W / 2 + j * 170 * ((y - vpY) / (H - vpY));
    const fl = el('g', { filter: 'url(#canvas)' }, svg);
    el('rect', { x: -20, y: FLOOR, width: W + 40, height: H - FLOOR + 20, fill: '#f3e7cc' }, fl);
    for (let k = 0; k < 6; k++) {
      for (let j = -8; j < 8; j++) {
        const y0 = ys[k], y1 = ys[k + 1];
        const odd = (((j + k) % 2) + 2) % 2;
        const c = odd ? jitter(mix('#7f9db5', '#6a8aa4', R() * 0.6), 5, R) : jitter(mix('#f8eed6', '#ead9b5', R() * 0.7), 4, R);
        el('path', { d: `M${xAt(j, y0)},${y0}L${xAt(j + 1, y0)},${y0}L${xAt(j + 1, y1)},${y1}L${xAt(j, y1)},${y1}Z`, fill: c }, fl);
      }
    }
    wash(svg, { x: -40, y: FLOOR, w: W + 80, h: H - FLOOR + 30, R, n: 130, angle: 0, len: [0.2, 0.6], width: [5, 14], opacity: [0.08, 0.2], color: (u, v) => (R() < 0.5 ? '#ffffff' : '#56758c') });
    // lantai menggelap ke arah dinding, mengilap di depan
    el('rect', { x: 0, y: FLOOR, width: W, height: H - FLOOR, fill: linGrad(svg, [[0, '#3a4d63', 0.45], [0.35, '#3a4d63', 0.08], [1, '#ffffff', 0.12]], 0, FLOOR, 0, H) }, svg);
    el('path', { d: `M-20,${FLOOR + 5}H${W + 20}`, stroke: '#2d3f55', 'stroke-width': 16, 'stroke-opacity': 0.3, filter: 'url(#soft)' }, svg);

    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#1f2a44', 0], [0.6, '#1f2a44', 0], [1, '#1f2a44', 0.26]], W / 2, H * 0.45, H * 0.78) }, svg);
  }

  /* ───────────── untaian bendera segitiga (sprite sendiri: berkibar pelan di belakang bilik) ───────────── */
  function bunting(svg, R) {
    const sag = (x) => 16 + 86 * Math.sin((Math.PI * (x + 30)) / (W + 60));
    let line = `M-30,${sag(-30)}`;
    for (let x = -20; x <= W + 30; x += 10) line += `L${x},${sag(x).toFixed(1)}`;
    const flags = el('g', { filter: 'url(#cast)' }, svg);
    const cols = [[CORAL.mid, CORAL.base, CORAL.light], CREAM, [NAVY.mid, NAVY.base, NAVY.light], ['#d9a033', '#f2c65a', '#ffe39a']];
    for (let i = 0, x = 6; x < W - 40; i++, x += 78) {
      const y0 = sag(x), y1 = sag(x + 62), tilt = (R() - 0.5) * 10;
      shape(flags, `M${x},${y0 - 2}L${x + 62},${y1 - 2}L${x + 31 + tilt},${(y0 + y1) / 2 + 74}Z`, [x, y0, 62, 76], cols[i % 4], R, { n: 12, dir: [0.2, 1], width: [6, 12] });
    }
    el('path', { d: line, fill: 'none', stroke: '#8a6a45', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, svg);
  }

  /* ───────────── tirai beludru biru tua (satu sayap, mengumpul ke kiri) ───────────── */
  const TW = 356, TH = 690;
  function foldEdges(n, R) {
    const ws = Array.from({ length: n }, () => 0.7 + R() * 0.6);
    const sum = ws.reduce((p, c) => p + c, 0);
    const out = [];
    let a = 0;
    for (const v of ws) { out.push([a, a + v / sum]); a += v / sum; }
    out[out.length - 1][1] = 1;
    return out;
  }
  function foldStops(edges) {
    const st = [];
    for (const [a, b] of edges) {
      const w = b - a;
      st.push([a, NAVY.deep], [a + w * 0.1, NAVY.dark], [a + w * 0.24, NAVY.mid], [a + w * 0.36, NAVY.base], [a + w * 0.44, NAVY.light], [a + w * 0.48, mix(NAVY.light, NAVY.hi, 0.6)], [a + w * 0.54, NAVY.light], [a + w * 0.64, NAVY.base], [a + w * 0.8, NAVY.mid], [a + w * 0.93, NAVY.dark]);
    }
    st.push([1, NAVY.deep]);
    return st;
  }
  function curtain(g, R, { w = TW, h = TH, folds = 6 } = {}) {
    const E = foldEdges(folds, R);
    const stops = foldStops(E);
    const top = 14;
    const hem = (x) => {
      const u = Math.max(0, Math.min(0.9999, x / w));
      const f = E.find(([a, b]) => u >= a && u < b) || E[E.length - 1];
      return h - 22 + 9 * Math.sin(Math.PI * ((u - f[0]) / (f[1] - f[0])));
    };
    const xs = [];
    for (let x = 0; x <= w; x += 6) xs.push(x);
    const hemLine = (list) => list.map((x) => `L${x},${hem(x).toFixed(1)}`).join('');
    const d = `M0,${top}H${w - 8}C${w + 5},${h * 0.24} ${w - 16},${h * 0.5} ${w - 2},${h * 0.76}S${w - 10},${h - 90} ${w - 6},${hem(w - 6).toFixed(1)}${hemLine(xs.filter((x) => x < w - 6).reverse())}Z`;
    const p = painted(g, d, {
      base: linGrad(g, stops, 0, 0, w, 0), n: 260, R, filter: 'impasto', cast: 'castBig',
      stroke: () => {
        const x = R() * w, y = R() * h - 60, L = 110 + R() * 260;
        return { d: `M${x},${y}q${(R() - 0.5) * 12},${L / 2} ${(R() - 0.5) * 9},${L}`, color: jitter(ramp(stops, x / w + (R() - 0.5) * 0.018), 5, R), width: 7 + R() * 12, opacity: 0.28 + R() * 0.4 };
      },
    });
    const ov = p.inner;
    for (const [y, o] of [[h * 0.22, 0.1], [h * 0.55, 0.07]]) el('ellipse', { cx: w * 0.42, cy: y, rx: w * 0.7, ry: 60, fill: '#9fb6ea', opacity: o, filter: 'url(#softer)' }, ov);
    // pita kawung krem-emas di atas kelim
    const by = h - 132, bh = 50;
    const band = el('g', { transform: `translate(0 ${by})`, opacity: 0.95 }, ov);
    el('rect', { x: -10, y: 0, width: w + 20, height: bh, fill: CORAL.mid, opacity: 0.9 }, band);
    el('rect', { x: -10, y: 0, width: w + 20, height: bh, fill: kawung(g, '#ffe9c2', bh, 2.1) }, band);
    for (const [y, c, sw] of [[-5, GOLD.light, 3.6], [bh + 5, GOLD.light, 3.6], [-11, GOLD.mid, 1.5], [bh + 11, GOLD.mid, 1.5]]) el('path', { d: `M-10,${y}H${w + 10}`, stroke: c, 'stroke-width': sw }, band);
    E.forEach(([a, b], k) => {
      const x = a * w, fw = (b - a) * w;
      if (k > 0) {
        el('path', { d: `M${x},0C${x + 8},${h * 0.3} ${x - 8},${h * 0.62} ${x + 3},${h - 20}`, fill: 'none', stroke: '#05070f', 'stroke-width': 8, 'stroke-opacity': 0.5, filter: 'url(#blur2)' }, ov);
        el('rect', { x: x - fw * 0.1, y: by - 14, width: fw * 0.3, height: bh + 28, fill: '#070b16', opacity: 0.6, filter: 'url(#soft)' }, ov);
      }
      el('rect', { x: x + fw * 0.74, y: by - 14, width: fw * 0.3, height: bh + 28, fill: '#070b16', opacity: 0.42, filter: 'url(#soft)' }, ov);
      const hx = x + fw * 0.44;
      el('path', { d: `M${hx},${h * 0.05}C${hx + 6},${h * 0.3} ${hx - 6},${h * 0.6} ${hx + 2},${h - 40}`, fill: 'none', stroke: '#b9caf2', 'stroke-width': 2.4, 'stroke-opacity': 0.34, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, ov);
    });
    el('rect', { x: -20, y: -20, width: w + 40, height: h + 40, fill: linGrad(g, [[0, '#05070f', 0.5], [0.1, '#05070f', 0], [0.86, '#05070f', 0], [1, '#05070f', 0.3]], 0, 0, 0, h) }, ov);
    // pita kepala + cincin kuningan
    el('path', { d: `M0,${top}H${w - 8}V${top + 16}H0Z`, fill: NAVY.deep, opacity: 0.55 }, ov);
    const rings = el('g', { filter: 'url(#cast)' }, g);
    E.forEach(([a, b]) => {
      const x = (a + (b - a) * 0.46) * w;
      el('circle', { cx: x, cy: 11, r: 9.5, fill: 'none', stroke: GOLD.dark, 'stroke-width': 5.5 }, rings);
      el('circle', { cx: x, cy: 11, r: 9.5, fill: 'none', stroke: GOLD.light, 'stroke-width': 3.2 }, rings);
      el('path', { d: `M${x - 7},6A9.5,9.5 0 0 1 ${x + 2},1.6`, fill: 'none', stroke: GOLD.hi, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, rings);
    });
  }

  /* ───────────── bilik foto ───────────── */
  const BW = 720, BH = 1240;
  /** strip contoh di etalase: bingkai pastel berisi kamboja kecil (pengganti orang) */
  function miniStrip(g, R, v = 0, { s = 1 } = {}) {
    const m = el('g', { transform: `scale(${s})` }, g);
    el('path', { d: rrect(-31, -146, 62, 292, 3), fill: linGrad(g, [[0, '#fffdf6'], [1, '#efe4cb']], -31, -146, 31, 146), filter: 'url(#cast)' }, m);
    for (let i = 0; i < 4; i++) {
      const y = -140 + i * 64;
      el('rect', { x: -25, y, width: 50, height: 56, fill: PASTEL[(i + v) % 4] }, m);
      el('rect', { x: -25, y, width: 50, height: 56, fill: linGrad(g, [[0, '#fff', 0.35], [1, '#3a1d12', 0.12]], -25, y, 25, y + 56) }, m);
      if ((i + v) % 3 === 2) el('path', { d: HEART, fill: CORAL.base, transform: `translate(0 ${y + 28}) scale(0.34)` }, m);
      else mark(m, 0, y + 30, 0.95, (i + v) % 2 ? '#ffffff' : '#ff9fb2', 1, '#f2b84b');
    }
    el('path', { d: HEART, fill: CORAL.base, opacity: 0.8, transform: 'translate(0 128) scale(0.16)' }, m);
  }
  /** titik lampu di bingkai papan nama (dipakai juga di DOM: lihat BULBS di index.tsx) */
  function bulbSpots() {
    const out = [];
    for (let i = 0; i <= 10; i++) out.push([110 + i * 50, 50]);
    for (const y of [95, 139]) out.push([629, y]);
    for (let i = 10; i >= 0; i--) out.push([110 + i * 50, 184]);
    for (const y of [139, 95]) out.push([91, y]);
    return out;
  }
  function booth(g, R, { lit = false } = {}) {
    el('ellipse', { cx: 376, cy: 1198, rx: 346, ry: 28, fill: '#2b3a52', opacity: 0.4, filter: 'url(#soft)' }, g);
    // alas
    shape(g, rrect(28, 1122, 664, 78, 10), [28, 1122, 664, 78], [NAVY.dark, NAVY.mid, NAVY.base], R, { n: 44, dir: [1, 0], width: [10, 22], cast: 'castBig' });
    el('path', { d: 'M36,1132H684', stroke: NAVY.hi, 'stroke-width': 3, 'stroke-opacity': 0.55 }, g);
    gold(g, rrect(58, 1152, 604, 20, 6), [58, 1152, 604, 20], R, { n: 16, cast: false, dir: [1, 0.1] });

    // badan
    const body = rrect(44, 228, 632, 904, 16);
    const bst = [[0, CORAL.light], [0.1, CORAL.hi], [0.28, CORAL.light], [0.6, CORAL.base], [1, CORAL.mid]];
    painted(g, body, {
      base: linGrad(g, bst, 44, 0, 676, 0), n: 300, R, filter: 'impasto', cast: 'castBig',
      stroke: () => {
        const x = 44 + R() * 632, y = 200 + R() * 920, L = 60 + R() * 170;
        return { d: `M${x},${y}q${(R() - 0.5) * 8},${L / 2} ${(R() - 0.5) * 6},${L}`, color: jitter(ramp(bst, (x - 44) / 632 + (R() - 0.5) * 0.12), 6, R), width: 10 + R() * 16, opacity: 0.25 + R() * 0.4 };
      },
    });
    el('path', { d: body, fill: kawung(g, '#ffd9c8', 62, 1.4), opacity: 0.2 }, g);
    el('path', { d: body, fill: linGrad(g, [[0, '#fff', 0.1], [0.3, '#fff', 0], [0.75, '#5e170f', 0], [1, '#5e170f', 0.28]], 0, 228, 0, 1132) }, g);

    // pilar kiri: sisipan krem
    el('path', { d: rrect(62, 330, 22, 740, 11), fill: CREAM[1], opacity: 0.85 }, g);
    el('path', { d: rrect(62, 330, 22, 740, 11), fill: 'none', stroke: GOLD.mid, 'stroke-width': 1.6, 'stroke-opacity': 0.8 }, g);
    for (let y = 356; y < 1060; y += 44) mark(g, 73, y, 0.4, CORAL.base, 0.75);

    // pintu: bagian dalam bilik
    const DX = 112, DY = 296, DW = 336, DH = 828;
    const door = `M${DX},${DY + DH}V${DY + 14}Q${DX},${DY} ${DX + 14},${DY}H${DX + DW - 14}Q${DX + DW},${DY} ${DX + DW},${DY + 14}V${DY + DH}Z`;
    const id = F.uid('d');
    el('path', { d: door }, el('clipPath', { id }, g));
    const inn = el('g', { 'clip-path': `url(#${id})` }, g);
    wash(inn, {
      x: DX, y: DY, w: DW, h: DH, R, n: 150, angle: 88, len: [0.2, 0.55], width: [14, 30], opacity: [0.3, 0.6],
      base: linGrad(g, [[0, '#41568a'], [0.5, '#27365c'], [1, '#141c33']], 0, DY, 0, DY + DH),
      color: (u, v) => mix('#41568a', '#121a30', Math.min(1, v * 0.95 + R() * 0.12)),
    });
    el('rect', { x: DX, y: DY, width: DW, height: 700, fill: kawung(g, '#9db3e2', 70, 1.4), opacity: 0.16 }, inn);
    // panel kamera di dinding belakang
    el('path', { d: rrect(196, 420, 168, 250, 14), fill: linGrad(g, [[0, '#f4e7c8'], [1, '#c8b58c']], 196, 420, 364, 670), opacity: 0.92 }, inn);
    el('path', { d: rrect(214, 498, 132, 104, 8), fill: '#182241' }, inn);
    el('path', { d: rrect(214, 498, 132, 104, 8), fill: linGrad(g, [[0, '#7fb0d8', 0.5], [0.5, '#7fb0d8', 0.05], [1, '#7fb0d8', 0]], 214, 498, 346, 602) }, inn);
    el('circle', { cx: 280, cy: 460, r: 20, fill: '#0b1020', stroke: '#d9dfe6', 'stroke-width': 5 }, inn);
    el('circle', { cx: 274, cy: 454, r: 5, fill: '#bcd6f5', opacity: 0.8 }, inn);
    el('circle', { cx: 280, cy: 636, r: 15, fill: CORAL.base, stroke: '#7a5212', 'stroke-width': 3 }, inn);
    // cahaya lampu hangat dari atas
    el('ellipse', { cx: DX + DW / 2, cy: DY + 30, rx: 230, ry: 300, fill: '#ffdca6', opacity: 0.36, filter: 'url(#softer)' }, inn);
    // lantai bilik + bangku bundar
    el('path', { d: `M${DX},1004H${DX + DW}V${DY + DH}H${DX}Z`, fill: linGrad(g, [[0, '#0d1326'], [1, '#1a2340']], 0, 1004, 0, DY + DH) }, inn);
    el('path', { d: `M${DX},1004H${DX + DW}`, stroke: '#5a70a4', 'stroke-width': 2, 'stroke-opacity': 0.5 }, inn);
    el('ellipse', { cx: 286, cy: 1078, rx: 96, ry: 16, fill: '#05070f', opacity: 0.6, filter: 'url(#soft)' }, inn);
    el('ellipse', { cx: 280, cy: 1068, rx: 60, ry: 13, fill: linGrad(g, CHROME_STOPS, 220, 1055, 340, 1081) }, inn);
    el('rect', { x: 271, y: 900, width: 18, height: 166, fill: linGrad(g, [[0, '#8fa0b2'], [0.35, '#ffffff'], [1, '#4a586a']], 271, 0, 289, 0) }, inn);
    el('path', { d: 'M198,890Q198,930 280,930Q362,930 362,890Z', fill: CORAL.dark }, inn);
    painted(inn, 'M198,888A82,22 0 1 1 362,888A82,22 0 1 1 198,888Z', {
      base: radGrad(g, [[0, CORAL.hi], [0.6, CORAL.base], [1, CORAL.mid]], 256, 880, 100), n: 22, R, filter: 'impastoFine',
      stroke: () => ({ d: `M${205 + R() * 150},${874 + R() * 28}l${20 + R() * 30},${(R() - 0.5) * 4}`, color: jitter(mix(CORAL.base, R() < 0.5 ? CORAL.hi : CORAL.mid, R() * 0.6), 5, R), width: 5 + R() * 6, opacity: 0.4 }),
    });
    el('circle', { cx: 280, cy: 888, r: 5, fill: CORAL.dark, opacity: 0.7 }, inn);
    // bayangan kusen ke dalam
    el('path', { d: door, fill: 'none', stroke: '#04060d', 'stroke-width': 46, 'stroke-opacity': 0.6, filter: 'url(#soft)' }, inn);
    // kusen krem berlis emas
    const tr = el('g', { filter: 'url(#cast)' }, g);
    el('path', { d: door, fill: 'none', stroke: CREAM[0], 'stroke-width': 15, 'stroke-linejoin': 'round' }, tr);
    el('path', { d: door, fill: 'none', stroke: CREAM[2], 'stroke-width': 9, 'stroke-linejoin': 'round' }, tr);
    el('path', { d: door, fill: 'none', stroke: GOLD.mid, 'stroke-width': 1.4, 'stroke-opacity': 0.9, transform: 'translate(0 0)' }, tr);
    // rel tirai kuningan
    gold(g, rrect(92, 302, 376, 13, 6.5), [92, 302, 376, 13], R, { n: 14, dir: [1, 0.05] });
    for (const x of [92, 468]) el('circle', { cx: x, cy: 308.5, r: 12, fill: radGrad(g, [[0, GOLD.hi], [0.6, GOLD.base], [1, GOLD.dark]], x - 4, 304, 15), filter: 'url(#cast)' }, g);

    // kolom kanan: etalase strip contoh
    const sx = 492, sy = 300;
    gold(g, rrect(sx, sy, 164, 336, 12), [sx, sy, 164, 336], R, { n: 36 });
    el('path', { d: rrect(sx + 9, sy + 9, 146, 318, 7), fill: linGrad(g, [[0, '#2a3b66'], [1, '#131b30']], 0, sy, 0, sy + 336) }, g);
    el('path', { d: rrect(sx + 9, sy + 9, 146, 318, 7), fill: 'none', stroke: '#05070f', 'stroke-width': 10, 'stroke-opacity': 0.5, filter: 'url(#blur2)' }, g);
    miniStrip(el('g', { transform: `translate(${sx + 100} ${sy + 172}) rotate(7)` }, g), R, 1, { s: 0.96 });
    miniStrip(el('g', { transform: `translate(${sx + 66} ${sy + 166}) rotate(-5)` }, g), R, 0, { s: 0.96 });
    el('path', { d: `M${sx + 20},${sy + 12}H${sx + 64}L${sx + 28},${sy + 190}H${sx + 12}Z`, fill: '#ffffff', opacity: 0.13 }, g);
    el('path', { d: `M${sx + 76},${sy + 12}H${sx + 90}L${sx + 54},${sy + 190}H${sx + 40}Z`, fill: '#ffffff', opacity: 0.08 }, g);

    // pelat koin
    const cx0 = 574;
    gold(g, rrect(520, 664, 108, 164, 14), [520, 664, 108, 164], R, { n: 34 });
    el('path', { d: rrect(528, 672, 92, 148, 9), fill: 'none', stroke: GOLD.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.55 }, g);
    mark(g, cx0, 700, 0.82, GOLD.dark, 0.75, GOLD.hi);
    el('path', { d: rrect(cx0 - 7, 722, 14, 58, 7), fill: '#1a0f08' }, g);
    el('path', { d: rrect(cx0 - 7, 722, 14, 58, 7), fill: 'none', stroke: GOLD.hi, 'stroke-width': 1.6, 'stroke-opacity': 0.85, transform: 'translate(1.6 1.6)' }, g);
    el('circle', { cx: cx0, cy: 800, r: 9.5, fill: radGrad(g, [[0, CORAL.hi], [0.6, CORAL.base], [1, CORAL.dark]], cx0 - 3, 797, 12), stroke: GOLD.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.7 }, g);
    for (const [x, y] of [[533, 677], [615, 677], [533, 815], [615, 815]]) el('circle', { cx: x, cy: y, r: 2.6, fill: GOLD.deep, opacity: 0.7 }, g);

    // celah keluarnya strip, panah kecil di atasnya, panel kawung di bawahnya
    for (let i = -1; i <= 1; i++) el('path', { d: `M${cx0 + i * 26 - 8},848l8,8l8,-8`, fill: 'none', stroke: CREAM[2], 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-opacity': 0.92 }, g);
    el('path', { d: rrect(498, 950, 152, 140, 12), fill: CORAL.dark, opacity: 0.5 }, g);
    el('path', { d: rrect(498, 950, 152, 140, 12), fill: kawung(g, '#ffd9c8', 38, 1.3), opacity: 0.4 }, g);
    el('path', { d: rrect(498, 950, 152, 140, 12), fill: 'none', stroke: '#5e170f', 'stroke-width': 6, 'stroke-opacity': 0.4, filter: 'url(#blur2)' }, g);
    gold(g, rrect(490, 870, 168, 62, 12), [490, 870, 168, 62], R, { n: 26 });
    el('path', { d: rrect(504, 890, 140, 22, 8), fill: '#140c08' }, g);
    el('path', { d: 'M510,913H638', stroke: GOLD.hi, 'stroke-width': 2, 'stroke-opacity': 0.9, 'stroke-linecap': 'round' }, g);

    // tenda bergaris di bawah papan nama
    const aw = el('g', { filter: 'url(#castBig)' }, g);
    const n = 8, x0 = 22, sw = (BW - 44) / n;
    for (let k = 0; k < n; k++) {
      const a = x0 + k * sw, b = a + sw, m = (a + b) / 2;
      shape(aw, `M${a},204H${b}V266Q${m},308 ${a},266Z`, [a, 204, sw, 92], k % 2 ? CREAM : [CORAL.dark, CORAL.mid, CORAL.base], R, { n: 16, dir: [0.04, 1], width: [8, 16], filter: 'impasto' });
      el('path', { d: `M${a},266Q${m},308 ${b},266`, fill: 'none', stroke: GOLD.base, 'stroke-width': 3 }, aw);
    }
    shape(g, rrect(16, 190, 688, 28, 9), [16, 190, 688, 28], [NAVY.dark, NAVY.mid, NAVY.base], R, { n: 30, dir: [1, 0], width: [6, 14], cast: 'cast' });
    el('path', { d: 'M24,196H696', stroke: GOLD.light, 'stroke-width': 2.2, 'stroke-opacity': 0.85 }, g);

    // papan nama: bingkai emas, enamel biru tua, kotak lampu krem
    el('rect', { x: 84, y: 46, width: 572, height: 166, rx: 26, fill: '#141c30', opacity: 0.4, filter: 'url(#softer)' }, g);
    gold(g, 'M262,32Q264,2 360,2Q456,2 458,32Z', [262, 2, 196, 30], R, { n: 20, cast: 'castBig' });
    el('path', { d: 'M282,30Q284,14 360,14Q436,14 438,30Z', fill: CORAL.mid, stroke: GOLD.deep, 'stroke-width': 1.2, 'stroke-opacity': 0.6 }, g);
    gold(g, rrect(70, 26, 580, 174, 26), [70, 26, 580, 174], R, { n: 50, cast: 'castBig' });
    shape(g, rrect(78, 34, 564, 158, 20), [78, 34, 564, 158], [NAVY.dark, NAVY.mid, NAVY.light], R, { n: 80, dir: [1, 0.2], width: [8, 20] });
    el('path', { d: rrect(78, 34, 564, 158, 20), fill: linGrad(g, [[0, '#fff', 0.14], [0.4, '#fff', 0], [1, '#05070f', 0.35]], 0, 34, 0, 192) }, g);
    gold(g, rrect(104, 62, 512, 110, 14), [104, 62, 512, 110], R, { n: 26, cast: 'cast' });
    const box = rrect(110, 68, 500, 98, 10);
    el('path', { d: box, fill: radGrad(g, [[0, '#fffdf2'], [0.7, '#fff3cf'], [1, '#f1d594']], 360, 117, 300) }, g);
    el('path', { d: box, fill: 'none', stroke: '#8a5a1a', 'stroke-width': 2.2, 'stroke-opacity': 0.6 }, g);
    const idb = F.uid('m');
    el('path', { d: box }, el('clipPath', { id: idb }, g));
    el('path', { d: rrect(116, 76, 512, 110, 12), fill: 'none', stroke: '#6b3a10', 'stroke-width': 13, 'stroke-opacity': 0.2, filter: 'url(#soft)' }, el('g', { 'clip-path': `url(#${idb})` }, g));
    bulbSpots().forEach(([x, y], i) => {
      el('circle', { cx: x, cy: y, r: 8.5, fill: NAVY.deep, opacity: 0.75 }, g);
      if (!lit) return;
      el('circle', { cx: x, cy: y, r: 20, fill: '#ffd98a', opacity: i % 2 ? 0.3 : 0.55, filter: 'url(#soft)' }, g);
      el('circle', { cx: x, cy: y, r: 7, fill: i % 2 ? '#ffe9b0' : '#fffbe6' }, g);
    });
  }

  /* ───────────── koin ───────────── */
  function coin(g, R) {
    gold(g, circ(0, 0, 62), [-62, -62, 124, 124], R, { n: 30, cast: 'castBig' });
    el('circle', { r: 50, fill: 'none', stroke: GOLD.dark, 'stroke-width': 2.4, 'stroke-opacity': 0.7 }, g);
    el('circle', { r: 49, fill: radGrad(g, [[0, GOLD.hi, 0.7], [0.7, GOLD.light, 0.2], [1, GOLD.mid, 0.3]], -16, -18, 70) }, g);
    for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; el('path', { d: `M${Math.cos(a) * 54},${Math.sin(a) * 54}L${Math.cos(a) * 60},${Math.sin(a) * 60}`, stroke: GOLD.deep, 'stroke-width': 1.6, 'stroke-opacity': 0.5 }, g); }
    mark(g, 1.5, 4.5, 2.1, GOLD.dark, 0.55, GOLD.mid);
    mark(g, 0, 3, 2.1, GOLD.mid, 1, GOLD.hi);
    el('path', { d: 'M-44,-22A50,50 0 0 1 -6,-49', fill: 'none', stroke: '#fffbe6', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-opacity': 0.85 }, g);
  }

  /* ───────────── bagian dalam bilik ───────────── */
  const IW = 780, IH = 1400;
  function inside(svg, R) {
    const tone = [[0, '#fcf2da'], [0.6, '#f4e4c2'], [1, '#e6d0a4']];
    wash(svg, { x: -30, y: -30, w: IW + 60, h: IH + 60, R, n: 360, angle: 90, len: [0.1, 0.3], width: [24, 56], opacity: [0.2, 0.5], base: linGrad(svg, tone, 0, 0, 0, IH), color: (u, v) => ramp(tone, v + (R() - 0.5) * 0.24) });
    el('rect', { x: 0, y: 0, width: IW, height: IH, fill: kawung(svg, '#e59a82', 96, 1.9), opacity: 0.26 }, svg);
    el('rect', { x: 0, y: 0, width: IW, height: IH, fill: kawung(svg, '#ffffff', 96, 1.9), opacity: 0.5, transform: 'translate(-2 -2.4)' }, svg);
    // lis bawah koral dengan rel kuningan
    const WY = 1090;
    const ct = [[0, CORAL.light], [1, CORAL.mid]];
    wash(svg, { x: -30, y: WY, w: IW + 60, h: IH - WY + 30, R, n: 140, angle: 90, len: [0.05, 0.14], width: [18, 36], opacity: [0.25, 0.5], base: linGrad(svg, ct, 0, WY, 0, IH), color: (u, v) => mix(ramp(ct, v), CORAL.hi, R() * 0.25) });
    el('rect', { x: 0, y: WY, width: IW, height: IH - WY, fill: kawung(svg, '#ffd9c8', 70, 1.5), opacity: 0.22 }, svg);
    el('path', { d: `M-20,${WY + 22}H${IW + 20}`, stroke: '#5e170f', 'stroke-width': 24, 'stroke-opacity': 0.3, filter: 'url(#soft)' }, svg);
    gold(svg, `M-20,${WY - 10}H${IW + 20}V${WY + 12}H-20Z`, [0, WY - 10, IW, 22], R, { n: 30, dir: [1, 0.04] });
    // lambrekin biru tua bergerigi di atas
    const top = el('g', { filter: 'url(#castBig)' }, svg);
    for (let k = 0; k < 6; k++) {
      const a = k * 130, b = a + 130, m = a + 65;
      shape(top, `M${a},-10H${b}V74Q${m},128 ${a},74Z`, [a, 0, 130, 120], [NAVY.dark, NAVY.mid, NAVY.light], R, { n: 20, dir: [0.05, 1], width: [10, 20], filter: 'impasto' });
      el('path', { d: `M${a},74Q${m},128 ${b},74`, fill: 'none', stroke: GOLD.light, 'stroke-width': 3.4 }, top);
      mark(top, m, 52, 0.9, GOLD.light, 0.9);
    }
    // tepi tirai di kiri (kita sedang di dalam bilik) + bayangannya
    const cst = [[0, NAVY.deep], [0.3, NAVY.mid], [0.55, NAVY.light], [0.75, NAVY.mid], [1, NAVY.deep]];
    const cd = `M-20,-10H96C116,300 82,640 104,980S90,1300 100,${IH + 10}H-20Z`;
    painted(svg, cd, { base: linGrad(svg, cst, -20, 0, 110, 0), n: 90, R, filter: 'impasto', cast: 'castBig', stroke: () => { const x = -20 + R() * 130, y = R() * IH, L = 120 + R() * 260; return { d: `M${x},${y}q${(R() - 0.5) * 10},${L / 2} ${(R() - 0.5) * 8},${L}`, color: jitter(ramp(cst, (x + 20) / 130), 5, R), width: 8 + R() * 12, opacity: 0.3 + R() * 0.4 }; } });
    el('rect', { x: 0, y: 0, width: IW, height: IH, fill: linGrad(svg, [[0, '#3a1d12', 0.3], [0.22, '#3a1d12', 0], [0.82, '#3a1d12', 0], [1, '#3a1d12', 0.26]], 60, 0, IW, 0) }, svg);
    // lampu hangat dari atas, sudut-sudut meredup
    el('rect', { x: 0, y: 0, width: IW, height: IH, fill: radGrad(svg, [[0, '#fff6dc', 0.5], [0.5, '#fff6dc', 0.1], [1, '#fff6dc', 0]], IW / 2, 260, 620) }, svg);
    el('rect', { x: 0, y: 0, width: IW, height: IH, fill: radGrad(svg, [[0, '#3a1d12', 0], [0.62, '#3a1d12', 0], [1, '#3a1d12', 0.34]], IW / 2, IH * 0.46, IH * 0.74) }, svg);
  }

  /** rumah lensa: pelat biru tua, lensa di tengah, dua lampu kilat di kiri-kanan */
  const LW = 640, LH = 220;
  function lensUnit(g, R) {
    shape(g, rrect(20, 22, 600, 170, 46), [20, 22, 600, 170], [NAVY.dark, NAVY.mid, NAVY.light], R, { n: 70, dir: [1, 0.15], width: [10, 22], cast: 'castBig' });
    el('path', { d: rrect(20, 22, 600, 170, 46), fill: linGrad(g, [[0, '#fff', 0.16], [0.4, '#fff', 0], [1, '#05070f', 0.35]], 0, 22, 0, 192) }, g);
    el('path', { d: rrect(29, 31, 582, 152, 38), fill: 'none', stroke: GOLD.light, 'stroke-width': 2.4, 'stroke-opacity': 0.85 }, g);
    for (const x of [122, 518]) {
      metal(g, circ(x, 107, 52), [x - 52, 55, 104, 104], R, { n: 16, stops: CHROME_STOPS });
      el('circle', { cx: x, cy: 107, r: 41, fill: radGrad(g, [[0, '#fffef6'], [0.55, '#f6e9c6'], [1, '#bfa46a']], x - 12, 93, 56) }, g);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; el('path', { d: `M${x + Math.cos(a) * 12},${107 + Math.sin(a) * 12}L${x + Math.cos(a) * 39},${107 + Math.sin(a) * 39}`, stroke: '#a88a4c', 'stroke-width': 1.5, 'stroke-opacity': 0.35 }, g); }
      el('circle', { cx: x, cy: 107, r: 11, fill: '#fffdf0', opacity: 0.9 }, g);
      el('path', { d: `M${x - 30},${92}A34,34 0 0 1 ${x - 6},${74}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-opacity': 0.8 }, g);
    }
    // lensa
    metal(g, circ(320, 107, 80), [240, 27, 160, 160], R, { n: 26, stops: CHROME_STOPS, cast: 'castBig' });
    el('circle', { cx: 320, cy: 107, r: 66, fill: '#0c111f' }, g);
    el('circle', { cx: 320, cy: 107, r: 60, fill: radGrad(g, [[0, '#3e5a94'], [0.45, '#1b2748'], [1, '#070a14']], 302, 88, 78) }, g);
    for (const [r, o] of [[50, 0.5], [38, 0.4], [24, 0.5]]) el('circle', { cx: 320, cy: 107, r, fill: 'none', stroke: '#8fb0e6', 'stroke-width': 1.6, 'stroke-opacity': o }, g);
    el('circle', { cx: 320, cy: 107, r: 17, fill: radGrad(g, [[0, '#26386b'], [1, '#04060d']], 316, 102, 20) }, g);
    el('path', { d: 'M282,76A50,50 0 0 1 326,57', fill: 'none', stroke: '#ffffff', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-opacity': 0.75 }, g);
    el('ellipse', { cx: 342, cy: 132, rx: 12, ry: 7, fill: '#9fd0ff', opacity: 0.4, transform: 'rotate(-35 342 132)' }, g);
    el('circle', { cx: 300, cy: 92, r: 5, fill: '#ffffff', opacity: 0.85 }, g);
    for (const x of [214, 426]) mark(g, x, 110, 0.75, GOLD.light, 0.85);
  }

  /** konsol tombol: pelat biru tua berlis kuningan dengan dudukan tombol di tengah */
  const KW = 600, KH = 300;
  function consolePlate(g, R) {
    shape(g, rrect(20, 34, 560, 232, 40), [20, 34, 560, 232], [NAVY.dark, NAVY.mid, NAVY.light], R, { n: 70, dir: [1, 0.15], width: [10, 22], cast: 'castBig' });
    el('path', { d: rrect(20, 34, 560, 232, 40), fill: linGrad(g, [[0, '#fff', 0.16], [0.4, '#fff', 0], [1, '#05070f', 0.35]], 0, 34, 0, 266) }, g);
    el('path', { d: rrect(30, 44, 540, 212, 32), fill: 'none', stroke: GOLD.light, 'stroke-width': 2.4, 'stroke-opacity': 0.85 }, g);
    el('path', { d: rrect(20, 34, 560, 232, 40), fill: kawung(g, '#9db3e2', 52, 1.2), opacity: 0.14 }, g);
    metal(g, circ(300, 150, 124), [176, 26, 248, 248], R, { n: 34, cast: 'castBig' });
    el('circle', { cx: 300, cy: 150, r: 104, fill: radGrad(g, [[0, '#2a1608'], [0.8, '#140a04'], [1, '#4a300a']], 300, 150, 106) }, g);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) el('path', { d: `M${300 + s * (236 - i * 24)},132l${-s * 12},18l${s * 12},18`, fill: 'none', stroke: i === 2 ? CREAM[2] : GOLD.light, 'stroke-width': 4.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-opacity': 0.5 + i * 0.22 }, g);
    }
  }
  /** tombol rana: kubah merah mengilap; (0,0) = tengah */
  function shutter(g, R) {
    el('ellipse', { cx: 3, cy: 9, rx: 96, ry: 94, fill: '#140a04', opacity: 0.55, filter: 'url(#soft)' }, g);
    const st = [[0, '#ffc2ae'], [0.25, CORAL.hi], [0.55, CORAL.base], [0.85, CORAL.mid], [1, CORAL.dark]];
    painted(g, circ(0, 0, 92), {
      base: radGrad(g, st, -30, -34, 140), n: 60, R, filter: 'impastoFine',
      stroke: () => {
        const a = R() * Math.PI * 2, r = 20 + R() * 66, da = 0.25 + R() * 0.4;
        const t = Math.hypot(Math.cos(a) * r + 30, Math.sin(a) * r + 34) / 140;
        return { d: `M${Math.cos(a) * r},${Math.sin(a) * r}A${r},${r} 0 0 1 ${Math.cos(a + da) * r},${Math.sin(a + da) * r}`, color: jitter(ramp(st, t + (R() - 0.5) * 0.1), 5, R), width: 6 + R() * 8, opacity: 0.3 + R() * 0.3 };
      },
    });
    el('circle', { r: 92, fill: 'none', stroke: CORAL.deep, 'stroke-width': 5, 'stroke-opacity': 0.45 }, g);
    el('circle', { r: 86, fill: 'none', stroke: '#ffd2c2', 'stroke-width': 1.6, 'stroke-opacity': 0.5 }, g);
    mark(g, 0, 4, 2.3, '#ffb7a2', 0.5, '#ffd9cc');
    el('ellipse', { cx: -30, cy: -44, rx: 40, ry: 20, fill: '#ffffff', opacity: 0.5, filter: 'url(#blur2)', transform: 'rotate(-30 -30 -44)' }, g);
    el('ellipse', { cx: -42, cy: -50, rx: 13, ry: 6, fill: '#ffffff', opacity: 0.85, transform: 'rotate(-30 -42 -50)' }, g);
    el('path', { d: 'M-54,66A86,86 0 0 0 66,54', fill: 'none', stroke: '#ffb7a2', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-opacity': 0.4, filter: 'url(#blur2)' }, g);
  }

  /* ───────────── stiker (tepi putih, sedikit mengilap) ───────────── */
  function sticker(g, R, d, cols, box) {
    const b = el('g', { filter: 'url(#cast)' }, g);
    el('path', { d, fill: '#fffdf8', stroke: '#fffdf8', 'stroke-width': 17, 'stroke-linejoin': 'round' }, b);
    shape(g, d, box, cols, R, { n: 26, dir: [0.4, 1], width: [7, 14] });
    el('path', { d, fill: linGrad(g, [[0, '#fff', 0.5], [0.45, '#fff', 0], [1, '#3a1d12', 0.16]], box[0], box[1], box[0] + box[2], box[1] + box[3]) }, g);
  }
  function starPath(r1, r2) {
    let d = '';
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? r2 : r1; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }
    return d + 'Z';
  }
  const stickers = {
    hati(g, R) {
      const s = el('g', { transform: 'translate(0 6) scale(1.05)' }, g);
      sticker(s, R, HEART, [CORAL.mid, CORAL.base, CORAL.hi], [-50, -50, 100, 80]);
      el('ellipse', { cx: -20, cy: -22, rx: 9, ry: 5, fill: '#fff', opacity: 0.7, transform: 'rotate(-35 -20 -22)' }, s);
    },
    bintang(g, R) {
      sticker(g, R, starPath(52, 25), ['#e0a02a', '#f7c948', '#ffe89a'], [-52, -52, 104, 104]);
      el('ellipse', { cx: -9, cy: -17, rx: 8, ry: 4, fill: '#fff', opacity: 0.7, transform: 'rotate(-35 -9 -17)' }, g);
    },
    bunga(g, R) {
      el('circle', { r: 56, fill: '#fffdf8', filter: 'url(#cast)' }, g);
      F.flora.flowers.kambojaPink(g, R, 0.36);
    },
  };

  /* ───────────── mini-game: tangan iseng & bingkai foto ───────────── */
  /** sarung tangan kartun yang mengacungkan dua jari (tanduk kelinci). Wajahnya digambar dari DOM. */
  function hand(g, R) {
    const C = ['#e2d2b4', '#fff6e4', '#ffffff'];
    const part = (d, box, n = 16, cast = 'cast') => shape(g, d, box, C, R, { n, dir: [0.15, 1], width: [8, 16], cast });
    // dua jari "telinga"
    for (const [x, rot] of [[96, -14], [144, 14]]) {
      const f = el('g', { transform: `translate(${x} 196) rotate(${rot})` }, g);
      shape(f, rrect(-23, -176, 46, 190, 23), [-23, -176, 46, 190], C, R, { n: 18, dir: [0.1, 1], width: [8, 16], cast: 'cast' });
      el('path', { d: 'M-12,-150V-70', stroke: '#ffffff', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-opacity': 0.8 }, f);
    }
    // jempol
    const th = el('g', { transform: 'translate(62 226) rotate(-32)' }, g);
    shape(th, rrect(-21, -44, 42, 76, 21), [-21, -44, 42, 76], C, R, { n: 10, dir: [0.1, 1], width: [8, 14], cast: 'cast' });
    // telapak
    part(rrect(60, 160, 124, 122, 44), [60, 160, 124, 122], 26, 'castBig');
    // dua jari yang ditekuk
    part(circ(170, 192, 25), [145, 167, 50, 50], 8);
    part(circ(180, 228, 23), [157, 205, 46, 46], 8);
    el('path', { d: rrect(60, 160, 124, 122, 44), fill: linGrad(g, [[0, '#fff', 0.2], [0.5, '#fff', 0], [1, '#8a6a45', 0.22]], 60, 160, 184, 282) }, g);
    // manset koral berlis krem
    shape(g, rrect(54, 268, 136, 62, 16), [54, 268, 136, 62], [CORAL.mid, CORAL.base, CORAL.hi], R, { n: 20, dir: [1, 0.1], width: [8, 14], cast: 'cast' });
    el('path', { d: 'M62,282H182', stroke: CREAM[2], 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-opacity': 0.9 }, g);
    mark(g, 122, 308, 0.7, CREAM[2], 0.9, GOLD.light);
  }
  /** bingkai foto berisi sepasang kamboja yang sedang berpose */
  function frame(g, R) {
    gold(g, rrect(16, 16, 328, 372, 12), [16, 16, 328, 372], R, { n: 60, cast: 'castBig' });
    el('path', { d: rrect(26, 26, 308, 352, 8), fill: 'none', stroke: GOLD.deep, 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, g);
    shape(g, rrect(40, 40, 280, 324, 4), [40, 40, 280, 324], CREAM, R, { n: 40, dir: [1, 0.05], width: [10, 20] });
    const pic = rrect(62, 62, 236, 250, 3);
    const id = F.uid('p');
    el('path', { d: pic }, el('clipPath', { id }, g));
    const inn = el('g', { 'clip-path': `url(#${id})` }, g);
    wash(inn, { x: 62, y: 62, w: 236, h: 250, R, n: 70, angle: 0, len: [0.3, 0.7], width: [12, 26], opacity: [0.3, 0.6], base: linGrad(g, [[0, '#bfe0ee'], [1, '#e9f4ee']], 0, 62, 0, 312), color: (u, v) => mix('#bfe0ee', '#f4f8ea', v) });
    F.flora.fern(el('g', { transform: 'translate(96 330) rotate(-14) scale(0.42)' }, inn), R, { len: 300, bend: 50 });
    F.flora.fern(el('g', { transform: 'translate(270 334) rotate(22) scale(0.4)' }, inn), R, { len: 280, bend: -50 });
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(140 196) rotate(10)' }, inn), R, 0.33);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(222 212) rotate(-16)' }, inn), R, 0.29);
    el('path', { d: HEART, fill: CORAL.base, transform: 'translate(184 116) scale(0.3) rotate(8)' }, inn);
    el('path', { d: pic, fill: 'none', stroke: '#3a1d12', 'stroke-width': 8, 'stroke-opacity': 0.22, filter: 'url(#blur2)' }, inn);
    el('path', { d: 'M150,340H210', stroke: '#b9975c', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-opacity': 0.6 }, g);
  }

  /* ───────────── sprite ───────────── */
  const scaled = (name, w, h, seed, draw, k = 0.5) => { F.sprites[name] = { w: w * k, h: h * k, viewBox: `0 0 ${w} ${h}`, seed, draw }; };

  // latar dirender 0.75× (1170×2250): lukisannya lembut, jadi berkasnya bisa jauh lebih ringan
  scaled('bg-photobox', W, H, 631, (svg, R) => wall(svg, R), 0.7);
  scaled('photobox-bendera', W, 200, 648, (svg, R) => bunting(svg, R));
  scaled('photobox-bilik', BW, BH, 632, (svg, R) => booth(svg, R));
  scaled('photobox-tirai', TW + 44, TH + 30, 633, (svg, R) => curtain(svg, R));
  scaled('photobox-koin', 160, 160, 634, (svg, R) => coin(el('g', { transform: 'translate(76 74)' }, svg), R), 0.6);
  scaled('photobox-dalam', IW, IH, 635, (svg, R) => inside(svg, R), 0.35);
  scaled('photobox-lensa', LW, LH, 636, (svg, R) => lensUnit(svg, R));
  scaled('photobox-konsol', KW, KH, 637, (svg, R) => consolePlate(svg, R));
  scaled('photobox-tombol', 220, 220, 638, (svg, R) => shutter(el('g', { transform: 'translate(108 106)' }, svg), R), 0.7);
  Object.keys(stickers).forEach((k, i) => scaled(`photobox-stiker-${k}`, 150, 150, 640 + i, (svg, R) => stickers[k](el('g', { transform: 'translate(73 72)' }, svg), R), 0.6));
  scaled('game-photobox-tangan', 240, 340, 645, (svg, R) => hand(svg, R), 0.7);
  scaled('game-photobox-bingkai', 360, 410, 646, (svg, R) => frame(svg, R), 0.7);

  F.sprites['cover-photobox'] = { w: 480, h: 600, seed: 647, draw(svg, R) {
    wall(el('g', { transform: 'translate(-12 -276) scale(0.646)' }, svg), R);
    const b = el('g', { transform: 'translate(34 56) scale(0.44)' }, svg);
    booth(b, R, { lit: true });
    // hati di kotak lampu (pengganti tulisan)
    for (const [x, s] of [[300, 0.5], [360, 0.72], [420, 0.5]]) el('path', { d: HEART, fill: CORAL.base, transform: `translate(${x} 122) scale(${s})` }, b);
    // tirai tersibak separuh
    curtain(el('g', { transform: 'translate(98 300) scale(0.52 1)' }, b), R);
    // strip yang baru keluar, bersandar di depan
    const st = el('g', { transform: 'translate(372 392) rotate(9)' }, svg);
    el('path', { d: rrect(-52, -176, 104, 352, 5), fill: '#3a1d12', opacity: 0.3, filter: 'url(#soft)', transform: 'translate(8 12)' }, st);
    el('path', { d: rrect(-52, -176, 104, 352, 5), fill: linGrad(svg, [[0, '#fffdf6'], [1, '#efe4cb']], -52, -176, 52, 176) }, st);
    const fl = [F.flora.flowers.kambojaPink, F.flora.flowers.kamboja, F.flora.flowers.kambojaPink, F.flora.flowers.kamboja];
    for (let i = 0; i < 4; i++) {
      const y = -166 + i * 78;
      el('rect', { x: -43, y, width: 86, height: 68, fill: PASTEL[i] }, st);
      el('rect', { x: -43, y, width: 86, height: 68, fill: linGrad(svg, [[0, '#fff', 0.35], [1, '#3a1d12', 0.14]], -43, y, 43, y + 68) }, st);
      if (i === 2) { el('path', { d: HEART, fill: CORAL.base, transform: `translate(-14 ${y + 36}) scale(0.34)` }, st); el('path', { d: HEART, fill: CORAL.light, transform: `translate(16 ${y + 32}) scale(0.26) rotate(12)` }, st); }
      else fl[i](el('g', { transform: `translate(${i % 2 ? 6 : -4} ${y + 35}) rotate(${i * 40})` }, st), R, 0.15);
    }
    el('path', { d: 'M-26,156H26', stroke: '#b9975c', 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-opacity': 0.6 }, st);
    stickers.bintang(el('g', { transform: 'translate(40 -92) rotate(14) scale(0.4)' }, st), R);
    stickers.hati(el('g', { transform: 'translate(-44 62) rotate(-16) scale(0.4)' }, st), R);
    coin(el('g', { transform: 'translate(92 548) rotate(-12) scale(0.36)' }, svg), R);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(40 534) rotate(30)' }, svg), R, 0.2);
  } };
})();
