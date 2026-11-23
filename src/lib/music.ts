import type { GiftMusic, MusicKind } from '@/templates/types';

/** Jenis konten Spotify yang bisa diputar lewat embed. */
export const MUSIC_KINDS: readonly MusicKind[] = ['track', 'album', 'playlist', 'episode'];

/** ID Spotify: 22 karakter base62. */
const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;

/**
 * Membaca link Spotify biasa: https://open.spotify.com/(intl-xx/)track/ID?si=…, atau spotify:track:ID.
 * Link pendek (spotify.link, spoti.fi) tidak bisa dibaca di sini; server yang membukanya (lihat /api/music).
 */
export function parseSpotify(input: string): { type: MusicKind; id: string } | null {
  const s = input.trim();
  const uri = s.match(/^spotify:(track|album|playlist|episode):([A-Za-z0-9]{22})$/);
  if (uri) return { type: uri[1] as MusicKind, id: uri[2] };
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' || u.hostname !== 'open.spotify.com') return null;
  const parts = u.pathname.split('/').filter(Boolean);
  // buang awalan bahasa (intl-id) dan /embed/
  while (parts.length && (/^intl-[a-z-]+$/i.test(parts[0]) || parts[0] === 'embed')) parts.shift();
  const [type, id] = parts;
  if (!MUSIC_KINDS.includes(type as MusicKind) || !SPOTIFY_ID.test(id ?? '')) return null;
  return { type: type as MusicKind, id };
}

export const isShortSpotifyLink = (input: string) => /^https:\/\/(spotify\.link|spoti\.fi)\/[A-Za-z0-9_-]+\/?$/.test(input.trim());

/** Menyaring data musik dari luar (isi kado yang dikirim pembuatnya). */
export function cleanMusic(v: unknown, cleanText: (s: unknown, max: number) => string): GiftMusic | null {
  if (!v || typeof v !== 'object') return null;
  const m = v as Record<string, unknown>;
  if (m.provider !== 'spotify') return null;
  if (!MUSIC_KINDS.includes(m.type as MusicKind)) return null;
  if (typeof m.id !== 'string' || !SPOTIFY_ID.test(m.id)) return null;
  const title = cleanText(m.title, 120);
  return { provider: 'spotify', type: m.type as MusicKind, id: m.id, ...(title ? { title } : {}), autoplay: m.autoplay !== false };
}

export const spotifyUri = (m: GiftMusic) => `spotify:${m.type}:${m.id}`;
export const spotifyUrl = (m: { type: MusicKind; id: string }) => `https://open.spotify.com/${m.type}/${m.id}`;
