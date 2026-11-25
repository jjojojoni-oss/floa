'use client';

import { useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { AnnivText } from './i18n';
import g from './game.module.css';

type GameText = AnnivText['game'];
type Mood = 'sleep' | 'grumpy' | 'sneeze' | 'happy';
const GOAL = 3;

/** Wajah di pelat krem bundar pada ketel lokomotif mainan (viewBox −50..50). */
function Face({ mood }: { mood: Mood }) {
  const ink = '#3a1d12';
  return (
    <svg className={g.face} viewBox="-50 -50 100 100" aria-hidden>
      <ellipse cx={-27} cy={12} rx={9} ry={5.5} fill="#ff8f86" opacity={mood === 'happy' ? 0.8 : 0.55} />
      <ellipse cx={27} cy={12} rx={9} ry={5.5} fill="#ff8f86" opacity={mood === 'happy' ? 0.8 : 0.55} />
      {mood === 'sleep' ? (
        <>
          <path d="M-24,-4q8,7 16,0M8,-4q8,7 16,0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={0} cy={18} rx={4.5} ry={5.5} fill={ink} />
        </>
      ) : mood === 'grumpy' ? (
        <>
          <ellipse cx={-16} cy={-1} rx={6} ry={6.5} fill={ink} />
          <ellipse cx={16} cy={-1} rx={6} ry={6.5} fill={ink} />
          <path d="M-25,-9H-7M7,-9H25" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M-8,21q8,-7 16,0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : mood === 'sneeze' ? (
        <>
          <path d="M-24,-8l10,6l-10,6M24,-8l-10,6l10,6" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={0} cy={18} rx={8} ry={9} fill={ink} />
        </>
      ) : (
        <>
          <ellipse cx={-16} cy={-3} rx={7} ry={8.5} fill={ink} />
          <ellipse cx={16} cy={-3} rx={7} ry={8.5} fill={ink} />
          <circle cx={-18.5} cy={-6.5} r={2.6} fill="#fff" />
          <circle cx={13.5} cy={-6.5} r={2.6} fill="#fff" />
          <path d="M-14,13q14,15 28,0" fill="#7a2a2a" stroke={ink} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

/**
 * Bangunkan keretanya: lokomotif mainan gempal ketiduran di peron Stasiun Hari Ini. Ketukan pertama:
 * dia menggerutu lalu tidur lagi; kedua: bersin uap; ketiga: peluitnya berbunyi dan dia melaju pergi.
 * Tidak bisa kalah, selalu bisa dilewati.
 */
export function SleepyEngine({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [mood, setMood] = useState<Mood>('sleep');
  const [act, setAct] = useState<'idle' | 'shake' | 'sneeze' | 'go'>('idle');
  const [line, setLine] = useState<{ k: number; text: string } | null>(null);
  const busy = useRef(false);
  const engRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const poke = () => {
    if (busy.current || score >= GOAL) return;
    busy.current = true;
    const k = score + 1;
    setScore(k);
    setLine({ k, text: t.lines[k - 1] });
    const q = reduce.current;
    if (k === 1) {
      sfx.bonk();
      haptic(14);
      setMood('grumpy');
      setAct('shake');
      later(() => {
        setMood('sleep');
        setAct('idle');
        busy.current = false;
      }, q ? 300 : 1200);
    } else if (k === 2) {
      sfx.blow();
      sfx.squeak();
      haptic(16);
      setMood('sneeze');
      setAct('sneeze');
      later(() => {
        setMood('grumpy');
        setAct('idle');
        busy.current = false;
      }, q ? 300 : 1100);
    } else {
      sfx.note(2);
      sfx.note(4);
      later(() => sfx.note(4), 260);
      haptic(26);
      setMood('happy');
      setAct('go');
      later(() => setWon(true), q ? 400 : 1500);
    }
  };

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={score} won={won} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {/* ketukan di mana saja ikut membangunkannya */}
      <div className={g.field} onClick={poke}>
        <span className={g.track} aria-hidden />
        <button
          ref={engRef}
          type="button"
          className={cx(g.engine, g[act])}
          onClick={(e) => {
            e.stopPropagation();
            poke();
          }}
          disabled={act === 'go'}
          aria-label={t.engineLabel}
        >
          <span className={g.body}>
            <Sprite name="game-anniversary-kereta" className={g.art} />
            <Face mood={mood} />
            {mood === 'sleep' ? (
              <span className={g.zzz} aria-hidden>
                <i>z</i>
                <i>z</i>
                <i>Z</i>
              </span>
            ) : null}
            {act === 'sneeze' || act === 'go' ? (
              <span className={cx(g.puff, act === 'go' && g.puffGo)} aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
            ) : null}
          </span>
        </button>
        {line ? (
          <div key={line.k} className={g.bubble} role="status">
            {line.text}
          </div>
        ) : null}
        <TapCue target={engRef} show={score === 0} at={{ x: 0.54, y: 0.5 }} delay={1600} />
      </div>
    </MiniGame>
  );
}
