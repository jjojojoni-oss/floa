import type { Locale } from '../config';
import { en } from './en';
import { type Dict, id } from './id';
import { ms } from './ms';

export type { Dict } from './id';

const DICTS: Record<Locale, Dict> = { id, ms, en };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? id;
}
