/**
 * Geçici İGSAŞ yazı logosu (resmî logo dosyası İGSAŞ'tan gelince bununla değiştirilecek).
 * İki biçim: tam (filiz işareti + "İGSAŞ" + "Toprak Asistanı") ve yalnız işaret (yuvarlak düğmeler için).
 * Renk: koyu yeşil #1C4734, vurgu parlak yeşil. `acik` açık zemin içindir; koyu zeminde beyaz yazılır.
 */
export function IgsasLogo({
  className = '',
  isaret = false,
  acik = false,
  baslik = 'İGSAŞ Toprak Asistanı',
  alt = 'Toprak Asistanı',
}: {
  className?: string;
  /** Yalnız filiz işareti */
  isaret?: boolean;
  /** Açık zemin (koyu yeşil yazı); varsayılan koyu zemin (beyaz yazı) */
  acik?: boolean;
  baslik?: string;
  /** Logonun alt satırı, arayüz dilinde ("Soil Assistant", "Bodenassistent" …) */
  alt?: string;
}) {
  const arapca = /[\u0600-\u06FF]/.test(alt);
  const altYazi = arapca ? alt : alt.toLocaleUpperCase(alt === 'Toprak Asistanı' ? 'tr-TR' : 'en-US');
  // Uzun alt satır logonun genişliğine sığsın
  const sigdir = altYazi.length > 15 ? { textLength: 158, lengthAdjust: 'spacingAndGlyphs' as const } : {};
  const yazi = acik ? '#1C4734' : '#ffffff';
  const filiz = (
    <g>
      <circle cx="24" cy="24" r="22" fill={acik ? '#1C4734' : 'rgba(255,255,255,0.12)'} stroke={acik ? 'none' : 'rgba(255,255,255,0.7)'} strokeWidth="1.5" />
      <path d="M24 36V22" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 25c0-6 4.5-10 11-10.5C34.5 21 30.5 25 24 25Z" fill="#3fbf6a" />
      <path d="M24 28c0-5-3.8-8.6-9.5-9C14.8 24.5 18.2 28 24 28Z" fill="#8fe3a9" />
      <path d="M15 36h18" stroke="#c9a24a" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
  if (isaret)
    return (
      <svg viewBox="0 0 48 48" className={className} role="img" aria-label={baslik}>
        {baslik && <title>{baslik}</title>}
        {filiz}
      </svg>
    );
  return (
    <svg viewBox="0 0 220 48" className={className} role="img" aria-label={baslik} direction="ltr" style={{ direction: 'ltr' }}>
      {baslik && <title>{baslik}</title>}
      {filiz}
      <text x="56" y="27" fill={yazi} fontFamily="'Plus Jakarta Sans Variable', system-ui, sans-serif" fontWeight="800" fontSize="24" letterSpacing="1">
        İGSAŞ
      </text>
      <text x="57" y="42" fill={yazi} opacity="0.85" fontFamily="'Plus Jakarta Sans Variable', system-ui, sans-serif" fontWeight="600" fontSize={arapca ? 13 : 11} letterSpacing={arapca ? 0 : 2.2} {...sigdir}>
        {altYazi}
      </text>
    </svg>
  );
}
