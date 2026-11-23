'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { Confetti, Finale, Hint, HoldButton, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { TEXT } from './i18n';
import { meta } from './meta';
import { canUseMic, listenForBlow } from './mic';
import { clap, playSong, songTiming } from './song';
import s from './style.module.css';

/**
 * Alur: matikan lampu lewat saklar → nyalakan lilin satu per satu (tiap lilin membawa satu doa, kadang dengan foto)
 * → pejamkan mata & bikin permohonan → tiup (ada satu lilin bandel) → lampu menyala, nyanyi bareng
 * → foto dulu sebelum dipotong → potong kue → potongan pertama buat dia (plus colekan krim) → kartu di bawah piring.
 */
type Phase =
  | 'intro'
  | 'light'
  | 'wish'
  | 'wished'
  | 'blow'
  | 'puffed'
  | 'stubborn'
  | 'dark'
  | 'party'
  | 'photo'
  | 'snap'
  | 'cut'
  | 'slice'
  | 'smeared'
  | 'card';

/** lampu ruangan menyala */
const LIGHTS: Phase[] = ['intro', 'party', 'photo', 'snap', 'cut', 'slice', 'smeared', 'card'];
/** bendera, balon, dan warna pesta */
const PARTY: Phase[] = ['party', 'photo', 'snap', 'cut', 'slice', 'smeared', 'card'];
const FLAMES_ON: Phase[] = ['light', 'wish', 'wished', 'blow'];

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
  const photos = data.photos.filter(Boolean);
  const n = Math.min(5, Math.max(3, notes.length));
  const cs = candleSpots(n);
  const stub = Math.floor(n / 2); // si lilin bandel
  const ready = useArtReady(['bg-lilin', 'bg-lilin-terang', 'lilin-kue', 'lilin-meja', 'lilin-api', ...cs.map((c) => c.stick)]);

  const [lit, setLit] = useState<boolean[]>(() => Array(n).fill(false));
  const [order, setOrder] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('intro');
  const [flipped, setFlipped] = useState(false);
  const [alt, setAlt] = useState(false);
  const [line, setLine] = useState(-1);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const [claps, setClaps] = useState(0);
  const [wiping, setWiping] = useState(false);
  const [mic, setMic] = useState<'off' | 'on' | 'no'>('off');
  const stopMic = useRef<(() => void) | null>(null);
  const micBlow = useRef<() => void>(() => {});
  const scene = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const blowing = useRef(false);
  const stopSong = useRef<() => void>(() => {});
  const knife = useRef<{ id: number; y0: number; moved: boolean; h: number } | null>(null);
  const later = useTimers();
  const t = TEXT[useLocale()];
  const to = data.to.trim() || t.you;
  const from = data.from.trim();

  const litCount = order.length;
  const allLit = litCount >= n;
  const bright = LIGHTS.includes(phase);
  const party = PARTY.includes(phase);
  const flamesOn = FLAMES_ON.includes(phase);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // jalan pintas ketuk kalau menahan tombol tidak memungkinkan
  useEffect(() => {
    if (phase !== 'wish' && phase !== 'blow') return;
    setAlt(false);
    const id = setTimeout(() => setAlt(true), 6000);
    return () => clearTimeout(id);
  }, [phase]);

  // lagu ulang tahun begitu lampu menyala
  useEffect(() => {
    if (phase !== 'party') return;
    const { starts, total } = songTiming();
    const lead = reduce ? 200 : 1300;
    const ids = [
      setTimeout(() => {
        if (!data.music) stopSong.current = playSong();
        setLine(0);
      }, lead),
      ...starts.slice(1).map((st, i) => setTimeout(() => setLine(i + 1), lead + st * 1000)),
      setTimeout(() => setLine(4), lead + total * 1000 + 300),
    ];
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useEffect(() => () => stopSong.current(), []);

  // mata dibuka pelan-pelan setelah permohonan
  useEffect(() => {
    if (phase === 'wished') wrap.current?.style.setProperty('--w', '0');
  }, [phase]);

  // lukisan untuk adegan potong kue disiapkan selagi bernyanyi
  useEffect(() => {
    if (phase !== 'party') return;
    ['lilin-pisau', 'lilin-potong', 'lilin-colek', 'bunga-kamboja-pink'].forEach((name) => {
      const img = new Image();
      img.src = `/art/${name}.webp`;
    });
  }, [phase]);

  /* ── 0. saklar ── */
  const lightsOff = () => {
    if (phase !== 'intro' || flipped) return;
    setFlipped(true);
    sfx.tap();
    haptic(15);
    later(() => setPhase('light'), reduce ? 50 : 320);
  };

  /* ── 1. lilin ── */
  const light = (i: number) => {
    if (phase !== 'light' || lit[i]) return;
    const next = lit.slice();
    next[i] = true;
    setLit(next);
    setOrder((o) => [...o, i]);
    haptic(12);
    sfx.pop();
    sfx.note(litCount);
    if (litCount + 1 >= n) later(() => sfx.chime(), 500);
  };

  /* ── 2. permohonan & tiup ── */
  const onBlowProgress = (p: number) => {
    scene.current?.style.setProperty('--p', String(p));
    if (p > 0 && !blowing.current) {
      blowing.current = true;
      sfx.blow();
    }
    if (p === 0) blowing.current = false;
  };
  const wished = () => {
    if (phase !== 'wish') return;
    sfx.chime();
    haptic(20);
    setPhase('wished');
  };
  const blow = () => {
    if (phase !== 'blow') return;
    scene.current?.style.setProperty('--p', '0');
    setPhase('puffed');
    sfx.blow();
    haptic(30);
    // si bandel menyala lagi
    later(() => {
      setPhase('stubborn');
      sfx.pop();
      haptic(15);
    }, reduce ? 500 : 1500);
  };
  const blowAgain = () => {
    if (phase !== 'stubborn') return;
    setPhase('dark');
    sfx.blow();
    haptic(30);
    later(() => {
      setPhase('party');
      setBurst((b) => b + 1);
      sfx.success();
      haptic(40);
    }, reduce ? 300 : 1100);
  };

  /* tiup beneran lewat mikrofon (opsional) */
  useEffect(() => {
    micBlow.current = () => {
      if (phase === 'blow') blow();
      else if (phase === 'stubborn') blowAgain();
    };
  });
  const startMic = () => {
    if (stopMic.current) return;
    const m = listenForBlow({
      level: (p) => scene.current?.style.setProperty('--p', String(p)),
      blow: () => micBlow.current(),
    });
    stopMic.current = m.stop;
    m.ready.then(
      () => setMic('on'),
      () => {
        stopMic.current = null;
        setMic('no');
      },
    );
  };
  useEffect(() => {
    if (phase !== 'dark') return;
    stopMic.current?.();
    stopMic.current = null;
    setMic('off');
  }, [phase]);
  useEffect(() => () => stopMic.current?.(), []);

  /* ── 3. lagu ── */
  const skipSong = () => {
    stopSong.current();
    stopSong.current = () => {};
    setLine(4);
  };
  const onClap = () => {
    clap();
    haptic(10);
    setClaps((c) => c + 1);
  };

  /* ── 4. foto dulu ── */
  const snap = () => {
    if (phase !== 'photo') return;
    stopSong.current();
    sfx.tap();
    haptic(25);
    setPhase('snap');
    later(() => sfx.whoosh(), 450);
  };

  /* ── 5. potong kue ── */
  const cut = () => {
    if (phase !== 'cut') return;
    stopSong.current();
    scene.current?.style.setProperty('--k', '1');
    sfx.crack();
    haptic(25);
    setPhase('slice');
    later(() => sfx.pop(), 650);
  };
  const onKnifeDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== 'cut' || e.button > 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
    knife.current = { id: e.pointerId, y0: e.clientY, moved: false, h: e.currentTarget.offsetHeight || 300 };
    scene.current?.setAttribute('data-drag', '');
  };
  const onKnifeMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const k = knife.current;
    if (!k || k.id !== e.pointerId) return;
    const dy = e.clientY - k.y0;
    if (Math.abs(dy) > 6) k.moved = true;
    const p = Math.max(0, Math.min(1, dy / (k.h * 0.5)));
    scene.current?.style.setProperty('--k', String(p));
    if (p >= 0.92) {
      knife.current = null;
      scene.current?.removeAttribute('data-drag');
      cut();
    }
  };
  const onKnifeUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const k = knife.current;
    if (!k || k.id !== e.pointerId) return;
    knife.current = null;
    scene.current?.removeAttribute('data-drag');
    if (!k.moved) return; // ketukan biasa ditangani onClick
    scene.current?.style.setProperty('--k', '0');
  };

  /* ── 6. potongan pertama & colekan krim ── */
  const smear = () => {
    if (phase !== 'slice') return;
    setPhase('smeared');
    sfx.pop();
    haptic(45);
  };
  const wipe = () => {
    if (phase !== 'smeared' || wiping) return;
    setWiping(true);
    sfx.whoosh();
    later(() => {
      setPhase('card');
      sfx.chime();
    }, reduce ? 100 : 520);
  };

  /* ── tampilan ── */
  const k = Math.min(litCount, n); // urutan lilin terakhir yang dinyalakan (1..n)
  const note = k > 0 ? notes[k - 1] : null;
  const photo = k > 0 ? photos[k - 1] : undefined;
  const isLast = k === n;
  const title = data.title || `${t.happy}${data.to ? `, ${data.to}` : ''}!`;

  const longSong = Math.max(...t.song.map((l) => fmt(l, { to }).length)) > 32;
  const pulled = phase === 'cut' || phase === 'slice' || phase === 'smeared' || phase === 'card';
  const flameOn = (i: number) => (flamesOn ? lit[i] : phase === 'stubborn' && i === stub);
  const puffing = (i: number) => (phase === 'puffed' && lit[i] && i !== stub) || (phase === 'puffed' && i === stub) || (phase === 'dark' && i === stub);
  const glow = flamesOn ? litCount / n : phase === 'stubborn' ? 0.3 : 0;
  const dim = bright ? 0 : flamesOn ? 0.56 - 0.44 * (litCount / n) : 0.68;

  let head;
  if (phase === 'slice' || phase === 'smeared' || phase === 'card') {
    head = (
      <div key="slice">
        <div className={s.eyebrow}>{phase === 'smeared' ? ' ' : t.sliceEyebrow}</div>
        <div className={s.title}>{phase === 'smeared' ? t.smearTitle : t.sliceTitle}</div>
      </div>
    );
  } else if (phase === 'cut') {
    head = (
      <div key="cut">
        <div className={s.eyebrow}>{t.cutEyebrow}</div>
        <div className={s.title}>{t.cutTitle}</div>
      </div>
    );
  } else if (phase === 'photo' || phase === 'snap') {
    head = (
      <div key={phase}>
        <div className={s.eyebrow}>{t.photoEyebrow}</div>
        <div className={s.title}>{phase === 'snap' ? t.snapTitle : t.photoTitle}</div>
      </div>
    );
  } else if (phase === 'party') {
    head = (
      <div key="party">
        <div className={s.eyebrow}>{t.party}</div>
        <div className={cx(s.title, title.length > 24 && s.small)}>{title}</div>
      </div>
    );
  } else {
    head = (
      <div key="name">
        <div className={s.eyebrow}>{t.cakeFor}</div>
        <div className={cx(s.name, to.length > 12 && s.small)}>{to}</div>
        {from ? <div className={s.from}>{fmt(t.from, { from })}</div> : null}
      </div>
    );
  }

  return (
    <div
      ref={wrap}
      className={cx(s.wrap, ready && s.ready, bright && s.lights, party && s.party, phase === 'wished' && s.opened, phase === 'smeared' && s.shook)}
      style={{ '--lit': glow, '--dim': dim } as CSSProperties}
    >
      <div className={s.bright} />
      <div className={s.vig} />
      <Sprite name="lilin-bendera" className={s.bunting} />

      <div className={s.head}>{head}</div>

      <div className={s.art}>
        <div
          ref={scene}
          className={cx(s.bq, phase !== 'light' && s.locked, phase === 'photo' && s.posing, pulled && s.pulled, (phase === 'slice' || phase === 'smeared' || phase === 'card') && s.aside)}
          role="group"
          aria-label={t.cake}
        >
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
            const on = flameOn(i);
            return (
              <button
                key={i}
                type="button"
                className={cx(s.candle, on && s.isLit, puffing(i) && s.blown, phase === 'stubborn' && i === stub && s.naughty)}
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

          {phase === 'cut' || phase === 'slice' ? (
            <button
              type="button"
              className={s.knifeZone}
              onPointerDown={onKnifeDown}
              onPointerMove={onKnifeMove}
              onPointerUp={onKnifeUp}
              onPointerCancel={onKnifeUp}
              onClick={cut}
              disabled={phase !== 'cut'}
              aria-label={t.cutLabel}
            >
              <Sprite name="lilin-pisau" className={s.knife} />
              <span className={s.cutLine} />
            </button>
          ) : null}
        </div>

        {phase === 'photo' ? <span className={s.finder} aria-hidden /> : null}

        {phase === 'slice' || phase === 'smeared' || phase === 'card' ? (
          <div className={s.plateWrap}>
            {phase === 'card' ? (
              <span className={s.cardPeek} aria-hidden>
                <span className={s.peekTo}>{to}</span>
                <Sprite name="bunga-kamboja-pink" className={s.cardFlower} />
              </span>
            ) : null}
            <button type="button" className={s.plate} onClick={smear} disabled={phase !== 'slice'} aria-label={t.sliceLabel}>
              <Sprite name="lilin-potong" />
            </button>
          </div>
        ) : null}
      </div>

      <div className={s.foot}>
        {phase === 'intro' ? (
          <div className={s.blowBox}>
            <div className={cx(s.subNote, s.early)}>{t.intro}</div>
            <button type="button" className={cx(s.switch, flipped && s.switchOff)} onClick={lightsOff} aria-label={t.switchLabel}>
              <span className={s.rocker} />
            </button>
          </div>
        ) : null}

        {phase === 'light' ? (
          <>
            {litCount === 0 ? <div className={s.darkLine}>{t.dark}</div> : null}
            {note ? (
              <div key={k} className={cx(s.card, photo && s.withPhoto, isLast && s.lastCard)}>
                {photo ? (
                  <span className={s.snap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="" draggable={false} />
                  </span>
                ) : (
                  <Sprite name={cs[order[k - 1]].stick} className={s.cardIcon} />
                )}
                <span className={s.cardBody}>
                  <span className={s.cardLabel}>{isLast ? t.candleLast : fmt(t.candleOf, { k, n })}</span>
                  <span className={cx(s.cardText, note.length > 64 && s.cardLong)}>{note}</span>
                </span>
              </div>
            ) : null}
            {allLit ? (
              <button type="button" className={s.cta} onClick={() => setPhase('wish')}>
                {t.toWish}
              </button>
            ) : (
              <div className={s.count} aria-label={fmt(t.count, { lit: litCount, n })}>
                {lit.map((o, i) => (
                  <i key={i} className={o ? s.on : undefined} />
                ))}
                {litCount > 0 ? <span className={s.nextHint}>{t.next}</span> : null}
              </div>
            )}
          </>
        ) : null}

        {phase === 'wish' ? (
          <div className={s.blowBox}>
            <div className={s.prompt}>{t.wishPrompt}</div>
            <div className={s.promptSub}>{t.wishSub}</div>
            <HoldButton
              ms={2600}
              onComplete={wished}
              onProgress={(p) => wrap.current?.style.setProperty('--w', String(p))}
              className={cx(s.blowBtn, s.wishBtn)}
              label={t.wishLabel}
            >
              <span className={s.blowLabel}>
                <b>{t.wishBtn}</b>
                <small>{t.wishHold}</small>
              </span>
            </HoldButton>
            {alt ? (
              <button type="button" className={s.alt} onClick={wished}>
                {t.wishAlt}
              </button>
            ) : null}
          </div>
        ) : null}

        {phase === 'wished' ? (
          <div className={s.blowBox}>
            <div className={s.prompt}>{t.wished}</div>
            <div className={s.promptSub}>{t.wishedSub}</div>
            <button type="button" className={s.cta} onClick={() => setPhase('blow')}>
              {t.toBlow}
            </button>
          </div>
        ) : null}

        {phase === 'blow' ? (
          <div className={s.blowBox}>
            <div className={s.prompt}>{t.prompt}</div>
            <HoldButton ms={1500} onComplete={blow} onProgress={onBlowProgress} className={s.blowBtn} label={t.holdLabel}>
              <span className={s.blowLabel}>
                <b>{t.blow}</b>
                <small>{t.hold}</small>
              </span>
            </HoldButton>
            {mic === 'on' ? (
              <div className={s.micOn}>{t.micOn}</div>
            ) : mic === 'no' ? (
              <div className={s.micNo}>{t.micNo}</div>
            ) : canUseMic() ? (
              <button type="button" className={s.mic} onClick={startMic}>
                <span>{t.mic}</span>
              </button>
            ) : null}
            {alt && mic !== 'on' ? (
              <button type="button" className={s.alt} onClick={blow}>
                {t.alt}
              </button>
            ) : null}
          </div>
        ) : null}

        {phase === 'stubborn' ? (
          <div className={s.blowBox}>
            <div className={s.prompt}>{t.stubborn}</div>
            <button type="button" className={s.again} onClick={blowAgain} aria-label={t.againLabel}>
              {t.again}
            </button>
            {mic === 'on' ? <div className={s.micOn}>{t.micOn}</div> : null}
          </div>
        ) : null}

        {phase === 'party' ? (
          <div className={s.songBox}>
            <div className={cx(s.songCard, longSong && s.songLong)} aria-live="polite">
              <div className={s.songEyebrow}>{t.songEyebrow}</div>
              {t.song.map((l, i) => (
                <div key={i} className={cx(s.lyric, line === i && s.sing, line > i && s.sung)}>
                  {fmt(l, { to })}
                </div>
              ))}
            </div>
            {line >= 4 ? (
              <button type="button" className={s.cta} onClick={() => setPhase('photo')}>
                {t.toPhoto}
              </button>
            ) : (
              <div className={s.songActions}>
                <button type="button" className={s.clapBtn} onClick={onClap}>
                  {t.clap}
                </button>
                <button type="button" className={s.skip} onClick={skipSong}>
                  {t.skipSong}
                </button>
              </div>
            )}
          </div>
        ) : null}

        {phase === 'photo' ? (
          <div className={s.blowBox}>
            <div className={cx(s.subNote, s.early)}>{t.photoSub}</div>
            <button type="button" className={s.shutter} onClick={snap} aria-label={t.shutterLabel}>
              <span className={s.shutterDot} />
            </button>
            <div className={s.shutterLabel}>{t.shutter}</div>
          </div>
        ) : null}

        {phase === 'snap' ? (
          <button type="button" className={cx(s.cta, s.ctaLate)} onClick={() => setPhase('cut')}>
            {t.toCut}
          </button>
        ) : null}

        {phase === 'slice' ? <div className={s.subNote}>{t.sliceSub}</div> : null}
        {phase === 'smeared' ? <div className={s.subNote}>{t.smearSub}</div> : null}
        {phase === 'card' ? (
          <>
            <div className={s.subNote}>{t.cardPeek}</div>
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

      {phase === 'wish' || phase === 'wished' ? <div className={s.lids} aria-hidden /> : null}

      {phase === 'snap' ? (
        <>
          <div className={s.flash} aria-hidden />
          <figure className={s.snapshot}>
            <span className={s.shot} aria-hidden>
              <Sprite name="lilin-bendera" className={s.shotFlag} />
              <Sprite name="lilin-balon-1" className={s.shotBalloonL} />
              <Sprite name="lilin-balon-3" className={s.shotBalloonR} />
              <Sprite name="lilin-kue" className={s.shotCake} />
              <span className={s.develop} />
            </span>
            <figcaption className={cx(s.snapCap, fmt(t.snapCap, { to }).length > 18 && s.capLong)}>{fmt(t.snapCap, { to })}</figcaption>
          </figure>
        </>
      ) : null}

      {phase === 'smeared' ? (
        <button type="button" className={cx(s.cream, wiping && s.wiped)} onClick={wipe} aria-label={t.wipeLabel}>
          <Sprite name="lilin-colek" />
        </button>
      ) : null}

      {phase === 'light' && litCount === 0 ? <Hint key="lt">{t.hint}</Hint> : null}
      {phase === 'photo' ? <Hint key="ph">{t.photoHint}</Hint> : null}
      {phase === 'cut' ? <Hint>{t.cutHint}</Hint> : null}
      {phase === 'slice' ? <Hint key="sl">{t.sliceHint}</Hint> : null}
      {phase === 'smeared' && !wiping ? <Hint key="wp">{t.wipeHint}</Hint> : null}

      <Confetti burst={burst} colors={['#ee6a58', '#ffb52e', '#3fa39a', '#8e72d0', '#f58ea6', '#fffaf0']} origin={{ x: 0.5, y: 0.5 }} count={120} />
      <Confetti burst={claps} colors={['#ffb52e', '#f58ea6', '#fffaf0', '#3fa39a']} origin={{ x: 0.5, y: 0.72 }} count={18} />

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
