import type { Metadata } from 'next';
import { Legal } from '@/components/Legal';
import { fmt } from '@/i18n/fmt';
import { dictOf } from '@/i18n/server';
import { PLANS, SITE, money, rupiah } from '@/lib/site';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await dictOf(params);
  return { title: t.legal.terms };
}

export default async function SyaratPage({ params }: Props) {
  const { locale, t } = await dictOf(params);
  const email = SITE.contact.email;
  const plans = PLANS.map((p) => ({ id: p.id, name: t.plans[p.id].name, note: t.plans[p.id].note, idr: rupiah(p.price), usd: money(p.usd, 'USD') }));

  return (
    <Legal title={t.legal.terms} updated={fmt(t.legal.updated, { date: t.legal.date })}>
      {locale === 'en' ? (
        <>
          <section>
            <h2>About floa</h2>
            <p>
              floa is a service for making digital gifts: interactive pages you fill in yourself and share with a link. By using floa, you
              agree to the terms on this page.
            </p>
          </section>
          <section>
            <h2>Prices and payment</h2>
            <ul>
              {plans.map((p) => (
                <li key={p.id}>
                  {p.name}: {p.usd} from outside Indonesia, or {p.idr} from Indonesia. {p.note}.
                </li>
              ))}
              <li>One payment covers one gift link. It is not a subscription and there are no recurring charges.</li>
              <li>
                Payments from outside Indonesia are made by credit/debit card in US dollars and processed by Creem on its own checkout page.
                Tax may be added depending on your country and is shown before you pay.
              </li>
              <li>Payments from Indonesia use QRIS and are processed by BorderPay and its payment partners licensed by Bank Indonesia.</li>
              <li>floa never receives or stores your card or bank details.</li>
              <li>Your gift goes live automatically once the payment is received.</li>
            </ul>
          </section>
          <section>
            <h2>Refunds</h2>
            <p>
              Because a gift goes live and can be used as soon as it is paid for, payments are generally non-refundable. If you paid but your
              gift did not go live, or you were charged twice, email {email} and we will sort it out.
            </p>
          </section>
          <section>
            <h2>Gift content</h2>
            <ul>
              <li>You are fully responsible for the content of your gift (text and photos). Make sure you have the right to use the photos you upload.</li>
              <li>
                Do not use floa for content that is illegal, hateful, harassing, pornographic, fraudulent, or harmful to others. We may disable
                such gifts without a refund.
              </li>
              <li>You can edit your gift any time while its link is live, from My gifts on the device you used to make it.</li>
            </ul>
          </section>
          <section>
            <h2>Availability</h2>
            <p>
              We work to keep floa available at all times, but we cannot guarantee the service will be completely free of interruptions. If a
              long outage stops your gift from opening, contact us.
            </p>
          </section>
          <section>
            <h2>Contact</h2>
            <p>Questions or content reports: {email}</p>
          </section>
        </>
      ) : locale === 'ms' ? (
        <>
          <section>
            <h2>Tentang floa</h2>
            <p>
              floa ialah perkhidmatan untuk membuat hadiah digital: halaman interaktif yang kamu isi sendiri lalu dikongsi melalui pautan.
              Dengan menggunakan floa, kamu bersetuju dengan terma di halaman ini.
            </p>
          </section>
          <section>
            <h2>Harga dan pembayaran</h2>
            <ul>
              {plans.map((p) => (
                <li key={p.id}>
                  {p.name}: {p.usd} dari luar Indonesia, atau {p.idr} dari Indonesia. {p.note}.
                </li>
              ))}
              <li>Satu pembayaran untuk satu pautan hadiah. Bukan langganan, tiada caj berulang.</li>
              <li>
                Pembayaran dari luar Indonesia (termasuk Malaysia) menggunakan kad kredit/debit dalam dolar AS dan diproses oleh Creem di halaman
                pembayarannya sendiri. Cukai mungkin ditambah mengikut negaramu dan akan dipaparkan sebelum kamu membayar.
              </li>
              <li>Pembayaran dari Indonesia menggunakan QRIS dan diproses oleh BorderPay serta rakan pembayarannya yang berlesen Bank Indonesia.</li>
              <li>floa tidak pernah menerima atau menyimpan maklumat kad atau akaun bankmu.</li>
              <li>Hadiah diterbitkan secara automatik selepas pembayaran diterima.</li>
            </ul>
          </section>
          <section>
            <h2>Bayaran balik</h2>
            <p>
              Oleh kerana hadiah terus diterbitkan dan boleh digunakan sebaik sahaja dibayar, pembayaran pada dasarnya tidak boleh dikembalikan.
              Jika kamu sudah membayar tetapi hadiah tidak diterbitkan, atau dicaj dua kali, hubungi {email} dan kami akan menyelesaikannya.
            </p>
          </section>
          <section>
            <h2>Kandungan hadiah</h2>
            <ul>
              <li>Kandungan hadiah (teks dan foto) sepenuhnya tanggungjawabmu. Pastikan kamu berhak menggunakan foto yang dimuat naik.</li>
              <li>
                Dilarang menggunakan floa untuk kandungan yang melanggar undang-undang, berunsur kebencian, gangguan, lucah, penipuan, atau
                merugikan orang lain. Hadiah sebegitu boleh kami nyahaktifkan tanpa bayaran balik.
              </li>
              <li>Kamu boleh mengubah kandungan hadiah bila-bila masa selagi pautannya aktif, melalui menu Hadiah saya di peranti yang kamu guna semasa membuatnya.</li>
            </ul>
          </section>
          <section>
            <h2>Ketersediaan perkhidmatan</h2>
            <p>
              Kami berusaha memastikan floa sentiasa boleh diakses, tetapi tidak dapat menjamin perkhidmatan bebas gangguan sepenuhnya. Jika
              berlaku gangguan panjang yang menyebabkan hadiahmu tidak boleh dibuka, hubungi kami.
            </p>
          </section>
          <section>
            <h2>Hubungi</h2>
            <p>Soalan atau laporan kandungan: {email}</p>
          </section>
        </>
      ) : (
        <>
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
              {plans.map((p) => (
                <li key={p.id}>
                  {p.name}: {p.idr} dari Indonesia, atau {p.usd} dari luar negeri. {p.note}.
                </li>
              ))}
              <li>Satu pembayaran berlaku untuk satu link kado. Bukan langganan, tidak ada tagihan berulang.</li>
              <li>Pembayaran dari Indonesia memakai QRIS dan diproses oleh BorderPay beserta mitra pembayarannya yang berlisensi Bank Indonesia.</li>
              <li>
                Pembayaran dari luar negeri memakai kartu kredit/debit dalam dolar AS dan diproses oleh Creem di halaman pembayarannya sendiri.
                Pajak dapat ditambahkan sesuai negaramu dan akan terlihat sebelum kamu membayar.
              </li>
              <li>floa tidak pernah menerima atau menyimpan data kartu maupun rekeningmu.</li>
              <li>Kado terbit otomatis setelah pembayaran diterima.</li>
            </ul>
          </section>
          <section>
            <h2>Pengembalian dana</h2>
            <p>
              Karena kado langsung terbit dan bisa dipakai begitu dibayar, pembayaran pada dasarnya tidak dapat dikembalikan. Kalau kamu
              sudah membayar tetapi kadonya tidak terbit, atau terjadi tagihan ganda, hubungi {email} dan kami akan menyelesaikannya.
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
            <p>Pertanyaan atau laporan konten: {email}</p>
          </section>
        </>
      )}
    </Legal>
  );
}
