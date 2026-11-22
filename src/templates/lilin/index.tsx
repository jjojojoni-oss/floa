'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Confetti, Finale, Hint, HoldButton, Stage, cx, haptic, sfx, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { Bunting, CakeBase, FlameShape, GlowDefs, VIEW, candles } from './art';
import { meta } from './meta';
import s from './style.module.css';

type Phase = 'light' | 'wish' | 'blown' | 'party';

export default function Lilin(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const notes = data.notes.map((n) => n.trim()).filter(Boolean).slice(0, 5);
  const n = Math.min(5, Math.max(3, notes.length));
  const cs = candles(n);

  const [lit, setLit] = useState<boolean[]>(() => Array(n).fill(false));
  const [last, setLast] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('light');
  const [alt, setAlt] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const flames = useRef<SVGSVGElement>(null);
  const blowing = useRef(false);
  const later = useTimers();

  const litCount = lit.filter(Boolean).length;
  const party = phase === 'party';
  const out = phase === 'blown' || party;

  // kalau menahan tombol tidak memungkinkan, sediakan jalan pintas ketuk
  useEffect(() => {
    if (phase !== 'wish') return;
    const t = setTimeout(() => setAlt(true), 6000);
    return () => clearTimeout(t);
  }, [phase]);

  const light = (i: number) => {
    if (phase !== 'light' || lit[i]) return;
    const next = lit.slice();
    next[i] = true;
    setLit(next);
    setLast(i);
    haptic(12);
    sfx.pop();
    sfx.note(next.filter(Boolean).length - 1);
    if (next.every(Boolean)) {
      later(() => {
        setPhase('wish');
        sfx.chime();
      }, notes[i] ? 2400 : 1100);
    }
  };

  const onProgress = (p: number) => {
    flames.current?.style.setProperty('--p', String(p));
    if (p > 0 && !blowing.current) {
      blowing.current = true;
      sfx.blow();
    }
    if (p === 0) blowing.current = false;
  };

  const blow = () => {
    if (phase !== 'wish') return;
    setPhase('blown');
    sfx.blow();
    haptic(30);
    later(() => {
      setPhase('party');
      setBurst((b) => b + 1);
      sfx.success();
      haptic(40);
    }, 1000);
  };

  const note = last !== null ? notes[last] : null;
  const title = data.title || `Selamat ulang tahun${data.to ? `, ${data.to}` : ''}!`;
  const glowLevel = out ? 0 : litCount / n;

  return (
    <div className={cx(s.wrap, party && s.party)} style={{ '--lit': glowLevel } as CSSProperties}>
      <div className={s.dark} />
      <div className={s.bright} />
      {party ? <Bunting className={s.bunting} /> : null}

      <div className={s.head}>
        {party ? (
          <div key="t">
            <div className={s.eyebrow}>hore, pestanya mulai</div>
            <div className={cx(s.title, title.length > 24 && s.small)}>{title}</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>kue ulang tahun untuk</div>
            <div className={cx(s.name, data.to.length > 12 && s.small)}>{data.to || 'kamu'}</div>
            {data.from ? <div className={s.from}>dari {data.from}</div> : null}
          </div>
        )}
      </div>

      <div className={s.art}>
        <div className={s.glow} />
        {party ? (
          <>
            <span className={s.balloon} style={{ '--c': '#ff8fa3', '--d': '0s', left: '0.5em', top: '6%' } as CSSProperties} />
            <span className={s.balloon} style={{ '--c': '#ffd36e', '--d': '0.18s', left: '2.5em', top: '24%' } as CSSProperties} />
            <span className={s.balloon} style={{ '--c': '#7fd1c7', '--d': '0.1s', right: '0.6em', top: '9%' } as CSSProperties} />
            <span className={s.balloon} style={{ '--c': '#b7a2ee', '--d': '0.26s', right: '2.7em', top: '27%' } as CSSProperties} />
          </>
        ) : null}

        <svg viewBox={VIEW} className={s.cake} aria-hidden>
          <CakeBase n={n} />
        </svg>

        <svg
          viewBox={VIEW}
          ref={flames}
          className={cx(s.flames, out && s.out, phase !== 'light' && s.locked)}
          role="group"
          aria-label="Lilin di atas kue"
        >
          <GlowDefs />
          {cs.map((c, i) => {
            const canTap = phase === 'light' && !lit[i];
            return (
              <g
                key={i}
                transform={`translate(${c.x} ${c.y - c.h - 6})`}
                className={cx(s.candle, lit[i] && s.isLit)}
                style={{ ['--i' as string]: i }}
                role="button"
                aria-label={lit[i] ? `Lilin ${i + 1} sudah menyala` : `Nyalakan lilin ${i + 1}`}
                tabIndex={canTap ? 0 : undefined}
                onClick={canTap ? () => light(i) : undefined}
                onKeyDown={
                  canTap
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          light(i);
                        }
                      }
                    : undefined
                }
              >
                <circle className={s.halo} r="52" cy="-12" fill="url(#lilin-glow)" />
                <path className={s.smoke} d="M0,-2C-7,-12 7,-20 0,-30C-7,-40 7,-48 0,-58" />
                <g className={s.fl}>
                  <g className={s.lean}>
                    <g className={s.flick}>
                      <FlameShape />
                    </g>
                  </g>
                </g>
                <circle className={s.spark} r="3.2" cy="-1" />
                <rect className={s.hit} x="-13" y="-38" width="26" height={c.h + 50} fill="transparent" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className={s.foot}>
        {phase === 'light' ? (
          <>
            {note ? (
              <div key={last} className={s.wish} style={{ ['--dot' as string]: cs[last as number].color }}>
                {note}
              </div>
            ) : null}
            <div className={s.count} aria-label={`${litCount} dari ${n} lilin menyala`}>
              {lit.map((o, i) => (
                <i key={i} className={o ? s.on : undefined} />
              ))}
            </div>
          </>
        ) : null}

        {phase === 'wish' ? (
          <div className={s.blowBox}>
            <div className={s.prompt}>Buat permohonan dulu, lalu…</div>
            <HoldButton ms={1500} onComplete={blow} onProgress={onProgress} className={s.blowBtn} label="Tahan untuk meniup lilin">
              <span className={s.blowLabel}>
                <b>Tiup</b>
                <small>tahan</small>
              </span>
            </HoldButton>
            {alt ? (
              <button type="button" className={s.alt} onClick={blow}>
                atau ketuk di sini untuk meniup
              </button>
            ) : null}
          </div>
        ) : null}

        {party ? (
          <>
            {data.from ? <div className={s.sub}>dari {data.from}, dengan sayang</div> : null}
            <button
              type="button"
              className={s.cta}
              onClick={() => {
                sfx.chime();
                setFinale(true);
              }}
            >
              Buka kartu ucapannya →
            </button>
          </>
        ) : null}
      </div>

      {phase === 'light' && litCount === 0 ? <Hint>Ketuk lilinnya untuk menyalakan</Hint> : null}

      <Confetti burst={burst} colors={['#ff8fa3', '#ffd36e', '#7fd1c7', '#b7a2ee', '#ff9d5c', '#ffffff']} origin={{ x: 0.5, y: 0.5 }} count={130} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow="Kartu ucapan untukmu"
          theme={{ bg: 'linear-gradient(#fff1dc, #ffd6c6)', ink: '#4a2238', paper: '#fffdf8', paperInk: '#3d2440' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
