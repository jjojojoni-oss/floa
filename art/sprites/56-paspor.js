/* Paspor Berdua: paspor rekaan milik berdua di atas meja berpeta tua — sampul kulit marun berlambang
   kamboja dalam cincin kawung (foil emas), halaman kertas krem, sisi dalam sampul belakang berkantong,
   stempel karet, dan koper kekenyangan untuk mini-game. Semua tulisan dipasang dari DOM. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf, petal, linGrad, radGrad } = F;
  const WARM = '#3a1d12';
  const W = 780, H = 1500;
  /** satu halaman paspor (sampul & halaman dalam sama besar supaya pas saat ditumpuk) */
  const PW = 420, PH = 596;
  const LEATHER = { hi: '#b9535a', light: '#a13c44', base: '#7f2730', mid: '#651d26', dark: '#48131b', deep: '#2c0a10' };
  const GOLD = { hi: '#fff3c4', light: '#f3d98e', base: '#d6a94a', mid: '#b0832c', dark: '#7a5717' };
  const WOOD = { hi: '#f3cf9a', light: '#dba669', base: '#b47c43', dark: '#7a4e24', deep: '#4f2f13' };

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  /** bentuk buklet: sudut kanan membulat, sisi kiri (punggung) hampir siku */
  const book = (x, y, w, h, r = 24, rl = 6) => `M${x + rl},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + rl}Q${x},${y + h} ${x},${y + h - rl}V${y + rl}Q${x},${y} ${x + rl},${y}Z`;
  const pol = (cx, cy, r, deg) => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r];

  /** bidang bebas dilukis dengan sapuan pendek ke segala arah (kulit, kayu, kain) */
  const patch = (g, d, box, pal, R, { n = 80, dir, len = [10, 28], width = [5, 12], filter = 'impastoFine', cast, base } = {}) => {
    const [x, y, w, h] = box;
    return painted(g, d, {
      base: base ?? linGrad(g, [[0, pal.light], [0.45, pal.base], [1, pal.dark]], x, y, x + w, y + h), n, R, filter, cast,
      stroke: () => {
        const sx = x + R() * w, sy = y + R() * h, a = dir === undefined ? R() * Math.PI * 2 : dir + (R() - 0.5) * 0.5, L = len[0] + R() * (len[1] - len[0]);
        const t = ((sx - x) / w + (sy - y) / h) / 2;
        const col = mix(ramp([[0, pal.light], [0.45, pal.base], [1, pal.dark]], t), R() < 0.5 ? pal.hi ?? pal.light : pal.deep ?? pal.dark, R() * 0.3);
        return { d: `M${sx},${sy}l${Math.cos(a) * L},${Math.sin(a) * L}`, color: jitter(col, 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.22 + R() * 0.3 };
      },
    });
  };

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

  /* ───────────── foil emas: bentuk timbul dengan bayang gelap di kanan-bawah ───────────── */
  const foilFill = (g, x, y, w, h) => linGrad(g, [[0, GOLD.light], [0.22, GOLD.hi], [0.48, GOLD.base], [0.72, GOLD.light], [1, GOLD.mid]], x, y, x + w, y + h);
  function foil(g, name, attrs, { fill = false, sw = 2.4, box = [-100, -100, 200, 200] } = {}) {
    const gold = foilFill(g, ...box);
    el(name, { ...attrs, fill: fill ? LEATHER.deep : 'none', stroke: LEATHER.deep, 'stroke-width': sw + 0.6, 'stroke-opacity': 0.6, 'fill-opacity': fill ? 0.6 : undefined, 'stroke-linecap': 'round', transform: `${attrs.transform ?? ''} translate(1.3 1.7)` }, g);
    el(name, { ...attrs, fill: fill ? gold : 'none', stroke: gold, 'stroke-width': sw, 'stroke-linecap': 'round' }, g);
  }

  /** kelopak kamboja (tanda floa), pangkal di (0,0), ujung di (0,-18.5) */
  const PETAL = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
  /** lambang rekaan: kamboja di dalam cincin kawung, berpusat di (cx, cy) */
  function emblem(g, cx, cy, s = 1) {
    const m = el('g', { transform: `translate(${cx} ${cy}) scale(${s})` }, g);
    foil(m, 'circle', { r: 96 }, { sw: 3 });
    foil(m, 'circle', { r: 87 }, { sw: 1.2 });
    for (let i = 0; i < 8; i++) foil(m, 'ellipse', { rx: 17, ry: 8, transform: `rotate(${i * 45}) translate(67 0)` }, { sw: 2.2 });
    for (let i = 0; i < 8; i++) {
      const [x, y] = pol(0, 0, 70, i * 45 + 22.5);
      foil(m, 'circle', { cx: x, cy: y, r: 2.6 }, { fill: true, sw: 0.6 });
    }
    foil(m, 'circle', { r: 46 }, { sw: 1.4 });
    for (let i = 0; i < 5; i++) foil(m, 'path', { d: PETAL, transform: `rotate(${i * 72}) scale(2.15)` }, { fill: true, sw: 0.5 });
    el('circle', { r: 5.2, fill: GOLD.hi }, m);
  }

  /** sampul kulit marun: butir kulit, lipatan punggung, bingkai foil, lambang. `bars` = garis emas pengganti tulisan (sampul katalog). */
  function coverArt(g, R, { bars = false } = {}) {
    const d = book(0, 0, PW, PH, 26, 7);
    const p = patch(g, d, [0, 0, PW, PH], LEATHER, R, { n: 260, len: [8, 24], width: [4, 10] });
    // butir kulit
    for (let i = 0; i < 300; i++) {
      const x = R() * PW, y = R() * PH;
      el('ellipse', { cx: x, cy: y, rx: 1.2 + R() * 2.6, ry: 0.9 + R() * 1.8, fill: R() < 0.5 ? '#e08a8e' : '#1c0509', 'fill-opacity': 0.07 + R() * 0.1, transform: `rotate(${R() * 180} ${x} ${y})` }, p.inner);
    }
    // cahaya dari kiri-atas, teduh ke kanan-bawah
    el('path', { d, fill: radGrad(g, [[0, '#ffd9cf', 0.3], [0.5, '#ffd9cf', 0], [1, '#12030a', 0.42]], 110, 120, 620) }, p.inner);
    // lipatan punggung di kiri
    el('rect', { x: 0, y: 0, width: 30, height: PH, fill: linGrad(g, [[0, '#12030a', 0.5], [0.6, '#12030a', 0.16], [1, '#12030a', 0]], 0, 0, 30, 0) }, p.inner);
    el('path', { d: `M31,6V${PH - 6}`, stroke: '#12030a', 'stroke-width': 2.4, 'stroke-opacity': 0.4 }, p.inner);
    el('path', { d: `M34,6V${PH - 6}`, stroke: '#ffb9b0', 'stroke-width': 1.2, 'stroke-opacity': 0.22 }, p.inner);
    // bingkai foil + bingkai timbul tanpa warna
    foil(p.inner, 'path', { d: rrect(52, 30, PW - 82, PH - 60, 16) }, { sw: 2, box: [0, 0, PW, PH] });
    el('path', { d: rrect(60, 38, PW - 98, PH - 76, 11), fill: 'none', stroke: '#12030a', 'stroke-width': 1.6, 'stroke-opacity': 0.45 }, p.inner);
    el('path', { d: rrect(61, 39.2, PW - 98, PH - 76, 11), fill: 'none', stroke: '#ffb9b0', 'stroke-width': 0.9, 'stroke-opacity': 0.25 }, p.inner);
    // kawung kecil di empat sudut bingkai
    for (const [x, y] of [[82, 62], [PW - 60, 62], [82, PH - 62], [PW - 60, PH - 62]]) {
      const c = el('g', { transform: `translate(${x} ${y})` }, p.inner);
      for (const a of [45, 135, 225, 315]) foil(c, 'ellipse', { rx: 7.5, ry: 3.4, transform: `rotate(${a}) translate(8.6 0)` }, { sw: 1.1, box: [-20, -20, 40, 40] });
    }
    emblem(p.inner, 226, 292, 1);
    if (bars) {
      foil(p.inner, 'path', { d: 'M150,118H302' }, { sw: 7, box: [0, 0, PW, PH] });
      foil(p.inner, 'path', { d: 'M120,462H332' }, { sw: 15, box: [0, 0, PW, PH] });
      foil(p.inner, 'path', { d: 'M170,502H282' }, { sw: 5, box: [0, 0, PW, PH] });
    }
    return p;
  }

  /** halaman kertas: krem, kawung samar, teduh di lipatan kiri */
  function pagePaper(g, R) {
    const d = book(0, 0, PW, PH, 22, 2);
    const cream = [[0, '#fffbf1'], [0.55, '#fbf3df'], [1, '#f0e2c4']];
    const p = painted(g, d, {
      base: linGrad(g, cream, 0, 0, PW, PH), n: 170, R, filter: 'impastoFine',
      stroke: () => {
        const x = R() * PW, y = R() * PH, L = 24 + R() * 60;
        return { d: `M${x},${y}l${L},${(R() - 0.5) * 12}`, color: jitter(ramp(cream, (x / PW + y / PH) / 2 + (R() - 0.5) * 0.3), 4, R), width: 8 + R() * 16, opacity: 0.25 + R() * 0.3 };
      },
    });
    el('path', { d, fill: kawung(g, '#a9783f', 64, 1.1), opacity: 0.1 }, p.inner);
    el('rect', { x: 0, y: 0, width: 70, height: PH, fill: linGrad(g, [[0, WARM, 0.34], [0.3, WARM, 0.1], [1, WARM, 0]], 0, 0, 70, 0) }, p.inner);
    el('path', { d, fill: linGrad(g, [[0.82, WARM, 0], [1, WARM, 0.1]], 0, 0, PW, PH) }, p.inner);
    return p;
  }

  /** sisi dalam sampul belakang: tepi kulit + kertas pelapis bermotif kawung marun */
  function endpaper(g, R) {
    const p = patch(g, book(0, 0, PW, PH, 26, 7), [0, 0, PW, PH], LEATHER, R, { n: 60 });
    const d = book(9, 9, PW - 18, PH - 18, 19, 2);
    const tone = [[0, '#f6e8cf'], [1, '#ead4b0']];
    const q = painted(p.inner, d, {
      base: linGrad(g, tone, 0, 0, PW, PH), n: 110, R, filter: 'impastoFine',
      stroke: () => {
        const x = R() * PW, y = R() * PH, L = 24 + R() * 60;
        return { d: `M${x},${y}l${L},${(R() - 0.5) * 12}`, color: jitter(ramp(tone, y / PH + (R() - 0.5) * 0.3), 4, R), width: 8 + R() * 16, opacity: 0.25 + R() * 0.3 };
      },
    });
    el('path', { d, fill: kawung(g, LEATHER.base, 52, 1.5), opacity: 0.26 }, q.inner);
    el('rect', { x: 0, y: 0, width: 80, height: PH, fill: linGrad(g, [[0, WARM, 0.36], [0.3, WARM, 0.12], [1, WARM, 0]], 0, 0, 80, 0) }, q.inner);
    el('path', { d: rrect(26, 24, PW - 50, PH - 48, 12), fill: 'none', stroke: GOLD.mid, 'stroke-width': 1.4, 'stroke-opacity': 0.7 }, q.inner);
  }

  /** kantong kertas di sisi dalam sampul belakang (dipasang di atas boarding pass yang terselip) */
  function pocket(g, R) {
    const d = `M9,372L${PW - 9},312V${PH - 28}Q${PW - 9},${PH - 9} ${PW - 28},${PH - 9}H11Q9,${PH - 9} 9,${PH - 11}Z`;
    const kraft = { hi: '#fbf0d8', light: '#f1dfbd', base: '#e2c998', dark: '#c4a56e', deep: '#a5854f' };
    const p = patch(g, d, [9, 312, PW - 18, PH - 321], kraft, R, { n: 110, dir: 0.1, len: [20, 60], width: [8, 18], cast: 'cast' });
    el('rect', { x: 0, y: 300, width: 80, height: 300, fill: linGrad(g, [[0, WARM, 0.3], [0.3, WARM, 0.1], [1, WARM, 0]], 0, 0, 80, 0) }, p.inner);
    // bibir kantong: terang di tepi, garis lipat di bawahnya
    el('path', { d: `M9,374L${PW - 9},314`, stroke: '#fffaf0', 'stroke-width': 3, 'stroke-opacity': 0.8 }, p.inner);
    el('path', { d: `M9,386L${PW - 9},326`, stroke: kraft.deep, 'stroke-width': 1.3, 'stroke-opacity': 0.5 }, p.inner);
    // jahitan
    el('path', { d: `M24,398V${PH - 26}H${PW - 24}V332`, fill: 'none', stroke: LEATHER.base, 'stroke-width': 1.8, 'stroke-dasharray': '7 6', 'stroke-opacity': 0.7 }, p.inner);
    // lambang kecil
    const m = el('g', { transform: `translate(${PW / 2 + 6} 478)`, opacity: 0.72 }, p.inner);
    el('circle', { r: 40, fill: 'none', stroke: LEATHER.base, 'stroke-width': 1.6 }, m);
    for (let i = 0; i < 5; i++) el('path', { d: PETAL, fill: LEATHER.base, transform: `rotate(${i * 72}) scale(1.55)` }, m);
    el('circle', { r: 3.4, fill: kraft.hi }, m);
  }

  /** gambar pengganti pas foto: kamboja di atas langit senja kecil */
  function photoArt(g, R, w, h) {
    const sky = [[0, '#f7d9a8'], [0.5, '#f4b48f'], [1, '#e88f86']];
    const d = rrect(0, 0, w, h, 10);
    const p = painted(g, d, {
      base: linGrad(g, sky, 0, 0, 0, h), n: 80, R, filter: 'impastoFine',
      stroke: () => {
        const x = R() * w, y = R() * h, L = 20 + R() * 50;
        return { d: `M${x},${y}l${L},${(R() - 0.5) * 8}`, color: jitter(ramp(sky, y / h + (R() - 0.5) * 0.2), 5, R), width: 8 + R() * 14, opacity: 0.3 + R() * 0.3 };
      },
    });
    el('path', { d, fill: kawung(g, '#fff6e0', 44, 1.2), opacity: 0.22 }, p.inner);
    const gr = F.flora.GREEN;
    leaf(p.inner, { len: h * 0.5, w: w * 0.3, ...gr[1], R, n: 30, curve: 0.2, transform: `translate(${w * 0.32} ${h * 0.96}) rotate(-26)` });
    leaf(p.inner, { len: h * 0.46, w: w * 0.28, ...gr[0], R, n: 30, curve: -0.2, transform: `translate(${w * 0.7} ${h * 0.98}) rotate(28)` });
    F.flora.flowers.kambojaPink(el('g', { transform: `translate(${w / 2} ${h * 0.5}) rotate(12)` }, p.inner), R, w / 330);
  }

  /** stempel karet bergagang kayu, tampak samping; karetnya di tepi bawah */
  function stampTool(g, R) {
    const knob = 'M110,18C150,18 170,44 166,72C162,96 140,108 110,108C80,108 58,96 54,72C50,44 70,18 110,18Z';
    const neck = 'M92,100Q110,112 128,100L136,176H84Z';
    const base = rrect(34, 170, 152, 70, 14);
    patch(g, neck, [84, 100, 52, 76], WOOD, R, { n: 30, dir: 1.5, cast: 'cast' });
    const b = patch(g, base, [34, 170, 152, 70], WOOD, R, { n: 60, dir: 0.05, len: [14, 40], cast: 'castBig' });
    el('path', { d: base, fill: linGrad(g, [[0, '#fff1d0', 0.4], [0.4, '#fff1d0', 0], [1, '#2a1406', 0.35]], 34, 170, 186, 240) }, b.inner);
    // gelang kuningan di antara leher dan badan
    el('path', { d: rrect(78, 166, 64, 13, 6), fill: linGrad(g, [[0, GOLD.dark], [0.25, GOLD.hi], [0.6, GOLD.base], [1, GOLD.dark]], 78, 0, 142, 0), stroke: GOLD.dark, 'stroke-width': 1 }, g);
    const k = patch(g, knob, [52, 18, 116, 90], WOOD, R, { n: 60, dir: 0.2, len: [14, 36], cast: 'cast' });
    el('path', { d: knob, fill: radGrad(g, [[0, '#fff6dc', 0.7], [0.45, '#fff6dc', 0.05], [1, '#2a1406', 0.4]], 88, 44, 90) }, k.inner);
    // karet: gelap, dengan sisa tinta marun di tepinya
    el('path', { d: rrect(40, 236, 140, 24, 7), fill: linGrad(g, [[0, '#4a2a2c'], [1, '#1c0e10']], 0, 236, 0, 260), filter: 'url(#cast)' }, g);
    el('path', { d: 'M44,256H176', stroke: LEATHER.light, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-opacity': 0.85 }, g);
    el('path', { d: 'M46,242H174', stroke: '#fff', 'stroke-width': 1.4, 'stroke-opacity': 0.25 }, g);
  }

  /* ───────────── latar: meja berpeta tua ───────────── */
  /** pulau: gumpalan tak beraturan dengan garis pantai dan arsir air di sekelilingnya */
  function island(g, R, cx, cy, r) {
    const n = 11, pts = [];
    for (let i = 0; i < n; i++) pts.push(pol(cx, cy, r * (0.62 + R() * 0.6), (i / n) * 360));
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let d = `M${mid(pts[n - 1], pts[0]).join(',')}`;
    for (let i = 0; i < n; i++) d += `Q${pts[i].join(',')} ${mid(pts[i], pts[(i + 1) % n]).join(',')}`;
    d += 'Z';
    for (const [k, o] of [[1.22, 0.1], [1.12, 0.16]]) el('path', { d, fill: 'none', stroke: '#6f8f96', 'stroke-width': 1.6, 'stroke-opacity': o, 'stroke-dasharray': '10 7', transform: `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})` }, g);
    el('path', { d, fill: '#d2b47a', 'fill-opacity': 0.42, stroke: '#7b5a2e', 'stroke-width': 2, 'stroke-opacity': 0.42 }, g);
    for (let i = 0; i < 5; i++) {
      const [x, y] = pol(cx, cy, r * R() * 0.45, R() * 360);
      el('path', { d: `M${x - 9},${y + 5}l9,-12l9,12`, fill: 'none', stroke: '#7b5a2e', 'stroke-width': 1.6, 'stroke-opacity': 0.32, 'stroke-linejoin': 'round' }, g);
    }
  }

  /** mawar angin delapan arah; (0,0) = pusat */
  function compass(g, R, s = 1) {
    const m = el('g', { transform: `scale(${s})` }, g);
    el('circle', { r: 132, fill: '#fbf1d8', 'fill-opacity': 0.5, stroke: '#7b5a2e', 'stroke-width': 2.2, 'stroke-opacity': 0.5 }, m);
    el('circle', { r: 120, fill: 'none', stroke: '#7b5a2e', 'stroke-width': 1, 'stroke-opacity': 0.45, 'stroke-dasharray': '2 6' }, m);
    el('circle', { r: 86, fill: 'none', stroke: '#7b5a2e', 'stroke-width': 1.2, 'stroke-opacity': 0.4 }, m);
    for (let i = 0; i < 32; i++) {
      const [x0, y0] = pol(0, 0, i % 4 ? 124 : 118, i * 11.25), [x1, y1] = pol(0, 0, 131, i * 11.25);
      el('path', { d: `M${x0},${y0}L${x1},${y1}`, stroke: '#7b5a2e', 'stroke-width': 1.3, 'stroke-opacity': 0.5 }, m);
    }
    const pt = (deg, len, wd, a, b) => {
      const [tx, ty] = pol(0, 0, len, deg), [lx, ly] = pol(0, 0, wd, deg - 90), [rx, ry] = pol(0, 0, wd, deg + 90);
      el('path', { d: `M0,0L${lx},${ly}L${tx},${ty}Z`, fill: a, stroke: '#4a2f17', 'stroke-width': 0.8, 'stroke-opacity': 0.5 }, m);
      el('path', { d: `M0,0L${rx},${ry}L${tx},${ty}Z`, fill: b, stroke: '#4a2f17', 'stroke-width': 0.8, 'stroke-opacity': 0.5 }, m);
    };
    for (const deg of [45, 135, 225, 315]) pt(deg, 76, 13, GOLD.light, GOLD.mid);
    for (const deg of [0, 90, 180, 270]) pt(deg, 112, 17, deg === 270 ? LEATHER.light : '#fbf1d8', deg === 270 ? LEATHER.dark : '#b9a074');
    el('circle', { r: 9, fill: radGrad(m, [[0, GOLD.hi], [0.6, GOLD.base], [1, GOLD.dark]], -3, -3, 11), stroke: GOLD.dark, 'stroke-width': 1 }, m);
    // kamboja kecil sebagai penanda utara
    const n = el('g', { transform: 'translate(0 -150)' }, m);
    for (let i = 0; i < 5; i++) el('path', { d: PETAL, fill: LEATHER.base, 'fill-opacity': 0.8, transform: `rotate(${i * 72}) scale(0.9)` }, n);
  }

  function mapDesk(svg, R, { flowers = true, rose = true } = {}) {
    const tone = [[0, '#f6ead0'], [0.5, '#eedfbe'], [1, '#e0cba1']];
    wash(svg, { x: -40, y: -30, w: W + 80, h: H + 60, R, n: 580, angle: -10, len: [0.1, 0.26], width: [26, 64], opacity: [0.3, 0.7], base: linGrad(svg, tone, 0, 0, W, H), color: (u, v) => ramp(tone, v * 0.8 + u * 0.2) });
    // noda usia & bekas lipatan peta
    dabs(svg, { n: 44, R, filter: 'softer', place: (i, R2) => ({ x: R2() * W, y: R2() * H, rx: 40 + R2() * 110, ry: 26 + R2() * 70, rot: R2() * 180, color: R2() < 0.5 ? '#fffaf0' : '#b08a52', opacity: 0.1 + R2() * 0.1 }) });
    for (const y of [H * 0.34, H * 0.68]) {
      el('path', { d: `M-10,${y}H${W + 10}`, stroke: WARM, 'stroke-width': 3, 'stroke-opacity': 0.08, filter: 'url(#blur2)' }, svg);
      el('path', { d: `M-10,${y + 3}H${W + 10}`, stroke: '#fffaf0', 'stroke-width': 2, 'stroke-opacity': 0.4 }, svg);
    }
    // garis lintang & bujur
    const grid = el('g', { stroke: '#7b5a2e', 'stroke-width': 1.2, 'stroke-opacity': 0.15, fill: 'none' }, svg);
    for (let i = -1; i < 11; i++) el('path', { d: `M-40,${i * 150 + 70}Q${W / 2},${i * 150 + 20} ${W + 40},${i * 150 + 90}` }, grid);
    for (let i = 0; i < 8; i++) el('path', { d: `M${i * 122 - 30},-20Q${i * 122 + 14},${H / 2} ${i * 122 - 54},${H + 20}` }, grid);
    // pulau-pulau di tepi (tengah dibiarkan lapang untuk paspornya)
    const isl = el('g', {}, svg);
    [[96, 250, 100], [700, 420, 120], [40, 760, 86], [730, 900, 96], [660, 1280, 110], [250, 1420, 90]].forEach(([x, y, r]) => island(isl, R, x, y, r));
    // rute putus-putus antar kota
    const route = (d, dots) => {
      el('path', { d, fill: 'none', stroke: LEATHER.base, 'stroke-width': 3.2, 'stroke-opacity': 0.5, 'stroke-dasharray': '11 10', 'stroke-linecap': 'round' }, svg);
      dots.forEach(([x, y]) => {
        el('circle', { cx: x, cy: y, r: 13, fill: 'none', stroke: LEATHER.base, 'stroke-width': 2, 'stroke-opacity': 0.5 }, svg);
        el('circle', { cx: x, cy: y, r: 6, fill: LEATHER.base, 'fill-opacity': 0.7 }, svg);
      });
    };
    route('M104,262Q380,60 694,410', [[104, 262], [694, 410]]);
    route('M694,410Q560,820 730,902', [[730, 902]]);
    route('M46,768Q250,1100 664,1276', [[46, 768], [664, 1276]]);
    if (rose) compass(el('g', { transform: `translate(118 ${H - 196}) rotate(-8)` }, svg), R, 0.92);
    // cahaya hangat dari kiri-atas, tepi sedikit menggelap
    el('rect', { x: 0, y: 0, width: W, height: H, fill: linGrad(svg, [[0, '#fff6dc', 0.3], [0.45, '#fff6dc', 0], [1, WARM, 0.2]], 0, 0, W, H) }, svg);
    if (!flowers) return;
    const fr = F.flora, gr = fr.GREEN;
    const lf = (x, y, rot, len, w, k, curve = 0.15) => leaf(svg, { len, w, ...gr[k], R, n: 46, curve, transform: `translate(${x} ${y}) rotate(${rot})` });
    // kiri-atas: setangkai kecil di sudut saja, supaya tulisan kepala & tombol suara tetap bersih
    // (di HP yang jangkung, ±43 px tepi kiri-kanan lukisan ini terpotong)
    lf(34, 66, 164, 170, 66, 1, 0.18);
    lf(56, 44, 74, 120, 54, 0, -0.16);
    fr.flowers.kamboja(el('g', { transform: 'translate(64 50) rotate(18)' }, svg), R, 0.46);
    // kanan-bawah: kamboja merah muda, daun, melati
    lf(W + 8, H - 180, -50, 260, 98, 0, -0.2);
    lf(W - 120, H + 18, -16, 200, 86, 2);
    fr.flowers.kambojaPink(el('g', { transform: `translate(${W - 46} ${H - 84}) rotate(-12)` }, svg), R, 0.6);
    fr.flowers.melati(el('g', { transform: `translate(${W - 168} ${H - 36}) scale(0.8)` }, svg), R, 1);
    [[W - 236, H - 110, -70, 0.32, 'kamboja'], [300, H - 40, 40, 0.34, 'kambojaPink']].forEach(([x, y, rot, s, pal]) =>
      petal(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...fr.PAL[pal], cast: false }));
  }

  /* ───────────── mini-game: koper kekenyangan ───────────── */
  const TEAL = { hi: '#8fd3c8', light: '#58aea4', base: '#2f837b', dark: '#1d5c58', deep: '#103b3a' };
  const TAN = { hi: '#f6dcb0', light: '#e0b77c', base: '#bb8a4e', dark: '#855a29', deep: '#553615' };
  /** koper tampak depan, wajahnya digambar dari DOM. Barang nongol dari balik tepi atasnya. */
  function suitcase(g, R) {
    el('ellipse', { cx: 166, cy: 236, rx: 150, ry: 12, fill: WARM, opacity: 0.3, filter: 'url(#soft)' }, g);
    // badan menggembung
    const body = 'M34,60Q160,40 286,60Q304,62 304,84Q312,150 304,206Q302,228 280,228H40Q18,228 16,206Q8,150 16,84Q16,62 34,60Z';
    const b = patch(g, body, [10, 40, 300, 190], TEAL, R, { n: 150, len: [12, 34], width: [6, 13], cast: 'castBig' });
    el('path', { d: body, fill: radGrad(g, [[0, '#eafff9', 0.45], [0.5, '#eafff9', 0], [1, '#062221', 0.4]], 100, 90, 300) }, b.inner);
    // ritsleting di tepi atas
    el('path', { d: 'M22,82Q160,62 298,82', fill: 'none', stroke: TEAL.deep, 'stroke-width': 7, 'stroke-opacity': 0.75 }, b.inner);
    el('path', { d: 'M22,82Q160,62 298,82', fill: 'none', stroke: GOLD.light, 'stroke-width': 2.4, 'stroke-dasharray': '3 5' }, b.inner);
    // sabuk kulit
    for (const x of [78, 226]) {
      const strap = rrect(x - 13, 44, 26, 190, 4);
      const st = patch(b.inner, strap, [x - 13, 44, 26, 190], TAN, R, { n: 22, dir: 1.57, len: [16, 40] });
      el('path', { d: `M${x - 8},50V230M${x + 8},50V230`, stroke: TAN.deep, 'stroke-width': 1.2, 'stroke-dasharray': '5 5', 'stroke-opacity': 0.6 }, st.inner);
      el('path', { d: rrect(x - 17, 138, 34, 22, 5), fill: linGrad(g, [[0, GOLD.hi], [0.5, GOLD.base], [1, GOLD.dark]], x - 17, 138, x + 17, 160), stroke: GOLD.dark, 'stroke-width': 1.2 }, b.inner);
      el('path', { d: rrect(x - 9, 144, 18, 10, 3), fill: TAN.deep, opacity: 0.7 }, b.inner);
    }
    // pelindung sudut kuningan
    for (const [x, y, r] of [[16, 196, 0], [304, 196, 90]]) {
      const c = el('g', { transform: `translate(${x < 160 ? 14 : 306} 230) scale(${x < 160 ? 1 : -1} 1)` }, b.inner);
      el('path', { d: 'M0,-44Q0,0 44,0L44,-12Q14,-12 12,-44Z', fill: linGrad(g, [[0, GOLD.hi], [0.5, GOLD.base], [1, GOLD.dark]], 0, -44, 44, 0), stroke: GOLD.dark, 'stroke-width': 1 }, c);
      void y; void r;
    }
    // stiker perjalanan: hati & kamboja
    const s1 = el('g', { transform: 'translate(272 112) rotate(14)' }, b.inner);
    el('circle', { r: 17, fill: '#fff6e6', stroke: '#e9d3ad', 'stroke-width': 1.4 }, s1);
    el('path', { d: 'M0,8C-13,-2 -7,-13 0,-6C7,-13 13,-2 0,8Z', fill: '#d2424a' }, s1);
    const s2 = el('g', { transform: 'translate(40 120) rotate(-12)' }, b.inner);
    el('path', { d: rrect(-18, -14, 36, 28, 5), fill: '#ffe9a6', stroke: '#d9b860', 'stroke-width': 1.2 }, s2);
    for (let i = 0; i < 5; i++) el('path', { d: PETAL, fill: '#e5708a', transform: `rotate(${i * 72}) scale(0.62)` }, s2);
  }

  /** bantal leher: tapal kuda empuk biru muda bergaris */
  function neckPillow(g, R) {
    const BLUE = { hi: '#eaf6ff', light: '#b9dcf2', base: '#86bfe2', dark: '#4f8fbd', deep: '#2f6a96' };
    const d = 'M20,58C20,22 46,8 70,8C94,8 120,22 120,58C120,92 108,116 96,118C84,120 80,104 84,92C88,78 92,68 92,58C92,44 82,36 70,36C58,36 48,44 48,58C48,68 52,78 56,92C60,104 56,120 44,118C32,116 20,92 20,58Z';
    const p = patch(g, d, [20, 8, 100, 112], BLUE, R, { n: 70, len: [8, 22], width: [5, 10], cast: 'cast' });
    el('path', { d, fill: radGrad(g, [[0, '#ffffff', 0.6], [0.5, '#ffffff', 0], [1, '#123a5a', 0.3]], 52, 34, 110) }, p.inner);
    for (const a of [-52, -18, 18, 52]) el('path', { d: 'M70,2V40', stroke: '#fff', 'stroke-width': 5, 'stroke-opacity': 0.5, transform: `rotate(${a} 70 60)` }, p.inner);
    el('path', { d: 'M30,84q8,10 14,22M110,84q-8,10 -14,22', fill: 'none', stroke: BLUE.deep, 'stroke-width': 1.6, 'stroke-opacity': 0.4, 'stroke-linecap': 'round' }, p.inner);
  }

  /** penanak nasi mungil: badan krem, tutup bulat, lampu merah */
  function riceCooker(g, R) {
    const CR = { hi: '#ffffff', light: '#fbf4e6', base: '#eadfc8', dark: '#c4b596', deep: '#9a8a6a' };
    el('ellipse', { cx: 76, cy: 138, rx: 56, ry: 7, fill: WARM, opacity: 0.25, filter: 'url(#soft)' }, g);
    const body = 'M18,62Q18,52 28,52H124Q134,52 134,62V112Q134,134 112,134H40Q18,134 18,112Z';
    const b = patch(g, body, [18, 52, 116, 82], CR, R, { n: 60, dir: 1.57, len: [12, 30], cast: 'cast' });
    el('path', { d: body, fill: linGrad(g, [[0, '#ffffff', 0.5], [0.45, '#ffffff', 0], [1, '#5a4a2a', 0.3]], 18, 52, 134, 134) }, b.inner);
    // panel depan + lampu
    el('path', { d: rrect(50, 84, 52, 34, 9), fill: '#f6efe0', stroke: CR.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, b.inner);
    el('circle', { cx: 64, cy: 101, r: 6, fill: '#e2463c' }, b.inner);
    el('circle', { cx: 62, cy: 99, r: 2, fill: '#ffd9d2' }, b.inner);
    el('path', { d: rrect(76, 96, 18, 10, 4), fill: CR.dark }, b.inner);
    // tutup
    const lid = 'M14,56Q14,24 76,24Q138,24 138,56Q138,62 130,62H22Q14,62 14,56Z';
    const l = patch(g, lid, [14, 24, 124, 38], CR, R, { n: 40, dir: 0.1, len: [12, 30], cast: 'cast' });
    el('path', { d: lid, fill: radGrad(g, [[0, '#ffffff', 0.7], [0.5, '#ffffff', 0], [1, '#5a4a2a', 0.25]], 54, 30, 100) }, l.inner);
    el('path', { d: rrect(58, 12, 36, 16, 8), fill: '#d2424a', stroke: '#8f2228', 'stroke-width': 1.2 }, g);
    el('circle', { cx: 112, cy: 40, r: 3.4, fill: CR.deep, opacity: 0.6 }, g);
    // gagang samping
    for (const x of [8, 134]) el('path', { d: rrect(x, 70, 10, 22, 4), fill: CR.dark, stroke: CR.deep, 'stroke-width': 1 }, g);
  }

  /** sandal jepit sebelah, tampak atas dan agak miring: alas kuning mangga, tali toska, cap kamboja di tumit */
  function flipFlop(g, R) {
    const SOLE = { hi: '#fff0bd', light: '#ffd879', base: '#f7b944', dark: '#dd9224', deep: '#a8650f' };
    const m = el('g', { transform: 'rotate(-12 100 66)' }, g);
    const sole = 'M22,66C22,40 44,28 80,30C118,32 166,32 180,58C190,80 164,102 126,104C92,106 60,108 40,96C28,89 22,80 22,66Z';
    // tebal alas: sisi bawah yang lebih gelap
    el('path', { d: sole, fill: SOLE.deep, transform: 'translate(3 6)', filter: 'url(#cast)' }, m);
    const p = patch(m, sole, [22, 28, 162, 80], SOLE, R, { n: 80, dir: 0.05, len: [14, 38], width: [5, 11] });
    el('path', { d: sole, fill: radGrad(g, [[0, '#fffbe6', 0.65], [0.5, '#fffbe6', 0], [1, '#7a4208', 0.32]], 66, 48, 150) }, p.inner);
    // bekas tumit dan jari yang sudah aus
    el('ellipse', { cx: 140, cy: 68, rx: 27, ry: 21, fill: SOLE.dark, opacity: 0.3 }, p.inner);
    for (const [x, y, r] of [[44, 52, 6], [40, 66, 6.5], [44, 80, 6], [53, 92, 5]]) el('circle', { cx: x, cy: y, r, fill: SOLE.dark, opacity: 0.22 }, p.inner);
    const k = el('g', { transform: 'translate(140 68) rotate(20)', opacity: 0.55 }, p.inner);
    for (let i = 0; i < 5; i++) el('path', { d: PETAL, fill: '#fff8e0', transform: `rotate(${i * 72}) scale(0.78)` }, k);
    // tali jepit: dari sela jari ke dua sisi
    for (const d of ['M64,66Q84,44 116,36', 'M64,66Q84,90 116,100']) {
      el('path', { d, fill: 'none', stroke: TEAL.deep, 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-opacity': 0.5, transform: 'translate(2 3)' }, m);
      el('path', { d, fill: 'none', stroke: TEAL.base, 'stroke-width': 9, 'stroke-linecap': 'round' }, m);
      el('path', { d, fill: 'none', stroke: TEAL.hi, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-opacity': 0.8, transform: 'translate(-1 -2)' }, m);
    }
    el('circle', { cx: 63, cy: 66, r: 7, fill: radGrad(g, [[0, TEAL.hi], [0.6, TEAL.base], [1, TEAL.deep]], 61, 63, 8) }, m);
  }

  /* ───────────── sprite ───────────── */
  /** benda digambar di kanvas besar (koordinat di atas), dirender K× supaya berkasnya ringan */
  const K = 0.8;
  const page = (name, seed, fn, k = K) => {
    F.sprites[name] = { w: PW * k, h: PH * k, viewBox: `0 0 ${PW} ${PH}`, seed, draw(svg, R) { fn(svg, R); } };
  };
  F.sprites['bg-paspor'] = { w: W, h: H, seed: 561, scale: 1, draw(svg, R) { mapDesk(svg, R); } };
  page('paspor-sampul', 562, (svg, R) => coverArt(svg, R));
  page('paspor-halaman', 563, (svg, R) => pagePaper(svg, R));
  // halaman terakhir hanya tampil sebentar dan sebagian tertutup kantong: cukup dirender lebih kecil
  page('paspor-dalam', 564, (svg, R) => endpaper(svg, R), 0.56);
  page('paspor-kantong', 565, (svg, R) => pocket(svg, R), 0.66);
  F.sprites['paspor-foto'] = { w: 150, h: 190, viewBox: '0 0 300 380', seed: 566, draw(svg, R) { photoArt(svg, R, 300, 380); } };
  F.sprites['paspor-stempel'] = { w: 132, h: 162, viewBox: '0 0 220 270', seed: 567, draw(svg, R) { stampTool(svg, R); } };
  // tekstur tinta cap: bidang putih berlubang-lubang, dipakai sebagai mask supaya tintanya tidak rata
  F.sprites['paspor-tinta'] = { w: 128, h: 128, viewBox: '0 0 256 256', seed: 568, draw(svg, R) {
    const id = F.uid('m');
    const mask = el('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 256, height: 256 }, svg.querySelector('defs'));
    el('rect', { width: 256, height: 256, fill: '#fff' }, mask);
    const faded = el('g', { filter: 'url(#soft)' }, mask);
    for (let i = 0; i < 9; i++) el('ellipse', { cx: R() * 256, cy: R() * 256, rx: 18 + R() * 40, ry: 10 + R() * 26, fill: '#000', opacity: 0.2 + R() * 0.25, transform: `rotate(${R() * 180} 128 128)` }, faded);
    for (let i = 0; i < 520; i++) el('circle', { cx: R() * 256, cy: R() * 256, r: 0.5 + R() * (R() < 0.08 ? 4.4 : 1.5), fill: '#000', opacity: 0.45 + R() * 0.55 }, mask);
    for (let i = 0; i < 12; i++) {
      const x = R() * 256, y = R() * 256;
      el('path', { d: `M${x},${y}l${(R() - 0.5) * 70},${(R() - 0.5) * 24}`, stroke: '#000', 'stroke-width': 0.8 + R() * 1.8, opacity: 0.6 }, mask);
    }
    el('rect', { width: 256, height: 256, fill: '#fff', mask: `url(#${id})` }, svg);
  } };
  F.sprites['game-paspor-koper'] = { w: 256, h: 200, viewBox: '0 0 320 250', seed: 569, draw(svg, R) { suitcase(svg, R); } };
  F.sprites['game-paspor-bantal'] = { w: 112, h: 104, viewBox: '0 0 140 130', seed: 570, draw(svg, R) { neckPillow(svg, R); } };
  F.sprites['game-paspor-penanak'] = { w: 122, h: 118, viewBox: '0 0 152 148', seed: 571, draw(svg, R) { riceCooker(svg, R); } };
  F.sprites['game-paspor-sandal'] = { w: 128, h: 84, viewBox: '0 0 204 134', seed: 573, draw(svg, R) { flipFlop(svg, R); } };

  F.sprites['cover-paspor'] = { w: 480, h: 600, seed: 572, draw(svg, R) {
    mapDesk(el('g', { transform: 'translate(0 -200) scale(0.6154)' }, svg), R, { flowers: false, rose: false });
    compass(el('g', { transform: 'translate(72 528) rotate(-10)' }, svg), R, 0.5);
    // bekas cap di peta
    const ink = el('g', { transform: 'translate(388 112) rotate(14)', fill: 'none', stroke: LEATHER.base, opacity: 0.5, filter: 'url(#wobble)' }, svg);
    el('circle', { r: 58, 'stroke-width': 5 }, ink);
    el('circle', { r: 47, 'stroke-width': 1.6, 'stroke-dasharray': '2 6' }, ink);
    for (let i = 0; i < 5; i++) el('path', { d: PETAL, fill: LEATHER.base, stroke: 'none', transform: `rotate(${i * 72}) scale(1.5)` }, ink);
    // boarding pass yang terselip di dalam paspor: ujungnya (berkode batang) menyembul dari tepi atas
    const bp = el('g', { transform: 'translate(262 176) rotate(-97)', filter: 'url(#castBig)' }, svg);
    const tk = { hi: '#ffffff', light: '#fffaf0', base: '#f6ecd6', dark: '#e2d2ae', deep: '#c9b58a' };
    const t = patch(bp, rrect(-170, -70, 340, 140, 12), [-170, -70, 340, 140], tk, R, { n: 60, dir: 0.05, len: [20, 60], width: [8, 16] });
    el('path', { d: 'M-170,-70H170V-40H-170Z', fill: LEATHER.base }, t.inner);
    el('path', { d: 'M-170,-70H170V-40H-170Z', fill: linGrad(svg, [[0, '#ffd9cf', 0.22], [1, '#12030a', 0.18]], -170, 0, 170, 0) }, t.inner);
    el('path', { d: 'M88,-70V70', stroke: '#b9a074', 'stroke-width': 2, 'stroke-dasharray': '5 6' }, t.inner);
    for (const y of [-70, 70]) el('circle', { cx: 88, cy: y, r: 8, fill: '#e6d6b4' }, t.inner);
    for (let i = 0; i < 17; i++) el('path', { d: `M${100 + i * 3.6},-22V44`, stroke: '#2c2118', 'stroke-width': i % 3 ? 1.2 : 2.4, 'stroke-opacity': 0.8 }, t.inner);
    el('path', { d: 'M100,56h58', stroke: LEATHER.base, 'stroke-width': 4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, t.inner);
    for (const [x, y, w] of [[-150, -16, 90], [-150, 8, 140], [-150, 34, 110], [-30, -16, 96]]) el('path', { d: `M${x},${y}h${w}`, stroke: '#2c2118', 'stroke-width': 5, 'stroke-opacity': 0.22, 'stroke-linecap': 'round' }, t.inner);
    // pesawat kecil di pita atas, di ujung yang menyembul
    el('path', { d: 'M21.5 3.2c-1-1-2.9-.6-4.4.9l-3 3L4 4.6 2.6 6l8 4.6-3.3 3.4-2.6-.4L3.4 15l3.4 1.9L8.7 20.3l1.3-1.3-.4-2.6 3.4-3.3 4.6 8 1.4-1.4-2.5-10.1 3-3c1.5-1.5 1.9-3.4 2-3.4Z', fill: '#fff6e6', transform: 'translate(114 -67) scale(1.05)' }, t.inner);
    // paspor: sedikit miring, dengan bayangan di meja
    const ps = el('g', { transform: 'translate(94 120) rotate(-7 150 210) scale(0.7)' }, svg);
    el('path', { d: book(14, 20, PW, PH, 26, 7), fill: WARM, opacity: 0.4, filter: 'url(#softer)' }, ps);
    for (let i = 3; i >= 1; i--) el('path', { d: book(i * 1.6, i * 2.2, PW, PH, 24, 4), fill: i % 2 ? '#f6ead0' : '#e3d2ac' }, ps);
    coverArt(ps, R, { bars: true });
    // bunga & daun di sudut
    const fr = F.flora, gr = fr.GREEN;
    leaf(svg, { len: 150, w: 58, ...gr[0], R, n: 40, curve: -0.2, transform: 'translate(492 474) rotate(-58)' });
    leaf(svg, { len: 130, w: 52, ...gr[2], R, n: 40, transform: 'translate(420 616) rotate(-20)' });
    fr.flowers.kambojaPink(el('g', { transform: 'translate(444 544) rotate(-12)' }, svg), R, 0.4);
    fr.flowers.melati(el('g', { transform: 'translate(374 580) scale(0.5)' }, svg), R, 1);
    leaf(svg, { len: 120, w: 48, ...gr[1], R, n: 40, transform: 'translate(486 60) rotate(-112)' });
    fr.flowers.kamboja(el('g', { transform: 'translate(452 36) rotate(20)' }, svg), R, 0.3);
  } };
})();
