import Link from 'next/link';
import { Catalog } from '@/components/Catalog';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { CHEAPEST, PLANS, rupiah, rupiahShort } from '@/lib/site';

const STEPS = [
  { t: 'Pilih template', d: 'Coba demonya dulu, persis seperti yang nanti dibuka penerima.' },
  { t: 'Ganti isinya', d: 'Semua sudah terisi contoh. Tinggal ganti nama, pesan, dan foto.' },
  { t: 'Bayar, lalu kirim', d: 'Scan QRIS dari e-wallet atau m-banking. Link dan QR kadomu langsung jadi.' },
];

const FAQ = [
  {
    q: 'Kado digital itu apa?',
    a: 'Halaman kecil yang kamu isi sendiri lalu dikirim sebagai link. Penerima membukanya dari HP dan memainkannya: memekarkan bunga, meniup lilin, membuka amplop, sampai ketemu suratmu.',
  },
  { q: 'Penerima perlu install aplikasi?', a: 'Tidak. Cukup ketuk link-nya, langsung terbuka di browser HP. Tidak perlu daftar akun juga.' },
  {
    q: 'Bayarnya pakai apa?',
    a: 'QRIS. Bisa dari GoPay, OVO, DANA, ShopeePay, LinkAja, atau aplikasi m-banking apa pun. Begitu pembayaran masuk, kadomu otomatis terbit.',
  },
  {
    q: 'Bisa diubah setelah terbit?',
    a: 'Bisa. Buka menu Kado saya di perangkat yang kamu pakai saat membuat, lalu pilih Ubah isi. Link-nya tetap sama.',
  },
  {
    q: 'Siapa saja yang bisa melihat kadoku?',
    a: 'Hanya orang yang punya link atau QR-nya. Halaman kado tidak muncul di Google.',
  },
  {
    q: 'Harus bikin akun?',
    a: 'Tidak. Kamu langsung isi, bayar, dan dapat link. Daftar kado yang pernah kamu buat tersimpan di perangkatmu.',
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SiteHeader />

      <section className="pb-3 pt-2 sm:pb-8 sm:pt-12 sm:text-center">
        <h1 className="font-display text-[2.2rem] font-semibold leading-[1.03] sm:text-6xl">
          Kado digital yang bikin dia <em className="text-tomato">senyum</em>.
        </h1>
        <p className="mx-auto mt-2.5 max-w-xl text-[15px] leading-snug text-ink-2 sm:mt-4 sm:text-lg">
          Pilih template, ganti nama dan pesannya, bayar pakai QRIS. Link kadomu langsung jadi.
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5 text-[12px] font-bold sm:mt-5 sm:justify-center sm:text-[13px]">
          <li className="rounded-full bg-butter/70 px-2.5 py-1">Tanpa daftar akun</li>
          <li className="rounded-full bg-blush/80 px-2.5 py-1">Beres dalam hitungan menit</li>
          <li className="rounded-full bg-sky/80 px-2.5 py-1">Mulai {rupiahShort(CHEAPEST)}</li>
        </ul>
      </section>

      <Catalog />

      <section className="mt-16 sm:mt-24" aria-labelledby="cara">
        <h2 id="cara" className="font-display text-3xl font-semibold sm:text-center sm:text-4xl">
          Tiga langkah, beres.
        </h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-5">
          {STEPS.map((s, i) => (
            <li key={s.t} className="rounded-3xl bg-card p-5 shadow-card">
              <span className="font-display grid h-10 w-10 place-items-center rounded-full bg-ink text-lg font-semibold text-paper">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-extrabold">{s.t}</h3>
              <p className="mt-1 text-[15px] leading-snug text-ink-2">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 sm:mt-24" aria-labelledby="harga">
        <h2 id="harga" className="font-display text-3xl font-semibold sm:text-center sm:text-4xl">
          Sekali bayar per kado.
        </h2>
        <p className="mt-2 text-[15px] text-ink-2 sm:text-center">
          Bukan langganan. Semua template dan fitur sama, bedanya cuma berapa lama link-nya aktif.
        </p>
        <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2 sm:gap-5">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={
                'relative rounded-3xl p-5 shadow-card ' + (p.popular ? 'bg-ink text-paper' : 'bg-card')
              }
            >
              {p.popular ? (
                <span className="absolute right-4 top-4 rounded-full bg-butter px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink">
                  Disarankan
                </span>
              ) : null}
              <div className="text-sm font-bold opacity-70">{p.name}</div>
              <div className="font-display mt-1 text-4xl font-semibold">{rupiah(p.price)}</div>
              <div className="mt-1 text-[15px] opacity-80">{p.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 sm:text-center">
          <Link href="#template" className="btn btn-primary h-12 px-6 text-[15px]">
            Pilih template →
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-2xl sm:mt-24" aria-labelledby="faq">
        <h2 id="faq" className="font-display text-3xl font-semibold sm:text-center sm:text-4xl">
          Yang sering ditanya
        </h2>
        <div className="mt-5 divide-y divide-line rounded-3xl bg-card px-5 shadow-card">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-paper-2 text-lg leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
