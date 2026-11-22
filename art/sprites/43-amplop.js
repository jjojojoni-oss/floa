/* Amplop Rahasia: meja linen, amplop kertas berlapis, segel lilin, prangko kamboja, dan kartu katalognya. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, mix, jitter, ramp, leaf, linGrad, radGrad } = F;

  const PAPER = { base: '#f1e2c6', light: '#fff7e4', dark: '#d2b88e' };
  const INNER = { base: '#d9c29b', light: '#eadab8', dark: '#b89b6e' };
  const LINER = { base: '#c96a55', light: '#e89a80', dark: '#9c4235' };
  const WARM = '#3a1d12';

  /** Lembar kertas: sapuan searah `dir` di dalam kotak [x, y, w, h]. */
  function sheet(parent, d, R, { pal = PAPER, tone = 0, dir = [1, 0.12], box, n = 110, cast = 'cast', filter = 'impastoFine', width = [9, 22], len = [50, 150] } = {}) {
    const base = mix(pal.base, tone > 0 ? pal.light : pal.dark, Math.abs(tone));
    const m = Math.hypot(dir[0], dir[1]);
    return painted(parent, d, {
      base, n, R, filter, cast,
      stroke: () => {
        const x = box[0] + R() * box[2], y = box[1] + R() * box[3];
        const L = len[0] + R() * (len[1] - len[0]);
        const c = mix(base, R() < 0.55 ? pal.light : pal.dark, R() * 0.5);
        return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(c, 4, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.22 + R() * 0.4 };
      },
    });
  }

  /** Motif kawung sebagai pattern; mengembalikan nilai fill. */
  function kawung(node, { size = 44, color = '#8a5f36', sw = 1.2, rot = 0 } = {}) {
    const id = F.uid('k');
    const root = node.ownerSVGElement || node;
    const pt = el('pattern', { id, width: size, height: size, patternUnits: 'userSpaceOnUse', patternTransform: `rotate(${rot})` }, root.querySelector('defs'));
    const h = size / 2;
    for (const [cx, cy] of [[0, 0], [size, 0], [0, size], [size, size], [h, h]]) {
      for (const a of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: size * 0.2, ry: size * 0.09, fill: 'none', stroke: color, 'stroke-width': sw, transform: `rotate(${a} ${cx} ${cy}) translate(${size * 0.235} 0)` }, pt);
      el('circle', { cx, cy, r: size * 0.032, fill: color }, pt);
    }
    return `url(#${id})`;
  }

  /* ── geometri amplop, koordinat badan 480×312 (0,0 = sudut kiri-atas, engsel tutup di y=0) ── */
  const BODY = 'M9,0H471Q480,0 480,9V303Q480,312 471,312H9Q0,312 0,303V9Q0,0 9,0Z';
  const LEFT = 'M0,3L250,172L0,309Z';
  const RIGHT = 'M480,3L230,172L480,309Z';
  const BOTTOM = 'M3,312L220,150Q240,135 260,150L477,312Z';
  const FLAP = 'M2,0L478,0L262,178Q240,195 218,178Z';
  const FLAP_OPEN = 'M2,0L478,0L262,-178Q240,-195 218,-178Z';

  /** bagian dalam amplop (terlihat lewat bukaan V) */
  function envBack(g, R, { shadow = 'castBig' } = {}) {
    const p = sheet(g, BODY, R, { pal: INNER, tone: -0.15, box: [0, 0, 480, 312], n: 120, cast: shadow });
    el('path', { d: 'M0,0H480V200H0Z', fill: kawung(g, { size: 40, color: '#8d6a3c', sw: 1.3, rot: 12 }), opacity: 0.3 }, p.inner);
    el('path', { d: 'M0,0H480V120H0Z', fill: linGrad(g, [[0, WARM, 0.4], [1, WARM, 0]], 0, 0, 0, 120) }, p.inner);
  }

  /** kantong depan: lipatan kiri, kanan, bawah */
  function envPocket(g, R) {
    sheet(g, LEFT, R, { tone: 0.12, dir: [1, 0.68], box: [0, 0, 250, 312], n: 80 });
    const r = sheet(g, RIGHT, R, { tone: -0.38, dir: [-1, 0.68], box: [230, 0, 250, 312], n: 80 });
    el('path', { d: RIGHT, fill: linGrad(g, [[0, WARM, 0], [1, WARM, 0.14]], 230, 160, 480, 240) }, r.inner);
    const b = sheet(g, BOTTOM, R, { tone: 0.38, dir: [1, -0.04], box: [0, 130, 480, 190], n: 110 });
    el('path', { d: BOTTOM, fill: linGrad(g, [[0, '#fffaf0', 0.35], [0.5, '#fffaf0', 0], [1, WARM, 0.12]], 0, 150, 480, 312) }, b.inner);
    // tepi lipatan yang kena cahaya
    el('path', { d: 'M6,309L220,151Q240,137 258,149', fill: 'none', stroke: '#fffaf0', 'stroke-width': 3, 'stroke-opacity': 0.75, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M3,6L246,170', fill: 'none', stroke: '#fffaf0', 'stroke-width': 2.4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, g);
  }

  /** tutup amplop, sisi luar (posisi tertutup) */
  function envFlap(g, R) {
    const p = sheet(g, FLAP, R, { tone: 0.6, dir: [0.12, 1], box: [0, -10, 480, 150], n: 100, len: [40, 110] });
    el('path', { d: FLAP, fill: linGrad(g, [[0, '#fffdf4', 0.5], [0.55, '#fffdf4', 0], [1, WARM, 0.1]], 60, 0, 330, 190) }, p.inner);
    el('path', { d: 'M4,2H476', fill: 'none', stroke: WARM, 'stroke-width': 2, 'stroke-opacity': 0.14 }, p.inner);
    el('path', { d: 'M476,3L262,177Q240,193 220,179', fill: 'none', stroke: WARM, 'stroke-width': 2.4, 'stroke-opacity': 0.16, 'stroke-linecap': 'round' }, p.inner);
  }

  /** tutup amplop, sisi dalam (posisi terbuka, menghadap atas): kertas pelapis bermotif kawung */
  function envFlapOpen(g, R) {
    sheet(g, FLAP_OPEN, R, { tone: 0.15, dir: [0.12, -1], box: [0, 0, 480, -195], n: 90, len: [40, 110] });
    const d = 'M34,-9L446,-9L254,-164Q240,-175 226,-164Z';
    const p = sheet(g, d, R, { pal: LINER, tone: 0, dir: [0.2, -1], box: [30, -5, 420, -170], n: 80, cast: false, len: [30, 90], width: [8, 18] });
    el('path', { d, fill: kawung(g, { size: 38, color: '#ffe9cf', sw: 1.5, rot: 8 }), opacity: 0.6 }, p.inner);
    el('path', { d, fill: linGrad(g, [[0, WARM, 0.32], [0.45, WARM, 0]], 0, 0, 0, -120) }, p.inner);
  }

  /** prangko bergerigi bergambar kamboja; (0,0) = sudut kiri-atas, ukuran 76×94 */
  function stamp(g, R) {
    const w = 76, h = 94, step = 9.4;
    let d = 'M0,0';
    for (let x = 0; x < w - 0.1; x += w / 8) d += `q${w / 16},3.2 ${w / 8},0`;
    for (let y = 0; y < h - 0.1; y += h / 10) d += `q-3.2,${h / 20} 0,${h / 10}`;
    for (let x = 0; x < w - 0.1; x += w / 8) d += `q${-w / 16},-3.2 ${-w / 8},0`;
    for (let y = 0; y < h - 0.1; y += h / 10) d += `q3.2,${-h / 20} 0,${-h / 10}`;
    d += 'Z';
    void step;
    sheet(g, d, R, { pal: { base: '#fffaf0', light: '#ffffff', dark: '#ece0c8' }, box: [0, 0, w, h], n: 20, len: [20, 50], width: [6, 12] });
    // gambar: langit senja + kamboja
    const pic = 'M7,7H69V87H7Z';
    const sk = [[0, '#f6b79d'], [0.55, '#fbd9b4'], [1, '#bfd9c2']];
    painted(g, pic, { base: linGrad(g, sk, 0, 7, 0, 87), n: 46, R, filter: 'impastoFine', stroke: () => { const v = R(); const y = 7 + v * 80; const x = 7 + R() * 62; return { d: `M${x},${y}l${14 + R() * 26},${(R() - 0.5) * 3}`, color: jitter(ramp(sk, v), 5, R), width: 5 + R() * 6, opacity: 0.5 }; } });
    const fl = el('g', { transform: 'translate(39 54) scale(0.15)' }, g);
    leaf(fl, { len: 220, w: 84, ...F.flora.GREEN[1], R, n: 30, transform: 'rotate(-118)' });
    leaf(fl, { len: 210, w: 80, ...F.flora.GREEN[0], R, n: 30, transform: 'rotate(124)' });
    leaf(fl, { len: 190, w: 76, ...F.flora.GREEN[2], R, n: 26, transform: 'rotate(176)' });
    F.flora.flowers.kamboja(el('g', { transform: 'translate(0 -40) rotate(14)' }, fl), R, 1.1);
  }

  /** cap pos: lingkaran ganda + garis ombak, tinta nila yang tidak rata */
  function postmark(g, R) {
    const ink = '#3b3a63';
    const c = el('g', { filter: 'url(#wobble)', fill: 'none', stroke: ink, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: 0, cy: 0, r: 34, 'stroke-width': 3, 'stroke-opacity': 0.5 }, c);
    el('circle', { cx: 0, cy: 0, r: 25, 'stroke-width': 1.8, 'stroke-opacity': 0.45 }, c);
    for (let i = 0; i < 5; i++) el('path', { d: 'M0,0C5,-4 5.4,-11 0,-14C-5.4,-11 -5,-4 0,0Z', fill: ink, 'fill-opacity': 0.42, stroke: 'none', transform: `rotate(${i * 72})` }, c);
    for (let i = 0; i < 4; i++) {
      const y = -24 + i * 16;
      el('path', { d: `M-150,${y}q13,-9 26,0t26,0t26,0t26,0t20,-1`, 'stroke-width': 2.8, 'stroke-opacity': 0.34 + R() * 0.18 }, c);
    }
  }

  /** sisi alamat: kertas, pita tepi, prangko, cap pos, garis alamat */
  function envFace(g, R, { shadow = 'castBig', lines = true } = {}) {
    const p = sheet(g, BODY, R, { tone: 0.42, dir: [1, 0.1], box: [0, 0, 480, 312], n: 170, cast: shadow });
    el('path', { d: BODY, fill: linGrad(g, [[0, '#fffdf4', 0.55], [0.5, '#fffdf4', 0], [1, WARM, 0.12]], 0, 0, 480, 312) }, p.inner);
    // pita tepi bawah: sapuan miring merah bata dan hijau daun berselang
    for (let i = 0; i < 17; i++) {
      const x = -6 + i * 30;
      el('path', { d: `M${x},316l12,-26`, fill: 'none', stroke: jitter(i % 2 ? '#3f6f62' : '#b7392c', 8, R), 'stroke-width': 12, 'stroke-opacity': 0.82 }, p.inner);
    }
    if (lines) {
      el('path', { d: 'M44,236q150,3 300,-1', fill: 'none', stroke: '#4a3528', 'stroke-width': 1.8, 'stroke-opacity': 0.34, 'stroke-linecap': 'round' }, p.inner);
      el('path', { d: 'M44,270q90,2 180,-1', fill: 'none', stroke: '#4a3528', 'stroke-width': 1.8, 'stroke-opacity': 0.26, 'stroke-linecap': 'round' }, p.inner);
    }
    postmark(el('g', { transform: 'translate(352 78) rotate(-9)' }, g), R);
    stamp(el('g', { transform: 'translate(380 22) rotate(4)' }, g), R);
  }

  /* ── segel lilin: koordinat lokal berpusat di (0,0), jari-jari ±90 ── */
  const CRACK = [[6, -104], [-12, -54], [16, -18], [-14, 18], [12, 56], [-4, 104]];
  const crackPath = CRACK.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('');

  function seal(g, R) {
    const n = 16, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = 82 + R() * 9 + (i % 2 ? -4 : 3);
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]);
    let d = `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}`;
    for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); d += `Q${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`; }
    d += 'Z';
    const p = painted(g, d, {
      base: radGrad(g, [[0, '#e0483c'], [0.55, '#b3261e'], [1, '#7a120e']], -30, -34, 150), n: 96, R, filter: 'impasto', cast: 'cast',
      stroke: () => {
        const a = R() * Math.PI * 2, r0 = 18 + R() * 70, sw = 0.25 + R() * 0.7;
        const x0 = Math.cos(a) * r0, y0 = Math.sin(a) * r0, x1 = Math.cos(a + sw) * r0, y1 = Math.sin(a + sw) * r0;
        const lit = -(Math.cos(a + sw / 2) + Math.sin(a + sw / 2)) / 1.414; // 1 = menghadap kiri-atas
        const c = lit > 0 ? mix('#b3261e', '#f0695a', lit * 0.75) : mix('#b3261e', '#5e0d0a', -lit * 0.8);
        return { d: `M${x0},${y0}A${r0},${r0} 0 0 1 ${x1},${y1}`, color: jitter(c, 6, R), width: 7 + R() * 12, opacity: 0.3 + R() * 0.45 };
      },
    });
    // cekungan bekas stempel
    el('circle', { r: 55, fill: '#8f1712', opacity: 0.42 }, p.inner);
    el('circle', { r: 55, fill: 'none', stroke: '#4a0806', 'stroke-width': 6, 'stroke-opacity': 0.5, transform: 'translate(-1.5 -2)' }, p.inner);
    el('circle', { r: 56, fill: 'none', stroke: '#ff9a88', 'stroke-width': 3.6, 'stroke-opacity': 0.6, transform: 'translate(2.4 3)' }, p.inner);
    // kilap lilin
    el('ellipse', { cx: -44, cy: -54, rx: 30, ry: 10, fill: '#fff', opacity: 0.5, transform: 'rotate(-38 -44 -54)', filter: 'url(#blur2)' }, p.inner);
    el('circle', { cx: -62, cy: -34, r: 5, fill: '#fff', opacity: 0.65 }, p.inner);
    return p;
  }

  function sealHalf(svg, R, side, tx) {
    const id = F.uid('h');
    const cp = el('clipPath', { id }, svg.querySelector('defs'));
    const far = side < 0 ? -130 : 130;
    el('path', { d: `M${far},-130L${CRACK[0][0]},-130${CRACK.map(([x, y]) => `L${x},${y}`).join('')}L${CRACK[5][0]},130L${far},130Z` }, cp);
    const outer = el('g', { transform: tx }, svg);
    const g = el('g', { 'clip-path': `url(#${id})` }, outer);
    const p = seal(g, R);
    // tepi patahan: lilin bagian dalam yang lebih muda
    el('path', { d: crackPath, fill: 'none', stroke: '#f6a596', 'stroke-width': 8, 'stroke-opacity': 0.9, 'stroke-linejoin': 'round', transform: `translate(${side < 0 ? -3 : 3} 0)` }, p.inner);
    el('path', { d: crackPath, fill: 'none', stroke: '#4a0806', 'stroke-width': 2.4, 'stroke-opacity': 0.55, 'stroke-linejoin': 'round' }, p.inner);
  }

  const SEAL_TX = 'translate(60 60) scale(0.56)';
  F.sprites['amplop-segel'] = { w: 120, h: 120, seed: 433, draw(svg, R) { seal(el('g', { transform: SEAL_TX }, svg), R); } };
  F.sprites['amplop-segel-kiri'] = { w: 120, h: 120, seed: 433, draw(svg, R) { sealHalf(svg, R, -1, SEAL_TX); } };
  F.sprites['amplop-segel-kanan'] = { w: 120, h: 120, seed: 433, draw(svg, R) { sealHalf(svg, R, 1, SEAL_TX); } };
  F.sprites['amplop-retak'] = { w: 120, h: 120, seed: 434, draw(svg) {
    const g = el('g', { transform: SEAL_TX, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    const inner = CRACK.slice(0, 5).map(([x, y], i) => `${i ? 'L' : 'M'}${x},${Math.max(-80, y)}`).join('') + 'L0,80';
    el('path', { d: inner, stroke: '#ff9a88', 'stroke-width': 3, 'stroke-opacity': 0.7, transform: 'translate(3 2)' }, g);
    el('path', { d: inner, stroke: '#3a0504', 'stroke-width': 5.5 }, g);
    [['M-12,-54L-34,-44', 3.4], ['M16,-18L40,-27', 3.4], ['M-14,18L-38,30', 3.2], ['M12,56L34,66', 3]].forEach(([d, w]) => el('path', { d, stroke: '#3a0504', 'stroke-width': w }, g));
  } };

  /* ── lapisan amplop: kanvas 520×540, badan di (20,200)–(500,512), engsel tutup di y=200 ── */
  const W = 520, H = 540, AT = 'translate(20 200)';
  F.sprites['amplop-belakang'] = { w: W, h: H, seed: 435, draw(svg, R) { envBack(el('g', { transform: AT }, svg), R); } };
  F.sprites['amplop-kantong'] = { w: W, h: H, seed: 436, draw(svg, R) { envPocket(el('g', { transform: AT }, svg), R); } };
  F.sprites['amplop-tutup'] = { w: W, h: H, seed: 437, draw(svg, R) { envFlap(el('g', { transform: AT }, svg), R); } };
  F.sprites['amplop-tutup-dalam'] = { w: W, h: H, seed: 438, draw(svg, R) { envFlapOpen(el('g', { transform: AT }, svg), R); } };
  // sisi alamat: kanvas 520×352, badan di (20,20)
  F.sprites['amplop-muka'] = { w: 520, h: 352, seed: 439, draw(svg, R) { envFace(el('g', { transform: 'translate(20 20)' }, svg), R); } };

  /* ── latar: taplak linen bermotif kawung samar, cahaya sore, bayangan daun ── */
  function linen(svg, R, W2, H2, { n = 520 } = {}) {
    const stops = [[0, '#e3e6d0'], [0.5, '#d5dbc0'], [1, '#c0c9a6']];
    wash(svg, { x: -40, y: -20, w: W2 + 80, h: H2 + 40, R, n, angle: 0, len: [0.2, 0.55], width: [14, 34], opacity: [0.25, 0.6], base: linGrad(svg, stops, 0, 0, 0, H2), color: (u, v) => ramp(stops, v + (u - 0.5) * 0.08) });
    wash(svg, { x: -40, y: -20, w: W2 + 80, h: H2 + 40, R, n: Math.round(n * 0.5), angle: 90, len: [0.3, 0.8], width: [5, 14], opacity: [0.1, 0.26], color: (u, v, R2) => mix(ramp(stops, v), R2() < 0.5 ? '#f6f7e8' : '#9fab84', 0.55) });
    // benang anyaman halus
    const id = F.uid('ln');
    const pt = el('pattern', { id, width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(2)' }, svg.querySelector('defs'));
    el('path', { d: 'M0,1.5H7', stroke: '#5f6e48', 'stroke-width': 0.9, 'stroke-opacity': 0.2 }, pt);
    el('path', { d: 'M2,0V7', stroke: '#f6f7e8', 'stroke-width': 0.9, 'stroke-opacity': 0.34 }, pt);
    el('rect', { width: W2, height: H2, fill: `url(#${id})` }, svg);
    el('rect', { width: W2, height: H2, fill: kawung(svg, { size: 132, color: '#7d8c61', sw: 2.4, rot: 0 }), opacity: 0.2 }, svg);
  }

  const leafShape = (len, w) => `M0,0C${w * 0.62},${-len * 0.22} ${w * 0.5},${-len * 0.74} 0,${-len}C${-w * 0.5},${-len * 0.74} ${-w * 0.62},${-len * 0.22} 0,0Z`;
  /** bayangan dedaunan yang jatuh di meja (cahaya menembus dahan) */
  function leafShadows(svg, list, opacity = 0.17) {
    const g = el('g', { filter: 'url(#softer)', fill: '#3f4a2a', opacity }, svg);
    list.forEach(([x, y, rot, len, w]) => el('path', { d: leafShape(len, w), transform: `translate(${x} ${y}) rotate(${rot})` }, g));
    const g2 = el('g', { filter: 'url(#soft)', fill: '#3f4a2a', opacity: opacity * 0.7 }, svg);
    list.forEach(([x, y, rot, len, w], i) => { if (i % 2 === 0) el('path', { d: leafShape(len * 0.8, w * 0.7), transform: `translate(${x - 30} ${y + 40}) rotate(${rot + 14})` }, g2); });
  }

  /** rumpun daun + kamboja untuk sudut */
  function corner(g, R, { flip = 1 } = {}) {
    const gr = F.flora.GREEN;
    [[-12, 0, 330, 104], [22, 2, 360, 112], [52, 1, 320, 100], [80, 3, 270, 92]].forEach(([a, gi, len, w]) => leaf(g, { len, w, ...gr[gi], R, n: 46, transform: `rotate(${a * flip})`, curve: 0.18 * flip, cast: 'castBig' }));
    F.flora.fern(el('g', { transform: `rotate(${38 * flip})` }, g), R, { len: 380, bend: 60 * flip, gr: gr[3], pairs: 10, w: 74 });
  }

  F.sprites['bg-amplop'] = { w: 780, h: 1500, seed: 431, scale: 1, draw(svg, R) {
    linen(svg, R, 780, 1500);
    el('ellipse', { cx: 250, cy: 560, rx: 430, ry: 560, fill: '#fbfbe9', opacity: 0.55, filter: 'url(#softer)' }, svg);
    leafShadows(svg, [[700, 250, -150, 420, 150], [820, 520, -118, 460, 160], [560, 110, -172, 340, 120], [840, 860, -100, 380, 140], [640, 610, -138, 300, 110], [-40, 1010, 108, 380, 130]]);
    // sudut kiri-bawah: daun, kamboja, melati
    const c = el('g', { transform: 'translate(-30 1500)' }, svg);
    corner(c, R);
    const fl = el('g', { filter: 'url(#castBig)' }, svg);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(128 1352) rotate(20)' }, fl), R, 0.8);
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(296 1452) rotate(-30)' }, fl), R, 0.5);
    F.flora.flowers.melati(el('g', { transform: 'translate(262 1290) rotate(10)' }, fl), R, 0.62);
    F.flora.flowers.melati(el('g', { transform: 'translate(54 1178) rotate(40)' }, fl), R, 0.5);
    // sudut kanan-atas: ranting mengintip
    const t = el('g', { transform: 'translate(800 -16) rotate(196)' }, svg);
    [[-26, 1, 250, 86], [8, 0, 300, 96], [40, 2, 240, 84]].forEach(([a, gi, len, w]) => leaf(t, { len, w, ...F.flora.GREEN[gi], R, n: 40, transform: `rotate(${a})`, curve: 0.2, cast: 'castBig' }));
    F.flora.flowers.melati(el('g', { transform: 'translate(676 150) rotate(20)', filter: 'url(#cast)' }, svg), R, 0.56);
  } };

  /* ── kartu katalog ── */
  F.sprites['cover-amplop'] = { w: 480, h: 600, seed: 432, draw(svg, R) {
    const bg = el('g', { transform: 'scale(0.62)' }, svg);
    linen(bg, R, 780, 980, { n: 300 });
    el('ellipse', { cx: 250, cy: 380, rx: 400, ry: 420, fill: '#fbfbe9', opacity: 0.55, filter: 'url(#softer)' }, bg);
    leafShadows(bg, [[700, 180, -150, 380, 140], [820, 420, -118, 420, 150], [540, 70, -172, 300, 110], [-30, 700, 110, 340, 120]], 0.18);
    // rumpun di kiri-bawah
    const c = el('g', { transform: 'translate(-10 610) scale(0.5)' }, svg);
    corner(c, R);
    // amplop sisi alamat mengintip di belakang
    const a = el('g', { transform: 'translate(240 232) rotate(9) scale(0.74) translate(-240 -156)' }, svg);
    envFace(a, R, { lines: false });
    // amplop bersegel di depan
    const e = el('g', { transform: 'translate(232 370) rotate(-6) scale(0.82) translate(-240 -156)' }, svg);
    envBack(e, R);
    envPocket(e, R);
    envFlap(e, R);
    seal(el('g', { transform: 'translate(240 184) scale(0.5)' }, e), R);
    const fl = el('g', { filter: 'url(#castBig)' }, svg);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(92 508) rotate(24)' }, fl), R, 0.46);
    F.flora.flowers.melati(el('g', { transform: 'translate(176 560) rotate(8)' }, fl), R, 0.42);
    F.flora.flowers.melati(el('g', { transform: 'translate(398 88) rotate(30)' }, fl), R, 0.36);
  } };
})();
