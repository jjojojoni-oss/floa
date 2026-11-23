/** QR polos (data URL PNG). Dipakai untuk QRIS dan kartu QR kado. Hanya untuk dipanggil di browser. */
export async function qrDataUrl(text: string, size = 720, margin = 2) {
  const QR = (await import('qrcode')).default;
  return QR.toDataURL(text, { margin, width: size, errorCorrectionLevel: 'M', color: { dark: '#1e1b18', light: '#ffffff' } });
}

export type QrCardInput = {
  url: string;
  palette: { bg: string; ink: string; accent: string };
  eyebrow: string;
  name: string;
  from: string | null;
  scan: string;
};

const W = 1080;
const H = 1350;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Nama font dari kelas utilitas (mis. "font-display"), supaya kartu memakai huruf yang sama dengan situs. */
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

/** Teks satu baris di tengah, mengecil sampai muat di `maxW`. */
function fitText(ctx: CanvasRenderingContext2D, text: string, y: number, font: (px: number) => string, start: number, min: number, maxW: number) {
  let px = start;
  ctx.font = font(px);
  while (px > min && ctx.measureText(text).width > maxW) {
    px -= 4;
    ctx.font = font(px);
  }
  ctx.fillText(text, W / 2, y, maxW);
}

/**
 * Kartu QR kado 1080×1350 (rasio 4:5, enak dicetak dan dikirim lewat chat):
 * "Ada kado untuk / Nama / dari ...", QR besar, ajakan scan, alamat link, dan logo floa.
 */
export async function drawQrCard(input: QrCardInput): Promise<string> {
  const display = fontOf('font-display', 'Georgia, serif');
  const sans = fontOf('font-sans', 'system-ui, sans-serif');
  const hand = fontOf('font-hand', 'cursive');
  await Promise.all([
    document.fonts?.load(`600 110px ${display}`),
    document.fonts?.load(`700 40px ${sans}`),
    document.fonts?.load(`600 64px ${hand}`),
  ]).catch(() => {});

  const [qr, flower] = await Promise.all([
    qrDataUrl(input.url, 1240, 1).then(loadImage),
    loadImage('/art/bunga-kamboja-pink.webp').catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  const { bg, ink, accent } = input.palette;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // bingkai tipis berwarna aksen
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  roundRect(ctx, 40, 40, W - 80, H - 80, 44);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = accent;
  ctx.font = `800 34px ${sans}`;
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '7px';
  ctx.fillText(input.eyebrow.toUpperCase(), W / 2, 160, W - 200);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';

  ctx.fillStyle = ink;
  fitText(ctx, input.name, 282, (px) => `600 ${px}px ${display}`, 124, 56, W - 200);

  let qrTop = 360;
  if (input.from) {
    ctx.globalAlpha = 0.85;
    fitText(ctx, input.from, 356, (px) => `600 ${px}px ${hand}`, 66, 36, W - 240);
    ctx.globalAlpha = 1;
    qrTop = 410;
  }

  // QR di atas kotak putih (tetap terbaca di template berlatar gelap)
  const box = 640;
  const bx = (W - box) / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(30,27,24,0.18)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, bx, qrTop, box, box, 44);
  ctx.fill();
  ctx.restore();
  const pad = 36;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, bx + pad, qrTop + pad, box - pad * 2, box - pad * 2);
  ctx.imageSmoothingEnabled = true;

  const below = qrTop + box;
  ctx.fillStyle = ink;
  ctx.font = `700 40px ${sans}`;
  ctx.fillText(input.scan, W / 2, below + 86, W - 160);
  ctx.globalAlpha = 0.7;
  fitText(ctx, input.url.replace(/^https?:\/\//, ''), below + 140, (px) => `600 ${px}px ${sans}`, 34, 22, W - 200);
  ctx.globalAlpha = 1;

  // logo kecil di bawah
  ctx.font = `600 40px ${display}`;
  const word = 'floa';
  const ww = ctx.measureText(word).width;
  const icon = flower ? 44 : 0;
  const gap = flower ? 10 : 0;
  const startX = W / 2 - (icon + gap + ww) / 2;
  const baseY = H - 92;
  if (flower) ctx.drawImage(flower, startX, baseY - 36, icon, icon);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 0.85;
  ctx.fillText(word, startX + icon + gap, baseY);
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png');
}
