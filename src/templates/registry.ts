import type { OccasionId, TemplateMeta } from './types';
import { meta as amplop } from './amplop/meta';
import { meta as buket } from './buket/meta';
import { meta as lampion } from './lampion/meta';
import { meta as lilin } from './lilin/meta';
import { meta as mau } from './mau/meta';
import { meta as plester } from './plester/meta';
import { meta as polaroid } from './polaroid/meta';
import { meta as toga } from './toga/meta';

/** Urutan di sini = urutan di katalog. */
export const TEMPLATES: TemplateMeta[] = [buket, lilin, amplop, polaroid, mau, lampion, plester, toga];

export const OCCASIONS: { id: OccasionId; label: string }[] = [
  { id: 'ultah', label: 'Ulang tahun' },
  { id: 'anniv', label: 'Anniversary' },
  { id: 'nembak', label: 'Nembak' },
  { id: 'maaf', label: 'Minta maaf' },
  { id: 'kangen', label: 'Kangen & LDR' },
  { id: 'sahabat', label: 'Sahabat' },
  { id: 'ortu', label: 'Orang tua' },
  { id: 'wisuda', label: 'Wisuda' },
];

export function getTemplate(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function occasionLabel(id: OccasionId) {
  return OCCASIONS.find((o) => o.id === id)?.label ?? id;
}
