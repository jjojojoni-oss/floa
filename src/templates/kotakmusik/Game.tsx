'use client';

import { useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { KotakText } from './i18n';
import g from './game.module.css';

type GameText = KotakText['game'];
const GOAL = 3;

/** Wajah si Not (viewBox sama dengan lukisannya, 200×220): tidur pulas, kaget terbangun, atau melek betulan. */
function Face({ mood }: { mood: 'sleep' | 'jolt' | 'awake' }) {
  const ink = '#4a2a10';
  return (
    <svg className={g.face} viewBox="0 0 200 220" aria-hidden>
      {mood === 'sleep' ? (
        <>
          <path d="M56,146q10,9 22,0M100,146q10,9 22,0" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={90} cy={168} rx={6} ry={7.5} fill={ink} />
          <path d="M98,172q9,4 7,14q-8,-2 -7,-14Z" fill="#bfe6ff" stroke="#7fb9dc" strokeWidth={1.5} />
        </>
      ) : mood === 'jolt' ? (
        <>
          <circle cx={67} cy={144} r={12} fill="#fff" stroke={ink} strokeWidth={4} />
          <circle cx={111} cy={144} r={12} fill="#fff" stroke={ink} strokeWidth={4} />
          <circle cx={69} cy={146} r={4.5} fill={ink} />
          <circle cx={109} cy={146} r={4.5} fill={ink} />
          <ellipse cx={90} cy={174} rx={9} ry={11} fill={ink} />
          <path d="M52,122l16,5M128,122l-16,5" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx={67} cy={144} rx={8.5} ry={10.5} fill={ink} />
          <ellipse cx={111} cy={144} rx={8.5} ry={10.5} fill={ink} />
          <circle cx={64} cy={140} r={3.2} fill="#fff" />
          <circle cx={108} cy={140} r={3.2} fill="#fff" />
          <path d="M72,164q18,20 36,0Z" fill={ink} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M80,172q10,7 20,0" fill="none" stroke="#ff8f86" strokeWidth={5} strokeLinecap="round" />
        </>
      )}
      <ellipse cx={48} cy={164} rx={10} ry={6} fill="#ff8f86" opacity={0.6} />
      <ellipse cx={130} cy={164} rx={10} ry={6} fill="#ff8f86" opacity={0.6} />
    </svg>
  );
}

/**
 * Bangunin si Not: not berwajah yang ketiduran di bantal beludru, jadi lagunya macet. Tiap ketukan (di mana
 * saja) membuatnya terlonjak dan beralasan, lalu ia merem lagi. Ketukan ketiga: melek betulan. Tidak bisa kalah.
 */
export function SleepyNoteGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [woke, setWoke] = useState(0);
  const [mood, setMood] = useState<'sleep' | 'jolt' | 'awake'>('sleep');
  const [line, setLine] = useState<string | null>(null);
  const noteRef = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  /** nomor ketukan terakhir: "merem lagi" dari ketukan lama tidak boleh menimpa ketukan yang lebih baru */
  const seq = useRef(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const poke = () => {
    if (busy.current || woke >= GOAL) return;
    busy.current = true;
    const k = woke + 1;
    seq.current = k;
    setMood(k === GOAL ? 'awake' : 'jolt');
    setLine(t.lines[k - 1]);
    haptic(k === GOAL ? 26 : 14);
    sfx.boing();
    if (k === GOAL) [2, 4, 7].forEach((n, i) => later(() => sfx.note(n), 260 + i * 150));
    else later(() => sfx.squeak(), 180);
    later(() => {
      setWoke(k);
      busy.current = false;
      // belum tiga kali: matanya berat lagi
      if (k < GOAL) later(() => seq.current === k && setMood('sleep'), reduce.current ? 200 : 900);
    }, reduce.current ? 150 : 700);
  };

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={woke} won={woke >= GOAL} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {(live) => (
        // ketukan di mana saja membangunkannya
        <div className={g.field} onClick={poke}>
          <span className={g.pillow} aria-hidden>
            <Sprite name="game-kotakmusik-bantal" className={g.art} />
          </span>
          <button
            ref={noteRef}
            type="button"
            className={cx(g.note, g[mood])}
            onClick={(e) => {
              e.stopPropagation();
              poke();
            }}
            aria-label={t.noteLabel}
          >
            <span key={`${mood}${woke}`} className={g.bob}>
              <Sprite name="game-kotakmusik-not" className={g.art} />
              <Face mood={mood} />
            </span>
            {mood === 'sleep' ? (
              <span className={g.zzz} aria-hidden>
                <i>z</i>
                <i>z</i>
                <i>z</i>
              </span>
            ) : null}
          </button>

          {line && live ? (
            <div key={line} className={g.bubble} role="status">
              {line}
            </div>
          ) : null}

          <TapCue target={noteRef} show={woke === 0 && mood === 'sleep'} delay={1500} at={{ x: 0.45, y: 0.66 }} />
        </div>
      )}
    </MiniGame>
  );
}
