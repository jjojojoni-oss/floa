import { BouquetArt } from './art';
import s from './style.module.css';

/** Gambar kartu katalog: buket yang sudah mekar semua. */
export default function Cover() {
  return (
    <div className={s.cover} style={{ ['--accent' as string]: '#e8506b' }}>
      <BouquetArt open={[true, true, true, true, true]} tied />
    </div>
  );
}
