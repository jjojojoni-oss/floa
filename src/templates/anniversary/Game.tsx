'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MiniGame, Sprite, cx, haptic, sfx, useTimers } from '../kit';
import { fmt } from '@/i18n/client';
import { addDays } from './date';
import type { TEXT } from './i18n';
import g from './game.module.css';

type GameText = (typeof TEXT)['id']['game'];
type Mode = 'spin' | 'miss' | 'spin2' | 'brake' | 'hit';

/** lembar yang berputar: selisih hari dari tanggal tujuan (0 = tanggal tujuan) */
const OFFSETS = [0, 4, -1, 11, 1, -6, 23, -2, 7, -13];

/**
 * "Hentikan kalendernya!": kalender berputar cepat dengan maskot hati yang pusing di atasnya.
 * Ketukan pertama selalu berhenti di tanggal lain yang lucu (dengan celetukannya), ketukan kedua
 * mengerem pelan-pelan sampai pas di tanggal tujuan. Mainan, bukan ujian.
 */
export function StopCalendar({ t, target, hasDate, tag, onDone }: { t: GameText; target: Date; hasDate: boolean; tag: string; onDone: () => void }) {
  const later = useTimers();
  const dates = useMemo(() => OFFSETS.map((o) => addDays(target, o)), [target]);
  const [i, setI] = useState(1);
  const [mode, setModeState] = useState<Mode>('spin');
  const modeRef = useRef<Mode>('spin');
  const setMode = (m: Mode) => {
    modeRef.current = m;
    setModeState(m);
  };
  const [line, setLine] = useState<{ k: number; text: string } | null>(null);
  const [won, setWon] = useState(false);
  const idx = useRef(1);
  const reduce = useRef(false);

  const dayFmt = useMemo(() => new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long' }), [tag]);
  const monthFmt = useMemo(() => new Intl.DateTimeFormat(tag, { month: 'long' }), [tag]);
  const dowFmt = useMemo(() => new Intl.DateTimeFormat(tag, { weekday: 'long' }), [tag]);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const step = () => {
    idx.current = (idx.current + 1) % dates.length;
    setI(idx.current);
  };

  // putaran biasa: cepat dulu, lalu lebih pelan setelah meleset
  useEffect(() => {
    if (mode !== 'spin' && mode !== 'spin2') return;
    const ms = (mode === 'spin' ? 150 : 260) * (reduce.current ? 3 : 1);
    const id = setInterval(() => {
      step();
      if (!reduce.current) sfx.tap();
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const say = (text: string) => setLine((l) => ({ k: (l?.k ?? 0) + 1, text }));

  const stop = () => {
    const m = modeRef.current;
    if (m === 'spin') {
      // ketukan pertama: selalu meleset ke tanggal lain yang lucu
      if (idx.current === 0) step();
      const off = OFFSETS[idx.current];
      setMode('miss');
      sfx.wahwah();
      haptic(20);
      say(off === -1 ? t.early : off === 1 ? t.late : t.misses[(idx.current * 7) % t.misses.length]);
      later(() => {
        if (modeRef.current !== 'miss') return;
        setMode('spin2');
        say(t.again);
      }, 2400);
      return;
    }
    if (m === 'spin2' || m === 'miss') {
      // ketukan kedua: mengerem pelan-pelan sampai pas di tanggal tujuan
      setMode('brake');
      sfx.tap();
      haptic(10);
      let left = (dates.length - idx.current) % dates.length;
      if (left < 3) left += dates.length;
      let wait = 140;
      const tick = () => {
        step();
        sfx.tap();
        left -= 1;
        if (left <= 0) {
          setMode('hit');
          sfx.success();
          haptic(30);
          say(t.hit);
          later(() => setWon(true), 1300);
          return;
        }
        wait = Math.min(520, wait * 1.22);
        later(tick, reduce.current ? 60 : wait);
      };
      later(tick, 120);
    }
  };

  const d = dates[i];
  const spinning = mode === 'spin' || mode === 'spin2' || mode === 'brake';
  const sunday = d.getDay() === 0;

  return (
    <MiniGame
      title={t.title}
      how={hasDate ? t.how : t.howToday}
      art={<Sprite name="game-hati-pusing" style={{ width: '5em', height: 'auto', maxHeight: 'none' }} />}
      won={won}
      winTitle={t.winTitle}
      winLine={t.winLine}
      onDone={onDone}
    >
      <div className={cx(g.arena, won && g.won)}>
        <p className={g.goal}>{fmt(t.target, { date: hasDate ? dayFmt.format(target) : t.today })}</p>

        <button type="button" className={cx(g.cal, mode === 'hit' && g.hit, mode === 'miss' && g.miss)} onClick={stop} disabled={mode === 'hit' || mode === 'brake'} aria-label={t.stop}>
          <span className={cx(g.buddy, mode === 'hit' && g.happy)} aria-hidden>
            <Sprite name={spinning ? 'game-hati-pusing' : 'game-hati-imut'} className={g.buddyArt} />
          </span>
          <span key={i} className={cx(g.sheet, spinning && !reduce.current && g.flip)}>
            <span className={g.band}>
              <b>{monthFmt.format(d)}</b>
              <i>{d.getFullYear()}</i>
            </span>
            <span className={cx(g.num, sunday && g.sunday)}>{d.getDate()}</span>
            <span className={g.dow}>{dowFmt.format(d)}</span>
            {mode === 'hit' ? (
              <svg className={g.circle} viewBox="0 0 300 220" preserveAspectRatio="none" aria-hidden>
                <path pathLength={1} d="M158,14C246,6 290,58 280,112C268,180 168,212 86,198C20,186 -4,122 26,70C52,26 118,8 186,20" />
              </svg>
            ) : null}
          </span>
        </button>

        {line && !won ? (
          <p key={line.k} className={g.line} role="status">
            {line.text}
          </p>
        ) : null}

        <button type="button" className={g.stop} onClick={stop} disabled={mode === 'hit' || mode === 'brake'}>
          {t.stop}
        </button>
      </div>
    </MiniGame>
  );
}
