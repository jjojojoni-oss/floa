'use client';

import { Finale, Stage } from '../kit';
import type { TemplateProps } from '../types';
import { meta } from './meta';

/* KERANGKA: akan diganti seluruhnya. */
export default function Bento({ data, mode }: TemplateProps) {
  return (
    <Stage {...meta.palette}>
      <Finale data={data} mode={mode} />
    </Stage>
  );
}
