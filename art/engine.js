/*
 * Mesin lukis floa (jalan di browser, dipanggil art/render.js lewat Playwright).
 * Tiap sprite "dilukis" dari ratusan sapuan kuas prosedural, lalu diberi relief cat
 * dan tepi tak rata lewat filter SVG. Hasilnya dirender sekali jadi WebP, sehingga
 * di HP pengguna tidak ada filter berat yang jalan.
 */
const NS = 'http://www.w3.org/2000/svg';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

const hex2rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function jitter(c, amt, R) { const [r, g, b] = hex2rgb(c); const d = (R() - 0.5) * 2 * amt; const w = (R() - 0.5) * amt * 0.7; return rgb2hex(r + d + w, g + d, b + d - w); }
/** warna di sepanjang daftar stop [[t, hex], ...] */
function ramp(stops, t) { t = Math.max(0, Math.min(1, t)); for (let i = 1; i < stops.length; i++) { if (t <= stops[i][0]) { const [t0, c0] = stops[i - 1], [t1, c1] = stops[i]; return mix(c0, c1, (t - t0) / (t1 - t0 || 1)); } } return stops[stops.length - 1][1]; }

let _uid = 0;
const uid = (p) => `${p}${++_uid}`;

/** Filter bersama. Dipasang sekali per <svg>. */
function defs(svg, seed = 1) {
  const d = el('defs', {}, svg);
  const relief = (id, freq, warp) => `
  <filter id="${id}" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${seed}" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="${warp}" xChannelSelector="R" yChannelSelector="G" result="shape"/>
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed + 7}" result="bristle"/>
    <feColorMatrix in="bristle" type="luminanceToAlpha" result="bump"/>
    <feDiffuseLighting in="bump" surfaceScale="1.5" diffuseConstant="1.18" lighting-color="#fffaf2" result="light0"><feDistantLight azimuth="230" elevation="60"/></feDiffuseLighting>
    <feComponentTransfer in="light0" result="light"><feFuncR type="linear" slope="0.5" intercept="0.5"/><feFuncG type="linear" slope="0.5" intercept="0.5"/><feFuncB type="linear" slope="0.5" intercept="0.49"/></feComponentTransfer>
    <feComposite in="light" in2="shape" operator="in" result="lightIn"/>
    <feBlend in="lightIn" in2="shape" mode="multiply" result="lit"/>
    <feSpecularLighting in="bump" surfaceScale="1.6" specularConstant="0.22" specularExponent="22" lighting-color="#fff" result="spec"><feDistantLight azimuth="230" elevation="54"/></feSpecularLighting>
    <feComposite in="spec" in2="shape" operator="in" result="specIn"/>
    <feBlend in="specIn" in2="lit" mode="screen"/>
  </filter>`;
  d.innerHTML = `
  <!-- relief cat: serat kuas diterangi dari kiri-atas + tepi sedikit bergelombang -->
  ${relief('impasto', '0.11 0.014', 6)}
  ${relief('impastoH', '0.014 0.11', 6)}
  ${relief('impastoFine', '0.2 0.03', 3)}
  <!-- bidang besar (langit, air): sapuan mendatar, relief lembut, tanpa menggeser tepi -->
  <filter id="canvas" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.075" numOctaves="3" seed="${seed + 3}" result="bristle"/>
    <feColorMatrix in="bristle" type="luminanceToAlpha" result="bump"/>
    <feDiffuseLighting in="bump" surfaceScale="1.3" diffuseConstant="1.17" lighting-color="#fffaf2" result="light0"><feDistantLight azimuth="230" elevation="62"/></feDiffuseLighting>
    <feComponentTransfer in="light0" result="light"><feFuncR type="linear" slope="0.42" intercept="0.58"/><feFuncG type="linear" slope="0.42" intercept="0.58"/><feFuncB type="linear" slope="0.42" intercept="0.57"/></feComponentTransfer>
    <feComposite in="light" in2="SourceGraphic" operator="in" result="lightIn"/>
    <feBlend in="lightIn" in2="SourceGraphic" mode="multiply"/>
  </filter>
  <!-- awan/kabut: sapuan lembut yang melebur -->
  <filter id="mist" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="9 5"/></filter>
  <!-- tepi tak rata saja -->
  <filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${seed + 11}"/>
    <feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="softer" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="blur2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
  <!-- bayangan jatuh antar lapisan (kelopak di atas kelopak) -->
  <filter id="cast" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b"/><feOffset in="b" dx="2" dy="4" result="o"/>
    <feComponentTransfer in="o" result="s"><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
    <feFlood flood-color="#4a1f14" result="c"/><feComposite in="c" in2="s" operator="in" result="sh"/>
    <feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="castBig" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b"/><feOffset in="b" dx="5" dy="12" result="o"/>
    <feComponentTransfer in="o" result="s"><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
    <feFlood flood-color="#3a1d12" result="c"/><feComposite in="c" in2="s" operator="in" result="sh"/>
    <feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
  return d;
}

/**
 * Melukis satu bidang: bidang `d` jadi topeng, diisi warna dasar lalu sapuan kuas.
 * stroke(i, n, R) → { d, color, width, opacity }
 * cast: beri bayangan jatuh supaya lapisan terasa bertumpuk.
 */
function painted(parent, d, { base, n, stroke, R, filter = 'impasto', transform, cast }) {
  const outer = cast ? el('g', { filter: `url(#${cast === true ? 'cast' : cast})`, transform }, parent) : null;
  const g = el('g', { filter: filter ? `url(#${filter})` : undefined, transform: outer ? undefined : transform }, outer || parent);
  const id = uid('c');
  const cp = el('clipPath', { id }, g);
  el('path', { d }, cp);
  const inner = el('g', { 'clip-path': `url(#${id})` }, g);
  el('path', { d, fill: base }, inner);
  for (let i = 0; i < n; i++) {
    const s = stroke(i, n, R);
    if (!s) continue;
    el('path', { d: s.d, fill: 'none', stroke: s.color, 'stroke-width': s.width, 'stroke-linecap': 'round', 'stroke-opacity': s.opacity ?? 0.8 }, inner);
  }
  return { g: outer || g, inner };
}

function linGrad(svg, stops, x1, y1, x2, y2) {
  const id = uid('g');
  const root = svg.ownerSVGElement || svg;
  const lg = el('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1, y1, x2, y2 }, root.querySelector('defs'));
  stops.forEach(([t, c, o]) => el('stop', { offset: t, 'stop-color': c, 'stop-opacity': o }, lg));
  return `url(#${id})`;
}
function radGrad(svg, stops, cx, cy, r) {
  const id = uid('g');
  const root = svg.ownerSVGElement || svg;
  const rg = el('radialGradient', { id, gradientUnits: 'userSpaceOnUse', cx, cy, r }, root.querySelector('defs'));
  stops.forEach(([t, c, o]) => el('stop', { offset: t, 'stop-color': c, 'stop-opacity': o }, rg));
  return `url(#${id})`;
}

/** Kelopak menghadap atas dari (0,0) sampai (0,-len). `skew` membuatnya tidak simetris. */
function petalPath(len, w, { round = 0.5, skew = 0, notch = 0 } = {}) {
  const a = w * 0.5, top = -len;
  const cx = skew * w;
  const y1 = -len * 0.18, y2 = -len * (0.78 + round * 0.2);
  if (notch) {
    return `M0,0C${a * 0.9},${y1} ${a * (1 + round * 0.5) + cx},${y2} ${a * 0.35 + cx},${top}Q${cx},${top + notch} ${-a * 0.35 + cx},${top}C${-a * (1 + round * 0.5) + cx},${y2} ${-a * 0.9},${y1} 0,0Z`;
  }
  return `M0,0C${a * 0.9},${y1} ${a * (1 + round * 0.5) + cx},${y2} ${cx},${top}C${-a * (1 + round * 0.5) + cx},${y2} ${-a * 0.9},${y1} 0,0Z`;
}

/**
 * Satu kelopak lukisan. stops = gradasi dari pangkal (0) ke ujung (1).
 * side: -1..1 = sisi yang kena bayangan (positif = kanan). Sapuan kuas menyebar dari pangkal.
 */
function petal(parent, { len, w, round = 0.5, skew = 0, notch = 0, stops, shade, light, R, n = 46, transform, veins = 3, side = 0.6, filter = 'impasto', cast = true }) {
  const d = petalPath(len, w, { round, skew, notch });
  const half = (v) => (w / 2) * (0.25 + (0.75 + round * 0.4) * Math.pow(Math.sin(Math.PI * Math.min(1, v * 0.97 + 0.02)), 0.7));
  const p = painted(parent, d, {
    base: linGrad(parent, stops.map(([t, c]) => [t, c]), 0, 0, 0, -len), n, R, filter, transform, cast,
    stroke: () => {
      const v = Math.pow(R(), 0.85); // posisi sepanjang kelopak
      const t = -1 + 2 * R(); // posisi melintang
      const x = t * half(v) * 0.92 + skew * w * v, y = -len * v;
      const L = len * (0.14 + R() * 0.26);
      const dx = x * 0.55, dy = y - len * 0.08; // arah: menjauhi pangkal
      const m = Math.hypot(dx, dy) || 1;
      const x2 = x + (dx / m) * L, y2 = y + (dy / m) * L;
      let c = ramp(stops, Math.min(1, v + (L / len) * 0.5));
      const sd = t * side; // > 0 = sisi teduh
      if (sd > 0) c = mix(c, shade, sd * 0.6 + R() * 0.1);
      else if (R() < 0.55) c = mix(c, light, -sd * 0.55 + R() * 0.12);
      if (R() < 0.06) c = mix(c, light, 0.6);
      const bend = (R() - 0.5) * L * 0.25;
      return { d: `M${x},${y}Q${(x + x2) / 2 + bend},${(y + y2) / 2} ${x2},${y2}`, color: jitter(c, 7, R), width: w * (0.07 + R() * 0.11), opacity: 0.45 + R() * 0.45 };
    },
  });
  for (let v = 0; v < veins; v++) {
    const t = veins === 1 ? 0 : (v / (veins - 1) - 0.5) * 1.3;
    el('path', { d: `M${t * w * 0.04},${-len * 0.05}Q${t * w * 0.4 + skew * w * 0.4},${-len * 0.5} ${t * w * 0.27 + skew * w * 0.8},${-len * 0.84}`, fill: 'none', stroke: shade, 'stroke-width': Math.max(0.8, w * 0.016), 'stroke-opacity': 0.3, 'stroke-linecap': 'round' }, p.inner);
  }
  // sisi terang: garis tipis di tepi yang menghadap cahaya
  el('path', { d, fill: 'none', stroke: light, 'stroke-width': w * 0.05, 'stroke-opacity': 0.35, transform: `translate(${side > 0 ? 2 : -2} 2)` }, p.inner);
  return p;
}

/** Daun runcing dari (0,0) ke (0,-len), dilukis mengikuti tulang daun. */
function leaf(parent, { len, w, dark, mid, light, R, transform, n = 60, curve = 0, filter = 'impasto', cast = true, side = 1 }) {
  const c = curve * w;
  const d = `M0,0C${w * 0.62},${-len * 0.22} ${w * 0.52 + c},${-len * 0.74} ${c},${-len}C${-w * 0.52 + c},${-len * 0.74} ${-w * 0.62},${-len * 0.22} 0,0Z`;
  const p = painted(parent, d, {
    base: linGrad(parent, [[0, dark], [0.5, mid], [1, mix(mid, light, 0.5)]], 0, 0, 0, -len), n, R, filter, transform, cast,
    stroke: () => {
      const u = R();
      const sgn = R() < 0.5 ? -1 : 1;
      const x0 = c * u * u, y0 = -len * (0.03 + u * 0.88);
      const reach = w * (0.16 + R() * 0.3) * Math.sin(Math.PI * Math.min(1, u * 1.1 + 0.06));
      const x1 = x0 + sgn * reach, y1 = y0 - len * (0.07 + R() * 0.1);
      let col = sgn * side < 0 ? mix(mid, light, 0.2 + R() * 0.5) : mix(mid, dark, 0.15 + R() * 0.55);
      if (R() < 0.08) col = mix(col, light, 0.55);
      return { d: `M${x0},${y0}Q${x0 + sgn * reach * 0.55},${y0 - len * 0.015} ${x1},${y1}`, color: jitter(col, 7, R), width: w * (0.07 + R() * 0.1), opacity: 0.5 + R() * 0.4 };
    },
  });
  el('path', { d: `M0,${-len * 0.02}Q${c * 0.3},${-len * 0.5} ${c},${-len * 0.96}`, fill: 'none', stroke: mix(light, '#ffffff', 0.3), 'stroke-width': Math.max(1, w * 0.03), 'stroke-opacity': 0.6, 'stroke-linecap': 'round' }, p.inner);
  return p;
}

/** Bidang bebas (langit, bukit, kertas) diisi sapuan mendatar/miring. color(u,v) u=x 0..1, v=y 0..1 */
function wash(parent, { x, y, w, h, color, base, R, n = 240, angle = 0, len = [0.18, 0.5], width = [10, 26], opacity = [0.35, 0.8], clip, filter = 'canvas' }) {
  const g = el('g', { filter: filter ? `url(#${filter})` : undefined }, parent);
  let inner = g;
  if (clip) { const id = uid('w'); const cp = el('clipPath', { id }, g); el('path', { d: clip }, cp); inner = el('g', { 'clip-path': `url(#${id})` }, g); }
  const rad = (angle * Math.PI) / 180;
  if (base) el(clip ? 'path' : 'rect', clip ? { d: clip, fill: base } : { x, y, width: w, height: h, fill: base }, inner);
  for (let i = 0; i < n; i++) {
    const u = R(), v = R();
    const L = w * (len[0] + R() * (len[1] - len[0]));
    const a = rad + (R() - 0.5) * 0.22;
    const cx = x + u * w, cy = y + v * h;
    const dx = Math.cos(a) * L / 2, dy = Math.sin(a) * L / 2;
    const bend = (R() - 0.5) * L * 0.12;
    el('path', { d: `M${cx - dx},${cy - dy}Q${cx + bend * Math.sin(a)},${cy - bend * Math.cos(a)} ${cx + dx},${cy + dy}`, fill: 'none', stroke: jitter(color(u, v, R), 6, R), 'stroke-width': width[0] + R() * (width[1] - width[0]), 'stroke-linecap': 'round', 'stroke-opacity': opacity[0] + R() * (opacity[1] - opacity[0]) }, inner);
  }
  return g;
}

/** Totol-totol cat (bunga jauh, bokeh, dedaunan). */
function dabs(parent, { n, R, place, filter = 'impasto' }) {
  const g = el('g', { filter: filter ? `url(#${filter})` : undefined }, parent);
  for (let i = 0; i < n; i++) {
    const p = place(i, R);
    if (!p) continue;
    el('ellipse', { cx: p.x, cy: p.y, rx: p.rx, ry: p.ry ?? p.rx, fill: p.color, 'fill-opacity': p.opacity ?? 0.9, transform: p.rot ? `rotate(${p.rot} ${p.x} ${p.y})` : undefined }, g);
  }
  return g;
}

window.FLOA = { NS, rng, el, mix, jitter, ramp, defs, painted, petal, petalPath, leaf, wash, dabs, uid, linGrad, radGrad, sprites: {} };
