'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { fmt } from '@/i18n/fmt';
import { Confetti, cx, haptic, sfx, useKitText } from './index';
import s from './Game.module.css';

type Phase = 'intro' | 'play' | 'win';

/**
 * Bingkai mini-game yang sama untuk semua template:
 * kartu pembuka ("main dulu, yuk" + aturan satu baris) → arena main dengan skor kecil di atas →
 * kartu menang dengan konfeti → `onDone`. Selalu bisa dilewati, tidak ada kalah.
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
  /** judul game, mis. "Usir kumbang rakus!" */
  title: string;
  /** cara main, satu kalimat */
  how: string;
  /** gambar kecil di kartu pembuka */
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
  const [phase, setPhase] = useState<Phase>('intro');
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

  const start = () => {
    sfx.tap();
    haptic(8);
    setPhase('play');
    onStart?.();
  };

  const playing = phase === 'play';
  const field = typeof children === 'function' ? children(playing) : children;

  return (
    <div className={cx(s.game, s[phase])} role="group" aria-label={title}>
      {phase !== 'intro' ? <div className={s.field}>{field}</div> : null}

      {phase === 'intro' ? (
        <div className={s.introWrap}>
          <div className={s.card} role="dialog" aria-label={title}>
            <span className={s.eyebrow}>{k.gameEyebrow}</span>
            {art ? <div className={s.art}>{art}</div> : null}
            <h2 className={s.title}>{title}</h2>
            <p className={s.how}>{how}</p>
            <button type="button" className={s.play} onClick={start} autoFocus>
              {k.gamePlay}
            </button>
            <button type="button" className={s.skip} onClick={finish}>
              {k.gameSkip}
            </button>
          </div>
        </div>
      ) : null}

      {phase === 'play' ? (
        <>
          <div className={s.hud}>
            <span className={s.hudTitle}>{title}</span>
            {goal ? (
              <span className={s.pips} role="status" aria-label={fmt(k.gameScore, { n: Math.min(score, goal), goal })}>
                {Array.from({ length: goal }, (_, i) => (
                  <i key={i} className={cx(i < score && s.on)} />
                ))}
              </span>
            ) : null}
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
