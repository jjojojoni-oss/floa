/**
 * Bingkisan kado berhasil dibuka: pitanya lepas (tarikan kedua) atau bingkisannya dilewati.
 * Diumumkan DI DALAM ketukan/tarikan itu, karena HP hanya mengizinkan lagu mulai dari dalam ketukan. Pendengarnya
 * dipanggil LANGSUNG (bukan lewat dispatchEvent): event buatan yang dikirim di tengah ketukan menjadi "event yang
 * sedang berjalan", sehingga sebagian browser tidak lagi menganggap pemutaran lagunya berasal dari ketukan.
 */
type Listener = () => void;
const listeners = new Set<Listener>();

export function onGiftOpen(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function announceGiftOpen() {
  listeners.forEach((fn) => fn());
}
