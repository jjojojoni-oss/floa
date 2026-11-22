'use client';

import { useState } from 'react';
import { Confetti, Finale, Hint, Stage, cx, haptic, sfx, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { BouquetArt, KINDS, LAYOUTS } from './art';
import { meta } from './meta';
import s from './style.module.css';

export default function Buket(props: TemplateProps) {
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
  const flowers = LAYOUTS[n];
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
      }, 950);
    }
  };

  const note = last !== null ? notes[last] : null;

  return (
    <div className={s.wrap}>
      <span className={cx(s.blob, s.blob1)} />
      <span className={cx(s.blob, s.blob2)} />

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
        <BouquetArt open={open} tied={tied} onTap={tap} className={s.svg} />
      </div>

      <div className={s.foot}>
        {note ? (
          <div
            key={last}
            className={s.tag}
            style={{ ['--dot' as string]: KINDS[flowers[last as number].kind].bud }}
          >
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

      <Confetti burst={burst} colors={['#ee6f8c', '#ffc233', '#ff8d5c', '#b7a2ee', '#fffdf7', '#5a9f79']} origin={{ x: 0.5, y: 0.55 }} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow="Terselip di antara bunganya"
          theme={{ bg: 'linear-gradient(#fdeee4, #f8d9d3)', ink: '#3a2a2a', paper: '#fffdf8', paperInk: '#3a2a2a' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
