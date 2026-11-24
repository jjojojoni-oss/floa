/* Surat dalam Botol: pantai tropis saat senja — langit ungu ke jingga, matahari di cakrawala, laut dengan jalur
   cahaya, pasir dengan kawung samar. Lembar ombak & buih (digerakkan CSS), botol kaca hijau laut (isinya gulungan
   kertas yang dipasang dari DOM di balik kaca), gabus, gumpal pasir, label, kerang, bintang laut, pelepah nyiur,
   ranting, perangko, dan kepiting untuk mini-game. Semua tulisan dipasang dari DOM di atas lukisan ini. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, linGrad, radGrad } = F;
  const W = 780, H = 1500;
  /** cakrawala, tepi air saat surut, batas pasir basah (sama dengan angka di style.module.css) */
  const HOR = 544, SHORE = 915, WET = 1000;
  const SUN = { x: 486, y: 508, r: 64 };
  const TEAL = { hi: '#d6fff0', light: '#8fdcc8', base: '#2f9f97', mid: '#1b7d7b', dark: '#0f5a60', deep: '#0a4046' };

  const defsOf = (g) => (g.ownerSVGElement || g).querySelector('defs');
  /** topeng pudar: `fill` biasanya gradien putih dengan opacity */
  function mask(g, fill, x, y, w, h) {
    const id = F.uid('mk');
    const m = el('mask', { id, maskUnits: 'userSpaceOnUse', x, y, width: w, height: h }, defsOf(g));
    el('rect', { x, y, width: w, height: h, fill }, m);
    return `url(#${id})`;
  }
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
  /** gumpalan tak beraturan yang halus */
  function blob(cx, cy, rx, ry, R, n = 12, rough = 0.22) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = 1 + (R() - 0.5) * 2 * rough; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let d = `M${mid(pts[0], pts[1]).join(',')}`;
    for (let i = 1; i <= n; i++) { const q = pts[i % n], m = mid(q, pts[(i + 1) % n]); d += `Q${q[0].toFixed(1)},${q[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`; }
    return d + 'Z';
  }
  /** kamboja kecil lima kelopak (tanda floa), berpusat di (0,0) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';

  /* ───────────── langit senja ───────────── */
  const SKY = [[0, '#37356f'], [0.2, '#54468a'], [0.44, '#8a4c8f'], [0.62, '#c35a84'], [0.77, '#ec7b64'], [0.9, '#fbab5c'], [1, '#ffdc90']];
  function sky(svg, R) {
    const hh = HOR + 70;
    wash(svg, {
      x: -60, y: -30, w: W + 120, h: hh, R, n: 600, angle: -3, len: [0.25, 0.7], width: [22, 54], opacity: [0.3, 0.7],
      base: linGrad(svg, SKY, 0, 0, 0, HOR),
      color: (u, v) => {
        const x = -60 + u * (W + 120), y = -30 + v * hh;
        const d = Math.hypot(x - SUN.x, (y - SUN.y) * 1.3) / 520;
        return mix(ramp(SKY, y / HOR + (u - 0.5) * 0.04), '#ffc878', Math.max(0, 0.55 - d) * 0.95);
      },
    });
    // bintang pertama di langit yang paling gelap
    dabs(svg, { n: 46, R, filter: null, place: (i, R2) => ({ x: R2() * W, y: Math.pow(R2(), 1.6) * 300, rx: R2() < 0.12 ? 2.2 : 0.8 + R2() * 0.9, color: R2() < 0.4 ? '#ffe7b0' : '#ffffff', opacity: 0.3 + R2() * 0.5 }) });
    // pendar matahari
    el('circle', { cx: SUN.x, cy: SUN.y, r: 360, fill: radGrad(svg, [[0, '#ffe9ae', 0.9], [0.2, '#ffc66e', 0.55], [0.5, '#ff9466', 0.22], [1, '#ff8a6a', 0]], SUN.x, SUN.y, 360) }, svg);
    const L = F.latar.clouds;
    // awan tinggi: badan ungu, perut merah bata, tepi bawah keemasan (disinari dari bawah)
    L(svg, R, '#4d3f86', [[170, 96, 430, 52, 0.5], [640, 150, 380, 46, 0.45]]);
    L(svg, R, '#6e4589', [[130, 262, 400, 70, 0.62], [668, 300, 340, 62, 0.58], [400, 204, 300, 40, 0.4]]);
    L(svg, R, '#b9507f', [[150, 284, 360, 40, 0.5], [676, 320, 300, 36, 0.5], [420, 216, 250, 22, 0.34]]);
    L(svg, R, '#f2775f', [[170, 303, 350, 18, 0.5], [664, 338, 300, 16, 0.52]]);
    L(svg, R, '#ffc27a', [[204, 316, 280, 8, 0.42], [650, 350, 240, 7, 0.46]]);
    // awan rendah memanjang di dekat cakrawala
    L(svg, R, '#a14c82', [[110, 432, 330, 26, 0.55], [720, 420, 260, 22, 0.5]]);
    L(svg, R, '#e8686f', [[230, 452, 420, 20, 0.5], [690, 440, 230, 14, 0.5]]);
    L(svg, R, '#ffb968', [[330, 470, 380, 12, 0.6], [640, 462, 240, 9, 0.6]]);
    L(svg, R, '#ffe7a8', [[470, 486, 280, 7, 0.7]]);
    // matahari: separuh tenggelam (bagian bawahnya tertutup laut)
    el('circle', { cx: SUN.x, cy: SUN.y, r: SUN.r * 1.7, fill: '#fff2bc', opacity: 0.5, filter: 'url(#soft)' }, svg);
    el('circle', { cx: SUN.x, cy: SUN.y, r: SUN.r, fill: radGrad(svg, [[0, '#fffef2'], [0.62, '#fff2b8'], [1, '#ffd272']], SUN.x - 8, SUN.y - 12, SUN.r * 1.12), filter: 'url(#blur2)' }, svg);
    // seutas awan tipis melintas di depan matahari
    L(svg, R, '#f79a66', [[SUN.x + 30, SUN.y - 4, 150, 5, 0.55]]);
  }

  /** pulau jauh + jukung kecil di cakrawala */
  function horizon(svg, R) {
    const g = el('g', { filter: 'url(#blur2)' }, svg);
    const isle = (d, c1, c2) => el('path', { d, fill: linGrad(svg, [[0, c1], [1, c2]], 0, HOR - 64, 0, HOR) }, g);
    isle(`M-30,${HOR + 3}V${HOR - 26}Q26,${HOR - 62} 92,${HOR - 44}Q138,${HOR - 60} 178,${HOR - 30}Q224,${HOR - 18} 266,${HOR - 6}L292,${HOR + 3}Z`, '#4f3b78', '#8a4d84');
    isle(`M604,${HOR + 3}Q662,${HOR - 20} 716,${HOR - 24}Q760,${HOR - 40} 810,${HOR - 28}V${HOR + 3}Z`, '#5d4180', '#9b5680');
    // nyiur mungil di punggung pulau
    for (const [x, y, h, lean] of [[58, HOR - 52, 30, 6], [84, HOR - 46, 24, -5], [150, HOR - 50, 26, 7], [738, HOR - 34, 22, -6]]) {
      const tx = x + lean, ty = y - h;
      el('path', { d: `M${x},${y}Q${x + lean * 0.2},${y - h * 0.6} ${tx},${ty}`, fill: 'none', stroke: '#43336c', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
      for (let k = 0; k < 6; k++) { const a = -Math.PI + (k / 5) * Math.PI, r = 11 + (k % 2) * 3; el('path', { d: `M${tx},${ty}q${Math.cos(a) * r * 0.6},${Math.sin(a) * r * 0.9 - 3} ${Math.cos(a) * r},${Math.sin(a) * r * 0.5 + 4}`, fill: 'none', stroke: '#43336c', 'stroke-width': 1.9, 'stroke-linecap': 'round' }, g); }
    }
    // kabut hangat di garis cakrawala
    el('rect', { x: -20, y: HOR - 46, width: W + 40, height: 60, fill: '#ffb47c', opacity: 0.22, filter: 'url(#soft)' }, svg);
    // jukung bercadik dengan layar segitiga
    const b = el('g', { transform: `translate(338 ${HOR + 1})` }, svg);
    el('path', { d: 'M2,-36L22,-8L2,-6Z', fill: '#f6bb8c' }, b);
    el('path', { d: 'M2,-36L22,-8', stroke: '#fff0c8', 'stroke-width': 1.2, 'stroke-opacity': 0.8 }, b);
    el('path', { d: 'M1,-38V-3', stroke: '#33264f', 'stroke-width': 1.8 }, b);
    el('path', { d: 'M-24,-3Q0,7 26,-3L21,-6H-19Z', fill: '#33264f' }, b);
    el('path', { d: 'M-28,5H30M-16,-3V5M16,-3V5', stroke: '#33264f', 'stroke-width': 1.3, fill: 'none' }, b);
    el('path', { d: 'M-18,10H22', stroke: '#33264f', 'stroke-width': 3, 'stroke-opacity': 0.25, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, b);
  }

  /* ───────────── laut ───────────── */
  const SEA = [[0, '#74608f'], [0.06, '#55799b'], [0.26, '#2c8791'], [0.6, '#229791'], [0.84, '#49b3a1'], [1, '#93d3ba']];
  const shoreY = (x) => SHORE + 10 * Math.sin(x / 120 + 1) + 5 * Math.sin(x / 41);
  function sea(svg, R) {
    const top = HOR, bot = SHORE + 26, h = bot - top;
    let d = `M-40,${top}H${W + 40}`;
    for (let x = W + 40; x >= -40; x -= 10) d += `L${x},${shoreY(x).toFixed(1)}`;
    const inner = el('g', { filter: 'url(#canvas)' }, clip(svg, d + 'Z'));
    el('rect', { x: -40, y: top, width: W + 80, height: h, fill: linGrad(svg, SEA, 0, top, 0, bot) }, inner);
    for (let i = 0; i < 1700; i++) {
      const v = Math.pow(R(), 1.3), y = top + v * h, x = -30 + R() * (W + 60);
      const L = (16 + R() * 56) * (0.3 + v * 1.5), sw = (1.4 + R() * 2.8) * (0.45 + v * 2.5);
      let c = ramp(SEA, v + (R() - 0.5) * 0.08);
      const dd = Math.abs(x - SUN.x) / (30 + v * 200);
      if (dd < 1) c = mix(c, R() < 0.55 ? '#ffd88a' : '#ff9c6a', Math.pow(1 - dd, 1.4) * (0.35 + R() * 0.55));
      else if (R() < 0.34) c = mix(c, '#d06f8c', 0.26 * (1 - v));
      if (R() < 0.13) c = mix(c, '#123e55', 0.34);
      el('path', { d: `M${x - L / 2},${y}q${L / 2},${(R() - 0.5) * 3} ${L},${(R() - 0.5) * 2}`, fill: 'none', stroke: jitter(c, 5, R), 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-opacity': 0.4 + R() * 0.45 }, inner);
    }
    // alun: garis terang panjang yang makin renggang ke arah pantai
    for (let k = 1; k < 9; k++) {
      const v = Math.pow(k / 9, 1.7), y = top + v * h;
      let x = -30 - R() * 60;
      while (x < W + 30) {
        const L = (40 + R() * 150) * (0.4 + v);
        el('path', { d: `M${x},${y + 3 + v * 4}q${L / 2},${-2 - v * 5} ${L},${(R() - 0.5) * 3}`, fill: 'none', stroke: '#0f4f62', 'stroke-width': 1 + v * 5, 'stroke-opacity': 0.2, 'stroke-linecap': 'round' }, inner);
        el('path', { d: `M${x},${y}q${L / 2},${-2 - v * 5} ${L},${(R() - 0.5) * 3}`, fill: 'none', stroke: '#d9f5e2', 'stroke-width': 0.8 + v * 2.6, 'stroke-opacity': 0.2 + R() * 0.22, 'stroke-linecap': 'round' }, inner);
        x += L + 20 + R() * 120 * (0.4 + v);
      }
    }
    // air dangkal: pasir kelihatan dari balik air
    el('rect', { x: -40, y: SHORE - 130, width: W + 80, height: 170, fill: linGrad(svg, [[0, '#f2d4a2', 0], [0.7, '#f2d4a2', 0.42], [1, '#f6dfb4', 0.66]], 0, SHORE - 130, 0, SHORE + 20) }, inner);
    // garis cakrawala
    el('path', { d: `M-20,${HOR + 1.5}H${W + 20}`, stroke: '#3f3a72', 'stroke-width': 3, 'stroke-opacity': 0.5 }, svg);
    // jalur cahaya matahari + kerlip
    el('path', { d: `M${SUN.x - 20},${HOR + 20}H${SUN.x + 20}L${SUN.x + 150},${SHORE - 40}H${SUN.x - 150}Z`, fill: linGrad(svg, [[0, '#ffe2a0', 0.34], [1, '#ffc07a', 0.05]], 0, HOR, 0, SHORE), filter: 'url(#softer)' }, svg);
    for (let i = 0; i < 300; i++) {
      const v = Math.pow(R(), 1.15), y = top + 2 + v * (h - 46), g1 = (R() + R() + R()) / 3 - 0.5;
      const x = SUN.x + g1 * (56 + v * 380), L = (4 + R() * 13) * (0.4 + v * 1.7);
      el('path', { d: `M${x - L / 2},${y}h${L}`, stroke: R() < 0.6 ? '#fff6d0' : '#ffe39a', 'stroke-width': (1.1 + R() * 1.7) * (0.6 + v * 1.5), 'stroke-linecap': 'round', 'stroke-opacity': 0.5 + R() * 0.45 }, svg);
    }
    // buih tipis yang tertinggal di tepi air
    const fo = el('g', { filter: 'url(#impastoFine)' }, svg);
    for (let x = -10; x < W + 10; x += 6 + R() * 9) el('ellipse', { cx: x, cy: shoreY(x) - 2 - R() * 5, rx: 5 + R() * 9, ry: 2.4 + R() * 3, fill: '#fffaf0', 'fill-opacity': 0.5 + R() * 0.4 }, fo);
  }

  /* ───────────── pasir ───────────── */
  const SANDT = [[0, '#c08a68'], [0.1, '#d7a67b'], [0.3, '#ebbf93'], [0.62, '#f3cda1'], [1, '#e4b587']];
  function sand(svg, R, { deco = true } = {}) {
    const y0 = 868;
    wash(svg, {
      x: -40, y: y0, w: W + 80, h: H - y0 + 30, R, n: 780, angle: 5, len: [0.08, 0.3], width: [14, 40], opacity: [0.3, 0.65],
      base: linGrad(svg, SANDT, 0, y0, 0, H),
      color: (u, v) => { let c = ramp(SANDT, v + (R() - 0.5) * 0.12); const k = R(); if (k < 0.24) c = mix(c, '#f8b99c', 0.32); else if (k < 0.4) c = mix(c, '#b17f72', 0.3); return c; },
    });
    // pasir basah: lebih gelap, memantulkan warna langit
    el('rect', { x: -40, y: SHORE - 30, width: W + 80, height: WET - SHORE + 90, fill: linGrad(svg, [[0, '#7f5148', 0.8], [0.5, '#8f5f4f', 0.56], [1, '#9a6a55', 0]], 0, SHORE - 30, 0, WET + 60) }, svg);
    const rf = el('g', { filter: 'url(#blur2)' }, svg);
    for (let i = 0; i < 70; i++) { const x = R() * W, y = SHORE + R() * (WET - SHORE), L = 30 + R() * 110; el('path', { d: `M${x},${y}h${L}`, stroke: R() < 0.5 ? '#ffb7a2' : '#ffd99c', 'stroke-width': 2 + R() * 4, 'stroke-opacity': 0.14 + R() * 0.18, 'stroke-linecap': 'round' }, rf); }
    el('ellipse', { cx: SUN.x, cy: SHORE + 46, rx: 150, ry: 36, fill: '#ffd68c', opacity: 0.5, filter: 'url(#soft)' }, svg);
    // cahaya senja yang jatuh di pasir
    el('ellipse', { cx: SUN.x - 40, cy: 1120, rx: 330, ry: 150, fill: '#ffe2ac', opacity: 0.3, filter: 'url(#softer)' }, svg);
    // gelombang pasir halus
    const rp = el('g', { filter: 'url(#soft)' }, svg);
    for (let i = 0; i < 9; i++) {
      const y = 1050 + i * 52 + R() * 20, a = 36 + R() * 30;
      const d = `M-40,${y}C${W * 0.25},${y - a} ${W * 0.55},${y + a * 0.8} ${W + 40},${y - a * 0.3}`;
      el('path', { d, fill: 'none', stroke: '#a06a58', 'stroke-width': 14 + R() * 10, 'stroke-opacity': 0.13 }, rp);
      el('path', { d, fill: 'none', stroke: '#fff1d2', 'stroke-width': 10 + R() * 8, 'stroke-opacity': 0.2, transform: 'translate(-4 -14)' }, rp);
    }
    // kawung samar seperti digurat di pasir (timbul: garis gelap + pantulan terang)
    const km = mask(svg, radGrad(svg, [[0, '#fff', 1], [0.6, '#fff', 0.7], [1, '#fff', 0]], W * 0.5, 1330, 520), 0, 1020, W, 480);
    const kg = el('g', { mask: km }, svg);
    el('rect', { x: 0, y: 1020, width: W, height: 480, fill: kawung(svg, '#fff4da', 96, 2), opacity: 0.2, transform: 'translate(1.6 2.2)' }, kg);
    el('rect', { x: 0, y: 1020, width: W, height: 480, fill: kawung(svg, '#8d5c44', 96, 2), opacity: 0.13 }, kg);
    // butir pasir
    dabs(svg, { n: 1300, R, filter: null, place: (i, R2) => { const k = R2(); return { x: R2() * W, y: y0 + 70 + R2() * (H - y0 - 70), rx: 0.7 + R2() * 1.5, color: k < 0.45 ? '#8f5d43' : k < 0.75 ? '#fff6e0' : '#c08a64', opacity: 0.22 + R2() * 0.4 }; } });
    if (!deco) return;
    // kerikil & pecahan kerang kecil di pinggir
    for (const [x, y, r, c] of [[704, 1096, 7, '#b98f7a'], [66, 1186, 6, '#f4e2cf'], [548, 1462, 6, '#a57f6c'], [716, 1250, 5, '#f7d9c4'], [30, 1040, 5, '#9c7765'], [236, 1478, 5, '#f4e2cf']]) {
      el('ellipse', { cx: x + 3, cy: y + 4, rx: r * 1.3, ry: r * 0.7, fill: '#7a4a35', opacity: 0.3, filter: 'url(#blur2)' }, svg);
      el('ellipse', { cx: x, cy: y, rx: r * 1.25, ry: r * 0.85, fill: c, transform: `rotate(${R() * 180} ${x} ${y})` }, svg);
      el('ellipse', { cx: x - r * 0.3, cy: y - r * 0.3, rx: r * 0.5, ry: r * 0.3, fill: '#fff', opacity: 0.5 }, svg);
    }
    // bintang laut di kiri-bawah, kamboja jatuh di kanan-bawah
    starfish(el('g', { transform: 'translate(82 1436) rotate(-18) scale(1.1)' }, svg), R);
    const fr = F.flora;
    F.leaf(svg, { len: 130, w: 50, ...fr.GREEN[1], R, n: 40, curve: 0.2, transform: 'translate(772 1424) rotate(-70)' });
    el('ellipse', { cx: 708, cy: 1462, rx: 48, ry: 26, fill: '#7a4a35', opacity: 0.3, filter: 'url(#soft)' }, svg);
    fr.flowers.kamboja(el('g', { transform: 'translate(700 1450) rotate(14)' }, svg), R, 0.3);
  }

  /* ───────────── lembar ombak: selaput air bening dengan bibir buih (digeser naik-turun oleh CSS) ───────────── */
  const OW = 860, OH = 420, OE = 336;
  const edgeY = (x) => OE + 24 * Math.sin(x / 132 + 0.7) + 11 * Math.sin(x / 47 + 2.1) + 5 * Math.sin(x / 19 + 0.3);
  const edgePath = (dy = 0, step = 8) => { let d = ''; for (let x = -10; x <= OW + 10; x += step) d += `${x === -10 ? 'M' : 'L'}${x},${(edgeY(x) + dy).toFixed(1)}`; return d; };
  function waveSheet(svg, R) {
    const root = el('g', { mask: mask(svg, linGrad(svg, [[0, '#fff', 0], [0.25, '#fff', 1]], 0, 0, 0, OH), -20, -20, OW + 40, OH + 40) }, svg);
    el('path', { d: edgePath(7), fill: 'none', stroke: '#7a4a35', 'stroke-width': 10, 'stroke-opacity': 0.32, filter: 'url(#blur2)' }, root);
    const inner = el('g', { filter: 'url(#canvas)' }, clip(root, `${edgePath()}L${OW + 10},-10L-10,-10Z`));
    el('rect', { x: -10, y: -10, width: OW + 20, height: OH + 20, fill: linGrad(svg, [[0, '#2c9a95', 0.22], [0.42, '#37a89c', 0.6], [0.76, '#72c7af', 0.56], [0.93, '#c4ead2', 0.44], [1, '#eafbe8', 0.5]], 0, 0, 0, OE + 34) }, inner);
    for (let i = 0; i < 280; i++) {
      const x = R() * OW, t = Math.pow(R(), 0.7), y = edgeY(x) - 14 - (1 - t) * 300, L = 30 + R() * 90;
      const c = R() < 0.55 ? mix('#3aa79c', '#e3f8e6', R() * 0.8 * t + 0.1) : mix('#2c9a95', '#176d74', R() * 0.6);
      el('path', { d: `M${x - L / 2},${y}q${L / 2},${(R() - 0.5) * 8} ${L},${edgeY(x + L / 2) - edgeY(x - L / 2) + (R() - 0.5) * 4}`, fill: 'none', stroke: c, 'stroke-width': 3 + R() * 9, 'stroke-linecap': 'round', 'stroke-opacity': 0.16 + R() * 0.28 }, inner);
    }
    // pantulan senja di selaput air
    for (let i = 0; i < 26; i++) { const x = OW * 0.56 + (R() - 0.5) * 320, y = edgeY(x) - 30 - R() * 150, L = 20 + R() * 60; el('path', { d: `M${x},${y}h${L}`, stroke: '#ffdf9c', 'stroke-width': 2 + R() * 3, 'stroke-opacity': 0.25 + R() * 0.3, 'stroke-linecap': 'round' }, inner); }
    const foam = el('g', { filter: 'url(#impastoFine)' }, root);
    for (const [off, o, sw, dash] of [[-24, 0.7, 5, '26 14 60 22 12 30'], [-54, 0.5, 3.4, '40 30 14 46 70 26'], [-98, 0.36, 2.6, '18 50 60 40 30 70'], [-160, 0.25, 2.2, '50 80 20 60'], [-232, 0.17, 2, '30 110 60 90']])
      el('path', { d: edgePath(off), fill: 'none', stroke: '#fffaf0', 'stroke-width': sw, 'stroke-opacity': o, 'stroke-linecap': 'round', 'stroke-dasharray': dash, 'stroke-dashoffset': R() * 200 }, foam);
    for (let i = 0; i < 460; i++) {
      const x = R() * OW, back = Math.pow(R(), 2.2) * 150, r = 1.2 + R() * 3.6 * (1 - back / 190);
      el('circle', { cx: x, cy: edgeY(x) - 6 - back + (R() - 0.5) * 6, r, fill: '#fffdf4', 'fill-opacity': 0.35 + R() * 0.5 * (1 - back / 170) }, foam);
    }
    for (let x = -10; x < OW + 10; x += 7 + R() * 7) {
      const rx = 8 + R() * 12, ry = 4.5 + R() * 6;
      el('ellipse', { cx: x, cy: edgeY(x) - ry * 0.5 - R() * 5, rx, ry, fill: R() < 0.3 ? '#fff1d8' : '#fffdf6', 'fill-opacity': 0.92, transform: `rotate(${(R() - 0.5) * 30} ${x} ${edgeY(x)})` }, foam);
    }
  }
  /** jejak basah yang ditinggalkan ombak: tepinya sama dengan bibir ombak */
  function wetSheen(svg, R) {
    const root = el('g', { mask: mask(svg, linGrad(svg, [[0, '#fff', 0], [0.45, '#fff', 1]], 0, 0, 0, OH), -20, -20, OW + 40, OH + 40) }, svg);
    const inner = el('g', { filter: 'url(#soft)' }, clip(root, `${edgePath(4)}L${OW + 10},-10L-10,-10Z`));
    el('path', { d: `${edgePath(4)}L${OW + 10},-10L-10,-10Z`, fill: linGrad(svg, [[0, '#7d5140', 0.3], [0.8, '#7d5140', 0.44], [1, '#6e4636', 0.5]], 0, 0, 0, OE + 40) }, inner);
    for (let i = 0; i < 60; i++) { const x = R() * OW, y = edgeY(x) - 12 - R() * 170, L = 40 + R() * 120; el('path', { d: `M${x},${y}h${L}`, stroke: R() < 0.5 ? '#ffb9a4' : '#ffdca0', 'stroke-width': 4 + R() * 7, 'stroke-opacity': 0.14 + R() * 0.16, 'stroke-linecap': 'round' }, inner); }
  }
  /** garis buih tipis di tengah laut (alun jauh) */
  function swell(svg, R) {
    const g = el('g', { filter: 'url(#blur2)' }, svg);
    for (const [y, sw, o] of [[18, 2.4, 0.5], [40, 3.2, 0.62], [66, 4, 0.6]]) {
      let x = -10;
      while (x < 900) {
        const L = 30 + R() * 120, yy = y + (R() - 0.5) * 6;
        el('path', { d: `M${x},${yy + sw + 2}q${L / 2},${-3 - R() * 3} ${L},0`, fill: 'none', stroke: '#0f5266', 'stroke-width': sw * 1.3, 'stroke-opacity': 0.22, 'stroke-linecap': 'round' }, g);
        el('path', { d: `M${x},${yy}q${L / 2},${-3 - R() * 3} ${L},${(R() - 0.5) * 3}`, fill: 'none', stroke: '#fff6dc', 'stroke-width': sw * (0.6 + R() * 0.7), 'stroke-opacity': o * (0.5 + R() * 0.5), 'stroke-linecap': 'round' }, g);
        x += L + 24 + R() * 100;
      }
    }
  }

  /* ───────────── botol kaca (rebah, mulut di kanan). Hanya kacanya: isinya dari DOM di baliknya ───────────── */
  const BW = 470, BH = 170;
  const GLASS = 'M52,27H286C312,27 318,65 340,65H424V62Q424,59 428,59H442Q446,59 446,63V107Q446,111 442,111H428Q424,111 424,108V105H340C318,105 312,143 286,143H52Q26,143 26,117V53Q26,27 52,27Z';
  function bottle(g, R, { twine = true } = {}) {
    const glass = clip(g, GLASS);
    el('rect', { x: 0, y: 0, width: BW, height: BH, fill: linGrad(g, [[0, TEAL.hi, 0.56], [0.13, TEAL.light, 0.3], [0.45, TEAL.base, 0.14], [0.76, TEAL.mid, 0.32], [1, TEAL.dark, 0.74]], 0, 27, 0, 143) }, glass);
    const st = el('g', { filter: 'url(#impastoFine)' }, glass);
    const tone = [[0, '#c9f7e6'], [0.4, '#3aa79c'], [1, '#0f5a60']];
    for (let i = 0; i < 80; i++) {
      const x = 26 + R() * 400, v = R(), y = 30 + v * 110, L = 30 + R() * 90;
      el('path', { d: `M${x},${y}h${L}`, stroke: jitter(ramp(tone, v + (R() - 0.5) * 0.2), 6, R), 'stroke-width': 4 + R() * 9, 'stroke-opacity': 0.05 + R() * 0.09, 'stroke-linecap': 'round' }, st);
    }
    // dasar botol yang tebal
    el('path', { d: 'M20,20H60Q46,85 60,150H20Z', fill: TEAL.dark, opacity: 0.5 }, glass);
    el('path', { d: 'M58,36Q47,85 58,134', fill: 'none', stroke: '#c9fff0', 'stroke-width': 2.4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, glass);
    // pantulan senja di badan botol
    el('ellipse', { cx: 150, cy: 62, rx: 110, ry: 22, fill: '#ffb88a', opacity: 0.26, filter: 'url(#soft)' }, glass);
    // tanda kamboja timbul di badan botol
    const mk = el('g', { transform: 'translate(176 88) scale(1.7)', fill: 'none', 'stroke-linejoin': 'round' }, glass);
    for (let i = 0; i < 5; i++) {
      el('path', { d: MARK, stroke: TEAL.deep, 'stroke-width': 1.2, 'stroke-opacity': 0.22, transform: `translate(0.7 0.9) rotate(${i * 72})` }, mk);
      el('path', { d: MARK, stroke: '#eafff6', 'stroke-width': 1.1, 'stroke-opacity': 0.34, transform: `rotate(${i * 72})` }, mk);
    }
    // tebal kaca di tepi siluet + dinding dalam
    el('path', { d: GLASS, fill: 'none', stroke: '#0b4a50', 'stroke-width': 13, 'stroke-opacity': 0.5, filter: 'url(#blur2)' }, glass);
    el('path', { d: 'M56,37H284C304,37 312,73 338,73H420M56,133H284C304,133 312,97 338,97H420', fill: 'none', stroke: '#d8fff0', 'stroke-width': 1.5, 'stroke-opacity': 0.4 }, glass);
    // bibir botol
    el('rect', { x: 424, y: 59, width: 22, height: 52, fill: linGrad(g, [[0, '#e4fff5', 0.75], [0.3, TEAL.light, 0.5], [1, TEAL.dark, 0.75]], 0, 59, 0, 111) }, glass);
    el('path', { d: GLASS, fill: 'none', stroke: TEAL.deep, 'stroke-width': 2.2, 'stroke-opacity': 0.85, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M424,60V110', stroke: TEAL.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, g);
    // kilap: garis panjang di sisi atas, pantulan hangat di sisi bawah
    const hl = { fill: 'none', 'stroke-linecap': 'round' };
    el('path', { d: 'M66,41Q170,36 276,41', stroke: '#ffffff', 'stroke-width': 6.5, 'stroke-opacity': 0.88, 'stroke-dasharray': '96 13 60 400', ...hl }, g);
    el('path', { d: 'M74,52Q160,48 226,51', stroke: '#ffffff', 'stroke-width': 2.2, 'stroke-opacity': 0.5, ...hl }, g);
    el('path', { d: 'M298,45Q318,66 342,71H408', stroke: '#ffffff', 'stroke-width': 3.6, 'stroke-opacity': 0.75, 'stroke-dasharray': '34 10 200', ...hl }, g);
    el('path', { d: 'M84,134Q170,138 262,134', stroke: '#ffd9a0', 'stroke-width': 4.5, 'stroke-opacity': 0.5, ...hl }, g);
    el('path', { d: 'M429,65V78', stroke: '#fff', 'stroke-width': 3, 'stroke-opacity': 0.8, ...hl }, g);
    el('ellipse', { cx: 44, cy: 54, rx: 5, ry: 13, fill: '#fff', opacity: 0.55, transform: 'rotate(24 44 54)' }, g);
    if (!twine) return;
    // tali goni melilit leher (label digantung di sini, dari DOM)
    const tw = el('g', { filter: 'url(#cast)' }, g);
    for (const x of [386, 393, 400]) {
      el('path', { d: `M${x},62Q${x + 5},85 ${x},108`, fill: 'none', stroke: '#8a6238', 'stroke-width': 6.6, 'stroke-linecap': 'round' }, tw);
      el('path', { d: `M${x},62Q${x + 5},85 ${x},108`, fill: 'none', stroke: '#d5b07a', 'stroke-width': 4.6, 'stroke-linecap': 'round' }, tw);
      el('path', { d: `M${x - 1},66Q${x + 3},80 ${x},92`, fill: 'none', stroke: '#f4dcae', 'stroke-width': 1.3, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, tw);
    }
  }

  /** gabus rebah (ujung yang masuk leher botol di kiri); kanvas 84×64 */
  function cork(g, R) {
    const C = ['#8f6238', '#c99a62', '#e8c892'];
    const d = 'M8,16L68,11Q76,32 68,53L8,48Q3,32 8,16Z';
    const p = shape(g, d, [4, 10, 70, 44], C, R, { n: 34, dir: [1, 0.02], width: [3, 7], len: [10, 36], cast: 'cast', base: linGrad(g, [[0, C[2]], [0.45, C[1]], [1, C[0]]], 0, 11, 0, 53) });
    for (let i = 0; i < 26; i++) el('ellipse', { cx: 8 + R() * 58, cy: 15 + R() * 34, rx: 1 + R() * 2.2, ry: 0.7 + R() * 1.1, fill: '#6b4526', opacity: 0.3 + R() * 0.35 }, p.inner);
    el('ellipse', { cx: 68, cy: 32, rx: 6.5, ry: 20.5, fill: '#dcb57e', stroke: '#8f6238', 'stroke-width': 1.1 }, g);
    el('ellipse', { cx: 67, cy: 28, rx: 3, ry: 9, fill: '#f4dcae', opacity: 0.7 }, g);
    el('path', { d: 'M12,19L64,15', stroke: '#fff0cf', 'stroke-width': 2.4, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, g);
  }

  /** gulungan kertas rebah, diikat benang merah; kanvas 150×64 */
  function scroll(g, R) {
    const d = 'M22,11H126A9,21 0 0 1 126,53H22A10,21 0 0 1 22,11Z';
    const tone = [[0, '#fffdf5'], [0.3, '#fbf1d8'], [0.7, '#e9d6ad'], [1, '#c5a271']];
    const p = painted(g, d, {
      base: linGrad(g, tone, 0, 11, 0, 53), n: 40, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 12 + R() * 104, v = R(); return { d: `M${x},${12 + v * 40}h${14 + R() * 30}`, color: jitter(ramp(tone, v), 4, R), width: 3 + R() * 5, opacity: 0.3 + R() * 0.3 }; },
    });
    el('path', { d, fill: kawung(g, '#b9975c', 24, 0.8), opacity: 0.2 }, p.inner);
    el('path', { d: 'M24,17Q70,23 124,18', fill: 'none', stroke: '#a8855a', 'stroke-width': 1.3, 'stroke-opacity': 0.6 }, p.inner);
    el('path', { d: 'M24,19Q70,25 124,20', fill: 'none', stroke: '#fff', 'stroke-width': 1.3, 'stroke-opacity': 0.6 }, p.inner);
    // penampang gulungan
    el('ellipse', { cx: 126, cy: 32, rx: 8.5, ry: 20.5, fill: '#f6e8c8', stroke: '#a8855a', 'stroke-width': 1.2 }, g);
    for (const k of [0.7, 0.45, 0.2]) el('ellipse', { cx: 126, cy: 32, rx: 8.5 * k, ry: 20.5 * k, fill: 'none', stroke: '#a8855a', 'stroke-width': 1, 'stroke-opacity': 0.7 }, g);
    // benang merah + simpul
    const th = el('g', { filter: 'url(#cast)' }, g);
    for (const x of [66, 72]) {
      el('path', { d: `M${x},10.5Q${x + 6},32 ${x},53.5`, fill: 'none', stroke: '#b23a34', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, th);
      el('path', { d: `M${x - 0.6},13Q${x + 4},26 ${x + 2.4},38`, fill: 'none', stroke: '#ff8f7d', 'stroke-width': 1.2, 'stroke-linecap': 'round' }, th);
    }
    el('path', { d: 'M69,12Q56,-2 54,9Q56,16 69,12Q84,-1 86,9Q83,16 69,12M68,12L60,22M70,12L80,21', fill: 'none', stroke: '#c9443c', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, th);
  }

  /** gumpal pasir basah yang menempel di botol; kanvas 210×150 */
  function clump(g, R, { weed = false } = {}) {
    const C = ['#8f6048', '#c4936a', '#e6bd8e'];
    const d = blob(104, 76, 78, 50, R, 13, 0.26);
    const p = shape(g, d, [20, 20, 170, 110], C, R, { n: 60, dir: [1, 0.3], width: [8, 20], len: [14, 50], filter: 'impasto', cast: 'cast', base: radGrad(g, [[0, C[2]], [0.6, C[1]], [1, C[0]]], 80, 54, 110) });
    for (let i = 0; i < 150; i++) { const k = R(); el('circle', { cx: 24 + R() * 162, cy: 24 + R() * 104, r: 0.8 + R() * 1.9, fill: k < 0.5 ? '#7d523a' : k < 0.8 ? '#fff4da' : '#c08a64', opacity: 0.35 + R() * 0.45 }, p.inner); }
    for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, r = 0.95 + R() * 0.3; el('circle', { cx: 104 + Math.cos(a) * 80 * r, cy: 76 + Math.sin(a) * 54 * r, r: 1.2 + R() * 2.4, fill: R() < 0.5 ? C[1] : C[0], opacity: 0.8 }, g); }
    if (!weed) return;
    // seutas rumput laut tersangkut
    const w = el('g', { filter: 'url(#cast)' }, g);
    const wd = 'M30,104C60,60 84,112 112,70S160,56 186,34';
    el('path', { d: wd, fill: 'none', stroke: '#3f5a2e', 'stroke-width': 12, 'stroke-linecap': 'round' }, w);
    el('path', { d: wd, fill: 'none', stroke: '#7d9446', 'stroke-width': 7, 'stroke-linecap': 'round' }, w);
    el('path', { d: wd, fill: 'none', stroke: '#c6d67e', 'stroke-width': 1.6, 'stroke-opacity': 0.8, 'stroke-linecap': 'round', 'stroke-dasharray': '18 12' }, w);
  }

  /** label kertas bergantung di tali; kanvas 230×120, tulisan dari DOM */
  function tag(g, R) {
    el('path', { d: 'M40,60Q14,38 6,4', fill: 'none', stroke: '#8a6238', 'stroke-width': 4.6, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M40,60Q14,38 6,4', fill: 'none', stroke: '#d5b07a', 'stroke-width': 2.8, 'stroke-linecap': 'round', 'stroke-dasharray': '5 3' }, g);
    const d = 'M46,22H210Q218,22 218,30V94Q218,102 210,102H46L18,62Z';
    const p = shape(g, d, [18, 22, 200, 80], ['#e3cda2', '#fbf1d8', '#fffaf0'], R, { n: 50, dir: [1, 0.04], width: [8, 18], cast: 'castBig' });
    el('path', { d, fill: kawung(g, '#b9975c', 40, 1), opacity: 0.13 }, p.inner);
    el('path', { d: 'M52,30H208Q210,30 210,32V92Q210,94 208,94H52', fill: 'none', stroke: '#1f8a8a', 'stroke-width': 1.4, 'stroke-opacity': 0.55, 'stroke-dasharray': '5 4' }, p.inner);
    el('circle', { cx: 40, cy: 62, r: 6.5, fill: '#7a5a3a' }, g);
    el('circle', { cx: 40, cy: 62, r: 9, fill: 'none', stroke: '#c9a26b', 'stroke-width': 2.4 }, g);
  }

  /* ───────────── kerang & bintang laut (kanvas 120×120) ───────────── */
  /** kerang kipas; (0,0) = engsel, mekar ke atas */
  function fan(g, R, { r = 64, ribs = 9, pal = ['#d9645c', '#f7a58c', '#ffe6cf'], scallop = true } = {}) {
    const a0 = -160, a1 = -20, pt = (a, rr) => [Math.cos((a * Math.PI) / 180) * rr, Math.sin((a * Math.PI) / 180) * rr];
    let d = `M-13,2L${pt(a0, r).join(',')}`;
    for (let i = 0; i < ribs; i++) {
      const b = a0 + ((i + 1) / ribs) * (a1 - a0), m = a0 + ((i + 0.5) / ribs) * (a1 - a0);
      d += `Q${pt(m, r * (scallop ? 1.14 : 1.035)).join(',')} ${pt(b, r).join(',')}`;
    }
    d += 'L13,2Q0,9 -13,2Z';
    el('ellipse', { cx: 5, cy: -8, rx: r * 0.9, ry: 13, fill: '#7a4a35', opacity: 0.3, filter: 'url(#soft)' }, g);
    el('path', { d: 'M-22,-4L-10,-12L10,-12L22,-4L12,4H-12Z', fill: pal[0], stroke: mix(pal[0], '#3a1d12', 0.4), 'stroke-width': 1 }, g);
    const p = painted(g, d, {
      base: radGrad(g, [[0, pal[2]], [0.5, pal[1]], [1, pal[0]]], -4, -4, r * 1.08), n: 46, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const a = a0 + R() * (a1 - a0), r0 = r * (0.15 + R() * 0.5), r1 = r0 + r * (0.15 + R() * 0.3); const [x0, y0] = pt(a, r0), [x1, y1] = pt(a, r1); return { d: `M${x0},${y0}L${x1},${y1}`, color: jitter(ramp([[0, pal[2]], [0.5, pal[1]], [1, pal[0]]], r1 / r + (a > -90 ? 0.12 : -0.1)), 6, R), width: 3 + R() * 5, opacity: 0.35 + R() * 0.4 }; },
    });
    for (let i = 1; i < ribs; i++) {
      const a = a0 + (i / ribs) * (a1 - a0), [x, y] = pt(a, r * 0.99), [xs, ys] = pt(a, r * 0.16);
      el('path', { d: `M${xs},${ys}L${x},${y}`, stroke: mix(pal[0], '#3a1d12', 0.35), 'stroke-width': 1.5, 'stroke-opacity': 0.5 }, p.inner);
      el('path', { d: `M${xs - 1.4},${ys}L${x - 2},${y}`, stroke: '#fff', 'stroke-width': 1.1, 'stroke-opacity': 0.5 }, p.inner);
    }
    for (const k of [0.5, 0.74]) el('path', { d: `M${pt(a0, r * k).join(',')}A${r * k},${r * k} 0 0 1 ${pt(a1, r * k).join(',')}`, fill: 'none', stroke: '#fff7ea', 'stroke-width': 2.6, 'stroke-opacity': 0.4 }, p.inner);
  }
  /** siput berulir; (0,0) = tengah, puncak di kanan-atas */
  function whorl(g, R) {
    const pal = ['#c9773f', '#f6dcb4', '#fffaf0'];
    el('ellipse', { cx: 4, cy: 30, rx: 50, ry: 12, fill: '#7a4a35', opacity: 0.3, filter: 'url(#soft)' }, g);
    const rows = [[-22, 16, 29, 25], [-2, 0, 23, 20], [14, -13, 17, 15], [27, -24, 12, 10], [36, -32, 7, 6]];
    rows.forEach(([x, y, rx, ry], i) => {
      const d = `M${x - rx},${y}A${rx},${ry} 0 1 1 ${x + rx},${y}A${rx},${ry} 0 1 1 ${x - rx},${y}Z`;
      const p = painted(g, d, {
        base: radGrad(g, [[0, pal[2]], [0.6, pal[1]], [1, pal[0]]], x - rx * 0.4, y - ry * 0.5, rx * 1.6), n: 16, R, filter: 'impastoFine', cast: i ? undefined : 'cast', transform: `rotate(-40 ${x} ${y})`,
        stroke: () => ({ d: `M${x - rx + R() * rx * 2},${y - ry}v${ry * 2}`, color: jitter(R() < 0.45 ? '#d98a4f' : pal[1], 6, R), width: 2 + R() * 4, opacity: 0.3 + R() * 0.3 }),
      });
      el('path', { d: `M${x - rx * 0.8},${y + ry * 0.55}Q${x},${y + ry * 1.15} ${x + rx * 0.8},${y + ry * 0.55}`, fill: 'none', stroke: '#8a4a2a', 'stroke-width': 2, 'stroke-opacity': 0.35 }, p.inner);
    });
    // mulut cangkang
    el('ellipse', { cx: -30, cy: 26, rx: 15, ry: 9, fill: '#7a3a2a', transform: 'rotate(-40 -30 26)' }, g);
    el('ellipse', { cx: -31, cy: 24, rx: 10, ry: 5.5, fill: '#f7b9a0', transform: 'rotate(-40 -31 24)' }, g);
  }
  /** bintang laut; (0,0) = tengah */
  function starfish(g, R) {
    const pal = ['#c95a2e', '#f28b54', '#ffc08c'];
    let d = '';
    for (let i = 0; i < 5; i++) {
      const a = ((i * 72 - 90) * Math.PI) / 180, b = ((i * 72 - 54) * Math.PI) / 180, c = ((i * 72 - 126) * Math.PI) / 180;
      const tip = [Math.cos(a) * 52, Math.sin(a) * 52], inL = [Math.cos(c) * 19, Math.sin(c) * 19], inR = [Math.cos(b) * 19, Math.sin(b) * 19];
      d += `${i ? 'L' : 'M'}${inL[0].toFixed(1)},${inL[1].toFixed(1)}Q${(tip[0] * 0.98 + inL[0] * 0.1).toFixed(1)},${(tip[1] * 0.98 + inL[1] * 0.1).toFixed(1)} ${tip[0].toFixed(1)},${tip[1].toFixed(1)}Q${(tip[0] * 0.98 + inR[0] * 0.1).toFixed(1)},${(tip[1] * 0.98 + inR[1] * 0.1).toFixed(1)} ${inR[0].toFixed(1)},${inR[1].toFixed(1)}`;
    }
    el('ellipse', { cx: 6, cy: 9, rx: 46, ry: 40, fill: '#7a4a35', opacity: 0.3, filter: 'url(#soft)' }, g);
    const p = painted(g, d + 'Z', {
      base: radGrad(g, [[0, pal[2]], [0.5, pal[1]], [1, pal[0]]], -8, -10, 58), n: 50, R, filter: 'impasto', cast: 'cast',
      stroke: () => { const a = R() * Math.PI * 2, r0 = R() * 24, r1 = r0 + 8 + R() * 18; return { d: `M${Math.cos(a) * r0},${Math.sin(a) * r0}L${Math.cos(a) * r1},${Math.sin(a) * r1}`, color: jitter(mix(pal[1], R() < 0.5 ? pal[0] : pal[2], R() * 0.7), 6, R), width: 3 + R() * 5, opacity: 0.4 }; },
    });
    for (let i = 0; i < 5; i++) {
      const a = ((i * 72 - 90) * Math.PI) / 180;
      for (let k = 1; k <= 6; k++) el('circle', { cx: Math.cos(a) * k * 7.4, cy: Math.sin(a) * k * 7.4, r: 2.3 - k * 0.2, fill: '#fff0d6', opacity: 0.85 }, p.inner);
    }
    el('circle', { r: 3.2, fill: '#fff0d6', opacity: 0.9 }, p.inner);
  }

  /* ───────────── pelepah nyiur: menjuntai dari sudut kiri-atas, tepinya kena cahaya senja ───────────── */
  function frond(g, R, { len, bend, droop, w = 78, n = 22 }) {
    const c = [len * 0.5, -bend], e = [len, droop];
    const P = (t) => [2 * (1 - t) * t * c[0] + t * t * e[0], 2 * (1 - t) * t * c[1] + t * t * e[1]];
    const A = (t) => Math.atan2(2 * (1 - t) * c[1] + 2 * t * (e[1] - c[1]), 2 * (1 - t) * c[0] + 2 * t * (e[0] - c[0]));
    const lf = el('g', { filter: 'url(#impastoFine)' }, g);
    for (let i = 0; i < n; i++) {
      const t = 0.07 + (i / n) * 0.93, [x, y] = P(t), a = A(t);
      const L = w * (0.42 + 0.95 * Math.sin(Math.PI * Math.pow(t, 0.75))) * (0.85 + R() * 0.3);
      for (const side of [-1, 1]) {
        // anak daun: condong ke ujung pelepah, lalu ditarik gravitasi
        let an = a + side * (1.05 - t * 0.45);
        an = an + (Math.PI / 2 - an) * (side > 0 ? 0.3 : 0.12);
        const deg = (an * 180) / Math.PI, wl = L * 0.085;
        const d = `M0,0Q${L * 0.45},${-wl} ${L},${side * L * 0.12}Q${L * 0.5},${wl * 1.3} 0,0Z`;
        const col = side < 0 ? mix('#2c7350', '#74a64e', R() * 0.55) : mix('#12392f', '#235b45', R() * 0.8);
        el('path', { d, fill: jitter(col, 6, R), transform: `translate(${x} ${y}) rotate(${deg})` }, lf);
        el('path', { d: `M${L * 0.08},${-wl * 0.4}Q${L * 0.45},${-wl * 1.05} ${L * 0.96},${side * L * 0.115}`, fill: 'none', stroke: side < 0 ? '#ffc27a' : '#f08a5c', 'stroke-width': 1.5, 'stroke-opacity': side < 0 ? 0.7 : 0.4, 'stroke-linecap': 'round', transform: `translate(${x} ${y}) rotate(${deg})` }, lf);
      }
    }
    const rd = `M0,0Q${c[0]},${c[1]} ${e[0]},${e[1]}`;
    el('path', { d: rd, fill: 'none', stroke: '#1c4a37', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    el('path', { d: rd, fill: 'none', stroke: '#f0a860', 'stroke-width': 1.7, 'stroke-opacity': 0.75, 'stroke-linecap': 'round', transform: 'translate(-0.8 -1.6)' }, g);
  }
  function palm(g, R) {
    const o = el('g', { transform: 'translate(-6 26)', filter: 'url(#cast)' }, g);
    for (const [rot, len, bend, droop] of [[84, 320, 30, 40], [-14, 230, 40, 30], [62, 380, 50, 70], [12, 300, 56, 96], [38, 370, 60, 104]]) frond(el('g', { transform: `rotate(${rot})` }, o), R, { len, bend, droop });
    // seikat kelapa muda di pangkal pelepah
    for (const [x, y, r] of [[26, 28, 22], [52, 10, 19], [8, 50, 18]]) el('circle', { cx: x, cy: y, r, fill: radGrad(g, [[0, '#9cc26a'], [0.6, '#3f7a45'], [1, '#17402f']], x - r * 0.4, y - r * 0.45, r * 1.5), stroke: '#12392f', 'stroke-width': 1.2 }, o);
  }

  /** ranting hanyut untuk menulis di pasir; kanvas 200×56, ujung tulisnya di kiri-bawah */
  function stick(g, R) {
    const s = el('g', { filter: 'url(#cast)' }, g);
    const main = 'M6,46Q66,22 124,26T194,10', fork = 'M118,27Q138,10 158,5';
    for (const [d, w] of [[main, 9], [fork, 6]]) {
      el('path', { d, fill: 'none', stroke: '#4a3528', 'stroke-width': w, 'stroke-linecap': 'round' }, s);
      el('path', { d, fill: 'none', stroke: '#8f705a', 'stroke-width': w - 2.6, 'stroke-linecap': 'round' }, s);
      el('path', { d, fill: 'none', stroke: '#d9c0a2', 'stroke-width': 1.6, 'stroke-opacity': 0.85, 'stroke-linecap': 'round', 'stroke-dasharray': '26 9 40 14', transform: 'translate(-0.6 -2)' }, s);
    }
    for (const x of [44, 90, 150]) el('path', { d: `M${x},${36 - x * 0.12}l3,5`, stroke: '#4a3528', 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, s);
  }

  /** perangko bergerigi berisi kamboja; kanvas 100×124 */
  function stamp(g, R) {
    let d = 'M8,8';
    for (let i = 0; i < 12; i++) d += 'a3.5,3.5 0 0 0 7,0';
    for (let i = 0; i < 15; i++) d += 'a3.5,3.5 0 0 0 0,7.2';
    for (let i = 0; i < 12; i++) d += 'a3.5,3.5 0 0 0 -7,0';
    for (let i = 0; i < 15; i++) d += 'a3.5,3.5 0 0 0 0,-7.2';
    el('path', { d: d + 'Z', fill: '#fffaf0', filter: 'url(#cast)' }, g);
    shape(g, 'M17,17H83V107H17Z', [17, 17, 66, 90], ['#17726f', '#249a94', '#7fd0c0'], R, { n: 30, dir: [1, 0.1], width: [6, 14], len: [10, 40], base: linGrad(g, [[0, '#f7a37a'], [0.5, '#e9838a'], [0.52, '#2aa39b'], [1, '#17726f']], 0, 17, 0, 107) });
    el('circle', { cx: 64, cy: 56, r: 13, fill: '#fff2b8', opacity: 0.9 }, g);
    for (const y of [74, 86, 97]) el('path', { d: `M19,${y}q8,-5 16,0t16,0t16,0t14,0`, fill: 'none', stroke: '#eafff6', 'stroke-width': 1.6, 'stroke-opacity': 0.7 }, g);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(42 50) rotate(10)' }, g), R, 0.13);
  }

  /* ───────────── kepiting (mini-game): mata & mulutnya dari DOM; kanvas 300×240 ───────────── */
  const CRAB = { dark: '#a12f1e', base: '#e5553c', light: '#ff9370', hi: '#ffc6a6' };
  function crab(g, R) {
    el('ellipse', { cx: 154, cy: 198, rx: 112, ry: 15, fill: '#7a4a35', opacity: 0.36, filter: 'url(#soft)' }, g);
    const limb = (d, w) => {
      el('path', { d, fill: 'none', stroke: CRAB.dark, 'stroke-width': w + 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      el('path', { d, fill: 'none', stroke: CRAB.base, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      el('path', { d, fill: 'none', stroke: CRAB.light, 'stroke-width': w * 0.3, 'stroke-opacity': 0.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(-1 -2.4)' }, g);
    };
    // kaki: tiga pasang, beruas dua
    for (let i = 0; i < 3; i++) {
      limb(`M${86 + i * 10},${150 + i * 7}L${44 - i * 2},${142 + i * 13}L${24 + i * 9},${182 + i * 6}`, 10 - i);
      limb(`M${214 - i * 10},${150 + i * 7}L${256 + i * 2},${142 + i * 13}L${276 - i * 9},${182 + i * 6}`, 10 - i);
    }
    // tangkai mata
    limb('M132,92Q128,70 126,56', 7);
    limb('M168,92Q172,70 174,56', 7);
    // lengan capit: kiri rendah, kanan terangkat (memegang gabus)
    limb('M88,124L56,108', 13);
    limb('M212,116L250,92L242,62', 13);
    const claw = (x, y, rot, s) => {
      const c = el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` }, g);
      const d = 'M0,14C-22,10 -26,-18 -10,-34C-4,-40 2,-36 0,-28C-2,-20 0,-14 6,-12C8,-22 12,-36 20,-34C30,-18 24,10 0,14Z';
      shape(c, d, [-26, -40, 56, 56], [CRAB.dark, CRAB.base, CRAB.light], R, { n: 16, dir: [0.2, 1], width: [4, 9], len: [8, 22], cast: 'cast', base: radGrad(g, [[0, CRAB.light], [0.55, CRAB.base], [1, CRAB.dark]], -8, -18, 40) });
      el('path', { d, fill: 'none', stroke: CRAB.dark, 'stroke-width': 1.6, 'stroke-opacity': 0.7 }, c);
      el('path', { d: 'M-15,-20Q-17,-4 -6,6', fill: 'none', stroke: CRAB.hi, 'stroke-width': 2.6, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, c);
    };
    claw(44, 100, -52, 1);
    claw(240, 52, 6, 1.08);
    // tempurung
    const d = 'M70,150Q58,102 104,86Q150,72 196,86Q242,102 230,150Q216,178 150,180Q84,178 70,150Z';
    const p = painted(g, d, {
      base: radGrad(g, [[0, CRAB.light], [0.5, CRAB.base], [1, CRAB.dark]], 122, 104, 130), n: 70, R, filter: 'impasto', cast: 'castBig',
      stroke: () => { const x = 70 + R() * 150, y = 86 + R() * 90, L = 16 + R() * 40; const lit = (x - 70) / 160 + (y - 86) / 94 < 0.85; return { d: `M${x},${y}q${L / 2},${-5 + R() * 4} ${L},${(R() - 0.5) * 6}`, color: jitter(mix(CRAB.base, lit ? CRAB.light : CRAB.dark, R() * 0.7), 6, R), width: 5 + R() * 9, opacity: 0.35 + R() * 0.4 }; },
    });
    for (const [x, y, r] of [[102, 104, 5], [118, 96, 3.4], [184, 98, 4.4], [200, 110, 3], [150, 90, 3.6]]) el('circle', { cx: x, cy: y, r, fill: CRAB.hi, opacity: 0.6 }, p.inner);
    el('path', { d: 'M88,106Q112,88 146,84', fill: 'none', stroke: '#fff0e2', 'stroke-width': 4, 'stroke-opacity': 0.6, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
    el('path', { d: 'M92,164Q150,178 208,164', fill: 'none', stroke: CRAB.dark, 'stroke-width': 2.4, 'stroke-opacity': 0.55, 'stroke-linecap': 'round' }, p.inner);
    el('path', { d, fill: 'none', stroke: CRAB.dark, 'stroke-width': 2, 'stroke-opacity': 0.7 }, g);
  }

  /* ───────────── sprite ───────────── */
  const scaled = (name, w, h, seed, draw, k = 0.5) => { F.sprites[name] = { w: w * k, h: h * k, viewBox: `0 0 ${w} ${h}`, seed, draw }; };
  const at = (svg, tf) => el('g', { transform: tf }, svg);

  F.sprites['bg-botol'] = { w: W, h: H, seed: 621, scale: 1, draw(svg, R) { sky(svg, R); horizon(svg, R); sand(svg, R); sea(svg, R); el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#000', 0], [0.6, '#000', 0], [1, '#2a1230', 0.4]], W / 2, H * 0.52, H * 0.78) }, svg); } };
  scaled('botol-ombak', OW, OH, 622, (svg, R) => waveSheet(svg, R), 0.44);
  scaled('botol-basah', OW, OH, 623, (svg, R) => wetSheen(svg, R), 0.2);
  scaled('botol-ombak-jauh', 900, 84, 624, (svg, R) => swell(svg, R), 0.36);
  scaled('botol-kaca', BW, BH, 625, (svg, R) => bottle(svg, R), 0.75);
  scaled('botol-gabus', 84, 64, 626, (svg, R) => cork(svg, R), 0.8);
  scaled('botol-gulungan', 150, 64, 627, (svg, R) => scroll(svg, R), 0.8);
  scaled('botol-pasir-1', 210, 150, 628, (svg, R) => clump(svg, R), 0.5);
  scaled('botol-pasir-2', 210, 150, 629, (svg, R) => clump(svg, R, { weed: true }), 0.5);
  scaled('botol-label', 230, 120, 630, (svg, R) => tag(svg, R), 0.7);
  scaled('botol-kerang-1', 150, 120, 631, (svg, R) => fan(at(svg, 'translate(75 96)'), R), 0.6);
  scaled('botol-kerang-2', 150, 120, 632, (svg, R) => whorl(at(svg, 'translate(72 64)'), R), 0.6);
  scaled('botol-kerang-3', 150, 120, 633, (svg, R) => fan(at(svg, 'translate(75 96)'), R, { ribs: 12, scallop: false, pal: ['#a98bc4', '#e6d6f2', '#fffaf6'] }), 0.6);
  scaled('botol-bintang', 130, 130, 634, (svg, R) => starfish(at(svg, 'translate(62 62) rotate(12)'), R), 0.6);
  scaled('botol-nyiur', 440, 500, 635, (svg, R) => palm(svg, R), 0.4);
  scaled('botol-ranting', 200, 56, 636, (svg, R) => stick(svg, R), 0.6);
  scaled('botol-perangko', 100, 124, 637, (svg, R) => stamp(svg, R), 0.8);
  scaled('game-botol-kepiting', 300, 240, 638, (svg, R) => crab(svg, R), 0.7);

  F.sprites['cover-botol'] = { w: 480, h: 600, seed: 639, draw(svg, R) {
    const k = 480 / W;
    const bg = at(svg, `translate(0 -196) scale(${k})`);
    sky(bg, R); horizon(bg, R); sand(bg, R, { deco: false }); sea(bg, R);
    waveSheet(at(svg, `translate(-24 196) scale(${k})`), R);
    // botol rebah di pasir: gulungan dan gabus dulu, baru kacanya
    el('ellipse', { cx: 250, cy: 486, rx: 190, ry: 26, fill: '#7a4a35', opacity: 0.4, filter: 'url(#soft)', transform: 'rotate(-15 250 486)' }, svg);
    const b = at(svg, 'translate(34 446) rotate(-15) scale(0.86)');
    scroll(at(b, 'translate(70 70) rotate(-4) scale(1.2)'), R);
    scroll(at(b, 'translate(150 44) rotate(5)'), R);
    scroll(at(b, 'translate(176 86) rotate(-3)'), R);
    cork(at(b, 'translate(404 53)'), R);
    bottle(b, R);
    tag(at(b, 'translate(360 96) rotate(38) scale(0.62)'), R);
    clump(at(svg, 'translate(18 474) rotate(-10) scale(0.5)'), R, { weed: true });
    fan(at(svg, 'translate(96 566) rotate(-14) scale(0.6)'), R);
    whorl(at(svg, 'translate(300 560) scale(0.56)'), R);
    starfish(at(svg, 'translate(74 420) rotate(20) scale(0.46)'), R);
    palm(at(svg, 'translate(-8 -10) scale(0.72)'), R);
    F.flora.flowers.kamboja(at(svg, 'translate(196 560) rotate(10)'), R, 0.19);
    el('rect', { x: 0, y: 0, width: 480, height: 600, fill: radGrad(svg, [[0, '#000', 0], [0.62, '#000', 0], [1, '#2a1230', 0.36]], 240, 320, 430) }, svg);
  } };
})();
