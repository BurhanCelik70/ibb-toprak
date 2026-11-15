import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';
import { sozluk } from '@/lib/ceviri';
import { DILLER } from '@/lib/dil';
import { dilAl } from '@/lib/dilSunucu';
import { DilSaglayici } from '@/components/DilSaglayici';
import { MARKA } from '@/lib/marka';
import { SITE_URL } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
  const dil = await dilAl();
  const { marka } = sozluk(dil);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${MARKA.ad} · ${marka.slogan}`, template: `%s · ${MARKA.ad}` },
    description: marka.aciklama,
    applicationName: MARKA.ad,
    authors: [{ name: `${MARKA.kurum} · ${MARKA.ekip.join(', ')}` }],
    openGraph: {
      type: 'website',
      locale: DILLER[dil].og,
      siteName: MARKA.ad,
      title: `${MARKA.ad} · ${marka.slogan}`,
      description: marka.aciklama,
      images: [{ url: '/logo.png', width: 512, height: 512, alt: MARKA.ad }],
    },
    appleWebApp: { capable: true, title: MARKA.kisa, statusBarStyle: 'default' },
  };
}

export const viewport: Viewport = {
  themeColor: '#1f6f4a',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const dil = await dilAl();
  return (
    <html lang={dil} dir={DILLER[dil].yon} className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col bg-[#f4f7f1] text-[#17352a]">
        <DilSaglayici dil={dil}>{children}</DilSaglayici>
      </body>
    </html>
  );
}
