'use client';
/**
 * Hesap açmadan görülebilen örnek rapor (/ornek). Değerler gerçekçi bir mısır tarlasından;
 * öneriler sabit (yapay zekâ çağrılmaz, ücret oluşmaz).
 */
import { useDil } from '@/components/DilSaglayici';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SonucEkrani } from '@/components/analiz/Sonuc';
import type { SoilReport } from '@/lib/toprak';
import type { CozumPlani } from '@/lib/veri';

const RAPOR: SoilReport = {
  bitki: 'Mısır (dane)',
  bunyeSinifi: 'CL (Killi Tın Bünyeli)',
  values: { doygunluk: 58, ph: 7.9, ec: 0.9, tuz: 0.03, kum: 32, silt: 36, kil: 32, kirec: 18.5, organikMadde: 1.4, fosfor: 9.2, potasyum: 48, cinko: 0.4, demir: 3.1, bor: 0.9 },
  labDegerlendirme: { ph: 'Hafif alkali', tuz: 'Tuzsuz', kirec: 'Fazla kireçli', organikMadde: 'Az', fosfor: 'Orta', potasyum: 'Yeterli' },
};

const PLAN: CozumPlani = {
  ozet: 'Killi tın bünyeli, hafif alkali (pH 7,9) ve fazla kireçli (%18,5) bir toprak. Tuzluluk sorunu yok; su ve hava dengesi mısır için uygun. Verimi sınırlayan üç konu öne çıkıyor: organik madde düşük (%1,4), çinko ve demir yetersiz. Yüksek kireç bu iki elementin bitkiye geçişini zorlaştırıyor. Organik madde yükseltilir, çinko ve demir yapraktan şelatlı olarak verilirse verimde belirgin artış beklenir.',
  sorunlar: [
    {
      parametre: 'Organik madde',
      etki: 'Toprak suyu ve besini tutamaz, kök gelişimi zayıf kalır.',
      urunler: [
        { urun: 'LEONARDİT GRANÜL', doz: '300–400 kg/da' },
        { urun: 'HÜMİK ASİT', doz: 'Toplam 10–15 L/da' },
      ],
      zaman: 'LEONARDİT GRANÜL ekim öncesi tohum yatağına; HÜMİK ASİT sezon boyunca damla ile, bölünerek',
    },
    {
      parametre: 'Çinko ve demir',
      etki: 'Kireçli toprakta ikisi de bağlanır; genç yapraklarda sararma ve beyaz şeritler, boğum aralarında kısalma görülür.',
      urunler: [
        { urun: 'EDTA Zn-Mn', doz: '200–250 cc/da' },
        { urun: 'KOMBİ', doz: '150 g/da' },
      ],
      zaman: 'Çıkıştan sonra ve V6–V8 döneminde yapraktan; KOMBİ demiri ve diğer mikro elementleri birlikte verir',
    },
  ],
  kokGelisimi: [
    { urun: 'KIANA EARTH PLUS', doz: '200 g/da', aciklama: 'Kök bölgesine yararlı mikroorganizma taşır, kök gelişimini ve besin alımını artırır; ekim-çıkış döneminde damla ile.' },
    { urun: 'MOL-50', doz: '1–1,5 L/da', aciklama: 'Kökte besin alımını destekler; ekim-çıkış döneminde damla ile.' },
  ],
  iklimKoruma: [
    { urun: 'KIANA CLIMATE PLUS', doz: '200–300 g/da', aciklama: 'Püskül ve koçan püskülü döneminde (Haziran-Temmuz) beklenen sıcak dalgasından 5–10 gün önce yapraktan.' },
  ],
  gubreleme: [
    { urun: 'NPK 12-40-12', doz: '3–4 kg/da', aciklama: 'Fosfor orta seviyede ve kireç yüksek; ekim-çıkış döneminde damla dozunu üst sınırdan, 4 kg/da uygulayın.' },
    { urun: 'UAN-32', doz: '14–18 L/da', aciklama: 'V6–V8 döneminin azotu; her gübreli suya bölerek damla ile verin.' },
  ],
  sulamaNotlari: ['6 saatlik damla sulamada gübreleri 1:30–4:30 penceresinde verin; ilk 1,5 saat yalnızca su, son 1,5 saat temiz su.'],
  bolgeNotu: 'Konya topraklarında pH genellikle yüksektir ve çinko eksikliği yaygındır; bu analizde de kireç yüksek, bu yüzden çinko uygulaması öne çıkıyor. Kireçli toprakta çinkoyu yapraktan EDTA Zn-Mn ile vermek en hızlı yoldur.',
  bitkiUygunlugu: 'Mısır bu toprakta iyi gelişir; organik madde desteğiyle verim belirgin şekilde artar.',
};

const kayit = '/giris?sonra=%2Ftarlalar%2Fyeni';

export function OrnekRapor() {
  // Örnek plan Türkçe yazılır; diğer dillerde metinler lib/ceviri-igsas.ts sözlüğünden çevrilir, dozlar hektara döner
  const { t: tx } = useDil();
  return (
    <SonucEkrani
      report={RAPOR}
      ai={PLAN}
      aiState="idle"
      onRetryAi={() => {}}
      tarla={{ ad: tx("Örnek Tarla"), bitki: 'Mısır (dane)', sulama: 'damla', alan_dekar: 25, sulama_suresi_saat: 6, konum: tx("Konya / Karatay"), il: 'Konya' }}
      baslikUstu={
        <div className="flex flex-col gap-3 rounded-[24px] bg-[#1d2a22] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-display text-xl">{tx("Bu bir örnek rapor.")}</p>
            <p className="mt-1 text-sm text-white/70">{tx("Kendi laboratuvar raporunuzu yükleyin, tarlanıza özel bu raporu birkaç saniyede alın.")}</p>
            <Link href="/ornek/su" className="mt-2 inline-block text-sm font-semibold text-[#7fd3f7] hover:text-white">{tx("Örnek su karnesine de bakın →")}</Link>
          </div>
          <Link href={kayit} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#f5f0e6] px-5 py-3 font-semibold text-[#121410] hover:bg-white">
            
            {tx("Ücretsiz başla")}{' '}<ArrowRight size={18} />
          </Link>
        </div>
      }
      eylemler={
        <>
          <Link href={kayit} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#238f61] px-6 py-3.5 font-semibold text-white hover:bg-[#1d7d54]">
            
            {tx("Kendi raporumu oluştur")}{' '}<ArrowRight size={18} />
          </Link>
          <Link href="/ornek/su" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f5a73] px-6 py-3.5 font-semibold text-white hover:bg-[#0b3a52]">
            
            {tx("Örnek su karnesi")}{' '}<ArrowRight size={18} />
          </Link>
        </>
      }
    />
  );
}
