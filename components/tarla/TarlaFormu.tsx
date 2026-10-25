'use client';
/** Tarla ekleme / düzenleme formu. */
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ZKART_BITKILERI } from '@/lib/igsas';
import { SULAMA_YONTEMLERI, type SulamaYontemi } from '@/lib/sulama';
import { createClient } from '@/lib/supabase/client';
import { ILLER } from '@/lib/bolgeler';
import { ISTANBUL_ILCELERI, parseNumber } from '@/lib/toprak';
import type { Tarla } from '@/lib/veri';

const BITKILER = ZKART_BITKILERI;

export function TarlaFormu({ tarla }: { tarla?: Tarla }) {
  const router = useRouter();
  const [ad, setAd] = useState(tarla?.ad ?? '');
  const [il, setIl] = useState(tarla?.il ?? '');
  const [ilce, setIlce] = useState(tarla?.ilce ?? '');
  const [konum, setKonum] = useState(tarla?.konum ?? '');
  const [alan, setAlan] = useState(tarla?.alan_dekar ? String(tarla.alan_dekar).replace('.', ',') : '');
  const [bitki, setBitki] = useState(tarla?.bitki ?? '');
  const [sulama, setSulama] = useState<SulamaYontemi>(tarla?.sulama ?? 'damla');
  const [sure, setSure] = useState(tarla?.sulama_suresi_saat ? String(tarla.sulama_suresi_saat).replace('.', ',') : '');
  const [notlar, setNotlar] = useState(tarla?.notlar ?? '');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const y = SULAMA_YONTEMLERI[sulama];

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata(null);
    if (!ad.trim()) return setHata('Tarlaya bir ad verin (ör. Tepe Tarla).');
    const alanSayi = alan.trim() ? parseNumber(alan) : null;
    if (alan.trim() && !(alanSayi && alanSayi > 0)) return setHata('Alanı dekar olarak sayıyla yazın (ör. 12 ya da 7,5).');
    const sureSayi = y.sureEtiketi && sure.trim() ? parseNumber(sure) : null;
    if (y.sureEtiketi && sure.trim() && !(sureSayi && sureSayi > 0 && sureSayi <= 48)) return setHata('Sulama süresini saat olarak yazın (ör. 6).');

    setKaydediliyor(true);
    const kayit = {
      ad: ad.trim(),
      il: il || null,
      ilce: ilce.trim() || null,
      konum: konum.trim() || null,
      alan_dekar: alanSayi,
      bitki: bitki.trim() || null,
      sulama,
      sulama_suresi_saat: y.sureEtiketi ? sureSayi : null,
      notlar: notlar.trim() || null,
    };
    const supabase = createClient();
    const { data, error } = tarla
      ? await supabase.from('tarlalar').update(kayit).eq('id', tarla.id).select('id').single()
      : await supabase.from('tarlalar').insert(kayit).select('id').single();
    setKaydediliyor(false);
    if (error || !data) return setHata('Kaydedilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    router.push(`/tarlalar/${data.id}`);
    router.refresh();
  };

  const sil = async () => {
    if (!tarla || !confirm(`"${tarla.ad}" ve bu tarlaya ait tüm analizler silinsin mi? Bu işlem geri alınamaz.`)) return;
    setKaydediliyor(true);
    const { error } = await createClient().from('tarlalar').delete().eq('id', tarla.id);
    setKaydediliyor(false);
    if (error) return setHata('Silinemedi. Tekrar deneyin.');
    router.push('/tarlalar');
    router.refresh();
  };

  const etiket = 'block text-sm font-semibold text-[#3e5248]';
  const kutu = 'mt-2 w-full rounded-2xl border border-[#dfe9df] bg-white px-4 py-3 text-base outline-none focus:border-[#38a66d]';

  return (
    <form onSubmit={kaydet} className="space-y-6 rounded-[28px] border border-[#dfe9df] bg-white p-5 sm:p-8">
      <div>
        <label htmlFor="ad" className={etiket}>Tarla adı</label>
        <input id="ad" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="ör. Tepe Tarla" maxLength={80} className={kutu} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="alan" className={etiket}>Alan (dekar)</label>
          <input id="alan" inputMode="decimal" value={alan} onChange={(e) => setAlan(e.target.value)} placeholder="ör. 12" className={kutu} />
          <p className="mt-1 text-xs text-[#75867a]">Tarlanıza düşen toplam gübre miktarını hesaplamak için.</p>
        </div>
        <div>
          <label htmlFor="il" className={etiket}>İl</label>
          <select id="il" value={il} onChange={(e) => setIl(e.target.value)} className={kutu}>
            <option value="">Seçin</option>
            {ILLER.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[#75867a]">Öneriler bölgenizin toprak ve iklimine göre yapılır.</p>
        </div>
      </div>

      <div className="max-w-md">
        <label htmlFor="ilce" className={etiket}>İlçe (isteğe bağlı)</label>
        <input id="ilce" list="ilceler" value={ilce} onChange={(e) => setIlce(e.target.value)} placeholder={il === 'Konya' ? 'ör. Çumra' : 'ör. Merkez'} maxLength={60} className={kutu} />
        {il === 'İstanbul' && (
          <datalist id="ilceler">
            {ISTANBUL_ILCELERI.map((i) => (
              <option key={i} value={i} />
            ))}
          </datalist>
        )}
      </div>

      <div>
        <label htmlFor="bitki" className={etiket}>Bitki</label>
        <input id="bitki" list="bitkiler" value={bitki} onChange={(e) => setBitki(e.target.value)} placeholder="ör. Buğday" className={kutu} />
        <datalist id="bitkiler">
          {BITKILER.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-[#75867a]">Listedeki 23 bitki için dönem dönem uygulama programı hazırdır.</p>
      </div>

      <fieldset>
        <legend className={etiket}>Sulama yöntemi</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.keys(SULAMA_YONTEMLERI) as SulamaYontemi[]).map((k) => {
            const s = SULAMA_YONTEMLERI[k];
            const secili = sulama === k;
            return (
              <label
                key={k}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${secili ? 'border-[#38a66d] bg-[#eefaf0]' : 'border-[#dfe9df] hover:border-[#9aca89]'}`}
              >
                <input type="radio" name="sulama" checked={secili} onChange={() => setSulama(k)} className="mt-1 h-4 w-4 accent-[#238f61]" />
                <span>
                  <span className="block font-semibold">{s.ad}</span>
                  <span className="block text-xs text-[#6b7d72]">{s.aciklama}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {y.sureEtiketi && (
        <div className="max-w-xs">
          <label htmlFor="sure" className={etiket}>{y.sureEtiketi}</label>
          <input id="sure" inputMode="decimal" value={sure} onChange={(e) => setSure(e.target.value)} placeholder={`ör. ${y.varsayilanSure}`} className={kutu} />
          <p className="mt-1 text-xs text-[#75867a]">Gübrenin hangi saatte verileceği buna göre hesaplanır. Boşsa {y.varsayilanSure} saat alınır.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="konum" className={etiket}>Konum / mahalle (isteğe bağlı)</label>
          <input id="konum" value={konum} onChange={(e) => setKonum(e.target.value)} placeholder="ör. Değirmenköy" className={kutu} />
        </div>
        <div>
          <label htmlFor="not" className={etiket}>Not (isteğe bağlı)</label>
          <input id="not" value={notlar} onChange={(e) => setNotlar(e.target.value)} placeholder="ör. Kuzey parsel" className={kutu} />
        </div>
      </div>

      {hata && <p className="text-sm text-[#a83422]">{hata}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {tarla ? (
          <button type="button" onClick={sil} disabled={kaydediliyor} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-[#a83422] hover:bg-[#fff5f3]">
            <Trash2 size={16} /> Tarlayı sil
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={kaydediliyor} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#238f61] px-8 py-4 font-bold text-white hover:bg-[#1d7d54] disabled:opacity-60">
          {kaydediliyor && <Loader2 className="animate-spin" size={18} />}
          {tarla ? 'Değişiklikleri kaydet' : 'Tarlayı kaydet'}
        </button>
      </div>
    </form>
  );
}
