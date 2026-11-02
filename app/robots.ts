import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Arama motorları: herkese açık sayfalar taransın; API ve giriş akışı taranmasın. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/auth/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
