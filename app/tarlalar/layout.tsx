import type { Metadata } from 'next';

/** Tarlalar kişiye özeldir; arama motorlarında görünmesin. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function TarlalarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
