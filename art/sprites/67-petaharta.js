/* Peta Harta: peta harta karun gambar tangan di atas perkamen tua — pulau-pulau "tempat kita", nyiur, mercusuar,
   ular laut yang ramah, mawar angin, lipatan & noda kopi. Meja kayu tempat gulungan peta bersegel lilin, tali goni,
   kunci kuningan, perahu kertas, bendera, tanda X merah, gundukan pasir & lubang galian, peti harta (badan, tutup
   tertutup & terbuka, gembok, isi harta), gulungan surat, dan burung beo untuk mini-game. Semua tulisan, nomor
   titik, dan garis jalur dipasang dari DOM di atas lukisan ini. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, linGrad, radGrad } = F;
  const W = 780, H = 1500;
  const INK = '#4a2e18';
  const VERM = { hi: '#ff9a7a', light: '#e8664a', base: '#c2412d', dark: '#8e2a1c', deep: '#5e1a10' };
  const BRASS = { hi: '#fff4cc', light: '#f1d58a', base: '#c99a3e', mid: '#a87a26', dark: '#6e4b14', deep: '#47300b' };
  const PARCH = { hi: '#f8ecd2', base: '#eddaae', mid: '#dfc28c', dark: '#bf9860', burnt: '#7a4b22' };
  const SANDC = ['#c99a5a', '#ecd096', '#f8e6bb'];
  const GREENC = ['#4d7d45', '#79a45a', '#b4cf84'];
  const SEAC = { pale: '#b9dccd', light: '#8fc6b8', base: '#62aaa6', deep: '#3b8590', ink: '#2f5f6a' };

  /** titik-titik peta (sama dengan src/templates/petaharta/index.tsx) */
  const START = [300, 1330];
  const SPOTS = [[596, 1224], [190, 1052], [478, 920], [618, 748], [186, 630], [566, 466]];
  const XS = [300, 338];

  const defsOf = (g) => (g.ownerSVGElement || g).querySelector('defs');
  function clip(g, d) {
    const id = F.uid('cl');
    el('path', { d }, el('clipPath', { id }, g));
    return el('g', { 'clip-path': `url(#${id})` }, g);
  }
  function mask(g, fill, x, y, w, h) {
    const id = F.uid('mk');
    const m = el('mask', { id, maskUnits: 'userSpaceOnUse', x, y, width: w, height: h }, defsOf(g));
    el('rect', { x, y, width: w, height: h, fill }, m);
    return `url(#${id})`;
  }
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
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90], base, op = [0.35, 0.8] } = {}) => painted(g, d, {
    base: base || cols[1], n, R, filter, cast,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: op[0] + R() * (op[1] - op[0]) };
    },
  });
  /** gumpalan tak beraturan yang halus */
  function blob(cx, cy, rx, ry, R, n = 12, rough = 0.22) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = 1 + (R() - 0.5) * 2 * rough; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let d = `M${mid(pts[0], pts[1]).map((v) => v.toFixed(1)).join(',')}`;
    for (let i = 1; i <= n; i++) { const q = pts[i % n], m = mid(q, pts[(i + 1) % n]); d += `Q${q[0].toFixed(1)},${q[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`; }
    return d + 'Z';
  }
  const at = (svg, tf) => el('g', { transform: tf }, svg);
  /** garis tinta gambar tangan: sedikit bergelombang */
  const ink = (g, d, w = 2.2, o = 0.85, extra = {}) => el('path', { d, fill: 'none', stroke: INK, 'stroke-width': w, 'stroke-opacity': o, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra }, g);
  /** kamboja kecil lima kelopak (tanda floa) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';

  /* ═════════════════════ PERKAMEN ═════════════════════ */
  function parchment(svg, R, { w = W, h = H, folds = true, burn = 1 } = {}) {
    const PT = [[0, PARCH.hi], [0.45, PARCH.base], [0.8, PARCH.mid], [1, PARCH.dark]];
    wash(svg, {
      x: -30, y: -30, w: w + 60, h: h + 60, R, n: Math.round((w * h) / 1500), angle: -4, len: [0.04, 0.16], width: [16, 40], opacity: [0.18, 0.45],
      base: radGrad(svg, [[0, PARCH.hi], [0.55, PARCH.base], [0.9, PARCH.mid], [1, PARCH.dark]], w * 0.42, h * 0.38, Math.hypot(w, h) * 0.62),
      color: (u, v) => { const d = Math.hypot(u - 0.42, (v - 0.4) * 0.8) * 1.5; let c = ramp(PT, d + (R() - 0.5) * 0.25); if (R() < 0.12) c = mix(c, '#f3c98a', 0.3); else if (R() < 0.1) c = mix(c, '#a78860', 0.25); return c; },
    });
    // serat kertas: garis-garis tipis tak beraturan
    const fib = el('g', { opacity: 0.5 }, svg);
    for (let i = 0; i < (w * h) / 900; i++) {
      const x = R() * w, y = R() * h, L = 6 + R() * 22, a = R() * Math.PI;
      el('path', { d: `M${x},${y}l${Math.cos(a) * L},${Math.sin(a) * L}`, stroke: R() < 0.5 ? '#a9865a' : '#fff6df', 'stroke-width': 0.6 + R() * 0.9, 'stroke-opacity': 0.25 + R() * 0.3 }, fib);
    }
    // noda-noda tua
    const st = el('g', { filter: 'url(#soft)' }, svg);
    for (let i = 0; i < (w * h) / 60000; i++) el('path', { d: blob(R() * w, R() * h, 18 + R() * 70, 14 + R() * 50, R, 10, 0.35), fill: R() < 0.6 ? '#c39a5e' : '#d9b578', opacity: 0.12 + R() * 0.16 }, st);
    // kawung samar seperti tanda air
    el('rect', { x: 0, y: 0, width: w, height: h, fill: kawung(svg, '#9c7a4a', 120, 2), opacity: 0.07 }, svg);
    if (folds) {
      // bekas lipatan: garis gelap + pantulan terang
      const fg = el('g', { filter: 'url(#blur2)' }, svg);
      for (const x of [w / 2]) { el('path', { d: `M${x},0V${h}`, stroke: '#9c7a4a', 'stroke-width': 3, 'stroke-opacity': 0.3 }, fg); el('path', { d: `M${x + 4},0V${h}`, stroke: '#fff8e4', 'stroke-width': 3, 'stroke-opacity': 0.5 }, fg); }
      for (const y of [h / 3, (2 * h) / 3]) { el('path', { d: `M0,${y}H${w}`, stroke: '#9c7a4a', 'stroke-width': 3, 'stroke-opacity': 0.26 }, fg); el('path', { d: `M0,${y + 4}H${w}`, stroke: '#fff8e4', 'stroke-width': 3, 'stroke-opacity': 0.45 }, fg); }
    }
    if (burn) {
      // tepi gosong & menguning
      el('rect', { x: 0, y: 0, width: w, height: h, fill: radGrad(svg, [[0, '#000', 0], [0.62, '#7a4b22', 0], [0.86, '#8a5a2a', 0.32 * burn], [1, '#4a2a10', 0.7 * burn]], w / 2, h / 2, Math.hypot(w, h) * 0.52) }, svg);
      const bg = el('g', { filter: 'url(#soft)' }, svg);
      for (let i = 0; i < 22; i++) {
        const side = i % 4, t = R();
        const x = side === 0 ? t * w : side === 1 ? w : side === 2 ? t * w : 0, y = side === 0 ? 0 : side === 1 ? t * h : side === 2 ? h : t * h;
        el('ellipse', { cx: x, cy: y, rx: 14 + R() * 30, ry: 10 + R() * 20, fill: '#5a3412', opacity: (0.12 + R() * 0.16) * burn }, bg);
      }
    }
  }

  /* ═════════════════════ LAUT & PULAU ═════════════════════ */
  function seaWash(svg, R) {
    // laut: sapuan cat air hijau-toska, lebih pekat di tengah, tipis di tepi kertas
    const g = el('g', { mask: mask(svg, radGrad(svg, [[0, '#fff', 0.85], [0.7, '#fff', 0.65], [1, '#fff', 0.25]], W / 2, H / 2, H * 0.62), 0, 0, W, H) }, svg);
    const bl = el('g', { filter: 'url(#softer)' }, g);
    for (let i = 0; i < 70; i++) el('ellipse', { cx: R() * W, cy: R() * H, rx: 60 + R() * 140, ry: 30 + R() * 70, fill: R() < 0.5 ? SEAC.light : R() < 0.7 ? SEAC.base : SEAC.pale, opacity: 0.16 + R() * 0.16 }, bl);
    wash(g, {
      x: -20, y: -20, w: W + 40, h: H + 40, R, n: 260, angle: -2, len: [0.04, 0.14], width: [6, 16], opacity: [0.06, 0.16], filter: null,
      color: () => { const k = R(); return k < 0.5 ? SEAC.light : k < 0.85 ? SEAC.base : SEAC.pale; },
    });
  }
  /** garis pantai berteluk & bertanjung: jumlah beberapa gelombang sinus dengan fase acak */
  function coastline(cx, cy, rx, ry, R, amp = 0.2, n = 54) {
    const hs = [2, 3, 4, 6, 9].map((k) => [k, R() * Math.PI * 2, (amp * (0.45 + R() * 0.55)) / Math.sqrt(k - 1)]);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      let k = 1;
      for (const [f, ph, A] of hs) k += A * Math.sin(f * a + ph);
      k += (R() - 0.5) * 0.03;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let d = `M${mid(pts[0], pts[1]).map((v) => v.toFixed(1)).join(',')}`;
    for (let i = 1; i <= n; i++) { const q = pts[i % n], m = mid(q, pts[(i + 1) % n]); d += `Q${q[0].toFixed(1)},${q[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`; }
    return d + 'Z';
  }
  /** riak garis pantai + bayangan + pasir + daratan hijau + tinta */
  function island(g, R, { cx, cy, rx, ry, rough = 0.24, n = 13, green = 0.66, gx = 0, gy = -0.12 }) {
    const coast = coastline(cx, cy, rx, ry, R, rough);
    // air dangkal di sekeliling pulau
    el('path', { d: coast, fill: SEAC.light, opacity: 0.55, filter: 'url(#soft)', transform: `translate(${cx} ${cy}) scale(1.22) translate(${-cx} ${-cy})` }, g);
    for (let k = 1; k <= 3; k++) {
      const s = 1 + k * 0.085 + (k - 1) * 0.02;
      el('path', { d: coast, fill: 'none', stroke: SEAC.ink, 'stroke-width': 1.7 - k * 0.25, 'stroke-opacity': 0.5 - k * 0.12, 'stroke-dasharray': k === 1 ? undefined : k === 2 ? '22 9 6 9' : '9 12', transform: `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})` }, g);
    }
    el('path', { d: coast, fill: '#6a4626', opacity: 0.32, filter: 'url(#soft)', transform: 'translate(6 9)' }, g);
    const sand = shape(g, coast, [cx - rx * 1.3, cy - ry * 1.3, rx * 2.6, ry * 2.6], SANDC, R, { n: 50, dir: [1, 0.35], width: [5, 11], len: [6, 18], op: [0.25, 0.55], base: radGrad(g, [[0, SANDC[2]], [0.6, SANDC[1]], [1, SANDC[0]]], cx - rx * 0.3, cy - ry * 0.4, Math.max(rx, ry) * 1.4) });
    for (let i = 0; i < (rx * ry) / 140; i++) el('circle', { cx: cx + (R() - 0.5) * rx * 2.4, cy: cy + (R() - 0.5) * ry * 2.4, r: 0.7 + R() * 1.4, fill: R() < 0.55 ? '#a57a44' : '#fff6dc', opacity: 0.35 + R() * 0.35 }, sand.inner);
    // tepi basah: pasir lebih gelap di bibir pantai
    el('path', { d: coast, fill: 'none', stroke: '#b98d55', 'stroke-width': 10, 'stroke-opacity': 0.45, filter: 'url(#blur2)' }, sand.inner);
    const inner = green ? coastline(cx + rx * gx, cy + ry * gy, rx * green, ry * green * 0.86, R, rough * 0.8, 40) : null;
    if (inner) {
      const gr = shape(g, inner, [cx - rx, cy - ry, rx * 2, ry * 2], GREENC, R, { n: 70, dir: [0.5, 1], width: [5, 12], len: [8, 24], op: [0.3, 0.6], base: radGrad(g, [[0, GREENC[2]], [0.55, GREENC[1]], [1, GREENC[0]]], cx - rx * 0.35, cy - ry * 0.45, Math.max(rx, ry) * 1.2) });
      // semak-semak kecil (totol) di daratan
      for (let i = 0; i < (rx * ry) / 600; i++) { const x = cx + (R() - 0.5) * rx * 1.5, y = cy + (R() - 0.5) * ry * 1.4; el('circle', { cx: x, cy: y, r: 3 + R() * 4, fill: R() < 0.5 ? '#5f8f48' : '#9cc071', opacity: 0.55 }, gr.inner); }
      el('path', { d: inner, fill: 'none', stroke: '#2f4f26', 'stroke-width': 1.5, 'stroke-opacity': 0.5 }, g);
    }
    ink(g, coast, 2.8, 0.9, { filter: 'url(#wobble)' });
    // titik-titik pasir di pantai
    for (let i = 0; i < 18; i++) { const a = R() * Math.PI * 2, r = 0.8 + R() * 0.12; el('circle', { cx: cx + Math.cos(a) * rx * r, cy: cy + Math.sin(a) * ry * r, r: 1 + R() * 1.4, fill: '#9c7444', opacity: 0.5 }, g); }
    return { coast, inner };
  }
  /** nyiur gambar tangan */
  function palm(g, R, x, y, h, lean = 6, s = 1) {
    const tx = x + lean, ty = y - h;
    el('ellipse', { cx: x + 8, cy: y + 2, rx: 14 * s, ry: 4 * s, fill: '#5a3d1e', opacity: 0.3, filter: 'url(#blur2)' }, g);
    const tr = `M${x},${y}Q${x + lean * 0.15},${y - h * 0.55} ${tx},${ty}`;
    el('path', { d: tr, fill: 'none', stroke: INK, 'stroke-width': 6 * s, 'stroke-linecap': 'round' }, g);
    el('path', { d: tr, fill: 'none', stroke: '#b08348', 'stroke-width': 3.4 * s, 'stroke-linecap': 'round' }, g);
    for (let k = 1; k < 5; k++) { const t = k / 5, px = x + (tx - x) * t + lean * 0.1 * Math.sin(t * 3), py = y - h * t; el('path', { d: `M${px - 3 * s},${py}h${6 * s}`, stroke: INK, 'stroke-width': 1.1, 'stroke-opacity': 0.7 }, g); }
    const fr = [[-168, 1], [-132, 1.1], [-92, 0.8], [-52, 1.1], [-14, 1]];
    fr.forEach(([deg, k], i) => {
      const a = ((deg + (R() - 0.5) * 12) * Math.PI) / 180, L = h * 0.62 * k * s;
      const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.75 + L * 0.28;
      const mx = tx + Math.cos(a) * L * 0.5, my = ty + Math.sin(a) * L * 0.5 - 6 * s;
      const nx = -Math.sin(a) * 7 * s, ny = Math.cos(a) * 7 * s;
      const d = `M${tx},${ty}Q${mx + nx},${my + ny} ${ex},${ey}Q${mx - nx * 0.4},${my - ny * 0.4 - 4 * s} ${tx},${ty}Z`;
      el('path', { d, fill: i % 2 ? '#5f9a4f' : '#7db35b', stroke: INK, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, g);
      el('path', { d: `M${tx},${ty}Q${mx},${my} ${ex},${ey}`, fill: 'none', stroke: '#2f5a2a', 'stroke-width': 0.9, 'stroke-opacity': 0.7 }, g);
    });
    el('circle', { cx: tx - 3, cy: ty + 4, r: 3.6 * s, fill: '#7a5326', stroke: INK, 'stroke-width': 1 }, g);
    el('circle', { cx: tx + 4, cy: ty + 5, r: 3.2 * s, fill: '#8a6230', stroke: INK, 'stroke-width': 1 }, g);
  }
  /** bukit dengan arsir di sisi teduh */
  function hill(g, R, x, y, w, h, col = '#a7b56c') {
    const d = `M${x - w},${y}Q${x - w * 0.4},${y - h * 0.9} ${x},${y - h}Q${x + w * 0.45},${y - h * 0.85} ${x + w},${y}Z`;
    el('path', { d, fill: col, stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    for (let k = 0; k < 6; k++) { const t = 0.15 + k * 0.13; el('path', { d: `M${x + w * t},${y - h * (1 - t) * 0.92}l${w * 0.1},${h * 0.24}`, stroke: INK, 'stroke-width': 1.1, 'stroke-opacity': 0.55, 'stroke-linecap': 'round' }, g); }
    el('path', { d: `M${x - w * 0.55},${y - h * 0.45}Q${x - w * 0.3},${y - h * 0.85} ${x - w * 0.05},${y - h * 0.97}`, fill: 'none', stroke: '#eef3c8', 'stroke-width': 2, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, g);
  }
  /** ombak kecil "~" */
  function wave(g, x, y, s = 1, o = 0.55) {
    el('path', { d: `M${x},${y}q${7 * s},${-7 * s} ${14 * s},0t${14 * s},0`, fill: 'none', stroke: SEAC.ink, 'stroke-width': 2, 'stroke-opacity': o, 'stroke-linecap': 'round' }, g);
  }
  function hut(g, x, y, s = 1) {
    el('path', { d: `M${x - 13 * s},${y}V${y - 14 * s}H${x + 13 * s}V${y}Z`, fill: '#d8a35e', stroke: INK, 'stroke-width': 1.4 }, g);
    el('path', { d: `M${x - 19 * s},${y - 12 * s}L${x},${y - 30 * s}L${x + 19 * s},${y - 12 * s}Z`, fill: '#9a6a34', stroke: INK, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g);
    for (let k = 0; k < 4; k++) el('path', { d: `M${x - 14 * s + k * 9 * s},${y - 14 * s}l${5 * s},${-10 * s}`, stroke: INK, 'stroke-width': 0.9, 'stroke-opacity': 0.6 }, g);
    el('rect', { x: x - 4 * s, y: y - 9 * s, width: 8 * s, height: 9 * s, fill: INK, opacity: 0.8 }, g);
  }
  function lighthouse(g, x, y, s = 1) {
    const d = `M${x - 11 * s},${y}L${x - 7 * s},${y - 52 * s}H${x + 7 * s}L${x + 11 * s},${y}Z`;
    el('path', { d, fill: '#fbf2dc', stroke: INK, 'stroke-width': 1.6 }, g);
    const c = clip(g, d);
    for (const t of [0.15, 0.5]) el('rect', { x: x - 14 * s, y: y - 52 * s * (t + 0.18), width: 28 * s, height: 52 * s * 0.16, fill: VERM.base }, c);
    el('path', { d: `M${x + 3 * s},${y - 50 * s}L${x + 8 * s},${y}`, stroke: '#7a5a3a', 'stroke-width': 4 * s, 'stroke-opacity': 0.25 }, c);
    el('rect', { x: x - 9 * s, y: y - 64 * s, width: 18 * s, height: 12 * s, fill: '#ffe28a', stroke: INK, 'stroke-width': 1.4 }, g);
    el('path', { d: `M${x - 11 * s},${y - 64 * s}L${x},${y - 74 * s}L${x + 11 * s},${y - 64 * s}Z`, fill: VERM.dark, stroke: INK, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g);
    // berkas cahaya
    for (const a of [-1, 1]) el('path', { d: `M${x},${y - 58 * s}L${x + a * 46 * s},${y - 72 * s}L${x + a * 46 * s},${y - 46 * s}Z`, fill: '#ffe9a0', opacity: 0.45 }, g);
  }
  function volcano(g, R, x, y, w, h) {
    const d = `M${x - w},${y}L${x - w * 0.22},${y - h}H${x + w * 0.22}L${x + w},${y}Z`;
    el('path', { d, fill: '#a98a62', stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    for (let k = 0; k < 6; k++) { const t = 0.1 + k * 0.14; el('path', { d: `M${x + w * 0.22 + (w * 0.78) * t},${y - h + h * t}l${-w * 0.08},${h * 0.2}`, stroke: INK, 'stroke-width': 1.1, 'stroke-opacity': 0.55 }, g); }
    el('path', { d: `M${x - w * 0.22},${y - h}Q${x},${y - h + 7} ${x + w * 0.22},${y - h}`, fill: '#e8663e', stroke: INK, 'stroke-width': 1.4 }, g);
    el('path', { d: `M${x - w * 0.15},${y - h + 2}q-6,18 2,30M${x + w * 0.12},${y - h + 3}q8,14 0,24`, fill: 'none', stroke: '#e8663e', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g);
    // asap melingkar
    for (const [dx, dy, r] of [[-5, -16, 5], [3, -30, 6.5], [-4, -46, 8]]) el('circle', { cx: x + dx, cy: y - h + dy, r, fill: '#f4ead2', stroke: INK, 'stroke-width': 1, 'stroke-opacity': 0.45, opacity: 0.85 }, g);
  }
  /** ular laut yang ramah: tiga punuk + kepala tersenyum + ekor melingkar */
  function serpent(g, R, x, y, s = 1) {
    const S = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
    const body = '#5aa58a', dark = '#2f6f5e', belly = '#d9e7b0';
    const hump = (hx, hw, hh) => {
      const d = `M${hx - hw},0C${hx - hw},${-hh * 1.25} ${hx + hw},${-hh * 1.25} ${hx + hw},0L${hx + hw * 0.52},0C${hx + hw * 0.52},${-hh * 0.62} ${hx - hw * 0.52},${-hh * 0.62} ${hx - hw * 0.52},0Z`;
      el('path', { d, fill: body, stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, S);
      el('path', { d: `M${hx - hw * 0.8},${-hh * 0.5}C${hx - hw * 0.6},${-hh * 0.98} ${hx + hw * 0.1},${-hh * 1.02} ${hx + hw * 0.4},${-hh * 0.86}`, fill: 'none', stroke: '#bfe6c6', 'stroke-width': 2.2, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, S);
      for (let k = 0; k < 3; k++) el('path', { d: `M${hx - hw * 0.25 + k * hw * 0.25},${-hh * 0.93}l${hw * 0.06},${-hh * 0.24}l${hw * 0.12},${hh * 0.2}`, fill: VERM.light, stroke: INK, 'stroke-width': 1.1, 'stroke-linejoin': 'round' }, S);
      wave(S, hx - hw - 18, 4, 0.9, 0.7);
      wave(S, hx + hw - 6, 4, 0.9, 0.7);
    };
    hump(-60, 26, 34);
    hump(4, 24, 30);
    // ekor melingkar
    el('path', { d: 'M56,0C56,-30 92,-34 96,-14C99,0 84,6 78,-4C74,-11 82,-16 86,-12', fill: 'none', stroke: INK, 'stroke-width': 9, 'stroke-linecap': 'round' }, S);
    el('path', { d: 'M56,0C56,-30 92,-34 96,-14C99,0 84,6 78,-4C74,-11 82,-16 86,-12', fill: 'none', stroke: body, 'stroke-width': 6, 'stroke-linecap': 'round' }, S);
    // leher & kepala
    const neck = 'M-128,0C-132,-36 -118,-62 -104,-74L-88,-64C-98,-52 -104,-30 -100,0Z';
    el('path', { d: neck, fill: body, stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, S);
    el('path', { d: 'M-113,-4C-116,-30 -108,-50 -98,-62', fill: 'none', stroke: belly, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-opacity': 0.9 }, S);
    const head = 'M-116,-70C-124,-92 -104,-106 -84,-100C-66,-96 -56,-84 -60,-74C-64,-66 -80,-66 -94,-62C-104,-60 -112,-62 -116,-70Z';
    el('path', { d: head, fill: body, stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, S);
    el('path', { d: 'M-108,-90C-100,-100 -84,-100 -76,-94', fill: 'none', stroke: '#bfe6c6', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, S);
    el('circle', { cx: -94, cy: -86, r: 6, fill: '#fffaf0', stroke: INK, 'stroke-width': 1.4 }, S);
    el('circle', { cx: -92, cy: -86, r: 3, fill: INK }, S);
    el('circle', { cx: -93, cy: -87.5, r: 1, fill: '#fff' }, S);
    el('path', { d: 'M-74,-76Q-68,-70 -62,-75', fill: 'none', stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, S);
    el('ellipse', { cx: -80, cy: -80, rx: 4, ry: 2.4, fill: '#f29a8a', opacity: 0.8 }, S);
    // jambul
    el('path', { d: 'M-112,-84l-10,-12l12,2l-2,-12l10,8l2,-10l6,12', fill: VERM.light, stroke: INK, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, S);
    wave(S, -150, 4, 0.9, 0.7);
    wave(S, 100, 4, 0.9, 0.7);
  }
  /** mawar angin 16 arah; utaranya berhiaskan kamboja */
  function compassRose(g, R, x, y, r) {
    const C = el('g', { transform: `translate(${x} ${y})` }, g);
    el('circle', { r: r * 1.02, fill: '#f6e8c6', opacity: 0.7, filter: 'url(#soft)' }, C);
    el('circle', { r, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, C);
    el('circle', { r: r * 0.9, fill: 'none', stroke: INK, 'stroke-width': 1 }, C);
    for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2, r0 = r * 0.9, r1 = i % 4 ? r * 0.95 : r; el('path', { d: `M${Math.cos(a) * r0},${Math.sin(a) * r0}L${Math.cos(a) * r1},${Math.sin(a) * r1}`, stroke: INK, 'stroke-width': i % 4 ? 0.8 : 1.4 }, C); }
    const point = (deg, len, wd, light, dark) => {
      const p = el('g', { transform: `rotate(${deg})` }, C);
      el('path', { d: `M0,0L${-wd},${-wd}L0,${-len}Z`, fill: light, stroke: INK, 'stroke-width': 1.1, 'stroke-linejoin': 'round' }, p);
      el('path', { d: `M0,0L${wd},${-wd}L0,${-len}Z`, fill: dark, stroke: INK, 'stroke-width': 1.1, 'stroke-linejoin': 'round' }, p);
    };
    for (let i = 0; i < 8; i++) point(22.5 + i * 45, r * 0.6, r * 0.07, '#efd9a6', '#b99556');
    for (let i = 0; i < 4; i++) point(45 + i * 90, r * 0.78, r * 0.12, VERM.light, VERM.dark);
    for (let i = 0; i < 4; i++) point(i * 90, r * 1.12, r * 0.16, '#f8edd2', '#5b3a1e');
    el('circle', { r: r * 0.13, fill: '#f8edd2', stroke: INK, 'stroke-width': 1.3 }, C);
    el('circle', { r: r * 0.05, fill: VERM.base }, C);
    F.flora.flowers.kamboja(at(C, `translate(0 ${-r * 1.26}) rotate(12)`), R, r * 0.0011);
  }
  /** kapal layar mungil (pinisi) */
  function ship(g, x, y, s = 1) {
    const S = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
    el('path', { d: 'M-40,0Q0,14 42,0L36,10Q0,20 -34,10Z', fill: '#9a6334', stroke: INK, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, S);
    el('path', { d: 'M-8,0V-58M14,0V-46', stroke: INK, 'stroke-width': 1.8 }, S);
    el('path', { d: 'M-8,-56L-34,-4H-8Z', fill: '#fbf1d8', stroke: INK, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, S);
    el('path', { d: 'M-6,-52Q16,-30 -6,-6Z', fill: '#f4e2bb', stroke: INK, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, S);
    el('path', { d: 'M16,-44Q34,-24 16,-6Z', fill: '#fbf1d8', stroke: INK, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, S);
    el('path', { d: 'M-8,-58l12,4l-12,4Z', fill: VERM.base, stroke: INK, 'stroke-width': 0.9 }, S);
    wave(S, -54, 12, 0.8, 0.6);
    wave(S, 34, 14, 0.8, 0.6);
  }
  /** batu berbentuk hati */
  function heartRock(g, x, y, s = 1) {
    const d = `M${x},${y + 12 * s}C${x - 26 * s},${y - 2 * s} ${x - 16 * s},${y - 24 * s} ${x},${y - 12 * s}C${x + 16 * s},${y - 24 * s} ${x + 26 * s},${y - 2 * s} ${x},${y + 12 * s}Z`;
    el('ellipse', { cx: x + 4, cy: y + 13 * s, rx: 20 * s, ry: 5 * s, fill: '#5a3d1e', opacity: 0.3, filter: 'url(#blur2)' }, g);
    el('path', { d, fill: '#b4a08a', stroke: INK, 'stroke-width': 1.6 }, g);
    el('path', { d: `M${x - 12 * s},${y - 8 * s}Q${x - 8 * s},${y - 14 * s} ${x - 2 * s},${y - 10 * s}`, fill: 'none', stroke: '#f1e6d6', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
    el('path', { d: `M${x + 6 * s},${y + 2 * s}l${6 * s},${-4 * s}M${x + 2 * s},${y + 6 * s}l${6 * s},${-3 * s}`, stroke: INK, 'stroke-width': 1, 'stroke-opacity': 0.6 }, g);
  }
  /** awan wajah yang meniup angin (sudut peta) */
  function windCloud(g, x, y, s = 1) {
    const S = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
    const d = 'M-40,10C-56,8 -58,-14 -42,-18C-44,-36 -20,-44 -8,-32C-2,-48 26,-46 28,-28C44,-30 52,-10 40,0C46,14 30,24 16,18C8,28 -14,28 -20,18C-30,24 -42,20 -40,10Z';
    el('path', { d, fill: '#fbf3df', stroke: INK, 'stroke-width': 1.6 }, S);
    el('circle', { cx: 8, cy: -10, r: 2.4, fill: INK }, S);
    el('circle', { cx: 22, cy: -12, r: 2.4, fill: INK }, S);
    el('ellipse', { cx: 30, cy: 0, rx: 5, ry: 4, fill: 'none', stroke: INK, 'stroke-width': 1.5 }, S);
    el('ellipse', { cx: 4, cy: -2, rx: 4, ry: 2.4, fill: '#f2a28a', opacity: 0.7 }, S);
    for (const [dy, L] of [[-4, 46], [4, 60], [12, 40]]) el('path', { d: `M38,${dy}q${L / 2},-6 ${L},0`, fill: 'none', stroke: INK, 'stroke-width': 1.3, 'stroke-opacity': 0.55, 'stroke-linecap': 'round', 'stroke-dasharray': '8 5' }, S);
  }

  function mapArt(svg, R) {
    parchment(svg, R);
    seaWash(svg, R);
    // garis rumb dari mawar angin
    const CR = [150, 858];
    const rh = el('g', { opacity: 0.16 }, svg);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; el('path', { d: `M${CR[0]},${CR[1]}L${CR[0] + Math.cos(a) * 1600},${CR[1] + Math.sin(a) * 1600}`, stroke: i % 2 ? '#6b4a2a' : VERM.dark, 'stroke-width': i % 2 ? 1 : 1.4 }, rh); }
    // ombak-ombak kecil di laut
    const wg = el('g', {}, svg);
    for (const [x, y, s] of [[96, 1440], [420, 1460], [690, 1460], [330, 1210], [470, 1330], [720, 1140], [60, 1180], [370, 1050], [300, 860], [700, 900], [420, 790], [80, 520], [330, 560], [460, 640], [720, 600], [440, 470], [700, 330], [120, 240], [520, 180], [640, 140], [260, 120], [580, 1050], [520, 280]]) wave(wg, x, y, 1 + (R() - 0.5) * 0.3, 0.45 + R() * 0.2);
    // pulau-pulau (urutan dari atas ke bawah supaya bayangan menumpuk wajar)
    const isX = island(svg, R, { cx: 292, cy: 352, rx: 176, ry: 100, rough: 0.2 });
    island(svg, R, { cx: 604, cy: 476, rx: 118, ry: 70, rough: 0.22 });
    island(svg, R, { cx: 178, cy: 650, rx: 126, ry: 80, rough: 0.24 });
    island(svg, R, { cx: 630, cy: 770, rx: 112, ry: 82, rough: 0.22 });
    island(svg, R, { cx: 478, cy: 930, rx: 64, ry: 30, rough: 0.14, green: 0 });
    island(svg, R, { cx: 182, cy: 1066, rx: 124, ry: 76, rough: 0.22 });
    island(svg, R, { cx: 602, cy: 1250, rx: 128, ry: 76, rough: 0.22 });
    island(svg, R, { cx: 140, cy: 1338, rx: 130, ry: 74, rough: 0.2, gx: -0.1 });
    // isi pulau — titik-titik (SPOTS) dibiarkan lapang untuk penanda dari DOM
    // X: dua bukit di kiri, nyiur di kanan, batu hati
    hill(svg, R, 168, 322, 38, 42, '#9fb46a');
    hill(svg, R, 208, 312, 30, 32, '#b3c07a');
    palm(svg, R, 418, 350, 58, 8);
    palm(svg, R, 444, 366, 46, -6, 0.9);
    palm(svg, R, 150, 400, 44, -7, 0.9);
    heartRock(svg, 392, 412, 0.9);
    // kanan atas: gunung api
    volcano(svg, R, 650, 474, 48, 54);
    // kiri tengah: rumah panggung & nyiur
    palm(svg, R, 104, 654, 50, -6);
    palm(svg, R, 128, 676, 42, 5, 0.9);
    hut(svg, 262, 668, 1.05);
    for (const x of [252, 272]) el('path', { d: `M${x},668v10`, stroke: INK, 'stroke-width': 1.4 }, svg);
    // kanan tengah: bukit & air terjun
    hill(svg, R, 680, 800, 44, 52, '#9fb46a');
    el('path', { d: 'M676,766q-4,16 2,32', fill: 'none', stroke: '#e9f6f0', 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    el('path', { d: 'M676,766q-4,16 2,32', fill: 'none', stroke: SEAC.deep, 'stroke-width': 1.2, 'stroke-dasharray': '4 4' }, svg);
    palm(svg, R, 560, 806, 40, -5, 0.85);
    // gosong pasir (titik iseng): batu-batu di pinggir
    for (const [x, y, r] of [[434, 938, 8], [520, 930, 7], [530, 944, 5]]) { el('ellipse', { cx: x, cy: y, rx: r * 1.3, ry: r, fill: '#a99886', stroke: INK, 'stroke-width': 1.3 }, svg); el('ellipse', { cx: x - r * 0.4, cy: y - r * 0.4, rx: r * 0.5, ry: r * 0.3, fill: '#efe6da', opacity: 0.7 }, svg); }
    // kiri bawah: mercusuar
    lighthouse(svg, 268, 1092, 0.95);
    palm(svg, R, 104, 1084, 46, -5);
    // kanan bawah: bukit & dua nyiur
    hill(svg, R, 524, 1278, 34, 32, '#b3c07a');
    palm(svg, R, 672, 1262, 50, 6);
    palm(svg, R, 694, 1276, 38, -4, 0.85);
    // pelabuhan awal: dermaga & gubuk
    el('path', { d: 'M232,1330H300', stroke: INK, 'stroke-width': 9, 'stroke-linecap': 'round' }, svg);
    el('path', { d: 'M232,1330H300', stroke: '#c4945a', 'stroke-width': 6, 'stroke-linecap': 'round' }, svg);
    for (const x of [244, 264, 288]) el('path', { d: `M${x},1333v10`, stroke: INK, 'stroke-width': 2 }, svg);
    hut(svg, 116, 1336, 1);
    palm(svg, R, 70, 1352, 44, -6, 0.9);
    palm(svg, R, 178, 1350, 36, 5, 0.8);
    // laut: ular laut, kapal, awan angin, mawar angin
    serpent(svg, R, 668, 1062, 0.78);
    ship(svg, 640, 236, 0.9);
    windCloud(svg, 84, 156, 0.9);
    compassRose(svg, R, CR[0], CR[1], 78);
    // pinggir kertas sedikit lebih gelap (cahaya dari kiri-atas)
    el('rect', { x: 0, y: 0, width: W, height: H, fill: linGrad(svg, [[0, '#fff6dc', 0.12], [0.5, '#fff6dc', 0], [1, '#5a3412', 0.14]], 0, 0, W, H) }, svg);
    return isX;
  }

  /* ═════════════════════ MEJA KAYU ═════════════════════ */
  function table(svg, R) {
    const planks = 4, pw = W / planks;
    const TONE = [[0, '#1f0f07'], [0.35, '#3a1f10'], [0.7, '#5a311a'], [1, '#7d4825']];
    for (let i = 0; i < planks; i++) {
      const x = i * pw, k = (R() - 0.5) * 0.16;
      const g = clip(svg, `M${x + 2},-10H${x + pw - 2}V${H + 10}H${x + 2}Z`);
      el('rect', { x, y: -10, width: pw, height: H + 20, fill: linGrad(svg, [[0, ramp(TONE, 0.5 + k)], [0.5, ramp(TONE, 0.62 + k)], [1, ramp(TONE, 0.42 + k)]], x, 0, x + pw, 0) }, g);
      // corak tonal lebar yang lembut
      const tg = el('g', { filter: 'url(#soft)' }, g);
      for (let j = 0; j < 9; j++) { const gx = x + R() * pw; el('path', { d: `M${gx},-20Q${gx + (R() - 0.5) * 40},${H / 2} ${gx + (R() - 0.5) * 30},${H + 20}`, fill: 'none', stroke: R() < 0.5 ? '#7a4526' : '#24110a', 'stroke-width': 14 + R() * 26, 'stroke-opacity': 0.22 + R() * 0.2 }, tg); }
      // serat panjang yang bergelombang pelan
      const gr = el('g', { filter: 'url(#impastoFine)' }, g);
      const ph = R() * 6;
      for (let j = 0; j < 46; j++) {
        const gx = x + R() * pw, amp = 2 + R() * 7, fr = 160 + R() * 220, ph2 = ph + R() * 0.8;
        let d = `M${gx},-20`;
        for (let y = 20; y <= H + 40; y += 40) d += `L${(gx + Math.sin(y / fr + ph2) * amp).toFixed(1)},${y}`;
        const light = R() < 0.35;
        el('path', { d, fill: 'none', stroke: light ? '#9a5e34' : '#1c0d06', 'stroke-width': 0.8 + R() * 2.4, 'stroke-opacity': light ? 0.2 + R() * 0.2 : 0.25 + R() * 0.3, 'stroke-linecap': 'round' }, gr);
      }
      // mata kayu dengan serat melingkarinya
      const kx = x + pw * (0.3 + R() * 0.4), ky = 200 + R() * (H - 400);
      for (let r = 1; r <= 6; r++) el('ellipse', { cx: kx, cy: ky, rx: r * 5 + 3, ry: r * 16 + 6, fill: 'none', stroke: '#1a0b05', 'stroke-width': 1.3, 'stroke-opacity': 0.5 - r * 0.06 }, gr);
      el('ellipse', { cx: kx, cy: ky, rx: 6, ry: 14, fill: '#1a0b05', opacity: 0.7 }, gr);
      // celah papan: bayangan di kiri, kilap di kanan
      el('rect', { x, y: -10, width: 6, height: H + 20, fill: '#0e0603', opacity: 0.85 }, svg);
      el('rect', { x: x + 6, y: -10, width: 2.5, height: H + 20, fill: '#b9814f', opacity: 0.3 }, svg);
      for (const y of [60, H - 60]) { el('circle', { cx: x + pw / 2, cy: y, r: 6, fill: '#2a160b' }, svg); el('circle', { cx: x + pw / 2 - 1.5, cy: y - 1.5, r: 3, fill: '#9a6a40', opacity: 0.6 }, svg); }
    }
    // cahaya lampu minyak dari kiri-atas + bayangan pekat di tepi
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#ffc77a', 0.4], [0.4, '#ffa95a', 0.16], [1, '#ffa95a', 0]], 320, 620, 700) }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#000', 0], [0.5, '#0e0602', 0.12], [1, '#0e0602', 0.82]], 360, 720, 960) }, svg);
  }
  /** botol tinta + bulu pena */
  function inkwell(g, R, x, y) {
    const S = at(g, `translate(${x} ${y})`);
    el('ellipse', { cx: 14, cy: 40, rx: 54, ry: 16, fill: '#0d0603', opacity: 0.55, filter: 'url(#soft)' }, S);
    const d = 'M-36,34Q-42,4 -30,-8H30Q42,4 36,34Q0,44 -36,34Z';
    painted(S, d, { base: linGrad(S, [[0, '#3d4f6a'], [0.5, '#1d2738'], [1, '#0c1018']], -36, 0, 36, 30), n: 20, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${-30 + R() * 60},${-4 + R() * 34}h${6 + R() * 16}`, color: R() < 0.5 ? '#5a6f8f' : '#141b28', width: 3 + R() * 4, opacity: 0.4 }) });
    el('path', { d: 'M-24,-2Q-30,14 -24,28', fill: 'none', stroke: '#c9dcf2', 'stroke-width': 3, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, S);
    el('rect', { x: -18, y: -24, width: 36, height: 18, rx: 4, fill: linGrad(S, [[0, BRASS.hi], [0.4, BRASS.base], [1, BRASS.dark]], -18, -24, 18, -6), stroke: BRASS.deep, 'stroke-width': 1.2 }, S);
    // bulu pena condong ke kiri-atas
    const q = at(S, 'rotate(-38)');
    const vane = 'M0,-14C-18,-60 -14,-150 6,-210C22,-150 22,-60 6,-14Z';
    painted(q, vane, { base: linGrad(q, [[0, '#fbf3e4'], [0.6, '#efe2c8'], [1, '#d9c3a0']], 0, -14, 0, -210), n: 40, R, filter: 'impastoFine', cast: 'cast', stroke: () => { const t = R(); const y0 = -20 - t * 180; return { d: `M3,${y0}l${(R() < 0.5 ? -1 : 1) * (8 + R() * 10)},${-8 - R() * 10}`, color: R() < 0.7 ? '#e4d3b2' : '#fffaf0', width: 1.5 + R() * 2.5, opacity: 0.6 }; } });
    el('path', { d: 'M4,20L4,-200', stroke: '#b89a6e', 'stroke-width': 2, 'stroke-linecap': 'round' }, q);
    el('path', { d: 'M0,-150C-10,-170 -6,-196 6,-210C10,-190 8,-170 0,-150Z', fill: VERM.base, opacity: 0.85 }, q);
  }
  /** kompas kuningan kecil */
  function brassCompass(g, R, x, y, r) {
    const S = at(g, `translate(${x} ${y})`);
    el('ellipse', { cx: 10, cy: 16, rx: r * 1.1, ry: r, fill: '#0d0603', opacity: 0.55, filter: 'url(#soft)' }, S);
    el('circle', { r, fill: linGrad(S, [[0, BRASS.hi], [0.3, BRASS.light], [0.6, BRASS.base], [1, BRASS.dark]], -r, -r, r, r), stroke: BRASS.deep, 'stroke-width': 2 }, S);
    el('circle', { r: r * 0.8, fill: radGrad(S, [[0, '#fbf2dc'], [0.8, '#ead7ac'], [1, '#c4a36a']], -r * 0.2, -r * 0.2, r), stroke: BRASS.dark, 'stroke-width': 1.5 }, S);
    for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2; el('path', { d: `M${Math.cos(a) * r * 0.72},${Math.sin(a) * r * 0.72}L${Math.cos(a) * r * 0.79},${Math.sin(a) * r * 0.79}`, stroke: INK, 'stroke-width': i % 8 ? 0.8 : 1.6 }, S); }
    const n = at(S, 'rotate(24)');
    el('path', { d: `M0,${-r * 0.62}L${r * 0.09},0L0,${r * 0.62}L${-r * 0.09},0Z`, fill: '#e9e2d3', stroke: INK, 'stroke-width': 1 }, n);
    el('path', { d: `M0,${-r * 0.62}L${r * 0.09},0H${-r * 0.09}Z`, fill: VERM.base }, n);
    el('circle', { r: r * 0.07, fill: BRASS.base, stroke: BRASS.deep, 'stroke-width': 1 }, S);
    el('ellipse', { cx: -r * 0.32, cy: -r * 0.4, rx: r * 0.3, ry: r * 0.13, fill: '#fff', opacity: 0.45, transform: `rotate(-35 ${-r * 0.32} ${-r * 0.4})` }, S);
    el('circle', { cy: -r - 10, r: 9, fill: 'none', stroke: BRASS.base, 'stroke-width': 5 }, S);
  }
  /** koin emas */
  function coin(g, x, y, r, rot = 0, tilt = 0.45) {
    const S = at(g, `translate(${x} ${y}) rotate(${rot})`);
    el('ellipse', { cx: 2, cy: r * tilt + 3, rx: r, ry: r * tilt, fill: '#1a0c05', opacity: 0.35, filter: 'url(#blur2)' }, S);
    el('ellipse', { cx: 0, cy: 2.5, rx: r, ry: r * tilt, fill: BRASS.dark }, S);
    el('ellipse', { rx: r, ry: r * tilt, fill: linGrad(S, [[0, BRASS.hi], [0.35, BRASS.light], [0.7, BRASS.base], [1, BRASS.mid]], -r, -r * tilt, r, r * tilt), stroke: BRASS.mid, 'stroke-width': 1 }, S);
    el('ellipse', { rx: r * 0.72, ry: r * tilt * 0.72, fill: 'none', stroke: BRASS.dark, 'stroke-width': 1, 'stroke-opacity': 0.6 }, S);
    const m = at(S, `scale(${r / 40} ${(r * tilt) / 40})`);
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill: BRASS.mid, opacity: 0.55, transform: `rotate(${i * 72}) scale(0.9)` }, m);
  }

  /* ═════════════════════ GULUNGAN PETA ═════════════════════ */
  const RW = 800, RH = 150;
  /** satu gulungan perkamen melintang (tepi kiri-kanan berupa spiral) */
  function roll(g, R) {
    const y0 = 16, y1 = 134, cy = (y0 + y1) / 2, ry = (y1 - y0) / 2;
    el('ellipse', { cx: RW / 2 + 10, cy: y1 + 2, rx: RW / 2 - 10, ry: 10, fill: '#1a0c05', opacity: 0.45, filter: 'url(#soft)' }, g);
    const d = `M40,${y0}H${RW - 40}A19,${ry} 0 0 1 ${RW - 40},${y1}H40A19,${ry} 0 0 1 40,${y0}Z`;
    const T = [[0, '#fff4d8'], [0.22, '#f4e2b8'], [0.55, '#dcbf88'], [0.85, '#b38e58'], [1, '#8a6738']];
    const p = painted(g, d, {
      base: linGrad(g, T, 0, y0, 0, y1), n: 120, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 20 + R() * (RW - 60), v = R(); return { d: `M${x},${y0 + v * (y1 - y0)}h${30 + R() * 90}`, color: jitter(ramp(T, v), 5, R), width: 3 + R() * 7, opacity: 0.3 + R() * 0.35 }; },
    });
    el('rect', { x: 0, y: y0, width: RW, height: y1 - y0, fill: kawung(g, '#9c7a4a', 40, 1), opacity: 0.12 }, p.inner);
    // noda & tepi kertas yang menguning
    for (let i = 0; i < 14; i++) el('ellipse', { cx: 50 + R() * (RW - 100), cy: y0 + 10 + R() * (y1 - y0 - 20), rx: 10 + R() * 40, ry: 5 + R() * 10, fill: '#b48a52', opacity: 0.12 + R() * 0.12, filter: 'url(#blur2)' }, p.inner);
    el('path', { d: `M40,${y0 + 12}H${RW - 40}`, stroke: '#fffaf0', 'stroke-width': 3, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, p.inner);
    el('path', { d: `M40,${y1 - 9}H${RW - 40}`, stroke: '#6a4a26', 'stroke-width': 2, 'stroke-opacity': 0.4 }, p.inner);
    // tepi kertas terluar (lidah gulungan) sedikit menonjol
    el('path', { d: `M60,${y1 - 4}Q${RW / 2},${y1 + 6} ${RW - 60},${y1 - 4}`, fill: 'none', stroke: '#c9a874', 'stroke-width': 3, 'stroke-opacity': 0.8 }, g);
    // penampang spiral di kedua ujung
    for (const ex of [40, RW - 40]) {
      el('ellipse', { cx: ex, cy, rx: 19, ry, fill: radGrad(g, [[0, '#7a5a30'], [0.5, '#d9bf8c'], [1, '#f4e2b8']], ex - 2, cy, ry), stroke: '#7a5a30', 'stroke-width': 1.4 }, g);
      let sp = `M${ex},${cy}`;
      for (let a = 0; a < Math.PI * 7; a += 0.3) { const rr = (a / (Math.PI * 7)) * ry * 0.92; sp += `L${(ex + Math.cos(a) * rr * 0.34).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`; }
      el('path', { d: sp, fill: 'none', stroke: '#8a6738', 'stroke-width': 1.1, 'stroke-opacity': 0.75 }, g);
    }
  }
  /** tali goni yang mengikat dua gulungan + ekor simpul; kanvas 300×320, pusat (150,150) */
  function twine(g, R) {
    const band = (x) => {
      const d = `M${x},8Q${x + 9},150 ${x},292`;
      el('path', { d, fill: 'none', stroke: '#1a0c05', 'stroke-width': 12, 'stroke-opacity': 0.3, filter: 'url(#blur2)', transform: 'translate(3 4)' }, g);
      el('path', { d, fill: 'none', stroke: '#6a4626', 'stroke-width': 10, 'stroke-linecap': 'round' }, g);
      el('path', { d, fill: 'none', stroke: '#c9a26a', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      el('path', { d, fill: 'none', stroke: '#8a6238', 'stroke-width': 7, 'stroke-dasharray': '3 5', 'stroke-linecap': 'round' }, g);
      el('path', { d: `M${x - 1.5},12Q${x + 6},150 ${x - 1.5},288`, fill: 'none', stroke: '#f2dcae', 'stroke-width': 1.5, 'stroke-opacity': 0.8 }, g);
    };
    band(136);
    band(164);
    // ekor simpul yang menjuntai
    for (const [d, w] of [['M150,160C126,184 112,226 118,290', 7], ['M150,160C172,190 194,224 186,280', 7]]) {
      el('path', { d, fill: 'none', stroke: '#1a0c05', 'stroke-width': w + 4, 'stroke-opacity': 0.25, filter: 'url(#blur2)', transform: 'translate(3 4)' }, g);
      el('path', { d, fill: 'none', stroke: '#6a4626', 'stroke-width': w + 3, 'stroke-linecap': 'round' }, g);
      el('path', { d, fill: 'none', stroke: '#c9a26a', 'stroke-width': w, 'stroke-linecap': 'round' }, g);
      el('path', { d, fill: 'none', stroke: '#8a6238', 'stroke-width': w, 'stroke-dasharray': '3 5', 'stroke-linecap': 'round' }, g);
    }
    for (const [x, y] of [[118, 290], [186, 280]]) for (let k = 0; k < 5; k++) el('path', { d: `M${x},${y}l${(k - 2) * 3},${8 + R() * 6}`, stroke: '#a8834e', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, g);
  }
  /** segel lilin merah; kanvas 200×200, pusat (100,100) */
  function seal(g, R) {
    const c = [100, 100];
    el('ellipse', { cx: 106, cy: 112, rx: 74, ry: 70, fill: '#1a0c05', opacity: 0.45, filter: 'url(#soft)' }, g);
    // lelehan lilin tak beraturan
    const drip = blob(100, 100, 76, 72, R, 16, 0.12);
    shape(g, drip, [20, 20, 160, 160], [VERM.deep, VERM.dark, VERM.base], R, { n: 30, dir: [1, 0.6], width: [6, 12], len: [10, 30], base: radGrad(g, [[0, VERM.base], [0.7, VERM.dark], [1, VERM.deep]], 84, 80, 100) });
    // cakram cap
    el('circle', { cx: c[0], cy: c[1], r: 54, fill: radGrad(g, [[0, VERM.light], [0.55, VERM.base], [1, VERM.dark]], 86, 82, 70) }, g);
    el('circle', { cx: c[0], cy: c[1], r: 54, fill: 'none', stroke: VERM.deep, 'stroke-width': 3, 'stroke-opacity': 0.7 }, g);
    el('circle', { cx: c[0] - 1, cy: c[1] - 1.5, r: 47, fill: 'none', stroke: VERM.hi, 'stroke-width': 1.6, 'stroke-opacity': 0.55 }, g);
    el('circle', { cx: c[0], cy: c[1], r: 44, fill: 'none', stroke: VERM.deep, 'stroke-width': 2, 'stroke-opacity': 0.55, 'stroke-dasharray': '2 4' }, g);
    // kamboja timbul + bintang mawar angin di belakangnya
    const m = at(g, `translate(${c[0]} ${c[1]})`);
    for (let i = 0; i < 4; i++) {
      el('path', { d: 'M0,-38L5,-6L0,0L-5,-6Z', fill: VERM.deep, opacity: 0.55, transform: `rotate(${i * 90 + 45})` }, m);
    }
    for (let i = 0; i < 5; i++) {
      el('path', { d: MARK, fill: VERM.deep, opacity: 0.6, transform: `translate(1.4 1.8) rotate(${i * 72}) scale(1.25)` }, m);
      el('path', { d: MARK, fill: VERM.light, opacity: 0.95, transform: `rotate(${i * 72}) scale(1.25)` }, m);
      el('path', { d: 'M0,-3C3,-9 3,-15 0,-19', fill: 'none', stroke: VERM.hi, 'stroke-width': 1.3, 'stroke-opacity': 0.8, transform: `rotate(${i * 72}) scale(1.25)` }, m);
    }
    el('circle', { r: 5, fill: VERM.dark }, m);
    el('ellipse', { cx: 72, cy: 66, rx: 16, ry: 8, fill: '#fff', opacity: 0.4, transform: 'rotate(-40 72 66)' }, g);
  }
  /** label kertas untuk nama penerima; kanvas 240×130, lubang tali di kiri */
  function tag(g, R) {
    const d = 'M48,18H220Q228,18 228,26V104Q228,112 220,112H48L16,65Z';
    const p = shape(g, d, [16, 18, 212, 94], ['#d8bf8e', '#f6e8c8', '#fffaf0'], R, { n: 50, dir: [1, 0.04], width: [8, 18], cast: 'castBig' });
    el('path', { d, fill: kawung(g, '#b9975c', 40, 1), opacity: 0.12 }, p.inner);
    el('path', { d: 'M56,28H214Q218,28 218,32V98Q218,102 214,102H56', fill: 'none', stroke: VERM.base, 'stroke-width': 1.6, 'stroke-opacity': 0.6, 'stroke-dasharray': '6 4' }, p.inner);
    el('circle', { cx: 40, cy: 65, r: 7, fill: '#5a3a1a' }, g);
    el('circle', { cx: 40, cy: 65, r: 10, fill: 'none', stroke: '#c9a26b', 'stroke-width': 2.6 }, g);
  }
  /** kunci kuningan antik, gagang kamboja di kiri; kanvas 320×120, pusat lubang gagang (62,60) */
  function key(g, R) {
    el('path', { d: 'M110,74H286V96H264V86H248V100H230V74', fill: '#1a0c05', opacity: 0.35, filter: 'url(#blur2)', transform: 'translate(4 6)' }, g);
    el('circle', { cx: 66, cy: 66, r: 50, fill: '#1a0c05', opacity: 0.35, filter: 'url(#blur2)' }, g);
    const metal = (d, cast) => painted(g, d, { base: linGrad(g, [[0, BRASS.hi], [0.25, BRASS.light], [0.6, BRASS.base], [1, BRASS.dark]], 0, 10, 0, 110), n: 40, R, filter: 'impastoFine', cast, stroke: () => { const x = R() * 300, y = 10 + R() * 100; return { d: `M${x},${y}h${10 + R() * 30}`, color: jitter(R() < 0.5 ? BRASS.light : BRASS.mid, 6, R), width: 2 + R() * 4, opacity: 0.35 }; } });
    // batang & gigi
    metal('M100,52H272Q282,52 282,60V66H290V80H282V96H266V84H252V98H236V84H226V68H100Z', 'cast');
    el('path', { d: 'M104,56H270', stroke: BRASS.hi, 'stroke-width': 2.4, 'stroke-opacity': 0.9, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M100,67H226', stroke: BRASS.deep, 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, g);
    for (const x of [112, 124]) el('rect', { x, y: 47, width: 6, height: 26, rx: 2, fill: BRASS.base, stroke: BRASS.deep, 'stroke-width': 1.2 }, g);
    // gagang: lingkar dengan kamboja berongga
    const bow = 'M62,8A52,52 0 1 1 61.9,8ZM62,24A36,36 0 1 0 62.1,24Z';
    metal(bow, 'cast');
    el('path', { d: 'M62,10A50,50 0 0 0 16,46', fill: 'none', stroke: BRASS.hi, 'stroke-width': 3, 'stroke-opacity': 0.85, 'stroke-linecap': 'round' }, g);
    const m = at(g, 'translate(62 60) scale(1.62)');
    for (let i = 0; i < 5; i++) { el('path', { d: MARK, fill: BRASS.base, stroke: BRASS.deep, 'stroke-width': 0.8, transform: `rotate(${i * 72})` }, m); el('path', { d: 'M0,-3C3,-9 3,-15 0,-18', fill: 'none', stroke: BRASS.hi, 'stroke-width': 1, transform: `rotate(${i * 72})` }, m); }
    el('circle', { cx: 62, cy: 60, r: 4.5, fill: BRASS.dark }, g);
    // pita merah kecil di gagang
    el('path', { d: 'M24,30C8,22 4,6 14,4C22,4 22,18 24,30C30,16 40,10 42,18C44,26 34,30 24,30Z', fill: VERM.base, stroke: VERM.deep, 'stroke-width': 1.4 }, g);
  }

  /* ═════════════════════ PERAHU, BENDERA, X ═════════════════════ */
  /** perahu kertas dilihat dari samping, haluan di kanan; kanvas 170×120 */
  function paperBoat(g, R) {
    el('ellipse', { cx: 88, cy: 98, rx: 70, ry: 8, fill: '#1e4f58', opacity: 0.35, filter: 'url(#blur2)' }, g);
    // lambung
    const hull = 'M8,58H162L132,96H38Z';
    shape(g, hull, [8, 58, 154, 38], ['#d4c09a', '#f3ead4', '#fffcf2'], R, { n: 24, dir: [1, 0.1], width: [4, 9], len: [10, 30], cast: 'cast', base: linGrad(g, [[0, '#fffcf2'], [0.6, '#efe3c6'], [1, '#d4c09a']], 0, 58, 0, 96) });
    el('path', { d: 'M38,96L64,58M132,96L106,58', stroke: '#b89f74', 'stroke-width': 1.4, 'stroke-opacity': 0.7 }, g);
    // layar segitiga (dua sisi lipatan)
    el('path', { d: 'M64,58L85,6L106,58Z', fill: '#fbf5e6', stroke: '#8a7350', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M85,6L106,58H85Z', fill: '#e6d8b8' }, g);
    el('path', { d: 'M85,8V58', stroke: '#b89f74', 'stroke-width': 1.2 }, g);
    el('path', { d: hull, fill: 'none', stroke: '#8a7350', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g);
    // garis tulisan samar di kertas (bekas surat)
    for (const y of [68, 76, 84]) el('path', { d: `M${36 + (y - 68) * 0.5},${y}H${130 - (y - 68) * 0.5}`, stroke: '#6a7fa0', 'stroke-width': 1.1, 'stroke-opacity': 0.35, 'stroke-dasharray': '10 4 18 5' }, g);
    // bendera kecil di puncak
    el('path', { d: 'M85,6V-4', stroke: INK, 'stroke-width': 1.6 }, g);
    el('path', { d: 'M85,-4L104,2L85,8Z', fill: VERM.base, stroke: VERM.deep, 'stroke-width': 1 }, g);
    // percik air
    for (const [x, y] of [[10, 92], [22, 98], [156, 92], [146, 100]]) el('path', { d: `M${x},${y}q5,-5 10,0`, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, g);
  }
  /** bendera kecil tertancap; kanvas 80×120, kaki tiang di (24,112) */
  function flag(g, R) {
    el('ellipse', { cx: 30, cy: 113, rx: 16, ry: 4, fill: '#4a2a10', opacity: 0.4, filter: 'url(#blur2)' }, g);
    el('path', { d: 'M24,112V10', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M24,112V10', stroke: '#b08348', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
    const d = 'M26,12C40,8 52,18 70,12L66,30L72,48C54,54 42,44 26,48Z';
    shape(g, d, [26, 8, 46, 46], [VERM.dark, VERM.base, VERM.light], R, { n: 16, dir: [1, 0.1], width: [4, 8], len: [8, 24], cast: 'cast' });
    el('path', { d: 'M30,18C42,15 52,22 64,18', fill: 'none', stroke: VERM.hi, 'stroke-width': 1.6, 'stroke-opacity': 0.7 }, g);
    const m = at(g, 'translate(46 30) scale(0.5)');
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill: '#fff1d6', opacity: 0.95, transform: `rotate(${i * 72})` }, m);
    el('circle', { cx: 24, cy: 8, r: 4, fill: BRASS.light, stroke: BRASS.dark, 'stroke-width': 1 }, g);
  }
  /** tanda X merah dengan sapuan kuas; kanvas 170×170 */
  function bigX(g, R) {
    const stroke = (x0, y0, x1, y1, w) => {
      const d = `M${x0},${y0}Q${(x0 + x1) / 2 + 6},${(y0 + y1) / 2 - 4} ${x1},${y1}`;
      el('path', { d, fill: 'none', stroke: '#5a1a10', 'stroke-width': w + 6, 'stroke-opacity': 0.3, 'stroke-linecap': 'round', filter: 'url(#blur2)', transform: 'translate(3 4)' }, g);
      const gg = el('g', { filter: 'url(#impastoFine)' }, g);
      el('path', { d, fill: 'none', stroke: VERM.base, 'stroke-width': w, 'stroke-linecap': 'round' }, gg);
      for (let i = 0; i < 6; i++) el('path', { d, fill: 'none', stroke: R() < 0.5 ? VERM.light : VERM.dark, 'stroke-width': w * (0.2 + R() * 0.3), 'stroke-opacity': 0.5, 'stroke-linecap': 'round', transform: `translate(${(R() - 0.5) * w * 0.5} ${(R() - 0.5) * w * 0.5})`, 'stroke-dasharray': `${20 + R() * 60} ${6 + R() * 20}` }, gg);
    };
    stroke(30, 28, 140, 142, 26);
    stroke(142, 26, 28, 140, 24);
    for (let i = 0; i < 10; i++) el('circle', { cx: 85 + (R() - 0.5) * 150, cy: 85 + (R() - 0.5) * 150, r: 1.5 + R() * 3, fill: VERM.base, opacity: 0.7 }, g);
  }
  /** kepiting kecil dengan capit terangkat (titik iseng); kanvas 220×170 — mata & mulut dari DOM */
  const CRAB = { dark: '#a33a22', base: '#e6643f', light: '#ff9a6e', hi: '#ffd0b0' };
  function crab(g, R) {
    el('ellipse', { cx: 112, cy: 150, rx: 84, ry: 11, fill: '#4a2a10', opacity: 0.38, filter: 'url(#soft)' }, g);
    const limb = (d, w) => {
      el('path', { d, fill: 'none', stroke: INK, 'stroke-width': w + 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      el('path', { d, fill: 'none', stroke: CRAB.base, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      el('path', { d, fill: 'none', stroke: CRAB.light, 'stroke-width': w * 0.3, 'stroke-opacity': 0.8, 'stroke-linecap': 'round', transform: 'translate(-1 -2)' }, g);
    };
    for (let i = 0; i < 3; i++) {
      limb(`M${64 + i * 8},${112 + i * 5}L${30 - i * 2},${108 + i * 10}L${18 + i * 7},${140 + i * 4}`, 7 - i);
      limb(`M${156 - i * 8},${112 + i * 5}L${190 + i * 2},${108 + i * 10}L${202 - i * 7},${140 + i * 4}`, 7 - i);
    }
    limb('M98,74Q95,58 94,46', 5);
    limb('M122,74Q125,58 126,46', 5);
    limb('M66,96L38,72L36,46', 10);
    limb('M154,96L182,72L184,46', 10);
    const claw = (x, y, rot) => {
      const c = at(g, `translate(${x} ${y}) rotate(${rot})`);
      const d = 'M0,12C-18,8 -22,-16 -8,-28C-3,-33 2,-30 0,-23C-2,-16 0,-11 5,-10C7,-18 10,-30 17,-28C25,-15 20,8 0,12Z';
      shape(c, d, [-22, -34, 46, 48], [CRAB.dark, CRAB.base, CRAB.light], R, { n: 12, dir: [0.2, 1], width: [3, 7], len: [6, 18], cast: 'cast', base: radGrad(g, [[0, CRAB.light], [0.55, CRAB.base], [1, CRAB.dark]], -6, -14, 34) });
      el('path', { d, fill: 'none', stroke: INK, 'stroke-width': 1.6 }, c);
    };
    claw(36, 40, -14);
    claw(184, 40, 14);
    const d = 'M52,116Q44,80 80,68Q110,58 140,68Q176,80 168,116Q156,138 110,140Q64,138 52,116Z';
    const p = painted(g, d, {
      base: radGrad(g, [[0, CRAB.light], [0.5, CRAB.base], [1, CRAB.dark]], 92, 82, 100), n: 50, R, filter: 'impasto', cast: 'castBig',
      stroke: () => { const x = 52 + R() * 116, y = 66 + R() * 70, L = 12 + R() * 30; const lit = (x - 52) / 116 + (y - 66) / 70 < 0.85; return { d: `M${x},${y}q${L / 2},${-4 + R() * 3} ${L},${(R() - 0.5) * 5}`, color: jitter(mix(CRAB.base, lit ? CRAB.light : CRAB.dark, R() * 0.7), 6, R), width: 4 + R() * 7, opacity: 0.35 + R() * 0.4 }; },
    });
    el('path', { d: 'M68,84Q86,70 110,68', fill: 'none', stroke: '#fff0e2', 'stroke-width': 3.4, 'stroke-opacity': 0.6, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
    ink(g, d, 2, 0.9);
  }

  /* ═════════════════════ GALIAN ═════════════════════ */
  /** gundukan pasir di atas tanda X; kanvas 360×200, dasar di y≈176 */
  function mound(g, R) {
    const MC = ['#a0703a', '#d9b070', '#f7e3b2'];
    el('ellipse', { cx: 196, cy: 180, rx: 172, ry: 24, fill: '#4a2a10', opacity: 0.45, filter: 'url(#soft)' }, g);
    const d = 'M14,176C30,150 70,96 130,84C170,74 216,76 252,92C304,112 336,150 348,176Q180,196 14,176Z';
    shape(g, d, [14, 74, 334, 120], MC, R, { n: 140, dir: [1, -0.25], width: [6, 16], len: [14, 44], filter: 'impasto', cast: 'castBig', base: radGrad(g, [[0, MC[2]], [0.45, MC[1]], [1, MC[0]]], 120, 84, 250) });
    // sisi teduh kanan-bawah & kilap kiri-atas
    const c = clip(g, d);
    el('path', { d: 'M200,200C300,180 340,150 330,120C360,150 370,200 200,200Z', fill: '#7a4e22', opacity: 0.35, filter: 'url(#soft)' }, c);
    el('path', { d: 'M60,140C90,100 130,86 176,84', fill: 'none', stroke: '#fff6dc', 'stroke-width': 10, 'stroke-opacity': 0.55, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, c);
    dabs(g, { n: 240, R, filter: null, place: (i, R2) => { const t = R2(); const x = 30 + R2() * 300, y = 96 + R2() * 80; return { x, y, rx: 0.8 + R2() * 1.8, color: t < 0.5 ? '#7d552a' : t < 0.8 ? '#fff6e0' : '#c99a5a', opacity: 0.4 + R2() * 0.4 }; } });
    // kerikil & kerang kecil
    for (const [x, y, r, col] of [[96, 150, 6, '#a99886'], [262, 140, 5, '#f4e2cf'], [180, 166, 4, '#8f7a68']]) { el('ellipse', { cx: x + 2, cy: y + 3, rx: r * 1.3, ry: r * 0.8, fill: '#4a2a10', opacity: 0.3 }, g); el('ellipse', { cx: x, cy: y, rx: r * 1.3, ry: r * 0.85, fill: col }, g); }
    el('path', { d, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-opacity': 0.45, filter: 'url(#wobble)' }, g);
  }
  /** gumpal pasir yang tersapu; kanvas 160×110 */
  function clump(g, R) {
    const d = blob(80, 58, 62, 38, R, 12, 0.26);
    shape(g, d, [16, 18, 128, 80], SANDC, R, { n: 46, dir: [1, 0.3], width: [6, 14], len: [10, 34], filter: 'impasto', cast: 'cast', base: radGrad(g, [[0, SANDC[2]], [0.6, SANDC[1]], [1, SANDC[0]]], 64, 44, 80) });
    for (let i = 0; i < 70; i++) { const k = R(); el('circle', { cx: 22 + R() * 116, cy: 24 + R() * 70, r: 0.8 + R() * 1.6, fill: k < 0.5 ? '#7d5a32' : '#fff4da', opacity: 0.4 + R() * 0.4 }, g); }
  }
  /** lubang galian; kanvas 320×170 */
  function hole(g, R) {
    const rim = 'M20,90C24,48 96,22 160,22C224,22 296,48 300,90C296,134 224,156 160,156C96,156 24,134 20,90Z';
    shape(g, rim, [20, 22, 280, 134], SANDC, R, { n: 70, dir: [1, 0.15], width: [6, 14], len: [14, 40], filter: 'impasto', base: radGrad(g, [[0, SANDC[1]], [1, SANDC[0]]], 160, 60, 160) });
    const pit = 'M52,92C56,62 110,44 160,44C210,44 264,62 268,92C264,122 210,138 160,138C110,138 56,122 52,92Z';
    el('path', { d: pit, fill: radGrad(g, [[0, '#1e0f06'], [0.6, '#3a220f'], [1, '#7a5228']], 160, 110, 130) }, g);
    // dinding lubang: sisi atas (jauh) terkena cahaya
    el('path', { d: 'M56,88C64,62 114,48 160,48C206,48 256,62 264,88C240,70 200,62 160,62C120,62 80,70 56,88Z', fill: '#a47a44', opacity: 0.9 }, g);
    el('path', { d: pit, fill: 'none', stroke: '#5a3a1a', 'stroke-width': 2.4 }, g);
    for (let i = 0; i < 40; i++) { const a = R() * Math.PI * 2, r = 1 + R() * 0.12; el('circle', { cx: 160 + Math.cos(a) * 122 * r, cy: 90 + Math.sin(a) * 58 * r, r: 2 + R() * 4, fill: R() < 0.5 ? SANDC[1] : SANDC[0], opacity: 0.85 }, g); }
  }

  /* ═════════════════════ PETI HARTA ═════════════════════ */
  /** kanvas badan peti 520×340: bibir atas (rongga) y 96–142, muka depan y 142–326 */
  const CB = { x0: 34, x1: 486, top: 96, rim: 142, bot: 326 };
  const WOOD = [[0, '#3b1f10'], [0.3, '#5e3219'], [0.65, '#8a4f28'], [1, '#b06e3a']];
  const plankFill = (g, d, box, R, { dir = [1, 0.02], n = 90, light = 0.55 } = {}) => painted(g, d, {
    base: linGrad(g, [[0, ramp(WOOD, light + 0.2)], [1, ramp(WOOD, light - 0.25)]], box[0], box[1], box[0] + box[2] * 0.4, box[1] + box[3]), n, R, filter: 'impasto', cast: 'cast',
    stroke: () => { const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = 30 + R() * 120; return { d: `M${x},${y}q${L / 2},${(R() - 0.5) * 6} ${L},${(R() - 0.5) * 4}`, color: jitter(ramp(WOOD, light + (R() - 0.5) * 0.5), 6, R), width: 2 + R() * 6, opacity: 0.3 + R() * 0.45 }; },
  });
  /** pita logam kuningan */
  function brassBand(g, R, d, box, { vertical = false } = {}) {
    painted(g, d, {
      base: linGrad(g, [[0, BRASS.hi], [0.2, BRASS.light], [0.55, BRASS.base], [1, BRASS.dark]], box[0], box[1], vertical ? box[0] + box[2] : box[0], vertical ? box[1] : box[1] + box[3]), n: 30, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = box[0] + R() * box[2], y = box[1] + R() * box[3]; return vertical ? { d: `M${x},${y}v${8 + R() * 30}`, color: jitter(R() < 0.5 ? BRASS.light : BRASS.mid, 5, R), width: 2 + R() * 3, opacity: 0.35 } : { d: `M${x},${y}h${8 + R() * 30}`, color: jitter(R() < 0.5 ? BRASS.light : BRASS.mid, 5, R), width: 2 + R() * 3, opacity: 0.35 }; },
    });
  }
  const rivets = (g, pts, r = 4.5) => pts.forEach(([x, y]) => { el('circle', { cx: x + 1, cy: y + 1.5, r, fill: BRASS.deep, opacity: 0.6 }, g); el('circle', { cx: x, cy: y, r, fill: radGrad(g, [[0, BRASS.hi], [0.5, BRASS.light], [1, BRASS.mid]], x - 1.5, y - 1.5, r * 1.4) }, g); });
  function chestBody(g, R) {
    const { x0, x1, top, rim, bot } = CB;
    el('ellipse', { cx: 266, cy: bot + 2, rx: 250, ry: 18, fill: '#1a0c05', opacity: 0.5, filter: 'url(#soft)' }, g);
    // rongga dalam (terlihat saat tutup terbuka): gelap, papan belakang
    const cav = `M${x0 + 10},${rim}L${x0 + 22},${top}H${x1 - 22}L${x1 - 10},${rim}Z`;
    el('path', { d: cav, fill: linGrad(g, [[0, '#2a1409'], [1, '#120803']], 0, top, 0, rim) }, g);
    for (let i = 1; i < 6; i++) el('path', { d: `M${x0 + 22 + i * 70},${top}V${rim}`, stroke: '#3e2210', 'stroke-width': 2, 'stroke-opacity': 0.8 }, g);
    // muka depan: tiga papan mendatar
    const face = `M${x0},${rim}H${x1}V${bot - 10}Q${x1},${bot} ${x1 - 10},${bot}H${x0 + 10}Q${x0},${bot} ${x0},${bot - 10}Z`;
    plankFill(g, face, [x0, rim, x1 - x0, bot - rim], R, { n: 140 });
    const f = clip(g, face);
    for (const y of [rim + 62, rim + 124]) { el('path', { d: `M${x0},${y}H${x1}`, stroke: '#241006', 'stroke-width': 3.4, 'stroke-opacity': 0.8 }, f); el('path', { d: `M${x0},${y + 3}H${x1}`, stroke: '#c48450', 'stroke-width': 1.4, 'stroke-opacity': 0.5 }, f); }
    el('rect', { x: x0, y: rim, width: x1 - x0, height: bot - rim, fill: linGrad(g, [[0, '#fff0c8', 0.16], [0.5, '#000', 0], [1, '#1a0904', 0.35]], x0, rim, x1, bot) }, f);
    // bibir depan (tebal papan) di atas muka
    const lip = `M${x0 - 4},${rim - 12}H${x1 + 4}V${rim + 6}H${x0 - 4}Z`;
    plankFill(g, lip, [x0 - 4, rim - 12, x1 - x0 + 8, 18], R, { n: 30, light: 0.7 });
    // pita kuningan: dua tegak + bawah + sudut
    for (const x of [x0 + 74, x1 - 74 - 30]) { brassBand(g, R, `M${x},${rim - 12}H${x + 30}V${bot}H${x}Z`, [x, rim - 12, 30, bot - rim + 12], { vertical: true }); rivets(g, [[x + 15, rim + 4], [x + 15, rim + 62], [x + 15, rim + 124], [x + 15, bot - 12]]); }
    brassBand(g, R, `M${x0 - 4},${bot - 26}H${x1 + 4}V${bot - 4}Q${x1 + 4},${bot + 2} ${x1 - 4},${bot + 2}H${x0 + 4}Q${x0 - 4},${bot + 2} ${x0 - 4},${bot - 4}Z`, [x0 - 4, bot - 26, x1 - x0 + 8, 28]);
    rivets(g, [[x0 + 14, bot - 14], [x0 + 46, bot - 14], [x1 - 46, bot - 14], [x1 - 14, bot - 14], [260, bot - 14]], 4);
    for (const [cx0, sgn] of [[x0, 1], [x1, -1]]) { brassBand(g, R, `M${cx0},${rim - 12}h${sgn * 36}v14h${-sgn * 22}v${bot - rim - 30}h${-sgn * 14}Z`, [Math.min(cx0, cx0 + sgn * 36), rim - 12, 36, bot - rim]); }
    // pelat gembok di tengah
    const plate = 'M226,146H294V214Q294,226 282,232L260,242L238,232Q226,226 226,214Z';
    brassBand(g, R, plate, [226, 146, 68, 96]);
    el('path', { d: plate, fill: 'none', stroke: BRASS.deep, 'stroke-width': 2 }, g);
    rivets(g, [[236, 156], [284, 156], [236, 214], [284, 214]], 3.6);
    // gelang tempat gembok tergantung
    el('path', { d: 'M248,178A12,12 0 1 1 272,178', fill: 'none', stroke: BRASS.deep, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M248,178A12,12 0 1 1 272,178', fill: 'none', stroke: BRASS.light, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, g);
    // kamboja kecil terselip di sudut kiri bawah (sentuhan floa)
    F.leaf(g, { len: 70, w: 30, ...F.flora.GREEN[1], R, n: 20, curve: 0.25, transform: `translate(${x0 + 20} ${bot - 8}) rotate(-60)` });
    F.flora.flowers.kamboja(at(g, `translate(${x0 + 30} ${bot - 18}) rotate(-14)`), R, 0.16);
  }
  /** tutup tertutup (kubah), kanvas 520×190; tepi bawah (y≈184) menutup bibir rongga */
  function lidClosed(g, R) {
    const d = 'M30,184V96C30,40 120,10 260,10C400,10 490,40 490,96V184Z';
    el('path', { d, fill: '#1a0c05', opacity: 0.35, filter: 'url(#soft)', transform: 'translate(4 8)' }, g);
    plankFill(g, d, [30, 10, 460, 174], R, { n: 150, light: 0.62 });
    const c = clip(g, d);
    for (const y of [60, 112]) { el('path', { d: `M20,${y}Q260,${y - 26} 500,${y}`, fill: 'none', stroke: '#241006', 'stroke-width': 3, 'stroke-opacity': 0.75 }, c); el('path', { d: `M20,${y + 3}Q260,${y - 23} 500,${y + 3}`, fill: 'none', stroke: '#d08a52', 'stroke-width': 1.3, 'stroke-opacity': 0.5 }, c); }
    el('rect', { x: 0, y: 0, width: 520, height: 190, fill: linGrad(g, [[0, '#ffe6b0', 0.3], [0.45, '#000', 0], [1, '#1a0904', 0.42]], 30, 10, 490, 184) }, c);
    el('path', { d: 'M60,70C100,32 180,20 250,20', fill: 'none', stroke: '#ffe1b0', 'stroke-width': 5, 'stroke-opacity': 0.45, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, c);
    // pita kuningan tutup
    for (const x of [104, 386]) { brassBand(g, R, `M${x},${x < 260 ? 22 : 22}Q${x + 15},${16} ${x + 30},${22}V184H${x}Z`, [x, 16, 30, 168], { vertical: true }); rivets(g, [[x + 15, 40], [x + 15, 100], [x + 15, 166]]); }
    brassBand(g, R, 'M26,160H494V188H26Z', [26, 160, 468, 28]);
    rivets(g, [[44, 174], [80, 174], [440, 174], [476, 174]], 4);
    // lidah kunci di depan tutup (masuk ke gelang di badan)
    brassBand(g, R, 'M238,150H282V198Q282,206 274,206H246Q238,206 238,198Z', [238, 150, 44, 56]);
    el('path', { d: 'M238,150H282V198Q282,206 274,206H246Q238,206 238,198Z', fill: 'none', stroke: BRASS.deep, 'stroke-width': 1.8 }, g);
    el('rect', { x: 252, y: 186, width: 16, height: 8, rx: 3, fill: BRASS.deep }, g);
    ink(g, d, 1.8, 0.6);
  }
  /** tutup terbuka (sisi dalam terlihat, condong ke belakang), kanvas 520×230; tepi bawah y≈222 = bibir belakang rongga */
  function lidOpen(g, R) {
    const d = 'M40,222L58,58C58,34 140,14 260,14C380,14 462,34 462,58L480,222Z';
    el('path', { d, fill: '#1a0c05', opacity: 0.35, filter: 'url(#soft)', transform: 'translate(4 -6)' }, g);
    painted(g, d, {
      base: linGrad(g, [[0, '#4a2614'], [1, '#2a140a']], 0, 12, 0, 222), n: 120, R, filter: 'impasto',
      stroke: () => { const x = 30 + R() * 460, y = 14 + R() * 206, L = 30 + R() * 110; return { d: `M${x},${y}h${L}`, color: jitter(ramp(WOOD, 0.2 + R() * 0.35), 6, R), width: 2 + R() * 6, opacity: 0.3 + R() * 0.4 }; },
    });
    const c = clip(g, d);
    for (const y of [70, 128, 180]) el('path', { d: `M20,${y}H500`, stroke: '#140802', 'stroke-width': 3, 'stroke-opacity': 0.75 }, c);
    // pantulan cahaya emas dari dalam peti di sisi dalam tutup
    el('ellipse', { cx: 260, cy: 210, rx: 230, ry: 120, fill: radGrad(g, [[0, '#ffd77a', 0.75], [0.5, '#ffb84a', 0.3], [1, '#ff9a3a', 0]], 260, 220, 240) }, c);
    // bingkai kuningan tepi tutup
    el('path', { d, fill: 'none', stroke: BRASS.dark, 'stroke-width': 12, 'stroke-linejoin': 'round' }, g);
    el('path', { d, fill: 'none', stroke: BRASS.light, 'stroke-width': 6, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M66,56C66,36 140,20 260,20', fill: 'none', stroke: BRASS.hi, 'stroke-width': 2.4, 'stroke-opacity': 0.8 }, g);
    // kain beludru merah di tengah tutup, berjahit emas
    const vel = 'M156,66Q260,52 364,66L370,184Q260,196 150,184Z';
    el('path', { d: vel, fill: radGrad(g, [[0, '#b83448'], [0.6, '#8a1f30'], [1, '#56101c']], 240, 110, 150) }, g);
    const vc = clip(g, vel);
    for (let i = 0; i < 9; i++) el('path', { d: `M${160 + i * 26},60Q${166 + i * 26},120 ${158 + i * 26},190`, fill: 'none', stroke: i % 2 ? '#c84a5c' : '#4a0c18', 'stroke-width': 6, 'stroke-opacity': 0.25, filter: 'url(#blur2)' }, vc);
    el('path', { d: vel, fill: 'none', stroke: BRASS.light, 'stroke-width': 2.6, 'stroke-dasharray': '3 5', 'stroke-linecap': 'round' }, g);
    const mk = at(g, 'translate(260 124) scale(1.3)');
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill: 'none', stroke: BRASS.light, 'stroke-width': 1.4, transform: `rotate(${i * 72})` }, mk);
    el('ellipse', { cx: 260, cy: 170, rx: 130, ry: 40, fill: '#ffcf70', opacity: 0.28, filter: 'url(#soft)' }, g);
    rivets(g, [[80, 80], [440, 80], [70, 190], [450, 190]], 4.5);
  }
  /** isi peti: tumpukan koin, mutiara, permata, kamboja; kanvas 470×190, dasar di y≈170 */
  function treasure(g, R) {
    const pile = 'M20,176C30,120 90,92 160,86C200,60 280,60 320,88C390,96 444,126 452,176Z';
    painted(g, pile, { base: radGrad(g, [[0, '#fff0b0'], [0.4, '#f1c65a'], [1, '#a06a1e']], 200, 90, 280), n: 120, R, filter: 'impastoFine', stroke: () => { const x = 20 + R() * 430, y = 60 + R() * 116; return { d: `M${x},${y}h${4 + R() * 12}`, color: R() < 0.5 ? BRASS.light : BRASS.mid, width: 3 + R() * 4, opacity: 0.5 }; } });
    const coins = [];
    for (let i = 0; i < 46; i++) { const x = 40 + R() * 390, top = 176 - (110 - Math.abs(x - 236) * 0.42) * (0.3 + R() * 0.7); coins.push([x, Math.max(70, top), 11 + R() * 9, (R() - 0.5) * 50]); }
    coins.sort((a, b) => a[1] - b[1]).forEach(([x, y, r, rot]) => coin(g, x, y, r, rot, 0.4 + R() * 0.2));
    // untaian mutiara
    let px = 70, py = 140;
    for (let i = 0; i < 18; i++) { const t = i / 17; px = 70 + t * 300; py = 120 + Math.sin(t * Math.PI) * -46 + 30; el('circle', { cx: px + 1, cy: py + 2, r: 7.5, fill: '#6a5a4a', opacity: 0.4 }, g); el('circle', { cx: px, cy: py, r: 7.5, fill: radGrad(g, [[0, '#ffffff'], [0.5, '#f4ece0'], [1, '#c9b8a6']], px - 2.5, py - 2.5, 9) }, g); }
    // permata
    const gem = (x, y, s, c1, c2) => { const S = at(g, `translate(${x} ${y}) scale(${s})`); el('path', { d: 'M-14,-4L-6,-14H6L14,-4L0,14Z', fill: c1, stroke: mix(c1, '#000', 0.5), 'stroke-width': 1.2 }, S); el('path', { d: 'M-14,-4H14M-6,-14L-4,-4L0,14M6,-14L4,-4', fill: 'none', stroke: c2, 'stroke-width': 1, 'stroke-opacity': 0.8 }, S); el('path', { d: 'M-8,-10L-4,-4H-12Z', fill: '#fff', opacity: 0.7 }, S); };
    gem(150, 96, 1.4, VERM.base, '#ffb4a0');
    gem(330, 100, 1.2, '#2f9f97', '#b8f0e0');
    gem(250, 70, 1.1, '#7a4fb0', '#d8c4f2');
    gem(100, 132, 1, '#2f9f97', '#b8f0e0');
    gem(400, 140, 1.1, VERM.base, '#ffb4a0');
    F.flora.flowers.kamboja(at(g, 'translate(386 108) rotate(20)'), R, 0.2);
    // kilau
    for (const [x, y, r] of [[180, 84, 9], [292, 76, 7], [120, 120, 6], [360, 118, 8]]) el('path', { d: `M${x},${y - r * 2}L${x + r * 0.3},${y - r * 0.3}L${x + r * 2},${y}L${x + r * 0.3},${y + r * 0.3}L${x},${y + r * 2}L${x - r * 0.3},${y + r * 0.3}L${x - r * 2},${y}L${x - r * 0.3},${y - r * 0.3}Z`, fill: '#fffbe6', opacity: 0.9 }, g);
  }
  /** gembok kuningan; kanvas 150×200, lengkung di atas, lubang kunci di depan */
  function padlock(g, R) {
    el('ellipse', { cx: 80, cy: 192, rx: 52, ry: 8, fill: '#1a0c05', opacity: 0.4, filter: 'url(#soft)' }, g);
    el('path', { d: 'M40,96V56A35,35 0 0 1 110,56V96', fill: 'none', stroke: BRASS.deep, 'stroke-width': 16, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M40,96V56A35,35 0 0 1 110,56V96', fill: 'none', stroke: '#b8b0a0', 'stroke-width': 11, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M36,90V56A39,39 0 0 1 60,20', fill: 'none', stroke: '#f2efe6', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-opacity': 0.9 }, g);
    const body = 'M18,96H132Q140,96 140,104V172Q140,190 122,190H28Q10,190 10,172V104Q10,96 18,96Z';
    brassBand(g, R, body, [10, 96, 130, 94]);
    el('path', { d: body, fill: 'none', stroke: BRASS.deep, 'stroke-width': 2.4 }, g);
    el('path', { d: 'M20,104H128', stroke: BRASS.hi, 'stroke-width': 3, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: 75, cy: 134, r: 12, fill: BRASS.deep }, g);
    el('path', { d: 'M69,138L65,166H85L81,138Z', fill: BRASS.deep }, g);
    el('circle', { cx: 75, cy: 134, r: 18, fill: 'none', stroke: BRASS.dark, 'stroke-width': 2.4 }, g);
    rivets(g, [[24, 110], [126, 110], [24, 176], [126, 176]], 3.6);
  }
  /** gulungan surat diikat pita merah; kanvas 280×100 */
  function letterScroll(g, R) {
    el('ellipse', { cx: 144, cy: 88, rx: 120, ry: 8, fill: '#1a0c05', opacity: 0.35, filter: 'url(#soft)' }, g);
    const d = 'M36,18H238A12,34 0 0 1 238,86H36A13,34 0 0 1 36,18Z';
    const T = [[0, '#fffdf5'], [0.3, '#fbf1d8'], [0.7, '#e9d6ad'], [1, '#c5a271']];
    const p = painted(g, d, { base: linGrad(g, T, 0, 18, 0, 86), n: 46, R, filter: 'impastoFine', cast: 'cast', stroke: () => { const x = 24 + R() * 200, v = R(); return { d: `M${x},${18 + v * 66}h${16 + R() * 40}`, color: jitter(ramp(T, v), 4, R), width: 3 + R() * 5, opacity: 0.3 + R() * 0.3 }; } });
    el('path', { d, fill: kawung(g, '#b9975c', 26, 0.8), opacity: 0.18 }, p.inner);
    el('path', { d: 'M38,26Q130,32 236,27', fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': 0.7 }, p.inner);
    el('ellipse', { cx: 238, cy: 52, rx: 12, ry: 34, fill: '#f6e8c8', stroke: '#a8855a', 'stroke-width': 1.3 }, g);
    for (const k of [0.68, 0.4, 0.15]) el('ellipse', { cx: 238, cy: 52, rx: 12 * k, ry: 34 * k, fill: 'none', stroke: '#a8855a', 'stroke-width': 1, 'stroke-opacity': 0.7 }, g);
    const th = el('g', { filter: 'url(#cast)' }, g);
    for (const x of [128, 140]) { el('path', { d: `M${x},17Q${x + 8},52 ${x},87`, fill: 'none', stroke: VERM.dark, 'stroke-width': 7, 'stroke-linecap': 'round' }, th); el('path', { d: `M${x},17Q${x + 8},52 ${x},87`, fill: 'none', stroke: VERM.base, 'stroke-width': 4.6, 'stroke-linecap': 'round' }, th); }
    el('path', { d: 'M134,20C112,0 98,10 108,24C116,32 134,20 134,20C156,0 170,10 160,24C152,32 134,20 134,20Z', fill: VERM.base, stroke: VERM.deep, 'stroke-width': 1.6 }, th);
    el('path', { d: 'M132,22L118,44M136,22L152,42', stroke: VERM.base, 'stroke-width': 5, 'stroke-linecap': 'round' }, th);
    el('circle', { cx: 134, cy: 21, r: 6, fill: VERM.dark }, th);
  }

  /* ═════════════════════ BURUNG BEO (mini-game) ═════════════════════ */
  /** beo merah (macaw) bertengger menghadap kanan; kanvas 300×340 — mata dari DOM di (198,88); sayap dari sprite lain */
  const MAC = { red: '#d8352a', redL: '#ff6d4c', redD: '#8e1a14', yel: '#ffcc3a', blue: '#2f6fc0', blueD: '#1a3f7a', green: '#3f9a5a' };
  const feather = (g, d, box, base, cols, R, dir = [0.2, 1], n = 40) => painted(g, d, {
    base, n, R, filter: 'impastoFine', cast: 'cast',
    stroke: () => { const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = 8 + R() * 18, m = Math.hypot(dir[0], dir[1]); return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.6), 5, R), width: 3 + R() * 5, opacity: 0.2 + R() * 0.3 }; },
  });
  function parrot(g, R) {
    el('ellipse', { cx: 150, cy: 332, rx: 70, ry: 7, fill: '#1a0c05', opacity: 0.25, filter: 'url(#soft)' }, g);
    // ekor panjang
    feather(g, 'M124,224C108,266 90,302 68,338L92,338C110,306 132,272 146,232Z', [68, 224, 78, 114], linGrad(g, [[0, MAC.red], [0.45, MAC.red], [0.7, MAC.blue], [1, MAC.blueD]], 0, 224, 0, 338), [MAC.redD, MAC.red, MAC.redL], R, [-0.4, 1], 20);
    feather(g, 'M140,230C132,274 124,306 114,338L134,336C142,306 152,272 162,236Z', [114, 230, 48, 108], linGrad(g, [[0, MAC.red], [0.5, MAC.blue], [1, MAC.blueD]], 0, 230, 0, 338), [MAC.blueD, MAC.blue, '#6aa2e6'], R, [-0.2, 1], 16);
    // badan gempal
    const body = 'M152,254C108,250 90,208 98,162C106,118 134,94 170,96C206,98 224,128 220,168C216,214 194,256 152,254Z';
    feather(g, body, [90, 94, 134, 162], radGrad(g, [[0, MAC.redL], [0.5, MAC.red], [1, MAC.redD]], 168, 140, 130), [MAC.redD, MAC.red, MAC.redL], R, [0.1, 1], 60);
    // sisik bulu dada
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) { const x = 168 + c * 12 + (r % 2) * 6, y = 136 + r * 18; if (x > 214 - r * 2) continue; el('path', { d: `M${x - 6},${y}q6,7 12,0`, fill: 'none', stroke: '#ff9a7c', 'stroke-width': 1.6, 'stroke-opacity': 0.55, 'stroke-linecap': 'round' }, g); }
    // kepala
    const head = 'M140,104C134,70 156,44 188,44C220,46 236,70 232,98C228,120 206,130 182,128C160,126 144,120 140,104Z';
    feather(g, head, [134, 44, 100, 86], radGrad(g, [[0, MAC.redL], [0.6, MAC.red], [1, MAC.redD]], 178, 66, 80), [MAC.redD, MAC.red, MAC.redL], R, [1, 0.3], 34);
    el('path', { d: 'M152,72C160,54 180,48 196,50', fill: 'none', stroke: '#ffb39a', 'stroke-width': 3, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, g);
    // bercak pipi putih bergaris halus
    el('path', { d: 'M180,80C186,68 206,66 216,76C224,86 222,102 210,108C198,112 182,104 180,92Z', fill: '#fbf3ea', stroke: '#e2cfc0', 'stroke-width': 1 }, g);
    for (let i = 0; i < 4; i++) el('path', { d: `M${186 + i * 2},${98 + i * 3}q10,2 20,-2`, fill: 'none', stroke: '#c86a5a', 'stroke-width': 1, 'stroke-opacity': 0.6 }, g);
    // paruh melengkung besar
    el('path', { d: 'M216,74C240,70 258,88 254,114C252,126 244,130 240,124C242,112 236,104 222,104Z', fill: '#f4ead8', stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M218,102C230,102 238,108 236,118C230,122 222,118 214,112Z', fill: '#2e2620', stroke: INK, 'stroke-width': 1.4 }, g);
    el('path', { d: 'M224,78C236,78 246,86 248,98', fill: 'none', stroke: '#fff', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-opacity': 0.85 }, g);
    // cakar
    for (const x of [150, 178]) {
      el('path', { d: `M${x},244V258`, stroke: '#6a5a50', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      el('path', { d: `M${x - 11},264Q${x},252 ${x + 11},264M${x},258V268`, fill: 'none', stroke: '#4a3a30', 'stroke-width': 4.4, 'stroke-linecap': 'round' }, g);
    }
    ink(g, body, 1.4, 0.45);
    ink(g, head, 1.4, 0.45);
  }
  /** sayap beo terlipat: pangkal (bahu) di kanan-atas, ujung di kiri-bawah; kanvas 220×170 — dikepakkan CSS */
  function parrotWing(g, R) {
    const d = 'M198,16C214,46 206,88 182,114C152,142 92,158 12,162C38,142 70,120 94,96C122,64 152,28 198,16Z';
    feather(g, d, [12, 16, 200, 146], linGrad(g, [[0, MAC.red], [0.28, MAC.red], [0.4, MAC.yel], [0.5, MAC.green], [0.6, MAC.blue], [1, MAC.blueD]], 200, 20, 30, 160), [MAC.blueD, MAC.blue, '#7fb0ee'], R, [-1, 0.6], 40);
    // bulu terbang panjang
    for (let i = 0; i < 7; i++) { const t = i / 6; el('path', { d: `M${150 - t * 40},${60 + t * 40}Q${110 - t * 50},${120 + t * 10} ${40 - t * 20},${150 + t * 8}`, fill: 'none', stroke: MAC.blueD, 'stroke-width': 1.6, 'stroke-opacity': 0.5 }, g); }
    // bulu penutup bersisik di bahu
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 176 - c * 16 - r * 10, y = 34 + r * 16 + c * 6; el('path', { d: `M${x - 8},${y}q8,9 16,0`, fill: 'none', stroke: r === 2 ? '#fff2a0' : '#ff9a7c', 'stroke-width': 1.6, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, g); }
    ink(g, d, 1.5, 0.5);
  }

  /* ═════════════════════ SPRITE ═════════════════════ */
  const scaled = (name, w, h, seed, draw, k = 0.5) => { F.sprites[name] = { w: Math.round(w * k), h: Math.round(h * k), viewBox: `0 0 ${w} ${h}`, seed, draw }; };

  F.sprites['bg-petaharta'] = { w: W * 0.42, h: H * 0.42, viewBox: `0 0 ${W} ${H}`, seed: 671, draw(svg, R) {
    table(svg, R);
    inkwell(at(svg, 'translate(112 470) scale(1.35) translate(-112 -470)'), R, 112, 470);
    for (const [x, y, r, rot] of [[660, 470, 22, -10], [700, 500, 20, 20], [628, 516, 19, 5], [690, 446, 18, 40]]) coin(svg, x, y, r, rot, 0.55);
    brassCompass(svg, R, 640, 1170, 84);
    for (const [x, y, r, rot] of [[540, 1240, 20, 12], [566, 1262, 18, -20]]) coin(svg, x, y, r, rot, 0.55);
    F.leaf(svg, { len: 150, w: 60, ...F.flora.GREEN[0], R, n: 40, curve: 0.2, transform: 'translate(40 1400) rotate(50)' });
    F.leaf(svg, { len: 120, w: 50, ...F.flora.GREEN[2], R, n: 34, curve: -0.2, transform: 'translate(24 1360) rotate(20)' });
    F.flora.flowers.kamboja(at(svg, 'translate(110 1330) rotate(-8)'), R, 0.34);
    F.flora.flowers.kambojaPink(at(svg, 'translate(54 1240) rotate(30)'), R, 0.24);
  } };
  F.sprites['bg-petaharta-peta'] = { w: W * 0.78, h: H * 0.78, viewBox: `0 0 ${W} ${H}`, seed: 672, draw(svg, R) { mapArt(svg, R); } };
  scaled('petaharta-rol', RW, RH, 673, (svg, R) => roll(svg, R), 0.52);
  scaled('petaharta-tali', 300, 320, 674, (svg, R) => twine(svg, R), 0.6);
  scaled('petaharta-segel', 200, 200, 675, (svg, R) => seal(svg, R), 0.7);
  scaled('petaharta-label', 240, 130, 676, (svg, R) => tag(svg, R), 0.7);
  scaled('petaharta-kunci', 300, 120, 677, (svg, R) => key(svg, R), 0.6);
  scaled('petaharta-perahu', 170, 110, 678, (svg, R) => paperBoat(at(svg, 'translate(0 10)'), R), 0.7);
  scaled('petaharta-bendera', 80, 120, 679, (svg, R) => flag(svg, R), 0.7);
  scaled('petaharta-x', 170, 170, 680, (svg, R) => bigX(svg, R), 0.6);
  scaled('petaharta-kepiting', 220, 170, 681, (svg, R) => crab(svg, R), 0.5);
  scaled('petaharta-gundukan', 360, 200, 682, (svg, R) => mound(svg, R), 0.6);
  scaled('petaharta-gumpal', 160, 110, 683, (svg, R) => clump(svg, R), 0.6);
  scaled('petaharta-lubang', 320, 170, 684, (svg, R) => hole(svg, R), 0.6);
  scaled('petaharta-peti', 520, 340, 685, (svg, R) => chestBody(svg, R), 0.56);
  scaled('petaharta-tutup', 520, 230, 686, (svg, R) => lidClosed(at(svg, 'translate(0 10)'), R), 0.56);
  scaled('petaharta-tutup-buka', 520, 230, 687, (svg, R) => lidOpen(svg, R), 0.56);
  scaled('petaharta-harta', 470, 190, 688, (svg, R) => treasure(svg, R), 0.56);
  scaled('petaharta-gembok', 150, 200, 689, (svg, R) => padlock(svg, R), 0.6);
  scaled('petaharta-surat', 280, 100, 690, (svg, R) => letterScroll(svg, R), 0.7);
  scaled('game-petaharta-beo', 300, 340, 691, (svg, R) => parrot(svg, R), 0.6);
  scaled('game-petaharta-sayap', 220, 170, 692, (svg, R) => parrotWing(svg, R), 0.6);

  F.sprites['cover-petaharta'] = { w: 480, h: 600, seed: 693, draw(svg, R) {
    // peta (bagian tengah-atas) dengan jalur titik-titik merah menuju X, peti terbuka bercahaya di depan, beo di tutupnya
    const k = 0.66, ox = -18, oy = -46;
    const P = ([x, y]) => [x * k + ox, y * k + oy];
    mapArt(at(svg, `translate(${ox} ${oy}) scale(${k})`), R);
    const pts = [SPOTS[2], SPOTS[3], SPOTS[4], SPOTS[5], XS].map(P);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [px, py] = pts[i - 1], [x, y] = pts[i]; const dx = x - px, dy = y - py, L = Math.hypot(dx, dy), q = (i % 2 ? 1 : -1) * Math.min(0.2 * L, 40); d += `Q${((px + x) / 2 - (dy / L) * q).toFixed(1)},${((py + y) / 2 + (dx / L) * q).toFixed(1)} ${x},${y}`; }
    el('path', { d, fill: 'none', stroke: '#5a2a10', 'stroke-width': 7.5, 'stroke-opacity': 0.3, 'stroke-dasharray': '0.1 13', 'stroke-linecap': 'round', transform: 'translate(1 2)' }, svg);
    el('path', { d, fill: 'none', stroke: VERM.base, 'stroke-width': 7, 'stroke-dasharray': '0.1 13', 'stroke-linecap': 'round' }, svg);
    for (const sp of [SPOTS[3], SPOTS[4], SPOTS[5]]) { const [x, y] = P(sp); flag(at(svg, `translate(${x - 4} ${y - 64}) scale(0.62)`), R); }
    const [xx, xy] = P(XS);
    el('circle', { cx: xx, cy: xy, r: 46, fill: radGrad(svg, [[0, '#fff2b0', 0.8], [1, '#ffd36a', 0]], xx, xy, 46) }, svg);
    bigX(at(svg, `translate(${xx - 40} ${xy - 40}) scale(0.47)`), R);
    paperBoat(at(svg, `translate(${xx + 62} ${xy - 2}) rotate(-8) scale(0.42)`), R);
    // peti terbuka bercahaya di depan
    const cx = 244, cy = 470;
    el('rect', { x: 0, y: 300, width: 480, height: 300, fill: linGrad(svg, [[0, '#2a1606', 0], [1, '#2a1606', 0.45]], 0, 300, 0, 600) }, svg);
    el('circle', { cx, cy: cy - 40, r: 250, fill: radGrad(svg, [[0, '#fff6c8', 0.95], [0.22, '#ffd56e', 0.62], [0.55, '#ffae4a', 0.2], [1, '#ff9a3a', 0]], cx, cy - 40, 250) }, svg);
    for (let i = 0; i < 15; i++) { const a = -Math.PI / 2 + (i - 7) * 0.19; el('path', { d: `M${cx},${cy - 40}L${cx + Math.cos(a - 0.035) * 330},${cy - 40 + Math.sin(a - 0.035) * 330}L${cx + Math.cos(a + 0.035) * 330},${cy - 40 + Math.sin(a + 0.035) * 330}Z`, fill: '#fff3c0', opacity: 0.24 }, svg); }
    const c = at(svg, `translate(${cx - 148} ${cy - 82}) scale(0.57)`);
    lidOpen(at(c, 'translate(0 -126)'), R);
    chestBody(c, R);
    treasure(at(c, 'translate(25 -46)'), R);
    letterScroll(at(c, 'translate(122 -8) rotate(-7)'), R);
    // beo bertengger di sudut tutup
    const p = at(svg, `translate(${cx + 52} ${cy - 214}) scale(0.44)`);
    parrot(p, R);
    parrotWing(at(p, 'translate(39 115) scale(0.75)'), R);
    el('circle', { cx: cx + 52 + 198 * 0.44, cy: cy - 214 + 88 * 0.44, r: 4.6, fill: '#fffaf0', stroke: INK, 'stroke-width': 1.2 }, svg);
    el('circle', { cx: cx + 52 + 200 * 0.44, cy: cy - 214 + 89 * 0.44, r: 2.4, fill: INK }, svg);
    // koin & kilau
    for (const [x, y, r, rot] of [[92, 560, 15, 10], [128, 580, 13, -20], [370, 572, 15, 30], [404, 552, 12, 0], [60, 586, 11, 40]]) coin(svg, x, y, r, rot, 0.5);
    for (const [x, y, r] of [[150, 330, 8], [344, 316, 10], [118, 412, 6], [380, 410, 7]]) el('path', { d: `M${x},${y - r * 2}L${x + r * 0.3},${y - r * 0.3}L${x + r * 2},${y}L${x + r * 0.3},${y + r * 0.3}L${x},${y + r * 2}L${x - r * 0.3},${y + r * 0.3}L${x - r * 2},${y}L${x - r * 0.3},${y - r * 0.3}Z`, fill: '#fffbe6', opacity: 0.9 }, svg);
    el('rect', { x: 0, y: 0, width: 480, height: 600, fill: radGrad(svg, [[0, '#000', 0], [0.62, '#000', 0], [1, '#3a2008', 0.42]], 240, 300, 420) }, svg);
  } };
})();
