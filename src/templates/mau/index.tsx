'use client';

import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Petals, Sprite, Stage, Typewriter, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { HeartIcon, Pulse } from './art';
import { meta } from './meta';
import s from './style.module.css';

/* label tombol "Nggak" tiap kali dicoba ditekan; yang terakhir menyerah dan ikut bilang mau */
const NO_LABELS = ['Nggak', 'Yakin?', 'Coba pikir lagi', 'Tombolnya licin', 'Yang satunya aja', 'Masih usaha?', 'Ya udah, mau'];
const TEASE = [
  '',
  'Eh, tombolnya kabur.',
  'Dia memang susah ditangkap.',
  'Jarimu kurang cepat.',
  'Yang gede itu lho tombolnya.',
  'Nyerah aja, ya?',
  'Nah, gitu dong.',
];
const LAST = NO_LABELS.length - 1;
const WORDS = ['satu', 'dua', 'tiga'];
const BPM = [82, 96, 111, 127];

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
  const notes = data.notes.map((t) => t.trim()).filter(Boolean).slice(0, 3);
  const qStep = notes.length + 1;
  const ready = useArtReady(ART);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(false);
  const [skip, setSkip] = useState(false);
  const [tries, setTries] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [yes, setYes] = useState(false);
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

  const asking = step >= qStep && !yes;
  const question = data.title.trim() || 'Mau nggak jadi pacarku?';
  const bpm = yes ? 76 : asking ? 138 + tries * 9 : BPM[Math.min(step, BPM.length - 1)];

  const advance = () => {
    if (step >= qStep) return;
    if (!typed && !skip) {
      setSkip(true);
      sfx.tap();
      return;
    }
    haptic(8);
    if (step + 1 >= qStep) sfx.chime();
    else sfx.tap();
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
    setBurst((b) => b + 1);
    sfx.success();
    haptic(40);
    later(() => setBurst((b) => b + 1), 900);
  };

  const story = step < qStep;
  const text = step === 0 ? (data.from ? 'Ada yang mau aku bilang.' : 'Ada yang mau dibilang.') : notes[step - 1];

  return (
    <div
      ref={wrap}
      className={cx(s.wrap, ready && s.ready)}
      style={{ ['--beat' as string]: `${(60 / bpm).toFixed(3)}s` } as CSSProperties}
      onClick={story ? advance : undefined}
      role={story ? 'button' : undefined}
      tabIndex={story ? 0 : undefined}
      aria-label={story ? 'Lanjut' : undefined}
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

      <div className={s.monitor}>
        <div className={s.pill}>
          <HeartIcon className={s.pillHeart} />
          <span>{data.from ? `detak jantung ${data.from}` : 'detak jantung'}</span>
          <b key={bpm}>{yes ? 'lega' : `${bpm} bpm`}</b>
        </div>
        <Pulse className={s.pulse} />
      </div>

      {story ? (
        <div className={s.body} key={step}>
          {step === 0 ? (
            <>
              <div className={s.eyebrow}>{data.from ? `dari ${data.from}` : 'sebentar ya'}</div>
              <div className={cx(s.hai, (data.to || '').length > 10 && s.haiSmall)}>Hai, {data.to || 'kamu'}.</div>
              <div className={s.lineSub}>
                {skip ? text : <Typewriter text={text} speed={34} onDone={() => setTyped(true)} />}
              </div>
            </>
          ) : (
            <div className={cx(s.note, step % 2 ? s.noteL : s.noteR)}>
              <span className={s.tape} />
              <span className={s.noteNo}>{WORDS[step - 1] ?? step}</span>
              {skip ? text : <Typewriter text={text} speed={30} onDone={() => setTyped(true)} />}
            </div>
          )}
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
          <div className={s.yeay}>Yeay!</div>
          <div className={s.pair}>
            {data.to || 'Kamu'} <i>&amp;</i> {data.from || 'aku'}
          </div>
        </div>
      ) : (
        <div className={cx(s.body, s.ask)} key="ask">
          <div ref={askRef} className={s.qcard}>
            <span className={s.tape} />
            <div className={s.eyebrow}>jadi, {data.to || 'kamu'}…</div>
            <div className={cx(s.question, question.length > 26 && s.questionSmall)}>{question}</div>
            <div className={s.tease} key={tries}>
              {TEASE[Math.min(tries, TEASE.length - 1)]}
            </div>
          </div>
        </div>
      )}

      <div className={s.foot}>
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
              Mau
            </button>
            <span ref={slotRef} className={s.slot} aria-hidden>
              Nggak
            </span>
          </div>
        ) : yes ? (
          <button
            type="button"
            className={s.cta}
            onClick={() => {
              sfx.chime();
              setFinale(true);
            }}
          >
            Baca pesannya →
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
            {NO_LABELS[Math.min(tries, LAST)]}
          </button>
        </div>
      ) : null}

      {story ? <Hint>Ketuk untuk lanjut</Hint> : null}

      <Confetti
        burst={burst}
        shapes="hearts"
        count={90}
        colors={['#ff3d6e', '#ff8fab', '#ffc2d1', '#ffffff', '#ffb300']}
        origin={{ x: 0.5, y: 0.6 }}
      />

      {finale ? (
        <Finale
          data={{ ...data, title: 'Kamu bilang mau.' }}
          mode={mode}
          eyebrow={data.from ? `Pesan dari ${data.from}` : 'Pesan buatmu'}
          flower="bunga-kamboja-pink"
          theme={{ backdrop: BG, ink: '#5a1730', paper: '#fffaf6', paperInk: '#4a1830' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
