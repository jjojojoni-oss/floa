/* Mau Nggak?: langit pink berawan, hati gouache untuk perayaan, rangkaian bunga tropis di sudut, kartu katalog berupa surat centang tanpa tulisan. */
(() => {
  const F = window.FLOA;
  const { el, painted, dabs, mix, jitter, ramp, leaf } = F;
  const { W, H } = F.latar; // 780 × 1500

  // ── hati: digambar di kotak 300×280 ──
  const HEART = 'M150,262C60,196 20,140 20,90C20,46 54,18 92,18C118,18 138,32 150,52C162,32 182,18 208,18C246,18 280,46 280,90C280,140 240,196 150,262Z';
  const ROSE = { ramp: [[0, '#ffa3b3'], [0.38, '#f6496c'], [0.74, '#d21f4d'], [1, '#a11238']], hi: '#ffd6dc', deep: '#8a0f30' };
  const BLUSH = { ramp: [[0, '#ffe0e4'], [0.4, '#ffa9ba'], [0.78, '#f27091'], [1, '#d2507a']], hi: '#fff3f4', deep: '#b93f68' };

  /** Hati lukisan: sapuan melingkari bentuk, kiri-atas terang, kilap di bahu kiri. */
  function heart(g, R, pal, { n = 150, cast = 'castBig' } = {}) {
    const p = painted(g, HEART, {
      base: F.linGrad(g, pal.ramp, 40, 20, 260, 250), n, R, filter: 'impasto', cast,
      stroke: () => {
        const x = 20 + R() * 260, y = 18 + R() * 244;
        const dx = x - 150, dy = y - 118;
        const m = Math.hypot(dx, dy) || 1;
        let tx = -dy / m, ty = dx / m;
        if (R() < 0.5) { tx = -tx; ty = -ty; }
        const L = 18 + R() * 52;
        const bend = (R() - 0.5) * L * 0.5;
        const x2 = x + tx * L, y2 = y + ty * L;
        const shade = Math.max(0, Math.min(1, ((x - 20) / 260) * 0.55 + ((y - 18) / 244) * 0.55 - 0.08 + (R() - 0.5) * 0.13));
        let c = ramp(pal.ramp, shade);
        if (R() < 0.07) c = mix(c, pal.hi, 0.55);
        return { d: `M${x},${y}Q${(x + x2) / 2 + (dx / m) * bend},${(y + y2) / 2 + (dy / m) * bend} ${x2},${y2}`, color: jitter(c, 6, R), width: 7 + R() * 14, opacity: 0.4 + R() * 0.45 };
      },
    });
    el('path', { d: 'M43,75C48,48 70,33 95,35', fill: 'none', stroke: '#fff', 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-opacity': 0.36, filter: 'url(#soft)' }, p.inner);
    el('path', { d: 'M49,66C54,50 65,42 78,40', fill: 'none', stroke: '#fff', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-opacity': 0.6 }, p.inner);
    el('path', { d: 'M250,150C235,186 205,220 166,250', fill: 'none', stroke: pal.deep, 'stroke-width': 22, 'stroke-linecap': 'round', 'stroke-opacity': 0.3, filter: 'url(#soft)' }, p.inner);
    return p;
  }
  F.sprites['mau-hati-besar'] = { w: 320, h: 300, seed: 471, draw(svg, R) { heart(el('g', { transform: 'translate(10 8)' }, svg), R, ROSE, { n: 170 }); } };
  F.sprites['mau-hati-kecil'] = { w: 320, h: 300, seed: 472, draw(svg, R) { heart(el('g', { transform: 'translate(10 8)' }, svg), R, BLUSH, { n: 150 }); } };

  // kilau kecil berujung empat
  const SPARK = 'M0,-30C3,-9 9,-3 30,0C9,3 3,9 0,30C-3,9 -9,3 -30,0C-9,-3 -3,-9 0,-30Z';
  function spark(g, R) {
    el('circle', { r: 20, fill: '#fff3b8', opacity: 0.5, filter: 'url(#soft)' }, g);
    painted(g, SPARK, { base: '#ffd45a', n: 12, R, filter: 'impastoFine', cast: false, stroke: () => ({ d: `M${-20 + R() * 40},${-20 + R() * 40}l${(R() - 0.5) * 16},${(R() - 0.5) * 16}`, color: R() < 0.5 ? '#fff6c8' : '#f3a81c', width: 3 + R() * 4, opacity: 0.7 }) });
  }
  F.sprites['mau-kilau'] = { w: 72, h: 72, seed: 473, draw(svg, R) { spark(el('g', { transform: 'translate(36 36)' }, svg), R); } };

  // ── rangkaian bunga tropis di sudut ──
  /** Sudut kiri-atas: (0,0) = pojok layar, daun menjulur ke kanan-bawah. */
  function cornerTop(g, R, k = 1) {
    const fr = F.flora;
    const o = el('g', { transform: `translate(${14 * k} ${10 * k}) scale(${k})` }, g);
    fr.fern(el('g', { transform: 'rotate(112)' }, o), R, { len: 270, bend: 44, gr: fr.GREEN[3], pairs: 9, w: 62 });
    leaf(o, { len: 250, w: 74, ...fr.GREEN[0], R, n: 44, transform: 'rotate(96)', curve: 0.2 });
    leaf(o, { len: 280, w: 80, ...fr.GREEN[1], R, n: 48, transform: 'rotate(132)', curve: -0.18 });
    leaf(o, { len: 240, w: 72, ...fr.GREEN[2], R, n: 42, transform: 'rotate(166)', curve: 0.2 });
    fr.flowers.melati(el('g', { transform: 'translate(206 150) rotate(20)' }, o), R, 0.7);
    fr.flowers.melati(el('g', { transform: 'translate(110 236) rotate(-10)' }, o), R, 0.6);
    fr.flowers.kamboja(el('g', { transform: 'translate(214 54) rotate(12)' }, o), R, 0.36);
    fr.flowers.kambojaPink(el('g', { transform: 'translate(52 178) rotate(-24)' }, o), R, 0.42);
    fr.flowers.sepatu(el('g', { transform: 'translate(104 86) rotate(150)' }, o), R, 0.56);
  }
  /** Sudut kanan-bawah: (cx,cy) = pojok layar, daun menjulur ke kiri-atas. */
  function cornerBottom(g, R, cx = 360, cy = 360, k = 1) {
    const fr = F.flora;
    const o = el('g', { transform: `translate(${cx - 12 * k} ${cy - 8 * k}) scale(${k})` }, g);
    fr.fern(el('g', { transform: 'rotate(-58)' }, o), R, { len: 300, bend: -46, gr: fr.GREEN[1], pairs: 9, w: 64 });
    leaf(o, { len: 270, w: 78, ...fr.GREEN[2], R, n: 46, transform: 'rotate(-84)', curve: -0.2 });
    leaf(o, { len: 300, w: 84, ...fr.GREEN[0], R, n: 50, transform: 'rotate(-44)', curve: 0.18 });
    leaf(o, { len: 250, w: 74, ...fr.GREEN[3], R, n: 42, transform: 'rotate(-10)', curve: -0.2 });
    fr.flowers.melati(el('g', { transform: 'translate(-210 -120) rotate(10)' }, o), R, 0.7);
    fr.flowers.melati(el('g', { transform: 'translate(-92 -250) rotate(40)' }, o), R, 0.62);
    fr.flowers.kambojaPink(el('g', { transform: 'translate(-66 -170) rotate(30)' }, o), R, 0.44);
    fr.flowers.kamboja(el('g', { transform: 'translate(-196 -40) rotate(-16)' }, o), R, 0.42);
    fr.flowers.sepatu(el('g', { transform: 'translate(-104 -74) rotate(-40)' }, o), R, 0.6);
  }
  F.sprites['mau-sudut-atas'] = { w: 320, h: 320, seed: 474, draw(svg, R) { cornerTop(svg, R); } };
  F.sprites['mau-sudut-bawah'] = { w: 360, h: 360, seed: 475, draw(svg, R) { cornerBottom(svg, R, 360, 360); } };

  // ── latar: langit merah muda dengan gumpalan awan ──
  function pinkSky(svg, R) {
    const stops = [[0, '#f094b1'], [0.22, '#f6aec0'], [0.48, '#fbcbce'], [0.74, '#fde0d4'], [1, '#fcead9']];
    F.latar.sky(svg, R, stops, { n: 600, sun: { x: 596, y: 430, r: 66, c: '#fffaf0' }, glow: '#fff0d8' });
    F.latar.clouds(svg, R, '#f77fa2', [[240, 250, 520, 46, 0.28], [600, 700, 420, 40, 0.22], [200, 1010, 460, 44, 0.2]]);
    F.latar.clouds(svg, R, '#ffffff', [[190, 330, 420, 110, 0.62], [640, 590, 380, 90, 0.5], [150, 800, 400, 96, 0.5], [600, 1010, 460, 110, 0.55]]);
    F.latar.clouds(svg, R, '#ffe9c9', [[430, 520, 360, 40, 0.3]]);
    // hamparan awan di kaki layar: bayangan merah muda di bawah, putih di atas
    F.latar.clouds(svg, R, '#f6a3b8', [[120, 1330, 520, 150, 0.5], [600, 1300, 560, 160, 0.5], [390, 1440, 860, 150, 0.5]]);
    F.latar.clouds(svg, R, '#ffffff', [[150, 1270, 480, 120, 0.7], [610, 1240, 520, 130, 0.7], [380, 1380, 800, 140, 0.75], [100, 1470, 500, 110, 0.7], [680, 1480, 460, 110, 0.7]]);
    // burung-burung kecil di kejauhan
    const b = el('g', { fill: 'none', stroke: '#a8506e', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.5 }, svg);
    for (const [x, y, s] of [[150, 560, 1], [196, 540, 0.7], [660, 300, 0.8]]) el('path', { d: `M${x},${y}q${9 * s},${-10 * s} ${18 * s},0q${9 * s},${-10 * s} ${18 * s},0` }, b);
  }
  F.sprites['bg-mau'] = { w: W, h: H, seed: 476, scale: 1, draw(svg, R) { pinkSky(svg, R); } };

  // ── secarik surat "centang salah satu" untuk kartu katalog (tanpa tulisan, supaya cocok di semua bahasa) ──
  /** (0,0) = pusat kertas; kertas 270×190 */
  function noteCard(g, R) {
    const paper = 'M-135,-95L133,-91L131,93L-133,95Z';
    painted(g, paper, {
      base: '#fffaf3', n: 40, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const x = -135 + R() * 260, y = -95 + R() * 190; return { d: `M${x},${y}l${40 + R() * 80},${(R() - 0.5) * 3}`, color: R() < 0.5 ? '#ffffff' : '#f6ece0', width: 10 + R() * 18, opacity: 0.22 }; },
    });
    // coretan tulisan tangan (abstrak, tidak terbaca): ayunan pena yang tidak rata
    const scribble = (x0, y0, len) => {
      let d = `M${x0},${y0}`;
      let x = x0;
      while (x < x0 + len) {
        const w = 9 + R() * 9, h = 7 + R() * 9;
        d += `q${w / 2},${-h} ${w},${(R() - 0.5) * 3}`;
        x += w;
        if (R() < 0.18) { d += `m${6 + R() * 6},0`; x += 9; }
      }
      return d;
    };
    const ink = el('g', { fill: 'none', stroke: '#7d2240', 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.75 }, g);
    el('path', { d: scribble(-100, -50, 182) }, ink);
    el('path', { d: scribble(-100, -20, 120) }, ink);
    // dua kotak centang, kotak pertama dicentang hati
    const box = el('g', { fill: 'none', stroke: '#5a1730', 'stroke-width': 3.6, 'stroke-linejoin': 'round', opacity: 0.8 }, g);
    el('path', { d: 'M-98,22L-70,21L-69,49L-97,50Z' }, box);
    el('path', { d: 'M14,22L42,21L43,49L15,50Z' }, box);
    el('path', { d: scribble(-58, 40, 40), fill: 'none', stroke: '#7d2240', 'stroke-width': 3.4, 'stroke-linecap': 'round', opacity: 0.7 }, g);
    el('path', { d: scribble(54, 40, 52), fill: 'none', stroke: '#7d2240', 'stroke-width': 3.4, 'stroke-linecap': 'round', opacity: 0.7 }, g);
    const hg = el('g', { transform: 'translate(-84 34) rotate(-10) scale(0.12)' }, g);
    heart(el('g', { transform: 'translate(-150 -140)' }, hg), R, ROSE, { n: 50, cast: 'cast' });
    // selotip merah muda di atas
    const tg = el('g', { transform: 'translate(-34 -110) rotate(-6)', opacity: 0.88 }, g);
    painted(tg, 'M0,0H74l-4,6l4,6l-4,6l4,6H0l4,-6l-4,-6l4,-6Z', { base: '#f08aa4', n: 14, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${R() * 60},${3 + R() * 18}l${10 + R() * 20},0`, color: R() < 0.5 ? '#ffc3d2' : '#d9607f', width: 3 + R() * 4, opacity: 0.5 }) });
  }

  F.sprites['cover-mau'] = { w: 480, h: 600, seed: 477, draw(svg, R) {
    pinkSky(el('g', { transform: 'translate(0 -150) scale(0.6154)' }, svg), R);
    cornerTop(svg, R, 0.6);
    cornerBottom(svg, R, 480, 600, 0.72);
    // dua hati berdampingan di bawah tulisan
    el('ellipse', { cx: 236, cy: 548, rx: 120, ry: 12, fill: '#a11238', opacity: 0.16, filter: 'url(#soft)' }, svg);
    heart(el('g', { transform: 'translate(232 322) rotate(13) scale(0.62)' }, svg), R, BLUSH, { n: 120 });
    heart(el('g', { transform: 'translate(96 296) rotate(-10) scale(0.84)' }, svg), R, ROSE, { n: 180 });
    for (const [x, y, k] of [[70, 300, 0.5], [410, 330, 0.62], [402, 84, 0.42]]) spark(el('g', { transform: `translate(${x} ${y}) scale(${k})` }, svg), R);
    // surat kecil "centang salah satu", kotak pertama sudah dicentang hati
    noteCard(el('g', { transform: 'translate(246 176) rotate(-5)' }, svg), R);
  } };
})();
