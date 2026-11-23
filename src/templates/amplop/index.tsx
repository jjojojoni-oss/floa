'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Finale, Hint, HoldButton, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { type AmplopText, TEXT } from './i18n';
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
/** sealed → broken → open → items (selipan ditarik satu per satu) → out (surat menyembul) */
type Phase = 'sealed' | 'broken' | 'open' | 'items' | 'out';

/** jenis selipan: foto kalau ada fotonya, selain itu bergiliran */
type Kind = 'foto' | 'tiket' | 'pres' | 'nota' | 'kartu';
const PLAIN: Kind[] = ['tiket', 'nota', 'pres', 'kartu'];
/** Kata kunci di cerita menentukan wujud selipan, supaya "nota bakso" memang jadi nota. */
const CUES: Array<[Kind, RegExp]> = [
  ['tiket', /\b(karcis|tiket|ticket|boarding)/i],
  ['nota', /\b(nota|struk|resit|receipt|kuitansi|kwitansi)\b/i],
  ['pres', /\b(bunga|kembang|melati|melur|mawar|kamboja|kenanga|anggrek|orkid|dahlia|aster|daun|flower|rose|jasmine|petal|daisy|taman|kebun|park|garden)/i],
  ['kartu', /\b(kartu|kad|card|postcard|resep|recipe)\b/i],
];
const FLOWERS: Array<[string, RegExp]> = [
  ['bunga-kamboja', /kamboja|frangipani|plumeria/i],
  ['bunga-melati', /melati|melur|jasmine/i],
  ['bunga-sepatu', /sepatu|bunga raya|hibiscus/i],
  ['bunga-dahlia', /dahlia|mawar|rose/i],
  ['bunga-aster', /aster|daisy/i],
  ['bunga-kenikir', /kenikir|cosmos/i],
  ['bunga-lila', /lila|lilac|lavender/i],
];

function guessKind(note: string): Kind | null {
  let best: Kind | null = null;
  let at = Infinity;
  for (const [kind, re] of CUES) {
    const m = re.exec(note);
    if (m && m.index < at) {
      best = kind;
      at = m.index;
    }
  }
  return best;
}

function flowerFor(note: string, i: number) {
  for (const [name, re] of FLOWERS) if (re.test(note)) return name;
  return i % 2 ? 'bunga-kamboja' : 'bunga-melati';
}
type Item = { note: string; photo: string | null; kind: Kind };

/** warna kertas & kemiringan tiap selipan (dipakai saat dibaca dan saat tergeletak di meja) */
const TILT = [-3, 2.5, -2, 3, -1.5];
const TICKET_TINT = ['#e9c46a', '#a7c4b5', '#e8a598', '#c9b6e4'];
/** tempat selipan yang sudah dibaca tergeletak di sekitar amplop */
const LAID: Array<{ x: string; y: string; r: number }> = [
  { x: '25%', y: '34%', r: -12 },
  { x: '75%', y: '30%', r: 10 },
  { x: '31%', y: '74%', r: 7 },
  { x: '69%', y: '72%', r: -8 },
  { x: '50%', y: '48%', r: 3 },
];

const TAPS_TO_BREAK = 3;

