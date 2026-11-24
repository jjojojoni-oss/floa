/* Our Vinyl: "album kita" di piringan hitam — sampul karton bergambar matahari retro, pemutar piringan
   berbadan kayu walnut (dilihat dari atas), lengan jarum, label piringan sisi A & B, stiker emas,
   gumpalan debu untuk mini-game, dan latar kuning mustard berkawung.
   Piringan hitamnya sendiri, foto sampul, dan semua tulisan dipasang dari DOM. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf, petal, linGrad, radGrad } = F;
  const WARM = '#3a1d12';
  const W = 780, H = 1500;
  /** benda-benda digambar di kanvas besar (koordinat di bawah), dirender 0,6× supaya berkasnya ringan */
  const K = 0.6;

  const circ = (cx, cy, r, cw = true) => `M${cx - r},${cy}A${r},${r} 0 1 ${cw ? 1 : 0} ${cx + r},${cy}A${r},${r} 0 1 ${cw ? 1 : 0} ${cx - r},${cy}Z`;
  const ring = (cx, cy, r2, r1) => circ(cx, cy, r2, true) + circ(cx, cy, r1, false);
  const pol = (cx, cy, r, deg) => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r];
  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;

  /** bidang bebas dilukis dengan sapuan searah `dir` di dalam kotak pembatas; cols = [gelap, dasar, terang] */
  const shape = (g, d, box, cols, R, { n = 60, dir = [1, 0.05], width = [8, 20], filter = 'impastoFine', cast, len = [26, 90], base } = {}) => painted(g, d, {
    base: base || cols[1], n, R, filter, cast,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.35 + R() * 0.45 };
    },
  });

  /** logam melingkar (gelang atau cakram): gradien diagonal + sapuan halus searah lingkaran */
  const ALU = [[0, '#e6e2da'], [0.16, '#ffffff'], [0.36, '#dcd8d0'], [0.6, '#a9a49c'], [0.84, '#77726b'], [1, '#4a4641']];
  const ALU_IN = [[0, '#4a4641'], [0.2, '#77726b'], [0.46, '#a9a49c'], [0.7, '#dcd8d0'], [0.88, '#ffffff'], [1, '#e6e2da']];
  const BRASS = [[0, '#f1d58a'], [0.16, '#fff4cc'], [0.36, '#f1d58a'], [0.6, '#c99a3e'], [0.84, '#a87a26'], [1, '#6e4b14']];
  function roundMetal(g, cx, cy, r2, r1, R, { n = 100, stops = ALU, cast, width = [3, 8], filter = 'impastoFine' } = {}) {
    const d = r1 > 0 ? ring(cx, cy, r2, r1) : circ(cx, cy, r2);
    return painted(g, d, {
      base: linGrad(g, stops, cx - r2 * 0.72, cy - r2 * 0.72, cx + r2 * 0.72, cy + r2 * 0.72), n, R, filter, cast,
      stroke: () => {
        const a = R() * 360, r = r1 + Math.sqrt(R()) * (r2 - r1), span = 8 + R() * 22;
        const [x0, y0] = pol(cx, cy, r, a), [x1, y1] = pol(cx, cy, r, a + span);
        const t = ((x0 - cx + (y0 - cy)) / (r2 * 1.44) + 1) / 2;
        return { d: `M${x0},${y0}A${r},${r} 0 0 1 ${x1},${y1}`, color: jitter(ramp(stops, t + (R() - 0.5) * 0.08), 4, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.16 + R() * 0.24 };
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

  /* ───────────── latar: permukaan kuning mustard, pita retro di sudut, bunga ───────────── */
  /** pita lengkung retro: gelang-gelang berpusat di (cx, cy) */
  function arcs(svg, R, cx, cy, r0, bandW, cols, opacity = 1) {
    const g = el('g', { opacity }, svg);
    cols.forEach((c, i) => {
      const r1 = r0 + i * bandW, r2 = r1 + bandW - 6;
      shape(g, ring(cx, cy, r2, r1), [cx - r2, cy - r2, r2 * 2, r2 * 2], [mix(c, WARM, 0.2), c, mix(c, '#fff3d0', 0.3)], R, { n: 70 + i * 26, dir: [1, 0.4], width: [8, 20], len: [30, 90] });
    });
  }

  function wall(svg, R, { deco = true } = {}) {
    const tone = [[0, '#f2c765'], [0.45, '#e6ae43'], [0.8, '#d6992f'], [1, '#c2851f']];
    wash(svg, {
      x: -40, y: -30, w: W + 80, h: H + 60, R, n: 600, angle: 82, len: [0.1, 0.24], width: [26, 64], opacity: [0.25, 0.6],
      base: linGrad(svg, tone, 0, 0, W * 0.5, H),
      color: (u, v) => ramp(tone, v * 0.82 + u * 0.18 + (R() - 0.5) * 0.06),
    });
    dabs(svg, { n: 50, R, filter: 'softer', place: (i, R2) => ({ x: R2() * W, y: R2() * H, rx: 50 + R2() * 110, ry: 30 + R2() * 60, rot: R2() * 180, color: R2() < 0.55 ? '#ffe7a6' : '#a8690f', opacity: 0.1 + R2() * 0.08 }) });
    el('rect', { x: 0, y: 0, width: W, height: H, fill: kawung(svg, '#fff0c2', 84, 1.6), opacity: 0.26 }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: kawung(svg, '#8a5608', 84, 1.6), opacity: 0.1, transform: 'translate(1.6 2)' }, svg);
    if (deco) {
      // pita retro tiga warna menyapu dari sudut kiri-bawah
      arcs(svg, R, -40, H + 60, 170, 48, ['#f8ecd0', '#2f6f6a', '#c8472d'], 0.9);
    }
    // cahaya dari kiri-atas, teduh ke kanan-bawah
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#fff6d2', 0.3], [0.5, '#fff6d2', 0.06], [1, '#fff6d2', 0]], W * 0.28, H * 0.22, 760) }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#000', 0], [0.6, '#000', 0], [1, '#5a2f08', 0.4]], W / 2, H * 0.46, H * 0.76) }, svg);
    if (!deco) return;
    const fr = F.flora, gr = fr.GREEN;
    const lf = (x, y, rot, len, w, k, curve = 0.15) => leaf(svg, { len, w, ...gr[k], R, n: 46, curve, transform: `translate(${x} ${y}) rotate(${rot})` });
    // kanan-bawah: kamboja merah muda, daun, melati
    lf(W + 10, H - 200, -48, 260, 96, 0, -0.2);
    lf(W - 110, H + 22, -14, 200, 84, 2);
    lf(W - 6, H - 30, -84, 170, 72, 3, 0.2);
    fr.flowers.kambojaPink(el('g', { transform: `translate(${W - 46} ${H - 86}) rotate(-12)` }, svg), R, 0.6);
    fr.flowers.melati(el('g', { transform: `translate(${W - 166} ${H - 34}) scale(0.78)` }, svg), R, 1);
    // kiri-atas: dua helai daun dan kamboja putih yang menyembul (tidak sampai ke tulisan di kepala layar)
    lf(-8, 140, 50, 220, 90, 1);
    lf(58, -30, 146, 190, 78, 0, -0.18);
    fr.flowers.kamboja(el('g', { transform: 'translate(30 58) rotate(18)' }, svg), R, 0.56);
    [[W - 230, H - 96, -70, 0.32, 'kambojaPink'], [126, 290, 110, 0.3, 'kamboja']].forEach(([x, y, rot, s, pal]) =>
      petal(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...fr.PAL[pal], cast: false }));
  }

  /* ───────────── sampul album: karton krem, gambar matahari retro (tertutup foto kalau ada) ───────────── */
  /** kanvas sampul: persegi S berpojok di (SX, SY), sisanya ruang bayangan */
  const SW = 600, SH = 580, SX = 30, SY = 20, S = 520;
  /** bidang gambar sampul (di dalam persegi sampul): sama dengan posisi foto di DOM */
  const ART = { x: 22, y: 22, w: 476, h: 318 };

  function coverArt(g, R, x, y, w, h) {
    const id = F.uid('a');
    const cp = el('clipPath', { id }, g);
    el('rect', { x, y, width: w, height: h }, cp);
    const a = el('g', { 'clip-path': `url(#${id})` }, g);
    const sky = [[0, '#17403f'], [0.55, '#235a56'], [1, '#337767']];
    wash(a, { x, y, w, h, R, n: 110, angle: 0, len: [0.2, 0.5], width: [10, 24], opacity: [0.3, 0.6], base: linGrad(g, sky, 0, y, 0, y + h), color: (u, v) => ramp(sky, v), filter: 'impastoH' });
    // matahari berlapis: pusat di tengah, sedikit di bawah cakrawala
    const cx = x + w / 2, cy = y + h * 0.84;
    [['#7a2a1c', 232], ['#b8432a', 194], ['#e0762f', 156], ['#f0a83c', 118], ['#f8dc9a', 80]].forEach(([c, r]) =>
      shape(a, circ(cx, cy, r), [cx - r, cy - r, 2 * r, 2 * r], [mix(c, WARM, 0.2), c, mix(c, '#fff3d0', 0.28)], R, { n: 46, dir: [1, 0.12], width: [8, 18], len: [30, 90] }));
    // bukit di depan
    const hill = `M${x - 4},${y + h + 4}V${cy - 2}Q${x + w * 0.22},${cy - 36} ${x + w * 0.46},${cy - 8}T${x + w + 4},${cy - 22}V${y + h + 4}Z`;
    shape(a, hill, [x, cy - 40, w, h * 0.3], ['#0f2c2f', '#17403f', '#2a6657'], R, { n: 60, dir: [1, -0.08], width: [8, 18], len: [40, 120] });
    // kamboja & daun di sudut kiri bawah
    const gr = F.flora.GREEN;
    leaf(a, { len: 150, w: 56, ...gr[0], R, n: 36, curve: 0.2, transform: `translate(${x + 20} ${y + h + 10}) rotate(28)` });
    leaf(a, { len: 120, w: 48, ...gr[2], R, n: 32, curve: -0.2, transform: `translate(${x + 96} ${y + h + 16}) rotate(64)` });
    F.flora.flowers.kamboja(el('g', { transform: `translate(${x + 62} ${y + h - 34}) rotate(12)` }, a), R, 0.36);
    F.flora.flowers.kambojaPink(el('g', { transform: `translate(${x + w - 52} ${y + h - 22}) rotate(-20)` }, a), R, 0.26);
  }

  function sleeve(g, R, { art = true, lines = false } = {}) {
    const x = SX, y = SY, n = 20, my = y + S / 2;
    // persegi karton dengan lekuk jempol tembus di tengah sisi kanan (piringan terlihat dari situ)
    const body = `M${x + 5},${y}H${x + S - 5}Q${x + S},${y} ${x + S},${y + 5}V${my - n}A${n},${n} 0 0 0 ${x + S},${my + n}V${y + S - 5}Q${x + S},${y + S} ${x + S - 5},${y + S}H${x + 5}Q${x},${y + S} ${x},${y + S - 5}V${y + 5}Q${x},${y} ${x + 5},${y}Z`;
    el('path', { d: body, fill: WARM, opacity: 0.4, filter: 'url(#softer)', transform: 'translate(12 18)' }, g);
    const card = ['#dccaa2', '#f2e6ca', '#fcf5e3'];
    shape(g, body, [x, y, S, S], card, R, { n: 170, dir: [1, 0.04], width: [10, 26], len: [40, 150], cast: 'cast' });
    if (art) coverArt(g, R, x + ART.x, y + ART.y, ART.w, ART.h);
    // garis tipis di bawah gambar
    el('path', { d: `M${x + ART.x},${y + ART.y + ART.h + 10}H${x + ART.x + ART.w}`, stroke: '#b8432a', 'stroke-width': 2.4, 'stroke-opacity': 0.75 }, g);
    if (lines) {
      // sampul katalog tanpa huruf: judul & nama cukup berupa garis tinta
      el('path', { d: `M${x + 40},${y + 402}h250M${x + 40},${y + 440}h170`, stroke: '#2b1a12', 'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-opacity': 0.82 }, g);
      el('path', { d: `M${x + 40},${y + 478}h120`, stroke: '#b8432a', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-opacity': 0.85 }, g);
      mark(g, x + S - 62, y + 446, 1.5, '#b8432a', 0.85);
    }
    // tepi karton: sedikit lebih gelap, sudut-sudutnya aus keputihan
    el('path', { d: body, fill: 'none', stroke: '#a88d5a', 'stroke-width': 2.2, 'stroke-opacity': 0.55 }, g);
    for (const [cx, cy, rot] of [[x + 6, y + 6, 0], [x + S - 6, y + 6, 90], [x + S - 6, y + S - 6, 180], [x + 6, y + S - 6, 270]]) {
      el('path', { d: 'M-4,10V2Q-4,-4 2,-4H12', fill: 'none', stroke: '#fffaf0', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-opacity': 0.6, filter: 'url(#blur2)', transform: `translate(${cx} ${cy}) rotate(${rot})` }, g);
    }
    // bukaan di sisi kanan: garis celah tipis
    el('path', { d: `M${x + S - 5},${y + 8}V${my - n - 4}M${x + S - 5},${my + n + 4}V${y + S - 8}`, stroke: '#5f4420', 'stroke-width': 2.2, 'stroke-opacity': 0.55 }, g);
    el('path', { d: `M${x + S},${my - n}A${n},${n} 0 0 0 ${x + S},${my + n}`, fill: 'none', stroke: '#8a6f42', 'stroke-width': 2, 'stroke-opacity': 0.7 }, g);
  }

  /* ───────────── stiker emas bergerigi ───────────── */
  function seal(g, R, cx, cy, r) {
    let d = '';
    const n = 18;
    for (let i = 0; i < n; i++) {
      const [x0, y0] = pol(cx, cy, r, (i / n) * 360), [x1, y1] = pol(cx, cy, r, ((i + 1) / n) * 360), [mx, my] = pol(cx, cy, r * 1.12, ((i + 0.5) / n) * 360);
      d += `${i ? '' : `M${x0},${y0}`}Q${mx},${my} ${x1},${y1}`;
    }
    d += 'Z';
    painted(g, d, {
      base: linGrad(g, BRASS, cx - r, cy - r, cx + r, cy + r), n: 50, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => {
        const a = R() * 360, rr = Math.sqrt(R()) * r, [sx, sy] = pol(cx, cy, rr, a), [ex, ey] = pol(cx, cy, rr, a + 14 + R() * 20);
        const t = ((sx - cx + (sy - cy)) / (r * 1.44) + 1) / 2;
        return { d: `M${sx},${sy}A${rr},${rr} 0 0 1 ${ex},${ey}`, color: jitter(ramp(BRASS, t), 4, R), width: 3 + R() * 5, opacity: 0.2 + R() * 0.25 };
      },
    });
    el('circle', { cx, cy, r: r * 0.8, fill: 'none', stroke: '#6e4b14', 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, g);
    el('circle', { cx: cx + 0.8, cy: cy + 1, r: r * 0.8, fill: 'none', stroke: '#fff4cc', 'stroke-width': 1, 'stroke-opacity': 0.6 }, g);
    el('circle', { cx, cy, r: r * 0.73, fill: 'none', stroke: '#6e4b14', 'stroke-width': 0.9, 'stroke-opacity': 0.45, 'stroke-dasharray': '2 4' }, g);
  }

  /* ───────────── label piringan (tengah piringan hitam) ───────────── */
  function label(g, R, cx, cy, r, cols) {
    shape(g, circ(cx, cy, r), [cx - r, cy - r, 2 * r, 2 * r], cols, R, { n: 60, dir: [1, 0.2], width: [6, 14], len: [20, 60] });
    el('circle', { cx, cy, r, fill: radGrad(g, [[0, '#fff6d8', 0.32], [0.6, '#fff6d8', 0], [1, '#2a1a05', 0.28]], cx - r * 0.3, cy - r * 0.4, r * 1.4) }, g);
    el('circle', { cx, cy, r: r * 0.93, fill: 'none', stroke: '#fbf0d2', 'stroke-width': r * 0.035, 'stroke-opacity': 0.9 }, g);
    el('circle', { cx, cy, r: r * 0.86, fill: 'none', stroke: '#fbf0d2', 'stroke-width': r * 0.012, 'stroke-opacity': 0.7 }, g);
    el('circle', { cx, cy, r: r * 0.36, fill: 'none', stroke: '#fbf0d2', 'stroke-width': r * 0.012, 'stroke-opacity': 0.6 }, g);
    // lubang poros
    el('circle', { cx, cy, r: r * 0.085, fill: '#17120f' }, g);
    el('circle', { cx: cx - r * 0.012, cy: cy - r * 0.015, r: r * 0.06, fill: radGrad(g, [[0, '#ffffff'], [0.6, '#bdb8b0'], [1, '#5d5852']], cx - r * 0.03, cy - r * 0.03, r * 0.09) }, g);
  }
  const LABEL_A = ['#8f2c1c', '#c0492c', '#e07a48'];
  const LABEL_B = ['#174743', '#2a6b63', '#4f9a86'];

  /* ───────────── pemutar piringan (dilihat dari atas), tanpa lengan jarum ───────────── */
  const DW = 700, DH = 570, PX = 20, PY = 16, PW = 640, PH = 500;
  const PC = { x: PX + 250, y: PY + 250 }, PR = 215;
  const PIV = { x: PX + 540, y: PY + 120 };

  function deck(g, R) {
    el('path', { d: rrect(PX + 14, PY + 24, PW, PH, 28), fill: WARM, opacity: 0.46, filter: 'url(#softer)' }, g);
    const wood = ['#56311a', '#7b4a2a', '#a2693d'];
    const body = rrect(PX, PY, PW, PH, 26);
    shape(g, body, [PX - 40, PY, PW + 80, PH], wood, R, { n: 320, dir: [1, 0.015], width: [4, 13], len: [90, 300], filter: 'impastoH', base: linGrad(g, [[0, '#8a5632'], [1, '#6a3f23']], 0, PY, 0, PY + PH), cast: 'cast' });
    // serat kayu
    const id = F.uid('p');
    const cp = el('clipPath', { id }, g);
    el('path', { d: body }, cp);
    const grain = el('g', { 'clip-path': `url(#${id})`, fill: 'none', 'stroke-linecap': 'round' }, g);
    for (let i = 0; i < 34; i++) {
      const y = PY + 8 + R() * (PH - 16), amp = (R() - 0.5) * 12;
      el('path', { d: `M${PX - 10},${y}C${PX + PW * 0.3},${y + amp} ${PX + PW * 0.7},${y - amp} ${PX + PW + 10},${y + amp * 0.4}`, stroke: R() < 0.6 ? '#40230f' : '#c08a58', 'stroke-width': 0.8 + R() * 1.6, 'stroke-opacity': 0.14 + R() * 0.2 }, grain);
    }
    // tepi atas terang, tepi bawah teduh
    el('path', { d: rrect(PX + 2, PY + 2, PW - 4, PH - 4, 24), fill: 'none', stroke: '#e0ad78', 'stroke-width': 2.4, 'stroke-opacity': 0.5 }, g);
    el('path', { d: rrect(PX + 5, PY + 6, PW - 8, PH - 8, 22), fill: 'none', stroke: '#2e170a', 'stroke-width': 3, 'stroke-opacity': 0.25 }, g);
    el('path', { d: body, fill: radGrad(g, [[0, '#fff1cf', 0.2], [0.5, '#fff1cf', 0], [1, WARM, 0.3]], PX + 140, PY + 100, 700) }, g);

    // piringan putar: bayangan, gelang aluminium bertitik strobo, alas karet
    el('circle', { cx: PC.x + 7, cy: PC.y + 10, r: PR + 3, fill: '#1c0e06', opacity: 0.5, filter: 'url(#soft)' }, g);
    roundMetal(g, PC.x, PC.y, PR, PR - 17, R, { n: 150 });
    const strobe = el('g', { fill: '#2b2622', opacity: 0.6 }, g);
    for (let i = 0; i < 96; i++) {
      const [sx, sy] = pol(PC.x, PC.y, PR - 8, (i / 96) * 360);
      el('rect', { x: sx - 1.8, y: sy - 4, width: 3.6, height: 8, rx: 1, transform: `rotate(${(i / 96) * 360 + 90} ${sx} ${sy})` }, strobe);
    }
    el('circle', { cx: PC.x, cy: PC.y, r: PR - 17, fill: 'none', stroke: '#35312d', 'stroke-width': 2, 'stroke-opacity': 0.7 }, g);
    const mat = ['#151312', '#201d1b', '#35312e'];
    shape(g, circ(PC.x, PC.y, PR - 18), [PC.x - PR, PC.y - PR, PR * 2, PR * 2], mat, R, { n: 90, dir: [1, 0.3], width: [10, 24], len: [30, 90], filter: '' });
    for (const r of [60, 100, 140, 178]) el('circle', { cx: PC.x, cy: PC.y, r, fill: 'none', stroke: '#fff', 'stroke-width': 1.2, 'stroke-opacity': 0.06 }, g);
    el('circle', { cx: PC.x, cy: PC.y, r: PR - 18, fill: radGrad(g, [[0, '#fff', 0.1], [0.6, '#fff', 0], [1, '#000', 0.25]], PC.x - 70, PC.y - 90, PR * 1.4) }, g);
    roundMetal(g, PC.x, PC.y, 8, 0, R, { n: 6, cast: 'cast' });

    // dudukan lengan jarum
    el('circle', { cx: PIV.x + 5, cy: PIV.y + 8, r: 52, fill: '#1c0e06', opacity: 0.45, filter: 'url(#soft)' }, g);
    roundMetal(g, PIV.x, PIV.y, 50, 0, R, { n: 60, stops: [[0, '#4a4641'], [0.2, '#6d6862'], [0.5, '#3a3632'], [0.8, '#24211f'], [1, '#141211']] });
    roundMetal(g, PIV.x, PIV.y, 50, 43, R, { n: 40 });
    el('circle', { cx: PIV.x, cy: PIV.y, r: 30, fill: 'none', stroke: '#8f8a83', 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, g);
    // sandaran lengan
    const rx = PIV.x + 6, ry = PIV.y + 268;
    el('circle', { cx: rx + 3, cy: ry + 5, r: 15, fill: '#1c0e06', opacity: 0.45, filter: 'url(#blur2)' }, g);
    roundMetal(g, rx, ry, 14, 0, R, { n: 10 });
    el('path', { d: `M${rx - 9},${ry - 5}v8a9,9 0 0 0 18,0v-8`, fill: 'none', stroke: '#24211f', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);

    // tombol putar, sakelar 33/45, lampu kecil
    const kx = PX + 54, ky = PY + 452;
    el('circle', { cx: kx + 3, cy: ky + 5, r: 22, fill: '#1c0e06', opacity: 0.45, filter: 'url(#blur2)' }, g);
    roundMetal(g, kx, ky, 21, 0, R, { n: 20, stops: BRASS });
    el('circle', { cx: kx, cy: ky, r: 13, fill: 'none', stroke: '#6e4b14', 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, g);
    el('path', { d: `M${kx},${ky - 17}v9`, stroke: '#47300b', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    el('path', { d: rrect(kx + 34, ky - 11, 46, 22, 11), fill: '#24130a', opacity: 0.75 }, g);
    roundMetal(g, kx + 46, ky, 9, 0, R, { n: 6, stops: BRASS, cast: 'cast' });
    el('circle', { cx: kx, cy: ky - 42, r: 9, fill: '#ff6a3c', opacity: 0.5, filter: 'url(#blur2)' }, g);
    el('circle', { cx: kx, cy: ky - 42, r: 4.6, fill: radGrad(g, [[0, '#fff3c0'], [0.5, '#ff7a45'], [1, '#b02a12']], kx - 1, ky - 43, 5) }, g);
    // pelat merek kuningan di sudut kanan-bawah (sudut kanan-atas tertutup pemberat lengan)
    const bx = PX + PW - 60, by = PY + PH - 44;
    painted(g, rrect(bx, by, 44, 26, 5), { base: linGrad(g, BRASS, bx, by, bx + 44, by + 26), n: 8, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${bx + R() * 44},${by + R() * 26}h${8 + R() * 14}`, color: jitter('#c99a3e', 6, R), width: 2 + R() * 2, opacity: 0.2 }) });
    mark(g, bx + 22, by + 15, 0.5, '#6e4b14', 0.8);
  }

  /* ───────────── lengan jarum: poros di (AX, AY), jarum ±330 di bawahnya ───────────── */
  const AW = 180, AH = 480, AX = 90, AY = 100;
  function arm(g, R) {
    const x = AX, y = AY;
    const tubeStops = [[0, '#6b665f'], [0.22, '#dedad2'], [0.42, '#ffffff'], [0.68, '#b8b3ab'], [1, '#57524c']];
    const tubeGrad = (x0, x1) => linGrad(g, tubeStops, x0, 0, x1, 0);
    const vstroke = (x0, w, y0, h, cols) => () => ({ d: `M${x0 + R() * w},${y0 + R() * h}v${10 + R() * 30}`, color: jitter(cols[Math.floor(R() * cols.length)], 5, R), width: 1.5 + R() * 2.5, opacity: 0.18 + R() * 0.2 });
    // batang belakang + pemberat
    painted(g, rrect(x - 4, y - 44, 8, 46, 3), { base: tubeGrad(x - 4, x + 4), n: 6, R, filter: 'impastoFine', stroke: vstroke(x - 4, 8, y - 44, 40, ['#dedad2', '#8f8a83']) });
    const cw = rrect(x - 25, y - 92, 50, 58, 10);
    painted(g, cw, { base: linGrad(g, [[0, '#1c1a19'], [0.24, '#5f5a55'], [0.44, '#8d8882'], [0.7, '#3c3835'], [1, '#141211']], x - 25, 0, x + 25, 0), n: 24, R, filter: 'impastoFine', stroke: vstroke(x - 25, 50, y - 92, 50, ['#77726b', '#24211f', '#4a4641']) });
    for (let i = 0; i < 7; i++) el('path', { d: `M${x - 24},${y - 84 + i * 7}h48`, stroke: '#0c0b0a', 'stroke-width': 1.4, 'stroke-opacity': 0.4 }, g);
    // batang utama
    painted(g, rrect(x - 5, y - 4, 10, 286, 5), { base: tubeGrad(x - 5, x + 5), n: 20, R, filter: 'impastoFine', stroke: vstroke(x - 5, 10, y, 260, ['#ffffff', '#b8b3ab', '#8f8a83']) });
    // rumah poros
    roundMetal(g, x, y, 26, 0, R, { n: 30 });
    el('circle', { cx: x, cy: y, r: 16, fill: 'none', stroke: '#57524c', 'stroke-width': 1.4, 'stroke-opacity': 0.7 }, g);
    roundMetal(g, x, y, 8, 0, R, { n: 6, stops: [[0, '#5d5852'], [0.5, '#35312d'], [1, '#141211']] });
    // kepala jarum: menekuk ke dalam ±20°
    const hs = el('g', { transform: `translate(${x} ${y + 276}) rotate(20)` }, g);
    el('path', { d: 'M14,4q24,-6 34,10', fill: 'none', stroke: '#57524c', 'stroke-width': 6.4, 'stroke-linecap': 'round' }, hs);
    el('path', { d: 'M14,4q24,-6 34,10', fill: 'none', stroke: '#dedad2', 'stroke-width': 4, 'stroke-linecap': 'round' }, hs);
    painted(hs, 'M-10,-8H10L16,50H-16Z', { base: linGrad(g, tubeStops, -16, 0, 16, 0), n: 10, R, filter: 'impastoFine', stroke: () => ({ d: `M${-14 + R() * 28},${-6 + R() * 40}v${8 + R() * 14}`, color: jitter(R() < 0.5 ? '#ffffff' : '#8f8a83', 5, R), width: 2 + R() * 2, opacity: 0.2 }) });
    painted(hs, rrect(-13, 20, 26, 38, 4), { base: linGrad(g, [[0, '#7a1f14'], [0.3, '#d8482e'], [0.55, '#e86a48'], [1, '#6a1a10']], -13, 0, 13, 0), n: 10, R, filter: 'impastoFine', stroke: () => ({ d: `M${-12 + R() * 24},${22 + R() * 30}v${6 + R() * 10}`, color: jitter(R() < 0.5 ? '#f08a68' : '#8f2c1c', 5, R), width: 2 + R() * 2, opacity: 0.25 }) });
    el('path', { d: 'M-3,58L0,68L3,58Z', fill: '#17120f' }, hs);
    el('circle', { cx: -6, cy: 0, r: 2.2, fill: '#35312d' }, hs);
    el('circle', { cx: 6, cy: 0, r: 2.2, fill: '#35312d' }, hs);
  }

  /* ───────────── piringan hitam (hanya untuk sampul katalog; di situs dari DOM) ───────────── */
  function disc(g, R, cx, cy, r, cols) {
    el('circle', { cx: cx + 6, cy: cy + 9, r: r + 2, fill: '#1c0e06', opacity: 0.45, filter: 'url(#soft)' }, g);
    el('circle', { cx, cy, r, fill: '#100d0c' }, g);
    for (let rr = r * 0.38; rr < r * 0.97; rr += r * 0.022) el('circle', { cx, cy, r: rr, fill: 'none', stroke: '#fff', 'stroke-width': 0.7, 'stroke-opacity': 0.06 }, g);
    for (const f of [0.55, 0.74]) el('circle', { cx, cy, r: r * f, fill: 'none', stroke: '#fff', 'stroke-width': 1.6, 'stroke-opacity': 0.12 }, g);
    // kilap berbentuk dasi kupu-kupu
    const id = F.uid('s');
    const cp = el('clipPath', { id }, g);
    el('path', { d: ring(cx, cy, r * 0.98, r * 0.35) }, cp);
    const sh = el('g', { 'clip-path': `url(#${id})`, filter: 'url(#soft)' }, g);
    for (const a of [-58, 122]) {
      const [x1, y1] = pol(cx, cy, r * 1.1, a - 9), [x2, y2] = pol(cx, cy, r * 1.1, a + 9);
      el('path', { d: `M${cx},${cy}L${x1},${y1}L${x2},${y2}Z`, fill: '#fff', opacity: a < 0 ? 0.22 : 0.12 }, sh);
    }
    label(g, R, cx, cy, r * 0.33, cols);
  }

  /* ───────────── gumpalan debu (mini-game): bola bulu bertelinga kelinci; wajahnya dari DOM ───────────── */
  function dust(g, R, cx, cy, r) {
    const FUR = [[0, '#fbf6ea'], [0.35, '#e9dfcd'], [0.7, '#c9bca7'], [1, '#93856f']];
    const shadeAt = (x, y) => ((x - cx + (y - cy) * 1.15) / (r * 2.2) + 1) / 2;
    el('ellipse', { cx: cx + 5, cy: cy + r * 1.02, rx: r * 0.86, ry: r * 0.15, fill: '#1c0e06', opacity: 0.4, filter: 'url(#blur2)' }, g);
    // kaki mungil
    for (const sgn of [-1, 1]) {
      el('ellipse', { cx: cx + sgn * r * 0.34, cy: cy + r * 0.93, rx: r * 0.2, ry: r * 0.11, fill: '#6a5c4b' }, g);
      el('ellipse', { cx: cx + sgn * r * 0.34 - 2, cy: cy + r * 0.9, rx: r * 0.12, ry: r * 0.05, fill: '#8f816d', opacity: 0.8 }, g);
    }
    // telinga kelinci: satu tegak, satu sedikit terkulai
    const ear = (x, y, rot, len, w, bend) => {
      const e = el('g', { transform: `translate(${x} ${y}) rotate(${rot})` }, g);
      const d = `M${-w / 2},0C${-w * 0.62},${-len * 0.5} ${-w * 0.5 + bend},${-len} ${bend},${-len}C${w * 0.5 + bend},${-len} ${w * 0.62},${-len * 0.5} ${w / 2},0Z`;
      painted(e, d, {
        base: linGrad(g, [[0, '#cfc3ae'], [1, '#f1e9d9']], 0, 0, 0, -len), n: 26, R, filter: 'impastoFine', cast: 'cast',
        stroke: () => {
          const v = R(), t = (R() - 0.5) * w * 0.8;
          return { d: `M${t + bend * v},${-len * v}l${(R() - 0.5) * 4},${-8 - R() * 12}`, color: jitter(t > 0 ? '#b8ab95' : '#f6f0e3', 5, R), width: 3 + R() * 4, opacity: 0.4 + R() * 0.4 };
        },
      });
      el('path', { d: `M${-w * 0.2},${-len * 0.12}C${-w * 0.3},${-len * 0.5} ${-w * 0.2 + bend},${-len * 0.84} ${bend},${-len * 0.84}C${w * 0.2 + bend},${-len * 0.84} ${w * 0.3},${-len * 0.5} ${w * 0.2},${-len * 0.12}Z`, fill: '#eeb3a6', opacity: 0.85, filter: 'url(#blur2)' }, e);
    };
    ear(cx - r * 0.32, cy - r * 0.6, -13, r * 0.98, r * 0.4, -3);
    ear(cx + r * 0.3, cy - r * 0.62, 22, r * 0.86, r * 0.38, 9);
    // badan: tepi berjumbai dari gumpalan-gumpalan kecil
    let d = '';
    const n = 22;
    const pts = [];
    for (let i = 0; i < n; i++) pts.push(pol(cx, cy, r * (0.86 + R() * 0.07), (i / n) * 360));
    for (let i = 0; i < n; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n];
      const [mx, my] = pol(cx, cy, r * (1.0 + R() * 0.1), ((i + 0.5) / n) * 360);
      d += `${i ? '' : `M${x0},${y0}`}Q${mx},${my} ${x1},${y1}`;
    }
    d += 'Z';
    painted(g, d, {
      base: radGrad(g, [[0, '#fbf6ea'], [0.55, '#e3d8c5'], [1, '#a5977f']], cx - r * 0.35, cy - r * 0.4, r * 1.55), n: 260, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => {
        const a = R() * 360, r0 = r * Math.sqrt(R()) * 0.94, L = r * (0.1 + R() * 0.16);
        const [x0, y0] = pol(cx, cy, r0, a), [x1, y1] = pol(cx, cy, r0 + L, a + (R() - 0.5) * 50);
        return { d: `M${x0},${y0}Q${(x0 + x1) / 2 + (R() - 0.5) * 6},${(y0 + y1) / 2 + (R() - 0.5) * 6} ${x1},${y1}`, color: jitter(ramp(FUR, shadeAt(x0, y0) + (R() - 0.5) * 0.22), 4, R), width: r * (0.05 + R() * 0.06), opacity: 0.45 + R() * 0.4 };
      },
    });
    // bulu-bulu halus yang mencuat keluar
    const wisps = el('g', { fill: 'none', 'stroke-linecap': 'round' }, g);
    for (let i = 0; i < 34; i++) {
      const a = R() * 360, [x0, y0] = pol(cx, cy, r * 0.9, a), [x1, y1] = pol(cx, cy, r * (1.06 + R() * 0.12), a + (R() - 0.5) * 16);
      el('path', { d: `M${x0},${y0}L${x1},${y1}`, stroke: ramp(FUR, shadeAt(x0, y0)), 'stroke-width': 1.6 + R() * 1.8, 'stroke-opacity': 0.75 }, wisps);
    }
    // teduh di kanan-bawah, supaya bolanya terasa bulat
    el('path', { d, fill: radGrad(g, [[0, WARM, 0], [0.62, WARM, 0], [1, WARM, 0.34]], cx - r * 0.3, cy - r * 0.36, r * 1.5) }, g);
    // muka: bidang terang yang lembut supaya mata & pipinya terbaca
    el('ellipse', { cx, cy: cy + r * 0.06, rx: r * 0.62, ry: r * 0.5, fill: '#fdf9ef', opacity: 0.55, filter: 'url(#soft)' }, g);
    // jambul kecil di antara telinga
    for (const [dx, bend] of [[-5, -7], [3, 2], [10, 9]]) el('path', { d: `M${cx + dx},${cy - r * 0.9}q${bend * 0.4},${-r * 0.14} ${bend},${-r * 0.24}`, stroke: '#d8ccb8', 'stroke-width': r * 0.05, fill: 'none', 'stroke-linecap': 'round' }, g);
  }

  F.sprites['bg-vinyl'] = { w: W, h: H, seed: 551, scale: 1, draw(svg, R) { wall(svg, R); } };
  F.sprites['vinyl-sampul'] = { w: SW * K, h: SH * K, viewBox: `0 0 ${SW} ${SH}`, seed: 552, draw(svg, R) { sleeve(svg, R); } };
  F.sprites['vinyl-meja'] = { w: DW * K, h: DH * K, viewBox: `0 0 ${DW} ${DH}`, seed: 553, draw(svg, R) { deck(svg, R); } };
  F.sprites['vinyl-lengan'] = { w: AW * K, h: AH * K, viewBox: `0 0 ${AW} ${AH}`, seed: 554, draw(svg, R) { arm(svg, R); } };
  F.sprites['vinyl-label-a'] = { w: 132, h: 132, viewBox: '0 0 220 220', seed: 555, draw(svg, R) { label(svg, R, 110, 110, 108, LABEL_A); } };
  F.sprites['vinyl-label-b'] = { w: 132, h: 132, viewBox: '0 0 220 220', seed: 556, draw(svg, R) { label(svg, R, 110, 110, 108, LABEL_B); } };
  F.sprites['vinyl-stiker'] = { w: 100, h: 100, viewBox: '0 0 170 170', seed: 557, draw(svg, R) { seal(svg, R, 82, 80, 66); } };
  F.sprites['game-vinyl-debu'] = { w: 130, h: 124, viewBox: '0 0 210 200', seed: 558, draw(svg, R) { dust(svg, R, 105, 112, 66); } };

  F.sprites['cover-vinyl'] = { w: 480, h: 600, seed: 559, draw(svg, R) {
    wall(el('g', { transform: 'translate(0 -200) scale(0.6154)' }, svg), R, { deco: false });
    arcs(svg, R, -30, 640, 150, 40, ['#f8ecd0', '#2f6f6a', '#c8472d'], 0.9);
    // piringan menyembul dari sampul yang sedikit miring
    const s = 0.62;
    const grp = el('g', { transform: 'translate(22 150) rotate(-6 200 180)' }, svg);
    disc(grp, R, SX * s + S * s * 0.5 + 132, SY * s + S * s * 0.5, S * s * 0.47, LABEL_A);
    sleeve(el('g', { transform: `scale(${s})` }, grp), R, { lines: true });
    seal(grp, R, (SX + S - 70) * s, (SY + 66) * s, 34);
    // bunga & daun
    const fr = F.flora, gr = fr.GREEN;
    leaf(svg, { len: 150, w: 58, ...gr[0], R, n: 40, curve: -0.2, transform: 'translate(486 520) rotate(-56)' });
    leaf(svg, { len: 130, w: 52, ...gr[2], R, n: 40, transform: 'translate(410 616) rotate(-20)' });
    fr.flowers.kambojaPink(el('g', { transform: 'translate(430 546) rotate(-12)' }, svg), R, 0.44);
    fr.flowers.melati(el('g', { transform: 'translate(356 578) scale(0.5)' }, svg), R, 1);
    leaf(svg, { len: 130, w: 50, ...gr[1], R, n: 40, transform: 'translate(-8 100) rotate(62)' });
    fr.flowers.kamboja(el('g', { transform: 'translate(34 50) rotate(20)' }, svg), R, 0.36);
    fr.flowers.melati(el('g', { transform: 'translate(430 66) scale(0.46)' }, svg), R, 1);
    petal(el('g', { transform: 'translate(250 566) rotate(40) scale(0.3)', filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...fr.PAL.kambojaPink, cast: false });
  } };
})();
