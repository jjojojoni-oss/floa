/* Tiup Lilin (babak potong kue): potongan pertama di piring kecil, pisau kue bergagang kayu,
   dan colekan krim yang "nempel" di kaca layar. Warna sama dengan kue di 41-lilin.js. */
(() => {
  const F = window.FLOA;
  const { el, painted, dabs, mix, jitter, linGrad } = F;

  const CREAM = { base: '#fff0d6', light: '#fffdf6', dark: '#e9cba3', deep: '#c9a077' };
  const PINK = { light: '#ffc9d2', mid: '#f08aa4', dark: '#b9486f' };
  const PANDAN = { light: '#dcebae', mid: '#a5cf86', dark: '#5c9960' };
  const POR = { base: '#f6ebd9', light: '#fffdf7', dark: '#cdb597' };
  const SHADOW = '#3a1d12';

  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const pt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

  /** bidang dengan sapuan searah (dir) di dalam kotak pembatasnya */
  function sheet(svg, d, R, { base, cols, box, n = 40, dir = [1, 0], len = [14, 40], width = [5, 11], op = [0.35, 0.7], filter = 'impastoH', cast } = {}) {
    return painted(svg, d, {
      base, n, R, filter, cast,
      stroke: () => {
        const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]);
        const m = Math.hypot(dir[0], dir[1]) || 1;
        return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(cols[Math.floor(R() * cols.length)], 6, R), width: width[0] + R() * (width[1] - width[0]), opacity: op[0] + R() * (op[1] - op[0]) };
      },
    });
  }

  /* ───────── potongan kue di piring (340×260) ───────── */
  function slice(svg, R) {
    // bayangan & piring porselen
    el('ellipse', { cx: 172, cy: 226, rx: 142, ry: 22, fill: SHADOW, opacity: 0.3, filter: 'url(#soft)' }, svg);
    const plate = (cx, cy, rx, ry, n, cast) => sheet(svg, `M${cx - rx},${cy}a${rx},${ry} 0 1 0 ${rx * 2},0a${rx},${ry} 0 1 0 ${-rx * 2},0Z`, R, {
      base: linGrad(svg, [[0, POR.base], [0.3, POR.light], [1, POR.dark]], cx - rx, 0, cx + rx, 0), cols: [POR.light, POR.base, POR.dark], box: [cx - rx, cy - ry, rx * 2, ry * 2], n, len: [30, 80], width: [5, 10], cast,
    });
    plate(170, 214, 150, 30, 30, 'cast');
    plate(170, 208, 150, 30, 40, false);
    el('ellipse', { cx: 170, cy: 208, rx: 118, ry: 21, fill: 'none', stroke: POR.dark, 'stroke-width': 1.6, opacity: 0.55 }, svg);
    // pinggir piring bermotif kawung kecil
    const kw = el('g', { fill: 'none', stroke: '#8fb89c', 'stroke-width': 1.3, opacity: 0.7 }, svg);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, x = 170 + Math.cos(a) * 134, y = 208 + Math.sin(a) * 26.5;
      for (const r of [45, 135, 225, 315]) el('ellipse', { cx: x, cy: y, rx: 3.2, ry: 1.5, transform: `rotate(${r} ${x} ${y}) translate(3.6 0)` }, kw);
    }

    // geometri potongan: ujung runcing di kiri-belakang, sisi potong menghadap kita
    const P = [58, 128], Fr = [256, 150], B = [244, 98];
    const H = 74;
    const P2 = [P[0], P[1] + H], F2 = [Fr[0], Fr[1] + H], B2 = [B[0], B[1] + H];

    // sisi luar (kulit kue berkrim), terlihat di kanan
    const side = `M${pt(Fr)}Q${pt([276, 122])} ${pt(B)}L${pt(B2)}Q${pt([276, 196])} ${pt(F2)}Z`;
    sheet(svg, side, R, { base: linGrad(svg, [[0, CREAM.base], [1, CREAM.dark]], 244, 0, 278, 0), cols: [CREAM.base, CREAM.dark, CREAM.light], box: [240, 96, 40, 130], n: 30, dir: [0, 1], len: [10, 30], cast: 'cast' });

    // sisi potong: lapis-lapis bolu pandan, krim, bolu merah muda
    const bands = [
      [0, 0.13, CREAM, 'cream'],
      [0.13, 0.44, PANDAN, 'sponge'],
      [0.44, 0.55, CREAM, 'cream'],
      [0.55, 0.9, PINK, 'sponge'],
      [0.9, 1, CREAM, 'cream'],
    ];
    bands.forEach(([t0, t1, pal, kind]) => {
      const a = lerp(P, P2, t0), b = lerp(Fr, F2, t0), c = lerp(Fr, F2, t1), d = lerp(P, P2, t1);
      const wave = kind === 'cream' ? 2.2 : 0;
      const path = `M${pt(a)}Q${pt([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + wave])} ${pt(b)}L${pt(c)}Q${pt([(c[0] + d[0]) / 2, (c[1] + d[1]) / 2 - wave])} ${pt(d)}Z`;
      const cols = kind === 'cream' ? [CREAM.base, CREAM.light, CREAM.dark] : [pal.mid, pal.light, mix(pal.mid, pal.dark, 0.4)];
      const p = sheet(svg, path, R, {
        base: linGrad(svg, [[0, kind === 'cream' ? CREAM.light : pal.light], [0.6, kind === 'cream' ? CREAM.base : pal.mid], [1, kind === 'cream' ? CREAM.dark : pal.dark]], P[0], 0, Fr[0], 0),
        cols, box: [P[0], Math.min(a[1], b[1]), Fr[0] - P[0], Math.max(c[1], d[1]) - Math.min(a[1], b[1])], n: kind === 'cream' ? 18 : 36, dir: [1, 0.11], len: [12, 34], width: kind === 'cream' ? [3, 6] : [4, 9],
      });
      if (kind === 'sponge') {
        // pori-pori bolu
        dabs(p.inner, { n: 46, R, filter: null, place: (i, R2) => {
          const u = R2(), v = R2();
          const top = lerp(lerp(P, P2, t0), lerp(Fr, F2, t0), u), bot = lerp(lerp(P, P2, t1), lerp(Fr, F2, t1), u);
          const q = lerp(top, bot, 0.15 + v * 0.7);
          return { x: q[0], y: q[1], rx: 0.9 + R2() * 1.6, ry: 0.7 + R2() * 1.1, color: mix(pal.dark, SHADOW, 0.2), opacity: 0.35 + R2() * 0.3 };
        } });
      }
    });
    // bayangan halus di sisi potong (cahaya dari kiri-atas)
    el('path', { d: `M${pt(P)}L${pt(Fr)}L${pt(F2)}L${pt(P2)}Z`, fill: linGrad(svg, [[0, '#ffffff', 0.18], [0.55, '#ffffff', 0], [1, SHADOW, 0.16]], P[0], 0, Fr[0], 0) }, svg);

    // permukaan atas: krim berpusar
    const top = `M${pt(P)}L${pt(B)}Q${pt([276, 122])} ${pt(Fr)}Z`;
    painted(svg, top, {
      base: CREAM.base, n: 50, R, filter: 'impastoH', cast: 'cast',
      stroke: () => {
        const u = R(), v = R() * (1 - u * 0.15);
        const a = lerp(P, B, u), b = lerp(P, Fr, u);
        const q = lerp(a, b, v);
        const L = 8 + R() * 20;
        const c = u > 0.75 && v > 0.6 ? mix(CREAM.base, CREAM.dark, 0.5) : mix(CREAM.base, CREAM.light, R() * 0.9);
        return { d: `M${q[0] - L / 2},${q[1]}q${L / 2},${-3 - R() * 3} ${L},0`, color: jitter(c, 5, R), width: 4 + R() * 6, opacity: 0.5 + R() * 0.4 };
      },
    });
    // semprotan krim di tepi luar + stroberi setengah + taburan
    const g = el('g', { filter: 'url(#cast)' }, svg);
    dabs(g, { n: 4, R, filter: 'impastoFine', place: (k) => { const q = lerp(B, Fr, 0.15 + k * 0.24); return { x: q[0] + 6, y: q[1] - 6, rx: 9, ry: 7.5, color: jitter(k > 2 ? mix(CREAM.base, CREAM.dark, 0.4) : CREAM.base, 4, R), opacity: 1 }; } });
    dabs(g, { n: 4, R, filter: null, place: (k) => { const q = lerp(B, Fr, 0.15 + k * 0.24); return { x: q[0] + 4, y: q[1] - 9, rx: 3.6, ry: 2.6, color: CREAM.light, opacity: 0.9 }; } });
    const sb = el('g', { transform: 'translate(206 104) rotate(-18)', filter: 'url(#cast)' }, svg);
    painted(sb, 'M0,-22C14,-22 20,-8 14,6C9,16 3,22 0,24C-3,22 -9,16 -14,6C-20,-8 -14,-22 0,-22Z', {
      base: linGrad(sb, [[0, '#ff8a8a'], [0.5, '#e8414f'], [1, '#a81e33']], -14, -22, 14, 24), n: 14, R, filter: 'impastoFine',
      stroke: () => ({ d: `M${-10 + R() * 20},${-18 + R() * 34}l${3 + R() * 5},${(R() - 0.5) * 4}`, color: jitter(R() < 0.5 ? '#ff9a9a' : '#c42a3d', 6, R), width: 3 + R() * 3, opacity: 0.5 }),
    });
    for (let i = 0; i < 9; i++) el('ellipse', { cx: -8 + (i % 3) * 8, cy: -10 + Math.floor(i / 3) * 10, rx: 1.1, ry: 1.6, fill: '#ffe9a0', opacity: 0.9 }, sb);
    [[-6, -24, -30], [6, -24, 30], [0, -26, 0]].forEach(([x, y, r]) => el('path', { d: 'M0,0q-4,-8 0,-14q4,6 0,14Z', fill: '#4f9a62', transform: `translate(${x} ${y}) rotate(${r})` }, sb));
    const sp = el('g', { filter: 'url(#cast)' }, svg);
    const cols = ['#ffd24a', '#7fd1c7', '#b7a2ee', '#ff9d5c', '#ffffff'];
    for (let i = 0; i < 12; i++) {
      const u = 0.25 + R() * 0.6, v = R() * 0.8;
      const q = lerp(lerp(P, B, u), lerp(P, Fr, u), v);
      const a = R() * Math.PI, L = 3.6;
      el('path', { d: `M${q[0] - Math.cos(a) * L},${q[1] - Math.sin(a) * L}L${q[0] + Math.cos(a) * L},${q[1] + Math.sin(a) * L}`, stroke: cols[i % cols.length], 'stroke-width': 3, 'stroke-linecap': 'round' }, sp);
    }

    // garpu kecil di sisi kanan piring
    const fk = el('g', { transform: 'translate(318 222) rotate(-62)', filter: 'url(#cast)' }, svg);
    const steel = linGrad(fk, [[0, '#8c8f99'], [0.45, '#f4f5f8'], [1, '#9a9daa']], -6, 0, 6, 0);
    el('path', { d: 'M-3.2,0L-2.4,-74Q0,-78 2.4,-74L3.2,0Q0,4 -3.2,0Z', fill: steel }, fk);
    el('path', { d: 'M-7,-74Q-8,-90 -7,-104M-2.4,-74V-106M2.4,-74V-106M7,-74Q8,-90 7,-104', stroke: '#b9bcc6', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, fk);
    el('path', { d: 'M-7.5,-74Q0,-68 7.5,-74', stroke: '#b9bcc6', 'stroke-width': 3.2, fill: 'none' }, fk);
  }
  F.sprites['lilin-potong'] = { w: 340, h: 260, seed: 491, draw: slice };

  /* ───────── pisau kue: bilah perak, gagang kayu berukir (90×330) ───────── */
  F.sprites['lilin-pisau'] = { w: 90, h: 330, seed: 492, draw(svg, R) {
    const g = el('g', { transform: 'translate(45 0)' }, svg);
    // bilah (ujung membulat di bawah)
    const blade = 'M-15,118L15,118L17,280Q16,312 -2,318Q-16,312 -15,286Z';
    painted(g, blade, {
      base: linGrad(g, [[0, '#7d818d'], [0.28, '#e9ebf1'], [0.5, '#ffffff'], [0.75, '#c5c8d2'], [1, '#868a96']], -16, 0, 17, 0), n: 26, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = -13 + R() * 28, y = 124 + R() * 180; return { d: `M${x},${y}l${(R() - 0.5) * 2},${20 + R() * 40}`, color: jitter(R() < 0.5 ? '#ffffff' : '#a9adb8', 4, R), width: 2 + R() * 3, opacity: 0.35 + R() * 0.3 }; },
    });
    el('path', { d: 'M-9,124L-8,290', stroke: '#ffffff', 'stroke-width': 2.4, opacity: 0.85, 'stroke-linecap': 'round' }, g);
    // sisa krim di ujung bilah (lucu, sudah dicicipi)
    dabs(g, { n: 5, R, filter: 'impastoFine', place: (k) => ({ x: -6 + k * 3.6, y: 300 - (k % 2) * 6, rx: 6, ry: 5, color: jitter(k === 4 ? PINK.light : CREAM.base, 4, R), opacity: 1 }) });
    // cincin kuningan
    el('rect', { x: -17, y: 108, width: 34, height: 12, rx: 4, fill: linGrad(g, [[0, '#8a6722'], [0.4, '#f4e0a0'], [1, '#8a6722']], -17, 0, 17, 0) }, g);
    // gagang kayu jati
    const handle = 'M-13,8Q0,0 13,8L15,108L-15,108Z';
    painted(g, handle, {
      base: linGrad(g, [[0, '#5a3214'], [0.35, '#a8693a'], [0.55, '#c88a52'], [1, '#5a3214']], -15, 0, 15, 0), n: 30, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = -12 + R() * 24, y = 10 + R() * 90; return { d: `M${x},${y}q${(R() - 0.5) * 3},14 ${(R() - 0.5) * 2},${24 + R() * 18}`, color: jitter(R() < 0.5 ? '#d39a62' : '#6b3c1a', 6, R), width: 2 + R() * 3, opacity: 0.4 + R() * 0.3 }; },
    });
    // ukiran kawung kecil di gagang
    const kw = el('g', { fill: 'none', stroke: '#f1d2a0', 'stroke-width': 1.3, opacity: 0.75 }, g);
    [38, 70].forEach((y) => { for (const a of [45, 135, 225, 315]) el('ellipse', { cx: 0, cy: y, rx: 5.2, ry: 2.4, transform: `rotate(${a} 0 ${y}) translate(6 0)` }, kw); });
    // pita kecil diikat di gagang
    const rb = el('g', { transform: 'translate(10 96)', filter: 'url(#cast)' }, g);
    el('path', { d: 'M0,0C10,-12 26,-8 22,4C18,12 6,6 0,0Z', fill: '#e8576a' }, rb);
    el('path', { d: 'M0,0C-2,14 8,26 18,24C12,16 6,8 0,0Z', fill: '#c93b52' }, rb);
    el('circle', { r: 3.6, fill: '#b62f45' }, rb);
  } };

  /* ───────── colekan krim di kaca layar (300×200): satu olesan jari dari kiri-bawah ke kanan-atas ───────── */
  F.sprites['lilin-colek'] = { w: 300, h: 200, seed: 517, draw(svg, R) {
    const A = [74, 130], C = [128, 50], E = [256, 62];
    const at = (t) => [(1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * C[0] + t * t * E[0], (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * C[1] + t * t * E[1]];
    const nrm = (t) => {
      const dx = 2 * (1 - t) * (C[0] - A[0]) + 2 * t * (E[0] - C[0]), dy = 2 * (1 - t) * (C[1] - A[1]) + 2 * t * (E[1] - C[1]);
      const m = Math.hypot(dx, dy) || 1;
      return [-dy / m, dx / m];
    };
    // setengah lebar: gumpal di titik jari menekan, lalu menipis
    const half = (t) => 36 * (1 - t * 0.56) + Math.max(0, 0.22 - t) ** 2 * 380;
    const N = 26, L = [], Q = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = at(t), n = nrm(t), w = half(t) * (1 + (R() - 0.5) * 0.16);
      L.push([p[0] + n[0] * w, p[1] + n[1] * w]);
      Q.push([p[0] - n[0] * w * (0.9 + R() * 0.12), p[1] - n[1] * w * (0.9 + R() * 0.12)]);
    }
    const smooth = (pts) => pts.slice(1).map((p, i) => { const a = pts[i]; return `Q${pt(a)} ${pt([(a[0] + p[0]) / 2, (a[1] + p[1]) / 2])}`; }).join('');
    const rEnd = half(1), rStart = half(0);
    const d = `M${pt(L[0])}${smooth(L)}L${pt(L[N])}A${rEnd},${rEnd} 0 0 0 ${pt(Q[N])}${smooth(Q.slice().reverse())}L${pt(Q[0])}A${rStart},${rStart} 0 0 0 ${pt(L[0])}Z`;
    const g = el('g', {}, svg);
    painted(g, d, {
      base: linGrad(g, [[0, CREAM.light], [0.5, CREAM.base], [1, mix(CREAM.base, CREAM.dark, 0.6)]], 60, 40, 220, 150), n: 40, R, filter: 'impastoH', cast: 'cast',
      stroke: (i) => {
        // alur bekas jari memanjang searah olesan
        if (i < 7) {
          const o = -0.7 + (i / 6) * 1.4;
          const pts = [];
          for (let k = 0; k <= 12; k++) { const t = 0.06 + (k / 12) * 0.86, p = at(t), n = nrm(t), w = half(t); pts.push([p[0] + n[0] * w * o, p[1] + n[1] * w * o]); }
          return { d: `M${pt(pts[0])}${smooth(pts)}`, color: i % 2 ? CREAM.light : mix(CREAM.base, CREAM.dark, 0.55), width: 3 + R() * 3, opacity: 0.55 };
        }
        const t = R() * 0.95, p = at(t), n = nrm(t), w = half(t) * (R() - 0.5) * 1.5, Lx = 8 + R() * 12;
        return { d: `M${p[0] + n[0] * w},${p[1] + n[1] * w}l${Lx},${-Lx * 0.45}`, color: jitter(R() < 0.6 ? CREAM.light : CREAM.dark, 4, R), width: 3 + R() * 4, opacity: 0.4 + R() * 0.3 };
      },
    });
    // pita krim stroberi yang ikut teroles
    const PL = [], PQ = [];
    for (let i = 0; i <= 16; i++) {
      const t = 0.18 + (i / 16) * 0.6, p = at(t), n = nrm(t), w = 7 * (1 - (i / 16) * 0.5), o = -half(t) * 0.18;
      PL.push([p[0] + n[0] * (o + w), p[1] + n[1] * (o + w)]);
      PQ.push([p[0] + n[0] * (o - w), p[1] + n[1] * (o - w)]);
    }
    painted(g, `M${pt(PL[0])}${smooth(PL)}L${pt(PQ[16])}${smooth(PQ.slice().reverse())}Z`, {
      base: linGrad(g, [[0, PINK.light], [1, PINK.mid]], 80, 60, 220, 80), n: 10, R, filter: 'impastoFine',
      stroke: () => { const t = 0.2 + R() * 0.55, p = at(t); return { d: `M${p[0] - 6},${p[1] + 2}l12,-5`, color: jitter(R() < 0.5 ? '#ffe3e8' : PINK.mid, 4, R), width: 2.5 + R() * 2, opacity: 0.6 }; },
    });
    // kilap basah di tepi atas olesan
    const hl = [];
    for (let k = 0; k <= 10; k++) { const t = 0.08 + k * 0.07, p = at(t), n = nrm(t), w = half(t) * 0.62; hl.push([p[0] + n[0] * w, p[1] + n[1] * w]); }
    el('path', { d: `M${pt(hl[0])}${smooth(hl)}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 3.2, 'stroke-linecap': 'round', opacity: 0.85 }, g);
    el('ellipse', { cx: A[0] - 8, cy: A[1] - 12, rx: 9, ry: 5, fill: '#ffffff', opacity: 0.8, transform: `rotate(-30 ${A[0] - 8} ${A[1] - 12})` }, g);
    // taburan warna
    const sp = el('g', { filter: 'url(#cast)' }, g);
    const cols = ['#ffd24a', '#7fd1c7', '#b7a2ee', '#ff9d5c', '#f08aa4', '#7fd1c7'];
    [0.04, 0.14, 0.26, 0.38, 0.5, 0.63, 0.76, 0.88].forEach((t, i) => {
      const p = at(t), n = nrm(t), o = (R() - 0.5) * half(t) * 1.1, x = p[0] + n[0] * o, y = p[1] + n[1] * o, a = R() * Math.PI, l = 4.4;
      el('path', { d: `M${x - Math.cos(a) * l},${y - Math.sin(a) * l}L${x + Math.cos(a) * l},${y + Math.sin(a) * l}`, stroke: cols[i % cols.length], 'stroke-width': 3.4, 'stroke-linecap': 'round' }, sp);
    });
    // cipratan kecil di sekitarnya
    const dr = el('g', { filter: 'url(#cast)' }, svg);
    [[282, 46, 6.5], [252, 22, 4], [214, 30, 3], [24, 176, 5.5], [96, 178, 3.6], [14, 120, 3]].forEach(([x, y, r]) => {
      el('ellipse', { cx: x, cy: y, rx: r * (1 + R() * 0.3), ry: r, fill: CREAM.base, transform: `rotate(${R() * 180} ${x} ${y})` }, dr);
      el('circle', { cx: x - r * 0.3, cy: y - r * 0.35, r: r * 0.32, fill: '#ffffff', opacity: 0.9 }, dr);
    });
  } };
})();
