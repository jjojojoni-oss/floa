/* Foto contoh untuk demo, dilukis: senja, gunung, kota, taman, pantai, kopi. */
(() => {
  const F = window.FLOA;
  const { el, wash, dabs, painted, ramp, mix, jitter, leaf } = F;
  const S = 600;

  const sky = (svg, R, stops, n = 260) => wash(svg, { x: -30, y: -20, w: S + 60, h: S + 40, R, n, angle: -3, len: [0.25, 0.6], width: [22, 54], opacity: [0.3, 0.7], base: F.linGrad(svg, stops, 0, 0, 0, S), color: (u, v) => ramp(stops, v + (u - 0.5) * 0.06) });
  /** bidang berbentuk bebas dengan sapuan acak di dalam kotak pembatasnya */
  const shape = (svg, d, box, cols, R, { n = 70, dir = [1, 0.1], width = [10, 24], filter = 'impastoH', cast } = {}) => painted(svg, d, {
    base: cols[1], n, R, filter, cast,
    stroke: () => { const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = 30 + R() * 90, m = Math.hypot(dir[0], dir[1]); return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 6, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.35 + R() * 0.45 }; },
  });
  const glow = (svg, x, y, r, c, o = 0.5) => { el('circle', { cx: x, cy: y, r: r * 2.4, fill: c, opacity: o, filter: 'url(#softer)' }, svg); el('circle', { cx: x, cy: y, r, fill: mix(c, '#ffffff', 0.5), filter: 'url(#blur2)' }, svg); };

  F.sprites['foto-senja'] = { w: S, h: S, seed: 91, draw(svg, R) {
    sky(svg, R, [[0, '#4b3f8f'], [0.3, '#b05a9a'], [0.5, '#f0708a'], [0.66, '#ffb46b'], [1, '#ffcf8a']]);
    glow(svg, 300, 372, 62, '#ffe59a', 0.6);
    F.latar.clouds(svg, R, '#ffd9c9', [[150, 150, 300, 40, 0.5], [450, 210, 260, 34, 0.4]]);
    shape(svg, 'M0,380H600V600H0Z', [0, 380, 600, 220], ['#2f2a66', '#6a4a8c', '#f08a6e'], R, { n: 150, dir: [1, 0], width: [8, 20] });
    dabs(svg, { n: 26, R, filter: 'impastoH', place: (i, R2) => ({ x: 300 + (R2() - 0.5) * (60 + i * 6), y: 392 + i * 7, rx: 16 + R2() * 30, ry: 3 + R2() * 2.5, color: '#ffe59a', opacity: 0.75 }) });
    shape(svg, 'M0,556L600,536V600H0Z', [0, 530, 600, 70], ['#1b1640', '#2a2350', '#3a316a'], R, { n: 30 });
    const g = el('g', { fill: '#231c48', filter: 'url(#wobble)' }, svg);
    el('rect', { x: 56, y: 498, width: 170, height: 12, rx: 3 }, g); el('rect', { x: 92, y: 468, width: 9, height: 90 }, g); el('rect', { x: 176, y: 474, width: 9, height: 84 }, g);
    el('circle', { cx: 118, cy: 444, r: 14 }, g); el('path', { d: 'M102,500q16,-48 32,0Z' }, g); el('circle', { cx: 156, cy: 448, r: 13 }, g); el('path', { d: 'M141,500q15,-44 30,0Z' }, g);
  } };

  F.sprites['foto-gunung'] = { w: S, h: S, seed: 92, draw(svg, R) {
    sky(svg, R, [[0, '#a9d6ea'], [0.5, '#dbeef2'], [1, '#fff1d6']]);
    glow(svg, 440, 150, 46, '#ffe08a', 0.55);
    F.latar.clouds(svg, R, '#ffffff', [[150, 120, 260, 50, 0.7], [500, 260, 200, 36, 0.5]]);
    shape(svg, 'M-20,440L150,190L250,330L330,230L470,440Z', [0, 190, 470, 250], ['#6f9fb3', '#8fb9c9', '#c5e0e8'], R, { dir: [0.5, 1] });
    shape(svg, 'M150,190L192,248L160,240L140,264L118,232Z', [118, 190, 80, 76], ['#e6f2f6', '#ffffff', '#ffffff'], R, { n: 12 });
    shape(svg, 'M200,470L400,240L640,470Z', [200, 240, 420, 230], ['#3f7d92', '#5f97a8', '#9cc6d2'], R, { dir: [0.6, 1], cast: 'cast' });
    shape(svg, 'M400,240L438,284L410,278L392,300L372,270Z', [372, 240, 70, 62], ['#e6f2f6', '#ffffff', '#ffffff'], R, { n: 12 });
    shape(svg, 'M-10,470Q150,400 300,450T610,430V600H-10Z', [0, 410, 600, 190], ['#4c8f63', '#6fae7f', '#a9d49a'], R, { n: 90 });
    shape(svg, 'M-10,524Q200,462 380,512T610,492V600H-10Z', [0, 470, 600, 130], ['#2f6b4f', '#4c8f63', '#7fba7f'], R, { n: 70, cast: 'cast' });
    [[90, 524, 1], [150, 548, 0.8], [486, 520, 1.05], [546, 546, 0.75]].forEach(([x, y, k]) => leaf(svg, { len: 96 * k, w: 46 * k, dark: '#173f30', mid: '#2a5f45', light: '#5a9670', R, n: 16, transform: `translate(${x} ${y})` }));
  } };

  F.sprites['foto-kota'] = { w: S, h: S, seed: 93, draw(svg, R) {
    sky(svg, R, [[0, '#131a3c'], [0.6, '#33306a'], [1, '#6b4a86']]);
    glow(svg, 452, 128, 36, '#fff0bd', 0.4);
    dabs(svg, { n: 60, R, filter: null, place: (i, R2) => ({ x: R2() * S, y: R2() * 300, rx: 0.9 + R2() * 1.6, color: '#ffffff', opacity: 0.4 + R2() * 0.6 }) });
    [[20, 330, 92], [128, 258, 84], [228, 360, 104], [348, 288, 74], [438, 338, 114]].forEach(([x, y, w], bi) => {
      shape(svg, `M${x},${y}h${w}V600h${-w}Z`, [x, y, w, 600 - y], ['#161c40', '#232a57', '#343c74'], R, { n: 26, dir: [0.1, 1], width: [8, 18], filter: 'impasto', cast: 'cast' });
      dabs(svg, { n: 16, R, filter: 'impastoFine', place: (i, R2) => { if (R2() < 0.35) return null; const col = i % 3, row = Math.floor(i / 3); return { x: x + 18 + col * ((w - 36) / 2), y: y + 28 + row * 42, rx: 7, ry: 9, color: R2() < 0.8 ? '#ffd36e' : '#ff9d6c', opacity: 0.95 }; } });
    });
    shape(svg, 'M0,522H600V600H0Z', [0, 522, 600, 78], ['#0c1028', '#101533', '#1c2350'], R, { n: 20 });
    [70, 190, 310, 430, 550].forEach((x) => glow(svg, x, 540, 5, '#ffd36e', 0.5));
  } };

  F.sprites['foto-taman'] = { w: S, h: S, seed: 94, draw(svg, R) {
    sky(svg, R, [[0, '#bfe3f7'], [0.6, '#e4f3fb'], [1, '#f7f6dc']]);
    glow(svg, 110, 110, 44, '#fff3c4', 0.6);
    F.latar.clouds(svg, R, '#ffffff', [[400, 120, 300, 54, 0.75], [220, 220, 200, 34, 0.5]]);
    shape(svg, 'M-10,330Q160,250 320,320T610,300V600H-10Z', [0, 270, 600, 330], ['#7fba7f', '#9bd08f', '#c9e6b0'], R, { n: 90 });
    shape(svg, 'M-10,410Q200,340 360,400T610,380V600H-10Z', [0, 350, 600, 250], ['#4c9a58', '#6fb86f', '#a3d78f'], R, { n: 90, cast: 'cast' });
    shape(svg, 'M-10,500Q220,440 400,490T610,470V600H-10Z', [0, 450, 600, 150], ['#2f7a45', '#4c9a58', '#7fc57a'], R, { n: 70, cast: 'cast' });
    dabs(svg, { n: 80, R, filter: 'impasto', place: (i, R2) => ({ x: R2() * S, y: 380 + R2() * 220, rx: 5 + R2() * 9, ry: 4 + R2() * 7, rot: R2() * 180, color: jitter(['#ff8fa3', '#ffffff', '#ffc94a', '#ffb07a'][Math.floor(R2() * 4)], 10, R2), opacity: 0.9 }) });
    F.flora.flowers.kenikir(el('g', { transform: 'translate(120 520) rotate(10)' }, svg), R, 0.3);
    F.flora.flowers.aster(el('g', { transform: 'translate(470 540)' }, svg), R, 0.3);
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(300 560) rotate(-12)' }, svg), R, 0.26);
  } };

  F.sprites['foto-pantai'] = { w: S, h: S, seed: 95, draw(svg, R) {
    sky(svg, R, [[0, '#8fd3f2'], [0.42, '#c7ebf8'], [1, '#c7ebf8']]);
    glow(svg, 480, 108, 44, '#fff3c4', 0.6);
    F.latar.clouds(svg, R, '#ffffff', [[160, 110, 280, 50, 0.8]]);
    shape(svg, 'M0,250H600V400H0Z', [0, 250, 600, 150], ['#1f8fae', '#34b3c9', '#8fe0e6'], R, { n: 110, dir: [1, 0], width: [8, 18] });
    shape(svg, 'M-10,384Q150,352 300,378T610,368V600H-10Z', [0, 350, 600, 250], ['#e9c98d', '#fbe2b0', '#fff3d2'], R, { n: 90, cast: 'cast' });
    dabs(svg, { n: 34, R, filter: 'impastoH', place: (i, R2) => ({ x: R2() * S, y: 372 + Math.sin(i) * 8 + R2() * 8, rx: 20 + R2() * 30, ry: 4, color: '#ffffff', opacity: 0.85 }) });
    const u = el('g', { transform: 'translate(300 320) rotate(8)' }, svg);
    el('rect', { x: -4, y: 0, width: 8, height: 210, fill: '#8a6a4a' }, u);
    for (let i = 0; i < 7; i++) F.petal(u, { len: 150, w: 62, round: 0.3, R, n: 16, veins: 0, stops: i % 2 ? [[0, '#ffffff'], [1, '#f3ede2']] : [[0, '#c2311a'], [1, '#ff6b4a']], shade: i % 2 ? '#d9d2c5' : '#8f1f10', light: '#ffffff', transform: `rotate(${-78 + i * 26}) translate(0 12)` });
    shape(svg, 'M170,480l170,-12l4,58l-170,12Z', [170, 468, 180, 76], ['#e0607a', '#ff8fa3', '#ffc2cd'], R, { n: 24, dir: [0.1, 1], cast: 'cast' });
    const b = el('g', { filter: 'url(#cast)' }, svg);
    el('circle', { cx: 452, cy: 500, r: 34, fill: '#ffffff' }, b); el('path', { d: 'M452,466a34,34 0 0 1 30,50L452,500Z', fill: '#ffc94a' }, b); el('path', { d: 'M452,466a34,34 0 0 0 -30,50L452,500Z', fill: '#34b3c9' }, b);
  } };

  F.sprites['foto-kopi'] = { w: S, h: S, seed: 96, draw(svg, R) {
    wash(svg, { x: -20, y: -20, w: S + 40, h: S + 40, R, n: 220, angle: 2, len: [0.3, 0.8], width: [16, 40], opacity: [0.3, 0.65], base: '#dcb98f', color: (u, v, R2) => mix('#c99f6e', '#edd2ad', R2()) });
    shape(svg, 'M340,70l214,26l-26,214l-214,-26Z', [310, 70, 250, 250], ['#efe2cc', '#fff7e8', '#ffffff'], R, { n: 30, dir: [1, 0.1], cast: 'castBig' });
    for (let i = 0; i < 4; i++) el('path', { d: `M${372 + i * -3},${128 + i * 30}l${140 - i * 22},17`, stroke: '#cbb89c', 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    const cup = (x, y, r, coffee, art) => {
      const g = el('g', { transform: `translate(${x} ${y})` }, svg);
      shape(g, `M${-r * 1.45},0a${r * 1.45},${r * 1.45} 0 1 0 ${r * 2.9},0a${r * 1.45},${r * 1.45} 0 1 0 ${-r * 2.9},0Z`, [-r * 1.5, -r * 1.5, r * 3, r * 3], ['#e6dccb', '#fbf6ec', '#ffffff'], R, { n: 30, cast: 'castBig', filter: 'impastoFine' });
      el('rect', { x: r * 1.05, y: -r * 0.25, width: r * 0.75, height: r * 0.5, rx: r * 0.25, fill: 'none', stroke: '#fbf6ec', 'stroke-width': r * 0.2 }, g);
      shape(g, `M${-r},0a${r},${r} 0 1 0 ${r * 2},0a${r},${r} 0 1 0 ${-r * 2},0Z`, [-r, -r, r * 2, r * 2], coffee, R, { n: 24, cast: 'cast', filter: 'impastoFine' });
      art(g, r);
    };
    cup(190, 232, 82, ['#5a341c', '#7a4a2b', '#a06a40'], (g, r) => el('path', { d: `M0,${r * 0.5}C${-r * 0.6},${r * 0.1} ${-r * 0.45},${-r * 0.5} 0,${-r * 0.22}C${r * 0.45},${-r * 0.5} ${r * 0.6},${r * 0.1} 0,${r * 0.5}Z`, fill: '#f6dcc0', opacity: 0.92, filter: 'url(#wobble)' }, g));
    cup(402, 432, 70, ['#7c5028', '#a9703f', '#cf9a63'], (g, r) => { for (let i = 0; i < 3; i++) el('path', { d: `M${-r * (0.5 - i * 0.14)},${i * r * 0.2 - r * 0.05}q${r * (0.5 - i * 0.14)},${-r * 0.55} ${r * (1 - i * 0.28)},0`, fill: 'none', stroke: '#f6dcc0', 'stroke-width': r * 0.11, 'stroke-linecap': 'round', opacity: 0.9 }, g); });
    F.petal(svg, { len: 150, w: 70, round: 0.9, R, n: 26, veins: 0, stops: [[0, '#b9742a'], [0.5, '#e8a44e'], [1, '#f6c477']], shade: '#9a5a1c', light: '#ffe0a8', transform: 'translate(60 470) rotate(72)' });
    leaf(svg, { len: 110, w: 46, dark: '#1f5a3d', mid: '#3d8a5c', light: '#9ccf8a', R, n: 20, transform: 'translate(560 590) rotate(-62)' });
    leaf(svg, { len: 96, w: 40, dark: '#245c44', mid: '#4a9468', light: '#b7dba0', R, n: 18, transform: 'translate(590 560) rotate(-28)' });
  } };
})();
