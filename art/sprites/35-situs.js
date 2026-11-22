/* Lukisan untuk halaman situs: langit hero, rangkaian bunga di sudut, taman di kaki halaman, sapuan kuas. */
(() => {
  const F = window.FLOA;
  const { el, leaf, wash, dabs, ramp, jitter } = F;
  const { flowers, fern, bud, GREEN, PAL } = F.flora;

  // langit senja melebar; bagian bawahnya memudar ke warna kertas situs
  F.sprites['bg-hero'] = { w: 1440, h: 900, seed: 81, draw(svg, R) {
    const stops = [[0, '#f5ad97'], [0.3, '#f9c8a2'], [0.62, '#fce3c0'], [1, '#fbf3e4']];
    wash(svg, { x: -60, y: -30, w: 1560, h: 960, R, n: 760, angle: -3, len: [0.14, 0.42], width: [26, 64], opacity: [0.3, 0.7], base: F.linGrad(svg, stops, 0, 0, 0, 900), color: (u, v) => ramp(stops, v + (u - 0.5) * 0.06) });
    el('circle', { cx: 1040, cy: 330, r: 190, fill: '#fff0c2', opacity: 0.55, filter: 'url(#softer)' }, svg);
    el('circle', { cx: 1040, cy: 330, r: 74, fill: '#fffbe6', opacity: 0.92, filter: 'url(#soft)' }, svg);
    F.latar.clouds(svg, R, '#fff6ea', [[320, 190, 520, 90, 0.6], [1180, 150, 420, 70, 0.5], [700, 430, 620, 80, 0.4], [150, 470, 320, 60, 0.36], [1300, 520, 380, 60, 0.34]]);
    F.latar.clouds(svg, R, '#f79d9a', [[560, 260, 520, 46, 0.3], [1220, 300, 300, 40, 0.24], [220, 330, 300, 36, 0.22]]);
  } };

  const melatiSpray = (g, R, pts) => pts.forEach(([x, y, s]) => {
    el('path', { d: `M0,0Q${x * 0.5},${y * 0.45} ${x},${y}`, fill: 'none', stroke: '#6fa27a', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
    flowers.melati(el('g', { transform: `translate(${x} ${y}) rotate(${R() * 60})` }, g), R, s);
  });

  // rangkaian kiri: tumbuh dari sudut kiri-bawah
  F.sprites['hero-kiri'] = { w: 560, h: 580, seed: 82, draw(svg, R) {
    const g = el('g', { transform: 'translate(36 548)' }, svg);
    [[-12, 1.0, 1], [10, 1.28, 0], [32, 1.34, 2], [54, 1.22, 3], [76, 1.04, 1]].forEach(([a, k, gi]) => leaf(g, { len: 300 * k, w: 86 * k, ...GREEN[gi], R, n: 52, transform: `rotate(${a})`, curve: 0.22 }));
    fern(el('g', { transform: 'rotate(44)' }, g), R, { len: 420, bend: 70, gr: GREEN[3], w: 84 });
    fern(el('g', { transform: 'rotate(2)' }, g), R, { len: 400, bend: -40, gr: GREEN[0], w: 80 });
    melatiSpray(g, R, [[70, -470, 0.4], [150, -440, 0.34], [330, -330, 0.36], [400, -230, 0.4], [20, -420, 0.3], [440, -110, 0.34]]);
    bud(el('g', { transform: 'translate(250 -400) rotate(24)' }, g), R, PAL.kambojaPink, 0.62);
    flowers.kenikir(el('g', { transform: 'translate(86 -330) rotate(14)' }, g), R, 0.5);
    flowers.kambojaPink(el('g', { transform: 'translate(300 -250) rotate(-8)' }, g), R, 0.46);
    flowers.sepatu(el('g', { transform: 'translate(160 -190) rotate(24)' }, g), R, 0.78);
    flowers.kamboja(el('g', { transform: 'translate(340 -110) rotate(-14)' }, g), R, 0.58);
  } };

  // rangkaian kanan: tumbuh dari sudut kanan-atas ke bawah-kiri
  F.sprites['hero-kanan'] = { w: 560, h: 580, seed: 83, draw(svg, R) {
    const g = el('g', { transform: 'translate(524 40) rotate(180)' }, svg);
    [[-10, 1.0, 2], [12, 1.26, 1], [34, 1.32, 0], [56, 1.2, 3], [78, 1.02, 2]].forEach(([a, k, gi]) => leaf(g, { len: 300 * k, w: 86 * k, ...GREEN[gi], R, n: 52, transform: `rotate(${a})`, curve: -0.22 }));
    fern(el('g', { transform: 'rotate(46)' }, g), R, { len: 420, bend: 60, gr: GREEN[0], w: 84 });
    fern(el('g', { transform: 'rotate(6)' }, g), R, { len: 380, bend: -50, gr: GREEN[3], w: 80 });
    melatiSpray(g, R, [[60, -460, 0.38], [160, -430, 0.34], [340, -320, 0.36], [410, -210, 0.4], [450, -90, 0.32]]);
    flowers.lila(el('g', { transform: 'translate(90 -340)' }, g), R, 0.5);
    flowers.aster(el('g', { transform: 'translate(310 -250)' }, g), R, 0.5);
    flowers.dahlia(el('g', { transform: 'translate(170 -190) rotate(10)' }, g), R, 0.74);
    flowers.kamboja(el('g', { transform: 'translate(350 -100) rotate(30)' }, g), R, 0.56);
  } };

  // taman memanjang untuk kaki halaman (atasnya transparan)
  F.sprites['taman'] = { w: 1440, h: 300, seed: 84, draw(svg, R) {
    const greens = ['#7fae84', '#5e9a72', '#9cc28f', '#4d8a66', '#b9d3a4'], blooms = ['#fff6e6', '#ff9d8a', '#ffd166', '#f47a8c', '#ffffff'];
    const g = el('g', { filter: 'url(#blur2)' }, svg);
    dabs(g, { n: 420, R, filter: 'impastoH', place: (i, R2) => { const u = R2(), v = Math.pow(R2(), 0.65); return { x: u * 1440, y: 70 + v * 240 + Math.sin(u * 14) * 22, rx: 26 + R2() * 46, ry: 18 + R2() * 30, rot: R2() * 180, color: jitter(greens[Math.floor(R2() * greens.length)], 10, R2), opacity: 0.8 + R2() * 0.2 }; } });
    dabs(g, { n: 230, R, filter: 'impasto', place: (i, R2) => { const u = R2(), v = Math.pow(R2(), 0.9); return { x: u * 1440, y: 100 + v * 190, rx: 7 + R2() * 14, ry: 6 + R2() * 11, rot: R2() * 180, color: jitter(blooms[Math.floor(R2() * blooms.length)], 12, R2), opacity: 0.88 }; } });
  } };

  // sapuan kuas untuk menggarisbawahi kata
  F.sprites['sapuan'] = { w: 420, h: 64, seed: 85, draw(svg, R) {
    const g = el('g', { filter: 'url(#impastoH)' }, svg);
    for (let i = 0; i < 9; i++) {
      const y = 26 + (R() - 0.5) * 12;
      el('path', { d: `M${14 + R() * 20},${y + 6}Q${210 + (R() - 0.5) * 60},${y - 12 - R() * 8} ${400 - R() * 22},${y + (R() - 0.5) * 8}`, fill: 'none', stroke: jitter(i % 3 ? '#f2542d' : '#ff8a5c', 10, R), 'stroke-width': 9 + R() * 12, 'stroke-linecap': 'round', 'stroke-opacity': 0.55 + R() * 0.4 }, g);
    }
  } };
})();
