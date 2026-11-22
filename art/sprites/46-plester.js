/* Plester Hati: hati gouache (retak-pucat dan pulih), plester kain, nampan enamel, meja bertaplak, kartu katalog. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf } = F;
  const { W, H } = F.latar; // 780 × 1500
  const INK = '#3a1d12';

  // ── hati: kanvas 600×560, dua belahan + versi utuh memakai kanvas yang sama ──
  const CRACK = 'L276,168L320,224L280,292L324,360L288,428';
  const LEFT = `M300,524C120,392 40,280 40,180C40,92 108,36 184,36C236,36 276,64 300,104${CRACK}Z`;
  const RIGHT = `M300,524C480,392 560,280 560,180C560,92 492,36 416,36C364,36 324,64 300,104${CRACK}Z`;
  const WHOLE = 'M300,524C120,392 40,280 40,180C40,92 108,36 184,36C236,36 276,64 300,104C324,64 364,36 416,36C492,36 560,92 560,180C560,280 480,392 300,524Z';
  const SEAM = `M300,104${CRACK}L300,524`;

  const PALE = { ramp: [[0, '#f3d6d6'], [0.4, '#dfb0b5'], [0.75, '#c58f99'], [1, '#a9717f']], hi: '#fbeceb', deep: '#93606f' };
  const VIVID = { ramp: [[0, '#ff9ea0'], [0.35, '#f4596b'], [0.72, '#d32f4d'], [1, '#a81b3b']], hi: '#ffd0cf', deep: '#8a1230' };

  /** Sapuan kuas melingkari bentuk hati; kiri-atas terang, kanan-bawah teduh. */
  function heartStroke(pal, R) {
    return () => {
      const x = 40 + R() * 520, y = 36 + R() * 488;
      const dx = x - 300, dy = y - 236;
      const m = Math.hypot(dx, dy) || 1;
      // arah sapuan: tegak lurus jari-jari (mengitari pusat), sedikit acak
      let tx = -dy / m, ty = dx / m;
      if (R() < 0.5) { tx = -tx; ty = -ty; }
      const L = 34 + R() * 96;
      const bend = (R() - 0.5) * L * 0.5;
      const x2 = x + tx * L, y2 = y + ty * L;
      const shade = Math.max(0, Math.min(1, ((x - 40) / 520) * 0.55 + ((y - 36) / 488) * 0.55 - 0.08 + (R() - 0.5) * 0.13));
      let c = ramp(pal.ramp, shade);
      if (R() < 0.07) c = mix(c, pal.hi, 0.6);
      return { d: `M${x},${y}Q${(x + x2) / 2 + (dx / m) * bend},${(y + y2) / 2 + (dy / m) * bend} ${x2},${y2}`, color: jitter(c, 6, R), width: 12 + R() * 26, opacity: 0.4 + R() * 0.45 };
    };
  }

  function heartBody(svg, R, d, pal, n) {
    const p = painted(svg, d, { base: F.linGrad(svg, pal.ramp, 80, 40, 520, 500), n, R, filter: 'impasto', cast: 'castBig', stroke: heartStroke(pal, R) });
    // kilap di bahu kiri + pantulan lembut di sisi kanan-bawah
    el('path', { d: 'M86,150C96,96 140,66 190,70', fill: 'none', stroke: '#ffffff', 'stroke-width': 22, 'stroke-linecap': 'round', 'stroke-opacity': 0.34, filter: 'url(#soft)' }, p.inner);
    el('path', { d: 'M96,128C106,98 128,82 154,78', fill: 'none', stroke: '#ffffff', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-opacity': 0.5 }, p.inner);
    el('path', { d: 'M500,300C470,370 410,440 330,500', fill: 'none', stroke: pal.deep, 'stroke-width': 40, 'stroke-linecap': 'round', 'stroke-opacity': 0.3, filter: 'url(#soft)' }, p.inner);
    return p;
  }

  const eye = (g, x, y) => {
    el('ellipse', { cx: x, cy: y, rx: 13, ry: 14.5, fill: INK }, g);
    el('circle', { cx: x - 4.5, cy: y - 5.5, r: 4, fill: '#fff', opacity: 0.85 }, g);
  };
  const line = (g, d, w = 9, c = INK, o = 1) => el('path', { d, fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-opacity': o }, g);

  function sadHalf(svg, R, side) {
    const p = heartBody(svg, R, side < 0 ? LEFT : RIGHT, PALE, 150);
    const g = p.inner;
    // tepi retakan: bayangan di dalam patahan + serpihan terang
    line(g, `M300,104${CRACK}L300,524`, 16, PALE.deep, 0.5).setAttribute('filter', 'url(#blur2)');
    line(g, `M300,104${CRACK}L300,524`, 3, '#6d3f4d', 0.7);
    if (side < 0) {
      line(g, 'M276,168L240,184L218,218M280,292L242,318M288,428L262,446', 4, '#7b4a57', 0.6);
      line(g, 'M274,170L240,186', 2, '#fff', 0.35).setAttribute('transform', 'translate(0 3)');
      eye(g, 188, 246);
      line(g, 'M160,214L214,198', 9);
    } else {
      line(g, 'M320,224L362,206L384,234M324,360L358,382', 4, '#7b4a57', 0.6);
      eye(g, 412, 246);
      line(g, 'M386,198L440,214', 9);
    }
    line(g, 'M270,362Q300,338 330,362', 9); // mulut murung, ikut terbelah
  }
  F.sprites['plester-hati-kiri'] = { w: 600, h: 560, seed: 461, draw(svg, R) { sadHalf(svg, R, -1); } };
  F.sprites['plester-hati-kanan'] = { w: 600, h: 560, seed: 462, draw(svg, R) { sadHalf(svg, R, 1); } };

  function healed(svg, R) {
    const p = heartBody(svg, R, WHOLE, VIVID, 280);
    const g = p.inner;
    // bekas retakan yang sudah menutup
    line(g, SEAM, 5, VIVID.deep, 0.32);
    line(g, SEAM, 2, '#ffb3b8', 0.4).setAttribute('transform', 'translate(-3 0)');
    el('ellipse', { cx: 152, cy: 300, rx: 34, ry: 21, fill: '#ffb1bb', opacity: 0.75, filter: 'url(#blur2)' }, g);
    el('ellipse', { cx: 448, cy: 300, rx: 34, ry: 21, fill: '#ff9aa6', opacity: 0.7, filter: 'url(#blur2)' }, g);
    line(g, 'M166,252Q188,224 210,252', 10);
    line(g, 'M390,252Q412,224 434,252', 10);
    line(g, 'M264,330Q300,372 336,330', 10);
    return p;
  }
  F.sprites['plester-hati-pulih'] = { w: 600, h: 560, seed: 463, draw(svg, R) { healed(svg, R); } };

  // ── plester kain: badan beranyam, bantalan kasa, lubang udara ──
  const KAIN = [
    { base: '#ecc095', dark: '#c9905f', light: '#fbe0c2', pad: '#fff3e2' },
    { base: '#f6a9b9', dark: '#d97b92', light: '#ffd5dd', pad: '#fff0f2' },
    { base: '#a3d5bf', dark: '#6fae95', light: '#d4efe3', pad: '#f3fbf7' },
    { base: '#f5cf6b', dark: '#d7a437', light: '#ffeaa8', pad: '#fff8e0' },
  ];
  /** Plester mendatar berpusat di (0,0), ukuran 176×58. */
  function plaster(g, R, k) {
    const body = 'M-59,-29h118a29,29 0 0 1 0,58h-118a29,29 0 0 1 0,-58Z';
    const p = painted(g, body, {
      base: k.base, n: 110, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => {
        const x = -88 + R() * 176, y = -29 + R() * 58;
        const horiz = R() < 0.5; // anyaman: benang melintang dan membujur
        const L = 8 + R() * 22;
        const c = R() < 0.5 ? mix(k.base, k.light, 0.3 + R() * 0.5) : mix(k.base, k.dark, 0.2 + R() * 0.5);
        return { d: horiz ? `M${x},${y}h${L}` : `M${x},${y}v${L * 0.7}`, color: jitter(c, 5, R), width: 2.4 + R() * 3.2, opacity: 0.45 + R() * 0.4 };
      },
    });
    el('path', { d: 'M-66,-21C-30,-26 30,-26 66,-21', fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-opacity': 0.4, filter: 'url(#blur2)' }, p.inner);
    el('path', { d: 'M-70,22C-30,27 30,27 70,22', fill: 'none', stroke: k.dark, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-opacity': 0.4, filter: 'url(#blur2)' }, p.inner);
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      el('circle', { cx: sx * (46 + i * 12), cy: -12 + j * 12, r: 2.4, fill: k.dark, opacity: 0.75 }, p.inner);
      el('circle', { cx: sx * (46 + i * 12) + 0.8, cy: -12 + j * 12 + 0.9, r: 1.1, fill: '#fff', opacity: 0.45 }, p.inner);
    }
    // bantalan kasa di tengah, sedikit menonjol
    painted(g, 'M-24,-23h48a8,8 0 0 1 8,8v30a8,8 0 0 1 -8,8h-48a8,8 0 0 1 -8,-8v-30a8,8 0 0 1 8,-8Z', {
      base: k.pad, n: 26, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = -30 + R() * 60, y = -22 + R() * 44; return { d: R() < 0.5 ? `M${x},${y}h${6 + R() * 14}` : `M${x},${y}v${5 + R() * 10}`, color: R() < 0.5 ? '#ffffff' : mix(k.pad, k.dark, 0.25), width: 2 + R() * 2.4, opacity: 0.55 }; },
    });
  }
  KAIN.forEach((k, i) => {
    F.sprites[`plester-kain-${i + 1}`] = { w: 200, h: 84, seed: 464 + i, draw(svg, R) { plaster(el('g', { transform: 'translate(100 41)' }, svg), R, k); } };
  });

  // ── nampan enamel putih bertepi biru ──
  function tray(svg, R) {
    const outer = 'M56,24h448a40,40 0 0 1 40,40v84a40,40 0 0 1 -40,40h-448a40,40 0 0 1 -40,-40v-84a40,40 0 0 1 40,-40Z';
    const p = painted(svg, outer, {
      base: '#f6f1e6', n: 90, R, filter: 'impastoH', cast: 'castBig',
      stroke: () => { const x = 16 + R() * 528, y = 24 + R() * 164; return { d: `M${x},${y}h${30 + R() * 110}`, color: jitter(R() < 0.4 ? '#ffffff' : R() < 0.5 ? '#d9d2c4' : '#ece5d6', 4, R), width: 8 + R() * 16, opacity: 0.5 }; },
    });
    // bibir nampan: garis biru enamel dengan kilap
    el('path', { d: outer, fill: 'none', stroke: '#2f5f9c', 'stroke-width': 9 }, p.inner);
    el('path', { d: outer, fill: 'none', stroke: '#8fb4e0', 'stroke-width': 2.5, 'stroke-opacity': 0.8, transform: 'translate(-1.5 -1.5)' }, p.inner);
    // cekungan bagian dalam
    const inner = 'M70,48h420a26,26 0 0 1 26,26v64a26,26 0 0 1 -26,26h-420a26,26 0 0 1 -26,-26v-64a26,26 0 0 1 26,-26Z';
    painted(svg, inner, {
      base: F.linGrad(svg, [[0, '#d5cdbd'], [0.3, '#ebe4d6'], [1, '#f8f4ea']], 0, 48, 0, 164), n: 70, R, filter: 'impastoH', cast: false,
      stroke: () => { const x = 44 + R() * 472, y = 48 + R() * 116; const v = (y - 48) / 116; return { d: `M${x},${y}h${24 + R() * 90}`, color: jitter(mix('#cfc6b4', '#fbf8f0', Math.min(1, v + R() * 0.3)), 4, R), width: 7 + R() * 13, opacity: 0.5 }; },
    });
    el('path', { d: 'M70,52h420', stroke: INK, 'stroke-width': 10, 'stroke-opacity': 0.16, filter: 'url(#soft)' }, svg);
    // bintik enamel yang terkelupas
    dabs(svg, { n: 16, R, filter: null, place: (i, R2) => ({ x: 60 + R2() * 440, y: 56 + R2() * 100, rx: 1 + R2() * 1.6, color: '#3d5f8c', opacity: 0.35 }) });
  }
  F.sprites['plester-nampan'] = { w: 560, h: 216, seed: 468, draw(svg, R) { tray(svg, R); } };

  // ── tetes air mata ──
  F.sprites['plester-tetes'] = { w: 56, h: 76, seed: 469, draw(svg, R) {
    painted(svg, 'M28,6C20,26 8,38 8,52A20,20 0 0 0 48,52C48,38 36,26 28,6Z', {
      base: '#8ecbee', n: 14, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 12 + R() * 32, y = 24 + R() * 40; return { d: `M${x},${y}q${(R() - 0.5) * 8},10 0,${14 + R() * 10}`, color: x < 26 ? '#d6f0fb' : '#5aa5d6', width: 4 + R() * 5, opacity: 0.6 }; },
    });
    el('ellipse', { cx: 21, cy: 46, rx: 4, ry: 7, fill: '#fff', opacity: 0.8, transform: 'rotate(18 21 46)' }, svg);
  } };

  // ── latar: dinding biru pucat + meja bertaplak, dengan seikat kamboja di sudut ──
  const TABLE = 944;
  function room(svg, R, { flora = true } = {}) {
    // dinding: sapuan tegak biru pucat yang menghangat ke arah meja
    const wall = [[0, '#bfd8e6'], [0.4, '#d3e5ec'], [0.75, '#e6efec'], [1, '#f1efe3']];
    wash(svg, { x: -40, y: -30, w: W + 80, h: TABLE + 50, R, n: 560, angle: 84, len: [0.1, 0.26], width: [26, 62], opacity: [0.3, 0.7], base: F.linGrad(svg, wall, 0, 0, 0, TABLE), color: (u, v) => ramp(wall, v + (u - 0.5) * 0.1) });
    // cahaya jendela jatuh miring di dinding: empat petak terang
    const light = el('g', { filter: 'url(#softer)', opacity: 0.34 }, svg);
    for (const d of ['M60,170L300,128L334,420L94,462Z', 'M330,122L560,82L594,374L364,414Z', 'M100,500L340,458L372,740L132,782Z', 'M370,452L600,412L632,694L402,734Z']) el('path', { d, fill: '#fffbea' }, light);
    dabs(svg, { n: 26, R, filter: 'soft', place: (i, R2) => ({ x: 80 + R2() * 540, y: 120 + R2() * 640, rx: 22 + R2() * 40, ry: 14 + R2() * 22, rot: -10, color: '#ffffff', opacity: 0.12 }) });
    // taplak: sapuan mendatar krem dengan lajur merah muda dan biru
    const cloth = (u, v) => {
      const stripe = Math.sin(v * 30) > 0.8 ? '#f2b9c0' : Math.sin(v * 30 + 2.1) > 0.93 ? '#b4d0e2' : null;
      const c = ramp([[0, '#f8eede'], [0.5, '#f4e6d2'], [1, '#e7d4bd']], v);
      return stripe ? mix(c, stripe, 0.5) : c;
    };
    wash(svg, { x: -40, y: TABLE, w: W + 80, h: H - TABLE + 20, R, n: 520, angle: 0, len: [0.14, 0.42], width: [8, 22], opacity: [0.4, 0.85], base: '#f4e7d4', filter: 'canvas', color: cloth, clip: `M-40,${TABLE}H${W + 40}V${H + 20}H-40Z` });
    // motif kawung samar di taplak
    const id = F.uid('k');
    const pt = el('pattern', { id, width: 92, height: 92, patternUnits: 'userSpaceOnUse' }, (svg.ownerSVGElement || svg).querySelector('defs'));
    for (const [cx, cy] of [[0, 0], [92, 0], [0, 92], [92, 92], [46, 46]]) {
      for (const an of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: 18, ry: 8, fill: 'none', stroke: '#a9744f', 'stroke-width': 1.6, transform: `rotate(${an} ${cx} ${cy}) translate(21 0)` }, pt);
      el('circle', { cx, cy, r: 2.4, fill: '#a9744f' }, pt);
    }
    el('rect', { x: -40, y: TABLE, width: W + 80, height: H - TABLE + 20, fill: `url(#${id})`, opacity: 0.2 }, svg);
    // tepi meja: bayangan di dinding + bibir taplak yang kena cahaya
    el('path', { d: `M-20,${TABLE - 14}H${W + 20}`, stroke: INK, 'stroke-width': 34, 'stroke-opacity': 0.13, filter: 'url(#soft)' }, svg);
    el('path', { d: `M-20,${TABLE + 3}H${W + 20}`, stroke: '#fffdf6', 'stroke-width': 6, 'stroke-opacity': 0.9, filter: 'url(#blur2)' }, svg);
    el('path', { d: `M-20,${TABLE + 22}H${W + 20}`, stroke: '#c9ab8c', 'stroke-width': 10, 'stroke-opacity': 0.25, filter: 'url(#soft)' }, svg);
    if (!flora) return;
    const fr = F.flora;
    // kiri: kamboja dengan dua daun, tergeletak di meja
    const a = el('g', { transform: `translate(34 ${TABLE + 150})` }, svg);
    leaf(a, { len: 210, w: 74, ...fr.GREEN[1], R, n: 40, transform: 'rotate(58)', curve: 0.2 });
    leaf(a, { len: 180, w: 66, ...fr.GREEN[0], R, n: 36, transform: 'rotate(18)', curve: -0.2 });
    fr.flowers.kamboja(el('g', { transform: 'translate(34 -6) rotate(20)' }, a), R, 0.6);
    // kanan: melati kecil dan daun
    const b = el('g', { transform: `translate(${W - 26} ${TABLE + 120})` }, svg);
    leaf(b, { len: 190, w: 64, ...fr.GREEN[2], R, n: 36, transform: 'rotate(-52)', curve: -0.2 });
    leaf(b, { len: 150, w: 56, ...fr.GREEN[3], R, n: 30, transform: 'rotate(-14)', curve: 0.2 });
    fr.flowers.melati(el('g', { transform: 'translate(-64 -70)' }, b), R, 0.75);
    fr.flowers.melati(el('g', { transform: 'translate(-28 -22) rotate(30)' }, b), R, 0.6);
    fr.flowers.kambojaPink(el('g', { transform: 'translate(-22 56) rotate(-30)' }, b), R, 0.42);
  }
  F.sprites['bg-plester'] = { w: W, h: H, seed: 470, scale: 1, draw(svg, R) { room(svg, R); } };

  // ── kartu katalog: hati yang sudah ditambal di atas meja ──
  F.sprites['cover-plester'] = { w: 480, h: 600, seed: 471, draw(svg, R) {
    room(el('g', { transform: 'translate(0 -330) scale(0.6154)' }, svg), R, { flora: false });
    el('ellipse', { cx: 240, cy: 498, rx: 120, ry: 15, fill: INK, opacity: 0.2, filter: 'url(#soft)' }, svg);
    const h = el('g', { transform: 'translate(36 92) scale(0.68) rotate(-3 300 280)' }, svg);
    healed(h, R);
    [[300, 162, -22, 0], [300, 268, 17, 1], [298, 430, -14, 2]].forEach(([x, y, r, k]) => plaster(el('g', { transform: `translate(${x} ${y}) rotate(${r})` }, h), R, KAIN[k]));
    // plester cadangan dan bunga di meja
    plaster(el('g', { transform: 'translate(396 540) rotate(-16) scale(0.6)' }, svg), R, KAIN[3]);
    const fr = F.flora;
    const a = el('g', { transform: 'translate(40 566)' }, svg);
    leaf(a, { len: 130, w: 46, ...fr.GREEN[1], R, n: 30, transform: 'rotate(64)', curve: 0.2 });
    leaf(a, { len: 110, w: 40, ...fr.GREEN[0], R, n: 26, transform: 'rotate(22)', curve: -0.2 });
    fr.flowers.kamboja(el('g', { transform: 'translate(26 -8) rotate(20)' }, a), R, 0.4);
  } };
})();
