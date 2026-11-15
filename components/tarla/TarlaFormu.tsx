'use client';
/** Tarla ekleme / düzenleme formu. */
import { useDil } from '@/components/DilSaglayici';
import { alanDegeri, dekaraCevir } from '@/lib/dil';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ZKART_BITKILERI } from '@/lib/bitki';
import { SULAMA_YONTEMLERI, type SulamaYontemi } from '@/lib/sulama';
import { createClient } from '@/lib/supabase/client';
import { ulkeBirimi, ulkeBul, type Ulke } from '@/lib/bolgeler';
import { UlkeSecenekleri, useIlSecenekleri } from '@/components/UlkeSecimi';
import { DE_LANDKREISE } from '@/lib/almanya';
import { ISTANBUL_ILCELERI, parseNumber } from '@/lib/toprak';
import type { Tarla } from '@/lib/veri';

const BITKILER = ZKART_BITKILERI;

export function TarlaFormu({ tarla }: { tarla?: Tarla }) {
  const { dil, t: tx } = useDil();
  const router = useRouter();
  const [ad, setAd] = useState(tarla?.ad ?? '');
  const [il, setIl] = useState(tarla?.il ?? '');
  const [ilce, setIlce] = useState(tarla?.ilce ?? '');
  // Ülke veritabanında ayrı tutulmaz; ilden anlaşılır. Yeni tarlada arayüz diline göre başlar.
  const [ulke, setUlke] = useState<Ulke>(ulkeBul(tarla?.il, dil));
  const ulkeDegis = (u: Ulke) => {
    setUlke(u);
    setIl('');
    setIlce('');
  };
  const ilEtiketi = tx(ulkeBirimi(ulke));
  const { secenekler: ilSecenekleri, yukleniyor: ilYukleniyor, hata: ilHatasi } = useIlSecenekleri(ulke, il);
  const ilceEtiketi = tx(ulke === 'DE' ? 'İlçe / Landkreis (isteğe bağlı)' : ulke === 'ES' ? 'Belediye / municipio (isteğe bağlı)' : 'İlçe (isteğe bağlı)');
  const ilceOnerileri = ulke === 'DE' ? (DE_LANDKREISE[il] ?? []) : il === 'İstanbul' ? ISTANBUL_ILCELERI : [];
  const [konum, setKonum] = useState(tarla?.konum ?? '');
  const [alan, setAlan] = useState(tarla?.alan_dekar ? String(+alanDegeri(tarla.alan_dekar, dil).toFixed(3)).replace('.', ',') : '');
  // bitki veritabanında Türkçe adıyla saklanır; Almancada ekranda çevirisi gösterilir
  const [bitki, setBitki] = useState(tarla?.bitki ? tx(tarla.bitki) : '');
  const bitkiKodu = (g: string) => BITKILER.find((b) => tx(b).toLocaleLowerCase() === g.trim().toLocaleLowerCase()) ?? g.trim();
  const [sulama, setSulama] = useState<SulamaYontemi>(tarla?.sulama ?? 'damla');
  const [sure, setSure] = useState(tarla?.sulama_suresi_saat ? String(tarla.sulama_suresi_saat).replace('.', ',') : '');
  const [notlar, setNotlar] = useState(tarla?.notlar ?? '');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const y = SULAMA_YONTEMLERI[sulama];

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata(null);
    if (!ad.trim()) return setHata(tx("Tarlaya bir ad verin (ör. Tepe Tarla)."));
    const alanSayi = alan.trim() ? parseNumber(alan) : null;
    if (alan.trim() && !(alanSayi && alanSayi > 0)) return setHata(tx("Alanı dekar olarak sayıyla yazın (ör. 12 ya da 7,5)."));
    const sureSayi = y.sureEtiketi && sure.trim() ? parseNumber(sure) : null;
    if (y.sureEtiketi && sure.trim() && !(sureSayi && sureSayi > 0 && sureSayi <= 48)) return setHata(tx("Sulama süresini saat olarak yazın (ör. 6)."));

    setKaydediliyor(true);
    const kayit = {
      ad: ad.trim(),
      il: il || null,
      ilce: ilce.trim() || null,
      konum: konum.trim() || null,
      alan_dekar: alanSayi ? dekaraCevir(alanSayi, dil) : null,
      bitki: bitkiKodu(bitki) || null,
      sulama,
      sulama_suresi_saat: y.sureEtiketi ? sureSayi : null,
      notlar: notlar.trim() || null,
    };
    const supabase = createClient();
    const { data, error } = tarla
      ? await supabase.from('tarlalar').update(kayit).eq('id', tarla.id).select('id').single()
      : await supabase.from('tarlalar').insert(kayit).select('id').single();
    setKaydediliyor(false);
    if (error || !data) return setHata(tx("Kaydedilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin."));
    router.push(`/tarlalar/${data.id}`);
    router.refresh();
  };

  const sil = async () => {
    if (!tarla || !confirm(tx("\"{a}\" ve bu tarlaya ait tüm analizler silinsin mi? Bu işlem geri alınamaz.", { a: tarla.ad }))) return;
    setKaydediliyor(true);
    const { error } = await createClient().from('tarlalar').delete().eq('id', tarla.id);
    setKaydediliyor(false);
    if (error) return setHata(tx("Silinemedi. Tekrar deneyin."));
    router.push('/tarlalar');
    router.refresh();
  };

  const etiket = 'block text-sm font-semibold text-[#3e5248]';
  const kutu = 'mt-2 w-full rounded-2xl border border-[#dfe9df] bg-white px-4 py-3 text-base outline-none focus:border-[#38a66d]';

  return (
    <form onSubmit={kaydet} className="space-y-6 rounded-[28px] border border-[#dfe9df] bg-white p-5 sm:p-8">
      <div>
        <label htmlFor="ad" className={etiket}>{tx("Tarla adı")}</label>
        <input id="ad" value={ad} onChange={(e) => setAd(e.target.value)} placeholder={tx("ör. Tepe Tarla")} maxLength={80} className={kutu} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="alan" className={etiket}>{tx("Alan (dekar)")}</label>
          <input id="alan" inputMode="decimal" value={alan} onChange={(e) => setAlan(e.target.value)} placeholder={tx("ör. 12")} className={kutu} />
          <p className="mt-1 text-xs text-[#75867a]">{tx("Tarlanıza düşen toplam gübre miktarını hesaplamak için.")}</p>
        </div>
        <div>
          <label htmlFor="ulke" className={etiket}>{tx("Ülke")}</label>
          <select id="ulke" value={ulke} onChange={(e) => ulkeDegis(e.target.value as Ulke)} className={kutu}>
            <UlkeSecenekleri secili={ulke} />
          </select>
          <p className="mt-1 text-xs text-[#75867a]">{tx("Öneriler bölgenizin toprak ve iklimine göre yapılır.")}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="il" className={etiket}>{ilEtiketi}</label>
          <select id="il" value={il} onChange={(e) => { setIl(e.target.value); setIlce(''); }} className={kutu}>
            <option value="">{ilYukleniyor ? tx("Yükleniyor…") : tx("Seçin")}</option>
            {ilSecenekleri.map((i) => (
              <option key={i.deger} value={i.deger}>{i.ad}</option>
            ))}
          </select>
          {ilHatasi && <p className="mt-1 text-xs text-[#b3261e]">{tx("Bölge listesi yüklenemedi. Sayfayı yenileyip tekrar deneyin.")}</p>}
        </div>
        <div>
          <label htmlFor="ilce" className={etiket}>{ilceEtiketi}</label>
          <input
            id="ilce"
            list="ilceler"
            value={ilce}
            onChange={(e) => setIlce(e.target.value)}
            placeholder={ulke === 'DE' ? tx("ör. Uelzen") : ulke === 'ES' ? tx("ör. Lorca") : ulke !== 'TR' ? tx("ör. ilçe ya da köy adı") : il === 'Konya' ? tx("ör. Çumra") : tx("ör. Merkez")}
            maxLength={60}
            className={kutu}
          />
          {ilceOnerileri.length > 0 && (
            <datalist id="ilceler">
              {ilceOnerileri.map((i) => (
                <option key={i} value={i} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="bitki" className={etiket}>{tx("Bitki")}</label>
        <input id="bitki" list="bitkiler" value={bitki} onChange={(e) => setBitki(e.target.value)} placeholder={tx("ör. Buğday")} className={kutu} />
        <datalist id="bitkiler">
          {BITKILER.map((b) => (
            <option key={b} value={tx(b)} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-[#75867a]">{tx("Listedeki 23 bitki için dönem dönem uygulama programı hazırdır.")}</p>
      </div>

      <fieldset>
        <legend className={etiket}>{tx("Sulama yöntemi")}</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(SULAMA_YONTEMLERI) as SulamaYontemi[]).map((k) => {
            const s = SULAMA_YONTEMLERI[k];
            const secili = sulama === k;
            return (
              <label
                key={k}
                className={`group cursor-pointer overflow-hidden rounded-2xl border bg-white transition ${secili ? 'border-[#38a66d] ring-2 ring-[#38a66d]/30' : 'border-[#dfe9df] hover:border-[#9aca89]'}`}
              >
                <span className="relative block aspect-video overflow-hidden bg-[#1d2a22]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.gorsel} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  {secili && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#38a66d] px-2.5 py-0.5 text-xs font-bold text-white">{tx("Seçili")}</span>
                  )}
                </span>
                <span className="flex items-start gap-3 px-4 py-3">
                  <input type="radio" name="sulama" checked={secili} onChange={() => setSulama(k)} className="mt-1 h-4 w-4 accent-[#238f61]" />
                  <span>
                    <span className="block hyphens-auto font-semibold [overflow-wrap:anywhere]">{tx(s.ad)}</span>
                    <span className="block text-xs text-[#6b7d72]">{tx(s.aciklama)}</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {y.sureEtiketi && (
        <div className="max-w-xs">
          <label htmlFor="sure" className={etiket}>{tx(y.sureEtiketi)}</label>
          <input id="sure" inputMode="decimal" value={sure} onChange={(e) => setSure(e.target.value)} placeholder={tx("ör. {a}", { a: y.varsayilanSure })} className={kutu} />
          <p className="mt-1 text-xs text-[#75867a]">{tx("Gübrenin hangi saatte verileceği buna göre hesaplanır. Boşsa")}{' '}{y.varsayilanSure}{' '}{tx("saat alınır.")}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="konum" className={etiket}>{tx("Konum / mahalle (isteğe bağlı)")}</label>
          <input id="konum" value={konum} onChange={(e) => setKonum(e.target.value)} placeholder={tx("ör. Değirmenköy")} className={kutu} />
        </div>
        <div>
          <label htmlFor="not" className={etiket}>{tx("Not (isteğe bağlı)")}</label>
          <input id="not" value={notlar} onChange={(e) => setNotlar(e.target.value)} placeholder={tx("ör. Kuzey parsel")} className={kutu} />
        </div>
      </div>

      {hata && <p className="text-sm text-[#a83422]">{tx(hata)}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {tarla ? (
          <button type="button" onClick={sil} disabled={kaydediliyor} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-[#a83422] hover:bg-[#fff5f3]">
            <Trash2 size={16} />{' '}{tx("Tarlayı sil")}
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={kaydediliyor} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#238f61] px-8 py-4 font-bold text-white hover:bg-[#1d7d54] disabled:opacity-60">
          {kaydediliyor && <Loader2 className="animate-spin" size={18} />}
          {tarla ? tx("Değişiklikleri kaydet") : tx("Tarlayı kaydet")}
        </button>
      </div>
    </form>
  );
}
