import { CoverImage } from '../kit';

/** Kartu katalog: lukisan utuh peron malam & kereta berjendela hangat dari art/sprites (cover-kereta-malam).
 *  Namanya sengaja beda dari cover-anniversary lama: /art di-cache 30 hari, jadi lukisan yang isinya berubah harus
 *  berganti nama supaya browser tidak terus menampilkan versi lamanya. */
export default function Cover() {
  return <CoverImage id="kereta-malam" />;
}
