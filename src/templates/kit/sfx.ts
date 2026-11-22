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
