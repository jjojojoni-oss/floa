import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { LOCALES } from '@/i18n/config';
import { localeOf } from '@/i18n/server';
import { TEMPLATES, getTemplate } from '@/templates/registry';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => TEMPLATES.map((t) => ({ lang, id: t.id })));
}

type P = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { id } = await params;
  const t = getTemplate(id, await localeOf(params));
  return t ? { title: t.name, description: t.tagline, robots: { index: false } } : {};
}

export default async function BuatPage({ params }: P) {
  const { id } = await params;
  if (!getTemplate(id)) notFound();
  return <Editor templateId={id} />;
}
