import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GiftFrame } from '@/components/GiftFrame';
import { LOCALES } from '@/i18n/config';
import { dictOf } from '@/i18n/server';
import { TemplatePlayer } from '@/templates/Player';
import { TEMPLATES, getTemplate } from '@/templates/registry';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => TEMPLATES.map((t) => ({ lang, id: t.id })));
}

type P = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { id } = await params;
  const { locale, t: d } = await dictOf(params);
  const t = getTemplate(id, locale);
  return t ? { title: `${d.demo.titlePrefix} ${t.name}`, description: t.tagline } : {};
}

export default async function DemoPage({ params }: P) {
  const { id } = await params;
  const { locale, t: d } = await dictOf(params);
  const t = getTemplate(id, locale);
  if (!t) notFound();

  return (
    <GiftFrame
      bg={t.palette.bg}
      footer={
        <div className="relative z-10 flex w-full items-center gap-2 bg-paper px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--color-line)] sm:mt-4 sm:w-auto sm:rounded-full sm:py-2.5 sm:pl-2.5 sm:pr-2.5 sm:shadow-pop">
          <Link href="/" className="btn btn-ghost h-12 w-12 flex-none text-lg sm:w-auto sm:px-4 sm:text-sm" aria-label={d.demo.back}>
            ←<span className="max-sm:hidden">{d.demo.others}</span>
          </Link>
          <div className="px-2 max-sm:hidden">
            <div className="text-sm font-bold leading-tight">{t.name}</div>
            <div className="text-xs text-muted">{d.demo.note}</div>
          </div>
          <Link href={`/buat/${t.id}`} className="btn btn-primary h-12 flex-1 px-5 text-[15px] sm:flex-none">
            {d.demo.use}
          </Link>
        </div>
      }
    >
      <TemplatePlayer id={t.id} data={t.sample} mode="demo" />
    </GiftFrame>
  );
}
