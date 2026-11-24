'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { fmt } from '@/i18n/fmt';
import { Confetti, cx, haptic, sfx, useKitText } from './index';
import s from './Game.module.css';

type Phase = 'play' | 'win';

/**
 * Bingkai interaksi kecil (mini-game) yang sama untuk semua template, dibuat ringan:
 * arena langsung aktif dengan judul + satu baris cara main di atas (baris cara main hilang setelah
 * sentuhan pertama) → kartu kecil berkonfeti dengan celetukan → `onDone`. Selalu bisa dilewati,
 * tidak ada kalah.
 *
 * Template mengurus isi arenanya sendiri (`children`, dirender di kotak `position:absolute; inset:0`
 * dengan container-type size, jadi boleh pakai cqw/cqh) dan memberi tahu `won` saat game selesai.
 */
export function MiniGame({
  title,
  how,
  art,
  goal,
  score = 0,
  won,
  winTitle,
  winLine,
  onStart,
  onDone,
  children,
}: {
  /** judul game, mis. "Usir lebah rakus!" */
  title: string;
  /** cara main, satu kalimat */
  how: string;
  /** (tidak dipakai lagi; dibiarkan supaya pemanggil lama tetap jalan) */
  art?: ReactNode;
  /** target skor untuk penghitung (opsional) */
  goal?: number;
  score?: number;
  /** jadikan true saat game selesai */
  won: boolean;
  winTitle: string;
  winLine?: string;
  onStart?: () => void;
  /** lanjut ke langkah berikutnya (juga dipanggil saat game dilewati) */
  onDone: () => void;
  /** isi arena; menerima `playing` (true selama fase main) */
  children: ReactNode | ((playing: boolean) => ReactNode);
}) {
  const k = useKitText();
  const [phase, setPhase] = useState<Phase>('play');
  const [touched, setTouched] = useState(false);
  const [burst, setBurst] = useState(0);
  const left = useRef(false);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!won || phase === 'win') return;
    const t = setTimeout(() => {
      setPhase('win');
      setBurst((b) => b + 1);
      sfx.success();
      haptic(30);
    }, 650);
    return () => clearTimeout(t);
  }, [won, phase]);

  useEffect(() => {
    if (phase === 'win') {
      const t = setTimeout(() => nextRef.current?.focus({ preventScroll: true }), 900);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const finish = () => {
    if (left.current) return;
    left.current = true;
    onDone();
  };

  // baris cara main cukup sebentar: hilang setelah sentuhan pertama atau 4 detik
  useEffect(() => {
    const t = setTimeout(() => setTouched(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // langsung main; onStart dipanggil sekali saat arena muncul
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    onStart?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playing = phase === 'play';
  const field = typeof children === 'function' ? children(playing) : children;

  return (
    <div className={s.game} data-phase={phase} role="group" aria-label={title} onPointerDownCapture={() => !touched && setTouched(true)}>
      {/* selubung lembut di atas: judul template meredup supaya tidak bertumpuk dengan teks game */}
      <div className={s.veil} aria-hidden />
      <div className={s.field}>{field}</div>

      {phase === 'play' ? (
        <>
          <div className={s.hud}>
            <div className={s.hudRow}>
              <span className={s.hudTitle}>{title}</span>
              {goal ? (
                <span className={s.pips} role="status" aria-label={fmt(k.gameScore, { n: Math.min(score, goal), goal })}>
                  {Array.from({ length: goal }, (_, i) => (
                    <i key={i} className={cx(i < score && s.on)} />
                  ))}
                </span>
              ) : null}
            </div>
            {how ? <p className={cx(s.hudHow, (touched || score > 0) && s.gone)}>{how}</p> : null}
          </div>
          <button type="button" className={s.skipCorner} onClick={finish}>
            {k.gameSkip}
          </button>
        </>
      ) : null}

      {phase === 'win' ? (
        <div className={s.winWrap}>
          <div className={s.winCard} role="status">
            <h2 className={s.winTitle}>{winTitle}</h2>
            {winLine ? <p className={s.winLine}>{winLine}</p> : null}
            <button ref={nextRef} type="button" className={s.play} onClick={finish}>
              {k.gameNext}
            </button>
          </div>
        </div>
      ) : null}

      <Confetti burst={burst} origin={{ x: 0.5, y: 0.55 }} count={90} />
    </div>
  );
}
