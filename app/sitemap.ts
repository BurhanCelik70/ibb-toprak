import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Google'a tanıtılan herkese açık sayfalar. */
export default function sitemap(): MetadataRoute.Sitemap {
  const simdi = new Date();
  const sayfalar: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
    ['', 1, 'weekly'],
    ['/noksanliklar', 0.9, 'weekly'],
    ['/noksanliklar/teshis', 0.8, 'monthly'],
    ['/ornek', 0.8, 'monthly'],
    ['/ornek/su', 0.7, 'monthly'],
    ['/gizlilik', 0.3, 'yearly'],
  ];
  return sayfalar.map(([yol, priority, changeFrequency]) => ({ url: `${SITE_URL}${yol}`, lastModified: simdi, changeFrequency, priority }));
}
