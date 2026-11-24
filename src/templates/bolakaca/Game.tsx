'use client';

import { useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { BolaText } from './i18n';
import g from './game.module.css';

type GameText = BolaText['game'];
type Mood = 'rain' | 'shoo' | 'bye';
const GOAL = 3;

/** Wajah si Awan (viewBox sama dengan lukisannya, 260×170): iseng sambil menyiram, kaget diusir, atau pamit. */
function Face({ mood }: { mood: Mood }) {
  const ink = '#33405e';
  return (
    <svg className={g.face} viewBox="0 0 260 170" aria-hidden>
      {mood === 'rain' ? (
        <>
          {/* mata merem puas + senyum miring: "aku cuma bantu nyiram" */}
          <path d="M98,90q10,-9 20,0M142,90q10,-9 20,0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M116,108q14,10 30,-2" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M140,106q8,3 6,10" fill="none" stroke="#ff8fa6" strokeWidth={4} strokeLinecap="round" />
        </>
      ) : mood === 'shoo' ? (
        <>
          <circle cx={108} cy={90} r={10} fill="#fff" stroke={ink} strokeWidth={3.5} />
          <circle cx={152} cy={90} r={10} fill="#fff" stroke={ink} strokeWidth={3.5} />
          <circle cx={110} cy={92} r={4} fill={ink} />
          <circle cx={150} cy={92} r={4} fill={ink} />
          <ellipse cx={130} cy={114} rx={7} ry={9} fill={ink} />
          <path d="M176,66q6,10 0,16q-7,-4 0,-16Z" fill="#bfe2ff" stroke="#7fb3dc" strokeWidth={1.5} />
        </>
      ) : (
        <>
          <path d="M98,94q10,-11 20,0M142,94q10,-11 20,0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M112,104q18,22 36,0Z" fill={ink} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M120,112q10,6 20,0" fill="none" stroke="#ff8f86" strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      <ellipse cx={92} cy={108} rx={10} ry={6} fill="#ff9fb4" opacity={0.55} />
      <ellipse cx={168} cy={108} rx={10} ry={6} fill="#ff9fb4" opacity={0.55} />
    </svg>
  );
}

/**
 * Usir awan iseng: awan kecil berwajah yang terus menghujani rumah mungil. Tiap ketukan (di mana saja) membuatnya
 * kaget dan bergeser sambil beralasan, lalu ia merayap kembali. Ketukan ketiga: ia pamit, pelangi muncul.
 */
export function CloudGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [shooed, setShooed] = useState(0);
  const [mood, setMood] = useState<Mood>('rain');
  /** posisi awan: 0 di atas rumah, -1/1 bergeser ke samping, 2 pergi */
  const [side, setSide] = useState(0);
  const [line, setLine] = useState<string | null>(null);
  const cloudRef = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  /** nomor ketukan terakhir: "balik lagi" dari ketukan lama tidak boleh menimpa yang lebih baru */
  const seq = useRef(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const poke = () => {
    if (busy.current || shooed >= GOAL) return;
    busy.current = true;
    const k = shooed + 1;
    seq.current = k;
    setMood(k === GOAL ? 'bye' : 'shoo');
    setSide(k === GOAL ? 2 : k % 2 ? 1 : -1);
    setLine(t.lines[k - 1]);
    haptic(k === GOAL ? 26 : 14);
    sfx.whoosh();
    if (k === GOAL) [4, 5, 7].forEach((n, i) => later(() => sfx.note(n), 240 + i * 150));
    else later(() => sfx.squeak(), 160);
    later(() => {
      setShooed(k);
      busy.current = false;
      // belum tiga kali: ia merayap kembali ke atas rumah
      if (k < GOAL)
        later(() => {
          if (seq.current !== k) return;
          setSide(0);
          setMood('rain');
        }, reduce.current ? 200 : 1300);
    }, reduce.current ? 150 : 600);
  };

  const raining = mood === 'rain' && side === 0;

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={shooed} won={shooed >= GOAL} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {(live) => (
        // ketukan di mana saja mengusirnya
        <div className={g.field} onClick={poke}>
          <span className={cx(g.rainbow, shooed >= GOAL && g.show)} aria-hidden />
          <span className={g.house} aria-hidden>
            <Sprite name="game-bolakaca-rumah" className={g.art} />
            <i className={g.lamp} />
          </span>
          <span className={cx(g.drops, raining && g.pour)} aria-hidden />
          <button
            ref={cloudRef}
            type="button"
            className={cx(g.cloud, side === 1 && g.right, side === -1 && g.left, side === 2 && g.gone)}
            onClick={(e) => {
              e.stopPropagation();
              poke();
            }}
            aria-label={t.cloudLabel}
          >
            <span key={`${mood}${shooed}`} className={cx(g.bob, g[mood])}>
              <Sprite name="game-bolakaca-awan" className={g.art} />
              <Face mood={mood} />
            </span>
          </button>

          {line && live ? (
            <div key={line} className={g.bubble} role="status">
              {line}
            </div>
          ) : null}

          <TapCue target={cloudRef} show={shooed === 0 && mood === 'rain'} delay={1500} at={{ x: 0.5, y: 0.6 }} />
        </div>
      )}
    </MiniGame>
  );
}
