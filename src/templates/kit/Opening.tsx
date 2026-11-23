'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { fmt } from '@/i18n/fmt';
import { Stage, Typewriter, cx, useKitText } from './index';
import s from './kit.module.css';

/** Kalimat pembuka dipecah per baris lalu per kalimat; tiap potong tampil satu layar. */
export function splitBeats(text: string) {
  return text
    .split(/\n+/)
    .flatMap((line) => line.match(/[^.!?…]+[.!?…]+["'”’)\]]*|[^.!?…]+$/g) ?? [])
    .map((b) => b.trim())
    .filter(Boolean);
}

/**
 * Layar pembuka sebelum template dimulai: kalimat dari pengirim muncul satu per satu dengan ketikan
 * pelan. Ketuk di mana saja untuk lanjut; "Lewati" langsung ke kadonya. Ketukan pertama juga
 * dihitung browser sebagai izin memutar suara, jadi musik kado bisa mulai di sini.
 */
export function Opening({
  text,
  to,
  palette,
  onDone,
}: {
  text: string;
  to: string;
  palette: { bg: string; ink: string; accent: string };
  onDone: () => void;
}) {
  const k = useKitText();
  const beats = useMemo(() => splitBeats(text), [text]);
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => done.current(), 550);
  };

  const next = () => {
    if (leaving) return;
    if (!typed) {
      setTyped(true);
      return;
    }
    if (i + 1 < beats.length) {
      setI(i + 1);
      setTyped(false);
    } else finish();
  };

  if (!beats.length) return null;
  const name = to.trim();

  return (
    <Stage {...palette}>
      <div
        ref={ref}
        className={cx(s.opening, leaving && s.leaving)}
        role="button"
        tabIndex={0}
        aria-label={`${beats[i]} ${k.introNext}`}
        onClick={next}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            next();
          }
        }}
      >
        {name ? <div className={s.openFor}>{fmt(k.introFor, { to: name })}</div> : null}
        <p key={i} className={s.openLine}>
          {typed ? beats[i] : <Typewriter text={beats[i]} speed={42} onDone={() => setTyped(true)} />}
        </p>
        {beats.length > 1 ? (
          <div className={s.openDots} aria-hidden>
            {beats.map((_, j) => (
              <span key={j} className={j <= i ? s.on : undefined} />
            ))}
          </div>
        ) : null}
        <div className={cx(s.openNext, typed && s.on)} aria-hidden>
          {k.introNext}
        </div>
        <button
          type="button"
          className={s.openSkip}
          onClick={(e) => {
            e.stopPropagation();
            finish();
          }}
        >
          {k.introSkip}
        </button>
      </div>
    </Stage>
  );
}
