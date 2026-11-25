/* Rumah Kecil Kita: rumah boneka mungil berdepan engsel di atas meja teras, saat senja. Latar teras (langit senja,
   kebun yang kabur, meja jati + taplak tenun), langit malam, rumah boneka dalam empat lapis yang ditumpuk persis
   (isi kamar, badan + alas + kebun + pohon kamboja, muka rumah berlubang jendela yang bisa dibuka seperti pintu
   lemari, atap + cerobong + kabel lampu untai), tirai, bohlam loteng, asap hati, bulan, dan adegan dekat depan
   pintu (keset, kucing oren, surat). Semua tulisan dipasang dari DOM di atas lukisan ini.
   Satuan "dunia" sama dengan CSS: 780 × 1500, menempel di bawah layar. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, mix, jitter, ramp, linGrad, radGrad, leaf } = F;
  /** latar diperpanjang ke segala arah, supaya kamera bisa mundur tanpa tepi kosong */
  const BG = { x: -130, y: -320, w: 1040, h: 1900 };
  const VP = [390, 380];
  const TABLE = 1150;

  /* ── geometri rumah (satuan dunia; sama dengan style.module.css) ── */
  const SL = 0.869;
  /** muka rumah (sedikit masuk ke bawah atap) */
  const FACADE = 'M106,1202H674V729L390,482L106,729Z';
  const ROOMS = { tamu: [124, 952, 381, 1184], dapur: [399, 952, 656, 1184], kamar: [124, 718, 381, 932], teras: [399, 718, 656, 932] };
  /** lubang di muka rumah */
  const WIN = {
    w1: [170, 1064, 286, 1152],
    w2: [494, 1064, 610, 1152],
    w3: [176, 760, 288, 870],
  };
  const ARCH = 'M470,926V806A70,70 0 0 1 610,806V926Z';
  const OCULUS = [390, 618, 34];
  const DOOR = 'M352,1196V1090A38,38 0 0 1 428,1090V1196Z';
  const SIGN = [214, 956, 566, 1040];

  const PAL = {
    plaster: ['#d8b98e', '#f3dfbf', '#fff4de'],
    trim: ['#d6cdbf', '#f6f1e8', '#fffdf8'],
    sage: ['#2c5650', '#4c8378', '#8dbfb0'],
    roof: ['#7e3320', '#bb5737', '#e78f66'],
    brick: ['#6e3322', '#a9533a', '#d6876a'],
    wood: ['#5a3418', '#8a5a32', '#b8875a'],
    teak: ['#4a2814', '#7c4a28', '#b07a4c'],
    oak: ['#9a6a3e', '#c99662', '#ecc48e'],
    terra: ['#9a3f26', '#d0674a', '#f09a78'],
    cream: ['#d9c8a8', '#f4e8d0', '#fffaf0'],
    brass: { hi: '#fff4cc', light: '#f1d58a', base: '#c99a3e', mid: '#a87a26', dark: '#6e4b14', deep: '#47300b' },
  };
  const INK = '#3a1d12';

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const rect = (x0, y0, x1, y1) => `M${x0},${y0}H${x1}V${y1}H${x0}Z`;
  const circ = (cx, cy, r) => `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}Z`;
  const oval = (cx, cy, rx, ry) => `M${cx - rx},${cy}A${rx},${ry} 0 1 1 ${cx + rx},${cy}A${rx},${ry} 0 1 1 ${cx - rx},${cy}Z`;
  const at = (g, transform, extra = {}) => el('g', { transform, ...extra }, g);
  const clipG = (g, d, evenodd) => { const id = F.uid('r'); const cp = el('clipPath', { id }, g); el('path', { d, 'clip-rule': evenodd ? 'evenodd' : undefined }, cp); return el('g', { 'clip-path': `url(#${id})` }, g); };

  /** bidang bebas dilukis dengan sapuan searah `dir`; cols = [gelap, dasar, terang] */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90], base, transform, opacity = [0.35, 0.8] } = {}) => painted(g, d, {
    base: base || cols[1], n, R, filter, cast, transform,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: opacity[0] + R() * (opacity[1] - opacity[0]) };
    },
  });
  /** bidang berlubang (jendela): fill-rule evenodd */
  function holes(p, d) {
    p.g.querySelectorAll('path').forEach((e) => { if (e.getAttribute('d') === d) { e.setAttribute('fill-rule', 'evenodd'); e.setAttribute('clip-rule', 'evenodd'); } });
    return p;
  }
  const BR = [[0, PAL.brass.light], [0.2, PAL.brass.hi], [0.45, PAL.brass.light], [0.7, PAL.brass.base], [1, PAL.brass.mid]];
  function brass(g, d, box, R, { n = 10, cast = 'cast' } = {}) {
    const [x, y, w, h] = box;
    return painted(g, d, {
      base: linGrad(g, BR, x, y, x + w, y + h), n, R, filter: 'impastoFine', cast,
      stroke: () => { const u = R(), v = R(); return { d: `M${x + u * w},${y + v * h}l${w * 0.2},${h * 0.2}`, color: jitter(ramp(BR, (u + v) / 2), 4, R), width: 1 + R() * 3, opacity: 0.3 }; },
    });
  }
  /** kamboja kecil lima kelopak (tanda floa) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
  function mark(g, x, y, s, fill, { opacity = 1, squash = 1, core } = {}) {
    const m = el('g', { transform: `translate(${x} ${y}) scale(${s} ${s * squash})`, opacity }, g);
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill, transform: `rotate(${i * 72})` }, m);
    el('circle', { r: 3.4, fill: core || mix(fill, '#c98a2e', 0.6) }, m);
    return m;
  }
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
  /** bunga mungil (titik cat) */
  const bloom = (g, x, y, r, c) => { el('circle', { cx: x + r * 0.2, cy: y + r * 0.3, r, fill: INK, opacity: 0.25 }, g); el('circle', { cx: x, cy: y, r, fill: c }, g); el('circle', { cx: x - r * 0.3, cy: y - r * 0.3, r: r * 0.4, fill: '#ffffff', opacity: 0.5 }, g); };
  const line = (g, d, stroke, w, o = 1, extra = {}) => el('path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': o, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra }, g);
  /** bayangan lembut */
  const shade = (g, d, o = 0.3, f = 'soft', c = INK) => el('path', { d, fill: c, opacity: o, filter: `url(#${f})` }, g);

  /* ───────────── latar: langit senja, kebun kabur, meja jati + taplak ───────────── */
  /** titik di permukaan meja (perspektif satu titik) */
  const onTable = (x0, y) => VP[0] + (x0 - VP[0]) * (y - VP[1]) / (TABLE - VP[1]);
  function sky(g, R, stops, { n = 420 } = {}) {
    const { x, y, w } = BG;
    wash(g, { x, y, w, h: 1400, R, n, angle: -3, len: [0.2, 0.55], width: [30, 80], opacity: [0.3, 0.6], base: linGrad(g, stops, 0, y, 0, 1060), color: (u, v) => ramp(stops, v * 1.02 + (u - 0.5) * 0.04) });
  }
  function hills(g, R, cols, rim) {
    el('path', { d: 'M-140,980Q-20,930 120,950Q260,900 420,940Q560,905 720,935Q840,915 920,940V1180H-140Z', fill: cols[0], opacity: 0.85, filter: 'url(#blur2)' }, g);
    el('path', { d: 'M-140,1010Q60,975 240,995Q420,970 600,992Q780,975 920,995V1180H-140Z', fill: cols[1], filter: 'url(#blur2)' }, g);
    if (rim) el('path', { d: 'M-140,980Q-20,930 120,950Q260,900 420,940Q560,905 720,935Q840,915 920,940', fill: 'none', stroke: rim, 'stroke-width': 3, 'stroke-opacity': 0.5, filter: 'url(#blur2)' }, g);
  }
  /** kebun nyata di belakang meja: besar & kabur (rumah boneka yang tajam terasa mungil) */
  function garden(g, R, night) {
    const blur = el('g', { filter: 'url(#soft)' }, g);
    const greens = night ? ['#0f2230', '#16303c', '#1d3a44', '#24444c'] : ['#3d5a52', '#4f6e5c', '#5e7d62', '#6f8a6a', '#7f6f7e'];
    for (let i = 0; i < 90; i++) {
      const side = R() < 0.5 ? 0 : 1, u = R();
      const x = side ? 560 + u * 380 : -150 + u * 400, y = 860 + R() * 300;
      el('ellipse', { cx: x, cy: y, rx: 40 + R() * 70, ry: 30 + R() * 50, fill: jitter(greens[Math.floor(R() * greens.length)], 8, R), opacity: 0.9, transform: `rotate(${R() * 180} ${x} ${y})` }, blur);
    }
    for (let i = 0; i < 40; i++) {
      const x = 120 + R() * 540, y = 960 + R() * 200;
      el('ellipse', { cx: x, cy: y, rx: 40 + R() * 60, ry: 26 + R() * 34, fill: jitter(greens[Math.floor(R() * greens.length)], 8, R), opacity: 0.85 }, blur);
    }
    // daun pisang besar di kanan & kiri
    const banana = (x, y, rot, s, c) => {
      const p = at(blur, `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
      el('path', { d: 'M0,0C60,-40 120,-160 110,-330C90,-300 40,-250 -10,-200C-50,-150 -40,-60 0,0Z', fill: c[0] }, p);
      el('path', { d: 'M0,0C70,-60 110,-180 110,-330', fill: 'none', stroke: c[1], 'stroke-width': 8 }, p);
      for (let k = 0; k < 7; k++) el('path', { d: `M${20 + k * 13},${-40 - k * 40}l-70,${-10 - k * 4}`, stroke: c[1], 'stroke-width': 3, opacity: 0.5 }, p);
    };
    const bc = night ? ['#132a34', '#1d3a44'] : ['#4c7660', '#77a07a'];
    banana(-60, 1150, -20, 1.4, bc); banana(-10, 1120, 18, 1.1, bc); banana(860, 1150, 26, 1.4, bc); banana(800, 1120, -14, 1.05, bc);
    // kamboja besar yang kabur di kiri atas
    const pal = night ? { stops: [[0, '#8a7a52'], [0.3, '#a8a07a'], [0.6, '#b9bccf'], [1, '#c9cde0']], shade: '#6a7090', light: '#dfe3f0' } : null;
    for (const [x, y, s] of [[-30, 830, 0.42], [40, 790, 0.36], [-80, 760, 0.32], [820, 820, 0.4], [870, 770, 0.3]]) {
      const fg = at(blur, `translate(${x} ${y})`);
      if (pal) F.flora.flowers.kamboja(fg, R, s, pal); else F.flora.flowers.kamboja(fg, R, s);
    }
  }
  /** lampu untai nyata di kejauhan: bulatan cahaya kabur */
  function bokeh(g, R, night) {
    const b = el('g', {}, g);
    for (let i = 0; i < 26; i++) {
      const t = i / 25, x = -100 + t * 980, y = 760 + Math.sin(t * Math.PI * 2.2) * 50 + Math.sin(t * Math.PI) * 60;
      const r = 14 + R() * 18;
      el('circle', { cx: x, cy: y, r: r * 1.8, fill: '#ffd49a', opacity: night ? 0.16 : 0.1, filter: 'url(#soft)' }, b);
      el('circle', { cx: x, cy: y, r, fill: R() < 0.7 ? '#ffe2b0' : '#ffc4a8', opacity: night ? 0.55 : 0.4 }, b);
      el('circle', { cx: x, cy: y, r: r * 0.92, fill: 'none', stroke: '#fff6e0', 'stroke-width': 2, opacity: night ? 0.4 : 0.3 }, b);
    }
  }
  function table(g, R, night) {
    const { x, w } = BG;
    const y0 = TABLE, y1 = BG.y + BG.h;
    const tk = night ? ['#1e140f', '#33241c', '#4d3a2e'] : PAL.teak;
    // permukaan meja: papan-papan jati searah pandangan
    const top = rect(x, y0, x + w, y1);
    const t = painted(g, top, {
      base: linGrad(g, [[0, mix(tk[2], night ? '#4a5a80' : '#f2a38a', 0.25)], [0.25, tk[2]], [0.7, tk[1]], [1, tk[0]]], 0, y0, 0, y1), n: 0, R, filter: 'impastoH',
      stroke: () => null,
    });
    for (let i = 0; i < 380; i++) {
      const x0 = -260 + R() * 1300, yy = y0 + Math.pow(R(), 0.8) * (y1 - y0), L = 40 + R() * 140;
      const xa = onTable(x0, yy), xb = onTable(x0, yy + L);
      const c = jitter(mix(tk[1], R() < 0.5 ? tk[0] : tk[2], R() * 0.7), 6, R);
      line(t.inner, `M${xa},${yy}L${xb},${yy + L}`, c, 2 + R() * 6 * ((yy - VP[1]) / 900), 0.2 + R() * 0.35);
    }
    for (let x0 = -560; x0 < 1400; x0 += 118) line(t.inner, `M${onTable(x0, y0)},${y0}L${onTable(x0, y1)},${y1}`, '#1a0a05', 2.4, 0.4);
    // kilau langit senja di meja (jauh) & gelap di dekat kita
    el('rect', { x, y: y0, width: w, height: 160, fill: linGrad(g, [[0, night ? '#5a6aa0' : '#ffc8a8', 0.32], [1, '#ffc8a8', 0]], 0, y0, 0, y0 + 160) }, t.inner);
    el('path', { d: `M${x},${y0}H${x + w}`, stroke: night ? '#7080b0' : '#ffd9b8', 'stroke-width': 4, 'stroke-opacity': 0.6 }, g);
    // taplak tenun: putih gading, pinggir terakota, motif kawung mengecil ke belakang
    const xl0 = 196, xr0 = 584;
    const tap = `M${onTable(xl0, y0 + 4)},${y0 + 4}L${onTable(xr0, y0 + 4)},${y0 + 4}L${onTable(xr0, y1)},${y1}L${onTable(xl0, y1)},${y1}Z`;
    const cl = night ? ['#4a4a5e', '#6c6c82', '#8a8aa2'] : PAL.cream;
    shade(g, `M${onTable(xl0, y0 + 10) + 10},${y0 + 12}L${onTable(xr0, y0 + 10) + 16},${y0 + 12}L${onTable(xr0, y1) + 40},${y1}L${onTable(xl0, y1) + 20},${y1}Z`, 0.35, 'blur2');
    const tp = painted(g, tap, {
      base: linGrad(g, [[0, cl[2]], [0.6, cl[1]], [1, cl[0]]], 0, y0, 0, y1), n: 220, R, filter: 'impastoFine',
      stroke: () => { const x0 = xl0 + R() * (xr0 - xl0), yy = y0 + R() * (y1 - y0), L = 20 + R() * 50; return { d: `M${onTable(x0, yy)},${yy}L${onTable(x0, yy + L)},${yy + L}`, color: jitter(mix(cl[1], R() < 0.5 ? cl[0] : cl[2], R() * 0.6), 4, R), width: 2 + R() * 5 * ((yy - VP[1]) / 900), opacity: 0.3 + R() * 0.4 }; },
    });
    const tr = night ? ['#4a2a30', '#6e3a3c'] : ['#a8452a', '#d0674a'];
    for (const [a, b, c] of [[xl0 + 10, xl0 + 34, tr[1]], [xl0 + 42, xl0 + 50, tr[0]], [xr0 - 34, xr0 - 10, tr[1]], [xr0 - 50, xr0 - 42, tr[0]]]) {
      el('path', { d: `M${onTable(a, y0)},${y0}L${onTable(b, y0)},${y0}L${onTable(b, y1)},${y1}L${onTable(a, y1)},${y1}Z`, fill: c, opacity: 0.85 }, tp.inner);
    }
    for (let k = 0; k < 9; k++) {
      const yy = y0 + 60 + k * k * 9 + k * 30, s = (yy - VP[1]) / (TABLE - VP[1]);
      for (let j = 0; j < 4; j++) {
        const cx = onTable(260 + j * 86, yy);
        mark(tp.inner, cx, yy, 0.9 * s, tr[1], { squash: 0.42, opacity: 0.55, core: night ? '#8a8aa2' : '#e8b04a' });
      }
    }
  }
  /** cangkir blirik (enamel hijau berbintik) di kiri depan */
  function mug(g, R, night) {
    const tone = night ? ['#132c2a', '#1f4440', '#2f5f58'] : ['#1d5a44', '#2f8062', '#5fb08c'];
    const x = -6, y = 1360;
    shade(g, oval(x + 120, y + 196, 150, 30), 0.45);
    // tatakan
    const sau = oval(x + 90, y + 186, 150, 30);
    shape(g, sau, [x - 60, y + 156, 300, 60], tone, R, { n: 18, len: [30, 80], width: [4, 8] });
    el('path', { d: oval(x + 90, y + 182, 120, 20), fill: 'none', stroke: '#fff8ee', 'stroke-width': 4, opacity: 0.7 }, g);
    // badan cangkir
    const body = `M${x},${y}C${x},${y + 80} ${x + 10},${y + 160} ${x + 40},${y + 180}H${x + 140}C${x + 170},${y + 160} ${x + 180},${y + 80} ${x + 180},${y}Z`;
    const b = shape(g, body, [x, y, 180, 180], tone, R, { n: 40, dir: [0.1, 1], len: [20, 60], width: [5, 10], cast: 'castBig' });
    for (let i = 0; i < 60; i++) el('circle', { cx: x + R() * 180, cy: y + 10 + R() * 170, r: 1.4 + R() * 2.4, fill: '#ffffff', opacity: 0.85 }, b.inner);
    el('rect', { x: x + 110, y, width: 80, height: 190, fill: linGrad(g, [[0, '#0a1a14', 0], [1, '#0a1a14', 0.45]], x + 110, 0, x + 190, 0) }, b.inner);
    line(b.inner, `M${x + 24},${y + 20}C${x + 22},${y + 80} ${x + 30},${y + 140} ${x + 46},${y + 168}`, '#ffffff', 6, 0.35);
    // bibir cangkir
    el('path', { d: oval(x + 90, y, 90, 18), fill: night ? '#3a2a20' : '#6b3a1e' }, g);
    el('path', { d: oval(x + 90, y + 3, 80, 13), fill: night ? '#2a1a12' : '#8a4a22' }, g);
    el('path', { d: oval(x + 90, y, 90, 18), fill: 'none', stroke: '#1a3a50', 'stroke-width': 5 }, g);
    // gagang
    line(g, `M${x + 178},${y + 40}C${x + 240},${y + 40} ${x + 240},${y + 120} ${x + 170},${y + 130}`, tone[0], 18);
    line(g, `M${x + 178},${y + 40}C${x + 236},${y + 40} ${x + 236},${y + 120} ${x + 170},${y + 130}`, tone[2], 6, 0.6);
  }
  function tableFlowers(g, R, night) {
    const pal = night ? { stops: [[0, '#8a7a52'], [0.3, '#a8a07a'], [0.6, '#b9bccf'], [1, '#c9cde0']], shade: '#6a7090', light: '#dfe3f0' } : undefined;
    for (const [x, y, rot, s] of [[700, 1360, -30, 0.5], [770, 1440, 20, 0.46], [640, 1470, 60, 0.36]]) {
      shade(g, oval(x + 10, y + 20, 70 * s * 2, 20 * s * 2), 0.3);
      for (let k = 0; k < 3; k++) leaf(g, { len: 160 * s * 1.4, w: 60 * s * 1.4, ...F.flora.GREEN[k % 4], R, n: 14, transform: `translate(${x} ${y}) rotate(${rot + 120 + k * 40}) scale(1 0.6)` });
      const f = at(g, `translate(${x} ${y}) rotate(${rot}) scale(1 0.7)`);
      if (pal) F.flora.flowers.kamboja(f, R, s, pal); else if (rot > 0) F.flora.flowers.kambojaPink(f, R, s); else F.flora.flowers.kamboja(f, R, s);
    }
  }
  function backdrop(g, R) {
    sky(g, R, [[0, '#24275c'], [0.18, '#3c3a7a'], [0.36, '#74508c'], [0.53, '#c06a8c'], [0.68, '#ec8e80'], [0.82, '#f7b585'], [1, '#fcd8a2']]);
    // sisa matahari di kiri, di balik kebun
    el('circle', { cx: 20, cy: 990, r: 520, fill: radGrad(g, [[0, '#fff1c8', 0.85], [0.3, '#ffd6a0', 0.45], [1, '#ffd6a0', 0]], 20, 990, 520) }, g);
    F.latar.clouds(g, R, '#f2a2ae', [[560, 260, 560, 70, 0.55], [150, 470, 480, 54, 0.45], [680, 640, 420, 40, 0.4], [300, 120, 400, 40, 0.3]]);
    F.latar.clouds(g, R, '#ffd2a0', [[520, 300, 420, 22, 0.5], [180, 500, 360, 18, 0.45]]);
    for (let i = 0; i < 26; i++) el('circle', { cx: BG.x + R() * BG.w, cy: BG.y + R() * 420, r: 0.8 + R() * 1.4, fill: '#fff6e0', opacity: 0.4 + R() * 0.5 }, g);
    hills(g, R, ['#8a5e8e', '#a26e8e'], '#ffd6b0');
    garden(g, R, false);
    bokeh(g, R, false);
    table(g, R, false);
    mug(g, R, false);
    tableFlowers(g, R, false);
  }
  /** langit malam (lapisan di atas latar senja; tepi bawahnya melebur ke meja) */
  function nightSky(g, R) {
    const fade = el('mask', { id: 'nfade' }, (g.ownerSVGElement || g).querySelector('defs'));
    el('rect', { x: BG.x, y: BG.y, width: BG.w, height: BG.h, fill: linGrad(g, [[0, '#fff'], [0.8, '#fff'], [1, '#000']], 0, BG.y, 0, TABLE + 40) }, fade);
    const m = el('g', { mask: 'url(#nfade)' }, g);
    sky(m, R, [[0, '#070b22'], [0.3, '#0f1638'], [0.6, '#1b2552'], [0.85, '#2c3a6c'], [1, '#3b4a7c']], { n: 300 });
    el('path', { d: 'M-140,700C120,520 420,300 920,40', fill: 'none', stroke: '#8fa2d8', 'stroke-width': 180, 'stroke-opacity': 0.1, filter: 'url(#softer)' }, m);
    el('path', { d: 'M-140,700C120,520 420,300 920,40', fill: 'none', stroke: '#c9d3f2', 'stroke-width': 60, 'stroke-opacity': 0.08, filter: 'url(#soft)' }, m);
    for (let i = 0; i < 260; i++) {
      const x = BG.x + R() * BG.w, y = BG.y + R() * 1250, r = R() < 0.9 ? 0.8 + R() * 1.4 : 2 + R() * 1.4;
      el('circle', { cx: x, cy: y, r, fill: R() < 0.8 ? '#ffffff' : '#ffe9b0', opacity: 0.35 + R() * 0.6 }, m);
    }
    for (const [x, y, s] of [[660, 140, 1.2], [80, 260, 1], [520, 420, 0.8], [760, 560, 0.9], [-60, 520, 0.8], [300, 60, 0.9]]) {
      el('circle', { cx: x, cy: y, r: 9 * s, fill: '#fff6d8', opacity: 0.35, filter: 'url(#blur2)' }, m);
      el('path', { d: `M${x},${y - 12 * s}L${x + 2 * s},${y - 2 * s}L${x + 12 * s},${y}L${x + 2 * s},${y + 2 * s}L${x},${y + 12 * s}L${x - 2 * s},${y + 2 * s}L${x - 12 * s},${y}L${x - 2 * s},${y - 2 * s}Z`, fill: '#fffbe8' }, m);
    }
    F.latar.clouds(m, R, '#2c3a6e', [[560, 300, 500, 40, 0.5], [150, 520, 420, 34, 0.4]]);
    hills(m, R, ['#121a3a', '#18224a'], '#4a5a90');
    garden(m, R, true);
    bokeh(m, R, true);
  }

  /* ───────────── badan rumah: alas, kebun mungil, pohon kamboja, tepi dinding & lantai ───────────── */
  function plinth(g, R) {
    // bayangan alas di meja (cahaya dari kiri-atas)
    shade(g, 'M60,1236L760,1236L800,1300L90,1296Z', 0.5, 'soft');
    shade(g, 'M40,1240L740,1240L770,1268L60,1268Z', 0.45, 'blur2');
    // muka depan alas: kayu bercat hijau tua, list krem
    const front = rrect(34, 1210, 712, 50, 8);
    const f = shape(g, front, [34, 1210, 712, 50], ['#1d3836', '#2e5550', '#4e7a70'], R, { n: 50, len: [40, 140], width: [4, 9], cast: 'castBig' });
    el('rect', { x: 34, y: 1210, width: 712, height: 50, fill: linGrad(g, [[0, '#000', 0], [0.7, '#000', 0], [1, '#000', 0.3]], 34, 0, 746, 0) }, f.inner);
    line(f.inner, 'M34,1214H746', '#f4e8d0', 4, 0.85);
    line(f.inner, 'M34,1222H746', '#1a2a28', 2, 0.5);
    line(f.inner, 'M40,1252H740', '#8fb7aa', 1.6, 0.4);
    for (const x of [60, 720]) mark(f.inner, x, 1238, 0.5, '#f4e8d0', { opacity: 0.6, core: '#e8b04a' });
    for (let x = 120; x < 680; x += 62) el('circle', { cx: x, cy: 1238, r: 2, fill: '#f4e8d0', opacity: 0.4 }, f.inner);
    // permukaan atas alas: rumput mungil
    const top = 'M44,1212L736,1212L722,1186L58,1186Z';
    const t = shape(g, top, [44, 1186, 692, 28], [F.flora.GREEN[0].dark, F.flora.GREEN[3].mid, F.flora.GREEN[3].light], R, { n: 120, dir: [0.1, -1], len: [5, 12], width: [3, 6] });
    el('path', { d: top, fill: linGrad(g, [[0, '#000', 0.15], [1, '#000', 0]], 0, 1186, 0, 1212) }, t.inner);
    line(g, 'M44,1212L736,1212', '#c9e6a0', 2, 0.6);
  }
  /** pohon kamboja mungil di kiri belakang rumah */
  function tree(g, R) {
    const T = ['#5a4436', '#8a6c5a', '#c4a490'];
    const outside = clipG(g, `M-200,300H980V1300H-200Z M100,1210H680V733L390,478L100,733Z`, true);
    shade(outside, oval(84, 1206, 50, 7), 0.4, 'blur2');
    const limb = (d, w) => {
      line(outside, d, T[0], w + 3);
      line(outside, d, T[1], w);
      line(outside, d, T[2], w * 0.35, 0.7, { transform: `translate(${-w * 0.22} 0)` });
    };
    limb('M82,1206C84,1150 76,1090 86,1030C92,990 84,950 74,920', 16);
    limb('M84,1030C104,990 118,950 120,900', 9);
    limb('M76,930C60,900 46,880 30,860', 9);
    limb('M76,930C82,900 88,876 96,850', 8);
    limb('M118,906C130,880 140,860 156,846', 7);
    limb('M84,1060C64,1040 50,1020 44,990', 7);
    const tips = [[30, 856, -40], [96, 846, -6], [156, 842, 30], [44, 986, -60], [120, 896, 10]];
    tips.forEach(([x, y, rot], i) => {
      const gr = F.flora.GREEN[i % 4];
      for (let k = 0; k < 7; k++) leaf(outside, { len: 54 + R() * 18, w: 20 + R() * 5, ...gr, R, n: 10, transform: `translate(${x} ${y}) rotate(${rot - 90 + k * 30})`, filter: 'impastoFine' });
    });
    tips.forEach(([x, y], i) => {
      const fl = (dx, dy, r, s, pink) => { const f = at(outside, `translate(${x + dx} ${y + dy}) rotate(${r})`); if (pink) F.flora.flowers.kambojaPink(f, R, s); else F.flora.flowers.kamboja(f, R, s); };
      fl(-6, -10, 10, 0.13, i % 2);
      fl(10, -2, -20, 0.11, !(i % 2));
      if (i < 3) fl(-2, 8, 40, 0.1, i % 2);
    });
  }
  function shrub(g, R, x, y, s, flowers) {
    shade(g, oval(x + 6, y + 4, 34 * s, 7 * s), 0.35, 'blur2');
    shape(g, oval(x, y - 16 * s, 34 * s, 24 * s), [x - 34 * s, y - 40 * s, 68 * s, 48 * s], [F.flora.GREEN[0].dark, F.flora.GREEN[2].mid, F.flora.GREEN[1].light], R, { n: 22, len: [6, 14], width: [3, 6], dir: [0.4, -1], cast: 'cast' });
    for (let i = 0; i < 9; i++) bloom(g, x - 24 * s + R() * 48 * s, y - 30 * s + R() * 24 * s, 3.4 * s + R() * 1.6, flowers[i % flowers.length]);
  }
  function mailbox(g, R) {
    // tiang + kotak surat merah bata, dengan bendera kecil
    shade(g, oval(82, 1206, 18, 4), 0.4, 'blur2');
    shape(g, rect(76, 1124, 86, 1206), [76, 1124, 10, 82], PAL.wood, R, { n: 6, dir: [0, 1], len: [20, 50], width: [2, 4], cast: 'cast' });
    const box = 'M60,1100H100Q108,1100 108,1108V1132H52V1108Q52,1100 60,1100Z';
    const b = shape(g, box, [52, 1092, 56, 40], PAL.terra, R, { n: 12, len: [8, 20], width: [3, 5], cast: 'cast' });
    el('path', { d: 'M52,1112H108', stroke: '#6e2a18', 'stroke-width': 1.4, opacity: 0.6 }, b.inner);
    el('path', { d: 'M58,1118H80', stroke: '#2a120a', 'stroke-width': 2.4, opacity: 0.7, 'stroke-linecap': 'round' }, g);
    line(g, 'M108,1106V1086', '#5a3418', 2.4);
    el('path', { d: 'M108,1086H122V1094H108Z', fill: '#f2c14e' }, g);
  }
  function body(g, R) {
    plinth(g, R);
    tree(g, R);
    // dinding samping kanan rumah (tepi tebal yang kelihatan saat muka dibuka) + bayangan dalam
    const cut = ['#d9cbb4', '#f2e7d4', '#fffaf0'];
    const walls = [rect(106, 724, 124, 1202), rect(656, 724, 674, 1202), rect(381, 718, 399, 1184)];
    walls.forEach((d, i) => {
      const xs = i === 0 ? 106 : i === 1 ? 656 : 381;
      const w = shape(g, d, [xs, 718, 18, 484], cut, R, { n: 14, dir: [0, 1], len: [40, 120], width: [3, 6] });
      line(w.inner, `M${xs + 1},718V1202`, '#ffffff', 2, 0.8);
      line(w.inner, `M${xs + 17},718V1202`, '#a89a84', 2, 0.6);
    });
    // lantai antar tingkat: tepi papan + list
    const slabs = [[1184, 1202], [932, 952], [700, 718]];
    slabs.forEach(([a, b]) => {
      const x0 = a === 700 ? 122 : 106, x1 = a === 700 ? 658 : 674;
      const s = shape(g, rect(x0, a, x1, b), [x0, a, x1 - x0, b - a], PAL.oak, R, { n: 20, len: [60, 200], width: [3, 6] });
      line(s.inner, `M${x0},${a + 1}H${x1}`, '#fff1d6', 2, 0.8);
      line(s.inner, `M${x0},${b - 1}H${x1}`, '#5a3418', 2, 0.5);
    });
    // kaki dinding (fondasi batu) di bawah muka
    const found = shape(g, rect(100, 1196, 680, 1212), [100, 1196, 580, 16], ['#8a8275', '#b9b0a0', '#d8d0c0'], R, { n: 20, len: [20, 60], width: [3, 6], cast: 'cast' });
    for (let x = 100; x < 680; x += 36) line(found.inner, `M${x},1196V1212`, '#6a6255', 1.4, 0.5);
    // kebun mungil di pojok alas
    shrub(g, R, 42, 1206, 0.9, ['#ff9fb2', '#ffffff', '#ffd35a']);
    shrub(g, R, 700, 1206, 1.1, ['#e0457a', '#ff8fb0', '#ffffff']);
    shrub(g, R, 742, 1208, 0.7, ['#ffd35a', '#ffffff']);
    for (let i = 0; i < 40; i++) {
      const x = 46 + R() * 690, y = 1196 + R() * 14;
      if (x > 330 && x < 450) continue;
      line(g, `M${x},${y}l-2,-6M${x},${y}l0,-8M${x},${y}l2,-6`, R() < 0.5 ? '#2f6b3a' : '#8cc070', 1.4, 0.85);
      if (R() < 0.45) bloom(g, x, y - 8, 2 + R() * 1.4, ['#ffffff', '#ff9fb2', '#ffd35a', '#e0457a'][Math.floor(R() * 4)]);
    }
    // batu pijakan & keset kecil di depan pintu
    for (const [x, y] of [[372, 1209], [408, 1209]]) el('path', { d: oval(x, y, 14, 3.4), fill: '#c9c0b0', stroke: '#8a8275', 'stroke-width': 1 }, g);
    const mat = 'M350,1200H430L436,1211H344Z';
    shape(g, mat, [344, 1200, 92, 11], ['#8a5a24', '#c08a46', '#e2b070'], R, { n: 16, dir: [0.2, 1], len: [3, 8], width: [1.5, 3] });
    line(g, 'M352,1203H428M348,1208H432', '#7a4a1c', 1.2, 0.6);
    mailbox(g, R);
  }

  /* ───────────── atap: genteng, lis berenda, cerobong, kabel lampu untai ───────────── */
  const ROOF_OUT = 'M66,726L390,444L714,726L714,766L390,484L66,766Z';
  function roof(g, R) {
    // cerobong (di belakang genteng)
    const ch = 'M522,600V478H566V600Z';
    const c = shape(g, ch, [522, 478, 44, 122], PAL.brick, R, { n: 16, dir: [1, 0], len: [8, 20], width: [3, 6], cast: 'cast' });
    for (let y = 486, k = 0; y < 600; y += 12, k++) { line(c.inner, `M522,${y}H566`, '#f2d8c4', 1.4, 0.55); for (let x = 522 + (k % 2) * 11; x < 566; x += 22) line(c.inner, `M${x},${y}v12`, '#f2d8c4', 1.2, 0.5); }
    el('rect', { x: 550, y: 478, width: 16, height: 122, fill: '#2a0a05', opacity: 0.25 }, c.inner);
    shape(g, rrect(514, 466, 60, 14, 3), [514, 466, 60, 14], ['#5a2a1a', '#8a4a32', '#c47a5a'], R, { n: 8, len: [10, 30], width: [2, 4], cast: 'cast' });
    el('path', { d: 'M524,466H564', stroke: '#1a0a05', 'stroke-width': 4, opacity: 0.6 }, g);
    // genteng
    const r = shape(g, ROOF_OUT, [66, 444, 648, 322], PAL.roof, R, { n: 120, dir: [1, 0.2], len: [16, 50], width: [3, 7], cast: 'castBig' });
    // deretan genteng mengikuti kemiringan
    for (let k = 1; k < 4; k++) {
      const off = k * 9;
      line(r.inner, `M66,${726 + off}L390,${444 + off}L714,${726 + off}`, PAL.roof[0], 1.6, 0.55);
    }
    for (let i = 0; i < 46; i++) {
      const t = i / 45, side = t < 0.5 ? -1 : 1, u = Math.abs(t - 0.5) * 2;
      const x = 390 + side * u * 324, y = 444 + u * 282;
      line(r.inner, `M${x},${y}l${-side * 4},${36}`, PAL.roof[0], 1.2, 0.45);
    }
    el('path', { d: ROOF_OUT, fill: linGrad(g, [[0, '#fff0d8', 0.22], [0.5, '#fff0d8', 0], [1, '#2a0a05', 0.25]], 66, 444, 714, 766) }, r.inner);
    line(g, 'M66,726L390,444L714,726', '#ffd2b0', 2.6, 0.75);
    // bubungan
    shape(g, rrect(372, 432, 36, 20, 6), [372, 432, 36, 20], PAL.roof, R, { n: 6, len: [6, 16], width: [3, 5], cast: 'cast' });
    mark(g, 390, 428, 0.5, '#f4e8d0', { core: '#e8b04a' });
    // lis berenda putih di bawah genteng
    const lace = el('g', { filter: 'url(#cast)' }, g);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 26; i++) {
        const t = (i + 0.5) / 26, x = 390 + side * (8 + t * 314), y = 488 + (8 + t * 314) * SL;
        const a = (side * Math.atan(SL) * 180) / Math.PI;
        el('path', { d: 'M-6,0A6,6 0 0 0 6,0Z', fill: '#fffaf0', transform: `translate(${x} ${y - 4}) rotate(${a})` }, lace);
        el('circle', { cx: 0, cy: 2.4, r: 1.2, fill: '#b9a88e', transform: `translate(${x} ${y - 4}) rotate(${a})` }, lace);
      }
    }
    line(g, 'M66,766L390,484L714,766', '#fffaf0', 4, 0.95);
    // kabel lampu untai: berayun di bawah lis, bohlamnya masih padam
    for (const side of [-1, 1]) {
      let d = '';
      for (let k = 0; k < 8; k++) {
        const t0 = k / 8, t1 = (k + 1) / 8, tm = (k + 0.5) / 8;
        const p = (t) => [390 + side * (324 - t * 320), 774 - t * 278];
        const [x0, y0] = p(t0), [x1, y1] = p(t1), [xm, ym] = p(tm);
        d += `${k ? '' : `M${x0},${y0}`}Q${xm},${ym + 24} ${x1},${y1}`;
        // bohlam padam di titik terendah ayunan
        el('ellipse', { cx: xm, cy: ym + 18, rx: 3.4, ry: 4.6, fill: '#d8d2c4', stroke: '#6a5a48', 'stroke-width': 1 }, g);
      }
      line(g, d, '#3a2a1e', 1.6, 0.85);
    }
  }

  /* ───────────── muka rumah (berlubang jendela) ───────────── */
  function shutter(g, R, x0, y0, x1, y1) {
    const s = shape(g, rect(x0, y0, x1, y1), [x0, y0, x1 - x0, y1 - y0], PAL.sage, R, { n: 8, dir: [0, 1], len: [10, 30], width: [2, 4], cast: 'cast' });
    for (let y = y0 + 6; y < y1 - 3; y += 6) line(s.inner, `M${x0 + 3},${y}H${x1 - 3}`, PAL.sage[0], 1.4, 0.7);
    for (let y = y0 + 7; y < y1 - 3; y += 6) line(s.inner, `M${x0 + 3},${y}H${x1 - 3}`, PAL.sage[2], 0.8, 0.6);
    line(s.inner, rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1), PAL.sage[0], 2, 0.6);
  }
  function frame(g, d, w, cols = PAL.trim) {
    el('path', { d, fill: 'none', stroke: INK, 'stroke-width': w + 2, opacity: 0.25, transform: 'translate(1.5 2)' }, g);
    el('path', { d, fill: 'none', stroke: cols[1], 'stroke-width': w, 'stroke-linejoin': 'round' }, g);
    el('path', { d, fill: 'none', stroke: cols[2], 'stroke-width': w * 0.3, transform: `translate(${-w * 0.2} ${-w * 0.2})`, opacity: 0.8 }, g);
  }
  /** kaca tipis di lubang jendela: semburat langit + kilau miring */
  function glass(g, d, box) {
    const [x, y, w, h] = box;
    el('path', { d, fill: linGrad(g, [[0, '#c8d4f0', 0.26], [0.5, '#e6c4d8', 0.14], [1, '#3a3a6a', 0.2]], x, y, x + w * 0.4, y + h) }, g);
    const c = clipG(g, d);
    el('path', { d: `M${x + w * 0.1},${y + h}L${x + w * 0.45},${y}H${x + w * 0.62}L${x + w * 0.27},${y + h}Z`, fill: '#ffffff', opacity: 0.16 }, c);
    el('path', { d: `M${x + w * 0.66},${y + h}L${x + w * 0.9},${y}H${x + w * 0.95}L${x + w * 0.71},${y + h}Z`, fill: '#ffffff', opacity: 0.12 }, c);
  }
  function flowerBox(g, R, x0, x1, y) {
    shape(g, rrect(x0, y, x1 - x0, 14, 3), [x0, y, x1 - x0, 14], PAL.terra, R, { n: 8, len: [10, 30], width: [2, 4], cast: 'cast' });
    for (let i = 0; i < (x1 - x0) / 7; i++) {
      const x = x0 + 4 + i * 7 + R() * 3;
      leaf(g, { len: 12 + R() * 6, w: 6, ...F.flora.GREEN[i % 4], R, n: 4, transform: `translate(${x} ${y + 2}) rotate(${-30 + R() * 60})`, cast: false, filter: 'impastoFine' });
      if (R() < 0.7) bloom(g, x + R() * 4 - 2, y - 6 - R() * 6, 2.6 + R() * 1.4, ['#e0457a', '#ff9fb2', '#ffffff', '#ffd35a'][Math.floor(R() * 4)]);
    }
  }
  function facade(g, R) {
    const holesD = [rect(...WIN.w1), rect(...WIN.w2), rect(...WIN.w3), ARCH, circ(...OCULUS), circ(390, 1092, 11)].join('');
    const outer = FACADE + holesD;
    // dinding plester krem (lantai bawah & atas)
    const p = holes(painted(g, outer, {
      base: linGrad(g, [[0, PAL.plaster[2]], [0.5, PAL.plaster[1]], [1, PAL.plaster[0]]], 106, 700, 674, 1202), n: 170, R, filter: 'impasto',
      stroke: () => { const x = 106 + R() * 568, y = 480 + R() * 722, L = 20 + R() * 60, a = (R() - 0.5) * 1.2; return { d: `M${x},${y}l${Math.cos(a) * L},${Math.sin(a) * L}`, color: jitter(mix(PAL.plaster[1], R() < 0.45 ? PAL.plaster[0] : PAL.plaster[2], R() * 0.7), 5, R), width: 6 + R() * 12, opacity: 0.3 + R() * 0.4 }; },
    }), outer);
    el('rect', { x: 106, y: 480, width: 568, height: 722, fill: kawung(g, '#c9a477', 52, 1.1), opacity: 0.1 }, p.inner);
    // segitiga atap: papan kayu hijau sage berdiri
    const gable = `M106,729L390,482L674,729V716H106Z`;
    const gb = holes(shape(g, gable + circ(...OCULUS), [106, 482, 568, 248], PAL.sage, R, { n: 48, dir: [0, 1], len: [30, 90], width: [4, 9], filter: 'impasto' }), gable + circ(...OCULUS));
    for (let x = 118; x < 670; x += 18) line(gb.inner, `M${x},480V716`, PAL.sage[0], 1.8, 0.55);
    for (let x = 119.5; x < 670; x += 18) line(gb.inner, `M${x},480V716`, PAL.sage[2], 1, 0.5);
    el('path', { d: gable, fill: linGrad(g, [[0, '#fff8e8', 0.2], [1, '#1a2a26', 0.25]], 106, 482, 674, 729) }, gb.inner);
    // bayangan lembut di bawah atap (tepi atas muka)
    const top = clipG(g, FACADE);
    el('path', { d: 'M106,729L390,482L674,729L674,760L390,513L106,760Z', fill: INK, opacity: 0.22, filter: 'url(#blur2)' }, top);
    // tiang sudut & list antar lantai
    for (const [x0, x1] of [[106, 124], [656, 674]]) {
      const q = shape(g, rect(x0, 716, x1, 1186), [x0, 716, 18, 470], PAL.trim, R, { n: 10, dir: [0, 1], len: [40, 120], width: [3, 6] });
      for (let y = 740; y < 1186; y += 44) line(q.inner, `M${x0},${y}H${x1}`, '#c9bfae', 1.4, 0.7);
    }
    const band = (y0, y1) => { const b = shape(g, rect(106, y0, 674, y1), [106, y0, 568, y1 - y0], PAL.trim, R, { n: 14, len: [60, 200], width: [3, 6], cast: 'cast' }); line(b.inner, `M106,${y0 + 1}H674`, '#ffffff', 2, 0.9); line(b.inner, `M106,${y1 - 1}H674`, '#b9ae9c', 2, 0.6); };
    band(704, 718);
    band(934, 950);
    // plint batu di kaki muka
    const plint = shape(g, rect(106, 1184, 674, 1202), [106, 1184, 568, 18], ['#9a9284', '#c4bcac', '#e2dccc'], R, { n: 16, len: [30, 80], width: [3, 6] });
    for (let x = 106; x < 674; x += 38) line(plint.inner, `M${x},1184V1202`, '#7a7265', 1.2, 0.5);
    // jendela bawah, jendela kamar, lengkung teras, mata sapi loteng
    for (const k of ['w1', 'w2', 'w3']) {
      const [x0, y0, x1, y1] = WIN[k];
      shutter(g, R, x0 - 24, y0 - 2, x0 - 2, y1 + 2);
      shutter(g, R, x1 + 2, y0 - 2, x1 + 24, y1 + 2);
      glass(g, rect(x0, y0, x1, y1), [x0, y0, x1 - x0, y1 - y0]);
      frame(g, rect(x0, y0, x1, y1), 7);
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      frame(g, `M${mx},${y0}V${y1}M${x0},${my}H${x1}`, 4);
      flowerBox(g, R, x0 - 6, x1 + 6, y1 + 2);
    }
    // ambang atas jendela (alis kecil)
    for (const k of ['w1', 'w2', 'w3']) { const [x0, y0, x1] = WIN[k]; shape(g, rect(x0 - 30, y0 - 12, x1 + 30, y0 - 4), [x0 - 30, y0 - 12, x1 - x0 + 60, 8], PAL.trim, R, { n: 6, len: [30, 80], width: [2, 4], cast: 'cast' }); }
    glass(g, ARCH, [470, 736, 140, 190]);
    frame(g, 'M470,926V806A70,70 0 0 1 610,806V926', 8);
    // pagar balkon teras (di depan lengkung)
    const rail = el('g', { filter: 'url(#cast)' }, g);
    for (let x = 478; x <= 602; x += 13) { el('path', { d: `M${x - 3},926V888Q${x - 5},896 ${x},884Q${x + 5},896 ${x + 3},888V926Z`, fill: '#fbf6ee', stroke: '#b9ae9c', 'stroke-width': 1 }, rail); }
    shape(g, rect(462, 878, 618, 888), [462, 878, 156, 10], PAL.trim, R, { n: 8, len: [30, 80], width: [2, 4], cast: 'cast' });
    shape(g, rect(462, 920, 618, 930), [462, 920, 156, 10], PAL.trim, R, { n: 8, len: [30, 80], width: [2, 4] });
    // pot gantung di sisi lengkung
    for (const x of [452, 628]) { line(g, `M${x},800V820`, '#5a3418', 1.4); shape(g, 'M' + (x - 10) + ',820H' + (x + 10) + 'L' + (x + 7) + ',838H' + (x - 7) + 'Z', [x - 10, 820, 20, 18], PAL.terra, R, { n: 4, len: [6, 14], width: [2, 3], cast: 'cast' }); for (let k = 0; k < 5; k++) leaf(g, { len: 22, w: 8, ...F.flora.GREEN[k % 4], R, n: 4, transform: `translate(${x} 822) rotate(${130 + k * 25})`, cast: false, filter: 'impastoFine' }); }
    glass(g, circ(...OCULUS), [356, 584, 68, 68]);
    frame(g, circ(OCULUS[0], OCULUS[1], OCULUS[2]), 8);
    frame(g, `M390,${584}V${652}M356,618H424`, 3.4);
    // hiasan ukir kamboja di atas mata sapi
    mark(g, 390, 560, 0.7, '#fffaf0', { core: '#e8b04a' });
    // pintu depan: hijau sage, berpanel, jendela bulat kecil, rangkaian bunga
    shade(g, 'M342,1198V1088A48,48 0 0 1 438,1088V1198Z', 0.3, 'blur2');
    frame(g, 'M346,1198V1090A44,44 0 0 1 434,1090V1198', 10);
    const door = holes(shape(g, DOOR + circ(390, 1092, 11), [352, 1052, 76, 144], PAL.sage, R, { n: 30, dir: [0, 1], len: [20, 60], width: [3, 7] }), DOOR + circ(390, 1092, 11));
    for (const [x0, y0, x1, y1] of [[362, 1120, 386, 1160], [394, 1120, 418, 1160], [362, 1166, 386, 1190], [394, 1166, 418, 1190]]) {
      line(door.inner, rect(x0, y0, x1, y1), PAL.sage[0], 2, 0.7);
      line(door.inner, `M${x0 + 1},${y1}V${y0 + 1}H${x1}`, PAL.sage[2], 1.2, 0.7);
    }
    el('rect', { x: 400, y: 1050, width: 30, height: 150, fill: linGrad(g, [[0, '#0a1a16', 0], [1, '#0a1a16', 0.3]], 400, 0, 430, 0) }, door.inner);
    glass(g, circ(390, 1092, 11), [379, 1081, 22, 22]);
    frame(g, circ(390, 1092, 11), 3.4, ['#7a5a20', PAL.brass.base, PAL.brass.hi]);
    brass(g, circ(418, 1140, 4), [414, 1136, 8, 8], R, { n: 3 });
    // rangkaian kamboja di pintu
    line(g, circ(390, 1128, 15), '#1f4a30', 6);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; leaf(g, { len: 11, w: 6, ...F.flora.GREEN[i % 4], R, n: 4, transform: `translate(${390 + Math.cos(a) * 15} ${1128 + Math.sin(a) * 15}) rotate(${(a * 180) / Math.PI + 160})`, cast: false, filter: 'impastoFine' }); }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.4; bloom(g, 390 + Math.cos(a) * 15, 1128 + Math.sin(a) * 15, 3.2, i % 2 ? '#fff4dc' : '#ffb3c4'); }
    line(g, 'M384,1146L380,1156M396,1146L400,1156', '#d0674a', 2.4);
    // anak tangga batu
    shape(g, rect(340, 1194, 440, 1202), [340, 1194, 100, 8], ['#8a8275', '#c9c0b0', '#e6dece'], R, { n: 6, len: [20, 60], width: [2, 4], cast: 'cast' });
    // papan nama di atas pintu (tulisannya dari DOM)
    const [sx0, sy0, sx1, sy1] = SIGN;
    for (const x of [sx0 + 40, sx1 - 40]) { el('circle', { cx: x, cy: 952, r: 4, fill: PAL.brass.base, stroke: PAL.brass.dark, 'stroke-width': 1 }, g); line(g, `M${x},952V${sy0 + 6}`, '#4a3418', 2.4); }
    shade(g, rrect(sx0 + 4, sy0 + 6, sx1 - sx0, sy1 - sy0, 8), 0.35, 'blur2');
    const sg = shape(g, rrect(sx0, sy0, sx1 - sx0, sy1 - sy0, 8), [sx0, sy0, sx1 - sx0, sy1 - sy0], PAL.wood, R, { n: 50, len: [40, 140], width: [3, 7] });
    for (let i = 0; i < 12; i++) { const y = sy0 + 6 + R() * (sy1 - sy0 - 12); line(sg.inner, `M${sx0 + R() * 60},${y}q${80 + R() * 80},${-3 + R() * 6} ${180 + R() * 120},${R() * 4}`, PAL.wood[0], 1, 0.35); }
    el('path', { d: rrect(sx0, sy0, sx1 - sx0, sy1 - sy0, 8), fill: linGrad(g, [[0, '#fff0d0', 0.18], [1, '#2a1208', 0.3]], sx0, sy0, sx1, sy1) }, sg.inner);
    line(g, rrect(sx0 + 7, sy0 + 7, sx1 - sx0 - 14, sy1 - sy0 - 14, 5), '#f4e3c0', 2, 0.7);
    line(g, rrect(sx0 + 8.4, sy0 + 8.6, sx1 - sx0 - 14, sy1 - sy0 - 14, 5), '#3a1d0a', 1.2, 0.5);
    for (const x of [sx0 + 22, sx1 - 22]) mark(g, x, (sy0 + sy1) / 2, 0.42, '#f4e3c0', { opacity: 0.85, core: '#e8b04a' });
    // lampu dinding (padam) di kiri pintu & bel pintu di kanan
    line(g, 'M330,1070H316V1078', '#2a1a0e', 3);
    shape(g, 'M306,1078H326L324,1084H308Z', [306, 1078, 20, 6], ['#1a120a', '#3a2a1a', '#6a5a40'], R, { n: 3, len: [4, 10], width: [1, 2] });
    el('path', { d: 'M308,1084H324L322,1108H310Z', fill: linGrad(g, [[0, '#f6eedc'], [1, '#cfc4ae']], 308, 1084, 324, 1108), stroke: '#2a1a0e', 'stroke-width': 2 }, g);
    line(g, 'M316,1084V1108', '#2a1a0e', 1.2, 0.7);
    shape(g, 'M306,1108H326L322,1114H310Z', [306, 1108, 20, 6], ['#1a120a', '#3a2a1a', '#6a5a40'], R, { n: 3, len: [4, 10], width: [1, 2], cast: 'cast' });
    brass(g, rrect(446, 1104, 16, 26, 4), [446, 1104, 16, 26], R, { n: 4 });
    el('circle', { cx: 454, cy: 1117, r: 4.6, fill: '#f4e8d0', stroke: PAL.brass.dark, 'stroke-width': 1.4 }, g);
    // engsel kuningan di tepi kanan & kait di tepi kiri
    for (const y of [770, 1130]) { brass(g, rrect(664, y, 12, 30, 2), [664, y, 12, 30], R, { n: 3 }); for (const yy of [y + 6, y + 24]) el('circle', { cx: 670, cy: yy, r: 1.6, fill: PAL.brass.deep }, g); }
    brass(g, rrect(104, 984, 12, 22, 3), [104, 984, 12, 22], R, { n: 3 });
    el('circle', { cx: 110, cy: 995, r: 3, fill: PAL.brass.deep }, g);
  }

  /* ───────────── isi kamar (lukisan menyala hangat; gelap/terang diatur CSS) ───────────── */
  /** kotak kamar berperspektif satu titik: dinding belakang, plafon, lantai, dua dinding samping */
  function box(g, R, [x0, y0, x1, y1], { inset = 24, top = 14, bot = 30, wall, side, ceil, floor, planks = true, tiles }) {
    const bx0 = x0 + inset, bx1 = x1 - inset, by0 = y0 + top, by1 = y1 - bot;
    const e = 10; // melebar ke bawah dinding supaya tidak ada celah
    const back = shape(g, rect(bx0, by0, bx1, by1), [bx0, by0, bx1 - bx0, by1 - by0], wall, R, { n: 50, dir: [0, 1], len: [20, 60], width: [5, 11] });
    const sl = shape(g, `M${x0 - e},${y0 - e}L${bx0},${by0}V${by1}L${x0 - e},${y1 + e}Z`, [x0 - e, y0 - e, inset + e, y1 - y0 + 2 * e], side, R, { n: 14, dir: [0, 1], len: [20, 60], width: [4, 8] });
    el('path', { d: `M${x0 - e},${y0 - e}L${bx0},${by0}V${by1}L${x0 - e},${y1 + e}Z`, fill: '#fff4d8', opacity: 0.12 }, sl.inner);
    const sr = shape(g, `M${x1 + e},${y0 - e}L${bx1},${by0}V${by1}L${x1 + e},${y1 + e}Z`, [bx1, y0 - e, inset + e, y1 - y0 + 2 * e], side, R, { n: 14, dir: [0, 1], len: [20, 60], width: [4, 8] });
    el('path', { d: `M${x1 + e},${y0 - e}L${bx1},${by0}V${by1}L${x1 + e},${y1 + e}Z`, fill: INK, opacity: 0.18 }, sr.inner);
    shape(g, `M${x0 - e},${y0 - e}H${x1 + e}L${bx1},${by0}H${bx0}Z`, [x0 - e, y0 - e, x1 - x0 + 2 * e, top + e], ceil, R, { n: 12, len: [30, 90], width: [3, 6] });
    const fl = shape(g, `M${x0 - e},${y1 + e}H${x1 + e}L${bx1},${by1}H${bx0}Z`, [x0 - e, by1, x1 - x0 + 2 * e, bot + e], floor, R, { n: 30, len: [30, 90], width: [3, 6] });
    if (planks) for (let i = 0; i <= 10; i++) { const u = i / 10; line(fl.inner, `M${bx0 + u * (bx1 - bx0)},${by1}L${x0 - e + u * (x1 - x0 + 2 * e)},${y1 + e}`, floor[0], 1.4, 0.55); }
    if (tiles) {
      for (let i = 0; i <= 8; i++) { const u = i / 8; line(fl.inner, `M${bx0 + u * (bx1 - bx0)},${by1}L${x0 - e + u * (x1 - x0 + 2 * e)},${y1 + e}`, tiles, 1.2, 0.6); }
      for (const v of [0.3, 0.62]) { const yy = by1 + v * (bot + e); line(fl.inner, `M${x0},${yy}H${x1}`, tiles, 1.2, 0.6); }
    }
    // pojok-pojok
    line(g, `M${bx0},${by0}V${by1}H${bx1}V${by0}`, INK, 1.6, 0.35);
    line(g, `M${x0 - e},${y0 - e}L${bx0},${by0}M${x1 + e},${y0 - e}L${bx1},${by0}M${x0 - e},${y1 + e}L${bx0},${by1}M${x1 + e},${y1 + e}L${bx1},${by1}`, INK, 1.4, 0.3);
    return { bx0, bx1, by0, by1, back };
  }
  /** cahaya lampu yang dilukis: terang di sekitar lampu, sudut-sudut kamar meredup */
  function lampLight(g, clip, cx, cy, r) {
    const c = clipG(g, clip);
    el('rect', { x: cx - r * 2, y: cy - r * 2, width: r * 4, height: r * 4, fill: radGrad(g, [[0, '#fff3cf', 0.35], [0.35, '#ffe2a8', 0.12], [0.7, INK, 0.12], [1, INK, 0.4]], cx, cy, r * 1.6) }, c);
  }
  function pendant(g, R, x, y0, y, cols, w = 22) {
    line(g, `M${x},${y0}V${y}`, '#2a1a0e', 1.6);
    const d = `M${x - w},${y + 18}C${x - w},${y + 4} ${x - 8},${y} ${x},${y}C${x + 8},${y} ${x + w},${y + 4} ${x + w},${y + 18}Z`;
    shape(g, d, [x - w, y, 2 * w, 18], cols, R, { n: 8, len: [6, 16], width: [2, 4], cast: 'cast' });
    el('ellipse', { cx: x, cy: y + 18, rx: w, ry: 3.4, fill: '#fff6d8' }, g);
    el('ellipse', { cx: x, cy: y + 20, rx: 6, ry: 4, fill: '#ffffff' }, g);
  }
  function photoNail(g, x, y, w, h) {
    // bekas paku & bayangan tipis bingkai (fotonya dipasang DOM)
    el('circle', { cx: x + w / 2, cy: y - 8, r: 1.8, fill: '#3a2a1e' }, g);
    line(g, `M${x + w * 0.2},${y}L${x + w / 2},${y - 8}L${x + w * 0.8},${y}`, '#3a2a1e', 0.8, 0.6);
  }
  function roomTamu(g, R) {
    const r = ROOMS.tamu;
    const b = box(g, R, r, { wall: ['#c99350', '#e7bb78', '#f7d8a2'], side: ['#b8823e', '#d9a865', '#eec58a'], ceil: ['#d8c8a8', '#efe2c8', '#fff6e0'], floor: PAL.oak });
    el('rect', { x: b.bx0, y: b.by0, width: b.bx1 - b.bx0, height: b.by1 - b.by0, fill: kawung(g, '#a8682c', 30, 1), opacity: 0.22 }, b.back.inner);
    // lis bawah dinding
    shape(g, rect(b.bx0, b.by1 - 8, b.bx1, b.by1), [b.bx0, b.by1 - 8, b.bx1 - b.bx0, 8], PAL.cream, R, { n: 6, len: [30, 80], width: [2, 4] });
    // permadani bulat
    const rug = oval(250, 1166, 92, 13);
    shape(g, rug, [158, 1150, 184, 30], ['#9a4a3a', '#c86a52', '#e8a080'], R, { n: 20, len: [20, 60], width: [3, 6] });
    el('path', { d: oval(250, 1166, 74, 9), fill: 'none', stroke: '#f4e3c0', 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: 0.8 }, g);
    // sofa terakota
    shade(g, rect(150, 1150, 300, 1162), 0.35, 'blur2');
    const back = 'M152,1118Q152,1092 178,1092H272Q298,1092 298,1118V1132H152Z';
    shape(g, back, [152, 1092, 146, 40], PAL.terra, R, { n: 20, len: [20, 50], width: [4, 8], cast: 'cast' });
    for (const x of [196, 254]) line(g, `M${x},1096V1128`, PAL.terra[0], 1.6, 0.5);
    shape(g, rrect(146, 1126, 158, 22, 8), [146, 1126, 158, 22], PAL.terra, R, { n: 18, len: [20, 50], width: [4, 8], cast: 'cast' });
    for (const x of [140, 296]) shape(g, rrect(x, 1110, 18, 40, 8), [x, 1110, 18, 40], PAL.terra, R, { n: 6, dir: [0, 1], len: [8, 20], width: [3, 5], cast: 'cast' });
    for (const x of [154, 290]) line(g, `M${x},1148V1160`, '#4a2a18', 3);
    // bantal kursi bermotif
    shape(g, rrect(168, 1102, 30, 26, 8), [168, 1102, 30, 26], ['#c9a040', '#ecc860', '#fbe6a0'], R, { n: 6, len: [6, 16], width: [3, 5], cast: 'cast' });
    shape(g, rrect(252, 1104, 28, 24, 8), [252, 1104, 28, 24], PAL.sage, R, { n: 6, len: [6, 16], width: [3, 5], cast: 'cast' });
    mark(g, 266, 1116, 0.4, '#f4e8d0', { core: '#e8b04a' });
    // meja kecil + cangkir teh
    shape(g, rrect(214, 1150, 74, 8, 3), [214, 1150, 74, 8], PAL.wood, R, { n: 6, len: [20, 50], width: [2, 4], cast: 'cast' });
    line(g, 'M222,1158V1176M280,1158V1176', '#4a2a18', 3);
    el('path', { d: 'M240,1142H254L252,1150H242Z', fill: '#fffaf0', stroke: '#9a8a70', 'stroke-width': 0.8 }, g);
    // jam dinding berbandul (bandulnya DOM)
    const ck = 'M306,994H336V1066L321,1076L306,1066Z';
    shape(g, ck, [306, 994, 30, 82], PAL.wood, R, { n: 10, dir: [0, 1], len: [10, 30], width: [3, 5], cast: 'cast' });
    el('circle', { cx: 321, cy: 1012, r: 11, fill: '#fffaf0', stroke: '#c99a3e', 'stroke-width': 2 }, g);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; el('circle', { cx: 321 + Math.cos(a) * 8, cy: 1012 + Math.sin(a) * 8, r: 0.8, fill: '#3a2a1e' }, g); }
    line(g, 'M321,1012L321,1005M321,1012L326,1014', '#2a1a0e', 1.4);
    el('path', { d: rect(311, 1030, 331, 1062), fill: '#3a2414' }, g);
    // pot monstera di pojok kanan
    shade(g, oval(352, 1178, 18, 4), 0.4, 'blur2');
    shape(g, 'M338,1150H366L362,1178H342Z', [338, 1150, 28, 28], PAL.terra, R, { n: 6, len: [6, 16], width: [2, 4], cast: 'cast' });
    for (let k = 0; k < 7; k++) leaf(g, { len: 34 + R() * 12, w: 22, ...F.flora.GREEN[k % 4], R, n: 8, transform: `translate(352 1150) rotate(${-80 + k * 26})`, filter: 'impastoFine' });
    // lampu gantung
    pendant(g, R, 254, 966, 996, ['#1d4a40', '#2f7262', '#5fa08c']);
    photoNail(g, 160, 1004, 56, 46);
    lampLight(g, rect(r[0] - 10, r[1] - 10, r[2] + 10, r[3] + 10), 254, 1020, 150);
  }
  function roomDapur(g, R) {
    const r = ROOMS.dapur;
    const b = box(g, R, r, { wall: ['#93bba5', '#bcdcc6', '#e0f0e0'], side: ['#83ab95', '#a8ccb6', '#cce6d2'], ceil: ['#d8c8a8', '#efe2c8', '#fff6e0'], floor: ['#7a3a26', '#b05a3c', '#d6866a'], planks: false, tiles: '#5a2414' });
    // ubin dinding bawah: krem dengan motif terakota
    const tl = shape(g, rect(b.bx0, 1088, b.bx1, b.by1), [b.bx0, 1088, b.bx1 - b.bx0, b.by1 - 1088], PAL.cream, R, { n: 14, len: [20, 60], width: [3, 6] });
    for (let x = b.bx0; x < b.bx1; x += 14) line(tl.inner, `M${x},1088V${b.by1}`, '#c9b896', 1, 0.7);
    for (let y = 1088; y < b.by1; y += 14) line(tl.inner, `M${b.bx0},${y}H${b.bx1}`, '#c9b896', 1, 0.7);
    for (let x = b.bx0 + 7; x < b.bx1; x += 28) for (let y = 1095; y < b.by1; y += 28) mark(tl.inner, x, y, 0.22, '#c86a52', { opacity: 0.6, core: '#e8b04a' });
    // jendela kecil di dinding belakang (langit di luar; tirainya DOM)
    const wn = rect(566, 992, 622, 1046);
    el('path', { d: wn, fill: linGrad(g, [[0, '#f6b88a'], [1, '#f9d8a8']], 0, 992, 0, 1046) }, g);
    frame(g, wn, 5);
    frame(g, 'M594,992V1046M566,1019H622', 3);
    // rak & toples
    shape(g, rect(426, 1068, 500, 1074), [426, 1068, 74, 6], PAL.wood, R, { n: 4, len: [20, 50], width: [2, 3], cast: 'cast' });
    const jars = [[434, '#e8a040'], [450, '#c86a52'], [466, '#9cc29a'], [484, '#f4e0b0']];
    jars.forEach(([x, c]) => { el('path', { d: rrect(x - 6, 1052, 12, 16, 3), fill: c, stroke: '#5a3418', 'stroke-width': 0.8 }, g); el('path', { d: rect(x - 6, 1049, x + 6, 1053), fill: '#c99a3e' }, g); el('rect', { x: x - 4, y: 1055, width: 2, height: 10, fill: '#fff', opacity: 0.45 }, g); });
    // meja dapur + kompor + teko di bawah jendela
    shape(g, rect(540, 1090, 634, 1100), [540, 1090, 94, 10], PAL.oak, R, { n: 6, len: [30, 80], width: [2, 4], cast: 'cast' });
    const cab = shape(g, rect(544, 1100, 630, 1152), [544, 1100, 86, 52], PAL.sage, R, { n: 12, dir: [0, 1], len: [10, 30], width: [3, 6], cast: 'cast' });
    line(cab.inner, 'M587,1100V1152', PAL.sage[0], 1.6, 0.7);
    for (const x of [580, 594]) el('circle', { cx: x, cy: 1124, r: 1.6, fill: PAL.brass.base }, g);
    el('path', { d: rrect(552, 1082, 52, 8, 2), fill: '#2a2a2e' }, g);
    for (const x of [566, 590]) el('ellipse', { cx: x, cy: 1084, rx: 9, ry: 2, fill: '#555', stroke: '#888', 'stroke-width': 0.8 }, g);
    // teko enamel (uapnya DOM)
    const kettle = 'M578,1082C574,1066 580,1058 592,1058C604,1058 610,1066 606,1082Z';
    shape(g, kettle, [574, 1056, 36, 26], ['#1d4a6a', '#2f6a92', '#6aa0c8'], R, { n: 8, len: [6, 16], width: [3, 5], cast: 'cast' });
    line(g, 'M606,1072C614,1068 616,1062 620,1058', '#2f6a92', 3);
    line(g, 'M584,1060C584,1050 600,1050 600,1060', '#2a2a2e', 1.8);
    for (let i = 0; i < 6; i++) el('circle', { cx: 582 + R() * 22, cy: 1064 + R() * 14, r: 1.2, fill: '#fff', opacity: 0.8 }, g);
    // meja makan kecil + dua kursi
    shade(g, oval(462, 1174, 44, 5), 0.35, 'blur2');
    shape(g, rrect(424, 1124, 78, 8, 3), [424, 1124, 78, 8], PAL.oak, R, { n: 6, len: [20, 50], width: [2, 4], cast: 'cast' });
    line(g, 'M432,1132V1170M494,1132V1170', '#6a4428', 3);
    el('path', { d: 'M450,1116C446,1110 452,1104 458,1108C464,1104 470,1110 466,1116Z', fill: '#e8a040' }, g);
    el('path', { d: rect(440, 1118, 482, 1124), fill: '#fffaf0', opacity: 0.9 }, g);
    for (const x of [414, 506]) { line(g, `M${x},1110V1172`, '#6a4428', 3); line(g, `M${x - 8},1140H${x + 8}`, '#8a5a32', 4); line(g, `M${x + (x < 460 ? -8 : 8)},1140V1172`, '#6a4428', 3); }
    pendant(g, R, 515, 966, 994, ['#8a2a1a', '#c8553a', '#ee8a6a'], 20);
    photoNail(g, 432, 998, 52, 42);
    lampLight(g, rect(r[0] - 10, r[1] - 10, r[2] + 10, r[3] + 10), 515, 1018, 150);
  }
  function roomKamar(g, R) {
    const r = ROOMS.kamar;
    const b = box(g, R, r, { wall: ['#c49cb0', '#e4c2cc', '#f6e0e4'], side: ['#b48ca0', '#d4b0bc', '#ebd0d8'], ceil: ['#d8c8a8', '#efe2c8', '#fff6e0'], floor: PAL.oak });
    for (let i = 0; i < 40; i++) { const x = b.bx0 + 6 + R() * (b.bx1 - b.bx0 - 12), y = b.by0 + 6 + R() * (b.by1 - b.by0 - 12); mark(b.back.inner, x, y, 0.16, '#fffaf6', { opacity: 0.7, core: '#e8b04a' }); }
    // jendela belakang + langit senja (tirainya DOM)
    const wn = rect(168, 744, 240, 808);
    el('path', { d: wn, fill: linGrad(g, [[0, '#8a6aa0'], [0.6, '#e48a8c'], [1, '#f6b888']], 0, 744, 0, 808) }, g);
    for (let i = 0; i < 6; i++) el('circle', { cx: 172 + R() * 64, cy: 748 + R() * 24, r: 0.9, fill: '#fff', opacity: 0.8 }, g);
    frame(g, wn, 5);
    frame(g, 'M204,744V808M168,776H240', 3);
    // tempat tidur: sandaran kayu, bantal, selimut perca
    shade(g, rect(146, 906, 300, 920), 0.35, 'blur2');
    shape(g, 'M150,880V838Q150,824 166,824H284Q300,824 300,838V880Z', [150, 824, 150, 56], PAL.wood, R, { n: 12, dir: [1, 0], len: [20, 60], width: [3, 6], cast: 'cast' });
    line(g, 'M160,836H290', '#c99662', 1.6, 0.6);
    for (const x of [164, 228]) shape(g, rrect(x, 852, 56, 20, 9), [x, 852, 56, 20], PAL.cream, R, { n: 8, len: [10, 30], width: [3, 6], cast: 'cast' });
    const quilt = 'M144,872H306L312,920H138Z';
    const q = shape(g, quilt, [138, 872, 174, 48], ['#b0563c', '#d77a56', '#f0a880'], R, { n: 16, len: [10, 30], width: [3, 6], cast: 'cast' });
    const patch = [['#e8b04a', 0], ['#4c8378', 1], ['#f4e8d0', 2], ['#c86a52', 3]];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { const c = patch[(i + j * 2) % 4][0]; const x = 144 + i * 28 - j * 3, y = 876 + j * 22; el('path', { d: rect(x, y, x + 26, y + 20), fill: c, opacity: 0.7 }, q.inner); }
    el('rect', { x: 138, y: 872, width: 174, height: 48, fill: kawung(g, '#fffaf0', 22, 0.8), opacity: 0.35 }, q.inner);
    line(g, 'M144,874H306', '#fffaf0', 2, 0.6);
    // meja samping + lampu meja (sumber cahaya kamar ini)
    shape(g, rect(312, 868, 352, 904), [312, 868, 40, 36], PAL.wood, R, { n: 6, dir: [0, 1], len: [8, 20], width: [2, 4], cast: 'cast' });
    line(g, 'M312,884H352', '#3a1d0a', 1.2, 0.6);
    el('circle', { cx: 332, cy: 894, r: 1.6, fill: PAL.brass.base }, g);
    line(g, 'M332,868V850', '#5a3418', 2.4);
    el('path', { d: 'M332,868H322L326,864H338L342,868Z', fill: '#5a3418' }, g);
    shape(g, 'M318,850H346L340,828H324Z', [318, 828, 28, 22], ['#c9a040', '#f0cc70', '#fff0b8'], R, { n: 6, len: [6, 16], width: [2, 4], cast: 'cast' });
    // buku & kacamata di meja
    el('path', { d: rect(340, 862, 352, 868), fill: '#4c8378' }, g);
    photoNail(g, 252, 752, 48, 42);
    lampLight(g, rect(r[0] - 10, r[1] - 10, r[2] + 10, r[3] + 10), 332, 850, 130);
  }
  function roomTeras(g, R) {
    const r = ROOMS.teras;
    const b = box(g, R, r, { wall: ['#d9a070', '#f0c49a', '#fbe0c0'], side: ['#c8905e', '#e2b488', '#f2d0aa'], ceil: ['#8a5a32', '#b07a4a', '#d6a372'], floor: ['#9a4a2e', '#c4664a', '#e8967a'], planks: false, tiles: '#6a2a18' });
    // teralis bambu dengan melati merambat
    const lat = el('g', {}, g);
    for (let x = b.bx0 + 6; x < b.bx1; x += 22) { line(lat, `M${x},${b.by0}L${x + 40},${b.by1}`, '#8a6a3a', 2.4, 0.6); line(lat, `M${x + 40},${b.by0}L${x},${b.by1}`, '#8a6a3a', 2.4, 0.6); }
    line(g, `M${b.bx0},${b.by0 + 2}H${b.bx1}`, '#6a4a28', 4, 0.6);
    for (let i = 0; i < 26; i++) { const x = b.bx0 + 4 + R() * (b.bx1 - b.bx0 - 8), y = b.by0 + 4 + Math.pow(R(), 1.6) * (b.by1 - b.by0 - 40); leaf(g, { len: 12 + R() * 6, w: 7, ...F.flora.GREEN[i % 4], R, n: 4, transform: `translate(${x} ${y}) rotate(${R() * 360})`, cast: false, filter: 'impastoFine' }); if (R() < 0.6) bloom(g, x + 4, y + 2, 2.4, '#ffffff'); }
    // kursi rotan merak
    shade(g, oval(462, 922, 36, 5), 0.4, 'blur2');
    const chair = 'M462,904C430,904 422,860 430,830C438,796 486,796 494,830C502,860 494,904 462,904Z';
    const ch = shape(g, chair, [422, 796, 80, 108], ['#9a6a2e', '#c8964e', '#ecc480'], R, { n: 20, len: [8, 20], width: [2, 4], cast: 'cast' });
    for (let k = 0; k < 9; k++) line(ch.inner, `M462,900Q${430 + k * 8},850 ${428 + k * 9},800`, '#8a5a22', 1, 0.5);
    shape(g, rrect(444, 876, 36, 14, 6), [444, 876, 36, 14], PAL.cream, R, { n: 6, len: [6, 16], width: [3, 5], cast: 'cast' });
    line(g, 'M448,904L442,924M476,904L482,924', '#8a5a22', 3);
    // pakis gantung di kiri
    line(g, 'M426,736V760', '#5a3418', 1.4);
    shape(g, 'M414,760H438L434,776H418Z', [414, 760, 24, 16], PAL.terra, R, { n: 4, len: [6, 14], width: [2, 3], cast: 'cast' });
    for (let k = 0; k < 9; k++) leaf(g, { len: 30 + R() * 12, w: 9, ...F.flora.GREEN[k % 4], R, n: 5, transform: `translate(426 764) rotate(${100 + k * 20})`, cast: false, filter: 'impastoFine' });
    // monstera dalam pot besar di kanan
    shade(g, oval(612, 924, 26, 5), 0.4, 'blur2');
    shape(g, 'M592,884H632L626,922H598Z', [592, 884, 40, 38], ['#6e3020', '#a8543a', '#d68a6a'], R, { n: 6, len: [8, 20], width: [2, 4], cast: 'cast' });
    for (let k = 0; k < 8; k++) leaf(g, { len: 50 + R() * 20, w: 30, ...F.flora.GREEN[k % 4], R, n: 10, transform: `translate(612 884) rotate(${-90 + k * 24})`, filter: 'impastoFine', curve: 0.1 });
    // meja kecil + radio
    shape(g, rrect(516, 880, 50, 6, 2), [516, 880, 50, 6], PAL.wood, R, { n: 4, len: [10, 30], width: [2, 3], cast: 'cast' });
    line(g, 'M522,886V922M560,886V922', '#4a2a18', 2.6);
    shape(g, rrect(524, 862, 34, 18, 4), [524, 862, 34, 18], ['#8a2a1a', '#c8553a', '#ee8a6a'], R, { n: 4, len: [6, 14], width: [2, 3], cast: 'cast' });
    el('circle', { cx: 534, cy: 871, r: 5, fill: '#f4e3c0', stroke: '#5a2a1a', 'stroke-width': 1 }, g);
    line(g, 'M546,866H554M546,870H554M546,874H554', '#5a2a1a', 1, 0.7);
    line(g, 'M552,862L560,848', '#3a2a1e', 1.2);
    // lampu gantung rotan
    line(g, `M527,${b.by0 - 14}V756`, '#2a1a0e', 1.6);
    const lamp = 'M509,770C509,752 545,752 545,770C545,782 509,782 509,770Z';
    const lp = shape(g, lamp, [509, 754, 36, 28], ['#9a6a2e', '#c8964e', '#ecc480'], R, { n: 8, len: [6, 14], width: [2, 3], cast: 'cast' });
    for (let k = 0; k < 6; k++) line(lp.inner, `M${511 + k * 6},756Q${515 + k * 6},770 ${511 + k * 6},784`, '#7a4a1a', 1, 0.6);
    el('ellipse', { cx: 527, cy: 780, rx: 8, ry: 3, fill: '#fff6d8' }, g);
    photoNail(g, 546, 802, 44, 36);
    lampLight(g, rect(r[0] - 10, r[1] - 10, r[2] + 10, r[3] + 10), 527, 786, 140);
  }
  function roomLoteng(g, R) {
    // dinding papan miring + lantai papan
    const c = clipG(g, 'M120,712H660L390,470Z');
    const back = 'M168,690H612L390,512Z';
    shape(c, 'M110,720H670L390,470Z', [110, 470, 560, 250], ['#7a4a2a', '#a06a42', '#c8925e'], R, { n: 40, dir: [0, 1], len: [20, 60], width: [4, 8] });
    const bw = shape(c, back, [168, 512, 444, 178], PAL.oak, R, { n: 40, dir: [0, 1], len: [20, 60], width: [4, 8] });
    for (let x = 176; x < 612; x += 20) line(bw.inner, `M${x},500V690`, '#8a5a32', 1.6, 0.55);
    const fl = shape(c, 'M110,712H670L612,690H168Z', [110, 690, 560, 22], PAL.wood, R, { n: 14, len: [30, 80], width: [3, 6] });
    for (let i = 0; i <= 10; i++) { const u = i / 10; line(fl.inner, `M${168 + u * 444},690L${110 + u * 560},712`, '#3a1d0a', 1.2, 0.5); }
    line(c, 'M168,690L390,512L612,690', INK, 1.6, 0.35);
    // kasau
    for (const x of [250, 530]) { const y = 486 + Math.abs(390 - x) * SL; line(c, `M${x},${y}L${x + (x < 390 ? 30 : -30)},${y + 30}`, '#5a3418', 6, 0.6); }
    // jendela bulat kecil di dinding belakang (bulan di luar)
    el('circle', { cx: 390, cy: 600, r: 16, fill: '#3a3a70' }, c);
    el('circle', { cx: 395, cy: 596, r: 5, fill: '#fff1c4' }, c);
    frame(c, circ(390, 600, 16), 4);
    // koper tua, kardus bertumpuk, kuda-kudaan kayu
    shade(c, oval(220, 692, 50, 5), 0.4, 'blur2');
    const trunk = shape(c, rrect(176, 652, 90, 40, 6), [176, 652, 90, 40], ['#5a2a1a', '#8a4a2a', '#b8704a'], R, { n: 10, len: [20, 50], width: [3, 6], cast: 'cast' });
    line(trunk.inner, 'M176,666H266', '#c99a3e', 3, 0.8);
    for (const x of [196, 246]) line(trunk.inner, `M${x},652V692`, '#c99a3e', 3, 0.8);
    el('rect', { x: 216, y: 660, width: 10, height: 10, rx: 2, fill: PAL.brass.base }, c);
    shade(c, oval(560, 692, 46, 5), 0.4, 'blur2');
    for (const [x, y, w, h] of [[520, 650, 70, 42], [532, 616, 50, 34], [586, 664, 30, 28]]) {
      const bx = shape(c, rect(x, y, x + w, y + h), [x, y, w, h], ['#a07a4a', '#c9a070', '#e8c898'], R, { n: 6, len: [10, 30], width: [2, 4], cast: 'cast' });
      line(bx.inner, `M${x + w / 2},${y}V${y + h}`, '#8a6a3a', 1.6, 0.6);
    }
    // kuda-kudaan
    const hz = at(c, 'translate(300 660)');
    line(hz, 'M0,30Q30,40 60,30', '#8a4a2a', 4);
    shape(hz, 'M10,22H48Q52,10 46,6L54,-8Q46,-14 40,-6L36,6H14Q8,6 8,14Z', [8, -14, 46, 36], ['#a83a2a', '#d65a40', '#f08a6a'], R, { n: 6, len: [6, 14], width: [2, 3], cast: 'cast' });
    line(hz, 'M14,22V30M44,22V30', '#5a2a1a', 3);
    el('circle', { cx: 48, cy: -5, r: 1.4, fill: '#1a0a05' }, hz);
    // untaian bendera kain
    line(c, 'M210,560Q300,600 390,566Q480,600 570,560', '#5a3418', 1, 0.8);
    for (let i = 0; i < 12; i++) { const t = (i + 0.5) / 12, x = 210 + t * 360, y = (t < 0.5 ? 560 + Math.sin(t * 2 * Math.PI) * 28 : 566 + Math.sin((t - 0.5) * 2 * Math.PI) * 28) + 2; el('path', { d: `M${x - 6},${y}H${x + 6}L${x},${y + 12}Z`, fill: ['#e8b04a', '#c86a52', '#4c8378', '#f4e8d0'][i % 4] }, c); }
    photoNail(c, 432, 624, 44, 38);
    lampLight(g, 'M120,712H660L390,470Z', 390, 600, 150);
  }
  function interior(g, R) {
    // dinding belakang rumah di balik semua kamar (mengisi celah)
    el('path', { d: 'M100,1206H680V724L390,474L100,724Z', fill: '#3a2418' }, g);
    roomLoteng(g, R);
    roomKamar(g, R);
    roomTeras(g, R);
    roomTamu(g, R);
    roomDapur(g, R);
  }

  /* ───────────── benda kecil: tirai, bohlam loteng, asap hati, bulan ───────────── */
  function curtain(g, R) {
    // tirai renda krem terikat (40×70), menggantung dari atas
    const d = 'M2,0H38C36,20 30,34 24,44C30,54 34,62 36,70H8C10,60 14,52 18,44C10,34 4,20 2,0Z';
    const c = shape(g, d, [0, 0, 40, 70], PAL.cream, R, { n: 16, dir: [0, 1], len: [10, 30], width: [2, 5], cast: 'cast' });
    for (const x of [10, 18, 26, 32]) line(c.inner, `M${x},0Q${x - 2},24 ${21},44`, '#c9b896', 1, 0.6);
    for (let i = 0; i < 12; i++) el('circle', { cx: 6 + R() * 28, cy: 4 + R() * 36, r: 1, fill: '#d0674a', opacity: 0.6 }, c.inner);
    el('path', { d: 'M14,42H28V47H14Z', fill: '#d0674a' }, g);
    line(g, 'M0,1H40', '#8a5a32', 3);
  }
  function bulb(g, R) {
    // kabel dari bubungan + bohlam bening (30×110, poros ayun di 15,0)
    line(g, 'M15,0V74', '#2a1a0e', 1.6);
    el('path', { d: 'M10,74H20V84H10Z', fill: '#8a7a5a', stroke: '#4a3a2a', 'stroke-width': 0.8 }, g);
    for (const y of [76, 79, 82]) line(g, `M10,${y}H20`, '#4a3a2a', 0.8, 0.7);
    const bd = 'M10,84C2,92 2,106 15,108C28,106 28,92 20,84Z';
    el('path', { d: bd, fill: radGrad(g, [[0, '#ffffff', 0.9], [0.6, '#f4eedc', 0.75], [1, '#c9c0a8', 0.8]], 12, 94, 16), stroke: '#8a8270', 'stroke-width': 1 }, g);
    line(g, 'M11,90L13,94L15,90L17,94L19,90', '#8a7a5a', 0.8, 0.8);
    el('ellipse', { cx: 11, cy: 92, rx: 2, ry: 4, fill: '#fff', opacity: 0.8 }, g);
  }
  function heart(g, R) {
    // kepulan asap berbentuk hati (100×94, berpusat di 50,47): gumpalan lembut di sepanjang tepi
    const d = 'M50,82C22,64 10,48 12,34C14,20 28,14 38,20C44,24 48,29 50,32C52,29 56,24 62,20C72,14 86,20 88,34C90,48 78,64 50,82Z';
    el('path', { d, fill: '#ffffff', opacity: 0.35, filter: 'url(#soft)' }, g);
    const pf = el('g', { filter: 'url(#blur2)' }, g);
    el('path', { d, fill: '#fbf8fb' }, pf);
    const pts = [[18, 40], [14, 30], [22, 20], [33, 17], [44, 24], [56, 24], [67, 17], [78, 20], [86, 30], [83, 42], [76, 54], [66, 66], [58, 75], [42, 75], [34, 66], [24, 54]];
    pts.forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 7 + R() * 4, fill: i > 9 && i < 13 ? '#e8e0ee' : '#ffffff', opacity: 0.95 }, pf));
    el('path', { d: 'M54,70C66,60 78,50 80,38', fill: 'none', stroke: '#d6cce0', 'stroke-width': 9, opacity: 0.6 }, pf);
    line(g, 'M24,30C26,24 32,22 36,24', '#ffffff', 3.4, 0.9, { filter: 'url(#blur2)' });
  }
  function moon(g, R) {
    el('circle', { cx: 55, cy: 55, r: 50, fill: '#fff3c8', opacity: 0.25, filter: 'url(#soft)' }, g);
    const d = 'M70,18C48,12 24,28 22,52C20,78 42,96 68,92C48,84 38,68 39,52C40,36 52,22 70,18Z';
    shape(g, d, [20, 12, 52, 84], ['#e8cf8a', '#fff1c4', '#fffbe8'], R, { n: 16, dir: [0.3, 1], len: [8, 20], width: [3, 6] });
    for (const [x, y, r] of [[32, 48, 3.4], [36, 68, 2.6], [29, 60, 1.8]]) el('circle', { cx: x, cy: y, r, fill: '#e2c47c', opacity: 0.6 }, g);
  }

  /* ───────────── adegan dekat: depan pintu (game & keset) ───────────── */
  const TW = 780, TH = 1300;
  /** lantai teras dekat: perspektif ke titik (390, 300) */
  const nearFloor = (x0, y) => 390 + (x0 - 390) * (y - 300) / (900 - 300);
  function doorstep(g, R) {
    // dinding krem di malam hari, disinari lampu teras
    const wall = shape(g, rect(-20, -20, TW + 20, 900), [-20, -20, TW + 40, 920], ['#8a7a6a', '#b8a48e', '#d8c4a8'], R, { n: 160, len: [30, 90], width: [10, 24], dir: [0.3, 1], filter: 'impasto' });
    el('rect', { x: -20, y: -20, width: TW + 40, height: 920, fill: kawung(g, '#8a7458', 90, 1.6), opacity: 0.12 }, wall.inner);
    // pintu besar (bagian bawahnya)
    const dx0 = 210, dx1 = 570;
    shade(g, rect(dx0 + 10, -20, dx1 + 24, 900), 0.4, 'soft');
    frame(g, `M${dx0 - 16},-20V880M${dx1 + 16},-20V880`, 24, ['#a89a88', '#e6dccc', '#fffaf0']);
    const dr = shape(g, rect(dx0, -20, dx1, 880), [dx0, -20, dx1 - dx0, 900], ['#1d3e38', '#356a60', '#6aa494'], R, { n: 70, dir: [0, 1], len: [60, 160], width: [8, 16], filter: 'impasto' });
    for (const [x0, y0, x1, y1] of [[236, 40, 378, 400], [402, 40, 544, 400], [236, 440, 378, 840], [402, 440, 544, 840]]) {
      line(dr.inner, rect(x0, y0, x1, y1), '#12302a', 6, 0.7);
      line(dr.inner, `M${x0 + 3},${y1}V${y0 + 3}H${x1}`, '#8ac4b2', 3, 0.6);
    }
    el('rect', { x: 440, y: -20, width: 130, height: 900, fill: linGrad(g, [[0, '#06140f', 0], [1, '#06140f', 0.4]], 440, 0, 570, 0) }, dr.inner);
    brass(g, circ(530, 420, 16), [514, 404, 32, 32], R, { n: 6 });
    brass(g, rrect(370, 700, 40, 14, 4), [370, 700, 40, 14], R, { n: 4 });
    // ambang pintu
    shape(g, rect(dx0 - 30, 868, dx1 + 30, 900), [dx0 - 30, 868, dx1 - dx0 + 60, 32], ['#8a8275', '#c9c0b0', '#e6dece'], R, { n: 16, len: [40, 120], width: [4, 8], cast: 'castBig' });
    // lantai ubin teras berperspektif
    const fl = shape(g, rect(-20, 900, TW + 20, TH + 20), [-20, 900, TW + 40, TH - 880], ['#7a3a26', '#a8553a', '#d08060'], R, { n: 120, len: [30, 90], width: [6, 14], filter: 'impastoH' });
    for (let x0 = -600; x0 <= 1400; x0 += 90) line(fl.inner, `M${nearFloor(x0, 900)},900L${nearFloor(x0, TH + 20)},${TH + 20}`, '#4a1c10', 2.4, 0.55);
    for (const y of [960, 1040, 1140, 1260]) line(fl.inner, `M-20,${y}H${TW + 20}`, '#4a1c10', 2.4, 0.55);
    el('rect', { x: -20, y: 900, width: TW + 40, height: 60, fill: linGrad(g, [[0, '#1a0a05', 0.45], [1, '#1a0a05', 0]], 0, 900, 0, 960) }, fl.inner);
    // lampu teras menyala di kiri, kolam cahaya hangat
    el('circle', { cx: 110, cy: 300, r: 460, fill: radGrad(g, [[0, '#ffe4a8', 0.55], [0.4, '#ffc880', 0.2], [1, '#ffc880', 0]], 110, 300, 460) }, g);
    line(g, 'M120,210H92V236', '#1a120a', 8);
    shape(g, 'M64,236H120L114,252H70Z', [64, 236, 56, 16], ['#1a120a', '#3a2a1a', '#6a5a40'], R, { n: 4, len: [10, 20], width: [2, 4] });
    el('path', { d: 'M70,252H114L108,320H76Z', fill: radGrad(g, [[0, '#fffbe8'], [0.6, '#ffe7a6'], [1, '#f6b860']], 92, 280, 50), stroke: '#1a120a', 'stroke-width': 5 }, g);
    line(g, 'M92,252V320', '#1a120a', 3, 0.7);
    shape(g, 'M64,320H120L112,334H72Z', [64, 320, 56, 14], ['#1a120a', '#3a2a1a', '#6a5a40'], R, { n: 4, len: [10, 20], width: [2, 4], cast: 'cast' });
    // dahan kamboja yang menjuntai dari kanan atas
    const br = at(g, 'translate(0 0)');
    line(br, 'M800,40C740,70 700,90 650,96C620,100 600,110 590,126', '#6a5446', 14);
    line(br, 'M690,86C682,110 676,130 668,150', '#6a5446', 9);
    for (const [x, y, rot] of [[590, 126, 150], [668, 150, 170], [740, 70, 120]]) {
      for (let k = 0; k < 6; k++) leaf(br, { len: 110 + R() * 40, w: 38, ...F.flora.GREEN[k % 4], R, n: 12, transform: `translate(${x} ${y}) rotate(${rot - 80 + k * 30})` });
      F.flora.flowers.kamboja(at(br, `translate(${x - 6} ${y - 8})`), R, 0.3);
      F.flora.flowers.kambojaPink(at(br, `translate(${x + 26} ${y + 14}) rotate(30)`), R, 0.24);
    }
    // pot pakis di kiri & keranjang rotan kosong di kanan (tempat kucing pindah)
    shade(g, oval(90, 1004, 90, 16), 0.45, 'soft');
    shape(g, 'M20,840H160L144,1000H36Z', [20, 840, 140, 160], PAL.terra, R, { n: 24, dir: [0.2, 1], len: [20, 60], width: [5, 10], cast: 'castBig' });
    line(g, 'M28,870H152', '#fff1e6', 3, 0.5, { 'stroke-dasharray': '10 8' });
    for (let k = 0; k < 12; k++) leaf(g, { len: 150 + R() * 60, w: 40, ...F.flora.GREEN[k % 4], R, n: 14, transform: `translate(90 846) rotate(${-110 + k * 20})`, filter: 'impastoFine' });
    shade(g, oval(632, 1018, 90, 16), 0.45, 'soft');
    const bk = shape(g, 'M550,930C550,1004 570,1022 632,1022C694,1022 714,1004 714,930Z', [550, 930, 164, 92], ['#8a5a22', '#c08a46', '#e8bc7a'], R, { n: 30, len: [10, 30], width: [3, 6], cast: 'castBig' });
    for (let y = 944; y < 1022; y += 12) line(bk.inner, `M550,${y}Q632,${y + 14} 714,${y}`, '#6a3a12', 1.8, 0.5);
    for (let x = 562; x < 714; x += 14) line(bk.inner, `M${x},930V1022`, '#6a3a12', 1.2, 0.35);
    el('path', { d: oval(632, 930, 82, 16), fill: '#3a2210' }, g);
    shape(g, oval(632, 932, 70, 11), [562, 920, 140, 22], PAL.cream, R, { n: 10, len: [20, 50], width: [3, 6] });
    el('path', { d: oval(632, 930, 82, 16), fill: 'none', stroke: '#c08a46', 'stroke-width': 7 }, g);
    // gelap malam di pinggir
    el('rect', { x: -20, y: -20, width: TW + 40, height: TH + 40, fill: radGrad(g, [[0, '#0a0e24', 0], [0.55, '#0a0e24', 0.15], [1, '#0a0e24', 0.65]], 300, 600, 900) }, g);
  }
  function doormat(g, R) {
    // keset sabut (460×180) berperspektif, motif kamboja & kawung
    const d = 'M70,10H390L450,170H10Z';
    shade(g, 'M60,30H400L470,182H0Z', 0.45, 'soft');
    const m = shape(g, d, [10, 10, 440, 160], ['#7a4a1a', '#b8823e', '#e0b070'], R, { n: 140, dir: [0.05, 1], len: [6, 16], width: [2, 4], filter: 'impastoFine' });
    for (let i = 0; i < 60; i++) { const y = 14 + i * 2.6; line(m.inner, `M0,${y}H460`, '#6a3a12', 0.8, 0.25); }
    line(m.inner, 'M82,24H378L428,156H32Z', '#5a2a0a', 6, 0.6);
    line(m.inner, 'M92,34H368L412,146H48Z', '#f4e3c0', 2.4, 0.5);
    mark(m.inner, 230, 92, 2.2, '#5a2a0a', { opacity: 0.6, squash: 0.62, core: '#c8553a' });
    for (const x of [120, 340]) mark(m.inner, x, 92, 1, '#5a2a0a', { opacity: 0.45, squash: 0.62, core: '#5a2a0a' });
    el('path', { d, fill: linGrad(g, [[0, '#000', 0.25], [0.3, '#000', 0], [1, '#000', 0.2]], 0, 10, 0, 170) }, m.inner);
    for (let x = 14; x < 450; x += 7) line(g, `M${x},170l${(R() - 0.5) * 4},${6 + R() * 5}`, '#8a5a22', 2, 0.8);
  }
  function letter(g, R) {
    el('path', { d: rrect(22, 30, 280, 176, 8), fill: '#2a0a18', opacity: 0.4, filter: 'url(#soft)', transform: 'translate(6 10)' }, g);
    const p = shape(g, rrect(20, 26, 280, 172, 6), [20, 26, 280, 172], PAL.cream, R, { n: 50, len: [40, 120], width: [8, 18] });
    el('path', { d: rrect(20, 26, 280, 172, 6), fill: kawung(g, '#c9a877', 40, 1.1), opacity: 0.2 }, p.inner);
    el('path', { d: 'M20,84H300M20,142H300', stroke: '#b89668', 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, p.inner);
    el('path', { d: 'M20,86H300M20,144H300', stroke: '#ffffff', 'stroke-width': 1.4, 'stroke-opacity': 0.8 }, p.inner);
    el('path', { d: 'M20,26H300V84H20Z', fill: '#8a6a44', opacity: 0.08 }, p.inner);
    shape(g, 'M146,20H174V204H146Z', [146, 20, 28, 184], PAL.terra, R, { n: 16, dir: [0, 1], len: [20, 60], width: [3, 6], cast: 'cast' });
    const seal = 'M160,86C182,82 198,98 200,116C204,138 188,156 164,158C142,160 122,146 120,124C118,102 136,88 160,86Z';
    shape(g, seal, [118, 82, 86, 78], ['#7a2a14', '#b8452a', '#e07a5a'], R, { n: 20, len: [10, 30], width: [4, 9], cast: 'cast' });
    el('circle', { cx: 160, cy: 122, r: 26, fill: 'none', stroke: '#6a2010', 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, g);
    mark(g, 160, 123, 1.05, '#6a2010', { core: '#ffb090' });
    line(g, 'M140,98C146,92 156,90 164,92', '#ffc0a8', 2.6, 0.7);
    F.flora.flowers.kamboja(at(g, 'translate(270 50) rotate(24) scale(1 0.85)'), R, 0.13);
  }
  /** kucing oren meringkuk tidur (300×200); wajahnya DOM */
  const CAT = { o: ['#a4521e', '#e08a3c', '#f6bf7a'], cream: ['#d8c0a0', '#f6e6d0', '#fffaf0'] };
  function cat(g, R) {
    shade(g, oval(166, 188, 126, 13), 0.42, 'soft');
    // badan meringkuk (punggung di kanan)
    const bd = 'M74,180C54,170 54,118 88,88C120,58 182,50 226,64C266,78 288,116 284,150C282,172 266,182 242,182H96C86,182 80,182 74,180Z';
    const b = shape(g, bd, [54, 50, 232, 132], CAT.o, R, { n: 80, dir: [0.6, 0.3], len: [10, 30], width: [4, 9], cast: 'castBig', filter: 'impasto' });
    for (const [x, y, k] of [[150, 58, 18], [186, 58, 16], [220, 68, 12], [250, 86, -6], [270, 110, -16]]) line(b.inner, `M${x - 12},${y}q10,${k * 0.8} 18,${k * 1.7}`, '#9a4a16', 8, 0.5);
    el('path', { d: bd, fill: linGrad(g, [[0, '#fff0d8', 0.25], [0.45, '#fff0d8', 0], [1, '#3a1208', 0.32]], 60, 50, 284, 182) }, b.inner);
    line(b.inner, 'M120,178C160,168 220,170 262,160', '#f6d0a0', 6, 0.45);
    // kepala bersandar di kaki depan (wajah dari DOM, kanvas 300×200)
    shade(g, oval(104, 128, 56, 46), 0.4, 'blur2');
    const hd = 'M36,128C28,98 50,74 84,72C118,70 138,94 136,122C134,150 112,166 86,166C60,166 42,152 36,128Z';
    const h = shape(g, hd, [28, 70, 110, 96], CAT.o, R, { n: 40, dir: [0.4, 0.6], len: [6, 18], width: [3, 7], cast: 'cast', filter: 'impasto' });
    for (const [x, y] of [[74, 76], [86, 74], [98, 76]]) line(h.inner, `M${x},${y}l1,13`, '#9a4a16', 4.4, 0.6);
    el('path', { d: hd, fill: linGrad(g, [[0, '#fff2dc', 0.3], [0.5, '#fff2dc', 0], [1, '#3a1208', 0.25]], 30, 70, 136, 166) }, h.inner);
    // moncong krem kecil
    shape(g, 'M62,146C60,136 72,131 86,133C100,131 112,136 110,146C108,157 96,161 86,161C76,161 64,157 62,146Z', [60, 131, 52, 30], CAT.cream, R, { n: 10, len: [5, 12], width: [3, 5] });
    // telinga
    for (const [d, i] of [['M42,104L38,62L74,82Z', 'M46,96L44,70L66,84Z'], ['M106,80L132,52L134,100Z', 'M112,82L128,62L128,92Z']]) {
      shape(g, d, [36, 50, 100, 54], CAT.o, R, { n: 6, len: [4, 10], width: [2, 4], cast: 'cast' });
      el('path', { d: i, fill: '#f4a0a0', opacity: 0.85 }, g);
    }
    // kaki depan di bawah dagu
    for (const x of [70, 104]) shape(g, oval(x, 174, 17, 8), [x - 17, 166, 34, 16], CAT.cream, R, { n: 6, len: [6, 12], width: [2, 4], cast: 'cast' });
    for (const x of [64, 70, 76, 98, 104, 110]) line(g, `M${x},180v-4`, '#c8a888', 1.2, 0.8);
  }
  function catTail(g, R) {
    // ekor (160×80), pangkal di kiri (0,60)
    const d = 'M0,52C40,44 90,60 120,40C136,28 150,30 156,40C160,48 152,58 140,58C120,74 60,76 0,70Z';
    const t = shape(g, d, [0, 28, 160, 50], CAT.o, R, { n: 20, len: [8, 20], width: [3, 6], cast: 'cast' });
    for (const x of [40, 70, 100, 130]) line(t.inner, `M${x},46q4,10 0,24`, '#9a4a16', 6, 0.55);
    el('path', { d: 'M134,36C144,30 154,32 156,40C158,48 152,56 142,56Z', fill: '#fff1e0', opacity: 0.9 }, g);
  }

  /* ───────────── sprite ───────────── */
  const scaled = (name, w, h, seed, draw, k = 0.5, vb) => { F.sprites[name] = { w: Math.round(w * k), h: Math.round(h * k), viewBox: vb || `0 0 ${w} ${h}`, seed, draw }; };

  scaled('bg-rumah', BG.w, BG.h, 691, (svg, R) => backdrop(svg, R), 0.5, `${BG.x} ${BG.y} ${BG.w} ${BG.h}`);
  scaled('rumah-malam', BG.w, 1500, 692, (svg, R) => nightSky(svg, R), 0.36, `${BG.x} ${BG.y} ${BG.w} 1500`);
  // empat lapis rumah: kanvas dunia x 0..780, y 410..1310
  scaled('rumah-dalam', 600, 760, 693, (svg, R) => interior(svg, R), 0.66, '90 460 600 760');
  scaled('rumah-badan', 780, 900, 694, (svg, R) => body(svg, R), 0.56, '0 410 780 900');
  scaled('rumah-fasad', 580, 730, 695, (svg, R) => facade(svg, R), 0.64, '100 476 580 730');
  scaled('rumah-atap', 660, 340, 696, (svg, R) => roof(svg, R), 0.6, '60 430 660 340');
  scaled('rumah-tirai', 40, 70, 697, (svg, R) => curtain(svg, R), 1.4);
  scaled('rumah-bohlam', 30, 110, 698, (svg, R) => bulb(svg, R), 1.4);
  scaled('rumah-asap', 100, 94, 699, (svg, R) => heart(svg, R), 1);
  scaled('rumah-bulan', 110, 110, 700, (svg, R) => moon(svg, R), 0.8);
  scaled('rumah-keset', 470, 190, 701, (svg, R) => doormat(svg, R), 0.6);
  scaled('rumah-surat', 320, 220, 702, (svg, R) => letter(svg, R), 0.6);
  scaled('game-rumah-teras', TW, TH, 703, (svg, R) => doorstep(svg, R), 0.4);
  scaled('game-rumah-kucing', 300, 200, 704, (svg, R) => cat(svg, R), 0.7);
  scaled('game-rumah-ekor', 160, 80, 705, (svg, R) => catTail(svg, R), 0.7);

  F.sprites['cover-rumah'] = { w: 480, h: 600, seed: 706, draw(svg, R) {
    // rumah boneka di malam hari: semua jendela menyala, lampu untai, asap hati dari cerobong
    const k = 0.62, ox = 240 - 390 * k, oy = 600 - 1300 * k;
    const G = at(svg, `translate(${ox} ${oy}) scale(${k})`);
    nightSky(at(G, 'translate(0 0)'), R);
    table(G, R, true);
    // cahaya hangat dari rumah
    el('circle', { cx: 390, cy: 900, r: 560, fill: radGrad(svg, [[0, '#ffd59a', 0.45], [0.5, '#ffb88a', 0.14], [1, '#ffb88a', 0]], 390, 900, 560) }, G);
    interior(G, R);
    // ruang menyala: kilau lampu di tiap kamar
    for (const [x, y, r] of [[254, 1020, 120], [515, 1018, 120], [332, 850, 110], [527, 786, 110], [390, 600, 110]]) el('circle', { cx: x, cy: y, r, fill: radGrad(svg, [[0, '#ffe2a0', 0.5], [1, '#ffe2a0', 0]], x, y, r) }, G);
    const night = at(G, '', { filter: 'url(#nightTone)' });
    const fl = el('filter', { id: 'nightTone' }, svg.querySelector('defs'));
    el('feColorMatrix', { type: 'matrix', values: '0.5 0.05 0.05 0 0  0.04 0.52 0.08 0 0  0.06 0.08 0.68 0 0  0 0 0 1 0' }, fl);
    body(night, R);
    facade(night, R);
    roof(night, R);
    // jendela memancar
    for (const [x, y, rx, ry] of [[228, 1108, 90, 70], [552, 1108, 90, 70], [232, 815, 80, 70], [540, 830, 90, 90], [390, 618, 50, 50]]) el('ellipse', { cx: x, cy: y, rx, ry, fill: radGrad(svg, [[0, '#ffd27a', 0.38], [1, '#ffd27a', 0]], x, y, Math.max(rx, ry)) }, G);
    // lampu untai menyala
    for (const side of [-1, 1]) for (let i = 0; i < 8; i++) {
      const tm = (i + 0.5) / 8, x = 390 + side * (324 - tm * 320), y = 774 - tm * 278 + 18;
      el('circle', { cx: x, cy: y, r: 12, fill: '#ffd98a', opacity: 0.45, filter: 'url(#blur2)' }, G);
      el('circle', { cx: x, cy: y, r: 4.6, fill: i % 3 === 2 ? '#ffd1e0' : '#fff6d0' }, G);
    }
    // papan nama bercahaya (tanpa huruf), lampu teras
    el('circle', { cx: 316, cy: 1094, r: 50, fill: radGrad(svg, [[0, '#ffe4a8', 0.8], [1, '#ffe4a8', 0]], 316, 1094, 50) }, G);
    // asap hati
    for (const [x, y, s, o] of [[562, 428, 0.55, 0.85], [590, 366, 0.7, 0.65], [576, 296, 0.86, 0.4]]) heart(at(G, `translate(${x - 50 * s} ${y - 47 * s}) scale(${s})`, { opacity: o }), R);
    moon(at(G, 'translate(90 420) scale(1.3)'), R);
    // kunang-kunang
    for (let i = 0; i < 18; i++) { const x = 40 + R() * 700, y = 700 + R() * 560; el('circle', { cx: x, cy: y, r: 7, fill: '#f6ffb0', opacity: 0.35, filter: 'url(#blur2)' }, G); el('circle', { cx: x, cy: y, r: 2.6, fill: '#fbffd8' }, G); }
    // kucing tidur di keset
    cat(at(G, 'translate(352 1162) scale(0.26)'), R);
    el('rect', { x: 0, y: 0, width: 480, height: 600, fill: radGrad(svg, [[0, '#000', 0], [0.62, '#000', 0], [1, '#0c1030', 0.45]], 240, 300, 430) }, svg);
  } };
})();
