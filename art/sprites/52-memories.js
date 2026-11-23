/* Our Memories: dinding kamar malam hari, untaian "lampu tumblr", foto dijepit jepitan kayu, saklar, dan kartu katalognya. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf, linGrad, radGrad } = F;
  const W = 780, H = 1500;
  const WARM = '#3a1d12';
  const NIGHT = '#10132c';

  const star = (cx, cy, r, rot = 0) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = ((rot + i * 36 - 90) * Math.PI) / 180, rr = i % 2 ? r * 0.48 : r;
      d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
    }
    return d + 'Z';
  };
  const leafShape = (len, w) => `M0,0C${w * 0.62},${-len * 0.22} ${w * 0.5},${-len * 0.74} 0,${-len}C${-w * 0.5},${-len * 0.74} ${-w * 0.62},${-len * 0.22} 0,0Z`;

  /** bayangan pelepah yang jatuh di dinding (dari tanaman di dekat jendela) */
  function frondShadow(svg, x, y, rot, len, n, color, opacity) {
    const g = el('g', { filter: 'url(#soft)', fill: color, opacity, transform: `translate(${x} ${y}) rotate(${rot})` }, svg);
    el('path', { d: `M-5,0L5,0L2,${-len}L-2,${-len}Z` }, g);
    for (let i = 0; i < n; i++) {
      const t = 0.14 + (i / n) * 0.86;
      for (const sgn of [-1, 1]) el('path', { d: leafShape(len * (0.46 - t * 0.2), len * 0.08), transform: `translate(0 ${-len * t}) rotate(${sgn * (66 - t * 28)})` }, g);
    }
  }

  /** Lidah mertua dalam pot tanah liat; (0,0) = tengah bibir pot. tone(c) menggelapkan/menghangatkan warna. */
  function plant(g, R, tone) {
    const gr = F.flora.GREEN;
    const leaves = [[-34, 330, 78, 1, 0.25], [26, 380, 84, 0, -0.2], [-14, 470, 90, 2, 0.12], [44, 300, 72, 3, -0.3], [8, 540, 92, 1, -0.08], [-50, 250, 66, 3, 0.35], [62, 220, 60, 2, -0.4]];
    leaves.forEach(([a, len, w, gi, curve]) => {
      const c = gr[gi];
      leaf(g, { len, w, dark: tone(c.dark), mid: tone(c.mid), light: tone(mix(c.light, '#e6dc8a', 0.25)), R, n: 56, transform: `translate(${a * 0.8} 6) rotate(${a})`, curve, cast: 'castBig' });
    });
    const pot = 'M-128,-6H128L104,150H-104Z';
    painted(g, pot, {
      base: tone('#b9623c'), n: 70, R, filter: 'impastoH', cast: 'castBig',
      stroke: () => { const x = -128 + R() * 256, y = -6 + R() * 156; return { d: `M${x},${y}l${40 + R() * 80},${(R() - 0.5) * 6}`, color: jitter(tone(mix('#b9623c', x < -10 ? '#e89a68' : '#7c3a22', R() * 0.6)), 6, R), width: 10 + R() * 16, opacity: 0.4 + R() * 0.4 }; },
    });
    painted(g, 'M-140,-30H140V8H-140Z', {
      base: tone('#c9714a'), n: 26, R, filter: 'impastoH', cast: 'cast',
      stroke: () => { const x = -140 + R() * 280, y = -30 + R() * 38; return { d: `M${x},${y}l${40 + R() * 70},0`, color: jitter(tone(mix('#c9714a', R() < 0.5 ? '#f0aa7c' : '#8a4428', R() * 0.5)), 6, R), width: 8 + R() * 10, opacity: 0.5 }; },
    });
  }

  /** dinding kamar; geometri (jendela, bintang, tanaman) sama persis untuk versi gelap dan terang */
  function wall(svg, R, lit) {
    const G = F.rng(5201);
    const stops = lit
      ? [[0, '#3a2748'], [0.22, '#5a3650'], [0.5, '#7a4a4e'], [0.78, '#5e3a4c'], [1, '#33233f']]
      : [[0, '#141731'], [0.3, '#202443'], [0.6, '#2a2647'], [0.85, '#211d3a'], [1, '#15142b']];
    wash(svg, { x: -60, y: -30, w: W + 120, h: H + 60, R, n: 560, angle: -3, len: [0.22, 0.6], width: [26, 62], opacity: [0.3, 0.7], base: linGrad(svg, stops, 0, 0, 0, H), color: (u, v) => ramp(stops, v + (u - 0.5) * 0.08) });
    if (lit) {
      el('rect', { width: W, height: H, fill: radGrad(svg, [[0, '#ffb86e', 0.5], [0.5, '#ff9550', 0.22], [1, '#ff9550', 0]], 390, 640, 700) }, svg);
      dabs(svg, { n: 22, R, filter: 'soft', place: (i, R2) => ({ x: R2() * W, y: 120 + R2() * 1100, rx: 10 + R2() * 18, color: R2() < 0.5 ? '#ffd08a' : '#ffa868', opacity: 0.1 + R2() * 0.12 }) });
    }

    // cahaya bulan dari jendela: empat petak miring + bayangan daun
    const P = [[64, 150], [352, 96], [396, 540], [108, 612]];
    const at = (u, v) => { const ax = P[0][0] + (P[1][0] - P[0][0]) * u, ay = P[0][1] + (P[1][1] - P[0][1]) * u, bx = P[3][0] + (P[2][0] - P[3][0]) * u, by = P[3][1] + (P[2][1] - P[3][1]) * u; return `${(ax + (bx - ax) * v).toFixed(1)},${(ay + (by - ay) * v).toFixed(1)}`; };
    const moon = el('g', { filter: 'url(#blur2)', opacity: lit ? 0.07 : 0.2 }, svg);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const u0 = i * 0.5 + 0.025, u1 = i * 0.5 + 0.475, v0 = j * 0.5 + 0.02, v1 = j * 0.5 + 0.48;
      el('path', { d: `M${at(u0, v0)}L${at(u1, v0)}L${at(u1, v1)}L${at(u0, v1)}Z`, fill: '#9fb3f2' }, moon);
    }
    frondShadow(svg, 30, 640, 34, 420, 8, lit ? '#2a1830' : '#0b0d22', lit ? 0.16 : 0.5);
    frondShadow(svg, 420, 600, -18, 330, 7, lit ? '#2a1830' : '#0b0d22', lit ? 0.12 : 0.42);

    // stiker bintang "glow in the dark" + bulan sabit
    const spots = [];
    for (let i = 0; i < 19; i++) spots.push([40 + G() * 700, 50 + G() * 1330, 8 + G() * 9, G() * 72]);
    const st = el('g', {}, svg);
    spots.forEach(([x, y, r, rot]) => {
      if (!lit) el('circle', { cx: x, cy: y, r: r * 2.6, fill: '#c9f79c', opacity: 0.22, filter: 'url(#soft)' }, st);
      el('path', { d: star(x, y, r, rot), fill: lit ? '#f1e6c6' : '#e2f8b4', opacity: lit ? 0.42 : 0.85, 'stroke-linejoin': 'round', stroke: lit ? '#f1e6c6' : '#e2f8b4', 'stroke-width': 2, 'stroke-opacity': lit ? 0.42 : 0.85 }, st);
    });
    const mx = 646, my = 168;
    if (!lit) el('circle', { cx: mx, cy: my, r: 70, fill: '#c9f79c', opacity: 0.2, filter: 'url(#soft)' }, st);
    el('path', { d: `M${mx - 6},${my - 38}a38,38 0 1 0 34,56a30,30 0 1 1 -34,-56Z`, fill: lit ? '#f1e6c6' : '#e2f8b4', opacity: lit ? 0.45 : 0.9 }, st);

    // tanaman di sudut kiri-bawah
    const tone = lit ? (c) => mix(c, '#7a3f2a', 0.14) : (c) => mix(c, NIGHT, 0.62);
    plant(el('g', { transform: 'translate(118 1392)' }, svg), R, tone);

    // sudut-sudut lebih gelap
    el('rect', { width: W, height: H, fill: radGrad(svg, [[0, '#0a0b1c', 0], [0.62, '#0a0b1c', 0], [1, '#0a0b1c', lit ? 0.5 : 0.6]], 390, 700, 900) }, svg);
    el('rect', { width: W, height: 260, y: H - 260, fill: linGrad(svg, [[0, '#0a0b1c', 0], [1, '#0a0b1c', lit ? 0.4 : 0.5]], 0, H - 260, 0, H) }, svg);
  }

  F.sprites['bg-memories'] = { w: W, h: H, seed: 521, scale: 1, draw(svg, R) { wall(svg, R, false); } };
  F.sprites['bg-memories-terang'] = { w: W, h: H, seed: 521, scale: 1, draw(svg, R) { wall(svg, R, true); } };

  /* ── bohlam kecil; (0,0) = pusat kaca ── */
  function bulb(g, lit, k = 1) {
    if (lit) el('circle', { r: 98 * k, fill: radGrad(g, [[0, '#fff3c4', 0.95], [0.15, '#ffdc90', 0.62], [0.4, '#ffb155', 0.25], [0.72, '#ff9a40', 0.07], [1, '#ff9a40', 0]], 0, 0, 98 * k) }, g);
    const b = el('g', { filter: 'url(#blur2)' }, g);
    const glass = `M0,${-20 * k}C${10 * k},${-20 * k} ${16 * k},${-6 * k} ${16 * k},${6 * k}C${16 * k},${18 * k} ${9 * k},${26 * k} 0,${26 * k}C${-9 * k},${26 * k} ${-16 * k},${18 * k} ${-16 * k},${6 * k}C${-16 * k},${-6 * k} ${-10 * k},${-20 * k} 0,${-20 * k}Z`;
    el('path', { d: glass, fill: lit ? radGrad(g, [[0, '#ffffff'], [0.45, '#fff6cc'], [1, '#ffc65e']], -2 * k, 4 * k, 22 * k) : linGrad(g, [[0, '#a7b0d6', 0.9], [1, '#565d8c', 0.9]], -10 * k, -20 * k, 12 * k, 26 * k) }, b);
    const c = el('g', {}, g);
    el('rect', { x: -7.5 * k, y: -33 * k, width: 15 * k, height: 15 * k, rx: 3 * k, fill: lit ? '#4b5a44' : '#1b2032' }, c);
    el('rect', { x: -7.5 * k, y: -28 * k, width: 15 * k, height: 3 * k, fill: lit ? '#8fa37c' : '#343b56' }, c);
    if (lit) {
      el('path', { d: glass, fill: 'none', stroke: '#ffe2a0', 'stroke-width': 2 * k, 'stroke-opacity': 0.8 }, c);
      el('ellipse', { cx: 0, cy: 5 * k, rx: 6 * k, ry: 9 * k, fill: '#ffffff', opacity: 0.95, filter: 'url(#blur2)' }, c);
    } else {
      el('path', { d: `M${-9 * k},${-4 * k}q${-2 * k},${10 * k} ${3 * k},${20 * k}`, fill: 'none', stroke: '#e6ebff', 'stroke-width': 2.6 * k, 'stroke-linecap': 'round', 'stroke-opacity': 0.55 }, c);
      el('path', { d: `M${-3 * k},${-8 * k}v${12 * k}m${6 * k},${-12 * k}v${12 * k}`, fill: 'none', stroke: '#2a2f4c', 'stroke-width': 1.4 * k, 'stroke-opacity': 0.6 }, c);
    }
  }
  F.sprites['memories-bohlam'] = { w: 200, h: 200, seed: 522, draw(svg) { bulb(el('g', { transform: 'translate(100 100)' }, svg), true); } };
  F.sprites['memories-bohlam-mati'] = { w: 60, h: 80, seed: 523, draw(svg) { bulb(el('g', { transform: 'translate(30 42)' }, svg), false); } };

  /* ── jepitan kayu mini; (0,0) = pusat atas, tinggi ±108 ── */
  function pin(g, R, k = 1) {
    const s = el('g', { transform: `scale(${k})` }, g);
    const slat = (x, d) => painted(s, d, {
      base: '#dbb680', n: 26, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const y = R() * 108; return { d: `M${x + (R() - 0.5) * 12},${y}l${(R() - 0.5) * 3},${14 + R() * 30}`, color: jitter(mix('#dbb680', R() < 0.5 ? '#f3d9a8' : '#b08a52', R() * 0.6), 5, R), width: 3 + R() * 4, opacity: 0.5 }; },
    });
    slat(-8, 'M-17,2Q-17,0 -15,0H-2V100Q-6,108 -12,108Q-17,108 -17,100Z');
    slat(8, 'M2,0H15Q17,0 17,2V100Q17,108 12,108Q6,108 2,100Z');
    // pegas kawat
    el('rect', { x: -19, y: 40, width: 38, height: 9, rx: 3, fill: '#8d8f98' }, s);
    el('rect', { x: -19, y: 41, width: 38, height: 3, rx: 1.5, fill: '#e2e4ea', opacity: 0.8 }, s);
    el('circle', { cx: 0, cy: 44.5, r: 5.5, fill: 'none', stroke: '#74767f', 'stroke-width': 2.4 }, s);
    el('path', { d: 'M0,2V100', stroke: WARM, 'stroke-width': 1.6, 'stroke-opacity': 0.35 }, s);
  }
  F.sprites['memories-jepit'] = { w: 52, h: 124, seed: 524, draw(svg, R) { pin(el('g', { transform: 'translate(26 6)' }, svg), R); } };

  /* ── amplop kecil kertas cokelat, disegel stiker hati; (0,0) = pusat ── */
  function envelope(g, R, k = 1) {
    const s = el('g', { transform: `scale(${k})` }, g);
    const body = 'M-100,-66H100V66H-100Z';
    const p = painted(s, body, {
      base: '#dcbc8c', n: 70, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const x = -100 + R() * 200, y = -66 + R() * 132; return { d: `M${x},${y}l${30 + R() * 60},${(R() - 0.5) * 6}`, color: jitter(mix('#dcbc8c', R() < 0.5 ? '#f1d9b0' : '#b89462', R() * 0.6), 5, R), width: 8 + R() * 12, opacity: 0.45 }; },
    });
    // lipatan bawah & samping
    el('path', { d: 'M-100,66L0,-2L100,66', fill: 'none', stroke: '#9a7648', 'stroke-width': 2.4, 'stroke-opacity': 0.5 }, p.inner);
    el('path', { d: 'M-100,66L0,-2L100,66Z', fill: '#fff3d6', opacity: 0.12 }, p.inner);
    // tutup segitiga
    painted(s, 'M-100,-66H100L0,14Z', {
      base: '#d2ae7a', n: 40, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = -90 + R() * 180, y = -66 + R() * 70; return { d: `M${x},${y}l${30 + R() * 50},${(R() - 0.5) * 6}`, color: jitter(mix('#d2ae7a', R() < 0.5 ? '#ecd0a2' : '#ae8854', R() * 0.6), 5, R), width: 8 + R() * 10, opacity: 0.45 }; },
    });
    heart(el('g', { transform: 'translate(0 12) rotate(-6)' }, s), R, 0.62);
  }
  /** stiker hati; (0,0) = pusat, lebar ±60 */
  function heart(g, R, k = 1) {
    const s = el('g', { transform: `scale(${k})` }, g);
    const d = 'M0,26C-40,-2 -30,-34 -10,-30C-3,-28 0,-22 0,-18C0,-22 3,-28 10,-30C30,-34 40,-2 0,26Z';
    painted(s, d, {
      base: '#e0483f', n: 26, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = -28 + R() * 56, y = -28 + R() * 50; return { d: `M${x},${y}l${8 + R() * 14},${(R() - 0.5) * 8}`, color: jitter(mix('#e0483f', x < 0 ? '#ff8f7c' : '#a82a2c', R() * 0.6), 6, R), width: 5 + R() * 6, opacity: 0.5 }; },
    });
    el('path', { d: 'M-17,-20q-8,6 -5,17', fill: 'none', stroke: '#fff', 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-opacity': 0.7 }, s);
  }
  F.sprites['memories-amplop'] = { w: 240, h: 176, seed: 525, draw(svg, R) { envelope(el('g', { transform: 'translate(120 86)' }, svg), R); } };
  F.sprites['memories-hati'] = { w: 80, h: 80, seed: 526, draw(svg, R) { heart(el('g', { transform: 'translate(40 42)' }, svg), R); } };

  /* ── saklar dinding; (0,0) = pusat pelat ── */
  function switchPlate(g, R, on) {
    const plate = 'M-50,-62Q-50,-74 -38,-74H38Q50,-74 50,-62V62Q50,74 38,74H-38Q-50,74 -50,62Z';
    painted(g, plate, {
      base: '#f1e7d2', n: 50, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const x = -50 + R() * 100, y = -74 + R() * 148; return { d: `M${x},${y}l${(R() - 0.5) * 6},${20 + R() * 40}`, color: jitter(mix('#f1e7d2', x < 0 ? '#ffffff' : '#cfc1a6', R() * 0.6), 4, R), width: 8 + R() * 10, opacity: 0.45 }; },
    });
    el('path', { d: plate, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': 0.6, transform: 'translate(-1 -1)' }, g);
    // tuas
    const rocker = 'M-24,-46H24V46H-24Z';
    el('path', { d: 'M-28,-50H28V50H-28Z', fill: '#bfb096', opacity: 0.9 }, g);
    const pr = painted(g, rocker, {
      base: linGrad(g, on ? [[0, '#ffffff'], [0.5, '#f6ecd8'], [1, '#d6c7ab']] : [[0, '#d6c7ab'], [0.5, '#f6ecd8'], [1, '#ffffff']], 0, -46, 0, 46), n: 18, R, filter: 'impastoFine',
      stroke: () => { const x = -24 + R() * 48, y = -46 + R() * 92; return { d: `M${x},${y}l${10 + R() * 20},0`, color: R() < 0.5 ? '#ffffff' : '#d9ccb2', width: 5 + R() * 6, opacity: 0.3 }; },
    });
    // sisi yang ditekan lebih teduh
    el('path', { d: on ? 'M-24,6H24V46H-24Z' : 'M-24,-46H24V-6H-24Z', fill: WARM, opacity: 0.16 }, pr.inner);
    el('path', { d: 'M-24,0H24', stroke: WARM, 'stroke-width': 1.6, 'stroke-opacity': 0.3 }, pr.inner);
    // lampu indikator: jingga saat mati (supaya ketemu di gelap), redup saat menyala
    const ly = on ? -30 : 30;
    if (!on) el('circle', { cx: 0, cy: ly, r: 16, fill: '#ffb347', opacity: 0.55, filter: 'url(#soft)' }, g);
    el('rect', { x: -7, y: ly - 3.5, width: 14, height: 7, rx: 3.5, fill: on ? '#b9a98a' : '#ffbd5c' }, g);
    if (!on) el('rect', { x: -4, y: ly - 2, width: 8, height: 2.4, rx: 1.2, fill: '#fff6d8' }, g);
  }
  F.sprites['memories-saklar'] = { w: 136, h: 190, seed: 527, draw(svg, R) { switchPlate(el('g', { transform: 'translate(66 90)' }, svg), R, false); } };
  F.sprites['memories-saklar-nyala'] = { w: 136, h: 190, seed: 527, draw(svg, R) { switchPlate(el('g', { transform: 'translate(66 90)' }, svg), R, true); } };

  /* ── kartu katalog ── */
  const SCENES = {
    senja: { sky: [[0, '#5d4a94'], [0.36, '#e8718c'], [0.62, '#ffb873'], [1, '#473a7e']], draw(g, R) {
      el('circle', { cx: 0, cy: -6, r: 26, fill: '#fff2c0' }, g);
      el('path', { d: 'M-70,6H70V70H-70Z', fill: linGrad(g, [[0, '#e88670', 0.9], [1, '#3f3577', 0.95]], 0, 6, 0, 70) }, g);
      for (let i = 0; i < 5; i++) el('path', { d: `M${-24 + (R() - 0.5) * 16},${16 + i * 9}h${30 + R() * 24}`, stroke: '#ffe9a6', 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-opacity': 0.75, fill: 'none' }, g);
    } },
    kebun: { sky: [[0, '#bfe0f0'], [0.55, '#eaf3df'], [1, '#f6f1d6']], draw(g, R) {
      el('circle', { cx: -36, cy: -40, r: 15, fill: '#fff6cf' }, g);
      el('path', { d: 'M-70,14Q-26,-18 14,8T70,0V70H-70Z', fill: '#8fc28a' }, g);
      el('path', { d: 'M-70,38Q-20,12 26,32T70,26V70H-70Z', fill: '#5d9f69' }, g);
      dabs(g, { n: 30, R, filter: null, place: (i, R2) => ({ x: -66 + R2() * 132, y: 16 + R2() * 50, rx: 3.6 + R2() * 3, color: ['#fff6e6', '#ff9d8a', '#ffd166', '#f47a8c'][i % 4], opacity: 0.95 }) });
    } },
    laut: { sky: [[0, '#8fd3f2'], [0.5, '#c7ebf8'], [1, '#c7ebf8']], draw(g, R) {
      el('circle', { cx: 34, cy: -40, r: 14, fill: '#fff6cf' }, g);
      el('path', { d: 'M-70,-2H70V30H-70Z', fill: '#34b3c9' }, g);
      el('path', { d: 'M-70,24Q-20,12 20,24T70,20V70H-70Z', fill: '#fbe2b0' }, g);
      dabs(g, { n: 10, R, filter: null, place: (i, R2) => ({ x: -66 + R2() * 132, y: 22 + R2() * 6, rx: 10 + R2() * 12, ry: 2.4, color: '#ffffff', opacity: 0.85 }) });
    } },
  };
  /** foto mini berbingkai putih, tergantung dari jepitan; (0,0) = pusat atas bingkai */
  function snap(g, R, scene) {
    painted(g, 'M-80,0H80V190H-80Z', {
      base: '#fbf6ea', n: 46, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const x = -80 + R() * 160, y = R() * 190; return { d: `M${x},${y}l${24 + R() * 50},${(R() - 0.5) * 5}`, color: R() < 0.5 ? '#ffffff' : '#ebe2cf', width: 9 + R() * 12, opacity: 0.4 }; },
    });
    const sc = SCENES[scene];
    const inner = el('g', { transform: 'translate(0 80)' }, g);
    const p = painted(inner, 'M-70,-70H70V70H-70Z', {
      base: linGrad(inner, sc.sky, 0, -70, 0, 70), n: 60, R, filter: 'impastoH',
      stroke: () => { const v = R(); const x = -70 + R() * 140, y = -70 + v * 140; return { d: `M${x - 20},${y}q20,${(R() - 0.5) * 6} ${30 + R() * 30},${(R() - 0.5) * 3}`, color: jitter(ramp(sc.sky, v), 6, R), width: 6 + R() * 9, opacity: 0.5 }; },
    });
    sc.draw(p.inner, R);
    el('path', { d: 'M-70,-70H70V70H-70Z', fill: 'none', stroke: WARM, 'stroke-width': 1.6, 'stroke-opacity': 0.2 }, inner);
    el('path', { d: 'M-40,170q8,-9 16,0t16,0t16,0t16,0t14,-2', fill: 'none', stroke: '#4a3528', 'stroke-width': 2.8, 'stroke-opacity': 0.55, 'stroke-linecap': 'round' }, g);
    pin(el('g', { transform: 'translate(0 -30)' }, g), R, 0.46);
  }

  F.sprites['cover-memories'] = { w: 480, h: 600, seed: 528, draw(svg, R) {
    const stops = [[0, '#33244a'], [0.3, '#583650'], [0.6, '#7a4a4e'], [1, '#2f2140']];
    wash(svg, { x: -40, y: -20, w: 560, h: 640, R, n: 300, angle: -3, len: [0.25, 0.6], width: [18, 44], opacity: [0.3, 0.7], base: linGrad(svg, stops, 0, 0, 0, 600), color: (u, v) => ramp(stops, v + (u - 0.5) * 0.08) });
    el('rect', { width: 480, height: 600, fill: radGrad(svg, [[0, '#ffb86e', 0.55], [0.5, '#ff9550', 0.22], [1, '#ff9550', 0]], 240, 250, 380) }, svg);
    // stiker bintang
    [[52, 60, 9, 10], [430, 300, 8, 40], [404, 86, 7, 0], [30, 330, 7, 22], [250, 560, 8, 30], [444, 520, 9, 5]].forEach(([x, y, r, rot]) => el('path', { d: star(x, y, r, rot), fill: '#f6ecc8', opacity: 0.5 }, svg));
    // dua untai tali melengkung
    const swag = (x0, y0, x1, y1, sag) => {
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + sag * 2;
      const d = `M${x0},${y0}Q${cx},${cy} ${x1},${y1}`;
      el('path', { d, fill: 'none', stroke: '#1b1d2e', 'stroke-width': 3, 'stroke-opacity': 0.9 }, svg);
      el('path', { d, fill: 'none', stroke: '#ffd9a0', 'stroke-width': 1, 'stroke-opacity': 0.45, transform: 'translate(0 -1)' }, svg);
      return (t) => [(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1];
    };
    const a = swag(-20, 56, 500, 84, 34), b = swag(-20, 312, 500, 290, 36);
    const bulbs = (f, n) => { for (let i = 0; i < n; i++) { const [x, y] = f((i + 0.5) / n); bulb(el('g', { transform: `translate(${x} ${y + 19})` }, svg), true, 0.56); } };
    bulbs(a, 8);
    bulbs(b, 8);
    // foto tergantung
    const hang = (f, t, rot, scene, k = 1) => { const [x, y] = f(t); snap(el('g', { transform: `translate(${x} ${y + 10}) rotate(${rot}) scale(${k})` }, svg), R, scene); };
    hang(a, 0.27, -4, 'senja', 0.98);
    hang(a, 0.73, 3.5, 'kebun', 0.98);
    hang(b, 0.31, 3, 'laut', 0.98);
    // amplop kecil di untai kedua
    const [ex, ey] = b(0.74);
    const eg = el('g', { transform: `translate(${ex} ${ey + 8}) rotate(-5)` }, svg);
    envelope(el('g', { transform: 'translate(0 62)' }, eg), R, 0.66);
    pin(el('g', { transform: 'translate(0 -14)' }, eg), R, 0.46);
    // tanaman di sudut
    plant(el('g', { transform: 'translate(402 590) scale(0.52)' }, svg), R, (c) => mix(c, '#7a3f2a', 0.12));
    el('rect', { width: 480, height: 600, fill: radGrad(svg, [[0, '#0a0b1c', 0], [0.6, '#0a0b1c', 0], [1, '#0a0b1c', 0.5]], 240, 290, 420) }, svg);
  } };
})();
