import type { ComponentType } from 'react';
import Amplop from './amplop/Cover';
import Buket from './buket/Cover';
import Lampion from './lampion/Cover';
import Lilin from './lilin/Cover';
import Mau from './mau/Cover';
import Plester from './plester/Cover';
import Polaroid from './polaroid/Cover';
import Toga from './toga/Cover';

/** Ilustrasi kartu katalog per template. Mengisi penuh kotak induknya. */
export const COVERS: Record<string, ComponentType> = {
  buket: Buket,
  lilin: Lilin,
  amplop: Amplop,
  polaroid: Polaroid,
  lampion: Lampion,
  mau: Mau,
  plester: Plester,
  toga: Toga,
};
