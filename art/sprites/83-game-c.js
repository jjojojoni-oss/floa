/* Mini-game untuk Our Memories, Your Bento, Our Scrapbook (+ Anniversary memakai lukisan yang sudah ada):
   semut lucu + sebutir nasi, kucing yang tidur meringkuk, remot TV, kotak sekring, senter,
   buah persik, tutup botol, dan maskot hati gembul (biasa & pusing). Gaya gouache seperti lauk bento (54-bento.js): bidang bersapuan pendek,
   terang dari kiri-atas, bayangan cokelat hangat. */
(() => {
  const F = window.FLOA;
  const { el, painted, mix, jitter, leaf } = F;
  const WARM = '#3a1d12';
  const FACE = '#3b1f14';
  const rr = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  const circle = (cx, cy, r) => `M${cx - r},${cy}a${r},${r} 0 1 0 ${r * 2},0a${r},${r} 0 1 0 ${-r * 2},0Z`;
  const oval = (cx, cy, rx, ry) => `M${cx - rx},${cy}a${rx},${ry} 0 1 0 ${rx * 2},0a${rx},${ry} 0 1 0 ${-rx * 2},0Z`;

  function shape(parent, d, box, cols, R, { n = 40, dir = [1, 0.15], width = [5, 12], len = [12, 44], filter = 'impastoFine', cast = 'cast', transform, spread = 0.6 } = {}) {
    const a0 = Math.atan2(dir[1], dir[0]);
    return painted(parent, d, {
      base: cols[1], n, R, filter, cast, transform,
      stroke: () => {
        const u = R(), v = R(), x = box[0] + u * box[2], y = box[1] + v * box[3], L = len[0] + R() * (len[1] - len[0]);
        const a = a0 + (R() - 0.5) * spread;
        const lit = u + v < 0.85 + (R() - 0.5) * 0.5;
        const c = mix(cols[1], lit ? cols[2] : cols[0], 0.15 + R() * 0.65);
        return { d: `M${x},${y}l${Math.cos(a) * L},${Math.sin(a) * L}`, color: jitter(c, 6, R), width: width[0] + R() * (width[1] - width[0]), opacity: 0.4 + R() * 0.45 };
      },
    });
  }
  function volume(inner, d, { w = 12, shade = 0.16, light = 0.5, lc = '#ffffff' } = {}) {
    el('path', { d, fill: 'none', stroke: WARM, 'stroke-width': w, 'stroke-opacity': shade, transform: `translate(${-w * 0.3} ${-w * 0.36})`, filter: 'url(#blur2)' }, inner);
    el('path', { d, fill: 'none', stroke: lc, 'stroke-width': w * 0.5, 'stroke-opacity': light, transform: `translate(${w * 0.26} ${w * 0.3})`, filter: 'url(#blur2)' }, inner);
  }
  const gloss = (g, d, w = 5, o = 0.6) => el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-opacity': o, filter: 'url(#blur2)' }, g);
  const line = (g, d, color, w, o = 1) => el('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-opacity': o }, g);
  function eye(g, x, y, r = 5) {
    el('ellipse', { cx: x, cy: y, rx: r, ry: r * 1.25, fill: FACE }, g);
    el('circle', { cx: x - r * 0.3, cy: y - r * 0.45, r: r * 0.36, fill: '#fff' }, g);
  }
  const blush = (g, x, y, rx = 7, ry = 4.5) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#ff8f8f', opacity: 0.55, filter: 'url(#blur2)' }, g);

  /* ───────────────────────── semut (menghadap kiri, berjalan) ───────────────────────── */
  const ANT = ['#3d1a10', '#6e3420', '#b3683e'];
  function ant(g, R) {
    // kaki: tiga pasang, garis gelap yang sedikit menekuk
    const legs = el('g', { filter: 'url(#cast)' }, g);
    const lg = el('g', { filter: 'url(#impastoFine)' }, legs);
    [[66, 64, 50, 92, 40, 96], [80, 66, 78, 94, 70, 100], [96, 64, 112, 90, 120, 98]].forEach(([x0, y0, x1, y1, x2, y2]) => {
      line(lg, `M${x0},${y0}Q${(x0 + x1) / 2 - 4},${y0 + 10} ${x1},${y1}L${x2},${y2}`, '#4a2214', 5.5);
      line(lg, `M${x0 + 6},${y0 + 1}Q${(x0 + x1) / 2 + 6},${y0 + 12} ${x1 + 10},${y1 + 1}L${x2 + 10},${y2 - 1}`, '#5a2a18', 4.5, 0.85);
    });
    // perut (belakang), dada, kepala besar
    const abd = oval(118, 58, 30, 22);
    const a = shape(g, abd, [88, 36, 60, 44], ANT, R, { n: 30, width: [5, 10], len: [10, 26] });
    volume(a.inner, abd, { w: 12, shade: 0.3, light: 0.45, lc: '#e0a070' });
    for (const x of [110, 124]) line(a.inner, `M${x},40Q${x + 5},58 ${x},76`, '#2e120a', 2.4, 0.4);
    gloss(g, 'M100,46q8,-8 22,-8', 4, 0.5);
    const th = oval(84, 60, 13, 11);
    const t = shape(g, th, [71, 49, 26, 22], ANT, R, { n: 12, width: [4, 8], len: [6, 14] });
    volume(t.inner, th, { w: 8, shade: 0.28, light: 0.4, lc: '#e0a070' });
    const hd = circle(52, 50, 27);
    const h = shape(g, hd, [25, 23, 54, 54], ANT, R, { n: 34, width: [5, 10], len: [8, 22], spread: 1.2 });
    volume(h.inner, hd, { w: 12, shade: 0.28, light: 0.5, lc: '#f0b080' });
    gloss(g, 'M34,38q6,-10 18,-12', 5, 0.55);
    // antena melengkung dengan ujung bulat
    line(g, 'M46,26Q36,4 18,8', '#3d1a10', 4);
    line(g, 'M58,25Q62,2 80,4', '#3d1a10', 4);
    el('circle', { cx: 17, cy: 8, r: 5, fill: '#6e3420' }, g);
    el('circle', { cx: 81, cy: 4, r: 5, fill: '#6e3420' }, g);
    // wajah: mata besar berbinar, pipi merah, senyum
    const f = el('g', {}, g);
    for (const [x, y] of [[38, 48], [58, 47]]) {
      el('ellipse', { cx: x, cy: y, rx: 8, ry: 9.5, fill: '#fffaf0' }, f);
      el('ellipse', { cx: x - 1.5, cy: y + 1, rx: 5, ry: 6.6, fill: FACE }, f);
      el('circle', { cx: x - 3, cy: y - 2, r: 2, fill: '#fff' }, f);
    }
    blush(f, 34, 62, 6, 4);
    blush(f, 62, 61, 6, 4);
    line(f, 'M42,64q6,6 12,0', '#2a0f08', 2.6);
  }
  F.sprites['game-semut'] = { w: 160, h: 110, seed: 831, draw(svg, R) { ant(el('g', { transform: 'translate(4 6)' }, svg), R); } };

  /* sebutir nasi: putih mengilap, sedikit transparan di tepi */
  F.sprites['game-nasi'] = { w: 64, h: 48, seed: 832, draw(svg, R) {
    const g = el('g', { transform: 'translate(32 24) rotate(-14)' }, svg);
    const d = oval(0, 0, 22, 13);
    const p = shape(g, d, [-22, -13, 44, 26], ['#d9d2c2', '#f6f2e8', '#ffffff'], R, { n: 14, width: [3, 7], len: [6, 16] });
    volume(p.inner, d, { w: 7, shade: 0.22, light: 0.8 });
    gloss(g, 'M-12,-5q8,-5 16,-4', 3, 0.9);
  } };

  /* ───────────────────────── kucing tidur meringkuk ───────────────────────── */
  const CAT = ['#b9662a', '#e8954a', '#ffd29a'];
  F.sprites['game-kucing-tidur'] = { w: 240, h: 160, seed: 833, draw(svg, R) {
    const g = el('g', { transform: 'translate(4 6)' }, svg);
    // ekor melingkar di depan badan
    const tail = 'M40,116C20,112 14,90 30,82C38,78 44,84 40,90C36,96 46,104 62,104L150,108C160,110 160,124 150,126L60,126C52,126 46,122 40,116Z';
    // badan bulat telur
    const body = oval(122, 86, 92, 52);
    const b = shape(g, body, [30, 34, 184, 104], CAT, R, { n: 70, dir: [1, 0.2], width: [7, 14], len: [16, 46], spread: 0.9, cast: 'castBig' });
    volume(b.inner, body, { w: 18, shade: 0.24, light: 0.45, lc: '#fff0d0' });
    // belang
    for (const [x, c] of [[150, 4], [172, 6], [194, 4], [128, 2]]) line(b.inner, `M${x},40Q${x + c * 3},70 ${x - 4},${110}`, '#9c4f1c', 7, 0.45);
    el('ellipse', { cx: 90, cy: 120, rx: 60, ry: 16, fill: '#fff3dc', opacity: 0.6, filter: 'url(#blur2)' }, b.inner);
    const t = shape(g, tail, [14, 78, 148, 48], CAT, R, { n: 26, dir: [1, 0], width: [5, 10], len: [12, 30] });
    volume(t.inner, tail, { w: 10, shade: 0.22, light: 0.4, lc: '#fff0d0' });
    for (const x of [80, 104, 128]) line(t.inner, `M${x},104L${x - 4},126`, '#9c4f1c', 6, 0.5);
    // kepala di kiri, bertumpu pada badan
    const hd = 'M30,72C26,46 44,30 66,30C88,30 104,46 100,72C98,92 82,100 64,100C46,100 32,92 30,72Z';
    const ear1 = 'M36,48L32,16L58,36Z';
    const ear2 = 'M74,34L98,14L96,48Z';
    for (const e of [ear1, ear2]) {
      const p = shape(g, e, [30, 12, 70, 40], CAT, R, { n: 10, width: [4, 8], len: [6, 16] });
      el('path', { d: e, fill: '#f6a7a0', opacity: 0.6, transform: 'translate(2 6) scale(0.98)', filter: 'url(#blur2)' }, p.inner);
    }
    const h = shape(g, hd, [26, 28, 78, 74], CAT, R, { n: 40, width: [6, 12], len: [10, 28], spread: 1.1 });
    volume(h.inner, hd, { w: 14, shade: 0.22, light: 0.5, lc: '#fff0d0' });
    line(h.inner, 'M58,32Q62,40 60,48M68,32Q70,40 70,48', '#9c4f1c', 4, 0.5);
    el('ellipse', { cx: 64, cy: 82, rx: 20, ry: 12, fill: '#fff3dc', opacity: 0.75, filter: 'url(#blur2)' }, h.inner);
    // mata terpejam ^^, hidung, mulut, kumis
    const f = el('g', {}, g);
    line(f, 'M42,66q7,6 14,0', FACE, 3.4);
    line(f, 'M70,66q7,6 14,0', FACE, 3.4);
    el('path', { d: 'M59,76l5,0l-2.5,3.4z', fill: '#d9706a' }, f);
    line(f, 'M61.5,79.5q-3,5 -7,3M61.5,79.5q3,5 7,3', FACE, 2.2);
    for (const [x0, y0, x1, y1] of [[40, 80, 18, 76], [40, 84, 20, 88], [84, 80, 106, 76], [84, 84, 104, 88]]) line(f, `M${x0},${y0}L${x1},${y1}`, '#7a4a30', 1.6, 0.7);
    blush(f, 40, 76, 7, 4);
    blush(f, 86, 76, 7, 4);
    // kaki depan kecil terlipat
    const paw = oval(76, 106, 18, 9);
    const pw = shape(g, paw, [58, 97, 36, 18], ['#d6a070', '#fff0d8', '#ffffff'], R, { n: 10, width: [3, 6], len: [6, 14] });
    volume(pw.inner, paw, { w: 6, shade: 0.2, light: 0.5 });
  } };

  /* ───────────────────────── remot TV ───────────────────────── */
  F.sprites['game-remot'] = { w: 100, h: 210, seed: 834, draw(svg, R) {
    const g = el('g', { transform: 'translate(50 105) rotate(-12) translate(-50 -105)' }, svg);
    const d = rr(22, 14, 56, 182, 20);
    const p = shape(g, d, [22, 14, 56, 182], ['#1e1b22', '#3b3742', '#6d6876'], R, { n: 50, dir: [0.1, 1], width: [5, 10], len: [14, 40], cast: 'castBig' });
    volume(p.inner, d, { w: 12, shade: 0.4, light: 0.35, lc: '#b7b2c0' });
    // tombol power merah + tombol-tombol kecil berwarna
    const power = circle(50, 40, 8);
    const pw = shape(g, power, [42, 32, 16, 16], ['#8f1f1a', '#d9392c', '#ff8a6e'], R, { n: 6, width: [3, 5], len: [4, 8], cast: false });
    volume(pw.inner, power, { w: 4, shade: 0.3, light: 0.5 });
    const pad = circle(50, 82, 16);
    shape(g, pad, [34, 66, 32, 32], ['#4c4856', '#8a8594', '#c9c4d2'], R, { n: 10, width: [3, 6], len: [6, 14], cast: false });
    el('circle', { cx: 50, cy: 82, r: 6, fill: '#56525e' }, g);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const x = 36 + c * 14, y = 116 + r * 16;
      el('rect', { x: x - 5, y: y - 4, width: 10, height: 8, rx: 3, fill: jitter(r === 3 ? ['#e05a4a', '#4f9b5a', '#4f7fd0'][c] : '#9b96a4', 4, R), opacity: 0.95 }, g);
    }
    gloss(g, 'M30,30Q32,20 42,18', 4, 0.5);
    // wajah kaget: ketahuan ngumpet
    const f = el('g', {}, g);
    for (const x of [40, 60]) { el('circle', { cx: x, cy: 104, r: 5.6, fill: '#fffaf0' }, f); el('circle', { cx: x, cy: 105, r: 3.2, fill: FACE }, f); el('circle', { cx: x - 1.2, cy: 103.6, r: 1.1, fill: '#fff' }, f); }
    el('ellipse', { cx: 50, cy: 116, rx: 3.4, ry: 4.4, fill: FACE, opacity: 0.9 }, f);
    blush(f, 34, 112, 5, 3); blush(f, 66, 112, 5, 3);
    // debu & remah: sudah lama nyelip di sofa
    for (let i = 0; i < 9; i++) el('circle', { cx: 28 + R() * 44, cy: 150 + R() * 40, r: 1.4 + R() * 1.6, fill: '#e8dccb', opacity: 0.5 }, g);
  } };

  /* ───────────────────────── kotak sekring (MCB) ───────────────────────── */
  F.sprites['game-sekring'] = { w: 160, h: 180, seed: 836, draw(svg, R) {
    const g = el('g', { transform: 'translate(8 8)' }, svg);
    const d = rr(6, 6, 132, 156, 12);
    const p = shape(g, d, [6, 6, 132, 156], ['#9fa3a0', '#d9dcd6', '#f7f8f2'], R, { n: 50, dir: [0.1, 1], width: [6, 12], len: [16, 44], cast: 'castBig' });
    volume(p.inner, d, { w: 14, shade: 0.25, light: 0.5 });
    // label petir kuning
    const bolt = 'M66,22L52,50H66L58,74L86,40H70L78,22Z';
    shape(g, bolt, [52, 22, 34, 52], ['#c98a12', '#f6c33c', '#ffe58a'], R, { n: 10, width: [3, 6], len: [6, 14], cast: false });
    line(g, bolt, '#7a5208', 2, 0.6);
    // tiga saklar: yang tengah turun (merah) = biang kerok
    [[38, false], [72, true], [106, false]].forEach(([x, down]) => {
      const slot = rr(x - 12, 92, 24, 50, 5);
      el('path', { d: slot, fill: '#4a4d4a', opacity: 0.85 }, g);
      const ly = down ? 120 : 96;
      const lev = rr(x - 9, ly, 18, 20, 4);
      const lv = shape(g, lev, [x - 9, ly, 18, 20], down ? ['#8f1f1a', '#d9392c', '#ff8a6e'] : ['#5f6a5f', '#9cb09a', '#d8ecd4'], R, { n: 6, width: [3, 5], len: [4, 8], cast: 'cast' });
      volume(lv.inner, lev, { w: 4, shade: 0.3, light: 0.5 });
    });
    gloss(g, 'M16,20Q18,12 30,12', 4, 0.6);
    // wajah ngantuk: sekringnya ketiduran
    const f = el('g', {}, g);
    line(f, 'M98,58q6,5 12,0', FACE, 3);
    line(f, 'M114,58q6,5 12,0', FACE, 3);
    el('ellipse', { cx: 112, cy: 72, rx: 3.2, ry: 4, fill: FACE, opacity: 0.85 }, f);
    blush(f, 98, 68, 5, 3); blush(f, 126, 68, 5, 3);
  } };

  /* ───────────────────────── senter kuning ───────────────────────── */
  F.sprites['game-senter'] = { w: 220, h: 110, seed: 837, draw(svg, R) {
    const g = el('g', { transform: 'translate(110 55) rotate(-16) translate(-110 -55)' }, svg);
    // berkas cahaya
    el('path', { d: 'M150,40L216,10L216,100L150,70Z', fill: '#fff2b0', opacity: 0.55, filter: 'url(#softer)' }, g);
    const barrel = rr(22, 38, 104, 34, 14);
    const b = shape(g, barrel, [22, 38, 104, 34], ['#c98a12', '#f6c33c', '#ffe58a'], R, { n: 30, dir: [1, 0], width: [5, 10], len: [14, 40], cast: 'castBig' });
    volume(b.inner, barrel, { w: 10, shade: 0.28, light: 0.5 });
    for (const x of [36, 44, 52]) line(b.inner, `M${x},40V70`, '#a06a0c', 2.2, 0.45);
    const head = 'M120,32L156,22Q164,22 164,30V80Q164,88 156,88L120,78Z';
    const h = shape(g, head, [118, 20, 48, 70], ['#6e6a72', '#b8b4bd', '#f2eff5'], R, { n: 20, dir: [0.1, 1], width: [4, 8], len: [8, 22] });
    volume(h.inner, head, { w: 8, shade: 0.3, light: 0.6 });
    el('ellipse', { cx: 162, cy: 55, rx: 5, ry: 30, fill: '#fffbe0', opacity: 0.95 }, g);
    const btn = rr(70, 30, 18, 10, 4);
    shape(g, btn, [70, 30, 18, 10], ['#8f1f1a', '#d9392c', '#ff8a6e'], R, { n: 4, width: [3, 5], len: [4, 8], cast: false });
    gloss(g, 'M30,44H110', 4, 0.5);
  } };

  /* ───────────────────────── buah persik (umpan di scrapbook) ───────────────────────── */
  F.sprites['game-persik'] = { w: 170, h: 170, seed: 838, draw(svg, R) {
    const g = el('g', { transform: 'translate(0 6)' }, svg);
    const d = 'M85,46C70,30 36,40 32,78C28,114 56,146 85,146C114,146 142,114 138,78C134,40 100,30 85,46Z';
    const p = shape(g, d, [30, 34, 110, 112], ['#d0503a', '#f59a62', '#ffd8a4'], R, { n: 56, dir: [0.4, 1], width: [6, 13], len: [14, 36], spread: 1.1 });
    el('ellipse', { cx: 112, cy: 100, rx: 30, ry: 34, fill: '#e0473c', opacity: 0.45, filter: 'url(#blur2)' }, p.inner);
    volume(p.inner, d, { w: 16, shade: 0.24, light: 0.5, lc: '#fff0d0' });
    line(p.inner, 'M85,50Q74,92 84,140', '#b8402a', 4, 0.45);
    gloss(g, 'M50,72q4,-16 18,-22', 6, 0.55);
    const c = el('g', { transform: 'translate(86 44)' }, g);
    leaf(c, { len: 44, w: 20, dark: '#1f5a30', mid: '#3d8a4c', light: '#a8d88e', R, n: 10, transform: 'rotate(-40)', cast: true });
    line(c, 'M0,4q2,-10 -2,-14', '#5a3a1e', 4.5);
  } };

  /* ───────────────────────── tutup botol merah (umpan) ───────────────────────── */
  F.sprites['game-tutup-botol'] = { w: 120, h: 120, seed: 839, draw(svg, R) {
    let d = '';
    const n = 21, cx = 60, cy = 60;
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? 44 : 49;
      d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
    }
    d += 'Z';
    const p = shape(svg, d, [11, 11, 98, 98], ['#8f1f1a', '#d9392c', '#ff8a6e'], R, { n: 40, width: [5, 10], len: [10, 26], spread: 2, cast: 'castBig' });
    volume(p.inner, d, { w: 10, shade: 0.3, light: 0.4 });
    el('circle', { cx: 60, cy: 60, r: 34, fill: 'none', stroke: '#7a1610', 'stroke-width': 3, 'stroke-opacity': 0.45 }, p.inner);
    el('circle', { cx: 60, cy: 60, r: 26, fill: '#fff3e0', opacity: 0.85 }, svg);
    // tulisan iseng di tutup: "coba lagi"? cukup bintang kecil
    el('path', { d: 'M60,46l4,9 10,1 -7.5,6.5 2.4,9.6 -8.9,-5.2 -8.9,5.2 2.4,-9.6 -7.5,-6.5 10,-1z', fill: '#d9392c', opacity: 0.85 }, svg);
    gloss(svg, 'M26,44q6,-14 22,-20', 5, 0.55);
  } };

  /* ───────────────────────── maskot hati gembul (biasa & pusing) ───────────────────────── */
  function heartie(svg, R, dizzy) {
    const g = el('g', { transform: 'translate(80 76)' }, svg);
    const d = 'M0,58C-34,34 -62,10 -56,-22C-50,-52 -16,-58 0,-30C16,-58 50,-52 56,-22C62,10 34,34 0,58Z';
    const p = shape(g, d, [-62, -58, 124, 116], ['#a3152a', '#e2394a', '#ff8a8c'], R, { n: 60, dir: [0.4, 1], width: [7, 14], len: [14, 38], spread: 1.1, cast: 'castBig' });
    volume(p.inner, d, { w: 18, shade: 0.28, light: 0.45, lc: '#ffc6cd' });
    gloss(g, 'M-38,-30q4,-14 18,-16', 8, 0.6);
    const f = el('g', {}, g);
    if (dizzy) {
      for (const x of [-20, 20]) line(f, `M${x},-6a3,3 0 1 1 3,3a6,6 0 1 1 -6,-6a9,9 0 1 1 9,9`, FACE, 2.8);
      el('ellipse', { cx: 0, cy: 18, rx: 6, ry: 4.5, fill: FACE }, f);
    } else {
      eye(f, -18, -4, 6.4); eye(f, 18, -4, 6.4);
      line(f, 'M-8,12q8,8 16,0', FACE, 3.2);
    }
    blush(f, -32, 10, 9, 5.5); blush(f, 32, 10, 9, 5.5);
  }
  F.sprites['game-hati-imut'] = { w: 160, h: 150, seed: 840, draw(svg, R) { heartie(svg, R, false); } };
  F.sprites['game-hati-pusing'] = { w: 160, h: 150, seed: 840, draw(svg, R) { heartie(svg, R, true); } };
})();
