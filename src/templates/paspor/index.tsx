'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { parseDate } from '../anniversary/date';
import { KoperGame } from './Game';
import { LOCALE_TAG, TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-paspor.webp';
const ART = ['bg-paspor', 'paspor-sampul', 'paspor-halaman', 'paspor-foto'];
/** warna tinta cap, bergantian per halaman; cap terakhir selalu emas */
const INKS = ['#8c2a2f', '#2b4c86', '#2f6b4f', '#6b3f8a'];
const MAX_STAMPS = 5;
/** jarak geser (px) sampai ujung tiket tersobek */
const TEAR_AT = 44;

/**
 * closed → paspor tertutup di atas meja berpeta; diketuk / digeser untuk membuka
 * id     → halaman identitas: pas foto, nama, tanggal terbit, baris kode
 * visa   → satu halaman per catatan: ditekan (boleh ditahan) untuk mengecap, lalu dibalik
 * pocket → halaman terakhir: boarding pass menyembul dari kantong sampul belakang
 * pass   → boarding pass keluar ke tengah; ujungnya disobek (geser atau ketuk)
 * torn   → tiket tersobek → mini-game koper
 * letter → tiketnya dibalik: ada surat di baliknya → Finale
 */
type Phase = 'closed' | 'id' | 'visa' | 'pocket' | 'pass' | 'torn' | 'letter';
type Leaf = { kind: 'cover' } | { kind: 'id' } | { kind: 'visa'; i: number };
/** satu halaman cap: catatan dan fotonya berpasangan menurut nomor urut di editor */
type StampPage = { note: string; photo: string | null };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** huruf A–Z saja (untuk baris kode & kode tiga huruf) */
const letters = (v: string) =>
  v
    .normalize('NFKD')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .trim();
const code = (v: string) => letters(v).replace(/ /g, '').slice(0, 3);
const fill = (v: string, n: number) => (v + '<'.repeat(n)).slice(0, n);
const initial = (name: string) => Array.from(name.trim())[0]?.toUpperCase() ?? '';

/** kelopak kamboja (tanda floa): pangkal di (0,0) */
const PETAL = 'M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z';
function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-22 -22 44 44" aria-hidden>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={PETAL} transform={`rotate(${a})`} />
      ))}
    </svg>
  );
}

const PLANE = 'M21.5 3.2c-1-1-2.9-.6-4.4.9l-3 3L4 4.6 2.6 6l8 4.6-3.3 3.4-2.6-.4L3.4 15l3.4 1.9L8.7 20.3l1.3-1.3-.4-2.6 3.4-3.3 4.6 8 1.4-1.4-2.5-10.1 3-3c1.5-1.5 1.9-3.4 2-3.4Z';
function Plane() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d={PLANE} />
    </svg>
  );
}

