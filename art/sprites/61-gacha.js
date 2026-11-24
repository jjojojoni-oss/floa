/* Gacha Hati: mesin kapsul di sudut toko mainan — dinding mint berkawung dengan ceruk lengkung, meja kayu muda,
   mesin koral berkubah kaca (badan + kaca depan terpisah supaya kapsul dari DOM berada di antaranya), kenop,
   koin, belahan kapsul warna-warni + kapsul emas, nampan, laci hadiah berisi amplop, dan pot untuk mini-game.
   Semua tulisan, angka, wajah, dan isi kapsul dipasang dari DOM di atas lukisan ini. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf, linGrad, radGrad } = F;
  const W = 780, H = 1500;
  const CORAL = { hi: '#ffc4cb', light: '#ff8e9c', base: '#ff5d73', mid: '#e5435c', dark: '#b52a45', deep: '#74162c' };
  const GOLD = { hi: '#fff3c4', light: '#f6d77c', base: '#e0aa3e', mid: '#b47f22', dark: '#7a5212', deep: '#4a300a' };
  const CREAM = ['#ead8b4', '#fbf1d8', '#fffaf0'];
  const MINT = { hi: '#f1fbf7', light: '#d9f2ea', base: '#bfe6dc', mid: '#96cfc1', dark: '#5fa596', deep: '#2f6f66' };
  const WARM = '#3a1d12';

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const circ = (cx, cy, r, cw = true) => `M${cx - r},${cy}A${r},${r} 0 1 ${cw ? 1 : 0} ${cx + r},${cy}A${r},${r} 0 1 ${cw ? 1 : 0} ${cx - r},${cy}Z`;
  const ring = (cx, cy, r2, r1) => circ(cx, cy, r2, true) + circ(cx, cy, r1, false);
  const pol = (cx, cy, r, deg) => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r];
  const HEART = 'M0,9C-15,-3 -8,-15 0,-7C8,-15 15,-3 0,9Z';

  /** bidang bebas dilukis dengan sapuan searah `dir`; cols = [gelap, dasar, terang] */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90], base } = {}) => painted(g, d, {
    base: base || cols[1], n, R, filter, cast,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.3 + R() * 0.4 };
    },
  });

  /** logam emas dipoles: gradien diagonal (terang di kiri-atas) + sapuan halus */
  const GOLD_STOPS = [[0, GOLD.light], [0.18, GOLD.hi], [0.4, GOLD.light], [0.62, GOLD.base], [0.85, GOLD.mid], [1, GOLD.dark]];
  function gold(g, d, box, R, { n = 30, cast = 'cast', dir = [0.3, 1] } = {}) {
    const [x, y, w, h] = box;
    return painted(g, d, {
      base: linGrad(g, GOLD_STOPS, x, y, x + w, y + h), n, R, filter: 'impastoFine', cast,
      stroke: () => {
        const u = R(), v = R(), L = Math.max(w, h) * (0.1 + R() * 0.22), m = Math.hypot(dir[0], dir[1]);
        return { d: `M${x + u * w},${y + v * h}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(ramp(GOLD_STOPS, (u + v) / 2 + (R() - 0.5) * 0.08), 4, R), width: 3 + R() * 6, opacity: 0.18 + R() * 0.22 };
      },
    });
  }

  /** kamboja kecil lima kelopak (tanda floa), berpusat di (0,0) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
  function mark(g, x, y, s, fill, opacity = 1) {
    const m = el('g', { transform: `translate(${x} ${y}) scale(${s})`, opacity }, g);
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill, transform: `rotate(${i * 72})` }, m);
    el('circle', { r: 3.4, fill: mix(fill, '#fff4cc', 0.6) }, m);
  }

  /** motif kawung sebagai pattern; mengembalikan url(#id) */
  function kawung(svg, color, size = 46, sw = 1.3) {
    const id = F.uid('kw');
    const pt = el('pattern', { id, width: size, height: size, patternUnits: 'userSpaceOnUse' }, (svg.ownerSVGElement || svg).querySelector('defs'));
    const h = size / 2;
    for (const [cx, cy] of [[0, 0], [size, 0], [0, size], [size, size], [h, h]]) {
      for (const an of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: size * 0.2, ry: size * 0.09, fill: 'none', stroke: color, 'stroke-width': sw, transform: `rotate(${an} ${cx} ${cy}) translate(${size * 0.23} 0)` }, pt);
      el('circle', { cx, cy, r: sw * 1.3, fill: color }, pt);
    }
    return `url(#${id})`;
  }

  /** bintang empat sudut kecil (kilau) */
  const sparkle = (g, x, y, s, fill = '#fffdf2', o = 0.9) => el('path', { d: `M0,${-s}Q${s * 0.16},${-s * 0.16} ${s},0Q${s * 0.16},${s * 0.16} 0,${s}Q${-s * 0.16},${s * 0.16} ${-s},0Q${-s * 0.16},${-s * 0.16} 0,${-s}Z`, fill, opacity: o, transform: `translate(${x} ${y})` }, g);

  /* ───────────── latar: dinding mint berkawung, ceruk lengkung, meja kayu muda ───────────── */
  const FLOOR = H - 372;
  function wall(svg, R, { decor = true } = {}) {
    const tone = [[0, '#d3efe6'], [0.45, '#bfe6dc'], [0.8, '#a6d8cc'], [1, '#8fc9bd']];
    wash(svg, {
      x: -40, y: -30, w: W + 80, h: FLOOR + 60, R, n: 430, angle: 88, len: [0.08, 0.2], width: [26, 64], opacity: [0.22, 0.5],
      base: radGrad(svg, tone, W * 0.5, H * 0.34, H * 0.72),
      color: (u, v) => ramp(tone, Math.hypot(u - 0.5, (v - 0.4) * 1.3) * 1.45),
    });
    el('rect', { x: 0, y: 0, width: W, height: FLOOR, fill: kawung(svg, '#ffffff', 84, 1.7), opacity: 0.26 }, svg);
    el('rect', { x: 0, y: 0, width: W, height: FLOOR, fill: kawung(svg, '#4f9a8c', 84, 1.5), opacity: 0.1, transform: 'translate(1.8 2.2)' }, svg);
    // ceruk lengkung tempat mesin berdiri: lebih terang, bertepi krem, sisi kiri-atasnya teduh
    const ax = 96, aw = W - 192, at = 150, ar = aw / 2;
    const arch = `M${ax},${FLOOR + 4}V${at + ar}A${ar},${ar} 0 0 1 ${ax + aw},${at + ar}V${FLOOR + 4}Z`;
    const nt = [[0, '#f4fcf8'], [0.6, '#e3f5ee'], [1, '#cbeadf']];
    shape(svg, arch, [ax, at, aw, FLOOR - at], ['#cbeadf', '#e6f6f0', '#fbfffd'], R, { n: 130, dir: [0.04, 1], width: [22, 50], len: [80, 220], filter: 'canvas', base: radGrad(svg, nt, W / 2, at + ar * 0.9, ar * 2.1) });
    const aid = F.uid('ar');
    el('path', { d: arch }, el('clipPath', { id: aid }, svg));
    const ag = el('g', { 'clip-path': `url(#${aid})` }, svg);
    el('path', { d: arch, fill: kawung(svg, '#8fcabb', 60, 1.2), opacity: 0.2 }, ag);
    el('path', { d: `M${ax},${FLOOR}V${at + ar}A${ar},${ar} 0 0 1 ${ax + aw},${at + ar}`, fill: 'none', stroke: '#2f6f66', 'stroke-width': 46, 'stroke-opacity': 0.2, filter: 'url(#soft)', transform: 'translate(10 14)' }, ag);
    el('path', { d: arch, fill: 'none', stroke: '#fffaf0', 'stroke-width': 9, 'stroke-opacity': 0.95 }, svg);
    el('path', { d: `M${ax - 9},${FLOOR}V${at + ar}A${ar + 9},${ar + 9} 0 0 1 ${ax + aw + 9},${at + ar}V${FLOOR}`, fill: 'none', stroke: '#6fb3a5', 'stroke-width': 2.4, 'stroke-opacity': 0.55 }, svg);
    // kilau kecil di dinding
    if (decor) {
      [[70, 330, 13], [712, 250, 16], [48, 760, 10], [736, 640, 11], [690, 96, 10], [118, 132, 12], [604, 178, 7], [30, 520, 7]].forEach(([x, y, s]) => sparkle(svg, x, y, s, '#fffdf2', 0.8));
      dabs(svg, { n: 26, R, filter: null, place: (i, R2) => ({ x: R2() < 0.5 ? R2() * 90 : W - R2() * 90, y: 60 + R2() * (FLOOR - 200), rx: 2 + R2() * 2.6, color: ['#fffdf2', '#ffd36e', '#ff9aa8'][Math.floor(R2() * 3)], opacity: 0.5 + R2() * 0.4 }) });
    }
    // meja kayu muda (dilihat sedikit dari atas)
    const wood = [[0, '#f7e2c6'], [0.5, '#f0d0ac'], [1, '#e4b98f']];
    wash(svg, { x: -40, y: FLOOR, w: W + 80, h: H - FLOOR + 30, R, n: 250, angle: 0, len: [0.25, 0.8], width: [6, 18], opacity: [0.28, 0.6], base: linGrad(svg, wood, 0, FLOOR, 0, H), filter: 'canvas', color: (u, v) => mix(ramp(wood, v), R() < 0.5 ? '#fff0d8' : '#d9a878', R() * 0.35) });
    for (let i = 0; i < 7; i++) {
      const y = FLOOR + 40 + i * 52 + R() * 18;
      el('path', { d: `M-20,${y}Q${W * 0.3},${y + (R() - 0.5) * 14} ${W * 0.62},${y + (R() - 0.5) * 8}T${W + 20},${y + (R() - 0.5) * 12}`, fill: 'none', stroke: '#b98152', 'stroke-width': 1.6, 'stroke-opacity': 0.22 }, svg);
    }
    el('rect', { x: 0, y: FLOOR, width: W, height: H - FLOOR, fill: kawung(svg, '#ffffff', 96, 1.6), opacity: 0.1 }, svg);
    // pertemuan dinding & meja: bayangan lembut + garis terang di bibir meja
    el('path', { d: `M-20,${FLOOR - 10}H${W + 20}`, stroke: '#2f6f66', 'stroke-width': 30, 'stroke-opacity': 0.2, filter: 'url(#soft)' }, svg);
    el('path', { d: `M-20,${FLOOR + 2}H${W + 20}`, stroke: '#fff6e2', 'stroke-width': 4, 'stroke-opacity': 0.8, filter: 'url(#blur2)' }, svg);
    // cahaya hangat dari kiri-atas, tepi yang sedikit teduh
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#fff6dc', 0.24], [0.5, '#fff6dc', 0.06], [1, '#fff6dc', 0]], W * 0.3, H * 0.2, 760) }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#000', 0], [0.6, '#000', 0], [1, '#1f4a44', 0.3]], W / 2, H * 0.45, H * 0.78) }, svg);
    if (!decor) return;
    const fr = F.flora, gr = fr.GREEN;
    const lf = (x, y, rot, len, w, k, curve = 0.15) => leaf(svg, { len, w, ...gr[k], R, n: 44, curve, transform: `translate(${x} ${y}) rotate(${rot})` });
    // daun tropis menyembul dari tepi kiri & kanan, kamboja di kaki ceruk
    lf(-26, FLOOR - 40, 34, 300, 108, 0, 0.2);
    lf(-30, FLOOR + 10, 62, 250, 96, 1, -0.16);
    lf(W + 28, FLOOR - 70, -30, 310, 110, 2, -0.2);
    lf(W + 30, FLOOR - 4, -64, 240, 92, 3, 0.18);
    fr.flowers.kambojaPink(el('g', { transform: `translate(40 ${FLOOR + 6}) rotate(14)` }, svg), R, 0.5);
    fr.flowers.kamboja(el('g', { transform: `translate(${W - 34} ${FLOOR + 14}) rotate(-18)` }, svg), R, 0.46);
    fr.flowers.melati(el('g', { transform: `translate(${W - 116} ${FLOOR + 44}) scale(0.62)` }, svg), R, 1);
    fr.flowers.melati(el('g', { transform: `translate(112 ${FLOOR + 52}) scale(0.56)` }, svg), R, 1);
  }

  /* ───────────── mesin: kanvas 600×944, sumbu tengah x=300 ───────────── */
  const MW = 600, MH = 944;
  const G = { x: 300, y: 290, r: 208 };
  const KNOB = { x: 300, y: 690 }, SLOT = { x: 160, y: 690 }, DIAL = { x: 440, y: 690 };

  /** badan mesin + kaca belakang kubah (kapsul dari DOM berada di depan lapisan ini) */
  function body(g, R) {
    el('ellipse', { cx: 310, cy: 930, rx: 268, ry: 13, fill: WARM, opacity: 0.4, filter: 'url(#soft)' }, g);
    // kaki
    for (const x of [86, 474]) el('path', { d: rrect(x, 920, 40, 18, 6), fill: CORAL.deep }, g);
    // kaca belakang kubah: tembus pandang, lebih putih di kiri-atas
    el('circle', { cx: G.x, cy: G.y, r: G.r - 3, fill: radGrad(g, [[0, '#ffffff', 0.56], [0.45, '#e6f7f2', 0.5], [0.82, '#a5d9cc', 0.66], [1, '#69b0a1', 0.82]], G.x - 64, G.y - 76, G.r * 1.34) }, g);
    const gid = F.uid('gb');
    el('circle', { cx: G.x, cy: G.y, r: G.r - 3 }, el('clipPath', { id: gid }, g));
    const gg = el('g', { 'clip-path': `url(#${gid})` }, g);
    el('ellipse', { cx: G.x + 16, cy: G.y + 176, rx: 200, ry: 62, fill: '#2f6f66', opacity: 0.3, filter: 'url(#softer)' }, gg);
    el('circle', { cx: G.x + 10, cy: G.y + 12, r: G.r, fill: 'none', stroke: '#2f6f66', 'stroke-width': 26, 'stroke-opacity': 0.2, filter: 'url(#soft)' }, gg);
    // alas
    const base = rrect(40, 862, 520, 64, 16);
    shape(g, base, [40, 862, 520, 64], [CORAL.deep, CORAL.dark, CORAL.mid], R, { n: 40, dir: [1, 0], width: [8, 16], cast: 'castBig', base: linGrad(g, [[0, CORAL.mid], [0.3, CORAL.dark], [1, CORAL.deep]], 40, 862, 560, 926) });
    el('path', { d: 'M56,866H544', stroke: CORAL.hi, 'stroke-width': 2.4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, g);
    el('path', { d: rrect(168, 872, 264, 50, 10), fill: '#3d0a17' }, g);
    el('path', { d: rrect(168, 872, 264, 50, 10), fill: 'none', stroke: CORAL.hi, 'stroke-width': 1.4, 'stroke-opacity': 0.3, transform: 'translate(0 1.5)' }, g);
    // badan
    const bd = rrect(58, 516, 484, 354, 40);
    const p = shape(g, bd, [58, 516, 484, 354], [CORAL.dark, CORAL.base, CORAL.light], R, { n: 150, dir: [0.04, 1], width: [12, 28], len: [50, 150], filter: 'impasto', cast: 'castBig', base: linGrad(g, [[0, CORAL.light], [0.2, CORAL.base], [0.7, CORAL.base], [1, CORAL.mid]], 58, 0, 542, 0) });
    el('path', { d: 'M84,560V830', stroke: '#fff', 'stroke-width': 16, 'stroke-opacity': 0.26, 'stroke-linecap': 'round', filter: 'url(#soft)' }, p.inner);
    el('rect', { x: 430, y: 516, width: 120, height: 360, fill: linGrad(g, [[0, CORAL.deep, 0], [1, CORAL.deep, 0.34]], 430, 0, 550, 0) }, p.inner);
    el('rect', { x: 58, y: 500, width: 484, height: 66, fill: linGrad(g, [[0, '#4a0e1c', 0.55], [1, '#4a0e1c', 0]], 0, 516, 0, 566) }, p.inner);
    el('rect', { x: 58, y: 800, width: 484, height: 72, fill: linGrad(g, [[0, '#4a0e1c', 0], [1, '#4a0e1c', 0.32]], 0, 800, 0, 872) }, p.inner);
    // panel depan krem, sedikit masuk ke dalam
    const pn = rrect(86, 546, 428, 306, 24);
    el('path', { d: rrect(82, 542, 436, 314, 27), fill: CORAL.dark, opacity: 0.55 }, g);
    const pp = shape(g, pn, [86, 546, 428, 306], CREAM, R, { n: 90, dir: [1, 0.03], width: [12, 26], len: [60, 160] });
    el('path', { d: pn, fill: kawung(g, '#c9a66a', 50, 1.1), opacity: 0.13 }, pp.inner);
    el('path', { d: rrect(92, 554, 428, 306, 24), fill: 'none', stroke: WARM, 'stroke-width': 16, 'stroke-opacity': 0.2, filter: 'url(#soft)' }, pp.inner);
    el('path', { d: pn, fill: linGrad(g, [[0, '#fff', 0.2], [0.5, '#fff', 0], [1, '#7a4a1c', 0.16]], 86, 546, 514, 852) }, pp.inner);
    // sekrup di sudut panel
    for (const [x, y] of [[106, 634], [494, 634], [106, 832], [494, 832]]) {
      el('circle', { cx: x, cy: y, r: 6, fill: radGrad(g, [[0, GOLD.hi], [0.6, GOLD.base], [1, GOLD.dark]], x - 2, y - 2, 8) }, g);
      el('path', { d: `M${x - 3.4},${y + 2.4}L${x + 3.4},${y - 2.4}`, stroke: GOLD.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.7 }, g);
    }
    // papan nama (tulisannya dari DOM)
    gold(g, rrect(130, 558, 340, 56, 13), [130, 558, 340, 56], R, { n: 24 });
    el('path', { d: rrect(137, 565, 326, 42, 8), fill: linGrad(g, [[0, '#f3e6c6'], [0.25, '#fffdf4'], [1, '#fff6e0']], 0, 565, 0, 607), stroke: GOLD.deep, 'stroke-width': 1.2, 'stroke-opacity': 0.5 }, g);
    for (const x of [146, 454]) el('circle', { cx: x, cy: 586, r: 2.6, fill: GOLD.dark, opacity: 0.7 }, g);
    // lubang koin: pelat kuningan, celah tegak, lampu kecil (nyalanya dari DOM)
    gold(g, rrect(SLOT.x - 39, SLOT.y - 56, 78, 112, 15), [SLOT.x - 39, SLOT.y - 56, 78, 112], R, { n: 22 });
    el('path', { d: rrect(SLOT.x - 33, SLOT.y - 50, 66, 100, 11), fill: 'none', stroke: GOLD.deep, 'stroke-width': 1.2, 'stroke-opacity': 0.45 }, g);
    el('path', { d: rrect(SLOT.x - 8, SLOT.y - 22, 16, 58, 8), fill: '#2a1408' }, g);
    el('path', { d: rrect(SLOT.x - 8, SLOT.y - 22, 16, 58, 8), fill: 'none', stroke: GOLD.hi, 'stroke-width': 1.6, 'stroke-opacity': 0.8, transform: 'translate(1.2 1.4)' }, g);
    el('circle', { cx: SLOT.x, cy: SLOT.y - 38, r: 7.5, fill: '#4a2a10', stroke: GOLD.deep, 'stroke-width': 1.2 }, g);
    // dudukan kenop: cincin kuningan + piringan krem bergaris (kenopnya sprite sendiri)
    gold(g, circ(KNOB.x, KNOB.y, 78), [KNOB.x - 78, KNOB.y - 78, 156, 156], R, { n: 30 });
    el('circle', { cx: KNOB.x, cy: KNOB.y, r: 70, fill: radGrad(g, [[0, '#fffdf4'], [0.7, '#f6e9cc'], [1, '#e3cfa2']], KNOB.x - 20, KNOB.y - 24, 90), stroke: GOLD.deep, 'stroke-width': 1.2, 'stroke-opacity': 0.5 }, g);
    for (let i = 0; i < 24; i++) {
      const [x0, y0] = pol(KNOB.x, KNOB.y, i % 3 ? 65 : 62, i * 15), [x1, y1] = pol(KNOB.x, KNOB.y, 68.5, i * 15);
      el('path', { d: `M${x0},${y0}L${x1},${y1}`, stroke: CORAL.dark, 'stroke-width': i % 3 ? 1.4 : 2.6, 'stroke-opacity': 0.75, 'stroke-linecap': 'round' }, g);
    }
    // jendela penghitung sisa kapsul (angkanya dari DOM)
    gold(g, circ(DIAL.x, DIAL.y, 44), [DIAL.x - 44, DIAL.y - 44, 88, 88], R, { n: 20 });
    el('circle', { cx: DIAL.x, cy: DIAL.y, r: 34, fill: linGrad(g, [[0, '#e6d6b2'], [0.3, '#fffdf4'], [1, '#fff8e6']], 0, DIAL.y - 34, 0, DIAL.y + 34), stroke: GOLD.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, g);
    mark(g, DIAL.x, DIAL.y + 66, 0.8, CORAL.base, 0.85);
    mark(g, SLOT.x, SLOT.y + 76, 0.8, CORAL.base, 0.85);
    // corong keluar: bingkai kuningan, rongga gelap, bibir krem
    gold(g, 'M180,858V798Q180,758 220,758H380Q420,758 420,798V858Z', [180, 758, 240, 100], R, { n: 26 });
    const hole = 'M191,856V800Q191,769 222,769H378Q409,769 409,800V856Z';
    el('path', { d: hole, fill: linGrad(g, [[0, '#2a0711'], [0.55, '#5a1626'], [1, '#7a2236']], 0, 769, 0, 856) }, g);
    const hid = F.uid('h');
    el('path', { d: hole }, el('clipPath', { id: hid }, g));
    const hg = el('g', { 'clip-path': `url(#${hid})` }, g);
    el('path', { d: 'M184,862V792Q184,762 222,762H378', fill: 'none', stroke: '#12030a', 'stroke-width': 22, 'stroke-opacity': 0.6, filter: 'url(#soft)' }, hg);
    el('ellipse', { cx: 300, cy: 858, rx: 96, ry: 12, fill: '#ffb3bd', opacity: 0.22, filter: 'url(#soft)' }, hg);
    const lip = 'M176,846H424Q432,846 429,854L422,870Q419,878 410,878H190Q181,878 178,870L171,854Q168,846 176,846Z';
    shape(g, lip, [168, 846, 264, 32], CREAM, R, { n: 20, dir: [1, 0], width: [6, 12], cast: 'cast' });
    el('path', { d: 'M180,850H420', stroke: '#fff', 'stroke-width': 2.2, 'stroke-opacity': 0.8, 'stroke-linecap': 'round' }, g);
  }

  /** kaca depan kubah + tutup atas + kerah (di depan kapsul); kanvas 600×560 */
  function glass(g, R) {
    const { x, y, r } = G;
    // bayangan kerah yang jatuh ke badan tidak dilukis di sini (sudah ada di lapisan badan)
    // pantulan besar yang lembut di kiri-atas
    const cr = (r0, a0, a1, r1, o, blur) => {
      const [ax, ay] = pol(x, y, r0, a0), [bx, by] = pol(x, y, r0, a1), [cx2, cy2] = pol(x, y, r1, a1), [dx, dy] = pol(x, y, r1, a0);
      el('path', { d: `M${ax},${ay}A${r0},${r0} 0 0 1 ${bx},${by}L${cx2},${cy2}A${r1},${r1} 0 0 0 ${dx},${dy}Z`, fill: '#fff', opacity: o, filter: blur ? `url(#${blur})` : undefined }, g);
    };
    el('circle', { cx: x, cy: y, r: r - 4, fill: radGrad(g, [[0, '#fff', 0.16], [0.6, '#fff', 0.02], [1, '#fff', 0]], x - 80, y - 96, r) }, g);
    cr(r - 26, 188, 262, r - 74, 0.42, 'soft');
    cr(r - 30, 200, 236, r - 54, 0.82, 'blur2');
    cr(r - 30, 242, 252, r - 50, 0.6, 'blur2');
    cr(r - 20, 20, 70, r - 40, 0.24, 'soft');
    el('path', { d: `M${pol(x, y, r - 40, 196).join(',')}A${r - 40},${r - 40} 0 0 1 ${pol(x, y, r - 40, 238).join(',')}`, fill: 'none', stroke: '#fff', 'stroke-width': 10, 'stroke-opacity': 0.9, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
    el('path', { d: `M${pol(x, y, r - 40, 246).join(',')}A${r - 40},${r - 40} 0 0 1 ${pol(x, y, r - 40, 254).join(',')}`, fill: 'none', stroke: '#fff', 'stroke-width': 10, 'stroke-opacity': 0.85, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
    el('ellipse', { cx: x + 96, cy: y - 118, rx: 12, ry: 7, fill: '#fff', opacity: 0.55, transform: `rotate(40 ${x + 96} ${y - 118})`, filter: 'url(#blur2)' }, g);
    // bingkai kaca
    el('path', { d: ring(x, y, r, r - 9), 'fill-rule': 'evenodd', fill: linGrad(g, [[0, '#f7fffc'], [0.4, '#b9e3d9'], [1, '#4f9a8c']], x - r * 0.7, y - r * 0.7, x + r * 0.7, y + r * 0.7), opacity: 0.92, filter: 'url(#cast)' }, g);
    el('path', { d: `M${pol(x, y, r - 4, 170).join(',')}A${r - 4},${r - 4} 0 0 1 ${pol(x, y, r - 4, 280).join(',')}`, fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-opacity': 0.9, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
    // tutup atas + bola kuningan
    gold(g, circ(300, 32, 17), [283, 15, 34, 34], R, { n: 10 });
    el('circle', { cx: 294, cy: 26, r: 4.5, fill: '#fff', opacity: 0.8, filter: 'url(#blur2)' }, g);
    const cap = 'M206,112Q206,50 300,46Q394,50 394,112Z';
    const cp = shape(g, cap, [206, 46, 188, 66], [CORAL.dark, CORAL.base, CORAL.light], R, { n: 40, dir: [1, 0.1], width: [8, 18], cast: 'castBig', base: linGrad(g, [[0, CORAL.light], [0.35, CORAL.base], [1, CORAL.mid]], 206, 0, 394, 0) });
    el('ellipse', { cx: 262, cy: 70, rx: 34, ry: 9, fill: '#fff', opacity: 0.35, transform: 'rotate(-14 262 70)', filter: 'url(#soft)' }, cp.inner);
    gold(g, rrect(196, 104, 208, 16, 8), [196, 104, 208, 16], R, { n: 12, dir: [1, 0] });
    // kerah: cincin koral tempat kubah duduk
    const col = 'M110,476Q300,498 490,476Q498,476 500,484L508,524Q509,532 500,534Q300,556 100,534Q91,532 92,524L100,484Q102,476 110,476Z';
    const cl = shape(g, col, [92, 470, 416, 86], [CORAL.dark, CORAL.base, CORAL.light], R, { n: 60, dir: [1, 0.02], width: [8, 18], cast: 'castBig', base: linGrad(g, [[0, CORAL.light], [0.3, CORAL.base], [1, CORAL.mid]], 92, 0, 508, 0) });
    el('path', { d: 'M112,482Q300,504 488,482', fill: 'none', stroke: CORAL.hi, 'stroke-width': 4, 'stroke-opacity': 0.85, 'stroke-linecap': 'round' }, cl.inner);
    el('path', { d: 'M96,522Q300,546 504,522', fill: 'none', stroke: CORAL.deep, 'stroke-width': 14, 'stroke-opacity': 0.3, filter: 'url(#blur2)' }, cl.inner);
    el('path', { d: 'M104,500Q300,523 496,500', fill: 'none', stroke: GOLD.light, 'stroke-width': 3, 'stroke-opacity': 0.9 }, cl.inner);
    el('path', { d: 'M104,503Q300,526 496,503', fill: 'none', stroke: GOLD.dark, 'stroke-width': 1.2, 'stroke-opacity': 0.6 }, cl.inner);
  }

  /** kenop putar; (0,0) = sumbu. Bayangannya simetris supaya tetap wajar saat diputar. */
  function knob(g, R) {
    el('circle', { cx: 3, cy: 5, r: 62, fill: WARM, opacity: 0.35, filter: 'url(#soft)' }, g);
    const p = painted(g, circ(0, 0, 60), {
      base: radGrad(g, [[0, CORAL.hi], [0.35, CORAL.light], [0.75, CORAL.base], [1, CORAL.mid]], -8, -10, 70), n: 40, R, filter: 'impastoFine',
      stroke: () => {
        const a = R() * 360, r = 12 + Math.sqrt(R()) * 46, [x0, y0] = pol(0, 0, r, a), [x1, y1] = pol(0, 0, r, a + 14 + R() * 26);
        return { d: `M${x0},${y0}A${r},${r} 0 0 1 ${x1},${y1}`, color: jitter(mix(CORAL.base, R() < 0.5 ? CORAL.light : CORAL.mid, R() * 0.7), 4, R), width: 4 + R() * 6, opacity: 0.25 + R() * 0.25 };
      },
    });
    el('circle', { r: 58, fill: 'none', stroke: CORAL.dark, 'stroke-width': 3, 'stroke-opacity': 0.5 }, p.inner);
    el('circle', { r: 50, fill: 'none', stroke: CORAL.hi, 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, p.inner);
    // gagang melintang
    const bar = rrect(-19, -66, 38, 132, 19);
    el('path', { d: bar, fill: WARM, opacity: 0.3, filter: 'url(#blur2)', transform: 'translate(2 3)' }, g);
    const b = shape(g, bar, [-19, -66, 38, 132], CREAM, R, { n: 24, dir: [0, 1], width: [5, 10], len: [20, 60], base: linGrad(g, [[0, '#e9d8b4'], [0.3, '#fffdf4'], [0.6, '#fbf1d8'], [1, '#d9c296']], -19, 0, 19, 0) });
    el('path', { d: 'M-8,-52V52', stroke: '#fff', 'stroke-width': 5, 'stroke-opacity': 0.7, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, b.inner);
    el('circle', { r: 13, fill: radGrad(g, [[0, GOLD.hi], [0.55, GOLD.base], [1, GOLD.dark]], -3, -4, 16), stroke: GOLD.deep, 'stroke-width': 1, 'stroke-opacity': 0.6 }, g);
    // tanda arah di ujung gagang
    el('path', { d: HEART, fill: CORAL.base, transform: 'translate(0 -44) scale(0.78)' }, g);
  }

  /** koin emas berhati timbul; (0,0) = tengah */
  function coin(g, R, r = 56) {
    el('ellipse', { cx: 3, cy: 6, rx: r, ry: r, fill: WARM, opacity: 0.32, filter: 'url(#soft)' }, g);
    gold(g, circ(0, 0, r), [-r, -r, r * 2, r * 2], R, { n: 34, cast: undefined });
    el('circle', { r: r - 2, fill: 'none', stroke: GOLD.deep, 'stroke-width': 1.6, 'stroke-opacity': 0.55 }, g);
    el('circle', { r: r * 0.78, fill: linGrad(g, [[0, GOLD.dark, 0.5], [0.5, GOLD.base, 0.1], [1, GOLD.hi, 0.6]], -r * 0.6, -r * 0.6, r * 0.6, r * 0.6) }, g);
    el('circle', { r: r * 0.78, fill: 'none', stroke: GOLD.deep, 'stroke-width': 1.2, 'stroke-opacity': 0.5 }, g);
    for (let i = 0; i < 40; i++) {
      const [x0, y0] = pol(0, 0, r * 0.83, i * 9), [x1, y1] = pol(0, 0, r * 0.95, i * 9);
      el('path', { d: `M${x0},${y0}L${x1},${y1}`, stroke: GOLD.deep, 'stroke-width': 1.3, 'stroke-opacity': 0.35 }, g);
    }
    const s = r / 23;
    el('path', { d: HEART, fill: GOLD.deep, opacity: 0.5, transform: `translate(1.6 4.4) scale(${s})` }, g);
    el('path', { d: HEART, fill: linGrad(g, [[0, GOLD.hi], [0.5, GOLD.light], [1, GOLD.base]], -r * 0.4, -r * 0.4, r * 0.4, r * 0.4), transform: `translate(0 2.4) scale(${s})` }, g);
    el('path', { d: `M${pol(0, 0, r - 7, 190).join(',')}A${r - 7},${r - 7} 0 0 1 ${pol(0, 0, r - 7, 262).join(',')}`, fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-opacity': 0.8, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
  }

  /* ───────────── kapsul: dua belahan di kanvas 200×200 yang sama (pusat 100,100, jari-jari 78) ───────────── */
  const CAPS = {
    koral: { hi: '#ffd0d6', light: '#ff96a4', base: '#ff6b80', mid: '#e8495f', dark: '#b82f48' },
    kuning: { hi: '#fff6cf', light: '#ffe08a', base: '#ffc94a', mid: '#f0a92c', dark: '#bf7d14' },
    toska: { hi: '#d3f6ee', light: '#83dccb', base: '#3fbfab', mid: '#27a08e', dark: '#167366' },
    lila: { hi: '#ece3ff', light: '#c5b2f6', base: '#a58bea', mid: '#8468d2', dark: '#5c459f' },
    biru: { hi: '#dcf0ff', light: '#9bd2f7', base: '#62b5ee', mid: '#3f95d3', dark: '#256aa0' },
    jingga: { hi: '#ffe5cc', light: '#ffbd85', base: '#ff9a4d', mid: '#ec7a2a', dark: '#b55413' },
    emas: { hi: '#fffbe0', light: '#ffe99a', base: '#f2c14e', mid: '#cf9526', dark: '#8a5d10' },
  };
  const CC = 100, CR = 78;
  function capTop(g, R, pal, { shiny = false } = {}) {
    const d = `M${CC - CR},${CC}A${CR},${CR} 0 0 1 ${CC + CR},${CC}V${CC + 8}Q${CC},${CC + 24} ${CC - CR},${CC + 8}Z`;
    const stops = [[0, pal.hi], [0.3, pal.light], [0.62, pal.base], [0.86, pal.mid], [1, pal.dark]];
    const p = painted(g, d, {
      base: radGrad(g, stops, CC - 26, CC - 44, CR * 1.5), n: 34, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => {
        const a = 184 + R() * 150, r = 14 + Math.sqrt(R()) * (CR - 16), [x0, y0] = pol(CC, CC, r, a), [x1, y1] = pol(CC, CC, r, a + 12 + R() * 22);
        const t = Math.hypot(x0 - (CC - 26), y0 - (CC - 44)) / (CR * 1.5);
        return { d: `M${x0},${y0}A${r},${r} 0 0 1 ${x1},${y1}`, color: jitter(ramp(stops, t + (R() - 0.5) * 0.12), 4, R), width: 5 + R() * 8, opacity: 0.22 + R() * 0.26 };
      },
    });
    // gelang sambungan
    el('path', { d: `M${CC - CR},${CC - 4}Q${CC},${CC + 12} ${CC + CR},${CC - 4}V${CC + 8}Q${CC},${CC + 24} ${CC - CR},${CC + 8}Z`, fill: pal.dark, opacity: 0.42 }, p.inner);
    el('path', { d: `M${CC - CR + 2},${CC - 4}Q${CC},${CC + 12} ${CC + CR - 2},${CC - 4}`, fill: 'none', stroke: pal.hi, 'stroke-width': 2.2, 'stroke-opacity': 0.75 }, p.inner);
    // sisi teduh kanan-bawah + kilap
    el('circle', { cx: CC + 12, cy: CC + 10, r: CR, fill: 'none', stroke: pal.dark, 'stroke-width': 18, 'stroke-opacity': 0.3, filter: 'url(#soft)' }, p.inner);
    el('ellipse', { cx: CC - 30, cy: CC - 46, rx: 24, ry: 12, fill: '#fff', opacity: 0.8, transform: `rotate(-36 ${CC - 30} ${CC - 46})`, filter: 'url(#blur2)' }, p.inner);
    el('circle', { cx: CC - 54, cy: CC - 20, r: 5, fill: '#fff', opacity: 0.7, filter: 'url(#blur2)' }, p.inner);
    if (shiny) {
      el('path', { d: HEART, fill: pal.dark, opacity: 0.4, transform: `translate(${CC + 3} ${CC - 30}) scale(1.5)` }, p.inner);
      el('path', { d: HEART, fill: pal.hi, opacity: 0.85, transform: `translate(${CC + 1} ${CC - 33}) scale(1.5)` }, p.inner);
      sparkle(g, CC + 46, CC - 52, 10, '#fffdf2', 0.95);
    }
  }
  function capBottom(g, R, pal) {
    const y0 = CC + 4;
    const d = `M${CC - CR},${y0}A${CR},15 0 0 1 ${CC + CR},${y0}A${CR},${CR} 0 0 1 ${CC - CR},${y0}Z`;
    let p;
    if (pal) {
      const stops = [[0, pal.hi], [0.3, pal.light], [0.62, pal.base], [0.86, pal.mid], [1, pal.dark]];
      p = painted(g, d, {
        base: radGrad(g, stops, CC - 30, CC + 20, CR * 1.5), n: 30, R, filter: 'impastoFine', cast: 'cast',
        stroke: () => {
          const a = 6 + R() * 168, r = 14 + Math.sqrt(R()) * (CR - 16), [x0, yy0] = pol(CC, y0, r, a), [x1, y1] = pol(CC, y0, r, a + 12 + R() * 22);
          const t = Math.hypot(x0 - (CC - 30), yy0 - (CC + 20)) / (CR * 1.5);
          return { d: `M${x0},${yy0}A${r},${r} 0 0 1 ${x1},${y1}`, color: jitter(ramp(stops, t + (R() - 0.5) * 0.12), 4, R), width: 5 + R() * 8, opacity: 0.22 + R() * 0.26 };
        },
      });
      el('ellipse', { cx: CC, cy: y0, rx: CR - 5, ry: 11, fill: pal.dark, opacity: 0.75 }, p.inner);
      el('path', { d: `M${CC - CR + 4},${y0}A${CR - 4},13 0 0 0 ${CC + CR - 4},${y0}`, fill: 'none', stroke: pal.hi, 'stroke-width': 2.4, 'stroke-opacity': 0.85 }, p.inner);
      el('circle', { cx: CC + 12, cy: y0 + 6, r: CR, fill: 'none', stroke: pal.dark, 'stroke-width': 18, 'stroke-opacity': 0.34, filter: 'url(#soft)' }, p.inner);
    } else {
      // belahan bening: susu tembus pandang, tepinya kehijauan
      p = painted(g, d, {
        base: radGrad(g, [[0, '#ffffff', 0.9], [0.5, '#f1faf7', 0.8], [0.85, '#c3e6dd', 0.84], [1, '#8fc9bd', 0.9]], CC - 30, CC + 16, CR * 1.45), n: 16, R, filter: 'impastoFine', cast: 'cast',
        stroke: () => {
          const a = 10 + R() * 160, r = 20 + Math.sqrt(R()) * (CR - 24), [x0, yy0] = pol(CC, y0, r, a), [x1, y1] = pol(CC, y0, r, a + 14 + R() * 22);
          return { d: `M${x0},${yy0}A${r},${r} 0 0 1 ${x1},${y1}`, color: R() < 0.5 ? '#ffffff' : '#bfe2d9', width: 5 + R() * 7, opacity: 0.16 + R() * 0.16 };
        },
      });
      el('ellipse', { cx: CC, cy: y0, rx: CR - 5, ry: 11, fill: '#6fa99d', opacity: 0.36 }, p.inner);
      el('path', { d: `M${CC - CR + 4},${y0}A${CR - 4},13 0 0 0 ${CC + CR - 4},${y0}`, fill: 'none', stroke: '#fff', 'stroke-width': 2.6, 'stroke-opacity': 0.95 }, p.inner);
      el('circle', { cx: CC + 12, cy: y0 + 6, r: CR, fill: 'none', stroke: '#3f8f80', 'stroke-width': 16, 'stroke-opacity': 0.22, filter: 'url(#soft)' }, p.inner);
    }
    el('path', { d: `M${pol(CC, y0, CR - 14, 122).join(',')}A${CR - 14},${CR - 14} 0 0 1 ${pol(CC, y0, CR - 14, 166).join(',')}`, fill: 'none', stroke: '#fff', 'stroke-width': 7, 'stroke-opacity': 0.75, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
  }
  /** kapsul utuh (untuk sampul) */
  function capsule(g, R, name) {
    capBottom(g, R, name === 'emas' ? CAPS.emas : null);
    capTop(g, R, CAPS[name], { shiny: name === 'emas' });
  }

  /* ───────────── nampan, laci, amplop ───────────── */
  function tray(g, R, { w = 620, h = 118 } = {}) {
    el('ellipse', { cx: w / 2 + 8, cy: h + 6, rx: w / 2, ry: 12, fill: WARM, opacity: 0.3, filter: 'url(#soft)' }, g);
    const out = `M26,0H${w - 26}Q${w - 6},0 ${w - 2},22L${w},${h - 26}Q${w + 2},${h} ${w - 26},${h}H26Q-2,${h} 0,${h - 26}L2,22Q6,0 26,0Z`;
    shape(g, out, [0, 0, w, h], [CORAL.mid, CORAL.light, CORAL.hi], R, { n: 60, dir: [1, 0], width: [8, 16], cast: 'castBig', base: linGrad(g, [[0, CORAL.hi], [0.4, CORAL.light], [1, CORAL.base]], 0, 0, w, h) });
    const inn = rrect(14, 11, w - 28, h - 26, 24);
    const p = shape(g, inn, [14, 11, w - 28, h - 26], CREAM, R, { n: 60, dir: [1, 0.02], width: [10, 22], len: [60, 160] });
    el('path', { d: inn, fill: kawung(g, '#c9a66a', 44, 1.1), opacity: 0.14 }, p.inner);
    el('path', { d: rrect(20, 20, w - 28, h - 26, 24), fill: 'none', stroke: WARM, 'stroke-width': 16, 'stroke-opacity': 0.22, filter: 'url(#soft)' }, p.inner);
    el('path', { d: `M30,4H${w - 30}`, stroke: '#fff', 'stroke-width': 2.4, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, g);
  }
  /** muka laci; (0,0) = sudut kiri-atas mukanya, 264×50 */
  function drawerFront(g, R) {
    const d = rrect(0, 0, 264, 50, 10);
    const p = shape(g, d, [0, 0, 264, 50], [CORAL.mid, CORAL.light, CORAL.hi], R, { n: 30, dir: [1, 0], width: [6, 14], cast: 'cast', base: linGrad(g, [[0, CORAL.hi], [0.35, CORAL.light], [1, CORAL.base]], 0, 0, 0, 50) });
    el('path', { d: rrect(5, 5, 254, 40, 7), fill: 'none', stroke: CORAL.dark, 'stroke-width': 1.4, 'stroke-opacity': 0.5 }, p.inner);
    el('path', { d: 'M10,3H254', stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, p.inner);
    gold(g, rrect(98, 17, 68, 16, 8), [98, 17, 68, 16], R, { n: 10, dir: [1, 0] });
    el('path', { d: 'M106,22H158', stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, g);
    for (const x of [40, 224]) el('path', { d: HEART, fill: CORAL.dark, opacity: 0.6, transform: `translate(${x} 26) scale(0.7)` }, g);
  }
  /** isi laci dilihat dari atas; (0,0) = sudut kiri-atas, 264×170 */
  function drawerInside(g, R) {
    const d = rrect(0, 0, 264, 176, 8);
    shape(g, d, [0, 0, 264, 176], [CORAL.deep, CORAL.dark, CORAL.mid], R, { n: 30, dir: [0, 1], width: [8, 16] });
    const fl = rrect(12, 0, 240, 166, 6);
    const p = shape(g, fl, [12, 0, 240, 166], CREAM, R, { n: 50, dir: [1, 0.03], width: [10, 22], len: [50, 140] });
    el('path', { d: fl, fill: kawung(g, '#e58a98', 40, 1.1), opacity: 0.22 }, p.inner);
    el('rect', { x: 0, y: 0, width: 264, height: 70, fill: linGrad(g, [[0, '#2a0711', 0.7], [1, '#2a0711', 0]], 0, 0, 0, 70) }, g);
    el('path', { d: 'M18,6V166', stroke: WARM, 'stroke-width': 12, 'stroke-opacity': 0.2, filter: 'url(#soft)' }, p.inner);
  }
  /** amplop krem bersegel hati; (0,0) = sudut kiri-atas, 200×132 */
  function envelope(g, R) {
    const w = 200, h = 132;
    const d = rrect(0, 0, w, h, 8);
    const p = shape(g, d, [0, 0, w, h], CREAM, R, { n: 46, dir: [1, 0.04], width: [10, 22], cast: 'castBig' });
    el('path', { d, fill: kawung(g, '#c9a66a', 40, 1), opacity: 0.12 }, p.inner);
    el('path', { d: `M0,${h}L${w * 0.4},${h * 0.5}M${w},${h}L${w * 0.6},${h * 0.5}`, stroke: '#b9975c', 'stroke-width': 1.6, 'stroke-opacity': 0.5 }, p.inner);
    const flap = `M0,6Q${w / 2},${h * 0.92} ${w},6V0H0Z`;
    el('path', { d: flap, fill: WARM, opacity: 0.22, filter: 'url(#blur2)', transform: 'translate(0 4)' }, p.inner);
    el('path', { d: `M-2,-2H${w + 2}V6Q${w / 2},${h * 0.9} -2,6Z`, fill: linGrad(g, [[0, '#fffdf4'], [1, '#f1e2c0']], 0, 0, 0, h * 0.6) }, p.inner);
    el('path', { d: `M0,6Q${w / 2},${h * 0.9} ${w},6`, fill: 'none', stroke: '#b9975c', 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, p.inner);
    el('rect', { x: 8, y: 8, width: w - 16, height: h - 16, rx: 4, fill: 'none', stroke: CORAL.base, 'stroke-width': 1.4, 'stroke-opacity': 0.4, 'stroke-dasharray': '5 5' }, p.inner);
    el('circle', { cx: w / 2, cy: h * 0.5, r: 19, fill: radGrad(g, [[0, CORAL.light], [0.6, CORAL.base], [1, CORAL.dark]], w / 2 - 5, h * 0.5 - 6, 24), filter: 'url(#cast)' }, g);
    el('path', { d: HEART, fill: '#fff3f0', opacity: 0.92, transform: `translate(${w / 2} ${h * 0.5 + 1}) scale(0.92)` }, g);
  }

  /* ───────────── pot daun (mini-game): kapsul pemalu bersembunyi di baliknya ───────────── */
  function pot(g, R) {
    const gr = F.flora.GREEN;
    const lf = (rot, len, w, k, curve) => leaf(g, { len, w, ...gr[k], R, n: 50, curve, transform: `translate(220 318) rotate(${rot})` });
    lf(-64, 250, 104, 0, -0.22);
    lf(62, 240, 100, 2, 0.24);
    lf(-34, 290, 116, 1, -0.14);
    lf(36, 284, 112, 3, 0.16);
    lf(2, 304, 120, 0, 0.06);
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(300 250) rotate(18)' }, g), R, 0.34);
    el('ellipse', { cx: 228, cy: 452, rx: 118, ry: 13, fill: WARM, opacity: 0.34, filter: 'url(#soft)' }, g);
    const body2 = 'M122,318H318L296,440Q294,452 280,452H160Q146,452 144,440Z';
    const p = shape(g, body2, [122, 318, 196, 134], [CORAL.dark, CORAL.base, CORAL.light], R, { n: 50, dir: [0.06, 1], width: [10, 22], cast: 'castBig', base: linGrad(g, [[0, CORAL.light], [0.3, CORAL.base], [1, CORAL.mid]], 122, 0, 318, 0) });
    el('rect', { x: 110, y: 372, width: 220, height: 38, fill: '#fff6e2', opacity: 0.92 }, p.inner);
    el('rect', { x: 110, y: 372, width: 220, height: 38, fill: kawung(g, CORAL.base, 38, 1.8), opacity: 0.9 }, p.inner);
    el('rect', { x: 250, y: 318, width: 80, height: 140, fill: linGrad(g, [[0, CORAL.deep, 0], [1, CORAL.deep, 0.36]], 250, 0, 330, 0) }, p.inner);
    shape(g, rrect(108, 300, 224, 34, 12), [108, 300, 224, 34], [CORAL.mid, CORAL.light, CORAL.hi], R, { n: 20, dir: [1, 0], width: [6, 12], cast: 'cast' });
    el('path', { d: 'M120,306H320', stroke: '#fff', 'stroke-width': 2.4, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, g);
  }

  /* ───────────── sprite ───────────── */
  const scaled = (name, w, h, seed, draw, k = 0.5) => { F.sprites[name] = { w: w * k, h: h * k, viewBox: `0 0 ${w} ${h}`, seed, draw }; };

  F.sprites['bg-gacha'] = { w: W * 0.8, h: H * 0.8, viewBox: `0 0 ${W} ${H}`, seed: 611, scale: 1, draw(svg, R) { wall(svg, R); } };
  scaled('gacha-mesin', MW, MH, 612, (svg, R) => body(svg, R));
  scaled('gacha-kaca', MW, 566, 613, (svg, R) => glass(svg, R));
  scaled('gacha-kenop', 180, 180, 614, (svg, R) => knob(el('g', { transform: 'translate(90 88)' }, svg), R), 0.6);
  scaled('gacha-koin', 150, 150, 615, (svg, R) => coin(el('g', { transform: 'translate(73 71)' }, svg), R), 0.6);
  Object.keys(CAPS).forEach((name, i) => scaled(`gacha-atas-${name}`, 200, 200, 620 + i, (svg, R) => capTop(svg, R, CAPS[name], { shiny: name === 'emas' }), 0.55));
  scaled('gacha-bawah', 200, 200, 628, (svg, R) => capBottom(svg, R, null), 0.55);
  scaled('gacha-bawah-emas', 200, 200, 629, (svg, R) => capBottom(svg, R, CAPS.emas), 0.55);
  scaled('gacha-nampan', 660, 160, 630, (svg, R) => tray(el('g', { transform: 'translate(20 14)' }, svg), R));
  scaled('gacha-laci', 300, 86, 631, (svg, R) => drawerFront(el('g', { transform: 'translate(18 14)' }, svg), R), 0.6);
  scaled('gacha-laci-dalam', 264, 176, 632, (svg, R) => drawerInside(svg, R), 0.6);
  scaled('gacha-amplop', 240, 176, 633, (svg, R) => envelope(el('g', { transform: 'translate(18 14)' }, svg), R), 0.7);
  scaled('game-gacha-pot', 440, 470, 634, (svg, R) => pot(svg, R), 0.6);

  F.sprites['cover-gacha'] = { w: 480, h: 600, seed: 635, draw(svg, R) {
    wall(el('g', { transform: 'translate(-30 -330) scale(0.692)' }, svg), R, { decor: false });
    const m = el('g', { transform: 'translate(52 26) scale(0.56)' }, svg);
    body(m, R);
    // kapsul di dalam kubah
    const pile = [[-38, 150, 'toska', 20], [38, 150, 'kuning', -30], [-114, 88, 'lila', 40], [-38, 88, 'koral', -12], [38, 88, 'biru', 70], [114, 88, 'jingga', -50], [-152, 26, 'kuning', 14], [-76, 26, 'biru', -60], [0, 26, 'emas', 8], [76, 26, 'koral', 32], [152, 26, 'toska', -24], [-95, -36, 'jingga', 50], [-15, -40, 'lila', -18], [70, -36, 'koral', 96]];
    pile.forEach(([x, y, c, rot]) => capsule(el('g', { transform: `translate(${G.x + x} ${G.y + y}) rotate(${rot}) scale(0.5) translate(-100 -100)` }, m), R, c));
    glass(m, R);
    knob(el('g', { transform: `translate(${KNOB.x} ${KNOB.y}) rotate(28)` }, m), R);
    drawerFront(el('g', { transform: 'translate(168 872)' }, m), R);
    // hati kecil di papan nama & jendela penghitung (pengganti tulisan)
    el('path', { d: HEART, fill: CORAL.base, transform: 'translate(300 588) scale(1.1)' }, m);
    el('path', { d: HEART, fill: CORAL.base, transform: `translate(${DIAL.x} ${DIAL.y + 2}) scale(1.25)` }, m);
    capsule(el('g', { transform: 'translate(300 818) rotate(-16) scale(0.4) translate(-100 -100)' }, m), R, 'kuning');
    // di depan: kapsul terbuka dengan secarik catatan, kapsul emas, koin
    const fr = F.flora, gr = fr.GREEN;
    leaf(svg, { len: 150, w: 58, ...gr[0], R, n: 40, curve: 0.2, transform: 'translate(-8 520) rotate(48)' });
    leaf(svg, { len: 140, w: 54, ...gr[2], R, n: 40, curve: -0.2, transform: 'translate(488 470) rotate(-40)' });
    fr.flowers.kambojaPink(el('g', { transform: 'translate(30 548) rotate(16)' }, svg), R, 0.34);
    fr.flowers.kamboja(el('g', { transform: 'translate(452 62) rotate(-14)' }, svg), R, 0.3);
    const slip = el('g', { transform: 'translate(318 392) rotate(-7)', filter: 'url(#castBig)' }, svg);
    el('path', { d: rrect(0, 0, 150, 92, 6), fill: linGrad(svg, [[0, '#fffdf6'], [1, '#f6e9cd']], 0, 0, 150, 92) }, slip);
    el('path', { d: HEART, fill: CORAL.base, transform: 'translate(24 24) scale(0.9)' }, slip);
    for (const [y, x1, o] of [[26, 132, 0.5], [46, 124, 0.4], [66, 96, 0.34]]) el('path', { d: `M${y === 26 ? 44 : 16},${y}H${x1}`, stroke: '#7a4a2a', 'stroke-width': 5, 'stroke-opacity': o, 'stroke-linecap': 'round' }, slip);
    capBottom(el('g', { transform: 'translate(300 452) rotate(8) scale(0.58)' }, svg), R, null);
    capTop(el('g', { transform: 'translate(380 300) rotate(34) scale(0.58)' }, svg), R, CAPS.toska);
    capsule(el('g', { transform: 'translate(396 478) rotate(-18) scale(0.5)' }, svg), R, 'emas');
    sparkle(svg, 452, 478, 12);
    sparkle(svg, 418, 462, 7);
    coin(el('g', { transform: 'translate(74 468) rotate(-12) scale(0.62)' }, svg), R);
  } };
})();
