/* Our Scrapbook: meja linen dengan alat tempel, sampul kraft berjilid kain, ring kuningan, dan tempelan halaman (perangko, cap pos, tiket, klip, sudut foto, bunga pres). */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, leaf, petal, linGrad } = F;
  const WARM = '#3a1d12';
  const KRAFT = { base: '#c9a676', light: '#e4caa0', dark: '#a17d4e' };
  const CREAM = { base: '#f6ecd6', light: '#fffaec', dark: '#dcc9a4' };
  const CLOTH = { base: '#2f5d5a', light: '#5b8d86', dark: '#1b3d3d' };
  const BRASS = { base: '#c9a24a', light: '#f4e0a0', dark: '#8a6722' };
  const STEEL = { base: '#cfd4d6', light: '#f7f9f9', dark: '#8a9499' };
  const PGREEN = { dark: '#566438', mid: '#7d8c52', light: '#b9c08c' };
  const PRESS = { stops: [[0, '#a8552f'], [0.4, '#d68a5a'], [1, '#efc7a0']], shade: '#8c4728', light: '#f8e2c8' };
  const PRESS2 = { stops: [[0, '#d9cfa8'], [0.4, '#f4eed8'], [1, '#fffaf0']], shade: '#c2b68c', light: '#ffffff' };

  /** Lembar bahan (kertas, karton, kain, logam): sapuan searah `dir` di dalam kotak [x, y, w, h]. */
  function sheet(parent, d, R, { pal = CREAM, tone = 0, dir = [1, 0.08], box, n = 90, cast = 'cast', filter = 'impastoFine', width = [8, 20], len = [40, 130], op = [0.22, 0.4], transform } = {}) {
    const base = mix(pal.base, tone > 0 ? pal.light : pal.dark, Math.abs(tone));
    const m = Math.hypot(dir[0], dir[1]);
    return painted(parent, d, {
      base, n, R, filter, cast, transform,
      stroke: () => {
        const x = box[0] + R() * box[2], y = box[1] + R() * box[3];
        const L = len[0] + R() * (len[1] - len[0]);
        const c = R() < 0.58 ? mix(base, pal.light, R() * 0.6) : mix(base, pal.dark, R() * 0.42);
        return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(c, 4, R), width: width[0] + R() * (width[1] - width[0]), opacity: op[0] + R() * op[1] };
      },
    });
  }

  /** Kain linen: sapuan lebar + anyaman benang tipis mendatar dan tegak + lipatan lembut. */
  function linen(svg, R, W, H) {
    const base = '#d6c8ab';
    wash(svg, { x: -40, y: -40, w: W + 80, h: H + 80, R, n: Math.round((W * H) / 3200), angle: 2, len: [0.25, 0.8], width: [8, 26], opacity: [0.18, 0.42], base, color: (u, v, R2) => mix(base, R2() < 0.52 ? '#ecdfc4' : '#b7a57f', R2() * 0.6) });
    const g = el('g', { filter: 'url(#blur2)', fill: 'none', opacity: 0.8 }, svg);
    for (let x = -10; x < W + 10; x += 5.5 + R() * 3) el('path', { d: `M${x},-10q${(R() - 0.5) * 6},${H / 2} ${(R() - 0.5) * 5},${H + 20}`, stroke: R() < 0.5 ? '#f3e8d0' : '#a89670', 'stroke-width': 1 + R() * 1.6, 'stroke-opacity': 0.16 + R() * 0.26 }, g);
    for (let y = -10; y < H + 10; y += 5.5 + R() * 3) el('path', { d: `M-10,${y}q${W / 2},${(R() - 0.5) * 6} ${W + 20},${(R() - 0.5) * 5}`, stroke: R() < 0.5 ? '#f3e8d0' : '#a89670', 'stroke-width': 1 + R() * 1.6, 'stroke-opacity': 0.16 + R() * 0.26 }, g);
    // lipatan kain: pita terang-gelap panjang yang melebur
    const f = el('g', { filter: 'url(#softer)', fill: 'none', 'stroke-linecap': 'round' }, svg);
    [[0.18, -8], [0.52, 6], [0.83, -5]].forEach(([t, tilt]) => {
      const y = H * t;
      el('path', { d: `M-40,${y}Q${W / 2},${y + tilt * 6} ${W + 40},${y + tilt * 2}`, stroke: '#fff7e2', 'stroke-width': 26, 'stroke-opacity': 0.3 }, f);
      el('path', { d: `M-40,${y + 30}Q${W / 2},${y + 30 + tilt * 6} ${W + 40},${y + 30 + tilt * 2}`, stroke: '#6b5632', 'stroke-width': 22, 'stroke-opacity': 0.15 }, f);
    });
  }

  /** Selotip kertas: ujung bergerigi, motif tipis. (0,0) = pusat. */
  function tape(g, R, { w = 120, h = 34, c = '#e7826a', l = '#f6b29f', d = '#c35f4b', motif = 'garis', cast = 'cast', opacity = 0.92 } = {}) {
    const x0 = -w / 2, y0 = -h / 2, k = h / 6;
    let p = `M${x0},${y0}H${x0 + w}`;
    for (let i = 0; i < 6; i++) p += `l${i % 2 ? 4 : -4},${k}`;
    p += `H${x0}`;
    for (let i = 0; i < 6; i++) p += `l${i % 2 ? -4 : 4},${-k}`;
    p += 'Z';
    const grp = el('g', { opacity }, g);
    const t = painted(grp, p, {
      base: c, n: Math.round(w / 4), R, filter: 'impastoFine', cast,
      stroke: () => { const x = x0 + R() * w * 0.8, y = y0 + R() * h; return { d: `M${x},${y}l${w * (0.15 + R() * 0.3)},${(R() - 0.5) * 3}`, color: jitter(mix(c, R() < 0.5 ? l : d, R() * 0.6), 5, R), width: h * (0.15 + R() * 0.25), opacity: 0.35 + R() * 0.4 }; },
    });
    const m = el('g', { opacity: 0.5 }, t.inner);
    if (motif === 'garis') for (let x = x0 - h; x < x0 + w + h; x += h * 0.42) el('path', { d: `M${x},${y0 + h}l${h * 0.6},${-h}`, stroke: '#fffaf0', 'stroke-width': h * 0.13, fill: 'none' }, m);
    if (motif === 'titik') for (let x = x0 + 8; x < x0 + w; x += h * 0.42) for (let j = 0; j < 2; j++) el('circle', { cx: x + (j ? h * 0.21 : 0), cy: y0 + h * (0.3 + j * 0.4), r: h * 0.08, fill: '#fffaf0' }, m);
    if (motif === 'kotak') { for (let x = x0; x < x0 + w; x += h * 0.33) el('path', { d: `M${x},${y0}v${h}`, stroke: '#fffaf0', 'stroke-width': h * 0.07, fill: 'none' }, m); for (let j = 1; j < 3; j++) el('path', { d: `M${x0},${y0 + (h * j) / 3}h${w}`, stroke: '#fffaf0', 'stroke-width': h * 0.07, fill: 'none' }, m); }
    el('path', { d: `M${x0 + 2},${y0 + 1.5}H${x0 + w - 2}`, stroke: '#fff', 'stroke-width': 1.6, 'stroke-opacity': 0.45, fill: 'none' }, t.inner);
    return grp;
  }
  const TAPES = [
    { c: '#e7826a', l: '#f6b29f', d: '#c35f4b', motif: 'garis' },
    { c: '#e9be52', l: '#f8dc8c', d: '#c79a2c', motif: 'titik' },
    { c: '#8fb89c', l: '#bfdcc4', d: '#648f74', motif: 'kotak' },
    { c: '#e9a2ae', l: '#f8cdd4', d: '#c97886', motif: 'garis' },
  ];

  /** Bunga pres: kenikir pipih bertangkai, warna memudar. (0,0) = pangkal tangkai, tumbuh ke atas. */
  function pressed1(g, R, s = 1) {
    const grp = el('g', { opacity: 0.96 }, g);
    el('path', { d: `M0,0C${-12 * s},${-70 * s} ${16 * s},${-130 * s} ${-4 * s},${-200 * s}`, fill: 'none', stroke: '#667240', 'stroke-width': 3.4 * s, 'stroke-linecap': 'round' }, grp);
    el('path', { d: `M${2 * s},${-96 * s}Q${30 * s},${-120 * s} ${44 * s},${-150 * s}`, fill: 'none', stroke: '#667240', 'stroke-width': 2.2 * s, 'stroke-linecap': 'round' }, grp);
    const lf = (x, y, rot, len, w, curve) => leaf(grp, { len: len * s, w: w * s, ...PGREEN, R, n: 16, transform: `translate(${x * s} ${y * s}) rotate(${rot})`, curve, cast: false, filter: 'impastoFine' });
    lf(-4, -52, -60, 78, 27, 0.25);
    lf(4, -112, 56, 66, 23, -0.2);
    lf(-2, -150, -42, 48, 18, 0.2);
    // kuncup kecil di cabang
    petal(grp, { len: 30 * s, w: 16 * s, round: 0.5, R, n: 8, veins: 1, ...PRESS, transform: `translate(${44 * s} ${-150 * s}) rotate(28)`, cast: false, filter: 'impastoFine' });
    const fl = el('g', { transform: `translate(${-4 * s} ${-206 * s})` }, grp);
    for (let i = 0; i < 8; i++) petal(fl, { len: (50 + R() * 10) * s, w: 30 * s, round: 0.75, notch: 5 * s, R, n: 14, veins: 2, side: 0.3, ...PRESS, transform: `rotate(${i * 45 + R() * 9})`, cast: false, filter: 'impastoFine' });
    el('circle', { r: 10 * s, fill: '#7a5620' }, fl);
    for (let i = 0; i < 9; i++) { const a = R() * 6.28, d = Math.sqrt(R()) * 8 * s; el('circle', { cx: Math.cos(a) * d, cy: Math.sin(a) * d, r: 1.6 * s, fill: R() < 0.5 ? '#d9a441' : '#4f3612' }, fl); }
  }
  /** Bunga pres kedua: ranting berdaun kecil berpasangan dengan bunga putih mungil. */
  function pressed2(g, R, s = 1) {
    const grp = el('g', { opacity: 0.96 }, g);
    el('path', { d: `M0,0C${14 * s},${-60 * s} ${-18 * s},${-130 * s} ${6 * s},${-214 * s}`, fill: 'none', stroke: '#6f7a48', 'stroke-width': 3 * s, 'stroke-linecap': 'round' }, grp);
    for (let i = 0; i < 7; i++) {
      const t = 0.12 + i * 0.125, x = (14 * 3 * t * (1 - t) * (1 - t) - 18 * 3 * t * t * (1 - t) + 6 * t * t * t) * s, y = -214 * t * s;
      const size = 44 - i * 3.5;
      for (const sg of [-1, 1]) leaf(grp, { len: size * s, w: size * 0.36 * s, ...PGREEN, R, n: 9, transform: `translate(${x} ${y}) rotate(${sg * (64 - i * 4)})`, curve: sg * 0.2, cast: false, filter: 'impastoFine', side: sg });
    }
    [[-34, -70], [38, -118], [-30, -160], [8, -226], [30, -190]].forEach(([x, y]) => {
      const b = el('g', { transform: `translate(${x * s} ${y * s})` }, grp);
      for (let i = 0; i < 5; i++) petal(b, { len: 15 * s, w: 12 * s, round: 0.9, R, n: 5, veins: 0, ...PRESS2, transform: `rotate(${i * 72 + R() * 20})`, cast: false, filter: 'impastoFine' });
      el('circle', { r: 3 * s, fill: '#d9a441' }, b);
    });
  }

  /** Gulungan selotip dilihat dari atas: lapisan pita tipis + inti karton. (0,0) = pusat. */
  function roll(g, R, r, t) {
    const ri = r * 0.72, rc = r * 0.6;
    const ring = (a, b) => `M${-a},0a${a},${a} 0 1 0 ${2 * a},0a${a},${a} 0 1 0 ${-2 * a},0ZM${-b},0a${b},${b} 0 1 1 ${2 * b},0a${b},${b} 0 1 1 ${-2 * b},0Z`;
    const arc = (rr) => { const a0 = R() * 6.28, da = 0.5 + R() * 1.4; return `M${Math.cos(a0) * rr},${Math.sin(a0) * rr}A${rr},${rr} 0 0 1 ${Math.cos(a0 + da) * rr},${Math.sin(a0 + da) * rr}`; };
    const grp = el('g', { filter: 'url(#castBig)' }, g);
    painted(grp, ring(r, ri), { base: t.c, n: 46, R, filter: 'impastoFine', stroke: () => ({ d: arc(ri + R() * (r - ri)), color: jitter(mix(t.c, R() < 0.5 ? t.l : t.d, R() * 0.7), 5, R), width: 2 + R() * 3, opacity: 0.5 + R() * 0.4 }) });
    painted(grp, ring(ri, rc), { base: '#d8c39a', n: 22, R, filter: 'impastoFine', stroke: () => ({ d: arc(rc + R() * (ri - rc)), color: mix('#d8c39a', R() < 0.5 ? '#f3e6c6' : '#a88d5c', R() * 0.7), width: 2 + R() * 2.5, opacity: 0.6 }) });
    el('circle', { r: rc, fill: 'none', stroke: WARM, 'stroke-width': 3, 'stroke-opacity': 0.25 }, g);
    el('path', { d: `M${-r * 0.92},${-r * 0.3}A${r * 0.97},${r * 0.97} 0 0 1 ${-r * 0.2},${-r * 0.95}`, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, g);
  }

  /** Gunting: sumbu di (0,0), bilah ke arah +x, gagang ke arah -x. */
  function scissors(g, R) {
    const grp = el('g', { filter: 'url(#castBig)' }, g);
    const blade = (rot, flip) => {
      const b = el('g', { transform: `rotate(${rot}) scale(1 ${flip})` }, grp);
      const d = 'M-16,-10L236,-4Q252,0 236,5L-16,15Z';
      const p = sheet(b, d, R, { pal: STEEL, box: [-16, -10, 240, 26], n: 40, dir: [1, 0.02], cast: 'cast', len: [50, 140], width: [3, 8], op: [0.3, 0.5] });
      el('path', { d: 'M-10,-7L236,-2', fill: 'none', stroke: '#ffffff', 'stroke-width': 2, 'stroke-opacity': 0.8 }, p.inner);
      el('path', { d: 'M-10,12L236,4', fill: 'none', stroke: '#5f6a70', 'stroke-width': 2.4, 'stroke-opacity': 0.5 }, p.inner);
    };
    blade(-8, 1);
    blade(8, -1);
    const handle = (sy) => {
      const h = el('g', { transform: `scale(1 ${sy})`, filter: 'url(#impastoFine)' }, grp);
      el('path', { d: 'M-8,6C-40,10 -58,22 -74,34', fill: 'none', stroke: '#c8553d', 'stroke-width': 20, 'stroke-linecap': 'round' }, h);
      el('ellipse', { cx: -128, cy: 54, rx: 58, ry: 34, fill: 'none', stroke: '#c8553d', 'stroke-width': 20, transform: 'rotate(-16 -128 54)' }, h);
      el('ellipse', { cx: -128, cy: 54, rx: 58, ry: 34, fill: 'none', stroke: '#8f3524', 'stroke-width': 5, 'stroke-opacity': 0.5, transform: 'rotate(-16 -128 54) translate(2 4)' }, h);
      el('path', { d: 'M-180,44A58,34 -16 0 1 -100,22', fill: 'none', stroke: '#f6a58e', 'stroke-width': 5, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, h);
    };
    handle(1);
    handle(-1);
    el('circle', { r: 10, fill: '#8a6722' }, grp);
    el('circle', { r: 8, fill: '#e3c575' }, grp);
    el('path', { d: 'M-5,0H5', stroke: '#8a6722', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, grp);
  }

  /** Gulungan benang goni + benang yang terurai. (0,0) = pusat gulungan. */
  function spool(g, R, r) {
    const grp = el('g', { filter: 'url(#castBig)' }, g);
    const d = `M${-r},0a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0Z`;
    const p = painted(grp, d, {
      base: '#b8915a', n: 90, R, filter: 'impastoFine',
      stroke: () => { const a = R() * 6.28, b = a + 1.6 + R() * 1.6, r1 = r * (0.9 + R() * 0.1), r2 = r * (0.9 + R() * 0.1); return { d: `M${Math.cos(a) * r1},${Math.sin(a) * r1}Q${(R() - 0.5) * r * 0.5},${(R() - 0.5) * r * 0.5} ${Math.cos(b) * r2},${Math.sin(b) * r2}`, color: jitter(mix('#b8915a', R() < 0.5 ? '#e3c594' : '#7f5f30', R() * 0.7), 5, R), width: 3 + R() * 2.5, opacity: 0.75 }; },
    });
    el('circle', { r: r * 0.2, fill: '#4a3118' }, p.inner);
    el('circle', { r: r * 0.2, fill: 'none', stroke: '#e3c594', 'stroke-width': 3, 'stroke-opacity': 0.7 }, p.inner);
    el('path', { d, fill: linGrad(g, [[0, '#fff3d6', 0.3], [0.5, '#fff3d6', 0], [1, WARM, 0.3]], -r, -r, r, r) }, p.inner);
  }
  function thread(svg, d, w = 4.5) {
    el('path', { d, fill: 'none', stroke: WARM, 'stroke-width': w + 3, 'stroke-opacity': 0.2, 'stroke-linecap': 'round', filter: 'url(#blur2)', transform: 'translate(2 5)' }, svg);
    el('path', { d, fill: 'none', stroke: '#b8915a', 'stroke-width': w, 'stroke-linecap': 'round' }, svg);
    el('path', { d, fill: 'none', stroke: '#e9d0a2', 'stroke-width': w * 0.36, 'stroke-linecap': 'round', 'stroke-dasharray': '5 6', 'stroke-opacity': 0.9 }, svg);
  }

  /** Lubang-lubang kertas dari pelubang dan kelopak lepas: remah meja kerja. */
  function crumbs(svg, R, list) {
    const cols = ['#f6ecd6', '#e9a2ae', '#8fb89c', '#e9be52', '#e7826a', '#fffaf0'];
    const g = el('g', { filter: 'url(#cast)' }, svg);
    list.forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 6.5 + R() * 2, fill: jitter(cols[i % cols.length], 6, R) }, g));
  }

  /* ───────────────────────── latar: meja kerajinan ───────────────────────── */
  F.sprites['bg-scrapbook'] = { w: 780, h: 1500, seed: 511, scale: 1, draw(svg, R) {
    linen(svg, R, 780, 1500);
    el('ellipse', { cx: 190, cy: 380, rx: 520, ry: 600, fill: '#fff6dc', opacity: 0.5, filter: 'url(#softer)' }, svg);
    el('rect', { width: 780, height: 1500, fill: linGrad(svg, [[0, '#fff1cf', 0.16], [0.55, '#fff1cf', 0], [1, '#4a3216', 0.24]], 0, 0, 780, 1500) }, svg);
    // kiri-atas: ranting pakis dan bunga kering menyembul dari sudut
    const tl = el('g', { transform: 'translate(-30 -26) rotate(142)' }, svg);
    [[-26, 3, 250, 80], [8, 1, 300, 92], [40, 0, 230, 76]].forEach(([a, gi, len, w]) => leaf(tl, { len, w, ...F.flora.GREEN[gi], R, n: 40, transform: `rotate(${a})`, curve: -0.2, cast: 'castBig' }));
    const fl = el('g', { filter: 'url(#castBig)' }, svg);
    F.flora.flowers.kenikir(el('g', { transform: 'translate(74 92) rotate(18)' }, fl), R, 0.46);
    F.flora.flowers.melati(el('g', { transform: 'translate(176 54) rotate(10)' }, fl), R, 0.56);
    F.flora.flowers.melati(el('g', { transform: 'translate(52 206) rotate(40)' }, fl), R, 0.46);
    // kanan-atas: dua gulungan selotip
    // (di luar area judul: kepala adegan memakai x 115–665, y 105–300)
    // (tombol suara di kanan-atas: gulungan dimulai di bawahnya, mengintip dari balik buku)
    roll(el('g', { transform: 'translate(756 352)' }, svg), R, 60, TAPES[0]);
    roll(el('g', { transform: 'translate(728 482) rotate(40)' }, svg), R, 40, TAPES[2]);
    tape(el('g', { transform: 'translate(760 590) rotate(66)' }, svg), R, { w: 120, h: 28, ...TAPES[0] });
    // kiri-bawah: gunting
    scissors(el('g', { transform: 'translate(150 1418) rotate(-34)' }, svg), R);
    // kanan-bawah: gulungan benang goni dengan benang terurai
    thread(svg, 'M628,1392C540,1330 500,1470 400,1436S300,1350 236,1392');
    spool(el('g', { transform: 'translate(676 1410)' }, svg), R, 62);
    thread(svg, 'M676,1410C700,1340 760,1330 800,1300', 4);
    // remah: bulatan pelubang kertas, sobekan selotip, kelopak
    crumbs(svg, R, [[336, 1318], [372, 1372], [470, 1300], [520, 1356], [568, 1474], [296, 1470], [612, 1290], [86, 1250]]);
    tape(el('g', { transform: 'translate(452 1474) rotate(8)' }, svg), R, { w: 104, h: 28, ...TAPES[1] });
    [[250, 1300, 60, 0.4, 'kambojaPink'], [706, 1262, -30, 0.36, 'kamboja'], [262, 38, 120, 0.3, 'kenikir']].forEach(([x, y, rot, s, pal]) => petal(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...F.flora.PAL[pal], cast: false }));
  } };

  /* ───────────────────────── sampul buku ───────────────────────── */
  /** sampul kraft 364×514 dengan kain jilid di kiri; label kertasnya kosong (teks dari DOM) */
  function coverBoard(svg, R, { label = true, flower = true } = {}) {
    const W = 364, H = 514;
    const board = `M0,0H${W - 10}Q${W},0 ${W},10V${H - 10}Q${W},${H} ${W - 10},${H}H0Z`;
    const p = sheet(svg, board, R, { pal: KRAFT, box: [0, 0, W, H], n: 260, dir: [1, 0.04], cast: false, len: [40, 170], width: [6, 18] });
    dabs(p.inner, { n: 320, R, filter: null, place: (i, R2) => ({ x: 54 + R2() * (W - 54), y: R2() * H, rx: 0.6 + R2() * 1.5, ry: 0.5 + R2() * 0.8, rot: R2() * 180, color: R2() < 0.55 ? '#86633a' : '#f0dcb6', opacity: 0.22 + R2() * 0.4 }) });
    el('path', { d: board, fill: linGrad(svg, [[0, '#fff6dc', 0.3], [0.5, '#fff6dc', 0], [1, WARM, 0.22]], 0, 0, W, H) }, p.inner);
    // bingkai tekan (emboss) di karton
    el('rect', { x: 72, y: 18, width: W - 92, height: H - 36, rx: 6, fill: 'none', stroke: WARM, 'stroke-width': 1.6, 'stroke-opacity': 0.22 }, p.inner);
    el('rect', { x: 73.5, y: 19.5, width: W - 92, height: H - 36, rx: 6, fill: 'none', stroke: '#fff3d6', 'stroke-width': 1.2, 'stroke-opacity': 0.4 }, p.inner);
    // kain jilid
    const spine = `M0,0H56V${H}H0Z`;
    const c = sheet(svg, spine, R, { pal: CLOTH, box: [0, 0, 56, H], n: 150, dir: [0.04, 1], cast: false, len: [30, 100], width: [4, 11], op: [0.25, 0.45] });
    const wv = el('g', { fill: 'none' }, c.inner);
    for (let y = 2; y < H; y += 3.6) el('path', { d: `M0,${y}H56`, stroke: '#9fc3bb', 'stroke-width': 0.9, 'stroke-opacity': 0.2 }, wv);
    for (let x = 2; x < 56; x += 3.6) el('path', { d: `M${x},0V${H}`, stroke: '#12302f', 'stroke-width': 0.9, 'stroke-opacity': 0.22 }, wv);
    el('path', { d: spine, fill: linGrad(svg, [[0, '#0c2424', 0.4], [0.3, '#0c2424', 0], [0.8, '#ffffff', 0.08], [1, '#0c2424', 0.25]], 0, 0, 56, 0) }, c.inner);
    el('rect', { x: 56, y: 0, width: 9, height: H, fill: linGrad(svg, [[0, WARM, 0.3], [1, WARM, 0]], 56, 0, 65, 0) }, p.inner);
    // jahitan benang di tepi kain
    for (let y = 14; y < H - 20; y += 23) {
      el('path', { d: `M47.5,${y + 2}v13`, stroke: WARM, 'stroke-width': 4, 'stroke-opacity': 0.3, 'stroke-linecap': 'round' }, svg);
      el('path', { d: `M46,${y}v13`, stroke: '#f6ead0', 'stroke-width': 2.8, 'stroke-linecap': 'round' }, svg);
    }
    // mata ayam kuningan untuk ring
    [0.22, 0.78].forEach((t) => {
      const y = H * t, e = el('g', { transform: `translate(24 ${y})` }, svg);
      el('circle', { r: 13, fill: WARM, opacity: 0.3, transform: 'translate(1.5 2.5)' }, e);
      el('circle', { r: 12, fill: linGrad(svg, [[0, BRASS.light], [0.5, BRASS.base], [1, BRASS.dark]], -12, -12, 12, 12) }, e);
      el('circle', { r: 7, fill: '#1d120c' }, e);
      el('path', { d: 'M-9.5,-4A10,10 0 0 1 2,-10', fill: 'none', stroke: '#fff8dc', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, e);
    });
    // pelindung sudut kuningan
    [[`M${W - 58},0H${W - 10}Q${W},0 ${W},10V58Z`, [W - 58, 0, 58, 58], W - 15, 15], [`M${W - 58},${H}H${W - 10}Q${W},${H} ${W},${H - 10}V${H - 58}Z`, [W - 58, H - 58, 58, 58], W - 15, H - 15]].forEach(([d, box, cx, cy]) => {
      const k = sheet(svg, d, R, { pal: BRASS, box, n: 22, dir: [1, 1], cast: 'cast', len: [16, 44], width: [3, 8], op: [0.3, 0.5] });
      el('path', { d, fill: 'none', stroke: '#fff8dc', 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, k.inner);
      el('circle', { cx, cy, r: 3.4, fill: BRASS.dark }, svg);
      el('circle', { cx: cx - 0.8, cy: cy - 0.8, r: 1.4, fill: '#fff8dc' }, svg);
    });
    if (label) {
      const lg = el('g', { transform: 'rotate(-1.4 209 224)' }, svg);
      const d = 'M98,150H320V298H98Z';
      const lp = sheet(lg, d, R, { pal: CREAM, box: [98, 150, 222, 148], n: 60, cast: 'cast', len: [40, 120], width: [8, 18] });
      el('rect', { x: 106, y: 158, width: 206, height: 132, fill: 'none', stroke: '#b0553f', 'stroke-width': 1.8, 'stroke-opacity': 0.75 }, lp.inner);
      el('rect', { x: 110.5, y: 162.5, width: 197, height: 123, fill: 'none', stroke: '#b0553f', 'stroke-width': 0.8, 'stroke-opacity': 0.6 }, lp.inner);
      // potongan sudut ala label arsip
      [[106, 158], [312, 158], [106, 290], [312, 290]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 7, fill: mix(CREAM.base, CREAM.light, 0.4), stroke: '#b0553f', 'stroke-width': 1.2, 'stroke-opacity': 0.7 }, lp.inner));
    }
    if (flower) {
      pressed1(el('g', { transform: 'translate(318 486) rotate(-24)' }, svg), R, 0.7);
      tape(el('g', { transform: 'translate(296 440) rotate(-28)' }, svg), R, { w: 92, h: 24, ...TAPES[3] });
    }
    // tepi karton: terang di atas-kiri, teduh di bawah-kanan
    el('path', { d: `M57,1.2H${W - 10}`, fill: 'none', stroke: '#fff3d6', 'stroke-width': 2, 'stroke-opacity': 0.55 }, svg);
    el('path', { d: `M${W - 1.2},10V${H - 10}`, fill: 'none', stroke: WARM, 'stroke-width': 2.4, 'stroke-opacity': 0.25 }, svg);
    el('path', { d: `M2,${H - 1.2}H${W - 10}`, fill: 'none', stroke: WARM, 'stroke-width': 2.4, 'stroke-opacity': 0.3 }, svg);
  }
  F.sprites['scrapbook-sampul'] = { w: 364, h: 514, seed: 512, draw(svg, R) { coverBoard(svg, R); } };

  /** ring kuningan; (0,0) = pusat */
  function ringShape(g, svg, s = 1) {
    const grp = el('g', { filter: 'url(#cast)' }, g);
    el('ellipse', { rx: 36 * s, ry: 16 * s, fill: 'none', stroke: BRASS.dark, 'stroke-width': 9 * s }, grp);
    el('ellipse', { rx: 36 * s, ry: 16 * s, fill: 'none', stroke: linGrad(svg, [[0, BRASS.light], [0.45, BRASS.base], [1, BRASS.dark]], -36 * s, -16 * s, 36 * s, 16 * s), 'stroke-width': 6.5 * s }, grp);
    el('path', { d: `M${-31 * s},${-7 * s}A${36 * s},${16 * s} 0 0 1 ${8 * s},${-15.6 * s}`, fill: 'none', stroke: '#fffbe6', 'stroke-width': 2 * s, 'stroke-linecap': 'round', opacity: 0.95 }, g);
    el('path', { d: `M${30 * s},${9 * s}A${36 * s},${16 * s} 0 0 1 ${-6 * s},${15.8 * s}`, fill: 'none', stroke: '#5f4514', 'stroke-width': 2 * s, 'stroke-linecap': 'round', opacity: 0.5 }, g);
  }
  F.sprites['scrapbook-ring'] = { w: 100, h: 60, seed: 513, draw(svg) { ringShape(el('g', { transform: 'translate(50 28) rotate(-5)' }, svg), svg); } };

  /* ───────────────────────── tempelan halaman ───────────────────────── */
  function perforated(x, y, w, h, r = 4, pitch = 12) {
    const nx = Math.round(w / pitch), ny = Math.round(h / pitch), px = w / nx, py = h / ny, ax = (px - 2 * r) / 2, ay = (py - 2 * r) / 2;
    let d = `M${x},${y}`;
    for (let i = 0; i < nx; i++) d += `h${ax}a${r},${r} 0 0 0 ${2 * r},0h${ax}`;
    for (let i = 0; i < ny; i++) d += `v${ay}a${r},${r} 0 0 0 0,${2 * r}v${ay}`;
    for (let i = 0; i < nx; i++) d += `h${-ax}a${r},${r} 0 0 0 ${-2 * r},0h${-ax}`;
    for (let i = 0; i < ny; i++) d += `v${-ay}a${r},${r} 0 0 0 0,${-2 * r}v${-ay}`;
    return d + 'Z';
  }
  /** perangko 108×132 bergambar kamboja di langit senja; (0,0) = sudut kiri-atas */
  function stamp(g, svg, R) {
    sheet(g, perforated(0, 0, 108, 132), R, { pal: CREAM, tone: 0.3, box: [0, 0, 108, 132], n: 26, cast: 'cast', len: [20, 60], width: [6, 12] });
    const pic = 'M11,11H97V121H11Z';
    const sky = [[0, '#6f5aa0'], [0.4, '#e98b8f'], [0.75, '#ffc98a'], [1, '#ffe2ad']];
    const p = painted(g, pic, { base: linGrad(svg, sky, 0, 11, 0, 121), n: 40, R, filter: 'impastoH', stroke: () => { const v = R(); return { d: `M${6 + R() * 80},${11 + v * 110}q20,${(R() - 0.5) * 5} ${30 + R() * 30},0`, color: jitter(F.ramp(sky, v), 6, R), width: 5 + R() * 7, opacity: 0.5 }; } });
    el('circle', { cx: 72, cy: 44, r: 13, fill: '#fff2c0', opacity: 0.9 }, p.inner);
    leaf(p.inner, { len: 70, w: 26, ...F.flora.GREEN[0], R, n: 12, transform: 'translate(30 124) rotate(-22)', cast: false, filter: 'impastoFine' });
    leaf(p.inner, { len: 60, w: 24, ...F.flora.GREEN[1], R, n: 12, transform: 'translate(78 126) rotate(28)', cast: false, filter: 'impastoFine' });
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(52 88) rotate(-10)' }, p.inner), R, 0.2);
    el('path', { d: pic, fill: 'none', stroke: '#7a4a3a', 'stroke-width': 1.4, 'stroke-opacity': 0.5 }, g);
  }
  F.sprites['scrapbook-perangko'] = { w: 124, h: 148, seed: 514, draw(svg, R) { stamp(el('g', { transform: 'translate(8 6)' }, svg), svg, R); } };

  /** cap pos: dua lingkaran, garis gelombang, tinta memudar; (0,0) = pusat lingkaran */
  function postmark(g) {
    const ink = '#4b3f52';
    const grp = el('g', { fill: 'none', stroke: ink, 'stroke-linecap': 'round', opacity: 0.62, filter: 'url(#wobble)' }, g);
    el('circle', { r: 50, 'stroke-width': 3 }, grp);
    el('circle', { r: 35, 'stroke-width': 2 }, grp);
    for (let i = 0; i < 26; i++) { const a = (i / 26) * 6.283; if (i % 13 > 10) continue; el('path', { d: `M${Math.cos(a) * 39.5},${Math.sin(a) * 39.5}L${Math.cos(a) * 45.5},${Math.sin(a) * 45.5}`, 'stroke-width': 2.2 }, grp); }
    el('path', { d: 'M-22,-7H22M-16,6H16', 'stroke-width': 2.6 }, grp);
    for (let k = 0; k < 4; k++) el('path', { d: `M56,${-30 + k * 20}q11,-9 22,0t22,0t22,0t22,0`, 'stroke-width': 2.6 }, grp);
    // tinta yang tidak rata
    el('circle', { r: 50, 'stroke-width': 5, 'stroke-dasharray': '26 60 12 90', 'stroke-opacity': 0.4 }, grp);
  }
  F.sprites['scrapbook-cap'] = { w: 210, h: 124, seed: 515, draw(svg) { postmark(el('g', { transform: 'translate(62 62) rotate(-8)' }, svg)); } };

  /** potongan tiket 216×100: takik setengah lingkaran, garis sobek, strip; (0,0) = sudut kiri-atas */
  function ticket(g, svg, R, t = TAPES[1]) {
    const d = 'M8,2H208Q214,2 214,8V36a14,14 0 0 0 0,28V92Q214,98 208,98H8Q2,98 2,92V64a14,14 0 0 0 0,-28V8Q2,2 8,2Z';
    const p = sheet(g, d, R, { pal: { base: t.c, light: t.l, dark: t.d }, box: [0, 0, 216, 100], n: 46, cast: 'cast', len: [30, 110], width: [6, 14] });
    el('path', { d: 'M22,11H154V89H22Z', fill: 'none', stroke: '#fffaf0', 'stroke-width': 1.6, 'stroke-opacity': 0.85 }, p.inner);
    el('path', { d: 'M162,6V94', fill: 'none', stroke: '#fffaf0', 'stroke-width': 2.2, 'stroke-dasharray': '2 6', 'stroke-linecap': 'round', 'stroke-opacity': 0.95 }, p.inner);
    for (let i = 0; i < 4; i++) el('path', { d: `M172,${24 + i * 17}h26`, stroke: '#fffaf0', 'stroke-width': 5, 'stroke-opacity': 0.65, 'stroke-linecap': 'round' }, p.inner);
    el('path', { d: 'M6,4H210', fill: 'none', stroke: '#fff', 'stroke-width': 1.6, 'stroke-opacity': 0.5 }, p.inner);
  }
  F.sprites['scrapbook-tiket'] = { w: 228, h: 114, seed: 516, draw(svg, R) { ticket(el('g', { transform: 'translate(6 5)' }, svg), svg, R); } };

  /** klip kertas kawat; (0,0) = sudut kiri-atas kotak 44×118 */
  function clip(g) {
    const d = 'M10,104V30a12,12 0 0 1 24,0V92a8,8 0 0 1 -16,0V42';
    const grp = el('g', { fill: 'none', 'stroke-linecap': 'round', filter: 'url(#cast)' }, g);
    el('path', { d, stroke: '#7d858a', 'stroke-width': 5.4 }, grp);
    el('path', { d, stroke: '#d9dee0', 'stroke-width': 3.4 }, grp);
    el('path', { d, stroke: '#ffffff', 'stroke-width': 1.2, 'stroke-opacity': 0.9, transform: 'translate(-0.8 -0.8)' }, grp);
  }
  F.sprites['scrapbook-klip'] = { w: 56, h: 128, seed: 517, draw(svg) { clip(el('g', { transform: 'translate(6 6)' }, svg)); } };

  /** sudut foto: segitiga kertas gelap dengan garis emas; (0,0) = sudut luar */
  function photoCorner(g, R) {
    const d = 'M0,0H54L0,54Z';
    const p = sheet(g, d, R, { pal: { base: '#3d2f2a', light: '#6a5148', dark: '#221815' }, box: [0, 0, 54, 54], n: 14, dir: [1, -1], cast: 'cast', len: [14, 40], width: [4, 9], op: [0.3, 0.5] });
    el('path', { d: 'M6,6H40L6,40Z', fill: 'none', stroke: '#d9b25c', 'stroke-width': 1.3, 'stroke-opacity': 0.8 }, p.inner);
    el('path', { d: 'M1,1H52', fill: 'none', stroke: '#fff', 'stroke-width': 1.2, 'stroke-opacity': 0.35 }, p.inner);
  }
  F.sprites['scrapbook-sudut'] = { w: 66, h: 66, seed: 518, draw(svg, R) { photoCorner(el('g', { transform: 'translate(4 4)' }, svg), R); } };

  /** sobekan kertas kraft untuk caption; tepi sobek berserat terang */
  F.sprites['scrapbook-sobekan'] = { w: 330, h: 104, seed: 519, draw(svg, R) {
    const w = 330, h = 104, pts = [];
    for (let x = 14; x <= w - 14; x += 13) pts.push([x + (R() - 0.5) * 4, 11 + (R() - 0.5) * 3.2]);
    for (let y = 16; y <= h - 16; y += 7) pts.push([w - 10 - R() * 10, y]);
    for (let x = w - 14; x >= 14; x -= 13) pts.push([x + (R() - 0.5) * 4, h - 11 + (R() - 0.5) * 3.2]);
    for (let y = h - 16; y >= 16; y -= 7) pts.push([10 + R() * 10, y]);
    const d = 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L') + 'Z';
    const rim = el('g', { filter: 'url(#cast)' }, svg);
    el('path', { d, fill: '#f1e3c4', stroke: '#f1e3c4', 'stroke-width': 5, 'stroke-linejoin': 'round', filter: 'url(#wobble)' }, rim);
    const p = sheet(svg, d, R, { pal: KRAFT, tone: 0.25, box: [0, 0, w, h], n: 60, cast: false, len: [40, 140], width: [6, 14] });
    dabs(p.inner, { n: 90, R, filter: null, place: (i, R2) => ({ x: R2() * w, y: R2() * h, rx: 0.6 + R2() * 1.3, ry: 0.5 + R2() * 0.7, rot: R2() * 180, color: R2() < 0.55 ? '#86633a' : '#f0dcb6', opacity: 0.25 + R2() * 0.35 }) });
  } };

  /** kantong amplop kraft yang ditempel di halaman: mulut melengkung, jahitan benang, kancing tali */
  F.sprites['scrapbook-kantong'] = { w: 340, h: 236, seed: 520, draw(svg, R) {
    const d = 'M10,34Q170,104 330,34V214Q330,224 320,224H20Q10,224 10,214Z';
    const p = sheet(svg, d, R, { pal: KRAFT, tone: 0.12, box: [0, 20, 340, 216], n: 150, cast: 'castBig', len: [40, 160], width: [6, 16] });
    dabs(p.inner, { n: 200, R, filter: null, place: (i, R2) => ({ x: R2() * 340, y: 30 + R2() * 200, rx: 0.6 + R2() * 1.4, ry: 0.5 + R2() * 0.8, rot: R2() * 180, color: R2() < 0.55 ? '#86633a' : '#f0dcb6', opacity: 0.22 + R2() * 0.36 }) });
    el('path', { d, fill: linGrad(svg, [[0, '#fff6dc', 0.3], [0.5, '#fff6dc', 0], [1, WARM, 0.2]], 0, 30, 340, 230) }, p.inner);
    // lipatan mulut kantong: tepi terang + bayangan tipis di bawahnya
    el('path', { d: 'M10,34Q170,104 330,34', fill: 'none', stroke: '#fff3d6', 'stroke-width': 3, 'stroke-opacity': 0.8 }, p.inner);
    el('path', { d: 'M10,48Q170,118 330,48', fill: 'none', stroke: WARM, 'stroke-width': 1.6, 'stroke-opacity': 0.2 }, p.inner);
    // jahitan
    el('path', { d: 'M22,60V204Q22,212 30,212H310Q318,212 318,204V60', fill: 'none', stroke: WARM, 'stroke-width': 3.4, 'stroke-opacity': 0.22, 'stroke-dasharray': '10 8', 'stroke-linecap': 'round', transform: 'translate(1 1.6)' }, p.inner);
    el('path', { d: 'M22,60V204Q22,212 30,212H310Q318,212 318,204V60', fill: 'none', stroke: '#f6ead0', 'stroke-width': 2.4, 'stroke-dasharray': '10 8', 'stroke-linecap': 'round' }, p.inner);
    // kancing kertas + tali merah
    const b = el('g', { transform: 'translate(170 112)', filter: 'url(#cast)' }, svg);
    el('circle', { r: 15, fill: '#b0553f' }, b);
    el('circle', { r: 15, fill: linGrad(svg, [[0, '#e58a70', 0.9], [1, '#7f3324', 0.9]], -12, -12, 12, 12) }, b);
    el('circle', { r: 3.2, fill: '#f6ead0' }, b);
    const s = 'M0,0C-26,26 -44,52 -18,70S44,58 30,36S-6,30 4,58';
    el('path', { d: s, fill: 'none', stroke: WARM, 'stroke-width': 4, 'stroke-opacity': 0.2, 'stroke-linecap': 'round', transform: 'translate(171.5 115)' }, svg);
    el('path', { d: s, fill: 'none', stroke: '#b0553f', 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: 'translate(170 112)' }, svg);
  } };

  F.sprites['scrapbook-pres-1'] = { w: 190, h: 300, seed: 521, draw(svg, R) { pressed1(el('g', { transform: 'translate(86 292) rotate(4)' }, svg), R, 1.08); } };
  F.sprites['scrapbook-pres-2'] = { w: 170, h: 280, seed: 522, draw(svg, R) { pressed2(el('g', { transform: 'translate(84 272)' }, svg), R, 1.08); } };

  /* ───────────────────────── kartu katalog ───────────────────────── */
  /** foto mini lukisan w×h; (0,0) = sudut kiri-atas */
  function miniPhoto(g, svg, R, w, h, kind) {
    sheet(g, `M-7,-7H${w + 7}V${h + 7}H-7Z`, R, { pal: CREAM, tone: 0.5, box: [-7, -7, w + 14, h + 14], n: 24, cast: 'cast', len: [30, 90], width: [8, 16] });
    const pic = `M0,0H${w}V${h}H0Z`;
    const sky = kind === 'senja' ? [[0, '#5d4a94'], [0.36, '#e8718c'], [0.62, '#ffb873'], [0.64, '#f29a6e'], [1, '#473a7e']] : kind === 'laut' ? [[0, '#8fd3f2'], [0.5, '#d2eff8'], [0.52, '#34b3c9'], [0.74, '#8fe0e6'], [0.76, '#fbe2b0'], [1, '#f0d09a']] : [[0, '#bfe0f0'], [0.55, '#eaf3df'], [1, '#f6f1d6']];
    const p = painted(g, pic, { base: linGrad(svg, sky, 0, 0, 0, h), n: 60, R, filter: 'impastoH', stroke: () => { const v = R(); return { d: `M${-10 + R() * w},${v * h}q${w * 0.2},${(R() - 0.5) * 6} ${w * (0.25 + R() * 0.3)},0`, color: jitter(F.ramp(sky, v), 6, R), width: 6 + R() * 9, opacity: 0.5 }; } });
    if (kind === 'senja') {
      el('circle', { cx: w / 2, cy: h * 0.56, r: w * 0.3, fill: '#ffe9a6', opacity: 0.45, filter: 'url(#soft)' }, p.inner);
      el('circle', { cx: w / 2, cy: h * 0.56, r: w * 0.16, fill: '#fff2c0' }, p.inner);
      el('rect', { x: 0, y: h * 0.63, width: w, height: h * 0.37, fill: linGrad(svg, [[0, '#e88670', 0.92], [1, '#3f3577', 0.96]], 0, h * 0.63, 0, h) }, p.inner);
      for (let i = 0; i < 5; i++) el('path', { d: `M${w * 0.34 + (R() - 0.5) * 16},${h * 0.69 + i * h * 0.06}h${w * (0.2 + R() * 0.16)}`, stroke: '#ffe9a6', 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-opacity': 0.75, fill: 'none' }, p.inner);
    } else if (kind === 'laut') {
      el('circle', { cx: w * 0.74, cy: h * 0.2, r: w * 0.1, fill: '#fff6cf' }, p.inner);
      dabs(p.inner, { n: 10, R, filter: null, place: (i, R2) => ({ x: R2() * w, y: h * 0.74 + R2() * 5, rx: 12 + R2() * 16, ry: 2.4, color: '#ffffff', opacity: 0.85 }) });
      leaf(p.inner, { len: h * 0.5, w: w * 0.2, ...F.flora.GREEN[0], R, n: 10, transform: `translate(${w * 0.16} ${h * 1.02}) rotate(-18)`, cast: false, filter: 'impastoFine' });
      leaf(p.inner, { len: h * 0.42, w: w * 0.18, ...F.flora.GREEN[2], R, n: 10, transform: `translate(${w * 0.06} ${h * 1.02}) rotate(14)`, cast: false, filter: 'impastoFine' });
    } else {
      el('circle', { cx: w * 0.22, cy: h * 0.2, r: w * 0.1, fill: '#fff6cf' }, p.inner);
      el('path', { d: `M0,${h * 0.56}Q${w * 0.3},${h * 0.36} ${w * 0.6},${h * 0.52}T${w},${h * 0.46}V${h}H0Z`, fill: '#8fc28a' }, p.inner);
      el('path', { d: `M0,${h * 0.72}Q${w * 0.35},${h * 0.54} ${w * 0.7},${h * 0.68}T${w},${h * 0.64}V${h}H0Z`, fill: '#5d9f69' }, p.inner);
      dabs(p.inner, { n: 40, R, filter: null, place: (i, R2) => ({ x: R2() * w, y: h * (0.6 + R2() * 0.4), rx: 3.4 + R2() * 3, color: ['#fff6e6', '#ff9d8a', '#ffd166', '#f47a8c'][i % 4], opacity: 0.95 }) });
    }
    el('path', { d: pic, fill: 'none', stroke: WARM, 'stroke-width': 1.6, 'stroke-opacity': 0.2 }, g);
  }
  /** coretan caption tulisan tangan */
  const scribble = (g, x, y, n = 4, c = '#4a3528') => { let d = `M${x},${y}`; for (let i = 0; i < n; i++) d += 'q8,-9 16,0t16,0'; el('path', { d, fill: 'none', stroke: c, 'stroke-width': 2.6, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, g); };

  F.sprites['cover-scrapbook'] = { w: 480, h: 600, seed: 523, draw(svg, R) {
    linen(svg, R, 480, 600);
    el('ellipse', { cx: 120, cy: 150, rx: 320, ry: 320, fill: '#fff6dc', opacity: 0.5, filter: 'url(#softer)' }, svg);
    el('rect', { width: 480, height: 600, fill: linGrad(svg, [[0, '#fff1cf', 0.14], [0.55, '#fff1cf', 0], [1, '#4a3216', 0.26]], 0, 0, 480, 600) }, svg);
    // alat di tepi
    roll(el('g', { transform: 'translate(430 66)' }, svg), R, 50, TAPES[0]);
    roll(el('g', { transform: 'translate(362 34) rotate(30)' }, svg), R, 32, TAPES[2]);
    scissors(el('g', { transform: 'translate(70 566) rotate(-28) scale(0.62)' }, svg), R);
    thread(svg, 'M470,560C410,520 380,600 320,572S270,540 236,566', 3.6);
    spool(el('g', { transform: 'translate(452 566)' }, svg), R, 40);
    // buku terbuka, sedikit miring: sampul kraft menyembul di sekeliling dua halaman
    const book = el('g', { transform: 'translate(240 300) rotate(-5)' }, svg);
    sheet(book, 'M-214,-166H214Q220,-166 220,-160V160Q220,166 214,166H-214Q-220,166 -220,160V-160Q-220,-166 -214,-166Z', R, { pal: KRAFT, tone: -0.2, box: [-220, -166, 440, 332], n: 90, cast: 'castBig', len: [60, 200], width: [8, 18] });
    sheet(book, 'M-14,-166H14V166H-14Z', R, { pal: CLOTH, box: [-14, -166, 28, 332], n: 30, dir: [0.04, 1], cast: false, len: [30, 90], width: [4, 9] });
    // tumpukan halaman di bawah halaman teratas
    [[-208, 6], [8, 200]].forEach(([x0], side) => {
      for (let k = 2; k >= 1; k--) sheet(book, `M${x0 + (side ? k * 2.5 : -k * 2.5)},${-154 + k * 2.5}h200v308h-200Z`, R, { pal: CREAM, tone: -0.3, box: [x0, -154, 206, 314], n: 8, cast: false });
    });
    const pageL = sheet(book, 'M-208,-156H-8V152H-208Z', R, { pal: CREAM, tone: 0.2, box: [-208, -156, 200, 308], n: 70, cast: 'cast', len: [40, 130], width: [8, 18] });
    const pageR = sheet(book, 'M8,-156H208V152H8Z', R, { pal: { base: '#f3e4d4', light: '#fff6ea', dark: '#dcc3ac' }, tone: 0.2, box: [8, -156, 200, 308], n: 70, cast: 'cast', len: [40, 130], width: [8, 18] });
    // teduh di lipatan tengah
    el('rect', { x: -40, y: -156, width: 32, height: 308, fill: linGrad(svg, [[0, WARM, 0], [1, WARM, 0.2]], -40, 0, -8, 0) }, pageL.inner);
    el('rect', { x: 8, y: -156, width: 36, height: 308, fill: linGrad(svg, [[0, WARM, 0.24], [1, WARM, 0]], 8, 0, 44, 0) }, pageR.inner);
    // halaman kiri: foto senja berselotip, caption, bunga pres
    miniPhoto(el('g', { transform: 'translate(-186 -128) rotate(-4)' }, book), svg, R, 138, 156, 'senja');
    tape(el('g', { transform: 'translate(-176 -126) rotate(-40)' }, book), R, { w: 62, h: 18, ...TAPES[1] });
    tape(el('g', { transform: 'translate(-44 -134) rotate(34)' }, book), R, { w: 62, h: 18, ...TAPES[3] });
    scribble(book, -170, 78, 4);
    scribble(book, -156, 100, 3);
    pressed2(el('g', { transform: 'translate(-40 150) rotate(-14)' }, book), R, 0.52);
    // halaman kanan: foto taman dengan sudut foto, perangko + cap pos, tiket, caption
    const ph = el('g', { transform: 'translate(40 -52) rotate(3)' }, book);
    miniPhoto(ph, svg, R, 136, 120, 'taman');
    [[-10, -10, 0], [146, -10, 90], [146, 130, 180], [-10, 130, 270]].forEach(([x, y, r]) => photoCorner(el('g', { transform: `translate(${x} ${y}) rotate(${r}) scale(0.5)` }, ph), R));
    stamp(el('g', { transform: 'translate(132 -140) rotate(8) scale(0.52)' }, book), svg, R);
    postmark(el('g', { transform: 'translate(118 -92) rotate(-12) scale(0.42)' }, book));
    ticket(el('g', { transform: 'translate(26 96) rotate(-7) scale(0.5)' }, book), svg, R, TAPES[0]);
    scribble(book, 138, 100, 2);
    scribble(book, 132, 120, 2);
    // hati kecil coretan pena
    el('path', { d: 'M176,74c-8,-12 -24,-2 -12,10l12,10l12,-10c12,-12 -4,-22 -12,-10Z', fill: 'none', stroke: '#c8553d', 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-opacity': 0.8, transform: 'rotate(8 176 80)' }, book);
    // ring kuningan di tengah
    [-96, 96].forEach((y) => ringShape(el('g', { transform: `translate(0 ${y}) scale(0.62)` }, book), svg));
    // bunga segar dan kelopak di sudut kiri-atas
    const fl = el('g', { filter: 'url(#castBig)' }, svg);
    leaf(fl, { len: 150, w: 54, ...F.flora.GREEN[1], R, n: 26, transform: 'translate(-10 -6) rotate(128)', curve: -0.2 });
    leaf(fl, { len: 130, w: 48, ...F.flora.GREEN[3], R, n: 24, transform: 'translate(-8 -10) rotate(160)', curve: 0.2 });
    F.flora.flowers.kenikir(el('g', { transform: 'translate(52 50) rotate(18)' }, fl), R, 0.32);
    F.flora.flowers.melati(el('g', { transform: 'translate(124 30) rotate(10)' }, fl), R, 0.4);
    crumbs(svg, R, [[214, 548], [176, 574], [300, 40], [262, 22]]);
    [[150, 556, 50, 0.3, 'kambojaPink'], [404, 150, -30, 0.26, 'kamboja']].forEach(([x, y, rot, s, pal]) => petal(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...F.flora.PAL[pal], cast: false }));
  } };
})();
