/**
 * Kartu kenang-kenangan dari halaman kado (JPEG 1080×1350, rasio 4:5): nama penerima, ucapan utama,
 * foto paling spesial (kalau ada), "dari …", tanggal dibuka, dan tanda floa kecil.
 * Hanya untuk dipanggil di browser.
 */

export type KeepsakeInput = {
  eyebrow: string;
  name: string;
  title: string;
  from: string | null;
  date: string;
  photo: string | null;
  palette: { paper: string; ink: string; accent: string };
};

const W = 1080;
const H = 1350;

function loadImage(src: string, cors = false) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Nama font dari kelas utilitas, supaya kartu memakai huruf yang sama dengan situs. */
function fontOf(className: string, fallback: string) {
  const el = document.createElement('span');
  el.className = className;
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  document.body.appendChild(el);
  const family = getComputedStyle(el).fontFamily || fallback;
  el.remove();
  return family;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Memecah teks jadi baris yang muat di `maxW`, paling banyak `maxLines` (baris terakhir diberi "…"). */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= maxW || !line) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
}

/** Ukuran huruf terbesar (≤ start) yang membuat teks satu baris muat di maxW. */
function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, min: number, maxW: number) {
  let px = start;
  ctx.font = font(px);
  while (px > min && ctx.measureText(text).width > maxW) {
    px -= 4;
    ctx.font = font(px);
  }
  return px;
}

export async function drawKeepsake(input: KeepsakeInput): Promise<string> {
  const display = fontOf('font-display', 'Georgia, serif');
  const sans = fontOf('font-sans', 'system-ui, sans-serif');
  const hand = fontOf('font-hand', 'cursive');
  await Promise.all([
    document.fonts?.load(`600 110px ${display}`),
    document.fonts?.load(`700 40px ${sans}`),
    document.fonts?.load(`600 64px ${hand}`),
  ]).catch(() => {});

  const [paperTex, flower, photo] = await Promise.all([
    loadImage('/art/tex-kertas.webp').catch(() => null),
    loadImage('/art/bunga-kamboja-pink.webp').catch(() => null),
    input.photo ? loadImage(input.photo, !input.photo.startsWith('/')).catch(() => null) : Promise.resolve(null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  const { paper, ink, accent } = input.palette;

  // kertas bertekstur
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  if (paperTex) {
    const pat = ctx.createPattern(paperTex, 'repeat');
    if (pat) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }
  // bingkai tipis
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  roundRect(ctx, 44, 44, W - 88, H - 88, 18);
  ctx.stroke();
  ctx.globalAlpha = 0.18;
  roundRect(ctx, 58, 58, W - 116, H - 116, 12);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const setSpacing = (v: string) => {
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = v;
  };

  // kepala: "sepucuk kado untuk" + nama
  ctx.fillStyle = accent;
  ctx.font = `800 30px ${sans}`;
  setSpacing('7px');
  ctx.fillText(input.eyebrow.toUpperCase(), W / 2, 158, W - 220);
  setSpacing('0px');
  ctx.fillStyle = ink;
  fit(ctx, input.name, (px) => `600 ${px}px ${display}`, 112, 52, W - 220);
  ctx.fillText(input.name, W / 2, 268, W - 220);

  let y = 330;
  if (photo) {
    // foto sebagai polaroid miring sedikit
    const box = 540;
    const pad = 26;
    const cx = W / 2;
    const top = y + 10;
    ctx.save();
    ctx.translate(cx, top + (box + pad * 3.4) / 2);
    ctx.rotate((-1.6 * Math.PI) / 180);
    ctx.shadowColor = 'rgba(40, 20, 10, 0.28)';
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = '#ffffff';
    const fw = box + pad * 2;
    const fh = box + pad * 3.4;
    ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
    ctx.shadowColor = 'transparent';
    // potong foto jadi persegi (object-fit: cover)
    const s = Math.min(photo.naturalWidth, photo.naturalHeight);
    const sx = (photo.naturalWidth - s) / 2;
    const sy = (photo.naturalHeight - s) / 2;
    ctx.drawImage(photo, sx, sy, s, s, -box / 2, -fh / 2 + pad, box, box);
    ctx.restore();
    y = top + box + pad * 3.4 + 40;
  } else {
    y = 420;
  }

  // ucapan utama, tulisan tangan
  if (input.title) {
    const big = !photo;
    ctx.fillStyle = ink;
    ctx.font = `600 ${big ? 78 : 60}px ${hand}`;
    const lines = wrap(ctx, input.title, W - 240, big ? 4 : 2);
    const lh = big ? 88 : 68;
    const start = big ? y + 120 : y + 44;
    lines.forEach((ln, i) => ctx.fillText(ln, W / 2, start + i * lh, W - 220));
    y = start + (lines.length - 1) * lh + (big ? 110 : 70);
  } else if (!photo) {
    y += 200;
  }

  // "dari …"
  if (input.from) {
    ctx.globalAlpha = 0.82;
    fit(ctx, input.from, (px) => `600 ${px}px ${hand}`, 54, 32, W - 260);
    ctx.fillText(input.from, W / 2, Math.min(y, H - 210), W - 260);
    ctx.globalAlpha = 1;
  }

  // tanggal dibuka
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.55;
  ctx.font = `700 26px ${sans}`;
  setSpacing('5px');
  ctx.fillText(input.date.toUpperCase(), W / 2, H - 150, W - 260);
  setSpacing('0px');
  ctx.globalAlpha = 1;

  // tanda floa kecil
  ctx.font = `600 36px ${display}`;
  const word = 'floa';
  const ww = ctx.measureText(word).width;
  const icon = flower ? 40 : 0;
  const gap = flower ? 10 : 0;
  const startX = W / 2 - (icon + gap + ww) / 2;
  const baseY = H - 92;
  if (flower) ctx.drawImage(flower, startX, baseY - 32, icon, icon);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 0.75;
  ctx.fillText(word, startX + icon + gap, baseY);
  ctx.globalAlpha = 1;

  try {
    // JPEG: jauh lebih ringan untuk dikirim lewat chat, dan kartu ini tidak butuh transparansi
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch {
    // foto dari domain lain tanpa izin CORS membuat kanvas "tercemar": gambar ulang tanpa foto
    if (input.photo) return drawKeepsake({ ...input, photo: null });
    throw new Error('keepsake');
  }
}
