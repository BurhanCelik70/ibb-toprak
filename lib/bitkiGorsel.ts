/**
 * Bitkiye göre büyüme görselleri.
 * İki tür set var:
 *  - video: tohumdan hasada kareler (001.webp … 097.webp)
 *  - evre: programdaki her evre için bir resim (1.webp, 2.webp …); evre sayısı Z-karttaki ile aynı olmalı
 * Seti olmayan bitkilerde görsel yerine toprak + büyüyen filiz simgesi gösterilir (yanlış bitki göstermemek için).
 */
import { zkartBul } from './igsas';

type GorselSeti = { klasor: string; kare: number; tur?: 'video' | 'evre' };

/** Z-kart bitki adı → görsel seti */
const SETLER: Record<string, GorselSeti> = {
  Buğday: { klasor: '/buyume', kare: 97 },
  Arpa: { klasor: '/buyume', kare: 97 }, // buğdaya çok benzer; arpa videosu gelince değiştirin
  // Evre başına resim (public/bitkiler/<klasor>/1.webp … n.webp; n = Z-karttaki evre sayısı)
  'Mısır (dane)': { klasor: '/bitkiler/misir', kare: 5, tur: 'evre' },
};

export function gorselSeti(bitki?: string | null): GorselSeti | undefined {
  const z = zkartBul(bitki ?? undefined);
  return z ? SETLER[z.bitki] : undefined;
}

const yol = (s: GorselSeti, n: number) => `${s.klasor}/${String(Math.min(s.kare, Math.max(1, Math.round(n)))).padStart(3, '0')}.webp`;

/** Programdaki i. evre (toplam n evre) için görsel; set yoksa undefined. */
export function evreGorseli(bitki: string | null | undefined, i: number, n: number): string | undefined {
  const s = gorselSeti(bitki);
  if (!s) return undefined;
  if (s.tur === 'evre') return `${s.klasor}/${Math.min(s.kare, i + 1)}.webp`;
  const oran = n > 1 ? i / (n - 1) : 0.5;
  return yol(s, 4 + oran * (s.kare - 4));
}

/**
 * Analiz ekleme adımlarındaki başlık görseli (0–1 ilerleme).
 * Seti olmayan bitkide yalnızca toprak ve ilk filiz kareleri kullanılır (her bitkide benzer görünür).
 */
export function adimGorseli(bitki: string | null | undefined, ilerleme: number): string {
  const s = gorselSeti(bitki);
  if (s?.tur === 'evre') return `${s.klasor}/${Math.max(1, Math.min(s.kare - 1, Math.ceil(ilerleme * (s.kare - 1))))}.webp`;
  if (s) return yol(s, 2 + ilerleme * (s.kare * 0.85));
  return yol({ klasor: '/buyume', kare: 97 }, 2 + ilerleme * 24);
}