/** garis pengaman halus di halaman identitas: gelombang yang saling menyilang + roset */
function Guilloche() {
  const { waves, rose } = useMemo(() => {
    const waves: string[] = [];
    for (let k = 0; k < 17; k++) {
      let d = '';
      for (let x = 0; x <= 420; x += 7) {
        const u = x / 420;
        const y = 92 + k * 25 + Math.sin(u * Math.PI * 6 + k * 0.7) * 9 + Math.sin(u * Math.PI * 2 + k * 0.35) * 13;
        d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)}`;
      }
      waves.push(d);
    }
    const rose = Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return [330 + Math.cos(a) * 22, 438 + Math.sin(a) * 22] as const;
    });
    return { waves, rose };
  }, []);
  return (
    <svg className={s.guilloche} viewBox="0 0 420 596" preserveAspectRatio="none" aria-hidden>
      {waves.map((d, i) => (
        <path key={i} d={d} className={i % 2 ? s.gA : s.gB} />
      ))}
      {rose.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="38" className={s.gA} />
      ))}
    </svg>
  );
}

export default function Paspor(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const locale = useLocale();
  const t = TEXT[locale];
  const tag = LOCALE_TAG[locale];
  const later = useTimers();
  const ready = useArtReady(ART);

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const title = data.title.trim();

  const { pages, idPhoto, issued, leaves } = useMemo(() => {
    // foto ke-i ikut cap ke-i: dipasangkan menurut nomor urut dulu, baru yang kosong dibuang,
    // supaya baris catatan yang dikosongkan tidak menggeser foto ke cap yang lain
    const pages: StampPage[] = [];
    for (let i = 0; i < MAX_STAMPS; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = data.photos[i] || null;
      if (note || photo) pages.push({ note, photo });
    }
    const leaves: Leaf[] = [{ kind: 'cover' }, { kind: 'id' }, ...pages.map((_, i) => ({ kind: 'visa' as const, i }))];
    // foto ke-1 juga jadi pas foto di halaman identitas
    return { pages, idPhoto: data.photos[0] || null, issued: parseDate(data.date), leaves };
  }, [data.notes, data.photos, data.date]);
  const n = pages.length;

  const [phase, setPhase] = useState<Phase>('closed');
  /** jumlah lembar yang sudah dibalik (0 = sampul masih menutup) */
  const [turned, setTurned] = useState(0);
  const [stamped, setStamped] = useState<boolean[]>(() => pages.map(() => false));
  /** stempel yang sedang ditekan di halaman `i`; `hit` = karetnya sudah menghentak kertas */
  const [press, setPress] = useState<{ i: number; hit: boolean } | null>(null);
  const [burst, setBurst] = useState(0);
  const [finale, setFinale] = useState(false);
  /** mini-game koper sebelum surat: off → main → selesai */
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');

  const coverRef = useRef<HTMLButtonElement>(null);
  const targetRef = useRef<HTMLButtonElement>(null);
  const stubRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const stubDrag = useRef<{ id: number; x: number; y: number } | null>(null);
  /** tekanan stempel yang sedang berjalan: `down` = jari masih menahan */
  const pressRef = useRef<{ i: number; down: boolean; hit: boolean } | null>(null);

  const vIdx = phase === 'visa' ? turned - 2 : -1;
  const isStamped = vIdx >= 0 && !!stamped[vIdx];
  const playing = game === 'on';

  // lukisan halaman terakhir, stempel, dan foto disiapkan lebih dulu
  useEffect(() => {
    if (phase !== 'id') return;
    ['/art/paspor-dalam.webp', '/art/paspor-kantong.webp', '/art/paspor-stempel.webp', '/art/paspor-tinta.webp', ...pages.map((p) => p.photo)].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [phase, pages]);

  // fokus mengikuti tombol lanjut (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview') return;
    const el = phase === 'visa' && !isStamped ? targetRef : phase === 'pass' ? stubRef : phase === 'closed' || phase === 'pocket' || phase === 'letter' ? null : ctaRef;
    if (!el) return;
    const id = setTimeout(() => el.current?.focus({ preventScroll: true }), 950);
    return () => clearTimeout(id);
  }, [phase, turned, isStamped, mode]);

  const page = () => {
    sfx.whoosh();
    haptic(10);
  };

  const open = () => {
    if (phase !== 'closed') return;
    sfx.rustle();
    haptic(16);
    setTurned(1);
    setPhase('id');
    later(() => sfx.chime(), reduced() ? 60 : 600);
  };

  const toPocket = () => {
    page();
    setTurned(leaves.length);
    setPhase('pocket');
    // boarding pass menyembul sebentar dari kantong, lalu keluar ke tengah
    later(
      () => {
        setPhase('pass');
        sfx.rustle();
        haptic(14);
      },
      reduced() ? 250 : 1700,
    );
  };

  const next = () => {
    if (phase === 'id') {
      if (!n) return toPocket();
      page();
      setTurned(2);
      setPhase('visa');
      return;
    }
    if (phase === 'visa' && isStamped) {
      if (vIdx + 1 >= n) return toPocket();
      page();
      setTurned((v) => v + 1);
    }
  };

  /* ── mengecap: stempel turun, menghentak, lalu terangkat begitu jari dilepas ── */
  const liftStamp = () => {
    const p = pressRef.current;
    if (!p || !p.hit) return;
    pressRef.current = null;
    setPress(null);
    setStamped((v) => v.map((x, k) => (k === p.i ? true : x)));
    if (p.i === n - 1 && n > 1) {
      // cap terakhir: emas, dengan sedikit perayaan
      later(() => {
        sfx.chime();
        haptic(20);
        setBurst((b) => b + 1);
      }, 220);
    } else sfx.note(p.i);
  };
  /** `held` = ditekan dengan jari (boleh ditahan); ketukan & papan ketik langsung selesai sendiri */
  const pressStamp = (i: number, held: boolean) => {
    if (phase !== 'visa' || i !== vIdx || stamped[i] || pressRef.current) return;
    const p = { i, down: held, hit: false };
    pressRef.current = p;
    setPress({ i, hit: false });
    sfx.tap();
    haptic(8);
    const quick = reduced();
    later(
      () => {
        if (pressRef.current !== p) return;
        p.hit = true;
        setPress({ i, hit: true });
        sfx.bonk();
        sfx.crack();
        haptic(30);
        // dilepas → terangkat; kalau terus ditahan, terangkat sendiri setelah sebentar
        later(() => pressRef.current === p && liftStamp(), p.down ? 1500 : quick ? 60 : 230);
      },
      quick ? 80 : 300,
    );
  };
  const releaseStamp = () => {
    const p = pressRef.current;
    if (!p || !p.down) return;
    p.down = false;
    if (p.hit) later(() => pressRef.current === p && liftStamp(), reduced() ? 40 : 130);
  };

  /* ── menyobek ujung boarding pass ── */
  const setPull = (v: number) => {
    const el = stubRef.current;
    if (!el) return;
    if (v > 0) {
      el.style.setProperty('--pull', v.toFixed(3));
      el.dataset.drag = '1';
    } else {
      el.style.removeProperty('--pull');
      delete el.dataset.drag;
    }
  };
  const tear = () => {
    if (phase !== 'pass') return;
    stubDrag.current = null;
    setPull(0);
    sfx.crack();
    later(() => sfx.rustle(), 60);
    haptic(24);
    setPhase('torn');
    later(() => sfx.chime(), reduced() ? 60 : 520);
  };

  const showLetter = () => {
    sfx.chime();
    haptic(15);
    setFinale(true);
  };
  const openLetter = () => {
    if (finale || playing) return;
    if (game === 'off') {
      sfx.pop();
      haptic(12);
      setGame('on');
      return;
    }
    showLetter();
  };
  /** selesai main (atau dilewati): tiketnya dibalik dulu, baru suratnya terbuka */
  const gameDone = () => {
    setGame('done');
    setPhase('letter');
    sfx.whoosh();
    haptic(12);
    later(showLetter, reduced() ? 300 : 1500);
  };

  /** ketukan di halaman yang sedang terbuka = langkah berikutnya */
  const tapPage = () => {
    if (swiped.current) return;
    if (phase === 'id') next();
    else if (phase === 'visa') {
      if (isStamped) next();
      else pressStamp(vIdx, false);
    }
  };

  // geser ke kiri di paspor = balik halaman (selalu bisa diganti ketuk)
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    swiped.current = false;
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = swipe.current;
    swipe.current = null;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (dx > -30 || Math.abs(dx) < Math.abs(e.clientY - d.y)) return;
    swiped.current = true;
    later(() => (swiped.current = false), 120);
    if (phase === 'closed') open();
    else next();
  };

  /* ── tampilan ── */
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(tag, { day: '2-digit', month: 'short', year: 'numeric' }), [tag]);
  const a = initial(data.to);
  const b = initial(from);
  const codeTo = code(data.to) || '♥';
  const codeFrom = code(from) || '♥';
  const { passNo, mrz } = useMemo(() => {
    const p2 = (v: number) => String(v).padStart(2, '0');
    const ymd = issued ? `${p2(issued.getFullYear() % 100)}${p2(issued.getMonth() + 1)}${p2(issued.getDate())}` : '';
    // tanpa tanggal: angka tetap yang diturunkan dari kedua nama
    let h = 7;
    for (const ch of data.to + from) h = (h * 31 + ch.charCodeAt(0)) % 900000;
    const passNo = `RB${issued ? `${p2(issued.getDate())}${p2(issued.getMonth() + 1)}${p2(issued.getFullYear() % 100)}` : String(100000 + h)}${code(data.to).slice(0, 1)}${code(from).slice(0, 1)}`;
    const l1 = fill(`P<RBD${letters(data.to).replace(/ /g, '<') || 'KAMU'}<<${letters(from).replace(/ /g, '<')}`, 32);
    const l2 = fill(`${passNo}<${ymd || '000000'}<${letters(TEXT[locale].validVal)}<FLOA`, 32);
    return { passNo, mrz: [l1, l2] };
  }, [issued, data.to, from, locale]);
  const dest = title || (from ? fmt(t.destFallback, { from }) : t.destFallbackAnon);
  const nationality = from ? fmt(t.nationalityOf, { from }) : t.nationalityAnon;
  const seatNext = from ? fmt(t.seatNext, { from }) : t.seatNextAnon;

  let head;
  if (phase === 'closed') {
    head = (
      <div key="names">
        <div className={cx(s.eyebrow, to.length > 14 && s.tight)}>{fmt(t.headFor, { to })}</div>
        {from ? <div className={cx(s.from, from.length > 14 && s.long)}>{fmt(t.headFrom, { from })}</div> : null}
      </div>
    );
  } else if (phase === 'id') {
    head = (
      <div key="id">
        <div className={s.eyebrow}>{t.idEyebrow}</div>
        <div className={s.sub}>{t.idSub}</div>
      </div>
    );
  } else if (phase === 'visa') {
    head = (
      <div key={`v${vIdx}`}>
        <div className={s.eyebrow}>{fmt(t.visaEyebrow, { i: vIdx + 1, n })}</div>
        {vIdx === n - 1 && n > 1 ? <div className={s.sub}>{t.lastSub}</div> : null}
      </div>
    );
  } else if (phase === 'pocket') {
    head = (
      <div key="pocket">
        <div className={s.eyebrow}>{t.pocketEyebrow}</div>
      </div>
    );
  } else if (phase === 'letter') {
    head = (
      <div key="letter">
        <div className={s.eyebrow}>{t.finale}</div>
      </div>
    );
  } else {
    head = (
      <div key={phase}>
        <div className={s.eyebrow}>{phase === 'torn' ? t.tornEyebrow : t.passEyebrow}</div>
        <div className={s.big}>{t.boardingPass}</div>
      </div>
    );
  }

  const cta = phase === 'id' ? (n ? t.toVisa : t.toLast) : phase === 'visa' && isStamped ? (vIdx + 1 < n ? t.nextPage : t.toLast) : phase === 'torn' ? t.openLetter : null;
  const onPrimary = () => (phase === 'torn' ? openLetter() : next());

  const idPage = (
    <div className={s.page} onClick={tapPage}>
      <Sprite name="paspor-halaman" className={s.art} />
      <Guilloche />
      <span className={cx(s.pageSheen, phase === 'id' && s.sheenRun)} aria-hidden />
      <div className={s.pHead}>
        <span>{t.issuer}</span>
        <b>{t.passport}</b>
      </div>
      <div className={s.idBody}>
        <div className={s.idTop}>
          <div className={s.idPhoto}>
            {idPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={idPhoto} alt={fmt(t.photoAlt, { to })} draggable={false} />
            ) : (
              <Sprite name="paspor-foto" className={s.art} />
            )}
            <span className={s.holo} aria-hidden />
          </div>
          <span className={s.seal} aria-hidden>
            <Mark />
          </span>
          <dl className={s.fields}>
            <div>
              <dt>{t.name}</dt>
              <dd className={cx(s.fName, to.length > 9 && s.long, to.length > 14 && s.xl)}>{to}</dd>
            </div>
            <div>
              <dt>{t.companion}</dt>
              <dd className={cx((from || t.companionNone).length > 12 && s.long)}>{from || t.companionNone}</dd>
            </div>
            <div>
              <dt>{t.issued}</dt>
              <dd className={s.long}>{issued ? dateFmt.format(issued) : t.issuedNone}</dd>
            </div>
          </dl>
        </div>
        <dl className={s.row}>
          <div>
            <dt>{t.nationality}</dt>
            <dd className={cx(s.fHand, nationality.length > 15 && s.long, nationality.length > 22 && s.xl)}>{nationality}</dd>
          </div>
          <div>
            <dt>{t.valid}</dt>
            <dd className={s.fHand}>{t.validVal}</dd>
          </div>
        </dl>
        <dl className={s.row}>
          <div>
            <dt>{t.number}</dt>
            <dd className={s.fMono}>{passNo}</dd>
          </div>
          <div>
            <dt>{t.signed}</dt>
            <dd className={cx(s.fSign, from.length > 8 && s.long, from.length > 14 && s.xl)}>{from || '♥'}</dd>
          </div>
        </dl>
      </div>
      <div className={s.mrz} aria-hidden>
        <span>{mrz[0]}</span>
        <span>{mrz[1]}</span>
      </div>
    </div>
  );

  const visaPage = (i: number) => {
    const { note, photo } = pages[i];
    const text = note || t.stampBlank;
    const last = i === n - 1 && n > 1;
    const done = !!stamped[i];
    const pressing = press?.i === i;
    const hit = pressing && press.hit;
    // catatan pendek di halaman genap boleh bercap lonjong; sisanya cap persegi supaya tulisannya muat
    const oval = i % 2 === 1 && text.length <= 30 && !last;
    return (
      <div className={cx(s.page, hit && s.thunk)} onClick={tapPage}>
        <Sprite name="paspor-halaman" className={s.art} />
        <div className={s.pHead}>
          <span>{t.visaHead}</span>
          <b>{fmt(t.visaPage, { i: i + 3 })}</b>
        </div>
        {photo ? (
          <span className={cx(s.snap, i % 2 === 1 && s.snapAlt)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={fmt(t.photoOf, { i: i + 1 })} draggable={false} />
            <Sprite name="scrapbook-klip" className={s.klip} />
          </span>
        ) : (
          <>
            <span className={s.watermark} aria-hidden>
              <Mark />
            </span>
            <svg className={s.trail} viewBox="0 0 304 92" aria-hidden>
              <path d="M22,74Q150,-14 282,50" strokeDasharray="7 7" />
              <circle cx="22" cy="74" r="8.5" />
              <circle className={s.dot} cx="22" cy="74" r="3.6" />
              <circle cx="282" cy="50" r="8.5" />
              <circle className={s.dot} cx="282" cy="50" r="3.6" />
              <path className={s.plane} d={PLANE} transform={i % 2 ? 'translate(110 32) rotate(29) scale(1.1) translate(-12 -12)' : 'translate(188 24) rotate(49) scale(1.1) translate(-12 -12)'} />
            </svg>
          </>
        )}
        <div className={cx(s.spot, !photo && s.spotMid)}>
          {last && done ? <span className={s.glow} aria-hidden /> : null}
          {done ? (
            <div
              className={cx(s.ink, oval && s.oval, last && s.gold, i % 2 === 1 && s.inkAlt)}
              style={{ color: last ? undefined : INKS[i % INKS.length] } as CSSProperties}
              role="img"
              aria-label={fmt(t.stamped, { i: i + 1, note: text })}
            >
              <span className={s.inkTop}>{last ? t.inkTopLast : t.inkTop}</span>
              <span className={cx(s.inkNote, text.length > 30 && s.long, text.length > 44 && s.xl)}>{text}</span>
              <span className={s.inkBot}>
                <Mark />
                {t.approved}
                {issued ? ` · ${issued.getFullYear()}` : ''}
              </span>
            </div>
          ) : (
            <button
              ref={i === vIdx ? targetRef : undefined}
              type="button"
              className={cx(s.target, pressing && s.targetPress)}
              onPointerDown={(e) => {
                if (e.button > 0) return;
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  /* pointer sudah tidak aktif */
                }
                pressStamp(i, true);
              }}
              onPointerUp={releaseStamp}
              onPointerCancel={releaseStamp}
              onLostPointerCapture={releaseStamp}
              onContextMenu={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                // papan ketik / pembaca layar (tanpa pointerdown): langsung mengecap
                if (e.detail === 0) pressStamp(i, false);
              }}
              tabIndex={i === vIdx ? 0 : -1}
              aria-label={fmt(t.stampLabel, { i: i + 1, note: text })}
            >
              <span>{t.stampHere}</span>
            </button>
          )}
          <span className={cx(s.tool, pressing && s.toolPress, hit && s.toolHit, done && s.toolLift)} aria-hidden>
            <Sprite name="paspor-stempel" className={s.art} />
          </span>
        </div>
      </div>
    );
  };

  const away = phase === 'pass' || phase === 'torn' || phase === 'letter';

  return (
    <div className={cx(s.wrap, ready && s.ready, playing && s.gaming)}>
      <div className={s.head}>{head}</div>

      <div className={cx(s.book, away && s.away)} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (swipe.current = null)}>
        {/* sisi dalam sampul belakang: kantong berisi boarding pass yang terselip */}
        <div className={s.base} aria-hidden>
          <Sprite name="paspor-dalam" className={s.art} />
          <span className={cx(s.tucked, phase === 'pocket' && s.peek, away && s.gone)}>
            <i />
            <b>{t.boardingPass}</b>
          </span>
          <Sprite name="paspor-kantong" className={s.art} />
        </div>
        {/* tebal halaman yang belum dibalik */}
        <span className={cx(s.pages, turned >= leaves.length && s.pagesGone)} aria-hidden />

        {leaves.map((lf, i) => {
          // yang dirender: dua lembar terakhir yang sudah dibalik, lembar yang terbuka, dan satu di bawahnya
          if (i < turned - 2 || i > turned + 1) return null;
          const isTurned = i < turned;
          return (
            <div key={i} className={cx(s.leaf, isTurned && s.turned)} style={{ zIndex: isTurned ? 30 + i : 20 - i }}>
              <div className={s.front} aria-hidden={isTurned || i !== turned}>
                {lf.kind === 'cover' ? (
                  <button ref={coverRef} type="button" className={s.cover} onClick={open} disabled={phase !== 'closed'} aria-label={fmt(t.openLabel, { to })}>
                    <Sprite name="paspor-sampul" className={s.art} />
                    <span className={s.cIssuer}>{t.issuer}</span>
                    <span className={cx(s.cTitle, t.passport.length === 7 && s.t7, t.passport.length > 7 && s.t8)}>{t.passport}</span>
                    <span className={s.cNames}>
                      {a || '♥'}
                      {b ? (
                        <>
                          <i>♥</i>
                          {b}
                        </>
                      ) : null}
                    </span>
                    <span className={s.sheen} aria-hidden />
                  </button>
                ) : lf.kind === 'id' ? (
                  idPage
                ) : (
                  visaPage(lf.i)
                )}
              </div>
              <div className={cx(s.back, lf.kind === 'cover' && s.backCover)} aria-hidden>
                {lf.kind === 'cover' ? null : <Sprite name="paspor-halaman" className={cx(s.art, s.mirror)} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* boarding pass: keluar dari kantong ke tengah layar */}
      {away ? (
        <div className={cx(s.pass, phase !== 'pass' && s.passTorn, phase === 'letter' && s.passFlip)} role="group" aria-label={t.boardingPass}>
          <div className={s.passCard}>
            <div className={s.passMain} aria-hidden={phase === 'letter'}>
              <div className={s.passBand}>
                <b>{t.boardingPass}</b>
                <span>
                  <Plane />
                  {t.airline}
                </span>
              </div>
              <div className={s.route}>
                <div className={s.port}>
                  <b>{codeFrom}</b>
                  <span>{from || t.me}</span>
                </div>
                <span className={s.fly} aria-hidden>
                  <Plane />
                </span>
                <div className={cx(s.port, s.portTo)}>
                  <b>{codeTo}</b>
                  <span>{to}</span>
                </div>
              </div>
              <dl className={s.passGrid}>
                <div className={s.wide}>
                  <dt>{t.destination}</dt>
                  <dd className={cx(s.dest, dest.length > 26 && s.long)}>{dest}</dd>
                </div>
                <div>
                  <dt>{t.boarding}</dt>
                  <dd>{t.now}</dd>
                </div>
                <div>
                  <dt>{t.gate}</dt>
                  <dd className={s.heart}>♥</dd>
                </div>
                <div>
                  <dt>{t.seat}</dt>
                  <dd>{t.seatNo}</dd>
                </div>
              </dl>
              {/* catatan tulisan tangan si pengirim di samping nomor kursi */}
              <p className={cx(s.seatNext, seatNext.length > 22 && s.long)}>
                {seatNext}
                <svg viewBox="0 0 24 18" aria-hidden>
                  <path d="M2,15C11,16 16,11 16,3M11,8L16,2.5L21,8" />
                </svg>
              </p>
            </div>
            {/* sisi belakang tiket: awal sebuah surat */}
            <div className={s.passBack} aria-hidden={phase !== 'letter'}>
              <span className={s.airmail} />
              <Mark className={s.backMark} />
              <b className={cx(to.length > 12 && s.long)}>{fmt(t.backFor, { to })}</b>
              <i />
              <i />
              <i />
            </div>
          </div>
          <button
            ref={stubRef}
            type="button"
            className={s.stub}
            disabled={phase !== 'pass'}
            aria-label={t.tearLabel}
            onClick={tear}
            onPointerDown={(e) => {
              if (e.button > 0 || phase !== 'pass') return;
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                /* pointer sudah tidak aktif */
              }
              stubDrag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
            }}
            onPointerMove={(e) => {
              const d = stubDrag.current;
              if (!d || d.id !== e.pointerId) return;
              const dist = Math.hypot(e.clientX - d.x, e.clientY - d.y);
              if (dist >= TEAR_AT) tear();
              else setPull(dist / TEAR_AT);
            }}
            onPointerUp={() => {
              stubDrag.current = null;
              setPull(0);
            }}
            onPointerCancel={() => {
              stubDrag.current = null;
              setPull(0);
            }}
          >
            <span className={s.stubCode}>
              {codeFrom}
              <i>→</i>
              {codeTo}
            </span>
            <span className={s.stubLine}>
              <em>{t.travelClass}</em>
              {t.classVal}
            </span>
            <span className={s.stubLine}>
              <em>{t.baggage}</em>
              {t.baggageVal}
            </span>
            <span className={s.barcode} aria-hidden />
            <span className={s.tearHere}>{t.tearHere}</span>
          </button>
        </div>
      ) : null}

      {!finale && !playing ? (
        <div className={s.foot}>
          {phase === 'torn' ? <p className={s.line}>{t.tornLine}</p> : null}
          {cta ? (
            <button key={`${phase}${turned}${isStamped}`} ref={ctaRef} type="button" className={s.cta} onClick={onPrimary}>
              {cta} <span aria-hidden>→</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === 'closed' && ready ? <Hint key="hOpen">{t.hintOpen}</Hint> : null}
      {phase === 'visa' && !isStamped && !press ? <Hint key={`hStamp${vIdx}`}>{t.hintStamp}</Hint> : null}
      {phase === 'pass' ? <Hint key="hTear">{t.hintTear}</Hint> : null}

      {finale || playing ? null : phase === 'closed' ? (
        ready ? <TapCue key="cueOpen" target={coverRef} at={{ x: 0.74, y: 0.62 }} delay={2200} /> : null
      ) : phase === 'visa' && !isStamped ? (
        !press ? <TapCue key={`cueStamp${vIdx}`} target={targetRef} kind="hold" delay={2400} /> : null
      ) : phase === 'pass' ? (
        <TapCue key="cueTear" target={stubRef} kind="drag" dir={{ x: 1.6, y: 2.2 }} delay={2600} at={{ x: 0.5, y: 0.45 }} />
      ) : cta ? (
        <TapCue key={`cueNext${phase}${turned}`} target={ctaRef} delay={phase === 'id' ? 5200 : 3400} />
      ) : null}

      <Confetti burst={burst} colors={['#d6a94a', '#f3d98e', '#8c2a2f', '#fffaf0', '#e5708a']} origin={{ x: 0.5, y: 0.5 }} count={70} />

      {playing ? <KoperGame t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{ bg: `url(${BACKDROP}) center bottom / cover no-repeat`, ink: meta.palette.ink, paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
