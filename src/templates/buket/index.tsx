'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Confetti, Finale, Hint, HoldButton, Petals, Sprite, Stage, TapCue, Typewriter, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

/** Kepala bunga di kanvas buket 600×720: jenis, posisi, diameter, warna titik kartu. */
type Head = { kind: string; bud: string; x: number; y: number; d: number; dot: string; rot: number };
const H = (kind: string, bud: string, x: number, y: number, d: number, dot: string, rot = 0): Head => ({ kind, bud, x, y, d, dot, rot });

/** Indeks 2 selalu dahlia di tengah: kuncup paling malu yang mekar paling akhir. */
const CENTER = 2;
const LAYOUTS: Record<number, Head[]> = {
  3: [
    H('aster', 'kamboja', 176, 300, 190, '#f2a40f', -8),
    H('kenikir', 'kenikir', 424, 300, 190, '#ff9f1f', 12),
    H('dahlia', 'dahlia', 300, 196, 236, '#ee6a58', 4),
  ],
  4: [
    H('aster', 'kamboja', 170, 266, 176, '#f2a40f', -8),
    H('kenikir', 'kenikir', 430, 266, 176, '#ff9f1f', 12),
    H('dahlia', 'dahlia', 300, 180, 222, '#ee6a58', 4),
    H('sepatu', 'sepatu', 300, 384, 184, '#c8203f', -14),
  ],
  5: [
    H('aster', 'kamboja', 170, 266, 176, '#f2a40f', -8),
    H('kenikir', 'kenikir', 430, 266, 176, '#ff9f1f', 12),
    H('dahlia', 'dahlia', 300, 180, 222, '#ee6a58', 4),
    H('kamboja', 'pink', 224, 392, 160, '#ffcb3d', 20),
    H('sepatu', 'sepatu', 384, 392, 176, '#c8203f', -14),
  ],
};

const ART = ['bg-pagi', 'buket-belakang', 'buket-daun', 'buket-depan', 'pita', 'buket-kupu', 'buket-label', 'buket-kartu', 'buket-gulungan', 'buket-gulungan-emas'];

/**
 * tag     → label kado dibalik
 * bloom   → kuncup mekar satu-satu mengikuti kupu-kupu; gulungan kertas di tengah bunga ditarik untuk dibaca
 * shy     → kuncup terakhir (paling malu) ditahan sampai berani mekar
 * tie     → pita diikat
 * smell   → hirup wanginya
 * card    → kartu kecil terselip → Finale
 */
type Phase = 'tag' | 'bloom' | 'shy' | 'tie' | 'smell' | 'card';

