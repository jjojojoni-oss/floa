/* Layar kunci kado: gembok kuningan kecil berukir kawung.
   Badan & sengkang dilukis terpisah pada kanvas yang sama supaya sengkangnya bisa terangkat. */
(() => {
  const F = window.FLOA;
  const { el, painted, jitter, linGrad, radGrad } = F;
  const BRASS = { hi: '#fff4cc', light: '#f1d58a', base: '#c99a3e', mid: '#a87a26', dark: '#6e4b14', deep: '#47300b' };

  const STOPS_V = [[0, BRASS.dark], [0.16, BRASS.base], [0.36, BRASS.light], [0.48, BRASS.hi], [0.6, BRASS.light], [0.84, BRASS.mid], [1, BRASS.deep]];
  /** bidang logam dipoles: gradien silinder + sapuan halus yang warnanya mengikuti gradien itu */
  function metal(parent, d, box, { dir = [0, 1], n = 60, cast = 'cast', stops = STOPS_V, across = 'x' } = {}) {
    const R = parent.__R;
    const [x, y, w, h] = box;
    const base = across === 'x' ? linGrad(parent, stops, x, y, x + w, y) : linGrad(parent, stops, x, y, x + w, y + h);
    return painted(parent, d, {
      base, n, R, filter: 'impastoFine', cast,
      stroke: () => {
        const u = R(), v = R();
        const sx = x + u * w, sy = y + v * h, L = Math.max(w, h) * (0.12 + R() * 0.26);
        const t = across === 'x' ? u : (u + v) / 2;
        const col = F.ramp(stops, Math.min(1, Math.max(0, t + (R() - 0.5) * 0.06)));
        return { d: `M${sx},${sy}l${dir[0] * L},${dir[1] * L}`, color: jitter(col, 4, R), width: 3 + R() * 6, opacity: 0.18 + R() * 0.22 };
      },
    });
  }

  /* ───────────── gembok kuningan: sengkang & badan pada kanvas yang sama ───────────── */
  const LW = 260, LH = 340;
  const BODY = 'M44,150Q44,132 64,130H196Q216,132 216,150L222,262Q222,322 130,326Q38,322 38,262Z';

  F.sprites['kunci-sengkang'] = { w: LW, h: LH, seed: 603, draw(svg, R) {
    svg.__R = R;
    // sengkang: batang bulat berbentuk U, kaki kiri masuk badan, kaki kanan juga
    const outer = 'M66,176V92A64,64 0 0 1 194,92V176H168V92A38,38 0 0 0 92,92V176Z';
    metal(svg, outer, [66, 28, 128, 148], { dir: [0, 1], n: 50, stops: [[0, BRASS.dark], [0.1, BRASS.base], [0.17, BRASS.hi], [0.24, BRASS.base], [0.5, BRASS.mid], [0.76, BRASS.base], [0.84, BRASS.light], [0.92, BRASS.mid], [1, BRASS.deep]] });
    // kilap memanjang di lengkung
    el('path', { d: 'M76,170V94A54,54 0 0 1 130,40', fill: 'none', stroke: '#fffaf0', 'stroke-width': 3.2, 'stroke-opacity': 0.75, 'stroke-linecap': 'round' }, svg);
    el('path', { d: 'M186,96A56,56 0 0 0 150,44', fill: 'none', stroke: BRASS.deep, 'stroke-width': 2.4, 'stroke-opacity': 0.45, 'stroke-linecap': 'round' }, svg);
  } };

  F.sprites['kunci-gembok'] = { w: LW, h: LH, seed: 604, draw(svg, R) {
    svg.__R = R;
    // badan: kuningan tebal, sapuan mengikuti lengkung
    metal(svg, BODY, [38, 130, 184, 196], { dir: [0.08, 1], n: 90, cast: 'castBig', stops: [[0, BRASS.dark], [0.14, BRASS.base], [0.3, BRASS.light], [0.42, BRASS.hi], [0.56, BRASS.light], [0.8, BRASS.mid], [1, BRASS.deep]] });
    // cahaya dari kiri-atas, teduh ke kanan-bawah
    el('path', { d: BODY, fill: radGrad(svg, [[0, '#fff6d8', 0.55], [0.5, '#fff6d8', 0], [1, '#2a1a05', 0.38]], 92, 168, 210) }, svg);
    // bingkai ukiran di tepi badan
    const inset = 'M58,158Q58,146 72,145H188Q202,146 202,158L207,258Q207,306 130,310Q53,306 53,258Z';
    el('path', { d: inset, fill: 'none', stroke: BRASS.deep, 'stroke-width': 3, 'stroke-opacity': 0.55 }, svg);
    el('path', { d: inset, fill: 'none', stroke: '#fff3c8', 'stroke-width': 1.6, 'stroke-opacity': 0.6, transform: 'translate(-1.2 -1.4)' }, svg);
    // titik-titik ukiran (granulasi) di bahu badan
    for (let i = 0; i < 17; i++) el('circle', { cx: 82 + i * 6, cy: 152, r: 1.7, fill: BRASS.deep, opacity: 0.45 }, svg);
    // medali tengah: kawung empat kelopak di sekeliling lubang kunci
    const cx = 130, cy = 232;
    el('circle', { cx, cy, r: 50, fill: radGrad(svg, [[0, BRASS.light], [0.7, BRASS.base], [1, BRASS.mid]], cx - 14, cy - 18, 60), stroke: BRASS.deep, 'stroke-width': 2.4, 'stroke-opacity': 0.6 }, svg);
    el('circle', { cx, cy, r: 50, fill: 'none', stroke: '#fff4cc', 'stroke-width': 1.4, 'stroke-opacity': 0.7, transform: 'translate(-1 -1.2)' }, svg);
    const kw = el('g', { fill: 'none', stroke: BRASS.deep, 'stroke-width': 2.6, 'stroke-opacity': 0.62 }, svg);
    for (const a of [45, 135, 225, 315]) el('ellipse', { cx, cy, rx: 19, ry: 9, transform: `rotate(${a} ${cx} ${cy}) translate(27 0)` }, kw);
    const kwl = el('g', { fill: 'none', stroke: '#fff4cc', 'stroke-width': 1.2, 'stroke-opacity': 0.55 }, svg);
    for (const a of [45, 135, 225, 315]) el('ellipse', { cx: cx - 0.8, cy: cy - 1, rx: 19, ry: 9, transform: `rotate(${a} ${cx} ${cy}) translate(27 0)` }, kwl);
    // sulur kecil di bawah medali
    // lubang kunci: cekung gelap dengan tepi kuningan
    const hole = `M${cx},${cy - 15}a10,10 0 0 1 6.5,17.6L141,${cy + 18}H119L123.5,${cy + 2.6}A10,10 0 0 1 ${cx},${cy - 15}Z`;
    el('path', { d: hole, fill: BRASS.deep, transform: 'translate(0 1.6)', opacity: 0.6 }, svg);
    el('path', { d: hole, fill: linGrad(svg, [[0, '#120a02'], [1, '#3a2508']], 0, cy - 15, 0, cy + 18) }, svg);
    el('path', { d: hole, fill: 'none', stroke: '#fff4cc', 'stroke-width': 1.4, 'stroke-opacity': 0.55, transform: 'translate(0.8 1.2)' }, svg);
    // keling di bahu badan
    [[66, 160], [194, 160]].forEach(([x, y]) => {
      el('circle', { cx: x, cy: y, r: 6.5, fill: radGrad(svg, [[0, BRASS.hi], [0.6, BRASS.base], [1, BRASS.dark]], x - 2, y - 2, 8) }, svg);
    });
  } };

})();
