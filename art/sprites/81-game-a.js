/* Mini-game (Buket, Tiup Lilin, Lampion, Amplop): kumbang gendut, kaus kaki & sandal jepit dari balon,
   bintang jatuh, pesawat kecil, dan kucing oranye yang tidur di atas amplop (tidur & bangun, kanvas sama).
   Wajah kumbang sengaja tidak dilukis: ekspresinya (senang → kesal → ngambek) digambar di DOM. */
(() => {
  const F = window.FLOA;
  const { el, painted, petal, dabs, mix, jitter } = F;

  const ellipseD = (cx, cy, rx, ry) => `M${cx - rx},${cy}a${rx},${ry} 0 1 0 ${rx * 2},0a${rx},${ry} 0 1 0 ${-rx * 2},0Z`;

  /** Bidang bulat bersapuan melingkar: terang kiri-atas, teduh kanan-bawah (seperti balon di 41-lilin.js). */
  function round(svg, R, d, { cx, cy, rx, ry, light, mid, dark, n = 90, filter = 'impasto', cast = 'cast' }) {
    return painted(svg, d, {
      base: F.radGrad(svg, [[0, light], [0.5, mid], [1, dark]], cx - rx * 0.35, cy - ry * 0.4, Math.max(rx, ry) * 1.5), n, R, filter, cast,
      stroke: () => {
        const a = R() * Math.PI * 2, k = 0.15 + R() * 0.85, da = 0.3 + R() * 0.6;
        const pt = (t) => `${cx + Math.cos(t) * rx * k},${cy + Math.sin(t) * ry * k}`;
        const sh = Math.cos(a - Math.PI * 0.25) * k;
        const c = sh > 0 ? mix(mid, dark, sh * 0.8) : mix(mid, light, -sh * 0.85);
        return { d: `M${pt(a)}A${rx * k},${ry * k} 0 0 1 ${pt(a + da)}`, color: jitter(c, 6, R), width: 5 + R() * 9, opacity: 0.4 + R() * 0.45 };
      },
    });
  }

  /* ───────── lebah gendut (menghadap kiri), kanvas 240×244 ─────────
     Semua digambar di koordinat 240×200 lalu diturunkan 40 supaya ujung sayapnya tidak terpotong tepi atas.
     wajah (mata, alis, mulut) digambar di DOM pada area sekitar (66..110, 80..130) koordinat yang sama */
  F.sprites['game-kumbang'] = { w: 240, h: 244, seed: 811, draw(svg, R) {
    const g = el('g', { transform: 'translate(0 40)' }, svg);
    // sayap belakang (di balik badan)
    const WING = { stops: [[0, '#cfe6f2'], [0.6, '#eef8ff'], [1, '#ffffff']], shade: '#9cc3d8', light: '#ffffff' };
    const wb = el('g', { opacity: 0.78 }, g);
    petal(wb, { len: 78, w: 50, round: 0.9, skew: 0.12, R, n: 22, side: 0.5, veins: 3, ...WING, transform: 'translate(150 74) rotate(28)', filter: 'impastoFine', cast: false });
    // badan bulat
    const cx = 128, cy = 118, rx = 82, ry = 66;
    const body = round(g, R, ellipseD(cx, cy, rx, ry), { cx, cy, rx, ry, light: '#ffe58a', mid: '#f5bd2e', dark: '#c98612', n: 120 });
    // garis-garis cokelat melengkung mengikuti badan
    for (const [x0, w] of [[118, 20], [150, 18], [180, 14]]) {
      el('path', { d: `M${x0},${cy - ry}Q${x0 + 12},${cy} ${x0},${cy + ry}`, fill: 'none', stroke: '#5a3418', 'stroke-width': w, 'stroke-linecap': 'round', opacity: 0.9 }, body.inner);
      el('path', { d: `M${x0 - 6},${cy - ry + 8}Q${x0 + 4},${cy - 10} ${x0 - 4},${cy + 20}`, fill: 'none', stroke: '#8a5a2c', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.55 }, body.inner);
    }
    // bulu halus di tepi
    dabs(g, { n: 70, R, filter: 'impastoFine', place: (i, R) => {
      const a = R() * Math.PI * 2;
      return { x: cx + Math.cos(a) * rx * (0.96 + R() * 0.08), y: cy + Math.sin(a) * ry * (0.96 + R() * 0.08), rx: 2.5 + R() * 3, color: Math.cos(a) > 0.2 && Math.sin(a) > -0.2 ? '#b9790f' : '#ffd25a', opacity: 0.7 };
    } });
    // pipi merona di wajah (kiri)
    el('ellipse', { cx: 78, cy: 132, rx: 13, ry: 8, fill: '#f08a7a', opacity: 0.55, filter: 'url(#blur2)' }, g);
    // sorot cahaya
    el('ellipse', { cx: 96, cy: 76, rx: 22, ry: 9, fill: '#fff6cf', opacity: 0.55, transform: 'rotate(-22 96 76)', filter: 'url(#blur2)' }, g);
    // kaki-kaki kecil
    for (const x of [100, 126, 152]) el('path', { d: `M${x},${cy + ry - 6}q-4,16 -12,20`, fill: 'none', stroke: '#4a2a14', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    // antena
    for (const [x, b] of [[70, -1], [86, 1]]) {
      el('path', { d: `M${x},${cy - ry + 14}Q${x - 12 + b * 4},${cy - ry - 24} ${x - 24 + b * 10},${cy - ry - 30}`, fill: 'none', stroke: '#4a2a14', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: x - 24 + b * 10, cy: cy - ry - 30, r: 6, fill: '#4a2a14' }, g);
    }
    // ekor kecil (sengat tumpul, lucu)
    el('path', { d: `M${cx + rx - 4},${cy + 4}l18,6l-18,8Z`, fill: '#5a3418' }, g);
    // sayap depan (tembus pandang)
    const wf = el('g', { opacity: 0.82 }, g);
    petal(wf, { len: 92, w: 58, round: 0.9, skew: -0.1, R, n: 26, side: -0.5, veins: 3, ...WING, transform: 'translate(132 70) rotate(-8)', filter: 'impastoFine', cast: 'cast' });
  } };

  /* ───────── kaus kaki belang berlubang, kanvas 160×190 ───────── */
  F.sprites['game-kaoskaki'] = { w: 160, h: 190, seed: 812, draw(svg, R) {
    const d = 'M48,12H104V112Q104,124 116,132L138,146Q154,158 146,172Q138,184 120,180L58,166Q40,160 44,140Z';
    const p = painted(svg, d, {
      base: F.linGrad(svg, [[0, '#fff6e6'], [1, '#ead8bd']], 40, 0, 150, 0), n: 70, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 40 + R() * 110, y = 10 + R() * 170; return { d: `M${x},${y}l${(R() - 0.5) * 10},${20 + R() * 30}`, color: jitter(R() < 0.6 ? '#fff9ee' : '#dcc5a2', 6, R), width: 5 + R() * 7, opacity: 0.45 }; },
    });
    // belang merah & hijau
    for (const [y, c] of [[24, '#d9573a'], [44, '#3f8a68'], [64, '#d9573a']]) el('rect', { x: 40, y, width: 72, height: 11, fill: c, opacity: 0.85 }, p.inner);
    // tumit & ujung lebih gelap
    el('path', { d: 'M104,112Q104,124 116,132L120,150Q102,140 96,120Z', fill: '#c9b08c', opacity: 0.5 }, p.inner);
    // lubang di ujung jari (lucu)
    el('ellipse', { cx: 132, cy: 168, rx: 8, ry: 6, fill: '#f2c9a8', stroke: '#b98f6a', 'stroke-width': 2 }, svg);
    // karet atas
    el('path', { d: 'M48,14H104', stroke: '#fff', 'stroke-width': 3, opacity: 0.7 }, svg);
  } };

  /* ───────── sandal jepit sebelah (dilihat dari atas, miring), kanvas 200×130 ───────── */
  F.sprites['game-sandal'] = { w: 200, h: 130, seed: 813, draw(svg, R) {
    const g = el('g', { transform: 'rotate(-14 100 65)' }, svg);
    const sole = 'M26,66C26,36 52,26 86,28C122,30 168,34 178,58C186,80 160,98 124,100C90,102 56,104 38,92C30,86 26,78 26,66Z';
    painted(g, sole, {
      base: F.linGrad(svg, [[0, '#7fb6e6'], [1, '#2f6fae']], 0, 20, 0, 110), n: 80, R, filter: 'impastoFine', cast: 'castBig',
      stroke: () => { const x = 24 + R() * 156, y = 30 + R() * 70; return { d: `M${x},${y}l${30 + R() * 30},${(R() - 0.5) * 6}`, color: jitter(R() < 0.5 ? '#9ccbf0' : '#2a5f95', 6, R), width: 5 + R() * 8, opacity: 0.4 }; },
    });
    // alas putih tipis (lapisan atas)
    el('path', { d: 'M34,66C34,42 56,34 86,36C118,38 160,42 170,60C176,76 154,90 122,92C90,94 60,96 44,86C38,82 34,76 34,66Z', fill: '#f4f1ea', opacity: 0.85 }, g);
    // tali jepit
    el('path', { d: 'M62,46Q92,62 74,64Q92,66 62,86', fill: 'none', stroke: '#ee6a58', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: 74, cy: 64, r: 6, fill: '#c9403a' }, g);
    // tapak kaki samar
    el('ellipse', { cx: 132, cy: 64, rx: 26, ry: 18, fill: '#d9d2c4', opacity: 0.5 }, g);
  } };

  /* ───────── bintang jatuh (kepala bintang bercahaya), kanvas 120×120 ───────── */
  F.sprites['game-bintang'] = { w: 120, h: 120, seed: 814, draw(svg, R) {
    el('circle', { cx: 60, cy: 60, r: 52, fill: F.radGrad(svg, [[0, '#fff6d6', 0.95], [0.35, '#ffd98a', 0.5], [1, '#ffb85c', 0]], 60, 60, 52) }, svg);
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 17 : 40;
      return `${60 + Math.cos(a) * r},${60 + Math.sin(a) * r}`;
    }).join(' ');
    painted(svg, `M${pts.split(' ').join('L')}Z`, {
      base: F.radGrad(svg, [[0, '#fffdf2'], [0.6, '#ffe39a'], [1, '#f2b347']], 54, 52, 32), n: 30, R, filter: 'impastoFine', cast: false,
      stroke: () => { const a = R() * Math.PI * 2, r = R() * 34; return { d: `M60,60l${Math.cos(a) * r},${Math.sin(a) * r}`, color: jitter(R() < 0.6 ? '#fff6d0' : '#f6c25a', 5, R), width: 3 + R() * 4, opacity: 0.5 }; },
    });
  } };

  /* ───────── pesawat kecil (menghadap kanan) dengan jendela, kanvas 240×100 ───────── */
  F.sprites['game-pesawat'] = { w: 240, h: 100, seed: 815, draw(svg, R) {
    // sayap belakang
    el('path', { d: 'M104,52L78,86H96L132,54Z', fill: '#b9c4d6' }, svg);
    // ekor
    painted(svg, 'M30,48L18,14H34L62,46Z', { base: '#d9573a', n: 14, R, filter: 'impastoFine', cast: false, stroke: () => ({ d: `M${20 + R() * 30},${16 + R() * 30}l8,6`, color: jitter('#c9403a', 6, R), width: 4, opacity: 0.5 }) });
    // badan
    const body = 'M24,50C24,40 40,36 70,36H186C206,36 222,44 224,52C222,60 206,64 186,64H70C40,64 24,60 24,50Z';
    const p = painted(svg, body, {
      base: F.linGrad(svg, [[0, '#ffffff'], [0.6, '#e8edf3'], [1, '#b9c4d6']], 0, 36, 0, 64), n: 50, R, filter: 'impastoFine', cast: 'cast',
      stroke: () => { const x = 26 + R() * 190, y = 38 + R() * 24; return { d: `M${x},${y}l${20 + R() * 30},0`, color: jitter(R() < 0.6 ? '#ffffff' : '#c7d0dc', 5, R), width: 3 + R() * 4, opacity: 0.45 }; },
    });
    el('rect', { x: 24, y: 52, width: 200, height: 4, fill: '#d9573a', opacity: 0.85 }, p.inner);
    for (let i = 0; i < 9; i++) el('circle', { cx: 84 + i * 13, cy: 46, r: 3.2, fill: '#3b4a66', opacity: 0.85 }, svg);
    el('path', { d: 'M204,42Q216,44 220,50H206Z', fill: '#3b4a66', opacity: 0.8 }, svg);
    // sayap depan
    painted(svg, 'M110,56L86,96H106L144,58Z', { base: F.linGrad(svg, [[0, '#f4f6fa'], [1, '#aebad0']], 0, 56, 0, 96), n: 14, R, filter: 'impastoFine', cast: 'cast', stroke: () => ({ d: `M${96 + R() * 40},${60 + R() * 30}l10,-6`, color: jitter('#dfe5ee', 5, R), width: 4, opacity: 0.5 }) });
  } };

  /* ───────── kucing oranye meringkuk (tidur / bangun), kanvas 340×230 ─────────
     badan, ekor, dan kaki sama persis; kepala ada di kiri (x≈92, y≈128) */
  const FUR = { light: '#ffd39a', mid: '#ef9a4a', dark: '#b8621f' };
  function cat(svg, R, awake) {
    // bayangan lantai lembut
    el('ellipse', { cx: 180, cy: 206, rx: 140, ry: 14, fill: '#3a1d12', opacity: 0.16, filter: 'url(#soft)' }, svg);
    // badan meringkuk
    const bx = 196, by = 140, brx = 118, bry = 64;
    const body = round(svg, R, `M${bx - brx},${by + 10}C${bx - brx},${by - bry - 4} ${bx + brx},${by - bry - 10} ${bx + brx},${by + 6}C${bx + brx},${by + bry} ${bx - brx},${by + bry + 4} ${bx - brx},${by + 10}Z`, { cx: bx, cy: by, rx: brx, ry: bry, ...FUR, n: 150 });
    // belang punggung
    for (let i = 0; i < 6; i++) {
      const x = 150 + i * 26;
      el('path', { d: `M${x},${by - bry + 8 + Math.abs(i - 2.5) * 3}q${8 + R() * 6},${22} ${2},${40}`, fill: 'none', stroke: FUR.dark, 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.55 }, body.inner);
    }
    // perut terang
    el('path', { d: `M${bx - 90},${by + 40}Q${bx},${by + 70} ${bx + 90},${by + 44}`, fill: 'none', stroke: '#fff0d6', 'stroke-width': 18, 'stroke-linecap': 'round', opacity: 0.55, filter: 'url(#blur2)' }, body.inner);
    // ekor melingkar di depan
    const tail = 'M308,150C330,196 260,214 180,206C130,202 96,194 92,184C110,186 150,192 190,192C260,192 300,180 296,150Z';
    const tp = painted(svg, tail, {
      base: F.linGrad(svg, [[0, FUR.mid], [1, FUR.dark]], 0, 150, 0, 210), n: 60, R, filter: 'impasto', cast: 'cast',
      stroke: () => { const x = 96 + R() * 210, y = 176 + R() * 30; return { d: `M${x},${y}l${20 + R() * 30},${(R() - 0.5) * 6}`, color: jitter(R() < 0.5 ? FUR.light : FUR.dark, 6, R), width: 5 + R() * 6, opacity: 0.45 }; },
    });
    for (const x of [160, 200, 240]) el('path', { d: `M${x},${186}q4,10 0,18`, fill: 'none', stroke: FUR.dark, 'stroke-width': 7, opacity: 0.55, 'stroke-linecap': 'round' }, tp.inner);
    el('ellipse', { cx: 100, cy: 186, rx: 12, ry: 8, fill: '#fff0d6', opacity: 0.85 }, svg);
    // kaki depan
    for (const x of [96, 126]) round(svg, R, ellipseD(x, 178, 20, 12), { cx: x, cy: 178, rx: 20, ry: 12, light: '#fff0d6', mid: '#f7d2a2', dark: '#d9a56a', n: 16, filter: 'impastoFine' });
    // kepala
    const hx = 92, hy = awake ? 112 : 132;
    const ear = (s) => `M${hx + s * 18},${hy - 30}L${hx + s * 38},${hy - (awake ? 66 : 54)}L${hx + s * 46},${hy - 18}Z`;
    for (const s of [-1, 1]) {
      const e = painted(svg, ear(s), { base: s < 0 ? FUR.mid : FUR.dark, n: 12, R, filter: 'impastoFine', cast: false, stroke: () => ({ d: `M${hx + s * 30},${hy - 30}l${s * 6},${-14}`, color: jitter(FUR.mid, 6, R), width: 5, opacity: 0.5 }) });
      el('path', { d: `M${hx + s * 24},${hy - 30}L${hx + s * 37},${hy - (awake ? 56 : 46)}L${hx + s * 41},${hy - 24}Z`, fill: '#f6b2a2', opacity: 0.85 }, e.inner);
    }
    const head = round(svg, R, ellipseD(hx, hy, 52, 42), { cx: hx, cy: hy, rx: 52, ry: 42, ...FUR, n: 70 });
    for (const dx of [-12, 0, 12]) el('path', { d: `M${hx + dx},${hy - 42}q${dx * 0.2},10 0,16`, fill: 'none', stroke: FUR.dark, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.6 }, head.inner);
    // moncong & hidung
    el('ellipse', { cx: hx, cy: hy + 16, rx: 22, ry: 14, fill: '#fff0d6', opacity: 0.9 }, svg);
    el('path', { d: `M${hx - 5},${hy + 8}h10l-5,6Z`, fill: '#d86a6a' }, svg);
    el('path', { d: `M${hx},${hy + 14}q-6,7 -12,4M${hx},${hy + 14}q6,7 12,4`, fill: 'none', stroke: '#5a2e1a', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, svg);
    // kumis
    for (const s of [-1, 1]) for (const k of [0, 1]) el('path', { d: `M${hx + s * 18},${hy + 14 + k * 5}q${s * 18},${-4 + k * 6} ${s * 36},${-2 + k * 10}`, fill: 'none', stroke: '#fff8ea', 'stroke-width': 1.6, opacity: 0.85 }, svg);
    // mata
    if (awake) {
      for (const s of [-1, 1]) {
        // mata bulat besar berkilau
        el('ellipse', { cx: hx + s * 20, cy: hy - 2, rx: 11, ry: 12.5, fill: '#2e1c0c' }, svg);
        el('ellipse', { cx: hx + s * 20, cy: hy + 1, rx: 8, ry: 8, fill: '#5a3a14', opacity: 0.7 }, svg);
        el('circle', { cx: hx + s * 20 - 4, cy: hy - 7, r: 4.2, fill: '#fff' }, svg);
        el('circle', { cx: hx + s * 20 + 4, cy: hy + 4, r: 1.8, fill: '#fff', opacity: 0.85 }, svg);
      }
    } else {
      for (const s of [-1, 1]) el('path', { d: `M${hx + s * 20 - 9},${hy - 4}q9,8 18,0`, fill: 'none', stroke: '#5a2e1a', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
    }
    // pipi merona
    for (const s of [-1, 1]) el('ellipse', { cx: hx + s * 30, cy: hy + 10, rx: 8, ry: 5, fill: '#f08a7a', opacity: 0.45, filter: 'url(#blur2)' }, svg);
  }
  F.sprites['game-kucing'] = { w: 340, h: 230, seed: 816, draw(svg, R) { cat(svg, R, false); } };
  F.sprites['game-kucing-bangun'] = { w: 340, h: 230, seed: 816, draw(svg, R) { cat(svg, R, true); } };
})();
