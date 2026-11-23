'use client';

import { useEffect, useRef, useState } from 'react';
import { Sprite, TapCue, Typewriter, cx, haptic, sfx, useTimers } from '../kit';
import s from './Card.module.css';

export type CardText = {
  cardFront: string;
  cardFrontAnon: string;
  cardFrom: string;
  cardOpenHint: string;
  cardOpenLabel: string;
  cardInner: string;
  cardSalam: string;
  readAll: string;
};

/**
 * Kartu ucapan yang terselip di buket: ditarik ke tengah, dibuka ke atas (lipatan di sisi atas),
 * sekuntum melati kering jatuh dari lipatannya, lalu salam dan paragraf pertama tertulis tangan.
 * `onRead` membawa ke surat lengkap.
 */
export function BouquetCard({
  to,
  from,
  first,
  t,
  fmt,
  onRead,
}: {
  to: string;
  from: string;
  /** paragraf pertama surat */
  first: string;
  t: CardText;
  fmt: (tpl: string, v: Record<string, string>) => string;
  onRead: () => void;
}) {
  const [phase, setPhase] = useState<'arrive' | 'closed' | 'open' | 'written'>('arrive');
  const later = useTimers();
  const coverRef = useRef<HTMLButtonElement>(null);
  const readRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    later(() => setPhase('closed'), reduce.current ? 50 : 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = () => {
    if (phase !== 'closed') return;
    setPhase('open');
    sfx.rustle();
    haptic(14);
    later(() => sfx.chime(), 650);
  };

  // potong paragraf pertama yang terlalu panjang supaya muat di kartu
  const text = first.length > 170 ? first.slice(0, first.lastIndexOf(' ', 165)).trim() + '…' : first;

  return (
    <div className={cx(s.overlay, phase !== 'arrive' && s.settled)} role="dialog" aria-label={t.cardOpenLabel}>
      <div className={cx(s.card, s[phase])}>
        {/* bagian dalam bawah: salam + paragraf pertama */}
        <div className={s.inside}>
          <span className={s.salam}>{fmt(t.cardSalam, { to: to || '' }).replace(/\s+,/, ',')}</span>
          <p className={s.body}>
            {phase === 'open' || phase === 'written' ? (
              <Typewriter text={text} speed={34} onDone={() => setPhase('written')} />
            ) : null}
          </p>
          {from ? <span className={cx(s.sign, phase === 'written' && s.shown)}>{fmt(t.cardFrom, { from })}</span> : null}
        </div>

        {/* sampul: depan bergambar, belakangnya bagian dalam atas */}
        <button ref={coverRef} type="button" className={s.cover} onClick={open} disabled={phase !== 'closed'} aria-label={t.cardOpenLabel}>
          <span className={s.front}>
            <Sprite name="daun-2" className={s.leaf} />
            <Sprite name="bunga-kamboja" className={s.pressed} />
            <span className={s.frontTo}>{to ? fmt(t.cardFront, { to }) : t.cardFrontAnon}</span>
            <span className={s.frontRule} aria-hidden />
          </span>
          <span className={s.back} aria-hidden>
            <span className={s.tape} />
            <span className={s.inner}>{t.cardInner}</span>
            <span className={s.heart}>♡</span>
          </span>
        </button>
      </div>

      {/* melati kering yang jatuh dari lipatan kartu */}
      {phase === 'open' || phase === 'written' ? (
        <span className={s.fall} aria-hidden>
          <Sprite name="bunga-melati" className={s.fallArt} />
        </span>
      ) : null}

      <button
        ref={readRef}
        type="button"
        className={cx(s.read, phase === 'written' && s.shown)}
        onClick={() => {
          sfx.tap();
          onRead();
        }}
        tabIndex={phase === 'written' ? 0 : -1}
      >
        {t.readAll}
      </button>

      {phase === 'closed' ? <p className={s.hint}>{t.cardOpenHint}</p> : null}
      <TapCue target={coverRef} show={phase === 'closed'} delay={2200} at={{ x: 0.5, y: 0.6 }} />
      <TapCue target={readRef} show={phase === 'written'} delay={3500} />
    </div>
  );
}
