/* Film Kita: bioskop kecil berdua — dinding beludru marun, papan nama berlampu (lampunya dari DOM),
   tirai beludru berbordir kawung emas, lambrekin, tali penarik, tiket yang bisa disobek, deret kursi,
   dua penonton (sprite sendiri supaya bisa saling bersandar), dan popcorn untuk mini-game.
   Semua tulisan dipasang dari DOM di atas lukisan ini. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, mix, jitter, ramp, linGrad, radGrad } = F;
  const W = 780, H = 1500;
  const RED = { hi: '#d94a5f', light: '#b4263d', base: '#8c172b', mid: '#651020', dark: '#400915', deep: '#200409' };
  const GOLD = { hi: '#fff3c4', light: '#f6d77c', base: '#e0aa3e', mid: '#b47f22', dark: '#7a5212', deep: '#4a300a' };
  const CREAM = ['#e9d6ad', '#fbf1d8', '#fffaf0'];

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const circ = (cx, cy, r) => `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}Z`;

  /** bidang bebas dilukis dengan sapuan searah `dir` di dalam kotak pembatas; cols = [gelap, dasar, terang] */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90] } = {}) => painted(g, d, {
    base: cols[1], n, R, filter, cast,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.35 + R() * 0.45 };
    },
  });

  /** logam emas dipoles: gradien diagonal (terang di kiri-atas) + sapuan halus */
  const GOLD_STOPS = [[0, GOLD.light], [0.18, GOLD.hi], [0.4, GOLD.light], [0.62, GOLD.base], [0.85, GOLD.mid], [1, GOLD.dark]];
  function gold(g, d, box, R, { n = 40, cast = 'cast', dir = [0.3, 1] } = {}) {
    const [x, y, w, h] = box;
    return painted(g, d, {
      base: linGrad(g, GOLD_STOPS, x, y, x + w, y + h), n, R, filter: 'impastoFine', cast,
      stroke: () => {
        const u = R(), v = R(), L = Math.max(w, h) * (0.1 + R() * 0.22), m = Math.hypot(dir[0], dir[1]);
        return { d: `M${x + u * w},${y + v * h}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(ramp(GOLD_STOPS, (u + v) / 2 + (R() - 0.5) * 0.08), 4, R), width: 3 + R() * 6, opacity: 0.18 + R() * 0.22 };
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

  /** batas lipatan beludru yang lebarnya tidak seragam: [awal, akhir] dalam 0..1 */
  function foldEdges(n, R) {
    const ws = Array.from({ length: n }, () => 0.7 + R() * 0.6);
    const sum = ws.reduce((p, c) => p + c, 0);
    const out = [];
    let a = 0;
    for (const v of ws) { out.push([a, a + v / sum]); a += v / sum; }
    out[out.length - 1][1] = 1;
    return out;
  }
  /** stop gradien tiap lipatan: lembah gelap, punggung lipatan terang di sisi kiri (arah cahaya), teduh di kanan */
  function foldStops(edges) {
    const st = [];
    for (const [a, b] of edges) {
      const w = b - a;
      st.push([a, RED.deep], [a + w * 0.1, RED.dark], [a + w * 0.24, RED.mid], [a + w * 0.36, RED.base], [a + w * 0.44, RED.light], [a + w * 0.48, mix(RED.light, RED.hi, 0.55)], [a + w * 0.54, RED.light], [a + w * 0.64, RED.base], [a + w * 0.8, RED.mid], [a + w * 0.93, RED.dark]);
    }
    st.push([1, RED.deep]);
    return st;
  }

  /* ───────────── dinding teater + lantai panggung ───────────── */
  function wall(svg, R) {
    const FLOOR = H - 330;
    const tone = [[0, '#6a1426'], [0.45, '#48101c'], [0.8, '#2e0a13'], [1, '#1c060b']];
    wash(svg, {
      x: -40, y: -30, w: W + 80, h: FLOOR + 60, R, n: 520, angle: 88, len: [0.08, 0.2], width: [26, 64], opacity: [0.25, 0.6],
      base: radGrad(svg, tone, W * 0.5, H * 0.3, H * 0.7),
      color: (u, v) => ramp(tone, Math.hypot(u - 0.5, (v - 0.36) * 1.3) * 1.5),
    });
    // kertas dinding: kawung timbul, nada di atas nada
    el('rect', { x: 0, y: 0, width: W, height: FLOOR, fill: kawung(svg, '#b4455c', 86, 1.6), opacity: 0.14 }, svg);
    el('rect', { x: 0, y: 0, width: W, height: FLOOR, fill: kawung(svg, '#0d0204', 86, 1.6), opacity: 0.2, transform: 'translate(1.8 2.2)' }, svg);
    // cahaya layar yang memantul hangat ke dinding
    el('rect', { x: 0, y: 0, width: W, height: FLOOR, fill: radGrad(svg, [[0, '#ffdca0', 0.2], [0.5, '#ffdca0', 0.06], [1, '#ffdca0', 0]], W * 0.5, H * 0.34, 640) }, svg);
    // lantai panggung: papan kayu gelap, bibir depannya kena cahaya
    wash(svg, { x: -40, y: FLOOR, w: W + 80, h: H - FLOOR + 30, R, n: 260, angle: 0, len: [0.25, 0.8], width: [5, 16], opacity: [0.3, 0.7], base: linGrad(svg, [[0, '#4a2317'], [1, '#22100b']], 0, FLOOR, 0, H), filter: 'canvas', color: (u, v) => mix(mix('#5a2c1c', '#2a140d', v), '#7a3d24', R() * 0.25) });
    el('path', { d: `M-20,${FLOOR - 14}H${W + 20}`, stroke: '#0d0204', 'stroke-width': 36, 'stroke-opacity': 0.4, filter: 'url(#soft)' }, svg);
    el('path', { d: `M-20,${FLOOR + 3}H${W + 20}`, stroke: '#e9b46c', 'stroke-width': 5, 'stroke-opacity': 0.7, filter: 'url(#blur2)' }, svg);
    // lampu kaki panggung
    for (let i = 0; i < 5; i++) el('ellipse', { cx: 90 + i * 150, cy: FLOOR + 30, rx: 86, ry: 30, fill: '#ffcf82', opacity: 0.14, filter: 'url(#softer)' }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#000', 0], [0.55, '#000', 0], [1, '#0a0103', 0.7]], W / 2, H * 0.42, H * 0.74) }, svg);
  }

  /* ───────────── tirai: satu sayap; edge = sisi tepi dalamnya (yang bertemu di tengah panggung) ───────────── */
  const TW = 420, TH = 1100;
  function curtain(g, R, { w = TW, h = TH, folds = 6, edge = 'right' } = {}) {
    const E = foldEdges(folds, R);
    const stops = foldStops(E);
    // kelim bawah bergelombang mengikuti lipatan: punggung lipatan menggantung sedikit lebih rendah
    const hem = (x) => {
      const u = Math.max(0, Math.min(0.9999, x / w));
      const f = E.find(([a, b]) => u >= a && u < b) || E[E.length - 1];
      return h - 50 + 10 * Math.sin(Math.PI * ((u - f[0]) / (f[1] - f[0])));
    };
    const xs = [];
    for (let x = 0; x <= w; x += 6) xs.push(x);
    const hemLine = (list) => list.map((x) => `L${x},${hem(x).toFixed(1)}`).join('');
    const d = edge === 'right'
      ? `M0,0H${w - 8}C${w + 6},${h * 0.24} ${w - 18},${h * 0.5} ${w - 2},${h * 0.76}S${w - 12},${h - 110} ${w - 6},${hem(w - 6).toFixed(1)}${hemLine(xs.filter((x) => x < w - 6).reverse())}Z`
      : `M${w},0H8C-6,${h * 0.24} 18,${h * 0.5} 2,${h * 0.76}S12,${h - 110} 6,${hem(6).toFixed(1)}${hemLine(xs.filter((x) => x > 6))}Z`;
    const p = painted(g, d, {
      base: linGrad(g, stops, 0, 0, w, 0), n: 360, R, filter: 'impasto', cast: 'castBig',
      stroke: () => {
        const x = R() * w, y = R() * h - 80, L = 130 + R() * 320;
        return { d: `M${x},${y}q${(R() - 0.5) * 12},${L / 2} ${(R() - 0.5) * 9},${L}`, color: jitter(ramp(stops, x / w + (R() - 0.5) * 0.018), 5, R), width: 7 + R() * 13, opacity: 0.28 + R() * 0.4 };
      },
    });
    const ov = p.inner;
    // kilap beludru: pita cahaya lebar yang sangat lembut
    for (const [y, o] of [[h * 0.2, 0.07], [h * 0.47, 0.05], [h * 0.72, 0.04]]) el('ellipse', { cx: w * 0.42, cy: y, rx: w * 0.7, ry: 70, fill: '#ff9aa8', opacity: o, filter: 'url(#softer)' }, ov);
    // bordir kawung emas di atas kelim (ikut naik-turun mengikuti lipatan lewat bayangan di atasnya)
    const by = h - 168, bh = 56;
    const band = el('g', { transform: `translate(0 ${by})`, opacity: 0.92 }, ov);
    el('rect', { x: -10, y: 0, width: w + 20, height: bh, fill: RED.dark, opacity: 0.55 }, band);
    el('rect', { x: -10, y: 0, width: w + 20, height: bh, fill: kawung(g, GOLD.light, bh, 2.2) }, band);
    for (const [y, c, sw] of [[-5, GOLD.base, 4], [bh + 5, GOLD.base, 4], [-11, GOLD.mid, 1.6], [bh + 11, GOLD.mid, 1.6]]) el('path', { d: `M-10,${y}H${w + 10}`, stroke: c, 'stroke-width': sw }, band);
    // garis lipatan: teduh di lembah, kilau tipis di punggung lipatan (juga menimpa bordir, jadi bordirnya ikut berlipat)
    E.forEach(([a, b], k) => {
      const x = a * w, fw = (b - a) * w;
      if (k > 0) {
        el('path', { d: `M${x},0C${x + 9},${h * 0.3} ${x - 9},${h * 0.62} ${x + 3},${h - 40}`, fill: 'none', stroke: '#12020a', 'stroke-width': 9, 'stroke-opacity': 0.5, filter: 'url(#blur2)' }, ov);
        el('rect', { x: x - fw * 0.1, y: by - 14, width: fw * 0.3, height: bh + 28, fill: '#16030a', opacity: 0.6, filter: 'url(#soft)' }, ov);
      }
      el('rect', { x: x + fw * 0.74, y: by - 14, width: fw * 0.3, height: bh + 28, fill: '#16030a', opacity: 0.42, filter: 'url(#soft)' }, ov);
      const hx = x + fw * 0.44;
      el('path', { d: `M${hx},${h * 0.05}C${hx + 7},${h * 0.3} ${hx - 7},${h * 0.6} ${hx + 2},${h - 70}`, fill: 'none', stroke: '#ffa3af', 'stroke-width': 2.6, 'stroke-opacity': 0.3, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, ov);
    });
    // gelap di atas (tertutup lambrekin) dan menjelang lantai
    el('rect', { x: -20, y: -20, width: w + 40, height: h + 40, fill: linGrad(g, [[0, '#14030a', 0.62], [0.13, '#14030a', 0], [0.84, '#14030a', 0], [1, '#14030a', 0.38]], 0, 0, 0, h) }, ov);
    // rumbai emas di sepanjang kelim
    const fr = el('g', { filter: 'url(#cast)' }, g);
    const x0 = edge === 'right' ? 1 : 7, x1 = edge === 'right' ? w - 7 : w - 1;
    for (let x = x0 + 1; x < x1; x += 4.6) {
      const L = 28 + R() * 10, y = hem(x) - 2;
      el('path', { d: `M${x},${y}q${(R() - 0.5) * 3},${L / 2} ${(R() - 0.5) * 4},${L}`, fill: 'none', stroke: jitter(R() < 0.3 ? GOLD.hi : R() < 0.62 ? GOLD.light : GOLD.base, 8, R), 'stroke-width': 3.1, 'stroke-linecap': 'round' }, fr);
    }
    const line = (dy) => `M${x0},${(hem(x0) + dy).toFixed(1)}${xs.filter((x) => x > x0 && x < x1).map((x) => `L${x},${(hem(x) + dy).toFixed(1)}`).join('')}`;
    el('path', { d: line(-3), fill: 'none', stroke: GOLD.mid, 'stroke-width': 13, 'stroke-linejoin': 'round' }, fr);
    el('path', { d: line(-6), fill: 'none', stroke: GOLD.light, 'stroke-width': 4.5, 'stroke-linejoin': 'round' }, fr);
    el('path', { d: line(-3), fill: 'none', stroke: GOLD.deep, 'stroke-width': 11, 'stroke-opacity': 0.45, 'stroke-dasharray': '2 9' }, fr);
  }

  /* ───────────── lambrekin: papan atas + tiga juntai berumbai ───────────── */
  const VW = 780, VH = 190;
  function valance(g, R, { w = VW } = {}) {
    const n = 3, sw = w / n, top = 44, depth = 112;
    const fr = el('g', {}, g);
    for (let k = 0; k < n; k++) {
      const x0 = k * sw - 4, x1 = (k + 1) * sw + 4, xm = (x0 + x1) / 2;
      const d = `M${x0},${top - 6}H${x1}V${top}Q${xm},${top + depth * 2} ${x0},${top}Z`;
      painted(g, d, {
        base: linGrad(g, [[0, RED.dark], [0.3, RED.base], [0.5, RED.light], [0.75, RED.mid], [1, RED.deep]], x0, 0, x1, 0), n: 90, R, filter: 'impasto', cast: 'castBig',
        stroke: () => {
          // sapuan mengikuti lengkung juntai; tiap "lipatan" bergantian terang-gelap
          const v = 0.12 + R() * 0.88, a = 0.04 + R() * 0.2, b = a + 0.25 + R() * 0.4;
          const pt = (t) => [x0 + (x1 - x0) * t, top + depth * 2 * v * 2 * t * (1 - t)];
          const [ax, ay] = pt(a), [bx, by] = pt(Math.min(0.96, b)), [mx, my] = pt((a + Math.min(0.96, b)) / 2);
          const band = Math.sin(v * Math.PI * 5.2);
          return { d: `M${ax},${ay}Q${mx},${my + 4} ${bx},${by}`, color: jitter(band > 0 ? mix(RED.base, RED.hi, band * 0.6) : mix(RED.base, RED.deep, -band * 0.7), 6, R), width: 6 + R() * 10, opacity: 0.35 + R() * 0.4 };
        },
      });
      // rumbai emas di sepanjang lengkung bawah
      for (let i = 1; i < 42; i++) {
        const t = i / 42, x = x0 + (x1 - x0) * t, y = top + depth * 2 * 2 * t * (1 - t) * 0.5;
        const L = 12 + R() * 6;
        el('path', { d: `M${x},${y - 2}l${(R() - 0.5) * 3},${L}`, stroke: jitter(R() < 0.4 ? GOLD.hi : GOLD.base, 8, R), 'stroke-width': 2.8, 'stroke-linecap': 'round' }, fr);
      }
      el('path', { d: `M${x0},${top}Q${xm},${top + depth * 2} ${x1},${top}`, fill: 'none', stroke: GOLD.mid, 'stroke-width': 6 }, fr);
      el('path', { d: `M${x0},${top - 1.5}Q${xm},${top + depth * 2 - 1.5} ${x1},${top - 1.5}`, fill: 'none', stroke: GOLD.light, 'stroke-width': 2.2 }, fr);
    }
    // papan atas beludru gelap dengan lis emas
    shape(g, `M-6,0H${w + 6}V${top}H-6Z`, [0, 0, w, top], [RED.deep, RED.mid, RED.base], R, { n: 50, dir: [1, 0], width: [8, 18], cast: 'cast' });
    el('path', { d: `M0,${top - 3}H${w}`, stroke: GOLD.base, 'stroke-width': 5 }, g);
    el('path', { d: `M0,${top - 5}H${w}`, stroke: GOLD.hi, 'stroke-width': 1.6, 'stroke-opacity': 0.9 }, g);
    el('path', { d: `M0,6H${w}`, stroke: GOLD.mid, 'stroke-width': 2.4, 'stroke-opacity': 0.8 }, g);
    // jumbai di pertemuan juntai
    for (let k = 0; k <= n; k++) tassel(el('g', { transform: `translate(${Math.max(14, Math.min(w - 14, k * sw))} ${top - 2}) scale(0.8)` }, g), R);
  }

  /** jumbai emas; (0,0) = titik gantung */
  function tassel(g, R, { cord = 26 } = {}) {
    const t = el('g', { filter: 'url(#cast)' }, g);
    el('path', { d: `M0,0V${cord}`, stroke: GOLD.mid, 'stroke-width': 5, 'stroke-linecap': 'round' }, t);
    el('circle', { cx: 0, cy: cord + 9, r: 11, fill: radGrad(g, [[0, GOLD.hi], [0.6, GOLD.base], [1, GOLD.dark]], -3, cord + 5, 14) }, t);
    for (let i = -6; i <= 6; i++) el('path', { d: `M${i * 1.6},${cord + 18}q${i * 0.7},22 ${i * 1.9 + (R() - 0.5) * 2},${44 + R() * 8}`, fill: 'none', stroke: jitter(i < -1 ? GOLD.hi : i > 3 ? GOLD.mid : GOLD.base, 8, R), 'stroke-width': 2.8, 'stroke-linecap': 'round' }, t);
    el('path', { d: `M-10,${cord + 21}H10`, stroke: GOLD.dark, 'stroke-width': 4, 'stroke-linecap': 'round' }, t);
  }

  /** tali penarik tirai: tali emas berpilin dengan jumbai besar; (0,0) = ujung atas */
  function rope(g, R, { len = 330 } = {}) {
    const r = el('g', { filter: 'url(#cast)' }, g);
    el('path', { d: `M0,0V${len}`, stroke: GOLD.dark, 'stroke-width': 13, 'stroke-linecap': 'round' }, r);
    el('path', { d: `M0,0V${len}`, stroke: GOLD.base, 'stroke-width': 9.5, 'stroke-linecap': 'round' }, r);
    for (let y = 4; y < len - 4; y += 9) el('path', { d: `M-5,${y + 6}L5,${y}`, stroke: GOLD.deep, 'stroke-width': 2, 'stroke-opacity': 0.55, 'stroke-linecap': 'round' }, r);
    el('path', { d: `M-2.6,2V${len - 2}`, stroke: GOLD.hi, 'stroke-width': 2, 'stroke-opacity': 0.75, 'stroke-linecap': 'round' }, r);
    tassel(el('g', { transform: `translate(0 ${len - 14}) scale(1.5)` }, g), R, { cord: 12 });
  }

  /* ───────────── papan nama: bingkai merah-emas dengan kotak lampu krem ───────────── */
  const MW = 680, MH = 260;
  /** titik lampu di sepanjang bingkai (dipakai juga di DOM: lihat BULBS di index.tsx) */
  function bulbSpots() {
    const out = [];
    for (let i = 0; i < 13; i++) out.push([62 + i * 46.33, 64]);
    for (let i = 1; i <= 3; i++) out.push([642, 64 + i * 41]);
    for (let i = 12; i >= 0; i--) out.push([62 + i * 46.33, 228]);
    for (let i = 3; i >= 1; i--) out.push([38, 64 + i * 41]);
    return out;
  }
  function marquee(g, R, { lit = false } = {}) {
    el('rect', { x: 34, y: 62, width: 632, height: 200, rx: 26, fill: '#0a0103', opacity: 0.55, filter: 'url(#softer)' }, g);
    // mahkota di tengah atas
    gold(g, 'M236,60Q238,6 340,6Q442,6 444,60Z', [236, 6, 208, 54], R, { n: 30, cast: 'castBig' });
    el('path', { d: 'M256,56Q258,22 340,22Q422,22 424,56Z', fill: RED.mid, stroke: GOLD.deep, 'stroke-width': 1.5, 'stroke-opacity': 0.6 }, g);
    mark(g, 340, 46, 1.05, GOLD.light);
    // bingkai enamel merah berlis emas
    const frame = rrect(20, 46, 640, 200, 26);
    gold(g, frame, [20, 46, 640, 200], R, { n: 50, cast: 'castBig' });
    shape(g, rrect(27, 53, 626, 186, 21), [27, 53, 626, 186], [RED.dark, RED.base, RED.light], R, { n: 90, dir: [1, 0.2], width: [8, 20] });
    el('path', { d: rrect(27, 53, 626, 186, 21), fill: linGrad(g, [[0, '#fff', 0.12], [0.4, '#fff', 0], [1, '#14030a', 0.35]], 0, 53, 0, 239) }, g);
    // kotak lampu krem
    const box = rrect(56, 82, 568, 128, 12);
    gold(g, rrect(50, 76, 580, 140, 16), [50, 76, 580, 140], R, { n: 30, cast: 'cast' });
    el('path', { d: box, fill: radGrad(g, [[0, '#fffdf2'], [0.7, '#fff3cf'], [1, '#f3d99a']], 340, 140, 330) }, g);
    el('path', { d: box, fill: 'none', stroke: '#8a5a1a', 'stroke-width': 2.2, 'stroke-opacity': 0.6 }, g);
    // bayangan bingkai yang jatuh ke kotak lampu
    const id = F.uid('m');
    el('path', { d: box }, el('clipPath', { id }, g));
    el('path', { d: rrect(62, 90, 580, 140, 14), fill: 'none', stroke: '#6b3a10', 'stroke-width': 14, 'stroke-opacity': 0.22, filter: 'url(#soft)' }, el('g', { 'clip-path': `url(#${id})` }, g));
    // dudukan lampu (lampunya sendiri menyala dari DOM; untuk sampul katalog dilukis menyala)
    bulbSpots().forEach(([x, y], i) => {
      el('circle', { cx: x, cy: y, r: 8.5, fill: RED.deep, opacity: 0.7 }, g);
      if (!lit) return;
      el('circle', { cx: x, cy: y, r: 20, fill: '#ffd98a', opacity: i % 2 ? 0.28 : 0.5, filter: 'url(#soft)' }, g);
      el('circle', { cx: x, cy: y, r: 7, fill: i % 2 ? '#ffe9b0' : '#fffbe6' }, g);
    });
  }

  /* ───────────── tiket tegak: bagian utama di atas, sobekan di bawah garis perforasi ───────────── */
  const TK = { w: 420, mh: 560, sh: 190, r: 26, ox: 18, oy: 12 };
  function paper(g, d, box, R, cast) {
    shape(g, d, box, CREAM, R, { n: 80, dir: [1, 0.04], width: [10, 24], cast });
    el('path', { d, fill: kawung(g, '#b9975c', 52, 1), opacity: 0.1 }, g);
    el('path', { d, fill: linGrad(g, [[0, '#fff', 0.25], [0.5, '#fff', 0], [1, '#7a4a1c', 0.14]], box[0], box[1], box[0] + box[2], box[1] + box[3]) }, g);
  }
  function ticketMain(g, R) {
    const { w, mh: h, r } = TK;
    const d = `M${r},0H${w - r}A${r},${r} 0 0 0 ${w},${r}V${h}H0V${r}A${r},${r} 0 0 0 ${r},0Z`;
    paper(g, d, [0, 0, w, h], R, 'castBig');
    // pita merah di kepala tiket (tulisannya dari DOM), kamboja emas di kiri-kanannya
    const band = `M${r},0H${w - r}A${r},${r} 0 0 0 ${w},${r}V96H0V${r}A${r},${r} 0 0 0 ${r},0Z`;
    shape(g, band, [0, 0, w, 96], [RED.dark, RED.base, RED.light], R, { n: 50, dir: [1, 0.05], width: [8, 18] });
    for (const y of [82, 89]) el('path', { d: `M0,${y}H${w}`, stroke: GOLD.light, 'stroke-width': y === 82 ? 2.4 : 1.2, 'stroke-opacity': 0.85 }, g);
    for (const x of [58, w - 58]) mark(g, x, 50, 1.15, GOLD.light);
    // bingkai dalam
    el('path', { d: rrect(18, 112, w - 36, h - 130, 10), fill: 'none', stroke: RED.base, 'stroke-width': 2.4, 'stroke-opacity': 0.85 }, g);
    el('path', { d: rrect(24, 118, w - 48, h - 142, 7), fill: 'none', stroke: GOLD.mid, 'stroke-width': 1, 'stroke-opacity': 0.8 }, g);
    // garis sobek
    for (let x = 9; x < w; x += 15) el('circle', { cx: x, cy: h - 0.5, r: 3.4, fill: '#3a1d12', opacity: 0.4 }, g);
  }
  function ticketStub(g, R) {
    const { w, sh: h, r } = TK;
    const d = `M0,0H${w}V${h - r}A${r},${r} 0 0 0 ${w - r},${h}H${r}A${r},${r} 0 0 0 0,${h - r}Z`;
    paper(g, d, [0, 0, w, h], R, 'castBig');
    el('path', { d: rrect(18, 18, w - 36, h - 36, 10), fill: 'none', stroke: RED.base, 'stroke-width': 2.4, 'stroke-opacity': 0.85 }, g);
    // medali untuk angka "2"
    el('circle', { cx: 98, cy: h / 2, r: 58, fill: 'none', stroke: RED.base, 'stroke-width': 3, 'stroke-opacity': 0.85 }, g);
    el('circle', { cx: 98, cy: h / 2, r: 50, fill: 'none', stroke: GOLD.mid, 'stroke-width': 1.2, 'stroke-dasharray': '2 5' }, g);
    for (let x = 9; x < w; x += 15) el('circle', { cx: x, cy: 0.5, r: 3.4, fill: '#3a1d12', opacity: 0.4 }, g);
  }

  /* ───────────── dua penonton (siluet, sprite sendiri supaya bisa saling bersandar) ───────────── */
  const PW = 190, PH = 200;
  /** siluet dari belakang; (0,0) = pusat kepala. Tepinya kena cahaya layar. */
  function person(g, R, { bun = false } = {}) {
    const dark = '#16060a';
    el('path', { d: 'M-22,32Q-26,66 -70,82Q-88,90 -88,140H88Q88,90 70,82Q26,66 22,32Z', fill: dark }, g);
    el('circle', { r: 40, fill: dark }, g);
    if (bun) {
      el('circle', { cx: -4, cy: -44, r: 17, fill: dark }, g);
      el('path', { d: 'M-40,-6Q-52,40 -40,70H-20V10Z', fill: dark }, g);
      el('path', { d: 'M40,-6Q50,36 42,64H22V10Z', fill: dark }, g);
    } else el('path', { d: 'M-40,-8Q-38,-48 2,-46Q40,-44 40,-6Z', fill: dark }, g);
    // tepi yang kena cahaya layar
    const rim = { fill: 'none', stroke: '#ffe2a8', 'stroke-linecap': 'round', filter: 'url(#blur2)' };
    el('path', { d: 'M-36,-16A40,40 0 0 1 30,-27', 'stroke-width': 3, 'stroke-opacity': 0.6, ...rim }, g);
    el('path', { d: 'M-66,83Q-40,74 -27,58M66,83Q40,74 27,58', 'stroke-width': 2.4, 'stroke-opacity': 0.34, ...rim }, g);
    if (bun) {
      el('path', { d: 'M-19,-52A17,17 0 0 1 8,-57', 'stroke-width': 2.4, 'stroke-opacity': 0.55, ...rim }, g);
      // kamboja terselip di sanggulnya
      const fl = el('g', { transform: 'translate(15 -36) rotate(24)' }, g);
      F.flora.flowers.kamboja(fl, R, 0.115);
      el('circle', { r: 20, fill: '#2a0a12', opacity: 0.2 }, fl);
    }
  }

  /* ───────────── deret kursi beludru (paling depan, membelakangi kita) ───────────── */
  const SW = 780, SH = 280;
  function seats(g, R, { w = SW, h = SH } = {}) {
    const n = 6, step = 130, sw = 142, x0 = (w - (step * (n - 1) + sw)) / 2, top = 100;
    const V = ['#17050b', '#35101c', '#5c1b2c'];
    for (let k = 0; k < n; k++) {
      const x = x0 + k * step;
      const d = `M${x},${h}V${top + 56}Q${x},${top} ${x + 52},${top}H${x + sw - 52}Q${x + sw},${top} ${x + sw},${top + 56}V${h}Z`;
      const p = painted(g, d, {
        base: linGrad(g, [[0, V[2]], [0.28, V[1]], [1, V[0]]], x + sw * 0.2, top, x + sw * 0.75, h), n: 30, R, filter: 'impasto', cast: 'castBig',
        stroke: () => {
          const u = R(), v = R(), L = 34 + R() * 70;
          return { d: `M${x + u * sw},${top + v * (h - top) - 20}q${(R() - 0.5) * 8},${L / 2} ${(R() - 0.5) * 6},${L}`, color: jitter(mix(V[1], u * 0.6 + v < 0.55 ? V[2] : V[0], 0.2 + R() * 0.4), 4, R), width: 13 + R() * 16, opacity: 0.2 + R() * 0.28 };
        },
      });
      // gulungan sandaran kepala: terang di atas, lekuk gelap di bawahnya
      el('ellipse', { cx: x + sw / 2 - 6, cy: top + 22, rx: sw * 0.4, ry: 13, fill: '#ff9a8e', opacity: 0.2, filter: 'url(#soft)' }, p.inner);
      el('path', { d: `M${x + 16},${top + 52}Q${x + sw / 2},${top + 40} ${x + sw - 16},${top + 52}`, fill: 'none', stroke: '#0c0206', 'stroke-width': 7, 'stroke-opacity': 0.5, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
      // kancing jok dengan lesung di sekelilingnya
      for (const [bx, by] of [[0.3, 182], [0.7, 182], [0.5, 228]]) {
        const cx = x + sw * bx;
        el('circle', { cx, cy: by, r: 13, fill: '#0c0206', opacity: 0.5, filter: 'url(#soft)' }, p.inner);
        el('circle', { cx, cy: by, r: 4.6, fill: V[2] }, p.inner);
        el('circle', { cx: cx - 1.4, cy: by - 1.6, r: 1.6, fill: '#ffb9a8', opacity: 0.7 }, p.inner);
      }
      // makin gelap ke bawah + cahaya layar di bagian atas
      el('path', { d, fill: linGrad(g, [[0, '#ffdca0', 0.16], [0.14, '#ffdca0', 0], [0.45, '#0a0103', 0], [1, '#0a0103', 0.6]], 0, top, 0, h) }, p.inner);
      // tepi atas kena cahaya layar + pipa emas
      el('path', { d: `M${x + 9},${top + 38}Q${x + 5},${top + 4} ${x + 52},${top + 3}H${x + sw - 52}Q${x + sw - 5},${top + 4} ${x + sw - 9},${top + 38}`, fill: 'none', stroke: '#ffd9a0', 'stroke-width': 3.2, 'stroke-opacity': 0.6, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
      el('path', { d: `M${x + 13},${h}V${top + 60}Q${x + 13},${top + 15} ${x + 55},${top + 15}H${x + sw - 55}Q${x + sw - 13},${top + 15} ${x + sw - 13},${top + 60}V${h}`, fill: 'none', stroke: GOLD.mid, 'stroke-width': 2.2, 'stroke-opacity': 0.6 }, g);
      el('path', { d: `M${x + 13},${top + 60}Q${x + 13},${top + 15} ${x + 55},${top + 15}H${x + sw * 0.6}`, fill: 'none', stroke: GOLD.light, 'stroke-width': 1.1, 'stroke-opacity': 0.6 }, g);
    }
  }

  /* ───────────── popcorn (mini-game) ───────────── */
  /** sebutir popcorn mekar; (0,0) = tengah. Wajahnya digambar dari DOM. */
  function kernel(g, R, { burnt = false } = {}) {
    const pal = burnt ? ['#3a2618', '#6b4a30', '#9a7450'] : ['#e9c98a', '#fff6dc', '#ffffff'];
    const lobes = [[-34, 6, 34], [34, 10, 32], [-14, -30, 36], [26, -26, 30], [0, 22, 40], [-2, -4, 38]];
    el('ellipse', { cx: 4, cy: 62, rx: 54, ry: 10, fill: '#1a0709', opacity: 0.25, filter: 'url(#soft)' }, g);
    // kulit jagung yang tersisa di bawah
    el('path', { d: 'M-16,40Q0,66 18,40Q4,50 -16,40Z', fill: burnt ? '#1c1009' : '#c98a2e' }, g);
    lobes.forEach(([x, y, r], i) => {
      painted(g, circ(x, y, r), {
        base: radGrad(g, [[0, pal[2]], [0.6, pal[1]], [1, pal[0]]], x - r * 0.35, y - r * 0.4, r * 1.3), n: 14, R, filter: 'impastoFine', cast: i < 5 ? 'cast' : undefined,
        stroke: () => {
          const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * r * 0.8;
          return { d: `M${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}q${6 + R() * 8},${-2 + R() * 4} ${12 + R() * 10},${(R() - 0.5) * 8}`, color: jitter(mix(pal[1], R() < 0.5 ? pal[0] : pal[2], R() * 0.7), 5, R), width: 5 + R() * 7, opacity: 0.4 };
        },
      });
    });
    if (burnt) for (const [x, y] of [[-30, -22], [22, 30], [36, -6]]) el('circle', { cx: x, cy: y, r: 7, fill: '#1c1009', opacity: 0.5, filter: 'url(#blur2)' }, g);
  }
  /** kotak popcorn bergaris; (0,0) = tengah bibir atas kotak */
  function tub(g, R, { heap = true } = {}) {
    const top = 118, bot = 92, h = 210;
    el('ellipse', { cx: 6, cy: h + 6, rx: bot + 20, ry: 14, fill: '#0a0103', opacity: 0.45, filter: 'url(#soft)' }, g);
    if (heap) {
      // gundukan popcorn di mulut kotak
      [[-78, -6, 30], [-36, -26, 34], [10, -32, 36], [56, -22, 32], [86, -2, 26], [-56, 4, 28], [-12, -2, 32], [34, 2, 30]].forEach(([x, y, r]) => {
        el('circle', { cx: x, cy: y, r, fill: radGrad(g, [[0, '#ffffff'], [0.6, '#fff3d2'], [1, '#e3c184']], x - r * 0.3, y - r * 0.4, r * 1.3), filter: 'url(#cast)' }, g);
      });
    }
    const body = `M${-top},0H${top}L${bot},${h}H${-bot}Z`;
    shape(g, body, [-top, 0, top * 2, h], ['#e6d2a6', '#fbf1d8', '#ffffff'], R, { n: 40, dir: [0.05, 1], width: [10, 22], cast: 'castBig' });
    // garis merah yang menyempit ke bawah
    const id = F.uid('t');
    el('path', { d: body }, el('clipPath', { id }, g));
    const st = el('g', { 'clip-path': `url(#${id})` }, g);
    for (let i = -3; i <= 3; i++) {
      if (i % 2 === 0) continue;
      const xt = (i / 3.5) * top, xb = (i / 3.5) * bot, wt = top / 3.5, wb = bot / 3.5;
      shape(st, `M${xt - wt / 2},0H${xt + wt / 2}L${xb + wb / 2},${h}H${xb - wb / 2}Z`, [xt - wt / 2, 0, wt, h], [RED.mid, RED.base, RED.light], R, { n: 18, dir: [0.02, 1], width: [6, 14] });
    }
    el('path', { d: body, fill: linGrad(g, [[0, '#fff', 0.2], [0.4, '#fff', 0], [1, '#3a1d12', 0.3]], -top, 0, top, h) }, g);
    // bibir bergerigi + lencana kamboja
    let lip = `M${-top - 4},0`;
    for (let i = 0; i < 10; i++) lip += `q${(top * 2 + 8) / 20},${-18} ${(top * 2 + 8) / 10},0`;
    lip += `V16H${-top - 4}Z`;
    shape(g, lip, [-top - 4, -18, top * 2 + 8, 34], ['#e6d2a6', '#fff6dc', '#ffffff'], R, { n: 16, dir: [1, 0], width: [6, 12], cast: 'cast' });
    el('circle', { cx: 0, cy: 106, r: 36, fill: radGrad(g, [[0, GOLD.hi], [0.6, GOLD.base], [1, GOLD.dark]], -10, 96, 44), stroke: GOLD.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.6, filter: 'url(#cast)' }, g);
    mark(g, 0, 110, 1.35, RED.base);
  }

  /* ───────────── sprite ───────────── */
  /** benda-benda digambar di kanvas besar, dirender K× supaya berkasnya ringan */
  const K = 0.5;
  const scaled = (name, w, h, seed, draw, k = K) => { F.sprites[name] = { w: w * k, h: h * k, viewBox: `0 0 ${w} ${h}`, seed, draw }; };

  F.sprites['bg-bioskop'] = { w: W, h: H, seed: 571, scale: 1, draw(svg, R) { wall(svg, R); } };
  scaled('bioskop-tirai', TW + 40, TH + 30, 572, (svg, R) => curtain(svg, R));
  scaled('bioskop-lambrekin', VW, VH + 40, 573, (svg, R) => valance(svg, R));
  scaled('bioskop-marquee', MW, MH + 20, 574, (svg, R) => marquee(svg, R), 0.6);
  scaled('bioskop-tali', 110, 470, 575, (svg, R) => rope(el('g', { transform: 'translate(50 0)' }, svg), R), 0.6);
  scaled('bioskop-tiket', TK.w + 44, TK.mh + 50, 576, (svg, R) => ticketMain(el('g', { transform: `translate(${TK.ox} ${TK.oy})` }, svg), R), 0.7);
  scaled('bioskop-tiket-sobek', TK.w + 44, TK.sh + 50, 577, (svg, R) => ticketStub(el('g', { transform: `translate(${TK.ox} ${TK.oy})` }, svg), R), 0.7);
  scaled('bioskop-kursi', SW, SH - 80, 578, (svg, R) => seats(el('g', { transform: 'translate(0 -80)' }, svg), R));
  scaled('bioskop-penonton-a', PW, PH, 583, (svg, R) => person(el('g', { transform: 'translate(95 66)' }, svg), R, { bun: true }), 0.6);
  scaled('bioskop-penonton-b', PW, PH, 584, (svg, R) => person(el('g', { transform: 'translate(95 66)' }, svg), R), 0.6);
  scaled('game-bioskop-popcorn', 200, 180, 579, (svg, R) => kernel(el('g', { transform: 'translate(100 92)' }, svg), R), 0.8);
  scaled('game-bioskop-popcorn-gosong', 200, 180, 580, (svg, R) => kernel(el('g', { transform: 'translate(100 92)' }, svg), R, { burnt: true }), 0.8);
  scaled('game-bioskop-kotak', 300, 300, 581, (svg, R) => tub(el('g', { transform: 'translate(150 70)' }, svg), R), 0.8);

  F.sprites['cover-bioskop'] = { w: 480, h: 600, seed: 582, draw(svg, R) {
    wall(el('g', { transform: 'translate(0 -200) scale(0.6154)' }, svg), R);
    // layar yang menyala di balik tirai
    el('rect', { x: 70, y: 196, width: 340, height: 300, rx: 10, fill: radGrad(svg, [[0, '#fffdf2'], [0.6, '#fff0c8'], [1, '#e9c98a']], 240, 330, 260) }, svg);
    el('rect', { x: 20, y: 150, width: 440, height: 400, fill: '#ffe2a8', opacity: 0.2, filter: 'url(#softer)' }, svg);
    // sepasang kamboja di layar, seperti adegan pembuka
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(216 340) rotate(12)' }, svg), R, 0.36);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(282 366) rotate(-20)' }, svg), R, 0.27);
    // tirai tersibak ke kiri & kanan
    curtain(el('g', { transform: 'translate(-70 150) scale(0.42 0.38)' }, svg), R);
    curtain(el('g', { transform: 'translate(374 150) scale(0.42 0.38)' }, svg), R, { edge: 'left' });
    valance(el('g', { transform: 'translate(-10 128) scale(0.641)' }, svg), R);
    marquee(el('g', { transform: 'translate(54 4) scale(0.547)' }, svg), R, { lit: true });
    // hati kecil di kotak lampu (pengganti tulisan)
    el('path', { d: 'M0,9C-15,-3 -8,-15 0,-7C8,-15 15,-3 0,9Z', fill: RED.base, transform: 'translate(240 84) scale(1.5)' }, svg);
    person(el('g', { transform: 'translate(206 500) rotate(9) scale(0.646)' }, svg), R, { bun: true });
    person(el('g', { transform: 'translate(272 496) rotate(-7) scale(0.646)' }, svg), R);
    seats(el('g', { transform: 'translate(-12 452) scale(0.646)' }, svg), R);
    // tiket & popcorn di depan
    const tk = el('g', { transform: 'translate(22 396) rotate(-13) scale(0.25)' }, svg);
    ticketMain(tk, R);
    // pengganti tulisan di tiket sampul: kamboja dan garis-garis halus
    mark(tk, TK.w / 2, 262, 2.5, RED.base, 0.85);
    for (const [y, half, o] of [[340, 110, 0.5], [372, 78, 0.38], [470, 130, 0.3]]) el('path', { d: `M${TK.w / 2 - half},${y}H${TK.w / 2 + half}`, stroke: '#7a4a2a', 'stroke-width': 6, 'stroke-opacity': o, 'stroke-linecap': 'round' }, tk);
    const st = el('g', { transform: `translate(10 ${TK.mh + 10}) rotate(5)` }, tk);
    ticketStub(st, R);
    el('path', { d: 'M0,9C-15,-3 -8,-15 0,-7C8,-15 15,-3 0,9Z', fill: RED.base, opacity: 0.85, transform: `translate(98 ${TK.sh / 2 + 4}) scale(2.2)` }, st);
    for (const [y, o] of [[78, 0.45], [112, 0.32]]) el('path', { d: `M212,${y}H372`, stroke: '#7a4a2a', 'stroke-width': 6, 'stroke-opacity': o, 'stroke-linecap': 'round' }, st);
    tub(el('g', { transform: 'translate(410 508) rotate(6) scale(0.42)' }, svg), R);
    kernel(el('g', { transform: 'translate(352 566) rotate(-20) scale(0.2)' }, svg), R);
  } };
})();
