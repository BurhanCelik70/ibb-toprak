/** Sunucuda geçerli dili bulur: `dil` çerezi; yoksa İngilizce (ilk giriş evrensel dilde açılır). */
import { cookies } from 'next/headers';
import { sozluk } from './ceviri';
import { ceviriFonk } from './i18n';
import { DIL_COOKIE, dilGecerli, VARSAYILAN_DIL, type Dil } from './dil';

export async function dilAl(): Promise<Dil> {
  const cerez = (await cookies()).get(DIL_COOKIE)?.value;
  if (dilGecerli(cerez)) return cerez;
  return VARSAYILAN_DIL;
}

export async function ceviriAl() {
  const dil = await dilAl();
  return { dil, t: sozluk(dil), tx: ceviriFonk(dil) };
}
