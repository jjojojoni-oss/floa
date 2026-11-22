'use client';

import { Finale, Stage } from '../kit';
import type { TemplateProps } from '../types';
import { meta } from './meta';

/* placeholder: akan diganti dengan pengalaman interaktif template ini */
export default function Template({ data, mode }: TemplateProps) {
  return (
    <Stage {...meta.palette}>
      <Finale data={data} mode={mode} />
    </Stage>
  );
}
