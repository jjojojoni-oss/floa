'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Petals, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { BIN_MOUTH, Ball, BallGame } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-mesintik.webp';
const ART = [
  'bg-mesintik',
  'mesintik-lampu',
  'mesintik-lampu-nyala',
  'mesintik-rantai',
  'mesintik-badan',
  'mesintik-kereta',
  'mesintik-tuas',
  'mesintik-tuts',
  'mesintik-spasi',
  'mesintik-keranjang',
  'mesintik-bola',
  'mesintik-bola-2',
];
/** lukisan yang baru dipakai belakangan: disiapkan selagi lampunya belum menyala */
const LATER_ART = ['mesintik-kusut', 'mesintik-klip', 'game-mesintik-bola', 'bunga-kamboja', 'daun-2', 'daun-4', 'kelopak-putih', 'kelopak-pink'];

/**
 * dark  → meja penulis jam dua pagi, gelap; rantai lampu ditarik (atau lampunya diketuk): klik, lampu menyala
 * feed  → selembar kertas dari tumpukan dimasukkan ke rol (seret ke atas atau ketuk)
 * type  → tiap ketukan di papan tuts mengetik beberapa huruf "Untuk {to}," (tuts turun, batang huruf memukul)
 * bell  → ting! ujung baris; tuas didorong (seret ke kanan atau ketuk): kereta kembali, kertas naik dua baris
 * bin   → bola-bola kertas di keranjang dan di meja diketuk satu per satu: tiap draf gagal dibuka, dibaca, diremas lagi
 * title → mesin mengetik sendiri kalimat yang jujur dengan pita merah; satu kata salah ketik dicoret x lalu diulang
 * game  → mini-game draf bandel
 * pull  → kertasnya ditarik keluar dari rol (seret ke atas atau ketuk) → surat
 */
type Phase = 'dark' | 'feed' | 'type' | 'bell' | 'bin' | 'title' | 'game' | 'pull';
const CLOCK: Record<Phase, number> = { dark: 0, feed: 1, type: 2, bell: 3, bin: 4, title: 5, game: 5, pull: 6 };

