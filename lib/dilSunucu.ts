/** Sunucuda geçerli dili bulur: önce `dil` çerezi, yoksa tarayıcının dili (Accept-Language). */
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
