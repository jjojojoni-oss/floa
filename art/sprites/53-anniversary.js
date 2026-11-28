/* Anniversary "Kereta Malam": perjalanan kereta malam dari stasiun hari jadian sampai "Stasiun Hari Ini".
   Peron malam (atap peron, papan nama, jam stasiun, gerbong anggur-krem berjendela hangat, pintu geser,
   lantai peron basah, bangku, karcis karton), kabin (dinding jati, jendela, kerai, lampu dinding),
   pemandangan jendela yang bisa disambung tanpa jahitan (gunung jauh, sawah & sungai, tiang listrik dekat),
   peron yang lewat di jendela, patok kilometer, mulut terowongan, jembatan malam, kereta kecil, lampion,
   amplop, dan lokomotif mainan untuk mini-game. Semua tulisan dipasang dari DOM di atas lukisan ini.
   Satuan gambar: 32 = 1em layar (Stage 24.4em = 780). */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf, petal, linGrad, radGrad } = F;
  const W = 780, H = 1500;
  const WINE = { hi: '#b0465a', light: '#8e2c40', base: '#6c1e2e', mid: '#521624', dark: '#370d17', deep: '#20060c' };
  const GOLD = { hi: '#fff3c8', light: '#f6d580', base: '#e0aa48', mid: '#b47f26', dark: '#7a5214', deep: '#4a300a' };
  const CREAM = { hi: '#fffaf0', light: '#f6ead0', base: '#ecdab2', mid: '#d4bc8c', dark: '#a6875a', deep: '#6e5534' };
  const IRON = { hi: '#6a7a98', light: '#3f4e6c', base: '#28344e', mid: '#1c2539', dark: '#121a2a', deep: '#080c16' };
  const TEAL = { hi: '#4f8a84', light: '#2f6662', base: '#1f4a48', mid: '#183a39', dark: '#10292a', deep: '#081617' };
  const WOOD = { hi: '#d7975a', light: '#b8743e', base: '#935528', mid: '#74401c', dark: '#4e2812', deep: '#2c1409' };
  const LAMP = { hot: '#fff8e2', warm: '#ffdc94', glow: '#f0b44c', deep: '#c9742e', ember: '#8a3e18' };
  const GOLD_STOPS = [[0, GOLD.light], [0.18, GOLD.hi], [0.4, GOLD.light], [0.62, GOLD.base], [0.85, GOLD.mid], [1, GOLD.dark]];

  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  /** sama dengan rrect tetapi berlawanan arah jarum jam (untuk melubangi bidang) */
  const rrectRev = (x, y, w, h, r) => `M${x + r},${y}Q${x},${y} ${x},${y + r}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w - r}Q${x + w},${y + h} ${x + w},${y + h - r}V${y + r}Q${x + w},${y} ${x + w - r},${y}Z`;
  const circ = (cx, cy, r, cw = true) => `M${cx - r},${cy}A${r},${r} 0 1 ${cw ? 1 : 0} ${cx + r},${cy}A${r},${r} 0 1 ${cw ? 1 : 0} ${cx - r},${cy}Z`;

  /** bidang dilukis: gradien (terang kiri-atas → gelap kanan-bawah, atau arah gd) + sapuan searah `dir` */
  function lit(g, d, box, stops, R, { n = 50, dir = [1, 0], width = [4, 10], len = [0.1, 0.3], filter = 'impastoFine', cast, gd, op = [0.2, 0.5] } = {}) {
    const [x, y, w, h] = box;
    const [x1, y1, x2, y2] = gd || [x, y, x + w, y + h];
    const vx = x2 - x1, vy = y2 - y1, vv = vx * vx + vy * vy || 1;
    return painted(g, d, {
      base: linGrad(g, stops, x1, y1, x2, y2), n, R, filter, cast,
      stroke: () => {
        const px = x + R() * w, py = y + R() * h;
        const t = ((px - x1) * vx + (py - y1) * vy) / vv;
        const L = Math.max(w, h) * (len[0] + R() * (len[1] - len[0])), m = Math.hypot(dir[0], dir[1]) || 1;
        return { d: `M${px},${py}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(ramp(stops, t + (R() - 0.5) * 0.08), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: op[0] + R() * (op[1] - op[0]) };
      },
    });
  }
  /** pendar cahaya lembut (lingkaran bergradien, bisa dipipihkan) */
  function glow(g, cx, cy, r, color, op = 0.6, sy = 1) {
    return el('circle', { cx: 0, cy: 0, r, fill: radGrad(g, [[0, color, op], [0.3, color, op * 0.55], [0.65, color, op * 0.16], [1, color, 0]], 0, 0, r), transform: `translate(${cx} ${cy}) scale(1 ${sy})` }, g);
  }
  /** garis bersinar tipis (kilap logam / tepi kaca) */
  const line = (g, d, c, w, o = 1, extra = {}) => el('path', { d, fill: 'none', stroke: c, 'stroke-width': w, 'stroke-opacity': o, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra }, g);

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
  /** kamboja kecil lima kelopak (tanda floa / lambang "Jalur Kita"), berpusat di (x,y) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
  function mark(g, x, y, s, fill, opacity = 1) {
    const m = el('g', { transform: `translate(${x} ${y}) scale(${s})`, opacity }, g);
    for (let i = 0; i < 5; i++) el('path', { d: MARK, fill, transform: `rotate(${i * 72})` }, m);
    el('circle', { r: 3.4, fill: mix(fill, '#fff4cc', 0.6) }, m);
    return m;
  }
  /** lencana emas berisi kamboja */
  function badge(g, x, y, r, R) {
    const b = el('g', { filter: 'url(#cast)' }, g);
    el('circle', { cx: x, cy: y, r, fill: radGrad(g, [[0, GOLD.hi], [0.55, GOLD.base], [1, GOLD.dark]], x - r * 0.35, y - r * 0.4, r * 1.4), stroke: GOLD.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, b);
    el('circle', { cx: x, cy: y, r: r * 0.8, fill: 'none', stroke: GOLD.dark, 'stroke-width': 1.2, 'stroke-opacity': 0.55 }, b);
    mark(b, x, y + r * 0.05, r / 26, WINE.base);
  }

  /** gambar yang bisa disambung kiri-kanan tanpa jahitan: isi digambar tiga kali (geser −w, 0, +w) dan dipotong */
  function tile(svg, w, h, seed, draw, O = 120) {
    const defs = svg.querySelector('defs');
    const id = F.uid('tl');
    el('rect', { x: 0, y: 0, width: w, height: h }, el('clipPath', { id }, defs));
    const mid = F.uid('tm');
    const mk = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: w - O - 4, y: -20, width: O + 40, height: h + 40 }, defs);
    el('rect', { x: w - O, y: -20, width: O, height: h + 40, fill: linGrad(svg, [[0, '#000'], [1, '#fff']], w - O, 0, w, 0) }, mk);
    el('rect', { x: w, y: -20, width: 40, height: h + 40, fill: '#fff' }, mk);
    const g = el('g', { 'clip-path': `url(#${id})` }, svg);
    draw(el('g', {}, g), F.rng(seed));
    // salinan berikutnya memudar masuk di tepi kanan, jadi ujung kanan bersambung mulus dengan ujung kiri
    draw(el('g', { transform: `translate(${w} 0)` }, el('g', { mask: `url(#${mid})` }, g)), F.rng(seed));
  }

  /* ───────────── langit malam (latar) ───────────── */
  const SKY = [[0, '#081026'], [0.3, '#101b39'], [0.55, '#1b2950'], [0.72, '#2e3768'], [0.86, '#524574'], [1, '#7e5a72']];
  function stars(g, R, { n = 300, w = W, h = H * 0.8, band, big = 12 } = {}) {
    dabs(g, { n, R, filter: null, place: (i, R2) => {
      let x = R2() * w, y = Math.pow(R2(), 1.2) * h;
      if (band && R2() < 0.45) {
        const t = R2(), off = (R2() + R2() + R2() - 1.5) * band.spread;
        x = band.x0 + t * (band.x1 - band.x0) + off * 0.7;
        y = band.y0 + t * (band.y1 - band.y0) + off;
      }
      const r = R2() < 0.08 ? 1.9 + R2() * 1.1 : 0.7 + R2() * 1.1;
      return { x, y, rx: r, color: R2() < 0.25 ? '#ffe7b0' : R2() < 0.3 ? '#cfd8ff' : '#ffffff', opacity: 0.35 + R2() * 0.6 };
    } });
    for (let i = 0; i < big; i++) {
      const x = 30 + R() * (w - 60), y = 20 + Math.pow(R(), 1.3) * h * 0.85, r = 3 + R() * 3;
      glow(g, x, y, r * 6, '#fff1cc', 0.4);
      el('circle', { cx: x, cy: y, r: r * 0.55, fill: '#fffdf4' }, g);
      line(g, `M${x - r * 2.4},${y}H${x + r * 2.4}M${x},${y - r * 2.4}V${y + r * 2.4}`, '#fff6dc', 0.9, 0.6);
    }
  }
  function moon(g, x, y, r) {
    glow(g, x, y, r * 5.4, '#ffe9b8', 0.32);
    glow(g, x, y, r * 2.2, '#fff3d4', 0.4);
    const m = el('g', { filter: 'url(#blur2)' }, g);
    el('circle', { cx: x, cy: y, r, fill: radGrad(g, [[0, '#fffbea'], [0.75, '#fbefcf'], [1, '#ecd9ad']], x - r * 0.3, y - r * 0.3, r * 1.3) }, m);
    for (const [dx, dy, rr, o] of [[-0.3, -0.2, 0.22, 0.35], [0.28, 0.25, 0.16, 0.3], [0.1, -0.42, 0.1, 0.25], [-0.15, 0.4, 0.12, 0.22]]) el('circle', { cx: x + dx * r, cy: y + dy * r, r: rr * r, fill: '#d9c597', opacity: o }, g);
  }
  /** deret bukit gelap di cakrawala, dengan lampu kampung kecil */
  function hills(g, R, { y0 = H - 300, w = W, h = H, lights = 40, cols = ['#262c5c', '#181e44', '#0d1330'], filter = 'impasto', dir = [0.4, 1] } = {}) {
    cols.forEach((c, k) => {
      const base = y0 + k * 64;
      let d = `M-20,${h + 10}V${base}`;
      for (let x = -20; x <= w + 20; x += 12) {
        let y = base - [70, 34, 18][k] * (0.5 + 0.5 * Math.sin(x / [150, 110, 70][k] + k * 2.1)) - [10, 8, 6][k] * Math.sin(x / 23 + k);
        if (k === 0) y = Math.min(y, base - 150 + Math.abs(x - w * 0.3) * 0.75);
        if (k === 2) y -= 10 * Math.abs(Math.sin(x / 9 + R() * 0.3));
        d += `L${x},${y.toFixed(1)}`;
      }
      d += `V${h + 10}Z`;
      lit(g, d, [-20, base - 160, w + 40, h - base + 170], [[0, mix(c, '#6a6aa0', 0.3 - k * 0.1)], [0.35, c], [1, mix(c, '#000', 0.35)]], R, { n: 50, dir, width: [8, 18], len: [0.04, 0.12], filter, gd: [0, base - 120, 0, h] });
      if (k < 2) dabs(g, { n: lights * (k === 0 ? 0.6 : 1), R, filter: null, place: (i, R2) => {
        const x = R2() * w;
        return { x, y: base + 10 + R2() * (40 + k * 30), rx: 1.1 + R2() * (1.4 + k), color: R2() < 0.7 ? '#ffd27a' : '#ffefc4', opacity: 0.55 + R2() * 0.45 };
      } });
    });
  }
  function night(svg, R, { hillsOn = true } = {}) {
    F.latar.sky(svg, R, SKY, { n: 520 });
    // bimasakti: pita lembut yang miring
    const mw = el('g', { filter: 'url(#softer)' }, svg);
    for (let i = 0; i < 46; i++) {
      const t = R(), x = -80 + t * 960 + (R() - 0.5) * 120, y = 1040 - t * 980 + (R() - 0.5) * 120;
      el('ellipse', { cx: x, cy: y, rx: 40 + R() * 90, ry: 20 + R() * 34, fill: R() < 0.5 ? '#5a66b0' : '#8e7cc0', opacity: 0.07 + R() * 0.12, transform: `rotate(${-46 + (R() - 0.5) * 30} ${x} ${y})` }, mw);
    }
    stars(svg, R, { n: 420, band: { x0: -80, y0: 1040, x1: 880, y1: 60, spread: 90 }, big: 14 });
    moon(svg, 668, 318, 34);
    // awan tipis yang tersorot bulan
    F.latar.clouds(svg, R, '#8d8fc4', [[600, 390, 300, 30, 0.22], [190, 560, 300, 30, 0.16]]);
    if (hillsOn) {
      el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#ffb877', 0.22], [0.5, '#ff9e6a', 0.07], [1, '#ff9e6a', 0]], W * 0.45, H - 220, 520) }, svg);
      hills(svg, R, { y0: H - 320 });
    }
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#000', 0], [0.6, '#000', 0], [1, '#03060f', 0.55]], W / 2, H * 0.45, H * 0.72) }, svg);
  }

  /* ───────────── atap peron: plafon kayu, lisplang berkerawang, kepala tiang & dua lampu gantung ───────────── */
  const AW = 780, AH = 240;
  function canopy(g, R) {
    // plafon (bagian bawah atap) papan kayu hijau tua
    lit(g, `M-10,-10H${AW + 10}V128H-10Z`, [-10, -10, AW + 20, 140], [[0, '#0b1716'], [0.6, '#11211f'], [1, '#182c2a']], R, { n: 120, dir: [1, 0], width: [5, 12], len: [0.1, 0.3], gd: [0, 0, 0, 128] });
    // papan plafon makin rapat ke belakang (perspektif), kasau menyempit ke titik hilang
    for (let k = 1; k < 9; k++) { const y = 128 * Math.pow(k / 9, 1.7); line(g, `M-10,${y}H${AW + 10}`, '#040a0a', 1.4, 0.45); line(g, `M-10,${y + 1.6}H${AW + 10}`, '#2c4a46', 0.8, 0.35); }
    for (let x = -360; x < AW + 400; x += 130) line(g, `M${x},128L${AW / 2 + (x - AW / 2) * 0.55},0`, '#040a0a', 5, 0.5);
    glow(g, 96, 128, 170, LAMP.warm, 0.22, 0.7);
    glow(g, AW - 96, 128, 170, LAMP.warm, 0.22, 0.7);
    // balok depan krem bergaris anggur
    lit(g, `M-10,118H${AW + 10}V164H-10Z`, [-10, 118, AW + 20, 46], [[0, CREAM.hi], [0.35, CREAM.light], [1, CREAM.mid]], R, { n: 70, dir: [1, 0], width: [4, 9], cast: 'cast', gd: [0, 118, 0, 164] });
    line(g, `M-10,128H${AW + 10}`, WINE.base, 5);
    line(g, `M-10,154H${AW + 10}`, GOLD.mid, 2.4);
    line(g, `M-10,120H${AW + 10}`, '#fffaf0', 1.4, 0.8);
    // lisplang berkerawang: deret gigi bulat dengan lubang
    const tw = 39;
    let teeth = `M-12,162`;
    for (let x = -12; x < AW + 12; x += tw) teeth += `V182Q${x + tw / 2},${206} ${x + tw},182V162`;
    teeth += 'Z';
    const tg = lit(g, teeth, [-12, 160, AW + 24, 48], [[0, CREAM.light], [0.6, CREAM.base], [1, CREAM.mid]], R, { n: 50, dir: [1, 0.2], width: [3, 7], cast: 'cast', gd: [0, 160, 0, 206] });
    for (let x = -12; x < AW + 12; x += tw) {
      el('circle', { cx: x + tw / 2, cy: 181, r: 5.5, fill: TEAL.deep }, tg.inner);
      line(tg.inner, `M${x + tw},166V186`, CREAM.dark, 1.4, 0.5);
    }
    // kepala tiang besi cor + siku berulir di kiri & kanan
    for (const [x, s] of [[24, 1], [AW - 24, -1]]) {
      const b = el('g', { filter: 'url(#cast)' }, g);
      lit(b, `M${x - 13},150H${x + 13}V${AH + 4}H${x - 13}Z`, [x - 13, 150, 26, AH - 146], [[0, IRON.light], [0.3, IRON.hi], [0.55, IRON.base], [1, IRON.deep]], R, { n: 12, dir: [0, 1], gd: [x - 13, 0, x + 13, 0] });
      lit(b, `M${x - 22},146H${x + 22}V162H${x - 22}Z`, [x - 22, 146, 44, 16], [[0, IRON.hi], [0.5, IRON.base], [1, IRON.deep]], R, { n: 8 });
      const sc = `M${x + s * 12},${AH - 14}C${x + s * 40},${AH - 24} ${x + s * 46},${178} ${x + s * 64},${166}`;
      line(b, sc, IRON.deep, 9);
      line(b, sc, IRON.light, 3.2, 0.9);
      line(b, `M${x + s * 64},166c${s * 10},5 ${s * 5},17 ${-s * 5},12`, IRON.deep, 5);
      line(b, `M${x + s * 30},${AH - 30}c${s * 12},-8 ${s * 10},-24 ${-s * 3},-22c${-s * 10},3 ${-s * 6},14 ${s * 3},10`, IRON.deep, 4);
    }
    // dua lampu gantung kecil
    for (const x of [112, AW - 112]) {
      line(g, `M${x},150V180`, IRON.deep, 3.4);
      glow(g, x, 204, 90, LAMP.warm, 0.5);
      const l = el('g', { filter: 'url(#cast)' }, g);
      lit(l, `M${x - 18},180H${x + 18}L${x + 12},192H${x - 12}Z`, [x - 18, 180, 36, 12], [[0, IRON.hi], [1, IRON.deep]], R, { n: 6 });
      el('path', { d: `M${x - 12},192H${x + 12}L${x + 14},222Q${x},230 ${x - 14},222Z`, fill: radGrad(g, [[0, LAMP.hot], [0.5, LAMP.warm], [1, LAMP.glow]], x - 4, 204, 26) }, l);
      line(l, `M${x - 12},192L${x - 14},222M${x + 12},192L${x + 14},222M${x},192V228`, IRON.mid, 1.6, 0.8);
      glow(g, x, 206, 30, LAMP.hot, 0.8);
    }
  }

  /* ───────────── papan nama stasiun (enamel krem berbingkai biru tua, digantung dua rantai) ───────────── */
  const PW = 560, PH = 206;
  function signBoard(g, R, { chains = true } = {}) {
    if (chains) {
      for (const x of [96, PW - 96]) {
        for (let y = 2; y < 58; y += 11) {
          const flat = Math.round(y / 11) % 2 === 0;
          el('ellipse', { cx: x, cy: y + 5, rx: flat ? 4.2 : 1.8, ry: 6.4, fill: 'none', stroke: IRON.deep, 'stroke-width': 3.6 }, g);
          el('ellipse', { cx: x, cy: y + 5, rx: flat ? 4.2 : 1.8, ry: 6.4, fill: 'none', stroke: IRON.light, 'stroke-width': 1.4 }, g);
        }
      }
    }
    const y0 = 56, bh = PH - 64;
    const b = el('g', { filter: 'url(#castBig)' }, g);
    lit(b, rrect(6, y0, PW - 12, bh, 18), [6, y0, PW - 12, bh], [[0, '#2f4478'], [0.4, '#1e2f5c'], [1, '#121c3c']], R, { n: 40, dir: [1, 0.1], width: [4, 10] });
    const face = lit(b, rrect(22, y0 + 16, PW - 44, bh - 32, 10), [22, y0 + 16, PW - 44, bh - 32], [[0, CREAM.hi], [0.3, CREAM.light], [0.75, CREAM.base], [1, CREAM.mid]], R, { n: 80, dir: [1, 0.06], width: [5, 12], len: [0.06, 0.2] });
    el('rect', { x: 22, y: y0 + 16, width: PW - 44, height: bh - 32, fill: kawung(g, '#8a6a3a', 40, 1.1), opacity: 0.07 }, face.inner);
    el('path', { d: rrect(30, y0 + 24, PW - 60, bh - 48, 7), fill: 'none', stroke: GOLD.mid, 'stroke-width': 2, 'stroke-opacity': 0.75 }, b);
    // sekrup & cat yang terkelupas sedikit
    for (const [x, y] of [[14, y0 + 10], [PW - 14, y0 + 10], [14, y0 + bh - 10], [PW - 14, y0 + bh - 10]]) {
      el('circle', { cx: x, cy: y, r: 5, fill: GOLD.base, stroke: GOLD.deep, 'stroke-width': 1.2 }, b);
      line(b, `M${x - 2.5},${y - 1}l5,2`, GOLD.deep, 1.2);
    }
    for (const [x, y, r] of [[40, y0 + 6, 5], [PW - 70, y0 + bh - 6, 4], [PW - 30, y0 + 50, 3]]) el('circle', { cx: x, cy: y, r, fill: '#0a0f1d', opacity: 0.7 }, b);
    el('path', { d: rrect(6, y0, PW - 12, bh, 18), fill: linGrad(g, [[0, '#fff', 0.22], [0.35, '#fff', 0], [1, '#000', 0.12]], 0, y0, PW * 0.6, y0 + bh) }, b);
  }

  /* ───────────── jam stasiun pada siku besi ───────────── */
  const JW = 180, JH = 196, JC = { x: 76, y: 120 }, JR = 60;
  function clock(g, R) {
    // siku dari tiang (kanan) ke jam
    const arm = el('g', { filter: 'url(#cast)' }, g);
    line(arm, `M${JW},40H${JC.x}`, IRON.deep, 9);
    line(arm, `M${JW},38H${JC.x + 4}`, IRON.light, 2.6, 0.9);
    line(arm, `M${JW - 8},44C${JW - 60},${50} ${JW - 50},${96} ${JC.x + JR - 6},${JC.y - 18}`, IRON.deep, 6);
    line(arm, `M${JW - 46},44c-24,8 -14,34 4,26c12,-6 4,-20 -6,-14`, IRON.deep, 4.4);
    line(arm, `M${JC.x},40V${JC.y - JR}`, IRON.deep, 7);
    // badan jam: cincin besi, bezel kuningan, muka enamel
    const c = el('g', { filter: 'url(#castBig)' }, g);
    lit(c, circ(JC.x, JC.y, JR), [JC.x - JR, JC.y - JR, JR * 2, JR * 2], [[0, IRON.hi], [0.4, IRON.base], [1, IRON.deep]], R, { n: 20 });
    lit(c, circ(JC.x, JC.y, JR - 6) + circ(JC.x, JC.y, JR - 13, false), [JC.x - JR, JC.y - JR, JR * 2, JR * 2], GOLD_STOPS, R, { n: 24 });
    const face = lit(c, circ(JC.x, JC.y, JR - 13), [JC.x - JR, JC.y - JR, JR * 2, JR * 2], [[0, '#fffdf6'], [0.6, '#f6ecd6'], [1, '#dccaa2']], R, { n: 30, width: [3, 7] });
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2, big = i % 5 === 0, r1 = JR - 17, r2 = r1 - (big ? 8 : 3.5);
      line(face.inner, `M${JC.x + Math.sin(a) * r1},${JC.y - Math.cos(a) * r1}L${JC.x + Math.sin(a) * r2},${JC.y - Math.cos(a) * r2}`, '#1b2a4e', big ? 3.4 : 1.2, big ? 0.95 : 0.6);
    }
    mark(face.inner, JC.x, JC.y + 22, 0.42, WINE.base, 0.8);
    el('circle', { cx: JC.x, cy: JC.y, r: JR - 13, fill: linGrad(g, [[0, '#fff', 0.5], [0.4, '#fff', 0], [1, '#000', 0.1]], JC.x - JR, JC.y - JR, JC.x + JR, JC.y + JR) }, c);
    el('path', { d: `M${JC.x - 34},${JC.y - 26}Q${JC.x - 20},${JC.y - 44} ${JC.x + 2},${JC.y - 46}`, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, c);
  }

  /* ───────────── gerbong: anggur & krem, jendela-jendela hangat, pintu di tengah ───────────── */
  const GW = 1216, GH = 480, DOOR = { x: 528, y: 94, w: 160, h: 310 };
  const WINS = [12, 174, 336, 758, 920, 1082].map((x) => ({ x, y: 128, w: 122, h: 116 }));
  function windowGlow(g, R, { x, y, w, h }, k) {
    const wg = el('g', {}, g);
    const id = F.uid('wn');
    el('path', { d: rrect(x, y, w, h, 14) }, el('clipPath', { id }, wg));
    const inn = el('g', { 'clip-path': `url(#${id})` }, wg);
    el('rect', { x, y, width: w, height: h, fill: radGrad(g, [[0, LAMP.hot], [0.35, LAMP.warm], [0.75, LAMP.glow], [1, LAMP.deep]], x + w * 0.5, y + h * 0.25, h * 1.1) }, inn);
    // rak bagasi, sandaran kursi, tirai, lampu baca
    el('rect', { x, y: y + 14, width: w, height: 5, fill: LAMP.ember, opacity: 0.55 }, inn);
    el('path', { d: `M${x - 4},${y + h + 2}V${y + h - 30}Q${x + w * 0.25},${y + h - 52} ${x + w * 0.5},${y + h - 34}Q${x + w * 0.75},${y + h - 52} ${x + w + 4},${y + h - 30}V${y + h + 2}Z`, fill: WINE.base }, inn);
    el('path', { d: `M${x - 4},${y + h - 30}Q${x + w * 0.25},${y + h - 52} ${x + w * 0.5},${y + h - 34}Q${x + w * 0.75},${y + h - 52} ${x + w + 4},${y + h - 30}`, fill: 'none', stroke: WINE.hi, 'stroke-width': 3, 'stroke-opacity': 0.8 }, inn);
    const cl = k % 2 === 0;
    const cx = cl ? x : x + w;
    const s = cl ? 1 : -1;
    el('path', { d: `M${cx},${y}H${cx + s * 34}Q${cx + s * 20},${y + h * 0.45} ${cx + s * 26},${y + h}H${cx}Z`, fill: CREAM.light }, inn);
    line(inn, `M${cx + s * 10},${y + 4}Q${cx + s * 6},${y + h * 0.5} ${cx + s * 10},${y + h}M${cx + s * 22},${y + 4}Q${cx + s * 14},${y + h * 0.5} ${cx + s * 18},${y + h}`, CREAM.dark, 2, 0.5);
    line(inn, `M${cx},${y + h * 0.48}h${s * 24}`, WINE.base, 4);
    glow(inn, cl ? x + w - 26 : x + 26, y + 40, 30, LAMP.hot, 0.9);
    // kilap kaca
    el('path', { d: `M${x + 18},${y + h}L${x + 58},${y}H${x + 76}L${x + 36},${y + h}Z`, fill: '#ffffff', opacity: 0.12 }, inn);
    el('path', { d: rrect(x, y, w, h, 14), fill: 'none', stroke: GOLD.mid, 'stroke-width': 4 }, wg);
    line(wg, `M${x + 6},${y + 10}Q${x + 6},${y + 4} ${x + 14},${y + 4}H${x + w - 20}`, GOLD.hi, 1.6, 0.8);
  }
  function carriage(g, R, { doorOpen = false } = {}) {
    // bayangan di bawah gerbong
    glow(g, GW / 2, 430, 620, '#000', 0.5, 0.12);
    // atap melengkung
    const roof = `M0,78C0,44 24,24 74,20L${GW - 74},20C${GW - 24},24 ${GW},44 ${GW},78Z`;
    lit(g, roof, [0, 18, GW, 62], [[0, '#77819a'], [0.3, '#4a5470'], [0.7, '#2a3148'], [1, '#161b2a']], R, { n: 70, dir: [1, 0], width: [6, 12], op: [0.12, 0.3], gd: [0, 18, 0, 80] });
    for (const x of [190, 450, 770, 1030]) {
      lit(g, `M${x - 30},22Q${x - 26},4 ${x},4Q${x + 26},4 ${x + 30},22Z`, [x - 30, 2, 60, 22], [[0, '#8a93a8'], [1, '#2a3148']], R, { n: 10 });
    }
    line(g, `M60,24H${GW - 60}`, '#a9b2c6', 2.4, 0.6);
    // badan
    lit(g, `M0,74H${GW}V404H0Z`, [0, 74, GW, 330], [[0, WINE.light], [0.25, WINE.base], [0.7, WINE.mid], [1, WINE.dark]], R, { n: 220, dir: [0, 1], width: [10, 22], len: [0.06, 0.22], filter: 'impastoFine', op: [0.12, 0.32], gd: [0, 74, 0, 404] });
    line(g, `M0,78H${GW}`, '#0e0306', 5, 0.8);
    // pita krem jendela
    lit(g, `M0,112H${GW}V256H0Z`, [0, 112, GW, 144], [[0, CREAM.hi], [0.3, CREAM.light], [1, CREAM.mid]], R, { n: 150, dir: [1, 0], width: [5, 12], len: [0.04, 0.12], gd: [0, 112, 0, 256] });
    for (const [y, c, w] of [[108, GOLD.base, 3.4], [260, GOLD.base, 3.4], [114, '#fffaf0', 1.2], [116, WINE.dark, 1]]) line(g, `M0,${y}H${GW}`, c, w);
    WINS.forEach((wn, k) => windowGlow(g, R, wn, k));
    // panel bawah berbingkai timbul
    for (const [x0, x1] of [[16, 500], [716, 1200]]) {
      for (let x = x0; x < x1 - 20; x += 162) {
        const w = Math.min(146, x1 - x);
        el('path', { d: rrect(x, 290, w, 92, 8), fill: 'none', stroke: '#1d050a', 'stroke-width': 3, 'stroke-opacity': 0.7 }, g);
        el('path', { d: rrect(x + 2, 292, w, 92, 8), fill: 'none', stroke: WINE.hi, 'stroke-width': 1.4, 'stroke-opacity': 0.55 }, g);
      }
    }
    badge(g, 258, 336, 24, R);
    badge(g, 960, 336, 24, R);
    // cahaya jendela yang jatuh di badan
    WINS.forEach(({ x, w }) => glow(g, x + w / 2, 286, 70, LAMP.glow, 0.22, 0.5));
    // pintu: bingkai, ruang dalam yang hangat (terlihat saat pintu dibuka), pegangan
    const { x: dx, y: dy, w: dw, h: dh } = DOOR;
    const inner = el('g', {}, g);
    lit(inner, `M${dx},${dy}H${dx + dw}V${dy + dh}H${dx}Z`, [dx, dy, dw, dh], [[0, '#c98a4a'], [0.45, '#a8642e'], [1, '#5a2c14']], R, { n: 40, dir: [0, 1], width: [6, 12], gd: [0, dy, 0, dy + dh] });
    // pintu tembus ke lorong: bingkai dalam bercahaya
    el('path', { d: rrect(dx + 34, dy + 40, dw - 68, dh - 96, 8), fill: radGrad(g, [[0, '#fff4d2'], [0.5, '#ffd88a'], [1, '#e09a48']], dx + dw / 2, dy + 90, 120) }, inner);
    el('path', { d: rrect(dx + 34, dy + 40, dw - 68, dh - 96, 8), fill: 'none', stroke: '#5a2c14', 'stroke-width': 5 }, inner);
    for (const x of [dx + 14, dx + dw - 14]) line(inner, `M${x},${dy + 30}V${dy + dh - 40}`, '#7a3a1a', 3, 0.7);
    // lampu gantung kecil
    line(inner, `M${dx + dw / 2},${dy}V${dy + 22}`, GOLD.dark, 2.4);
    glow(inner, dx + dw / 2, dy + 30, 60, LAMP.hot, 0.9);
    el('ellipse', { cx: dx + dw / 2, cy: dy + 28, rx: 12, ry: 8, fill: LAMP.hot }, inner);
    // karpet merah di lantai lorong (perspektif)
    el('path', { d: `M${dx + 50},${dy + dh - 56}H${dx + dw - 50}L${dx + dw - 14},${dy + dh}H${dx + 14}Z`, fill: linGrad(g, [[0, WINE.light], [1, WINE.dark]], 0, dy + dh - 56, 0, dy + dh) }, inner);
    line(inner, `M${dx + 50},${dy + dh - 56}L${dx + 14},${dy + dh}M${dx + dw - 50},${dy + dh - 56}L${dx + dw - 14},${dy + dh}`, GOLD.base, 2, 0.8);
    lit(inner, `M${dx - 6},${dy + dh - 16}H${dx + dw + 6}V${dy + dh + 6}H${dx - 6}Z`, [dx - 6, dy + dh - 16, dw + 12, 22], GOLD_STOPS, R, { n: 10 });
    el('path', { d: rrect(dx - 8, dy - 8, dw + 16, dh + 8, 10), fill: 'none', stroke: '#1d050a', 'stroke-width': 7 }, g);
    el('path', { d: rrect(dx - 4, dy - 4, dw + 8, dh + 2, 8), fill: 'none', stroke: GOLD.base, 'stroke-width': 2.6 }, g);
    for (const x of [dx - 26, dx + dw + 26]) {
      const r = el('g', { filter: 'url(#cast)' }, g);
      lit(r, rrect(x - 5, 150, 10, 230, 5), [x - 5, 150, 10, 230], [[0, GOLD.hi], [0.5, GOLD.base], [1, GOLD.dark]], R, { n: 6, gd: [x - 5, 0, x + 5, 0] });
    }
    // sasis & bogi (sebagian besar tertutup bibir peron)
    lit(g, `M0,400H${GW}V430H0Z`, [0, 400, GW, 30], [[0, IRON.base], [1, IRON.deep]], R, { n: 30, gd: [0, 400, 0, 430] });
    for (const bx of [150, 1066]) {
      lit(g, rrect(bx - 110, 418, 220, 36, 8), [bx - 110, 418, 220, 36], [[0, IRON.light], [1, IRON.deep]], R, { n: 12 });
      for (const wx of [bx - 62, bx + 62]) {
        el('circle', { cx: wx, cy: 448, r: 34, fill: IRON.deep }, g);
        el('circle', { cx: wx, cy: 448, r: 26, fill: 'none', stroke: IRON.light, 'stroke-width': 3 }, g);
        el('circle', { cx: wx, cy: 448, r: 8, fill: GOLD.mid }, g);
      }
    }
    // kilap lampu peron di tepi atas badan (cahaya dari kiri-atas)
    el('rect', { x: 0, y: 74, width: GW, height: 330, fill: linGrad(g, [[0, '#ffd9a0', 0.14], [0.35, '#ffd9a0', 0], [1, '#05010a', 0.25]], 0, 0, GW, 0) }, g);
  }
  /** satu daun pintu geser (kiri); daun kanan = cermin */
  const DW = 80, DH = 310;
  function doorLeaf(g, R) {
    lit(g, `M0,0H${DW}V${DH}H0Z`, [0, 0, DW, DH], [[0, WINE.light], [0.3, WINE.base], [1, WINE.dark]], R, { n: 50, dir: [0, 1], width: [5, 10], gd: [0, 0, DW, DH] });
    windowGlow(g, R, { x: 12, y: 26, w: 56, h: 104 }, 1);
    el('path', { d: rrect(12, 156, 56, 130, 6), fill: 'none', stroke: '#1d050a', 'stroke-width': 2.6, 'stroke-opacity': 0.7 }, g);
    el('path', { d: rrect(13.5, 157.5, 56, 130, 6), fill: 'none', stroke: WINE.hi, 'stroke-width': 1.2, 'stroke-opacity': 0.6 }, g);
    lit(g, rrect(60, 176, 9, 74, 4), [60, 176, 9, 74], [[0, GOLD.hi], [0.5, GOLD.base], [1, GOLD.dark]], R, { n: 4, cast: 'cast', gd: [60, 0, 69, 0] });
    el('rect', { x: DW - 5, y: 0, width: 5, height: DH, fill: '#14040a' }, g);
    el('rect', { x: 0, y: 0, width: DW, height: DH, fill: linGrad(g, [[0, '#ffd9a0', 0.12], [0.5, '#ffd9a0', 0], [1, '#000', 0.15]], 0, 0, DW, DH) }, g);
  }

  /* ───────────── lantai peron basah, garis aman, genangan yang memantulkan lampu ───────────── */
  const LW = 780, LH = 820;
  function platform(g, R) {
    // tutup bibir peron (batu)
    lit(g, `M-10,0H${LW + 10}V40H-10Z`, [-10, 0, LW + 20, 40], [[0, '#9a96a0'], [0.5, '#6e6a78'], [1, '#3c3a48']], R, { n: 60, dir: [1, 0], width: [4, 9], gd: [0, 0, 0, 40] });
    for (let x = -10; x < LW; x += 96) line(g, `M${x},2V38`, '#2a2836', 2, 0.6);
    line(g, `M-10,2H${LW + 10}`, '#d8d2d8', 2, 0.55);
    // lantai ubin: perspektif ke arah gerbong
    const top = 40, VP = { x: LW / 2, y: -1500 };
    lit(g, `M-10,${top}H${LW + 10}V${LH + 10}H-10Z`, [-10, top, LW + 20, LH], [[0, '#4a3c44'], [0.4, '#3a2e38'], [1, '#2a2030']], R, { n: 80, dir: [1, 0], width: [10, 24], gd: [0, top, 0, LH] });
    const rows = [];
    for (let k = 0; k <= 12; k++) rows.push(top + 22 + (LH - top) * Math.pow(k / 12, 1.45));
    const at = (u, y) => VP.x + (u - VP.x) * ((y - VP.y) / (top - VP.y));
    const tiles = el('g', { filter: 'url(#impastoFine)' }, g);
    for (let r = 0; r < rows.length - 1; r++) {
      const y0 = rows[r], y1 = rows[r + 1];
      for (let c = -14; c < 18; c++) {
        const u0 = c * 64, u1 = u0 + 64;
        const d = `M${at(u0, y0)},${y0}L${at(u1, y0)},${y0}L${at(u1, y1)},${y1}L${at(u0, y1)},${y1}Z`;
        const warm = (r + c) % 2 === 0;
        el('path', { d, fill: jitter(warm ? '#5a3434' : '#6e6470', 8, R), opacity: 0.5 + R() * 0.2, stroke: '#140e1a', 'stroke-width': 2.4, 'stroke-opacity': 0.6 }, tiles);
      }
    }
    // malam: lantai menggelap ke bawah & ke tepi
    el('rect', { x: -10, y: top, width: LW + 20, height: LH, fill: linGrad(g, [[0, '#120c1e', 0.2], [0.5, '#0e0a1c', 0.5], [1, '#06050d', 0.78]], 0, top, 0, LH) }, g);
    // garis aman krem
    lit(g, `M-10,${top + 6}H${LW + 10}V${top + 22}H-10Z`, [-10, top + 6, LW + 20, 16], [[0, CREAM.light], [1, CREAM.mid]], R, { n: 30, dir: [1, 0], width: [3, 6] });
    for (let x = 0; x < LW; x += 26) el('circle', { cx: x + 13, cy: top + 14, r: 3, fill: CREAM.dark, opacity: 0.7 }, g);
    // cahaya jendela gerbong yang jatuh di lantai + genangan
    for (const x of [90, 230, 560, 700]) glow(g, x, top + 60, 150, LAMP.glow, 0.32, 0.45);
    glow(g, LW / 2, top + 90, 220, LAMP.warm, 0.35, 0.4);
    for (const [x, y, rx, ry] of [[170, 300, 150, 30], [560, 470, 190, 38], [260, 650, 170, 36]]) {
      const pg = el('g', { filter: 'url(#blur2)' }, g);
      el('ellipse', { cx: x, cy: y, rx, ry, fill: linGrad(g, [[0, '#3a4a86', 0.42], [1, '#151c3c', 0.32]], 0, y - ry, 0, y + ry) }, pg);
      for (let i = 0; i < 5; i++) {
        const sx = x - rx * 0.6 + R() * rx * 1.2, hh = ry * (0.8 + R() * 0.9);
        el('ellipse', { cx: sx, cy: y, rx: 3 + R() * 5, ry: hh * 0.8, fill: R() < 0.6 ? LAMP.warm : '#cfd8ff', opacity: 0.1 + R() * 0.14 }, pg);
      }
      el('ellipse', { cx: x - rx * 0.1, cy: y - ry * 0.35, rx: rx * 0.7, ry: ry * 0.18, fill: '#d8e0ff', opacity: 0.18 }, pg);
    }
  }

  /* ───────────── bangku peron: bilah kayu, kaki besi cor berulir ───────────── */
  const BW = 640, BH = 250;
  function bench(g, R) {
    glow(g, BW / 2, BH - 18, 340, '#000', 0.55, 0.1);
    const end = (x, s) => {
      // s = +1 ujung kiri, −1 ujung kanan; kaki besi cor dilihat dari depan
      const e = el('g', { filter: 'url(#cast)' }, g);
      const iron = [[0, IRON.hi], [0.35, IRON.light], [0.7, IRON.base], [1, IRON.deep]];
      lit(e, rrect(x - 8, 14, 16, 120, 7), [x - 8, 14, 16, 120], iron, R, { n: 8, dir: [0, 1], gd: [x - 8, 0, x + 8, 0] });
      const leg = `M${x - 12},120C${x - 15},160 ${x - 12},196 ${x - s * 30 - 8},${BH - 12}H${x - s * 30 + 14}C${x + 2},200 ${x + 6},160 ${x + 12},120Z`;
      lit(e, leg, [x - 46, 120, 92, BH - 130], iron, R, { n: 14, dir: [0, 1], gd: [x - 20, 0, x + 20, 0] });
      const arm = `M${x - s * 26},112Q${x - s * 34},96 ${x - s * 22},92H${x + s * 34}Q${x + s * 44},96 ${x + s * 40},110Q${x + s * 36},120 ${x + s * 24},116H${x - s * 26}Z`;
      lit(e, arm, [x - 50, 90, 100, 30], iron, R, { n: 8, dir: [1, 0], gd: [0, 90, 0, 120] });
      el('circle', { cx: x - s * 24, cy: 102, r: 9, fill: 'none', stroke: IRON.deep, 'stroke-width': 5 }, e);
      line(e, `M${x - s * 22},94H${x + s * 32}`, IRON.hi, 1.8, 0.7);
      line(e, `M${x - 4},128C${x - 6},170 ${x - 8},200 ${x - s * 24},${BH - 16}`, IRON.hi, 2, 0.5);
    };
    const slat = (y, h, x0 = 40, x1 = BW - 40) => lit(g, rrect(x0, y, x1 - x0, h, 6), [x0, y, x1 - x0, h], [[0, WOOD.hi], [0.3, WOOD.light], [0.7, WOOD.base], [1, WOOD.dark]], R, { n: 40, dir: [1, 0.01], width: [3, 7], len: [0.1, 0.35], cast: 'cast', gd: [0, y, 0, y + h] });
    slat(20, 24); slat(50, 24); slat(80, 20);
    end(60, 1); end(BW - 60, -1);
    slat(122, 20, 24, BW - 24); slat(144, 18, 20, BW - 20);
  }

  /* ───────────── karcis karton (gaya karcis kereta lama) ───────────── */
  const KW = 544, KH = 290;
  function ticket(g, R) {
    const card = rrect(8, 8, KW - 16, KH - 16, 16);
    const c = lit(el('g', { filter: 'url(#castBig)' }, g), card, [8, 8, KW - 16, KH - 16], [[0, '#fbf0d4'], [0.4, '#f2e1b8'], [1, '#dcc394']], R, { n: 220, dir: [1, 0.04], width: [2, 6], len: [0.03, 0.12], filter: 'wobble' });
    const ci = c.inner;
    el('rect', { x: 0, y: 0, width: KW, height: KH, fill: kawung(g, WINE.base, 52, 1.2), opacity: 0.06 }, ci);
    // pita anggur di atas
    lit(ci, `M0,0H${KW}V64H0Z`, [0, 0, KW, 64], [[0, WINE.light], [0.5, WINE.base], [1, WINE.mid]], R, { n: 40, dir: [1, 0], width: [3, 8] });
    line(ci, `M0,66H${KW}`, GOLD.base, 2.6);
    mark(ci, 44, 36, 0.9, CREAM.light, 0.95);
    // bingkai cetak dua garis
    el('path', { d: rrect(22, 80, KW - 44, KH - 102, 8), fill: 'none', stroke: WINE.base, 'stroke-width': 2.2, 'stroke-opacity': 0.8 }, ci);
    el('path', { d: rrect(28, 86, KW - 56, KH - 114, 6), fill: 'none', stroke: WINE.base, 'stroke-width': 1, 'stroke-opacity': 0.55 }, ci);
    // sasaran pons
    el('circle', { cx: KW - 84, cy: 174, r: 34, fill: 'none', stroke: WINE.base, 'stroke-width': 2.2, 'stroke-dasharray': '5 5', 'stroke-opacity': 0.8 }, ci);
    line(ci, `M${KW - 132},104V${KH - 36}`, WINE.base, 1.4, 0.4, { 'stroke-dasharray': '3 6' });
    // serat & noda tua
    for (let i = 0; i < 40; i++) {
      const x = 20 + R() * (KW - 40), y = 70 + R() * (KH - 90);
      line(ci, `M${x},${y}l${4 + R() * 10},${(R() - 0.5) * 3}`, '#a88a58', 0.8, 0.35);
    }
    glow(ci, KW - 60, KH - 40, 90, '#a8834a', 0.12);
    el('path', { d: card, fill: linGrad(g, [[0, '#fff', 0.35], [0.3, '#fff', 0], [1, '#5a3a1a', 0.14]], 0, 0, KW, KH) }, g);
  }

  /* ───────────────────────────── daftar sprite ───────────────────────────── */
  const scaled = (name, w, h, seed, draw, k = 0.5) => { F.sprites[name] = { w: Math.round(w * k), h: Math.round(h * k), viewBox: `0 0 ${w} ${h}`, seed, draw }; };

  F.sprites['bg-kereta-malam'] = { w: W, h: H, seed: 531, scale: 1, draw(svg, R) { night(svg, R); } };
  scaled('anniversary-atap', AW, AH, 532, (svg, R) => canopy(svg, R), 0.36);
  scaled('anniversary-papan-stasiun', PW, PH, 533, (svg, R) => signBoard(svg, R), 0.52);
  scaled('anniversary-jam-peron', JW, JH, 534, (svg, R) => clock(svg, R), 0.5);
  scaled('anniversary-gerbong', GW, GH, 535, (svg, R) => carriage(svg, R), 0.36);
  scaled('anniversary-pintu', DW, DH, 536, (svg, R) => doorLeaf(svg, R));
  scaled('anniversary-peron', LW, LH, 537, (svg, R) => platform(svg, R), 0.3);
  scaled('anniversary-bangku', BW, BH, 538, (svg, R) => bench(svg, R), 0.4);
  scaled('anniversary-karcis', KW, KH, 539, (svg, R) => ticket(svg, R), 0.5);

  /* ───────────── kabin: dinding jati, rak bagasi, bingkai jendela (berlubang), meja lipat ───────────── */
  const CW = 780, CH = 1696, CTOP = 128, WO = { x: 48, y: 276, w: 684, h: 512, r: 44 };
  /** plafon tambahan di atas kabin (dipakai saat kabin turun sedikit di layar jangkung) */
  function ceiling(g, R) {
    lit(g, `M-10,-10H${CW + 10}V${CTOP + 40}H-10Z`, [-10, -10, CW + 20, CTOP + 50], [[0, '#1c0d06'], [0.6, '#2e170a'], [1, '#43220f']], R, { n: 60, dir: [1, 0], width: [6, 14], gd: [0, 0, 0, CTOP + 40] });
    for (let y = 24; y < CTOP + 30; y += 30) line(g, `M-10,${y}H${CW + 10}`, '#0e0603', 2, 0.6);
    glow(g, CW / 2, CTOP - 10, 260, LAMP.warm, 0.16, 0.25);
  }
  function cabin(g0, R) {
    // semua lapisan dinding dipotong lubang jendela (rrect + rrectRev = berlubang)
    const { x: hx, y: hy, w: hw, h: hh, r: hr } = WO;
    const cid = F.uid('cw');
    el('path', { d: `M-20,-20H${CW + 20}V${CH + 20}H-20Z` + rrectRev(hx, hy, hw, hh, hr) }, el('clipPath', { id: cid }, g0.ownerSVGElement ? g0.ownerSVGElement.querySelector('defs') : g0.querySelector('defs')));
    const g = el('g', { 'clip-path': `url(#${cid})` }, g0);
    // dinding papan jati tegak
    lit(g, `M-10,-10H${CW + 10}V${CH + 10}H-10Z`, [-10, -10, CW + 20, CH + 20], [[0, WOOD.base], [0.35, WOOD.mid], [0.7, WOOD.dark], [1, WOOD.deep]], R, { n: 420, dir: [0.02, 1], width: [6, 16], len: [0.04, 0.16], filter: 'impasto', gd: [0, 0, 0, CH] });
    for (let x = 26; x < CW; x += 52) {
      line(g, `M${x},0V${CH}`, '#1c0b05', 3, 0.55);
      line(g, `M${x + 2.5},0V${CH}`, WOOD.hi, 1.2, 0.35);
    }
    // urat kayu
    for (let i = 0; i < 90; i++) {
      const x = R() * CW, y = R() * CH, L = 60 + R() * 160;
      line(g, `M${x},${y}q${(R() - 0.5) * 8},${L / 2} ${(R() - 0.5) * 6},${L}`, R() < 0.5 ? WOOD.dark : WOOD.light, 1.2, 0.35);
    }
    // plafon melengkung
    lit(g, `M-10,-10H${CW + 10}V30Q${CW / 2},52 -10,30Z`, [-10, -10, CW + 20, 62], [[0, '#2a150b'], [1, '#4a2614']], R, { n: 30, gd: [0, 0, 0, 50] });
    line(g, `M-10,32Q${CW / 2},54 ${CW + 10},32`, GOLD.mid, 3, 0.8);
    // rak bagasi: jaring, rel kuningan, siku
    const net = el('g', { opacity: 0.55 }, g);
    for (let x = 20; x < CW; x += 22) line(net, `M${x},96L${x + 22},146M${x + 22},96L${x},146`, '#2a140a', 1.4);
    // barang di rak
    const bag = el('g', { filter: 'url(#cast)' }, g);
    lit(bag, rrect(70, 40, 230, 92, 12), [70, 40, 230, 92], [[0, '#d6a46a'], [0.4, '#b57e46'], [1, '#7a4c22']], R, { n: 60, dir: [1, 0.05], width: [4, 9] });
    for (const x of [120, 250]) lit(bag, `M${x - 8},40h16v92h-16Z`, [x - 8, 40, 16, 92], [[0, '#7a3a1c'], [1, '#4a200c']], R, { n: 8, dir: [0, 1] });
    for (const x of [120, 250]) el('rect', { x: x - 10, y: 78, width: 20, height: 14, rx: 2, fill: GOLD.base, stroke: GOLD.deep, 'stroke-width': 1.4 }, bag);
    line(bag, `M150,40q35,-26 70,0`, '#4a200c', 7);
    for (const [cx, cy] of [[76, 46], [294, 46], [76, 126], [294, 126]]) el('circle', { cx, cy, r: 6, fill: GOLD.base }, bag);
    const box = el('g', { filter: 'url(#cast)' }, g);
    lit(box, `M560,60Q630,46 700,60V130H560Z`, [560, 46, 140, 84], [[0, CREAM.light], [1, CREAM.mid]], R, { n: 30, dir: [0, 1] });
    for (let x = 572; x < 700; x += 22) el('rect', { x, y: 58, width: 10, height: 72, fill: WINE.base, opacity: 0.75 }, box);
    lit(box, `M556,52Q630,36 704,52V66Q630,52 556,66Z`, [556, 36, 148, 30], [[0, WINE.light], [1, WINE.dark]], R, { n: 10 });
    const bas = el('g', { filter: 'url(#cast)' }, g);
    lit(bas, `M360,74H470L458,132H372Z`, [360, 74, 110, 58], [[0, '#d9b071'], [1, '#8a6232']], R, { n: 40, dir: [1, 0] });
    for (let y = 82; y < 132; y += 9) line(bas, `M${360 + (y - 74) * 0.2},${y}H${470 - (y - 74) * 0.2}`, '#6a4620', 1.4, 0.6);
    line(bas, `M378,74Q415,30 452,74`, '#8a6232', 5);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(392 78) rotate(-20)' }, bas), R, 0.17);
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(432 82) rotate(30)' }, bas), R, 0.15);
    for (const y of [128, 148]) {
      const r = el('g', { filter: 'url(#cast)' }, g);
      lit(r, rrect(14, y - 6, CW - 28, 12, 6), [14, y - 6, CW - 28, 12], [[0, GOLD.hi], [0.4, GOLD.light], [1, GOLD.dark]], R, { n: 20, gd: [0, y - 6, 0, y + 6] });
    }
    for (const x of [30, CW / 2, CW - 30]) {
      const b = el('g', { filter: 'url(#cast)' }, g);
      line(b, `M${x},60V150`, GOLD.dark, 8);
      line(b, `M${x - 2},60V150`, GOLD.light, 2.4, 0.9);
      el('circle', { cx: x, cy: 60, r: 9, fill: GOLD.base, stroke: GOLD.deep, 'stroke-width': 1.4 }, b);
    }
    // lis di bawah rak
    lit(g, `M-10,166H${CW + 10}V178H-10Z`, [-10, 166, CW + 20, 12], [[0, WOOD.hi], [1, WOOD.dark]], R, { n: 10, gd: [0, 166, 0, 178] });
    // bingkai jendela: kayu berprofil, bibir kuningan, kotak gulungan kerai
    const { x: ox, y: oy, w: ow, h: oh, r: or } = WO;
    const hole = rrect(ox, oy, ow, oh, or);
    const frameD = rrect(ox - 30, oy - 34, ow + 60, oh + 64, or + 26) + rrectRev(ox, oy, ow, oh, or);
    const fr = el('g', { filter: 'url(#castBig)' }, g);
    painted(fr, frameD, {
      base: linGrad(g, [[0, WOOD.hi], [0.3, WOOD.light], [0.7, WOOD.base], [1, WOOD.dark]], ox - 30, oy - 34, ox + ow + 30, oy + oh + 30), n: 160, R, filter: 'impastoFine',
      stroke: () => {
        const side = Math.floor(R() * 4), t = R();
        const [x, y, dx, dy] = side === 0 ? [ox - 20 + t * (ow + 40), oy - 18, 40, 0] : side === 1 ? [ox - 20 + t * (ow + 40), oy + oh + 14, 40, 0] : side === 2 ? [ox - 16, oy + t * oh, 0, 40] : [ox + ow + 16, oy + t * oh, 0, 40];
        return { d: `M${x},${y}l${dx},${dy}`, color: jitter(side === 0 || side === 2 ? WOOD.light : WOOD.base, 8, R), width: 5 + R() * 8, opacity: 0.4 };
      },
    });
    el('path', { d: frameD, fill: 'none', stroke: '#1a0904', 'stroke-width': 2, 'stroke-opacity': 0.6, 'fill-rule': 'evenodd' }, fr);
    el('path', { d: rrect(ox - 6, oy - 6, ow + 12, oh + 12, or + 5), fill: 'none', stroke: GOLD.base, 'stroke-width': 7 }, g);
    el('path', { d: rrect(ox - 8, oy - 8, ow + 16, oh + 16, or + 7), fill: 'none', stroke: GOLD.hi, 'stroke-width': 1.6, 'stroke-opacity': 0.8 }, g);
    el('path', { d: rrect(ox - 3, oy - 3, ow + 6, oh + 6, or + 2), fill: 'none', stroke: GOLD.deep, 'stroke-width': 2, 'stroke-opacity': 0.8 }, g);
    el('path', { d: rrect(ox - 26, oy - 30, ow + 52, oh + 56, or + 22), fill: 'none', stroke: '#fff1d0', 'stroke-width': 1.4, 'stroke-opacity': 0.35 }, g);
    // meja lipat di bawah jendela
    const t0 = oy + oh + 22;
    const tb = el('g', { filter: 'url(#castBig)' }, g0);
    lit(tb, `M24,${t0}H${CW - 24}L${CW - 12},${t0 + 30}H12Z`, [12, t0, CW - 24, 30], [[0, WOOD.hi], [0.5, WOOD.light], [1, WOOD.base]], R, { n: 60, dir: [1, 0], width: [4, 9], gd: [0, t0, 0, t0 + 30] });
    lit(tb, `M12,${t0 + 30}H${CW - 12}V${t0 + 74}Q${CW / 2},${t0 + 82} 12,${t0 + 74}Z`, [12, t0 + 30, CW - 24, 50], [[0, WOOD.base], [1, WOOD.deep]], R, { n: 50, dir: [1, 0], width: [4, 9], gd: [0, t0 + 30, 0, t0 + 80] });
    line(tb, `M12,${t0 + 31}H${CW - 12}`, GOLD.light, 3.4);
    line(tb, `M24,${t0 + 1}H${CW - 24}`, '#ffe2b0', 1.6, 0.6);
    // cahaya jendela (biru malam) yang jatuh di meja
    glow(g0, CW / 2, t0 + 16, 340, '#9fb2e8', 0.18, 0.12);
    // cangkir teh & vas kecil berisi kamboja
    const cup = el('g', { filter: 'url(#cast)' }, g0);
    el('ellipse', { cx: 660, cy: t0 + 18, rx: 56, ry: 10, fill: '#efe6d6', stroke: GOLD.mid, 'stroke-width': 2 }, cup);
    lit(cup, `M624,${t0 - 34}H696L690,${t0 + 6}Q660,${t0 + 18} 630,${t0 + 6}Z`, [624, t0 - 34, 72, 50], [[0, '#fffdf6'], [0.6, '#ece2cf'], [1, '#bfae92']], R, { n: 16, dir: [0, 1] });
    el('ellipse', { cx: 660, cy: t0 - 34, rx: 36, ry: 7, fill: '#7a4a22', stroke: GOLD.base, 'stroke-width': 2.4 }, cup);
    line(cup, `M694,${t0 - 24}c22,0 22,24 -2,22`, '#e9dfcb', 6);
    line(cup, `M628,${t0 - 20}H692`, GOLD.base, 2.2);
    mark(cup, 660, t0 - 6, 0.35, WINE.base, 0.8);
    const steam = el('g', { filter: 'url(#soft)', opacity: 0.35 }, g0);
    line(steam, `M652,${t0 - 46}c-10,-20 12,-30 2,-56M668,${t0 - 44}c8,-18 -10,-28 2,-50`, '#fff8ea', 6);
    const vase = el('g', { filter: 'url(#cast)' }, g0);
    lit(vase, `M86,${t0 + 12}Q70,${t0 - 20} 92,${t0 - 42}H112Q134,${t0 - 20} 118,${t0 + 12}Z`, [70, t0 - 42, 64, 54], [[0, '#7fb0c4'], [0.5, '#3f7a92'], [1, '#1f4658']], R, { n: 14 });
    line(vase, `M92,${t0 - 40}H112`, GOLD.light, 2.4);
    leaf(vase, { len: 70, w: 26, ...F.flora.GREEN[1], R, n: 14, transform: `translate(98 ${t0 - 40}) rotate(-38)` });
    leaf(vase, { len: 60, w: 22, ...F.flora.GREEN[0], R, n: 12, transform: `translate(106 ${t0 - 40}) rotate(30)` });
    F.flora.flowers.kambojaPink(el('g', { transform: `translate(100 ${t0 - 70}) rotate(12)` }, vase), R, 0.22);
    // panel bawah berbingkai + lis kawung tatah
    const p0 = t0 + 96;
    lit(g, `M-10,${p0}H${CW + 10}V${p0 + 40}H-10Z`, [-10, p0, CW + 20, 40], [[0, '#c99a5e'], [1, '#9a6a36']], R, { n: 30, dir: [1, 0], gd: [0, p0, 0, p0 + 40] });
    el('rect', { x: -10, y: p0, width: CW + 20, height: 40, fill: kawung(g, '#3a1a0a', 40, 1.6), opacity: 0.5 }, g);
    line(g, `M-10,${p0}H${CW + 10}M-10,${p0 + 40}H${CW + 10}`, GOLD.mid, 2.4);
    for (const [x, y, w, h] of [[40, p0 + 70, 330, 300], [410, p0 + 70, 330, 300], [40, p0 + 400, 330, 300], [410, p0 + 400, 330, 300]]) {
      el('path', { d: rrect(x, y, w, h, 10), fill: '#2a1308', opacity: 0.25 }, g);
      el('path', { d: rrect(x, y, w, h, 10), fill: 'none', stroke: '#1a0904', 'stroke-width': 4, 'stroke-opacity': 0.6 }, g);
      el('path', { d: rrect(x + 3, y + 3, w, h, 10), fill: 'none', stroke: WOOD.hi, 'stroke-width': 1.6, 'stroke-opacity': 0.4 }, g);
      mark(g, x + w / 2, y + h / 2, 1.2, '#2a1308', 0.25);
    }
    // sandaran kursi beludru di dua sudut bawah
    for (const s of [1, -1]) {
      const x0 = s > 0 ? -30 : CW + 30;
      const seat = el('g', { filter: 'url(#castBig)' }, g);
      const d = `M${x0},${CH + 20}V${CH - 300}Q${x0},${CH - 380} ${x0 + s * 90},${CH - 384}Q${x0 + s * 200},${CH - 384} ${x0 + s * 210},${CH - 300}V${CH + 20}Z`;
      lit(seat, d, [Math.min(x0, x0 + s * 210), CH - 390, 210, 410], [[0, WINE.hi], [0.3, WINE.light], [0.7, WINE.base], [1, WINE.deep]], R, { n: 90, dir: [0, 1], width: [6, 14], filter: 'impasto', gd: s > 0 ? [x0, CH - 390, x0 + 210, CH] : [x0 - 210, CH - 390, x0, CH] });
      for (let k = 0; k < 6; k++) {
        const bx = x0 + s * (50 + (k % 2) * 70), by = CH - 300 + Math.floor(k / 2) * 90;
        el('circle', { cx: bx, cy: by, r: 6, fill: WINE.deep }, seat);
        el('circle', { cx: bx - 1.5, cy: by - 1.5, r: 2.5, fill: WINE.hi, opacity: 0.8 }, seat);
      }
      line(seat, `M${x0 + s * 6},${CH - 300}Q${x0 + s * 6},${CH - 372} ${x0 + s * 90},${CH - 376}Q${x0 + s * 196},${CH - 376} ${x0 + s * 204},${CH - 300}`, GOLD.base, 3.4, 0.8);
    }
    // cahaya lampu dinding di kiri-kanan atas & bayang di bawah
    glow(g, 44, 230, 260, LAMP.warm, 0.32, 1.1);
    glow(g, CW - 44, 230, 260, LAMP.warm, 0.32, 1.1);
    el('rect', { x: -10, y: 0, width: CW + 20, height: CH, fill: linGrad(g, [[0, '#000', 0], [0.55, '#000', 0], [1, '#080204', 0.6]], 0, 0, 0, CH) }, g);
  }

  /** kerai gulung linen bermotif kawung, dengan bilah bawah & cincin penarik */
  const TW = 688, TH = 540;
  function blind(g, R) {
    lit(g, `M0,0H${TW}V${TH - 34}H0Z`, [0, 0, TW, TH - 34], [[0, '#f4e8cc'], [0.5, '#e9d9b4'], [1, '#d6c193']], R, { n: 140, dir: [0.02, 1], width: [8, 18], len: [0.1, 0.4], gd: [0, 0, TW, TH] });
    el('rect', { x: 0, y: 0, width: TW, height: TH - 34, fill: kawung(g, WINE.base, 86, 2.2), opacity: 0.2 }, g);
    for (let x = 40; x < TW; x += 86) el('rect', { x: x - 18, y: 0, width: 36, height: TH - 34, fill: '#5a3a1a', opacity: 0.06, filter: 'url(#soft)' }, g);
    // cahaya lampu kabin yang jatuh di linen
    glow(g, 60, 80, 260, '#fff1c8', 0.35);
    glow(g, TW - 60, 80, 260, '#fff1c8', 0.3);
    el('rect', { x: 0, y: 0, width: TW, height: TH - 34, fill: linGrad(g, [[0, '#000', 0.25], [0.12, '#000', 0], [0.8, '#000', 0], [1, '#3a1d12', 0.2]], 0, 0, 0, TH - 34) }, g);
    const bar = el('g', { filter: 'url(#cast)' }, g);
    lit(bar, rrect(-4, TH - 44, TW + 8, 24, 12), [-4, TH - 44, TW + 8, 24], [[0, WOOD.hi], [0.5, WOOD.base], [1, WOOD.deep]], R, { n: 30, dir: [1, 0], gd: [0, TH - 44, 0, TH - 20] });
    for (const x of [-2, TW - 14]) lit(bar, rrect(x, TH - 46, 16, 28, 5), [x, TH - 46, 16, 28], GOLD_STOPS, R, { n: 4 });
    // tali & cincin penarik di tengah
    line(bar, `M${TW / 2},${TH - 24}V${TH - 12}`, WINE.dark, 4);
    el('circle', { cx: TW / 2, cy: TH - 4, r: 10, fill: 'none', stroke: GOLD.base, 'stroke-width': 5 }, bar);
    el('circle', { cx: TW / 2 - 2, cy: TH - 6, r: 10, fill: 'none', stroke: GOLD.hi, 'stroke-width': 1.4, 'stroke-opacity': 0.8 }, bar);
  }

  /** lampu dinding: pelat kuningan, lengan melengkung, kap kaca tulip yang menyala */
  const SW = 130, SH = 230;
  function sconce(g, R, s = 1) {
    const cx = SW / 2;
    glow(g, cx, 150, 64, LAMP.warm, 0.7);
    const b = el('g', { filter: 'url(#cast)' }, g);
    lit(b, rrect(cx - 14, 0, 28, 56, 12), [cx - 14, 0, 28, 56], GOLD_STOPS, R, { n: 8 });
    line(b, `M${cx},40C${cx + s * 34},60 ${cx + s * 30},96 ${cx},104`, GOLD.dark, 7);
    line(b, `M${cx},40C${cx + s * 34},60 ${cx + s * 30},96 ${cx},104`, GOLD.light, 2, 0.9);
    lit(b, `M${cx - 16},100H${cx + 16}L${cx + 10},116H${cx - 10}Z`, [cx - 16, 100, 32, 16], GOLD_STOPS, R, { n: 4 });
    const shade = `M${cx - 12},114C${cx - 40},126 ${cx - 50},176 ${cx - 40},196Q${cx - 30},188 ${cx - 20},200Q${cx - 10},190 ${cx},202Q${cx + 10},190 ${cx + 20},200Q${cx + 30},188 ${cx + 40},196C${cx + 50},176 ${cx + 40},126 ${cx + 12},114Z`;
    el('path', { d: shade, fill: radGrad(g, [[0, LAMP.hot], [0.45, '#ffe7b0'], [0.85, '#f2c27a'], [1, '#d89a4a']], cx - 6, 170, 60) }, b);
    line(b, `M${cx - 30},140C${cx - 38},160 ${cx - 38},176 ${cx - 34},190`, '#fffaf0', 3, 0.7);
    line(b, shade, '#c98a3a', 1.4, 0.6);
    glow(g, cx, 176, 22, '#ffffff', 0.9);
  }

  /* ───────────── pemandangan jendela (sambung tanpa jahitan) ───────────── */
  const JW2 = 1024, JH2 = 300;
  function farLayer(g, R) {
    // gunung berapi & punggung bukit, makin jauh makin pucat ungu
    const ridge = (base, amp, f1, f2, c1, c2, cone) => {
      let d = `M-40,${JH2 + 10}V${base}`;
      for (let x = -40; x <= JW2 + 40; x += 16) {
        let y = base - amp * (0.5 + 0.5 * Math.sin((x / JW2) * Math.PI * 2 * f1 + 0.7)) - amp * 0.3 * Math.sin((x / JW2) * Math.PI * 2 * f2);
        if (cone) y = Math.min(y, cone.y + Math.abs(x - cone.x) * cone.k + Math.max(0, 22 - Math.abs(x - cone.x)) * 0.6);
        d += `L${x},${y.toFixed(1)}`;
      }
      d += `V${JH2 + 10}Z`;
      lit(g, d, [-40, base - amp * 1.4, JW2 + 80, JH2], [[0, c1], [1, c2]], R, { n: 70, dir: [0.35, 1], width: [6, 14], len: [0.03, 0.08], filter: 'impasto', op: [0.2, 0.45], gd: [0, base - amp, 0, JH2] });
    };
    ridge(170, 50, 2, 5, '#3c3e74', '#262856', { x: 330, y: 40, k: 0.62 });
    // kepulan tipis di puncak
    const sm = el('g', { filter: 'url(#mist)', opacity: 0.35 }, g);
    line(sm, 'M322,40c-20,-16 6,-30 -10,-46c-12,-12 20,-20 30,-34', '#9a98c8', 14);
    ridge(210, 40, 3, 7, '#27295a', '#18193e');
    dabs(g, { n: 46, R, filter: null, place: (i, R2) => ({ x: R2() * JW2, y: 220 + R2() * 70, rx: 1.4 + R2() * 1.8, color: R2() < 0.75 ? '#ffcf7a' : '#fff1c8', opacity: 0.7 + R2() * 0.3 }) });
    ridge(250, 22, 4, 9, '#191a3e', '#10112c');
  }

  const SWW = 1280, SWH = 320;
  function palm(g, R, x, y, h, lean = 0.2, col = '#141824') {
    const top = [x + h * lean, y - h];
    line(g, `M${x},${y}Q${x + h * lean * 0.2},${y - h * 0.6} ${top[0]},${top[1]}`, col, Math.max(5, h * 0.05));
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI * 1.02 + (i / 9) * Math.PI * 1.04 + (R() - 0.5) * 0.18, L = h * (0.4 + R() * 0.16);
      const ex = top[0] + Math.cos(a) * L, ey = top[1] + Math.sin(a) * L * 0.55 + L * 0.34;
      const mx = top[0] + Math.cos(a) * L * 0.55, my = top[1] + Math.sin(a) * L * 0.45 - L * 0.1;
      // pelepah: tulang daun + anak daun yang menjuntai
      line(g, `M${top[0]},${top[1]}Q${mx},${my} ${ex},${ey}`, col, Math.max(2, h * 0.018));
      for (let k = 1; k < 10; k++) {
        const t = k / 10, u = 1 - t;
        const px = u * u * top[0] + 2 * u * t * mx + t * t * ex, py = u * u * top[1] + 2 * u * t * my + t * t * ey;
        const ln = h * 0.09 * Math.sin(Math.PI * (0.15 + t * 0.85));
        line(g, `M${px},${py}l${-ln * 0.35},${ln}M${px},${py}l${ln * 0.35},${ln}`, col, Math.max(1.6, h * 0.014));
      }
    }
    el('circle', { cx: top[0], cy: top[1] + 4, r: h * 0.03, fill: col }, g);
  }
  function house(g, R, x, y, w) {
    const h = w * 0.5;
    lit(g, `M${x},${y}h${w}v${-h}h${-w}Z`, [x, y - h, w, h], [[0, '#4a3a44'], [1, '#2a2030']], R, { n: 10 });
    lit(g, `M${x - w * 0.14},${y - h}L${x + w * 0.3},${y - h - w * 0.36}H${x + w * 0.7}L${x + w * 1.14},${y - h}Z`, [x - w * 0.14, y - h - w * 0.36, w * 1.28, w * 0.36], [[0, '#6a3a34'], [1, '#3a1e1e']], R, { n: 12 });
    for (const k of [0.18, 0.58]) {
      const wx = x + w * k, wy = y - h * 0.78, ww = w * 0.22, wh = h * 0.42;
      glow(g, wx + ww / 2, wy + wh / 2, w * 0.4, LAMP.glow, 0.45);
      el('rect', { x: wx, y: wy, width: ww, height: wh, fill: LAMP.warm }, g);
      line(g, `M${wx + ww / 2},${wy}V${wy + wh}`, '#5a3a1a', 1.6, 0.7);
    }
  }
  function midLayer(g, R) {
    // sawah bertingkat: air yang memantulkan langit senja-malam, padi muda, pematang gelap
    const bands = [[112, 136], [142, 172], [180, 216], [226, 268], [280, 340]];
    const P = (x, n, ph) => Math.sin((x / SWW) * Math.PI * 2 * n + ph);
    bands.forEach(([y0, y1], k) => {
      const wav = (x, y) => y + 4 * P(x, k + 2, k);
      let top = `M-160,${wav(-160, y0).toFixed(1)}`;
      for (let x = -160; x <= SWW + 40; x += 20) top += `L${x},${wav(x, y0).toFixed(1)}`;
      const d = `${top}V${y1 + 4}H-160Z`;
      const far = 1 - k / 4;
      lit(g, d, [-160, y0, SWW + 200, y1 - y0], [[0, mix('#5a5a8e', '#3a4a6a', 1 - far)], [0.6, mix('#7a6a96', '#4a5a6a', 1 - far)], [1, mix('#a07a86', '#3a4a52', 1 - far)]], R, { n: 50, dir: [1, 0], width: [3, 7], len: [0.02, 0.07], filter: 'impastoH', op: [0.2, 0.45], gd: [0, y0, 0, y1] });
      // padi muda: sapuan pendek tegak berderet
      const rows = 1 + Math.ceil(k * 0.7);
      for (let r = 0; r < rows; r++) {
        const yy = y0 + 6 + ((y1 - y0 - 10) * (r + 0.5)) / rows;
        for (let x = -150 + R() * 10; x < SWW + 30; x += 14 + k * 4 + R() * 8) {
          const hgt = 4 + k * 2.4;
          line(g, `M${x},${wav(x, yy)}l${(R() - 0.5) * 2},${-hgt}`, R() < 0.8 ? '#1e3a30' : '#3e6a46', 1.4 + k * 0.5, 0.8);
        }
      }
      let dike = `M-160,${(y1 + 2 * P(-160, 24, k)).toFixed(1)}`;
      for (let x = -160; x <= SWW + 40; x += 16) dike += `L${x},${(y1 + 2 * P(x, 24, k)).toFixed(1)}`;
      line(g, dike, '#12181e', 6 + k * 2.4);
      line(g, dike, '#4a5a48', 1.2, 0.35, { transform: 'translate(0 -3)' });
    });
    // desa kecil: rumah-rumah berjendela hangat, lampu jalan, pohon kelapa & rumpun
    dabs(g, { n: 70, R, filter: 'impasto', place: (i, R2) => ({ x: R2() * SWW, y: 116 + R2() * 14, rx: 12 + R2() * 22, ry: 8 + R2() * 12, color: jitter('#18262a', 6, R2), opacity: 0.95 }) });
    for (const [x, y, w] of [[250, 128, 70], [610, 124, 58], [668, 132, 74], [748, 126, 56], [820, 132, 66], [1040, 128, 60]]) house(g, R, x, y, w);
    for (const x of [590, 720, 900]) { line(g, `M${x},132V96`, '#14121c', 3); glow(g, x, 94, 18, LAMP.warm, 0.9); }
    for (const [x, y, h, l] of [[120, 150, 170, 0.18], [430, 140, 150, -0.2], [960, 150, 190, 0.2], [1120, 144, 120, -0.16]]) palm(g, R, x, y, h, l);
    dabs(g, { n: 26, R, filter: null, place: (i, R2) => ({ x: R2() * SWW, y: 150 + R2() * 150, rx: 1.8, color: '#fff1a0', opacity: 0.9 }) });
  }

  const NW = 960, NH = 520;
  function nearLayer(g, R) {
    // dua tiang listrik kayu + kabel yang melengkung
    const poles = [160, 640];
    const arm = 80;
    for (const x of [poles[1] - NW, ...poles, poles[0] + NW]) {
      for (const [dx, dy] of [[-56, arm + 4], [0, arm - 8], [56, arm + 4]]) {
        const nx = x + 480;
        line(g, `M${x + dx},${dy}Q${x + 240 + dx},${dy + 70} ${nx + dx},${dy}`, '#0c0f18', 2.4, 0.9);
      }
    }
    for (const x of poles) {
      const p = el('g', { filter: 'url(#cast)' }, g);
      lit(p, `M${x - 9},40H${x + 9}L${x + 12},${NH}H${x - 12}Z`, [x - 12, 40, 24, NH], [[0, '#4a3a34'], [0.4, '#2a2028'], [1, '#100c14']], R, { n: 14, dir: [0, 1], gd: [x - 12, 0, x + 12, 0] });
      lit(p, `M${x - 70},${arm - 6}H${x + 70}V${arm + 6}H${x - 70}Z`, [x - 70, arm - 6, 140, 12], [[0, '#3a2e30'], [1, '#100c14']], R, { n: 8 });
      for (const dx of [-56, 0, 56]) {
        el('path', { d: `M${x + dx - 5},${arm - 8 + (dx ? 12 : 0)}h10v-12q-5,-6 -10,0Z`, fill: '#9ad0b4', opacity: 0.85 }, p);
      }
      line(p, `M${x - 6},44V${NH}`, '#6a5a5a', 1.6, 0.5);
    }
    // semak & rumput gelap di dekat rel
    const bush = el('g', {}, g);
    dabs(bush, { n: 260, R, filter: 'impasto', place: (i, R2) => {
      const x = R2() * NW, y = NH - Math.pow(R2(), 0.6) * 150 + 30 * Math.sin((x / NW) * Math.PI * 2 * 14);
      return { x, y, rx: 14 + R2() * 30, ry: 10 + R2() * 20, rot: R2() * 180, color: jitter(['#10201c', '#162a22', '#0c1614', '#1f3326'][Math.floor(R2() * 4)], 6, R2), opacity: 0.95 };
    } });
    // daun-daun yang tersorot cahaya jendela kereta

    for (let i = 0; i < 18; i++) {
      const x = R() * NW, y = NH - 60 - R() * 60;
      leaf(bush, { len: 60 + R() * 50, w: 22 + R() * 14, dark: '#08120e', mid: '#14281e', light: '#3a5a44', R, n: 10, cast: false, transform: `translate(${x} ${NH}) rotate(${-50 + R() * 100})` });
    }
  }

  /* ───────────── peron yang terlihat dari jendela (diam di tiap stasiun) ───────────── */
  const HW = 960, HH = 512;
  function halt(g, R) {
    // dinding plester krem + pita anggur + ubin hijau berkilap
    lit(g, `M0,40H${HW}V420H0Z`, [0, 40, HW, 380], [[0, '#f2e4c2'], [0.5, '#e4cfa6'], [1, '#c9ae80']], R, { n: 160, dir: [1, 0.1], width: [8, 20], len: [0.04, 0.14], filter: 'impasto', gd: [0, 40, 0, 420] });
    glow(g, 260, 140, 230, LAMP.warm, 0.45, 0.8);
    glow(g, 700, 140, 230, LAMP.warm, 0.45, 0.8);
    lit(g, `M0,262H${HW}V280H0Z`, [0, 262, HW, 18], [[0, WINE.light], [1, WINE.dark]], R, { n: 20, dir: [1, 0] });
    const tl = lit(g, `M0,292H${HW}V420H0Z`, [0, 292, HW, 128], [[0, '#3f8a74'], [0.5, '#2a6a58'], [1, '#174238']], R, { n: 60, dir: [1, 0], width: [4, 9], gd: [0, 292, 0, 420] });
    for (let x = 0; x < HW; x += 32) line(tl.inner, `M${x},292V420`, '#0e2a24', 1.6, 0.6);
    for (let y = 324; y < 420; y += 32) line(tl.inner, `M0,${y}H${HW}`, '#0e2a24', 1.6, 0.6);
    for (let x = 6; x < HW; x += 32) line(tl.inner, `M${x},296v12`, '#bfe8d6', 2, 0.5);
    line(g, `M0,290H${HW}`, CREAM.mid, 4);
    // atap: plafon gelap & lisplang berkerawang
    lit(g, `M-10,-10H${HW + 10}V46H-10Z`, [-10, -10, HW + 20, 56], [[0, TEAL.mid], [1, TEAL.deep]], R, { n: 40, dir: [1, 0], gd: [0, 0, 0, 46] });
    const tw = 32;
    let teeth = 'M-10,40';
    for (let x = -10; x < HW + 10; x += tw) teeth += `V56Q${x + tw / 2},76 ${x + tw},56V40`;
    teeth += 'Z';
    const tg = lit(g, teeth, [-10, 40, HW + 20, 36], [[0, CREAM.light], [1, CREAM.mid]], R, { n: 40, dir: [1, 0.2], width: [3, 7], cast: 'cast', gd: [0, 40, 0, 76] });
    for (let x = -10; x < HW + 10; x += tw) el('circle', { cx: x + tw / 2, cy: 56, r: 4.4, fill: TEAL.deep }, tg.inner);
    line(g, `M-10,42H${HW + 10}`, WINE.base, 4);
    // lampu dinding
    for (const x of [260, 700]) {
      const l = el('g', { filter: 'url(#cast)' }, g);
      line(l, `M${x},100v30`, IRON.deep, 5);
      lit(l, rrect(x - 14, 128, 28, 40, 8), [x - 14, 128, 28, 40], [[0, LAMP.hot], [1, LAMP.glow]], R, { n: 6 });
      line(l, `M${x - 16},128H${x + 16}M${x - 12},170H${x + 12}`, IRON.deep, 4);
      glow(g, x, 148, 40, LAMP.hot, 0.8);
    }
    // tiang besi cor di dua ujung
    for (const x of [44, HW - 44]) {
      const p = el('g', { filter: 'url(#cast)' }, g);
      lit(p, `M${x - 13},46H${x + 13}V470H${x - 13}Z`, [x - 13, 46, 26, 424], [[0, IRON.light], [0.3, IRON.hi], [0.6, IRON.base], [1, IRON.deep]], R, { n: 16, dir: [0, 1], gd: [x - 13, 0, x + 13, 0] });
      lit(p, `M${x - 22},446H${x + 22}V474H${x - 22}Z`, [x - 22, 446, 44, 28], [[0, IRON.hi], [1, IRON.deep]], R, { n: 6 });
    }
    // pot palem kiri, kamboja kanan
    const pot = (x, y) => lit(el('g', { filter: 'url(#cast)' }, g), `M${x - 40},${y - 70}H${x + 40}L${x + 30},${y}H${x - 30}Z`, [x - 40, y - 70, 80, 70], [[0, '#c97a4a'], [1, '#6a3420']], R, { n: 16 });
    const fern = el('g', {}, g);
    for (let i = 0; i < 7; i++) leaf(fern, { len: 120 + R() * 60, w: 34, ...F.flora.GREEN[i % 4], R, n: 16, transform: `translate(150 350) rotate(${-70 + i * 22})`, curve: (i - 3) * 0.08 });
    pot(150, 420);
    const kb = el('g', {}, g);
    for (let i = 0; i < 6; i++) leaf(kb, { len: 90 + R() * 30, w: 30, ...F.flora.GREEN[(i + 1) % 4], R, n: 14, transform: `translate(812 350) rotate(${-60 + i * 24})` });
    F.flora.flowers.kamboja(el('g', { transform: 'translate(780 286) rotate(10)' }, kb), R, 0.22);
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(842 270) rotate(-24)' }, kb), R, 0.2);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(818 318) rotate(40)' }, kb), R, 0.16);
    pot(812, 420);
    // lantai peron & bibirnya (paling dekat ke kereta)
    lit(g, `M0,420H${HW}V${HH}H0Z`, [0, 420, HW, 92], [[0, '#7a6e78'], [0.6, '#4a4252'], [1, '#2a2434']], R, { n: 60, dir: [1, 0], width: [5, 12], gd: [0, 420, 0, HH] });
    lit(g, `M0,470H${HW}V${HH}H0Z`, [0, 470, HW, 42], [[0, '#a8a2a8'], [0.3, '#7a7480'], [1, '#3a3442']], R, { n: 30, dir: [1, 0], gd: [0, 470, 0, HH] });
    line(g, `M0,472H${HW}`, CREAM.light, 3, 0.8);
    for (const x of [260, 700]) glow(g, x, 450, 160, LAMP.warm, 0.3, 0.3);
    el('rect', { x: 0, y: 0, width: HW, height: HH, fill: linGrad(g, [[0, '#0a0610', 0.35], [0.08, '#0a0610', 0], [0.92, '#0a0610', 0], [1, '#0a0610', 0.35]], 0, 0, HW, 0) }, g);
  }

  /** patok kilometer (beton krem bertopi biru tua) dan tiang sinyal berlampu */
  const KPW = 170, KPH = 360;
  function kmPost(g, R) {
    const p = el('g', { filter: 'url(#cast)' }, g);
    line(p, `M42,${KPH}V70`, IRON.deep, 8);
    line(p, `M40,${KPH}V70`, IRON.light, 2, 0.7);
    glow(g, 42, 56, 70, '#ffd27a', 0.6);
    lit(p, circ(42, 56, 26), [16, 30, 52, 52], [[0, IRON.light], [1, IRON.deep]], R, { n: 8 });
    el('circle', { cx: 42, cy: 56, r: 15, fill: radGrad(g, [[0, '#fffbe0'], [0.5, '#ffd27a'], [1, '#e0902a']], 38, 52, 18) }, p);
    el('path', { d: 'M14,48Q42,16 70,48', fill: 'none', stroke: IRON.deep, 'stroke-width': 7 }, p);
    const post = el('g', { filter: 'url(#castBig)' }, g);
    const d = `M74,${KPH}V198Q74,170 112,170Q150,170 150,198V${KPH}Z`;
    lit(post, d, [74, 170, 76, KPH - 170], [[0, CREAM.hi], [0.4, CREAM.light], [1, CREAM.mid]], R, { n: 30, dir: [0, 1] });
    lit(post, `M74,${200}V198Q74,170 112,170Q150,170 150,198V200Z`, [74, 170, 76, 30], [[0, '#2f4478'], [1, '#121c3c']], R, { n: 8 });
    line(post, `M74,${KPH - 24}H150`, '#5a4a3a', 3, 0.4);
  }

  /** mulut terowongan batu dengan pakis & sulur di atasnya */
  const TNW = 1120, TNH = 560, TO = { x: 160, w: 800, top: 70 };
  function tunnel(g, R) {
    // bukit gelap di sekitar mulut terowongan
    lit(g, `M-10,${TNH + 10}V60Q140,-10 360,10Q560,-20 780,6Q980,-14 ${TNW + 10},60V${TNH + 10}Z`, [-10, -20, TNW + 20, TNH + 30], [[0, '#1e3a2c'], [0.5, '#132a20'], [1, '#0a1612']], R, { n: 120, dir: [1, 0.3], width: [10, 24], filter: 'impasto' });
    const sp = TO.top + 220;
    const open = `M${TO.x},${TNH + 10}V${sp}A${TO.w / 2},${sp - TO.top} 0 0 1 ${TO.x + TO.w},${sp}V${TNH + 10}Z`;
    // cincin batu
    const ring = el('g', { filter: 'url(#castBig)' }, g);
    const outer = `M${TO.x - 60},${TNH + 10}V${sp}A${TO.w / 2 + 60},${sp - TO.top + 60} 0 0 1 ${TO.x + TO.w + 60},${sp}V${TNH + 10}Z`;
    lit(ring, outer, [TO.x - 60, TO.top - 60, TO.w + 120, TNH], [[0, '#a89c94'], [0.5, '#7a6e6a'], [1, '#4a4248']], R, { n: 80, dir: [1, 0.2], width: [6, 14] });
    const cx = TO.x + TO.w / 2;
    for (let k = 0; k <= 16; k++) {
      const a = Math.PI + (k / 16) * Math.PI;
      const x1 = cx + Math.cos(a) * (TO.w / 2), y1 = sp + Math.sin(a) * (sp - TO.top);
      const x2 = cx + Math.cos(a) * (TO.w / 2 + 60), y2 = sp + Math.sin(a) * (sp - TO.top + 60);
      line(ring, `M${x1},${y1}L${x2},${y2}`, '#2a2228', 3, 0.7);
    }
    for (let y = sp + 50; y < TNH; y += 50) {
      line(ring, `M${TO.x - 60},${y}h60M${TO.x + TO.w},${y}h60`, '#2a2228', 3, 0.7);
    }
    mark(ring, cx, TO.top - 30, 1.1, '#3a3036', 0.8);
    // lubang gelap
    el('path', { d: open, fill: radGrad(g, [[0, '#2a1a10'], [0.4, '#0c0a10'], [1, '#04040a']], cx, sp + 120, TO.w * 0.7) }, g);
    el('path', { d: open, fill: 'none', stroke: '#000', 'stroke-width': 10, 'stroke-opacity': 0.5 }, g);
    // pakis & sulur menjuntai
    const fl = el('g', {}, g);
    for (let i = 0; i < 16; i++) {
      const x = 80 + R() * (TNW - 160), y = 10 + R() * 60;
      leaf(fl, { len: 70 + R() * 70, w: 24 + R() * 12, ...F.flora.GREEN[i % 4], R, n: 12, cast: false, transform: `translate(${x} ${y}) rotate(${150 + R() * 60})` });
    }
    for (let i = 0; i < 10; i++) {
      const x = TO.x + 20 + R() * (TO.w - 40), L = 40 + R() * 120;
      const a0 = Math.PI + ((x - TO.x) / TO.w) * Math.PI, y0 = sp + Math.sin(a0) * (sp - TO.top + 40);
      line(fl, `M${x},${y0}q${(R() - 0.5) * 20},${L / 2} ${(R() - 0.5) * 10},${L}`, '#2a5a3a', 3, 0.9);
      for (let k = 0; k < 4; k++) el('ellipse', { cx: x + (R() - 0.5) * 10, cy: y0 + L * (k / 4) + 10, rx: 7, ry: 4, fill: F.flora.GREEN[k % 4].mid, transform: `rotate(${R() * 180} ${x} ${y0 + L * (k / 4) + 10})` }, fl);
    }
    F.flora.flowers.kamboja(el('g', { transform: `translate(${TO.x - 20} ${TO.top + 40}) rotate(20)` }, fl), R, 0.24);
    F.flora.flowers.kambojaPink(el('g', { transform: `translate(${TO.x + TO.w + 30} ${TO.top + 60}) rotate(-30)` }, fl), R, 0.22);
  }

  /* ───────────── jembatan malam: sungai, kota kecil, jembatan lengkung panjang ───────────── */
  const BRW = 780, BRH = 900, DECK = 330;
  function vista(g, R) {
    hills(g, R, { y0: 150, w: BRW, h: 360, lights: 30, cols: ['#25285a', '#181b40'], filter: 'impastoH', dir: [1, -0.15] });
    // kota kecil di tepi kanan
    for (const [x, w, h] of [[500, 60, 70], [566, 50, 96], [622, 70, 60], [700, 56, 84], [750, 60, 66]]) {
      lit(g, `M${x},300V${300 - h}H${x + w}V300Z`, [x, 300 - h, w, h], [[0, '#3a3258'], [1, '#1e1a36']], R, { n: 8 });
      lit(g, `M${x - 6},${300 - h}L${x + w / 2},${300 - h - w * 0.4}L${x + w + 6},${300 - h}Z`, [x - 6, 300 - h - w * 0.4, w + 12, w * 0.4], [[0, '#5a3a4a'], [1, '#2a1a2a']], R, { n: 6 });
      for (let k = 0; k < 4; k++) {
        if (R() < 0.3) continue;
        const wx = x + 8 + (k % 2) * (w / 2 - 4), wy = 300 - h + 14 + Math.floor(k / 2) * 26;
        glow(g, wx + 5, wy + 6, 22, LAMP.glow, 0.4);
        el('rect', { x: wx, y: wy, width: 10, height: 12, fill: LAMP.warm }, g);
      }
    }
    // lampu untai di tepi sungai
    for (let i = 0; i < 18; i++) {
      const x = 480 + i * 17, y = 304 + Math.sin(i * 0.9) * 3;
      glow(g, x, y, 10, '#ffd88a', 0.8);
    }
    // sungai lebar: pantulan bulan, lampu kota, riak
    lit(g, `M-10,300H${BRW + 10}V${BRH - 120}H-10Z`, [-10, 300, BRW + 20, BRH - 420], [[0, '#2a2f5e'], [0.4, '#1c2148'], [1, '#0c1028']], R, { n: 140, dir: [1, 0], width: [4, 12], len: [0.06, 0.2], filter: 'impastoH', gd: [0, 300, 0, BRH - 120] });
    const ref = el('g', { filter: 'url(#blur2)' }, g);
    for (let y = 320; y < BRH - 140; y += 9) {
      const w = 30 + R() * 50 + (y - 320) * 0.06;
      el('rect', { x: 600 - w / 2 + (R() - 0.5) * 20, y, width: w, height: 3 + R() * 2, rx: 2, fill: '#fff1cc', opacity: 0.5 * (1 - (y - 320) / 600) + 0.1 }, ref);
    }
    for (let i = 0; i < 70; i++) {
      const x = 480 + R() * 300, y = 312 + R() * 120;
      el('rect', { x, y, width: 6 + R() * 12, height: 2.4, fill: LAMP.warm, opacity: 0.5 + R() * 0.4 }, ref);
    }
    for (let i = 0; i < 90; i++) {
      const x = R() * BRW, y = 320 + R() * (BRH - 460);
      line(g, `M${x},${y}h${10 + R() * 30}`, '#8a94d0', 1.4, 0.25 + R() * 0.25);
    }
    // jembatan batu berlengkung + pagar besi + lampu-lampu
    const span = 210, piers = [];
    for (let x = -100; x < BRW + 200; x += span) piers.push(x);
    const bridgeD = (() => {
      let d = `M-20,${DECK}H${BRW + 20}V${DECK + 290}`;
      for (let k = piers.length - 1; k > 0; k--) {
        const a = piers[k - 1] + 26, b = piers[k] - 26, mid = (a + b) / 2, r = (b - a) / 2;
        d += `L${b},${DECK + 290}V${DECK + 70 + r}A${r},${r} 0 0 0 ${a},${DECK + 70 + r}V${DECK + 290}`;
      }
      return d + `L-20,${DECK + 290}Z`;
    })();
    // pantulan jembatan di air
    const rf = el('g', { opacity: 0.35, filter: 'url(#soft)', transform: `translate(0 ${2 * (DECK + 290)}) scale(1 -1)` }, g);
    el('path', { d: bridgeD, fill: '#0a0c1c' }, rf);
    const bridge = el('g', { filter: 'url(#castBig)' }, g);
    lit(bridge, bridgeD, [-20, DECK, BRW + 40, 290], [[0, '#5c5468'], [0.2, '#403a52'], [0.6, '#29243a'], [1, '#14111f']], R, { n: 140, dir: [1, 0.05], width: [6, 14], filter: 'impastoFine', op: [0.15, 0.35], gd: [0, DECK, 0, DECK + 290] });
    for (let k = 1; k < piers.length; k++) {
      const a = piers[k - 1] + 26, b = piers[k] - 26, mid = (a + b) / 2, r = (b - a) / 2;
      for (let j = 0; j <= 9; j++) {
        const an = Math.PI + (j / 9) * Math.PI, x1 = mid + Math.cos(an) * r, y1 = DECK + 70 + r + Math.sin(an) * r;
        line(bridge, `M${x1},${y1}L${mid + Math.cos(an) * (r + 22)},${DECK + 70 + r + Math.sin(an) * (r + 22)}`, '#1a1626', 2.4, 0.7);
      }
      el('path', { d: `M${a},${DECK + 290}V${DECK + 70 + r}A${r},${r} 0 0 1 ${b},${DECK + 70 + r}V${DECK + 290}`, fill: 'none', stroke: '#ffd9a0', 'stroke-width': 2, 'stroke-opacity': 0.22 }, bridge);
    }
    lit(bridge, `M-20,${DECK}H${BRW + 20}V${DECK + 26}H-20Z`, [-20, DECK, BRW + 40, 26], [[0, '#8a7e8c'], [1, '#3e3648']], R, { n: 30, dir: [1, 0], gd: [0, DECK, 0, DECK + 26] });
    line(bridge, `M-20,${DECK + 1}H${BRW + 20}`, '#e9dce0', 2, 0.6);
    // pagar
    line(g, `M-20,${DECK - 30}H${BRW + 20}`, '#141224', 4);
    for (let x = -10; x < BRW + 10; x += 14) line(g, `M${x},${DECK - 30}V${DECK}`, '#141224', 2.4);
    for (let x = -10; x < BRW + 10; x += 28) line(g, `M${x},${DECK - 30}L${x + 14},${DECK}M${x + 14},${DECK - 30}L${x},${DECK}`, '#141224', 1.2, 0.7);
    for (const x of piers) {
      if (x < -20 || x > BRW + 20) continue;
      line(g, `M${x},${DECK}V${DECK - 76}`, '#141224', 5);
      glow(g, x, DECK - 84, 50, LAMP.warm, 0.6);
      el('circle', { cx: x, cy: DECK - 84, r: 7, fill: LAMP.hot }, g);
      // pantulan lampu di air
      el('rect', { x: x - 3, y: DECK + 300, width: 6, height: 120, fill: LAMP.warm, opacity: 0.35, filter: 'url(#blur2)' }, g);
    }
    // tepi sungai di depan: siluet kelapa, ilalang, kamboja
    const fg = el('g', {}, g);
    let bank = `M-20,${BRH + 10}V${BRH - 110}`;
    for (let x = -20; x <= BRW + 20; x += 20) bank += `L${x},${(BRH - 110 - 20 * Math.sin(x / 90) - 10 * Math.sin(x / 31)).toFixed(1)}`;
    bank += `V${BRH + 10}Z`;
    lit(fg, bank, [-20, BRH - 150, BRW + 40, 160], [[0, '#101626'], [1, '#04060c']], R, { n: 40, dir: [1, -0.1], filter: null, op: [0.3, 0.6], gd: [0, BRH - 150, 0, BRH] });
    palm(fg, R, 40, BRH - 100, 280, 0.16, '#080b16');
    palm(fg, R, 730, BRH - 96, 230, -0.2, '#080b16');
    for (let i = 0; i < 40; i++) {
      const x = R() * BRW, y = BRH - 100 - 20 * Math.sin(x / 90);
      line(fg, `M${x},${y + 10}q${(R() - 0.5) * 20},-30 ${(R() - 0.5) * 30},${-40 - R() * 40}`, '#080b16', 3);
    }
    dabs(fg, { n: 22, R, filter: null, place: (i, R2) => ({ x: R2() * BRW, y: BRH - 240 + R2() * 140, rx: 2.2, color: '#fff1a0', opacity: 0.9 }) });
  }

  /** kereta kecil untuk adegan jembatan: lokomotif uap (menghadap kanan), tender, dua gerbong berjendela hangat */
  const KTW = 1440, KTH = 200;
  function smallTrain(g, R) {
    const car = (x0, x1) => {
      lit(g, `M${x0},40Q${x0},20 ${x0 + 30},18H${x1 - 30}Q${x1},20 ${x1},40Z`, [x0, 18, x1 - x0, 24], [[0, '#6a7290'], [1, '#22283a']], R, { n: 12, dir: [1, 0] });
      lit(g, `M${x0},38H${x1}V150H${x0}Z`, [x0, 38, x1 - x0, 112], [[0, WINE.light], [0.5, WINE.base], [1, WINE.dark]], R, { n: 40, dir: [0, 1], gd: [0, 38, 0, 150] });
      lit(g, `M${x0},58H${x1}V104H${x0}Z`, [x0, 58, x1 - x0, 46], [[0, CREAM.light], [1, CREAM.mid]], R, { n: 20, dir: [1, 0] });
      for (let x = x0 + 20; x < x1 - 40; x += 62) {
        glow(g, x + 22, 82, 46, LAMP.glow, 0.5);
        el('rect', { x, y: 64, width: 44, height: 34, rx: 6, fill: radGrad(g, [[0, LAMP.hot], [0.6, LAMP.warm], [1, LAMP.glow]], x + 22, 74, 34) }, g);
        el('rect', { x, y: 64, width: 44, height: 34, rx: 6, fill: 'none', stroke: GOLD.mid, 'stroke-width': 2 }, g);
      }
      line(g, `M${x0},56H${x1}M${x0},106H${x1}`, GOLD.base, 2);
      lit(g, `M${x0 + 10},150H${x1 - 10}V160H${x0 + 10}Z`, [x0, 150, x1 - x0, 10], [[0, IRON.base], [1, IRON.deep]], R, { n: 6 });
      for (const wx of [x0 + 50, x0 + 100, x1 - 100, x1 - 50]) {
        el('circle', { cx: wx, cy: 172, r: 20, fill: IRON.deep }, g);
        el('circle', { cx: wx, cy: 172, r: 14, fill: 'none', stroke: IRON.light, 'stroke-width': 2.4 }, g);
      }
    };
    car(20, 470);
    car(490, 940);
    for (const x of [470, 940]) lit(g, `M${x},124h20v10h-20Z`, [x, 124, 20, 10], [[0, IRON.light], [1, IRON.deep]], R, { n: 3 });
    // tender
    lit(g, `M960,60H1100V150H960Z`, [960, 60, 140, 90], [[0, '#2a2f44'], [1, '#0e1020']], R, { n: 20, dir: [0, 1] });
    line(g, 'M960,64H1100', GOLD.base, 2.4);
    dabs(g, { n: 20, R, filter: null, place: (i, R2) => ({ x: 970 + R2() * 120, y: 56 + R2() * 8, rx: 6, ry: 4, color: '#14141c', opacity: 1 }) });
    for (const wx of [990, 1070]) { el('circle', { cx: wx, cy: 172, r: 20, fill: IRON.deep }, g); el('circle', { cx: wx, cy: 172, r: 14, fill: 'none', stroke: IRON.light, 'stroke-width': 2.4 }, g); }
    // lokomotif
    lit(g, `M1110,30H1210V150H1110Z`, [1110, 30, 100, 120], [[0, WINE.light], [1, WINE.dark]], R, { n: 20, dir: [0, 1] });
    lit(g, `M1100,22H1220V36H1100Z`, [1100, 22, 120, 14], [[0, '#3a3f58'], [1, '#14182a']], R, { n: 6 });
    glow(g, 1160, 70, 40, LAMP.glow, 0.6);
    el('rect', { x: 1136, y: 50, width: 48, height: 40, rx: 6, fill: LAMP.warm }, g);
    lit(g, `M1210,58H1400Q1426,58 1426,90V140H1210Z`, [1210, 58, 216, 82], [[0, '#3a4060'], [0.4, '#1e2236'], [1, '#0a0c18']], R, { n: 40, dir: [1, 0], gd: [0, 58, 0, 140] });
    for (const x of [1250, 1310, 1370]) line(g, `M${x},58V140`, GOLD.base, 3.4);
    lit(g, `M1340,58V18H1372V58Z`, [1340, 18, 32, 40], [[0, '#2a2f48'], [1, '#0a0c18']], R, { n: 6 });
    el('rect', { x: 1334, y: 12, width: 44, height: 10, rx: 3, fill: GOLD.base }, g);
    lit(g, 'M1276,58Q1276,40 1292,40Q1308,40 1308,58Z', [1276, 40, 32, 18], GOLD_STOPS, R, { n: 4 });
    // lampu depan
    glow(g, 1430, 84, 60, '#fff3c8', 0.9);
    el('circle', { cx: 1426, cy: 84, r: 11, fill: LAMP.hot, stroke: GOLD.base, 'stroke-width': 3 }, g);
    el('path', { d: 'M1420,140L1440,174H1390Z', fill: GOLD.mid }, g);
    for (const wx of [1240, 1300, 1360]) {
      el('circle', { cx: wx, cy: 164, r: 26, fill: '#3a0c12' }, g);
      el('circle', { cx: wx, cy: 164, r: 26, fill: 'none', stroke: GOLD.base, 'stroke-width': 3 }, g);
      for (let k = 0; k < 6; k++) line(g, `M${wx},164l${Math.cos(k) * 22},${Math.sin(k) * 22}`, GOLD.mid, 1.6, 0.8);
    }
    line(g, 'M1240,164H1360', GOLD.light, 4);
  }

  /** lampion langit kertas yang menyala */
  const LPW = 90, LPH = 124;
  function lantern(g, R) {
    glow(g, LPW / 2, 70, 44, LAMP.glow, 0.7);
    const d = `M18,14Q45,4 72,14L80,98Q45,110 10,98Z`;
    el('path', { d, fill: radGrad(g, [[0, '#fff6d6'], [0.4, '#ffd27a'], [0.8, '#f29a3a'], [1, '#c45a1e']], 45, 86, 60) }, g);
    for (const x of [28, 45, 62]) line(g, `M${x},10Q${x + (x - 45) * 0.2},60 ${x + (x - 45) * 0.25},104`, '#c96a24', 1.4, 0.5);
    line(g, 'M14,98Q45,110 76,98', '#8a3e18', 2.4);
    el('ellipse', { cx: 45, cy: 108, rx: 8, ry: 5, fill: '#fffbe6' }, g);
    glow(g, 45, 104, 14, '#ffffff', 0.9);
  }

  /** amplop krem bersegel lilin kamboja, diikat tali rami, dengan label koper */
  const AMW = 400, AMH = 300;
  function envelope(g, R) {
    const e = el('g', { filter: 'url(#castBig)' }, g);
    lit(e, rrect(10, 30, 330, 220, 10), [10, 30, 330, 220], [[0, '#fffaf0'], [0.5, '#f4e8cc'], [1, '#dcc79c']], R, { n: 80, dir: [1, 0.05], width: [3, 7], filter: 'impastoFine' });
    el('rect', { x: 10, y: 30, width: 330, height: 220, rx: 10, fill: kawung(g, '#8a6a3a', 44, 1), opacity: 0.06 }, e);
    line(e, 'M14,246L175,138L336,246', '#c9b48a', 2, 0.8);
    lit(e, 'M12,34L175,160L338,34Z', [12, 34, 326, 126], [[0, '#fffcf4'], [1, '#ead9b4']], R, { n: 30, dir: [1, 0.1], cast: 'cast' });
    // tali rami
    line(e, 'M10,140H340M175,30V250', '#a87c4a', 5);
    line(e, 'M10,138H340M173,30V250', '#d9b27a', 1.6, 0.8);
    // segel lilin
    const s = el('g', { filter: 'url(#cast)' }, e);
    el('path', { d: 'M175,124c22,-4 34,10 32,30c-2,22 -22,30 -36,26c-18,-4 -28,-20 -24,-34c3,-12 12,-20 28,-22Z', fill: radGrad(g, [[0, WINE.hi], [0.6, WINE.base], [1, WINE.dark]], 168, 140, 40) }, s);
    mark(s, 176, 152, 0.85, WINE.dark, 0.9);
    // label koper
    const tg = el('g', { transform: 'rotate(10 330 200)', filter: 'url(#cast)' }, g);
    line(tg, 'M190,150Q250,170 292,186', '#a87c4a', 3);
    lit(tg, 'M290,170H380V250H300L290,240Z', [290, 170, 90, 80], [[0, '#f2dcae'], [1, '#c9a56a']], R, { n: 20, dir: [1, 0] });
    el('circle', { cx: 302, cy: 186, r: 7, fill: 'none', stroke: WINE.base, 'stroke-width': 4 }, tg);
    line(tg, 'M296,178H378', WINE.base, 3, 0.8);
  }

  /** lokomotif mainan gempal untuk mini-game (menghadap kanan); wajahnya dari DOM di pelat krem bundar */
  const GW2 = 440, GH2 = 340, FACE = { x: 236, y: 176, r: 62 };
  function toyEngine(g, R) {
    glow(g, 220, 322, 220, '#000', 0.5, 0.12);
    const b = el('g', { filter: 'url(#castBig)' }, g);
    // cerobong
    lit(b, 'M332,112L326,56Q320,40 314,30H382Q376,40 370,56L364,112Z', [314, 30, 68, 82], [[0, '#4a4f6a'], [0.4, '#22263a'], [1, '#0a0c18']], R, { n: 14, gd: [314, 0, 382, 0] });
    lit(b, rrect(306, 20, 84, 16, 8), [306, 20, 84, 16], GOLD_STOPS, R, { n: 6 });
    // kabin
    lit(b, rrect(40, 70, 110, 190, 14), [40, 70, 110, 190], [[0, CREAM.hi], [0.5, CREAM.light], [1, CREAM.mid]], R, { n: 30, dir: [0, 1] });
    lit(b, 'M26,82Q26,50 60,46H140Q166,50 166,82Z', [26, 46, 140, 36], [[0, WINE.hi], [0.5, WINE.base], [1, WINE.dark]], R, { n: 16 });
    el('rect', { x: 64, y: 104, width: 62, height: 58, rx: 12, fill: radGrad(g, [[0, LAMP.hot], [0.6, LAMP.warm], [1, LAMP.glow]], 92, 124, 50), stroke: GOLD.mid, 'stroke-width': 4 }, b);
    // ketel gempal
    lit(b, 'M140,120Q140,104 160,104H350Q400,104 400,176Q400,248 350,248H160Q140,248 140,232Z', [140, 104, 260, 144], [[0, WINE.hi], [0.25, WINE.light], [0.6, WINE.base], [1, WINE.deep]], R, { n: 70, dir: [1, 0], width: [5, 12], filter: 'impastoFine', gd: [160, 104, 360, 248] });
    for (const x of [180, 312]) lit(b, `M${x},104h14v144h-14Z`, [x, 104, 14, 144], GOLD_STOPS, R, { n: 4, gd: [x, 104, x + 14, 248] });
    lit(b, 'M222,104Q222,72 252,72Q282,72 282,104Z', [222, 72, 60, 32], GOLD_STOPS, R, { n: 8 });
    el('circle', { cx: FACE.x, cy: FACE.y, r: FACE.r + 6, fill: GOLD.mid }, b);
    lit(b, circ(FACE.x, FACE.y, FACE.r), [FACE.x - FACE.r, FACE.y - FACE.r, FACE.r * 2, FACE.r * 2], [[0, '#fffdf4'], [0.6, '#f6ead0'], [1, '#e0c898']], R, { n: 16 });
    // lampu depan & penghalau
    lit(b, rrect(386, 118, 34, 30, 8), [386, 118, 34, 30], GOLD_STOPS, R, { n: 4 });
    el('circle', { cx: 412, cy: 133, r: 9, fill: LAMP.hot }, b);
    glow(g, 416, 133, 26, '#fff3c8', 0.8);
    el('path', { d: 'M380,246H418L436,300H372Z', fill: GOLD.base, stroke: GOLD.deep, 'stroke-width': 2 }, b);
    for (const x of [388, 400, 412]) line(b, `M${x},248L${x + 8},298`, GOLD.dark, 2);
    // rangka & roda besar
    lit(b, rrect(30, 244, 370, 22, 8), [30, 244, 370, 22], [[0, IRON.light], [1, IRON.deep]], R, { n: 10 });
    for (const [x, r] of [[96, 50], [212, 50], [322, 42]]) {
      el('circle', { cx: x, cy: 284, r, fill: radGrad(g, [[0, '#d4483a'], [0.7, '#a8241e'], [1, '#5a0e0c']], x - 10, 274, r) }, b);
      el('circle', { cx: x, cy: 284, r: r - 2, fill: 'none', stroke: GOLD.base, 'stroke-width': 6 }, b);
      for (let k = 0; k < 8; k++) line(b, `M${x},284l${Math.cos((k * Math.PI) / 4) * (r - 8)},${Math.sin((k * Math.PI) / 4) * (r - 8)}`, GOLD.light, 3);
      el('circle', { cx: x, cy: 284, r: 10, fill: GOLD.base, stroke: GOLD.deep, 'stroke-width': 2 }, b);
    }
    line(b, 'M96,300H322', GOLD.light, 7);
    line(b, 'M96,298H322', GOLD.hi, 2, 0.8);
    // kilau dari kiri-atas
    el('path', { d: 'M170,116Q240,110 330,118', fill: 'none', stroke: '#fff', 'stroke-width': 6, 'stroke-opacity': 0.35, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, b);
  }

  /* ───────────────────────────── daftar sprite (2) ───────────────────────────── */
  scaled('anniversary-kabin', CW, CH + CTOP, 541, (svg, R) => { ceiling(svg, R); cabin(el('g', { transform: `translate(0 ${CTOP})` }, svg), R); }, 0.32);
  scaled('anniversary-tirai', TW, TH, 542, (svg, R) => blind(svg, R), 0.27);
  scaled('anniversary-lampu', SW, SH, 543, (svg, R) => sconce(svg, R), 0.44);
  F.sprites['anniversary-jauh'] = { w: JW2 * 0.34, h: JH2 * 0.34, viewBox: `0 0 ${JW2} ${JH2}`, seed: 544, draw(svg) { tile(svg, JW2, JH2, 544, farLayer); } };
  F.sprites['anniversary-sawah'] = { w: SWW * 0.3, h: SWH * 0.3, viewBox: `0 0 ${SWW} ${SWH}`, seed: 545, draw(svg) { tile(svg, SWW, SWH, 545, midLayer); } };
  F.sprites['anniversary-dekat'] = { w: NW * 0.28, h: NH * 0.28, viewBox: `0 0 ${NW} ${NH}`, seed: 546, draw(svg) { tile(svg, NW, NH, 546, nearLayer); } };
  scaled('anniversary-halte', HW, HH, 547, (svg, R) => halt(svg, R), 0.3);
  scaled('anniversary-patok', KPW, KPH, 548, (svg, R) => kmPost(svg, R), 0.44);
  scaled('anniversary-terowongan', TNW, TNH, 549, (svg, R) => tunnel(svg, R), 0.24);
  scaled('anniversary-jembatan', BRW, BRH, 550, (svg, R) => vista(svg, R), 0.32);
  scaled('anniversary-kereta', KTW, KTH, 551, (svg, R) => smallTrain(svg, R), 0.21);
  scaled('anniversary-lampion', LPW, LPH, 552, (svg, R) => lantern(svg, R), 0.5);
  scaled('anniversary-amplop', AMW, AMH, 553, (svg, R) => envelope(svg, R), 0.46);
  scaled('game-anniversary-kereta', GW2, GH2, 554, (svg, R) => toyEngine(svg, R), 0.36);


  /** papan besar Stasiun Hari Ini: enamel biru tua bermuka krem di dua tiang besi, papan hitung di bawahnya, kamboja di kaki tiang */
  const BBW = 716, BBH = 520;
  function bigBoard(g, R) {
    glow(g, BBW / 2, BBH - 8, 380, '#000', 0.5, 0.08);
    for (const x of [74, BBW - 74]) {
      const p = el('g', { filter: 'url(#cast)' }, g);
      lit(p, `M${x - 11},200H${x + 11}V${BBH - 14}H${x - 11}Z`, [x - 11, 200, 22, BBH - 214], [[0, IRON.light], [0.3, IRON.hi], [0.6, IRON.base], [1, IRON.deep]], R, { n: 12, dir: [0, 1], gd: [x - 11, 0, x + 11, 0] });
      lit(p, `M${x - 22},${BBH - 22}H${x + 22}L${x + 26},${BBH - 2}H${x - 26}Z`, [x - 26, BBH - 22, 52, 20], [[0, IRON.hi], [1, IRON.deep]], R, { n: 6 });
    }
    // papan hitung gelap
    const pn = el('g', { filter: 'url(#castBig)' }, g);
    lit(pn, rrect(92, 360, 532, 116, 12), [92, 360, 532, 116], GOLD_STOPS, R, { n: 20 });
    lit(pn, rrect(100, 368, 516, 100, 8), [100, 368, 516, 100], [[0, '#2a3454'], [0.5, '#1a2238'], [1, '#0e1426']], R, { n: 30, dir: [1, 0], width: [4, 9] });
    for (const x of [112, 604]) for (const y of [380, 456]) el('circle', { cx: x, cy: y, r: 4, fill: GOLD.base }, pn);
    // papan utama
    const b = el('g', { filter: 'url(#castBig)' }, g);
    lit(b, rrect(10, 14, BBW - 20, 336, 24), [10, 14, BBW - 20, 336], [[0, '#2f4478'], [0.4, '#1e2f5c'], [1, '#121c3c']], R, { n: 50, dir: [1, 0.1], width: [5, 11] });
    const face = lit(b, rrect(32, 36, BBW - 64, 292, 12), [32, 36, BBW - 64, 292], [[0, CREAM.hi], [0.3, CREAM.light], [0.75, CREAM.base], [1, CREAM.mid]], R, { n: 120, dir: [1, 0.05], width: [6, 14], len: [0.05, 0.16] });
    el('rect', { x: 32, y: 36, width: BBW - 64, height: 292, fill: kawung(g, '#8a6a3a', 52, 1.2), opacity: 0.07 }, face.inner);
    el('path', { d: rrect(42, 46, BBW - 84, 272, 8), fill: 'none', stroke: GOLD.mid, 'stroke-width': 2.4, 'stroke-opacity': 0.8 }, b);
    for (const [x, y] of [[22, 26], [BBW - 22, 26], [22, 338], [BBW - 22, 338]]) el('circle', { cx: x, cy: y, r: 6, fill: GOLD.base, stroke: GOLD.deep, 'stroke-width': 1.4 }, b);
    el('path', { d: rrect(10, 14, BBW - 20, 336, 24), fill: linGrad(g, [[0, '#fff', 0.2], [0.35, '#fff', 0], [1, '#000', 0.12]], 0, 14, BBW * 0.6, 350) }, b);
    badge(g, BBW / 2, 16, 26, R);
    // kamboja & daun di kaki tiang
    const fr = F.flora, gr = fr.GREEN;
    for (const [x, s] of [[70, 1], [BBW - 70, -1]]) {
      const f = el('g', {}, g);
      for (let i = 0; i < 5; i++) leaf(f, { len: 70 + R() * 30, w: 28, ...gr[i % 4], R, n: 14, transform: `translate(${x} ${BBH - 10}) rotate(${s * (-70 + i * 30)})` });
      fr.flowers.kambojaPink(el('g', { transform: `translate(${x + s * 24} ${BBH - 60}) rotate(${s * 14})` }, f), R, 0.18);
      fr.flowers.kamboja(el('g', { transform: `translate(${x - s * 22} ${BBH - 44}) rotate(${-s * 30})` }, f), R, 0.15);
    }
  }
  scaled('anniversary-papan-besar', BBW, BBH, 556, (svg, R) => bigBoard(svg, R), 0.36);

  F.sprites['cover-kereta-malam'] = { w: 480, h: 600, seed: 555, draw(svg, R) {
    night(el('g', { transform: 'translate(0 -40) scale(0.6154)' }, svg), R, { hillsOn: false });
    // gerbong menunggu, pintunya terbuka & hangat
    carriage(el('g', { transform: 'translate(-150 200) scale(0.56)' }, svg), R);
    glow(svg, 146, 330, 170, LAMP.warm, 0.32);
    platform(el('g', { transform: 'translate(-60 430) scale(0.77)' }, svg), R);
    glow(svg, 186, 452, 150, LAMP.warm, 0.3, 0.4);
    // uap yang mengepul dari kiri
    const st = el('g', { filter: 'url(#mist)' }, svg);
    for (let i = 0; i < 16; i++) el('circle', { cx: -30 + R() * 170, cy: 170 + R() * 260, r: 26 + R() * 40, fill: '#e8e4f0', opacity: 0.1 + R() * 0.12 }, st);
    canopy(el('g', { transform: 'translate(0 -66) scale(0.6154)' }, svg), R);
    const sg = el('g', { transform: 'translate(108 30) scale(0.47)' }, svg);
    signBoard(sg, R);
    // pengganti tulisan di papan: kamboja + garis halus
    mark(sg, PW / 2, 124, 1.6, '#1e2f5c', 0.9);
    for (const [x0, x1] of [[120, 236], [324, 440]]) line(sg, `M${x0},124H${x1}`, '#1e2f5c', 7, 0.55);
    clock(el('g', { transform: 'translate(122 112) scale(-0.6 0.6)' }, svg), R);
    // bangku & karcis
    bench(el('g', { transform: 'translate(80 470) scale(0.53)' }, svg), R);
    const tk = el('g', { transform: 'translate(150 478) rotate(-8) scale(0.32)' }, svg);
    ticket(tk, R);
    el('circle', { cx: KW - 84, cy: 174, r: 26, fill: '#2a1a14' }, tk);
    for (const [y, x1, o] of [[130, 300, 0.5], [176, 240, 0.4], [214, 320, 0.3]]) line(tk, `M60,${y}H${x1}`, WINE.base, 9, o);
    F.flora.flowers.kambojaPink(el('g', { transform: 'translate(70 566) rotate(18)' }, svg), R, 0.3);
    F.flora.flowers.kamboja(el('g', { transform: 'translate(440 556) rotate(-14)' }, svg), R, 0.32);
    leaf(svg, { len: 120, w: 46, ...F.flora.GREEN[0], R, n: 30, transform: 'translate(486 604) rotate(-40)' });
    leaf(svg, { len: 110, w: 42, ...F.flora.GREEN[2], R, n: 30, transform: 'translate(-6 604) rotate(36)' });
    el('rect', { x: 0, y: 0, width: 480, height: 600, fill: radGrad(svg, [[0, '#000', 0], [0.6, '#000', 0], [1, '#03060f', 0.45]], 240, 300, 420) }, svg);
  } };
})();
