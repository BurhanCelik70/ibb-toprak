'use client';
/**
 * Dünya tarlasının (NASA POWER) iklimini, içindeki bileşenler çizilmeden önce istemcideki iklim tablolarına kaydeder.
 * Böylece su ihtiyacı, sulama takvimi ve PAR kartı Türkiye illerindeki gibi çalışır. Sunucu sayfası veriyi
 * dunyaIklimleri() ile alıp buraya verir; Türkiye/Almanya/İspanya tarlalarında iklim boştur ve hiçbir şey yapılmaz.
 */
import type { ReactNode } from 'react';
import { iklimKaydet, type DunyaIklimi } from '@/lib/dunya';

export function IklimKaydi({ iklim, children }: { iklim: Record<string, DunyaIklimi | null>; children: ReactNode }) {
  for (const [il, v] of Object.entries(iklim)) iklimKaydet(il, v);
  return <>{children}</>;
}
