/* Buket Mekar: kertas pembungkus bermotif kawung, dedaunan, dan pita. Semua lapis memakai kanvas 600×720 yang sama. */
(() => {
  const F = window.FLOA;
  const { el, painted, leaf, petal, mix, jitter } = F;
  const W = 600, H = 720;
  const KRAFT = { base: '#dcbd92', dark: '#b98f5f', light: '#f1dcb8' };

  /** Lembar kertas kraft: sapuan searah lipatan + motif kawung samar. */
  function paper(svg, d, R, { tone = 0, dir = [0.2, 1], kawung = false, cast = 'cast' } = {}) {
    const base = mix(KRAFT.base, tone > 0 ? KRAFT.light : KRAFT.dark, Math.abs(tone));
    const p = painted(svg, d, {
      base, n: 150, R, filter: 'impastoFine', cast,
      stroke: () => {
        const x = R() * W, y = 300 + R() * 420;
        const L = 60 + R() * 150, m = Math.hypot(dir[0], dir[1]);
        return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(base, R() < 0.5 ? KRAFT.light : KRAFT.dark, R() * 0.45), 5, R), width: 10 + R() * 22, opacity: 0.25 + R() * 0.4 };
      },
    });
    if (kawung) {
      const id = F.uid('k');
      const pt = el('pattern', { id, width: 56, height: 56, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(18)' }, svg.querySelector('defs'));
      for (const [cx, cy] of [[0, 0], [56, 0], [0, 56], [56, 56], [28, 28]]) {
        for (const a of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: 11, ry: 5, fill: 'none', stroke: '#8a5f36', 'stroke-width': 1.3, transform: `rotate(${a} ${cx} ${cy}) translate(13 0)` }, pt);
        el('circle', { cx, cy, r: 1.6, fill: '#8a5f36' }, pt);
      }
      el('path', { d, fill: `url(#${id})`, opacity: 0.36 }, p.inner);
    }
    return p;
  }

  const back = (svg, R) => {
    el('ellipse', { cx: 300, cy: 696, rx: 150, ry: 14, fill: '#3a1d12', opacity: 0.22, filter: 'url(#soft)' }, svg);
    paper(svg, 'M96,336L300,284L504,336L376,692L224,692Z', R, { tone: 0.5, dir: [0, 1], cast: false });
    // tisu putih bergelombang
    let d = 'M124,340';
    for (let i = 0; i < 8; i++) d += `q22,-26 44,0`;
    d += 'L392,600L208,600Z';
    painted(svg, d, { base: '#fffaf1', n: 60, R, filter: 'impastoFine', cast: 'cast', stroke: () => { const x = 130 + R() * 340, y = 330 + R() * 240; return { d: `M${x},${y}l${(R() - 0.5) * 30},${40 + R() * 60}`, color: R() < 0.5 ? '#f3e7d6' : '#ffffff', width: 10 + R() * 14, opacity: 0.5 }; } });
  };
  F.sprites['buket-belakang'] = { w: W, h: H, seed: 71, draw: back };

  const greens = (svg, R) => {
    const g = el('g', { transform: 'translate(300 532)' }, svg);
    const fr = F.flora.GREEN;
    [[-70, 0, 1.0], [-46, 1, 1.1], [-22, 2, 1.18], [22, 0, 1.18], [46, 3, 1.1], [70, 1, 1.0]].forEach(([a, gi, k]) => {
      leaf(g, { len: 300 * k, w: 78 * k, ...fr[gi], R, n: 50, transform: `rotate(${a})`, curve: a < 0 ? -0.2 : 0.2 });
    });
    F.flora.fern(el('g', { transform: 'rotate(-34)' }, g), R, { len: 380, bend: -50, gr: fr[3], pairs: 10, w: 70 });
    F.flora.fern(el('g', { transform: 'rotate(36)' }, g), R, { len: 370, bend: 50, gr: fr[1], pairs: 10, w: 70 });
    // tangkai melati + bunga kecil pengisi
    [[-190, -330], [-150, -390], [-96, -430], [-30, -458], [40, -452], [104, -424], [158, -384], [196, -326], [-214, -262], [216, -258]].forEach(([x, y]) => {
      el('path', { d: `M0,-40Q${x * 0.55},${y * 0.5} ${x},${y}`, fill: 'none', stroke: '#6fa27a', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
      F.flora.flowers.melati(el('g', { transform: `translate(${x} ${y}) rotate(${R() * 60})` }, g), R, 0.34 + R() * 0.12);
    });
  };
  F.sprites['buket-daun'] = { w: W, h: H, seed: 72, draw: greens };

  const front = (svg, R) => {
    paper(svg, 'M96,336L328,480L304,692L224,692Z', R, { tone: 0.15, dir: [0.35, 1], kawung: true });
    paper(svg, 'M504,336L272,480L296,692L376,692Z', R, { tone: -0.3, dir: [-0.35, 1], kawung: true });
    // tepi lipatan yang kena cahaya
    el('path', { d: 'M98,338L328,481', stroke: '#fff3da', 'stroke-width': 4, 'stroke-opacity': 0.7, 'stroke-linecap': 'round', fill: 'none' }, svg);
    el('path', { d: 'M502,338L272,481', stroke: '#fff3da', 'stroke-width': 3, 'stroke-opacity': 0.45, 'stroke-linecap': 'round', fill: 'none' }, svg);
  };
  F.sprites['buket-depan'] = { w: W, h: H, seed: 73, draw: front };

  // pita satin
  const bow = (g, R) => {
    const pal = { stops: [[0, '#8f1731'], [0.45, '#e04a66'], [1, '#ff9eab']], shade: '#7a1029', light: '#ffd3d8' };
    petal(g, { len: 150, w: 54, round: 0.3, notch: 22, R, n: 34, ...pal, transform: 'rotate(160)', side: 0.6 });
    petal(g, { len: 150, w: 54, round: 0.3, notch: 22, R, n: 34, ...pal, transform: 'rotate(200)', side: -0.6 });
    petal(g, { len: 124, w: 92, round: 1, R, n: 44, ...pal, transform: 'rotate(-98)', side: 0.7 });
    petal(g, { len: 124, w: 92, round: 1, R, n: 44, ...pal, transform: 'rotate(98)', side: -0.7 });
    const k = painted(g, 'M-17,-20h34a8,8 0 0 1 8,8v24a8,8 0 0 1 -8,8h-34a8,8 0 0 1 -8,-8v-24a8,8 0 0 1 8,-8Z', { base: '#d43e5b', n: 12, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${-20 + R() * 40},-20l${(R() - 0.5) * 8},40`, color: R() < 0.5 ? '#ff93a3' : '#a81f3d', width: 5 + R() * 5, opacity: 0.5 }) });
  };
  F.sprites['pita'] = { w: 300, h: 240, seed: 74, draw(svg, R) { bow(el('g', { transform: 'translate(150 84)' }, svg), R); } };

  /** Susunan kepala bunga (koordinat kanvas 600×720): [jenis, x, y, diameter] */
  const HEADS = [['aster', 170, 266, 176], ['kenikir', 430, 266, 176], ['dahlia', 300, 180, 222], ['kamboja', 232, 362, 166], ['sepatu', 378, 362, 180]];

  // kartu katalog: buket utuh di atas langit pagi
  F.sprites['cover-buket-mekar'] = { w: 480, h: 600, seed: 75, draw(svg, R) {
    const sky = el('g', { transform: 'scale(0.62)' }, svg);
    F.latar.sky(sky, R, [[0, '#f9d3c2'], [0.45, '#fce6d2'], [1, '#f4ecd6']], { n: 320, sun: { x: 180, y: 250, r: 60 }, glow: '#fff6da' });
    F.latar.clouds(sky, R, '#ffffff', [[520, 170, 420, 80, 0.6], [200, 520, 340, 60, 0.4]]);
    const g = el('g', { transform: 'translate(30 44) scale(0.7)' }, svg);
    back(g, R); greens(g, R);
    HEADS.forEach(([kind, x, y, d]) => F.flora.flowers[kind](el('g', { transform: `translate(${x} ${y}) rotate(${R() * 40})` }, g), R, d / 330));
    front(g, R);
    bow(el('g', { transform: 'translate(300 600) scale(0.56)' }, g), R);
  } };
})();