/** lebar dunia lukisan dalam em (780 satuan; 1em = 32 satuan) */
const WORLD_W = 24.375;
/** badan mesin tik: kanvas 660 × 520 digambar 0.9× (lihat .body di style.module.css) */
const BODY = { k: 0.9, w: 660, h: 520 };
/** tuts: [jumlah, x pertama, y] per baris dalam satuan kanvas badan (sama dengan KEY_ROWS di art/sprites/66-mesintik.js) */
const KEY_ROWS: Array<[number, number, number]> = [
  [10, 96, 306],
  [9, 122, 354],
  [9, 148, 402],
];
const KEYS = KEY_ROWS.flatMap(([n, x0, y]) => Array.from({ length: n }, (_, i) => [x0 + i * 52, y] as [number, number]));
/** keranjang huruf (kanvas badan): pusat & jari-jari ujung batang; batangnya memukul tepat di atas rol */
const BASKET = { x: 330, y: 240, rx: 152 * 0.84, ry: 122 * 0.84 };
const STRIKE: [number, number] = [330, -8];
/** bola kertas (pusatnya, satuan lukisan): dua di atas tumpukan keranjang, sisanya meleset ke meja */
const BALLS: Array<[number, number]> = [
  [618, 1214],
  [704, 1198],
  [524, 1298],
  [432, 1322],
  [342, 1296],
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const PUNCT = /[.,!?…;:]/;

/** batang huruf ke-`slot` (0..28) dari tepi keranjang ke titik pukul, dalam % kanvas badan & em dunia */
function barStyle(slot: number): CSSProperties {
  const a = Math.PI + ((slot + 0.5) / 29) * Math.PI;
  const px = BASKET.x + Math.cos(a) * BASKET.rx;
  const py = BASKET.y + Math.sin(a) * BASKET.ry;
  const dx = ((STRIKE[0] - px) * BODY.k) / 32;
  const dy = ((STRIKE[1] - py) * BODY.k) / 32;
  return { left: `${(px / BODY.w) * 100}%`, top: `${(py / BODY.h) * 100}%`, width: `${Math.hypot(dx, dy)}em`, rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` };
}
const slotOf = (key: number) => Math.round(((KEYS[key][0] - 96) / 468) * 28);
/** tuts "acak" yang tetap sama untuk huruf yang sama posisinya */
const keyFor = (i: number) => (i * 7 + 3) % KEYS.length;

type Glyph = { ch: string; typo?: boolean };
type Op = { k: 'type'; g: number } | { k: 'x'; g: number } | { k: 'wait'; ms: number; tag: 'oops' | 'fix' };

/**
 * Pita kalimat akhir: huruf demi huruf, dengan satu salah ketik (dua huruf terakhir kata terpanjang tertukar),
 * yang dicoret x satu per satu lalu diketik ulang dengan benar.
 */
function buildTape(title: string) {
  const words = title.split(/\s+/).filter(Boolean);
  const letters = (w: string) => w.match(/\p{L}/gu)?.length ?? 0;
  let wi = -1;
  words.forEach((w, i) => {
    if (i > 0 && letters(w) >= 4 && (wi < 0 || letters(w) > letters(words[wi]))) wi = i;
  });
  if (wi < 0) wi = words.findIndex((w) => letters(w) >= 4);
  const glyphs: Glyph[] = [];
  const ops: Op[] = [];
  const push = (ch: string, typo = false) => {
    glyphs.push({ ch, typo });
    ops.push({ k: 'type', g: glyphs.length - 1 });
  };
  words.forEach((w, i) => {
    if (i) push(' ');
    if (i === wi) {
      const core = Array.from(w.replace(/[^\p{L}\p{N}]+$/u, ''));
      const bad = core.slice();
      const j = bad.length - 2;
      [bad[j], bad[j + 1]] = [bad[j + 1], bad[j]];
      if (core.length >= 4 && bad.join('') !== core.join('')) {
        const start = glyphs.length;
        bad.forEach((ch) => push(ch, true));
        ops.push({ k: 'wait', ms: 750, tag: 'oops' });
        for (let g = start; g < glyphs.length; g++) ops.push({ k: 'x', g });
        ops.push({ k: 'wait', ms: 420, tag: 'fix' });
        push(' ');
      }
    }
    Array.from(w).forEach((ch) => push(ch));
  });
  return { glyphs, ops };
}

/** Huruf-huruf ketikan: kata utuh tidak terpecah; sisa kata yang sedang diketik dipesan tempatnya (tak terlihat). */
function Typed({ glyphs, n, struck, className }: { glyphs: Glyph[]; n: number; struck?: Set<number>; className?: string }) {
  const words: Array<{ start: number; end: number }> = [];
  let st = -1;
  glyphs.forEach((g, i) => {
    if (g.ch === ' ') {
      if (st >= 0) words.push({ start: st, end: i });
      st = -1;
    } else if (st < 0) st = i;
  });
  if (st >= 0) words.push({ start: st, end: glyphs.length });
  const out: ReactNode[] = [];
  for (const w of words) {
    if (w.start >= n) break;
    if (w.start > 0 && glyphs[w.start - 1].ch === ' ') out.push(' ');
    const chars: ReactNode[] = [];
    for (let i = w.start; i < w.end; i++) {
      chars.push(
        <i key={i} className={cx(s.g, i >= n && s.ghost, struck?.has(i) && s.x)}>
          {glyphs[i].ch}
        </i>,
      );
    }
    out.push(
      <span key={`w${w.start}`} className={cx(s.word, w.end - w.start > 16 && s.brk)}>
        {chars}
      </span>,
    );
  }
  return <span className={className}>{out}</span>;
}

type Drag = { id: number; x0: number; y0: number; moved: boolean };
type DragCfg = {
  on: boolean;
  /** seberapa jauh gerakan (px) searah yang diminta */
  proj: (dx: number, dy: number) => number;
  /** jarak penuh dalam em dunia */
  dist: number;
  value: number;
  set: (p: number) => void;
  done: () => void;
  tap: () => void;
};

export default function Mesintik(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const t = TEXT[useLocale()];
  const later = useTimers();
  const ready = useArtReady(ART);

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const title = data.title.trim() || t.titleFallback;

  /** draf: catatan ke-i berpasangan dengan foto ke-i (sebelum yang kosong dibuang) */
  const drafts = useMemo(() => {
    const out: { note: string; photo: string | null }[] = [];
    const n = Math.min(5, Math.max(data.notes.length, data.photos.length));
    for (let i = 0; i < n; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = data.photos[i] || null;
      if (note || photo) out.push({ note, photo });
    }
    if (!out.length) out.push({ note: t.emptyDraft, photo: null });
    return out;
  }, [data.notes, data.photos, t.emptyDraft]);
  const N = drafts.length;

  const salam = useMemo<Glyph[]>(() => Array.from(fmt(t.salam, { to })).map((ch) => ({ ch })), [t.salam, to]);
  const tape = useMemo(() => buildTape(title), [title]);

  const [phase, setPhase] = useState<Phase>('dark');
  const [lampOn, setLampOn] = useState(false);
  const [chain, setChain] = useState(0);
  const [tug, setTug] = useState(0);
  const [fed, setFed] = useState(false);
  const [lift, setLift] = useState(0);
  const [sheet, setSheet] = useState(0);
  /** huruf salam yang sudah terketik / yang diminta ketukan */
  const [sN, setSN] = useState(0);
  const [sGoal, setSGoal] = useState(0);
  const [press, setPress] = useState<number | null>(null);
  const [space, setSpace] = useState(false);
  const [bar, setBar] = useState<{ k: number; slot: number } | null>(null);
  const [rang, setRang] = useState(0);
  const [lever, setLever] = useState(0);
  const [pushed, setPushed] = useState(false);
  const [returned, setReturned] = useState(false);
  const [gone, setGone] = useState<boolean[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [fly, setFly] = useState<{ fx: number; fy: number; tx: number; ty: number }>({ fx: 0, fy: 0, tx: 0, ty: 0 });
  const [closing, setClosing] = useState(false);
  const [read, setRead] = useState(0);
  const [binHop, setBinHop] = useState(0);
  const [typing, setTyping] = useState(false);
  const [opI, setOpI] = useState(0);
  const [wow, setWow] = useState(false);
  const [peek, setPeek] = useState(false);
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');
  const [pullP, setPullP] = useState(0);
  const [pulled, setPulled] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<HTMLButtonElement>(null);
  const stackRef = useRef<HTMLButtonElement>(null);
  const typeRef = useRef<HTMLButtonElement>(null);
  const leverRef = useRef<HTMLButtonElement>(null);
  const binRef = useRef<HTMLButtonElement>(null);
  const binBoxRef = useRef<HTMLSpanElement>(null);
  const ballRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const nextBallRef = useRef<HTMLButtonElement | null>(null);
  const paperRef = useRef<HTMLButtonElement>(null);
  const draftBtnRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<Drag | null>(null);
  const dragEnd = useRef(0);
  const titled = useRef(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // lukisan & foto yang dipakai belakangan disiapkan lebih dulu
  useEffect(() => {
    [...LATER_ART.map((n) => `/art/${n}.webp`), ...drafts.map((d) => d.photo)].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [drafts]);

  /** 1 em dunia dalam px layar */
  const emPx = () => (worldRef.current?.getBoundingClientRect().width ?? 390) / WORLD_W;
  const ms = (v: number, fast = 0.2) => (reduce.current ? Math.round(v * fast) : v);

  // fokus mengikuti langkah yang aktif (pengguna papan ketik / pembaca layar)
  const firstBall = gone.length ? gone.findIndex((g, i) => i < N && !g) : 0;
  useEffect(() => {
    if (mode === 'preview') return;
    const el =
      open !== null
        ? draftBtnRef.current
        : phase === 'dark'
          ? lampRef.current
          : phase === 'feed'
            ? stackRef.current
            : phase === 'type'
              ? typeRef.current
              : phase === 'bell'
                ? leverRef.current
                : phase === 'bin'
                  ? ballRefs.current[Math.max(0, firstBall)] ?? binRef.current
                  : phase === 'pull'
                    ? paperRef.current
                    : null;
    if (!el) return;
    const id = setTimeout(() => el.focus({ preventScroll: true }), 500);
    return () => clearTimeout(id);
  }, [phase, open, mode, firstBall, ready]);

  /** seret searah tertentu sampai penuh, atau cukup ketuk (ketukan lewat onClick) */
  const dragProps = (c: DragCfg) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.button > 0 || !c.on) return;
      drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* pointer sudah tidak aktif */
      }
    },
    onPointerMove: (e: ReactPointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId || !c.on) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;
      if (Math.hypot(dx, dy) > 8) d.moved = true;
      if (!d.moved) return;
      const p = clamp01(c.proj(dx, dy) / (c.dist * emPx()));
      c.set(p);
      if (p >= 1) {
        drag.current = null;
        dragEnd.current = performance.now();
        c.done();
      }
    },
    onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      if (!d.moved) return;
      dragEnd.current = performance.now();
      c.set(0);
      if (c.on && c.value > 0.45) c.done();
    },
    onPointerCancel: () => {
      drag.current = null;
      c.set(0);
    },
    onClick: () => {
      // klik yang menyusul sebuah seretan bukan ketukan
      if (performance.now() - dragEnd.current < 450) return;
      if (c.on) c.tap();
    },
  });

  /* ── 1. lampu ── */
  const lightUp = () => {
    if (lampOn || phase !== 'dark') return;
    setLampOn(true);
    setChain(0);
    setTug((v) => v + 1);
    sfx.tug();
    later(() => sfx.pop(), 120);
    haptic(18);
    later(() => setPhase('feed'), ms(2200, 0.3));
  };

  /* ── 2. kertas ── */
  const feed = () => {
    if (fed || phase !== 'feed') return;
    setFed(true);
    setSheet(0);
    sfx.rustle();
    haptic(12);
    // gerigi rol berputar: tik-tik-tik
    [520, 640, 760, 880, 1000].forEach((d, i) => later(() => (i % 2 ? sfx.tap() : sfx.crack()), ms(d)));
    later(() => setPhase('type'), ms(1700, 0.2));
  };

  /* ── 3. mengetik salam ── */
  /** satu pukulan: tuts turun, batang huruf naik ke rol, bunyi tak */
  const strike = (key: number, isSpace = false) => {
    if (isSpace) {
      setSpace(true);
      later(() => setSpace(false), 110);
      sfx.tap();
      return;
    }
    setPress(key);
    later(() => setPress((p) => (p === key ? null : p)), 120);
    setBar((b) => ({ k: (b?.k ?? 0) + 1, slot: slotOf(key) }));
    sfx.crack();
  };
  const tapKeys = (e: { clientX: number; clientY: number; detail: number }) => {
    if (phase !== 'type' || sGoal >= salam.length) return;
    const per = Math.max(2, Math.ceil(salam.length / 5));
    const goal = Math.min(salam.length, sGoal + per);
    setSGoal(goal);
    haptic(8);
    // tuts yang paling dekat dengan jari ikut turun
    const box = bodyRef.current?.getBoundingClientRect();
    if (box && e.detail > 0) {
      const x = ((e.clientX - box.left) / box.width) * BODY.w;
      const y = ((e.clientY - box.top) / box.height) * BODY.h;
      let best = 0;
      KEYS.forEach(([kx, ky], i) => {
        if (Math.hypot(kx - x, ky - y) < Math.hypot(KEYS[best][0] - x, KEYS[best][1] - y)) best = i;
      });
      setPress(best);
      later(() => setPress((p) => (p === best ? null : p)), 140);
    }
    if (reduce.current) {
      setSN(goal);
      strike(keyFor(goal));
    }
  };
  useEffect(() => {
    if (phase !== 'type' || reduce.current || sN >= sGoal) return;
    const id = setTimeout(() => {
      const ch = salam[sN].ch;
      strike(keyFor(sN), ch === ' ');
      setSN((v) => v + 1);
    }, sN === 0 ? 30 : 68);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sN, sGoal]);
  // ujung baris: ting!
  useEffect(() => {
    if (phase !== 'type' || sN < salam.length) return;
    const id = setTimeout(() => {
      setPhase('bell');
      setRang((v) => v + 1);
      sfx.note(7);
      haptic(16);
    }, ms(420));
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sN, salam.length]);

  /* ── 4. tuas: pindah baris ── */
  const ret = () => {
    if (returned || phase !== 'bell') return;
    setReturned(true);
    setPushed(true);
    setLever(0);
    sfx.whoosh();
    haptic(20);
    later(() => sfx.crack(), ms(380));
    later(() => sfx.tap(), ms(520));
    later(() => setPushed(false), ms(700));
    later(() => {
      setGone(Array.from({ length: N }, () => false));
      setPhase('bin');
    }, ms(2300, 0.25));
  };

  /* ── 5. keranjang: draf-draf yang gagal ── */
  const center = (el: Element | null | undefined) => {
    const w = wrapRef.current?.getBoundingClientRect();
    const r = el?.getBoundingClientRect();
    if (!w || !r) return [0, 0];
    return [r.left + r.width / 2 - (w.left + w.width / 2), r.top + r.height / 2 - (w.top + w.height / 2)];
  };
  const openBall = (i: number) => {
    if (phase !== 'bin' || open !== null || read >= N || gone[i]) return;
    const [fx, fy] = center(ballRefs.current[i]);
    const [tx, ty] = center(binBoxRef.current);
    setFly({ fx, fy, tx, ty: ty - 20 });
    setGone((g) => g.map((v, j) => v || j === i));
    setOpen(read);
    sfx.rustle();
    haptic(12);
  };
  const openNext = () => {
    const i = gone.findIndex((g, j) => j < N && !g);
    if (i >= 0) openBall(i);
  };
  const closeDraft = () => {
    if (open === null || closing) return;
    setClosing(true);
    sfx.rustle();
    later(() => sfx.whoosh(), ms(180));
    const r = read + 1;
    later(() => {
      setOpen(null);
      setClosing(false);
      setRead(r);
      setBinHop((v) => v + 1);
      sfx.bonk();
      haptic(10);
      if (r >= N) later(() => startTitle(), ms(1700, 0.2));
    }, ms(560, 0.3));
  };

  /* ── 6. kalimat yang akhirnya diketik ── */
  const startTitle = () => {
    setPhase('title');
    later(() => setTyping(true), ms(1300, 0.2));
  };
  const typedT = useMemo(() => {
    let n = 0;
    for (let i = 0; i < opI; i++) {
      const op = tape.ops[i];
      if (op.k === 'type') n = op.g + 1;
    }
    return n;
  }, [opI, tape]);
  const struck = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < opI; i++) {
      const op = tape.ops[i];
      if (op.k === 'x') set.add(op.g);
    }
    return set;
  }, [opI, tape]);
  const oopsAt = tape.ops.findIndex((o) => o.k === 'wait' && o.tag === 'oops');
  const fixAt = tape.ops.findIndex((o) => o.k === 'wait' && o.tag === 'fix');
  const oops = oopsAt >= 0 && opI > oopsAt && opI < fixAt + 6;
  const titleDone = typing && opI >= tape.ops.length;

  useEffect(() => {
    if (!typing || opI >= tape.ops.length) return;
    if (reduce.current) {
      const id = setTimeout(() => {
        strike(keyFor(0));
        setOpI(tape.ops.length);
      }, 300);
      return () => clearTimeout(id);
    }
    const op = tape.ops[opI];
    const ch = op.k === 'wait' ? '' : tape.glyphs[op.g].ch;
    const d = op.k === 'wait' ? op.ms : op.k === 'x' ? 130 : ch === ' ' ? 60 : PUNCT.test(tape.glyphs[Math.max(0, op.g - 1)].ch) ? 200 : 74 + (op.g % 3) * 16;
    const id = setTimeout(() => {
      if (op.k === 'wait') {
        if (op.tag === 'oops') {
          sfx.bonk();
          haptic(14);
        }
      } else strike(keyFor(op.g + 11), ch === ' ');
      setOpI((v) => v + 1);
    }, d);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typing, opI, tape]);
  const skipTitle = () => {
    if (!typing || titleDone) return;
    strike(keyFor(opI));
    setOpI(tape.ops.length);
  };
  // momen puncak: ting, lampu makin hangat, tuts bergelombang, kelopak turun; lalu ada draf yang mengintip
  useEffect(() => {
    if (!titleDone || titled.current) return;
    titled.current = true;
    const d = reduce.current ? 0.3 : 1;
    later(() => {
      setWow(true);
      setRang((v) => v + 1);
      sfx.note(7);
      later(() => sfx.success(), 260);
      haptic(26);
    }, 450 * d);
    later(() => {
      setPeek(true);
      sfx.squeak();
    }, 4400 * d);
    later(() => {
      setPhase('game');
      setGame('on');
    }, 6300 * d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleDone]);

  /* ── 7. game selesai → kertas ditarik ── */
  const gameDone = () => {
    setGame('done');
    setPeek(false);
    setPhase('pull');
    sfx.chime();
  };
  const pullOut = () => {
    if (pulled || phase !== 'pull') return;
    setPulled(true);
    setPullP(0);
    sfx.rustle();
    haptic(22);
    [90, 190, 290].forEach((v) => later(() => sfx.tap(), v));
    later(() => sfx.whoosh(), ms(420));
    later(() => {
      sfx.success();
      setBurst((v) => v + 1);
    }, ms(800));
    later(() => setFinale(true), ms(1900, 0.3));
  };

  // kertas naik mengikuti baris yang sudah terketik (baris terakhir selalu tepat di atas rol)
  const measure = () => {
    const el = textRef.current;
    if (!el) return;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
    setLift(Math.max(0, el.offsetHeight - lh));
  };
  useLayoutEffect(measure, [sN, typedT, returned, opI]);
  // ukuran layar (mis. pratinjau editor) berubah: hitung ulang
  useEffect(() => {
    const el = textRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── tampilan ── */
  const playing = game === 'on';
  const lineDone = sN >= salam.length;
  /** kereta bergeser ke kiri selagi mengetik, kembali ke kanan saat tuas didorong */
  const carriageX = !returned ? 1 - 2 * (sN / Math.max(1, salam.length)) : phase === 'title' || phase === 'game' || phase === 'pull' ? 1 - 2 * (typedT / Math.max(1, tape.glyphs.length)) : 1;
  const paperDown = fed ? 0 : 12.5;
  const pullEm = pulled ? 46 : pullP * 5;

  let cap = '';
  if (phase === 'dark') cap = lampOn ? t.capLit : t.capDark;
  else if (phase === 'feed') cap = fed ? t.capFed : t.capFeed;
  else if (phase === 'type') cap = t.capType;
  else if (phase === 'bell') cap = returned ? t.capReturned : t.capBell;
  else if (phase === 'bin') cap = read >= N ? t.capBinDone : read === 0 ? t.capBin : N - read === 1 ? t.capBinLast : fmt(t.capBinLeft, { n: N - read });
  else if (phase === 'title') cap = peek ? t.capPeek : titleDone ? t.capTitleDone : oops ? t.capOops : t.capTitle;
  else if (phase === 'pull') cap = pulled ? t.capPulled : from ? fmt(t.capPull, { from }) : t.capPullAnon;
  const eyebrow = `${t.clock[CLOCK[phase]]} · ${from ? fmt(t.desk, { from }) : t.deskAnon}`;

  const dr = open !== null ? drafts[open] : null;

  return (
    <div
      ref={wrapRef}
      className={cx(s.wrap, s[`p_${phase}`], ready && s.ready, lampOn && s.lit, wow && s.wow, wow && !peek && phase === 'title' && s.zoom, finale && s.over, playing && s.gaming)}
    >
      <div ref={worldRef} className={s.world}>
        {/* lampu meja: mati, lalu menyala (lukisan kembar yang dipudarkan) */}
        <Sprite name="mesintik-lampu" className={s.lamp} />
        <Sprite name="mesintik-lampu-nyala" className={cx(s.lamp, s.lampLit)} />
        <span key={tug} className={cx(s.chain, tug > 0 && s.chainTug)} style={{ scale: `1 ${(1 + chain * 0.32).toFixed(3)}` }} aria-hidden>
          <Sprite name="mesintik-rantai" className={s.chainArt} />
        </span>

        {/* kereta: kertas, rol, tuas; bergeser bersama */}
        <div className={s.carriage} style={{ transform: `translateX(${carriageX.toFixed(3)}em)` }}>
          {/* kertas hanya terlihat di atas rol: bagian bawahnya selalu tersembunyi di baliknya */}
          <div className={s.paperClip}>
            <div
              className={cx(s.paper, fed && s.fed, pulled && s.pulled, pullP > 0 && s.dragging)}
              style={{ transform: `translateY(calc(${paperDown - pullEm}em - ${lift.toFixed(1)}px))` }}
              aria-hidden={!fed}
            >
              <div className={s.textPos}>
                <div ref={textRef} className={s.text}>
                  <p className={s.line}>
                    <Typed glyphs={salam} n={sN} />
                  </p>
                  {returned ? (
                    <>
                      <p className={s.line} aria-hidden />
                      <p className={cx(s.line, s.red)} aria-label={typedT ? title : undefined}>
                        <Typed glyphs={tape.glyphs} n={typedT} struck={struck} />
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <Sprite name="mesintik-kereta" className={s.carriageArt} />
          <span className={cx(s.lever, pushed && s.leverPush)} style={{ rotate: `${(lever * 30).toFixed(1)}deg` }} aria-hidden>
            <Sprite name="mesintik-tuas" className={s.leverArt} />
          </span>
        </div>

        {/* badan mesin tik + tuts yang bisa ditekan + batang huruf */}
        <div ref={bodyRef} className={s.body}>
          <Sprite name="mesintik-badan" className={s.bodyArt} />
          {KEYS.map(([x, y], i) => (
            <Sprite
              key={i}
              name="mesintik-tuts"
              className={cx(s.key, press === i && s.down)}
              style={{ left: `${((x - 26) / BODY.w) * 100}%`, top: `${((y - 25) / BODY.h) * 100}%`, '--i': Math.round((x - 96) / 26) } as CSSProperties}
            />
          ))}
          <Sprite name="mesintik-spasi" className={cx(s.spacebar, space && s.down)} />
          {bar ? <span key={bar.k} className={s.typebar} style={barStyle(bar.slot)} aria-hidden /> : null}
        </div>

        {/* lembar teratas tumpukan kertas: dimasukkan ke rol */}
        {phase === 'dark' || phase === 'feed' ? (
          <span className={cx(s.sheet, fed && s.sheetGo, sheet > 0 && s.dragging)} style={{ '--sp': sheet } as CSSProperties} aria-hidden />
        ) : null}

        {/* keranjang + bola-bola draf */}
        <span ref={binBoxRef} key={`bin${binHop}`} className={cx(s.bin, binHop > 0 && s.binHop)} aria-hidden>
          <Sprite name="mesintik-keranjang" className={s.binArt} />
        </span>
        {BALLS.slice(0, N).map(([x, y], i) =>
          gone[i] ? null : (
            <button
              key={i}
              ref={(el) => {
                ballRefs.current[i] = el;
                if (i === Math.max(0, firstBall)) nextBallRef.current = el;
              }}
              type="button"
              className={cx(s.ball, phase === 'bin' && open === null && s.ballLive)}
              style={{ left: `${(x - 55) / 32}em`, top: `${(y - 50) / 32}em`, '--i': i } as CSSProperties}
              onClick={() => openBall(i)}
              disabled={phase !== 'bin' || open !== null}
              tabIndex={phase === 'bin' ? 0 : -1}
              aria-hidden={phase !== 'bin'}
              aria-label={fmt(t.ballLabel, { i: i + 1 })}
            >
              <Sprite name={i % 2 ? 'mesintik-bola-2' : 'mesintik-bola'} className={s.ballArt} />
            </button>
          ),
        )}
        {peek && !playing ? (
          <span className={s.peek} style={{ left: `${BIN_MOUTH[0] / 32}em`, top: `${BIN_MOUTH[1] / 32}em` }} aria-hidden>
            <Ball mood="cheeky" />
          </span>
        ) : null}

        {/* cahaya: malam gelap → lampu menyala (kerucut cahaya, genangan hangat, pendar bohlam) */}
        <div className={s.night} aria-hidden />
        <div className={s.dim} aria-hidden />
        <div className={s.coneBox} aria-hidden>
          <div className={s.cone} />
        </div>
        <div className={s.pool} aria-hidden />
        <div className={s.bulb} aria-hidden />
        <span className={s.glint} aria-hidden />
        <span className={s.motes} aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
        {rang ? (
          <span key={`ting${rang}`} className={s.ting} aria-hidden>
            {t.ding}
          </span>
        ) : null}
        {tug ? (
          <span key={`klik${tug}`} className={s.klik} aria-hidden>
            {t.click}
          </span>
        ) : null}
        {wow ? (
          <div className={s.petalsBox} aria-hidden>
            <Petals kinds={['putih', 'pink']} count={9} />
          </div>
        ) : null}

        {/* bidang sentuh tiap langkah */}
        {phase === 'dark' && ready && !lampOn ? (
          <button
            ref={lampRef}
            type="button"
            className={cx(s.hit, s.hitLamp)}
            aria-label={t.lampLabel}
            {...dragProps({ on: true, proj: (_dx, dy) => dy, dist: 2.6, value: chain, set: setChain, done: lightUp, tap: lightUp })}
          />
        ) : null}
        {phase === 'feed' && !fed ? (
          <>
            <button
              ref={stackRef}
              type="button"
              className={cx(s.hit, s.hitStack)}
              aria-label={t.feedLabel}
              {...dragProps({ on: true, proj: (_dx, dy) => -dy, dist: 4.2, value: sheet, set: setSheet, done: feed, tap: feed })}
            />
            {/* rolnya sendiri juga boleh diketuk */}
            <div className={cx(s.hit, s.hitPlaten)} onClick={feed} aria-hidden />
          </>
        ) : null}
        {phase === 'type' && !lineDone ? (
          <button ref={typeRef} type="button" className={cx(s.hit, s.hitType)} aria-label={t.typeLabel} onClick={tapKeys} />
        ) : null}
        {phase === 'bell' && !returned ? (
          <button
            ref={leverRef}
            type="button"
            className={cx(s.hit, s.hitLever)}
            aria-label={t.leverLabel}
            {...dragProps({ on: true, proj: (dx) => dx, dist: 2.8, value: lever, set: setLever, done: ret, tap: ret })}
          />
        ) : null}
        {phase === 'bin' && open === null && read < N ? (
          <button ref={binRef} type="button" className={cx(s.hit, s.hitBin)} aria-label={t.binLabel} onClick={openNext} />
        ) : null}
        {phase === 'title' && typing && !titleDone ? <button type="button" className={cx(s.hit, s.hitSkip)} aria-label={t.skipType} onClick={skipTitle} /> : null}
        {phase === 'pull' && !pulled ? (
          <button
            ref={paperRef}
            type="button"
            className={cx(s.hit, s.hitPaper)}
            aria-label={t.pullLabel}
            {...dragProps({ on: true, proj: (_dx, dy) => -dy, dist: 4.6, value: pullP, set: setPullP, done: pullOut, tap: pullOut })}
          />
        ) : null}
      </div>

      {/* jam & keterangan di atas */}
      {!finale && !playing && open === null && cap ? (
        <div key={cap} className={s.head} role="status">
          <span className={s.eyebrow}>{eyebrow}</span>
          <p className={cx(s.cap, cap.length > 44 && s.capLong)}>{cap}</p>
        </div>
      ) : null}

      {/* draf yang dibuka: kertas kusut, catatan, foto berklip, coretan pensil merah */}
      {dr && open !== null ? (
        <div
          className={cx(s.draftLayer, closing && s.closing)}
          style={{ '--fx': `${fly.fx}px`, '--fy': `${fly.fy}px`, '--tx': `${fly.tx}px`, '--ty': `${fly.ty}px` } as CSSProperties}
        >
          <button type="button" className={s.draftScrim} onClick={closeDraft} aria-label={t.draftClose} tabIndex={-1} />
          <div className={s.draft} role="dialog" aria-label={fmt(t.draftNo, { i: open + 1, n: N })}>
            <Sprite name="mesintik-kusut" className={s.draftArt} />
            <div className={cx(s.draftBody, dr.photo && s.withPhoto)} onClick={closeDraft}>
              <div className={s.draftHead}>
                <span>{fmt(t.draftNo, { i: open + 1, n: N })}</span>
                <em>{t.draftTimes[open % t.draftTimes.length]}</em>
              </div>
              {dr.photo ? (
                <figure className={s.clipped}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dr.photo} alt={fmt(t.photoAlt, { i: open + 1 })} draggable={false} className={s.photo} />
                  <Sprite name="mesintik-klip" className={s.clip} />
                </figure>
              ) : null}
              {dr.photo ? null : <span className={s.stain} aria-hidden />}
              {dr.note ? <p className={cx(s.draftText, !dr.photo && s.big, dr.note.length > 48 && s.long)}>{dr.note}</p> : null}
              <span className={s.verdict}>
                {open === N - 1 ? t.verdictLast : t.verdicts[open % t.verdicts.length]}
                <svg viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden>
                  <path d="M3,9C26,5 52,4 78,6S108,9 117,4" />
                </svg>
              </span>
              <button
                ref={draftBtnRef}
                type="button"
                className={s.draftBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  closeDraft();
                }}
              >
                {open + 1 >= N ? t.crumpleLast : t.crumple}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === 'dark' && ready && !lampOn ? <Hint key="hLamp">{t.hintLamp}</Hint> : null}
      {phase === 'feed' && !fed ? <Hint key="hFeed">{t.hintFeed}</Hint> : null}
      {phase === 'type' && !lineDone ? <Hint key="hType">{t.hintType}</Hint> : null}
      {phase === 'bell' && !returned ? <Hint key="hLever">{t.hintLever}</Hint> : null}
      {phase === 'bin' && open === null && read === 0 ? <Hint key="hBall">{t.hintBall}</Hint> : null}
      {phase === 'pull' && !pulled ? <Hint key="hPull">{t.hintPull}</Hint> : null}

      {finale || playing || open !== null ? null : phase === 'dark' ? (
        ready && !lampOn ? <TapCue key="cueLamp" target={lampRef} kind="drag" dir={{ x: 0, y: 2.6 }} at={{ x: 0.36, y: 0.62 }} delay={2200} /> : null
      ) : phase === 'feed' ? (
        !fed ? <TapCue key="cueFeed" target={stackRef} kind="drag" dir={{ x: 0.6, y: -3.4 }} at={{ x: 0.5, y: 0.5 }} delay={2200} /> : null
      ) : phase === 'type' ? (
        !lineDone ? <TapCue key="cueType" target={typeRef} at={{ x: 0.5, y: 0.62 }} delay={2200} /> : null
      ) : phase === 'bell' ? (
        !returned ? <TapCue key="cueLever" target={leverRef} kind="drag" dir={{ x: 2.4, y: 0.4 }} at={{ x: 0.5, y: 0.3 }} delay={2000} /> : null
      ) : phase === 'bin' ? (
        read < N && firstBall >= 0 ? (
          <TapCue key={`cueBall${read}`} target={nextBallRef} delay={read === 0 ? 2000 : 4200} />
        ) : null
      ) : phase === 'pull' ? (
        !pulled ? <TapCue key="cuePull" target={paperRef} kind="drag" dir={{ x: 0, y: -3.4 }} at={{ x: 0.5, y: 0.5 }} delay={2400} /> : null
      ) : null}

      <Confetti burst={burst} count={80} origin={{ x: 0.5, y: 0.34 }} colors={['#e2a93b', '#fff3da', '#b3261e', '#ffd98a', '#f6ecd9', '#9dc0a3']} />

      {playing ? <BallGame t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja"
          theme={{
            bg: `linear-gradient(180deg, rgba(10, 18, 26, 0.76), rgba(18, 28, 36, 0.5) 46%, rgba(34, 20, 10, 0.55)), url(${BACKDROP})`,
            ink: '#f6ecd9',
            paper: '#fffaf0',
            paperInk: '#2b2622',
          }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
