import { Catalog } from '@/components/Catalog';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { fmt } from '@/i18n/fmt';
import { dictOf } from '@/i18n/server';
import { cheapestLabel } from '@/lib/site';

const STEP_ART = ['kuncup-pink', 'bunga-kamboja', 'pita'];

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { locale, t } = await dictOf(params);
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
            {t.home.h1a}{' '}
            <span className="relative inline-block whitespace-nowrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/sapuan.webp" alt="" className="absolute -bottom-[0.18em] left-[-6%] w-[112%] max-w-none opacity-90" />
              <em className="font-hand relative px-1 text-[1.22em] font-bold not-italic leading-none text-tomato-dark">{t.home.h1b}</em>
            </span>
            .
          </h1>
          <p className="mt-3 max-w-[19rem] text-[15px] font-medium leading-snug text-ink-2 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg">
            {t.home.sub}
          </p>
          <ul className="mt-3.5 flex flex-wrap gap-1.5 text-[12px] font-bold sm:mt-6 sm:justify-center sm:text-[13px]">
            {t.home.chips.map((c) => (
              <li key={c} className="glass rounded-full px-3 py-1.5">
                {fmt(c, { price: cheapestLabel(locale) })}
              </li>
            ))}
          </ul>
        </section>

        <Catalog />

        <section className="mt-20 sm:mt-28" aria-labelledby="cara">
          <p className="font-hand text-2xl text-tomato-dark sm:text-center">{t.home.stepsEyebrow}</p>
          <h2 id="cara" className="font-display text-[2rem] font-semibold leading-tight sm:text-center sm:text-5xl">
            {t.home.stepsTitle}
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {t.home.steps.map((s, i) => (
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

        <section className="mx-auto mt-20 max-w-2xl sm:mt-28" aria-labelledby="faq">
          <h2 id="faq" className="font-display text-[2rem] font-semibold leading-tight sm:text-center sm:text-5xl">
            {t.home.faqTitle}
          </h2>
          <div className="paper-card mt-6 divide-y divide-line rounded-[1.6rem] px-5">
            {t.home.faq.map((f) => (
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
