/* Latar lukisan + tekstur kertas. */
(() => {
  const F = window.FLOA;
  const { el, wash, dabs, ramp, mix, leaf } = F;
  const W = 780, H = 1500;

  function sky(svg, R, stops, { n = 620, sun, glow } = {}) {
    wash(svg, {
      x: -60, y: -30, w: W + 120, h: H + 60, R, n, angle: -4, len: [0.22, 0.6], width: [26, 64], opacity: [0.3, 0.7],
      base: F.linGrad(svg, stops, 0, 0, 0, H),
      color: (u, v) => ramp(stops, v + (u - 0.5) * 0.07),
    });
    if (sun) {
      el('circle', { cx: sun.x, cy: sun.y, r: sun.r * 2.6, fill: glow || '#fff3c4', opacity: 0.5, filter: 'url(#softer)' }, svg);
      el('circle', { cx: sun.x, cy: sun.y, r: sun.r, fill: sun.c || '#fffbe6', opacity: 0.9, filter: 'url(#soft)' }, svg);
    }
  }
  /** Gumpalan awan: sekumpulan sapuan pendek yang dilebur, tebal di tengah dan menipis ke tepi. */
  function clouds(svg, R, color, puffs) {
    const g = el('g', { filter: 'url(#mist)' }, svg);
    puffs.forEach(([cx, cy, w, h, op]) => {
      const n = Math.round(w / 9);
      for (let i = 0; i < n; i++) {
        const u = (R() + R() + R()) / 3, v = (R() + R()) / 2; // menumpuk di tengah
        const x = cx - w / 2 + u * w, y = cy - h / 2 + v * h;
        const L = w * (0.1 + R() * 0.2);
        el('path', { d: `M${x - L / 2},${y}q${L / 2},${(R() - 0.5) * 10} ${L},${(R() - 0.5) * 6}`, fill: 'none', stroke: F.jitter(color, 5, R), 'stroke-width': 12 + R() * 26, 'stroke-linecap': 'round', 'stroke-opacity': op * (0.35 + R() * 0.65) }, g);
      }
    });
  }
  /** Rimbun dedaunan di bawah, sedikit kabur supaya terasa jauh. */
  function garden(svg, R, { y = H - 330, greens, blooms, blur = 'blur2', density = 260 }) {
    const g = el('g', { filter: `url(#${blur})` }, svg);
    dabs(g, { n: density, R, filter: 'impastoH', place: (i, R2) => {
      const u = R2(), v = Math.pow(R2(), 0.7);
      return { x: u * W, y: y + v * (H - y) + Math.sin(u * 9) * 20, rx: 26 + R2() * 46, ry: 18 + R2() * 30, rot: R2() * 180, color: F.jitter(greens[Math.floor(R2() * greens.length)], 10, R2), opacity: 0.75 + R2() * 0.25 };
    } });
    dabs(g, { n: Math.round(density * 0.5), R, filter: 'impasto', place: (i, R2) => {
      const u = R2(), v = Math.pow(R2(), 0.9);
      return { x: u * W, y: y + 20 + v * (H - y - 30), rx: 7 + R2() * 14, ry: 6 + R2() * 11, rot: R2() * 180, color: F.jitter(blooms[Math.floor(R2() * blooms.length)], 12, R2), opacity: 0.85 };
    } });
  }

  F.latar = { sky, clouds, garden, W, H };

  F.sprites['bg-senja'] = { w: W, h: H, seed: 51, scale: 1, draw(svg, R) {
    sky(svg, R, [[0, '#f4a995'], [0.26, '#f9c6a0'], [0.5, '#fde2bd'], [0.74, '#f6ead0'], [1, '#d7e6cf']], { sun: { x: 560, y: 470, r: 70 }, glow: '#fff0c2' });
    clouds(svg, R, '#fff6ea', [[210, 230, 430, 90, 0.55], [640, 330, 360, 70, 0.5], [330, 690, 520, 80, 0.4], [80, 560, 300, 60, 0.35]]);
    clouds(svg, R, '#f79d9a', [[420, 300, 420, 46, 0.3], [150, 420, 300, 40, 0.24]]);
    clouds(svg, R, '#ffd9a6', [[600, 610, 380, 50, 0.4]]);
    garden(svg, R, { greens: ['#7fae84', '#5e9a72', '#9cc28f', '#4d8a66', '#b9d3a4'], blooms: ['#fff6e6', '#ff9d8a', '#ffd166', '#f47a8c', '#ffffff'] });
  } };

  F.sprites['bg-pagi'] = { w: W, h: H, seed: 52, scale: 1, draw(svg, R) {
    sky(svg, R, [[0, '#f9d9c9'], [0.3, '#fbe6d3'], [0.6, '#fdf1e0'], [1, '#e9efd9']], { sun: { x: 200, y: 330, r: 60 }, glow: '#fff6da' });
    clouds(svg, R, '#ffffff', [[520, 210, 460, 90, 0.6], [160, 520, 380, 70, 0.45], [600, 760, 360, 60, 0.35]]);
    clouds(svg, R, '#ffc9b4', [[300, 360, 420, 44, 0.3]]);
    garden(svg, R, { y: H - 250, density: 200, greens: ['#a9cba0', '#86b58c', '#c4dbb2', '#6fa57e'], blooms: ['#fff', '#ffc2b0', '#ffe08a', '#f7a3b3'] });
  } };

  F.sprites['bg-malam'] = { w: W, h: H, seed: 53, scale: 1, draw(svg, R) {
    sky(svg, R, [[0, '#101736'], [0.3, '#1d2452'], [0.58, '#3a2a61'], [0.8, '#6b3f6a'], [1, '#a15f66']], { n: 560 });
    clouds(svg, R, '#5a4a86', [[260, 420, 520, 70, 0.4], [600, 760, 420, 60, 0.35]]);
    clouds(svg, R, '#c98a8f', [[380, 1090, 620, 60, 0.3]]);
    el('circle', { cx: 590, cy: 250, r: 120, fill: '#ffe9b8', opacity: 0.28, filter: 'url(#softer)' }, svg);
    el('circle', { cx: 590, cy: 250, r: 46, fill: '#fff6dc', filter: 'url(#blur2)' }, svg);
    el('circle', { cx: 574, cy: 238, r: 11, fill: '#eadfc0', opacity: 0.5 }, svg);
    el('circle', { cx: 606, cy: 268, r: 7, fill: '#eadfc0', opacity: 0.45 }, svg);
    dabs(svg, { n: 150, R, filter: null, place: (i, R2) => { const big = R2() < 0.1; return { x: R2() * W, y: Math.pow(R2(), 1.4) * H * 0.75, rx: big ? 2.6 : 0.8 + R2() * 1.3, color: R2() < 0.3 ? '#ffe7b0' : '#ffffff', opacity: 0.35 + R2() * 0.6 }; } });
    const g = el('g', { filter: 'url(#blur2)' }, svg);
    dabs(g, { n: 230, R, filter: 'impastoH', place: (i, R2) => { const u = R2(), v = Math.pow(R2(), 0.7); return { x: u * W, y: H - 300 + v * 300 + Math.sin(u * 8) * 24, rx: 28 + R2() * 48, ry: 20 + R2() * 30, rot: R2() * 180, color: F.jitter(['#12213a', '#1b2d44', '#0f1a30', '#24384c'][Math.floor(R2() * 4)], 6, R2), opacity: 0.9 }; } });
  } };

  // ── tekstur ubin ──
  F.sprites['tex-kertas'] = { w: 220, h: 220, seed: 61, scale: 1, draw(svg) {
    el('defs', {}, svg).innerHTML = `<filter id="pp" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="luminanceToAlpha" result="b"/>
      <feDiffuseLighting in="b" surfaceScale="1.1" diffuseConstant="1.12" lighting-color="#fff" result="l"><feDistantLight azimuth="235" elevation="64"/></feDiffuseLighting>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.2" numOctaves="2" seed="9" stitchTiles="stitch" result="f"/>
      <feColorMatrix in="f" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0.5 -0.2" result="fib"/>
      <feMerge><feMergeNode in="l"/><feMergeNode in="fib"/></feMerge></filter>`;
    el('rect', { width: 220, height: 220, fill: '#fff', filter: 'url(#pp)' }, svg);
  } };

  // butiran kertas transparan: ditumpuk di atas adegan tanpa blend mode (murah di HP)
  F.sprites['tex-butir'] = { w: 128, h: 128, seed: 63, scale: 1, draw(svg) {
    el('defs', {}, svg).innerHTML = `<filter id="gr" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.16  0 0 0 0 0.1  1.5 0 0 0 -0.62"/></filter>`;
    el('rect', { width: 128, height: 128, filter: 'url(#gr)' }, svg);
  } };

  // motif kawung halus (batik) untuk emboss di latar kartu
  F.sprites['tex-kawung'] = { w: 160, h: 160, seed: 62, scale: 1, draw(svg) {
    const g = el('g', { fill: 'none', stroke: '#000', 'stroke-width': 1.2, opacity: 0.9 }, svg);
    for (const [cx, cy] of [[0, 0], [160, 0], [0, 160], [160, 160], [80, 80]]) {
      for (const a of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: 34, ry: 15, transform: `rotate(${a} ${cx} ${cy}) translate(38 0)` }, g);
      el('circle', { cx, cy, r: 4 }, g);
    }
  } };
})();
