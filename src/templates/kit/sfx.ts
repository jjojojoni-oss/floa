'use client';

/**
 * Efek bunyi kecil dari WebAudio (tanpa file audio). Semua aman dipanggil kapan saja:
 * kalau browser belum mengizinkan audio atau sedang dibisukan, tidak terjadi apa-apa.
 */

type Ctx = AudioContext;
let ctx: Ctx | null = null;
let muted = false;
const listeners = new Set<() => void>();
const KEY = 'floa:mute';

if (typeof window !== 'undefined') {
  try {
    muted = window.localStorage.getItem(KEY) === '1';
  } catch {
    /* penyimpanan diblokir: abaikan */
  }
}

function ac(): Ctx | null {
  if (typeof window === 'undefined' || muted) return null;
  try {
    if (!ctx) {
      const C: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  dur: number,
  opts: { type?: OscillatorType; gain?: number; at?: number; to?: number } = {},
) {
  const c = ac();
  if (!c) return;
  const { type = 'sine', gain = 0.07, at = 0, to } = opts;
  const t0 = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
}

function noise(dur: number, opts: { gain?: number; from?: number; to?: number; at?: number } = {}) {
  const c = ac();
  if (!c) return;
  const { gain = 0.05, from = 400, to = 2400, at = 0 } = opts;
  const t0 = c.currentTime + at;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 0.8;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.03);
}

export const sfx = {
  /** ketukan ringan */
  tap() {
    tone(620, 0.07, { type: 'triangle', gain: 0.05 });
  },
  /** sesuatu muncul / mekar */
  pop() {
    tone(480, 0.12, { gain: 0.08, to: 920 });
  },
  /** denting manis, untuk momen kecil */
  chime() {
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.55, { gain: 0.05, at: i * 0.07 }));
  },
  /** momen puncak */
  success() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.42, { type: 'triangle', gain: 0.06, at: i * 0.09 }));
  },
  /** angin / lempar / geser */
  whoosh() {
    noise(0.32, { gain: 0.05, from: 300, to: 2600 });
  },
  /** kertas / sobek / segel patah */
  crack() {
    noise(0.09, { gain: 0.09, from: 2200, to: 700 });
    tone(180, 0.09, { type: 'square', gain: 0.03 });
  },
  /** tiupan */
  blow() {
    noise(0.6, { gain: 0.045, from: 900, to: 250 });
  },
  /** tali goni yang ditarik tapi simpulnya masih bertahan: derit pendek */
  tug() {
    tone(118, 0.14, { type: 'sawtooth', gain: 0.022, to: 84 });
    noise(0.07, { gain: 0.05, from: 900, to: 520 });
  },
  /** simpul tali lepas dan talinya meluncur */
  untie() {
    noise(0.38, { gain: 0.045, from: 1300, to: 3400 });
    tone(330, 0.08, { type: 'triangle', gain: 0.035, at: 0.34, to: 520 });
  },
  /** kertas pembungkus yang dibuka: kresek-kresek kecil */
  rustle() {
    for (let i = 0; i < 7; i++) {
      const f = 1400 + Math.random() * 3200;
      noise(0.05 + Math.random() * 0.05, { gain: 0.035 + Math.random() * 0.03, from: f, to: f * 0.7, at: i * 0.06 + Math.random() * 0.03 });
    }
  },
  /** pensil yang melingkari sesuatu di kertas */
  pencil() {
    for (let i = 0; i < 4; i++) noise(0.08, { gain: 0.03, from: 2600 + i * 300, to: 4200, at: i * 0.085 });
  },
  /** per kartun: boing! (untuk game) */
  boing() {
    tone(190, 0.32, { type: 'sine', gain: 0.08, to: 520 });
    tone(520, 0.22, { type: 'sine', gain: 0.05, at: 0.12, to: 300 });
  },
  /** benturan kecil yang lucu: bonk */
  bonk() {
    tone(240, 0.12, { type: 'triangle', gain: 0.09, to: 120 });
    noise(0.05, { gain: 0.05, from: 900, to: 400 });
  },
  /** cicit kecil (makhluk kecil kabur) */
  squeak() {
    tone(1400, 0.09, { type: 'sine', gain: 0.05, to: 2300 });
    tone(2100, 0.07, { type: 'sine', gain: 0.04, at: 0.08, to: 1500 });
  },
  /** terompet sedih 'wah-wah' untuk meleset yang lucu */
  wahwah() {
    [392, 370, 349].forEach((f, i) => tone(f, 0.22, { type: 'sawtooth', gain: 0.025, at: i * 0.2, to: f - 12 }));
    tone(330, 0.5, { type: 'sawtooth', gain: 0.025, at: 0.6, to: 300 });
  },
  /** poin didapat: nada naik sesuai skor */
  score(n: number) {
    const scale = [659, 784, 880, 988, 1175, 1319, 1568];
    tone(scale[Math.min(scale.length - 1, Math.max(0, n))], 0.16, { type: 'triangle', gain: 0.06 });
  },
  /** nada tunggal bebas, mis. untuk tangga nada per langkah */
  note(step: number) {
    const scale = [523, 587, 659, 784, 880, 1047, 1175, 1319];
    tone(scale[Math.abs(step) % scale.length], 0.35, { gain: 0.06 });
  },
};

export function haptic(ms = 10) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms);
  } catch {
    /* tidak didukung */
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    window.localStorage.setItem(KEY, next ? '1' : '0');
  } catch {
    /* abaikan */
  }
  listeners.forEach((l) => l());
}

export function subscribeMuted(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
