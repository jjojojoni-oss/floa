import type { Metadata } from 'next';
import { Legal } from '@/components/Legal';
import { PLANS, SITE, rupiah } from '@/lib/site';

export const metadata: Metadata = { title: 'Syarat layanan' };

export default function SyaratPage() {
  return (
    <Legal title="Syarat layanan" updated="22 November 2026">
      <section>
        <h2>Tentang floa</h2>
        <p>
          floa adalah layanan untuk membuat kado digital: halaman interaktif yang kamu isi sendiri lalu dibagikan lewat link. Dengan
          memakai floa, kamu setuju dengan syarat di halaman ini.
        </p>
      </section>
      <section>
        <h2>Harga dan pembayaran</h2>
        <ul>
          {PLANS.map((p) => (
            <li key={p.id}>
              {p.name}: {rupiah(p.price)}. {p.note}.
            </li>
          ))}
          <li>Satu pembayaran berlaku untuk satu link kado. Bukan langganan, tidak ada tagihan berulang.</li>
          <li>Pembayaran diproses lewat QRIS oleh penyedia pembayaran resmi. floa tidak menyimpan data kartu atau rekeningmu.</li>
          <li>Kado terbit otomatis setelah pembayaran diterima.</li>
        </ul>
      </section>
      <section>
        <h2>Pengembalian dana</h2>
        <p>
          Karena kado langsung terbit dan bisa dipakai begitu dibayar, pembayaran pada dasarnya tidak dapat dikembalikan. Kalau kamu
          sudah membayar tetapi kadonya tidak terbit, atau terjadi tagihan ganda, hubungi {SITE.contact.email} dan kami akan
          menyelesaikannya.
        </p>
      </section>
      <section>
        <h2>Isi kado</h2>
        <ul>
          <li>Isi kado (teks dan foto) sepenuhnya tanggung jawabmu. Pastikan kamu berhak memakai foto yang diunggah.</li>
          <li>
            Dilarang memakai floa untuk konten yang melanggar hukum, mengandung kebencian, pelecehan, pornografi, penipuan, atau yang
            merugikan orang lain. Kado seperti itu dapat kami nonaktifkan tanpa pengembalian dana.
          </li>
          <li>Kamu bisa mengubah isi kado kapan saja selama link-nya aktif, lewat menu Kado saya di perangkat yang kamu pakai saat membuat.</li>
        </ul>
      </section>
      <section>
        <h2>Ketersediaan layanan</h2>
        <p>
          Kami berusaha menjaga floa selalu bisa diakses, tetapi tidak bisa menjamin layanan bebas gangguan sepenuhnya. Kalau terjadi
          gangguan panjang yang membuat kadomu tidak bisa dibuka, hubungi kami.
        </p>
      </section>
      <section>
        <h2>Kontak</h2>
        <p>Pertanyaan atau laporan konten: {SITE.contact.email}</p>
      </section>
    </Legal>
  );
}
