/* Terbangkan Lampion: danau malam dengan dermaga kayu, lampion kertas, bulan sabit, dan kartu katalog. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp } = F;
  const { W, H } = F.latar; // 780 × 1500
  const HORIZON = 1058;

  const GLOW = [[0, '#fffbe0'], [0.2, '#ffe9a0'], [0.42, '#ffc15c'], [0.68, '#f58a36'], [1, '#c24d1c']];

  /**
   * Lampion kertas menghadap atas, digambar di kotak 240×320.
   * Kertasnya dilukis dengan sapuan tegak mengikuti rusuk; makin dekat api makin terang.
   */
  /** kertas lampion yang belum menyala, kena cahaya bulan: pucat, sejuk, tanpa api */
  const DIM = [[0, '#efe2cc'], [0.35, '#d8c4b0'], [0.7, '#a7929a'], [1, '#6c5f7a']];
  function lantern(g, R, { n = 150, detail = true, unlit = false } = {}) {
    const body = 'M30,98C30,38 76,12 120,12C164,12 210,38 210,98C210,166 184,230 168,268L72,268C56,230 30,166 30,98Z';
    const hw = (v) => (v < 0.34 ? 90 * Math.pow(Math.sin((v / 0.34) * Math.PI * 0.5), 0.6) : 90 - ((v - 0.34) / 0.66) * 42);
    const p = painted(g, body, {
      base: unlit ? F.radGrad(g, [[0, '#e9d8c0'], [0.5, '#bba5a4'], [1, '#776a86']], 70, 40, 300) : F.radGrad(g, [[0, '#ffe9a0'], [0.45, '#ffb24f'], [1, '#d5611f']], 120, 250, 250), n, R, filter: 'impastoFine', cast: detail ? 'cast' : false,
      stroke: () => {
        const u = -1 + 2 * R(), v = R() * 0.9;
        const v2 = Math.min(1, v + 0.1 + R() * 0.22);
        const y1 = 12 + v * 256, y2 = 12 + v2 * 256;
        const x1 = 120 + u * hw(v) * 0.96, x2 = 120 + u * hw(v2) * 0.96;
        const xm = 120 + u * hw((v + v2) / 2) * 1.02;
        const dist = Math.hypot(xm - 120, (y1 + y2) / 2 - 252) / 250;
        let c;
        if (unlit) {
          // cahaya bulan dari kiri-atas: kiri pucat, kanan-bawah ungu teduh
          c = ramp(DIM, Math.min(1, Math.max(0, (u + 1) * 0.38 + v * 0.36 + (R() - 0.5) * 0.12)));
          if (u < -0.35 && R() < 0.45) c = mix(c, '#fbf3e2', 0.35);
        } else {
          c = ramp(GLOW, dist + (R() - 0.5) * 0.12);
          if (u > 0.25) c = mix(c, '#a83f1c', (u - 0.25) * 0.5); // sisi teduh
          if (u < -0.3 && R() < 0.5) c = mix(c, '#fff3c4', 0.35); // sisi terang
        }
        return { d: `M${x1},${y1}Q${xm},${(y1 + y2) / 2} ${x2},${y2}`, color: jitter(c, 6, R), width: 7 + R() * 13, opacity: 0.4 + R() * 0.45 };
      },
    });
    // cahaya api yang menembus kertas
    if (!unlit) el('ellipse', { cx: 120, cy: 238, rx: 62, ry: 52, fill: '#fffbe0', opacity: 0.6, filter: 'url(#soft)' }, p.inner);
    if (detail) {
      // rusuk bambu + lipatan kertas
      for (const u of [-0.72, -0.4, -0.08, 0.26, 0.58, 0.86]) {
        let d = '';
        for (let k = 0; k <= 10; k++) { const v = k / 10; d += `${k ? 'L' : 'M'}${120 + u * hw(v)},${12 + v * 256}`; }
        el('path', { d, fill: 'none', stroke: unlit ? '#5c4e63' : '#9c3f16', 'stroke-width': 1.7, 'stroke-opacity': 0.42, 'stroke-linecap': 'round' }, p.inner);
        el('path', { d, fill: 'none', stroke: '#fff3c4', 'stroke-width': 1.1, 'stroke-opacity': 0.3, transform: 'translate(-2.2 0)' }, p.inner);
      }
      for (const [y, o] of [[92, 0.22], [156, 0.18], [214, 0.16]]) {
        el('path', { d: `M24,${y}Q120,${y + 16} 216,${y}`, fill: 'none', stroke: unlit ? '#4f4458' : '#8f3a14', 'stroke-width': 1.4, 'stroke-opacity': o }, p.inner);
      }
      // puncak yang lebih gelap dan kilap di bahu kiri
      el('ellipse', { cx: 126, cy: 16, rx: 54, ry: 16, fill: unlit ? '#4a3f58' : '#8f3312', opacity: 0.4, filter: 'url(#blur2)' }, p.inner);
      el('path', { d: 'M46,92C52,58 76,36 104,29', fill: 'none', stroke: '#fff6d4', 'stroke-width': 14, 'stroke-linecap': 'round', 'stroke-opacity': 0.26, filter: 'url(#soft)' }, p.inner);
    }
    // gelang bambu di mulut lampion
    const ring = painted(g, 'M66,262h108a7,7 0 0 1 7,7v4a7,7 0 0 1 -7,7h-108a7,7 0 0 1 -7,-7v-4a7,7 0 0 1 7,-7Z', {
      base: '#7a3d17', n: detail ? 16 : 6, R, filter: 'impastoFine', cast: detail ? 'cast' : false,
      stroke: () => { const x = 60 + R() * 110; return { d: `M${x},${264 + R() * 12}h${10 + R() * 26}`, color: R() < 0.45 ? '#c98342' : '#4f2409', width: 3 + R() * 4, opacity: 0.7 }; },
    });
    if (detail && unlit) {
      // kawat penyangga + sumbu yang belum dinyalakan
      el('path', { d: 'M78,280L112,300M162,280L128,300M112,300h16', fill: 'none', stroke: '#3a2a24', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M120,300v-10', stroke: '#2a1d18', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: 120, cy: 289, r: 3.2, fill: '#1a120f' }, g);
    }
    if (detail && !unlit) {
      // kawat penyangga + sumbu yang menyala
      el('path', { d: 'M78,280L112,300M162,280L128,300M112,300h16', fill: 'none', stroke: '#4f2409', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: 120, cy: 290, r: 26, fill: '#ffd98a', opacity: 0.55, filter: 'url(#soft)' }, g);
      const fl = el('g', { filter: 'url(#blur2)' }, g);
      el('path', { d: 'M120,304C132,292 131,278 120,262C109,278 108,292 120,304Z', fill: '#ffb53d' }, fl);
      el('path', { d: 'M120,302C126,294 126,285 120,275C114,285 114,294 120,302Z', fill: '#fffbe0' }, g);
    }
    return { p, ring };
  }

  /** Bukit berlapis: sapuan mengikuti punggung bukit, sisi kanan lebih gelap. */
  function hill(svg, R, d, { dark, mid, light, y0, y1, n = 120 }) {
    painted(svg, d, {
      base: mid, n, R, filter: 'impastoH',
      stroke: () => {
        const x = -40 + R() * (W + 80), y = y0 + Math.pow(R(), 0.7) * (y1 - y0);
        const L = 50 + R() * 130;
        const tilt = Math.sin(x / 90) * 14;
        const c = R() < 0.3 ? mix(mid, light, 0.3 + R() * 0.5) : mix(mid, dark, R() * 0.8);
        return { d: `M${x},${y}q${L / 2},${tilt - 8} ${L},${tilt}`, color: jitter(c, 5, R), width: 9 + R() * 20, opacity: 0.4 + R() * 0.45 };
      },
    });
  }

  /** Dermaga kayu dilihat dari atas-belakang: papan melintang yang mengecil ke kejauhan. */
  function pier(svg, R, { x0 = 244, x1 = 536, yNear = 1510, xf0 = 336, xf1 = 444, yFar = 1214 } = {}) {
    const lerp = (a, b, t) => a + (b - a) * t;
    // bayangan dermaga di air
    el('path', { d: `M${xf0 - 10},${yFar + 14}L${xf1 + 22},${yFar + 14}L${x1 + 46},${yNear}L${x0 - 16},${yNear}Z`, fill: '#070b22', opacity: 0.5, filter: 'url(#soft)' }, svg);
    const planks = 11;
    for (let i = planks - 1; i >= 0; i--) {
      // papan dekat lebih tebal (perspektif)
      const t0 = Math.pow(i / planks, 1.5), t1 = Math.pow((i + 1) / planks, 1.5);
      const ya = lerp(yFar, yNear, t0), yb = lerp(yFar, yNear, t1) - 2.5;
      const xa0 = lerp(xf0, x0, t0) - R() * 4, xa1 = lerp(xf1, x1, t0) + R() * 4;
      const xb0 = lerp(xf0, x0, t1) - R() * 4, xb1 = lerp(xf1, x1, t1) + R() * 4;
      const lit = 1 - t0; // ujung jauh kena cahaya lampion
      const base = mix('#3a2a2c', '#9a6238', lit * 0.75);
      painted(svg, `M${xa0},${ya}L${xa1},${ya}L${xb1},${yb}L${xb0},${yb}Z`, {
        base, n: 16 + Math.round(t1 * 20), R, filter: 'impastoH', cast: false,
        stroke: () => {
          const y = ya + R() * (yb - ya), x = xb0 + R() * (xb1 - xb0);
          const L = 30 + R() * 110;
          const c = R() < 0.35 ? mix(base, '#f0b06a', 0.25 + lit * 0.5) : mix(base, '#1c1420', 0.2 + R() * 0.5);
          return { d: `M${x - L / 2},${y}h${L}`, color: jitter(c, 5, R), width: 3 + R() * (5 + t1 * 8), opacity: 0.45 + R() * 0.4 };
        },
      });
      el('path', { d: `M${xa0},${ya}L${xa1},${ya}`, stroke: '#ffd08a', 'stroke-width': 1.3, 'stroke-opacity': 0.12 + lit * 0.4 }, svg);
    }
    // tiang pancang
    for (const [x, y, w, h] of [[xf0 - 4, yFar - 30, 16, 74], [xf1 - 12, yFar - 30, 16, 74], [lerp(xf0, x0, 0.42) - 12, lerp(yFar, yNear, 0.42) - 50, 22, 120], [lerp(xf1, x1, 0.42) - 10, lerp(yFar, yNear, 0.42) - 50, 22, 120]]) {
      painted(svg, `M${x},${y + 4}q${w / 2},-8 ${w},0v${h}h${-w}Z`, {
        base: '#4a3230', n: 14, R, filter: 'impastoFine', cast: 'cast',
        stroke: () => { const xx = x + R() * w; return { d: `M${xx},${y + R() * h}v${12 + R() * 40}`, color: xx < x + w * 0.4 ? '#c98a52' : '#22161c', width: 3 + R() * 4, opacity: 0.6 }; },
      });
    }
  }

  /** Seluruh pemandangan malam. `withPier` dimatikan untuk kartu katalog. */
  function night(svg, R, { withPier = true } = {}) {
    const stops = [[0, '#080d2b'], [0.24, '#131c4b'], [0.46, '#262766'], [0.6, '#46367a'], [0.68, '#75477c'], [0.72, '#a2607a']];
    F.latar.sky(svg, R, stops, { n: 600 });
    F.latar.clouds(svg, R, '#4c4186', [[220, 380, 480, 60, 0.4], [600, 640, 400, 54, 0.34]]);
    F.latar.clouds(svg, R, '#c57f8e', [[420, 960, 620, 46, 0.34]]);
    F.latar.clouds(svg, R, '#ffb98a', [[390, 1030, 520, 30, 0.3]]);
    // bintang: totol kecil, beberapa berpendar
    dabs(svg, { n: 190, R, filter: null, place: (i, R2) => { const big = R2() < 0.1; return { x: R2() * W, y: Math.pow(R2(), 1.3) * 900, rx: big ? 2.7 : 0.8 + R2() * 1.4, color: R2() < 0.3 ? '#ffe7b0' : '#ffffff', opacity: 0.35 + R2() * 0.6 }; } });
    dabs(svg, { n: 7, R, filter: 'blur2', place: (i, R2) => ({ x: R2() * W, y: R2() * 700, rx: 4.2, color: '#fff3d0', opacity: 0.55 }) });

    hill(svg, R, `M-20,${HORIZON}L-20,986C40,950 98,930 168,958C228,912 318,900 388,950C458,912 548,920 610,962C676,934 742,942 800,966L800,${HORIZON}Z`, { dark: '#1f2358', mid: '#34327a', light: '#6a5aa6', y0: 900, y1: HORIZON, n: 130 });
    hill(svg, R, `M-20,${HORIZON + 6}L-20,1024C50,994 122,988 190,1016C262,990 340,996 404,1024C478,1000 566,1004 632,1028C700,1008 760,1012 800,1024L800,${HORIZON + 6}Z`, { dark: '#0c1030', mid: '#181c4a', light: '#3b3a7c', y0: 990, y1: HORIZON + 6, n: 110 });
    // pepohonan kecil di punggung bukit
    dabs(svg, { n: 46, R, filter: 'impastoFine', place: (i, R2) => { const x = R2() * W; return { x, y: 1010 + Math.sin(x / 70) * 10 + R2() * 16, rx: 5 + R2() * 7, ry: 9 + R2() * 12, color: jitter('#0e1234', 5, R2), opacity: 0.95 }; } });

    // danau: sapuan mendatar, memantulkan langit di dekat cakrawala
    const water = [[0, '#6a4a82'], [0.08, '#3c3276'], [0.3, '#232663'], [0.65, '#131a47'], [1, '#090e2c']];
    wash(svg, { x: -40, y: HORIZON, w: W + 80, h: H - HORIZON + 20, R, n: 430, angle: 0, len: [0.1, 0.34], width: [6, 20], opacity: [0.35, 0.8], base: '#1a1f55', filter: 'canvas',
      color: (u, v) => ramp(water, v + (Math.abs(u - 0.5) * 0.1)), clip: `M-40,${HORIZON}H${W + 40}V${H + 20}H-40Z` });
    // garis cakrawala yang berkilau
    el('path', { d: `M-20,${HORIZON + 4}H${W + 20}`, stroke: '#ffc7a0', 'stroke-width': 3, 'stroke-opacity': 0.35, filter: 'url(#blur2)' }, svg);
    // pantulan cahaya lampion: sapuan hangat putus-putus yang melebar ke bawah
    const refl = el('g', { filter: 'url(#blur2)' }, svg);
    for (let i = 0; i < 70; i++) {
      const v = Math.pow(R(), 0.8);
      const y = HORIZON + 26 + v * 400;
      const spread = 30 + v * 150;
      const x = 390 + (R() - 0.5) * 2 * spread;
      const L = 18 + R() * (40 + v * 60);
      el('path', { d: `M${x - L / 2},${y}h${L}`, stroke: ramp([[0, '#fff0b8'], [0.5, '#ffb45a'], [1, '#e87a3a']], Math.abs(x - 390) / spread), 'stroke-width': 2.5 + R() * 5, 'stroke-linecap': 'round', 'stroke-opacity': (0.75 - v * 0.45) * (0.5 + R() * 0.5), fill: 'none' }, refl);
    }
    // pantulan bintang/lampu jauh
    dabs(svg, { n: 40, R, filter: null, place: (i, R2) => ({ x: R2() * W, y: HORIZON + 30 + R2() * 380, rx: 6 + R2() * 14, ry: 1.1, color: '#cfd0ff', opacity: 0.12 + R2() * 0.16 }) });

    if (withPier) pier(svg, R);

    // ilalang di tepi bawah, siluet gelap dengan sedikit pantulan hangat
    const reeds = (cx, dir) => {
      const g = el('g', { filter: 'url(#impastoFine)' }, svg);
      for (let i = 0; i < 26; i++) {
        const x = cx + dir * R() * 150, h = 110 + R() * 230, lean = (R() - 0.35) * 70 * dir;
        el('path', { d: `M${x},${H + 10}Q${x + lean * 0.3},${H - h * 0.6} ${x + lean},${H - h}`, fill: 'none', stroke: jitter(R() < 0.25 ? '#3d4a5e' : '#0a0f26', 5, R), 'stroke-width': 3 + R() * 6, 'stroke-linecap': 'round' }, g);
      }
    };
    reeds(-10, 1); reeds(W + 10, -1);
  }

  F.sprites['bg-lampion'] = { w: W, h: H, seed: 451, scale: 1, draw(svg, R) { night(svg, R); } };

  F.sprites['lampion'] = { w: 240, h: 320, seed: 452, draw(svg, R) { lantern(svg, R); } };

  // lampion yang sama sebelum dinyalakan (seed sama → bentuk & sapuan cocok saat di-crossfade)
  F.sprites['lampion-padam'] = { w: 240, h: 320, seed: 452, draw(svg, R) { lantern(svg, R, { unlit: true }); } };

  // lampion kecil untuk kerumunan di akhir: lebih sedikit sapuan, tanpa detail halus
  F.sprites['lampion-kecil'] = { w: 72, h: 96, seed: 453, draw(svg, R) { lantern(el('g', { transform: 'scale(0.3)' }, svg), R, { n: 40, detail: false }); } };

  // bulan sabit dengan pendar
  F.sprites['lampion-bulan'] = { w: 170, h: 170, seed: 454, draw(svg, R) {
    el('circle', { cx: 85, cy: 85, r: 62, fill: '#ffe9b8', opacity: 0.22, filter: 'url(#softer)' }, svg);
    el('circle', { cx: 85, cy: 85, r: 46, fill: '#fff3d6', opacity: 0.2, filter: 'url(#soft)' }, svg);
    painted(svg, 'M92,36A50,50 0 1 0 134,104A40,40 0 1 1 92,36Z', {
      base: '#fdf1d2', n: 34, R, filter: 'impastoFine', cast: false,
      stroke: () => { const a = 1.6 + R() * 3.2, r = 30 + R() * 18; const x = 85 + Math.cos(a) * r, y = 85 + Math.sin(a) * r; return { d: `M${x},${y}q${(R() - 0.5) * 14},${10 + R() * 12} ${(R() - 0.5) * 8},${22 + R() * 14}`, color: R() < 0.5 ? '#ffffff' : '#ecd9a8', width: 4 + R() * 6, opacity: 0.5 }; },
    });
  } };

  // kartu katalog: lampion-lampion yang sudah terbang di atas danau
  F.sprites['cover-lampion'] = { w: 480, h: 600, seed: 455, draw(svg, R) {
    night(el('g', { transform: 'translate(0 -196) scale(0.6154)' }, svg), R, { withPier: false });
    // bulan
    el('circle', { cx: 78, cy: 70, r: 60, fill: '#ffe9b8', opacity: 0.2, filter: 'url(#softer)' }, svg);
    painted(svg, 'M84,36A36,36 0 1 0 114,86A29,29 0 1 1 84,36Z', { base: '#fdf1d2', n: 16, R, filter: 'impastoFine', cast: false, stroke: () => ({ d: `M${50 + R() * 50},${40 + R() * 60}q4,8 0,18`, color: R() < 0.5 ? '#ffffff' : '#ecd9a8', width: 4 + R() * 4, opacity: 0.5 }) });
    // [x, y, skala] lampion; yang jauh lebih kecil dan lebih redup
    const L = [[396, 96, 0.2], [70, 214, 0.17], [330, 232, 0.26], [112, 118, 0.3], [418, 330, 0.22], [226, 62, 0.15], [52, 340, 0.13], [240, 226, 0.92]];
    for (const [x, y, k] of L) {
      el('circle', { cx: x, cy: y + 30 * k, r: 210 * k, fill: F.radGrad(svg, [[0, '#ffc66e', 0.62], [0.5, '#ff9a48', 0.2], [1, '#ff9a48', 0]], x, y + 30 * k, 210 * k) }, svg);
      lantern(el('g', { transform: `translate(${x - 120 * k} ${y - 150 * k}) rotate(${(R() - 0.5) * 8} ${120 * k} ${150 * k}) scale(${k})` }, svg), R, { n: k > 0.5 ? 150 : 46, detail: k > 0.24 });
    }
  } };
})();
