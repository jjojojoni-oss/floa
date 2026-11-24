import type { ComponentType } from 'react';
import Amplop from './amplop/Cover';
import Anniversary from './anniversary/Cover';
import Bento from './bento/Cover';
import Bioskop from './bioskop/Cover';
import Buket from './buket/Cover';
import Lampion from './lampion/Cover';
import Lilin from './lilin/Cover';
import Mau from './mau/Cover';
import Memories from './memories/Cover';
import Plester from './plester/Cover';
import Polaroid from './polaroid/Cover';
import Scrapbook from './scrapbook/Cover';
import Toga from './toga/Cover';

/** Ilustrasi kartu katalog per template. Mengisi penuh kotak induknya. */
export const COVERS: Record<string, ComponentType> = {
  scrapbook: Scrapbook,
  memories: Memories,
  anniversary: Anniversary,
  bento: Bento,
  buket: Buket,
  lilin: Lilin,
  amplop: Amplop,
  polaroid: Polaroid,
  lampion: Lampion,
  mau: Mau,
  plester: Plester,
  toga: Toga,
  bioskop: Bioskop,
};
