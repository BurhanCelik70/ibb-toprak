/**
 * Uygulamanın marka bilgileri. Ad, slogan ve iletişim tek yerden değişir.
 * İleride firmalar için kendi logolarıyla sürüm çıkarılırken bu dosya kopyalanıp değiştirilir.
 */
export const MARKA = {
  ad: 'İGSAŞ Toprak Asistanı',
  /** Dar yerler için (telefon ana ekranı, sekme) */
  kisa: 'İGSAŞ',
  /** Logoda iki satır: üst satır ve alt satır; sürüm alt satırın sonunda vurgulanır */
  logoSatirlari: ['İGSAŞ', 'Toprak Asistanı'] as const,
  surum: '',
  slogan: 'Toprağınızı tanıyın, bereketi büyütün',
  aciklama:
    'Toprak analiz raporunuzu yükleyin; hangi İGSAŞ gübresini ne zaman ve dekara ne kadar vereceğinizi, sulama yönteminize göre dönem dönem görün.',
  kurum: 'Yeditepe Üniversitesi',
  /** İş birliği yapılan kurum (footer'da marka adının altında) */
  isbirligi: 'İstanbul Gübre Sanayii A.Ş. (İGSAŞ)',
  ekip: ['Prof. Dr. Metin Turan', 'Asistan Burhan Çelik'],
  eposta: 'celikburhan56@gmail.com', // ör. destek@ornek.com — boşsa gösterilmez
  telefon: '+90 542 677 0885', // ör. +90 5xx xxx xx xx — boşsa gösterilmez
};
