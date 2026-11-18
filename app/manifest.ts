import type { MetadataRoute } from 'next';
import { MARKA, markaAdi } from '@/lib/marka';
import { sozluk } from '@/lib/ceviri';
import { dilAl } from '@/lib/dilSunucu';

/** Telefona "Ana ekrana ekle / Uygulamayı yükle" için. Ad ve açıklama ziyaretçinin dilinde. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const dil = await dilAl();
  return {
    name: markaAdi(dil),
    short_name: MARKA.kisa,
    description: sozluk(dil).marka.aciklama,
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f7f1',
    theme_color: '#1f6f4a',
    lang: dil,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
