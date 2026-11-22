import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { I18nProvider } from '@/i18n/client';
import { HTML_LANG, LOCALES, OG_LOCALE } from '@/i18n/config';
import { dictOf } from '@/i18n/server';
import { SITE } from '@/lib/site';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { locale, t } = await dictOf(params);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: t.meta.title, template: `%s · ${SITE.name}` },
    description: t.meta.description,
    openGraph: { siteName: SITE.name, type: 'website', locale: OG_LOCALE[locale] },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fbf6ee',
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { locale, t } = await dictOf(params);
  return (
    <html lang={HTML_LANG[locale]}>
      <body>
        <I18nProvider locale={locale} dict={t}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
