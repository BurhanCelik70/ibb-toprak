import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';
import { MARKA } from '@/lib/marka';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${MARKA.ad} · ${MARKA.slogan}`, template: `%s · ${MARKA.ad}` },
  description: MARKA.aciklama,
  applicationName: MARKA.ad,
  authors: [{ name: `${MARKA.kurum} · ${MARKA.ekip.join(', ')}` }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: MARKA.ad,
    title: `${MARKA.ad} · ${MARKA.slogan}`,
    description: MARKA.aciklama,
    images: [{ url: '/logo.png', width: 512, height: 512, alt: MARKA.ad }],
  },
  appleWebApp: { capable: true, title: MARKA.kisa, statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#1f6f4a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col bg-[#f4f7f1] text-[#17352a]">{children}</body>
    </html>
  );
}
