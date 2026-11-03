'use client';
/**
 * Kışlık tahıl (buğday, arpa): çiftçi bu yıl kaç su vereceğini seçer; her suyla ne verileceği toprak analizine göre gösterilir.
 */
import { CloudRain, Droplets, FlaskConical, Leaf, Sprout } from 'lucide-react';
import { useState } from 'react';
import { SULAMA_YONTEMLERI, toplamMiktar, zamanCizelgesi, type SulamaYontemi } from '@/lib/sulama';
import { planAyari, planDipnotu, tahilPlani, type PlanAdimi, type PlanUrunu } from '@/lib/tahilSulama';
import type { SoilReport } from '@/lib/toprak';
import type { ZKart } from '@/lib/zkartlar';

const marka = (ad: string) => (/^KIANA/i.test(ad) ? 'KIANA' : 'İGSAŞ');

function UrunSatiri({ u, alan, kucuk = false }: { u: PlanUrunu; alan?: number | null; kucuk?: boolean }) {
  const m = marka(u.urun);
  const top = toplamMiktar(u.doz, alan);
  return (
    <li className={`rounded-xl bg-white px-3 py-2 ring-1 ring-[#1d2a22]/8 ${kucuk ? 'text-xs' : 'text-sm'}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${m === 'KIANA' ? 'bg-[#e6f4e4] text-[#1f6f4a]' : 'bg-[#e4eef5] text-[#2c5566]'}`}>{m}</span>
        <span className="font-semibold text-[#17352a]">{u.urun}</span>
        <span className="ml-auto font-bold tabular-nums text-[#1f7a45]">{u.doz}</span>
      </div>
      {(u.neden || top) && (
        <p className="mt-0.5 text-xs leading-5 text-[#6b7d72]">
          {u.neden}
          {u.neden && top ? ' · ' : ''}
          {top && <>tarlanız için {top}</>}
        </p>
      )}
    </li>
  );
}

function gubreBasligi(a: PlanAdimi, yontem: SulamaYontemi, pencere?: string) {
  switch (a.gubreYolu) {
    case 'ekim':
      return 'Ekimde, mibzerle tohumun yanına verin:';
    case 'suyla':
      if (yontem === 'pivot') return 'Bu suyla verin, pivot turu boyunca sabit oranda enjekte edin:';
      return pencere ? `Bu suyla verin; gübreyi sulamanın ${pencere} saatleri arasında enjekte edin:` : 'Bu suyla verin, gübreyi sulamanın orta bölümünde enjekte edin:';
    case 'serpip-sula':
      return 'Sulamadan hemen önce toprağa serpin, ardından sulayın:';
    case 'yagis-oncesi':
      return 'Bu dönemde su yok; yağıştan hemen önce serpin, yağmur toprağa işlesin:';
    default:
      return '';
  }
}