export default function Buket(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop="pagi">
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const t = TEXT[useLocale()];
  const notes = data.notes.map((n) => n.trim()).filter(Boolean).slice(0, 5);
  const n = Math.min(5, Math.max(3, notes.length));
  const heads = LAYOUTS[n];
  /** urutan mekar: bunga tepi dulu, dahlia di tengah paling akhir */
  const order = [...heads.map((_, i) => i).filter((i) => i !== CENTER), CENTER];
  const photos = data.photos.filter(Boolean);
  const ready = useArtReady([...ART, ...heads.map((h) => `kuncup-${h.bud}`)]);

  const [phase, setPhase] = useState<Phase>('tag');
  const [flipped, setFlipped] = useState(false);
  const [step, setStep] = useState(0); // berapa bunga sudah mekar (urut sesuai `order`)
  const [slip, setSlip] = useState<number | null>(null); // gulungan yang menyembul dari bunga, menunggu ditarik
  const [card, setCard] = useState<number | null>(null); // indeks langkah yang kartunya sedang dibaca
  const [typed, setTyped] = useState(false);
  const [shyHead, setShyHead] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hold, setHold] = useState(0);
  const [tied, setTied] = useState(false);
  const [sniffed, setSniffed] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const peak = useRef(0);
  const nextBtn = useRef<HTMLButtonElement>(null);
  /** benda yang sekarang harus disentuh (untuk penunjuk TapCue) */
  const cueEl = useRef<HTMLElement | null>(null);
  const later = useTimers();

  const open = (i: number) => order.indexOf(i) < step;
  const target = step < n ? order[step] : null;
  const isLast = (k: number) => k === n - 1;

  // fokus ke tombol lanjut begitu kalimatnya selesai diketik (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (typed && mode !== 'preview') nextBtn.current?.focus({ preventScroll: true });
  }, [typed, mode]);

  const bloomStep = (k: number) => {
    setStep(k + 1);
    haptic(12);
    sfx.pop();
    sfx.note(k);
    if (notes[k]) {
      later(() => setSlip(k), isLast(k) ? 1000 : 750);
    } else if (isLast(k)) {
      later(() => setPhase('tie'), 1200);
    } else if (k + 1 === n - 1) {
      later(() => setPhase('shy'), 700);
    }
  };

  const tapFlower = (i: number) => {
    if (phase !== 'bloom' || card !== null || slip !== null || open(i)) return;
    if (i !== target) {
      // bukan gilirannya: kuncupnya menggeleng malu
      setShyHead(i);
      setHint(t.notYet);
      sfx.tap();
      later(() => setShyHead((v) => (v === i ? null : v)), 700);
      return;
    }
    setHint(null);
    bloomStep(step);
  };

  const pullSlip = () => {
    if (slip === null) return;
    const k = slip;
    setSlip(null);
    setTyped(false);
    setCard(k);
    sfx.crack();
    haptic(10);
  };

  const nextCard = () => {
    if (card === null) return;
    const k = card;
    setCard(null);
    sfx.tap();
    if (isLast(k)) {
      setPhase('tie');
      return;
    }
    if (k + 1 === n - 1) setPhase('shy');
  };

  const onHoldProgress = (p: number) => {
    setHold(p);
    if (p > peak.current) peak.current = p;
    if (p === 0 && peak.current > 0.08 && peak.current < 1) {
      setHint(t.shyAgain);
      peak.current = 0;
    }
  };

  const bloomShy = () => {
    setHint(null);
    setHold(1);
    setBurst((b) => b + 1);
    sfx.chime();
    bloomStep(n - 1);
  };

  const tie = () => {
    if (tied) return;
    setTied(true);
    setBurst((b) => b + 1);
    sfx.success();
    haptic(40);
    later(() => setPhase('smell'), 1500);
  };

  const sniff = () => {
    if (sniffed) return;
    setSniffed(true);
    sfx.whoosh();
    haptic(15);
    later(() => setPhase('card'), 2600);
  };

  const openCard = () => {
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  /* kupu-kupu: hinggap di kuncup berikutnya; setelah pita terikat, hinggap di pita */
  const butterfly = (() => {
    if (phase === 'tag' || phase === 'card' || finale) return null;
    if (phase === 'smell' && sniffed) return { x: 520, y: -60, away: true };
    if (phase === 'tie' || phase === 'smell') return tied ? { x: 318, y: 548, away: false } : { x: 470, y: 520, away: false };
    if (card !== null || slip !== null || target === null) return { x: 520, y: 40, away: false };
    const h = heads[target];
    return { x: h.x + h.d * 0.18, y: h.y - h.d * 0.28, away: false };
  })();

  /** apa yang sekarang harus disentuh: satu saja pada satu waktu */
  const cueOn: string | null = finale
    ? null
    : phase === 'tag'
      ? ready ? (flipped ? 'tagGo' : 'tag') : null
      : phase === 'bloom'
        ? slip !== null
          ? 'slip'
          : card !== null
            ? typed ? 'next' : null
            : target !== null
              ? `f${target}`
              : null
        : phase === 'shy'
          ? card !== null
            ? typed ? 'next' : null
            : slip !== null
              ? 'slip'
              : step < n
                ? 'shy'
                : null
          : phase === 'tie'
            ? tied ? null : 'bow'
            : phase === 'smell'
              ? sniffed ? null : 'smell'
              : 'open';
  const cue = (key: string) => (cueOn === key ? (el: HTMLElement | null) => { cueEl.current = el; } : undefined);

  const k = card;
  const note = k !== null ? notes[k] : null;
  const head = k !== null ? heads[order[k]] : null;
  const photo = k !== null ? photos[k] : undefined;

  return (
    <div className={cx(s.wrap, ready && s.ready, sniffed && s.sniffed)}>
      <Petals kinds={['putih', 'pink', 'jingga']} count={sniffed ? 16 : 8} />

      <div className={s.head}>
        {tied ? (
          <div key="t">
            <div className={s.eyebrow}>{t.done}</div>
            <div className={cx(s.name, s.small)}>{data.title || fmt(t.titleFallback, { to: data.to })}</div>
          </div>
        ) : phase === 'shy' && step === n ? (
          <div key="b">
            <div className={s.eyebrow}>{t.braveEyebrow}</div>
            <div className={cx(s.name, s.small)}>{t.braveTitle}</div>
          </div>
        ) : phase === 'shy' ? (
          <div key="s">
            <div className={s.eyebrow}>{t.shyEyebrow}</div>
            <div className={cx(s.name, s.small)}>{t.shyTitle}</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>{t.bouquetFor}</div>
            <div className={cx(s.name, data.to.length > 12 && s.small)}>{data.to || t.you}</div>
            {data.from ? <div className={s.from}>{fmt(t.from, { from: data.from })}</div> : null}
          </div>
        )}
      </div>

      <div className={s.art}>
        <div className={cx(s.bq, sniffed && s.inhale)} role="group" aria-label={t.bouquet}>
          <Sprite name="buket-belakang" className={s.layer} />
          <Sprite name="buket-daun" className={cx(s.layer, s.greens)} />
          {heads.map((h, i) => {
            const lean = Math.round((Math.atan2(h.x - 300, 560 - h.y) * 180) / Math.PI);
            const isOpen = open(i);
            const isShy = i === CENTER && phase === 'shy';
            return (
              <button
                key={i}
                type="button"
                className={cx(s.flower, isOpen && s.open, shyHead === i && s.shake, i === target && phase === 'bloom' && card === null && slip === null && s.turn, isShy && s.shyBud)}
                style={
                  {
                    left: `${(h.x / 600) * 100}%`,
                    top: `${(h.y / 720) * 100}%`,
                    width: `${(h.d / 600) * 100}%`,
                    '--i': i,
                    '--lean': `${lean}deg`,
                    '--rot': `${h.rot}deg`,
                    '--hold': isShy ? hold : 0,
                  } as CSSProperties
                }
                ref={cue(`f${i}`) ?? (i === CENTER ? cue('shy') : undefined)}
                onClick={() => tapFlower(i)}
                disabled={isOpen || phase !== 'bloom' || card !== null || slip !== null}
                tabIndex={i === target && phase === 'bloom' && card === null && slip === null ? 0 : -1}
                aria-label={fmt(isOpen ? t.bloomed : t.bloom, { n: order.indexOf(i) + 1 })}
              >
                <span className={s.glow} />
                <span className={s.budWrap}>
                  <Sprite name={`kuncup-${h.bud}`} className={s.bud} />
                </span>
                <span className={s.bloomWrap}>
                  <Sprite name={`bunga-${h.kind}`} className={s.bloom} />
                </span>
                {isOpen ? (
                  <span className={s.burst} aria-hidden>
                    {Array.from({ length: 6 }, (_, q) => (
                      <Sprite key={q} name={`kelopak-${['putih', 'pink', 'jingga'][q % 3]}`} style={{ '--a': `${q * 60 + 20}deg` } as CSSProperties} />
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
          {phase === 'shy' && step < n ? (
            <HoldButton
              ms={1700}
              className={s.holdZone}
              style={{ left: `${(heads[CENTER].x / 600) * 100}%`, top: `${(heads[CENTER].y / 720) * 100}%`, width: `${(heads[CENTER].d / 600) * 92}%` } as CSSProperties}
              label={t.holdLabel}
              onProgress={onHoldProgress}
              onComplete={bloomShy}
            >
              <span className={s.holdCore} />
            </HoldButton>
          ) : null}
          <Sprite name="buket-depan" className={s.layer} />

          {/* area sentuh kuncup giliran: di atas kertas pembungkus & kuncup lain yang bertumpuk,
              jadi ketukan di kuncup yang bercahaya selalu kena (tampilan tidak berubah) */}
          {phase === 'bloom' && card === null && slip === null && target !== null ? (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              className={s.budHit}
              style={{ left: `${(heads[target].x / 600) * 100}%`, top: `${(heads[target].y / 720) * 100}%`, width: `${(heads[target].d / 600) * 100}%` } as CSSProperties}
              onClick={() => tapFlower(target)}
            />
          ) : null}

          {/* gulungan kertas yang menyembul dari bunga yang baru mekar */}
          {slip !== null ? (
            <button
              type="button"
              key={slip}
              className={cx(s.slip, isLast(slip) && s.slipGold)}
              style={{ left: `${(heads[order[slip]].x / 600) * 100}%`, top: `${(heads[order[slip]].y / 720) * 100}%` } as CSSProperties}
              onClick={pullSlip}
              aria-label={t.slipLabel}
              ref={(el) => {
                if (el && mode !== 'preview') el.focus({ preventScroll: true });
                if (cueOn === 'slip') cueEl.current = el;
              }}
            >
              <Sprite name={isLast(slip) ? 'buket-gulungan-emas' : 'buket-gulungan'} className={s.slipArt} />
            </button>
          ) : null}

          {/* pita: menjuntai longgar sampai diikat */}
          {phase === 'tie' || phase === 'smell' || phase === 'card' ? (
            <button ref={cue('bow')} type="button" className={cx(s.bowBtn, tied && s.tied)} onClick={tie} disabled={tied} aria-label={t.tieLabel}>
              <Sprite name="pita" className={s.bow} />
            </button>
          ) : null}

          {/* kartu kecil yang terselip */}
          {phase === 'card' ? (
            <button type="button" className={s.tuck} onClick={openCard} aria-label={t.cardLabel}>
              <Sprite name="buket-kartu" className={s.tuckArt} />
            </button>
          ) : null}

          {butterfly ? (
            <span
              className={cx(s.kupu, butterfly.away && s.away)}
              style={{ left: `${(butterfly.x / 600) * 100}%`, top: `${(butterfly.y / 720) * 100}%` } as CSSProperties}
              aria-hidden
            >
              <Sprite name="buket-kupu" className={s.kupuArt} />
            </span>
          ) : null}
        </div>
      </div>

      <div className={s.foot}>
        {phase === 'tag' ? (
          <div className={s.tagStage}>
            <button ref={cue('tag')} type="button" className={cx(s.tagCard, flipped && s.flipped)} onClick={() => { if (!flipped) { setFlipped(true); sfx.crack(); haptic(10); } }} aria-label={t.tagFlip} disabled={flipped}>
              <span className={s.string} aria-hidden />
              <span className={s.tagFace}>
                <Sprite name="buket-label" className={s.tagArt} />
                <span className={cx(s.tagText, data.to.length > 9 && s.tagLong)}>{data.to ? fmt(t.tagFront, { to: data.to }) : t.tagFrontAnon}</span>
              </span>
              <span className={cx(s.tagFace, s.tagBack)}>
                <Sprite name="buket-label" className={s.tagArt} />
                <span className={s.tagNote}>
                  {t.tagBack}
                  {data.from ? <em>{fmt(t.tagSign, { from: data.from })}</em> : null}
                </span>
              </span>
            </button>
            {flipped ? (
              <button ref={cue('tagGo')} type="button" className={s.cta} onClick={() => { sfx.tap(); setPhase('bloom'); }}>
                {t.tagGo}
              </button>
            ) : null}
          </div>
        ) : phase === 'smell' ? (
          <div className={s.smellStage}>
            {sniffed ? (
              <div className={s.smellText} aria-live="polite">
                <span>{t.smellLine}</span>
                <em>{t.smellAside}</em>
              </div>
            ) : (
              <button ref={cue('smell')} type="button" className={s.ghost} onClick={sniff}>
                {t.smell}
              </button>
            )}
          </div>
        ) : phase === 'card' ? (
          <button ref={cue('open')} type="button" className={s.cta} onClick={openCard}>
            {t.open}
          </button>
        ) : phase === 'bloom' || phase === 'shy' ? (
          <div className={s.count} aria-label={fmt(t.count, { opened: step, n })}>
            {order.map((_, q) => (
              <i key={q} className={cx(q < step && s.on, q === n - 1 && s.star)} />
            ))}
          </div>
        ) : null}
      </div>

      {/* kartu pesan per bunga */}
      {k !== null && note && head ? (
        <div
          className={cx(s.noteCard, isLast(k) && s.special, typed && s.noteReady)}
          key={k}
          role="group"
          aria-live="polite"
          onClick={(e) => {
            if (typed && e.target === e.currentTarget) nextCard();
          }}
        >
          {photo ? (
            <span className={s.snap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" draggable={false} />
            </span>
          ) : null}
          <div className={s.noteEyebrow} style={{ '--dot': head.dot } as CSSProperties}>
            <i />
            {isLast(k) ? t.special : `${t.flowers[head.kind] ?? head.kind} · ${fmt(t.nth, { i: k + 1, n })}`}
          </div>
          <p className={cx(s.noteText, note.length > 60 && s.long)}>
            <Typewriter text={note} speed={30} onDone={() => setTyped(true)} />
          </p>
          <button
            ref={(el) => {
              nextBtn.current = el;
              if (cueOn === 'next') cueEl.current = el;
            }}
            type="button"
            className={cx(s.nextBtn, typed && s.shown)}
            onClick={nextCard}
          >
            {isLast(k) ? t.tieGo : k + 1 === n - 1 ? t.nextLast : t.next}
          </button>
        </div>
      ) : null}

      {phase === 'tag' && !flipped && ready ? <Hint>{t.tagHint}</Hint> : null}
      {slip !== null ? <Hint key="slip">{t.slipHint}</Hint> : null}
      {phase === 'bloom' && card === null && slip === null ? <Hint key={hint ?? 'b'}>{hint ?? t.hintBud}</Hint> : null}
      {phase === 'shy' && step < n && card === null && slip === null ? <Hint key={hint ?? 's'}>{hint ?? t.hold}</Hint> : null}
      {phase === 'tie' && !tied ? <Hint>{t.tieHint}</Hint> : null}
      {phase === 'card' ? <Hint>{t.cardHint}</Hint> : null}

      <TapCue
        target={cueEl}
        show={cueOn !== null}
        kind={cueOn === 'shy' ? 'hold' : 'tap'}
        at={cueOn === 'shy' ? { x: 0.5, y: 0.38 } : undefined}
        delay={cueOn?.startsWith('f') || cueOn === 'tag' ? 2200 : 2800}
      />

      <Confetti burst={burst} colors={['#ee6a58', '#ffcb3d', '#ff9f1f', '#f47a8c', '#fffdf7', '#5a9f79']} origin={{ x: 0.5, y: 0.45 }} count={tied ? 110 : 60} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja"
          theme={{ backdrop: 'pagi', ink: '#43261f', paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
