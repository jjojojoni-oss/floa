'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';

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
import { MiniGame, Sprite, TapCue, cx, haptic, sfx } from '../kit';
import s from './game.module.css';

export type NyaliText = {
  titleFrom: string;
  titleAnon: string;
  how: string;
  meter: string;
  /** 5 tahap: 0-24, 25-49, 50-74, 75-99, penuh */
  stages: string[];
  cheer: string;
  pops: string[];
  winTitle: string;
  winLine: string;
};

const GOAL = 4;
/** ±8 ketukan sampai penuh */
const STEP = 13;

/** Wajah si hati, berubah sesuai tahap nyali: gugup → cemas → mantap → yakin → berani. */
function Face({ stage }: { stage: number }) {
  const eye = (cx: number) => {
    if (stage >= 4) {
      // mata berbinar (bintang kecil)
      return (
        <g key={cx}>
          <circle cx={cx} cy={98} r={13} fill="#3a1220" />
          <path d={`M${cx - 4},${92}l2,4 4,1 -3,3 1,4 -4,-2 -4,2 1,-4 -3,-3 4,-1z`} fill="#fff" />
          <circle cx={cx + 5} cy={104} r={2.2} fill="#fff" opacity={0.85} />
        </g>
      );
    }
    const look = stage === 0 ? -4 : stage === 1 ? 3 : 0;
    const r = stage <= 1 ? 11 : 13;
    return (
      <g key={cx}>
        <circle cx={cx} cy={98} r={14.5} fill="#fff5f6" />
        <circle cx={cx + look} cy={99} r={r} fill="#3a1220" />
        <circle cx={cx + look - 4} cy={94} r={4.6} fill="#fff" />
        <circle cx={cx + look + 4} cy={104} r={2} fill="#fff" opacity={0.85} />
      </g>
    );
  };
  const brow =
    stage <= 1 ? (
      <path d="M68,82l18,-7M152,82l-18,-7" stroke="#7a1530" strokeWidth={4} strokeLinecap="round" fill="none" />
    ) : stage === 2 ? (
      <path d="M68,80l18,-2M152,80l-18,-2" stroke="#7a1530" strokeWidth={4} strokeLinecap="round" fill="none" />
    ) : null;
  const mouth =
    stage === 0 ? (
      <path d="M94,128q4,-5 8,0t8,0t8,0t8,0" stroke="#7a1530" strokeWidth={3.6} strokeLinecap="round" fill="none" />
    ) : stage === 1 ? (
      <ellipse cx={110} cy={128} rx={6} ry={7.5} fill="#7a1530" />
    ) : stage === 2 ? (
      <path d="M98,128h24" stroke="#7a1530" strokeWidth={4} strokeLinecap="round" />
    ) : stage === 3 ? (
      <path d="M96,124q14,12 28,0" stroke="#7a1530" strokeWidth={4} strokeLinecap="round" fill="none" />
    ) : (
      <path d="M92,120q18,26 36,0z" fill="#7a1530" stroke="#7a1530" strokeWidth={3} strokeLinejoin="round" />
    );
  return (
    <svg className={s.face} viewBox="0 0 220 236" aria-hidden>
      {brow}
      {eye(84)}
      {eye(136)}
      <ellipse cx={66} cy={118} rx={11} ry={6.5} fill="#ff8fa6" opacity={stage >= 3 ? 0.85 : 0.6} />
      <ellipse cx={154} cy={118} rx={11} ry={6.5} fill="#ff8fa6" opacity={stage >= 3 ? 0.85 : 0.6} />
      {mouth}
    </svg>
  );
}

/**
 * "Bantu {nama} berani!": ketuk terus supaya meteran nyali penuh. Kalau berhenti, nyalinya ciut pelan-pelan,
 * tapi tidak pernah habis mendadak; selalu bisa selesai.
 */
export function NyaliGame({ t, name, onDone }: { t: NyaliText; name: string; onDone: () => void }) {
  const [level, setLevel] = useState(0);
  const [bump, setBump] = useState(0);
  const [pops, setPops] = useState<{ k: number; x: number; text: string }[]>([]);
  const levelRef = useRef(0);
  const playingRef = useRef(false);
  const cheerRef = useRef<HTMLButtonElement>(null);
  const k = useRef(0);
  const won = level >= 100;
  const stage = won ? 4 : Math.min(3, Math.floor(level / 25));

  const cheer = () => {
    if (!playingRef.current || levelRef.current >= 100) return;
    const before = Math.floor(levelRef.current / 25);
    levelRef.current = Math.min(100, levelRef.current + STEP);
    setLevel(levelRef.current);
    setBump((b) => b + 1);
    const after = Math.floor(levelRef.current / 25);
    if (levelRef.current >= 100) {
      sfx.boing();
      haptic(40);
    } else if (after > before) {
      sfx.score(after + 1);
      haptic(18);
    } else {
      sfx.tap();
      haptic(6);
    }
    const n = ++k.current;
    setPops((p) => [...p.slice(-5), { k: n, x: 18 + Math.random() * 64, text: t.pops[n % t.pops.length] }]);
  };

  return (
    <MiniGame
      title={name ? t.titleFrom.replace('{name}', name) : t.titleAnon}
      how={t.how}
      art={<Sprite name="game-hati-gugup" className={s.introHeart} />}
      goal={GOAL}
      score={Math.min(GOAL, Math.floor(level / 25))}
      won={won}
      winTitle={t.winTitle}
      winLine={t.winLine}
      onDone={onDone}
    >
      {(playing) => (
        <div className={s.arena} style={{ '--lv': level / 100, '--shake': `${(1 - level / 100) * 2.2}deg` } as CSSProperties}>
          <OnPlay playing={playing} run={() => (playingRef.current = true)} />
          <div className={s.stageLine} key={stage} role="status">
            {t.stages[stage]}
          </div>

          <div className={s.row}>
            <button
              type="button"
              className={cx(s.hero, won && s.heroWon)}
              onClick={cheer}
              aria-label={t.cheer}
              tabIndex={playing ? 0 : -1}
            >
              <span key={bump} className={cx(s.heroIn, bump > 0 && s.bump)}>
                <span className={s.tremble}>
                  <Sprite name="game-hati-gugup" className={s.heart} />
                  <Face stage={stage} />
                  {stage <= 1 && !won ? (
                    <>
                      <span className={cx(s.sweat, s.sweat1)} />
                      {stage === 0 ? <span className={cx(s.sweat, s.sweat2)} /> : null}
                    </>
                  ) : null}
                  {won ? (
                    <>
                      <span className={cx(s.spark, s.spark1)}>✦</span>
                      <span className={cx(s.spark, s.spark2)}>✦</span>
                      <span className={cx(s.spark, s.spark3)}>✦</span>
                    </>
                  ) : null}
                </span>
              </span>
              {pops.map((p) => (
                <span key={p.k} className={s.pop} style={{ left: `${p.x}%` }} aria-hidden>
                  {p.text}
                </span>
              ))}
            </button>

            <div className={s.meter} aria-hidden>
              <span className={s.meterFill} />
              <i style={{ bottom: '25%' }} />
              <i style={{ bottom: '50%' }} />
              <i style={{ bottom: '75%' }} />
              <span className={s.meterLabel}>{t.meter}</span>
            </div>
          </div>

          <button ref={cheerRef} type="button" className={s.cheer} onClick={cheer} disabled={!playing || won}>
            {t.cheer}
          </button>
          <TapCue target={cheerRef} show={playing && level === 0} delay={1600} />
        </div>
      )}
    </MiniGame>
  );
}
