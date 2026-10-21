/**
 * Sonuç ekranında gösterilecek YouTube videoları.
 * "bitki" boş bırakılırsa video her raporda gösterilir; doluysa yalnızca o bitkide (Z-kart adıyla, ör. "Elma").
 * Örnek: { baslik: 'Don önleme: KIANA CLIMATE PLUS', url: 'https://www.youtube.com/watch?v=XXXXXXXXXXX' }
 */
export type Video = { baslik: string; url: string; bitki?: string };

export const VIDEOLAR: Video[] = [];

/** youtube.com/watch?v=…, youtu.be/…, youtube.com/shorts/… adreslerinden video kimliğini çıkarır. */
export function youtubeId(url: string): string | undefined {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m?.[1];
}
