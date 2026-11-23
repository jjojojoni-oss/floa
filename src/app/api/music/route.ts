import { fail, handle, json } from '@/lib/http';
import { isShortSpotifyLink, parseSpotify, spotifyUrl } from '@/lib/music';
import { allow, clientIp } from '@/lib/ratelimit';

const SHORT_HOSTS = new Set(['spotify.link', 'spoti.fi']);

/** Link pendek dari aplikasi Spotify (spotify.link / spoti.fi) → link open.spotify.com. */
async function expandShortLink(link: string) {
  let url = link;
  // ikuti pengalihan satu per satu, hanya ke domain Spotify
  for (let i = 0; i < 4; i++) {
    const host = new URL(url).hostname;
    if (host === 'open.spotify.com') return url;
    if (!SHORT_HOSTS.has(host)) return null;
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(4000), headers: { 'user-agent': 'floa-link-reader' } });
    const next = r.headers.get('location');
    if (next) {
      url = new URL(next, url).toString();
      continue;
    }
    // sebagian link pendek menaruh tujuannya di halaman, bukan di header
    const html = (await r.text()).slice(0, 200_000);
    const m = html.match(/https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:track|album|playlist|episode)\/[A-Za-z0-9]{22}/i);
    return m ? m[0] : null;
  }
  return null;
}

/** Judul dari oEmbed Spotify (untuk ditampilkan di editor). Gagal pun tidak masalah. */
async function titleOf(url: string) {
  try {
    const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) return undefined;
    const o = (await r.json()) as { title?: unknown };
    return typeof o.title === 'string' ? o.title.slice(0, 120) : undefined;
  } catch {
    return undefined;
  }
}

/** Membaca link Spotify yang ditempel pembuat kado. */
export async function GET(req: Request) {
  try {
    if (!allow('music:' + clientIp(req), 30, 10 * 60_000)) return fail('Terlalu banyak percobaan.', 429, 'rate_limited');
    const raw = (new URL(req.url).searchParams.get('url') ?? '').trim().slice(0, 300);
    let found = parseSpotify(raw);
    if (!found && isShortSpotifyLink(raw)) {
      const full = await expandShortLink(raw).catch(() => null);
      found = full ? parseSpotify(full) : null;
    }
    if (!found) return fail('Link Spotify tidak dikenali.', 400, 'music_invalid');
    const title = await titleOf(spotifyUrl(found));
    return json({ provider: 'spotify', type: found.type, id: found.id, ...(title ? { title } : {}) });
  } catch (e) {
    return handle(e);
  }
}
