import type { Metadata } from 'next';
import { Legal } from '@/components/Legal';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Kebijakan privasi' };

export default function PrivasiPage() {
  return (
    <Legal title="Kebijakan privasi" updated="22 November 2026">
      <section>
        <h2>Data yang kami simpan</h2>
        <ul>
          <li>Isi kado yang kamu terbitkan: nama, pesan, dan foto yang kamu unggah.</li>
          <li>Data pesanan: alamat link, paket, jumlah, dan status pembayaran.</li>
          <li>Nomor WhatsApp, hanya kalau kamu mengisinya saat checkout.</li>
        </ul>
        <p className="mt-2">floa tidak punya sistem akun, jadi kami tidak menyimpan kata sandi atau profil.</p>
      </section>
      <section>
        <h2>Yang tersimpan di perangkatmu</h2>
        <p>
          Draf kado dan daftar di menu Kado saya disimpan di browser perangkatmu, bukan di server kami. Kalau data browser dihapus,
          daftar itu ikut hilang, tetapi kado yang sudah terbit tetap bisa dibuka lewat link-nya.
        </p>
      </section>
      <section>
        <h2>Siapa yang bisa melihat kado</h2>
        <p>
          Kado hanya bisa dibuka oleh orang yang memiliki link atau QR-nya. Halaman kado kami tandai agar tidak diindeks mesin pencari.
          Siapa pun yang menerima link tersebut bisa membukanya, jadi bagikan hanya ke orang yang kamu tuju.
        </p>
      </section>
      <section>
        <h2>Untuk apa datamu dipakai</h2>
        <ul>
          <li>Menampilkan kado kepada penerima.</li>
          <li>Memproses pembayaran lewat penyedia pembayaran.</li>
          <li>Membantu kamu kalau ada masalah dengan kado atau pembayaranmu.</li>
        </ul>
        <p className="mt-2">Kami tidak menjual datamu dan tidak memakainya untuk iklan.</p>
      </section>
      <section>
        <h2>Menghapus data</h2>
        <p>
          Ingin kado dan fotomu dihapus? Kirim email ke {SITE.contact.email} dengan menyebutkan link kadonya. Kado yang masa aktifnya
          sudah habis akan kami hapus secara berkala.
        </p>
      </section>
    </Legal>
  );
}
