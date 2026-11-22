'use client';

import { type CSSProperties, useRef, useState } from 'react';
import { Finale, Hint, HoldButton, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-amplop.webp';
const ART = [
  'bg-amplop',
  'amplop-muka',
  'amplop-belakang',
  'amplop-kantong',
  'amplop-tutup',
  'amplop-tutup-dalam',
  'amplop-segel',
  'amplop-retak',
  'amplop-segel-kiri',
  'amplop-segel-kanan',
];

export default function Amplop(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

/** front = sisi alamat · turnOut/turnIn = sedang dibalik · back = sisi segel */
type Side = 'front' | 'turnOut' | 'turnIn' | 'back';
/** sealed → broken (segel patah) → open (tutup terbuka) → out (surat menyembul) */
type Phase = 'sealed' | 'broken' | 'open' | 'out';

const TAPS_TO_BREAK = 3;

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const ready = useArtReady(ART);
  const [side, setSide] = useState<Side>('front');
  const [phase, setPhase] = useState<Phase>('sealed');
  const [hold, setHold] = useState(0);
  const [taps, setTaps] = useState(0);
  const [finale, setFinale] = useState(false);
  const broke = useRef(false);
  const later = useTimers();
  const t = TEXT[useLocale()];

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const mono = from ? Array.from(from)[0].toUpperCase() : '';
  const photos = data.photos.filter(Boolean).slice(0, 2);
  const showFront = side === 'front' || side === 'turnOut';
  const progress = Math.max(hold, taps / TAPS_TO_BREAK);

  const flip = () => {
    if (side !== 'front') return;
    sfx.whoosh();
    haptic(10);
    setSide('turnOut');
    later(() => setSide('turnIn'), 240);
    later(() => setSide('back'), 620);
  };

  const breakSeal = () => {
    if (broke.current) return;
    broke.current = true;
    setPhase('broken');
    sfx.crack();
    haptic(35);
    later(() => {
      setPhase('open');
      sfx.whoosh();
    }, 430);
    later(() => {
      setPhase('out');
      sfx.pop();
    }, 1250);
  };

  /* alternatif untuk yang tidak menahan: tiga ketukan juga mematahkan segel */
  const tapSeal = () => {
    if (broke.current) return;
    const n = taps + 1;
    setTaps(n);
    sfx.tap();
    haptic(8);
    if (n >= TAPS_TO_BREAK) breakSeal();
  };

  const openLetter = () => {
    if (phase !== 'out' || finale) return;
    sfx.chime();
    setFinale(true);
  };

  const opened = phase !== 'sealed';

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.head}>
        {showFront ? (
          <div key="a">
            <div className={s.eyebrow}>{t.letterFrom}</div>
            <div className={cx(s.name, from.length > 12 && s.small)}>{from || t.someone}</div>
          </div>
        ) : !opened ? (
          <div key="b">
            <div className={s.eyebrow}>{t.sealed}</div>
            <div className={cx(s.name, s.small)}>{fmt(t.onlyYou, { to })}</div>
          </div>
        ) : (
          <div key="c">
            <div className={s.eyebrow}>{t.broken}</div>
            <div className={cx(s.name, s.small)}>{fmt(t.goRead, { to })}</div>
          </div>
        )}
      </div>

      <div className={s.mid}>
        <div className={s.env}>
          <div className={cx(s.bob, !opened && s.floaty)}>
            <div className={cx(s.flip, side === 'turnOut' && s.turnOut, side === 'turnIn' && s.turnIn)}>
              {showFront ? (
                <button type="button" className={s.front} onClick={flip} aria-label={t.flip}>
                  <Sprite name="amplop-muka" className={s.face} />
                  {from ? <span className={s.sender}>{fmt(t.from, { from })}</span> : null}
                  <span className={s.addr}>
                    <span className={s.addrLabel}>{t.addrTo}</span>
                    <span className={cx(s.addrName, to.length > 11 && s.small)}>{to}</span>
                  </span>
                </button>
              ) : (
                <div className={cx(s.back, (phase === 'open' || phase === 'out') && s.open, phase === 'out' && s.out)}>
                  <Sprite name="amplop-belakang" className={cx(s.layer, s.inside)} />
                  {photos.map((src, i) => (
                    <span key={src + i} className={cx(s.peek, i === 0 ? s.peek1 : s.peek2)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" draggable={false} />
                    </span>
                  ))}
                  <button
                    type="button"
                    className={s.letter}
                    onClick={openLetter}
                    tabIndex={phase === 'out' ? 0 : -1}
                    aria-hidden={phase !== 'out'}
                    aria-label={t.read}
                  >
                    <span className={s.lTitle}>{data.title || t.titleFallback}</span>
                    <span className={s.lSalam}>{fmt(t.salam, { to })}</span>
                    <span className={s.lBody}>{data.message}</span>
                  </button>
                  <Sprite name="amplop-kantong" className={cx(s.layer, s.pocket)} />
                  <div className={s.flap}>
                    <Sprite name="amplop-tutup" className={cx(s.layer, s.flapOut)} />
                    <Sprite name="amplop-tutup-dalam" className={cx(s.layer, s.flapIn)} />
                  </div>

                  <div className={s.sealWrap} onClick={tapSeal}>
                    {phase === 'sealed' ? (
                      <HoldButton
                        ms={1300}
                        onComplete={breakSeal}
                        onProgress={setHold}
                        label={t.sealLabel}
                        className={s.sealBtn}
                      >
                        <span className={cx(s.sealIn, hold > 0 && s.shaking)}>
                          <Sprite name="amplop-segel" className={s.sealImg} />
                          <span className={s.mono}>{mono}</span>
                          <Sprite
                            name="amplop-retak"
                            className={s.crack}
                            style={{ transform: `scaleY(${progress.toFixed(3)})`, opacity: Math.min(1, progress * 4) } as CSSProperties}
                          />
                        </span>
                      </HoldButton>
                    ) : phase === 'broken' || phase === 'open' ? (
                      <>
                        <span className={cx(s.half, s.halfL)}>
                          <Sprite name="amplop-segel-kiri" className={s.sealImg} />
                          <span className={cx(s.mono, s.monoL)}>{mono}</span>
                        </span>
                        <span className={cx(s.half, s.halfR)}>
                          <Sprite name="amplop-segel-kanan" className={s.sealImg} />
                          <span className={cx(s.mono, s.monoR)}>{mono}</span>
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={s.foot}>
        {phase === 'out' ? (
          <button type="button" className={s.cta} onClick={openLetter}>
            {t.cta}
          </button>
        ) : null}
      </div>

      {side === 'front' ? <Hint>{t.hintTap}</Hint> : null}
      {side === 'back' && phase === 'sealed' ? (
        <Hint key={taps > 0 ? 't' : 'h'}>
          {taps > 0 ? fmt(t.hintMore, { n: TAPS_TO_BREAK - taps }) : t.hintHold}
        </Hint>
      ) : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja"
          theme={{ bg: `url(${BACKDROP}) center bottom / cover no-repeat`, ink: meta.palette.ink, paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
