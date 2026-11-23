'use client';

import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Petals, Sprite, Stage, Typewriter, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { HeartIcon, Pulse } from './art';
import { drawDayCard } from './card';
import { LOCALE_TAG, TEXT, useText } from './i18n';
import { fmt, useLocale } from '@/i18n/client';
import { meta } from './meta';
import s from './style.module.css';

/* label tombol "Nggak" & godaannya ada di i18n.ts; yang terakhir menyerah dan ikut bilang mau */
const LAST = TEXT.id.noLabels.length - 1;
const MAX_BEATS = 6;
/** lama satu tarikan + hembusan napas (ms); tombol lanjut baru aktif setelahnya */
const BREATH_MS = 3400;

const BG = '/art/bg-mau.webp';
const ART = [BG, 'mau-sudut-atas', 'mau-sudut-bawah'];

export default function Mau(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BG}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const locale = useLocale();
  const notes = data.notes.map((t) => t.trim()).filter(Boolean).slice(0, MAX_BEATS);
  const photos = data.photos.filter(Boolean);
  const n = notes.length;
  /** 0 = pembuka · 1..n = detak · n+1 = tarik napas · n+2 = pertanyaan */
  const breathStep = n + 1;
  const qStep = n + 2;
  const ready = useArtReady(ART);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(false);
  const [skip, setSkip] = useState(false);
  const [tries, setTries] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [yes, setYes] = useState(false);
  const [yesAt, setYesAt] = useState<Date | null>(null);
  const [day, setDay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const mauRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const askRef = useRef<HTMLDivElement>(null);
  const triesRef = useRef(0);
  const lastTry = useRef(0);
  const later = useTimers();
  const t = useText();

  const story = step < qStep;
  const breathing = step === breathStep;
  const asking = step >= qStep && !yes;
  const question = data.title.trim() || t.defaultQuestion;
  // jantung makin cepat tiap detak, sempat tenang saat tarik napas, lalu berdegup kencang di pertanyaan
  const bpm = yes
    ? 76
    : asking
      ? 138 + tries * 9
      : breathing
        ? 94
        : step === 0
          ? 78
          : Math.round(82 + (step / Math.max(1, n)) * 44);

  // jeda napas: lanjut baru bisa setelah satu tarikan & hembusan
  useEffect(() => {
    if (!breathing) return;
    const id = setTimeout(() => setTyped(true), BREATH_MS);
    return () => clearTimeout(id);
  }, [breathing]);

  const advance = () => {
    if (step >= qStep) return;
    if (breathing && !typed) return;
    if (!typed && !skip) {
      setSkip(true);
      sfx.tap();
      return;
    }
    haptic(step + 1 >= breathStep ? 14 : 8);
    if (step + 1 === qStep) sfx.chime();
    else sfx.note(step);
    setStep(step + 1);
    setTyped(false);
    setSkip(false);
  };

  /** taruh tombol "Nggak" tepat di tempat asalnya, di bawah tombol "Mau" */
  const home = () => {
    const w = wrap.current?.getBoundingClientRect();
    const r = slotRef.current?.getBoundingClientRect();
    if (!w || !r || !w.width || !w.height) return;
    setPos({ x: ((r.left + r.width / 2 - w.left) / w.width) * 100, y: ((r.top + r.height / 2 - w.top) / w.height) * 100 });
  };

  // tombol "Mau" membesar tiap percobaan; saat "Nggak" sedang di rumahnya, ikutkan posisinya
  useLayoutEffect(() => {
    if (!asking) return;
    if (tries === 0 || tries >= LAST) home();
  }, [asking, tries]);

  useEffect(() => {
    if (!asking || !wrap.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (triesRef.current === 0 || triesRef.current >= LAST) home();
    });
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [asking]);

  const dodge = () => {
    if (triesRef.current >= LAST) return;
    const now = performance.now();
    if (now - lastTry.current < 260) return;
    lastTry.current = now;
    triesRef.current += 1;
    setTries(triesRef.current);
    haptic(10);
    sfx.whoosh();
    if (triesRef.current >= LAST) {
      later(() => sfx.pop(), 200);
      return;
    }
    const w = wrap.current?.getBoundingClientRect();
    const m = mauRef.current?.getBoundingClientRect();
    const b = noRef.current?.getBoundingClientRect();
    if (!w || !m || !b) return;
    const bw = Math.max(b.width, w.width * 0.44);
    const bh = b.height;
    const mcx = m.left + m.width / 2;
    const mcy = m.top + m.height / 2;
    const mw = (m.width * 1.14) / 2 + 12;
    const mh = (m.height * 1.14) / 2 + 12;
    const cx0 = b.left + b.width / 2;
    const cy0 = b.top + b.height / 2;
    const q = askRef.current?.getBoundingClientRect();
    let best: { x: number; y: number } | null = null;
    let bestD = -1;
    for (let k = 0; k < 60; k++) {
      const x = w.left + bw / 2 + 8 + Math.random() * Math.max(1, w.width - bw - 16);
      const y = w.top + w.height * 0.17 + bh / 2 + Math.random() * Math.max(1, w.height * 0.75 - bh);
      if (Math.abs(x - mcx) < mw + bw / 2 && Math.abs(y - mcy) < mh + bh / 2) continue;
      // sebisa mungkin jangan menutupi pertanyaannya (dilonggarkan kalau ruangnya sempit)
      if (q && k < 40 && y + bh / 2 > q.top - 4 && y - bh / 2 < q.bottom + 4) continue;
      const d = Math.hypot(x - cx0, y - cy0);
      if (d > bestD) {
        bestD = d;
        best = { x, y };
      }
      if (d > w.width * 0.4) break;
    }
    if (best) setPos({ x: ((best.x - w.left) / w.width) * 100, y: ((best.y - w.top) / w.height) * 100 });
  };

  const sayYes = () => {
    if (yes) return;
    setYes(true);
    setYesAt(new Date());
    setBurst((b) => b + 1);
    sfx.success();
    haptic(40);
    later(() => setBurst((b) => b + 1), 900);
  };

  const tag = LOCALE_TAG[locale];
  const when = yesAt ?? new Date();
  const dateLabel = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }).format(when);
  const weekday = new Intl.DateTimeFormat(tag, { weekday: 'long' }).format(when);
  const timeLabel = new Intl.DateTimeFormat(tag, { hour: 'numeric', minute: '2-digit' }).format(when);
  const pair = `${data.to || t.pairYou} & ${data.from || t.pairMe}`;

  const saveCard = async () => {
    if (saving) return;
    setSaving(true);
    sfx.tap();
    try {
      const url = await drawDayCard({
        eyebrow: t.dayEyebrow,
        date: dateLabel,
        weekday,
        pair,
        at: fmt(t.dayAt, { time: timeLabel }),
        note: t.dayNote,
      });
      const a = document.createElement('a');
      a.href = url;
      a.download = `${t.dayFile}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      /* kanvas tidak tersedia: lewati saja */
    } finally {
      setSaving(false);
    }
  };

  const text = step === 0 ? (data.from ? t.introFrom : t.introAnon) : notes[step - 1];
  const photo = step >= 1 && step <= n ? photos[step - 1] : undefined;

  return (
    <div
      ref={wrap}
      className={cx(s.wrap, ready && s.ready)}
      style={{ ['--beat' as string]: `${(60 / bpm).toFixed(3)}s` } as CSSProperties}
      onClick={story ? advance : undefined}
      role={story ? 'button' : undefined}
      tabIndex={story ? 0 : undefined}
      aria-label={story ? t.next : undefined}
      onKeyDown={
        story
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                advance();
              }
            }
          : undefined
      }
    >
      <Petals kinds={['pink', 'merah', 'putih']} count={8} />
      <Sprite name="mau-sudut-atas" className={s.cornerTop} />
      <Sprite name="mau-sudut-bawah" className={s.cornerBottom} />

      <div className={cx(s.monitor, day && s.monitorQuiet)} aria-hidden={day || undefined}>
        <div className={s.pill}>
          <HeartIcon key={`h${step}`} className={cx(s.pillHeart, step > 0 && story && s.thumpHeart)} />
          <span>{data.from ? fmt(t.heartbeatOf, { name: data.from }) : t.heartbeat}</span>
          <b key={bpm}>{yes ? t.relieved : `${bpm} bpm`}</b>
        </div>
        <Pulse className={s.pulse} />
      </div>

      {story ? (
        step === 0 ? (
          <div className={s.body} key="intro">
            <div className={s.eyebrow}>{data.from ? fmt(t.fromName, { name: data.from }) : t.wait}</div>
            <div className={cx(s.hai, (data.to || '').length > 10 && s.haiSmall)}>{fmt(t.hi, { name: data.to || t.you })}</div>
            <div className={s.lineSub}>{skip ? text : <Typewriter text={text} speed={34} onDone={() => setTyped(true)} />}</div>
          </div>
        ) : breathing ? (
          <div className={s.body} key="breath">
            <div className={s.eyebrow}>{t.breathEyebrow}</div>
            <div className={s.breathLine}>{t.breath}</div>
            <div className={s.breathSub}>{t.breathSub}</div>
            <div className={s.breathe} aria-hidden>
              <span className={s.breatheRing} />
              <span className={s.breatheCore}>
                <HeartIcon className={s.breatheHeart} />
              </span>
              <span className={cx(s.breatheWord, s.wordIn)}>{t.breathIn}</span>
              <span className={cx(s.breatheWord, s.wordOut)}>{t.breathOut}</span>
            </div>
          </div>
        ) : (
          <div className={cx(s.body, s.beatBody)} key={`b${step}`}>
            <div className={s.beatHead}>
              <span className={s.beatNo}>{fmt(t.beatOf, { i: step, n })}</span>
              <span className={s.dots} aria-hidden>
                {notes.map((_, i) => (
                  <i key={i} className={cx(i < step && s.dotOn, i === step - 1 && s.dotNow)} />
                ))}
              </span>
            </div>
            {photo ? (
              <div className={cx(s.snap, step % 2 ? s.snapR : s.snapL)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="" draggable={false} />
              </div>
            ) : null}
            <div className={cx(s.note, step % 2 ? s.noteL : s.noteR, photo && s.noteWithPhoto, text.length > 52 && s.noteLong)}>
              <span className={s.tape} />
              {skip ? text : <Typewriter text={text} speed={32} onDone={() => setTyped(true)} />}
            </div>
          </div>
        )
      ) : day ? (
        <div className={cx(s.body, s.dayBody)} key="day">
          <div className={s.dayCard}>
            <span className={s.tape} />
            <Sprite name="mau-hati-besar" className={s.dayHeart} />
            <div className={s.dayEyebrow}>{t.dayEyebrow}</div>
            <div className={s.dayDate}>{dateLabel}</div>
            <div className={s.dayWeek}>{weekday}</div>
            <div className={s.dayRule} aria-hidden>
              <HeartIcon className={s.dayRuleHeart} />
            </div>
            <div className={cx(s.dayPair, pair.length > 24 && s.dayPairLong)}>{pair}</div>
            <div className={s.dayAt}>
              {t.dayAt.split('{time}')[0]}
              <span className={s.nowrap}>
                {timeLabel}
                {t.dayAt.split('{time}')[1]}
              </span>
            </div>
            <div className={s.dayNote}>{t.dayNote}</div>
          </div>
        </div>
      ) : yes ? (
        <div className={s.body} key="yes">
          <div className={s.hearts} aria-hidden>
            <Sprite name="mau-hati-kecil" className={s.heartB} />
            <Sprite name="mau-hati-besar" className={s.heartA} />
            <Sprite name="mau-kilau" className={cx(s.spark, s.spark1)} />
            <Sprite name="mau-kilau" className={cx(s.spark, s.spark2)} />
            <Sprite name="mau-kilau" className={cx(s.spark, s.spark3)} />
          </div>
          <div className={s.yeay}>{t.yeay}</div>
          <div className={s.pair}>
            {data.to || t.pairYou} <i>&amp;</i> {data.from || t.pairMe}
          </div>
        </div>
      ) : (
        <div className={cx(s.body, s.ask)} key="ask">
          <div ref={askRef} className={s.qcard}>
            <span className={s.tape} />
            <div className={s.eyebrow}>{fmt(t.so, { name: data.to || t.you })}</div>
            <div className={cx(s.question, question.length > 26 && s.questionSmall)}>{question}</div>
            <div className={s.tease} key={tries}>
              {t.tease[Math.min(tries, t.tease.length - 1)]}
            </div>
          </div>
        </div>
      )}

      <div className={cx(s.foot, story && s.footShort, day && s.footDay)}>
        {asking ? (
          <div className={s.choices}>
            <button
              ref={mauRef}
              type="button"
              className={s.mau}
              style={{
                transform: `scale(${1 + Math.min(tries, LAST) * 0.1})`,
                // sisakan ruang untuk pembesarannya supaya tidak menimpa tombol di bawahnya
                margin: `${Math.min(tries, LAST) * 0.17}em 0`,
              }}
              onClick={sayYes}
            >
              {t.yes}
            </button>
            <span ref={slotRef} className={s.slot} aria-hidden>
              {t.noLabels[0]}
            </span>
          </div>
        ) : day ? (
          <div className={s.dayActions}>
            <button
              type="button"
              className={s.cta}
              onClick={() => {
                sfx.chime();
                setFinale(true);
              }}
            >
              {t.read}
            </button>
            <button type="button" className={s.ghost} onClick={saveCard} disabled={saving}>
              {t.dayKeep}
            </button>
          </div>
        ) : yes ? (
          <button
            type="button"
            className={s.cta}
            onClick={() => {
              sfx.pop();
              haptic(12);
              setDay(true);
            }}
          >
            {t.oneMore}
          </button>
        ) : null}
      </div>

      {asking ? (
        // lapis seukuran stage: translate dalam % = posisi tombol di stage
        <div
          className={s.noLayer}
          style={{ transform: `translate(${pos ? pos.x : 50}%, ${pos ? pos.y : 50}%)`, visibility: pos ? 'visible' : 'hidden' }}
        >
          <button
            ref={noRef}
            type="button"
            className={cx(s.no, tries >= LAST && s.noGiveUp, tries > 0 && tries < LAST && s.noRun)}
            style={{ '--tilt': `${tries === 0 || tries >= LAST ? 0 : tries % 2 ? -7 : 6}deg` } as CSSProperties}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') dodge();
            }}
            onPointerDown={(e) => {
              if (triesRef.current >= LAST) return;
              e.preventDefault();
              dodge();
            }}
            onClick={() => {
              if (performance.now() - lastTry.current < 420) return;
              if (triesRef.current >= LAST) sayYes();
              else dodge();
            }}
          >
            {t.noLabels[Math.min(tries, LAST)]}
          </button>
        </div>
      ) : null}

      {story && !breathing ? <Hint key={`hint${step}`}>{t.tapNext}</Hint> : null}
      {breathing && typed ? <Hint key="ready">{t.ready}</Hint> : null}

      <Confetti
        burst={burst}
        shapes="hearts"
        count={90}
        colors={['#ff3d6e', '#ff8fab', '#ffc2d1', '#ffffff', '#ffb300']}
        origin={{ x: 0.5, y: 0.6 }}
      />

      {finale ? (
        <Finale
          data={{ ...data, title: t.finaleTitle }}
          mode={mode}
          eyebrow={data.from ? fmt(t.finaleEyebrowFrom, { name: data.from }) : t.finaleEyebrow}
          flower="bunga-kamboja-pink"
          theme={{ backdrop: BG, ink: '#5a1730', paper: '#fffaf6', paperInk: '#4a1830' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
