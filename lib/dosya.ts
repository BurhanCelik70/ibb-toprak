/**
 * Yükleme yardımcıları (tarayıcıda çalışır).
 * Vercel sunucu fonksiyonları 4,5 MB'tan büyük isteği reddeder; telefon fotoğrafları çoğu zaman bundan büyüktür.
 * Bu yüzden fotoğraflar göndermeden önce küçültülür (ayrıca iPhone HEIC fotoğrafları JPEG'e çevrilmiş olur).
 */
const SINIR = 4 * 1024 * 1024;

async function resmiKucult(file: File, uzunKenar: number): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, hata) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => hata(new Error('Fotoğraf açılamadı. JPG ya da PNG bir fotoğraf deneyin.'));
      i.src = url;
    });
    const k = Math.min(1, uzunKenar / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob>((ok, hata) => c.toBlob((b) => (b ? ok(b) : hata(new Error('Fotoğraf hazırlanamadı.'))), 'image/jpeg', 0.88));
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Rapor dosyasını sunucuya göndermeye hazırlar: fotoğrafı küçültür, büyük PDF'te anlaşılır hata verir. */
export async function raporDosyasiHazirla(file: File): Promise<File> {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    if (file.size > SINIR) throw new Error('PDF 4 MB’tan büyük. Raporun fotoğrafını çekin ya da sayfanın ekran görüntüsünü yükleyin.');
    return file;
  }
  if (file.type.startsWith('image/') || /\.(heic|heif|jpe?g|png|webp)$/i.test(file.name)) {
    // Rapor yazısı okunabilsin diye uzun kenar 2200 px
    return resmiKucult(file, 2200);
  }
  return file;
}

/** fetch cevabını güvenle JSON'a çevirir; sunucu HTML hata sayfası döndürürse anlaşılır mesaj verir. */
export async function jsonOku<T = unknown>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    if (res.status === 413) throw new Error('Dosya çok büyük. Daha küçük bir dosya ya da fotoğraf deneyin.');
    if (res.status === 504) throw new Error('İşlem çok uzun sürdü. Biraz sonra tekrar deneyin.');
    throw new Error('Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
  }
}
