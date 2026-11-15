'use client';
import { useDil } from '@/components/DilSaglayici';
import { jsonOku } from '@/lib/dosya';
import { ChevronLeft, Printer, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SonucEkrani, type SonucTarla } from '@/components/analiz/Sonuc';
import { createClient } from '@/lib/supabase/client';
import type { SoilReport } from '@/lib/toprak';
import { dildekiPlan, type CozumPlani } from '@/lib/veri';

export function AnalizSonucu({
  tarlaId,
  analizId,
  tarla,
  rapor,
  tarih,
  cozum,
  onceki,
}: {
  tarlaId: string;
  analizId: string;
  tarla: SonucTarla;
  rapor: SoilReport;
  tarih: string;
  cozum: CozumPlani | null;
  onceki: { rapor: SoilReport; tarih: string } | null;
}) {
  const { t: tx, dil } = useDil();
  const router = useRouter();
  // Plan dil başına tutulur: sayfada dil değişince o dilin planı gösterilir; kayıtlı değilse bir kez yazdırılır.
  // Eski (İGSAŞ dönemi) kayıtlı planlar gösterilmez; sunucu yeni sürümü yazar
  const [planlar, setPlanlar] = useState<Partial<Record<string, CozumPlani | null>>>({});
  const [durumlar, setDurumlar] = useState<Partial<Record<string, 'idle' | 'loading' | 'error'>>>({});
  const kayitli = dildekiPlan(cozum, dil);
  const ai = dil in planlar ? (planlar[dil] ?? null) : kayitli;
  const aiState = durumlar[dil] ?? (kayitli ? 'idle' : 'loading');
  const istenen = useRef(new Set<string>());

  const getir = useCallback(
    async (yenile = false) => {
      const d = dil;
      setDurumlar((x) => ({ ...x, [d]: 'loading' }));
      if (yenile) setPlanlar((x) => ({ ...x, [d]: null }));
      try {
        const res = await fetch('/api/yorum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analizId, yenile, dil: d }),
        });
        const json = await jsonOku<CozumPlani & { error?: string }>(res);
        if (!res.ok) throw new Error(json.error);
        setPlanlar((x) => ({ ...x, [d]: json }));
        setDurumlar((x) => ({ ...x, [d]: 'idle' }));
      } catch {
        setDurumlar((x) => ({ ...x, [d]: 'error' }));
      }
    },
    [analizId, dil],
  );

  useEffect(() => {
    // Bu dilde kayıtlı plan yoksa bir kez oluştur (sonra veritabanından gelir)
    if (kayitli || istenen.current.has(dil)) return;
    istenen.current.add(dil);
    getir();
  }, [dil, kayitli, getir]);

  const sil = async () => {
    if (!confirm(tx("Bu analiz silinsin mi? Bu işlem geri alınamaz."))) return;
    await createClient().from('analizler').delete().eq('id', analizId);
    router.push(`/tarlalar/${tarlaId}`);
    router.refresh();
  };

  const ikincil = 'inline-flex items-center justify-center gap-2 rounded-full border border-[#dfe9df] bg-white px-5 py-3 font-semibold text-[#476456] hover:bg-[#f4faf3]';

  return (
    <SonucEkrani
      report={rapor}
      ai={ai}
      aiState={aiState}
      onRetryAi={() => getir()}
      tarla={tarla}
      onceki={onceki ? { ...onceki, simdiTarih: tarih } : null}
      tarih={tarih}
      baslikUstu={
        <Link href={`/tarlalar/${tarlaId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#476456] print:hidden">
          <ChevronLeft size={16} /> {tx(tarla.ad)}
        </Link>
      }
      eylemler={
        <>
          <button onClick={() => window.print()} className={ikincil}>
            <Printer size={18} />{' '}{tx("Yazdır / PDF kaydet")}
          </button>
          <button onClick={() => getir(true)} disabled={aiState === 'loading'} className={ikincil}>
            <RefreshCw size={18} />{' '}{tx("Çözüm planını yenile")}
          </button>
          <button onClick={sil} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-[#a83422] hover:bg-[#fff5f3] sm:ml-auto">
            <Trash2 size={18} />{' '}{tx("Analizi sil")}
          </button>
        </>
      }
    />
  );
}
