/**
 * Foto asli untuk demo & isi contoh template, dari Wikimedia Commons (lisensi bebas).
 * Kreditnya tampil di /kredit-foto. Tag `tema` membantu memilih foto yang cocok dengan cerita contoh.
 */
export type ContohPhoto = {
  file: string;
  tema: string[];
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
};

export const CONTOH_PHOTOS: ContohPhoto[] = [];
