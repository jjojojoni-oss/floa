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

const STEP_ART = ['kuncup-pink', 'bunga-kamboja', 'pita'];

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      {/* lukisan pembuka: langit senja + rangkaian bunga tropis */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] sm:h-[50rem]" aria-hidden>
        <div className="absolute inset-0 bg-[url('/art/bg-hero.webp')] bg-cover bg-top" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-paper" />
        <div className="absolute inset-0 bg-[url('/art/tex-butir.webp')] bg-[length:128px_128px] opacity-35" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/art/hero-kanan.webp"
          alt=""
          className="absolute -right-[20%] -top-10 w-[62%] max-w-[34rem] origin-top-right animate-float drop-shadow-[0_18px_18px_rgba(90,45,25,0.28)] sm:-right-10 sm:-top-8 sm:w-[30rem] lg:w-[34rem]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/art/hero-kiri.webp"
          alt=""
          className="absolute -left-24 top-[19rem] hidden w-[28rem] origin-bottom-left animate-float drop-shadow-[0_18px_18px_rgba(90,45,25,0.28)] [animation-delay:-3s] lg:block xl:-left-10"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SiteHeader />

        <section className="pb-4 pt-1 sm:pb-10 sm:pt-10 sm:text-center">
          <h1 className="font-display max-w-[17.5rem] text-[2.35rem] font-semibold leading-[1.02] sm:mx-auto sm:max-w-3xl sm:text-[4.4rem]">
            Kado digital yang bikin dia{' '}
            <span className="relative inline-block whitespace-nowrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/sapuan.webp" alt="" className="absolute -bottom-[0.18em] left-[-6%] w-[112%] max-w-none opacity-90" />
              <em className="font-hand relative px-1 text-[1.22em] font-bold not-italic leading-none text-tomato-dark">senyum</em>
            </span>
            .
          </h1>
          <p className="mt-3 max-w-[19rem] text-[15px] font-medium leading-snug text-ink-2 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg">
            Pilih template, ganti nama dan pesannya, bayar pakai QRIS. Link kadomu langsung jadi.
          </p>
          <ul className="mt-3.5 flex flex-wrap gap-1.5 text-[12px] font-bold sm:mt-6 sm:justify-center sm:text-[13px]">
            <li className="glass rounded-full px-3 py-1.5">Tanpa daftar akun</li>
            <li className="glass rounded-full px-3 py-1.5">Beres dalam hitungan menit</li>
            <li className="glass rounded-full px-3 py-1.5">Mulai {rupiahShort(CHEAPEST)}</li>
          </ul>
        </section>

        <Catalog />

        <section className="mt-20 sm:mt-28" aria-labelledby="cara">
          <p className="font-hand text-2xl text-tomato-dark sm:text-center">gampang kok</p>
          <h2 id="cara" className="font-display text-[2rem] font-semibold leading-tight sm:text-center sm:text-5xl">
            Tiga langkah, beres.
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.t} className="paper-card relative rounded-[1.6rem] p-6 pt-7" style={{ transform: `rotate(${[-0.8, 0.6, -0.5][i]}deg)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/art/${STEP_ART[i]}.webp`}
                  alt=""
                  loading="lazy"
                  className="absolute -right-3 -top-7 h-24 w-24 object-contain drop-shadow-[0_8px_8px_rgba(90,45,25,0.3)]"
                  style={{ transform: `rotate(${[14, -10, 6][i]}deg)` }}
                />
                <span className="font-hand text-5xl font-bold leading-none text-tomato-dark">{i + 1}</span>
                <h3 className="mt-2 text-lg font-extrabold">{s.t}</h3>
                <p className="mt-1 text-[15px] leading-snug text-ink-2">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20 sm:mt-28" aria-labelledby="harga">
          <p className="font-hand text-2xl text-tomato-dark sm:text-center">tanpa langganan</p>
          <h2 id="harga" className="font-display text-[2rem] font-semibold leading-tight sm:text-center sm:text-5xl">
            Sekali bayar per kado.
          </h2>
          <p className="mt-2 text-[15px] text-ink-2 sm:text-center">
            Semua template dan fitur sama. Bedanya cuma berapa lama link-nya aktif.
          </p>
          <div className="mx-auto mt-7 grid max-w-2xl gap-4 sm:grid-cols-2 sm:gap-6">
            {PLANS.map((p) =>
              p.popular ? (
                <div key={p.id} className="relative overflow-hidden rounded-[1.6rem] p-6 text-[#fff3dc] shadow-pop">
                  <div className="absolute inset-0 bg-[url('/art/bg-malam.webp')] bg-cover bg-[center_18%]" aria-hidden />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101736]/70 to-transparent" aria-hidden />
                  <div className="relative">
                    <span className="absolute right-0 top-0 rounded-full bg-butter px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink">
                      Disarankan
                    </span>
                    <div className="text-sm font-bold opacity-80">{p.name}</div>
                    <div className="font-display mt-1 text-[2.6rem] font-semibold leading-none">{rupiah(p.price)}</div>
                    <div className="mt-2 text-[15px] opacity-90">{p.note}</div>
                  </div>
                </div>
              ) : (
                <div key={p.id} className="paper-card rounded-[1.6rem] p-6">
                  <div className="text-sm font-bold text-ink-2">{p.name}</div>
                  <div className="font-display mt-1 text-[2.6rem] font-semibold leading-none">{rupiah(p.price)}</div>
                  <div className="mt-2 text-[15px] text-ink-2">{p.note}</div>
                </div>
              ),
            )}
          </div>
          <div className="mt-7 sm:text-center">
            <Link href="#template" className="btn btn-primary h-13 px-7 py-4 text-[15px]">
              Pilih template →
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-2xl sm:mt-28" aria-labelledby="faq">
          <h2 id="faq" className="font-display text-[2rem] font-semibold leading-tight sm:text-center sm:text-5xl">
            Yang sering ditanya
          </h2>
          <div className="paper-card mt-6 divide-y divide-line rounded-[1.6rem] px-5">
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
    </div>
  );
}
