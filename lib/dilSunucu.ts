/**
 * Sunucuda geçerli dili bulur:
 * 1) ziyaretçi daha önce dil seçtiyse `dil` çerezi,
 * 2) yoksa tarayıcının dili (Accept-Language): Türk çiftçi Türkçe, Alman Almanca görür,
 * 3) tarayıcı dili desteklenmiyorsa İngilizce (VARSAYILAN_DIL).
 */
import { cookies, headers } from 'next/headers';
import { sozluk } from './ceviri';
import { ceviriFonk } from './i18n';
import { DIL_COOKIE, dilGecerli, tarayicidanDil, type Dil } from './dil';

export async function dilAl(): Promise<Dil> {
  const cerez = (await cookies()).get(DIL_COOKIE)?.value;
  if (dilGecerli(cerez)) return cerez;
  return tarayicidanDil((await headers()).get('accept-language'));
}

export async function ceviriAl() {
  const dil = await dilAl();
  return { dil, t: sozluk(dil), tx: ceviriFonk(dil) };
}
