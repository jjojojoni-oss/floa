'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import s from './game.module.css';

export type IjazahText = {
  title: string;
  how: string;
  blow: string;
  /** per tempat: [saat nyangkut, setelah ditangkap] */
  spots: [string, string][];
  winTitle: string;
  winLine: string;
  catchAria: string;
};

/** posisi ijazah di tiap tempat (relatif arena): merpati, dahan, peci Ayah */
const AT: { left: string; top: string; rot: number }[] = [
  { left: '64%', top: 'calc(50% + 3.6em)', rot: -8 },
  { left: '10em', top: 'calc(44% + 2.3em)', rot: -9 },
  { left: '50%', top: 'calc(100% - 9.7em)', rot: -3 },
];
const GOAL = AT.length;

/** menjalankan `run` sekali, begitu arena benar-benar dimainkan */
function OnPlay({ playing, run }: { playing: boolean; run: () => void }) {
  const done = useRef(false);
  useEffect(() => {
    if (playing && !done.current) {
      done.current = true;
      run();
    }
  }, [playing, run]);
  return null;
}

/**
 * "Kejar ijazahnya!": angin iseng menerbangkan ijazah ke tiga tempat konyol (dibawa merpati, nyangkut
 * di dahan, mendarat di peci Ayah). Ijazahnya menunggu di sana sampai diketuk. Terakhir diikat pita.
 */
export function IjazahGame({ t, onDone }: { t: IjazahText; onDone: () => void }) {
  /** -1 = belum mulai · 0..2 = sedang di tempat ke-i · 3 = selesai */
  const [round, setRound] = useState(-1);
  const [line, setLine] = useState<{ k: number; text: string } | null>(null);
  const [tied, setTied] = useState(false);
  const [catching, setCatching] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const later = useTimers();

  const blowTo = (r: number) => {
    sfx.whoosh();
    setRound(r);
    setLine({ k: r * 2, text: r === 0 ? t.blow : t.spots[r][0] });
    if (r === 0) later(() => setLine({ k: 1, text: t.spots[0][0] }), 1500);
  };

  const start = () => later(() => blowTo(0), 500);

  const tap = () => {
    if (catching || round < 0 || round >= GOAL) return;
    const r = round;
    setCatching(true);
    sfx.bonk();
    later(() => sfx.score(r + 1), 120);
    haptic(16);
    setLine({ k: r * 2 + 1, text: t.spots[r][1] });
    later(() => {
      setCatching(false);
      if (r + 1 < GOAL) blowTo(r + 1);
      else {
        setRound(GOAL);
        setTied(true);
        sfx.chime();
      }
    }, 1500);
  };

  const pos =
    round >= 0 && round < GOAL && !catching
      ? AT[round]
      : { left: '50%', top: '60%', rot: 0 };

  return (
    <MiniGame
      title={t.title}
      how={t.how}
      art={<Sprite name="toga-gulungan" className={s.introScroll} />}
      goal={GOAL}
      score={Math.max(0, round + (catching ? 1 : 0))}
      won={tied}
      winTitle={t.winTitle}
      winLine={t.winLine}
      onDone={onDone}
    >
      {(playing) => (
        <>
          <OnPlay playing={playing} run={start} />
          <span className={s.wind} aria-hidden>
            <i />
            <i />
            <i />
          </span>

          {/* 1. merpati yang iseng membawa kabur */}
          <span className={cx(s.dove, round === 0 && !catching && s.doveIn, round === 0 && catching && s.doveOut, round > 0 && s.doveGone)} aria-hidden>
            <Sprite name="game-merpati-sayap" className={s.wingBack} />
            <Sprite name="game-merpati" className={s.doveBody} />
            <Sprite name="game-merpati-sayap" className={s.wing} />
          </span>

          {/* 2. dahan pohon dari tepi kiri */}
          <span className={cx(s.branch, round === 1 && s.branchIn)} aria-hidden>
            <Sprite name="game-dahan" />
          </span>

          {/* 3. kepala Ayah (pakai peci) naik dari bawah */}
          <span className={cx(s.ayah, round === 2 && s.ayahIn)} aria-hidden>
            <Sprite name="game-peci-ayah" />
          </span>

          {/* ijazahnya: menunggu di tempatnya sampai diketuk */}
          <button
            ref={btn}
            type="button"
            className={cx(s.scroll, round < 0 && s.scrollRest, catching && s.caught, tied && s.tied)}
            style={{ left: pos.left, top: pos.top, '--rot': `${pos.rot}deg` } as CSSProperties}
            onClick={tap}
            disabled={!playing || round < 0 || tied}
            aria-label={t.catchAria}
          >
            <span className={s.scrollIn}>
              <Sprite name="toga-gulungan" className={s.scrollImg} />
            </span>
          </button>

          {line ? (
            <p key={line.k} className={s.line} role="status">
              {line.text}
            </p>
          ) : null}
          <TapCue target={btn} show={playing && round === 0 && !catching} delay={2200} at={{ x: 0.5, y: 0.5 }} />
        </>
      )}
    </MiniGame>
  );
}
