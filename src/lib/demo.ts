import type { Locale } from '@/i18n/config';
import type { GiftMusic } from '@/templates/types';

/**
 * Tambahan khusus halaman demo: kata sandi (ditampilkan terang-terangan, supaya calon pembeli bisa
 * merasakan layar kuncinya) dan satu lagu manis dari Spotify per template. Tidak ikut ke isi contoh
 * di editor, jadi kado sungguhan tidak otomatis terkunci atau memutar lagu pilihan kami.
 */
type DemoExtra = {
  song: { id: string; title: string; artist: string };
  /** satu kata sandi, atau per bahasa untuk kata sandi berupa kata */
  password: string | Record<Locale, string>;
  hint: Record<Locale, string>;
};

const DEMO: Record<string, DemoExtra> = {
  buket: {
    song: { id: '7geh51STedQfizitdiNPCg', title: 'Kita Bikin Romantis', artist: "MALIQ & D'Essentials" },
    password: '0905',
    hint: { id: 'Tanggal kencan pertama kita (DDMM)', ms: 'Tarikh janji temu pertama kita (DDMM)', en: 'Our first date (DDMM)' },
  },
  lilin: {
    song: { id: '5WWQGoY0FEB8NdhKiwpz2E', title: 'Selamat Ulang Tahun', artist: 'Jamrud' },
    password: '2104',
    hint: { id: 'Tanggal ulang tahunmu (DDMM)', ms: 'Tarikh hari jadimu (DDMM)', en: 'Your birthday (DDMM)' },
  },
  lampion: {
    song: { id: '1EJRWWuQokc0RgF7QCSipP', title: 'Bentang Jarak Asmara', artist: 'Man Osman & Traffic Jam' },
    password: { id: 'senja', ms: 'senja', en: 'sunset' },
    hint: { id: 'Langit favorit kita', ms: 'Langit kegemaran kita', en: 'Our favourite time of day' },
  },
  amplop: {
    song: { id: '6WsG550j67Aj29z0iel7lo', title: 'Waking Up Together With You', artist: 'Ardhito Pramono' },
    password: 'latte',
    hint: { id: 'Pesananku di kencan pertama kita', ms: 'Pesanan aku masa janji temu pertama', en: 'What I ordered on our first date' },
  },
  polaroid: {
    song: { id: '6WUqv9T3RPTHHNKw0zVJuM', title: 'Sahabat Sejati', artist: 'Sheila On 7' },
    password: '2019',
    hint: { id: 'Tahun kita pertama ngekos bareng', ms: 'Tahun pertama kita menyewa bersama', en: 'The year we first moved in together' },
  },
  mau: {
    song: { id: '1a2Y5fGmSfqgysvDL5hT1q', title: 'Dia', artist: "MALIQ & D'Essentials" },
    password: '0307',
    hint: { id: 'Tanggal kita pertama ngobrol (DDMM)', ms: 'Tarikh kita mula berbual (DDMM)', en: 'The day we first talked (DDMM)' },
  },
  plester: {
    song: { id: '5l1PTlqOxFjZaNC9BW9hkA', title: 'Terus Terang', artist: "MALIQ & D'Essentials" },
    password: { id: 'maaf', ms: 'maaf', en: 'sorry' },
    hint: { id: 'Satu kata yang belum sempat aku bilang', ms: 'Satu perkataan yang belum sempat aku ucap', en: 'The word I never got to say' },
  },
  toga: {
    song: { id: '3XlwQDhJ2jEzP4zStUAWuW', title: 'Tempat Yang Kau Mau', artist: 'Man Osman & Niken Larasati' },
    password: '2026',
    hint: { id: 'Tahun kamu diwisuda', ms: 'Tahun kamu bergraduasi', en: 'The year you graduated' },
  },
  memories: {
    song: { id: '1i9iliTpiPLizleapSg37I', title: 'Untitled', artist: "MALIQ & D'Essentials" },
    password: '120522',
    hint: { id: 'Tanggal foto pertama kita (DDMMYY)', ms: 'Tarikh gambar pertama kita (DDMMYY)', en: 'Our first photo together (DDMMYY)' },
  },
  bento: {
    song: { id: '0Dr1tLTnNDbFDCXJfeqEAs', title: 'Malu Malu Tapi Nyaman', artist: 'Lyodra' },
    password: { id: 'makan', ms: 'makan', en: 'lunch' },
    hint: { id: 'Hal yang paling sering kamu lupa', ms: 'Perkara yang paling kerap kamu lupa', en: 'The meal you always skip' },
  },
  scrapbook: {
    song: { id: '754kgU5rWscRTfvlsuEwFp', title: 'Kiss Me', artist: 'Sixpence None The Richer' },
    password: '1406',
    hint: { id: 'Tanggal kita pertama ketemu (DDMM)', ms: 'Tarikh kita mula berjumpa (DDMM)', en: 'The day we first met (DDMM)' },
  },
  anniversary: {
    song: { id: '5Enpui55il1ZW0HgwRTSds', title: 'Kita Lewati Berdua', artist: 'Overnight' },
    password: '140223',
    hint: { id: 'Tanggal jadian kita (DDMMYY)', ms: 'Tarikh kita mula bersama (DDMMYY)', en: 'The day it all started (DDMMYY)' },
  },
  bioskop: {
    song: { id: '2BCYKFDWnZi9PMkZiemQh1', title: 'Film Favorit', artist: 'Sheila On 7' },
    password: '1915',
    hint: { id: 'Jam film pertama kita (JJMM)', ms: 'Waktu wayang pertama kita (JJMM)', en: 'Showtime of our first movie (HHMM)' },
  },
};

export type DemoLock = { password: string; hint: string; shape: string | null };

export function demoExtras(id: string, locale: Locale): { music: GiftMusic; lock: DemoLock } | null {
  const d = DEMO[id];
  if (!d) return null;
  const password = typeof d.password === 'string' ? d.password : d.password[locale];
  return {
    music: { provider: 'spotify', type: 'track', id: d.song.id, title: `${d.song.title} · ${d.song.artist}`, autoplay: true },
    lock: { password, hint: d.hint[locale], shape: /^\d{3,8}$/.test(password) ? `d${password.length}` : null },
  };
}
