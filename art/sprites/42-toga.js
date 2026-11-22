/* Lempar Toga: topi beludru berumbai emas, topi kecil yang beterbangan, gulungan ijazah berpita,
   batang & segel sertifikat, pita kalimat, bintang, dan langit senja kampus. */
(() => {
  const F = window.FLOA;
  const { el, painted, dabs, mix, jitter, ramp, petal, leaf } = F;

  const GOLD = { mid: '#f2c14e', light: '#fff0b0', dark: '#b67f1c', deep: '#8a5a12' };
  const VEL = { mid: '#2b418f', light: '#6582d6', dark: '#121b47' };
  const RED = { stops: [[0, '#8f1731'], [0.45, '#d8394a'], [1, '#ff9a8f']], shade: '#7a1029', light: '#ffd0c8' };
  const PAPER = { base: '#f8ead0', light: '#fffaf0', dark: '#cdb07a' };
  const SHADOW = '#3a1d12';

  const rope = (g, d, w) => {
    el('path', { d, fill: 'none', stroke: GOLD.deep, 'stroke-width': w + 2.4, 'stroke-linecap': 'round' }, g);
    el('path', { d, fill: 'none', stroke: GOLD.mid, 'stroke-width': w, 'stroke-linecap': 'round' }, g);
    el('path', { d, fill: 'none', stroke: GOLD.light, 'stroke-width': w * 0.5, 'stroke-dasharray': `${w * 0.7} ${w * 0.9}`, 'stroke-opacity': 0.85 }, g);
  };

  /** Topi toga beludru, koordinat lokal 420×300. Ujung tali di (352,124). */
  function cap(svg, R) {
    // badan topi
    painted(svg, 'M112,150L112,222Q210,276 308,222L308,150L210,192Z', {
      base: F.linGrad(svg, [[0, VEL.mid], [0.3, mix(VEL.mid, VEL.light, 0.35)], [1, VEL.dark]], 112, 0, 308, 0), n: 80, R, filter: 'impasto', cast: 'cast',
      stroke: () => {
        const x = 114 + R() * 192, t = (x - 112) / 196, y = 160 + R() * 70, L = 18 + R() * 30;
        const c = t > 0.55 ? mix(VEL.mid, VEL.dark, (t - 0.55) * 2) : mix(VEL.mid, VEL.light, R() * 0.55);
        return { d: `M${x},${y}q${(R() - 0.5) * 6},${L / 2} ${(R() - 0.5) * 4},${L}`, color: jitter(c, 6, R), width: 8 + R() * 10, opacity: 0.4 + R() * 0.4 };
      },
    });
    // lis emas di tepi bawah
    painted(svg, 'M112,202Q210,256 308,202L308,222Q210,276 112,222Z', {
      base: F.linGrad(svg, [[0, GOLD.light], [0.35, GOLD.mid], [1, GOLD.dark]], 112, 0, 308, 0), n: 26, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 114 + R() * 190, y = 204 + R() * 20 + 54 * (1 - ((x - 210) / 98) ** 2) * 0.5, L = 14 + R() * 26; return { d: `M${x},${y}q${L / 2},${(210 - x) * 0.02} ${L},${(210 - x - L) * 0.04}`, color: jitter(R() < 0.5 ? GOLD.light : GOLD.dark, 6, R), width: 3 + R() * 4, opacity: 0.5 }; },
    });
    // tebal papan
    painted(svg, 'M20,104L210,178L400,104L400,123L210,197L20,123Z', {
      base: F.linGrad(svg, [[0, mix(VEL.dark, VEL.mid, 0.5)], [1, '#0b1233']], 20, 0, 400, 0), n: 30, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const x = 20 + R() * 380; const y = 104 + (1 - Math.abs(x - 210) / 190) * 74 + R() * 18; return { d: `M${x},${y}l${14 + R() * 20},${(x < 210 ? 1 : -1) * 6}`, color: jitter(x < 210 ? VEL.mid : '#0b1233', 5, R), width: 5 + R() * 5, opacity: 0.5 }; },
    });
    // papan atas: beludru, sapuan searah dua tepinya
    const top = painted(svg, 'M210,30L400,104L210,178L20,104Z', {
      base: F.linGrad(svg, [[0, VEL.light], [0.4, VEL.mid], [1, VEL.dark]], 60, 50, 340, 170), n: 230, R, filter: 'impasto', cast: false,
      stroke: () => {
        const u = R(), v = R();
        // titik di dalam belah ketupat lewat dua sumbu tepinya
        const x = 20 + u * 190 + v * 190, y = 104 - u * 74 + v * 74;
        const along = R() < 0.6; // searah tepi kiri-atas atau kanan-atas
        const L = 26 + R() * 54;
        const dx = along ? 0.932 : 0.932, dy = along ? -0.363 : 0.363;
        const lit = 1 - (u * 0.35 + v * 0.9); // terang di kiri-atas
        let c = lit > 0.3 ? mix(VEL.mid, VEL.light, (lit - 0.3) * 0.9) : mix(VEL.mid, VEL.dark, (0.3 - lit) * 1.3);
        if (R() < 0.05) c = mix(c, '#b9c8ff', 0.22);
        return { d: `M${x - (dx * L) / 2},${y - (dy * L) / 2}l${dx * L},${dy * L}`, color: jitter(c, 7, R), width: 8 + R() * 12, opacity: 0.35 + R() * 0.45 };
      },
    });
    el('path', { d: 'M210,44L364,104L210,164L56,104Z', fill: 'none', stroke: '#9fb4f0', 'stroke-width': 1.6, 'stroke-opacity': 0.35, 'stroke-dasharray': '5 5' }, top.inner);
    const pipe = el('g', { filter: 'url(#impastoFine)' }, svg);
    el('path', { d: 'M210,30L400,104L210,178L20,104Z', fill: 'none', stroke: GOLD.dark, 'stroke-width': 6, 'stroke-linejoin': 'round' }, pipe);
    el('path', { d: 'M210,30L400,104L210,178L20,104Z', fill: 'none', stroke: GOLD.mid, 'stroke-width': 3.6, 'stroke-linejoin': 'round' }, pipe);
    el('path', { d: 'M22,103L210,30L398,103', fill: 'none', stroke: GOLD.light, 'stroke-width': 1.6, 'stroke-linejoin': 'round', 'stroke-opacity': 0.9 }, pipe);
    // tali + kancing
    const cord = el('g', { filter: 'url(#cast)' }, svg);
    rope(cord, 'M210,104Q292,96 352,124', 5);
    const btn = el('g', { filter: 'url(#cast)' }, svg);
    dabs(btn, { n: 1, R, filter: 'impastoFine', place: () => ({ x: 210, y: 106, rx: 19, ry: 11, color: GOLD.dark, opacity: 1 }) });
    dabs(btn, { n: 1, R, filter: 'impastoFine', place: () => ({ x: 210, y: 103, rx: 19, ry: 11, color: GOLD.mid, opacity: 1 }) });
    dabs(btn, { n: 1, R, filter: null, place: () => ({ x: 205, y: 100, rx: 9, ry: 4.4, color: GOLD.light, opacity: 0.9 }) });
  }

  /** Rumbai emas, lokal 70×190; simpul gantung di (35,6). */
  function tassel(svg, R) {
    const g = el('g', { filter: 'url(#cast)' }, svg);
    rope(g, 'M35,6L35,92', 4.4);
    const sk = el('g', { filter: 'url(#impastoFine)' }, g);
    for (let i = 0; i < 34; i++) {
      const t = i / 33 - 0.5, x0 = 35 + t * 15, x1 = 35 + t * 36 + (R() - 0.5) * 4, y1 = 168 + R() * 18;
      el('path', { d: `M${x0},104Q${x0 + t * 6},${140} ${x1},${y1}`, fill: 'none', stroke: jitter(t > 0.12 ? mix(GOLD.mid, GOLD.dark, 0.3 + R() * 0.5) : mix(GOLD.mid, GOLD.light, R() * 0.8), 6, R), 'stroke-width': 2.6 + R() * 2, 'stroke-linecap': 'round' }, sk);
    }
    dabs(g, { n: 1, R, filter: 'impastoFine', place: () => ({ x: 35, y: 99, rx: 10.5, ry: 9.5, color: GOLD.mid, opacity: 1 }) });
    dabs(g, { n: 1, R, filter: null, place: () => ({ x: 32, y: 96, rx: 4.4, ry: 3.2, color: GOLD.light, opacity: 0.9 }) });
    el('path', { d: 'M25,110Q35,115 45,110', fill: 'none', stroke: GOLD.deep, 'stroke-width': 4.4, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M25,108.5Q35,113.5 45,108.5', fill: 'none', stroke: GOLD.light, 'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: 0.8 }, g);
  }

  F.sprites['toga-topi'] = { w: 420, h: 300, seed: 511, draw: cap };
  F.sprites['toga-rumbai'] = { w: 70, h: 190, seed: 512, draw: tassel };
  F.sprites['toga-topi-kecil'] = { w: 210, h: 170, seed: 513, draw(svg, R) {
    cap(el('g', { transform: 'translate(4 6) scale(0.44)' }, svg), R);
    tassel(el('g', { transform: 'translate(158.9 60.6) rotate(-38) scale(0.44) translate(-35 -6)' }, svg), R);
  } };

  /** Gulungan ijazah berpita, lokal 400×190. */
  function roll(svg, R) {
    el('ellipse', { cx: 204, cy: 172, rx: 156, ry: 10, fill: SHADOW, opacity: 0.32, filter: 'url(#soft)' }, svg);
    const end = (cx, tone) => {
      const p = painted(svg, `M${cx - 15},94a15,41 0 1 0 30,0a15,41 0 1 0 -30,0Z`, { base: mix(PAPER.base, PAPER.dark, tone), n: 14, R, filter: 'impastoFine', cast: false, stroke: () => ({ d: `M${cx - 12 + R() * 24},${60 + R() * 60}l0,${10 + R() * 14}`, color: jitter(R() < 0.5 ? PAPER.light : PAPER.dark, 5, R), width: 4, opacity: 0.45 }) });
      el('ellipse', { cx, cy: 94, rx: 9, ry: 27, fill: 'none', stroke: mix(PAPER.dark, SHADOW, 0.25), 'stroke-width': 2 }, p.inner);
      el('ellipse', { cx, cy: 94, rx: 3.6, ry: 12, fill: mix(PAPER.dark, SHADOW, 0.3) }, p.inner);
    };
    end(352, 0.55);
    const stops = [[0, PAPER.light], [0.4, PAPER.base], [1, PAPER.dark]];
    const body = painted(svg, 'M48,53H352V135H48Z', {
      base: F.linGrad(svg, stops, 0, 53, 0, 135), n: 110, R, filter: 'impastoH', cast: 'cast',
      stroke: () => { const x = 48 + R() * 304, v = R(), L = 40 + R() * 110; return { d: `M${x - L / 2},${53 + v * 82}q${L / 2},${(R() - 0.5) * 3} ${L},0`, color: jitter(v > 0.7 ? mix(PAPER.base, PAPER.dark, (v - 0.7) * 2.6) : ramp(stops, v * 0.9), 5, R), width: 7 + R() * 10, opacity: 0.4 + R() * 0.4 }; },
    });
    // goresan tulisan samar
    for (const [x0, x1] of [[70, 168], [232, 330]]) for (let k = 0; k < 3; k++) {
      let d = `M${x0},${74 + k * 16}`; for (let x = x0; x < x1 - k * 14; x += 9) d += `q4.5,${(R() - 0.5) * 7} 9,0`;
      el('path', { d, fill: 'none', stroke: '#a88752', 'stroke-width': 2, 'stroke-opacity': 0.45, 'stroke-linecap': 'round' }, body.inner);
    }
    el('path', { d: 'M48,56H352', stroke: '#fff', 'stroke-width': 3, 'stroke-opacity': 0.6 }, body.inner);
    end(48, 0.2);
    // pita merah + simpul
    painted(svg, 'M180,49H220V139H180Z', { base: '#c8323f', n: 20, R, filter: 'impastoFine', cast: 'cast', stroke: () => { const x = 181 + R() * 38; return { d: `M${x},${50 + R() * 60}l0,${20 + R() * 30}`, color: jitter(x > 204 ? '#8f1731' : '#ff8f8f', 6, R), width: 5 + R() * 5, opacity: 0.45 }; } });
    const g = el('g', { transform: 'translate(200 56) scale(0.5)' }, svg);
    petal(g, { len: 196, w: 50, round: 0.3, notch: 20, R, n: 30, ...RED, transform: 'rotate(170)', side: 0.6 });
    petal(g, { len: 204, w: 50, round: 0.3, notch: 20, R, n: 30, ...RED, transform: 'rotate(192)', side: -0.6 });
    petal(g, { len: 120, w: 90, round: 1, R, n: 40, ...RED, transform: 'rotate(-98)', side: 0.7 });
    petal(g, { len: 120, w: 90, round: 1, R, n: 40, ...RED, transform: 'rotate(98)', side: -0.7 });
    painted(g, 'M-17,-20h34a8,8 0 0 1 8,8v24a8,8 0 0 1 -8,8h-34a8,8 0 0 1 -8,-8v-24a8,8 0 0 1 8,-8Z', { base: '#d43e4b', n: 12, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${-20 + R() * 40},-20l${(R() - 0.5) * 8},40`, color: R() < 0.5 ? '#ff9a8f' : '#a81f3d', width: 5 + R() * 5, opacity: 0.5 }) });
  }
  F.sprites['toga-gulungan'] = { w: 400, h: 190, seed: 521, draw: roll };

  // batang penggulung sertifikat, 500×60
  F.sprites['toga-batang'] = { w: 500, h: 60, seed: 522, draw(svg, R) {
    const stops = [[0, PAPER.light], [0.45, '#f1dfb8'], [1, '#bfa069']];
    painted(svg, 'M30,10h440a18,18 0 0 1 0,36h-440a18,18 0 0 1 0,-36Z', {
      base: F.linGrad(svg, stops, 0, 10, 0, 46), n: 70, R, filter: 'impastoH', cast: 'cast',
      stroke: () => { const x = 20 + R() * 460, v = R(), L = 40 + R() * 120; return { d: `M${x - L / 2},${10 + v * 36}l${L},0`, color: jitter(ramp(stops, v), 5, R), width: 4 + R() * 6, opacity: 0.4 + R() * 0.4 }; },
    });
    for (const x of [6, 468]) painted(svg, `M${x + 6},7h14a6,6 0 0 1 6,6v30a6,6 0 0 1 -6,6h-14a6,6 0 0 1 -6,-6v-30a6,6 0 0 1 6,-6Z`, {
      base: F.linGrad(svg, [[0, GOLD.light], [0.4, GOLD.mid], [1, GOLD.dark]], 0, 7, 0, 49), n: 10, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => ({ d: `M${x + 2 + R() * 22},${10 + R() * 30}l0,10`, color: jitter(R() < 0.5 ? GOLD.light : GOLD.dark, 5, R), width: 3, opacity: 0.5 }),
    });
  } };

  /** Segel emas berpita, lokal 130×170; pusat segel di (65,60). */
  function seal(svg, R) {
    const tails = el('g', { transform: 'translate(65 70) scale(0.5)' }, svg);
    petal(tails, { len: 190, w: 54, round: 0.3, notch: 22, R, n: 26, ...RED, transform: 'rotate(166)', side: 0.6 });
    petal(tails, { len: 190, w: 54, round: 0.3, notch: 22, R, n: 26, ...RED, transform: 'rotate(196)', side: -0.6 });
    let d = '';
    for (let k = 0; k < 28; k++) { const a = (Math.PI * 2 * k) / 28, r = k % 2 ? 46 : 53; d += `${k ? 'L' : 'M'}${65 + Math.cos(a) * r},${60 + Math.sin(a) * r}`; }
    painted(svg, d + 'Z', {
      base: F.radGrad(svg, [[0, GOLD.light], [0.55, GOLD.mid], [1, GOLD.dark]], 50, 44, 70), n: 60, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const a = R() * Math.PI * 2, r0 = 12 + R() * 22, r1 = r0 + 10 + R() * 14; const sh = Math.cos(a - Math.PI / 4); return { d: `M${65 + Math.cos(a) * r0},${60 + Math.sin(a) * r0}L${65 + Math.cos(a) * r1},${60 + Math.sin(a) * r1}`, color: jitter(sh > 0 ? mix(GOLD.mid, GOLD.dark, sh * 0.8) : mix(GOLD.mid, GOLD.light, -sh * 0.9), 6, R), width: 4 + R() * 5, opacity: 0.5 }; },
    });
    el('circle', { cx: 65, cy: 60, r: 36, fill: 'none', stroke: GOLD.deep, 'stroke-width': 1.8, opacity: 0.6 }, svg);
    let s = '';
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (Math.PI * 2 * k) / 10, r = k % 2 ? 10 : 25; s += `${k ? 'L' : 'M'}${65 + Math.cos(a) * r},${60 + Math.sin(a) * r}`; }
    painted(svg, s + 'Z', { base: '#fff3c4', n: 10, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${50 + R() * 30},${44 + R() * 30}l8,6`, color: R() < 0.5 ? '#ffffff' : GOLD.mid, width: 4, opacity: 0.5 }) });
  }
  F.sprites['toga-segel'] = { w: 130, h: 170, seed: 523, draw: seal };

  // pita kalimat (border-image: irisan kiri/kanan 100, tengah meregang), 520×104
  F.sprites['toga-pita'] = { w: 520, h: 104, seed: 531, draw(svg, R) {
    const band = [[0, '#ffe79a'], [0.4, GOLD.mid], [1, '#d59a27']];
    const tail = (d, x0) => painted(svg, d, {
      base: '#c08e25', n: 16, R, filter: 'impastoFine', cast: false,
      stroke: () => ({ d: `M${x0 + R() * 84},${32 + R() * 58}l${20 + R() * 20},0`, color: jitter(R() < 0.4 ? '#dba93a' : '#9a6c14', 5, R), width: 5 + R() * 6, opacity: 0.5 }),
    });
    tail('M8,30H92V92H8L34,61Z', 8);
    tail('M512,30H428V92H512L486,61Z', 428);
    el('path', { d: 'M64,76L92,92H64Z', fill: '#6f4a0c', opacity: 0.85 }, svg);
    el('path', { d: 'M456,76L428,92H456Z', fill: '#6f4a0c', opacity: 0.85 }, svg);
    const p = painted(svg, 'M64,12H456V76H64Z', {
      base: F.linGrad(svg, band, 0, 12, 0, 76), n: 120, R, filter: 'impastoH', cast: 'cast',
      stroke: () => { const x = 64 + R() * 392, v = R(), L = 50 + R() * 130; let c = ramp(band, v); if (R() < 0.14) c = mix(c, '#fff8d8', 0.6); return { d: `M${x - L / 2},${12 + v * 64}q${L / 2},${(R() - 0.5) * 3} ${L},0`, color: jitter(c, 6, R), width: 5 + R() * 8, opacity: 0.4 + R() * 0.4 }; },
    });
    el('path', { d: 'M64,18.5H456M64,69.5H456', stroke: '#fff6d0', 'stroke-width': 1.5, 'stroke-dasharray': '6 5', 'stroke-opacity': 0.75 }, p.inner);
  } };

  // bintang emas kecil, 64×64
  const STAR = 'M32,4L37,27L60,32L37,37L32,60L27,37L4,32L27,27Z';
  F.sprites['toga-bintang'] = { w: 64, h: 64, seed: 532, draw(svg, R) {
    el('circle', { cx: 32, cy: 32, r: 26, fill: F.radGrad(svg, [[0, '#fff3c4', 0.7], [1, '#fff3c4', 0]], 32, 32, 26) }, svg);
    painted(svg, STAR, { base: '#ffe08a', n: 10, R, filter: 'impastoFine', cast: false, stroke: () => ({ d: `M${20 + R() * 24},${20 + R() * 24}l6,6`, color: R() < 0.5 ? '#ffffff' : GOLD.mid, width: 4, opacity: 0.6 }) });
  } };

  // ── langit senja kampus ──
  const NIGHT = ['#131a3c', '#1b2450', '#0f1530', '#232c5a'];
  function palm(svg, R, x, y, h, lean, s = 1) {
    const tx = x + lean, ty = y - h;
    el('path', { d: `M${x},${y}Q${x + lean * 0.2},${y - h * 0.55} ${tx},${ty}`, fill: 'none', stroke: NIGHT[2], 'stroke-width': 13 * s, 'stroke-linecap': 'round' }, svg);
    for (const a of [-152, -118, -84, -52, -20, 16, 48, 196]) {
      leaf(svg, { len: (150 + R() * 40) * s, w: 30 * s, dark: NIGHT[2], mid: NIGHT[0], light: NIGHT[3], R, n: 14, cast: false, filter: 'impastoFine', transform: `translate(${tx} ${ty}) rotate(${a + 90 + (R() - 0.5) * 14})`, curve: a < -84 ? -0.9 : 0.9 });
    }
  }
  function campus(svg, R, y0) {
    const g = el('g', { filter: 'url(#blur2)' }, svg);
    dabs(g, { n: 90, R, filter: 'impastoH', place: (i, R2) => ({ x: R2() * 780, y: y0 + 70 + R2() * 130 + Math.sin(R2() * 9) * 10, rx: 30 + R2() * 46, ry: 20 + R2() * 26, rot: R2() * 180, color: jitter(NIGHT[Math.floor(R2() * 4)], 5, R2), opacity: 0.95 }) });
    // gedung berpedimen dengan menara kecil
    const b = painted(g, `M236,${y0 + 62}L390,${y0 - 18}L544,${y0 + 62}V${y0 + 220}H236Z`, {
      base: NIGHT[1], n: 60, R, filter: 'impastoFine', cast: false,
      stroke: () => ({ d: `M${240 + R() * 300},${y0 + R() * 200}l0,${30 + R() * 50}`, color: jitter(NIGHT[Math.floor(R() * 4)], 5, R), width: 10 + R() * 14, opacity: 0.6 }),
    });
    painted(g, `M366,${y0 - 6}V${y0 - 60}Q390,${y0 - 92} 414,${y0 - 60}V${y0 - 6}Z`, { base: NIGHT[0], n: 8, R, filter: 'impastoFine', cast: false, stroke: () => ({ d: `M${370 + R() * 40},${y0 - 70 + R() * 50}l0,20`, color: NIGHT[3], width: 6, opacity: 0.5 }) });
    el('path', { d: `M390,${y0 - 86}V${y0 - 118}`, stroke: NIGHT[2], 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    for (let k = 0; k < 6; k++) el('rect', { x: 262 + k * 46, y: y0 + 78, width: 12, height: 130, fill: NIGHT[3], opacity: 0.6 }, b.inner);
    // jendela menyala
    dabs(svg, { n: 12, R, filter: 'soft', place: (i) => ({ x: 284 + (i % 6) * 46 - 6 + (i > 5 ? 23 : 0) * 0, y: y0 + (i > 5 ? 150 : 104), rx: 9, ry: 13, color: '#ffcf7a', opacity: 0.5 }) });
    dabs(svg, { n: 12, R, filter: 'impastoFine', place: (i) => ({ x: 284 + (i % 6) * 46 - 6, y: y0 + (i > 5 ? 150 : 104), rx: 4.6, ry: 8, color: i % 5 === 3 ? '#ff9d5c' : '#ffe08a', opacity: 0.95 }) });
    palm(svg, R, 96, y0 + 230, 300, 26, 1);
    palm(svg, R, 30, y0 + 240, 210, -18, 0.8);
    palm(svg, R, 676, y0 + 230, 330, -30, 1.05);
    palm(svg, R, 752, y0 + 240, 220, 14, 0.8);
  }
  const DUSK = [[0, '#0d1638'], [0.28, '#18265a'], [0.5, '#33306f'], [0.66, '#6d3f78'], [0.8, '#c96a62'], [0.9, '#f0a35a'], [1, '#f8cf7a']];
  function stars(svg, R, n, w, h) {
    dabs(svg, { n, R, filter: null, place: (i, R2) => { const big = R2() < 0.12; return { x: R2() * w, y: Math.pow(R2(), 1.3) * h, rx: big ? 2.8 : 0.9 + R2() * 1.4, color: R2() < 0.4 ? '#ffe7b0' : '#ffffff', opacity: 0.35 + R2() * 0.6 }; } });
  }
  F.sprites['bg-toga'] = { w: F.latar.W, h: F.latar.H, seed: 541, scale: 1, draw(svg, R) {
    F.latar.sky(svg, R, DUSK, { n: 620 });
    F.latar.clouds(svg, R, '#4a3f86', [[220, 520, 520, 70, 0.4], [620, 800, 420, 60, 0.35]]);
    F.latar.clouds(svg, R, '#f39a6a', [[400, 1120, 640, 56, 0.42], [130, 1000, 340, 44, 0.3]]);
    F.latar.clouds(svg, R, '#ffd08a', [[560, 1220, 520, 46, 0.45]]);
    stars(svg, R, 150, 780, 900);
    el('rect', { x: 0, y: 900, width: 780, height: 600, fill: F.radGrad(svg, [[0, '#ffd98a', 0.5], [1, '#ffd98a', 0]], 390, 1420, 520) }, svg);
    campus(svg, R, 1262);
  } };

  // ── kartu katalog: toga melayang di langit senja ──
  F.sprites['cover-toga'] = { w: 480, h: 600, seed: 551, draw(svg, R) {
    const bg = el('g', { transform: 'scale(0.62)' }, svg);
    F.latar.sky(bg, R, [[0, '#0d1638'], [0.2, '#18265a'], [0.36, '#33306f'], [0.47, '#6d3f78'], [0.55, '#c96a62'], [0.61, '#f0a35a'], [0.66, '#f8cf7a'], [1, '#f8cf7a']], { n: 380 });
    F.latar.clouds(bg, R, '#4a3f86', [[230, 330, 480, 60, 0.4]]);
    F.latar.clouds(bg, R, '#f39a6a', [[420, 760, 620, 50, 0.45], [120, 660, 320, 40, 0.3]]);
    stars(bg, R, 110, 780, 620);
    campus(el('g', { transform: 'translate(0 -480)' }, bg), R, 1262);
    // jejak lemparan
    for (const d of ['M190,560Q170,470 206,372', 'M300,566Q326,480 292,386']) el('path', { d, fill: 'none', stroke: '#ffe9b0', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '2 13', 'stroke-opacity': 0.55 }, svg);
    for (const [x, y, k, r] of [[40, 70, 0.3, -24], [352, 44, 0.26, 20], [372, 300, 0.24, 34], [22, 316, 0.22, -40]]) {
      const g = el('g', { transform: `translate(${x} ${y}) rotate(${r}) scale(${k})` }, svg);
      cap(g, R); tassel(el('g', { transform: 'translate(352 124) rotate(-30) translate(-35 -6)' }, g), R);
    }
    dabs(svg, { n: 44, R, filter: 'impastoFine', place: (i, R2) => ({ x: R2() * 480, y: 40 + R2() * 440, rx: 4 + R2() * 5, ry: 2.4 + R2() * 2.4, rot: R2() * 180, color: ['#f2c14e', '#ffe08a', '#fff7dd', '#7fa4f0', '#ff9d5c'][i % 5], opacity: 0.85 }) });
    const main = el('g', { transform: 'translate(52 120) rotate(-11 190 130) scale(0.9)' }, svg);
    el('circle', { cx: 210, cy: 120, r: 250, fill: F.radGrad(svg, [[0, '#ffe9b0', 0.38], [1, '#ffe9b0', 0]], 210, 120, 250) }, main);
    cap(main, R);
    tassel(el('g', { transform: 'translate(352 124) rotate(-16) translate(-35 -6)' }, main), R);
    roll(el('g', { transform: 'translate(118 440) rotate(-7) scale(0.62)' }, svg), R);
  } };
})();
