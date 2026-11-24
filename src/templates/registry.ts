import type { Locale } from '@/i18n/config';
import type { OccasionId, TemplateMeta } from './types';
import { meta as amplop } from './amplop/meta';
import { meta as anniversary } from './anniversary/meta';
import { meta as bento } from './bento/meta';
import { meta as bioskop } from './bioskop/meta';
import { meta as buket } from './buket/meta';
import { meta as lampion } from './lampion/meta';
import { meta as lilin } from './lilin/meta';
import { meta as mau } from './mau/meta';
import { meta as memories } from './memories/meta';
import { meta as plester } from './plester/meta';
import { meta as polaroid } from './polaroid/meta';
import { meta as scrapbook } from './scrapbook/meta';
import { meta as toga } from './toga/meta';
import { meta as paspor } from './paspor/meta';
import { meta as vinyl } from './vinyl/meta';

/** Urutan di sini = urutan di katalog. Teks bawaannya Bahasa Indonesia; pakai localizeMeta untuk bahasa lain. */
export const TEMPLATES: TemplateMeta[] = [buket, lilin, lampion, amplop, polaroid, mau, plester, toga, memories, bento, scrapbook, anniversary, vinyl, paspor, bioskop];

const OCCASION_LABELS: Record<OccasionId, Record<Locale, string>> = {
  ultah: { id: 'Ulang tahun', ms: 'Hari jadi', en: 'Birthday' },
  anniv: { id: 'Anniversary', ms: 'Ulang tahun cinta', en: 'Anniversary' },
  nembak: { id: 'Nembak', ms: 'Luah perasaan', en: 'Confession' },
  maaf: { id: 'Minta maaf', ms: 'Minta maaf', en: 'Apology' },
  kangen: { id: 'Kangen & LDR', ms: 'Rindu & jarak jauh', en: 'Missing you' },
  sahabat: { id: 'Sahabat', ms: 'Sahabat', en: 'Friends' },
  ortu: { id: 'Orang tua', ms: 'Ibu bapa', en: 'Parents' },
  wisuda: { id: 'Wisuda', ms: 'Konvokesyen', en: 'Graduation' },
};

export const OCCASION_IDS = Object.keys(OCCASION_LABELS) as OccasionId[];

export function occasionLabel(id: OccasionId, locale: Locale = 'id') {
  return OCCASION_LABELS[id]?.[locale] ?? id;
}

/** Meta template dalam bahasa tertentu (nama, tagline, langkah, label kolom, isi contoh). */
export function localizeMeta(meta: TemplateMeta, locale: Locale): TemplateMeta {
  if (locale === 'id') return meta;
  const t = meta.i18n[locale];
  return {
    ...meta,
    name: t.name,
    tagline: t.tagline,
    steps: t.steps,
    sample: t.sample,
    fields: meta.fields.map((f) => ({ ...f, ...(t.fields[f.key] ?? {}) })) as TemplateMeta['fields'],
  };
}

export function getTemplate(id: string, locale: Locale = 'id'): TemplateMeta | undefined {
  const m = TEMPLATES.find((t) => t.id === id);
  return m ? localizeMeta(m, locale) : undefined;
}
