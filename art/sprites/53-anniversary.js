/* Anniversary: jam saku kuningan di atas beludru hijau tua — badan jam dengan dial enamel berangka Romawi,
   tutup berukir (luar & dalam), punggung berukir, rantai, dan latar beludru bermotif kawung timbul.
   Jarum, tanggal, foto, dan semua tulisan dipasang dari DOM di atas lukisan ini. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf, petal, linGrad, radGrad } = F;
  const BRASS = { hi: '#fff4cc', light: '#f1d58a', base: '#c99a3e', mid: '#a87a26', dark: '#6e4b14', deep: '#47300b' };
  const INK = '#2a1b12';
  const W = 780, H = 1500;

  /** kanvas badan jam: lingkar badan berpusat di C, mahkota & gelang di atasnya */
  const CW = 600, CH = 730, C = { x: 280, y: 410 }, RO = 250, RB = 206;
  /** kanvas tutup (luar & dalam sama besar supaya pas saat dibalik): cakram berpusat di (LX, LY) */
  const LW = 600, LH = 600, LX = 280, LY = 270, LR = 250;

  const circ = (cx, cy, r, cw = true) => `M${cx - r},${cy}A${r},${r} 0 1 ${cw ? 1 : 0} ${cx + r},${cy}A${r},${r} 0 1 ${cw ? 1 : 0} ${cx - r},${cy}Z`;
  const ring = (cx, cy, r2, r1) => circ(cx, cy, r2, true) + circ(cx, cy, r1, false);
  const pol = (cx, cy, r, deg) => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r];
  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;

  /** terang di kiri-atas → gelap di kanan-bawah (lereng yang menghadap cahaya) */
  const LIT = [[0, BRASS.light], [0.16, BRASS.hi], [0.36, BRASS.light], [0.6, BRASS.base], [0.84, BRASS.mid], [1, BRASS.dark]];
  /** kebalikannya (lereng dalam / cekungan) */
  const SHY = [[0, BRASS.dark], [0.2, BRASS.mid], [0.46, BRASS.base], [0.7, BRASS.light], [0.88, BRASS.hi], [1, BRASS.light]];

  /**
   * Bidang logam melingkar (gelang atau cakram): gradien diagonal + sapuan halus searah lingkaran,
   * warnanya mengikuti posisi di sepanjang diagonal cahaya.
   */
  function roundMetal(g, cx, cy, r2, r1, R, { n = 120, stops = LIT, cast, width = [3, 8], filter = 'impastoFine', soft = 0 } = {}) {
    const d = r1 > 0 ? ring(cx, cy, r2, r1) : circ(cx, cy, r2);
    return painted(g, d, {
      base: linGrad(g, stops, cx - r2 * 0.72, cy - r2 * 0.72, cx + r2 * 0.72, cy + r2 * 0.72), n, R, filter, cast,
      stroke: () => {
        const a = R() * 360, r = r1 + Math.sqrt(R()) * (r2 - r1), span = 8 + R() * 22;
        const [x0, y0] = pol(cx, cy, r, a), [x1, y1] = pol(cx, cy, r, a + span);
        const t = ((x0 - cx + (y0 - cy)) / (r2 * 1.44) + 1) / 2;
        const col = mix(ramp(stops, t + (R() - 0.5) * 0.08), BRASS.base, soft);
        return { d: `M${x0},${y0}A${r},${r} 0 0 1 ${x1},${y1}`, color: jitter(col, 4, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.16 + R() * 0.24 };
      },
    });
  }

  /** garis ukir: gelap, dengan pantulan terang yang bergeser sedikit ke kanan-bawah */
  function engrave(g, d, { w = 1.6, o = 0.5, lo = 0.5, fill } = {}) {
    el('path', { d, fill: fill ? BRASS.hi : 'none', 'fill-opacity': fill ? 0.35 : undefined, stroke: '#fff4cc', 'stroke-width': w * 0.75, 'stroke-opacity': lo, 'stroke-linecap': 'round', transform: 'translate(0.9 1.1)' }, g);
    el('path', { d, fill: fill ? BRASS.deep : 'none', 'fill-opacity': fill ? 0.55 : undefined, stroke: BRASS.deep, 'stroke-width': w, 'stroke-opacity': o, 'stroke-linecap': 'round' }, g);
  }

  /** kamboja kecil lima kelopak (tanda floa), berpusat di (0,0) */
  const MARK = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
  function mark(g, x, y, s, { fill, engraved } = {}) {
    const m = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
    for (let i = 0; i < 5; i++) {
      const p = el('g', { transform: `rotate(${i * 72})` }, m);
      if (engraved) engrave(p, MARK, { w: 1.5 / s, o: 0.6 });
      else el('path', { d: MARK, fill }, p);
    }
    if (!engraved) el('circle', { r: 3.4, fill: mix(fill, '#fff4cc', 0.6) }, m);
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

  /* ───────────── angka Romawi dari goresan lurus (tanpa font) ───────────── */
  function roman(g, str, h) {
    const wOf = { I: h * 0.2, V: h * 0.56, X: h * 0.58 }, gap = h * 0.13;
    const total = [...str].reduce((a, ch) => a + wOf[ch], 0) + gap * (str.length - 1);
    const thick = h * 0.15, thin = h * 0.05, ser = h * 0.045, top = -h / 2, bot = h / 2;
    const line = (x1, y1, x2, y2, w) => el('path', { d: `M${x1},${y1}L${x2},${y2}`, stroke: INK, 'stroke-width': w, 'stroke-linecap': 'butt', fill: 'none' }, g);
    const serif = (x, y, half) => line(x - half, y, x + half, y, ser);
    let x = -total / 2;
    for (const ch of str) {
      const w = wOf[ch], cx = x + w / 2;
      if (ch === 'I') {
        line(cx, top, cx, bot, thick);
        serif(cx, top + ser / 2, thick * 1.15);
        serif(cx, bot - ser / 2, thick * 1.15);
      } else if (ch === 'V') {
        line(x + thick * 0.5, top, cx, bot, thick);
        line(x + w - thin, top, cx, bot, thin);
        serif(x + thick * 0.5, top + ser / 2, thick * 1.05);
        serif(x + w - thin, top + ser / 2, thick * 0.8);
      } else {
        line(x + thick * 0.5, top, x + w - thick * 0.5, bot, thick);
        line(x + w - thin, top, x + thin, bot, thin);
        serif(x + thick * 0.5, top + ser / 2, thick * 1.05);
        serif(x + w - thin, top + ser / 2, thick * 0.8);
        serif(x + thin, bot - ser / 2, thick * 0.8);
        serif(x + w - thick * 0.5, bot - ser / 2, thick * 1.05);
      }
      x += w + gap;
    }
  }
  const NUMERALS = ['I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  /* ───────────── mahkota & gelang gantung di puncak badan jam ───────────── */
  function crown(g, R) {
    const x = C.x, top = C.y - RO;
    // gelang (bow): tempat rantai dikaitkan
    roundMetal(g, x, top - 96, 50, 34, R, { n: 46, cast: 'cast', width: [3, 6] });
    el('path', { d: `M${x - 39},${top - 84}A42,42 0 0 1 ${x - 8},${top - 137}`, fill: 'none', stroke: '#fffaf0', 'stroke-width': 3, 'stroke-opacity': 0.75, 'stroke-linecap': 'round' }, g);
    // leher
    const neck = rrect(x - 17, top - 26, 34, 40, 5);
    painted(g, neck, { base: linGrad(g, [[0, BRASS.dark], [0.3, BRASS.light], [0.5, BRASS.hi], [0.75, BRASS.base], [1, BRASS.deep]], x - 17, 0, x + 17, 0), n: 14, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${x - 17 + R() * 34},${top - 26}v40`, color: jitter(BRASS.base, 6, R), width: 2 + R() * 3, opacity: 0.2 }) });
    // kenop mahkota beralur
    const knob = `M${x - 34},${top - 22}Q${x - 44},${top - 44} ${x - 30},${top - 62}Q${x},${top - 74} ${x + 30},${top - 62}Q${x + 44},${top - 44} ${x + 34},${top - 22}Q${x},${top - 14} ${x - 34},${top - 22}Z`;
    painted(g, knob, { base: linGrad(g, [[0, BRASS.dark], [0.18, BRASS.base], [0.36, BRASS.hi], [0.52, BRASS.light], [0.78, BRASS.mid], [1, BRASS.deep]], x - 42, 0, x + 42, 0), n: 30, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${x - 40 + R() * 80},${top - 70}v54`, color: jitter(R() < 0.5 ? BRASS.light : BRASS.mid, 6, R), width: 2 + R() * 4, opacity: 0.22 }) });
    for (let i = -5; i <= 5; i++) {
      const fx = x + i * 6.6, bend = i * 1.3;
      el('path', { d: `M${fx - bend * 0.4},${top - 64 + Math.abs(i) * 1.2}Q${fx + bend},${top - 42} ${fx - bend * 0.2},${top - 21 - Math.abs(i) * 0.4}`, fill: 'none', stroke: BRASS.deep, 'stroke-width': 2, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, g);
      el('path', { d: `M${fx - bend * 0.4 + 2},${top - 63 + Math.abs(i) * 1.2}Q${fx + bend + 2},${top - 42} ${fx - bend * 0.2 + 2},${top - 22 - Math.abs(i) * 0.4}`, fill: 'none', stroke: '#fff4cc', 'stroke-width': 1, 'stroke-opacity': 0.45, 'stroke-linecap': 'round' }, g);
    }
  }

  /** gelang badan jam: lereng luar cembung + lereng dalam, tepi bergerigi halus */
  function bezel(g, R) {
    const { x, y } = C;
    roundMetal(g, x, y, RO, 228, R, { n: 150, cast: 'castBig' });
    roundMetal(g, x, y, 229, RB, R, { n: 130, stops: SHY });
    // puncak gelang: kilap di kiri-atas, garis teduh di kanan-bawah
    el('path', { d: `M${pol(x, y, 229, 168).join(',')}A229,229 0 0 1 ${pol(x, y, 229, 282).join(',')}`, fill: 'none', stroke: '#fffaf0', 'stroke-width': 3, 'stroke-opacity': 0.8, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
    el('path', { d: `M${pol(x, y, 229, -8).join(',')}A229,229 0 0 1 ${pol(x, y, 229, 104).join(',')}`, fill: 'none', stroke: BRASS.deep, 'stroke-width': 2.4, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, g);
    // gerigi halus di tepi luar
    const reed = el('g', { stroke: BRASS.deep, 'stroke-width': 1.5, 'stroke-opacity': 0.3 }, g);
    for (let i = 0; i < 150; i++) {
      const a = (i / 150) * 360, [x0, y0] = pol(x, y, 241, a), [x1, y1] = pol(x, y, 249, a);
      el('path', { d: `M${x0},${y0}L${x1},${y1}` }, reed);
    }
    el('circle', { cx: x, cy: y, r: RB, fill: 'none', stroke: BRASS.deep, 'stroke-width': 2.6, 'stroke-opacity': 0.7 }, g);
  }

  /** dial enamel krem: rel menit, angka Romawi, guilloche di tengah, jendela tanggal di bawah */
  function dial(g, R, { heart = false } = {}) {
    const { x, y } = C;
    const cream = [[0, '#fffdf6'], [0.6, '#fbf2dc'], [1, '#ecdcb8']];
    painted(g, circ(x, y, RB), {
      base: radGrad(g, cream, x - 40, y - 50, RB * 1.2), n: 120, R, filter: 'impastoFine',
      stroke: () => {
        const a = R() * 360, r = Math.sqrt(R()) * RB, [sx, sy] = pol(x, y, r, a), L = 20 + R() * 46;
        return { d: `M${sx},${sy}l${L},${(R() - 0.5) * 10}`, color: jitter(ramp(cream, r / RB + (R() - 0.5) * 0.2), 4, R), width: 6 + R() * 12, opacity: 0.25 + R() * 0.3 };
      },
    });
    // guilloche: sinar halus di tengah dial
    const gl = el('g', { stroke: '#b9975c', 'stroke-width': 1, 'stroke-opacity': 0.26 }, g);
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * 360, [x0, y0] = pol(x, y, 22, a), [x1, y1] = pol(x, y, 110, a + (i % 2 ? 2.4 : -2.4));
      el('path', { d: `M${x0},${y0}L${x1},${y1}` }, gl);
    }
    for (const r of [112, 118]) el('circle', { cx: x, cy: y, r, fill: 'none', stroke: '#b98a2e', 'stroke-width': r === 112 ? 1.8 : 0.9, 'stroke-opacity': 0.7 }, g);
    // rel menit
    for (const r of [172, 198]) el('circle', { cx: x, cy: y, r, fill: 'none', stroke: INK, 'stroke-width': 1.5, 'stroke-opacity': 0.75 }, g);
    for (let i = 0; i < 60; i++) {
      const a = i * 6 - 90, five = i % 5 === 0, [x0, y0] = pol(x, y, five ? 174 : 178, a), [x1, y1] = pol(x, y, 196, a);
      el('path', { d: `M${x0},${y0}L${x1},${y1}`, stroke: INK, 'stroke-width': five ? 4 : 1.4, 'stroke-opacity': five ? 0.9 : 0.7 }, g);
    }
    // angka Romawi, menghadap ke luar
    NUMERALS.forEach((n, i) => {
      const a = (i + 1) * 30, [nx, ny] = pol(x, y, 144, a - 90);
      roman(el('g', { transform: `translate(${nx} ${ny}) rotate(${a})` }, g), n, 40);
    });
    // tanda kamboja kecil di bawah XII
    mark(g, x, y - 58, 1.05, { fill: '#b98a2e' });
    // jendela tanggal di atas VI
    const wx = x - 32, wy = y + 50, ww = 64, wh = 44;
    el('path', { d: rrect(wx - 4, wy - 4, ww + 8, wh + 8, 9), fill: linGrad(g, [[0, BRASS.light], [0.5, BRASS.base], [1, BRASS.dark]], wx, wy, wx + ww, wy + wh), stroke: BRASS.deep, 'stroke-width': 1.4, 'stroke-opacity': 0.7 }, g);
    el('path', { d: rrect(wx, wy, ww, wh, 6), fill: linGrad(g, [[0, '#e9dcc0'], [0.3, '#fffdf6'], [1, '#fffaf0']], 0, wy, 0, wy + wh), stroke: '#4a3210', 'stroke-width': 1.2, 'stroke-opacity': 0.6 }, g);
    if (heart) el('path', { d: 'M0,7C-13,-3 -7,-13 0,-6C7,-13 13,-3 0,7Z', fill: '#c8372d', transform: `translate(${x} ${wy + wh / 2 + 2}) scale(1.25)` }, g);
    // bayangan gelang yang jatuh ke dial (cahaya dari kiri-atas)
    const id = F.uid('d');
    const cp = el('clipPath', { id }, g);
    el('path', { d: circ(x, y, RB) }, cp);
    const sh = el('g', { 'clip-path': `url(#${id})` }, g);
    el('circle', { cx: x + 7, cy: y + 9, r: RB + 4, fill: 'none', stroke: '#3a2410', 'stroke-width': 22, 'stroke-opacity': 0.3, filter: 'url(#soft)' }, sh);
  }

  /** jarum baja biru + sumbu kuningan (hanya untuk sampul katalog; di situs jarumnya dari DOM) */
  function hands(g, hourDeg, minDeg, secDeg) {
    const { x, y } = C;
    const steel = linGrad(g, [[0, '#4a72ad'], [0.5, '#27456e'], [1, '#10203c']], -8, 0, 8, 0);
    const hand = (deg, len, w, eye) => {
      const h = el('g', { transform: `translate(${x} ${y}) rotate(${deg})`, filter: 'url(#cast)' }, g);
      // batang meruncing → mata (cincin) → ujung runcing, gaya Breguet
      el('path', { d: `M${-w},20L${-w * 0.45},${-eye + 12}L${w * 0.45},${-eye + 12}L${w},20Z`, fill: steel }, h);
      el('circle', { cx: 0, cy: -eye, r: 12, fill: 'none', stroke: steel, 'stroke-width': 4.6 }, h);
      el('path', { d: `M-2.6,${-eye - 12}L0,${-len}L2.6,${-eye - 12}Z`, fill: steel, stroke: steel, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, h);
    };
    hand(hourDeg, 112, 6, 74);
    hand(minDeg, 168, 4.6, 112);
    const s = el('g', { transform: `translate(${x} ${y}) rotate(${secDeg})`, filter: 'url(#cast)' }, g);
    el('path', { d: 'M0,44L0,-184', stroke: '#c8372d', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, s);
    el('circle', { cx: 0, cy: 34, r: 7, fill: '#c8372d' }, s);
    el('circle', { cx: x, cy: y, r: 11, fill: radGrad(g, [[0, BRASS.hi], [0.6, BRASS.base], [1, BRASS.dark]], x - 3, y - 4, 13), stroke: BRASS.deep, 'stroke-width': 1, 'stroke-opacity': 0.6 }, g);
  }

  /** bayangan jam di atas beludru */
  const shadow = (g, cx, cy, r) => el('ellipse', { cx: cx + 16, cy: cy + 24, rx: r + 4, ry: r + 2, fill: '#04110c', opacity: 0.6, filter: 'url(#softer)' }, g);

  function watchFront(g, R, opts) {
    shadow(g, C.x, C.y, RO);
    crown(g, R);
    dial(g, R, opts);
    bezel(g, R);
  }

  /** punggung jam: pelat kuningan disikat melingkar dengan bingkai ukiran; tulisan ukirnya dari DOM */
  function watchBack(g, R) {
    const { x, y } = C;
    shadow(g, x, y, RO);
    crown(g, R);
    roundMetal(g, x, y, RB + 2, 0, R, { n: 260, soft: 0.45, width: [2, 5] });
    el('circle', { cx: x, cy: y, r: RB, fill: radGrad(g, [[0, '#fff6d8', 0.5], [0.55, '#fff6d8', 0], [1, '#2a1a05', 0.3]], x - 70, y - 90, RB * 1.5) }, g);
    engrave(g, circ(x, y, 186), { w: 2.2 });
    engrave(g, circ(x, y, 176), { w: 1.1, o: 0.4 });
    for (let i = 0; i < 72; i++) {
      const [dx, dy] = pol(x, y, 181, i * 5);
      el('circle', { cx: dx, cy: dy, r: 1.5, fill: BRASS.deep, opacity: 0.45 }, g);
    }
    // kamboja ukir di atas & bawah, sulur kecil di kiri-kanan
    mark(g, x, y - 132, 1.25, { engraved: true });
    mark(g, x, y + 150, 1.25, { engraved: true });
    for (const sgn of [-1, 1]) {
      engrave(g, `M${x + sgn * 26},${y - 141}q${sgn * 26},-8 ${sgn * 48},6q${sgn * -10},-14 ${sgn * -26},-10`, { w: 1.4, o: 0.45 });
      engrave(g, `M${x + sgn * 26},${y + 141}q${sgn * 26},8 ${sgn * 48},-6q${sgn * -10},14 ${sgn * -26},10`, { w: 1.4, o: 0.45 });
    }
    bezel(g, R);
  }

  /** engsel kecil; (0,0) = tengah engsel */
  function hinge(g, R) {
    const d = rrect(-36, -9, 72, 18, 8);
    painted(g, d, { base: linGrad(g, [[0, BRASS.light], [0.35, BRASS.hi], [0.6, BRASS.base], [1, BRASS.deep]], 0, -9, 0, 9), n: 12, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${-36 + R() * 72},${-9 + R() * 18}h${10 + R() * 20}`, color: jitter(BRASS.base, 6, R), width: 2 + R() * 2, opacity: 0.2 }) });
    for (const hx of [-13, 13]) el('path', { d: `M${hx},-9v18`, stroke: BRASS.deep, 'stroke-width': 1.6, 'stroke-opacity': 0.55 }, g);
  }

  /** tutup dari luar: ukiran roset di sekeliling medali polos (inisial ditulis dari DOM) */
  function lidOuter(g, R) {
    const cx = LX, cy = LY;
    roundMetal(g, cx, cy, 230, 0, R, { n: 240, soft: 0.25, width: [3, 7] });
    el('circle', { cx, cy, r: 230, fill: radGrad(g, [[0, '#fff6d8', 0.5], [0.5, '#fff6d8', 0], [1, '#2a1a05', 0.34]], cx - 90, cy - 110, 380) }, g);
    // roset: lingkaran-lingkaran yang saling tumpang, hanya terlihat di gelang antara medali dan tepi
    const id = F.uid('r');
    const cp = el('clipPath', { id }, g);
    el('path', { d: ring(cx, cy, 222, 104) }, cp);
    const ro = el('g', { 'clip-path': `url(#${id})` }, g);
    for (let i = 0; i < 44; i++) {
      const [x0, y0] = pol(cx, cy, 148, (i / 44) * 360);
      el('circle', { cx: x0 + 0.9, cy: y0 + 1.1, r: 80, fill: 'none', stroke: '#fff4cc', 'stroke-width': 0.9, 'stroke-opacity': 0.4 }, ro);
      el('circle', { cx: x0, cy: y0, r: 80, fill: 'none', stroke: BRASS.deep, 'stroke-width': 1.3, 'stroke-opacity': 0.36 }, ro);
    }
    // medali tengah yang dipoles
    roundMetal(g, cx, cy, 100, 0, R, { n: 50, soft: 0.5, width: [3, 7] });
    el('circle', { cx, cy, r: 100, fill: radGrad(g, [[0, '#fffbe6', 0.6], [0.6, '#fffbe6', 0.05], [1, '#3a2508', 0.25]], cx - 34, cy - 42, 150) }, g);
    engrave(g, circ(cx, cy, 100), { w: 2.4, o: 0.6 });
    engrave(g, circ(cx, cy, 91), { w: 1.1, o: 0.4 });
    for (let i = 0; i < 48; i++) {
      const [dx, dy] = pol(cx, cy, 108, i * 7.5);
      el('circle', { cx: dx, cy: dy, r: 1.9, fill: BRASS.deep, opacity: 0.5 }, g);
    }
    engrave(g, circ(cx, cy, 224), { w: 1.6, o: 0.5 });
    // tepi cembung
    roundMetal(g, cx, cy, LR, 240, R, { n: 110 });
    roundMetal(g, cx, cy, 241, 229, R, { n: 80, stops: SHY });
    el('path', { d: `M${pol(cx, cy, 240, 170).join(',')}A240,240 0 0 1 ${pol(cx, cy, 240, 280).join(',')}`, fill: 'none', stroke: '#fffaf0', 'stroke-width': 2.6, 'stroke-opacity': 0.75, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
  }

  /** tutup dari dalam: gelang kuningan + sisipan kertas krem tempat foto dan tulisan (dari DOM) */
  function lidInner(g, R, { bare = false } = {}) {
    const cx = LX, cy = LY;
    if (!bare) shadow(g, cx, cy, LR);
    roundMetal(g, cx, cy, LR, 236, R, { n: 110, cast: bare ? undefined : 'castBig' });
    roundMetal(g, cx, cy, 237, 214, R, { n: 110, stops: SHY });
    el('path', { d: `M${pol(cx, cy, 237, 168).join(',')}A237,237 0 0 1 ${pol(cx, cy, 237, 282).join(',')}`, fill: 'none', stroke: '#fffaf0', 'stroke-width': 2.6, 'stroke-opacity': 0.75, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
    const cream = [[0, '#fffdf6'], [0.65, '#faf0d9'], [1, '#ead9b4']];
    painted(g, circ(cx, cy, 214), {
      base: radGrad(g, cream, cx + 30, cy + 40, 260), n: 110, R, filter: 'impastoFine',
      stroke: () => {
        const a = R() * 360, r = Math.sqrt(R()) * 214, [sx, sy] = pol(cx, cy, r, a), L = 20 + R() * 50;
        return { d: `M${sx},${sy}l${L},${(R() - 0.5) * 10}`, color: jitter(ramp(cream, r / 214 + (R() - 0.5) * 0.2), 4, R), width: 6 + R() * 12, opacity: 0.25 + R() * 0.3 };
      },
    });
    el('circle', { cx, cy, r: 214, fill: 'none', stroke: BRASS.deep, 'stroke-width': 2.4, 'stroke-opacity': 0.7 }, g);
    // sisipan sedikit cekung: bayangan di tepi kiri-atas
    const id = F.uid('i');
    const cp = el('clipPath', { id }, g);
    el('path', { d: circ(cx, cy, 214) }, cp);
    const sh = el('g', { 'clip-path': `url(#${id})` }, g);
    el('circle', { cx: cx + 7, cy: cy + 9, r: 218, fill: 'none', stroke: '#3a2410', 'stroke-width': 22, 'stroke-opacity': 0.26, filter: 'url(#soft)' }, sh);
    if (!bare) hinge(el('g', { transform: `translate(${cx} ${cy - LR - 1})` }, g), R);
  }

  /** rantai: mata rantai bergantian sepanjang kurva dari gelang jam ke luar bingkai */
  function chain(g, R, pts, n, s = 1) {
    const [p0, p1, p2, p3] = pts;
    const at = (t) => {
      const u = 1 - t;
      return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
    };
    const sh = el('g', { filter: 'url(#soft)', opacity: 0.55, transform: `translate(${7 * s} ${10 * s})` }, g);
    const links = el('g', {}, g);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), [x, y] = at(t), [x2, y2] = at(Math.min(1, t + 0.01));
      const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      const flat = i % 2 === 0, rx = (flat ? 12 : 10) * s, ry = (flat ? 7 : 3.2) * s;
      const tf = `translate(${x} ${y}) rotate(${ang})`;
      el('ellipse', { rx, ry, fill: 'none', stroke: '#04110c', 'stroke-width': 4.4 * s, transform: tf }, sh);
      el('ellipse', { rx, ry, fill: 'none', stroke: BRASS.deep, 'stroke-width': 5 * s, transform: tf }, links);
      el('ellipse', { rx, ry, fill: 'none', stroke: flat ? BRASS.base : BRASS.mid, 'stroke-width': 3.4 * s, transform: tf }, links);
      el('path', { d: `M${-rx * 0.8},${-ry * 0.5}Q0,${-ry * 1.25} ${rx * 0.8},${-ry * 0.5}`, fill: 'none', stroke: BRASS.hi, 'stroke-width': 1.3 * s, 'stroke-opacity': 0.85, 'stroke-linecap': 'round', transform: tf }, links);
    }
  }

  /* ───────────── latar: beludru hijau tua dengan kawung timbul, bunga di sudut ───────────── */
  function velvet(svg, R, { flowers = true } = {}) {
    const tone = [[0, '#2a6351'], [0.4, '#1c4538'], [0.75, '#143229'], [1, '#0b1e18']];
    wash(svg, {
      x: -40, y: -30, w: W + 80, h: H + 60, R, n: 560, angle: 74, len: [0.08, 0.2], width: [26, 64], opacity: [0.25, 0.6],
      base: radGrad(svg, tone, W * 0.46, H * 0.4, H * 0.78),
      color: (u, v) => ramp(tone, Math.hypot(u - 0.46, (v - 0.4) * 1.5) * 1.3),
    });
    // bulu beludru: bercak yang tersisir terang dan gelap
    dabs(svg, { n: 70, R, filter: 'softer', place: (i, R2) => ({ x: R2() * W, y: R2() * H, rx: 50 + R2() * 120, ry: 26 + R2() * 60, rot: 60 + R2() * 30, color: R2() < 0.5 ? '#3f8a70' : '#07130f', opacity: 0.1 + R2() * 0.1 }) });
    el('rect', { x: 0, y: 0, width: W, height: H, fill: kawung(svg, '#4fa385', 78, 1.5), opacity: 0.13 }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: kawung(svg, '#020a07', 78, 1.5), opacity: 0.16, transform: 'translate(1.6 2)' }, svg);
    // cahaya hangat di tempat jamnya terletak
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#ffe9b0', 0.13], [0.5, '#ffe9b0', 0.05], [1, '#ffe9b0', 0]], W * 0.47, H * 0.42, 620) }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: radGrad(svg, [[0, '#000', 0], [0.55, '#000', 0], [1, '#020a07', 0.62]], W / 2, H * 0.46, H * 0.74) }, svg);
    if (!flowers) return;
    const fr = F.flora, gr = fr.GREEN;
    const lf = (x, y, rot, len, w, k, curve = 0.15) => leaf(svg, { len, w, ...gr[k], R, n: 46, curve, transform: `translate(${x} ${y}) rotate(${rot})` });
    // kiri-atas: kamboja merah muda yang menyembul dari tepi
    lf(-10, 150, 62, 250, 96, 1);
    lf(60, -20, 128, 220, 86, 0, -0.18);
    fr.flowers.kambojaPink(el('g', { transform: 'translate(34 62) rotate(18)' }, svg), R, 0.62);
    // kanan-bawah: kamboja putih, daun, dan melati
    lf(W + 10, H - 190, -50, 270, 100, 0, -0.2);
    lf(W - 120, H + 20, -16, 210, 88, 2);
    lf(W - 10, H - 40, -82, 180, 76, 3, 0.2);
    fr.flowers.kamboja(el('g', { transform: `translate(${W - 44} ${H - 84}) rotate(-12)` }, svg), R, 0.62);
    fr.flowers.melati(el('g', { transform: `translate(${W - 168} ${H - 36}) scale(0.8)` }, svg), R, 1);
    fr.flowers.melati(el('g', { transform: `translate(${W - 30} ${H - 236}) scale(0.66)` }, svg), R, 1);
    // kiri-bawah: seuntai melati dan kelopak lepas
    lf(-14, H - 96, 74, 180, 74, 2, 0.18);
    fr.flowers.melati(el('g', { transform: `translate(52 ${H - 62}) scale(0.9)` }, svg), R, 1);
    fr.flowers.melati(el('g', { transform: `translate(128 ${H - 22}) scale(0.66)` }, svg), R, 1);
    [[196, H - 60, 40, 0.38, 'kambojaPink'], [W - 236, H - 110, -70, 0.32, 'kamboja'], [120, 300, 110, 0.3, 'kambojaPink']].forEach(([x, y, rot, s, pal]) =>
      petal(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...fr.PAL[pal], cast: false }));
  }

  /** benda-benda digambar di kanvas besar (koordinat di atas), dirender 0,6× supaya berkasnya ringan */
  const K = 0.6;
  F.sprites['bg-anniversary'] = { w: W, h: H, seed: 531, scale: 1, draw(svg, R) { velvet(svg, R); } };
  F.sprites['anniversary-jam'] = { w: CW * K, h: CH * K, viewBox: `0 0 ${CW} ${CH}`, seed: 532, draw(svg, R) { watchFront(svg, R); } };
  F.sprites['anniversary-punggung'] = { w: CW * K, h: CH * K, viewBox: `0 0 ${CW} ${CH}`, seed: 533, draw(svg, R) { watchBack(svg, R); } };
  F.sprites['anniversary-tutup'] = { w: LW * K, h: LH * K, viewBox: `0 0 ${LW} ${LH}`, seed: 534, draw(svg, R) { lidOuter(svg, R); } };
  F.sprites['anniversary-tutup-dalam'] = { w: LW * K, h: LH * K, viewBox: `0 0 ${LW} ${LH}`, seed: 536, draw(svg, R) { lidInner(svg, R); } };
  F.sprites['anniversary-rantai'] = { w: 540 * K, h: 260 * K, viewBox: '0 0 540 260', seed: 537, draw(svg, R) {
    chain(svg, R, [[30, 58], [120, 176], [330, 232], [536, 150]], 31);
  } };

  F.sprites['cover-anniversary'] = { w: 480, h: 600, seed: 535, draw(svg, R) {
    velvet(el('g', { transform: 'translate(0 -180) scale(0.6154)' }, svg), R, { flowers: false });
    const s = 0.5, cx = 232, cy = 224;
    // rantai dari gelang jam, menjuntai ke tepi kanan
    chain(svg, R, [[cx + 18, cy - 178], [cx + 70, cy - 110], [cx + 170, cy - 86], [cx + 262, cy - 150]], 26, 0.52);
    // tutup terbuka di bawah jam, sisipannya berhias kamboja
    const lid = el('g', { transform: `translate(${cx - LX * s} ${cy + 255 - LY * s}) scale(${s})` }, svg);
    lidInner(lid, R);
    F.flora.flowers.kambojaPink(el('g', { transform: `translate(${LX + 6} ${LY + 12}) rotate(14)` }, lid), R, 0.56);
    const w = el('g', { transform: `translate(${cx - C.x * s} ${cy - C.y * s}) scale(${s})` }, svg);
    watchFront(w, R, { heart: true });
    hands(w, 305, 60, 214);
    // bunga & daun di sudut
    const fr = F.flora, gr = fr.GREEN;
    leaf(svg, { len: 150, w: 58, ...gr[0], R, n: 40, curve: -0.2, transform: 'translate(490 470) rotate(-58)' });
    leaf(svg, { len: 130, w: 52, ...gr[2], R, n: 40, transform: 'translate(418 614) rotate(-20)' });
    fr.flowers.kamboja(el('g', { transform: 'translate(442 540) rotate(-12)' }, svg), R, 0.4);
    fr.flowers.melati(el('g', { transform: 'translate(378 578) scale(0.5)' }, svg), R, 1);
    leaf(svg, { len: 130, w: 50, ...gr[1], R, n: 40, transform: 'translate(-8 96) rotate(64)' });
    fr.flowers.kambojaPink(el('g', { transform: 'translate(28 44) rotate(20)' }, svg), R, 0.36);
    fr.flowers.melati(el('g', { transform: 'translate(40 562) scale(0.52)' }, svg), R, 1);
    petal(el('g', { transform: 'translate(92 512) rotate(40) scale(0.3)', filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...fr.PAL.kambojaPink, cast: false });
  } };
})();
