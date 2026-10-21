import type { MetadataRoute } from 'next';
import { MARKA } from '@/lib/marka';

/** Telefona "Ana ekrana ekle / Uygulamayı yükle" için. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: MARKA.ad,
    short_name: MARKA.ad,
    description: MARKA.aciklama,
    start_url: '/tarlalar',
    display: 'standalone',
    background_color: '#f4f7f1',
    theme_color: '#1f6f4a',
    lang: 'tr',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
