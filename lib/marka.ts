/**
 * Uygulamanın marka bilgileri. Ad, slogan ve iletişim tek yerden değişir.
 * İleride firmalar için kendi logolarıyla sürüm çıkarılırken bu dosya kopyalanıp değiştirilir.
 */
export const MARKA = {
  ad: 'Tarım Ticareti ve İşletmeciliği 4.0',
  /** Dar yerler için (telefon ana ekranı, sekme) */
  kisa: 'Tarım 4.0',
  /** Logoda iki satır: üst satır ve alt satır; sürüm alt satırın sonunda vurgulanır */
  logoSatirlari: ['Tarım Ticareti ve', 'İşletmeciliği'] as const,
  surum: '4.0',
  slogan: 'Yapay zekâ destekli toprak analizi ve gübreleme asistanı',
  aciklama:
    'Toprak analiz raporunuzu yükleyin; tarlanızın kalite indeksini, eksiklerini ve sulama yönteminize göre dönem dönem gübreleme reçetesini görün.',
  kurum: 'Yeditepe Üniversitesi',
  /** İş birliği yapılan kurum (footer'da marka adının altında) */
  isbirligi: 'İBB Çevre Koruma ve Kontrol Dairesi Başkanlığı',
  ekip: ['Prof. Dr. Metin Turan', 'Asistan Burhan Çelik'],
  eposta: 'celikburhan56@gmail.com', // ör. destek@ornek.com — boşsa gösterilmez
  telefon: '+90 542 677 0885', // ör. +90 5xx xxx xx xx — boşsa gösterilmez
};
