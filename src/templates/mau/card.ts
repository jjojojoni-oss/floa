/** Kartu "Hari kita mulai" sebagai gambar PNG 1080×1350, untuk disimpan penerima. Hanya dipanggil di browser. */

export type DayCard = {
  eyebrow: string;
  date: string;
  weekday: string;
  pair: string;
  at: string;
  note: string;
};

const W = 1080;
const H = 1350;
const INK = '#5a1730';
const ACCENT = '#e8315f';

function load(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

/** keluarga huruf dari kelas utilitas situs (Fraunces, Caveat, Plus Jakarta) */
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

function fit(ctx: CanvasRenderingContext2D, text: string, y: number, font: (px: number) => string, start: number, min: number, maxW: number) {
  let px = start;
  ctx.font = font(px);
  while (px > min && ctx.measureText(text).width > maxW) {
    px -= 4;
    ctx.font = font(px);
  }
  ctx.fillText(text, W / 2, y, maxW);
}

function round(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function drawDayCard(c: DayCard): Promise<string> {
  const display = fontOf('font-display', 'Georgia, serif');
  const sans = fontOf('font-sans', 'system-ui, sans-serif');
  const hand = fontOf('font-hand', 'cursive');
  await Promise.all([
    document.fonts?.load(`600 120px ${display}`),
    document.fonts?.load(`800 34px ${sans}`),
    document.fonts?.load(`700 70px ${hand}`),
  ]).catch(() => {});
  const [paper, heart, flower] = await Promise.all([load('/art/tex-kertas.webp'), load('/art/mau-hati-besar.webp'), load('/art/bunga-kamboja-pink.webp')]);

  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  if (!ctx) throw new Error('canvas');

  // latar merah muda lembut, lalu secarik kertas krem di tengah
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#f7b9c8');
  bg.addColorStop(1, '#fde3d6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.012);
  ctx.shadowColor = 'rgba(120, 20, 60, 0.22)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = '#fffaf3';
  round(ctx, -430, -560, 860, 1120, 18);
  ctx.fill();
  ctx.restore();
  if (paper) {
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.012);
    round(ctx, -430, -560, 860, 1120, 18);
    ctx.clip();
    ctx.globalAlpha = 0.35;
    ctx.globalCompositeOperation = 'multiply';
    const pat = ctx.createPattern(paper, 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(-540, -675, 1080, 1350);
    }
    ctx.restore();
  }

  // bingkai tipis
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.012);
  ctx.strokeStyle = 'rgba(232, 49, 95, 0.35)';
  ctx.lineWidth = 3;
  round(ctx, -392, -522, 784, 1044, 10);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // hati lukisan di atas
  if (heart) ctx.drawImage(heart, W / 2 - 92, 200, 184, 172);

  ctx.fillStyle = ACCENT;
  ctx.font = `800 34px ${sans}`;
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '8px';
  ctx.fillText(c.eyebrow.toUpperCase(), W / 2, 450, 760);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';

  ctx.fillStyle = INK;
  fit(ctx, c.date, 590, (px) => `600 ${px}px ${display}`, 112, 60, 760);
  ctx.globalAlpha = 0.7;
  fit(ctx, c.weekday, 660, (px) => `700 ${px}px ${sans}`, 40, 24, 700);
  ctx.globalAlpha = 1;

  // garis pemisah dengan hati kecil
  ctx.strokeStyle = 'rgba(90, 23, 48, 0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 220, 740);
  ctx.lineTo(W / 2 - 34, 740);
  ctx.moveTo(W / 2 + 34, 740);
  ctx.lineTo(W / 2 + 220, 740);
  ctx.stroke();
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  const hx = W / 2;
  const hy = 744;
  ctx.moveTo(hx, hy + 12);
  ctx.bezierCurveTo(hx - 26, hy - 6, hx - 12, hy - 24, hx, hy - 10);
  ctx.bezierCurveTo(hx + 12, hy - 24, hx + 26, hy - 6, hx, hy + 12);
  ctx.fill();

  ctx.fillStyle = INK;
  fit(ctx, c.pair, 870, (px) => `700 ${px}px ${hand}`, 96, 52, 760);
  ctx.globalAlpha = 0.85;
  fit(ctx, c.at, 950, (px) => `600 ${px}px ${hand}`, 58, 34, 760);
  ctx.globalAlpha = 0.6;
  fit(ctx, c.note, 1030, (px) => `600 ${px}px ${sans}`, 32, 22, 720);
  ctx.globalAlpha = 1;

  // tanda kecil floa di bawah
  ctx.font = `600 34px ${display}`;
  const word = 'floa';
  const ww = ctx.measureText(word).width;
  const icon = flower ? 40 : 0;
  const x0 = W / 2 - (icon + 10 + ww) / 2;
  if (flower) ctx.drawImage(flower, x0, 1112, icon, icon);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 0.7;
  ctx.fillText(word, x0 + icon + 10, 1144);
  ctx.globalAlpha = 1;

  return cv.toDataURL('image/png');
}
