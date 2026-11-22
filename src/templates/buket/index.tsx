'use client';

import { type CSSProperties, useState } from 'react';
import { Confetti, Finale, Hint, Petals, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { meta } from './meta';
import s from './style.module.css';

/** Kepala bunga di kanvas buket 600×720: jenis, posisi, diameter, warna titik kartu. */
type Head = { kind: string; bud: string; x: number; y: number; d: number; dot: string; rot: number };
const H = (kind: string, bud: string, x: number, y: number, d: number, dot: string, rot = 0): Head => ({ kind, bud, x, y, d, dot, rot });

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

const ART = ['bg-pagi', 'buket-belakang', 'buket-daun', 'buket-depan'];

export default function Buket(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop="pagi">
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const notes = data.notes.map((n) => n.trim()).filter(Boolean).slice(0, 5);
  const n = Math.min(5, Math.max(3, notes.length));
  const heads = LAYOUTS[n];
  const ready = useArtReady([...ART, ...heads.map((h) => `kuncup-${h.bud}`)]);
  const [open, setOpen] = useState<boolean[]>(() => Array(n).fill(false));
  const [last, setLast] = useState<number | null>(null);
  const [tied, setTied] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const later = useTimers();
  const opened = open.filter(Boolean).length;

  const tap = (i: number) => {
    if (open[i]) return;
    const next = open.slice();
    next[i] = true;
    setOpen(next);
    setLast(i);
    haptic(12);
    sfx.pop();
    sfx.note(next.filter(Boolean).length - 1);
    if (next.every(Boolean)) {
      later(() => {
        setTied(true);
        setBurst((b) => b + 1);
        sfx.success();
        haptic(40);
      }, 1000);
    }
  };

  const note = last !== null ? notes[last] : null;

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <Petals kinds={['putih', 'pink', 'jingga']} count={8} />

      <div className={s.head}>
        {tied ? (
          <div key="t">
            <div className={s.eyebrow}>buketnya sudah jadi</div>
            <div className={cx(s.name, s.small)}>{data.title || `Untuk ${data.to}`}</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>sebuah buket untuk</div>
            <div className={cx(s.name, data.to.length > 12 && s.small)}>{data.to || 'kamu'}</div>
            {data.from ? <div className={s.from}>dari {data.from}</div> : null}
          </div>
        )}
      </div>

      <div className={s.art}>
        <div className={s.bq} role="group" aria-label="Buket bunga">
          <Sprite name="buket-belakang" className={s.layer} />
          <Sprite name="buket-daun" className={cx(s.layer, s.greens)} />
          {heads.map((h, i) => {
            const lean = Math.round((Math.atan2(h.x - 300, 560 - h.y) * 180) / Math.PI);
            return (
              <button
                key={i}
                type="button"
                className={cx(s.flower, open[i] && s.open)}
                style={
                  {
                    left: `${(h.x / 600) * 100}%`,
                    top: `${(h.y / 720) * 100}%`,
                    width: `${(h.d / 600) * 100}%`,
                    '--i': i,
                    '--lean': `${lean}deg`,
                    '--rot': `${h.rot}deg`,
                  } as CSSProperties
                }
                onClick={() => tap(i)}
                disabled={open[i]}
                aria-label={open[i] ? `Bunga ${i + 1} sudah mekar` : `Mekarkan bunga ${i + 1}`}
              >
                <span className={s.glow} />
                <span className={s.budWrap}>
                  <Sprite name={`kuncup-${h.bud}`} className={s.bud} />
                </span>
                <span className={s.bloomWrap}>
                  <Sprite name={`bunga-${h.kind}`} className={s.bloom} />
                </span>
                {open[i] ? (
                  <span className={s.burst} aria-hidden>
                    {Array.from({ length: 6 }, (_, k) => (
                      <Sprite key={k} name={`kelopak-${['putih', 'pink', 'jingga'][k % 3]}`} style={{ '--a': `${k * 60 + 20}deg` } as CSSProperties} />
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
          <Sprite name="buket-depan" className={s.layer} />
          <Sprite name="pita" className={cx(s.bow, tied && s.tied)} />
        </div>
      </div>

      <div className={s.foot}>
        {note ? (
          <div key={last} className={s.tag} style={{ '--dot': heads[last as number].dot } as CSSProperties}>
            {note}
          </div>
        ) : null}
        {tied ? (
          <button
            type="button"
            className={s.cta}
            onClick={() => {
              sfx.chime();
              setFinale(true);
            }}
          >
            Buka suratnya →
          </button>
        ) : (
          <div className={s.count} aria-label={`${opened} dari ${n} bunga mekar`}>
            {open.map((o, i) => (
              <i key={i} className={o ? s.on : undefined} />
            ))}
          </div>
        )}
      </div>

      {opened === 0 ? <Hint>Ketuk kuncupnya satu-satu</Hint> : null}

      <Confetti burst={burst} colors={['#ee6a58', '#ffcb3d', '#ff9f1f', '#f47a8c', '#fffdf7', '#5a9f79']} origin={{ x: 0.5, y: 0.55 }} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow="Terselip di antara bunganya"
          flower="bunga-kamboja"
          theme={{ backdrop: 'pagi', ink: '#43261f', paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
