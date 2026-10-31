'use client';
/**
 * Sulama suyu analizi ekleme: rapor yükle (PDF / fotoğraf) ya da elle gir → kontrol → kaydet.
 */
import { ArrowLeft, Camera, Droplets, Loader2, PencilLine, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SU_ALANLARI, cSinifi, sSinifi, sarHesapla, standartla, type EcBirim, type IyonBirim, type SuAlan, type SuRaporu } from '@/lib/su';
import { parseNumber } from '@/lib/toprak';
import { SuAnaliziRehberi } from './SuKarnesi';

type Taslak = Record<SuAlan, string>;
const bos = (): Taslak => Object.fromEntries(SU_ALANLARI.map((a) => [a.key, ''])) as Taslak;
const f = (n: number, d = 3) => n.toLocaleString('tr-TR', { maximumFractionDigits: d });

/** "2/10/2026", "21.09.2026", "2026-09-21" → "2026-09-21" (okunamazsa bugün) */
function tarihCoz(s?: string): string {
  const bugun = new Date().toISOString().slice(0, 10);
  if (!s) return bugun;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const m = s.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (!m) return bugun;
  const [g, a, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (a < 1 || a > 12 || g < 1 || g > 31) return bugun;
  const t = `${y}-${String(a).padStart(2, '0')}-${String(g).padStart(2, '0')}`;
  return t > bugun ? bugun : t;
}

export function SuEkle({ tarlaId, tarlaAd }: { tarlaId: string; tarlaAd: string }) {
  const router = useRouter();
  const [ekran, setEkran] = useState<'yontem' | 'form'>('yontem');
  const [taslak, setTaslak] = useState<Taslak>(bos);
  const [ecBirim, setEcBirim] = useState<EcBirim>('µS/cm');
  const [iyonBirim, setIyonBirim] = useState<IyonBirim>('me/l');
  const [meta, setMeta] = useState({ raporNo: '', raporTarihi: '', kaynakAdi: '', labSinif: '' });
  const [sarLab, setSarLab] = useState<number | undefined>();
  const [kaynak, setKaynak] = useState<'dosya' | 'manuel'>('manuel');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);
  const fotoRef = useRef<HTMLInputElement>(null);

  const degerler = (): SuRaporu['degerler'] => {
    const out: SuRaporu['degerler'] = {};
    for (const a of SU_ALANLARI) {
      const n = parseNumber(taslak[a.key]);
      if (n !== undefined) out[a.key] = standartla(a.key, n, ecBirim, iyonBirim);
    }
    if (sarLab !== undefined) out.sarLab = sarLab;
    return out;
  };
  const d = degerler();
  const sar = sarHesapla(d);
  const onizleme = cSinifi(d.ec) ? `${cSinifi(d.ec)!.sinif}${sSinifi(sar, d.ec)?.sinif ?? ''}` : undefined;

  const dosyaIsle = async (file?: File) => {
    if (!file) return;
    setHata(null);
    setYukleniyor(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/su-oku', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const r = json.rapor as SuRaporu;
      const t = bos();
      for (const a of SU_ALANLARI) {
        const v = r.degerler[a.key];
        if (v !== undefined) t[a.key] = f(v);
      }
      setTaslak(t);
      setEcBirim('µS/cm');
      setIyonBirim('me/l');
      setSarLab(r.degerler.sarLab);
      setMeta({ raporNo: r.raporNo ?? '', raporTarihi: r.raporTarihi ?? '', kaynakAdi: r.kaynakAdi ?? '', labSinif: r.labSinif ?? '' });
      setKaynak('dosya');
      setEkran('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setHata(e instanceof Error && e.message ? e.message : 'Rapor okunamadı. Değerleri elle girebilirsiniz.');
    } finally {
      setYukleniyor(false);
    }
  };

  const kaydet = async () => {
    setHata(null);
    if (d.ec === undefined) {
      setHata('En azından EC (tuzluluk) değerini girin; sınıflandırma onunla başlar.');
      return;
    }
    setKaydediliyor(true);
    const rapor: SuRaporu = {
      raporNo: meta.raporNo || undefined,
      raporTarihi: meta.raporTarihi || undefined,
      kaynakAdi: meta.kaynakAdi || undefined,
      labSinif: meta.labSinif || undefined,
      degerler: d,
    };
    const { data, error } = await createClient()
      .from('su_analizleri')
      .insert({ tarla_id: tarlaId, rapor, kaynak, rapor_no: rapor.raporNo ?? null, analiz_tarihi: tarihCoz(rapor.raporTarihi), sinif: onizleme ?? null })
      .select('id')
      .single();
    if (error || !data) {
      setKaydediliyor(false);
      setHata('Su analizi kaydedilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.');
      console.error(error);
      return;
    }
    router.push(`/tarlalar/${tarlaId}/su/${data.id}`);
    router.refresh();
  };

  const giris = (a: (typeof SU_ALANLARI)[number]) => {
    const birim = a.tip === 'ec' ? ecBirim : a.tip === 'iyon' ? iyonBirim : a.tip === 'mgl' ? 'mg/l' : '';
    return (
      <label key={a.key} className="block">
        <span className="flex items-baseline justify-between gap-2 text-sm font-semibold text-[#2c3d33]">
          {a.ad}
          {birim && <span className="text-xs font-medium text-[#7a877e]">{birim}</span>}
        </span>
        <input
          inputMode="decimal"
          value={taslak[a.key]}
          onChange={(e) => setTaslak({ ...taslak, [a.key]: e.target.value })}
          placeholder="—"
          className="mt-1 w-full rounded-xl border border-[#dcd4c2] bg-white px-3 py-2.5 text-[15px] outline-none focus:border-[#1e88c7] focus:ring-2 focus:ring-[#1e88c7]/20"
        />
        {a.ipucu && <span className="mt-1 block text-[11px] leading-4 text-[#8a948c]">{a.ipucu}</span>}
      </label>
    );
  };

  if (ekran === 'yontem') {
    return (
      <div>
        <div className="relative overflow-hidden rounded-[32px] p-6 text-white sm:p-10" style={{ background: '#0b3a52' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/su/olcum.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-right" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(8,42,60,.95) 0%,rgba(10,52,72,.85) 45%,rgba(12,70,90,.35) 100%)' }} aria-hidden />
          <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9fe3f2]">{tarlaAd}</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.02em] sm:text-5xl">Su analizi ekle</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/85">
            Sulama suyunuzun tuzluluğunu, sodyumunu ve bikarbonatını FAO ölçütleriyle değerlendirip size uygun sulama yöntemini ve yapılacakları söyleyelim.
          </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <button type="button" onClick={() => dosyaRef.current?.click()} disabled={yukleniyor} className="group flex flex-col items-start justify-start rounded-[24px] border border-[#e3dccb] bg-white p-6 text-left hover:border-[#1e88c7]">
            <Upload className="text-[#1e88c7]" />
            <p className="mt-4 text-lg font-bold">Rapor dosyası yükle</p>
            <p className="mt-1 text-sm leading-6 text-[#64766c]">PDF ya da ekran görüntüsü. Değerleri yapay zekâ okur, siz kontrol edersiniz.</p>
          </button>
          <button type="button" onClick={() => fotoRef.current?.click()} disabled={yukleniyor} className="group flex flex-col items-start justify-start rounded-[24px] border border-[#e3dccb] bg-white p-6 text-left hover:border-[#1e88c7]">
            <Camera className="text-[#1e88c7]" />
            <p className="mt-4 text-lg font-bold">Fotoğrafını çek</p>
            <p className="mt-1 text-sm leading-6 text-[#64766c]">Kâğıt raporun net bir fotoğrafı yeterli.</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setKaynak('manuel');
              setEkran('form');
            }}
            className="group flex flex-col items-start justify-start rounded-[24px] border border-[#e3dccb] bg-white p-6 text-left hover:border-[#1e88c7]"
          >
            <PencilLine className="text-[#1e88c7]" />
            <p className="mt-4 text-lg font-bold">Elle gir</p>
            <p className="mt-1 text-sm leading-6 text-[#64766c]">Rapordaki 10–12 değeri kutulara yazın. En az EC gerekli.</p>
          </button>
        </div>
        <input ref={dosyaRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => dosyaIsle(e.target.files?.[0])} />
        <input ref={fotoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => dosyaIsle(e.target.files?.[0])} />
        {yukleniyor && (
          <p className="mt-5 flex items-center gap-2 rounded-2xl bg-[#e8f3f8] px-4 py-3 text-sm text-[#0f5a73]">
            <Loader2 size={18} className="animate-spin" /> Rapor okunuyor, bu 20–40 saniye sürebilir…
          </p>
        )}
        {hata && <p className="mt-5 rounded-2xl bg-[#fbe6e1] px-4 py-3 text-sm text-[#8f2f1f]">{hata}</p>}

        <div className="mt-8 rounded-[24px] border border-[#e3dccb] bg-white p-6">
          <p className="flex items-center gap-2 font-display text-xl text-[#17352a]">
            <Droplets size={20} className="text-[#1e88c7]" /> Henüz su analiziniz yok mu?
          </p>
          <div className="mt-4">
            <SuAnaliziRehberi />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => setEkran('yontem')} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#476456]">
        <ArrowLeft size={16} /> Geri
      </button>
      <div className="rounded-[28px] border border-[#e3dccb] bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium text-[#17352a]">{kaynak === 'dosya' ? 'Okunan değerleri kontrol edin' : 'Su analizi değerleri'}</h1>
            <p className="mt-1 text-sm text-[#64766c]">
              {kaynak === 'dosya' ? 'Yapay zekâ hata yapabilir; rapordaki değerlerle karşılaştırın, yanlışsa düzeltin.' : 'Raporda olmayan değeri boş bırakın.'}
            </p>
          </div>
          {onizleme && (
            <span className="rounded-2xl bg-[#e8f3f8] px-4 py-2 text-center">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#0f5a73]">Ön sınıf</span>
              <span className="font-display text-2xl text-[#0b3a52]">{onizleme}</span>
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-[#7a877e]">EC birimi</p>
            <div className="mt-1 inline-flex rounded-full bg-[#f0ebe0] p-1">
              {(['µS/cm', 'dS/m'] as EcBirim[]).map((b) => (
                <button key={b} type="button" onClick={() => setEcBirim(b)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${ecBirim === b ? 'bg-white text-[#17352a] shadow-sm' : 'text-[#64766c]'}`}>
                  {b === 'dS/m' ? 'dS/m = mmhos/cm' : 'µS/cm = µmhos/cm'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#7a877e]">İyon birimi</p>
            <div className="mt-1 inline-flex rounded-full bg-[#f0ebe0] p-1">
              {(['me/l', 'mg/l'] as IyonBirim[]).map((b) => (
                <button key={b} type="button" onClick={() => setIyonBirim(b)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${iyonBirim === b ? 'bg-white text-[#17352a] shadow-sm' : 'text-[#64766c]'}`}>
                  {b === 'me/l' ? 'me/l (meq/l)' : 'mg/l (ppm)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">{SU_ALANLARI.map(giris)}</div>

        <div className="mt-8 grid gap-4 border-t border-[#efe9dc] pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['kaynakAdi', 'Su kaynağı', 'ör. kuyu, kanal, dere'],
              ['raporNo', 'Rapor no', ''],
              ['raporTarihi', 'Rapor tarihi', 'gg.aa.yyyy'],
              ['labSinif', 'Laboratuvarın yazdığı sınıf', 'ör. C3S1'],
            ] as const
          ).map(([k, ad, ph]) => (
            <label key={k} className="block">
              <span className="text-sm font-semibold text-[#2c3d33]">{ad}</span>
              <input
                value={meta[k]}
                onChange={(e) => setMeta({ ...meta, [k]: e.target.value })}
                placeholder={ph}
                className="mt-1 w-full rounded-xl border border-[#dcd4c2] bg-white px-3 py-2.5 text-[15px] outline-none focus:border-[#1e88c7]"
              />
            </label>
          ))}
        </div>

        {hata && <p className="mt-5 rounded-2xl bg-[#fbe6e1] px-4 py-3 text-sm text-[#8f2f1f]">{hata}</p>}
        <button
          type="button"
          onClick={kaydet}
          disabled={kaydediliyor}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f5a73] px-6 py-4 text-base font-bold text-white hover:bg-[#0b3a52] disabled:opacity-60 sm:w-auto"
        >
          {kaydediliyor ? <Loader2 size={18} className="animate-spin" /> : <Droplets size={18} />} Kaydet ve su karnesini göster
        </button>
      </div>
    </div>
  );
}
