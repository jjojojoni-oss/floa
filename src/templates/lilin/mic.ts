'use client';

/** Lama tiupan (ms) yang dibutuhkan untuk memadamkan lilin. */
const HOLD = 650;

/**
 * Mendengarkan tiupan lewat mikrofon. `level` (0..1) mengikuti seberapa lama tiupan sudah berlangsung
 * (dipakai untuk mencondongkan api), `blow` dipanggil saat tiupannya cukup panjang.
 * AudioContext dibuat langsung di dalam ketukan supaya iOS mengizinkan, baru izin mikrofon diminta.
 */
export function listenForBlow(cb: { level: (p: number) => void; blow: () => void }) {
  let stopped = false;
  let raf = 0;
  let stream: MediaStream | null = null;
  const C: typeof AudioContext | undefined =
    typeof window === 'undefined'
      ? undefined
      : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  let c: AudioContext | null = null;
  try {
    c = C ? new C() : null;
  } catch {
    c = null;
  }

  const stop = () => {
    stopped = true;
    cancelAnimationFrame(raf);
    stream?.getTracks().forEach((t) => t.stop());
    void c?.close().catch(() => {});
  };

  const ready = (async () => {
    if (!c || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) throw new Error('no-mic');
    void c.resume().catch(() => {});
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    if (stopped) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    const an = c.createAnalyser();
    an.fftSize = 1024;
    c.createMediaStreamSource(stream).connect(an);
    const buf = new Float32Array(an.fftSize);
    let acc = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (stopped) return;
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      const dt = Math.min(100, now - last);
      last = now;
      // tiupan = desis keras yang bertahan; suara pendek (ketukan, kata) cepat meluruh lagi
      acc = rms > 0.05 ? acc + dt : Math.max(0, acc - dt * 0.6);
      cb.level(Math.min(1, acc / HOLD));
      if (acc >= HOLD) {
        acc = 0;
        cb.level(0);
        cb.blow();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  })();
  ready.catch(stop);
  return { ready, stop };
}

type Policy = { allowsFeature(feature: string): boolean };

/**
 * Tombol mikrofon hanya muncul kalau peramban bisa memastikan mikrofon diizinkan oleh Permissions-Policy situs.
 * (Selama header situs masih `microphone=()`, tombolnya tersembunyi dan tiup tetap lewat tombol tahan.)
 */
export const canUseMic = () => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return false;
  const d = document as Document & { permissionsPolicy?: Policy; featurePolicy?: Policy };
  const policy = d.permissionsPolicy ?? d.featurePolicy;
  try {
    return !!policy && policy.allowsFeature('microphone');
  } catch {
    return false;
  }
};
