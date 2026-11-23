'use client';

import { isMuted, subscribeMuted } from '../kit/sfx';

/**
 * Lagu ulang tahun (melodi "Happy Birthday", milik umum) dimainkan seperti kotak musik lewat WebAudio.
 * Empat baris; tiap nada = [frekuensi, ketukan].
 */
const G4 = 392, A4 = 440, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
export const LINES: [number, number][][] = [
  [[G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [C5, 1], [B4, 2]],
  [[G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [D5, 1], [C5, 2]],
  [[G4, 0.75], [G4, 0.25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2]],
  [[F5, 0.75], [F5, 0.25], [E5, 1], [C5, 1], [D5, 1], [C5, 2.5]],
];
/** detik per ketukan */
export const BEAT = 0.5;

/** Waktu mulai tiap baris (detik) dan panjang total lagu. */
export function songTiming() {
  const starts: number[] = [];
  let t = 0;
  for (const line of LINES) {
    starts.push(t);
    t += line.reduce((a, [, b]) => a + b, 0) * BEAT + 0.15;
  }
  return { starts, total: t };
}

type Ctx = AudioContext;
function makeCtx(): Ctx | null {
  if (typeof window === 'undefined') return null;
  const C: typeof AudioContext | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  try {
    return C ? new C() : null;
  } catch {
    return null;
  }
}

/** Satu nada kotak musik: dasar + oktaf tipis, serangan cepat, gema memudar. */
function pluck(c: Ctx, out: AudioNode, f: number, at: number, len: number, gain = 0.5) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.5, len * 1.7));
  g.connect(out);
  [
    [f, 'sine', 1],
    [f * 2, 'sine', 0.22],
    [f * 3, 'triangle', 0.06],
  ].forEach(([fr, type, k]) => {
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = type as OscillatorType;
    o.frequency.setValueAtTime(fr as number, at);
    og.gain.value = k as number;
    o.connect(og).connect(g);
    o.start(at);
    o.stop(at + Math.max(0.6, len * 1.8));
  });
}

/** Memainkan lagu sekali. Mengembalikan fungsi berhenti. Tombol suara di Stage ikut dihormati. */
export function playSong(): () => void {
  const c = makeCtx();
  if (!c) return () => {};
  if (c.state === 'suspended') void c.resume().catch(() => {});
  const master = c.createGain();
  master.gain.value = isMuted() ? 0 : 0.16;
  master.connect(c.destination);
  const unsub = subscribeMuted(() => {
    master.gain.setTargetAtTime(isMuted() ? 0 : 0.16, c.currentTime, 0.05);
  });
  let t = c.currentTime + 0.08;
  LINES.forEach((line) => {
    // nada bas lembut di awal tiap baris
    pluck(c, master, line[2][0] / 4, t + (line[0][1] + line[1][1]) * BEAT, 1.6, 0.18);
    for (const [f, b] of line) {
      pluck(c, master, f, t, b * BEAT);
      t += b * BEAT;
    }
    t += 0.15;
  });
  const end = setTimeout(() => void c.close().catch(() => {}), (t - c.currentTime + 2.5) * 1000);
  return () => {
    clearTimeout(end);
    unsub();
    master.gain.setTargetAtTime(0, c.currentTime, 0.04);
    setTimeout(() => void c.close().catch(() => {}), 300);
  };
}

/** Bunyi tepuk tangan kecil (dua tepukan cepat). */
export function clap() {
  if (isMuted()) return;
  const c = makeCtx();
  if (!c) return;
  const burst = (at: number) => {
    const len = Math.floor(c.sampleRate * 0.09);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1500;
    f.Q.value = 0.9;
    const g = c.createGain();
    g.gain.value = 0.32;
    src.connect(f).connect(g).connect(c.destination);
    src.start(at);
  };
  burst(c.currentTime + 0.01);
  burst(c.currentTime + 0.11);
  setTimeout(() => void c.close().catch(() => {}), 600);
}
