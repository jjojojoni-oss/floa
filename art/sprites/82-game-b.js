/* Sprite mini-game untuk Setumpuk Kenangan (cicak), Mau (hati gugup), Plester (awan & matahari),
   dan Toga (merpati, dahan, peci Ayah). Wajah tokoh sengaja TIDAK dilukis: ekspresinya digambar
   di atas lewat SVG supaya bisa berubah (gugup → berani, cemberut → malu). */
(() => {
  const F = window.FLOA;
  const { el, painted, mix, jitter, linGrad, radGrad, leaf } = F;

  /** sapuan kuas acak di dalam kotak, mengikuti arah `dir` */
  const brush = (pal, box, { dir = [0.2, 1], len = [10, 30], width = [4, 10], op = [0.35, 0.5] } = {}) => (i, n, R) => {
    const x = box[0] + R() * box[2], y = box[1] + R() * box[3];
    const m = Math.hypot(dir[0], dir[1]);
    const L = len[0] + R() * (len[1] - len[0]);
    const c = R() < 0.5 ? mix(pal.base, pal.light, R() * 0.7) : mix(pal.base, pal.dark, R() * 0.5);
    const bend = (R() - 0.5) * L * 0.3;
    return {
      d: `M${x},${y}q${(dir[0] / m) * L * 0.5 + bend},${(dir[1] / m) * L * 0.5} ${(dir[0] / m) * L},${(dir[1] / m) * L}`,
      color: jitter(c, 6, R),
      width: width[0] + R() * (width[1] - width[0]),
      opacity: op[0] + R() * op[1],
    };
  };
  /** cahaya kiri-atas → teduh kanan-bawah di atas bidang */
  const shade = (svg, inner, d, x, y, w, h, a = 0.3, b = 0.22) =>
    el('path', { d, fill: linGrad(svg, [[0, '#fff6e6', a], [0.55, '#fff6e6', 0], [1, '#3a1d12', b]], x, y, x + w, y + h) }, inner);

  /* ───────── cicak (tampak atas, kepala ke atas; ekor terpisah) ───────── */
  const CICAK = { base: '#d8c19f', light: '#f4e7cf', dark: '#a3865f' };
  F.sprites['game-cicak'] = { w: 160, h: 200, seed: 821, draw(svg, R) {
    const g = el('g', { filter: 'url(#cast)' }, svg);
    // kaki pendek gemuk + jari bulat merah muda
    const legs = [
      [[60, 98], [36, 92], [26, 76]],
      [[100, 98], [124, 92], [134, 76]],
      [[62, 150], [38, 158], [30, 176]],
      [[98, 150], [122, 158], [130, 176]],
    ];
    const lg = el('g', { filter: 'url(#impastoFine)' }, g);
    for (const [a, b, c] of legs) {
      el('path', { d: `M${a[0]},${a[1]}Q${b[0]},${b[1]} ${c[0]},${c[1]}`, fill: 'none', stroke: CICAK.dark, 'stroke-width': 17, 'stroke-linecap': 'round' }, lg);
      el('path', { d: `M${a[0]},${a[1]}Q${b[0]},${b[1]} ${c[0]},${c[1]}`, fill: 'none', stroke: CICAK.base, 'stroke-width': 13, 'stroke-linecap': 'round' }, lg);
      const dx = c[0] - b[0], dy = c[1] - b[1], m = Math.hypot(dx, dy) || 1;
      for (const k of [-0.75, 0, 0.75]) {
        const ux = dx / m, uy = dy / m;
        const tx = c[0] + (ux * Math.cos(k) - uy * Math.sin(k)) * 9, ty = c[1] + (ux * Math.sin(k) + uy * Math.cos(k)) * 9;
        el('circle', { cx: tx, cy: ty, r: 5, fill: '#f3b9ab', stroke: '#c08472', 'stroke-width': 1 }, lg);
      }
    }
    // badan bulat gemuk seperti kacang
    const body = 'M80,74C108,74 116,100 114,124C112,152 102,178 80,184C58,178 48,152 46,124C44,100 52,74 80,74Z';
    const p = painted(g, body, { base: CICAK.base, n: 80, R, filter: 'impastoFine', stroke: brush(CICAK, [44, 72, 72, 114], { dir: [0.1, 1], len: [12, 30], width: [6, 12] }) });
    el('path', { d: body, fill: radGrad(svg, [[0, '#fff8ea', 0.5], [0.5, '#fff8ea', 0], [1, '#5a3d22', 0.28]], 66, 104, 90) }, p.inner);
    for (let i = 0; i < 12; i++) el('ellipse', { cx: 62 + R() * 36, cy: 100 + R() * 72, rx: 2 + R() * 2.6, ry: 1.6 + R() * 1.8, fill: '#9a7b54', 'fill-opacity': 0.3 + R() * 0.2 }, p.inner);
    // kepala besar bundar
    const head = 'M80,6C112,6 126,26 124,50C122,76 104,90 80,90C56,90 38,76 36,50C34,26 48,6 80,6Z';
    const h = painted(g, head, { base: CICAK.base, n: 70, R, filter: 'impastoFine', stroke: brush(CICAK, [36, 6, 88, 84], { dir: [1, 0.2], len: [10, 26], width: [6, 11] }) });
    el('path', { d: head, fill: radGrad(svg, [[0, '#fff8ea', 0.55], [0.5, '#fff8ea', 0], [1, '#5a3d22', 0.22]], 66, 34, 80) }, h.inner);
    // mata besar berkilau
    for (const x of [58, 102]) {
      el('circle', { cx: x, cy: 40, r: 16, fill: '#f6ecd8', stroke: CICAK.dark, 'stroke-width': 2 }, g);
      el('circle', { cx: x + (x < 80 ? 1.5 : -1.5), cy: 42, r: 11.5, fill: '#2b1d16' }, g);
      el('circle', { cx: x - 3, cy: 37, r: 4.4, fill: '#fff' }, g);
      el('circle', { cx: x + 4, cy: 46, r: 1.8, fill: '#fff', 'fill-opacity': 0.85 }, g);
    }
    // senyum + pipi merona
    el('path', { d: 'M71,68Q80,75 89,68', fill: 'none', stroke: '#6b4a32', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
    el('ellipse', { cx: 52, cy: 63, rx: 7, ry: 4.2, fill: '#f29a90', 'fill-opacity': 0.6 }, g);
    el('ellipse', { cx: 108, cy: 63, rx: 7, ry: 4.2, fill: '#f29a90', 'fill-opacity': 0.6 }, g);
  } };

  /* ekor cicak: pangkal di atas tengah (30,0), melengkung ke bawah */
  F.sprites['game-cicak-ekor'] = { w: 70, h: 130, seed: 822, draw(svg, R) {
    const d = 'M20,2C30,0 44,0 48,6C50,34 42,62 48,86C52,102 60,114 54,124C48,130 40,126 38,118C32,100 24,82 22,60C20,38 14,18 20,2Z';
    const p = painted(svg, d, { base: CICAK.base, n: 50, R, filter: 'impastoFine', cast: 'cast', stroke: brush(CICAK, [14, 0, 44, 128], { dir: [0.1, 1], len: [10, 24], width: [4, 8] }) });
    shade(svg, p.inner, d, 14, 0, 44, 128);
    for (let i = 0; i < 8; i++) el('path', { d: `M${24 + i},${16 + i * 13}q9,-3 ${16 - i},0`, fill: 'none', stroke: '#9a7b54', 'stroke-width': 1.8, 'stroke-opacity': 0.3 }, p.inner);
  } };

  /* ───────── hati gugup (Mau): badan hati bertangan & berkaki kecil, tanpa wajah ───────── */
  F.sprites['game-hati-gugup'] = { w: 220, h: 236, seed: 823, draw(svg, R) {
    const RED = { base: '#ef6a86', light: '#ffc2cf', dark: '#c2385a' };
    const g = el('g', { filter: 'url(#castBig)' }, svg);
    // kaki kurus + sepatu bulat
    const legs = el('g', { filter: 'url(#impastoFine)' }, g);
    for (const x of [92, 128]) {
      el('path', { d: `M${x},176L${x + (x < 110 ? -3 : 3)},210`, stroke: '#5a1730', 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none' }, legs);
      el('ellipse', { cx: x + (x < 110 ? -9 : 9), cy: 218, rx: 18, ry: 11, fill: '#5a1730' }, legs);
      el('ellipse', { cx: x + (x < 110 ? -13 : 5), cy: 214, rx: 7, ry: 3, fill: '#fff', 'fill-opacity': 0.35 }, legs);
    }
    // tangan kecil
    for (const [x, sx] of [[34, -1], [186, 1]]) {
      el('path', { d: `M${x},108q${sx * 18},8 ${sx * 22},30`, stroke: '#c2385a', 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none', filter: 'url(#impastoFine)' }, g);
      el('circle', { cx: x + sx * 22, cy: 140, r: 7.5, fill: '#ef6a86', stroke: '#c2385a', 'stroke-width': 1.5 }, g);
    }
    const heart = 'M110,196C80,172 30,140 28,92C26,56 52,34 78,36C94,37 104,48 110,60C116,48 126,37 142,36C168,34 194,56 192,92C190,140 140,172 110,196Z';
    const p = painted(g, heart, { base: RED.base, n: 110, R, stroke: brush(RED, [28, 34, 164, 160], { dir: [0.6, 1], len: [18, 48], width: [7, 16] }) });
    el('path', { d: heart, fill: radGrad(svg, [[0, '#fff1f3', 0.55], [0.45, '#fff1f3', 0], [1, '#7a1530', 0.28]], 78, 70, 170) }, p.inner);
    // kilau
    el('path', { d: 'M58,70q10,-18 30,-18', fill: 'none', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-opacity': 0.55, filter: 'url(#blur2)' }, p.inner);
  } };

  /* ───────── awan mendung (Plester), tanpa wajah ───────── */
  F.sprites['game-awan'] = { w: 280, h: 170, seed: 824, draw(svg, R) {
    const C = { base: '#9ea6b8', light: '#dde2ec', dark: '#6a7389' };
    const d = 'M48,140C20,140 8,118 16,98C22,82 40,74 56,78C58,50 82,32 108,38C122,18 156,14 178,30C196,20 226,26 236,50C260,52 274,74 266,98C272,122 254,142 230,140Z';
    const p = painted(svg, d, { base: C.base, n: 130, R, cast: 'castBig', stroke: brush(C, [10, 14, 262, 128], { dir: [1, -0.15], len: [24, 60], width: [10, 22], op: [0.3, 0.45] }) });
    el('path', { d, fill: linGrad(svg, [[0, '#f4f6fb', 0.55], [0.55, '#f4f6fb', 0], [1, '#3b4256', 0.38]], 0, 14, 0, 142) }, p.inner);
    // gumpalan terang di puncak
    for (const [x, y, r] of [[106, 56, 26], [168, 46, 30], [222, 66, 22], [62, 96, 18]]) {
      el('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.7, fill: '#eef1f7', 'fill-opacity': 0.4, filter: 'url(#soft)' }, p.inner);
    }
  } };

  /* ───────── matahari malu-malu (Plester), tanpa wajah ───────── */
  F.sprites['game-matahari'] = { w: 240, h: 240, seed: 825, draw(svg, R) {
    const S = { base: '#ffc94f', light: '#fff1b4', dark: '#ef9a2c' };
    const cx = 120, cy = 120;
    const rays = el('g', { filter: 'url(#impasto)' }, svg);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + R() * 0.08;
      const r1 = 66, r2 = 104 + R() * 12, w = 0.13;
      const p1 = [cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1], p2 = [cx + Math.cos(a) * r2, cy + Math.sin(a) * r2], p3 = [cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1];
      void p1; void p2; void p3;
      const rx = cx + Math.cos(a) * (r1 + 22), ry = cy + Math.sin(a) * (r1 + 22);
      el('ellipse', { cx: rx, cy: ry, rx: 15, ry: 9, transform: `rotate(${(a * 180) / Math.PI} ${rx} ${ry})`, fill: i % 2 ? '#ffd86e' : '#f8b13c' }, rays);
    }
    const d = `M${cx - 74},${cy}a74,74 0 1,0 148,0a74,74 0 1,0 -148,0Z`;
    const p = painted(svg, d, { base: S.base, n: 110, R, cast: 'cast', stroke: brush(S, [46, 46, 148, 148], { dir: [1, 0.4], len: [20, 50], width: [8, 16] }) });
    el('path', { d, fill: radGrad(svg, [[0, '#fffbe6', 0.6], [0.5, '#fffbe6', 0], [1, '#c96a1c', 0.3]], 96, 92, 120) }, p.inner);
  } };

  /* ───────── merpati (Toga): badan + sayap terpisah supaya bisa dikepak ───────── */
  const DOVE = { base: '#aab1c0', light: '#e7eaf1', dark: '#6f7789' };
  F.sprites['game-merpati'] = { w: 240, h: 160, seed: 826, draw(svg, R) {
    const g = el('g', { filter: 'url(#cast)' }, svg);
    // ekor kipas
    const tail = 'M58,92L8,78C4,88 6,104 14,112L60,108Z';
    painted(g, tail, { base: '#8d95a7', n: 30, R, filter: 'impastoFine', stroke: brush(DOVE, [6, 76, 56, 36], { dir: [-1, 0.1], len: [14, 30], width: [4, 8] }) });
    el('path', { d: 'M12,82l46,14M10,96l48,6M14,108l46,-2', stroke: '#3a3f4c', 'stroke-opacity': 0.25, 'stroke-width': 2 }, g);
    // badan
    const body = 'M54,94C58,58 98,48 140,54C170,58 186,76 184,98C182,126 154,138 118,138C84,138 52,124 54,94Z';
    const p = painted(g, body, { base: DOVE.base, n: 80, R, filter: 'impastoFine', stroke: brush(DOVE, [54, 58, 130, 72], { dir: [1, 0.1], len: [16, 40], width: [6, 12] }) });
    shade(svg, p.inner, body, 54, 58, 130, 72, 0.35, 0.25);
    // leher berkilau hijau-ungu
    const neck = 'M150,62C164,56 178,58 186,66C192,74 188,92 178,98C170,90 160,80 150,62Z';
    const nk = painted(g, neck, { base: '#7e8aa0', n: 30, R, filter: 'impastoFine', stroke: (i, n, R2) => ({ d: `M${152 + R2() * 34},${60 + R2() * 34}l${4 + R2() * 6},${R2() * 6}`, color: R2() < 0.5 ? '#6fae98' : '#9a7bb8', width: 4 + R2() * 4, opacity: 0.55 }) });
    shade(svg, nk.inner, neck, 150, 56, 42, 42);
    // kepala
    const head = 'M176,58C178,40 194,32 208,38C220,44 222,60 212,70C202,78 182,76 176,58Z';
    const hd = painted(g, head, { base: '#9aa2b3', n: 30, R, filter: 'impastoFine', stroke: brush(DOVE, [174, 34, 48, 44], { dir: [1, 0.3], len: [8, 18], width: [4, 7] }) });
    shade(svg, hd.inner, head, 174, 34, 48, 44, 0.4, 0.2);
    // paruh + cere putih
    el('path', { d: 'M216,52l18,6l-17,5Z', fill: '#e3a14a', stroke: '#9c6a2c', 'stroke-width': 1 }, g);
    el('ellipse', { cx: 214, cy: 51, rx: 4, ry: 3, fill: '#f1ece2' }, g);
    // mata oranye kecil yang bulat
    el('circle', { cx: 201, cy: 51, r: 8.5, fill: '#f6efe2', stroke: '#6b3a12', 'stroke-width': 1.2 }, g);
    el('circle', { cx: 202, cy: 52, r: 6, fill: '#1e1410' }, g);
    el('circle', { cx: 199.5, cy: 49, r: 2.4, fill: '#fff' }, g);
    el('ellipse', { cx: 196, cy: 62, rx: 6, ry: 3.5, fill: '#f29a9a', 'fill-opacity': 0.55 }, g);
    // kaki merah muda terlipat
    el('path', { d: 'M108,136l-4,12M128,136l2,12', stroke: '#d4707a', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
  } };
  F.sprites['game-merpati-sayap'] = { w: 160, h: 120, seed: 827, draw(svg, R) {
    // sayap terangkat; pangkal di kanan-bawah (130,104)
    const d = 'M130,104C112,84 70,58 22,40C34,30 50,26 64,30C40,14 60,4 84,14C78,4 100,0 116,14C132,28 144,62 150,92Z';
    const p = painted(svg, d, { base: '#b7bdca', n: 70, R, filter: 'impastoFine', cast: 'cast', stroke: brush(DOVE, [20, 2, 132, 104], { dir: [-1, -0.6], len: [16, 40], width: [5, 10] }) });
    shade(svg, p.inner, d, 20, 2, 132, 104, 0.35, 0.22);
    // dua garis hitam khas merpati
    el('path', { d: 'M118,70q-22,-14 -46,-22M126,84q-24,-14 -52,-22', fill: 'none', stroke: '#2f3340', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-opacity': 0.55 }, p.inner);
    el('path', { d: 'M40,40q20,4 40,14M60,26q18,6 34,18', fill: 'none', stroke: '#e9ecf2', 'stroke-width': 2, 'stroke-opacity': 0.6 }, p.inner);
  } };

  /* ───────── dahan pohon (Toga): menjulur dari tepi kiri ───────── */
  F.sprites['game-dahan'] = { w: 300, h: 170, seed: 828, draw(svg, R) {
    const BARK = { base: '#7a5236', light: '#a87d56', dark: '#4e3221' };
    const d = 'M0,96C40,92 90,86 140,76C180,68 220,70 262,58L268,66C230,82 192,86 152,94C104,104 52,114 0,120Z';
    const p = painted(svg, d, { base: BARK.base, n: 70, R, cast: 'cast', stroke: brush(BARK, [0, 56, 268, 64], { dir: [1, -0.15], len: [20, 50], width: [3, 7] }) });
    shade(svg, p.inner, d, 0, 56, 268, 64, 0.3, 0.3);
    // ranting kecil
    el('path', { d: 'M150,84C168,62 180,48 200,38', fill: 'none', stroke: BARK.base, 'stroke-width': 6, 'stroke-linecap': 'round', filter: 'url(#impastoFine)' }, svg);
    const L = { dark: '#2f6b4f', mid: '#4f9a6c', light: '#a9d59a' };
    for (const [x, y, rot, len] of [[90, 90, -150, 54], [120, 84, -30, 60], [196, 40, -60, 50], [204, 44, 20, 48], [250, 62, -100, 52], [262, 62, 40, 46], [60, 100, 170, 44]]) {
      leaf(svg, { len, w: len * 0.42, ...L, R, transform: `translate(${x} ${y}) rotate(${rot})`, n: 30, filter: 'impastoFine' });
    }
  } };

  /* ───────── kepala Ayah tampak belakang, pakai peci (Toga) ───────── */
  F.sprites['game-peci-ayah'] = { w: 240, h: 190, seed: 829, draw(svg, R) {
    const SKIN = { base: '#c99872', light: '#e9c3a0', dark: '#9a6a48' };
    const g = el('g', { filter: 'url(#castBig)' }, svg);
    // telinga
    for (const [x, sx] of [[38, -1], [202, 1]]) {
      const e = `M${x},110c${sx * -2},-22 ${sx * 16},-26 ${sx * 18},-6c${sx * 2},16 ${sx * -10},28 ${sx * -16},20Z`;
      painted(g, e, { base: SKIN.base, n: 20, R, filter: 'impastoFine', stroke: brush(SKIN, [x - 20, 84, 40, 50], { dir: [0, 1], len: [6, 14], width: [3, 6] }) });
    }
    // kepala + tengkuk
    const head = 'M44,98C44,60 78,44 120,44C162,44 196,60 196,98C196,132 180,156 160,166L158,190H82L80,166C60,156 44,132 44,98Z';
    const h = painted(g, head, { base: SKIN.base, n: 80, R, filter: 'impastoFine', stroke: brush(SKIN, [44, 44, 152, 146], { dir: [0.2, 1], len: [14, 34], width: [6, 12] }) });
    shade(svg, h.inner, head, 44, 44, 152, 146, 0.3, 0.3);
    // rambut pendek di bawah peci: bidang gelap dengan sedikit uban
    const hair = 'M48,88C50,76 64,70 120,70C176,70 190,76 192,88C182,98 168,102 156,104C136,100 104,100 84,104C72,102 58,98 48,88Z';
    const hr = painted(h.inner, hair, { base: '#6b5546', n: 50, R, filter: 'impastoFine', stroke: (i, n, R2) => ({ d: `M${52 + R2() * 136},${72 + R2() * 30}l${(R2() - 0.5) * 3},${4 + R2() * 5}`, color: R2() < 0.3 ? '#c9bfb2' : R2() < 0.6 ? '#7d6555' : '#54433a', width: 2.5 + R2() * 2.5, opacity: 0.6 }) });
    void hr;
    // peci beludru hitam
    const peci = 'M48,74C48,40 64,16 120,16C176,16 192,40 192,74C160,66 80,66 48,74Z';
    const pc = painted(g, peci, { base: '#26201f', n: 70, R, filter: 'impastoFine', stroke: (i, n, R2) => ({ d: `M${52 + R2() * 136},${20 + R2() * 50}l${10 + R2() * 20},${R2() * 3}`, color: R2() < 0.3 ? '#4a3f3c' : '#1a1515', width: 3 + R2() * 6, opacity: 0.5 }) });
    el('path', { d: peci, fill: linGrad(svg, [[0, '#9a8a84', 0.45], [0.4, '#9a8a84', 0], [1, '#000', 0.2]], 48, 16, 192, 74) }, pc.inner);
    // kilau beludru di sisi kiri peci
    el('path', { d: 'M62,60C64,40 80,26 104,22', fill: 'none', stroke: '#b9aaa2', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-opacity': 0.35, filter: 'url(#blur2)' }, pc.inner);
    el('path', { d: 'M50,72C82,64 158,64 190,72', fill: 'none', stroke: '#5a4a44', 'stroke-width': 2, 'stroke-opacity': 0.6 }, g);
  } };
})();
