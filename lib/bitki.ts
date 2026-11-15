/** Kullanıcının yazdığı bitki adını programdaki (Z-kart) bitkiyle eşleştirir. */
import { ZKARTLAR, type ZKart } from './zkartlar';

const norm = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z ]/g, ' ')
    .trim();

const ESANLAMLI: Record<string, string> = {
  bugday: 'Buğday', arpa: 'Arpa', susam: 'Susam', aycicegi: 'Ayçiçeği', misir: 'Mısır (dane)',
  celtik: 'Çeltik (pirinç)', pirinc: 'Çeltik (pirinç)', pamuk: 'Pamuk', seker: 'Şeker pancarı', pancar: 'Şeker pancarı',
  tutun: 'Tütün', nar: 'Nar', uzum: 'Üzüm (bağ)', bag: 'Üzüm (bağ)', elma: 'Elma', seftali: 'Şeftali / nektarin',
  nektarin: 'Şeftali / nektarin', kayisi: 'Kayısı', findik: 'Fındık', narenciye: 'Narenciye (mandalina)',
  mandalina: 'Narenciye (mandalina)', portakal: 'Narenciye (mandalina)', limon: 'Narenciye (mandalina)',
  incir: 'İncir', zeytin: 'Zeytin', patates: 'Patates', domates: 'Domates', salatalik: 'Salatalık', hiyar: 'Salatalık',
  sogan: 'Soğan', cay: 'Çay',
  kanola: 'Kanola', kolza: 'Kanola', bezelye: 'Bezelye',
};

export function zkartBul(bitki?: string): ZKart | undefined {
  if (!bitki) return undefined;
  const words = norm(bitki).split(/\s+/);
  for (const w of words) {
    const hit = ESANLAMLI[w];
    if (hit) return ZKARTLAR.find((z) => z.bitki === hit);
  }
  return undefined;
}

export const ZKART_BITKILERI = ZKARTLAR.map((z) => z.bitki);

export { ZKARTLAR };
