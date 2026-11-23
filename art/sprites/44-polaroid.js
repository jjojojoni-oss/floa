/* Setumpuk Kenangan: meja kayu hangat bercahaya sore, selotip kertas, dan kartu katalog berisi polaroid lukisan. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf, petal, linGrad } = F;
  const WARM = '#3a1d12';

  /** Papan kayu mendatar: tiap papan punya rona sendiri, serat panjang, celah berbayang. */
  function wood(svg, R, W, H, { plank = 250, knots = 3 } = {}) {
    const tones = ['#e8caa0', '#e1bf92', '#ecd2ab', '#debb8c', '#e9cda4', '#e3c498', '#eed6b0'];
    let y = -40, i = 0;
    const seams = [];
    while (y < H) {
      const h = plank * (0.82 + R() * 0.36);
      const base = tones[(i * 3 + 1) % tones.length];
      wash(svg, {
        x: -60, y, w: W + 120, h, R, n: Math.round(h * 0.6), angle: 0, len: [0.25, 0.75], width: [4, 15], opacity: [0.2, 0.5], base,
        clip: `M-60,${y}H${W + 60}V${y + h}H-60Z`,
        color: (u, v, R2) => mix(base, R2() < 0.52 ? '#f8e6c6' : '#be9360', R2() * 0.55),
      });
      y += h; i++;
      seams.push(y);
    }
    // mata kayu
    for (let k = 0; k < knots; k++) {
      const cx = 80 + R() * (W - 160), cy = 200 + R() * (H - 400);
      const g = el('g', { fill: 'none', stroke: '#9a6c3c', 'stroke-linecap': 'round', filter: 'url(#blur2)' }, svg);
      for (let r = 0; r < 4; r++) el('ellipse', { cx, cy, rx: 12 + r * 13, ry: 4 + r * 4.5, 'stroke-width': 2.4, 'stroke-opacity': 0.34 - r * 0.07, transform: `rotate(${(R() - 0.5) * 6} ${cx} ${cy})` }, g);
      el('ellipse', { cx, cy, rx: 7, ry: 3, fill: '#8a5c30', 'fill-opacity': 0.4, stroke: 'none' }, g);
    }
    // celah antar papan: garis gelap + pantulan cahaya di bawahnya
    seams.forEach((sy) => {
      el('path', { d: `M-10,${sy}q${W / 2},${(R() - 0.5) * 3} ${W + 20},0`, fill: 'none', stroke: '#6f4a26', 'stroke-width': 3.2, 'stroke-opacity': 0.5 }, svg);
      el('path', { d: `M-10,${sy + 3.4}H${W + 10}`, fill: 'none', stroke: '#fff4dc', 'stroke-width': 2.2, 'stroke-opacity': 0.5 }, svg);
      el('path', { d: `M-10,${sy - 4}H${W + 10}`, fill: 'none', stroke: WARM, 'stroke-width': 6, 'stroke-opacity': 0.07 }, svg);
    });
  }

  const leafShape = (len, w) => `M0,0C${w * 0.62},${-len * 0.22} ${w * 0.5},${-len * 0.74} 0,${-len}C${-w * 0.5},${-len * 0.74} ${-w * 0.62},${-len * 0.22} 0,0Z`;
  /** bayangan pelepah (daun-daun panjang dari satu tangkai) yang jatuh di meja */
  function frondShadow(svg, x, y, rot, len, n, opacity = 0.2, blur = 'softer') {
    const g = el('g', { filter: `url(#${blur})`, fill: '#5a3216', opacity, transform: `translate(${x} ${y}) rotate(${rot})` }, svg);
    el('path', { d: `M-6,0L6,0L3,${-len}L-3,${-len}Z` }, g);
    for (let i = 0; i < n; i++) {
      const t = 0.12 + (i / n) * 0.88;
      for (const sgn of [-1, 1]) el('path', { d: leafShape(len * (0.5 - t * 0.22), len * 0.085), transform: `translate(0 ${-len * t}) rotate(${sgn * (68 - t * 30)})` }, g);
    }
  }

  /** rumpun daun untuk sudut; (0,0) = titik tumbuh */
  function corner(g, R, flip = 1) {
    const gr = F.flora.GREEN;
    [[-14, 0, 320, 100], [20, 2, 350, 110], [50, 1, 310, 98], [80, 3, 260, 90]].forEach(([a, gi, len, w]) => leaf(g, { len, w, ...gr[gi], R, n: 46, transform: `rotate(${a * flip})`, curve: 0.18 * flip, cast: 'castBig' }));
    F.flora.fern(el('g', { transform: `rotate(${36 * flip})` }, g), R, { len: 370, bend: 60 * flip, gr: gr[3], pairs: 10, w: 72 });
  }

  function loosePetals(svg, R, list) {
    list.forEach(([x, y, rot, s, pal]) => petal(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...F.flora.PAL[pal], cast: false }));
  }

  F.sprites['bg-polaroid'] = { w: 780, h: 1500, seed: 441, scale: 1, draw(svg, R) {
    wood(svg, R, 780, 1500);
    // cahaya sore dari kiri-atas, makin teduh ke kanan-bawah
    el('ellipse', { cx: 210, cy: 430, rx: 520, ry: 600, fill: '#fff6dc', opacity: 0.55, filter: 'url(#softer)' }, svg);
    el('rect', { width: 780, height: 1500, fill: linGrad(svg, [[0, '#fff1cf', 0.18], [0.55, '#fff1cf', 0], [1, '#5a3216', 0.2]], 0, 0, 780, 1500) }, svg);
    frondShadow(svg, 860, 380, -62, 620, 9, 0.2);
    frondShadow(svg, 820, 900, -78, 520, 8, 0.15);
    frondShadow(svg, -70, 1120, 74, 480, 8, 0.13);
    // sudut kanan-bawah: daun, kamboja merah muda, melati
    corner(el('g', { transform: 'translate(810 1500)' }, svg), R, -1);
    const fl = el('g', { filter: 'url(#castBig)' }, svg);
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(652 1356) rotate(-14)' }, fl), R, 0.8);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(486 1456) rotate(30)' }, fl), R, 0.5);
    F.flora.flowers.melati(el('g', { transform: 'translate(518 1296) rotate(10)' }, fl), R, 0.62);
    F.flora.flowers.melati(el('g', { transform: 'translate(730 1180) rotate(40)' }, fl), R, 0.5);
    // sudut kiri-atas: pakis dan kenikir mengintip
    const t = el('g', { transform: 'translate(-24 -20) rotate(150)' }, svg);
    [[-30, 1, 240, 84], [4, 0, 290, 94], [36, 3, 230, 80]].forEach(([a, gi, len, w]) => leaf(t, { len, w, ...F.flora.GREEN[gi], R, n: 40, transform: `rotate(${a})`, curve: -0.2, cast: 'castBig' }));
    F.flora.flowers.kenikir(el('g', { transform: 'translate(70 96) rotate(12)', filter: 'url(#castBig)' }, svg), R, 0.5);
    loosePetals(svg, R, [[92, 1338, 40, 0.5, 'kambojaPink'], [196, 1432, -70, 0.42, 'kamboja'], [690, 250, 130, 0.4, 'kenikir'], [40, 760, -20, 0.36, 'kamboja']]);
  } };

  /* ── selotip kertas: ujung bergerigi, motif tipis, sedikit tembus ── */
  const TAPES = [
    { c: '#e7826a', l: '#f6b29f', d: '#c35f4b', motif: 'garis' },
    { c: '#e9be52', l: '#f8dc8c', d: '#c79a2c', motif: 'titik' },
    { c: '#8fb89c', l: '#bfdcc4', d: '#648f74', motif: 'kawung' },
    { c: '#e9a2ae', l: '#f8cdd4', d: '#c97886', motif: 'garis' },
  ];
  TAPES.forEach((t, i) => {
    F.sprites[`polaroid-selotip-${i + 1}`] = { w: 150, h: 56, seed: 443 + i, draw(svg, R) {
      let d = 'M14,10H136';
      for (let k = 0; k < 6; k++) d += `l${k % 2 ? 5 : -5},6`;
      d += 'H14';
      for (let k = 0; k < 6; k++) d += `l${k % 2 ? -5 : 5},-6`;
      d += 'Z';
      const g = el('g', { opacity: 0.9 }, svg);
      const p = painted(g, d, {
        base: t.c, n: 40, R, filter: 'impastoFine', cast: 'cast',
        stroke: () => { const x = 10 + R() * 110, y = 10 + R() * 36; return { d: `M${x},${y}l${20 + R() * 40},${(R() - 0.5) * 3}`, color: jitter(mix(t.c, R() < 0.5 ? t.l : t.d, R() * 0.6), 5, R), width: 5 + R() * 8, opacity: 0.35 + R() * 0.4 }; },
      });
      const m = el('g', { opacity: 0.5 }, p.inner);
      if (t.motif === 'garis') for (let x = -20; x < 170; x += 14) el('path', { d: `M${x},50l22,-44`, stroke: '#fffaf0', 'stroke-width': 4.5, fill: 'none' }, m);
      if (t.motif === 'titik') for (let x = 20; x < 140; x += 14) for (let y = 16; y < 46; y += 12) el('circle', { cx: x + ((y / 12) % 2 ? 7 : 0), cy: y, r: 2.6, fill: '#fffaf0' }, m);
      if (t.motif === 'kawung') for (let x = 22; x < 140; x += 26) { for (const a of [45, 135, 225, 315]) el('ellipse', { cx: x, cy: 28, rx: 9, ry: 4, fill: 'none', stroke: '#fffaf0', 'stroke-width': 1.8, transform: `rotate(${a} ${x} 28) translate(10.5 0)` }, m); el('circle', { cx: x, cy: 28, r: 1.8, fill: '#fffaf0' }, m); }
      el('path', { d: 'M16,12H134', stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': 0.45, fill: 'none' }, p.inner);
      el('path', { d: 'M16,45H134', stroke: WARM, 'stroke-width': 2, 'stroke-opacity': 0.14, fill: 'none' }, p.inner);
    } };
  });

  /* ── kartu katalog: tiga polaroid berisi lukisan kecil ── */
  /** bingkai polaroid 240×288 dengan "foto" lukisan; (0,0) = pusat */
  function snap(g, R, scene, tape) {
    const frame = 'M-120,-144H120V144H-120Z';
    painted(g, frame, {
      base: '#fbf6ea', n: 60, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const x = -120 + R() * 240, y = -144 + R() * 288; return { d: `M${x},${y}l${30 + R() * 70},${(R() - 0.5) * 6}`, color: R() < 0.5 ? '#ffffff' : '#ebe2cf', width: 10 + R() * 16, opacity: 0.4 }; },
    });
    const pic = 'M-106,-130H106V82H-106Z';
    const sc = SCENES[scene];
    const p = painted(g, pic, {
      base: linGrad(g, sc.sky, 0, -130, 0, 82), n: 90, R, filter: 'impastoH',
      stroke: () => { const v = R(); const x = -106 + R() * 212, y = -130 + v * 212; return { d: `M${x - 30},${y}q30,${(R() - 0.5) * 8} ${50 + R() * 50},${(R() - 0.5) * 4}`, color: jitter(ramp(sc.sky, v), 6, R), width: 8 + R() * 12, opacity: 0.5 }; },
    });
    sc.draw(p.inner, R);
    el('path', { d: pic, fill: 'none', stroke: WARM, 'stroke-width': 2, 'stroke-opacity': 0.18 }, g);
    // coretan caption
    el('path', { d: 'M-62,112q12,-12 24,0t24,0t24,0t24,0t22,-2', fill: 'none', stroke: '#4a3528', 'stroke-width': 3.4, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, g);
    if (tape) {
      const tg = el('g', { transform: 'translate(-40 -162) rotate(-4) scale(0.54)', opacity: 0.9 }, g);
      painted(tg, 'M14,10H136l-5,6l5,6l-5,6l5,6l-5,6l5,6H14l5,-6l-5,-6l5,-6l-5,-6l5,-6Z', { base: tape, n: 20, R, filter: 'impastoFine', cast: 'cast', stroke: () => { const x = 10 + R() * 110, y = 10 + R() * 36; return { d: `M${x},${y}l${20 + R() * 40},0`, color: jitter(mix(tape, R() < 0.5 ? '#ffffff' : WARM, R() * 0.3), 5, R), width: 6 + R() * 8, opacity: 0.4 }; } });
    }
  }
  const SCENES = {
    senja: {
      sky: [[0, '#5d4a94'], [0.34, '#e8718c'], [0.6, '#ffb873'], [0.62, '#f29a6e'], [1, '#473a7e']],
      draw(g, R) {
        el('circle', { cx: 0, cy: -8, r: 62, fill: '#ffe9a6', opacity: 0.45, filter: 'url(#soft)' }, g);
        el('circle', { cx: 0, cy: -8, r: 34, fill: '#fff2c0' }, g);
        el('path', { d: 'M-106,-2H106V82H-106Z', fill: linGrad(g, [[0, '#e88670', 0.9], [1, '#3f3577', 0.95]], 0, -2, 0, 82) }, g);
        for (let i = 0; i < 7; i++) el('path', { d: `M${-34 + (R() - 0.5) * 24},${8 + i * 10}h${40 + R() * 36}`, stroke: '#ffe9a6', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-opacity': 0.75, fill: 'none' }, g);
        dabs(g, { n: 8, R, filter: null, place: (i, R2) => ({ x: -90 + R2() * 180, y: -100 + R2() * 40, rx: 22 + R2() * 20, ry: 5, color: '#ffd9c2', opacity: 0.5 }) });
      },
    },
    kebun: {
      sky: [[0, '#bfe0f0'], [0.55, '#eaf3df'], [1, '#f6f1d6']],
      draw(g, R) {
        el('circle', { cx: -60, cy: -84, r: 22, fill: '#fff6cf' }, g);
        el('path', { d: 'M-106,10Q-40,-34 20,2T106,-10V82H-106Z', fill: '#8fc28a' }, g);
        el('path', { d: 'M-106,44Q-30,6 40,36T106,26V82H-106Z', fill: '#5d9f69' }, g);
        dabs(g, { n: 46, R, filter: null, place: (i, R2) => ({ x: -100 + R2() * 200, y: 14 + R2() * 62, rx: 5 + R2() * 4, color: ['#fff6e6', '#ff9d8a', '#ffd166', '#f47a8c'][i % 4], opacity: 0.95 }) });
      },
    },
    malam: {
      sky: [[0, '#141a3f'], [0.6, '#3a2f6c'], [1, '#8a5078']],
      draw(g, R) {
        el('circle', { cx: 56, cy: -76, r: 40, fill: '#ffe9b8', opacity: 0.3, filter: 'url(#soft)' }, g);
        el('circle', { cx: 56, cy: -76, r: 19, fill: '#fff4d6' }, g);
        dabs(g, { n: 34, R, filter: null, place: (i, R2) => ({ x: -100 + R2() * 200, y: -124 + R2() * 130, rx: 1.4 + R2() * 1.6, color: '#fff', opacity: 0.5 + R2() * 0.5 }) });
        el('path', { d: 'M-106,40Q-60,10 -20,34T60,22T106,36V82H-106Z', fill: '#16203f' }, g);
        dabs(g, { n: 16, R, filter: null, place: (i, R2) => ({ x: -96 + R2() * 192, y: 44 + R2() * 30, rx: 2.6, color: '#ffd77a', opacity: 0.9 }) });
      },
    },
  };

  F.sprites['cover-polaroid'] = { w: 480, h: 600, seed: 442, draw(svg, R) {
    const bg = el('g', { transform: 'scale(0.62)' }, svg);
    wood(bg, R, 780, 980, { plank: 230, knots: 2 });
    el('ellipse', { cx: 200, cy: 300, rx: 460, ry: 460, fill: '#fff6dc', opacity: 0.5, filter: 'url(#softer)' }, bg);
    frondShadow(bg, 860, 260, -64, 560, 9, 0.2);
    corner(el('g', { transform: 'translate(500 612) scale(0.5)' }, svg), R, -1);
    snap(el('g', { transform: 'translate(150 262) rotate(-12) scale(0.86)' }, svg), R, 'malam', '#8fb89c');
    snap(el('g', { transform: 'translate(334 276) rotate(10) scale(0.86)' }, svg), R, 'kebun', '#e9be52');
    snap(el('g', { transform: 'translate(236 330) rotate(-3) scale(0.94)' }, svg), R, 'senja', '#e7826a');
    const fl = el('g', { filter: 'url(#castBig)' }, svg);
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(398 520) rotate(-14)' }, fl), R, 0.44);
    F.flora.flowers.melati(el('g', { transform: 'translate(322 566) rotate(10)' }, fl), R, 0.4);
    F.flora.flowers.melati(el('g', { transform: 'translate(64 84) rotate(30)' }, fl), R, 0.36);
    loosePetals(svg, R, [[70, 520, 40, 0.34, 'kambojaPink'], [130, 566, -60, 0.28, 'kamboja']]);
  } };

  /* ── karet gelang merah yang melilit tumpukan foto: dua utas di depan, ujungnya melengkung ke belakang kartu ── */
  F.sprites['polaroid-karet'] = { w: 360, h: 72, seed: 447, draw(svg, R) {
    // karet gelang dililit dua kali: dua utas melintang di atas foto, saling silang,
    // ujungnya menekuk di tepi tumpukan (karetnya lanjut ke balik foto)
    const RUB = { base: '#c63a2c', light: '#f08068', dark: '#7c1c14' };
    const strands = [
      'M12,31C92,23 246,27 348,41',
      'M12,44C104,52 262,45 348,30',
    ];
    const g = el('g', { filter: 'url(#cast)' }, svg);
    // bayangan karet di permukaan foto
    strands.forEach((d) => el('path', { d, fill: 'none', stroke: WARM, 'stroke-width': 10, 'stroke-opacity': 0.24, 'stroke-linecap': 'round', transform: 'translate(2 4)', filter: 'url(#blur2)' }, svg));
    const paint = el('g', { filter: 'url(#impastoFine)' }, g);
    strands.forEach((d) => {
      el('path', { d, fill: 'none', stroke: RUB.dark, 'stroke-width': 9.4, 'stroke-linecap': 'round' }, paint);
      el('path', { d, fill: 'none', stroke: RUB.base, 'stroke-width': 6.8, 'stroke-linecap': 'round' }, paint);
      // kilap karet: garis tipis terang, putus-putus seperti permukaan karet yang tak rata
      el('path', { d, fill: 'none', stroke: RUB.light, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-opacity': 0.8, 'stroke-dasharray': `${40 + R() * 30} ${10 + R() * 12} ${70 + R() * 40} 14`, transform: 'translate(0 -1.8)' }, paint);
    });
    // tekukan di tepi: karet berbelok ke balik tumpukan, sedikit lebih gelap
    [[12, 31], [12, 44], [348, 41], [348, 30]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4.4, fill: RUB.dark, 'fill-opacity': 0.75 }, paint));
  } };
})();
