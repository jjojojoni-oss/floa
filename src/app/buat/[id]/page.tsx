import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { TEMPLATES, getTemplate } from '@/templates/registry';

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = getTemplate(id);
  return t ? { title: `Buat ${t.name}`, description: t.tagline, robots: { index: false } } : {};
}

export default async function BuatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getTemplate(id)) notFound();
  return <Editor templateId={id} />;
}
