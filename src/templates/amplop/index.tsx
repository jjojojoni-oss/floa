'use client';

import { useRef, useState } from 'react';
import { Finale, Hint, HoldButton, Stage, cx, haptic, sfx, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { FlapEdge, Pocket, Postmark, Seal, Stamp } from './art';
import { meta } from './meta';
import s from './style.module.css';

export default function Amplop(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette}>
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
  const [side, setSide] = useState<Side>('front');
  const [phase, setPhase] = useState<Phase>('sealed');
  const [hold, setHold] = useState(0);
  const [taps, setTaps] = useState(0);
  const [finale, setFinale] = useState(false);
  const broke = useRef(false);
  const later = useTimers();

  const to = data.to.trim() || 'kamu';
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
    <div className={s.wrap}>
      <div className={s.head}>
        {showFront ? (
          <div key="a">
            <div className={s.eyebrow}>sepucuk surat dari</div>
            <div className={cx(s.name, from.length > 12 && s.small)}>{from || 'seseorang'}</div>
          </div>
        ) : !opened ? (
          <div key="b">
            <div className={s.eyebrow}>masih tersegel</div>
            <div className={cx(s.name, s.small)}>Cuma {to} yang boleh buka.</div>
          </div>
        ) : (
          <div key="c">
            <div className={s.eyebrow}>segelnya patah</div>
            <div className={cx(s.name, s.small)}>Silakan dibaca, {to}.</div>
          </div>
        )}
      </div>

      <div className={s.mid}>
        <div className={s.env}>
          <span className={s.ground} />
          <div className={cx(s.bob, !opened && s.floaty)}>
            <div className={cx(s.flip, side === 'turnOut' && s.turnOut, side === 'turnIn' && s.turnIn)}>
              {showFront ? (
                <button type="button" className={s.front} onClick={flip} aria-label="Balik amplopnya">
                  {from ? (
                    <span className={s.sender}>
                      dari
                      <b>{from}</b>
                    </span>
                  ) : null}
                  <Postmark className={s.postmark} />
                  <Stamp className={s.stamp} />
                  <span className={s.addr}>
                    <span className={s.addrLabel}>Untuk</span>
                    <span className={cx(s.addrName, to.length > 11 && s.small)}>{to}</span>
                    <i className={s.rule} />
                  </span>
                  <span className={s.stripe} />
                </button>
              ) : (
                <div className={cx(s.back, (phase === 'open' || phase === 'out') && s.open, phase === 'out' && s.out)}>
                  <div className={s.inside} />
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
                    aria-label="Baca suratnya"
                  >
                    <span className={s.lTitle}>{data.title || 'Surat untukmu'}</span>
                    <span className={s.lSalam}>Untuk {to},</span>
                    <span className={s.lBody}>{data.message}</span>
                  </button>
                  <div className={s.pocket}>
                    <Pocket />
                  </div>
                  <span className={s.flapShadow} />
                  <div className={s.flap}>
                    <div className={cx(s.flapFace, s.flapOut)}>
                      <FlapEdge />
                    </div>
                    <div className={cx(s.flapFace, s.flapIn)} />
                  </div>

                  <div className={s.sealWrap} onClick={tapSeal}>
                    {phase === 'sealed' ? (
                      <HoldButton
                        ms={1300}
                        onComplete={breakSeal}
                        onProgress={setHold}
                        label="Tekan dan tahan segelnya sampai patah"
                        className={s.sealBtn}
                      >
                        <span className={cx(s.sealIn, hold > 0 && s.shaking)}>
                          <Seal letter={mono} progress={progress} className={s.sealArt} />
                        </span>
                      </HoldButton>
                    ) : phase === 'broken' || phase === 'open' ? (
                      <>
                        <span className={cx(s.half, s.halfL)}>
                          <Seal letter={mono} progress={1} className={s.sealArt} />
                        </span>
                        <span className={cx(s.half, s.halfR)}>
                          <Seal letter={mono} progress={1} className={s.sealArt} />
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
            Baca suratnya →
          </button>
        ) : null}
      </div>

      {side === 'front' ? <Hint>Ketuk amplopnya</Hint> : null}
      {side === 'back' && phase === 'sealed' ? (
        <Hint key={taps > 0 ? 't' : 'h'}>
          {taps > 0 ? `Tahan lebih lama, atau ketuk ${TAPS_TO_BREAK - taps}× lagi` : 'Tekan & tahan segelnya'}
        </Hint>
      ) : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow="Surat untukmu"
          theme={{ bg: 'linear-gradient(#f3ead9, #e6d7bd)', ink: '#2e2a26', paper: '#fffdf7', paperInk: '#2e2a26' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
