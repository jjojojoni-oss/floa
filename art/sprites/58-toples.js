/* Toples Bintang: toples kaca berisi bintang kertas lipat, di ambang jendela saat senja.
   Latar (langit senja, tirai, ambang), untaian lampu, toples (kaca belakang & depan terpisah supaya
   bintangnya bisa diletakkan di antaranya), gabus, bintang kertas, surat lipat, dan tokoh mini-game.
   Semua tulisan (label, catatan) dipasang dari DOM. */
(() => {
  const F = window.FLOA;
  const { el, painted, wash, dabs, mix, jitter, ramp, leaf, petal, linGrad, radGrad } = F;
  const W = 780, H = 1500;
  /** benda-benda digambar di kanvas besar, dirender 0,6× supaya berkasnya ringan */
  const K = 0.6;
  const SHADE = '#3b2a5c';

  const pol = (cx, cy, r, deg) => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const rrect = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;

  /** bidang bebas dilukis dengan sapuan searah `dir` di dalam kotak pembatas */
  const shape = (g, d, box, cols, R, { n = 50, dir = [1, 0.05], width = [8, 18], filter = 'impastoFine', cast, len = [26, 80], op = [0.3, 0.45] } = {}) => painted(g, d, {
    base: cols[1], n, R, filter, cast,
    stroke: () => {
      const x = box[0] + R() * box[2], y = box[1] + R() * box[3], L = len[0] + R() * (len[1] - len[0]), m = Math.hypot(dir[0], dir[1]);
      return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(mix(cols[1], R() < 0.5 ? cols[0] : cols[2], R() * 0.7), 5, R), width: width[0] + R() * (width[1] - width[0]), opacity: op[0] + R() * op[1] };
    },
  });

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

  /* ───────────── bintang kertas lipat ───────────── */
  const PAPER = {
    pink: { light: '#ffe6ec', mid: '#ffb8c9', dark: '#f48fab', shade: '#c2587f', pattern: 'stripe' },
    mentega: { light: '#fffbe2', mid: '#ffeda0', dark: '#f6d362', shade: '#c0932a', pattern: 'dot' },
    // krem berbintik merah muda: sengaja bukan kuning, supaya bintang emas tidak punya kembaran di dalam toples
    krem: { light: '#fffdf7', mid: '#fbf0dc', dark: '#ecd6b2', shade: '#a98458', pattern: 'dot', ink: '#f29bb5' },
    mint: { light: '#e9f9f0', mid: '#b9e8d0', dark: '#88d1ae', shade: '#4a987b', pattern: 'stripe' },
    langit: { light: '#eaf4ff', mid: '#bddbf9', dark: '#90bff0', shade: '#507bbd', pattern: 'dot' },
    persik: { light: '#fff1da', mid: '#ffd3a2', dark: '#f9ae72', shade: '#c67742', pattern: null },
    emas: { light: '#fff8d6', mid: '#ffdb72', dark: '#f0b434', shade: '#a96d12', pattern: null },
  };

  /** garis luar bintang gembung: sudut luar dan dalam sama-sama dibulatkan */
  function starPath(cx, cy, r, inner = 0.54, round = 0.34) {
    const P = [];
    for (let i = 0; i < 10; i++) P.push(pol(cx, cy, i % 2 ? r * inner : r, -90 + i * 36));
    let d = '';
    for (let i = 0; i < 10; i++) {
      const p = P[i], a = lerp(p, P[(i + 9) % 10], round), b = lerp(p, P[(i + 1) % 10], round);
      d += `${i ? 'L' : 'M'}${a[0].toFixed(1)},${a[1].toFixed(1)}Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
    }
    return { d: d + 'Z', P };
  }

  /** satu bintang kertas: badan dilukis, lalu tiap bidang lipatan diberi terang/teduh supaya terasa gembung */
  function star(g, R, pal, { cx = 100, cy = 100, r = 84, inner = 0.54, round = 0.34, n = 42, cast = 'cast', gloss = false } = {}) {
    const { d, P } = starPath(cx, cy, r, inner, round);
    const p = painted(g, d, {
      base: radGrad(g, [[0, pal.light], [0.55, pal.mid], [1, pal.dark]], cx - r * 0.2, cy - r * 0.25, r * 1.15), n, R, filter: 'impastoFine', cast,
      stroke: () => {
        const a = R() * 360, rr = Math.sqrt(R()) * r * 0.9, [x, y] = pol(cx, cy, rr, a), L = r * (0.16 + R() * 0.3);
        const [x2, y2] = pol(x, y, L, a + (R() - 0.5) * 50);
        return { d: `M${x},${y}L${x2},${y2}`, color: jitter(ramp([[0, pal.light], [0.6, pal.mid], [1, pal.dark]], rr / r + (R() - 0.5) * 0.3), 5, R), width: r * (0.06 + R() * 0.1), opacity: 0.3 + R() * 0.35 };
      },
    });
    // corak kertas (garis atau titik) yang ikut terpotong bentuk bintang
    const ink = pal.ink || '#ffffff';
    if (pal.pattern === 'stripe') {
      for (let i = -6; i <= 6; i++) el('path', { d: `M${cx + i * r * 0.26 - r},${cy + r}L${cx + i * r * 0.26 + r},${cy - r}`, stroke: ink, 'stroke-width': r * 0.05, 'stroke-opacity': 0.34 }, p.inner);
    } else if (pal.pattern === 'dot') {
      for (let ix = -4; ix <= 4; ix++) for (let iy = -4; iy <= 4; iy++) el('circle', { cx: cx + ix * r * 0.26 + (iy % 2 ? r * 0.13 : 0), cy: cy + iy * r * 0.24, r: r * (pal.ink ? 0.04 : 0.034), fill: ink, opacity: pal.ink ? 0.7 : 0.5 }, p.inner);
    }
    // bidang lipatan: separuh tiap lengan menghadap cahaya (kiri-atas), separuh lagi teduh
    for (let i = 0; i < 10; i++) {
      const a = P[i], b = P[(i + 1) % 10];
      const mid = [(a[0] + b[0]) / 2 - cx, (a[1] + b[1]) / 2 - cy];
      const lit = -(mid[0] + mid[1]) / (Math.hypot(mid[0], mid[1]) * Math.SQRT2); // 1 = menghadap kiri-atas
      const tri = `M${cx},${cy}L${a[0]},${a[1]}L${b[0]},${b[1]}Z`;
      const even = i % 2 === 0; // bidang di sebelah kanan lengan (searah jarum jam)
      const tone = lit * 0.6 + (even ? -0.25 : 0.25);
      el('path', { d: tri, fill: tone > 0 ? '#ffffff' : pal.shade, opacity: Math.min(0.34, Math.abs(tone) * 0.3) }, p.inner);
    }
    // rusuk (terang) ke tiap ujung, lembah (teduh) ke tiap sudut dalam
    for (let i = 0; i < 10; i++) {
      const q = P[i], tip = i % 2 === 0;
      el('path', { d: `M${cx},${cy}L${lerp([cx, cy], q, 0.88).join(',')}`, stroke: tip ? '#ffffff' : pal.shade, 'stroke-width': tip ? r * 0.035 : r * 0.028, 'stroke-opacity': tip ? 0.6 : 0.34, 'stroke-linecap': 'round' }, p.inner);
    }
    el('path', { d, fill: 'none', stroke: pal.shade, 'stroke-width': r * 0.03, 'stroke-opacity': 0.4 }, p.inner);
    if (gloss) {
      // kertas emas mengilap: kilau di lengan kiri-atas
      el('path', { d: `M${cx - r * 0.5},${cy - r * 0.2}L${cx - r * 0.1},${cy - r * 0.62}`, stroke: '#fffdf0', 'stroke-width': r * 0.12, 'stroke-opacity': 0.75, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
      el('circle', { cx: cx + r * 0.3, cy: cy + r * 0.34, r: r * 0.05, fill: '#fffdf0', opacity: 0.9 }, p.inner);
    }
    return p;
  }

  /* ───────────── toples kaca ───────────── */
  const JW = 460, JH = 640;
  const BODY = 'M118,72L118,120C118,150 52,160 52,214L52,548C52,584 76,600 112,600L348,600C384,600 408,584 408,548L408,214C408,160 342,150 342,120L342,72Z';

  function jarBack(g, R) {
    el('ellipse', { cx: 246, cy: 604, rx: 198, ry: 15, fill: SHADE, opacity: 0.42, filter: 'url(#soft)' }, g);
    // badan: kaca tipis kebiruan, sedikit lebih pekat di sisi yang jauh dari cahaya
    const tint = [[0, '#ffffff', 0.36], [0.2, '#eef3ff', 0.16], [0.62, '#d3dcf6', 0.13], [1, '#9aaadc', 0.4]];
    painted(g, BODY, {
      base: linGrad(g, tint, 52, 0, 408, 0), n: 46, R, filter: 'impastoFine',
      stroke: () => {
        const u = R(), x = 60 + u * 340, y = 150 + R() * 400, L = 40 + R() * 110;
        return { d: `M${x},${y}q${(R() - 0.5) * 10},${L / 2} 0,${L}`, color: u < 0.3 ? '#ffffff' : u > 0.72 ? '#8f9fd4' : '#dfe7fb', width: 8 + R() * 16, opacity: 0.06 + R() * 0.1 };
      },
    });
    const id = F.uid('j');
    const cp = el('clipPath', { id }, g);
    el('path', { d: BODY }, cp);
    const inner = el('g', { 'clip-path': `url(#${id})` }, g);
    // tepi kaca yang tebal tampak lebih pekat
    el('path', { d: BODY, fill: 'none', stroke: '#7785c2', 'stroke-width': 30, 'stroke-opacity': 0.3, filter: 'url(#soft)' }, inner);
    // dasar toples yang tebal
    el('ellipse', { cx: 230, cy: 588, rx: 152, ry: 13, fill: '#f4f8ff', opacity: 0.45 }, inner);
    el('path', { d: 'M84,574Q230,600 376,574', fill: 'none', stroke: '#7785c2', 'stroke-width': 2.4, 'stroke-opacity': 0.4 }, inner);
    // mulut toples: bagian dalam yang teduh + bibir belakang
    el('ellipse', { cx: 230, cy: 74, rx: 106, ry: 13, fill: '#4f4380', opacity: 0.2 }, g);
    el('path', { d: 'M114,72A116,18 0 0 1 346,72', fill: 'none', stroke: '#8794cc', 'stroke-width': 3, 'stroke-opacity': 0.75 }, g);
    el('path', { d: 'M118,70A112,16 0 0 1 342,70', fill: 'none', stroke: '#ffffff', 'stroke-width': 1.6, 'stroke-opacity': 0.8 }, g);
  }

  function jarFront(g, R, { twine = true } = {}) {
    el('path', { d: BODY, fill: 'none', stroke: '#6875b6', 'stroke-width': 3.4, 'stroke-opacity': 0.62, 'stroke-linejoin': 'round' }, g);
    el('path', { d: BODY, fill: 'none', stroke: '#ffffff', 'stroke-width': 1.4, 'stroke-opacity': 0.6, transform: 'translate(-1.4 -1.2)' }, g);
    // kilap panjang di sisi kiri (arah cahaya)
    el('path', { d: 'M86,236C79,330 79,440 88,530', fill: 'none', stroke: '#ffffff', 'stroke-width': 20, 'stroke-opacity': 0.5, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, g);
    el('path', { d: 'M106,246C101,330 101,420 107,486', fill: 'none', stroke: '#ffffff', 'stroke-width': 4.4, 'stroke-opacity': 0.9, 'stroke-linecap': 'round' }, g);
    // pantulan jendela: empat petak yang ikut melengkung
    const pane = el('g', { fill: '#ffffff', opacity: 0.5 }, g);
    for (const d of ['M128,226Q146,220 164,218L164,262Q146,264 129,270Z', 'M172,217Q190,215 206,216L206,260Q190,259 172,261Z', 'M129,280Q146,274 164,272L164,322Q147,324 131,332Z', 'M172,271Q190,269 206,270L206,320Q190,319 172,321Z']) el('path', { d }, pane);
    // kilap tipis di sisi kanan + bahu
    el('path', { d: 'M388,236C395,330 395,450 386,544', fill: 'none', stroke: '#ffffff', 'stroke-width': 5, 'stroke-opacity': 0.42, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M70,198C80,164 116,152 124,130', fill: 'none', stroke: '#ffffff', 'stroke-width': 5, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M392,202C382,170 348,154 340,132', fill: 'none', stroke: '#ffffff', 'stroke-width': 3, 'stroke-opacity': 0.35, 'stroke-linecap': 'round' }, g);
    // kilap di dasar
    el('path', { d: 'M96,582Q230,606 364,582', fill: 'none', stroke: '#ffffff', 'stroke-width': 3.4, 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, g);
    if (twine) {
      // tali goni melingkar di leher, bersimpul di kiri (label digantung dari DOM)
      const tw = el('g', { filter: 'url(#cast)' }, g);
      el('path', { d: 'M116,118Q230,148 344,118', fill: 'none', stroke: '#9a7440', 'stroke-width': 8, 'stroke-linecap': 'round' }, tw);
      el('path', { d: 'M116,128Q230,158 344,128', fill: 'none', stroke: '#b89058', 'stroke-width': 8, 'stroke-linecap': 'round' }, tw);
      for (let i = 0; i < 26; i++) {
        const t = i / 25, x = 118 + t * 224, y = 118 + 4 * t * (1 - t) * 30;
        el('path', { d: `M${x},${y - 3}l5,13`, stroke: '#6f4f25', 'stroke-width': 1.3, 'stroke-opacity': 0.5 }, tw);
      }
      el('path', { d: 'M118,116Q230,144 342,116', fill: 'none', stroke: '#e6c690', 'stroke-width': 1.6, 'stroke-opacity': 0.7 }, tw);
      // simpul
      el('path', { d: 'M132,128q-22,-16 -34,2q10,16 34,2Z', fill: '#b89058', stroke: '#6f4f25', 'stroke-width': 1.2, 'stroke-opacity': 0.6 }, tw);
      el('path', { d: 'M134,130q-4,24 -22,34', fill: 'none', stroke: '#9a7440', 'stroke-width': 5, 'stroke-linecap': 'round' }, tw);
    }
    // ulir kaca di leher + bibir depan
    el('path', { d: 'M118,94Q230,114 342,94', fill: 'none', stroke: '#ffffff', 'stroke-width': 2.4, 'stroke-opacity': 0.55 }, g);
    el('path', { d: 'M118,102Q230,122 342,102', fill: 'none', stroke: '#6875b6', 'stroke-width': 1.6, 'stroke-opacity': 0.4 }, g);
    el('path', { d: 'M114,72A116,18 0 0 0 346,72', fill: 'none', stroke: '#6875b6', 'stroke-width': 5.4, 'stroke-opacity': 0.5 }, g);
    el('path', { d: 'M114,70A116,18 0 0 0 346,70', fill: 'none', stroke: '#ffffff', 'stroke-width': 3.6, 'stroke-opacity': 0.95 }, g);
  }

  /** gabus penutup; kanvas 260×140 */
  function cork(g, R) {
    const body = 'M22,32L38,116Q130,134 222,116L238,32Q130,52 22,32Z';
    const cols = ['#e3bd8a', '#c89a62', '#9a6f3e'];
    const p = shape(g, body, [22, 30, 216, 100], cols, R, { n: 60, dir: [1, 0.04], width: [5, 12], len: [14, 50], cast: 'cast' });
    el('path', { d: body, fill: linGrad(g, [[0, '#fff3da', 0.35], [0.4, '#fff3da', 0], [1, '#3a2010', 0.34]], 22, 0, 238, 0) }, p.inner);
    // pori-pori gabus
    for (let i = 0; i < 46; i++) {
      const x = 34 + R() * 192, y = 46 + R() * 68;
      el('ellipse', { cx: x, cy: y, rx: 1.4 + R() * 3.4, ry: 1 + R() * 1.6, fill: R() < 0.65 ? '#7a5228' : '#f0d3a4', opacity: 0.4 + R() * 0.3, transform: `rotate(${R() * 180} ${x} ${y})` }, p.inner);
    }
    // muka atas
    const top = 'M22,32A108,17 0 0 1 238,32A108,17 0 0 1 22,32Z';
    const t = shape(g, top, [22, 14, 216, 36], ['#f4d9ae', '#dfb884', '#b98a54'], R, { n: 26, dir: [1, 0], width: [4, 9], len: [20, 60] });
    for (let i = 0; i < 16; i++) {
      const x = 44 + R() * 172, y = 24 + R() * 16;
      el('ellipse', { cx: x, cy: y, rx: 1.4 + R() * 3, ry: 0.8 + R() * 1.2, fill: '#8a6034', opacity: 0.4 }, t.inner);
    }
    el('path', { d: top, fill: 'none', stroke: '#7a5228', 'stroke-width': 1.6, 'stroke-opacity': 0.45 }, g);
    el('path', { d: 'M30,30A100,14 0 0 1 150,17', fill: 'none', stroke: '#fff6e2', 'stroke-width': 2.2, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }, g);
  }

  /** surat yang dilipat tiga, berstiker hati; kanvas 250×150 */
  function letter(g, R) {
    const sheet = 'M14,44L236,30L240,116L18,128Z';
    const cols = ['#ffffff', '#fbf3e2', '#e4d3b6'];
    const p = shape(g, sheet, [14, 30, 226, 98], cols, R, { n: 40, dir: [1, -0.06], width: [8, 16], len: [30, 90], cast: 'cast', op: [0.2, 0.3] });
    el('path', { d: sheet, fill: linGrad(g, [[0, '#ffffff', 0.3], [1, '#6a4a2a', 0.14]], 14, 30, 240, 128) }, p.inner);
    // lipatan atas menutup ke bawah
    const flap = 'M14,44L236,30L238,78L16,90Z';
    const f = shape(g, flap, [14, 30, 224, 60], ['#ffffff', '#fffaf0', '#ecdcc0'], R, { n: 24, dir: [1, -0.06], width: [8, 14], len: [30, 80], cast: 'cast', op: [0.2, 0.3] });
    el('path', { d: 'M16,90L238,78', stroke: '#b89a6c', 'stroke-width': 1.4, 'stroke-opacity': 0.6 }, f.inner);
    // stiker hati menahan lipatannya
    el('path', { d: 'M0,9C-16,-4 -9,-17 0,-8C9,-17 16,-4 0,9Z', fill: '#e8548a', transform: 'translate(128 84) rotate(-6) scale(1.5)', filter: 'url(#cast)' }, g);
    el('path', { d: 'M-6,-7q3,-4 6,-1', fill: 'none', stroke: '#ffd0de', 'stroke-width': 1.6, 'stroke-linecap': 'round', transform: 'translate(128 84) rotate(-6) scale(1.5)' }, g);
  }

  /** selotip kertas merah muda berkawung, ujungnya bergerigi: menahan foto kecil di atas kertas bintang; kanvas 150×60 */
  function tape(g, R) {
    let d = 'M14,10H136';
    for (let k = 0; k < 6; k++) d += `l${k % 2 ? 5 : -5},6`;
    d += 'H14';
    for (let k = 0; k < 6; k++) d += `l${k % 2 ? -5 : 5},-6`;
    d += 'Z';
    const c = '#f08fae', l = '#fbc7d6', dk = '#d5668b';
    const p = painted(el('g', { opacity: 0.9 }, g), d, {
      base: c, n: 40, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 10 + R() * 110, y = 10 + R() * 36; return { d: `M${x},${y}l${20 + R() * 40},${(R() - 0.5) * 3}`, color: jitter(mix(c, R() < 0.5 ? l : dk, R() * 0.6), 5, R), width: 5 + R() * 8, opacity: 0.35 + R() * 0.4 }; },
    });
    const m = el('g', { opacity: 0.55 }, p.inner);
    for (let x = 22; x < 140; x += 26) {
      for (const a of [45, 135, 225, 315]) el('ellipse', { cx: x, cy: 28, rx: 9, ry: 4, fill: 'none', stroke: '#fffaf0', 'stroke-width': 1.8, transform: `rotate(${a} ${x} 28) translate(10.5 0)` }, m);
      el('circle', { cx: x, cy: 28, r: 1.8, fill: '#fffaf0' }, m);
    }
    el('path', { d: 'M12,13H138', stroke: '#ffffff', 'stroke-width': 2, 'stroke-opacity': 0.4 }, p.inner);
  }

  /* ───────────── untaian lampu ───────────── */
  const LW = 780, LH = 200;
  /** kawat melengkung dari tepi ke tepi; posisi bohlam & gantungan bintang dihitung dengan rumus yang sama di DOM */
  const wire = (t) => [(1 - t) * (1 - t) * -10 + 2 * (1 - t) * t * 390 + t * t * 790, (1 - t) * (1 - t) * 34 + 2 * (1 - t) * t * 214 + t * t * 34];
  const BULBS = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92];
  function lights(g, R) {
    el('path', { d: 'M-10,34Q390,214 790,34', fill: 'none', stroke: '#2b2148', 'stroke-width': 3, 'stroke-opacity': 0.75 }, g);
    el('path', { d: 'M-10,33Q390,213 790,33', fill: 'none', stroke: '#8f84bd', 'stroke-width': 1, 'stroke-opacity': 0.6 }, g);
    BULBS.forEach((t, i) => {
      const [x, y] = wire(t);
      const tilt = (t - 0.5) * 26;
      const b = el('g', { transform: `translate(${x} ${y}) rotate(${tilt})` }, g);
      el('circle', { cx: 0, cy: 22, r: 34, fill: '#ffd98a', opacity: 0.4, filter: 'url(#soft)' }, b);
      el('path', { d: 'M-5,-1h10v10h-10Z', fill: '#3b3058' }, b);
      el('path', { d: 'M-5,2h10M-5,5h10', stroke: '#7c70a6', 'stroke-width': 0.9 }, b);
      el('path', { d: 'M-7,10C-12,22 -8,36 0,38C8,36 12,22 7,10Z', fill: radGrad(g, [[0, '#fffdf2'], [0.5, '#ffeab0'], [1, i % 2 ? '#ffc56a' : '#ffd27c']], -2, 20, 16) }, b);
      el('path', { d: 'M-4,15q-3,8 0,15', fill: 'none', stroke: '#ffffff', 'stroke-width': 1.6, 'stroke-opacity': 0.85, 'stroke-linecap': 'round' }, b);
    });
  }

  /* ───────────── latar: jendela senja, tirai, ambang ───────────── */
  const SILL = 1180;
  function room(svg, R, { props = true } = {}) {
    const sky = [[0, '#8a83cc'], [0.3, '#b59ad8'], [0.58, '#e3a9cf'], [0.8, '#f8bfb4'], [1, '#ffdcae']];
    wash(svg, { x: -40, y: -30, w: W + 80, h: SILL + 60, R, n: 520, angle: -3, len: [0.2, 0.55], width: [26, 60], opacity: [0.3, 0.7], base: linGrad(svg, sky, 0, 0, 0, SILL), color: (u, v) => ramp(sky, v + (u - 0.5) * 0.06) });
    F.latar.clouds(svg, R, '#f7cfdc', [[230, 470, 520, 70, 0.42], [600, 700, 440, 60, 0.38]]);
    F.latar.clouds(svg, R, '#fff1dc', [[380, 960, 640, 60, 0.42]]);
    // bintang-bintang pertama di langit senja
    dabs(svg, { n: 44, R, filter: null, place: (i, R2) => ({ x: R2() * W, y: Math.pow(R2(), 1.5) * 560, rx: 1 + R2() * 2, color: '#fffbe8', opacity: 0.5 + R2() * 0.45 }) });
    // pepohonan & atap jauh, kabur
    const far = el('g', { filter: 'url(#blur2)' }, svg);
    dabs(far, { n: 130, R, filter: 'impastoH', place: (i, R2) => { const u = R2(); return { x: u * W, y: 1080 + Math.sin(u * 7) * 20 + R2() * 110, rx: 26 + R2() * 44, ry: 18 + R2() * 28, rot: R2() * 180, color: jitter(R2() < 0.5 ? '#9c86c4' : '#8571b4', 8, R2), opacity: 0.85 }; } });
    for (const [x, y, w] of [[150, 1096, 120], [470, 1084, 150], [650, 1104, 110]]) el('path', { d: `M${x},${y + 60}L${x},${y + 22}L${x + w / 2},${y}L${x + w},${y + 22}L${x + w},${y + 60}Z`, fill: '#7a66aa', opacity: 0.55 }, far);
    // jendela-jendela rumah yang mulai menyala
    dabs(svg, { n: 12, R, filter: 'blur2', place: (i, R2) => ({ x: 120 + R2() * 560, y: 1122 + R2() * 44, rx: 4 + R2() * 3, ry: 5, color: '#ffdf9a', opacity: 0.75 }) });
    // cahaya hangat dari untaian lampu
    el('rect', { x: 0, y: 0, width: W, height: SILL, fill: radGrad(svg, [[0, '#ffe7b4', 0.26], [1, '#ffe7b4', 0]], W / 2, 420, 520) }, svg);

    // tirai tipis di kiri & kanan, berkawung samar
    const curtain = (d, box, flip) => {
      const p = shape(svg, d, box, ['#ffffff', '#f3ebfa', '#cdbde8'], R, { n: 70, dir: [0.04, 1], width: [10, 24], len: [80, 260], filter: 'impasto', op: [0.2, 0.35] });
      el('path', { d, fill: kawung(svg, '#b9a3e0', 54, 1.3), opacity: 0.4 }, p.inner);
      for (let i = 0; i < 5; i++) {
        const x = box[0] + (i + 0.5) * (box[2] / 5);
        el('path', { d: `M${x},-20Q${x + (flip ? -10 : 10)},600 ${x + (flip ? 8 : -8)},${SILL}`, fill: 'none', stroke: i % 2 ? '#a892d4' : '#ffffff', 'stroke-width': 12, 'stroke-opacity': 0.2, filter: 'url(#blur2)' }, p.inner);
      }
      el('path', { d, fill: linGrad(svg, [[0, '#ffffff', flip ? 0 : 0.2], [1, SHADE, flip ? 0.18 : 0.1]], box[0], 0, box[0] + box[2], 0) }, p.inner);
      p.g.setAttribute('opacity', '0.9');
    };
    curtain(`M-30,-30H96Q112,400 88,760T104,${SILL - 34}Q60,${SILL - 14} 20,${SILL - 30}T-30,${SILL - 22}Z`, [-30, -30, 150, SILL + 30], false);
    curtain(`M${W + 30},-30H${W - 92}Q${W - 110},420 ${W - 86},780T${W - 100},${SILL - 34}Q${W - 60},${SILL - 14} ${W - 20},${SILL - 30}T${W + 30},${SILL - 22}Z`, [W - 120, -30, 150, SILL + 30], true);

    // ambang jendela: bidang atas, bibir depan, lalu dinding di bawahnya
    const top = `M-20,${SILL}H${W + 20}V${SILL + 76}H-20Z`;
    shape(svg, top, [-20, SILL, W + 40, 76], ['#ffffff', '#f6effb', '#ddd0ef'], R, { n: 70, dir: [1, 0], width: [8, 18], len: [80, 260], filter: 'canvas', op: [0.25, 0.4] });
    el('rect', { x: -20, y: SILL, width: W + 40, height: 76, fill: linGrad(svg, [[0, SHADE, 0.2], [0.35, SHADE, 0], [1, '#ffffff', 0.25]], 0, SILL, 0, SILL + 76) }, svg);
    const lip = `M-20,${SILL + 76}H${W + 20}V${SILL + 126}H-20Z`;
    shape(svg, lip, [-20, SILL + 76, W + 40, 50], ['#e7dcf5', '#d2c3ea', '#b3a0d6'], R, { n: 50, dir: [1, 0], width: [8, 16], len: [80, 240], filter: 'canvas', op: [0.25, 0.4] });
    el('path', { d: `M-20,${SILL + 77}H${W + 20}`, stroke: '#ffffff', 'stroke-width': 3, 'stroke-opacity': 0.9 }, svg);
    const wallTone = [[0, '#b3a1d9'], [1, '#9d8aca']];
    wash(svg, { x: -40, y: SILL + 126, w: W + 80, h: H - SILL - 96, R, n: 150, angle: 86, len: [0.06, 0.16], width: [24, 56], opacity: [0.25, 0.55], base: linGrad(svg, wallTone, 0, SILL + 126, 0, H), color: (u, v) => ramp(wallTone, v), clip: `M-40,${SILL + 126}H${W + 40}V${H + 40}H-40Z` });
    el('rect', { x: 0, y: SILL + 126, width: W, height: H - SILL - 126, fill: kawung(svg, '#cbbdea', 60, 1.3), opacity: 0.3 }, svg);
    el('rect', { x: 0, y: SILL + 126, width: W, height: 70, fill: linGrad(svg, [[0, SHADE, 0.34], [1, SHADE, 0]], 0, SILL + 126, 0, SILL + 196) }, svg);
    if (!props) return;
    const fr = F.flora, gr = fr.GREEN;
    // kiri: kamboja merah muda dan sehelai daun di atas ambang
    leaf(svg, { len: 150, w: 60, ...gr[1], R, n: 40, curve: 0.2, transform: `translate(8 ${SILL + 56}) rotate(72)` });
    fr.flowers.kambojaPink(el('g', { transform: `translate(72 ${SILL + 34}) rotate(14)` }, svg), R, 0.36);
    // kanan: bunga lila kecil, daun, melati
    leaf(svg, { len: 140, w: 56, ...gr[0], R, n: 40, curve: -0.2, transform: `translate(${W - 6} ${SILL + 60}) rotate(-70)` });
    fr.flowers.lila(el('g', { transform: `translate(${W - 78} ${SILL + 36})` }, svg), R, 0.3);
    fr.flowers.melati(el('g', { transform: `translate(${W - 150} ${SILL + 56}) scale(0.62)` }, svg), R, 1);
    [[150, SILL + 60, 50, 0.3, 'kambojaPink'], [W - 214, SILL + 30, -60, 0.24, 'kamboja']].forEach(([x, y, rot, s, pal]) =>
      petal(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})`, filter: 'url(#cast)' }, svg), { len: 92, w: 62, round: 0.8, skew: 0.12, R, n: 22, ...fr.PAL[pal], cast: false }));
  }

  /* ───────────── tokoh mini-game: bintang gembul yang ketiduran ───────────── */
  function pillow(g, R) {
    const d = 'M24,34Q160,10 296,34Q312,66 296,98Q160,122 24,98Q8,66 24,34Z';
    el('ellipse', { cx: 166, cy: 108, rx: 140, ry: 12, fill: SHADE, opacity: 0.3, filter: 'url(#soft)' }, g);
    const p = shape(g, d, [10, 12, 300, 108], ['#f4ecff', '#d6c6f4', '#ab95dc'], R, { n: 50, dir: [1, 0.02], width: [10, 20], len: [40, 120], cast: 'cast' });
    el('path', { d, fill: kawung(g, '#ffffff', 40, 1.2), opacity: 0.4 }, p.inner);
    el('path', { d, fill: radGrad(g, [[0, '#ffffff', 0.4], [0.6, '#ffffff', 0], [1, SHADE, 0.24]], 110, 40, 220) }, p.inner);
    el('path', { d, fill: 'none', stroke: '#8f79c8', 'stroke-width': 2.4, 'stroke-opacity': 0.6 }, g);
    // rumbai di ujung bantal
    for (const [x, y, r] of [[22, 34, -40], [298, 34, 40], [22, 98, -140], [298, 98, 140]]) el('path', { d: 'M0,0q-4,-12 0,-20M0,0q6,-10 8,-18M0,0q-10,-8 -12,-16', fill: 'none', stroke: '#e8548a', 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: `translate(${x} ${y}) rotate(${r})` }, g);
  }
  /** topi tidur bergaris dengan pompom; (0,0) = tepi bawah-kiri topi */
  function nightcap(g, R) {
    const d = 'M10,96Q24,30 92,22Q126,20 138,54Q112,40 92,60Q70,82 86,98Q46,108 10,96Z';
    const p = shape(g, d, [10, 20, 130, 90], ['#ffffff', '#fbf3f6', '#e7cbd6'], R, { n: 24, dir: [0.6, -1], width: [8, 14], len: [20, 60], cast: 'cast' });
    for (const s of ['M30,100Q40,50 84,30', 'M54,104Q60,66 100,42', 'M76,104Q78,82 112,58']) el('path', { d: s, fill: 'none', stroke: '#e8548a', 'stroke-width': 9, 'stroke-opacity': 0.85 }, p.inner);
    el('path', { d, fill: 'none', stroke: '#b9456e', 'stroke-width': 1.6, 'stroke-opacity': 0.5 }, g);
    const band = 'M4,92Q46,110 92,94L94,108Q46,124 6,106Z';
    shape(g, band, [4, 90, 92, 34], ['#ffffff', '#fff7f0', '#ecd9c8'], R, { n: 10, dir: [1, 0.1], width: [5, 9], len: [20, 50], cast: 'cast' });
    const pom = el('g', { filter: 'url(#cast)' }, g);
    for (let i = 0; i < 22; i++) { const a = R() * 360, [x, y] = pol(140, 58, R() * 11, a); el('circle', { cx: x, cy: y, r: 5 + R() * 5, fill: R() < 0.5 ? '#ffffff' : '#fbe9ef' }, pom); }
  }

  /* ───────────── sprite ───────────── */
  F.sprites['bg-toples'] = { w: W, h: H, seed: 581, scale: 1, draw(svg, R) { room(svg, R); } };
  F.sprites['toples-lampu'] = { w: LW * K, h: LH * K, viewBox: `0 0 ${LW} ${LH}`, seed: 582, draw(svg, R) { lights(svg, R); } };
  F.sprites['toples-kaca-belakang'] = { w: JW * K, h: JH * K, viewBox: `0 0 ${JW} ${JH}`, seed: 583, draw(svg, R) { jarBack(svg, R); } };
  F.sprites['toples-kaca-depan'] = { w: JW * K, h: JH * K, viewBox: `0 0 ${JW} ${JH}`, seed: 584, draw(svg, R) { jarFront(svg, R); } };
  F.sprites['toples-gabus'] = { w: 260 * K, h: 140 * K, viewBox: '0 0 260 140', seed: 585, draw(svg, R) { cork(svg, R); } };
  F.sprites['toples-selotip'] = { w: 150 * K, h: 60 * K, viewBox: '0 0 150 60', seed: 587, draw(svg, R) { tape(svg, R); } };
  F.sprites['toples-surat'] = { w: 250 * K, h: 150 * K, viewBox: '0 0 250 150', seed: 586, draw(svg, R) { letter(svg, R); } };
  ['pink', 'krem', 'mint', 'langit', 'persik'].forEach((name, i) => {
    F.sprites[`toples-bintang-${i + 1}`] = { w: 200 * K, h: 200 * K, viewBox: '0 0 200 200', seed: 590 + i, draw(svg, R) { star(svg, R, PAPER[name]); } };
  });
  F.sprites['toples-bintang-emas'] = { w: 200 * K, h: 200 * K, viewBox: '0 0 200 200', seed: 596, draw(svg, R) { star(svg, R, PAPER.emas, { gloss: true }); } };
  F.sprites['game-toples-bintang'] = { w: 260 * K, h: 260 * K, viewBox: '0 0 260 260', seed: 597, draw(svg, R) { star(svg, R, { ...PAPER.mentega, pattern: null }, { cx: 130, cy: 132, r: 112, inner: 0.6, round: 0.42, n: 60 }); } };
  F.sprites['game-toples-bantal'] = { w: 320 * K, h: 130 * K, viewBox: '0 0 320 130', seed: 598, draw(svg, R) { pillow(svg, R); } };
  F.sprites['game-toples-topi'] = { w: 160 * K, h: 130 * K, viewBox: '0 0 160 130', seed: 599, draw(svg, R) { nightcap(svg, R); } };

  F.sprites['cover-toples'] = { w: 480, h: 600, seed: 580, draw(svg, R) {
    // ambang jendela agak rendah di kartu, supaya gabusnya punya ruang napas dari tepi atas
    room(el('g', { transform: 'translate(0 -285) scale(0.6154)' }, svg), R, { props: false });
    lights(el('g', { transform: 'translate(0 4) scale(0.6154)' }, svg), R);
    // toples di ambang: kaca belakang → bintang → kaca depan → gabus
    const s = 0.72, jx = 240 - (JW / 2) * s, jy = 466 - 600 * s;
    const jar = el('g', { transform: `translate(${jx} ${jy}) scale(${s})` }, svg);
    jarBack(jar, R);
    const pile = [['langit', 132, 520, -16], ['pink', 330, 522, 20], ['emas', 230, 536, 6], ['mint', 184, 442, 24], ['persik', 290, 438, -18], ['krem', 236, 358, 8]];
    pile.forEach(([name, x, y, rot]) => star(el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(0.68) translate(-100 -100)` }, jar), R, PAPER[name], { gloss: name === 'emas', n: 30 }));
    jarFront(jar, R);
    cork(el('g', { transform: 'translate(100 4)' }, jar), R);
    // label gantung polos
    const tag = el('g', { transform: 'translate(28 150) rotate(16)', filter: 'url(#cast)' }, jar);
    shape(tag, 'M22,0H128Q136,0 136,8V62Q136,70 128,70H22L0,50V20Z', [0, 0, 136, 70], ['#fffaec', '#f3e6cb', '#d8c29a'], R, { n: 20, dir: [1, 0.04], width: [6, 12], len: [20, 70] });
    el('circle', { cx: 16, cy: 35, r: 6, fill: '#b48a58' }, tag);
    el('path', { d: 'M40,26h74M40,40h54', stroke: '#b9456e', 'stroke-width': 3, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }, tag);
    // bintang yang sudah melayang keluar + dua di ambang
    el('circle', { cx: 356, cy: 186, r: 74, fill: '#fff3c4', opacity: 0.5, filter: 'url(#softer)' }, svg);
    star(el('g', { transform: 'translate(356 186) rotate(14) scale(0.62) translate(-100 -100)' }, svg), R, PAPER.pink, { n: 30 });
    star(el('g', { transform: 'translate(78 490) rotate(-18) scale(0.44) translate(-100 -100)' }, svg), R, PAPER.mint, { n: 26 });
    star(el('g', { transform: 'translate(410 496) rotate(22) scale(0.4) translate(-100 -100)' }, svg), R, PAPER.langit, { n: 26 });
    const fr = F.flora;
    leaf(svg, { len: 110, w: 44, ...fr.GREEN[1], R, n: 30, curve: 0.2, transform: 'translate(-4 514) rotate(70)' });
    fr.flowers.kambojaPink(el('g', { transform: 'translate(44 472) rotate(14)' }, svg), R, 0.26);
    fr.flowers.lila(el('g', { transform: 'translate(440 456)' }, svg), R, 0.2);
  } };
})();
