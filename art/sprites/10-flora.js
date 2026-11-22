/* Pustaka flora tropis floa: kamboja, kembang sepatu, dahlia, kenikir, aster, melati, kuncup, daun, pakis. */
(() => {
  const F = window.FLOA;
  const { el, petal, leaf, mix } = F;

  const PAL = {
    kamboja: { stops: [[0, '#ee8f0e'], [0.2, '#ffcb3d'], [0.48, '#fff0c0'], [1, '#fffdf7']], shade: '#e3b08e', light: '#ffffff' },
    kambojaPink: { stops: [[0, '#f29b1d'], [0.22, '#ffd35a'], [0.5, '#ffd9d2'], [1, '#ff9fb2']], shade: '#d8697f', light: '#fff1ee' },
    sepatu: { stops: [[0, '#5a0a1d'], [0.2, '#b01838'], [0.55, '#ee4868'], [1, '#ff9aa9']], shade: '#7e1230', light: '#ffc6cd' },
    dahlia: { stops: [[0, '#b8322f'], [0.4, '#ee6a58'], [1, '#ffb7a0']], shade: '#9c2a2e', light: '#ffd9c8' },
    dahliaIn: { stops: [[0, '#d8503e'], [0.4, '#f98a6c'], [1, '#ffd0b4']], shade: '#b53a35', light: '#ffe6d6' },
    kenikir: { stops: [[0, '#d85d0b'], [0.3, '#ff9f1f'], [1, '#ffd95c']], shade: '#c2560f', light: '#fff0a8' },
    aster: { stops: [[0, '#d9d2ea'], [0.3, '#f4f0fb'], [1, '#ffffff']], shade: '#b7abd6', light: '#ffffff' },
    lila: { stops: [[0, '#5b3f9c'], [0.35, '#8e72d0'], [1, '#cdbdf2']], shade: '#4a3384', light: '#e9e0ff' },
    melati: { stops: [[0, '#dfe8c4'], [0.3, '#fbfbee'], [1, '#ffffff']], shade: '#c9d3ae', light: '#ffffff' },
  };
  const GREEN = [
    { dark: '#1c4f3b', mid: '#33795a', light: '#8cc79a' },
    { dark: '#245c44', mid: '#4a9468', light: '#b7dba0' },
    { dark: '#1f5a3d', mid: '#3d8a5c', light: '#9ccf8a' },
    { dark: '#2f5f2e', mid: '#5c9a45', light: '#c4dc86' },
  ];

  function core(g, r, c1, c2, R, dots = 14) {
    el('circle', { r: r * 1.5, fill: c2, opacity: 0.35, filter: 'url(#soft)' }, g);
    const c = el('g', { filter: 'url(#impastoFine)' }, g);
    el('circle', { r, fill: c1 }, c);
    for (let i = 0; i < dots; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r * 0.9;
      el('circle', { cx: Math.cos(a) * d, cy: Math.sin(a) * d, r: r * (0.1 + R() * 0.12), fill: R() < 0.5 ? c2 : mix(c1, '#ffffff', 0.45) }, c);
    }
  }

  const flowers = {
    kamboja(g, R, s = 1, pal = PAL.kamboja) {
      for (let i = 0; i < 5; i++) petal(g, { len: 150 * s, w: 118 * s, round: 0.9, skew: 0.16, R, n: 56, side: 0.8, veins: 2, ...pal, transform: `rotate(${i * 72 + 8})` });
      el('circle', { r: 16 * s, fill: '#e07a06', opacity: 0.5, filter: 'url(#soft)' }, g);
    },
    kambojaPink(g, R, s = 1) { flowers.kamboja(g, R, s, PAL.kambojaPink); },
    sepatu(g, R, s = 1) {
      for (let i = 0; i < 5; i++) petal(g, { len: 165 * s, w: 150 * s, round: 1, skew: 0.1, notch: 14 * s, R, n: 64, side: 0.7, veins: 5, ...PAL.sepatu, transform: `rotate(${i * 72 - 20})` });
      el('circle', { r: 30 * s, fill: '#3e0613', opacity: 0.55, filter: 'url(#soft)' }, g);
      // tangkai sari
      const st = el('g', { filter: 'url(#cast)' }, g);
      el('path', { d: `M0,0Q${30 * s},${-50 * s} ${78 * s},${-96 * s}`, fill: 'none', stroke: '#ffd66a', 'stroke-width': 8 * s, 'stroke-linecap': 'round' }, st);
      el('path', { d: `M0,0Q${30 * s},${-50 * s} ${78 * s},${-96 * s}`, fill: 'none', stroke: '#fff3bf', 'stroke-width': 2.5 * s, 'stroke-linecap': 'round', opacity: 0.8 }, st);
      for (let i = 0; i < 9; i++) {
        const t = 0.55 + R() * 0.45, x = 78 * s * t + (R() - 0.5) * 22 * s, y = -96 * s * t + (R() - 0.5) * 22 * s;
        el('circle', { cx: x, cy: y, r: (3.2 + R() * 2) * s, fill: R() < 0.7 ? '#ffc21a' : '#fff0a0' }, st);
      }
      for (let i = 0; i < 5; i++) el('circle', { cx: 82 * s + Math.cos(i * 1.26) * 9 * s, cy: -102 * s + Math.sin(i * 1.26) * 9 * s, r: 4 * s, fill: '#a5122f' }, st);
    },
    dahlia(g, R, s = 1) {
      const ring = (n, len, w, off, pal, strokes) => { for (let i = 0; i < n; i++) petal(g, { len: len * s, w: w * s, round: 0.35, R, n: strokes, side: 0.6, veins: 1, ...pal, transform: `rotate(${(360 / n) * i + off})` }); };
      ring(13, 150, 62, 0, PAL.dahlia, 22);
      ring(11, 118, 54, 14, PAL.dahlia, 20);
      ring(9, 86, 44, 5, PAL.dahliaIn, 16);
      ring(7, 54, 32, 22, PAL.dahliaIn, 12);
      core(g, 13 * s, '#f6b24a', '#c9482f', R, 10);
    },
    kenikir(g, R, s = 1) {
      for (let i = 0; i < 8; i++) petal(g, { len: 140 * s, w: 84 * s, round: 0.8, notch: 10 * s, R, n: 38, side: 0.6, veins: 3, ...PAL.kenikir, transform: `rotate(${i * 45 + 6})` });
      core(g, 24 * s, '#b4530d', '#ffcf3d', R, 22);
    },
    aster(g, R, s = 1, pal = PAL.aster) {
      for (let i = 0; i < 18; i++) petal(g, { len: (128 + R() * 14) * s, w: 34 * s, round: 0.55, R, n: 16, side: 0.5, veins: 1, ...pal, transform: `rotate(${i * 20 + R() * 5})` });
      for (let i = 0; i < 14; i++) petal(g, { len: (96 + R() * 10) * s, w: 30 * s, round: 0.55, R, n: 12, side: 0.5, veins: 1, ...pal, transform: `rotate(${i * 25.7 + 10})` });
      core(g, 30 * s, '#f2a40f', '#ffe27a', R, 30);
    },
    lila(g, R, s = 1) { flowers.aster(g, R, s, PAL.lila); },
    melati(g, R, s = 1) {
      for (let i = 0; i < 7; i++) petal(g, { len: 62 * s, w: 30 * s, round: 0.7, R, n: 14, side: 0.5, veins: 1, ...PAL.melati, transform: `rotate(${i * 51.4 + 12})` });
      el('circle', { r: 6 * s, fill: '#ffd24a' }, g);
    },
  };

  /** Kuncup tertutup menghadap atas; (0,0) = pangkal kuncup. */
  function bud(g, R, pal, s = 1) {
    petal(g, { len: 104 * s, w: 54 * s, round: 0.5, R, n: 20, side: 0.7, veins: 1, ...pal, transform: 'rotate(-13)' });
    petal(g, { len: 104 * s, w: 54 * s, round: 0.5, R, n: 20, side: -0.7, veins: 1, ...pal, transform: 'rotate(13)' });
    petal(g, { len: 112 * s, w: 50 * s, round: 0.45, R, n: 22, side: 0.4, veins: 1, ...pal });
    const gr = GREEN[1];
    leaf(g, { len: 50 * s, w: 24 * s, ...gr, R, n: 12, transform: 'rotate(-34)', curve: -0.3 });
    leaf(g, { len: 50 * s, w: 24 * s, ...gr, R, n: 12, transform: 'rotate(34)', curve: 0.3 });
    leaf(g, { len: 40 * s, w: 22 * s, ...gr, R, n: 10 });
  }

  /** Pelepah pakis: tangkai melengkung dengan anak daun berpasangan. */
  function fern(g, R, { len = 300, bend = 60, gr = GREEN[0], pairs = 11, w = 90 } = {}) {
    el('path', { d: `M0,0Q${bend * 0.2},${-len * 0.55} ${bend},${-len}`, fill: 'none', stroke: gr.dark, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    for (let i = 0; i < pairs; i++) {
      const t = 0.12 + (i / pairs) * 0.86;
      const x = 2 * (1 - t) * t * bend * 0.2 + t * t * bend, y = 2 * (1 - t) * t * -len * 0.55 + t * t * -len;
      const size = w * (0.35 + Math.sin(Math.PI * t) * 0.65);
      for (const sgn of [-1, 1]) leaf(g, { len: size, w: size * 0.32, ...gr, R, n: 10, cast: false, side: sgn, transform: `translate(${x} ${y}) rotate(${sgn * (62 - t * 22) + (bend / len) * 40 * t})`, curve: sgn * 0.25 });
    }
  }

  F.flora = { PAL, GREEN, flowers, bud, fern, core };

  // ── sprite tunggal ──
  const single = (name, size, fn, seed) => {
    F.sprites[name] = { w: size, h: size, seed, draw(svg, R) { fn(el('g', { transform: `translate(${size / 2} ${size / 2})` }, svg), R, size / 360); } };
  };
  single('bunga-kamboja', 320, flowers.kamboja, 11);
  single('bunga-kamboja-pink', 320, flowers.kambojaPink, 12);
  single('bunga-sepatu', 360, flowers.sepatu, 13);
  single('bunga-dahlia', 340, flowers.dahlia, 14);
  single('bunga-kenikir', 320, flowers.kenikir, 15);
  single('bunga-aster', 300, flowers.aster, 16);
  single('bunga-lila', 300, flowers.lila, 17);
  single('bunga-melati', 150, (g, R) => flowers.melati(g, R, 1), 18);

  const budSprite = (name, pal, seed) => {
    F.sprites[name] = { w: 130, h: 200, seed, draw(svg, R) { bud(el('g', { transform: 'translate(65 176)' }, svg), R, pal, 1.25); } };
  };
  budSprite('kuncup-kamboja', PAL.kamboja, 21);
  budSprite('kuncup-sepatu', PAL.sepatu, 22);
  budSprite('kuncup-dahlia', PAL.dahlia, 23);
  budSprite('kuncup-kenikir', PAL.kenikir, 24);
  budSprite('kuncup-lila', PAL.lila, 25);
  budSprite('kuncup-pink', PAL.kambojaPink, 26);

  GREEN.forEach((gr, i) => {
    F.sprites[`daun-${i + 1}`] = { w: 150, h: 320, seed: 30 + i, draw(svg, R) { leaf(svg, { len: 290, w: 118, ...gr, R, transform: 'translate(75 308)', curve: i % 2 ? -0.18 : 0.2 }); } };
  });
  F.sprites['pakis'] = { w: 260, h: 380, seed: 36, draw(svg, R) { fern(el('g', { transform: 'translate(100 372)' }, svg), R, { len: 340, bend: 70 }); } };

  // kelopak lepas (untuk partikel)
  [['kelopak-putih', PAL.kamboja], ['kelopak-merah', PAL.sepatu], ['kelopak-jingga', PAL.kenikir], ['kelopak-pink', PAL.kambojaPink]].forEach(([name, pal], i) => {
    F.sprites[name] = { w: 80, h: 110, seed: 40 + i, draw(svg, R) { petal(svg, { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 26, ...pal, transform: 'translate(40 102)', cast: false }); } };
  });
})();
