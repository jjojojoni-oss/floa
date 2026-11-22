'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Confetti, Finale, Hint, HoldButton, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

type Phase = 'light' | 'wish' | 'blown' | 'party';

/** Dasar tiap lilin di kanvas kue 440×480 (sama dengan art/sprites/41-lilin.js). */
function candleSpots(n: number) {
  const span = n <= 3 ? 92 : n === 4 ? 122 : 142;
  return Array.from({ length: n }, (_, i) => ({
    x: 220 + (n === 1 ? 0 : i / (n - 1) - 0.5) * span,
    y: 206 + (i % 2 === 0 ? -5 : 6),
    stick: `lilin-batang-${(i % 5) + 1}`,
  }));
}

/** Bayangan gelap yang mengikuti bentuk sebuah sprite (dipakai untuk meredupkan benda saat ruang temaram). */
const mask = (name: string): CSSProperties => ({
  WebkitMaskImage: `url(/art/${name}.webp)`,
  maskImage: `url(/art/${name}.webp)`,
});

const BALLOONS: [string, CSSProperties][] = [
  ['lilin-balon-1', { left: '-7%', top: '-5%', '--d': '0s' } as CSSProperties],
  ['lilin-balon-2', { left: '2%', top: '19%', '--d': '0.2s' } as CSSProperties],
  ['lilin-balon-3', { right: '-7%', top: '-1%', '--d': '0.1s' } as CSSProperties],
  ['lilin-balon-4', { right: '3%', top: '23%', '--d': '0.3s' } as CSSProperties],
];

export default function Lilin(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    // tinta Stage sengaja gelap (untuk vignette & petunjuk); warna teks adegan diatur di .wrap
    <Stage bg={meta.palette.bg} ink="#1b0f2c" accent={meta.palette.accent} backdrop="/art/bg-lilin.webp" className={s.stage}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const notes = data.notes.map((n) => n.trim()).filter(Boolean).slice(0, 5);
  const n = Math.min(5, Math.max(3, notes.length));
  const cs = candleSpots(n);
  const ready = useArtReady(['bg-lilin', 'lilin-kue', 'lilin-meja', 'lilin-api', ...cs.map((c) => c.stick)]);

  const [lit, setLit] = useState<boolean[]>(() => Array(n).fill(false));
  const [last, setLast] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('light');
  const [alt, setAlt] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const scene = useRef<HTMLDivElement>(null);
  const blowing = useRef(false);
  const later = useTimers();
  const t = TEXT[useLocale()];

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
    scene.current?.style.setProperty('--p', String(p));
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
  const title = data.title || `${t.happy}${data.to ? `, ${data.to}` : ''}!`;
  const glow = out ? 0 : litCount / n;
  // seberapa redup benda-benda: temaram saat belum ada api, makin terang tiap lilin, gelap sesaat setelah ditiup
  const dim = party ? 0 : phase === 'blown' ? 0.66 : 0.56 - 0.44 * (litCount / n);

  return (
    <div className={cx(s.wrap, ready && s.ready, party && s.party)} style={{ '--lit': glow, '--dim': dim } as CSSProperties}>
      <div className={s.bright} />
      <Sprite name="lilin-bendera" className={s.bunting} />

      <div className={s.head}>
        {party ? (
          <div key="t">
            <div className={s.eyebrow}>{t.party}</div>
            <div className={cx(s.title, title.length > 24 && s.small)}>{title}</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>{t.cakeFor}</div>
            <div className={cx(s.name, data.to.length > 12 && s.small)}>{data.to || t.you}</div>
            {data.from ? <div className={s.from}>{fmt(t.from, { from: data.from })}</div> : null}
          </div>
        )}
      </div>

      <div className={s.art}>
        <div ref={scene} className={cx(s.bq, out && s.out, phase !== 'light' && s.locked)} role="group" aria-label={t.cake}>
          <Sprite name="lilin-meja" className={s.table} />
          <span className={cx(s.shade, s.table, s.tableShade)} style={mask('lilin-meja')} />
          <span className={s.glow} />
          {BALLOONS.map(([name, pos]) => (
            <span key={name} className={s.balloon} style={pos}>
              <Sprite name={name} />
            </span>
          ))}
          <Sprite name="lilin-kue" className={s.layer} />
          <span className={cx(s.shade, s.layer)} style={mask('lilin-kue')} />

          {cs.map((c, i) => {
            const canTap = phase === 'light' && !lit[i];
            return (
              <button
                key={i}
                type="button"
                className={cx(s.candle, lit[i] && s.isLit)}
                style={{ left: `${(c.x - 22) / 4.4}%`, top: `${(c.y - 142) / 4.8}%`, '--i': i } as CSSProperties}
                onClick={() => light(i)}
                disabled={!canTap}
                aria-label={fmt(lit[i] ? t.isLit : t.light, { n: i + 1 })}
              >
                <span className={s.halo} />
                <Sprite name={c.stick} className={s.stick} />
                <span className={cx(s.shade, s.stick, s.stickShade)} style={mask(c.stick)} />
                <Sprite name="lilin-asap" className={s.smoke} />
                <span className={s.fl}>
                  <span className={s.lean}>
                    <Sprite name="lilin-api" className={s.flick} />
                  </span>
                </span>
                <span className={s.spark} />
              </button>
            );
          })}
        </div>
      </div>

      <div className={s.foot}>
        {phase === 'light' ? (
          <>
            {note ? (
              <div key={last} className={s.wish}>
                <Sprite name={cs[last as number].stick} className={s.wishIcon} />
                {note}
              </div>
            ) : null}
            <div className={s.count} aria-label={fmt(t.count, { lit: litCount, n })}>
              {lit.map((o, i) => (
                <i key={i} className={o ? s.on : undefined} />
              ))}
            </div>
          </>
        ) : null}

        {phase === 'wish' ? (
          <div className={s.blowBox}>
            <div className={s.prompt}>{t.prompt}</div>
            <HoldButton ms={1500} onComplete={blow} onProgress={onProgress} className={s.blowBtn} label={t.holdLabel}>
              <span className={s.blowLabel}>
                <b>{t.blow}</b>
                <small>{t.hold}</small>
              </span>
            </HoldButton>
            {alt ? (
              <button type="button" className={s.alt} onClick={blow}>
                {t.alt}
              </button>
            ) : null}
          </div>
        ) : null}

        {party ? (
          <>
            {data.from ? <div className={s.sub}>{fmt(t.withLove, { from: data.from })}</div> : null}
            <button
              type="button"
              className={s.cta}
              onClick={() => {
                sfx.chime();
                setFinale(true);
              }}
            >
              {t.open}
            </button>
          </>
        ) : null}
      </div>

      {phase === 'light' && litCount === 0 ? <Hint>{t.hint}</Hint> : null}

      <Confetti burst={burst} colors={['#ee6a58', '#ffb52e', '#3fa39a', '#8e72d0', '#f58ea6', '#fffaf0']} origin={{ x: 0.5, y: 0.5 }} count={130} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{ backdrop: '/art/bg-lilin-terang.webp', ink: '#4a2238', paper: '#fffaf0', paperInk: '#3d2440' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
