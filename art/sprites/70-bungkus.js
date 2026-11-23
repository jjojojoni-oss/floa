/* Sampul kado bersama: bingkisan kertas cokelat berstempel kawung, diikat tali goni, simpul pita kain
   (dilukis abu-abu supaya bisa diwarnai sesuai aksen template lewat CSS), dan label kertas yang tergantung.
   Kertas, tali tegak, dan tali mendatar memakai kanvas yang sama (400×480) supaya pas saat ditumpuk. */
(() => {
  const F = window.FLOA;
  const { el, painted, mix, jitter, linGrad } = F;
  const KRAFT = { base: '#c4a070', light: '#e2c79c', dark: '#9c7646' };
  const INK = '#5a3a1e';
  const W = 400, H = 480;
  // bidang bingkisan (sedikit tidak simetris supaya terasa dibungkus tangan)
  const BX = 34, BY = 30, BW = 332, BH = 418;
  const CX = 206, CY = 252; // titik silang tali

  function rr(x, y, w, h, r) {
    return `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  }

  /** Lembar bahan: sapuan searah `dir` di dalam kotak. */
  function sheet(parent, d, R, { pal, box, dir = [1, 0.06], n = 120, cast, filter = 'impastoFine', width = [10, 24], len = [50, 160], op = [0.2, 0.38] }) {
    const m = Math.hypot(dir[0], dir[1]);
    return painted(parent, d, {
      base: pal.base, n, R, filter, cast,
      stroke: () => {
        const x = box[0] + R() * box[2], y = box[1] + R() * box[3];
        const L = len[0] + R() * (len[1] - len[0]);
        const c = R() < 0.55 ? mix(pal.base, pal.light, R() * 0.6) : mix(pal.base, pal.dark, R() * 0.45);
        return { d: `M${x},${y}l${(dir[0] / m) * L},${(dir[1] / m) * L}`, color: jitter(c, 4, R), width: width[0] + R() * (width[1] - width[0]), opacity: op[0] + R() * op[1] };
      },
    });
  }

  /** Satu kawung kecil (empat kelopak lonjong) seperti cap stempel. */
  function kawung(g, x, y, r, R) {
    const k = el('g', { transform: `translate(${x} ${y}) rotate(${(R() - 0.5) * 8})`, opacity: 0.35 + R() * 0.45 }, g);
    for (const a of [45, 135, 225, 315]) el('ellipse', { cx: 0, cy: 0, rx: r, ry: r * 0.46, transform: `rotate(${a}) translate(${r * 1.12} 0)` }, k);
    el('circle', { r: r * 0.22 }, k);
  }

  /* ───────── kertas bingkisan ───────── */
  F.sprites['bungkus-kertas'] = { w: W, h: H, seed: 701, draw(svg, R) {
    const body = rr(BX, BY, BW, BH, 12);
    const p = sheet(svg, body, R, { pal: KRAFT, box: [BX, BY, BW, BH], n: 110, cast: 'castBig', filter: 'canvas', dir: [1, 0.35], width: [26, 60], len: [40, 120], op: [0.1, 0.2] });
    // bintik-bintik serat kertas cokelat (mottled)
    for (let i = 0; i < 160; i++) {
      const x = BX + R() * BW, y = BY + R() * BH, r = 6 + R() * 22;
      el('ellipse', { cx: x, cy: y, rx: r, ry: r * (0.6 + R() * 0.4), fill: R() < 0.5 ? KRAFT.light : KRAFT.dark, 'fill-opacity': 0.06 + R() * 0.08, filter: 'url(#blur2)' }, p.inner);
    }
    // gradasi cahaya kiri-atas → teduh kanan-bawah
    el('path', { d: body, fill: linGrad(svg, [[0, '#fff3da', 0.28], [0.5, '#fff3da', 0], [1, '#4a2c10', 0.22]], BX, BY, BX + BW, BY + BH) }, p.inner);
    // serat kertas: garis-garis halus tak beraturan
    const fib = el('g', { fill: 'none', 'stroke-linecap': 'round' }, p.inner);
    for (let i = 0; i < 70; i++) {
      const x = BX + R() * BW, y = BY + R() * BH, L = 8 + R() * 26;
      el('path', { d: `M${x},${y}q${L / 2},${(R() - 0.5) * 4} ${L},${(R() - 0.5) * 3}`, stroke: R() < 0.5 ? '#f2dcb5' : '#8a6538', 'stroke-width': 0.8 + R() * 0.8, 'stroke-opacity': 0.35 }, fib);
    }
    // cap kawung cokelat tua, berjajar longgar seperti distempel tangan
    const st = el('g', { fill: 'none', stroke: INK, 'stroke-width': 1.4, filter: 'url(#wobble)', opacity: 0.5 }, p.inner);
    for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) {
      const x = BX + 30 + col * 68 + (row % 2) * 34 + (R() - 0.5) * 6;
      const y = BY + 30 + row * 62 + (R() - 0.5) * 6;
      if (x > BX + BW - 12) continue;
      if (R() < 0.12) continue; // cap yang terlewat
      kawung(st, x, y, 8.5, R);
    }
    // lipatan: kerutan diagonal di dekat sudut (bekas kertas ditekuk ke balik kotak)
    const fold = el('g', { fill: 'none', 'stroke-linecap': 'round' }, p.inner);
    [[BX + 6, BY + 6, 1, 1], [BX + BW - 6, BY + 6, -1, 1], [BX + 6, BY + BH - 6, 1, -1], [BX + BW - 6, BY + BH - 6, -1, -1]].forEach(([x, y, sx, sy]) => {
      el('path', { d: `M${x},${y}l${sx * 46},${sy * 40}`, stroke: '#f5e3c2', 'stroke-width': 2.2, 'stroke-opacity': 0.7 }, fold);
      el('path', { d: `M${x + sx * 3},${y + sy * 5}l${sx * 44},${sy * 38}`, stroke: '#6e4a22', 'stroke-width': 1.6, 'stroke-opacity': 0.35 }, fold);
    });
    // tepi kertas yang dilipat: bingkai tipis sedikit lebih terang & bayangan dalam
    el('path', { d: rr(BX + 5, BY + 5, BW - 10, BH - 10, 9), fill: 'none', stroke: '#ecd3a8', 'stroke-width': 3, 'stroke-opacity': 0.55 }, p.inner);
    el('path', { d: body, fill: 'none', stroke: '#5c3c1c', 'stroke-width': 2.2, 'stroke-opacity': 0.35 }, svg);
    // bayangan halus tempat tali menekan kertas
    const press = el('g', { filter: 'url(#blur2)', stroke: '#4a2c10', 'stroke-opacity': 0.18, fill: 'none' }, svg);
    el('path', { d: `M${CX + 3},${BY}V${BY + BH}`, 'stroke-width': 16 }, press);
    el('path', { d: `M${BX},${CY + 3}H${BX + BW}`, 'stroke-width': 16 }, press);
  } };

  /** Tali goni: batang tebal dengan pilinan miring, serabut halus, dan pantulan. path tegak/mendatar. */
  function twine(svg, R, d, len, vertical) {
    const g = el('g', { filter: 'url(#cast)' }, svg);
    el('path', { d, fill: 'none', stroke: '#8a6a3e', 'stroke-width': 11, 'stroke-linecap': 'butt' }, g);
    el('path', { d, fill: 'none', stroke: '#b8955f', 'stroke-width': 8.5, 'stroke-linecap': 'butt' }, g);
    // pilinan: garis-garis miring sepanjang tali
    const tw = el('g', { fill: 'none', 'stroke-linecap': 'round' }, g);
    const [t0, t1] = vertical ? [BY + 2, BY + BH - 2] : [BX + 2, BX + BW - 2];
    for (let t = t0; t < t1; t += 5.2) {
      const a = vertical ? `M${CX - 4},${t}l8,4.6` : `M${t},${CY - 4}l4.6,8`;
      el('path', { d: a, stroke: R() < 0.5 ? '#d9bd8a' : '#7a5a32', 'stroke-width': 1.8, 'stroke-opacity': 0.75 }, tw);
    }
    // serabut halus yang mencuat
    const fz = el('g', { fill: 'none', stroke: '#c9a874', 'stroke-width': 0.7, 'stroke-opacity': 0.7 }, g);
    for (let i = 0; i < len / 7; i++) {
      const t = t0 + R() * (t1 - t0), side = R() < 0.5 ? -1 : 1, L = 3 + R() * 6;
      el('path', { d: vertical ? `M${CX + side * 4.5},${t}q${side * L * 0.6},${-L * 0.3} ${side * L},${-L * 0.8}` : `M${t},${CY + side * 4.5}q${-L * 0.3},${side * L * 0.6} ${-L * 0.8},${side * L}`, }, fz);
    }
    el('path', { d, fill: 'none', stroke: '#f4e1b8', 'stroke-width': 1.6, 'stroke-opacity': 0.55, transform: vertical ? 'translate(-2.4 0)' : 'translate(0 -2.4)' }, g);
  }

  F.sprites['bungkus-tali-v'] = { w: W, h: H, seed: 702, draw(svg, R) { twine(svg, R, `M${CX},${BY + 1}C${CX - 2},${BY + 120} ${CX + 2},${BY + 300} ${CX},${BY + BH - 1}`, H, true); } };
  F.sprites['bungkus-tali-h'] = { w: W, h: H, seed: 703, draw(svg, R) { twine(svg, R, `M${BX + 1},${CY}C${BX + 100},${CY + 2} ${BX + 240},${CY - 2} ${BX + BW - 1},${CY}`, W, false); } };

  /* ───────── simpul pita kain (abu-abu, diwarnai lewat CSS) ───────── */
  const GRAY = { base: '#9b9b9b', light: '#e9e9e9', dark: '#4c4c4c' };
  F.sprites['bungkus-pita'] = { w: 260, h: 230, seed: 704, draw(svg, R) {
    const cx = 130, cy = 96;
    const g = el('g', { filter: 'url(#castBig)' }, svg);
    // ekor pita: dua helai menjuntai, ujung digunting V
    const tail = (sx) => {
      const x1 = cx + sx * 8, x2 = cx + sx * 62, y2 = cy + 120;
      const d = `M${x1 - sx * 9},${cy + 6}C${x1 + sx * 6},${cy + 50} ${x2 - sx * 20},${y2 - 40} ${x2 - sx * 14},${y2}L${x2 + sx * 2},${y2 - 12}L${x2 + sx * 16},${y2 + 4}C${x2 + sx * 8},${y2 - 46} ${x1 + sx * 26},${cy + 40} ${x1 + sx * 12},${cy + 4}Z`;
      sheet(g, d, R, { pal: mix(GRAY.base, GRAY.dark, 0.18) === '' ? GRAY : { base: mix(GRAY.base, GRAY.dark, 0.15), light: GRAY.light, dark: GRAY.dark }, box: [Math.min(x1, x2) - 20, cy, 90, 130], dir: [sx * 0.5, 1], n: 40, width: [5, 12], len: [20, 60], op: [0.3, 0.4] });
    };
    tail(-1);
    tail(1);
    // dua kelopak simpul
    const loop = (sx) => {
      const d = `M${cx},${cy}C${cx + sx * 30},${cy - 64} ${cx + sx * 104},${cy - 58} ${cx + sx * 100},${cy - 8}C${cx + sx * 98},${cy + 34} ${cx + sx * 40},${cy + 30} ${cx},${cy}Z`;
      const p = sheet(g, d, R, { pal: GRAY, box: [cx + Math.min(0, sx * 104), cy - 64, 104, 96], dir: [sx, -0.35], n: 60, width: [6, 14], len: [24, 70], op: [0.3, 0.45] });
      // lipatan dalam kelopak
      el('path', { d: `M${cx + sx * 10},${cy - 4}C${cx + sx * 44},${cy - 30} ${cx + sx * 74},${cy - 30} ${cx + sx * 88},${cy - 10}`, fill: 'none', stroke: GRAY.dark, 'stroke-width': 3, 'stroke-opacity': 0.35, 'stroke-linecap': 'round', filter: 'url(#blur2)' }, p.inner);
      el('path', { d: `M${cx + sx * 16},${cy - 22}C${cx + sx * 40},${cy - 46} ${cx + sx * 70},${cy - 46} ${cx + sx * 86},${cy - 30}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 2.4, 'stroke-opacity': 0.55, 'stroke-linecap': 'round' }, p.inner);
      // tepi jahitan kecil
      el('path', { d, fill: 'none', stroke: GRAY.dark, 'stroke-width': 1.4, 'stroke-opacity': 0.4 }, p.inner);
    };
    loop(-1);
    loop(1);
    // simpul tengah
    const knot = `M${cx - 17},${cy - 15}Q${cx},${cy - 22} ${cx + 17},${cy - 15}Q${cx + 22},${cy} ${cx + 16},${cy + 16}Q${cx},${cy + 22} ${cx - 16},${cy + 16}Q${cx - 22},${cy} ${cx - 17},${cy - 15}Z`;
    const k = sheet(g, knot, R, { pal: { base: mix(GRAY.base, GRAY.light, 0.1), light: GRAY.light, dark: GRAY.dark }, box: [cx - 22, cy - 22, 44, 44], dir: [0.2, 1], n: 18, width: [4, 8], len: [10, 26], op: [0.35, 0.4] });
    el('path', { d: `M${cx - 9},${cy - 12}Q${cx - 4},${cy} ${cx - 8},${cy + 12}`, fill: 'none', stroke: GRAY.dark, 'stroke-width': 2, 'stroke-opacity': 0.4 }, k.inner);
    el('path', { d: `M${cx + 6},${cy - 14}Q${cx + 11},${cy - 2} ${cx + 7},${cy + 13}`, fill: 'none', stroke: '#fff', 'stroke-width': 1.8, 'stroke-opacity': 0.5 }, k.inner);
  } };

  /* ───────── label kertas gantung ───────── */
  F.sprites['bungkus-label'] = { w: 250, h: 140, seed: 705, draw(svg, R) {
    // bentuk label: sudut kiri dipotong, lubang di kiri
    const d = 'M34,22H226Q236,22 236,32V108Q236,118 226,118H34L10,94V46Z';
    const CREAM = { base: '#f3e6cb', light: '#fffaec', dark: '#d8c29a' };
    const p = sheet(svg, d, R, { pal: CREAM, box: [10, 22, 226, 96], n: 60, cast: 'cast', dir: [1, 0.04], width: [8, 16], len: [30, 110], op: [0.2, 0.35] });
    el('path', { d, fill: linGrad(svg, [[0, '#ffffff', 0.25], [1, '#5a3a1e', 0.12]], 10, 22, 236, 118) }, p.inner);
    // garis tepi tipis seperti kartu nama lama
    el('path', { d: 'M40,30H224Q228,30 228,34V106Q228,110 224,110H40L18,90V50Z', fill: 'none', stroke: '#b88a58', 'stroke-width': 1.2, 'stroke-opacity': 0.55 }, p.inner);
    // cincin penguat lubang (kertas cokelat) + lubang
    el('circle', { cx: 32, cy: 70, r: 11, fill: '#b48a58' }, svg);
    el('circle', { cx: 32, cy: 70, r: 11, fill: 'none', stroke: '#7a5530', 'stroke-width': 1.2, 'stroke-opacity': 0.6 }, svg);
    el('circle', { cx: 32, cy: 70, r: 5, fill: '#3a2414', 'fill-opacity': 0.55 }, svg);
    // benang goni dari lubang ke arah kiri-atas (ke tali bingkisan)
    const th = el('g', { filter: 'url(#cast)', fill: 'none', 'stroke-linecap': 'round' }, svg);
    el('path', { d: 'M30,66Q16,40 2,8', stroke: '#8a6a3e', 'stroke-width': 4.4 }, th);
    el('path', { d: 'M30,66Q16,40 2,8', stroke: '#c4a26c', 'stroke-width': 2.6 }, th);
    el('path', { d: 'M34,66Q24,36 12,4', stroke: '#8a6a3e', 'stroke-width': 3.4, 'stroke-opacity': 0.8 }, th);
  } };
})();
