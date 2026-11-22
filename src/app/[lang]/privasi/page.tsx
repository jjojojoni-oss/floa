import type { Metadata } from 'next';
import { Legal } from '@/components/Legal';
import { fmt } from '@/i18n/fmt';
import { dictOf } from '@/i18n/server';
import { SITE } from '@/lib/site';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await dictOf(params);
  return { title: t.legal.privacy };
}

export default async function PrivasiPage({ params }: Props) {
  const { locale, t } = await dictOf(params);
  const email = SITE.contact.email;

  return (
    <Legal title={t.legal.privacy} updated={fmt(t.legal.updated, { date: t.legal.date })}>
      {locale === 'en' ? (
        <>
          <section>
            <h2>What we store</h2>
            <ul>
              <li>The content of gifts you publish: names, messages, and the photos you upload.</li>
              <li>Order details: the link address, plan, amount, and payment status.</li>
              <li>Your WhatsApp number, only if you enter it at checkout.</li>
            </ul>
            <p className="mt-2">floa has no account system, so we do not store passwords or profiles.</p>
          </section>
          <section>
            <h2>What stays on your device</h2>
            <p>
              Gift drafts and the list under My gifts are stored in your device&apos;s browser, not on our servers. If you clear your browser
              data, that list is cleared too, but published gifts still open from their links.
            </p>
          </section>
          <section>
            <h2>Who can see a gift</h2>
            <p>
              A gift can only be opened by people who have its link or QR code. Gift pages are marked so search engines do not index them.
              Anyone who receives the link can open it, so only share it with the person it is meant for.
            </p>
          </section>
          <section>
            <h2>How your data is used</h2>
            <ul>
              <li>To show the gift to its recipient.</li>
              <li>
                To process payments. For card payments, Creem receives the order ID, amount, and gift link; you enter your email and card
                details directly on Creem&apos;s page and they never reach floa. For payments from Indonesia, BorderPay receives the order ID and
                amount.
              </li>
              <li>To help you if something goes wrong with your gift or payment.</li>
            </ul>
            <p className="mt-2">We do not sell your data and do not use it for advertising.</p>
          </section>
          <section>
            <h2>Deleting your data</h2>
            <p>
              Want your gift and photos deleted? Email {email} with the gift link. Gifts whose link has expired are deleted periodically.
            </p>
          </section>
        </>
      ) : locale === 'ms' ? (
        <>
          <section>
            <h2>Data yang kami simpan</h2>
            <ul>
              <li>Kandungan hadiah yang kamu terbitkan: nama, mesej, dan foto yang kamu muat naik.</li>
              <li>Maklumat pesanan: alamat pautan, pakej, jumlah, dan status pembayaran.</li>
              <li>Nombor WhatsApp, hanya jika kamu mengisinya semasa pembayaran.</li>
            </ul>
            <p className="mt-2">floa tiada sistem akaun, jadi kami tidak menyimpan kata laluan atau profil.</p>
          </section>
          <section>
            <h2>Yang disimpan di perantimu</h2>
            <p>
              Draf hadiah dan senarai di menu Hadiah saya disimpan dalam pelayar perantimu, bukan di pelayan kami. Jika data pelayar dipadam,
              senarai itu turut hilang, tetapi hadiah yang sudah diterbitkan masih boleh dibuka melalui pautannya.
            </p>
          </section>
          <section>
            <h2>Siapa yang boleh melihat hadiah</h2>
            <p>
              Hadiah hanya boleh dibuka oleh orang yang mempunyai pautan atau kod QR-nya. Halaman hadiah ditanda supaya tidak diindeks enjin
              carian. Sesiapa yang menerima pautan itu boleh membukanya, jadi kongsi hanya kepada orang yang kamu tuju.
            </p>
          </section>
          <section>
            <h2>Untuk apa datamu digunakan</h2>
            <ul>
              <li>Memaparkan hadiah kepada penerima.</li>
              <li>
                Memproses pembayaran. Untuk pembayaran kad, Creem menerima ID pesanan, jumlah, dan pautan hadiah; emel dan maklumat kad kamu isi
                terus di halaman Creem dan tidak pernah sampai ke floa. Untuk pembayaran dari Indonesia, BorderPay menerima ID pesanan dan
                jumlahnya.
              </li>
              <li>Membantu kamu jika ada masalah dengan hadiah atau pembayaranmu.</li>
            </ul>
            <p className="mt-2">Kami tidak menjual datamu dan tidak menggunakannya untuk iklan.</p>
          </section>
          <section>
            <h2>Memadam data</h2>
            <p>
              Mahu hadiah dan fotomu dipadam? Hantar emel ke {email} dengan menyertakan pautan hadiahnya. Hadiah yang tempoh aktifnya sudah
              tamat akan kami padam secara berkala.
            </p>
          </section>
        </>
      ) : (
        <>
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
              <li>
                Memproses pembayaran. Untuk pembayaran dari Indonesia, BorderPay menerima ID pesanan dan nominalnya. Untuk pembayaran dari luar
                negeri, Creem menerima ID pesanan, nominal, dan alamat link kado; email dan data kartu kamu isi langsung di halaman Creem dan
                tidak pernah sampai ke floa.
              </li>
              <li>Membantu kamu kalau ada masalah dengan kado atau pembayaranmu.</li>
            </ul>
            <p className="mt-2">Kami tidak menjual datamu dan tidak memakainya untuk iklan.</p>
          </section>
          <section>
            <h2>Menghapus data</h2>
            <p>
              Ingin kado dan fotomu dihapus? Kirim email ke {email} dengan menyebutkan link kadonya. Kado yang masa aktifnya sudah habis akan
              kami hapus secara berkala.
            </p>
          </section>
        </>
      )}
    </Legal>
  );
}
