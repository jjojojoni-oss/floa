/** Hitungan tanggal untuk template Anniversary. Semua tanggal diperlakukan sebagai tanggal LOKAL (tengah malam). */

const DAY = 86_400_000;

/** 'YYYY-MM-DD' → tanggal lokal tengah malam; null kalau kosong / tidak valid. */
export function parseDate(v: string | undefined | null): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((v ?? '').trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** nomor hari kalender (tidak terpengaruh jam maupun pergantian DST) */
const dayNo = (d: Date) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);

/** selisih hari kalender b − a */
export const dayDiff = (a: Date, b: Date) => dayNo(b) - dayNo(a);

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** tanggal + n bulan; kalau tanggalnya tidak ada di bulan tujuan (31 → Feb), dipakai hari terakhir bulan itu */
function addMonths(d: Date, n: number) {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
}

export type Elapsed = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** total detik sejak tengah malam tanggal mulai */
  totalSeconds: number;
  /** hari keberapa: tanggal mulai = hari ke-1 */
  dayNumber: number;
  /** hari ini tepat ulang tahun tanggal itu (minimal setahun) */
  exact: boolean;
};

/** Waktu yang sudah berjalan dari `start` (tengah malam lokal) sampai `now`. `start` tidak boleh di masa depan. */
export function elapsed(start: Date, now: Date): Elapsed {
  const today = startOfDay(now);
  let total = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
  if (addMonths(start, total) > today) total -= 1;
  total = Math.max(0, total);
  const anchor = addMonths(start, total);
  const days = Math.max(0, dayDiff(anchor, today));
  const diff = Math.max(0, dayDiff(start, today));
  const sinceMidnight = Math.max(0, Math.floor((now.getTime() - today.getTime()) / 1000));
  return {
    years: Math.floor(total / 12),
    months: total % 12,
    days,
    hours: Math.floor(sinceMidnight / 3600),
    minutes: Math.floor((sinceMidnight % 3600) / 60),
    seconds: sinceMidnight % 60,
    totalSeconds: diff * 86_400 + sinceMidnight,
    dayNumber: diff + 1,
    exact: total >= 12 && total % 12 === 0 && days === 0,
  };
}

export type Milestone = { date: Date; kind: 'days' | 'years'; n: number };

/** angka hari yang biasa dirayakan pasangan (hari jadian = hari ke-1) */
const DAY_MARKS = [100, 500, 1000, 2000, 3000, 5000, 10000];
const MAX_MARKS = 6;

/**
 * Milestone yang sudah terlewati di antara tanggal mulai dan hari ini (tidak termasuk keduanya):
 * ulang tahun jadian dan hari ke-100/500/1000/…. Kalau terlalu banyak, yang dipilih ulang tahun
 * terdekat dulu, lalu hari-hari bulat; hasilnya urut tanggal.
 */
export function milestones(start: Date, today: Date): Milestone[] {
  const total = dayDiff(start, today);
  const all: (Milestone & { p: number })[] = [];
  for (let y = 1; y < 200; y++) {
    const d = addMonths(start, 12 * y);
    const at = dayDiff(start, d);
    if (at >= total) break;
    all.push({ date: d, kind: 'years', n: y, p: 3 + y / 1000 });
  }
  for (const n of DAY_MARKS) {
    const at = n - 1;
    if (at <= 0 || at >= total) continue;
    if (all.some((m) => dayDiff(start, m.date) === at)) continue;
    all.push({ date: addDays(start, at), kind: 'days', n, p: n >= 1000 ? 2 + n / 1e6 : 1 + n / 1e6 });
  }
  return all
    .sort((a, b) => b.p - a.p)
    .slice(0, MAX_MARKS)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ date, kind, n }) => ({ date, kind, n }));
}

/** Milestone yang jatuh tepat pada `day` (dipakai untuk lembar hari ini). */
export function milestoneOn(start: Date, day: Date): Milestone | null {
  const at = dayDiff(start, day);
  if (at <= 0) return null;
  const months = (day.getFullYear() - start.getFullYear()) * 12 + (day.getMonth() - start.getMonth());
  if (months > 0 && months % 12 === 0 && dayDiff(addMonths(start, months), day) === 0) return { date: day, kind: 'years', n: months / 12 };
  const n = at + 1;
  return DAY_MARKS.includes(n) ? { date: day, kind: 'days', n } : null;
}