export function TahilSuPlani({
  zkart,
  yontem,
  sure,
  alan,
  report,
}: {
  zkart: ZKart;
  yontem: SulamaYontemi;
  sure?: number;
  alan?: number | null;
  report?: SoilReport | null;
}) {
  const ayar = planAyari(zkart.bitki);
  const secenekler = Array.from({ length: ayar.enCokSu + 1 }, (_, i) => i);
  const [su, setSu] = useState(yontem === 'kuru' ? 0 : ayar.varsayilanSu);
  const plan = tahilPlani(zkart, su, yontem, report);
  const dilim = sure ? zamanCizelgesi(yontem, sure)?.find((d) => d.tur === 'gubre') : undefined;
  const pencere = dilim && yontem !== 'pivot' ? `${dilim.bas}–${dilim.bit}` : undefined;
  const bitkiAd = zkart.bitki.toLocaleLowerCase('tr-TR');

  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7f9a]">Su sayısına göre gübre planı</p>
      <h4 className="mt-1 font-display text-2xl font-medium">Bu yıl {bitkiAd} tarlanıza kaç su vereceksiniz?</h4>
      <p className="mt-1 text-sm leading-6 text-[#4b5f55]">
        {ayar.giris} Seçiminize göre suların hangi döneme konacağı ve her suyla hangi gübrenin verileceği aşağıda değişir.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 print:hidden" role="radiogroup" aria-label="Su sayısı">
        {secenekler.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={su === n}
            onClick={() => setSu(n)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${su === n ? 'bg-[#2c6e8a] text-white' : 'bg-[#eef4f6] text-[#2c5566] hover:bg-[#e1edf1]'}`}
          >
            {n === 0 ? 'Sulamayacağım' : `${n} su`}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#7a877e]">{ayar.rehber}</p>

      {/* Hesabın dayanağı */}
      <div className={`mt-4 rounded-2xl p-4 ${plan.analizli ? 'bg-[#eef7ef]' : 'bg-[#f6efe2]'}`}>
        <p className="flex items-center gap-2 text-sm font-bold text-[#17352a]">
          <FlaskConical size={16} className="text-[#2f7a4f]" />
          {plan.analizli ? 'Toprak analizinize göre hesaplandı' : 'Toprak analizi olmadan, ortalama değerlerle hesaplandı'}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white px-2.5 py-1 text-[#17352a]">Azot (N) {plan.hedef.N} kg/da</span>
          <span className="rounded-full bg-white px-2.5 py-1 text-[#17352a]">Fosfor (P₂O₅) {plan.hedef.P2O5} kg/da</span>
          <span className="rounded-full bg-white px-2.5 py-1 text-[#17352a]">Potasyum (K₂O) {plan.hedef.K2O} kg/da</span>
          {plan.hedef.S !== undefined && <span className="rounded-full bg-white px-2.5 py-1 text-[#17352a]">Kükürt (S) ≈ {plan.hedef.S} kg/da</span>}
        </div>
        {plan.analizli ? (
          <ul className="mt-2 space-y-1 text-xs leading-5 text-[#3e5248]">
            {plan.nedenler.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f8f57]" />
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs leading-5 text-[#5a4a2a]">Toprak analizinizi eklerseniz fosfor, potasyum ve azot miktarları toprağınıza göre ayarlanır.</p>
        )}
      </div>

      <ol className="mt-5 space-y-3">
        {plan.adimlar.map((a) => {
          const suVar = a.su !== undefined;
          const bos = suVar && a.gubre.length === 0;
          return (
            <li key={a.evre} className={`flex gap-3 rounded-2xl p-3 sm:gap-4 sm:p-4 ${suVar ? 'bg-[#f1f7fa]' : 'bg-[#f8f7f2]'}`}>
              <span
                className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full text-center leading-none ${
                  suVar ? 'bg-[#2c6e8a] text-white' : 'bg-white text-[#6b7d72] ring-1 ring-[#e0dccf]'
                }`}
              >
                {suVar ? (
                  <>
                    <span className="font-display text-xl font-semibold">{a.su}.</span>
                    <span className="text-[10px] font-semibold">su</span>
                  </>
                ) : a.evre === 0 ? (
                  <Sprout size={22} />
                ) : (
                  <CloudRain size={22} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2 font-semibold text-[#17352a]">
                  {suVar ? `${a.su}. su · ` : ''}
                  {a.ad.charAt(0) + a.ad.slice(1).toLocaleLowerCase('tr-TR')}
                  <span className="text-xs font-normal text-[#7a877e]">{a.donem}</span>
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[#5b6f65]">
                  {a.evre === 0 && !suVar ? 'Ekim zamanı.' : a.tanima}
                  {!suVar && a.evre > 0 ? ' Bu dönemde su verilmiyor, yağışa bırakıldı.' : ''}
                </p>

                {a.gubre.length > 0 && (
                  <div className="mt-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1f6f4a]">
                      <Droplets size={13} /> {gubreBasligi(a, yontem, pencere)}
                    </p>
                    <ul className="mt-1.5 grid gap-2 sm:grid-cols-2">
                      {a.gubre.map((u) => (
                        <UrunSatiri key={u.urun} u={u} alan={alan} />
                      ))}
                    </ul>
                  </div>
                )}
                {bos && (
                  <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs text-[#2c5566] ring-1 ring-[#bcd6e2]">
                    Boş su: bu suyla gübre verilmez, yalnızca sulayın.
                  </p>
                )}
                {a.yaprak.length > 0 && (
                  <div className="mt-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#6a4f9c]">
                      <Leaf size={13} />{' '}
                      {a.evre === 0
                        ? 'Tohuma ve çıkıştan sonra yaprağa:'
                        : `Yapraktan${suVar ? ' (sulamadan sonra yapraklar kuruyunca, serin saatte)' : ' (rüzgârsız, serin bir saatte)'}:`}
                    </p>
                    <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                      {a.yaprak.map((u) => (
                        <UrunSatiri key={u.urun} u={u} alan={alan} kucuk />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-xs leading-5 text-[#7a877e]">
        {SULAMA_YONTEMLERI[yontem].ad}. Suyu, dönemin başladığını tarlada görünce verin; yağış olursa o suyu atlayın, dönemin gübresini de yağıştan
        hemen önce serpin. {planDipnotu(zkart.bitki)} Dozlar taslaktır,
        ziraat mühendisinizle birlikte son hâlini verin.
      </p>
    </div>
  );
}
