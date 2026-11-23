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

const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
/** 17 Agustus 1945 = Jumat Legi */
const LEGI = Math.round(Date.UTC(1945, 7, 17) / DAY);

/** Pasaran Jawa (siklus lima hari) untuk sebuah tanggal. */
export function pasaran(d: Date) {
  return PASARAN[(((dayNo(d) - LEGI) % 5) + 5) % 5];
}