function buildItems(notes: string[], photos: string[]): Item[] {
  // kado lama (tanpa catatan) tetap memakai alur lama: langsung ke surat
  if (!notes.some((n) => n.trim())) return [];
  const raw: Array<{ note: string; photo: string | null; kind: Kind | null }> = [];
  for (let i = 0; i < 5; i++) {
    const note = (notes[i] ?? '').trim();
    const photo = photos[i] || null;
    if (!note && !photo) continue;
    raw.push({ note, photo, kind: photo ? 'foto' : guessKind(note) });
  }
  // tanpa petunjuk: wujud yang paling jarang muncul dan tidak sama dengan tetangganya
  raw.forEach((it, i) => {
    if (it.kind) return;
    const near = [raw[i - 1]?.kind, raw[i + 1]?.kind];
    const count = (k: Kind) => raw.filter((x) => x.kind === k).length;
    const pool = PLAIN.filter((k) => !near.includes(k));
    it.kind = (pool.length ? pool : PLAIN).reduce((a, b) => (count(b) < count(a) ? b : a));
  });
  return raw.map((it) => ({ note: it.note, photo: it.photo, kind: it.kind ?? 'kartu' }));
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const ready = useArtReady(ART);
  const [side, setSide] = useState<Side>('front');
  const [phase, setPhase] = useState<Phase>('sealed');
  const [hold, setHold] = useState(0);
  const [taps, setTaps] = useState(0);
  const [finale, setFinale] = useState(false);
  /** selipan yang sedang dipegang/akan ditarik */
  const [cur, setCur] = useState(0);
  /** true saat selipan `cur` sedang dibaca (sudah ditarik keluar) */
  const [reading, setReading] = useState(false);
  /** true sebentar saat selipan sedang diletakkan (animasi keluar) */
  const [leaving, setLeaving] = useState(false);
  const broke = useRef(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const frontRef = useRef<HTMLButtonElement>(null);
  const later = useTimers();
  const t = TEXT[useLocale()];

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const mono = from ? Array.from(from)[0].toUpperCase() : '';
  const items = buildItems(data.notes, data.photos.filter(Boolean));
  const n = items.length;
  // alur lama: dua foto mengintip dari amplop bersama surat
  const peekPhotos = n ? [] : data.photos.filter(Boolean).slice(0, 2);
  const showFront = side === 'front' || side === 'turnOut';
  const progress = Math.max(hold, taps / TAPS_TO_BREAK);
  const inItems = phase === 'items';
  const isLast = cur === n - 1;

  useEffect(() => {
    if (reading && !leaving) nextRef.current?.focus({ preventScroll: true });
  }, [reading, leaving]);

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
      setPhase(n ? 'items' : 'out');
      sfx.pop();
    }, 1250);
  };

  /* alternatif untuk yang tidak menahan: tiga ketukan juga mematahkan segel */
  const tapSeal = () => {
    if (broke.current) return;
    const k = taps + 1;
    setTaps(k);
    sfx.tap();
    haptic(8);
    if (k >= TAPS_TO_BREAK) breakSeal();
  };

  const pull = () => {
    if (!inItems || reading) return;
    setReading(true);
    if (isLast) later(() => sfx.chime(), 380);
    else sfx.whoosh();
    haptic(14);
  };

  const putDown = () => {
    if (!reading || leaving) return;
    setLeaving(true);
    sfx.tap();
    later(() => {
      setLeaving(false);
      setReading(false);
      if (cur + 1 >= n) {
        setCur(n);
        setPhase('out');
        later(() => sfx.pop(), 500);
      } else setCur((c) => c + 1);
    }, 420);
  };

  const openLetter = () => {
    if (phase !== 'out' || finale) return;
    sfx.chime();
    setFinale(true);
  };

  const opened = phase !== 'sealed';
  const laidCount = Math.min(cur, n);

  /* ── kepala ── */
  let head: { k: string; eyebrow: string; name: string } | null = null;
  if (showFront) head = null;
  else if (!opened) head = { k: 'b', eyebrow: t.sealed, name: fmt(t.onlyYou, { to }) };
  else if (inItems && isLast && !reading) head = { k: 'l', eyebrow: t.oneMore, name: t.mostSpecial };
  else if (inItems && reading && isLast) head = null; // tulisan merah "yang paling spesial" yang bicara
  else if (inItems && reading) head = { k: `r${cur}`, eyebrow: fmt(t.itemOf, { i: cur + 1, n }), name: '' };
  else if (inItems && cur === 0) head = { k: 'i0', eyebrow: fmt(t.inside, { n }), name: t.oneByOne };
  else if (inItems) head = { k: `p${cur}`, eyebrow: fmt(t.itemOf, { i: cur + 1, n }), name: t.pullNext };
  else if (phase === 'out' && n) head = { k: 'o', eyebrow: t.andLast, name: t.theLetter };
  else head = { k: 'c', eyebrow: t.broken, name: fmt(t.goRead, { to }) };

  return (
    <div className={cx(s.wrap, ready && s.ready, n > 0 && opened && phase !== 'broken' && s.withItems, reading && s.isReading)}>
      <div className={s.head}>
        {showFront ? (
          <div key="a">
            <div className={s.eyebrow}>{t.letterFrom}</div>
            <div className={cx(s.name, from.length > 12 && s.small)}>{from || t.someone}</div>
          </div>
        ) : head ? (
          <div key={head.k}>
            <div className={s.eyebrow}>{head.eyebrow}</div>
            {head.name ? <div className={cx(s.name, s.small)}>{head.name}</div> : null}
          </div>
        ) : null}
      </div>

      {/* selipan yang sudah dibaca, tergeletak di meja sekitar amplop */}
      {n ? (
        <div className={s.table} aria-hidden>
          {items.slice(0, laidCount).map((it, i) => (
            <div
              key={i}
              className={s.laid}
              style={{ '--x': LAID[i].x, '--y': LAID[i].y, '--r': `${LAID[i].r}deg` } as CSSProperties}
            >
              <Keepsake item={it} i={i} n={n} t={t} />
            </div>
          ))}
        </div>
      ) : null}

      <div className={s.mid}>
        <div className={s.env}>
          <div className={cx(s.bob, !opened && s.floaty)}>
            <div className={cx(s.flip, side === 'turnOut' && s.turnOut, side === 'turnIn' && s.turnIn)}>
              {showFront ? (
                <button ref={frontRef} type="button" className={s.front} onClick={flip} aria-label={t.flip}>
                  <Sprite name="amplop-muka" className={s.face} />
                  {from ? <span className={s.sender}>{fmt(t.from, { from })}</span> : null}
                  <span className={s.addr}>
                    <span className={s.addrLabel}>{t.addrTo}</span>
                    <span className={cx(s.addrName, to.length > 11 && s.small)}>{to}</span>
                  </span>
                </button>
              ) : null}
              {/* sisi segel sudah terpasang (tersembunyi) sejak awal, supaya lukisannya sudah siap
                  saat amplop dibalik dan tidak muncul lapis demi lapis */}
              <div
                className={cx(s.back, showFront && s.hidden, opened && phase !== 'broken' && s.open, phase === 'out' && s.out)}
                aria-hidden={showFront || undefined}
              >
                  <Sprite decoding="sync" name="amplop-belakang" className={cx(s.layer, s.inside)} />
                  {peekPhotos.map((src, i) => (
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
                  {/* selipan berikutnya mengintip dari mulut amplop */}
                  {inItems && cur < n ? (
                    <button
                      key={cur}
                      type="button"
                      className={cx(s.sticking, reading && s.pulled, s[`k_${items[cur].kind}`])}
                      style={{ '--tint': TICKET_TINT[cur % TICKET_TINT.length], '--img': items[cur].photo ? `url(${items[cur].photo})` : undefined } as CSSProperties}
                      onClick={pull}
                      tabIndex={reading ? -1 : 0}
                      aria-hidden={reading}
                      aria-label={fmt(t.pull, { i: cur + 1, n })}
                    >
                      <span className={s.stickTop} />
                    </button>
                  ) : null}
                  <Sprite decoding="sync" name="amplop-kantong" className={cx(s.layer, s.pocket)} />
                  <div className={s.flap}>
                    <Sprite decoding="sync" name="amplop-tutup" className={cx(s.layer, s.flapOut)} />
                    <Sprite decoding="sync" name="amplop-tutup-dalam" className={cx(s.layer, s.flapIn)} />
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
                          <Sprite decoding="sync" name="amplop-segel" className={s.sealImg} />
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
            </div>
          </div>
        </div>
      </div>

      {/* selipan yang sedang dibaca */}
      {inItems && reading && cur < n ? (
        <div key={cur} className={cx(s.reader, leaving && s.leaving)}>
          <div
            className={s.readerCard}
            style={{ '--r': `${TILT[cur % TILT.length]}deg` } as CSSProperties}
            role="group"
            aria-label={`${fmt(t.itemOf, { i: cur + 1, n })}: ${t.kinds[items[cur].kind]}`}
          >
            {isLast ? <span className={s.specialTag}>{t.specialTag}</span> : null}
            <Keepsake item={items[cur]} i={cur} n={n} t={t} />
          </div>
          <button ref={nextRef} type="button" className={cx(s.cta, s.ctaSoft)} onClick={putDown}>
            {isLast ? t.toLetter : t.next}
          </button>
        </div>
      ) : null}

      <div className={s.foot}>
        {phase === 'out' ? (
          <button type="button" className={s.cta} onClick={openLetter}>
            {t.cta}
          </button>
        ) : null}
      </div>

      {side === 'front' ? <Hint>{t.hintTap}</Hint> : null}
      <TapCue target={frontRef} show={side === 'front'} />
      {side === 'back' && phase === 'sealed' ? (
        <Hint key={taps > 0 ? 't' : 'h'}>
          {taps > 0 ? fmt(t.hintMore, { n: TAPS_TO_BREAK - taps }) : t.hintHold}
        </Hint>
      ) : null}
      {inItems && !reading && cur === 0 ? <Hint key="pull">{t.hintPull}</Hint> : null}

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

/* ───────────────────────── selipan ───────────────────────── */

/** Satu selipan: benda kertas yang berbeda-beda, membawa cerita pendek tulisan tangan. */
function Keepsake({ item, i, n, t }: { item: Item; i: number; n: number; t: AmplopText }) {
  const long = item.note.length > 64;
  const note = item.note ? <span className={cx(s.note, long && s.noteLong)}>{item.note}</span> : null;
  const num = String(i + 1).padStart(2, '0');
  void n;

  if (item.kind === 'foto') {
    return (
      <div className={cx(s.ks, s.polaroid)}>
        <Sprite name={`polaroid-selotip-${(i % 4) + 1}`} className={s.tape} />
        <span className={s.pic}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.photo!} alt="" draggable={false} />
        </span>
        {note}
      </div>
    );
  }
  if (item.kind === 'tiket') {
    return (
      <div className={cx(s.ks, s.ticket)} style={{ '--tint': TICKET_TINT[i % TICKET_TINT.length] } as CSSProperties}>
        <span className={s.tkHead}>
          <span>{t.ticket}</span>
          <span>{fmt(t.ticketNo, { n: num })}</span>
        </span>
        {note}
        <span className={s.tkFoot}>{t.ticketValid}</span>
      </div>
    );
  }
  if (item.kind === 'nota') {
    return (
      <div className={cx(s.ks, s.receipt)}>
        <span className={s.rcHead}>{t.receipt}</span>
        <span className={s.rcRule} />
        {note}
        <span className={s.rcRule} />
        <span className={s.rcFoot}>{t.receiptKept}</span>
      </div>
    );
  }
  if (item.kind === 'pres') {
    return (
      <div className={cx(s.ks, s.pressed)}>
        <span className={s.prFlower}>
          <Sprite name={flowerFor(item.note, i)} className={s.prImg} />
          <Sprite name="polaroid-selotip-3" className={s.prTape} />
        </span>
        {note}
      </div>
    );
  }
  return (
    <div className={cx(s.ks, s.card)}>
      <Sprite name="scrapbook-klip" className={s.clip} />
      {note}
    </div>
  );
}
