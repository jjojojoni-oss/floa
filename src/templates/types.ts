import type { ComponentType } from 'react';

/** Isi kado. Bentuknya sama untuk semua template supaya editor & checkout tetap sederhana. */
export type GiftData = {
  /** nama penerima */
  to: string;
  /** nama pengirim */
  from: string;
  /** ucapan singkat / judul */
  title: string;
  /** surat / pesan panjang */
  message: string;
  /** kalimat-kalimat pendek (arti per template: per bunga, per lilin, per foto, …) */
  notes: string[];
  /** URL foto */
  photos: string[];
};

/**
 * live    = dibuka penerima di floa.site/slug
 * demo    = contoh di katalog
 * preview = pratinjau di editor
 */
export type TemplateMode = 'live' | 'demo' | 'preview';

export type TemplateProps = {
  data: GiftData;
  mode: TemplateMode;
};

export type OccasionId = 'ultah' | 'anniv' | 'nembak' | 'maaf' | 'kangen' | 'sahabat' | 'ortu' | 'wisuda';

export type TextField = {
  key: 'to' | 'from' | 'title' | 'message';
  label: string;
  hint?: string;
  placeholder?: string;
  max: number;
  multiline?: boolean;
};

export type NotesField = {
  key: 'notes';
  label: string;
  hint?: string;
  /** jumlah minimal & maksimal baris */
  min: number;
  count: number;
  /** maksimal karakter per baris */
  max: number;
  placeholder?: string;
};

export type PhotosField = {
  key: 'photos';
  label: string;
  hint?: string;
  count: number;
};

export type FieldSpec = TextField | NotesField | PhotosField;

export type TemplateMeta = {
  id: string;
  name: string;
  /** satu kalimat yang menjual */
  tagline: string;
  /** cara mainnya, 2–3 langkah pendek */
  steps: string[];
  occasions: OccasionId[];
  /** warna dunia template: dipakai kartu katalog, backdrop, loading */
  palette: { bg: string; ink: string; accent: string };
  fields: FieldSpec[];
  /** isi contoh: dipakai demo dan jadi isian awal editor */
  sample: GiftData;
};

export type TemplateComponent = ComponentType<TemplateProps>;
