/* Buket Mekar (babak tambahan): kupu-kupu kecil penunjuk kuncup, label kado kraft, dan kartu kecil yang terselip. */
(() => {
  const F = window.FLOA;
  const { el, painted, petal, mix, jitter, linGrad } = F;

  /* ── kupu-kupu jeruk dilihat dari atas; sayap kiri & kanan pada kanvas yang sama ── */
  const WING = {
    stops: [[0, '#b2440f'], [0.35, '#f08a24'], [0.75, '#ffc35a'], [1, '#ffe7a8']],
    shade: '#8c3510',
    light: '#fff3cf',
  };
  const HIND = {
    stops: [[0, '#a63c12'], [0.4, '#ef7b2a'], [1, '#ffd27a']],
    shade: '#7d2f10',
    light: '#ffe9bf',
  };
  function butterfly(g, R) {
    // sayap belakang (lebih kecil, sedikit ke bawah)
    for (const s of [-1, 1]) {
      petal(g, { len: 46, w: 40, round: 1, skew: 0.1 * s, R, n: 22, side: 0.6 * s, veins: 2, ...HIND, transform: `translate(${s * 2} 6) rotate(${s * 128})`, cast: 'cast' });
    }
    // sayap depan
    for (const s of [-1, 1]) {
      petal(g, { len: 62, w: 44, round: 0.7, skew: -0.18 * s, R, n: 26, side: 0.6 * s, veins: 3, ...WING, transform: `translate(${s * 2} -2) rotate(${s * 62})`, cast: 'cast' });
    }
    // tepi gelap berbintik putih di ujung sayap depan
    for (const s of [-1, 1]) {
      const tip = el('g', { transform: `translate(${s * 2} -2) rotate(${s * 62})` }, g);
      for (const x of [-8, 0, 8]) el('circle', { cx: x, cy: -52 + Math.abs(x) * 0.35, r: 2.2, fill: '#fff6dc', opacity: 0.9 }, tip);
      el('circle', { cx: s * 4, cy: -30, r: 4, fill: '#3b1d10', opacity: 0.55 }, tip);
    }
    // badan + antena
    el('ellipse', { cx: 0, cy: 6, rx: 4.2, ry: 22, fill: '#3b2116' }, g);
    el('ellipse', { cx: -1.2, cy: -2, rx: 1.4, ry: 12, fill: '#7a5440', opacity: 0.7 }, g);
    el('circle', { cx: 0, cy: -16, r: 5, fill: '#3b2116' }, g);
    for (const s of [-1, 1]) {
      el('path', { d: `M${s * 2},-19Q${s * 8},-36 ${s * 15},-42`, fill: 'none', stroke: '#3b2116', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: s * 15, cy: -42, r: 2.4, fill: '#3b2116' }, g);
    }
  }
  F.sprites['buket-kupu'] = { w: 160, h: 140, seed: 311, draw(svg, R) { butterfly(el('g', { transform: 'translate(80 76)' }, svg), R); } };

  /* ── label kado kraft bertali (teks dari DOM): kanvas 360×200, lubang tali di kiri ── */
  const KRAFT = { base: '#e3c79e', dark: '#c09466', light: '#f6e5c6' };
  F.sprites['buket-label'] = { w: 360, h: 200, seed: 312, draw(svg, R) {
    const d = 'M70,24H330Q344,24 344,38V162Q344,176 330,176H70L22,128V72Z';
    const p = painted(svg, d, {
      base: KRAFT.base, n: 110, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 20 + R() * 320, y = 24 + R() * 152; return { d: `M${x},${y}l${40 + R() * 70},${(R() - 0.5) * 4}`, color: jitter(mix(KRAFT.base, R() < 0.55 ? KRAFT.light : KRAFT.dark, R() * 0.3), 4, R), width: 4 + R() * 8, opacity: 0.18 + R() * 0.2 }; },
    });
    // bingkai garis tipis di dalam tepi
    el('path', { d: 'M76,36H322Q332,36 332,46V154Q332,164 322,164H76L36,124V76Z', fill: 'none', stroke: '#9a6c3c', 'stroke-width': 1.6, 'stroke-opacity': 0.45, 'stroke-dasharray': '6 5' }, p.inner);
    // lubang tali bercincin
    el('circle', { cx: 58, cy: 100, r: 13, fill: '#fff8ea', stroke: '#b78a56', 'stroke-width': 4 }, svg);
    el('circle', { cx: 58, cy: 100, r: 7, fill: '#5b3a20', opacity: 0.85 }, svg);
    // tepi terang dari kiri-atas
    el('path', { d: 'M70,25H330', stroke: '#fff4dc', 'stroke-width': 3, 'stroke-opacity': 0.7, fill: 'none' }, svg);
    // setangkai melati kecil di sudut kanan-bawah
    F.flora.flowers.melati(el('g', { transform: 'translate(318 160) rotate(18)', filter: 'url(#cast)' }, svg), R, 0.36);
  } };

  /* ── kartu kecil dalam amplop kraft yang terselip di buket: kanvas 240×190 ── */
  F.sprites['buket-kartu'] = { w: 240, h: 190, seed: 313, draw(svg, R) {
    // kartu krem yang menyembul
    painted(svg, 'M44,20H196V120H44Z', {
      base: '#fffaf0', n: 40, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 44 + R() * 150, y = 20 + R() * 100; return { d: `M${x},${y}l${30 + R() * 50},${(R() - 0.5) * 3}`, color: R() < 0.5 ? '#ffffff' : '#efe3cf', width: 6 + R() * 8, opacity: 0.45 }; },
    });
    for (let i = 0; i < 3; i++) el('path', { d: `M64,${44 + i * 16}h${92 - i * 24}`, stroke: '#7a5a4a', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.45 }, svg);
    // amplop
    const env = 'M20,70H220V178H20Z';
    painted(svg, env, {
      base: linGrad(svg, [[0, '#e9cfa6'], [1, '#d6b283']], 0, 70, 0, 178), n: 70, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const x = 20 + R() * 200, y = 70 + R() * 108; return { d: `M${x},${y}l${40 + R() * 60},${(R() - 0.5) * 5}`, color: jitter(mix('#ddbd90', R() < 0.5 ? '#f6e5c6' : '#b98f5f', R() * 0.5), 5, R), width: 6 + R() * 12, opacity: 0.35 }; },
    });
    // lipatan depan
    painted(svg, 'M20,178L120,112L220,178Z', {
      base: '#e2c497', n: 30, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 30 + R() * 180, y = 120 + R() * 56; return { d: `M${x},${y}l${30 + R() * 40},${(R() - 0.5) * 4}`, color: jitter(R() < 0.5 ? '#f3ddb8' : '#c9a170', 5, R), width: 6 + R() * 10, opacity: 0.4 }; },
    });
    el('path', { d: 'M22,177L120,113L218,177', fill: 'none', stroke: '#fff1d6', 'stroke-width': 2.2, 'stroke-opacity': 0.6 }, svg);
    // segel kamboja kecil
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(120 132) rotate(-10)', filter: 'url(#cast)' }, svg), R, 0.2);
  } };
  /* ── gulungan kertas kecil bertali yang menyembul dari tengah bunga: kanvas 140×90 ── */
  const scroll = (g, R, tie) => {
    painted(g, 'M18,30H122V60H18Z', {
      base: linGrad(g, [[0, '#efe2cb'], [0.35, '#fffaf0'], [0.7, '#fbf1df'], [1, '#e2d0b2']], 0, 30, 0, 60), n: 26, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 18 + R() * 100, y = 30 + R() * 30; return { d: `M${x},${y}l${16 + R() * 30},${(R() - 0.5) * 2}`, color: R() < 0.5 ? '#ffffff' : '#e8d9bf', width: 3 + R() * 5, opacity: 0.4 }; },
    });
    // ujung gulungan
    for (const x of [18, 122]) {
      el('ellipse', { cx: x, cy: 45, rx: 6, ry: 15, fill: '#f6ead4', stroke: '#c9b18b', 'stroke-width': 1.4 }, g);
      el('ellipse', { cx: x, cy: 45, rx: 2.4, ry: 7, fill: '#cdb48c', opacity: 0.7 }, g);
    }
    // tali melingkar + simpul
    el('path', { d: 'M70,29V61', stroke: tie, 'stroke-width': 4, fill: 'none' }, g);
    el('path', { d: 'M70,61q-12,10 -18,22M70,61q10,12 20,18', stroke: tie, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
    el('circle', { cx: 70, cy: 61, r: 4.2, fill: tie }, g);
    el('path', { d: 'M22,33H118', stroke: '#ffffff', 'stroke-width': 2, 'stroke-opacity': 0.7, fill: 'none' }, g);
  };
  F.sprites['buket-gulungan'] = { w: 140, h: 90, seed: 314, draw(svg, R) { scroll(el('g', {}, svg), R, '#c8203f'); } };
  F.sprites['buket-gulungan-emas'] = { w: 140, h: 90, seed: 315, draw(svg, R) { scroll(el('g', {}, svg), R, '#c9962e'); } };
})();
