'use client';
/**
 * Kışlık tahıl (buğday, arpa): çiftçi bu yıl kaç su vereceğini seçer; her suyla ne verileceği toprak analizine göre gösterilir.
 */
import { useTx } from '@/components/DilSaglayici';
import type { Ceviri } from '@/lib/i18n';
import { CloudRain, Droplet, Droplets, FlaskConical, Leaf, Sprout } from 'lucide-react';
import { evreGorseli } from '@/lib/bitkiGorsel';
import { urunBilgisi } from '@/lib/igsas';
import { BESIN_KIMLIK, UrunRozeti } from './RaporParcalari';
import { useState } from 'react';
import { SULAMA_YONTEMLERI, toplamMiktar, zamanCizelgesi, type SulamaYontemi } from '@/lib/sulama';
import { planAyari, planDipnotu, tahilPlani, type PlanAdimi, type PlanUrunu } from '@/lib/tahilSulama';
import type { SoilReport } from '@/lib/toprak';
import type { ZKart } from '@/lib/zkartlar';

function UrunSatiri({ u, alan, koyu = false }: { u: PlanUrunu; alan?: number | null; koyu?: boolean }) {
  const tx = useTx();
  const top = toplamMiktar(u.doz, alan);
  const besin = urunBilgisi(u.urun).besin;
  return (
    <li className={`rounded-xl px-3 py-2 text-sm ${koyu ? 'bg-white/[0.07] ring-1 ring-white/10' : 'bg-white ring-1 ring-[#1d2a22]/8'}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <UrunRozeti ad={u.urun} koyu={koyu} />
        <span className={`font-semibold ${koyu ? 'text-white' : 'text-[#17352a]'}`}>{tx(u.urun)}</span>
        <span className={`ml-auto font-bold tabular-nums ${koyu ? 'text-[#8fe3a9]' : 'text-[#1f7a45]'}`}>{tx.doz(u.doz)}</span>
      </div>
      {(u.neden || top) && (
        <p className={`mt-0.5 text-xs leading-5 ${koyu ? 'text-white/55' : 'text-[#6b7d72]'}`}>
          {tx(u.neden)}
          {u.neden && top ? ' · ' : ''}
          {top && <>{tx("tarlanız için")}{' '}{tx(top)}{besin ? tx(" saf besin") : ''}</>}
        </p>
      )}
    </li>
  );
}

function gubreBasligi(a: PlanAdimi, yontem: SulamaYontemi, tx: Ceviri, pencere?: string) {
  switch (a.gubreYolu) {
    case 'ekim':
      return tx('Ekimde, mibzerle tohumun yanına verin:');
    case 'suyla':
      if (yontem === 'pivot') return tx('Bu suyla verin, pivot turu boyunca sabit oranda enjekte edin:');
      return pencere ? tx('Bu suyla verin; gübreyi sulamanın {a} saatleri arasında enjekte edin:', { a: pencere }) : tx('Bu suyla verin, gübreyi sulamanın orta bölümünde enjekte edin:');
    case 'serpip-sula':
      return tx('Sulamadan hemen önce toprağa serpin, ardından sulayın:');
    case 'yagis-oncesi':
      return tx('Bu dönemde su yok; yağıştan hemen önce serpin, yağmur toprağa işlesin:');
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
  const tx = useTx();
  const ayar = planAyari(zkart.bitki);
  const secenekler = Array.from({ length: ayar.enCokSu + 1 }, (_, i) => i);
  const [su, setSu] = useState(yontem === 'kuru' ? 0 : ayar.varsayilanSu);
  const plan = tahilPlani(zkart, su, yontem, report);
  const dilim = sure ? zamanCizelgesi(yontem, sure)?.find((d) => d.tur === 'gubre') : undefined;
  const pencere = dilim && yontem !== 'pivot' ? `${dilim.bas}–${dilim.bit}` : undefined;
  const bitkiAd =
    tx.dil === 'tr' ? zkart.bitki.toLocaleLowerCase('tr-TR') : tx.dil === 'de' ? tx(zkart.bitki) : tx(zkart.bitki).toLocaleLowerCase(tx.dil);

  const hedefler = (
    [
    ['Azot (N)', plan.hedef.N],
    ['Fosfor (P₂O₅)', plan.hedef.P2O5],
    ['Potasyum (K₂O)', plan.hedef.K2O],
    ...(plan.hedef.S !== undefined ? [['Kükürt (S)', plan.hedef.S] as const] : []),
    ] as const
  ).filter(([, kg]) => kg > 0);

  return (
    <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-[#1d2a22]/8">
      <div className="p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7f9a]">{tx("Yağışa göre sulama ve besin planı")}</p>
        <h4 className="mt-1 max-w-[30ch] font-display text-2xl font-medium leading-snug sm:text-3xl">
          {tx('Bu yıl {a} tarlanıza kaç su verebileceksiniz?', { a: bitkiAd })}
        </h4>
        <p className="mt-2 max-w-[70ch] text-sm leading-6 text-[#5b6f65]">{tx(ayar.giris)}</p>

        <div className="mt-5 flex flex-wrap gap-2 print:hidden" role="radiogroup" aria-label={tx("Su sayısı")}>
          {secenekler.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={su === n}
              onClick={() => setSu(n)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                su === n ? 'bg-[#17352a] text-white shadow-[0_10px_24px_-14px_rgba(23,53,42,.9)]' : 'bg-[#f1efe8] text-[#476456] hover:bg-[#e7e3d8]'
              }`}
            >
              {n === 0 ? (
                <CloudRain size={16} />
              ) : (
                <span className="flex gap-0.5" aria-hidden>
                  {Array.from({ length: n }, (_, i) => (
                    <Droplet key={i} size={13} className={su === n ? 'fill-[#7fc8ec] text-[#7fc8ec]' : 'fill-[#8fbcd2] text-[#8fbcd2]'} />
                  ))}
                </span>
              )}
              {n === 0 ? tx("Yalnızca yağış") : tx("{a} su", { a: n })}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#7a877e]">{tx(ayar.rehber)}</p>

        {/* Hedef besin ve dayanağı */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hedefler.map(([ad, kg]) => {
            const k = BESIN_KIMLIK[ad];
            return (
              <div key={ad} className="relative overflow-hidden rounded-2xl p-4" style={{ background: `${k.renk}0f`, boxShadow: `inset 0 0 0 1px ${k.renk}26` }}>
                <span className="absolute -right-1 -top-3 font-display text-6xl font-semibold opacity-[0.1]" style={{ color: k.renk }} aria-hidden>
                  {tx(k.sembol)}
                </span>
                <p className="text-xs font-semibold" style={{ color: k.renk }}>{tx(ad)}</p>
                <p className="mt-1 font-display text-2xl font-medium tabular-nums text-[#17352a]">
                  {tx(String(tx.ha(kg)).replace('.', ','))} <span className="text-sm font-normal text-[#6b7d72]">kg/ha</span>
                </p>
              </div>
            );
          })}
        </div>
        <details className="group mt-3 rounded-2xl bg-[#f7f6f1] px-4 py-3 text-sm">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-[#17352a]">
            <FlaskConical size={15} className="text-[#2f7a4f]" />
            {plan.analizli ? tx("Toprak analizinize göre hesaplandı") : tx("Analiz olmadan, ortalama değerlerle hesaplandı")}
            <span className="ml-auto text-xs font-normal text-[#7a877e] group-open:hidden">{tx("Neden bu miktarlar?")}</span>
          </summary>
          {plan.analizli ? (
            <ul className="mt-2 space-y-1 text-xs leading-5 text-[#3e5248]">
              {plan.nedenler.map((n) => (
                <li key={n} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f8f57]" />
                  {tx(n)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs leading-5 text-[#5a4a2a]">{tx("Toprak analizinizi eklerseniz fosfor, potasyum ve azot miktarları toprağınıza göre ayarlanır.")}</p>
          )}
        </details>
      </div>

      {/* Dönemler */}
      <ol className="space-y-px bg-[#1d2a22]/8">
        {plan.adimlar.map((a) => {
          const suVar = a.su !== undefined;
          const bos = suVar && a.gubre.length === 0;
          const gorsel = evreGorseli(zkart.bitki, a.evre, zkart.evreler.length);
          return (
            <li key={a.evre} className="grid bg-white md:grid-cols-[260px_minmax(0,1fr)]">
              <div className="relative min-h-[150px] overflow-hidden bg-[#0d120f]">
                {gorsel ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={gorsel} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-85" />
                ) : (
                  <div className="absolute inset-0 bg-[url('/toprak.jpg')] bg-cover bg-bottom opacity-70" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute left-3 top-3">
                  {suVar ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#7fc8ec] px-2.5 py-1 text-xs font-bold text-[#0b2a3a]">
                      <Droplet size={13} className="fill-current" /> {a.su}{tx(". su")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                      {a.evre === 0 ? <Sprout size={13} /> : <CloudRain size={13} />} {a.evre === 0 ? tx("Ekim") : tx("Yağışa bırakıldı")}
                    </span>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">{tx(a.donem)}</p>
                  <p className="font-display text-lg font-medium leading-tight">{tx(a.ad)}</p>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-sm leading-6 text-[#5b6f65]">{a.evre === 0 && !suVar ? tx("Ekim zamanı.") : tx(a.tanima)}</p>
                {a.gubre.length > 0 && (
                  <div className="mt-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1f6f4a]">
                      <Droplets size={13} /> {tx(gubreBasligi(a, yontem, tx, pencere))}
                    </p>
                    <ul className="mt-1.5 grid gap-2 lg:grid-cols-2">
                      {a.gubre.map((u) => (
                        <UrunSatiri key={u.urun + u.doz} u={u} alan={alan} />
                      ))}
                    </ul>
                  </div>
                )}
                {bos && <p className="mt-3 text-sm font-semibold text-[#2f7f9a]">{tx("Bu suyla gübre verilmez, yalnızca sulayın.")}</p>}
                {a.yaprak.length > 0 && (
                  <div className="mt-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#6a4f9c]">
                      <Leaf size={13} />{' '}
                      {a.evre === 0
                        ? tx("Tohuma ve çıkıştan sonra yaprağa:")
                        : `${tx("Yapraktan")}${suVar ? tx(" (sulamadan sonra yapraklar kuruyunca, serin saatte)") : tx(" (rüzgârsız, serin bir saatte)")}:`}
                    </p>
                    <ul className="mt-1.5 grid gap-2 lg:grid-cols-2">
                      {a.yaprak.map((u) => (
                        <UrunSatiri key={u.urun + u.doz} u={u} alan={alan} />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="px-5 py-4 text-xs leading-5 text-[#7a877e] sm:px-6">
        {tx(SULAMA_YONTEMLERI[yontem].ad)}{tx(". Suyu, dönemin başladığını tarlada görünce verin; yağış olursa o suyu atlayın, dönemin gübresini de yağıştan hemen önce serpin.")}{' '}{tx(planDipnotu(zkart.bitki))}
      </p>
    </div>
  );
}
